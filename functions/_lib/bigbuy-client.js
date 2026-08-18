const API_BASE = "https://api.bigbuy.eu";

export function bigBuyConfigured(env) {
  return Boolean(env.BIGBUY_API_KEY && String(env.BIGBUY_API_KEY).length >= 20);
}

export async function bigBuyApi(env, path, query = {}) {
  if (!bigBuyConfigured(env)) throw new Error("bigbuy_api_not_configured");
  const url = new URL(`${API_BASE}${path}`);
  Object.entries(query).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") url.searchParams.set(key, String(value));
  });
  const response = await fetch(url, {
    headers: { authorization: `Bearer ${env.BIGBUY_API_KEY}`, accept: "application/json" },
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const error = new Error(data?.message || `bigbuy_api_${response.status}`);
    error.status = response.status;
    throw error;
  }
  return data;
}

export async function loadBigBuyCataloguePage(env, page = 0, pageSize = 100) {
  const query = { page, pageSize };
  const [products, information, prices, stocks] = await Promise.all([
    bigBuyApi(env, "/rest/catalog/products.json", query),
    bigBuyApi(env, "/rest/catalog/productsinformation.json", { ...query, isoCode: "es" }),
    bigBuyApi(env, "/rest/catalog/productprices.json", query),
    bigBuyApi(env, "/rest/catalog/productsstockbyhandlingdays.json", query),
  ]);
  const infoById = new Map((information || []).map((item) => [Number(item.id), item]));
  const priceById = new Map((prices || []).map((item) => [Number(item.id), item]));
  const stockById = new Map((stocks || []).map((item) => [Number(item.id), item]));
  return (products || []).map((product) => {
    const info = infoById.get(Number(product.id)) || {};
    const price = priceById.get(Number(product.id)) || {};
    const stock = stockById.get(Number(product.id)) || {};
    return {
      id: Number(product.id),
      sku: String(product.sku || ""),
      ean: String(product.ean13 || ""),
      title: String(info.name || product.sku || "Untitled product"),
      description: String(info.description || ""),
      wholesaleCents: Math.round(Number(price.wholesalePrice ?? product.wholesalePrice ?? 0) * 100),
      recommendedCents: Math.round(Number(price.retailPrice ?? product.retailPrice ?? 0) * 100),
      stock: (stock.stocks || []).reduce((total, item) => total + Math.max(0, Number(item.quantity) || 0), 0),
      active: Boolean(Number(product.active ?? 1)),
      condition: product.condition || "NEW",
      handlingDays: Math.min(...(stock.stocks || []).map((item) => Number(item.minHandlingDays) || 99), 99),
      raw: product,
    };
  });
}
