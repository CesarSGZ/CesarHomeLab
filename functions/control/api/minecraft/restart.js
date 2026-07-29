import { userCan, validCsrf } from "../../../_lib/auth.js";
import { json, methodNotAllowed } from "../../../_lib/http.js";

const COMMAND_COOLDOWN_MS = 90_000;

export async function onRequest(context) {
  if (context.request.method !== "POST") return methodNotAllowed(["POST"]);

  const session = context.data.session;
  if (!session) return json({ ok: false, error: "not_authenticated" }, { status: 401 });
  if (!userCan(session.user, "minecraft:restart")) {
    return json({ ok: false, error: "restart_not_authorized" }, { status: 403 });
  }
  if (!validCsrf(context.request, session)) {
    return json({ ok: false, error: "invalid_csrf" }, { status: 403 });
  }

  const contentType = context.request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().startsWith("application/json")) {
    return json({ ok: false, error: "invalid_content_type" }, { status: 415 });
  }

  const state = await context.env.CONTROL_DB
    .prepare("SELECT last_seen FROM agent_state WHERE id = 1")
    .first();
  if (!state?.last_seen || Date.now() - state.last_seen > 30_000) {
    return json({ ok: false, error: "agent_offline" }, { status: 409 });
  }

  const recent = await context.env.CONTROL_DB
    .prepare(
      "SELECT id, status FROM commands WHERE requested_at > ? AND status IN ('queued', 'claimed') ORDER BY requested_at DESC LIMIT 1",
    )
    .bind(Date.now() - COMMAND_COOLDOWN_MS)
    .first();
  if (recent) {
    return json(
      { ok: false, error: "restart_already_pending", commandId: recent.id },
      { status: 409 },
    );
  }

  const id = crypto.randomUUID();
  const idempotencyKey =
    context.request.headers.get("idempotency-key") || crypto.randomUUID();
  const now = Date.now();

  try {
    await context.env.CONTROL_DB
      .prepare(
        "INSERT INTO commands (id, type, status, requested_by, requested_at, idempotency_key) VALUES (?, 'restart', 'queued', ?, ?, ?)",
      )
      .bind(id, session.user.username, now, idempotencyKey)
      .run();
  } catch (error) {
    if (String(error).includes("UNIQUE")) {
      const existing = await context.env.CONTROL_DB
        .prepare(
          "SELECT id, status FROM commands WHERE idempotency_key = ? LIMIT 1",
        )
        .bind(idempotencyKey)
        .first();
      return json({ ok: true, command: existing, duplicate: true }, { status: 202 });
    }
    throw error;
  }

  return json(
    { ok: true, command: { id, type: "restart", status: "queued", requestedAt: now } },
    { status: 202 },
  );
}
