import { userCan, validCsrf } from "../../../_lib/auth.js";
import { json, methodNotAllowed } from "../../../_lib/http.js";
import { ensureTables, lastWake, readConfig, recordEvent, sendMagicPacket, WAKE_COOLDOWN_MS } from "../../../_lib/servercesar.js";

// POST: sends the Wake-on-LAN magic packet to ServerCesar (owner only, CSRF-protected, 60 s cooldown).
export async function onRequest(context) {
  if (context.request.method !== "POST") return methodNotAllowed(["POST"]);
  const session = context.data.session;
  if (!session) return json({ ok: false, error: "not_authenticated" }, { status: 401 });
  if (!userCan(session.user, "servercesar:wake")) return json({ ok: false, error: "wake_not_authorized" }, { status: 403 });
  if (!validCsrf(context.request, session)) return json({ ok: false, error: "invalid_csrf" }, { status: 403 });

  const db = context.env.CONTROL_DB;
  await ensureTables(db);
  const config = await readConfig(db, context.env);
  if (!config) return json({ ok: false, error: "not_configured" }, { status: 409 });
  const previous = await lastWake(db);
  if (previous && Date.now() - previous.at < WAKE_COOLDOWN_MS) {
    return json({ ok: false, error: "cooldown", retryAt: previous.at + WAKE_COOLDOWN_MS }, { status: 429 });
  }

  let result;
  try {
    result = await sendMagicPacket(config);
  } catch (error) {
    result = { ok: false, message: "No se pudo contactar con el servicio de Wake-on-LAN" };
  }
  await recordEvent(db, "wake", session.user.username, result.ok, result.message);
  return json({ ok: result.ok, message: result.message, sentAt: Date.now() }, { status: result.ok ? 200 : 502 });
}
