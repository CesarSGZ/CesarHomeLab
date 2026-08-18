import { requireEbayWrite } from "../../../../_lib/ebay.js";
import { ebayApi } from "../../../../_lib/ebay-client.js";
import { json, methodNotAllowed } from "../../../../_lib/http.js";
import { ensureRealMarketplaceSchema } from "../../../../_lib/marketplace-schema.js";

function orderStatus(order) {
  if (order.cancelStatus?.cancelState && order.cancelStatus.cancelState !== "NONE_REQUESTED") return "cancelled";
  if (order.orderFulfillmentStatus === "FULFILLED") return "shipped";
  if (order.orderFulfillmentStatus === "IN_PROGRESS") return "processing";
  return order.orderPaymentStatus === "PAID" ? "paid" : "processing";
}

function amountCents(amount) {
  return Math.round(Number(amount?.value || 0) * 100);
}

async function orderEarnings(env, orderId) {
  try {
    const data = await ebayApi(env, `/sell/finances/v1/order_earnings/${encodeURIComponent(orderId)}`);
    const summary = data?.orderEarningsSummary;
    if (!summary?.grossAmount || !summary?.expenses || !summary?.orderEarnings) return null;
    return {
      saleCents: amountCents(summary.grossAmount),
      feeCents: amountCents(summary.expenses),
      earningsCents: amountCents(summary.orderEarnings),
      refundCents: amountCents(summary.refunds),
    };
  } catch {
    // Earnings can lag behind checkout. The order remains visible but is kept
    // out of realised P&L until a later sync returns the financial breakdown.
    return null;
  }
}

export async function onRequest(context) {
  if (context.request.method !== "POST") return methodNotAllowed(["POST"]);
  const denied = requireEbayWrite(context);
  if (denied) return denied;
  await ensureRealMarketplaceSchema(context.env.CONTROL_DB);
  const credential = await context.env.CONTROL_DB.prepare("SELECT connection_status FROM ebay_credentials WHERE service = 'ebay_sell_api'").first();
  if (credential?.connection_status !== "connected") return json({ ok: false, error: "ebay_not_connected" }, { status: 409 });

  try {
    const data = await ebayApi(context.env, "/sell/fulfillment/v1/order?limit=50");
    let imported = 0;
    let reconciled = 0;
    for (const order of data?.orders || []) {
      const line = order.lineItems?.[0] || {};
      const listing = line.sku
        ? await context.env.CONTROL_DB.prepare(
            "SELECT l.id, o.supplier_cost_cents, o.shipping_cost_cents FROM ebay_listings l JOIN ebay_opportunities o ON o.id = l.opportunity_id WHERE l.sku = ?",
          ).bind(line.sku).first()
        : null;
      const earnings = await orderEarnings(context.env, order.orderId);
      const saleCents = earnings?.saleCents ?? amountCents(order.pricingSummary?.total);
      const feeCents = earnings?.feeCents ?? 0;
      if (earnings) reconciled += 1;
      await context.env.CONTROL_DB.prepare(
        `INSERT INTO ebay_orders
          (id, listing_id, buyer_label, order_status, sale_cents, fee_cents, product_cost_cents, shipping_cost_cents,
           ordered_at, data_source, financial_status, ebay_earnings_cents, refund_cents, last_synced_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ebay_fulfillment_api', ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET order_status=excluded.order_status, sale_cents=excluded.sale_cents,
           fee_cents=CASE WHEN excluded.financial_status='reconciled' THEN excluded.fee_cents ELSE ebay_orders.fee_cents END,
           financial_status=CASE WHEN excluded.financial_status='reconciled' THEN 'reconciled' ELSE ebay_orders.financial_status END,
           ebay_earnings_cents=COALESCE(excluded.ebay_earnings_cents, ebay_orders.ebay_earnings_cents),
           refund_cents=CASE WHEN excluded.financial_status='reconciled' THEN excluded.refund_cents ELSE ebay_orders.refund_cents END,
           listing_id=COALESCE(excluded.listing_id, ebay_orders.listing_id), last_synced_at=excluded.last_synced_at`,
      ).bind(
        order.orderId,
        listing?.id || null,
        `Buyer · ${String(order.orderId).slice(-6)}`,
        orderStatus(order),
        saleCents,
        feeCents,
        Number(listing?.supplier_cost_cents || 0),
        Number(listing?.shipping_cost_cents || 0),
        Date.parse(order.creationDate) || Date.now(),
        earnings ? "reconciled" : "pending",
        earnings?.earningsCents ?? null,
        earnings?.refundCents ?? 0,
        Date.now(),
      ).run();
      imported += 1;
    }
    await context.env.CONTROL_DB.prepare(
      "UPDATE ebay_credentials SET connection_status = 'connected', last_checked_at = ?, detail = ? WHERE service = 'order_fulfilment'",
    ).bind(Date.now(), `eBay Fulfillment API checked; ${imported} orders imported, ${reconciled} reconciled with Finances.`).run();
    return json({ ok: true, imported, reconciled });
  } catch (error) {
    return json({ ok: false, error: "order_sync_failed", detail: String(error.message || "order_sync_failed") }, { status: 502 });
  }
}
