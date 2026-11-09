import { userCan, validCsrf } from '../../../_lib/auth.js';
import { json, methodNotAllowed } from '../../../_lib/http.js';
import { CESAR_COLUMNS, MARIA_COLUMNS, madridToday, summarize } from '../../../_lib/rivalry.js';

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

// María's week, for the rivalry: only her summary leaves this function, never her rows.
async function rivalSummary(env) {
  try {
    const maria = await env.CONTROL_DB.prepare('SELECT payload FROM personal_datasets WHERE name = ?').bind('maria-lab').first();
    if (!maria) return null;
    const sheet = await readSheet(JSON.parse(maria.payload).sheet);
    return Array.isArray(sheet.filas) ? summarize(sheet.filas, MARIA_COLUMNS, madridToday()) : null;
  } catch { return null; }
}

async function readSheet({ url, key }) {
  const response = await fetch(`${url}?k=${encodeURIComponent(key)}`, { signal: AbortSignal.timeout(25_000), redirect: 'follow' });
  if (!response.ok) throw new Error('sheet_unavailable');
  const data = await response.json();
  if (data.error) throw new Error(data.error === 'clave' ? 'sheet_key_rejected' : 'sheet_unavailable');
  return data;
}

const clean = value => String(value ?? '').replace(/\s+/g, ' ').trim();
// Renames an exercise everywhere: its rows keep their origin and ID, so the history moves with the name.
// Renaming onto an existing name merges both histories, which is how a wrongly named exercise is fixed.
export function renamePlan(sheet, from, to) {
  const ops = sheet.filas.filter(r => r[2] === from).map(r => ({ tipo: 'guardar', fila: { fecha: r[0], dia: r[1], ejercicio: to, musculo: r[3], serie: r[4], reps: r[5], kg: r[6], rpe: r[7], nota: r[8], origen: r[9], id: r[10] } }));
  const rutina = sheet.rutina.map(r => [r.dia, r.nombre, r.orden, r.ejercicio === from ? to : r.ejercicio, r.musculo, r.series, r.reps, r.referencia, r.salto]);
  const seen = new Set(), alternativas = [];
  for (const a of sheet.alternativas) {
    const name = a.ejercicio === from ? to : a.ejercicio;
    if (seen.has(name)) continue;
    seen.add(name); alternativas.push([a.musculo, name, a.referencia]);
  }
  const found = ops.length + sheet.rutina.filter(r => r.ejercicio === from).length + sheet.alternativas.filter(a => a.ejercicio === from).length;
  return { ops, rutina, alternativas, found };
}

function validOp(op) {
  if (op?.tipo === 'borrar') return typeof op.id === 'string' && op.id.length < 80;
  if (op?.tipo === 'alternativa') return typeof op.ejercicio === 'string' && op.ejercicio.trim().length > 0 && op.ejercicio.length < 120 && String(op.musculo || '').length < 40 && String(op.referencia || '').length < 200;
  if (op?.tipo !== 'guardar' || !op.fila || typeof op.fila !== 'object') return false;
  const f = op.fila;
  return typeof f.id === 'string' && f.id.length < 80 && /^\d{4}-\d{2}-\d{2}$/.test(f.fecha) && typeof f.ejercicio === 'string' && f.ejercicio.length < 120
    && Number.isFinite(f.serie) && [f.reps, f.kg, f.rpe].every(v => v === null || v === undefined || Number.isFinite(v)) && String(f.nota || '').length < 500 && String(f.origen || '').length < 40;
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
      const [sheet, rival] = await Promise.all([readSheet(lab.sheet), rivalSummary(env)]);
      const me = rival && Array.isArray(sheet.filas) ? summarize(sheet.filas, CESAR_COLUMNS, madridToday()) : null;
      return json({ ok: true, connected: true, ...sheet, bodyWeight: lab.bodyWeight || [], rival, me });
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
    // The rivalry: the owner pastes María's code once. It is checked against her Sheet before it is stored,
    // and from then on only her summary is read with it, never shown back.
    if (action?.action === 'connect-rival') {
      const match = String(action.code || '').trim().match(CODE);
      if (!match) return json({ ok: false, error: 'invalid_code' }, { status: 400 });
      const sheet = { url: match[1], key: match[2] };
      const data = await readSheet(sheet);
      if (!Array.isArray(data.filas)) throw new Error('sheet_unavailable');
      await env.CONTROL_DB.prepare('INSERT INTO personal_datasets(name,payload,updated_at) VALUES(?,?,?) ON CONFLICT(name) DO UPDATE SET payload=excluded.payload,updated_at=excluded.updated_at')
        .bind('maria-lab', JSON.stringify({ sheet }), new Date().toISOString()).run();
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
    if (action?.action === 'rename') {
      if (!lab?.sheet) return json({ ok: false, error: 'not_connected' }, { status: 409 });
      const from = clean(action.from), to = clean(action.to);
      if (!from || !to || from === to || from.length >= 120 || to.length >= 120) return json({ ok: false, error: 'invalid_name' }, { status: 400 });
      const plan = renamePlan(await readSheet(lab.sheet), from, to);
      if (!plan.found) return json({ ok: false, error: 'not_found' }, { status: 404 });
      const response = await fetch(lab.sheet.url, { method: 'POST', redirect: 'follow', signal: AbortSignal.timeout(25_000), headers: { 'content-type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ k: lab.sheet.key, rutina: plan.rutina, alternativas: plan.alternativas, ops: plan.ops }) });
      const result = await response.json();
      if (!result.ok) throw new Error('sheet_unavailable');
      return json({ ok: true, rows: plan.ops.length });
    }
    return json({ ok: false, error: 'unknown_action' }, { status: 400 });
  } catch (error) {
    const code = error?.message === 'sheet_key_rejected' ? 'sheet_key_rejected' : 'sheet_unavailable';
    return json({ ok: false, error: code }, { status: 503 });
  }
}
