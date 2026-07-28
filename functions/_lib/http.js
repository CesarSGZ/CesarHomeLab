export function json(data, init = {}) {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  headers.set("cache-control", "no-store");
  headers.set("x-content-type-options", "nosniff");
  return new Response(JSON.stringify(data), { ...init, headers });
}

export function methodNotAllowed(allowed) {
  return json(
    { ok: false, error: "method_not_allowed" },
    { status: 405, headers: { allow: allowed.join(", ") } },
  );
}

export async function readJson(request, maxBytes = 4096) {
  const length = Number(request.headers.get("content-length") || 0);
  if (length > maxBytes) throw new Error("payload_too_large");
  const text = await request.text();
  if (text.length > maxBytes) throw new Error("payload_too_large");
  return text ? JSON.parse(text) : {};
}
