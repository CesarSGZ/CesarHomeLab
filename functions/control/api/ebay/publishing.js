import { requireEbayWrite } from "../../../_lib/ebay.js";
import { json, methodNotAllowed, readJson } from "../../../_lib/http.js";
import { ensureRealMarketplaceSchema } from "../../../_lib/marketplace-schema.js";

export async function onRequest(context) {
  if (context.request.method !== "POST") return methodNotAllowed(["POST"]);
  const denied = requireEbayWrite(context);
  if (denied) return denied;
  await ensureRealMarketplaceSchema(context.env.CONTROL_DB);
  let body;
  try { body = await readJson(context.request); } catch { return json({ ok: false, error: "invalid_request" }, { status: 400 }); }
  const enabled = body.enabled === true;
  if (enabled) {
    const token = await context.env.CONTROL_DB.prepare("SELECT service FROM marketplace_tokens WHERE service = 'ebay'").first();
    if (!token) return json({ ok: false, error: "ebay_not_connected" }, { status: 409 });
  }
  const now = Date.now();
  await context.env.CONTROL_DB.prepare(
    "INSERT INTO marketplace_settings (setting_key, setting_value, updated_at, updated_by) VALUES ('live_publish_enabled', ?, ?, ?) ON CONFLICT(setting_key) DO UPDATE SET setting_value=excluded.setting_value, updated_at=excluded.updated_at, updated_by=excluded.updated_by",
  ).bind(enabled ? "true" : "false", now, context.data.session.user.username).run();
  return json({ ok: true, enabled });
}
