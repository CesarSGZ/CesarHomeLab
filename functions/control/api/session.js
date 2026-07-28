import { currentUser } from "../../_lib/auth.js";
import { json, methodNotAllowed } from "../../_lib/http.js";

export async function onRequest(context) {
  if (context.request.method !== "GET") return methodNotAllowed(["GET"]);

  const user = currentUser(context.request, context.env);
  if (!user) return json({ ok: false, error: "not_authorized" }, { status: 403 });

  return json({ ok: true, user });
}
