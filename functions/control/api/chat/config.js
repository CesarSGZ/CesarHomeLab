import { chatAccess, ownerOf, fail, MODEL, providerError } from "../../../_lib/chat.js";
import { encryptSecret } from "../../../_lib/crypto-store.js";
import { json, readJson, methodNotAllowed } from "../../../_lib/http.js";

export async function onRequest(context) {
  const denied = chatAccess(context); if (denied) return denied;
  const { request, env } = context, owner = ownerOf(context);
  if (!["GET","POST","DELETE"].includes(request.method)) return methodNotAllowed(["GET","POST","DELETE"]);
  try {
    if (request.method === "GET") {
      const saved = await env.CONTROL_DB.prepare("SELECT owner FROM ai_settings WHERE owner = ?").bind(owner).first();
      return json({ ok: true, ready: !!(saved || env.OPENAI_API_KEY), model: MODEL,
        canConfigure: String(env.TOKEN_ENCRYPTION_SECRET || "").length >= 32, environmentKey: !!env.OPENAI_API_KEY });
    }
    if (request.method === "DELETE") {
      await env.CONTROL_DB.prepare("DELETE FROM ai_settings WHERE owner = ?").bind(owner).run();
      return json({ ok: true, ready: !!env.OPENAI_API_KEY });
    }
    let input; try { input = await readJson(request, 2048); } catch { return fail("Invalid connection settings."); }
    if (!input || typeof input !== "object" || Array.isArray(input)) return fail("Invalid connection settings.");
    const key = String(input.apiKey || "").trim();
    if (!/^sk-[A-Za-z0-9_-]{16,500}$/.test(key)) return fail("Enter a valid OpenAI project API key.");
    if (String(env.TOKEN_ENCRYPTION_SECRET || "").length < 32) return fail("Server encryption is not configured yet.", 503);
    const check = await fetch("https://api.openai.com/v1/models/" + MODEL, {
      headers: { Authorization: "Bearer " + key }, signal: AbortSignal.timeout(15000)
    });
    if (!check.ok) return fail(providerError(check.status), 400);
    const encrypted = await encryptSecret(key, env.TOKEN_ENCRYPTION_SECRET);
    await env.CONTROL_DB.prepare("INSERT INTO ai_settings(owner,key_cipher,key_iv,model,updated_at) VALUES(?,?,?,?,?) ON CONFLICT(owner) DO UPDATE SET key_cipher=excluded.key_cipher,key_iv=excluded.key_iv,model=excluded.model,updated_at=excluded.updated_at")
      .bind(owner, encrypted.cipher, encrypted.iv, MODEL, Date.now()).run();
    return json({ ok: true, ready: true, model: MODEL });
  } catch { return fail("Connection could not be saved or loaded. Please try again.", 503); }
}
