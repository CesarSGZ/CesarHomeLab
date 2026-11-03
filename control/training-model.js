// Pure training logic. Measurements are supplied only by the private API.
export const F = { FECHA:0, DIA:1, EJ:2, MUSC:3, SERIE:4, REPS:5, KG:6, RPE:7, NOTA:8, ORIGEN:9, ID:10 };
export const RPES = [6,7,7.5,8,8.5,9,9.5,10];
export const num = value => value === '' || value === null || value === undefined ? null : (Number.isFinite(+value) ? +value : null);

// Epley over the reps the set could have reached: 6 reps at @8 count as 8 possible reps.
export function e1rm(kg, reps, rpe) {
  const load = num(kg), done = num(reps), effort = num(rpe);
  if (!load || !done || done > 15) return null;
  const possible = done + (effort ? Math.max(0, 10 - effort) : 0);
  return possible <= 1 ? load : load * (1 + possible / 30);
}
const rowE1rm = row => e1rm(row[F.KG], row[F.REPS], row[F.RPE]);

export function sessions(rows, exercise, before = null) {
  const byDate = new Map();
  for (const row of rows) {
    if (row[F.EJ] !== exercise || (before && row[F.FECHA] >= before)) continue;
    if (!byDate.has(row[F.FECHA])) byDate.set(row[F.FECHA], []);
    byDate.get(row[F.FECHA]).push(row);
  }
  return [...byDate.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([fecha, series]) => ({ fecha, series: series.sort((a, b) => a[F.SERIE] - b[F.SERIE]) }));
}

// Best e1RM of each date, oldest first; dates without a usable set are left out.
export function progression(rows, exercise, metric = 'e1rm', bodyWeight = []) {
  return sessions(rows, exercise).reverse().map(({ fecha, series }) => {
    const best = series.reduce((top, row) => { const v = rowE1rm(row); return v && (!top || v > top.value) ? { value: v, row } : top; }, null);
    if (!best && metric !== 'kg') return null;
    if (metric === 'kg') { const kg = Math.max(0, ...series.map(r => num(r[F.KG]) || 0)); return kg ? { fecha, value: kg, row: series[0] } : null; }
    if (metric === 'relative') { const mass = weightAt(bodyWeight, fecha); return mass ? { fecha, value: best.value / mass, row: best.row } : null; }
    return { fecha, value: best.value, row: best.row };
  }).filter(Boolean);
}

export function weightAt(measurements, fecha) {
  const target = Date.parse(fecha);
  let nearest = null, gap = Infinity;
  for (const m of measurements || []) { const d = Math.abs(Date.parse(m.date) - target); if (d < gap) { gap = d; nearest = m; } }
  return nearest && gap <= 120 * 864e5 ? (nearest.trend ?? nearest.weight) : null;
}

// Marks to beat. Heavy typos are unlikely here because every row is a note that was kept in the sheet.
export function marks(rows, exercise, today = null) {
  let bestE1rm = 0, bestKg = 0;
  const repsAt = new Map();
  for (const row of rows) {
    if (row[F.EJ] !== exercise || (today && row[F.FECHA] >= today)) continue;
    const kg = num(row[F.KG]) || 0, reps = num(row[F.REPS]) || 0, value = rowE1rm(row) || 0;
    bestE1rm = Math.max(bestE1rm, value); bestKg = Math.max(bestKg, kg);
    repsAt.set(kg, Math.max(repsAt.get(kg) || 0, reps));
  }
  return { bestE1rm, bestKg, repsAt };
}

export function recordsFor(set, mark) {
  const out = [], value = e1rm(set.kg, set.reps, set.rpe);
  if (!mark.bestKg) return out;
  if (set.kg > mark.bestKg) out.push('kilos');
  else if (set.reps > (mark.repsAt.get(set.kg) || Infinity)) out.push('repes');
  if (value && value > mark.bestE1rm * 1.001) out.push('e1RM');
  return out;
}

