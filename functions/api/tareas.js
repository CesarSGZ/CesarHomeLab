// Claude's door to Tareas: the same lists as /control/#todo, with the key made in Tareas → «Conectar con Claude».
//   GET  /api/tareas                         → the lists, plus a plain-text summary for reading
//   POST /api/tareas {"text": "# Lista\n## Sección\n- tarea 15/01"}  → creates or updates that checklist
//   POST /api/tareas {"ops": [...]}           → any change the page can make (see control/todo-model.js applyOps)
import { readDoc, writeOps, agentAuthorised } from '../_lib/todo-store.js';
import { fromText, routineRows, scheduleText, streak, progress } from '../../control/todo-model.js';
import { madridToday } from '../_lib/rivalry.js';

const MAX_BODY = 1_000_000, MAX_OPS = 500;
const reply = (data, status = 200) => Response.json(data, { status, headers: { 'cache-control': 'no-store' } });

export function summary(doc, today) {
  const lines = [`Tareas a ${today}`];
  for (const list of doc.lists) {
    const p = progress(list);
    lines.push('', `# ${list.name}  [${list.kind}, id ${list.id}${list.kind === 'project' ? `, ${p.done}/${p.total}` : ''}]`);
    if (list.kind === 'routine') { for (const t of list.tasks) lines.push(`- ${t.title} (${scheduleText(t.habit)}, racha ${streak(t, today)}${(t.log || []).includes(today) ? ', hecha hoy' : ''}) id ${t.id}`); continue; }
    let section = null;
    for (const t of list.tasks.filter(t => !t.done || list.kind !== 'tasks')) {
      if (t.section !== section && t.section) lines.push(`## ${t.section}`);
      section = t.section;
      lines.push(`- [${t.done ? 'x' : ' '}] ${t.title}${t.due ? ` (vence ${t.due})` : ''}${t.important ? ' ★' : ''} id ${t.id}`);
    }
  }
  return lines.join('\n');
}

export async function onRequest({ request, env }) {
  if (!['GET', 'POST'].includes(request.method)) return reply({ ok: false, error: 'method_not_allowed' }, 405);
  if (!(await agentAuthorised(request, env))) return reply({ ok: false, error: 'not_authorised' }, 401);
  const today = madridToday();
  if (request.method === 'GET') { const { doc } = await readDoc(env); return reply({ ok: true, today, summary: summary(doc, today), ...doc }); }
  const body = await request.text();
  if (body.length > MAX_BODY) return reply({ ok: false, error: 'request_too_large' }, 413);
  let parsed;
  try { parsed = JSON.parse(body); } catch { return reply({ ok: false, error: 'invalid_request' }, 400); }
  const ops = typeof parsed?.text === 'string' ? [{ op: 'import', update: true, lists: fromText(parsed.text, today) }] : parsed?.ops;
  if (!Array.isArray(ops) || !ops.length || ops.length > MAX_OPS) return reply({ ok: false, error: 'invalid_ops' }, 400);
  try {
    const doc = await writeOps(env, ops);
    return reply({ ok: true, today, summary: summary(doc, today) });
  } catch (error) {
    const code = String(error?.message || '');
    return reply({ ok: false, error: code === 'busy' ? 'busy' : /^(too_|invalid_)/.test(code) ? code : 'invalid_ops' }, code === 'busy' ? 503 : 400);
  }
}
