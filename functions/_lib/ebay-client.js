import { decryptSecret, encryptSecret } from "./crypto-store.js";

export const EBAY_USER_SCOPES = [
  "https://api.ebay.com/oauth/api_scope",
  "https://api.ebay.com/oauth/api_scope/sell.account",
  "https://api.ebay.com/oauth/api_scope/sell.inventory",
  "https://api.ebay.com/oauth/api_scope/sell.fulfillment",
  "https://api.ebay.com/oauth/api_scope/sell.finances",
];

const TOKEN_ENDPOINT = "https://api.ebay.com/identity/v1/oauth2/token";
const API_BASE = "https://api.ebay.com";

export async function ebayAppConfig(env) {
  if (env.EBAY_CLIENT_ID && env.EBAY_CLIENT_SECRET && env.EBAY_RUNAME) {
    return { clientId: env.EBAY_CLIENT_ID, clientSecret: env.EBAY_CLIENT_SECRET, ruName: env.EBAY_RUNAME, source: "environment" };
  }
  const row = await env.CONTROL_DB.prepare("SELECT client_id, client_secret_cipher, client_secret_iv, redirect_uri_name FROM marketplace_app_credentials WHERE service = 'ebay'").first();
  if (!row || !env.TOKEN_ENCRYPTION_SECRET) throw new Error("ebay_app_not_configured");
  return {
    clientId: row.client_id,
    clientSecret: await decryptSecret(row.client_secret_cipher, row.client_secret_iv, env.TOKEN_ENCRYPTION_SECRET),
    ruName: row.redirect_uri_name,
    source: "encrypted_database",
  };
}

async function basicCredentials(env) {
  const config = await ebayAppConfig(env);
  return `Basic ${btoa(`${config.clientId}:${config.clientSecret}`)}`;
}

async function tokenRequest(env, body) {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      authorization: await basicCredentials(env),
      "content-type": "application/x-www-form-urlencoded",
      accept: "application/json",
    },
    body: new URLSearchParams(body),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error_description || data.error || "ebay_token_exchange_failed");
  return data;
}

export async function ebayAuthorizeUrl(env, state) {
  const config = await ebayAppConfig(env);
  const url = new URL("https://auth.ebay.com/oauth2/authorize");
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", config.ruName);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", EBAY_USER_SCOPES.join(" "));
  url.searchParams.set("state", state);
  url.searchParams.set("locale", "es-ES");
  return url.toString();
}

export async function exchangeEbayAuthorizationCode(env, code) {
  const config = await ebayAppConfig(env);
  return tokenRequest(env, {
    grant_type: "authorization_code",
    code,
    redirect_uri: config.ruName,
  });
}

export async function storeEbayTokens(env, tokens) {
  const now = Date.now();
  const access = await encryptSecret(tokens.access_token, env.TOKEN_ENCRYPTION_SECRET);
  const refresh = tokens.refresh_token
    ? await encryptSecret(tokens.refresh_token, env.TOKEN_ENCRYPTION_SECRET)
    : null;
  await env.CONTROL_DB.prepare(
    `INSERT INTO marketplace_tokens
      (service, access_cipher, access_iv, refresh_cipher, refresh_iv, access_expires_at, refresh_expires_at, scopes, updated_at)
     VALUES ('ebay', ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(service) DO UPDATE SET access_cipher=excluded.access_cipher, access_iv=excluded.access_iv,
       refresh_cipher=COALESCE(excluded.refresh_cipher, marketplace_tokens.refresh_cipher),
       refresh_iv=COALESCE(excluded.refresh_iv, marketplace_tokens.refresh_iv),
       access_expires_at=excluded.access_expires_at,
       refresh_expires_at=COALESCE(excluded.refresh_expires_at, marketplace_tokens.refresh_expires_at),
       scopes=excluded.scopes, updated_at=excluded.updated_at`,
  ).bind(
    access.cipher,
    access.iv,
    refresh?.cipher || null,
    refresh?.iv || null,
    now + Number(tokens.expires_in || 7200) * 1000,
    tokens.refresh_token_expires_in ? now + Number(tokens.refresh_token_expires_in) * 1000 : null,
    tokens.scope || EBAY_USER_SCOPES.join(" "),
    now,
  ).run();
}

