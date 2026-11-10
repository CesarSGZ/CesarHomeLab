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
    if (row[F.ORIGEN] !== 'app' || row[F.FECHA] < start || row[F.FECHA] > today || row[F.EJ] === 'Caminadora') continue;
    const rpe = num(row[F.RPE]);
    if (rpe !== null && rpe < 6) continue;
    out.set(row[F.MUSC], (out.get(row[F.MUSC]) || 0) + 1);
  }
  return [...out.entries()].sort((a, b) => b[1] - a[1]);
}

export function summary(rows, fecha) {
  const today = rows.filter(r => r[F.FECHA] === fecha && r[F.EJ] !== 'Caminadora');
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
// A name reads "Exercise · Machine · Gym · Variant", and only the exercise is required.
export const SEPARATOR = ' · ';
export const clean = value => String(value ?? '').replace(/\s+/g, ' ').trim();
export function exerciseName(...parts) {
  return parts.map(clean).filter(Boolean).join(SEPARATOR);
}
export function nameParts(name) {
  const [base = '', ...tags] = String(name).split(SEPARATOR);
  return { base, tags };
}
const GYM = /vivagym|basic ?fit|dreamfit/i;
// Machines that only exist in one gym: typing the machine is enough.
const MACHINE_GYM = { tgd: 'Dreamfit' };
export const gymFor = (machine, gym) => clean(gym) || MACHINE_GYM[clean(machine).toLowerCase()] || '';
const VARIANT = /unilateral|individual|parcial|parada|neutro|recorrido|alta|baja|fija|suelo|banco|sentado|goma|regulable/i;
const byName = list => [...list].sort((a, b) => a.localeCompare(b, 'es'));
// Parts already used, sorted into the field where they belong.
export function knownParts(names) {
  const bases = new Set(), machines = new Set(), gyms = new Set(), variants = new Set();
  for (const name of names) {
    const { base, tags } = nameParts(name);
    if (base) bases.add(base);
    for (const tag of tags) (GYM.test(tag) ? gyms : VARIANT.test(tag) ? variants : machines).add(tag);
  }
  return { bases: byName(bases), machines: byName(machines), gyms: byName(gyms), variants: byName(variants) };
}
// The other way round, to edit a name: each tag goes back to the field it would have been typed in.
export function splitName(name) {
  const { base, tags } = nameParts(name), machine = [], gym = [], variant = [];
  for (const tag of tags) (GYM.test(tag) ? gym : VARIANT.test(tag) ? variant : machine).push(tag);
  return { base, machine: machine.join(SEPARATOR), gym: gym.join(SEPARATOR), variant: variant.join(SEPARATOR) };
}
// Accents, capitals and the order of the tags must not create a second history.
const plain = value => clean(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
export function sameExercise(a, b) {
  const key = name => { const { base, tags } = nameParts(name); return [plain(base), ...tags.map(plain).sort()].join('|'); };
  return key(a) === key(b);
}
export const findExercise = (names, name) => [...names].find(existing => sameExercise(existing, name)) || null;
// Options under their exercise, the current one first, so the machine or gym is the only choice left.
export function groupByExercise(options, currentBase = '') {
  const groups = new Map(currentBase ? [[currentBase, []]] : []);
  for (const option of options) {
    const { base, tags } = nameParts(option.ejercicio);
    if (!groups.has(base)) groups.set(base, []);
    groups.get(base).push({ ...option, tags });
  }
  return [...groups].map(([base, items]) => ({ base, items: items.sort((a, b) => a.tags.length - b.tags.length || a.ejercicio.localeCompare(b.ejercicio, 'es')) }))
    .sort((a, b) => (b.base === currentBase) - (a.base === currentBase) || a.base.localeCompare(b.base, 'es'));
}

// ---------- Treadmill: minutes in Reps, "6 km/h, 2°" in Nota and no load, so it never adds tonnes ----------
export const WALK = 'Caminadora';
export const WALK_DEFAULT = { vel: 6, inc: 0, min: 20 };
export const isWalk = row => row[F.EJ] === WALK;
const decimal = value => parseFloat(String(value).replace(',', '.'));
export function walkOf(row) {
  const m = /^([\d.,]+) km\/h, ([\d.,]+)°/.exec(String(row[F.NOTA] || ''));
  const vel = m ? decimal(m[1]) : WALK_DEFAULT.vel, inc = m ? decimal(m[2]) : WALK_DEFAULT.inc, min = num(row[F.REPS]) || 0;
  return { vel, inc, min, km: vel * min / 60 };
}
export const walkNote = (vel, inc) => `${String(vel).replace('.', ',')} km/h, ${String(inc).replace('.', ',')}°`;

// ---------- Muscles: the Músculo column is too coarse (Hombros mixed press, raises and face pulls) ----------
// Read from the exercise name, so every row since 2018 lands in the same group.
export const MUSCLES = [
  { id: 'pecho', name: 'Pecho', test: /^(bench press|chest press|dumbbell chest|pecho|aperturas$)/i },
  { id: 'deltAnt', name: 'Hombro frontal', test: /^(overhead press|aperturas frontales|hombro anterior)/i },
  { id: 'deltLat', name: 'Hombro lateral', test: /^(lateral raise|delts)/i },
  { id: 'deltPost', name: 'Hombro posterior', test: /face pull/i },
  { id: 'dorsal', name: 'Dorsal', test: /^(lat pulldown|dominadas|straight arm)/i },
  { id: 'espalda', name: 'Espalda media', test: /row|^remo/i },
  { id: 'biceps', name: 'Bíceps', test: /^(b[ií]ceps|ballesyan)/i },
  { id: 'triceps', name: 'Tríceps', test: /^(tr[ií]ceps|french press|cable extension|pjr)/i },
  { id: 'cuadriceps', name: 'Cuádriceps', test: /^(sentadilla|hacka|leg extension|belt squat|step down|wall sit)/i },
  { id: 'femoral', name: 'Femoral', test: /leg curl|romanian/i },
  { id: 'cadena', name: 'Peso muerto', test: /^deadlift/i },
  { id: 'gluteo', name: 'Glúteo', test: /hip thrust/i },
  { id: 'abductores', name: 'Abductores', test: /^abductor/i },
  { id: 'gemelo', name: 'Gemelos', test: /^gemelos/i },
  { id: 'abdomen', name: 'Abdomen', test: /abs|crunch|leg raise|wood chopper/i }
];
export function muscleOf(name, column = '') {
  const base = nameParts(name).base;
  const hit = MUSCLES.find(m => m.test.test(base));
  if (hit) return hit.id;
  return MUSCLES.find(m => plain(m.name) === plain(column))?.id || null;
}

// ---------- What each session is worth ----------
export const MEASURES = {
  rm: { name: 'e1RM', unit: 'kg', text: 'El peso que moverías a una repe, estimado con la mejor serie del día (Epley; el RPE suma las repes en reserva).' },
  volumen: { name: 'Kg × repes', unit: 'kg·rep', text: 'Peso medio por repes medias de las series del día: sube tanto con más peso como con más repes.' },
  medio: { name: 'Peso medio', unit: 'kg', text: 'Media del peso de todas las series del día.' },
  relative: { name: '× peso corporal', unit: '× peso', text: 'e1RM entre tu peso de Libra más cercano a esa fecha.' }
};
// Isolation work grows mostly through reps; compound lifts, through load.
const ISOLATION = /raise|aperturas|face pull|delts|curl|b[ií]ceps|tr[ií]ceps|extension|french|pullover|gemelos|abs|crunch|abductor|hombro anterior|straight arm/i;
export const defaultMeasure = name => (ISOLATION.test(nameParts(name).base) ? 'volumen' : 'rm');
const mean = list => list.reduce((a, b) => a + b, 0) / list.length;

// One entry per date, oldest first.
export function sessionMeasures(rows, exercise, bodyWeight = []) {
  return sessions(rows, exercise).reverse().map(({ fecha, series }) => {
    const kgs = series.map(r => num(r[F.KG])).filter(v => v > 0);
    const reps = series.map(r => num(r[F.REPS])).filter(v => v >= 1 && v <= 30);
    const rms = series.map(rowE1rm).filter(Boolean);
    const rm = rms.length ? Math.max(...rms) : 0, medio = kgs.length ? mean(kgs) : 0;
    const mass = rm ? weightAt(bodyWeight, fecha) : null;
    return { fecha, series, rm, medio, volumen: medio && reps.length ? medio * mean(reps) : 0, relative: mass ? rm / mass : 0 };
  });
}

// ---------- Strength against other men ----------
// Strength Level male standards at 80 and 90 kg of body weight: beginner, novice, intermediate, advanced and elite,
// stronger than 5, 20, 50, 80 and 95 % of the men who log lifts there (not of everyone). 1RM in kg; dumbbells per dumbbell.
export const STANDARDS = {
  bench: [[56, 75, 98, 124, 151], [65, 85, 109, 137, 165]],
  incline: [[50, 66, 87, 109, 134], [58, 76, 98, 122, 147]],
  inclineDb: [[22, 29, 39, 50, 62], [25, 33, 44, 55, 68]],
  chestPress: [[39, 61, 89, 123, 160], [45, 68, 98, 132, 171]],
  ohp: [[33, 46, 62, 81, 101], [38, 53, 70, 90, 111]],
  dbShoulder: [[15, 22, 31, 42, 54], [18, 25, 35, 46, 59]],
  dbLateral: [[5, 10, 16, 25, 34], [6, 11, 18, 27, 37]],
  cableLateral: [[3, 8, 16, 27, 39], [4, 9, 18, 29, 41]],
  machineLateral: [[25, 41, 61, 84, 111], [30, 47, 68, 93, 121]],
  frontRaise: [[4, 10, 17, 27, 38], [5, 11, 19, 29, 41]],
  facePull: [[15, 29, 47, 69, 95], [18, 32, 51, 75, 101]],
  pulldown: [[47, 64, 85, 108, 133], [52, 70, 92, 116, 142]],
  bentRow: [[48, 66, 88, 114, 141], [56, 75, 99, 125, 154]],
  dbRow: [[19, 30, 43, 59, 76], [23, 34, 48, 65, 83]],
  tbar: [[38, 58, 82, 111, 143], [45, 66, 92, 123, 156]],
  cableRow: [[47, 65, 87, 112, 140], [53, 72, 96, 122, 150]],
  machineRow: [[47, 72, 104, 142, 184], [54, 81, 115, 155, 198]],
  squat: [[75, 101, 132, 168, 206], [87, 115, 148, 186, 226]],
  hack: [[63, 102, 152, 213, 280], [74, 115, 168, 232, 302]],
  legExt: [[48, 72, 103, 140, 180], [53, 79, 111, 149, 191]],
  deadlift: [[89, 119, 155, 196, 239], [102, 134, 172, 215, 260]],
  rdl: [[65, 92, 125, 163, 203], [75, 104, 139, 179, 221]],
  standingCurl: [[11, 25, 46, 73, 105], [13, 28, 50, 79, 112]],
  lyingCurl: [[30, 46, 66, 90, 116], [35, 51, 73, 98, 125]],
  hipThrust: [[56, 96, 149, 213, 285], [68, 111, 168, 236, 311]],
  calf: [[49, 88, 141, 207, 282], [57, 99, 155, 224, 302]],
  barbellCurl: [[22, 33, 46, 63, 80], [25, 36, 51, 68, 87]],
  preacher: [[20, 31, 45, 61, 78], [23, 35, 49, 66, 84]],
  cableCurl: [[20, 33, 51, 73, 98], [23, 37, 56, 79, 104]],
  inclineCurl: [[10, 14, 20, 26, 33], [11, 16, 22, 28, 36]],
  pushdown: [[22, 36, 56, 80, 107], [25, 41, 62, 87, 115]],
  ropePushdown: [[17, 30, 46, 66, 89], [20, 34, 51, 72, 96]],
  dbTriceps: [[6, 12, 22, 33, 47], [7, 14, 24, 37, 51]],
  lyingTriceps: [[20, 30, 43, 59, 76], [24, 35, 49, 65, 83]],
  machineTriceps: [[31, 50, 73, 102, 133], [35, 55, 79, 109, 141]],
  cableCrunch: [[26, 44, 68, 97, 130], [29, 48, 73, 103, 136]]
};
// Every way of doing a lift should count, so changing machine, gym or variant never resets the comparison.
// [name test, standard, factor]: the factor turns what is logged into what the standard measures.
// One arm or one leg at a time: ×1.8, both sides minus the usual ~10 % one-side advantage, except dumbbell standards,
// which are already per dumbbell. Partial range: ×0.8. Bands change the load along the lift, so they are left out.
// St Leg Curl is the standing, one-leg curl: its standard is already per leg.
const PER_SIDE = new Set(['inclineDb', 'dbShoulder', 'dbLateral', 'frontRaise', 'dbRow', 'inclineCurl', 'dbTriceps', 'standingCurl']);
const STANDARD_OF = [
  [/goma/i, null],
  [/^bench press inclinado/i, 'incline'], [/^bench press/i, 'bench'], [/^dumbbell chest press inclinado/i, 'inclineDb'], [/^(chest press|pecho m[aá]quina)/i, 'chestPress'],
  [/^overhead press mancuernas/i, 'dbShoulder'], [/^overhead press/i, 'ohp'], [/^aperturas frontales$/i, 'frontRaise'],
  [/^lateral raise dumbbells/i, 'dbLateral'], [/^lateral raise polea/i, 'cableLateral'], [/^(lateral raise|delts)/i, 'machineLateral'], [/face pull/i, 'facePull'],
  [/^lat pulldown/i, 'pulldown'], [/^barbell row/i, 'bentRow'], [/dumbbell row/i, 'dbRow'], [/^remo t\b/i, 'tbar'], [/^remo bajo polea/i, 'cableRow'],
  [/^remo medio · tg/i, 'machineRow', 2], [/^(remo|vertical row)/i, 'machineRow'],
  [/^sentadilla/i, 'squat'], [/^hacka/i, 'hack'], [/^leg extension/i, 'legExt'], [/^deadlift/i, 'deadlift'], [/^romanian/i, 'rdl'],
  [/^st leg curl/i, 'standingCurl'], [/^leg curl/i, 'lyingCurl'], [/^hip thrust/i, 'hipThrust'], [/^gemelos/i, 'calf'],
  [/^b[ií]ceps curl barra/i, 'barbellCurl'], [/^b[ií]ceps (curl scott|predicador)/i, 'preacher'], [/^(b[ií]ceps curl polea|ballesyan)/i, 'cableCurl'], [/^b[ií]ceps dumbbells/i, 'inclineCurl'],
  [/^tr[ií]ceps polea cuerda alta/i, 'ropePushdown'], [/^(tr[ií]ceps extensi[oó]n polea|tr[ií]ceps polea x|cable extension)/i, 'pushdown'], [/^tr[ií]ceps dumbbell extension/i, 'dbTriceps'],
  [/^french press/i, 'lyingTriceps'], [/^tr[ií]ceps (m[aá]quina|extensi[oó]n barra|press sentado)/i, 'machineTriceps'], [/^(weighted crunch|abs de pie polea)/i, 'cableCrunch']
];
export function standardFor(name) {
  const hit = STANDARD_OF.find(([test]) => test.test(name));
  if (!hit || !hit[1]) return null;
  let factor = hit[2] || 1;
  const notes = [];
  if (/unilateral|individual/i.test(name) && !PER_SIDE.has(hit[1])) { factor *= 1.8; notes.push('a un lado ×1,8'); }
  if (/parcial|poco recorrido/i.test(name)) { factor *= 0.8; notes.push('recorrido parcial ×0,8'); }
  if (hit[2]) notes.push('apuntado por lado ×2');
  return { std: hit[1], factor, note: notes.join(', ') };
}
export function standardAt(std, bodyWeight) {
  const [a, b] = STANDARDS[std], t = Math.min(1.5, Math.max(-0.5, (bodyWeight - 80) / 10));
  return a.map((v, i) => v + (b[i] - v) * t);
}
export const LEVELS = ['Principiante', 'Novato', 'Intermedio', 'Avanzado', 'Élite'];
export const TIERS = [5, 20, 50, 80, 95];
// Places a 1RM between the standards: the level reached and roughly the share of men it beats.
export function percentile(value, marks) {
  if (value < marks[0]) return { level: -1, pct: Math.max(1, Math.round(value / marks[0] * TIERS[0])) };
  let i = 0;
  while (i < 4 && value >= marks[i + 1]) i++;
  if (i === 4) return { level: 4, pct: Math.min(99, Math.round(95 + (value - marks[4]) / marks[4] * 20)) };
  return { level: i, pct: Math.round(TIERS[i] + (value - marks[i]) / (marks[i + 1] - marks[i]) * (TIERS[i + 1] - TIERS[i])) };
}
const levelOf = pct => (pct < TIERS[0] ? -1 : TIERS.reduce((n, t, i) => (pct >= t ? i : n), 0));
const shiftDays = (iso, days) => new Date(Date.parse(`${iso}T12:00:00Z`) + days * 864e5).toISOString().slice(0, 10);

// Best e1RM of each standardised exercise in [from, to], already converted to what the standard measures.
function bestLifts(rows, group, from, to) {
  const best = new Map();
  for (const row of rows) {
    if (row[F.FECHA] < from || row[F.FECHA] > to || muscleOf(row[F.EJ], row[F.MUSC]) !== group) continue;
    const s = standardFor(row[F.EJ]), v = s && rowE1rm(row);
    if (!v) continue;
    const prev = best.get(row[F.EJ]);
    if (!prev || v * s.factor > prev.value) best.set(row[F.EJ], { name: row[F.EJ], std: s.std, value: v * s.factor, logged: v, fecha: row[F.FECHA] });
  }
  return [...best.values()];
}
// The median of its lifts: machine stacks differ between gyms, and one generous or stingy machine must not decide the muscle.
const median = list => { const s = [...list].sort((a, b) => a - b), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
function rate(lifts, bodyWeight) {
  if (!lifts.length) return null;
  const tests = lifts.map(l => ({ ...l, ...percentile(l.value, standardAt(l.std, bodyWeight)) })).sort((a, b) => b.pct - a.pct);
  const pct = Math.round(median(tests.map(t => t.pct)));
  return { pct, level: levelOf(pct), tests };
}
// The last 12 months; a muscle not trained in that time uses its last 12 months with data and says until when.
export function strengthByMuscle(rows, bodyWeight, today) {
  return MUSCLES.map(({ id, name }) => {
    let lifts = bestLifts(rows, id, shiftDays(today, -365), today), stale = null;
    if (!lifts.length) {
      const last = rows.filter(r => r[F.FECHA] <= today && muscleOf(r[F.EJ], r[F.MUSC]) === id && standardFor(r[F.EJ]) && rowE1rm(r)).reduce((a, r) => (r[F.FECHA] > a ? r[F.FECHA] : a), '');
      if (last) { lifts = bestLifts(rows, id, shiftDays(last, -365), last); stale = last; }
    }
    return { id, name, rated: rate(lifts, bodyWeight), stale };
  });
}
// The muscle's level quarter by quarter since the first row: machines change, the comparison with other men does not.
export function muscleHistory(rows, group, bodyWeight, fallbackWeight) {
  const quarters = new Set();
  for (const row of rows) {
    if (muscleOf(row[F.EJ], row[F.MUSC]) !== group || !standardFor(row[F.EJ]) || !rowE1rm(row)) continue;
    const [y, mo] = row[F.FECHA].split('-');
    quarters.add(`${y}-${String(Math.floor((mo - 1) / 3) * 3 + 2).padStart(2, '0')}-15`);
  }
  return [...quarters].sort().map(mid => {
    const rated = rate(bestLifts(rows, group, shiftDays(mid, -46), shiftDays(mid, 46)), weightAt(bodyWeight, mid) || fallbackWeight);
    return rated ? { fecha: mid, value: rated.pct, rated } : null;
  }).filter(Boolean);
}

// ---------- The last twelve months ----------
// Best of the months around a year ago against the best of the last three. More than double or less than half
// is a change of machine or of how it was logged, not progress, so it is left out.
export function yearReview(rows, today, bodyWeight) {
  const ago = shiftDays(today, -365), names = new Set(rows.filter(r => !isWalk(r) && r[F.FECHA] >= shiftDays(today, -90)).map(r => r[F.EJ]));
  const changes = [];
  for (const name of names) {
    const measure = defaultMeasure(name), list = sessionMeasures(rows, name);
    const best = (from, to) => Math.max(0, ...list.filter(s => s.fecha >= from && s.fecha <= to).map(s => s[measure]));
    const before = best(shiftDays(ago, -60), shiftDays(ago, 30)), now = best(shiftDays(today, -90), today);
    if (before && now && now < before * 2 && now > before / 2) changes.push({ name, measure, before, now, change: now / before - 1 });
  }
  const totals = (from, to) => {
    const set = rows.filter(r => !isWalk(r) && r[F.FECHA] > from && r[F.FECHA] <= to);
    return { days: new Set(set.map(r => r[F.FECHA])).size, sets: set.length, tonnes: set.reduce((t, r) => t + (num(r[F.KG]) || 0) * (num(r[F.REPS]) || 0), 0) / 1000 };
  };
  // A muscle compares only the exercises done in both years: a new machine is not progress.
  const muscles = MUSCLES.map(({ id, name }) => {
    const before = bestLifts(rows, id, shiftDays(ago, -365), ago), after = bestLifts(rows, id, shiftDays(today, -365), today);
    const shared = new Set(before.map(l => l.name).filter(n => after.some(l => l.name === n)));
    const a = rate(before.filter(l => shared.has(l.name)), bodyWeight), b = rate(after.filter(l => shared.has(l.name)), bodyWeight);
    return a && b ? { name, before: a.pct, now: b.pct, lifts: [...shared] } : null;
  }).filter(Boolean);
  return { changes: changes.sort((a, b) => b.change - a.change), muscles: muscles.sort((a, b) => (b.now - b.before) - (a.now - a.before)), year: totals(ago, today), previous: totals(shiftDays(ago, -365), ago) };
}

// ---------- You against yourself, whatever the machine ----------
// Where a single set stands against other men, or null when its exercise has no standard.
export function liftPercentile(name, value, bodyWeight) {
  const s = standardFor(name);
  return s && value ? { ...percentile(value * s.factor, standardAt(s.std, bodyWeight)), std: s.std } : null;
}
// The best single lift of a muscle in a window, as a share of men beaten: the mark a new machine has to beat.
export function bestOfMuscle(rows, group, bodyWeight, from, to) {
  const lifts = bestLifts(rows, group, from, to).map(l => ({ ...l, ...percentile(l.value, standardAt(l.std, bodyWeight)) }));
  return lifts.length ? lifts.reduce((a, b) => (b.pct > a.pct ? b : a)) : null;
}
export const muscleRecord = (rows, group, bodyWeight, today) => bestOfMuscle(rows, group, bodyWeight, shiftDays(today, -365), shiftDays(today, -1));

// The rival is your own session closest to three months ago, never one less than four weeks old.
// A new machine or gym has no such session: then the rival is the muscle three months ago, as a share of men beaten.
export function pastSelf(rows, exercise, today, bodyWeight) {
  const t = Date.parse(`${today}T12:00:00Z`), target = t - 91 * 864e5;
  const old = sessions(rows, exercise).filter(s => t - Date.parse(`${s.fecha}T12:00:00Z`) >= 28 * 864e5)
    .map(s => { const top = s.series.reduce((a, b) => ((rowE1rm(b) || 0) > (rowE1rm(a) || 0) ? b : a)); return { fecha: s.fecha, value: rowE1rm(top) || 0, row: top }; })
    .filter(s => s.value);
  if (old.length) {
    const near = old.reduce((a, b) => (Math.abs(Date.parse(b.fecha) - target) < Math.abs(Date.parse(a.fecha) - target) ? b : a));
    return { kind: 'exercise', fecha: near.fecha, value: near.value, kg: num(near.row[F.KG]), reps: num(near.row[F.REPS]) };
  }
  const group = muscleOf(exercise);
  if (!group || !standardFor(exercise)) return null;
  const then = rate(bestLifts(rows, group, shiftDays(today, -136), shiftDays(today, -46)), bodyWeight);
  return then ? { kind: 'muscle', group, name: MUSCLES.find(m => m.id === group).name, pct: then.pct } : null;
}
// The muscle's level now (median of its lifts in the last year, before today): a set above it is a good day.
export const muscleLevel = (rows, group, bodyWeight, today) => rate(bestLifts(rows, group, shiftDays(today, -365), shiftDays(today, -1)), bodyWeight);
export const bestToday = (rows, exercise, today, extra = 0) => Math.max(extra || 0, ...rows.filter(r => r[F.EJ] === exercise && r[F.FECHA] === today).map(r => rowE1rm(r) || 0));

// ---------- Strength tests: lifts measured the same way in any gym, to see where a muscle really stands ----------
export const TESTS = [
  { group: 'pecho', ejercicio: 'Bench Press · Barra Olímpica 20kg', musculo: 'Pecho', how: 'Press banca con barra libre, bajando hasta el pecho.' },
  { group: 'pecho', ejercicio: 'Dumbbell Chest Press Inclinado 30°', musculo: 'Pecho', how: 'Press inclinado con mancuernas: apunta el peso de una.' },
  { group: 'deltAnt', ejercicio: 'Overhead Press · Barra Olímpica 20kg', musculo: 'Hombros', how: 'Press militar de pie con barra.' },
  { group: 'deltAnt', ejercicio: 'Overhead Press Mancuernas 45°', musculo: 'Hombros', how: 'Press con mancuernas sentado: apunta el peso de una.' },
  { group: 'deltLat', ejercicio: 'Lateral Raise Dumbbells', musculo: 'Hombros', how: 'Elevaciones laterales con mancuernas: apunta el peso de una.' },
  { group: 'deltPost', ejercicio: 'Rope Face Pull · Dreamfit · Polea regulable', musculo: 'Hombros', how: 'Face pull en polea con cuerda.' },
  { group: 'dorsal', ejercicio: 'Lat Pulldown · TGD · Dreamfit', musculo: 'Espalda', how: 'Jalón al pecho en polea con barra.' },
  { group: 'espalda', ejercicio: 'Barbell Row · Barra Olímpica 20kg', musculo: 'Espalda', how: 'Remo con barra inclinado.' },
  { group: 'espalda', ejercicio: 'Remo Bajo Polea · Dreamfit', musculo: 'Espalda', how: 'Remo sentado en polea baja.' },
  { group: 'biceps', ejercicio: 'Bíceps Curl Barra · Barra Olímpica 20kg', musculo: 'Bíceps', how: 'Curl de pie con barra, sin balanceo.' },
  { group: 'biceps', ejercicio: 'Bíceps Curl Polea Cuerda / Agarre · Dreamfit · Polea regulable', musculo: 'Bíceps', how: 'Curl en polea baja.' },
  { group: 'triceps', ejercicio: 'Tríceps Polea Cuerda Alta · Dreamfit · Polea regulable', musculo: 'Tríceps', how: 'Extensión en polea alta con cuerda.' },
  { group: 'triceps', ejercicio: 'French Press · Banco', musculo: 'Tríceps', how: 'Press francés tumbado con barra.' },
  { group: 'cuadriceps', ejercicio: 'Sentadilla · Barra Olímpica 20kg', musculo: 'Cuádriceps', how: 'Sentadilla con barra, al menos hasta paralelo.' },
  { group: 'cuadriceps', ejercicio: 'Leg Extension · TGD · Dreamfit', musculo: 'Cuádriceps', how: 'Extensión de cuádriceps con las dos piernas.' },
  { group: 'femoral', ejercicio: 'Romanian Deadlift · Barra Olímpica 20kg', musculo: 'Isquios', how: 'Peso muerto rumano con barra.' },
  { group: 'femoral', ejercicio: 'Leg Curl Tumbado · TGD · Dreamfit', musculo: 'Isquios', how: 'Curl femoral tumbado, las dos piernas.' },
  { group: 'cadena', ejercicio: 'Deadlift · Barra Olímpica 20kg', musculo: 'Isquios', how: 'Peso muerto convencional con barra.' },
  { group: 'gluteo', ejercicio: 'Hip Thrust · TGD · Dreamfit', musculo: 'Glúteos', how: 'Hip thrust con barra apoyado en banco.' },
  { group: 'gemelo', ejercicio: 'Gemelos Máquina · Dreamfit', musculo: 'Gemelos', how: 'Gemelos de pie en máquina, hasta 15 repes.' },
  { group: 'abdomen', ejercicio: 'Abs de pie Polea · Dreamfit · Polea regulable', musculo: 'Abdominales', how: 'Crunch en polea alta con cuerda.' }
];

// One line from the last year to open the Evolution tab: changes with the day so it does not repeat.
export function yearHighlight(review, today) {
  const options = [
    ...review.muscles.filter(m => m.now > m.before).map(m => ({ kind: 'muscle', ...m })),
    ...review.changes.filter(c => c.change >= 0.04).map(c => ({ kind: 'exercise', ...c }))
  ];
  return options.length ? options[Math.floor(Date.parse(today) / 864e5) % options.length] : null;
}
// All of them, starting with the day's one, for a card that shows the next on each tap.
export function yearHighlights(review, today) {
  const options = [
    ...review.muscles.filter(m => m.now > m.before).map(m => ({ kind: 'muscle', ...m })),
    ...review.changes.filter(c => c.change >= 0.04).map(c => ({ kind: 'exercise', ...c }))
  ];
  if (!options.length) return [];
  const start = Math.floor(Date.parse(today) / 864e5) % options.length;
  return options.slice(start).concat(options.slice(0, start));
}
