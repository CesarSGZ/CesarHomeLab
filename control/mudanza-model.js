// Mudanza: a relocation plan with dates, owners and states, plus the ticks César makes on top.
// The plan itself is private: it is imported from a JSON file into D1 (personal_datasets 'mudanza'), never kept in the repo.
// Shared by the page (control/mudanza.js) and the API (functions/control/api/mudanza/status.js).

export const STATES = ['done', 'doing', 'wait', 'todo', 'optional'];
export const STATE_LABEL = { done: 'Hecho', doing: 'En curso', wait: 'Esperando', todo: 'Pendiente', optional: 'Opcional' };
export const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const DATE = /^\d{4}-\d{2}-\d{2}$/, ID = /^[a-z0-9][a-z0-9_-]{0,63}$/i;
const str = (v, n) => (typeof v === 'string' ? v : v == null ? '' : String(v)).slice(0, n);
const MAX_ITEMS = 400, MAX_SECTIONS = 30, MAX_FACTS = 30;

// Anything imported goes through here: unknown fields are dropped and lengths capped. Throws if it is not a plan.
export function normPlan(input) {
  const p = typeof input === 'string' ? JSON.parse(input) : input;
  if (!p || typeof p !== 'object' || !Array.isArray(p.items)) throw new Error('invalid_plan');
  const sections = (Array.isArray(p.sections) ? p.sections : []).slice(0, MAX_SECTIONS)
    .map(s => ({ id: str(s?.id, 64), name: str(s?.name, 80).trim() })).filter(s => ID.test(s.id) && s.name);
  const seen = new Set();
  const items = p.items.slice(0, MAX_ITEMS).map(i => ({
    id: str(i?.id, 64),
    section: str(i?.section, 64),
    title: str(i?.title, 300).trim(),
    due: DATE.test(i?.due || '') ? i.due : '',
    approx: i?.approx === true,
    deadline: i?.deadline === true,
    state: STATES.includes(i?.state) ? i.state : 'todo',
    who: str(i?.who, 120).trim(),
    how: str(i?.how, 4000).trim(),
    doneOn: DATE.test(i?.doneOn || '') ? i.doneOn : '',
  })).filter(i => ID.test(i.id) && i.title && !seen.has(i.id) && seen.add(i.id));
  if (!items.length) throw new Error('invalid_plan');
  const pairs = list => (Array.isArray(list) ? list : []).slice(0, MAX_FACTS)
    .map(f => ({ label: str(f?.label, 80).trim(), value: str(f?.value, 300).trim() })).filter(f => f.label && f.value);
  return {
    v: 1,
    title: str(p.title, 120).trim() || 'Mudanza',
    updated: DATE.test(p.updated || '') ? p.updated : '',
    start: DATE.test(p.start || '') ? p.start : '',
    startLabel: str(p.startLabel, 120).trim(),
    status: str(p.status, 4000).trim(),
    facts: pairs(p.facts),
    money: pairs(p.money),
    sections,
    items,
  };
}

// His ticks win over the plan's state; un-ticking something the plan calls done brings it back to pending.
export function stateOf(item, ticks = {}) {
  const t = ticks[item.id];
  if (t && typeof t.done === 'boolean') return t.done ? 'done' : item.state === 'done' ? 'todo' : item.state;
  return item.state;
}
export const isDone = (item, ticks) => stateOf(item, ticks) === 'done';

export function applyTick(ticks, id, done, at = new Date().toISOString()) {
  if (!ID.test(id || '') || typeof done !== 'boolean') throw new Error('invalid_tick');
  return { ...ticks, [id]: { done, at: str(at, 40) } };
}

export const daysUntil = (date, today) => Math.round((Date.parse(date + 'T12:00:00Z') - Date.parse(today + 'T12:00:00Z')) / 864e5);

export function progress(plan, ticks) {
  const counted = plan.items.filter(i => stateOf(i, ticks) !== 'optional' || isDone(i, ticks));
  return { done: counted.filter(i => isDone(i, ticks)).length, total: counted.length };
}

// Progress split at the milestones: 1 January of the start year (when it falls before the start) and the start day.
// Each phase counts the items due before its cut; items due later, or with no date, go to the last phase.
export function phases(plan, ticks) {
  const counted = plan.items.filter(i => stateOf(i, ticks) !== 'optional' || isDone(i, ticks));
  const cuts = [];
  if (plan.start) {
    const ny = plan.start.slice(0, 4) + '-01-01';
    if (ny < plan.start) cuts.push(ny);
    cuts.push(plan.start);
  }
  const out = cuts.map(until => ({ until, done: 0, total: 0 })).concat([{ until: null, done: 0, total: 0 }]);
  for (const i of counted) {
    const k = i.due ? cuts.findIndex(c => i.due < c) : -1;
    const ph = out[k < 0 ? out.length - 1 : k];
    ph.total++;
    if (isDone(i, ticks)) ph.done++;
  }
  return out.filter(ph => ph.total);
}

// Hard deadlines still open, soonest first (overdue included).
export const deadlines = (plan, ticks) => plan.items.filter(i => i.deadline && i.due && !isDone(i, ticks)).sort((a, b) => a.due.localeCompare(b.due));

// What is coming in the next `days` days (deadlines or approximate), still open.
export const soon = (plan, ticks, today, days = 14) => plan.items
  .filter(i => i.due && !isDone(i, ticks) && daysUntil(i.due, today) <= days)
  .sort((a, b) => a.due.localeCompare(b.due));

// Month groups for the timeline. Items without a date go last ("Sin fecha").
export function byMonth(plan) {
  const groups = new Map();
  for (const item of [...plan.items].sort((a, b) => (a.due || '9999').localeCompare(b.due || '9999'))) {
    const key = item.due ? item.due.slice(0, 7) : 'none';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }
  return [...groups].map(([key, items]) => ({ key, name: key === 'none' ? 'Sin fecha' : `${MONTHS[+key.slice(5) - 1]} ${key.slice(0, 4)}`, items }));
}

export function bySection(plan) {
  const names = new Map(plan.sections.map(s => [s.id, s.name]));
  const groups = new Map();
  for (const item of plan.items) {
    const key = item.section || '';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }
  const order = plan.sections.map(s => s.id);
  return [...groups].sort((a, b) => ((order.indexOf(a[0]) + 1) || 999) - ((order.indexOf(b[0]) + 1) || 999))
    .map(([key, items]) => ({ key, name: names.get(key) || key || 'General', items }));
}
