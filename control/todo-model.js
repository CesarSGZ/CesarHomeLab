// Tareas: the to-do lists that replace Microsoft To Do. Pure functions, shared by the page and the API
// (functions/control/api/todo/status.js), so a change is applied the same way on the phone and on the server.

export const MAX_LISTS = 200, MAX_TASKS = 10_000, MAX_STEPS = 100;
export const REPEATS = ['day', 'week', 'month', 'year'];
const DATE = /^\d{4}-\d{2}-\d{2}$/, STAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, ID = /^[\w-]{1,64}$/;

export const emptyDoc = () => ({ v: 1, lists: [{ id: 'tareas', name: 'Tareas', tasks: [] }] });
export const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

const str = (v, max) => String(v ?? '').slice(0, max);
const oneOf = (v, re) => (typeof v === 'string' && re.test(v) ? v : '');

// Anything that reaches a list goes through here: unknown fields are dropped, lengths are capped.
export function normTask(t = {}) {
  const repeat = t.repeat && REPEATS.includes(t.repeat.every)
    ? { every: t.repeat.every, interval: Math.min(Math.max(parseInt(t.repeat.interval, 10) || 1, 1), 99) } : null;
  return {
    id: oneOf(t.id, ID) || newId(),
    title: str(t.title, 400).trim() || 'Sin título',
    done: t.done === true,
    important: t.important === true,
    myDay: oneOf(t.myDay, DATE),
    due: oneOf(t.due, DATE),
    reminder: oneOf(t.reminder, STAMP),
    repeat,
    note: str(t.note, 20_000),
    steps: (Array.isArray(t.steps) ? t.steps : []).slice(0, MAX_STEPS).map(s => ({ id: oneOf(s?.id, ID) || newId(), title: str(s?.title, 400).trim(), done: s?.done === true })).filter(s => s.title),
    created: str(t.created, 40) || new Date().toISOString(),
    completed: t.done === true ? str(t.completed, 40) : '',
  };
}

const countTasks = doc => doc.lists.reduce((n, l) => n + l.tasks.length, 0);
const findTask = (doc, id) => { for (const list of doc.lists) { const i = list.tasks.findIndex(t => t.id === id); if (i >= 0) return { list, i }; } return null; };

// Applies a batch of changes. Throws on anything malformed so a bad batch changes nothing.
export function applyOps(input, ops) {
  const doc = structuredClone(input?.lists?.length ? input : emptyDoc());
  for (const op of ops) {
    if (op?.op === 'list.add') {
      if (!ID.test(op.id || '') || doc.lists.some(l => l.id === op.id)) continue; // a replayed add is harmless
      if (doc.lists.length >= MAX_LISTS) throw new Error('too_many_lists');
      doc.lists.push({ id: op.id, name: str(op.name, 120).trim() || 'Lista', tasks: [] });
    } else if (op?.op === 'list.rename') {
      const list = doc.lists.find(l => l.id === op.id);
      if (list) list.name = str(op.name, 120).trim() || list.name;
    } else if (op?.op === 'list.delete') {
      if (doc.lists.length > 1) doc.lists = doc.lists.filter(l => l.id !== op.id);
    } else if (op?.op === 'task.put') {
      const task = normTask(op.task), target = doc.lists.find(l => l.id === op.list) || doc.lists[0], at = findTask(doc, task.id);
      if (at && at.list === target) at.list.tasks[at.i] = task;
      else {
        if (at) at.list.tasks.splice(at.i, 1);
        else if (countTasks(doc) >= MAX_TASKS) throw new Error('too_many_tasks');
        target.tasks.unshift(task); // new tasks go on top, as in To Do
      }
    } else if (op?.op === 'task.delete') {
      const at = findTask(doc, op.id);
      if (at) at.list.tasks.splice(at.i, 1);
    } else if (op?.op === 'import') {
      importLists(doc, op.lists);
    } else throw new Error('invalid_op');
  }
  return doc;
}

