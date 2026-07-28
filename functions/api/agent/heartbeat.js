import { requireAgent } from "../../_lib/auth.js";
import { json, methodNotAllowed, readJson } from "../../_lib/http.js";

const VALID_SERVER_STATES = new Set(["online", "offline", "starting", "stopping", "unknown"]);

export async function onRequest(context) {
  if (context.request.method !== "POST") return methodNotAllowed(["POST"]);
  if (!requireAgent(context.request, context.env)) {
    return json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await readJson(context.request);
  } catch {
    return json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const serverStatus = VALID_SERVER_STATES.has(body.serverStatus)
    ? body.serverStatus
    : "unknown";
  const playersOnline = Number.isInteger(body.playersOnline) ? body.playersOnline : null;
  const playersMax = Number.isInteger(body.playersMax) ? body.playersMax : null;
  const version = String(body.version || "").slice(0, 80) || null;

  await context.env.CONTROL_DB
    .prepare(
      `UPDATE agent_state
       SET agent_status = 'online', server_status = ?, players_online = ?,
           players_max = ?, server_version = ?, last_seen = ?
       WHERE id = 1`,
    )
    .bind(serverStatus, playersOnline, playersMax, version, Date.now())
    .run();

  return json({ ok: true });
}
