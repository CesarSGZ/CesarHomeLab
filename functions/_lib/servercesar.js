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
const DEPICUS_URL = "https://www.depicus.com/wake-on-lan/woli-ajax.php";

const MAC = /^([0-9A-F]{2}[:-]){5}[0-9A-F]{2}$/i;
const HOST = /^(?=.{3,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$|^(\d{1,3}\.){3}\d{1,3}$/i;

export async function ensureTables(db) {
  await db.batch([
    db.prepare("CREATE TABLE IF NOT EXISTS servercesar_config (id INTEGER PRIMARY KEY CHECK (id = 1), mac TEXT NOT NULL, host TEXT NOT NULL, wol_port INTEGER NOT NULL, probe_ports TEXT NOT NULL DEFAULT '', updated_by TEXT, updated_at INTEGER)"),
    db.prepare("CREATE TABLE IF NOT EXISTS servercesar_events (id TEXT PRIMARY KEY, kind TEXT NOT NULL, by_user TEXT, at INTEGER NOT NULL, ok INTEGER NOT NULL, detail TEXT)"),
  ]);
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

/** Power status from the agent heartbeat and the TCP probe. */
export async function powerStatus(db, config, connectImpl, now = Date.now()) {
  const agent = await db.prepare("SELECT last_seen FROM agent_state WHERE id = 1").first().catch(() => null);
  const agentFresh = Boolean(agent?.last_seen && now - agent.last_seen < AGENT_FRESH_MS);
  const openPort = config ? await probe(config.host, config.probePorts, connectImpl) : null;
  const online = agentFresh || openPort != null;
  return {
    state: !config ? "unconfigured" : online ? "online" : "no-response",
    via: agentFresh ? "agent" : openPort != null ? `port ${openPort}` : null,
    agentLastSeen: agent?.last_seen || null,
    probed: config?.probePorts || [],
  };
}
