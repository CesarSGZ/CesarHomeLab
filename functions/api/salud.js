// María's iPhone sends Apple Health here (Health Auto Export or a Shortcut), and her app reads it back. Same proof as the
// rivalry: her own Sheet key in the x-pique header, which only her phone and this server know.
import { madridToday } from '../_lib/rivalry.js';
import { cleanGoal, cleanProfile, markDay, mergeHealth, parseHealth } from '../_lib/salud.js';

const DATASET = 'maria-salud', MAX_BODY = 5_000_000;
const ORIGINS = /^(https:\/\/cesarsgz\.github\.io|http:\/\/localhost:\d+)$/;
const cors = request => {
  const origin = request.headers.get('origin') || '';
  return ORIGINS.test(origin) ? { 'access-control-allow-origin': origin, 'access-control-allow-headers': 'x-pique, content-type', 'access-control-allow-methods': 'GET, POST', vary: 'origin' } : {};
};
const reply = (request, data, status = 200) => Response.json(data, { status, headers: { 'cache-control': 'no-store', ...cors(request) } });
const sameKey = (a, b) => {
  const x = new TextEncoder().encode(String(a)), y = new TextEncoder().encode(String(b));
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] || 0) ^ (y[i] || 0);
  return diff === 0;
};
async function read(env, name) {
  const row = await env.CONTROL_DB.prepare('SELECT payload FROM personal_datasets WHERE name = ?').bind(name).first();
  return row ? JSON.parse(row.payload) : null;
}
async function save(env, data) {
  await env.CONTROL_DB.prepare('INSERT INTO personal_datasets(name,payload,updated_at) VALUES(?,?,?) ON CONFLICT(name) DO UPDATE SET payload=excluded.payload,updated_at=excluded.updated_at')
    .bind(DATASET, JSON.stringify(data), new Date().toISOString()).run();
}

export async function onRequest({ request, env }) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(request) });
  if (!['GET', 'POST'].includes(request.method)) return reply(request, { ok: false, error: 'method_not_allowed' }, 405);
  const maria = await read(env, 'maria-lab'), key = request.headers.get('x-pique') || new URL(request.url).searchParams.get('k') || '';
  if (!maria?.sheet?.key || !key || !sameKey(key, maria.sheet.key)) return reply(request, { ok: false, error: 'not_authorised' }, 401);
  const stored = await read(env, DATASET);
  if (request.method === 'GET') return reply(request, { ok: true, salud: stored || { dias: {} } });
  const text = await request.text();
  if (text.length > MAX_BODY) return reply(request, { ok: false, error: 'too_large' }, 413);
  let body;
  try { body = JSON.parse(text); } catch { return reply(request, { ok: false, error: 'bad_request' }, 400); }
  try {
    // From her app: goal, profile or a day marked in or out. From her iPhone: Health data.
    // A day that should not be there at all (a test, a wrong import) is removed whole.
    if (body?.borrarDia) {
      const next = { ...(stored || { dias: {} }), dias: { ...((stored && stored.dias) || {}) } };
      delete next.dias[String(body.borrarDia)];
      await save(env, next);
      return reply(request, { ok: true, dias: Object.keys(next.dias).length });
    }
    if (body?.objetivo || body?.perfil || body?.marcar) {
      let next = { ...(stored || { dias: {} }) };
      if (body.objetivo) next.objetivo = cleanGoal(body.objetivo);
      if (body.perfil) next.perfil = cleanProfile(body.perfil);
      if (body.marcar) next = markDay(next, body.marcar.fecha, body.marcar.estado);
      await save(env, next);
      return reply(request, { ok: true, salud: next });
    }
    const days = parseHealth(body);
    const next = mergeHealth(stored, days, madridToday());
    // What the iPhone really sent, in short: the keys and the first lines of each, to check the format from here.
    next.ultimoEnvio = { cuando: new Date().toISOString(), dias: Object.keys(days).length, muestra: Object.fromEntries(Object.entries(body || {}).slice(0, 20).map(([k, v]) => [k, typeof v === 'string' ? v.slice(0, 160) : JSON.stringify(v).slice(0, 160)])) };
    await save(env, next);
    return reply(request, { ok: true, dias: Object.keys(days).length });
  } catch (error) {
    const known = ['objetivo', 'perfil', 'dia'].includes(error?.message);
    return reply(request, { ok: false, error: known ? error.message : 'unavailable' }, known ? 400 : 503);
  }
}
