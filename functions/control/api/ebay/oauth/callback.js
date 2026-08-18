import { sha256 } from "../../../../_lib/auth.js";
import { exchangeEbayAuthorizationCode, storeEbayTokens } from "../../../../_lib/ebay-client.js";

function redirect(request, status) {
  const url = new URL(request.url);
  return Response.redirect(`${url.origin}/control/?ebay_connection=${encodeURIComponent(status)}#ebay`, 302);
}

export async function onRequest(context) {
  if (context.request.method !== "GET") return new Response("Method Not Allowed", { status: 405 });
  const session = context.data.session;
  if (!session) return redirect(context.request, "not-authenticated");
  const url = new URL(context.request.url);
  if (url.searchParams.get("error")) return redirect(context.request, "consent-denied");
  const state = String(url.searchParams.get("state") || "");
  const code = String(url.searchParams.get("code") || "");
  if (!state || !code) return redirect(context.request, "invalid-callback");
  const stateHash = await sha256(state);
  const stateRow = await context.env.CONTROL_DB.prepare(
    "SELECT * FROM marketplace_oauth_states WHERE state_hash = ? AND service = 'ebay' AND user_id = ? AND expires_at > ?",
  ).bind(stateHash, session.user.id, Date.now()).first();
  if (!stateRow) return redirect(context.request, "invalid-state");

  try {
    const tokens = await exchangeEbayAuthorizationCode(context.env, code);
    await storeEbayTokens(context.env, tokens);
    await context.env.CONTROL_DB.batch([
      context.env.CONTROL_DB.prepare("DELETE FROM marketplace_oauth_states WHERE state_hash = ?").bind(stateHash),
      context.env.CONTROL_DB.prepare(
        "UPDATE ebay_credentials SET connection_status = 'connected', last_checked_at = ?, detail = 'OAuth seller consent active.' WHERE service = 'ebay_sell_api'",
      ).bind(Date.now()),
      context.env.CONTROL_DB.prepare(
        "INSERT INTO ebay_activity_log (id, entity_type, entity_id, action, actor, created_at, detail) VALUES (?, 'connection', 'ebay', 'oauth_connected', ?, ?, 'Seller OAuth consent stored encrypted.')",
      ).bind(crypto.randomUUID(), session.user.username, Date.now()),
    ]);
    return redirect(context.request, "connected");
  } catch (error) {
    await context.env.CONTROL_DB.prepare(
      "UPDATE ebay_credentials SET connection_status = 'error', last_checked_at = ?, detail = ? WHERE service = 'ebay_sell_api'",
    ).bind(Date.now(), String(error.message || "oauth_exchange_failed").slice(0, 240)).run();
    return redirect(context.request, "connection-failed");
  }
}
