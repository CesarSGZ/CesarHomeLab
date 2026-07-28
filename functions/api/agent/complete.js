import { requireAgent } from "../../_lib/auth.js";
import { json, methodNotAllowed, readJson } from "../../_lib/http.js";

export async function onRequest(context) {
  if (context.request.method !== "POST") return methodNotAllowed(["POST"]);
  if (!requireAgent(context.request, context.env)) {
    return json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await readJson(context.request);
  } catch {
    return json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const id = String(body.id || "");
  const succeeded = body.succeeded === true;
  const resultText = String(body.result || "").slice(0, 500);
  if (!id) return json({ ok: false, error: "missing_command_id" }, { status: 400 });

  const completedAt = Date.now();
  const update = await context.env.CONTROL_DB
    .prepare(
      "UPDATE commands SET status = ?, completed_at = ?, result = ? WHERE id = ? AND status = 'claimed'",
    )
    .bind(succeeded ? "succeeded" : "failed", completedAt, resultText, id)
    .run();

  if (!update.meta?.changes) {
    return json({ ok: false, error: "command_not_claimed" }, { status: 409 });
  }

  await context.env.CONTROL_DB
    .prepare(
      "UPDATE agent_state SET last_seen = ?, last_action = ?, last_error = ? WHERE id = 1",
    )
    .bind(
      completedAt,
      succeeded ? "restart:completed" : "restart:failed",
      succeeded ? null : resultText,
    )
    .run();

  return json({ ok: true });
}
