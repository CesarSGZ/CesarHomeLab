import { json, methodNotAllowed } from "../../_lib/http.js";

export async function onRequest(context) {
  if (context.request.method !== "GET") return methodNotAllowed(["GET"]);

  const session = context.data.session;
  if (!session) return json({ ok: false, error: "not_authenticated" }, { status: 401 });
  return json({
    ok: true,
    user: session.user,
    csrfToken: session.csrfToken,
    expiresAt: session.expiresAt,
  });
}
