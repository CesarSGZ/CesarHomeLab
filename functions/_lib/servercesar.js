// ServerCesar (the PC at César's parents' house): Wake-on-LAN and power status.
//
// Cloudflare Functions cannot send UDP, so the magic packet is relayed through
// depicus.com, the same public service César used manually. Status combines two
// signals: a recent heartbeat from the Mission Control agent (if it runs on that
// PC) and a TCP probe to the ports César chooses to expose.
//
// The MAC address, the DDNS host and the ports never live in the repository (it is
// public). Defaults come from encrypted Cloudflare Pages secrets (SERVERCESAR_MAC,
// SERVERCESAR_HOST, SERVERCESAR_WOL_PORT, SERVERCESAR_PROBE_PORTS), copied from
// GitHub secrets by .github/workflows/servercesar-secrets.yml; the owner can
// override them from Mission Control, which stores the override in D1.

export const WAKE_COOLDOWN_MS = 60_000;
export const AGENT_FRESH_MS = 60_000;
export const REPORT_FRESH_MS = 90_000;
export const REBOOT_COOLDOWN_MS = 180_000;
export const REBOOT_STALE_MS = 15 * 60_000;
export const APPS = ["claude", "chatgpt", "parsec", "tailscale"];
const DEPICUS_URL = "https://www.depicus.com/wake-on-lan/woli-ajax.php";

