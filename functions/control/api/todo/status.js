import { userCan, validCsrf } from '../../../_lib/auth.js';
import { json, methodNotAllowed } from '../../../_lib/http.js';
import { applyOps, emptyDoc } from '../../../../control/todo-model.js';

// Tareas: every list lives in one row of personal_datasets. A POST sends changes (ops), never the whole
// document, so the phone and the PC can both write without undoing each other.
const DATASET = 'todo';
const MAX_BODY = 3_000_000, MAX_DOC = 1_900_000, MAX_OPS = 500;

async function readDoc(env) {
  const row = await env.CONTROL_DB.prepare('SELECT payload, updated_at FROM personal_datasets WHERE name = ?').bind(DATASET).first();
  return row ? { doc: JSON.parse(row.payload), stamp: row.updated_at } : { doc: emptyDoc(), stamp: null };
}

// Writes only if nobody wrote in between; otherwise the changes are applied again on top of the newer copy.
async function writeOps(env, ops) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const { doc, stamp } = await readDoc(env);
    const next = applyOps(doc, ops), payload = JSON.stringify(next);
    if (payload.length > MAX_DOC) throw new Error('too_large');
    const now = new Date().toISOString();
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
  if (!userCan(data.session.user, 'todo:read')) return json({ ok: false, error: 'not_authorised' }, { status: 403 });
  if (request.method === 'GET') return json({ ok: true, ...(await readDoc(env)).doc });
  if (!validCsrf(request, data.session)) return json({ ok: false, error: 'invalid_csrf' }, { status: 403 });
  const body = await request.text();
  if (body.length > MAX_BODY) return json({ ok: false, error: 'request_too_large' }, { status: 413 });
  let ops;
  try { ops = JSON.parse(body).ops; } catch { return json({ ok: false, error: 'invalid_request' }, { status: 400 }); }
  if (!Array.isArray(ops) || !ops.length || ops.length > MAX_OPS) return json({ ok: false, error: 'invalid_ops' }, { status: 400 });
  try {
    return json({ ok: true, ...(await writeOps(env, ops)) });
  } catch (error) {
    const code = String(error?.message || '');
    if (code === 'busy') return json({ ok: false, error: 'busy' }, { status: 503 });
    return json({ ok: false, error: /^(too_|invalid_)/.test(code) ? code : 'invalid_ops' }, { status: 400 });
  }
}
