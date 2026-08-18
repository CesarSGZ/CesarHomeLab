import { requireEbayWrite } from "../../../../_lib/ebay.js";
import { json, methodNotAllowed, readJson } from "../../../../_lib/http.js";

function makeSku(opportunity) {
  return `CSG-${String(opportunity.supplier_sku).replace(/[^a-z0-9]/gi, "").slice(-8).toUpperCase()}`;
}

export async function onRequest(context) {
  if (context.request.method !== "POST") return methodNotAllowed(["POST"]);
  const denied = requireEbayWrite(context);
  if (denied) return denied;
  let body;
  try { body = await readJson(context.request); } catch { return json({ ok: false, error: "invalid_request" }, { status: 400 }); }
  const opportunityId = String(body.opportunityId || "");
  const opportunity = await context.env.CONTROL_DB.prepare("SELECT * FROM ebay_opportunities WHERE id = ?").bind(opportunityId).first();
  if (!opportunity) return json({ ok: false, error: "opportunity_not_found" }, { status: 404 });
  if (opportunity.status !== "approved") return json({ ok: false, error: "approval_required" }, { status: 409 });
  const existing = await context.env.CONTROL_DB.prepare("SELECT id FROM ebay_listings WHERE opportunity_id = ?").bind(opportunityId).first();
  if (existing) return json({ ok: true, listing: existing, duplicate: true }, { status: 200 });
  const id = crypto.randomUUID();
  const now = Date.now();
  const price = Math.max(Number(opportunity.estimated_sale_cents), Number(opportunity.supplier_cost_cents) + Number(opportunity.shipping_cost_cents) + Number(opportunity.estimated_fee_cents) + 100);
  const sku = makeSku(opportunity);
  await context.env.CONTROL_DB.batch([
    context.env.CONTROL_DB.prepare("INSERT INTO ebay_listings (id, opportunity_id, title, sku, price_cents, quantity, listing_status, generated_at, monitored_at) VALUES (?, ?, ?, ?, ?, ?, 'ready_to_publish', ?, ?)").bind(id, opportunityId, opportunity.title, sku, price, Math.max(0, Number(opportunity.stock_quantity) || 0), now, now),
    context.env.CONTROL_DB.prepare("UPDATE ebay_opportunities SET status = 'drafted', updated_at = ? WHERE id = ?").bind(now, opportunityId),
    context.env.CONTROL_DB.prepare("INSERT INTO ebay_activity_log (id, entity_type, entity_id, action, actor, created_at, detail) VALUES (?, 'listing', ?, 'draft_generated', ?, ?, ?)").bind(crypto.randomUUID(), id, context.data.session.user.username, now, "Draft prepared locally; no eBay API call made."),
  ]);
  return json({ ok: true, listing: { id, sku, status: "ready_to_publish" } }, { status: 201 });
}
