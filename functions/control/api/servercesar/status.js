import { userCan } from "../../../_lib/auth.js";
import { json, methodNotAllowed } from "../../../_lib/http.js";
import { ensureTables, lastWake, loadConnect, powerStatus, readConfig, WAKE_COOLDOWN_MS } from "../../../_lib/servercesar.js";

// GET: ServerCesar power status, last wake and (for the owner) its configuration.
export async function onRequest(context) {
  if (context.request.method !== "GET") return methodNotAllowed(["GET"]);
  const session = context.data.session;
  if (!session) return json({ ok: false, error: "not_authenticated" }, { status: 401 });
  if (!userCan(session.user, "servercesar:read")) return json({ ok: false, error: "servercesar_not_authorized" }, { status: 403 });

  const db = context.env.CONTROL_DB;
  await ensureTables(db);
  const config = await readConfig(db);
  const power = await powerStatus(db, config, await loadConnect());
  const wake = await lastWake(db);
  return json({
    ok: true,
    power,
    lastWake: wake ? { by: wake.by_user, at: wake.at, ok: Boolean(wake.ok), detail: wake.detail } : null,
    cooldownUntil: wake ? wake.at + WAKE_COOLDOWN_MS : 0,
    canWake: userCan(session.user, "servercesar:wake"),
    config: config && userCan(session.user, "servercesar:wake") ? config : null,
  });
}
