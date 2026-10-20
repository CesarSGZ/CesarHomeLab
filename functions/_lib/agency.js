// Agencia (Scarlett Storm): estado, chat con el Director y órdenes para el backend local.
//
// El equipo de agentes corre en ServerCesar (agency-backend/, Python). Ese PC no abre ningún
// puerto: cada pocos segundos hace POST a /api/agent/agency con su token, publica su estado y
// sus eventos, y recoge los mensajes que César deja en el chat y las órdenes del panel.
// El dashboard (/control/api/agency/*) solo lee ese estado y deja mensajes y órdenes en cola.

export const AGENT_FRESH_MS = 90_000;
export const AGENT_IDS = /^[a-z][a-z0-9-]{1,31}$/;
export const COMMANDS = new Set(["pause", "resume", "run-now"]);
const MAX_EVENTS = 600;
const MAX_MESSAGES = 400;

let schemaReady = false;

export async function ensureTables(db) {
  if (schemaReady) return;
  await db.batch([
    db.prepare("CREATE TABLE IF NOT EXISTS agency_state (id INTEGER PRIMARY KEY CHECK (id = 1), payload TEXT NOT NULL, updated_at INTEGER NOT NULL, seen_at INTEGER NOT NULL)"),
    db.prepare("CREATE TABLE IF NOT EXISTS agency_messages (id TEXT PRIMARY KEY, role TEXT NOT NULL, text TEXT NOT NULL, reply_to TEXT, status TEXT NOT NULL, actions TEXT, created_at INTEGER NOT NULL, answered_at INTEGER)"),
    db.prepare("CREATE TABLE IF NOT EXISTS agency_events (id TEXT PRIMARY KEY, agent TEXT NOT NULL, level TEXT NOT NULL, text TEXT NOT NULL, at INTEGER NOT NULL)"),
    db.prepare("CREATE TABLE IF NOT EXISTS agency_commands (id TEXT PRIMARY KEY, agent TEXT NOT NULL, type TEXT NOT NULL, status TEXT NOT NULL, requested_at INTEGER NOT NULL, done_at INTEGER, result TEXT)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_agency_messages_status ON agency_messages(status, created_at)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_agency_messages_created ON agency_messages(created_at)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_agency_events_at ON agency_events(at)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_agency_commands_status ON agency_commands(status, requested_at)"),
  ]);
  schemaReady = true;
}

/** Bearer token del backend de la agencia (AGENCY_AGENT_TOKEN), distinto del de ServerCesar. */
export function requireAgencyAgent(request, env, constantTimeEqual) {
  const configured = String(env.AGENCY_AGENT_TOKEN || "");
  const supplied = String(request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  return configured.length >= 32 && constantTimeEqual(configured, supplied);
}

const str = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const time = (v) => (Number.isFinite(v) && v > 0 && v < 1e14 ? Math.round(v) : null);
const num = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : null);
const id = (v) => (typeof v === "string" && /^[A-Za-z0-9_-]{6,64}$/.test(v) ? v : null);

