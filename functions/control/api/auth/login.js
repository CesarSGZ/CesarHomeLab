import {
  constantTimeEqual,
  createSession,
  hashPassword,
  normaliseUsername,
  sessionCookie,
} from "../../../_lib/auth.js";
import { json, methodNotAllowed, readJson } from "../../../_lib/http.js";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

export async function onRequest(context) {
  if (context.request.method !== "POST") return methodNotAllowed(["POST"]);

  let body;
  try {
    body = await readJson(context.request);
  } catch {
    return json({ ok: false, error: "invalid_request" }, { status: 400 });
  }

  const username = normaliseUsername(body.username);
  const password = String(body.password || "");
  if (!username || !password || password.length > 128) {
    return json({ ok: false, error: "invalid_credentials" }, { status: 401 });
  }

  const user = await context.env.CONTROL_DB.prepare(
    "SELECT * FROM users WHERE username_normalized = ? LIMIT 1",
  )
    .bind(username)
    .first();

  const now = Date.now();
  if (!user || (user.locked_until && Number(user.locked_until) > now)) {
    return json({ ok: false, error: "invalid_credentials" }, { status: 401 });
  }

  const suppliedHash = await hashPassword(
    password,
    user.password_salt,
    context.env.AUTH_PEPPER,
  );
  if (!constantTimeEqual(suppliedHash, user.password_hash)) {
    const attempts = Number(user.failed_attempts || 0) + 1;
    const lockedUntil = attempts >= MAX_FAILED_ATTEMPTS ? now + LOCKOUT_MS : null;
    await context.env.CONTROL_DB.prepare(
      "UPDATE users SET failed_attempts = ?, locked_until = ?, updated_at = ? WHERE id = ?",
    )
      .bind(attempts >= MAX_FAILED_ATTEMPTS ? 0 : attempts, lockedUntil, now, user.id)
      .run();
    return json({ ok: false, error: "invalid_credentials" }, { status: 401 });
  }

  await context.env.CONTROL_DB.batch([
    context.env.CONTROL_DB.prepare(
      "UPDATE users SET failed_attempts = 0, locked_until = NULL, updated_at = ? WHERE id = ?",
    ).bind(now, user.id),
    context.env.CONTROL_DB.prepare(
      "DELETE FROM sessions WHERE user_id = ? OR expires_at <= ?",
    ).bind(user.id, now),
  ]);

  const session = await createSession(context.env, user.id);
  return json(
    {
      ok: true,
      user: {
        username: user.username,
        role: user.role,
        mustChangePassword: Boolean(user.must_change_password),
      },
      csrfToken: session.csrfToken,
    },
    { headers: { "set-cookie": sessionCookie(session.rawToken) } },
  );
}
