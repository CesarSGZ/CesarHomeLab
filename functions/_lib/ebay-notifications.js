const encoder = new TextEncoder();

export async function sha256Hex(value) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(String(value)));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function ebayDeletionVerificationToken(env) {
  if (!env.TOKEN_ENCRYPTION_SECRET || String(env.TOKEN_ENCRYPTION_SECRET).length < 32) {
    throw new Error("token_encryption_not_configured");
  }
  return sha256Hex(`csg-ebay-account-deletion-v1:${env.TOKEN_ENCRYPTION_SECRET}`);
}

export function ebayDeletionEndpoint(request) {
  const url = new URL(request.url);
  return `${url.origin}/api/ebay/account-deletion`;
}
