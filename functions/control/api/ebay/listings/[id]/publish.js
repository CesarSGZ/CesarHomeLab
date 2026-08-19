import { requireEbayWrite } from "../../../../../_lib/ebay.js";
import { publishEbayOffer } from "../../../../../_lib/ebay-client.js";
import { json, methodNotAllowed } from "../../../../../_lib/http.js";

export async function onRequest(context) {
  if (context.request.method !== "POST") return methodNotAllowed(["POST"]);
  const denied = requireEbayWrite(context);
  if (denied) return denied;
  const connected = await context.env.CONTROL_DB.prepare("SELECT connection_status FROM ebay_credentials WHERE service = 'ebay_sell_api'").first();
  if (connected?.connection_status !== "connected") {
    return json({ ok: false, error: "ebay_credentials_not_connected", detail: "Publishing is intentionally blocked until the eBay Sell API OAuth connection is configured." }, { status: 409 });
  }
  const settingsResult = await context.env.CONTROL_DB.prepare("SELECT setting_key, setting_value FROM marketplace_settings").all();
  const config = Object.fromEntries((settingsResult.results || []).map((row) => [row.setting_key, row.setting_value]));
  if (config.live_publish_enabled !== "true") {
    return json({ ok: false, error: "live_publishing_disabled", detail: "Seller identity, payouts, business policies and the explicit live-publishing switch must all be verified first." }, { status: 409 });
  }
  const id = String(context.params.id || "");
  const listing = await context.env.CONTROL_DB.prepare("SELECT * FROM ebay_listings WHERE id = ?").bind(id).first();
  if (!listing) return json({ ok: false, error: "listing_not_found" }, { status: 404 });
  if (listing.listing_status !== "ready_to_publish") return json({ ok: false, error: "listing_not_ready" }, { status: 409 });
  const opportunity = await context.env.CONTROL_DB.prepare("SELECT * FROM ebay_opportunities WHERE id = ?").bind(listing.opportunity_id).first();
  if (!opportunity) return json({ ok: false, error: "opportunity_not_found" }, { status: 404 });
  if (/refurb|reacond/i.test(opportunity.title) && String(opportunity.condition_code || "NEW") === "NEW") {
    return json({ ok: false, error: "condition_review_required", detail: "A refurbished product cannot be published as NEW. Re-import it with the exact eBay condition." }, { status: 409 });
  }
  if (!opportunity.ean && !opportunity.image_urls) {
    return json({ ok: false, error: "product_media_required", detail: "Add an EAN or at least one HTTPS product image before publishing." }, { status: 409 });
  }
  try {
    const published = await publishEbayOffer(context.env, listing, opportunity, config);
    const now = Date.now();
    await context.env.CONTROL_DB.batch([
      context.env.CONTROL_DB.prepare("UPDATE ebay_listings SET listing_status = 'active', external_offer_id = ?, external_listing_id = ?, published_at = ?, monitored_at = ?, publish_error = NULL WHERE id = ?").bind(published.offerId, published.listingId, now, now, id),
      context.env.CONTROL_DB.prepare("UPDATE ebay_opportunities SET status = 'listed', updated_at = ? WHERE id = ?").bind(now, listing.opportunity_id),
      context.env.CONTROL_DB.prepare("INSERT INTO ebay_activity_log (id, entity_type, entity_id, action, actor, created_at, detail) VALUES (?, 'listing', ?, 'published', ?, ?, ?)").bind(crypto.randomUUID(), id, context.data.session.user.username, now, `eBay listing ${published.listingId}`),
    ]);
    return json({ ok: true, listingId: published.listingId, offerId: published.offerId });
  } catch (error) {
    await context.env.CONTROL_DB.prepare("UPDATE ebay_listings SET publish_error = ? WHERE id = ?").bind(String(error.message || "publish_failed").slice(0, 240), id).run();
    return json({ ok: false, error: "ebay_publish_failed", detail: String(error.message || "publish_failed") }, { status: 502 });
  }
}