const MAC = /^([0-9A-F]{2}[:-]){5}[0-9A-F]{2}$/i;
const HOST = /^(?=.{3,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$|^(\d{1,3}\.){3}\d{1,3}$/i;

export async function ensureTables(db) {
  await db.batch([
    db.prepare("CREATE TABLE IF NOT EXISTS servercesar_config (id INTEGER PRIMARY KEY CHECK (id = 1), mac TEXT NOT NULL, host TEXT NOT NULL, wol_port INTEGER NOT NULL, probe_ports TEXT NOT NULL DEFAULT '', updated_by TEXT, updated_at INTEGER)"),
    db.prepare("CREATE TABLE IF NOT EXISTS servercesar_events (id TEXT PRIMARY KEY, kind TEXT NOT NULL, by_user TEXT, at INTEGER NOT NULL, ok INTEGER NOT NULL, detail TEXT)"),
    db.prepare("CREATE TABLE IF NOT EXISTS servercesar_report (id INTEGER PRIMARY KEY CHECK (id = 1), report TEXT NOT NULL, received_at INTEGER NOT NULL)"),
    db.prepare("CREATE TABLE IF NOT EXISTS servercesar_commands (id TEXT PRIMARY KEY, type TEXT NOT NULL, status TEXT NOT NULL, requested_by TEXT, requested_at INTEGER NOT NULL, claimed_at INTEGER, completed_at INTEGER, result TEXT)"),
  ]);
}

// ---- ServerCesar agent (server-agent/servercesar/): app health report and reboot queue ----

/** Bearer token of the ServerCesar agent (SERVERCESAR_AGENT_TOKEN), separate from the Minecraft agent's. */
export function requireServerAgent(request, env, constantTimeEqual) {
  const configured = String(env.SERVERCESAR_AGENT_TOKEN || "");
  const supplied = String(request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  return configured.length >= 32 && constantTimeEqual(configured, supplied);
}

const bool = (v) => (typeof v === "boolean" ? v : null);
const num = (v, min, max) => (typeof v === "number" && Number.isFinite(v) && v >= min && v <= max ? Math.round(v * 10) / 10 : null);
const str = (v, max = 60) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null);

/** Keeps only the known fields of the agent report: it ends up rendered in the portal. */
export function sanitiseReport(raw = {}) {
  const apps = {};
  for (const name of APPS) {
    const a = raw.apps?.[name];
    if (!a || typeof a !== "object") continue;
    apps[name] = {
      running: bool(a.running),
      signedIn: bool(a.signedIn),
      responding: bool(a.responding),
      service: str(a.service, 20),
      online: bool(a.online),
      remoteControl: bool(a.remoteControl),
      version: str(a.version, 40),
      restarts: num(a.restarts, 0, 100000),
      detail: str(a.detail, 120),
    };
  }
  return {
    bootTime: num(raw.bootTime, 0, 1e14),
    resumeTime: num(raw.resumeTime, 0, 1e14),
    wolPath: raw.wolPath && typeof raw.wolPath === "object"
      ? { ok: bool(raw.wolPath.ok), at: num(raw.wolPath.at, 0, 1e14), detail: str(raw.wolPath.detail, 120) }
      : null,
    cpu: num(raw.cpu, 0, 100),
    ram: num(raw.ram, 0, 100),
    diskFreeGb: num(raw.diskFreeGb, 0, 1e6),
    userSession: bool(raw.userSession),
    guardianAt: num(raw.guardianAt, 0, 1e14),
    agentVersion: str(raw.agentVersion, 20),
    apps,
  };
}

const IPV4 = /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/;

/** Public IPv4 the agent's request came from (Cloudflare's CF-Connecting-IP), or null. */
export function agentPublicIp(request) {
  const ip = String(request.headers.get("cf-connecting-ip") || "").trim();
  return IPV4.test(ip) ? ip : null;
}

/**
 * Where to send the magic packet: the configured DDNS host and, when the agent has reported
 * from a different public IP, that IP too. Nothing on the PC updates DuckDNS, so a changed
 * home IP would otherwise leave Wake-on-LAN aiming at the old address.
 */
export function wakeTargets(config, report) {
  return [...new Set([config?.host, report?.publicIp].filter(Boolean))];
}

/** "ok" | "warn" | "down" for one app, as the agent sees it. */
export function appHealth(app) {
  if (!app || app.running === false || app.service === "stopped") return "down";
  if (app.signedIn === false || app.responding === false || app.online === false || app.remoteControl === false) return "warn";
  return app.running === true && app.signedIn === true ? "ok" : "warn";
}

export async function saveReport(db, report, now = Date.now()) {
  await db.prepare("INSERT INTO servercesar_report (id, report, received_at) VALUES (1, ?, ?) ON CONFLICT(id) DO UPDATE SET report = excluded.report, received_at = excluded.received_at")
    .bind(JSON.stringify(report), now).run();
}

export async function readReport(db) {
  const row = await db.prepare("SELECT report, received_at FROM servercesar_report WHERE id = 1").first().catch(() => null);
  if (!row) return null;
  try { return { ...JSON.parse(row.report), receivedAt: row.received_at }; } catch { return null; }
}

export const POWER_ACTIONS = ["reboot", "shutdown"];

export async function lastPowerCommand(db) {
  return db.prepare("SELECT id, type, status, requested_by, requested_at, claimed_at, completed_at, result FROM servercesar_commands WHERE type IN ('reboot', 'shutdown') ORDER BY requested_at DESC LIMIT 1").first();
}

/** Queues a reboot or shutdown for the agent. Returns {ok, id} or {ok: false, error}. */
export async function queuePowerCommand(db, action, username, now = Date.now()) {
  if (!POWER_ACTIONS.includes(action)) return { ok: false, error: "invalid_action" };
  const report = await readReport(db);
  if (!report || now - report.receivedAt > REPORT_FRESH_MS) return { ok: false, error: "agent_offline" };
  // A sleeping PC can only come back through Wake-on-LAN: refuse unless the agent's last
  // end-to-end check (within 12 h) saw a magic packet from the Internet arrive.
  if (action === "shutdown" && !(report.wolPath?.ok === true && now - (report.wolPath.at || 0) < 12 * 3600_000)) {
    return { ok: false, error: "wol_route_unverified" };
  }
  const previous = await lastPowerCommand(db);
  if (previous && now - previous.requested_at < REBOOT_COOLDOWN_MS) return { ok: false, error: "cooldown", retryAt: previous.requested_at + REBOOT_COOLDOWN_MS };
  const id = crypto.randomUUID();
  await db.prepare("INSERT INTO servercesar_commands (id, type, status, requested_by, requested_at) VALUES (?, ?, 'queued', ?, ?)").bind(id, action, username, now).run();
  return { ok: true, id };
}

/** Records the result the agent sends back, expires forgotten commands and hands over the oldest queued one. */
export async function agentExchange(db, done, now = Date.now()) {
  if (done?.id) {
    await db.prepare("UPDATE servercesar_commands SET status = ?, completed_at = ?, result = ? WHERE id = ? AND status = 'claimed'")
      .bind(done.ok === true ? "succeeded" : "failed", now, String(done.detail || "").slice(0, 300), String(done.id)).run();
  }
  await db.prepare("UPDATE servercesar_commands SET status = 'expired' WHERE status = 'queued' AND requested_at < ?").bind(now - REBOOT_STALE_MS).run();
  const command = await db.prepare("SELECT id, type FROM servercesar_commands WHERE status = 'queued' ORDER BY requested_at ASC LIMIT 1").first();
  if (!command) return null;
  const claim = await db.prepare("UPDATE servercesar_commands SET status = 'claimed', claimed_at = ? WHERE id = ? AND status = 'queued'").bind(now, command.id).run();
  return claim.meta?.changes ? { id: command.id, type: command.type } : null;
}

/** Validates and normalises a configuration coming from the owner. */
export function checkConfig(raw = {}) {
  const mac = String(raw.mac || "").trim().toUpperCase().replace(/:/g, "-");
  const host = String(raw.host || "").trim().toLowerCase();
  const wolPort = Number(raw.wolPort);
  const probePorts = [...new Set(String(raw.probePorts || "").split(/[\s,;]+/).filter(Boolean).map(Number))];
  if (!MAC.test(mac)) return { ok: false, error: "invalid_mac" };
  if (!HOST.test(host)) return { ok: false, error: "invalid_host" };
  if (!Number.isInteger(wolPort) || wolPort < 1 || wolPort > 65535) return { ok: false, error: "invalid_wol_port" };
  if (probePorts.length > 4 || probePorts.some((p) => !Number.isInteger(p) || p < 1 || p > 65535 || p === 25)) return { ok: false, error: "invalid_probe_ports" };
  return { ok: true, config: { mac, host, wolPort, probePorts } };
}

export function envConfig(env = {}) {
  if (!env.SERVERCESAR_MAC || !env.SERVERCESAR_HOST) return null;
  const check = checkConfig({ mac: env.SERVERCESAR_MAC, host: env.SERVERCESAR_HOST, wolPort: Number(env.SERVERCESAR_WOL_PORT || 9), probePorts: env.SERVERCESAR_PROBE_PORTS || "" });
  return check.ok ? { ...check.config, source: "secrets" } : null;
}

export async function readConfig(db, env) {
  const row = await db.prepare("SELECT mac, host, wol_port, probe_ports, updated_at FROM servercesar_config WHERE id = 1").first();
  if (!row) return envConfig(env);
  return { mac: row.mac, host: row.host, wolPort: row.wol_port, probePorts: String(row.probe_ports || "").split(",").filter(Boolean).map(Number), updatedAt: row.updated_at, source: "mission-control" };
}

export async function saveConfig(db, config, username) {
  await db.prepare("INSERT INTO servercesar_config (id, mac, host, wol_port, probe_ports, updated_by, updated_at) VALUES (1, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET mac = excluded.mac, host = excluded.host, wol_port = excluded.wol_port, probe_ports = excluded.probe_ports, updated_by = excluded.updated_by, updated_at = excluded.updated_at")
    .bind(config.mac, config.host, config.wolPort, config.probePorts.join(","), username, Date.now()).run();
}

export async function lastWake(db) {
  return db.prepare("SELECT by_user, at, ok, detail FROM servercesar_events WHERE kind = 'wake' ORDER BY at DESC LIMIT 1").first();
}

export async function recordEvent(db, kind, username, ok, detail) {
  await db.prepare("INSERT INTO servercesar_events (id, kind, by_user, at, ok, detail) VALUES (?, ?, ?, ?, ?, ?)")
    .bind(crypto.randomUUID(), kind, username, Date.now(), ok ? 1 : 0, String(detail || "").slice(0, 300)).run();
}

/** Relays the magic packet through depicus.com. Returns {ok, message}. */
export async function sendMagicPacket(config, fetchImpl = fetch) {
  const body = new URLSearchParams({ macaddress: config.mac, ip: config.host, subnet: "255.255.255.255", port: String(config.wolPort), secureon: "" });
  const response = await fetchImpl(DEPICUS_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded; charset=UTF-8", "x-requested-with": "XMLHttpRequest", referer: "https://www.depicus.com/wake-on-lan/woli" },
    body,
    signal: AbortSignal.timeout(10_000),
  });
  const text = await response.text();
  if (!response.ok) return { ok: false, message: `depicus respondió ${response.status}` };
  let message = text.trim();
  try { message = String(JSON.parse(text).line0 || message); } catch { /* plain text answer */ }
  message = message.replace(/<[^>]*>/g, "").slice(0, 200);
  return { ok: !/error|invalid|fail/i.test(message), message: message || "Paquete enviado" };
}

/** TCP probe: resolves to the first port that accepts a connection, or null. */
export async function probe(host, ports, connectImpl, timeoutMs = 2500) {
  if (!ports?.length || !connectImpl) return null;
  const attempt = (port) => new Promise((resolve) => {
    let socket;
    const done = (value) => { clearTimeout(timer); try { socket?.close(); } catch { /* already closed */ } resolve(value); };
    const timer = setTimeout(() => done(null), timeoutMs);
    try {
      socket = connectImpl({ hostname: host, port });
      socket.opened.then(() => done(port), () => done(null));
    } catch { done(null); }
  });
  const results = await Promise.all(ports.map(attempt));
  return results.find((p) => p != null) ?? null;
}

export async function loadConnect() {
  try { return (await import("cloudflare:sockets")).connect; } catch { return null; }
}

/** Power status from the agent heartbeats (Minecraft agent or ServerCesar agent) and the TCP probe. */
export async function powerStatus(db, config, connectImpl, now = Date.now(), reportAt = null) {
  const agent = await db.prepare("SELECT last_seen FROM agent_state WHERE id = 1").first().catch(() => null);
  const agentFresh = Boolean(agent?.last_seen && now - agent.last_seen < AGENT_FRESH_MS) || Boolean(reportAt && now - reportAt < REPORT_FRESH_MS);
  const openPort = config && !agentFresh ? await probe(config.host, config.probePorts, connectImpl) : null;
  const online = agentFresh || openPort != null;
  return {
    state: online ? "online" : !config ? "unconfigured" : "no-response",
    via: agentFresh ? "agent" : openPort != null ? `port ${openPort}` : null,
    agentLastSeen: Math.max(agent?.last_seen || 0, reportAt || 0) || null,
    probed: config?.probePorts || [],
  };
}
