import { currentSession } from "../_lib/auth.js";
import { json } from "../_lib/http.js";

const PUBLIC_PATHS = new Set([
  "/control/login.html",
  "/control/login.css",
  "/control/login.js",
  "/control/api/auth/login",
]);

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const isApi = url.pathname.startsWith("/control/api/");
  const isPublic = PUBLIC_PATHS.has(url.pathname);
  const session = await currentSession(context.request, context.env);

  context.data.session = session;
  context.data.user = session?.user || null;

  if (isPublic) {
    if (
      session &&
      !session.user.mustChangePassword &&
      url.pathname === "/control/login.html"
    ) {
      return Response.redirect(`${url.origin}/control/`, 302);
    }
    return context.next();
  }

  if (!session) {
    if (isApi) {
      return json({ ok: false, error: "not_authenticated" }, { status: 401 });
    }
    return Response.redirect(`${url.origin}/control/login.html`, 302);
  }

  if (
    session.user.mustChangePassword &&
    !url.pathname.startsWith("/control/api/auth/") &&
    url.pathname !== "/control/api/session"
  ) {
    if (isApi) {
      return json({ ok: false, error: "password_change_required" }, { status: 403 });
    }
    return Response.redirect(`${url.origin}/control/login.html?change=required`, 302);
  }

  return context.next();
}
