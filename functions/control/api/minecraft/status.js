import { json, methodNotAllowed } from "../../../_lib/http.js";

const OFFLINE_AFTER_MS = 30_000;

export async function onRequest(context) {
  if (context.request.method !== "GET") return methodNotAllowed(["GET"]);

  if (!context.data.session) {
    return json({ ok: false, error: "not_authenticated" }, { status: 401 });
  }

  const state = await context.env.CONTROL_DB
    .prepare("SELECT * FROM agent_state WHERE id = 1")
    .first();

  const lastCommand = await context.env.CONTROL_DB
    .prepare(
      "SELECT id, type, status, requested_by, requested_at, completed_at, result FROM commands ORDER BY requested_at DESC LIMIT 1",
    )
    .first();

  const now = Date.now();
  const connected = Boolean(state?.last_seen && now - state.last_seen < OFFLINE_AFTER_MS);

  return json({
    ok: true,
    agent: {
      connected,
      status: connected ? state.agent_status : "offline",
      lastSeen: state?.last_seen || null,
    },
    server: {
      status: connected ? state.server_status : "unknown",
      playersOnline: state?.players_online ?? null,
      playersMax: state?.players_max ?? null,
      version: state?.server_version || null,
      lastAction: state?.last_action || null,
      lastError: state?.last_error || null,
    },
    lastCommand: lastCommand || null,
  });
}
