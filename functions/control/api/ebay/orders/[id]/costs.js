import { requireEbayWrite } from "../../../../../_lib/ebay.js";
import { json, methodNotAllowed } from "../../../../../_lib/http.js";
import { ensureRealMarketplaceSchema } from "../../../../../_lib/marketplace-schema.js";

function cents(value) {
  const amount = Number(String(value ?? "").trim().replace(",", "."));
  return Number.isFinite(amount) ? Math.round(amount * 100) : NaN;
}

export async function onRequest(context) {
  if (context.request.method !== "POST") return methodNotAllowed(["POST"]);
  const denied = requireEbayWrite(context);
  if (denied) return denied;
  await ensureRealMarketplaceSchema(context.env.CONTROL_DB);

  let body;
  try { body = await context.request.json(); } catch { return json({ ok: false, error: "invalid_json" }, { status: 400 }); }
  const productCostCents = cents(body?.productCost);
  const shippingCostCents = cents(body?.shippingCost);
  if (!Number.isFinite(productCostCents) || productCostCents < 0 || !Number.isFinite(shippingCostCents) || shippingCostCents < 0) {
    return json({ ok: false, error: "valid_costs_required" }, { status: 400 });
  }

  const orderId = String(context.params.id || "");
  const existing = await context.env.CONTROL_DB.prepare("SELECT id FROM ebay_orders WHERE id = ?").bind(orderId).first();
  if (!existing) return json({ ok: false, error: "order_not_found" }, { status: 404 });
  const now = Date.now();
  await context.env.CONTROL_DB.batch([
    context.env.CONTROL_DB.prepare(
      "UPDATE ebay_orders SET product_cost_cents = ?, shipping_cost_cents = ?, costs_confirmed_at = ? WHERE id = ?",
    ).bind(productCostCents, shippingCostCents, now, orderId),
    context.env.CONTROL_DB.prepare(
      "INSERT INTO ebay_activity_log (id, entity_type, entity_id, action, actor, created_at, detail) VALUES (?, 'order', ?, 'actual_costs_confirmed', ?, ?, ?)",
    ).bind(crypto.randomUUID(), orderId, context.data.session.user.username, now, `Supplier €${(productCostCents / 100).toFixed(2)}; delivery €${(shippingCostCents / 100).toFixed(2)}.`),
  ]);
  return json({ ok: true, orderId, productCostCents, shippingCostCents });
}