// Next load from the last session's real effort. A suggestion: the lifter decides.
export function suggestion(last, target = {}) {
  if (!last?.series.length) return null;
  const sets = last.series.filter(r => num(r[F.KG]));
  if (!sets.length) return null;
  const top = sets.reduce((a, b) => (num(b[F.KG]) > num(a[F.KG]) ? b : a));
  const rpes = sets.map(r => num(r[F.RPE])).filter(Boolean);
  if (!rpes.length) return null;
  const hardest = Math.max(...rpes), kg = num(top[F.KG]), reps = num(top[F.REPS]) || target.reps || 0, step = target.salto || 2.5;
  if (hardest <= 8) return { kg: kg + step, reps, text: `Última vez @${hardest} como mucho: hay margen para ${kg + step} kg` };
  if (hardest <= 9) return { kg, reps: reps + 1, text: `Última vez @${hardest}: mismos kilos, busca una repe más` };
  return { kg, reps, text: 'Última vez al límite: repite y consolida' };
}

// Hard sets per muscle over the last seven days; below @6 does not count as effective work.
export function weeklySets(rows, today) {
  const start = new Date(Date.parse(today) - 6 * 864e5).toISOString().slice(0, 10), out = new Map();
  for (const row of rows) {
    if (row[F.ORIGEN] !== 'app' || row[F.FECHA] < start || row[F.FECHA] > today) continue;
    const rpe = num(row[F.RPE]);
    if (rpe !== null && rpe < 6) continue;
    out.set(row[F.MUSC], (out.get(row[F.MUSC]) || 0) + 1);
  }
  return [...out.entries()].sort((a, b) => b[1] - a[1]);
}

export function summary(rows, fecha) {
  const today = rows.filter(r => r[F.FECHA] === fecha);
  const rpes = today.map(r => num(r[F.RPE])).filter(Boolean);
  return { sets: today.length, exercises: new Set(today.map(r => r[F.EJ])).size,
    tonnes: today.reduce((total, r) => total + (num(r[F.KG]) || 0) * (num(r[F.REPS]) || 0), 0) / 1000,
    rpe: rpes.length ? rpes.reduce((a, b) => a + b) / rpes.length : null };
}

// Exact name first, then the same first word, then the rest of the muscle.
export function alternatives(list, rows, current, used) {
  const word = String(current.original || current.ejercicio).split(' ')[0].toLowerCase();
  const seen = new Map();
  for (const a of list) if (a.musculo && !used.has(a.ejercicio)) seen.set(a.ejercicio, { ejercicio: a.ejercicio, musculo: a.musculo, referencia: a.referencia });
  for (const row of rows) if (row[F.MUSC] === current.musculo && !used.has(row[F.EJ]) && !seen.has(row[F.EJ])) seen.set(row[F.EJ], { ejercicio: row[F.EJ], musculo: row[F.MUSC], referencia: '' });
  const score = a => (a.ejercicio.toLowerCase().startsWith(word) ? 2 : 0) + (a.musculo === current.musculo ? 1 : 0);
  return [...seen.values()].filter(a => a.musculo === current.musculo || score(a) >= 2).sort((a, b) => score(b) - score(a) || a.ejercicio.localeCompare(b.ejercicio, 'es'));
}

// Each machine, gym or variation is its own exercise: different loads must not share a history.
export const SEPARATOR = ' · ';
export const clean = value => String(value ?? '').replace(/\s+/g, ' ').trim();
export function exerciseName(base, gym = '', variant = '') {
  return [base, gym, variant].map(clean).filter(Boolean).join(SEPARATOR);
}
// Gyms and machines already used, taken from the part after the base name.
export function knownParts(names) {
  const bases = new Set(), tags = new Set();
  for (const name of names) {
    const [base, ...rest] = String(name).split(SEPARATOR);
    if (base) bases.add(base);
    rest.forEach(tag => tags.add(tag));
  }
  return { bases: [...bases].sort((a, b) => a.localeCompare(b, 'es')), tags: [...tags].sort((a, b) => a.localeCompare(b, 'es')) };
}
