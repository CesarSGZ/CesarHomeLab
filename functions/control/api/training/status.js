import { userCan, validCsrf } from '../../../_lib/auth.js';
import { json, methodNotAllowed } from '../../../_lib/http.js';

const DATASET = 'training-lab';
const CODE = /^(https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec)#(\w{16,})$/;
const MAX_BODY = 200_000, MAX_OPS = 300;

async function readLab(env) {
  const row = await env.CONTROL_DB.prepare('SELECT payload FROM personal_datasets WHERE name = ?').bind(DATASET).first();
  return row ? JSON.parse(row.payload) : null;
}

// Libra's weight history came with the previous Training module and stays with the new one.
async function oldBodyWeight(env) {
  const row = await env.CONTROL_DB.prepare('SELECT payload FROM personal_datasets WHERE name = ?').bind('training').first();
  return row ? JSON.parse(row.payload).bodyWeight?.measurements || [] : [];
}

async function readSheet({ url, key }) {
  const response = await fetch(`${url}?k=${encodeURIComponent(key)}`, { signal: AbortSignal.timeout(25_000), redirect: 'follow' });
  if (!response.ok) throw new Error('sheet_unavailable');
  const data = await response.json();
  if (data.error) throw new Error(data.error === 'clave' ? 'sheet_key_rejected' : 'sheet_unavailable');
  return data;
}

function validOp(op) {
  if (op?.tipo === 'borrar') return typeof op.id === 'string' && op.id.length < 80;
  if (op?.tipo === 'alternativa') return typeof op.ejercicio === 'string' && op.ejercicio.trim().length > 0 && op.ejercicio.length < 120 && String(op.musculo || '').length < 40 && String(op.referencia || '').length < 200;
  if (op?.tipo !== 'guardar' || !op.fila || typeof op.fila !== 'object') return false;
  const f = op.fila;
  return typeof f.id === 'string' && f.id.length < 80 && /^\d{4}-\d{2}-\d{2}$/.test(f.fecha) && typeof f.ejercicio === 'string' && f.ejercicio.length < 120
    && Number.isFinite(f.serie) && [f.reps, f.kg, f.rpe].every(v => v === null || v === undefined || Number.isFinite(v)) && String(f.nota || '').length < 500;
}

export async function onRequest({ request, env, data }) {
  if (!['GET', 'POST'].includes(request.method)) return methodNotAllowed(['GET', 'POST']);
  if (!data.session) return json({ ok: false, error: 'not_authenticated' }, { status: 401 });
  if (!userCan(data.session.user, 'training:read')) return json({ ok: false, error: 'not_authorised' }, { status: 403 });
  if (request.method === 'POST' && !validCsrf(request, data.session)) return json({ ok: false, error: 'invalid_csrf' }, { status: 403 });
  try {
    const lab = await readLab(env);
    if (request.method === 'GET') {
      if (!lab?.sheet) return json({ ok: true, connected: false });
      const sheet = await readSheet(lab.sheet);
      return json({ ok: true, connected: true, ...sheet, bodyWeight: lab.bodyWeight || [] });
    }
    const body = await request.text();
    if (body.length > MAX_BODY) return json({ ok: false, error: 'request_too_large' }, { status: 413 });
    let action;
    try { action = JSON.parse(body); } catch { return json({ ok: false, error: 'invalid_request' }, { status: 400 }); }
    if (action?.action === 'connect') {
      const match = String(action.code || '').trim().match(CODE);
      if (!match) return json({ ok: false, error: 'invalid_code' }, { status: 400 });
      const sheet = { url: match[1], key: match[2] };
      await readSheet(sheet); // Only store a connection that answers with its key.
      const payload = JSON.stringify({ sheet, bodyWeight: lab?.bodyWeight || await oldBodyWeight(env) });
      await env.CONTROL_DB.prepare('INSERT INTO personal_datasets(name,payload,updated_at) VALUES(?,?,?) ON CONFLICT(name) DO UPDATE SET payload=excluded.payload,updated_at=excluded.updated_at')
        .bind(DATASET, payload, new Date().toISOString()).run();
      return json({ ok: true });
    }
    if (action?.action === 'ops') {
      if (!lab?.sheet) return json({ ok: false, error: 'not_connected' }, { status: 409 });
      const ops = action.ops;
      if (!Array.isArray(ops) || ops.length > MAX_OPS || !ops.every(validOp)) return json({ ok: false, error: 'invalid_ops' }, { status: 400 });
      const response = await fetch(lab.sheet.url, { method: 'POST', redirect: 'follow', signal: AbortSignal.timeout(25_000), headers: { 'content-type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ k: lab.sheet.key, ops }) });
      const result = await response.json();
      if (!result.ok) throw new Error('sheet_unavailable');
      return json({ ok: true });
    }
    return json({ ok: false, error: 'unknown_action' }, { status: 400 });
  } catch (error) {
    const code = error?.message === 'sheet_key_rejected' ? 'sheet_key_rejected' : 'sheet_unavailable';
    return json({ ok: false, error: code }, { status: 503 });
  }
}
