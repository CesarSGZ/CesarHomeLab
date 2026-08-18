import { userCan, validCsrf } from "./auth.js";
import { json } from "./http.js";

export function requireEbayRead(context) {
  const session = context.data.session;
  if (!session) return json({ ok: false, error: "not_authenticated" }, { status: 401 });
  if (!userCan(session.user, "ebay:read")) {
    return json({ ok: false, error: "ebay_not_authorized" }, { status: 403 });
  }
  return null;
}

export function requireEbayWrite(context) {
  const denied = requireEbayRead(context);
  if (denied) return denied;
  if (!userCan(context.data.session.user, "ebay:write")) {
    return json({ ok: false, error: "ebay_write_not_authorized" }, { status: 403 });
  }
  if (!validCsrf(context.request, context.data.session)) {
    return json({ ok: false, error: "invalid_csrf" }, { status: 403 });
  }
  return null;
}

export function cents(value) {
  return Math.max(0, Math.round(Number(value) || 0));
}

export function asRows(result) {
  return result?.results || [];
}
