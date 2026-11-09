// The friendly rivalry between César's and María's training apps. Each side only ever sees this summary:
// how many days the other trained, whether they trained today, the marks they beat and the km they walked.
// Weights are not comparable between two people, so a record is always "you against your own past".

export const CESAR_COLUMNS = { FECHA: 0, EJ: 2, REPS: 5, KG: 6, NOTA: 8, ORIGEN: 9 };
export const MARIA_COLUMNS = { FECHA: 0, EJ: 2, REPS: 5, KG: 6, NOTA: 7, ORIGEN: 8 };
const WALK = /^caminadora$/i, NOT_A_SET = /^nota$/i;

export const madridToday = (now = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid' }).format(now);
const shift = (iso, days) => new Date(Date.parse(`${iso}T12:00:00Z`) + days * 864e5).toISOString().slice(0, 10);
const monday = iso => shift(iso, -((new Date(`${iso}T12:00:00Z`).getUTCDay() + 6) % 7));
const number = value => (value === '' || value === null || value === undefined || !Number.isFinite(+value) ? null : +value);
// Epley up to 15 reps; beyond that a set says nothing about strength.
const e1rm = (kg, reps) => (kg > 0 && reps >= 1 && reps <= 15 ? (reps === 1 ? kg : kg * (1 + reps / 30)) : 0);

function walkKm(row, c) {
  const m = /^([\d.,]+) km\/h/.exec(String(row[c.NOTA] || ''));
  const speed = m ? parseFloat(m[1].replace(',', '.')) : 0, minutes = number(row[c.REPS]) || 0;
  return speed * minutes / 60;
}

export function summarize(rows, c, today) {
  const week = monday(today), lastWeek = shift(week, -7), recordsFrom = shift(today, -13);
  const lifts = rows.filter(r => !WALK.test(r[c.EJ]) && !NOT_A_SET.test(r[c.EJ]) && /^\d{4}-\d{2}-\d{2}$/.test(String(r[c.FECHA])) && r[c.FECHA] <= today);
  const walks = rows.filter(r => WALK.test(r[c.EJ]) && r[c.FECHA] <= today);
  const days = from => new Set(lifts.filter(r => r[c.FECHA] >= from).map(r => r[c.FECHA]));
  const thisWeek = days(week), sinceLast = days(lastWeek);
  // Weeks in a row with at least one training day, counting back from this week (or the last, if this one is still empty).
  const allDays = new Set(lifts.map(r => r[c.FECHA]));
  const weekHas = start => [...Array(7).keys()].some(i => allDays.has(shift(start, i)));
  let streak = 0, cursor = weekHas(week) ? week : lastWeek;
  while (streak < 200 && weekHas(cursor)) { streak++; cursor = shift(cursor, -7); }
  // Records: the best set of an exercise in the last two weeks beats everything before it. App rows only on the new side,
  // so an imported typo cannot invent a record.
  const byExercise = new Map();
  for (const r of lifts) {
    const value = e1rm(number(r[c.KG]), number(r[c.REPS]));
    if (!value) continue;
    const e = byExercise.get(r[c.EJ]) || { before: 0, best: null };
    if (r[c.FECHA] < recordsFrom) e.before = Math.max(e.before, value);
    else if (r[c.ORIGEN] === 'app' && (!e.best || value > e.best.value)) e.best = { value, kg: number(r[c.KG]), reps: number(r[c.REPS]), fecha: r[c.FECHA] };
    byExercise.set(r[c.EJ], e);
  }
  const records = [...byExercise.entries()].filter(([, e]) => e.best && e.before && e.best.value > e.before * 1.001)
    .map(([ejercicio, e]) => ({ ejercicio, kg: e.best.kg, reps: e.best.reps, fecha: e.best.fecha, mejora: Math.round((e.best.value / e.before - 1) * 1000) / 10 }))
    .sort((a, b) => (a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : b.mejora - a.mejora)).slice(0, 6);
  const km = from => Math.round(walks.filter(r => r[c.FECHA] >= from).reduce((t, r) => t + walkKm(r, c), 0) * 10) / 10;
  const last = lifts.reduce((a, r) => (r[c.FECHA] > a ? r[c.FECHA] : a), '');
  return {
    today, trainedToday: allDays.has(today), walkedToday: walks.some(r => r[c.FECHA] === today), lastDay: last || null,
    week: thisWeek.size, lastWeek: [...sinceLast].filter(d => d < week).length, streak,
    year: days(shift(today, -364)).size, records, walkWeek: km(week), walkMonth: km(shift(today, -29))
  };
}