// El estado lo escribe el backend propio, pero acaba pintado en el portal: solo pasan los campos
// conocidos, con tamaños acotados. El navegador escapa todo igualmente.
export function sanitiseState(raw = {}) {
  const agents = (Array.isArray(raw.agents) ? raw.agents : []).slice(0, 24).filter((a) => AGENT_IDS.test(a?.id || "")).map((a) => ({
    id: a.id,
    name: str(a.name, 40) || a.id,
    role: str(a.role, 80),
    status: ["working", "resting", "paused", "blocked", "error", "thinking"].includes(a.status) ? a.status : "resting",
    detail: str(a.detail, 200),
    lastRunAt: time(a.lastRunAt),
    nextRunAt: time(a.nextRunAt),
    lastResult: str(a.lastResult, 200),
    commands: (Array.isArray(a.commands) ? a.commands : []).filter((c) => COMMANDS.has(c)),
    stats: (Array.isArray(a.stats) ? a.stats : []).slice(0, 8).map((s) => ({ label: str(s?.label, 40), value: str(String(s?.value ?? ""), 40) })),
  }));
  const r = raw.reddit && typeof raw.reddit === "object" ? raw.reddit : null;
  const reddit = r ? {
    configured: r.configured === true,
    username: str(r.username, 40),
    karma: { total: num(r.karma?.total), post: num(r.karma?.post), comment: num(r.karma?.comment) },
    karma7d: num(r.karma7d),
    postScore7d: num(r.postScore7d),
    history: (Array.isArray(r.history) ? r.history : []).slice(-60).map((h) => ({ day: str(h?.day, 10), total: num(h?.total) })).filter((h) => /^\d{4}-\d{2}-\d{2}$/.test(h.day)),
    posts: (Array.isArray(r.posts) ? r.posts : []).slice(0, 40).map((p) => ({
      id: str(p?.id, 16),
      title: str(p?.title, 300),
      subreddit: str(p?.subreddit, 40),
      url: /^https:\/\/(www\.|old\.)?reddit\.com\//.test(p?.url || "") ? str(p.url, 300) : "",
      score: num(p?.score),
      comments: num(p?.comments),
      createdAt: time(p?.createdAt),
      removed: p?.removed === true,
    })),
    checkedAt: time(r.checkedAt),
  } : null;
  const directives = (Array.isArray(raw.directives) ? raw.directives : []).slice(0, 30).map((d) => ({
    id: str(d?.id, 40), target: str(d?.target, 32), text: str(d?.text, 400), createdAt: time(d?.createdAt),
  }));
  const llm = raw.llm && typeof raw.llm === "object" ? { model: str(raw.llm.model, 40), usdToday: num(raw.llm.usdToday), usdMonth: num(raw.llm.usdMonth), ready: raw.llm.ready === true } : null;
  return { version: str(raw.version, 20), startedAt: time(raw.startedAt), timezone: str(raw.timezone, 40), agents, reddit, directives, llm };
}

export function sanitiseEvent(e = {}) {
  const eventId = id(e.id), agent = AGENT_IDS.test(e.agent || "") ? e.agent : "system";
  if (!eventId) return null;
  return { id: eventId, agent, level: ["info", "ok", "warn", "error"].includes(e.level) ? e.level : "info", text: str(e.text, 400), at: time(e.at) || Date.now() };
}

/**
 * Intercambio del backend: guarda estado, eventos, respuestas del Director y órdenes resueltas,
 * y devuelve lo que está pendiente. Entrega al menos una vez: el backend descarta lo repetido por id.
 */
export async function agentSync(db, body, now = Date.now()) {
  const writes = [];
  if (body.state && typeof body.state === "object") {
    const payload = JSON.stringify(sanitiseState(body.state));
    writes.push(db.prepare("INSERT INTO agency_state (id, payload, updated_at, seen_at) VALUES (1, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at, seen_at = excluded.seen_at").bind(payload, now, now));
  } else {
    writes.push(db.prepare("UPDATE agency_state SET seen_at = ? WHERE id = 1").bind(now));
  }
  for (const e of (Array.isArray(body.events) ? body.events : []).slice(0, 60)) {
    const ev = sanitiseEvent(e);
    if (ev?.text) writes.push(db.prepare("INSERT OR IGNORE INTO agency_events (id, agent, level, text, at) VALUES (?, ?, ?, ?, ?)").bind(ev.id, ev.agent, ev.level, ev.text, ev.at));
  }
  for (const m of (Array.isArray(body.replies) ? body.replies : []).slice(0, 10)) {
    const replyId = id(m?.id), replyTo = id(m?.replyTo), text = str(m?.text, 4000);
    if (!replyId || !text) continue;
    const actions = Array.isArray(m.actions) ? JSON.stringify(m.actions.slice(0, 10).map((a) => str(String(a), 200))) : null;
    writes.push(db.prepare("INSERT OR IGNORE INTO agency_messages (id, role, text, reply_to, status, actions, created_at, answered_at) VALUES (?, 'director', ?, ?, 'answered', ?, ?, ?)").bind(replyId, text, replyTo, actions, time(m.at) || now, now));
    if (replyTo) writes.push(db.prepare("UPDATE agency_messages SET status = 'answered', answered_at = ? WHERE id = ? AND role = 'owner'").bind(now, replyTo));
  }
  for (const d of (Array.isArray(body.done) ? body.done : []).slice(0, 10)) {
    const cmdId = id(d?.id);
    if (cmdId) writes.push(db.prepare("UPDATE agency_commands SET status = ?, done_at = ?, result = ? WHERE id = ? AND status = 'queued'").bind(d.ok === false ? "failed" : "done", now, str(d.result, 200) || null, cmdId));
  }
  if (Math.random() < 0.05) {
    writes.push(db.prepare("DELETE FROM agency_events WHERE id IN (SELECT id FROM agency_events ORDER BY at DESC LIMIT -1 OFFSET ?)").bind(MAX_EVENTS));
    writes.push(db.prepare("DELETE FROM agency_messages WHERE id IN (SELECT id FROM agency_messages ORDER BY created_at DESC LIMIT -1 OFFSET ?)").bind(MAX_MESSAGES));
    writes.push(db.prepare("UPDATE agency_commands SET status = 'expired' WHERE status = 'queued' AND requested_at < ?").bind(now - 24 * 3600_000));
  }
  await db.batch(writes);
  const messages = (await db.prepare("SELECT id, text, created_at FROM agency_messages WHERE role = 'owner' AND status = 'queued' ORDER BY created_at ASC LIMIT 10").all()).results || [];
  const commands = (await db.prepare("SELECT id, agent, type, requested_at FROM agency_commands WHERE status = 'queued' ORDER BY requested_at ASC LIMIT 10").all()).results || [];
  return {
    messages: messages.map((m) => ({ id: m.id, text: m.text, at: m.created_at })),
    commands: commands.map((c) => ({ id: c.id, agent: c.agent, type: c.type, at: c.requested_at })),
  };
}

