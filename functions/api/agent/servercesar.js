import { constantTimeEqual } from "../../_lib/auth.js";
import { json, methodNotAllowed, readJson } from "../../_lib/http.js";
import { agentExchange, agentPublicIp, ensureTables, readReport, requireServerAgent, sanitiseReport, saveReport } from "../../_lib/servercesar.js";

// POST from the ServerCesar agent every ~30 s: stores its health report (PC + Claude, ChatGPT,
// Parsec, Tailscale), records the result of the last command and returns the next one (reboot).
export async function onRequest(context) {
  if (context.request.method !== "POST") return methodNotAllowed(["POST"]);
  if (!requireServerAgent(context.request, context.env, constantTimeEqual)) {
    return json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await readJson(context.request, 16_384);
  } catch {
    return json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const db = context.env.CONTROL_DB;
  await ensureTables(db);
  // Keep the last known public IP even if one request arrives over IPv6: it is the Wake-on-LAN fallback target.
  const publicIp = agentPublicIp(context.request) || (await readReport(db))?.publicIp || null;
  await saveReport(db, { ...sanitiseReport(body.report || {}), publicIp });
  const command = await agentExchange(db, body.done || null);
  return json({ ok: true, command });
}
