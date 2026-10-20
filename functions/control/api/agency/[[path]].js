import { userCan, validCsrf } from "../../../_lib/auth.js";
import { json, readJson } from "../../../_lib/http.js";
import { ensureTables, queueCommand, queueMessage, readStatus } from "../../../_lib/agency.js";

// Dashboard de la Agencia: GET status, POST chat {text}, POST command {agent, type}.
export async function onRequest({ request, env, data, params }) {
  if (!data.session) return json({ ok: false, error: "not_authenticated" }, { status: 401 });
  if (!userCan(data.session.user, "agency:manage")) return json({ ok: false, error: "not_authorised" }, { status: 403 });
  const path = Array.isArray(params.path) ? params.path.join("/") : params.path || "status";
  const db = env.CONTROL_DB;
  try {
    await ensureTables(db);
    if (path === "status" && request.method === "GET") return json(await readStatus(db));
    if (request.method !== "POST") return json({ ok: false, error: "method_not_allowed" }, { status: 405 });
    if (!validCsrf(request, data.session)) return json({ ok: false, error: "invalid_csrf" }, { status: 403 });
    const body = await readJson(request, 8192);
    if (path === "chat") return json({ ok: true, ...(await queueMessage(db, body.text)) });
    if (path === "command") return json({ ok: true, ...(await queueCommand(db, body.agent, body.type)) });
    return json({ ok: false, error: "not_found" }, { status: 404 });
  } catch (error) {
    return json({ ok: false, error: String(error.message || error).slice(0, 200) }, { status: error.status || 500 });
  }
}