/** Lo que pinta el dashboard: estado del backend, chat y registro. */
export async function readStatus(db, now = Date.now()) {
  const row = await db.prepare("SELECT payload, updated_at, seen_at FROM agency_state WHERE id = 1").first();
  const messages = ((await db.prepare("SELECT id, role, text, reply_to, status, actions, created_at FROM agency_messages ORDER BY created_at DESC LIMIT 80").all()).results || []).reverse();
  const events = (await db.prepare("SELECT id, agent, level, text, at FROM agency_events ORDER BY at DESC LIMIT 150").all()).results || [];
  const commands = (await db.prepare("SELECT id, agent, type, status, requested_at, done_at, result FROM agency_commands ORDER BY requested_at DESC LIMIT 10").all()).results || [];
  let state = null;
  try { state = row ? JSON.parse(row.payload) : null; } catch { state = null; }
  return {
    ok: true,
    now,
    backend: { online: !!row && now - row.seen_at < AGENT_FRESH_MS, seenAt: row?.seen_at || null, stateAt: row?.updated_at || null },
    state,
    messages: messages.map((m) => ({ id: m.id, role: m.role, text: m.text, replyTo: m.reply_to, status: m.status, actions: m.actions ? JSON.parse(m.actions) : [], at: m.created_at })),
    events: events.map((e) => ({ id: e.id, agent: e.agent, level: e.level, text: e.text, at: e.at })),
    commands: commands.map((c) => ({ id: c.id, agent: c.agent, type: c.type, status: c.status, at: c.requested_at, doneAt: c.done_at, result: c.result })),
  };
}

export async function queueMessage(db, text, now = Date.now()) {
  const clean = str(text, 2000);
  if (clean.length < 2) throw Object.assign(new Error("Escribe un mensaje para el Director."), { status: 400 });
  const pending = await db.prepare("SELECT COUNT(*) AS n FROM agency_messages WHERE role = 'owner' AND status = 'queued'").first();
  if ((pending?.n || 0) >= 10) throw Object.assign(new Error("El Director tiene 10 mensajes sin leer: espera a que conteste."), { status: 429 });
  const messageId = crypto.randomUUID();
  await db.prepare("INSERT INTO agency_messages (id, role, text, status, created_at) VALUES (?, 'owner', ?, 'queued', ?)").bind(messageId, clean, now).run();
  return { id: messageId, at: now };
}

export async function queueCommand(db, agent, type, now = Date.now()) {
  if (!AGENT_IDS.test(agent || "") || !COMMANDS.has(type)) throw Object.assign(new Error("Orden no válida."), { status: 400 });
  const same = await db.prepare("SELECT id FROM agency_commands WHERE agent = ? AND type = ? AND status = 'queued'").bind(agent, type).first();
  if (same) return { id: same.id, duplicate: true };
  const commandId = crypto.randomUUID();
  await db.prepare("INSERT INTO agency_commands (id, agent, type, status, requested_at) VALUES (?, ?, ?, 'queued', ?)").bind(commandId, agent, type, now).run();
  return { id: commandId };
}
