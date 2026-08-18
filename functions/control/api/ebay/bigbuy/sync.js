import { requireEbayWrite } from "../../../../_lib/ebay.js";
import { loadBigBuyCataloguePage, bigBuyConfigured } from "../../../../_lib/bigbuy-client.js";
import { ebayApplicationAccessToken, ebayMarketPriceByGtin } from "../../../../_lib/ebay-client.js";
import { json, methodNotAllowed } from "../../../../_lib/http.js";

async function settings(db) {
  const result = await db.prepare("SELECT setting_key, setting_value FROM marketplace_settings").all();
  return Object.fromEntries((result.results || []).map((row) => [row.setting_key, row.setting_value]));
}

export async function onRequest(context) {
  if (context.request.method !== "POST") return methodNotAllowed(["POST"]);
  const denied = requireEbayWrite(context);
  if (denied) return denied;
  if (!bigBuyConfigured(context.env)) {
    return json({ ok: false, error: "bigbuy_api_not_configured" }, { status: 409 });
  }
  const jobId = crypto.randomUUID();
  const now = Date.now();
  await context.env.CONTROL_DB.prepare(
    "INSERT INTO marketplace_sync_jobs (id, job_type, status, started_at, requested_by) VALUES (?, 'bigbuy_opportunity_scan', 'running', ?, ?)",
  ).bind(jobId, now, context.data.session.user.username).run();

  try {
    const config = await settings(context.env.CONTROL_DB);
    const products = (await loadBigBuyCataloguePage(context.env, 0, 50))
      .filter((product) => product.active && product.stock > 0 && product.wholesaleCents > 0 && product.ean)
      .slice(0, 20);
    let appToken = null;
    if (context.env.EBAY_CLIENT_ID && context.env.EBAY_CLIENT_SECRET) {
      try { appToken = await ebayApplicationAccessToken(context.env); } catch { appToken = null; }
    }
    const shippingCents = Number(config.default_shipping_cents || 495);
    const feeBps = Number(config.estimated_fee_basis_points || 1350);
    const minimumProfit = Number(config.minimum_profit_cents || 500);
    const minimumRoi = Number(config.minimum_roi_basis_points || 2000);
    const statements = [];
    let opportunityCount = 0;

    for (const product of products) {
      let market = null;
      if (appToken) {
        try { market = await ebayMarketPriceByGtin(context.env, product.ean, appToken); } catch { market = null; }
      }
      const saleCents = market?.medianCents || product.recommendedCents;
      if (!saleCents) continue;
      const feeCents = Math.round(saleCents * feeBps / 10_000);
      const profitCents = saleCents - product.wholesaleCents - shippingCents - feeCents;
      const invested = product.wholesaleCents + shippingCents;
      const roiBps = invested > 0 ? Math.round(profitCents * 10_000 / invested) : 0;
      if (profitCents < minimumProfit || roiBps < minimumRoi) continue;
      opportunityCount += 1;
      const id = `bigbuy-${product.id}`;
      statements.push(context.env.CONTROL_DB.prepare(
        `INSERT INTO ebay_opportunities
          (id, provider_id, supplier_sku, ean, title, category, supplier_cost_cents, shipping_cost_cents,
           estimated_sale_cents, estimated_fee_cents, estimated_profit_cents, roi_basis_points, match_confidence,
           stock_quantity, status, created_at, updated_at, data_source, source_reference, verified_at)
         VALUES (?, 'provider-bigbuy-demo', ?, ?, ?, 'BigBuy catalogue', ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, 'bigbuy_api', ?, ?)
         ON CONFLICT(id) DO UPDATE SET title=excluded.title, supplier_cost_cents=excluded.supplier_cost_cents,
           shipping_cost_cents=excluded.shipping_cost_cents, estimated_sale_cents=excluded.estimated_sale_cents,
           estimated_fee_cents=excluded.estimated_fee_cents, estimated_profit_cents=excluded.estimated_profit_cents,
           roi_basis_points=excluded.roi_basis_points, match_confidence=excluded.match_confidence,
           stock_quantity=excluded.stock_quantity, updated_at=excluded.updated_at, data_source=excluded.data_source,
           source_reference=excluded.source_reference, verified_at=excluded.verified_at`,
      ).bind(
        id, product.sku, product.ean, product.title, product.wholesaleCents, shippingCents, saleCents, feeCents,
        profitCents, roiBps, market ? Math.min(99, 88 + Math.min(10, market.sampleSize)) : 70, product.stock, now, Date.now(),
        `BigBuy SKU ${product.sku}`, Date.now(),
      ));
      statements.push(context.env.CONTROL_DB.prepare(
        "UPDATE ebay_listings SET quantity = ?, monitored_at = ? WHERE opportunity_id = ? AND listing_status IN ('ready_to_publish', 'active')",
      ).bind(product.stock, Date.now(), id));
    }
    statements.push(
      context.env.CONTROL_DB.prepare("UPDATE ebay_providers SET connection_status = 'connected', stock_sync_at = ?, price_sync_at = ?, notes = ? WHERE id = 'provider-bigbuy-demo'").bind(Date.now(), Date.now(), `BigBuy API scan succeeded; ${products.length} eligible products sampled.`),
      context.env.CONTROL_DB.prepare("UPDATE ebay_credentials SET connection_status = 'connected', last_checked_at = ?, detail = 'BigBuy Bearer API configured.' WHERE service = 'supplier_catalogue'").bind(Date.now()),
      context.env.CONTROL_DB.prepare("UPDATE marketplace_sync_jobs SET status = 'succeeded', completed_at = ?, scanned_count = ?, opportunity_count = ? WHERE id = ?").bind(Date.now(), products.length, opportunityCount, jobId),
    );
    await context.env.CONTROL_DB.batch(statements);
    return json({ ok: true, jobId, scannedCount: products.length, opportunityCount });
  } catch (error) {
    await context.env.CONTROL_DB.prepare(
      "UPDATE marketplace_sync_jobs SET status = 'failed', completed_at = ?, error_code = ? WHERE id = ?",
    ).bind(Date.now(), String(error.message || "sync_failed").slice(0, 120), jobId).run();
    return json({ ok: false, error: String(error.message || "sync_failed") }, { status: 502 });
  }
}
