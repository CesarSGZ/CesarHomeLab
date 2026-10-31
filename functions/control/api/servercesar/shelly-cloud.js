import { userCan, validCsrf } from "../../../_lib/auth.js";
import { json, methodNotAllowed, readJson } from "../../../_lib/http.js";
import { checkCloudConfig, cloudPlugStatus, ensureTables, readCloudConfig, recordEvent, saveCloudConfig } from "../../../_lib/servercesar.js";

// POST: the owner stores the Shelly Cloud server and authorisation key (fallback power-on during
// LaLiga IP blocks). The key goes to D1 only and is never sent back. Answers with a live check.
export async function onRequest(context) {
  if (context.request.method !== "POST") return methodNotAllowed(["POST"]);
  const session = context.data.session;
  if (!session) return json({ ok: false, error: "not_authenticated" }, { status: 401 });
  if (!userCan(session.user, "servercesar:wake")) return json({ ok: false, error: "config_not_authorized" }, { status: 403 });
  if (!validCsrf(context.request, session)) return json({ ok: false, error: "invalid_csrf" }, { status: 403 });

  let body;
  try { body = await readJson(context.request); } catch { return json({ ok: false, error: "invalid_json" }, { status: 400 }); }
  const check = checkCloudConfig(body);
  if (!check.ok) return json(check, { status: 400 });
  const db = context.env.CONTROL_DB;
  await ensureTables(db);
  await saveCloudConfig(db, check.config, session.user.username);
  await recordEvent(db, "config", session.user.username, true, "Nube de Shelly configurada");

  const cloud = await readCloudConfig(db);
  if (!cloud.deviceId) return json({ ok: true, check: "El enchufe enviará su ID en su próxima consulta a la web; hasta entonces la nube no se puede probar." });
  try {
    const state = await cloudPlugStatus(cloud);
    return json({ ok: true, check: state.online ? `Nube de Shelly OK: el enchufe responde (${state.apower ?? "?"} W).` : "La nube responde, pero dice que el enchufe no está conectado." });
  } catch (error) {
    return json({ ok: true, check: `Guardado, pero la nube de Shelly no respondió bien: ${String(error.message).slice(0, 120)}` });
  }
}
