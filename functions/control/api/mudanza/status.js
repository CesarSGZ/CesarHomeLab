import { userCan, validCsrf } from '../../../_lib/auth.js';
import { json, methodNotAllowed } from '../../../_lib/http.js';
import { normPlan, applyTick } from '../../../../control/mudanza-model.js';

// Mudanza for the signed-in owner. The plan is private (it is imported here, never stored in the repo);
// ticks are kept apart so importing a newer plan never loses what César marked.
//   GET                                   → { plan, ticks }
//   POST {action:'import', plan:{...}}    → replaces the plan, keeps the ticks
//   POST {action:'tick', id, done}        → marks or unmarks one item
const DATASET = 'mudanza', MAX_BODY = 500_000;

async function read(env) {
  const row = await env.CONTROL_DB.prepare('SELECT payload, updated_at FROM personal_datasets WHERE name = ?').bind(DATASET).first();
  return row ? { data: JSON.parse(row.payload), stamp: row.updated_at } : { data: { plan: null, ticks: {} }, stamp: null };
}

// Writes only if nobody wrote in between (phone and PC at once); otherwise tries again on the newer copy.
async function update(env, change) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const { data, stamp } = await read(env);
    const next = change(data), payload = JSON.stringify(next), now = new Date().toISOString();
    const result = stamp
      ? await env.CONTROL_DB.prepare('UPDATE personal_datasets SET payload = ?, updated_at = ? WHERE name = ? AND updated_at = ?').bind(payload, now, DATASET, stamp).run()
      : await env.CONTROL_DB.prepare('INSERT OR IGNORE INTO personal_datasets(name, payload, updated_at) VALUES(?, ?, ?)').bind(DATASET, payload, now).run();
    if (result.meta?.changes) return next;
  }
  throw new Error('busy');
}

export async function onRequest({ request, env, data }) {
  if (!['GET', 'POST'].includes(request.method)) return methodNotAllowed(['GET', 'POST']);
  if (!data.session) return json({ ok: false, error: 'not_authenticated' }, { status: 401 });
  if (!userCan(data.session.user, 'mudanza:read')) return json({ ok: false, error: 'not_authorised' }, { status: 403 });
  if (request.method === 'GET') {
    const { data: doc } = await read(env);
    return json({ ok: true, plan: doc.plan || null, ticks: doc.ticks || {} });
  }
  if (!validCsrf(request, data.session)) return json({ ok: false, error: 'invalid_csrf' }, { status: 403 });
  const body = await request.text();
  if (body.length > MAX_BODY) return json({ ok: false, error: 'request_too_large' }, { status: 413 });
  let parsed;
  try { parsed = JSON.parse(body); } catch { return json({ ok: false, error: 'invalid_request' }, { status: 400 }); }
  try {
    let next;
    if (parsed?.action === 'import') { const plan = normPlan(parsed.plan); next = await update(env, d => ({ plan, ticks: d.ticks || {} })); }
    else if (parsed?.action === 'tick') next = await update(env, d => ({ plan: d.plan || null, ticks: applyTick(d.ticks || {}, parsed.id, parsed.done) }));
    else return json({ ok: false, error: 'invalid_request' }, { status: 400 });
    return json({ ok: true, plan: next.plan, ticks: next.ticks });
  } catch (error) {
    const code = String(error?.message || '');
    if (code === 'busy') return json({ ok: false, error: 'busy' }, { status: 503 });
    if (/^invalid_/.test(code)) return json({ ok: false, error: code }, { status: 400 });
    if (error instanceof SyntaxError) return json({ ok: false, error: 'invalid_plan' }, { status: 400 });
    throw error;
  }
}
