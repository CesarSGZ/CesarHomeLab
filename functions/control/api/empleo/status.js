import { userCan, validCsrf } from '../../../_lib/auth.js';
import { json, methodNotAllowed } from '../../../_lib/http.js';
import { readDoc, writeOps, newAgentKey, agentKeyInfo, revokeAgentKey } from '../../../_lib/empleo-store.js';

// Empleo for the signed-in owner. A POST sends changes (ops), never the whole document. It also makes and retires
// the key that Claude and the offer robot use (see /api/empleo), and keeps the file of each CV version:
//   POST {"action":"cv-upload","id":"CV-A","name":"cv.pdf","type":"application/pdf","data":"<base64>"}
//   GET  ?cv=CV-A → the file, to download
// The repository is public, so a CV only ever lives here: one row of personal_datasets per version (empleo-cv:<id>).
const MAX_BODY = 2_000_000, MAX_OPS = 500, MAX_FILE = 1_300_000;
const CV_ID = /^[\w.-]{1,20}$/;
const FILE_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const fileRow = id => `empleo-cv:${id}`;

function bytesOf(base64) {
  try { return Uint8Array.from(atob(base64), c => c.charCodeAt(0)); } catch { return null; }
}

async function download(env, id) {
  if (!CV_ID.test(id)) return json({ ok: false, error: 'invalid_cv' }, { status: 400 });
  const row = await env.CONTROL_DB.prepare('SELECT payload FROM personal_datasets WHERE name = ?').bind(fileRow(id)).first();
  if (!row) return json({ ok: false, error: 'not_found' }, { status: 404 });
  const file = JSON.parse(row.payload);
  return new Response(bytesOf(file.data), { headers: {
    'content-type': file.type || 'application/octet-stream',
    'content-disposition': `attachment; filename*=UTF-8''${encodeURIComponent(file.name || `${id}.pdf`)}`,
    'cache-control': 'no-store', 'x-content-type-options': 'nosniff',
  } });
}

async function upload(env, body) {
  const { id, name, type, data } = body || {};
  if (!CV_ID.test(id || '') || typeof name !== 'string' || !name.trim() || !FILE_TYPES.includes(type) || typeof data !== 'string') return json({ ok: false, error: 'invalid_file' }, { status: 400 });
  const bytes = bytesOf(data);
  if (!bytes || !bytes.length) return json({ ok: false, error: 'invalid_file' }, { status: 400 });
  if (bytes.length > MAX_FILE) return json({ ok: false, error: 'file_too_large' }, { status: 413 });
  const now = new Date().toISOString(), cleanName = name.trim().slice(0, 120);
  await env.CONTROL_DB.prepare('INSERT INTO personal_datasets(name,payload,updated_at) VALUES(?,?,?) ON CONFLICT(name) DO UPDATE SET payload=excluded.payload,updated_at=excluded.updated_at')
    .bind(fileRow(id), JSON.stringify({ name: cleanName, type, data }), now).run();
  const doc = await writeOps(env, [{ op: 'cv.put', cv: { id, file: { name: cleanName, type, size: bytes.length, uploaded: now } } }]);
  return json({ ok: true, ...doc });
}

export async function onRequest({ request, env, data }) {
  if (!['GET', 'POST'].includes(request.method)) return methodNotAllowed(['GET', 'POST']);
  if (!data.session) return json({ ok: false, error: 'not_authenticated' }, { status: 401 });
  if (!userCan(data.session.user, 'empleo:read')) return json({ ok: false, error: 'not_authorised' }, { status: 403 });
  if (request.method === 'GET') {
    const cv = new URL(request.url).searchParams.get('cv');
    if (cv !== null) return download(env, cv);
    const [{ doc }, agent] = await Promise.all([readDoc(env), agentKeyInfo(env)]);
    return json({ ok: true, ...doc, agent: agent ? { created: agent.created } : null });
  }
  if (!validCsrf(request, data.session)) return json({ ok: false, error: 'invalid_csrf' }, { status: 403 });
  const body = await request.text();
  if (body.length > MAX_BODY) return json({ ok: false, error: 'request_too_large' }, { status: 413 });
  let parsed;
  try { parsed = JSON.parse(body); } catch { return json({ ok: false, error: 'invalid_request' }, { status: 400 }); }
  if (parsed?.action === 'agent-key') return json({ ok: true, key: await newAgentKey(env) });
  if (parsed?.action === 'agent-revoke') { await revokeAgentKey(env); return json({ ok: true }); }
  if (parsed?.action === 'cv-upload') return upload(env, parsed);
  const ops = parsed?.ops;
  if (!Array.isArray(ops) || !ops.length || ops.length > MAX_OPS) return json({ ok: false, error: 'invalid_ops' }, { status: 400 });
  try {
    const doc = await writeOps(env, ops);
    // A deleted version takes its file with it.
    for (const op of ops) if (op?.op === 'cv.delete' && CV_ID.test(op.id || '')) await env.CONTROL_DB.prepare('DELETE FROM personal_datasets WHERE name = ?').bind(fileRow(op.id)).run();
    return json({ ok: true, ...doc });
  } catch (error) {
    const code = String(error?.message || '');
    if (code === 'busy') return json({ ok: false, error: 'busy' }, { status: 503 });
    return json({ ok: false, error: /^(too_|invalid_)/.test(code) ? code : 'invalid_ops' }, { status: 400 });
  }
}