async function storedEbayToken(env) {
  return env.CONTROL_DB.prepare("SELECT * FROM marketplace_tokens WHERE service = 'ebay'").first();
}

export async function ebayUserAccessToken(env) {
  const row = await storedEbayToken(env);
  if (!row) throw new Error("ebay_not_connected");
  if (Number(row.access_expires_at) > Date.now() + 60_000) {
    return decryptSecret(row.access_cipher, row.access_iv, env.TOKEN_ENCRYPTION_SECRET);
  }
  if (!row.refresh_cipher || !row.refresh_iv) throw new Error("ebay_reauthorization_required");
  const refreshToken = await decryptSecret(row.refresh_cipher, row.refresh_iv, env.TOKEN_ENCRYPTION_SECRET);
  const refreshed = await tokenRequest(env, {
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    scope: row.scopes || EBAY_USER_SCOPES.join(" "),
  });
  await storeEbayTokens(env, refreshed);
  return refreshed.access_token;
}

export async function ebayApplicationAccessToken(env) {
  const token = await tokenRequest(env, {
    grant_type: "client_credentials",
    scope: "https://api.ebay.com/oauth/api_scope",
  });
  return token.access_token;
}

export async function ebayApi(env, path, { method = "GET", body, userToken = true, marketplace = "EBAY_ES", token: suppliedToken } = {}) {
  const token = suppliedToken || (userToken ? await ebayUserAccessToken(env) : await ebayApplicationAccessToken(env));
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      accept: "application/json",
      "content-type": "application/json",
      "content-language": "es-ES",
      "x-ebay-c-marketplace-id": marketplace,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const message = data?.errors?.[0]?.message || data?.error_description || `ebay_api_${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

export async function ebayMarketPriceByGtin(env, gtin, applicationToken) {
  if (!gtin) return null;
  // GTIN is a first-class Browse search parameter. A free-text query can pull
  // loosely related titles and distort the opportunity calculation.
  const query = new URLSearchParams({ gtin, limit: "20", filter: "buyingOptions:{FIXED_PRICE},deliveryCountry:ES" });
  const data = await ebayApi(env, `/buy/browse/v1/item_summary/search?${query}`, { userToken: false, token: applicationToken });
  const prices = (data?.itemSummaries || [])
    .map((item) => Number(item.price?.value))
    .filter((value) => Number.isFinite(value) && value > 0)
    .sort((a, b) => a - b);
  if (!prices.length) return null;
  const middle = Math.floor(prices.length / 2);
  return { medianCents: Math.round((prices.length % 2 ? prices[middle] : (prices[middle - 1] + prices[middle]) / 2) * 100), sampleSize: prices.length };
}

async function firstSellerPolicy(env, type, marketplace = "EBAY_ES") {
  const data = await ebayApi(env, `/sell/account/v1/${type}?marketplace_id=${marketplace}`);
  const collectionName = {
    fulfillment_policy: "fulfillmentPolicies",
    payment_policy: "paymentPolicies",
    return_policy: "returnPolicies",
  }[type];
  const policy = data?.[collectionName]?.find((item) => item.marketplaceId === marketplace) || data?.[collectionName]?.[0];
  if (!policy) throw new Error(`missing_${type}`);
  return policy[`${type.replace("_policy", "")}PolicyId`];
}

export async function ebaySellerPolicies(env, marketplace = "EBAY_ES") {
  const [fulfillmentPolicyId, paymentPolicyId, returnPolicyId] = await Promise.all([
    firstSellerPolicy(env, "fulfillment_policy", marketplace),
    firstSellerPolicy(env, "payment_policy", marketplace),
    firstSellerPolicy(env, "return_policy", marketplace),
  ]);
  return { fulfillmentPolicyId, paymentPolicyId, returnPolicyId };
}

export async function ebayCategorySuggestion(env, title, marketplace = "EBAY_ES") {
  const token = await ebayApplicationAccessToken(env);
  let treeId = env.EBAY_CATEGORY_TREE_ID;
  if (!treeId) {
    const tree = await ebayApi(env, `/commerce/taxonomy/v1/get_default_category_tree_id?marketplace_id=${encodeURIComponent(marketplace)}`, { userToken: false, token, marketplace });
    treeId = tree?.categoryTreeId;
  }
  if (!treeId) throw new Error("ebay_category_tree_not_found");
  const query = new URLSearchParams({ q: title });
  const data = await ebayApi(env, `/commerce/taxonomy/v1/category_tree/${treeId}/get_category_suggestions?${query}`, { userToken: false, token, marketplace });
  const categoryId = data?.categorySuggestions?.[0]?.category?.categoryId;
  if (!categoryId) throw new Error("ebay_category_not_found");
  return categoryId;
}

export async function ensureEbayInventoryLocation(env, merchantLocationKey) {
  try {
    return await ebayApi(env, `/sell/inventory/v1/location/${encodeURIComponent(merchantLocationKey)}`);
  } catch (error) {
    if (error.status !== 404) throw error;
  }
  const required = ["EBAY_ADDRESS_LINE1", "EBAY_CITY", "EBAY_POSTAL_CODE"];
  if (required.some((key) => !env[key])) throw new Error("inventory_address_not_configured");
  await ebayApi(env, `/sell/inventory/v1/location/${encodeURIComponent(merchantLocationKey)}`, {
    method: "POST",
    body: {
      location: {
        address: {
          addressLine1: env.EBAY_ADDRESS_LINE1,
          addressLine2: env.EBAY_ADDRESS_LINE2 || undefined,
          city: env.EBAY_CITY,
          stateOrProvince: env.EBAY_PROVINCE || undefined,
          postalCode: env.EBAY_POSTAL_CODE,
          country: "ES",
        },
      },
      locationInstructions: "Fulfilled by an approved wholesale supplier.",
      locationTypes: ["WAREHOUSE"],
      merchantLocationStatus: "ENABLED",
      name: "CSG BigBuy fulfilment",
    },
  });
}

export async function publishEbayOffer(env, listing, opportunity, config) {
  const marketplace = config.marketplace_id || "EBAY_ES";
  const merchantLocationKey = config.inventory_location_key || "csg-bigbuy-es";
  await ensureEbayInventoryLocation(env, merchantLocationKey);
  const policies = await ebaySellerPolicies(env, marketplace);
  const categoryId = await ebayCategorySuggestion(env, listing.title, marketplace);
  const sku = listing.sku;
  const safeTitle = String(listing.title).slice(0, 80);
  const description = String(opportunity.description || `${safeTitle}\n\nFulfilled by our approved European wholesale partner. Tracking is provided after dispatch.`).slice(0, 4_000);
  const condition = String(opportunity.condition_code || "NEW");
  const imageUrls = (() => { try { const parsed = JSON.parse(opportunity.image_urls || "[]"); return Array.isArray(parsed) ? parsed.filter(Boolean).slice(0, 12) : []; } catch { return []; } })();

  await ebayApi(env, `/sell/inventory/v1/inventory_item/${encodeURIComponent(sku)}`, {
    method: "PUT",
    marketplace,
    body: {
      availability: { shipToLocationAvailability: { quantity: Math.max(0, Number(listing.quantity) || 0) } },
      condition,
      conditionDescription: condition === "NEW" ? undefined : String(opportunity.condition_description || "Please review the product description and images for the exact supplied condition.").slice(0, 1_000),
      product: {
        title: safeTitle,
        description,
        ean: opportunity.ean ? [String(opportunity.ean)] : undefined,
        imageUrls: imageUrls.length ? imageUrls : undefined,
        aspects: { Brand: [String(opportunity.brand || "Unbranded")] },
      },
    },
  });

  const offer = await ebayApi(env, "/sell/inventory/v1/offer", {
    method: "POST",
    marketplace,
    body: {
      sku,
      marketplaceId: marketplace,
      format: "FIXED_PRICE",
      availableQuantity: Math.max(1, Number(listing.quantity) || 1),
      categoryId,
      merchantLocationKey,
      listingDescription: description,
      listingPolicies: policies,
      pricingSummary: { price: { value: (Number(listing.price_cents) / 100).toFixed(2), currency: config.currency || "EUR" } },
    },
  });
  if (!offer?.offerId) throw new Error("ebay_offer_id_missing");
  const published = await ebayApi(env, `/sell/inventory/v1/offer/${encodeURIComponent(offer.offerId)}/publish`, { method: "POST", marketplace });
  if (!published?.listingId) throw new Error("ebay_listing_id_missing");
  return { offerId: offer.offerId, listingId: published.listingId, categoryId };
}
