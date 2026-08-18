import { requireEbayWrite } from "../../../../_lib/ebay.js";
import { json, methodNotAllowed } from "../../../../_lib/http.js";
import { ensureRealMarketplaceSchema } from "../../../../_lib/marketplace-schema.js";

function euroCents(value) {
  const normalized = String(value ?? "").trim().replace(/\s/g, "").replace(",", ".");
  const amount = Number(normalized);
  return Number.isFinite(amount) ? Math.round(amount * 100) : NaN;
}

function safeText(value, maximum) {
  return String(value ?? "").trim().slice(0, maximum);
}

function stableProductId(sku) {
  const slug = String(sku).toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 72);
  return `bigbuy-manual-${slug}`;
}

async function marketplaceSettings(db) {
  const result = await db.prepare("SELECT setting_key, setting_value FROM marketplace_settings").all();
  return Object.fromEntries((result.results || []).map((row) => [row.setting_key, row.setting_value]));
}

export async function onRequest(context) {
  if (context.request.method !== "POST") return methodNotAllowed(["POST"]);
  const denied = requireEbayWrite(context);
  if (denied) return denied;
  await ensureRealMarketplaceSchema(context.env.CONTROL_DB);

  let body;
  try { body = await context.request.json(); } catch { return json({ ok: false, error: "invalid_json" }, { status: 400 }); }
  const rows = Array.isArray(body?.products) ? body.products.slice(0, 250) : [];
  if (!rows.length) return json({ ok: false, error: "products_required" }, { status: 400 });

  const config = await marketplaceSettings(context.env.CONTROL_DB);
  const defaultShippingCents = Number(config.default_shipping_cents || 495);
  const feeBasisPoints = Number(config.estimated_fee_basis_points || 1350);
  const now = Date.now();
  const statements = [];
  const errors = [];
  let imported = 0;

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index] || {};
    const sku = safeText(row.sku, 100);
    const title = safeText(row.title, 160);
    const ean = safeText(row.ean, 32).replace(/\s/g, "");
    const supplierCostCents = euroCents(row.cost);
    const saleCents = euroCents(row.salePrice);
    const shippingCents = row.shipping === "" || row.shipping == null ? defaultShippingCents : euroCents(row.shipping);
    const stock = Math.max(0, Math.min(1_000_000, Math.floor(Number(row.stock) || 0)));
    if (!sku || !title || !Number.isFinite(supplierCostCents) || supplierCostCents <= 0 || !Number.isFinite(saleCents) || saleCents <= 0 || !Number.isFinite(shippingCents) || shippingCents < 0) {
      errors.push({ row: index + 1, error: "sku_title_cost_sale_required" });
      continue;
    }
    const feeCents = Math.round(saleCents * feeBasisPoints / 10_000);
    const profitCents = saleCents - supplierCostCents - shippingCents - feeCents;
    const investedCents = supplierCostCents + shippingCents;
    const roiBasisPoints = investedCents > 0 ? Math.round(profitCents * 10_000 / investedCents) : 0;
    const id = stableProductId(sku);
    statements.push(context.env.CONTROL_DB.prepare(
      `INSERT INTO ebay_opportunities
        (id, provider_id, supplier_sku, ean, title, brand, category, supplier_cost_cents, shipping_cost_cents,
         estimated_sale_cents, estimated_fee_cents, estimated_profit_cents, roi_basis_points, match_confidence,
         stock_quantity, status, created_at, updated_at, data_source, source_reference, verified_at)
       VALUES (?, 'provider-bigbuy-demo', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, 'bigbuy_manual', ?, ?)
       ON CONFLICT(id) DO UPDATE SET ean=excluded.ean, title=excluded.title, brand=excluded.brand,
         category=excluded.category, supplier_cost_cents=excluded.supplier_cost_cents,
         shipping_cost_cents=excluded.shipping_cost_cents, estimated_sale_cents=excluded.estimated_sale_cents,
         estimated_fee_cents=excluded.estimated_fee_cents, estimated_profit_cents=excluded.estimated_profit_cents,
         roi_basis_points=excluded.roi_basis_points, match_confidence=excluded.match_confidence,
         stock_quantity=excluded.stock_quantity, status='pending', updated_at=excluded.updated_at,
         data_source=excluded.data_source, source_reference=excluded.source_reference, verified_at=excluded.verified_at`,
    ).bind(
      id, sku, ean || null, title, safeText(row.brand, 100) || null, safeText(row.category, 100) || "BigBuy manual import",
      supplierCostCents, shippingCents, saleCents, feeCents, profitCents, roiBasisPoints, ean ? 80 : 55, stock, now, now,
      `BigBuy SKU ${sku}`, now,
    ));
    statements.push(context.env.CONTROL_DB.prepare(
      "UPDATE ebay_listings SET quantity = ?, monitored_at = ? WHERE opportunity_id = ? AND listing_status IN ('ready_to_publish', 'active')",
    ).bind(stock, now, id));
    imported += 1;
  }

  if (!imported) return json({ ok: false, error: "no_valid_products", errors }, { status: 400 });
  const jobId = crypto.randomUUID();
  statements.push(
    context.env.CONTROL_DB.prepare(
      "INSERT INTO marketplace_sync_jobs (id, job_type, status, started_at, completed_at, requested_by, scanned_count, opportunity_count) VALUES (?, 'bigbuy_manual_import', 'succeeded', ?, ?, ?, ?, ?)",
    ).bind(jobId, now, now, context.data.session.user.username, rows.length, imported),
    context.env.CONTROL_DB.prepare(
      "UPDATE ebay_providers SET connection_status = 'connected', stock_sync_at = ?, price_sync_at = ?, notes = ? WHERE id = 'provider-bigbuy-demo'",
    ).bind(now, now, "BigBuy free-account mode: product data is imported manually; API and supplier ordering remain disabled."),
    context.env.CONTROL_DB.prepare(
      "UPDATE ebay_credentials SET connection_status = 'not_connected', last_checked_at = ?, detail = ? WHERE service = 'supplier_catalogue'",
    ).bind(now, "Manual BigBuy import is active. No paid API pack is configured."),
    context.env.CONTROL_DB.prepare(
      "INSERT INTO ebay_activity_log (id, entity_type, entity_id, action, actor, created_at, detail) VALUES (?, 'provider', 'provider-bigbuy-demo', 'manual_import', ?, ?, ?)",
    ).bind(crypto.randomUUID(), context.data.session.user.username, now, `${imported} BigBuy products imported without API access.`),
  );
  await context.env.CONTROL_DB.batch(statements);
  return json({ ok: true, jobId, imported, skipped: rows.length - imported, errors });
}
