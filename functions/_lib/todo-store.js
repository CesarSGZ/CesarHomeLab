// Tareas storage, shared by the signed-in page (/control/api/todo/status) and Claude's door (/api/tareas).
// Every list lives in one row of personal_datasets; writes are changes (ops) applied on top of the newest copy.
import { applyOps, emptyDoc } from '../../control/todo-model.js';

export const DATASET = 'todo', AGENT = 'todo-agent';
const MAX_DOC = 1_900_000;

export async function readDoc(env) {
  const row = await env.CONTROL_DB.prepare('SELECT payload, updated_at FROM personal_datasets WHERE name = ?').bind(DATASET).first();
  return row ? { doc: JSON.parse(row.payload), stamp: row.updated_at } : { doc: emptyDoc(), stamp: null };
}

// Writes only if nobody wrote in between; otherwise the changes are applied again on top of the newer copy.
export async function writeOps(env, ops) {
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

const hex = async text => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)))].map(b => b.toString(16).padStart(2, '0')).join('');

// Claude's key: made from the page, shown once, only its hash is kept. Making a new one retires the old one.
export async function newAgentKey(env) {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const key = 'tareas_' + btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  await env.CONTROL_DB.prepare('INSERT INTO personal_datasets(name,payload,updated_at) VALUES(?,?,?) ON CONFLICT(name) DO UPDATE SET payload=excluded.payload,updated_at=excluded.updated_at')
    .bind(AGENT, JSON.stringify({ hash: await hex(key), created: new Date().toISOString() }), new Date().toISOString()).run();
  return key;
}
export async function agentKeyInfo(env) {
  const row = await env.CONTROL_DB.prepare('SELECT payload FROM personal_datasets WHERE name = ?').bind(AGENT).first();
  return row ? JSON.parse(row.payload) : null;
}
export async function revokeAgentKey(env) {
  await env.CONTROL_DB.prepare('DELETE FROM personal_datasets WHERE name = ?').bind(AGENT).run();
}
export async function agentAuthorised(request, env) {
  const bearer = request.headers.get('authorization') || '';
  if (!bearer.startsWith('Bearer tareas_') || bearer.length > 200) return false;
  const info = await agentKeyInfo(env);
  if (!info?.hash) return false;
  const given = await hex(bearer.slice(7));
  let diff = given.length ^ info.hash.length;
  for (let i = 0; i < given.length; i++) diff |= given.charCodeAt(i) ^ info.hash.charCodeAt(i);
  return diff === 0;
}
