import { normaliseUsername, userCan, validCsrf } from "./auth.js";
import { json } from "./http.js";
import { decryptSecret } from "./crypto-store.js";

export const MODEL = "gpt-5-mini";
export const fail = (error, status = 400) => json({ ok: false, error }, { status });
export function chatAccess(context) {
  const session = context.data?.session;
  if (!session) return fail("Sign in to HomeLab to continue.", 401);
  if (!userCan(session.user, "chat:use")) return fail("This workspace is private to its owner.", 403);
  if (context.request.method !== "GET") {
    if (!validCsrf(context.request, session)) return fail("Your session needs refreshing. Reload this page.", 403);
    if (!context.request.headers.get("content-type")?.toLowerCase().startsWith("application/json"))
      return fail("JSON content required.", 415);
    const origin = context.request.headers.get("origin");
    if (origin && origin !== new URL(context.request.url).origin) return fail("Invalid request origin.", 403);
  }
  return null;
}
export const ownerOf = context => normaliseUsername(context.data.session.user.username);
export async function connection(env, owner) {
  const saved = await env.CONTROL_DB.prepare("SELECT * FROM ai_settings WHERE owner = ?").bind(owner).first();
  if (saved) return { key: await decryptSecret(saved.key_cipher, saved.key_iv, env.TOKEN_ENCRYPTION_SECRET), model: MODEL };
  return { key: env.OPENAI_API_KEY || "", model: MODEL };
}
export function responseText(data) {
  return (data.output || []).flatMap(item => item.type === "message" ? item.content || [] : [])
    .filter(item => item.type === "output_text" || item.type === "refusal")
    .map(item => item.text || item.refusal || "").join("\n").trim();
}
export function providerError(status) {
  if (status === 401 || status === 403) return "OpenAI rejected the API key or model access. Check your connection.";
  if (status === 429) return "OpenAI reports a usage or billing limit. Check your API project and try later.";
  return "OpenAI could not complete this request. Please try again later.";
}
export function contextMessages(rows, message) {
  let remaining = 40000 - message.length;
  const selected = [];
  for (const row of rows.slice(0, 20)) {
    if (row.content.length > remaining) break;
    selected.unshift({ role: row.role, content: row.content });
    remaining -= row.content.length;
  }
  return [...selected, { role: "user", content: message }];
}
