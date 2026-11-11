// Pure money logic for Gastos. Rows arrive as the Sheet's columns.
export const M = { FECHA: 0, TIPO: 1, IMPORTE: 2, CAT: 3, CONCEPTO: 4, CUENTA: 5, ORIGEN: 6, ID: 7, HORA: 8 };
export const R = { ID: 0, TIPO: 1, IMPORTE: 2, CAT: 3, CONCEPTO: 4, FREQ: 5, DIA: 6, MES: 7, DESDE: 8, HASTA: 9, ACTIVO: 10 };
export const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
export const WEEKDAYS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];

const num = v => (Number.isFinite(+v) ? +v : 0);
const iso = d => d.toISOString().slice(0, 10);
const utc = s => new Date(`${s}T12:00:00Z`);
export const shiftDays = (s, n) => iso(new Date(utc(s).getTime() + n * 864e5));
const daysIn = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate();
const isActive = r => r[R.ACTIVO] !== false && String(r[R.ACTIVO]).toLowerCase() !== 'false';
export const monthOf = s => String(s).slice(0, 7);
export function shiftMonth(month, n) { const [y, m] = month.split('-').map(Number), d = new Date(Date.UTC(y, m - 1 + n, 1)); return iso(d).slice(0, 7); }
export const monthName = month => `${MONTHS[+month.slice(5, 7) - 1]} ${month.slice(0, 4)}`;

// Each date a recurring item falls on in [from, to]. Monthly on day N (the last day if the month is shorter),
// yearly on day N of month M, weekly on weekday N (1 = Monday).
export function occurrences(rec, from, to) {
  if (!isActive(rec)) return [];
  const start = rec[R.DESDE] && rec[R.DESDE] > from ? rec[R.DESDE] : from, end = rec[R.HASTA] && rec[R.HASTA] < to ? rec[R.HASTA] : to;
  if (start > end) return [];
  const out = [], day = Math.max(1, num(rec[R.DIA]) || 1);
  if (rec[R.FREQ] === 'semanal') {
    let d = utc(start);
    while ((d.getUTCDay() + 6) % 7 + 1 !== Math.min(7, day)) d = new Date(d.getTime() + 864e5);
    for (; iso(d) <= end; d = new Date(d.getTime() + 7 * 864e5)) out.push(iso(d));
    return out;
  }
  for (let month = monthOf(start); month <= monthOf(end); month = shiftMonth(month, 1)) {
    const [y, m] = month.split('-').map(Number);
    if (rec[R.FREQ] === 'anual' && m !== (num(rec[R.MES]) || 1)) continue;
    const date = `${month}-${String(Math.min(day, daysIn(y, m))).padStart(2, '0')}`;
    if (date >= start && date <= end) out.push(date);
  }
  return out;
}
export const recurringId = (rec, date) => `r-${rec[R.ID]}-${date}`;
// Charges whose day has come and are not in Movimientos yet: the app writes them, with an ID that never repeats.
// It looks back two months at most, and never before the item's start date.
export function dueRecurring(recs, movs, today) {
  const have = new Set(movs.map(m => String(m[M.ID])));
  const out = [];
  for (const rec of recs) for (const date of occurrences(rec, shiftDays(today, -62), today)) {
    const id = recurringId(rec, date);
    if (!have.has(id)) out.push([date, rec[R.TIPO], num(rec[R.IMPORTE]), rec[R.CAT], rec[R.CONCEPTO], '', 'recurrente', id, '']);
  }
  return out;
}
export function upcoming(recs, today, days = 35) {
  return recs.flatMap(rec => occurrences(rec, shiftDays(today, 1), shiftDays(today, days)).map(fecha => ({ fecha, rec })))
    .sort((a, b) => (a.fecha < b.fecha ? -1 : 1));
}
// What a recurring item costs per month on average.
export function monthlyEquivalent(rec) {
  const amount = num(rec[R.IMPORTE]);
  return rec[R.FREQ] === 'anual' ? amount / 12 : rec[R.FREQ] === 'semanal' ? amount * 52 / 12 : amount;
}
export function fixedPerMonth(recs) {
  const active = recs.filter(isActive);
  const sum = tipo => active.filter(r => r[R.TIPO] === tipo).reduce((t, r) => t + monthlyEquivalent(r), 0);
  return { gastos: sum('Gasto'), ingresos: sum('Ingreso') };
}

