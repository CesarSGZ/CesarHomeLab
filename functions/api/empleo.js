// The door to Empleo for Claude and the offer robot, with the key made in Empleo → Ajustes.
//   GET  /api/empleo                → everything, plus a plain-text summary (best new offers, open applications)
//   POST /api/empleo {"ops": [...]} → any change the page can make (see control/empleo-model.js applyOps), e.g.
//        {"op":"offers.add","offers":[...]}  {"op":"offer.put","offer":{"id":"...","letter":"Dear ..."}}
import { readDoc, writeOps, agentAuthorised } from '../_lib/empleo-store.js';
import { summary } from '../../control/empleo-model.js';
import { madridToday } from '../_lib/rivalry.js';

const MAX_BODY = 1_500_000, MAX_OPS = 500;
const reply = (data, status = 200) => Response.json(data, { status, headers: { 'cache-control': 'no-store' } });

export async function onRequest({ request, env }) {
  if (!['GET', 'POST'].includes(request.method)) return reply({ ok: false, error: 'method_not_allowed' }, 405);
  if (!(await agentAuthorised(request, env))) return reply({ ok: false, error: 'not_authorised' }, 401);
  const today = madridToday();
  if (request.method === 'GET') { const { doc } = await readDoc(env); return reply({ ok: true, today, summary: summary(doc, today), ...doc }); }
  const body = await request.text();
  if (body.length > MAX_BODY) return reply({ ok: false, error: 'request_too_large' }, 413);
  let parsed;
  try { parsed = JSON.parse(body); } catch { return reply({ ok: false, error: 'invalid_request' }, 400); }
  const ops = parsed?.ops;
  if (!Array.isArray(ops) || !ops.length || ops.length > MAX_OPS) return reply({ ok: false, error: 'invalid_ops' }, 400);
  try {
    const before = (await readDoc(env)).doc.offers.length;
    const doc = await writeOps(env, ops);
    return reply({ ok: true, today, added: Math.max(0, doc.offers.length - before), summary: summary(doc, today) });
  } catch (error) {
    const code = String(error?.message || '');
    return reply({ ok: false, error: code === 'busy' ? 'busy' : /^(too_|invalid_)/.test(code) ? code : 'invalid_ops' }, code === 'busy' ? 503 : 400);
  }
}
