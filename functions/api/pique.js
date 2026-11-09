// María's app asks how César's week is going. It proves who it is with María's own Sheet key, which only her
// phone and this server know, and gets back the rivalry summary only: no sets, notes or body weight.
import { CESAR_COLUMNS, madridToday, summarize } from '../_lib/rivalry.js';

const ORIGINS = /^(https:\/\/cesarsgz\.github\.io|http:\/\/localhost:\d+)$/;
const cors = request => {
  const origin = request.headers.get('origin') || '';
  return ORIGINS.test(origin) ? { 'access-control-allow-origin': origin, 'access-control-allow-headers': 'x-pique', 'access-control-allow-methods': 'GET', vary: 'origin' } : {};
};
const reply = (request, data, status = 200) => Response.json(data, { status, headers: { 'cache-control': 'no-store', ...cors(request) } });

async function dataset(env, name) {
  const row = await env.CONTROL_DB.prepare('SELECT payload FROM personal_datasets WHERE name = ?').bind(name).first();
  return row ? JSON.parse(row.payload) : null;
}
const sameKey = (a, b) => {
  const x = new TextEncoder().encode(String(a)), y = new TextEncoder().encode(String(b));
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] || 0) ^ (y[i] || 0);
  return diff === 0;
};

export async function onRequest({ request, env }) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(request) });
  if (request.method !== 'GET') return reply(request, { ok: false, error: 'method_not_allowed' }, 405);
  try {
    const maria = await dataset(env, 'maria-lab'), key = request.headers.get('x-pique') || '';
    if (!maria?.sheet?.key || !key || !sameKey(key, maria.sheet.key)) return reply(request, { ok: false, error: 'not_authorised' }, 401);
    const cesar = await dataset(env, 'training-lab');
    if (!cesar?.sheet) return reply(request, { ok: false, error: 'not_connected' }, 409);
    const response = await fetch(`${cesar.sheet.url}?k=${encodeURIComponent(cesar.sheet.key)}`, { signal: AbortSignal.timeout(25_000), redirect: 'follow' });
    const sheet = await response.json();
    if (!Array.isArray(sheet?.filas)) throw new Error('sheet_unavailable');
    return reply(request, { ok: true, rival: summarize(sheet.filas, CESAR_COLUMNS, madridToday()) });
  } catch {
    return reply(request, { ok: false, error: 'unavailable' }, 503);
  }
}
