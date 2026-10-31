import { constantTimeEqual } from "../../_lib/auth.js";
import { json, methodNotAllowed, readJson } from "../../_lib/http.js";
import { ensureTables, plugExchange, requirePlug } from "../../_lib/servercesar.js";

// POST from the Shelly plug in front of ServerCesar about once a minute: {output, apower, done}.
// Stores the reading, records the result of the last power-on and returns the next queued one.
export async function onRequest(context) {
  if (context.request.method !== "POST") return methodNotAllowed(["POST"]);
  if (!(await requirePlug(context.request, context.env, constantTimeEqual))) {
    return json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await readJson(context.request, 2_048);
  } catch {
    return json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const db = context.env.CONTROL_DB;
  await ensureTables(db);
  const command = await plugExchange(db, body);
  return json({ ok: true, command });
}
