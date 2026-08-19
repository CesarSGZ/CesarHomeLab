import { ebayDeletionEndpoint, ebayDeletionVerificationToken, sha256Hex } from "../../_lib/ebay-notifications.js";

function responseHeaders() {
  return {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  };
}

export async function onRequest(context) {
  if (context.request.method === "GET") {
    const challengeCode = new URL(context.request.url).searchParams.get("challenge_code");
    if (!challengeCode) return new Response(JSON.stringify({ error: "challenge_code_required" }), { status: 400, headers: responseHeaders() });
    const token = await ebayDeletionVerificationToken(context.env);
    const challengeResponse = await sha256Hex(`${challengeCode}${token}${ebayDeletionEndpoint(context.request)}`);
    return new Response(JSON.stringify({ challengeResponse }), { status: 200, headers: responseHeaders() });
  }

  if (context.request.method === "POST") {
    const raw = await context.request.text();
    let payload;
    try { payload = JSON.parse(raw); } catch { return new Response(null, { status: 400 }); }
    if (payload?.metadata?.topic !== "MARKETPLACE_ACCOUNT_DELETION" || !payload?.notification?.notificationId) {
      return new Response(null, { status: 400 });
    }
    const payloadHash = await sha256Hex(raw);
    await context.env.CONTROL_DB.prepare(
      "INSERT OR IGNORE INTO ebay_account_deletion_events (id, payload_hash, received_at, processing_status) VALUES (?, ?, ?, 'acknowledged')",
    ).bind(String(payload.notification.notificationId).slice(0, 128), payloadHash, Date.now()).run();
    return new Response(null, { status: 204, headers: { "cache-control": "no-store" } });
  }

  return new Response(null, { status: 405, headers: { allow: "GET, POST" } });
}