export function monthTotals(movs, month) {
  const rows = movs.filter(m => monthOf(m[M.FECHA]) === month);
  const gastos = rows.filter(m => m[M.TIPO] === 'Gasto').reduce((t, m) => t + num(m[M.IMPORTE]), 0);
  const ingresos = rows.filter(m => m[M.TIPO] === 'Ingreso').reduce((t, m) => t + num(m[M.IMPORTE]), 0);
  const cats = new Map();
  for (const m of rows) if (m[M.TIPO] === 'Gasto') cats.set(m[M.CAT] || 'Otros', (cats.get(m[M.CAT] || 'Otros') || 0) + num(m[M.IMPORTE]));
  return { gastos, ingresos, neto: ingresos - gastos, ahorro: ingresos ? (ingresos - gastos) / ingresos : null, porCategoria: [...cats].sort((a, b) => b[1] - a[1]), count: rows.length };
}
export function monthlySeries(movs, month, n = 12) {
  return Array.from({ length: n }, (_, i) => shiftMonth(month, i - n + 1)).map(m => ({ month: m, ...monthTotals(movs, m) }));
}
// The usual spend: the mean of the previous full months that have any movement.
export function usualSpend(movs, month, n = 3) {
  const list = Array.from({ length: n }, (_, i) => monthTotals(movs, shiftMonth(month, -1 - i))).filter(t => t.count);
  return list.length ? list.reduce((t, x) => t + x.gastos, 0) / list.length : null;
}
// Spend so far against what the previous months had spent by the same day: rent paid on the 1st is not overspending.
export function pace(movs, month, today) {
  if (monthOf(today) !== month) return null;
  const day = +today.slice(8, 10), spentBy = (m, d) => movs.filter(x => x[M.TIPO] === 'Gasto' && monthOf(x[M.FECHA]) === m && +String(x[M.FECHA]).slice(8, 10) <= d).reduce((t, x) => t + num(x[M.IMPORTE]), 0);
  const past = [1, 2, 3].map(i => shiftMonth(month, -i)).filter(m => movs.some(x => monthOf(x[M.FECHA]) === m));
  if (!past.length) return null;
  const expected = past.reduce((t, m) => t + spentBy(m, day), 0) / past.length, spent = spentBy(month, day);
  return expected ? { usual: usualSpend(movs, month), expected, spent, ratio: spent / expected } : null;
}
export function budgets(categorias, totals) {
  const spent = new Map(totals.porCategoria);
  return categorias.filter(c => c[0] === 'Gasto' && num(c[2]) > 0).map(c => ({ cat: c[1], budget: num(c[2]), spent: spent.get(c[1]) || 0, share: (spent.get(c[1]) || 0) / num(c[2]) }));
}
// Cells as the app writes them back: text where text is expected, numbers where numbers are.
const str = v => String(v ?? '');
export const normTime = v => { const x = /^(\d{1,2}):(\d{2})/.exec(str(v).trim()); return x && +x[1] < 24 && +x[2] < 60 ? `${x[1].padStart(2, '0')}:${x[2]}` : ''; };
export const normMov = m => [str(m[0]).slice(0, 10), m[1] === 'Ingreso' ? 'Ingreso' : 'Gasto', num(m[2]), str(m[3]), str(m[4]), str(m[5]), str(m[6]), str(m[7]), normTime(m[8])];
export const normRec = r => [str(r[0]), r[1] === 'Ingreso' ? 'Ingreso' : 'Gasto', num(r[2]), str(r[3]), str(r[4]), ['anual', 'semanal'].includes(r[5]) ? r[5] : 'mensual',
  Math.round(num(r[6])) || 1, r[7] === '' || r[7] === null || r[7] === undefined ? '' : Math.round(num(r[7])) || 1, str(r[8]).slice(0, 10), str(r[9]).slice(0, 10), !(r[10] === false || String(r[10]).toLowerCase() === 'false')];
export const newId = () => 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

// ---------- Statistics: when and on what the money goes ----------
// Only spending typed in by hand counts: automatic recurring charges say nothing about habits.
export function habitRows(movs, from, to) {
  return movs.filter(m => m[M.TIPO] === 'Gasto' && m[M.ORIGEN] !== 'recurrente' && (!from || m[M.FECHA] >= from) && (!to || m[M.FECHA] <= to));
}
// Spend per hour of the day (0-23). Rows without a known time are counted apart, not guessed.
export function byHour(rows) {
  const hours = Array.from({ length: 24 }, (_, h) => ({ h, total: 0, count: 0 }));
  let unknown = 0;
  for (const m of rows) {
    const t = normTime(m[M.HORA]);
    if (!t) { unknown++; continue; }
    const b = hours[+t.slice(0, 2)]; b.total += num(m[M.IMPORTE]); b.count++;
  }
  return { hours, unknown, known: rows.length - unknown };
}
// Spend per weekday (index 0 = Monday).
export function byWeekday(rows) {
  const days = Array.from({ length: 7 }, (_, d) => ({ d, total: 0, count: 0 }));
  for (const m of rows) { const b = days[(utc(m[M.FECHA]).getUTCDay() + 6) % 7]; b.total += num(m[M.IMPORTE]); b.count++; }
  return days;
}
// Parts of the day, for a one-line reading of the hour chart.
export const DAYPARTS = [['madrugada', 0, 6], ['mañana', 6, 12], ['mediodía', 12, 16], ['tarde', 16, 21], ['noche', 21, 24]];
export function dayparts(hours) {
  return DAYPARTS.map(([name, a, b]) => ({ name, total: hours.slice(a, b).reduce((t, x) => t + x.total, 0), count: hours.slice(a, b).reduce((t, x) => t + x.count, 0) }));
}
export function categoryStats(rows) {
  const cats = new Map();
  for (const m of rows) { const c = m[M.CAT] || 'Otros', x = cats.get(c) || { cat: c, total: 0, count: 0 }; x.total += num(m[M.IMPORTE]); x.count++; cats.set(c, x); }
  return [...cats.values()].map(x => ({ ...x, ticket: x.total / x.count })).sort((a, b) => b.total - a.total);
}
// Monthly spend per category for the last n months, for the evolution chart.
export function categorySeries(movs, month, cats, n = 6) {
  const months = Array.from({ length: n }, (_, i) => shiftMonth(month, i - n + 1));
  return cats.map(cat => ({ cat, values: months.map(mo => movs.filter(m => m[M.TIPO] === 'Gasto' && (m[M.CAT] || 'Otros') === cat && monthOf(m[M.FECHA]) === mo).reduce((t, m) => t + num(m[M.IMPORTE]), 0)), months }));
}
