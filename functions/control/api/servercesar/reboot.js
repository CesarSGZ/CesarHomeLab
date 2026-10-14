import { userCan, validCsrf } from "../../../_lib/auth.js";
import { json, methodNotAllowed } from "../../../_lib/http.js";
import { ensureTables, queueReboot, recordEvent } from "../../../_lib/servercesar.js";

// POST: queues a Windows restart of ServerCesar for its agent (owner only, CSRF-protected, 3 min cooldown).
// A Wake-on-LAN packet can only power the PC on, so restarting needs the agent running on that PC.
export async function onRequest(context) {
  if (context.request.method !== "POST") return methodNotAllowed(["POST"]);
  const session = context.data.session;
  if (!session) return json({ ok: false, error: "not_authenticated" }, { status: 401 });
  if (!userCan(session.user, "servercesar:wake")) return json({ ok: false, error: "reboot_not_authorized" }, { status: 403 });
  if (!validCsrf(context.request, session)) return json({ ok: false, error: "invalid_csrf" }, { status: 403 });

  const db = context.env.CONTROL_DB;
  await ensureTables(db);
  const result = await queueReboot(db, session.user.username);
  await recordEvent(db, "reboot", session.user.username, result.ok, result.ok ? "Reinicio en cola" : result.error);
  if (!result.ok) return json(result, { status: result.error === "cooldown" ? 429 : 409 });
  return json({ ok: true, id: result.id }, { status: 202 });
}
