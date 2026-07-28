const OWNER_EMAIL = "cesarsollagonzalez@gmail.com";

function normaliseEmail(value) {
  return String(value || "").trim().toLowerCase();
}

export function currentUser(request, env) {
  const hostname = new URL(request.url).hostname.toLowerCase();
  const trustedHost =
    hostname === "cesar-solla.pages.dev" ||
    hostname === "127.0.0.1" ||
    hostname === "localhost";
  if (!trustedHost) return null;

  const email = normaliseEmail(
    request.headers.get("cf-access-authenticated-user-email"),
  );

  if (email === OWNER_EMAIL) {
    return { email, username: "CesarVapor", role: "owner" };
  }

  const secondEmail = normaliseEmail(env.SECOND_USER_EMAIL);
  if (secondEmail && email === secondEmail) {
    return { email, username: "Supersanti86", role: "operator" };
  }

  return null;
}

export function requireUser(request, env) {
  const user = currentUser(request, env);
  if (!user) {
    return {
      user: null,
      response: new Response("Forbidden", {
        status: 403,
        headers: { "cache-control": "no-store" },
      }),
    };
  }
  return { user, response: null };
}

function constantTimeEqual(left, right) {
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
