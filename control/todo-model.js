// Tareas: the to-do lists that replace Microsoft To Do. Pure functions, shared by the page and the API
// (functions/control/api/todo/status.js), so a change is applied the same way on the phone and on the server.

export const MAX_LISTS = 200, MAX_TASKS = 10_000, MAX_STEPS = 100;
export const REPEATS = ['day', 'week', 'month', 'year'];
const DATE = /^\d{4}-\d{2}-\d{2}$/, STAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, ID = /^[\w-]{1,64}$/;

export const emptyDoc = () => ({ v: 1, lists: [{ id: 'tareas', name: 'Tareas', kind: 'tasks', tasks: [] }] });
// A list is either things to do (with dates) or a box of ideas (gifts, plans, films...), shown as cards.
// 'check' is a reusable checklist (the shopping list): ticked items stay visible to untick them next time.
// 'project' is a one-off checklist with sections and a progress bar (a move, a trip); 'routine' holds the
// things done every day or on some weekdays (a pill, training), which start fresh each day.
export const KINDS = ['tasks', 'ideas', 'check', 'project', 'routine'];
export const ROUTINES = 'rutinas';
const CHECK_NAMES = /lista de la compra|^\W*compra\b|\bsuper(mercado)?\b|mercadona|mercado|checklist|maleta|equipaje/i;
const IDEA_NAMES = /idea|regal|plan(es)?\b|viaje|escapada|pel[ií]cula|pelis|cine|serie|libro|leer|restaurante|comprar alg[uú]n d[ií]a|capricho|wish|deseo|cumple|navidad|reyes|m[uú]sica|juego|disfra|receta|sitios|lugares|visitar|interesante|curios|contenido|meme|aburri/i;
// To Do shows a leading emoji in a list's name as its icon: "🎂 Ideas cumpleaños".
export function splitEmoji(name) {
  const m = String(name || '').match(/^(\p{Regional_Indicator}{2}|\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic}|\p{Emoji_Modifier})*)\s*(.*)$/u);
  return m && m[2] ? { emoji: m[1], name: m[2] } : { emoji: '', name: String(name || '') };
}
export function guessKind(name) {
  const n = String(name || '');
  if (/capricho/i.test(n)) return 'ideas';
  if (CHECK_NAMES.test(n)) return 'check';
  return IDEA_NAMES.test(n) ? 'ideas' : 'tasks';
}
const kindOf = k => (KINDS.includes(k) ? k : 'tasks');
export const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

const str = (v, max) => String(v ?? '').slice(0, max);
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
export function normHabit(h) {
  if (!h || typeof h !== 'object') return null;
  const days = [...new Set((Array.isArray(h.days) ? h.days : []).map(Number).filter(d => Number.isInteger(d) && d >= 0 && d <= 6))].sort();
  return { days: days.length === 7 ? [] : days, time: oneOf(h.time, TIME) };
}
const normLog = log => [...new Set((Array.isArray(log) ? log : []).filter(d => typeof d === 'string' && DATE.test(d)))].sort().slice(-400);
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
    section: str(t.section, 80).trim(),
    habit: normHabit(t.habit),
    log: normLog(t.log),
  };
}

const countTasks = doc => doc.lists.reduce((n, l) => n + l.tasks.length, 0);
const findTask = (doc, id) => { for (const list of doc.lists) { const i = list.tasks.findIndex(t => t.id === id); if (i >= 0) return { list, i }; } return null; };

