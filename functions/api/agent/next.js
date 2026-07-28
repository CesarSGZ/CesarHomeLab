import { requireAgent } from "../../_lib/auth.js";
import { json, methodNotAllowed } from "../../_lib/http.js";

export async function onRequest(context) {
  if (context.request.method !== "POST") return methodNotAllowed(["POST"]);
  if (!requireAgent(context.request, context.env)) {
    return json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const command = await context.env.CONTROL_DB
    .prepare(
      "SELECT id, type, requested_at FROM commands WHERE status = 'queued' ORDER BY requested_at ASC LIMIT 1",
    )
    .first();

  if (!command) return json({ ok: true, command: null });

  const claimedAt = Date.now();
  const result = await context.env.CONTROL_DB
    .prepare(
      "UPDATE commands SET status = 'claimed', claimed_at = ? WHERE id = ? AND status = 'queued'",
    )
    .bind(claimedAt, command.id)
    .run();

  if (!result.meta?.changes) return json({ ok: true, command: null });

  await context.env.CONTROL_DB
    .prepare(
      "UPDATE agent_state SET last_seen = ?, last_action = ?, last_error = NULL WHERE id = 1",
    )
    .bind(claimedAt, `claimed:${command.type}`)
    .run();

  return json({
    ok: true,
    command: { id: command.id, type: command.type, requestedAt: command.requested_at },
  });
}
