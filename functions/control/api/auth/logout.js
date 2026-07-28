import {
  clearSessionCookie,
  destroySession,
  validCsrf,
} from "../../../_lib/auth.js";
import { json, methodNotAllowed } from "../../../_lib/http.js";

export async function onRequest(context) {
  if (context.request.method !== "POST") return methodNotAllowed(["POST"]);
  if (!context.data.session) {
    return json(
      { ok: true },
      { headers: { "set-cookie": clearSessionCookie() } },
    );
  }
  if (!validCsrf(context.request, context.data.session)) {
    return json({ ok: false, error: "invalid_csrf" }, { status: 403 });
  }
  await destroySession(context.request, context.env);
  return json(
    { ok: true },
    { headers: { "set-cookie": clearSessionCookie() } },
  );
}
