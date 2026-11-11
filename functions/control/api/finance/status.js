import { userCan, validCsrf } from '../../../_lib/auth.js';
import { json, methodNotAllowed } from '../../../_lib/http.js';

// Gastos: the Sheet's Apps Script address and key are stored once; every read and write goes through here.
const DATASET = 'finance-lab';
const CODE = /^(https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec)#(\w{16,})$/;
const MAX_BODY = 100_000, MAX_OPS = 200;
const TYPES = new Set(['Gasto', 'Ingreso']), FREQUENCIES = new Set(['mensual', 'anual', 'semanal']);
const DATE = /^\d{4}-\d{2}-\d{2}$/;

async function readLab(env) {
  const row = await env.CONTROL_DB.prepare('SELECT payload FROM personal_datasets WHERE name = ?').bind(DATASET).first();
  return row ? JSON.parse(row.payload) : null;
}

async function readSheet({ url, key }) {
  const response = await fetch(`${url}?k=${encodeURIComponent(key)}`, { signal: AbortSignal.timeout(25_000), redirect: 'follow' });
  if (!response.ok) throw new Error('sheet_unavailable');
  const data = await response.json();
  if (data.error) throw new Error(data.error === 'clave' ? 'sheet_key_rejected' : 'sheet_unavailable');
  return data;
}

const text = (v, max) => typeof v === 'string' && v.length <= max;
const amount = v => Number.isFinite(v) && v >= 0 && v < 10_000_000;
// Rows travel as the Sheet's columns, in order.
export function validOp(op) {
  if (op?.tipo === 'borrar') return ['Movimientos', 'Recurrentes'].includes(op.tabla) && text(op.id, 80) && op.id.length > 0;
  if (op?.tipo !== 'guardar' || !Array.isArray(op.fila)) return false;
  const f = op.fila;
  if (op.tabla === 'Movimientos') {
    // Fecha, Tipo, Importe, Categoría, Concepto, Cuenta, Origen, ID
    return f.length === 8 && DATE.test(f[0]) && TYPES.has(f[1]) && amount(f[2]) && text(f[3], 60) && text(f[4], 200) && text(f[5], 60) && text(f[6], 30) && text(f[7], 80) && f[7].length > 0;
  }
  if (op.tabla === 'Recurrentes') {
    // ID, Tipo, Importe, Categoría, Concepto, Frecuencia, Día, Mes, Desde, Hasta, Activo
    return f.length === 11 && text(f[0], 80) && f[0].length > 0 && TYPES.has(f[1]) && amount(f[2]) && text(f[3], 60) && text(f[4], 200) && FREQUENCIES.has(f[5])
      && Number.isInteger(f[6]) && f[6] >= 0 && f[6] <= 31 && (f[7] === '' || (Number.isInteger(f[7]) && f[7] >= 1 && f[7] <= 12))
      && (f[8] === '' || DATE.test(f[8])) && (f[9] === '' || DATE.test(f[9])) && typeof f[10] === 'boolean';
  }
  return false;
}
const validCategories = list => Array.isArray(list) && list.length <= 100 && list.every(c => Array.isArray(c) && c.length === 3 && TYPES.has(c[0]) && text(c[1], 60) && c[1].trim() && (c[2] === '' || amount(c[2])));

export async function onRequest({ request, env, data }) {
  if (!['GET', 'POST'].includes(request.method)) return methodNotAllowed(['GET', 'POST']);
  if (!data.session) return json({ ok: false, error: 'not_authenticated' }, { status: 401 });
  if (!userCan(data.session.user, 'finance:read')) return json({ ok: false, error: 'not_authorised' }, { status: 403 });
  if (request.method === 'POST' && !validCsrf(request, data.session)) return json({ ok: false, error: 'invalid_csrf' }, { status: 403 });
  try {
    const lab = await readLab(env);
    if (request.method === 'GET') {
      if (!lab?.sheet) return json({ ok: true, connected: false });
      return json({ ok: true, connected: true, ...(await readSheet(lab.sheet)) });
    }
    const body = await request.text();
    if (body.length > MAX_BODY) return json({ ok: false, error: 'request_too_large' }, { status: 413 });
    let action;
    try { action = JSON.parse(body); } catch { return json({ ok: false, error: 'invalid_request' }, { status: 400 }); }
    if (action?.action === 'connect') {
      const match = String(action.code || '').trim().match(CODE);
      if (!match) return json({ ok: false, error: 'invalid_code' }, { status: 400 });
      const sheet = { url: match[1], key: match[2] };
      const answer = await readSheet(sheet); // Only a connection that answers with its key is stored.
      if (!Array.isArray(answer.movimientos)) throw new Error('sheet_unavailable');
      await env.CONTROL_DB.prepare('INSERT INTO personal_datasets(name,payload,updated_at) VALUES(?,?,?) ON CONFLICT(name) DO UPDATE SET payload=excluded.payload,updated_at=excluded.updated_at')
        .bind(DATASET, JSON.stringify({ sheet }), new Date().toISOString()).run();
      return json({ ok: true });
    }
    if (action?.action === 'ops') {
      if (!lab?.sheet) return json({ ok: false, error: 'not_connected' }, { status: 409 });
      const ops = action.ops || [];
      if (!Array.isArray(ops) || ops.length > MAX_OPS || !ops.every(validOp)) return json({ ok: false, error: 'invalid_ops' }, { status: 400 });
      if (action.categorias !== undefined && !validCategories(action.categorias)) return json({ ok: false, error: 'invalid_categories' }, { status: 400 });
      const response = await fetch(lab.sheet.url, { method: 'POST', redirect: 'follow', signal: AbortSignal.timeout(25_000), headers: { 'content-type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ k: lab.sheet.key, ops, ...(action.categorias ? { categorias: action.categorias } : {}) }) });
      const result = await response.json();
      if (!result.ok) throw new Error('sheet_unavailable');
      return json({ ok: true });
    }
    return json({ ok: false, error: 'unknown_action' }, { status: 400 });
  } catch (error) {
    return json({ ok: false, error: error?.message === 'sheet_key_rejected' ? 'sheet_key_rejected' : 'sheet_unavailable' }, { status: 503 });
  }
}