// An import adds to what is there: a list with the same name is reused, and a task already imported
// (same id) is not added twice, so running the same import again changes nothing.
function importLists(doc, lists) {
  if (!Array.isArray(lists)) throw new Error('invalid_import');
  for (const incoming of lists) {
    const name = str(incoming?.name, 120).trim() || 'Importada';
    let list = doc.lists.find(l => l.name.toLowerCase() === name.toLowerCase());
    if (!list) {
      if (doc.lists.length >= MAX_LISTS) throw new Error('too_many_lists');
      list = { id: oneOf(incoming.id, ID) && !doc.lists.some(l => l.id === incoming.id) ? incoming.id : newId(), name, tasks: [] };
      doc.lists.push(list);
    }
    const seen = new Set();
    const fresh = (Array.isArray(incoming.tasks) ? incoming.tasks : []).map(normTask).filter(t => !findTask(doc, t.id) && !seen.has(t.id) && seen.add(t.id));
    if (countTasks(doc) + fresh.length > MAX_TASKS) throw new Error('too_many_tasks');
    list.tasks.push(...fresh);
  }
}

// ---------- Dates ----------
export const addDays = (date, n) => { const d = new Date(date + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
export function nextDue(task, today) {
  const { every, interval } = task.repeat;
  const from = task.due || today, d = new Date(from + 'T12:00:00Z');
  if (every === 'day') d.setUTCDate(d.getUTCDate() + interval);
  else if (every === 'week') d.setUTCDate(d.getUTCDate() + 7 * interval);
  else {
    const day = d.getUTCDate(); d.setUTCDate(1);
    if (every === 'month') d.setUTCMonth(d.getUTCMonth() + interval); else d.setUTCFullYear(d.getUTCFullYear() + interval);
    const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
    d.setUTCDate(Math.min(day, last)); // 31 Jan + 1 month = 28 Feb, not 3 March
  }
  return d.toISOString().slice(0, 10);
}
// Completing a repeating task leaves it done and opens the next one, like To Do.
export function completeTask(task, today, now = new Date().toISOString()) {
  const done = { ...task, done: true, completed: now };
  if (!task.repeat) return { done, next: null };
  return { done, next: { ...task, id: newId(), done: false, completed: '', myDay: '', due: nextDue(task, today), steps: task.steps.map(s => ({ ...s, done: false })), created: now } };
}

// Which bucket a planned task falls in.
export function dueBucket(due, today) {
  if (due < today) return 'overdue';
  if (due === today) return 'today';
  if (due === addDays(today, 1)) return 'tomorrow';
  if (due <= addDays(today, 7)) return 'week';
  return 'later';
}

// The smart lists: Mi día, Importante, Planeado and Todas.
export const SMART = { myday: 'Mi día', important: 'Importante', planned: 'Planeado', all: 'Todas' };
export function tasksFor(doc, view, today) {
  const rows = doc.lists.flatMap(list => list.tasks.map(task => ({ task, list })));
  if (view === 'myday') return rows.filter(r => r.task.myDay === today || (!r.task.done && r.task.due && r.task.due <= today));
  if (view === 'important') return rows.filter(r => r.task.important);
  if (view === 'planned') return rows.filter(r => r.task.due).sort((a, b) => a.task.due.localeCompare(b.task.due));
  if (view === 'all') return rows;
  return rows.filter(r => r.list.id === view);
}
export function counts(doc, today) {
  const out = {};
  for (const view of [...Object.keys(SMART), ...doc.lists.map(l => l.id)]) out[view] = tasksFor(doc, view, today).filter(r => !r.task.done).length;
  return out;
}

// ---------- Import from Microsoft To Do ----------
const stripHtml = html => String(html || '').replace(/<br\s*\/?>|<\/p>|<\/div>|<\/li>/gi, '\n').replace(/<[^>]+>/g, '')
  .replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&')
  .replace(/\n{3,}/g, '\n\n').trim();
// Graph ids are ~150 characters: a short hash keeps them stable so a repeated import is recognised.
export function shortHash(text) {
  let h1 = 0x811c9dc5, h2 = 0x01000193;
  for (let i = 0; i < text.length; i++) { const c = text.charCodeAt(i); h1 = Math.imul(h1 ^ c, 16777619); h2 = Math.imul(h2 ^ c, 2246822519); }
  return (h1 >>> 0).toString(36) + (h2 >>> 0).toString(36);
}
// Dates come in the PC's time zone when the export script asked for it; a date at 22:00-23:00 UTC is the next day in Spain.
function graphDate(value) {
  if (!value?.dateTime) return '';
  const [date, time = ''] = value.dateTime.split('T');
  if (!DATE.test(date)) return '';
  return String(value.timeZone || '').toUpperCase() === 'UTC' && +time.slice(0, 2) >= 12 ? addDays(date, 1) : date;
}
const graphStamp = value => (value?.dateTime && STAMP.test(value.dateTime.slice(0, 16)) ? value.dateTime.slice(0, 16) : '');
const GRAPH_REPEAT = { daily: 'day', weekly: 'week', absoluteMonthly: 'month', relativeMonthly: 'month', absoluteYearly: 'year', relativeYearly: 'year' };
const LIST_NAMES = { defaultList: 'Tareas', flaggedEmails: 'Correo marcado' };

export function fromGraph(data) {
  const lists = Array.isArray(data?.lists) ? data.lists : Array.isArray(data?.value) ? data.value : null;
  if (!lists) throw new Error('not_todo_export');
  return lists.map(list => ({
    name: LIST_NAMES[list.wellknownListName] || list.displayName || 'Lista',
    tasks: (Array.isArray(list.tasks) ? list.tasks : []).map(t => {
      const pattern = t.recurrence?.pattern, every = GRAPH_REPEAT[pattern?.type];
      const note = [t.body?.contentType === 'html' ? stripHtml(t.body.content) : String(t.body?.content || '').trim(), (t.categories || []).length ? 'Categorías: ' + t.categories.join(', ') : '']
        .filter(Boolean).join('\n\n');
      return normTask({
        id: 'ms-' + shortHash(String(t.id || t.title || '')),
        title: t.title,
        done: t.status === 'completed',
        important: t.importance === 'high',
        due: graphDate(t.dueDateTime),
        reminder: t.isReminderOn ? graphStamp(t.reminderDateTime) : '',
        repeat: every ? { every, interval: pattern.interval || 1 } : null,
        note,
        steps: (t.checklistItems || []).map(s => ({ id: 'ms-' + shortHash(String(s.id || s.displayName)), title: s.displayName, done: s.isChecked === true })),
        created: t.createdDateTime || '',
        completed: t.completedDateTime?.dateTime ? t.completedDateTime.dateTime.slice(0, 19) + 'Z' : '',
      });
    }),
  }));
}

// A pasted list: "# Lista" (or "Lista:") starts a list, "- [x] tarea" is done, an indented line is a step.
export function fromText(text) {
  const lists = []; let list = null, task = null;
  for (const raw of String(text || '').split(/\r?\n/)) {
    if (!raw.trim()) continue;
    const head = raw.match(/^\s*#+\s*(.+)$/) || raw.match(/^([^\s\-*•].*):\s*$/);
    if (head) { list = { name: head[1].trim(), tasks: [] }; lists.push(list); task = null; continue; }
    const m = raw.match(/^(\s*)(?:[-*•]|\d+[.)])?\s*(?:\[( |x|X)\])?\s*(.+)$/);
    if (!m) continue;
    const item = { title: m[3].trim(), done: (m[2] || '').toLowerCase() === 'x' };
    if (m[1].length >= 2 && task) { task.steps.push(item); continue; }
    if (!list) { list = { name: 'Tareas', tasks: [] }; lists.push(list); }
    task = { id: 'tx-' + shortHash(list.name + '\n' + item.title), ...item, steps: [] };
    list.tasks.push(task);
  }
  return lists.map(l => ({ name: l.name, tasks: l.tasks.map(normTask) }));
}

// Reads whatever was dropped or pasted: the export script's JSON or plain text.
export function parseImport(text) {
  const clean = String(text || '').replace(/^﻿/, '').trim();
  if (clean.startsWith('{') || clean.startsWith('[')) return fromGraph(JSON.parse(clean));
  return fromText(clean);
}
export function importSummary(lists) {
  const tasks = lists.flatMap(l => l.tasks);
  return { lists: lists.length, tasks: tasks.length, done: tasks.filter(t => t.done).length, steps: tasks.reduce((n, t) => n + t.steps.length, 0) };
}
