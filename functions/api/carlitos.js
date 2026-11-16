// María's app looks after Carlitos here. Same proof as the rivalry: her own Sheet key, which only her phone and this
// server know. She can only act as herself.
import { carlitosAction } from '../_lib/carlitos-store.js';

const ORIGINS = /^(https:\/\/cesarsgz\.github\.io|http:\/\/localhost:\d+)$/;
const cors = request => {
  const origin = request.headers.get('origin') || '';
  return ORIGINS.test(origin) ? { 'access-control-allow-origin': origin, 'access-control-allow-headers': 'x-pique, content-type', 'access-control-allow-methods': 'POST', vary: 'origin' } : {};
};
const reply = (request, data, status = 200) => Response.json(data, { status, headers: { 'cache-control': 'no-store', ...cors(request) } });
const sameKey = (a, b) => {
  const x = new TextEncoder().encode(String(a)), y = new TextEncoder().encode(String(b));
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] || 0) ^ (y[i] || 0);
  return diff === 0;
};

export async function onRequest({ request, env }) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(request) });
  if (request.method !== 'POST') return reply(request, { ok: false, error: 'method_not_allowed' }, 405);
  const row = await env.CONTROL_DB.prepare('SELECT payload FROM personal_datasets WHERE name = ?').bind('maria-lab').first();
  const key = request.headers.get('x-pique') || '', maria = row ? JSON.parse(row.payload) : null;
  if (!maria?.sheet?.key || !key || !sameKey(key, maria.sheet.key)) return reply(request, { ok: false, error: 'not_authorised' }, 401);
  let body;
  try { body = JSON.parse(await request.text()); } catch { return reply(request, { ok: false, error: 'bad_request' }, 400); }
  try {
    return reply(request, { ok: true, carlitos: await carlitosAction(env, 'maria', body?.action) });
  } catch (error) {
    const known = ['bones', 'item', 'text', 'type', 'vale', 'vale_semana', 'fecha'].includes(error?.message);
    return reply(request, { ok: false, error: known ? error.message : 'unavailable' }, known ? 400 : 503);
  }
}
