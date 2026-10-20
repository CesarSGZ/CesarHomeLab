// Backtest Lab · lado GitHub Actions. Habla con D1 solo por el puente acotado (runtime-db.js).
//   node scripts/backtest-lab.mjs claim <params.json> [weekly]   -> escribe run=true|false en GITHUB_OUTPUT
//   node scripts/backtest-lab.mjs publish <web.json>             -> guarda resultados y cierra la petición
//   node scripts/backtest-lab.mjs fail "<motivo>"                -> marca la petición como fallida
import {appendFileSync, readFileSync, writeFileSync} from 'node:fs';
import {cloudDatabase} from './cloud-db.mjs';

const nowIso = () => new Date().toISOString();

export async function readRequest(db) {
  const row = await db.prepare("SELECT payload,updated_at FROM personal_datasets WHERE name='backtest-lab-request'").first();
  if (!row) return null;
  try { return JSON.parse(row.payload); } catch { return null; }
}

// Cambia el estado solo si sigue siendo el esperado (dos ejecuciones no pueden reclamar la misma petición).
export async function transition(db, request, from, changes) {
  const next = {...request, ...changes, status: changes.status};
  const result = await db.prepare("UPDATE personal_datasets SET payload=?,updated_at=? WHERE name='backtest-lab-request' AND json_extract(payload,'$.status')=? RETURNING payload")
    .bind(JSON.stringify(next), nowIso(), from).all();
  return result.results?.length ? next : null;
}

export async function claim(db, {weekly = false} = {}) {
  const request = await readRequest(db);
  if (request?.status === 'queued') {
    const claimed = await transition(db, request, 'queued', {status: 'running', startedAt: nowIso()});
    if (claimed) return {run: true, trigger: 'manual', params: claimed.params || {}, request: claimed};
  }
  if (weekly) return {run: true, trigger: 'weekly', params: {}, request: null};
  return {run: false};
}

export async function publish(db, payloadText) {
  const payload = JSON.parse(payloadText);
  const request = await readRequest(db);
  if (request?.status === 'running' && payload.trigger === 'manual') {
    payload.requestedBy = request.requestedBy || null;
    payload.requestedAt = request.requestedAt || null;
  }
  const text = JSON.stringify(payload);
  await db.prepare("INSERT INTO personal_datasets(name,payload,updated_at) VALUES('backtest-lab',?,?) ON CONFLICT(name) DO UPDATE SET payload=excluded.payload,updated_at=excluded.updated_at")
    .bind(text, nowIso()).run();
  if (request?.status === 'running' && payload.trigger === 'manual')
    await transition(db, request, 'running', {status: 'done', finishedAt: nowIso()});
  return text.length;
}

export async function fail(db, reason) {
  const request = await readRequest(db);
  if (request?.status === 'running')
    await transition(db, request, 'running', {status: 'failed', finishedAt: nowIso(), error: String(reason || 'error').slice(0, 300)});
}

if (process.argv[1]?.replaceAll('\\', '/').endsWith('/backtest-lab.mjs')) {
  const [command, arg, extra] = process.argv.slice(2);
  const db = cloudDatabase();
  if (command === 'claim') {
    const result = await claim(db, {weekly: extra === 'weekly'});
    if (result.run) writeFileSync(arg, JSON.stringify(result.params));
    const out = process.env.GITHUB_OUTPUT;
    if (out) appendFileSync(out, `run=${result.run}\ntrigger=${result.trigger || ''}\n`);
    console.log(JSON.stringify({run: result.run, trigger: result.trigger, params: result.params}));
  } else if (command === 'publish') {
    console.log('Publicado', await publish(db, readFileSync(arg, 'utf8')), 'bytes');
  } else if (command === 'fail') {
    await fail(db, arg);
  } else {
    console.error('Uso: claim <params.json> [weekly] | publish <web.json> | fail <motivo>');
    process.exit(2);
  }
}
