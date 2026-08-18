import { requireEbayWrite } from "../../../../_lib/ebay.js";
import { ebayAuthorizeUrl } from "../../../../_lib/ebay-client.js";
import { sha256 } from "../../../../_lib/auth.js";
import { json, methodNotAllowed } from "../../../../_lib/http.js";

function randomState() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export async function onRequest(context) {
  if (context.request.method !== "POST") return methodNotAllowed(["POST"]);
  const denied = requireEbayWrite(context);
  if (denied) return denied;
  if (!context.env.EBAY_CLIENT_ID || !context.env.EBAY_CLIENT_SECRET || !context.env.EBAY_RUNAME) {
    return json({ ok: false, error: "ebay_app_not_configured" }, { status: 409 });
  }
  const state = randomState();
  const now = Date.now();
  await context.env.CONTROL_DB.batch([
    context.env.CONTROL_DB.prepare("DELETE FROM marketplace_oauth_states WHERE expires_at < ?").bind(now),
    context.env.CONTROL_DB.prepare(
      "INSERT INTO marketplace_oauth_states (state_hash, service, user_id, created_at, expires_at) VALUES (?, 'ebay', ?, ?, ?)",
    ).bind(await sha256(state), context.data.session.user.id, now, now + 10 * 60 * 1000),
  ]);
  return json({ ok: true, authorizeUrl: ebayAuthorizeUrl(context.env, state) });
}
