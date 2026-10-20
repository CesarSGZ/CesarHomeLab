import { constantTimeEqual } from "../../_lib/auth.js";
import { json, methodNotAllowed, readJson } from "../../_lib/http.js";
import { agentSync, ensureTables, requireAgencyAgent } from "../../_lib/agency.js";

// POST del backend de la agencia (agency-backend/ en ServerCesar), cada pocos segundos.
// {action: "sync", state?, events?, replies?, done?} publica y recoge mensajes y órdenes.
// {action: "openai-key"} devuelve la clave de OpenAI del proyecto (secreto OPENAI_API_KEY),
// para no tener que copiarla a mano en el PC; el backend la guarda cifrada con DPAPI.
export async function onRequest(context) {
  if (context.request.method !== "POST") return methodNotAllowed(["POST"]);
  if (!requireAgencyAgent(context.request, context.env, constantTimeEqual)) {
    return json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  let body;
  try {
    body = await readJson(context.request, 196_608);
  } catch {
    return json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  if (body.action === "openai-key") {
    const key = String(context.env.OPENAI_API_KEY || "");
    return key ? json({ ok: true, key }) : json({ ok: false, error: "openai_key_missing" }, { status: 503 });
  }
  const db = context.env.CONTROL_DB;
  await ensureTables(db);
  return json({ ok: true, ...(await agentSync(db, body)) });
}
