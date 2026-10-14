import { userCan, validCsrf } from "../../../_lib/auth.js";
import { json, methodNotAllowed, readJson } from "../../../_lib/http.js";
import { ensureTables, queuePowerCommand, recordEvent } from "../../../_lib/servercesar.js";

// POST {action: "reboot" | "shutdown"}: queues a Windows restart or shutdown of ServerCesar for its agent
// (owner only, CSRF-protected, 3 min cooldown). Wake-on-LAN can only power the PC on, so these need the agent.
export async function onRequest(context) {
  if (context.request.method !== "POST") return methodNotAllowed(["POST"]);
  const session = context.data.session;
  if (!session) return json({ ok: false, error: "not_authenticated" }, { status: 401 });
  if (!userCan(session.user, "servercesar:wake")) return json({ ok: false, error: "power_not_authorized" }, { status: 403 });
  if (!validCsrf(context.request, session)) return json({ ok: false, error: "invalid_csrf" }, { status: 403 });

  let body;
  try { body = await readJson(context.request); } catch { return json({ ok: false, error: "invalid_json" }, { status: 400 }); }
  const action = String(body.action || "");
  const db = context.env.CONTROL_DB;
  await ensureTables(db);
  const result = await queuePowerCommand(db, action, session.user.username);
  if (result.error === "invalid_action") return json(result, { status: 400 });
  await recordEvent(db, action, session.user.username, result.ok, result.ok ? "En cola" : result.error);
  if (!result.ok) return json(result, { status: result.error === "cooldown" ? 429 : 409 });
  return json({ ok: true, id: result.id, action }, { status: 202 });
}