// Applies a batch of changes. Throws on anything malformed so a bad batch changes nothing.
export function applyOps(input, ops) {
  const doc = structuredClone(input?.lists?.length ? input : emptyDoc());
  for (const list of doc.lists) list.kind = kindOf(list.kind);
  for (const op of ops) {
    if (op?.op === 'list.add') {
      if (!ID.test(op.id || '') || doc.lists.some(l => l.id === op.id)) continue; // a replayed add is harmless
      if (doc.lists.length >= MAX_LISTS) throw new Error('too_many_lists');
      doc.lists.push({ id: op.id, name: str(op.name, 120).trim() || 'Lista', kind: kindOf(op.kind), tasks: [] });
    } else if (op?.op === 'list.rename') {
      const list = doc.lists.find(l => l.id === op.id);
      if (list) list.name = str(op.name, 120).trim() || list.name;
    } else if (op?.op === 'list.kind') {
      const list = doc.lists.find(l => l.id === op.id);
      if (list) list.kind = kindOf(op.kind);
    } else if (op?.op === 'list.delete') {
      if (doc.lists.length > 1) doc.lists = doc.lists.filter(l => l.id !== op.id);
    } else if (op?.op === 'task.put') {
      const task = normTask(op.task), target = doc.lists.find(l => l.id === op.list) || doc.lists[0], at = findTask(doc, task.id);
      if (at && at.list === target) at.list.tasks[at.i] = task;
      else {
        if (at) at.list.tasks.splice(at.i, 1);
        else if (countTasks(doc) >= MAX_TASKS) throw new Error('too_many_tasks');
        // New tasks go on top, as in To Do; checklists, projects and routines keep their written order.
        if (op.end || ['project', 'routine', 'check'].includes(target.kind)) target.tasks.push(task); else target.tasks.unshift(task);
      }
    } else if (op?.op === 'habit.log') {
      // Ticking a routine only touches that day, so the phone and the PC never undo each other.
      const at = findTask(doc, op.id);
      if (!at || !DATE.test(op.date || '')) continue;
      const task = at.list.tasks[at.i], log = new Set(task.log || []);
      if (op.done) log.add(op.date); else log.delete(op.date);
      task.log = normLog([...log]);
    } else if (op?.op === 'task.delete') {
      const at = findTask(doc, op.id);
      if (at) at.list.tasks.splice(at.i, 1);
    } else if (op?.op === 'seed') {
      // A list prepared by Claude, added once: if César deletes it later it does not come back.
      if (!ID.test(op.id || '')) throw new Error('invalid_seed');
      doc.seeds = Array.isArray(doc.seeds) ? doc.seeds : [];
      if (doc.seeds.includes(op.id)) continue;
      importLists(doc, op.lists);
      doc.seeds.push(op.id);
    } else if (op?.op === 'import') {
      importLists(doc, op.lists, op.update === true);
    } else throw new Error('invalid_op');
  }
  return doc;
}

