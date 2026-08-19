import { requireEbayWrite } from "../../../_lib/ebay.js";
import { encryptSecret } from "../../../_lib/crypto-store.js";
import { json, methodNotAllowed, readJson } from "../../../_lib/http.js";
import { ensureRealMarketplaceSchema } from "../../../_lib/marketplace-schema.js";

function text(value, max) { return String(value || "").trim().slice(0, max); }

export async function onRequest(context) {
  if (context.request.method !== "POST") return methodNotAllowed(["POST"]);
  const denied = requireEbayWrite(context);
  if (denied) return denied;
  if (!context.env.TOKEN_ENCRYPTION_SECRET) return json({ ok: false, error: "token_encryption_not_configured" }, { status: 409 });
  await ensureRealMarketplaceSchema(context.env.CONTROL_DB);
  let body;
  try { body = await readJson(context.request); } catch { return json({ ok: false, error: "invalid_request" }, { status: 400 }); }
  const clientId = text(body.clientId, 256);
  const clientSecret = text(body.clientSecret, 512);
  const ruName = text(body.ruName, 256);
  if (!clientId || !clientSecret || !ruName) return json({ ok: false, error: "client_id_secret_runame_required" }, { status: 400 });
  const encrypted = await encryptSecret(clientSecret, context.env.TOKEN_ENCRYPTION_SECRET);
  const now = Date.now();
  await context.env.CONTROL_DB.prepare(
    `INSERT INTO marketplace_app_credentials (service, client_id, client_secret_cipher, client_secret_iv, redirect_uri_name, environment, updated_at, updated_by)
     VALUES ('ebay', ?, ?, ?, ?, 'production', ?, ?)
     ON CONFLICT(service) DO UPDATE SET client_id=excluded.client_id, client_secret_cipher=excluded.client_secret_cipher,
       client_secret_iv=excluded.client_secret_iv, redirect_uri_name=excluded.redirect_uri_name,
       environment=excluded.environment, updated_at=excluded.updated_at, updated_by=excluded.updated_by`,
  ).bind(clientId, encrypted.cipher, encrypted.iv, ruName, now, context.data.session.user.username).run();
  await context.env.CONTROL_DB.prepare("UPDATE ebay_credentials SET connection_status = 'not_connected', last_checked_at = ?, detail = ? WHERE service = 'ebay_sell_api'")
    .bind(now, "Production application configured. Seller OAuth consent is the next step.").run();
  return json({ ok: true, environment: "production", clientIdSuffix: clientId.slice(-8), updatedAt: now });
}
