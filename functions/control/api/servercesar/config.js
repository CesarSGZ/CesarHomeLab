import { userCan, validCsrf } from "../../../_lib/auth.js";
import { json, methodNotAllowed, readJson } from "../../../_lib/http.js";
import { checkConfig, ensureTables, recordEvent, saveConfig } from "../../../_lib/servercesar.js";

// POST: the owner stores ServerCesar's MAC, DDNS host, Wake-on-LAN port and status probe ports.
export async function onRequest(context) {
  if (context.request.method !== "POST") return methodNotAllowed(["POST"]);
  const session = context.data.session;
  if (!session) return json({ ok: false, error: "not_authenticated" }, { status: 401 });
  if (!userCan(session.user, "servercesar:wake")) return json({ ok: false, error: "config_not_authorized" }, { status: 403 });
  if (!validCsrf(context.request, session)) return json({ ok: false, error: "invalid_csrf" }, { status: 403 });

  let body;
  try { body = await readJson(context.request); } catch { return json({ ok: false, error: "invalid_json" }, { status: 400 }); }
  const check = checkConfig(body);
  if (!check.ok) return json(check, { status: 400 });
  const db = context.env.CONTROL_DB;
  await ensureTables(db);
  await saveConfig(db, check.config, session.user.username);
  await recordEvent(db, "config", session.user.username, true, "Configuración actualizada");
  return json({ ok: true, config: check.config });
}