// An import adds to what is there: a list with the same name is reused, and a task already imported
// (same id) is not added twice, so running the same import again changes nothing.
// With update (a checklist pasted again, or sent by Claude), items already there take the new ticks and dates.
function importLists(doc, lists, update = false) {
  if (!Array.isArray(lists)) throw new Error('invalid_import');
  for (const incoming of lists) {
    const name = str(incoming?.name, 120).trim() || 'Importada';
    // "Mudanza a Ingolstadt" finds "🇩🇪 Mudanza a Ingolstadt": the emoji is decoration.
    const key = n => normal(splitEmoji(n).name);
    let list = doc.lists.find(l => l.name.toLowerCase() === name.toLowerCase()) || doc.lists.find(l => key(l.name) === key(name));
    if (!list) {
      if (doc.lists.length >= MAX_LISTS) throw new Error('too_many_lists');
      list = { id: oneOf(incoming.id, ID) && !doc.lists.some(l => l.id === incoming.id) ? incoming.id : newId(), name, kind: KINDS.includes(incoming.kind) ? incoming.kind : guessKind(name), tasks: [] };
      doc.lists.push(list);
    }
    const seen = new Set();
    const incomingTasks = (Array.isArray(incoming.tasks) ? incoming.tasks : []).map(normTask);
    if (update) for (const t of incomingTasks) {
      // The same item pasted again keeps its place: found by id, or by its title within this list.
      let at = findTask(doc, t.id);
      if (!at) { const i = list.tasks.findIndex(x => normal(x.title) === normal(t.title)); if (i >= 0) { at = { list, i }; t.id = list.tasks[i].id; } }
      if (!at) continue;
      const old = at.list.tasks[at.i];
      if (t.done && !old.done) Object.assign(old, { done: true, completed: new Date().toISOString() });
      if (t.due) old.due = t.due;
    }
    const fresh = incomingTasks.filter(t => !findTask(doc, t.id) && !seen.has(t.id) && seen.add(t.id));
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

// The smart lists: Mi día, Importante, Planeado and Todas. Idea lists only enter them with a date or a star.
export const SMART = { myday: 'Mi día', important: 'Importante', planned: 'Planeado', all: 'Todas' };
export function tasksFor(doc, view, today, query = '') {
  const rows = doc.lists.filter(l => l.kind !== 'routine' || !SMART[view]).flatMap(list => list.tasks.map(task => ({ task, list })));
  if (view === 'myday') return rows.filter(r => r.task.myDay === today || (!r.task.done && r.task.due && r.task.due <= today));
  if (view === 'important') return rows.filter(r => r.task.important);
  if (view === 'planned') return rows.filter(r => r.task.due).sort((a, b) => a.task.due.localeCompare(b.task.due));
  if (view === 'all') return rows.filter(r => !['ideas', 'routine'].includes(r.list.kind));
  if (view === 'search') {
    const q = normal(query);
    return q ? rows.filter(r => normal(r.task.title + ' ' + r.task.note + ' ' + r.task.steps.map(s => s.title).join(' ')).includes(q)) : [];
  }
  return rows.filter(r => r.list.id === view);
}
const normal = s => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
export function counts(doc, today) {
  const out = {};
  for (const view of [...Object.keys(SMART), ...doc.lists.map(l => l.id)]) out[view] = tasksFor(doc, view, today).filter(r => !r.task.done).length;
  return out;
}
// The next deadlines still open, soonest (and overdue) first.
export const upcoming = (doc, today, n = 5) => tasksFor(doc, 'planned', today).filter(r => !r.task.done).slice(0, n);
// ---------- Routines ----------
export const weekday = date => new Date(date + 'T12:00:00Z').getUTCDay();
export const habitDue = (task, date) => !task.habit || !task.habit.days.length || task.habit.days.includes(weekday(date));
export const doneOn = (task, date) => (task.log || []).includes(date);
// Days in a row it was done, counting only the days it was due; today does not break it until the day is over.
export function streak(task, today) {
  let d = habitDue(task, today) && !doneOn(task, today) ? addDays(today, -1) : today, n = 0;
  for (let i = 0; i < 400; i++, d = addDays(d, -1)) {
    if (!habitDue(task, d)) continue;
    if (!doneOn(task, d)) break;
    n++;
  }
  return n;
}
export const routineRows = doc => doc.lists.filter(l => l.kind === 'routine').flatMap(list => list.tasks.map(task => ({ task, list })))
  .sort((a, b) => (a.task.habit?.time || '99').localeCompare(b.task.habit?.time || '99'));
export const routinesToday = (doc, today) => routineRows(doc).filter(r => habitDue(r.task, today));
export function habitHistory(task, today, n = 28) {
  return Array.from({ length: n }, (_, i) => { const date = addDays(today, i - n + 1); return { date, due: habitDue(task, date), done: doneOn(task, date) }; });
}
const DAY_LETTERS = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
export function scheduleText(habit) {
  const days = habit?.days || [];
  const when = !days.length ? 'Cada día' : days.join() === '1,2,3,4,5' ? 'Entre semana' : days.join() === '0,6' ? 'Fines de semana' : [1, 2, 3, 4, 5, 6, 0].filter(d => days.includes(d)).map(d => DAY_LETTERS[d]).join(' ');
  return habit?.time ? `${when} · ${habit.time}` : when;
}

// ---------- Projects ----------
export const progress = list => ({ done: list.tasks.filter(t => t.done).length, total: list.tasks.length });
export function sections(list) {
  const out = [];
  for (const task of list.tasks) {
    const name = task.section || '';
    let g = out.find(x => x.name === name);
    if (!g) out.push(g = { name, tasks: [] });
    g.tasks.push(task);
  }
  return out;
}

export const daysUntil = (date, today) => Math.round((Date.parse(date + 'T12:00:00Z') - Date.parse(today + 'T12:00:00Z')) / 864e5);

// "Pagar la luz mañana", "Cita médico el viernes", "Entregar 30/11": the date is taken out of the title.
const WEEKDAY_NAMES = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
const MONTH_NAMES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
export function parseQuick(text, today) {
  const raw = String(text || '').trim(), plain = normal(raw);
  const at = (re, due) => { const m = plain.match(re); return m && due ? { title: raw.slice(0, m.index).trim().replace(/[,;:-]+$/, '').trim() || raw, due } : null; };
  const year = (d, m) => { let y = +today.slice(0, 4); const iso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`; return iso < today ? `${y + 1}${iso.slice(4)}` : iso; };
  const valid = iso => (iso && !Number.isNaN(Date.parse(iso + 'T12:00:00Z')) && new Date(iso + 'T12:00:00Z').toISOString().slice(0, 10) === iso ? iso : null);
  let m;
  return at(/\s+(para\s+)?hoy$/, today)
    || at(/\s+(para\s+)?pasado\s+manana$/, addDays(today, 2))
    || at(/\s+(para\s+)?manana$/, addDays(today, 1))
    || at(/\s+(la\s+)?(proxima|siguiente)\s+semana$/, addDays(today, 7))
    || ((m = plain.match(/\s+(el\s+|al\s+|este\s+|para\s+el\s+)?(domingo|lunes|martes|miercoles|jueves|viernes|sabado)$/))
      && at(/\s+(el\s+|al\s+|este\s+|para\s+el\s+)?(domingo|lunes|martes|miercoles|jueves|viernes|sabado)$/, addDays(today, ((WEEKDAY_NAMES.indexOf(m[2]) - new Date(today + 'T12:00:00Z').getUTCDay() + 7) % 7) || 7)))
    || ((m = plain.match(/\s+(el\s+|para\s+el\s+|antes\s+del\s+|hasta\s+el\s+)?(\d{1,2})[/.-](\d{1,2})(?:[/.-](\d{2,4}))?$/))
      && at(/\s+(el\s+|para\s+el\s+|antes\s+del\s+|hasta\s+el\s+)?(\d{1,2})[/.-](\d{1,2})(?:[/.-](\d{2,4}))?$/, valid(m[4] ? `${m[4].length === 2 ? '20' + m[4] : m[4]}-${m[3].padStart(2, '0')}-${m[2].padStart(2, '0')}` : year(+m[2], +m[3]))))
    || ((m = plain.match(/\s+(el\s+|para\s+el\s+|antes\s+del\s+|hasta\s+el\s+)?(\d{1,2})\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)$/))
      && at(/\s+(el\s+|para\s+el\s+|antes\s+del\s+|hasta\s+el\s+)?(\d{1,2})\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)$/, valid(year(+m[2], MONTH_NAMES.indexOf(m[3]) + 1))))
    || { title: raw, due: '' };
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
    id: 'ms-' + shortHash(String(list.id || list.displayName || '')),
    name: LIST_NAMES[list.wellknownListName] || list.displayName || 'Lista',
    kind: guessKind(list.displayName),
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

// A pasted list: "# Lista" starts a list, "## Sección" groups what follows (then it is a project), "- [x] tarea"
// is done, an indented line is a step, and a date at the end ("antes del 15/01") becomes the deadline.
// Without any "# " heading, "## Lista" or "Lista:" start lists, as before.
export function fromText(text, today = '') {
  const lines = String(text || '').split(/\r?\n/), hasLists = lines.some(l => /^\s*#\s+\S/.test(l));
  const lists = []; let list = null, task = null, section = '';
  const open = name => { list = { name, tasks: [], sectioned: false }; lists.push(list); task = null; section = ''; };
  for (const raw of lines) {
    if (!raw.trim()) continue;
    const h1 = raw.match(/^\s*#\s+(.+)$/), hn = raw.match(/^\s*#{2,}\s*(.+)$/) || raw.match(/^\s*\*\*(.+?)\*\*:?\s*$/), colon = raw.match(/^([^\s\-*•#].*):\s*$/);
    if (h1 && hasLists) { open(h1[1].trim()); continue; }
    if (hasLists && (hn || colon)) { if (!list) open('Checklist'); section = (hn || colon)[1].trim(); list.sectioned = true; task = null; continue; }
    if (!hasLists && (h1 || hn || colon)) { open((h1 || hn || colon)[1].trim()); continue; }
    const m = raw.match(/^(\s*)(?:[-*•+]|\d+[.)])?\s*(?:\[( |x|X|✓)\])?\s*(.+)$/);
    if (!m) continue;
    const done = /[xX✓]/.test(m[2] || ''), parsed = today ? parseQuick(m[3].trim(), today) : { title: m[3].trim(), due: '' };
    if (m[1].length >= 2 && task) { task.steps.push({ title: m[3].trim(), done }); continue; }
    if (!list) open('Tareas');
    task = { id: 'tx-' + shortHash(list.name + '\n' + section + '\n' + parsed.title), title: parsed.title, due: parsed.due, done, section, steps: [] };
    list.tasks.push(task);
  }
  // Ids come from the names, so the phone and the server name a new list the same way.
  return lists.map(l => ({ id: 'tx-' + shortHash(l.name.toLowerCase()), name: l.name, kind: l.sectioned ? 'project' : guessKind(l.name), tasks: l.tasks.map(normTask) }));
}

// Reads whatever was dropped or pasted: the export script's JSON or plain text.
export function parseImport(text, today = '') {
  const clean = String(text || '').replace(/^﻿/, '').trim();
  if (clean.startsWith('{') || clean.startsWith('[')) return fromGraph(JSON.parse(clean));
  return fromText(clean, today);
}
export function importSummary(lists) {
  const tasks = lists.flatMap(l => l.tasks);
  return { lists: lists.length, tasks: tasks.length, done: tasks.filter(t => t.done).length, steps: tasks.reduce((n, t) => n + t.steps.length, 0) };
}
