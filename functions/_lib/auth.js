const SESSION_COOKIE = "mc_session";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const PBKDF2_ITERATIONS = 100_000;

const encoder = new TextEncoder();
const STANDARD_ACCESS = Object.freeze({
  profile: "standard",
  views: ["overview"],
  capabilities: [],
});
const USER_ACCESS = Object.freeze({
  cesarvapor: Object.freeze({
    profile: "owner",
    views: ["overview", "infrastructure", "thermal", "ebay", "pdf"],
    capabilities: ["minecraft:read", "minecraft:restart", "thermal:read", "ebay:read", "ebay:write", "pdf:read"],
  }),
  supersanti86: Object.freeze({
    profile: "minecraft-operator",
    views: ["overview", "infrastructure"],
    capabilities: ["minecraft:read", "minecraft:restart"],
  }),
});

function bytesToBase64(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBytes(value) {
  const binary = atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function bytesToHex(bytes) {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function randomToken(size = 32) {
  return bytesToBase64(crypto.getRandomValues(new Uint8Array(size)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function getCookie(request, name) {
  const cookies = String(request.headers.get("cookie") || "").split(";");
  for (const cookie of cookies) {
    const [key, ...value] = cookie.trim().split("=");
    if (key === name) return value.join("=");
  }
  return "";
}

export function normaliseUsername(value) {
  return String(value || "").trim().toLowerCase();
}

export function accessForUser(user) {
  const configured = USER_ACCESS[normaliseUsername(user?.username)] || STANDARD_ACCESS;
  return {
    profile: configured.profile,
    views: [...configured.views],
    capabilities: [...configured.capabilities],
  };
}

export function userCan(user, capability) {
  return accessForUser(user).capabilities.includes(capability);
}

export async function sha256(value) {
  return bytesToHex(
    new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value))),
  );
}

export async function hashPassword(password, saltBase64, pepper) {
  if (!pepper) throw new Error("AUTH_PEPPER is not configured");
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(`${password}\0${pepper}`),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: base64ToBytes(saltBase64),
      iterations: PBKDF2_ITERATIONS,
    },
    key,
    256,
  );
  return bytesToBase64(new Uint8Array(bits));
}

export function newPasswordSalt() {
  return bytesToBase64(crypto.getRandomValues(new Uint8Array(16)));
}

export function passwordIsAcceptable(password, username) {
  return (
    typeof password === "string" &&
    password.length >= 14 &&
    password.length <= 128 &&
    !password.toLowerCase().includes(normaliseUsername(username))
  );
}

export async function createSession(env, userId) {
  const rawToken = randomToken();
  const sessionHash = await sha256(rawToken);
  const csrfToken = randomToken(24);
  const now = Date.now();
  await env.CONTROL_DB.prepare(
    "INSERT INTO sessions (session_hash, user_id, csrf_token, created_at, expires_at, last_seen) VALUES (?, ?, ?, ?, ?, ?)",
  )
    .bind(sessionHash, userId, csrfToken, now, now + SESSION_TTL_MS, now)
    .run();
  return { rawToken, csrfToken, expiresAt: now + SESSION_TTL_MS };
}

export function sessionCookie(rawToken) {
  return `${SESSION_COOKIE}=${rawToken}; Path=/control; Max-Age=${Math.floor(
    SESSION_TTL_MS / 1000,
  )}; HttpOnly; Secure; SameSite=Strict`;
}

export function clearSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/control; Max-Age=0; HttpOnly; Secure; SameSite=Strict`;
}

export async function currentSession(request, env) {
  const rawToken = getCookie(request, SESSION_COOKIE);
  if (!rawToken) return null;
  const sessionHash = await sha256(rawToken);
  const now = Date.now();
  const row = await env.CONTROL_DB.prepare(
    `SELECT
       s.session_hash, s.csrf_token, s.expires_at, s.last_seen,
       u.id AS user_id, u.username, u.role, u.must_change_password
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.session_hash = ? AND s.expires_at > ?
     LIMIT 1`,
  )
    .bind(sessionHash, now)
    .first();
  if (!row) return null;

  if (now - Number(row.last_seen) > 5 * 60 * 1000) {
    await env.CONTROL_DB.prepare(
      "UPDATE sessions SET last_seen = ? WHERE session_hash = ?",
    )
      .bind(now, sessionHash)
      .run();
  }

  return {
    sessionHash,
    csrfToken: row.csrf_token,
    expiresAt: Number(row.expires_at),
    user: {
      id: row.user_id,
      username: row.username,
      role: row.role,
      mustChangePassword: Boolean(row.must_change_password),
    },
  };
}

export async function destroySession(request, env) {
  const rawToken = getCookie(request, SESSION_COOKIE);
  if (!rawToken) return;
  await env.CONTROL_DB.prepare("DELETE FROM sessions WHERE session_hash = ?")
    .bind(await sha256(rawToken))
    .run();
}

export function validCsrf(request, session) {
  return (
    session &&
    constantTimeEqual(
      request.headers.get("x-csrf-token"),
      session.csrfToken,
    )
  );
}

export function constantTimeEqual(left, right) {
  const encoder = new TextEncoder();
  const a = encoder.encode(String(left || ""));
  const b = encoder.encode(String(right || ""));
  let diff = a.length ^ b.length;
  const length = Math.max(a.length, b.length);
  for (let index = 0; index < length; index += 1) {
    diff |= (a[index % (a.length || 1)] || 0) ^ (b[index % (b.length || 1)] || 0);
  }
  return diff === 0;
}

export function requireAgent(request, env) {
  const configured = String(env.MINECRAFT_AGENT_TOKEN || "");
  const supplied = String(request.headers.get("authorization") || "").replace(
    /^Bearer\s+/i,
    "",
  );
  return configured.length >= 32 && constantTimeEqual(configured, supplied);
}
