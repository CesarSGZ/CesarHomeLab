import {
  hashPassword,
  newPasswordSalt,
  passwordIsAcceptable,
  validCsrf,
} from "../../../_lib/auth.js";
import { json, methodNotAllowed, readJson } from "../../../_lib/http.js";

export async function onRequest(context) {
  if (context.request.method !== "POST") return methodNotAllowed(["POST"]);
  const session = context.data.session;
  if (!session) return json({ ok: false, error: "not_authenticated" }, { status: 401 });
  if (!validCsrf(context.request, session)) {
    return json({ ok: false, error: "invalid_csrf" }, { status: 403 });
  }

  let body;
  try {
    body = await readJson(context.request);
  } catch {
    return json({ ok: false, error: "invalid_request" }, { status: 400 });
  }
  const password = String(body.password || "");
  if (!passwordIsAcceptable(password, session.user.username)) {
    return json({ ok: false, error: "weak_password" }, { status: 400 });
  }

  const salt = newPasswordSalt();
  const passwordHash = await hashPassword(
    password,
    salt,
    context.env.AUTH_PEPPER,
  );
  const now = Date.now();
  await context.env.CONTROL_DB.batch([
    context.env.CONTROL_DB.prepare(
      "UPDATE users SET password_salt = ?, password_hash = ?, must_change_password = 0, failed_attempts = 0, locked_until = NULL, updated_at = ? WHERE id = ?",
    ).bind(salt, passwordHash, now, session.user.id),
    context.env.CONTROL_DB.prepare(
      "DELETE FROM sessions WHERE user_id = ? AND session_hash <> ?",
    ).bind(session.user.id, session.sessionHash),
  ]);

  return json({ ok: true });
}
