import { requireEbayRead, asRows } from "../../../_lib/ebay.js";
import { json, methodNotAllowed } from "../../../_lib/http.js";
import { ensureRealMarketplaceSchema } from "../../../_lib/marketplace-schema.js";

export async function onRequest(context) {
  if (context.request.method !== "GET") return methodNotAllowed(["GET"]);
  const denied = requireEbayRead(context);
  if (denied) return denied;

  const db = context.env.CONTROL_DB;
  try {
    await ensureRealMarketplaceSchema(db);
  } catch (error) {
    return json({ ok: false, error: "marketplace_schema_failed", detail: String(error.message || error).slice(0, 500) }, { status: 500 });
  }
  const [opportunities, listings, orders, providers, credentials, activity, marketplaceSettings, latestSync, storedToken, storedApp] = await Promise.all([
    db.prepare(`SELECT o.*, p.name AS provider_name FROM ebay_opportunities o JOIN ebay_providers p ON p.id = o.provider_id ORDER BY CASE o.status WHEN 'pending' THEN 0 WHEN 'approved' THEN 1 WHEN 'drafted' THEN 2 ELSE 3 END, o.estimated_profit_cents DESC, o.match_confidence DESC LIMIT 100`).all(),
    db.prepare(`SELECT l.*, o.supplier_cost_cents, o.shipping_cost_cents, o.estimated_fee_cents, o.stock_quantity, p.name AS provider_name FROM ebay_listings l JOIN ebay_opportunities o ON o.id = l.opportunity_id JOIN ebay_providers p ON p.id = o.provider_id ORDER BY CASE l.listing_status WHEN 'ready_to_publish' THEN 0 WHEN 'active' THEN 1 ELSE 2 END, l.generated_at DESC LIMIT 100`).all(),
    db.prepare(`SELECT o.*, l.sku, l.title FROM ebay_orders o LEFT JOIN ebay_listings l ON l.id = o.listing_id ORDER BY o.ordered_at DESC LIMIT 100`).all(),
    db.prepare("SELECT * FROM ebay_providers ORDER BY name").all(),
    db.prepare("SELECT * FROM ebay_credentials ORDER BY service").all(),
    db.prepare("SELECT * FROM ebay_activity_log ORDER BY created_at DESC LIMIT 20").all(),
    db.prepare("SELECT setting_key, setting_value FROM marketplace_settings ORDER BY setting_key").all(),
    db.prepare("SELECT * FROM marketplace_sync_jobs ORDER BY started_at DESC LIMIT 1").first(),
    db.prepare("SELECT access_expires_at, refresh_expires_at, updated_at FROM marketplace_tokens WHERE service = 'ebay'").first(),
    db.prepare("SELECT environment, updated_at FROM marketplace_app_credentials WHERE service = 'ebay'").first(),
  ]);
  const opportunityRows = asRows(opportunities);
  const listingRows = asRows(listings);
  const orderRows = asRows(orders);
  const credentialRows = asRows(credentials);
  const connected = Boolean(storedToken) && credentialRows.find((credential) => credential.service === "ebay_sell_api")?.connection_status === "connected";
  const openOrders = orderRows.filter((order) => ["paid", "processing", "shipped"].includes(order.order_status));
  const realisedOrders = orderRows.filter((order) => order.financial_status === "reconciled" && order.costs_confirmed_at);
  const pnl = realisedOrders.reduce((total, order) => total + Number(order.ebay_earnings_cents || 0) - Number(order.product_cost_cents) - Number(order.shipping_cost_cents), 0);
  const lastSync = [
    ...asRows(providers).flatMap((provider) => [provider.stock_sync_at, provider.price_sync_at]),
    ...orderRows.map((order) => order.last_synced_at),
  ].filter(Boolean).sort((a, b) => b - a)[0] || null;

  return json({
    ok: true,
    mode: connected ? "live-ready" : "setup",
    connection: {
      ebayConnected: connected,
      publishingEnabled: connected && asRows(marketplaceSettings).find((row) => row.setting_key === "live_publish_enabled")?.setting_value === "true",
      ebayAppConfigured: Boolean(context.env.TOKEN_ENCRYPTION_SECRET && ((context.env.EBAY_CLIENT_ID && context.env.EBAY_CLIENT_SECRET && context.env.EBAY_RUNAME) || storedApp)),
      ebayAppEnvironment: storedApp?.environment || (context.env.EBAY_CLIENT_ID ? "production" : null),
      bigbuyApiConfigured: Boolean(context.env.BIGBUY_API_KEY),
      lastSync,
      latestSync: latestSync || null,
      tokenUpdatedAt: storedToken?.updated_at || null,
    },
    summary: {
      pendingOpportunities: opportunityRows.filter((item) => item.status === "pending").length,
      activeListings: listingRows.filter((item) => item.listing_status === "active").length,
      openOrders: openOrders.length,
      netProfitCents: pnl,
      realisedOrders: realisedOrders.length,
      pendingReconciliation: orderRows.length - realisedOrders.length,
    },
    opportunities: opportunityRows,
    listings: listingRows,
    orders: orderRows,
    providers: asRows(providers),
    credentials: credentialRows,
    settings: asRows(marketplaceSettings),
    activity: asRows(activity),
  });
}
