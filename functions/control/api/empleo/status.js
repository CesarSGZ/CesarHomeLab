import { userCan, validCsrf } from '../../../_lib/auth.js';
import { json, methodNotAllowed } from '../../../_lib/http.js';
import { readDoc, writeOps, newAgentKey, agentKeyInfo, revokeAgentKey } from '../../../_lib/empleo-store.js';

// Empleo for the signed-in owner. A POST sends changes (ops), never the whole document. It also makes and retires
// the key that Claude and the offer robot use (see /api/empleo).
const MAX_BODY = 1_000_000, MAX_OPS = 500;

export async function onRequest({ request, env, data }) {
  if (!['GET', 'POST'].includes(request.method)) return methodNotAllowed(['GET', 'POST']);
  if (!data.session) return json({ ok: false, error: 'not_authenticated' }, { status: 401 });
  if (!userCan(data.session.user, 'empleo:read')) return json({ ok: false, error: 'not_authorised' }, { status: 403 });
  if (request.method === 'GET') {
    const [{ doc }, agent] = await Promise.all([readDoc(env), agentKeyInfo(env)]);
    return json({ ok: true, ...doc, agent: agent ? { created: agent.created } : null });
  }
  if (!validCsrf(request, data.session)) return json({ ok: false, error: 'invalid_csrf' }, { status: 403 });
  const body = await request.text();
  if (body.length > MAX_BODY) return json({ ok: false, error: 'request_too_large' }, { status: 413 });
  let parsed;
  try { parsed = JSON.parse(body); } catch { return json({ ok: false, error: 'invalid_request' }, { status: 400 }); }
  if (parsed?.action === 'agent-key') return json({ ok: true, key: await newAgentKey(env) });
  if (parsed?.action === 'agent-revoke') { await revokeAgentKey(env); return json({ ok: true }); }
  const ops = parsed?.ops;
  if (!Array.isArray(ops) || !ops.length || ops.length > MAX_OPS) return json({ ok: false, error: 'invalid_ops' }, { status: 400 });
  try {
    return json({ ok: true, ...(await writeOps(env, ops)) });
  } catch (error) {
    const code = String(error?.message || '');
    if (code === 'busy') return json({ ok: false, error: 'busy' }, { status: 503 });
    return json({ ok: false, error: /^(too_|invalid_)/.test(code) ? code : 'invalid_ops' }, { status: 400 });
  }
}
