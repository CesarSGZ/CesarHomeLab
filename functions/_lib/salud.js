// María's steps, food and weight, sent from her iPhone (Apple Health) by Health Auto Export or by a Shortcut.
// Only daily totals are kept: steps, calories, protein, carbohydrates, fat and weight.

const FIELDS = ['pasos', 'kcal', 'prot', 'carb', 'grasa', 'peso'];
// Health Auto Export metric names → our fields.
const METRICS = { step_count: 'pasos', dietary_energy: 'kcal', protein: 'prot', carbohydrates: 'carb', total_fat: 'grasa', weight_body_mass: 'peso', body_mass: 'peso' };
const DAY = /^\d{4}-\d{2}-\d{2}$/;
const finite = v => (v === null || v === undefined || v === '' || !Number.isFinite(+v) ? null : +v);
// What is plausible for one day; anything else is a broken sample, not data.
const LIMITS = { pasos: [0, 100000], kcal: [0, 10000], prot: [0, 600], carb: [0, 1500], grasa: [0, 600], peso: [25, 250] };
const valid = (field, v) => v !== null && v >= LIMITS[field][0] && v <= LIMITS[field][1];

// The date as ISO ("2026-11-20T00:00:00+01:00") or as the iPhone shows it in Spanish ("20 nov 2026, 0:00", "20/11/26")
// or in English ("Nov 20, 2026 at 12:00 AM", "20 Nov 2026", "11/20/26").
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const MONTHS_EN = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const monthOf = name => (MONTHS.includes(name) ? MONTHS.indexOf(name) : MONTHS_EN.indexOf(name)) + 1;
const ymd = (y, m, d) => (m >= 1 && m <= 12 && d >= 1 && d <= 31 ? `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}` : null);
export function isoDay(text) {
  const t = String(text || '').trim().toLowerCase();
  if (/^\d{4}-\d{2}-\d{2}/.test(t)) return t.slice(0, 10);
  let m = t.match(/^(\d{1,2}) (?:de )?([a-zñ]{3})[a-zñ.]* (?:de )?(\d{4})/);
  if (m && monthOf(m[2]) > 0) return ymd(m[3], monthOf(m[2]), +m[1]);
  m = t.match(/^([a-z]{3})[a-z.]* (\d{1,2}),? (\d{4})/);
  if (m && monthOf(m[1]) > 0) return ymd(m[3], monthOf(m[1]), +m[2]);
  m = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (!m) return null;
  // Day first, as in Spain, unless that cannot be (an American phone writes the month first: 11/20/26).
  const y = m[3].length === 2 ? `20${m[3]}` : m[3], a = +m[1], b = +m[2];
  return b > 12 ? ymd(y, a, b) : ymd(y, b, a);
}
const lines = v => (Array.isArray(v) ? v.map(String) : String(v ?? '').split(/\r?\n/)).map(x => x.trim()).filter(Boolean);
// The iPhone writes numbers as the phone's language does: "60,4", "8.123", "1.234,5" or "8123". With a single kind of
// separator and three digits after it, it is a thousands separator (except for weight, which never has three decimals).
export function spanishNumber(text, field) {
  let t = String(text ?? '').replace(/[^\d.,-]/g, '');
  if (!t) return null;
  const dot = t.lastIndexOf('.'), comma = t.lastIndexOf(',');
  if (dot >= 0 && comma >= 0) t = dot > comma ? t.replace(/,/g, '') : t.replace(/\./g, '').replace(',', '.');
  else if (dot >= 0 || comma >= 0) {
    const sep = dot >= 0 ? '.' : ',', parts = t.split(sep);
    const thousands = field !== 'peso' && parts.length > 1 && parts.slice(1).every(x => x.length === 3);
    t = thousands ? parts.join('') : parts.slice(0, -1).join('') + '.' + parts[parts.length - 1];
  }
  return finite(t);
}

function toUnit(field, qty, units = '') {
  const u = String(units).toLowerCase();
  if (field === 'kcal' && u === 'kj') return qty / 4.184;
  if (field === 'peso' && (u === 'lb' || u === 'lbs')) return qty * 0.45359237;
  if (field === 'peso' && u === 'g') return qty / 1000;
  return qty;
}

// Turns either payload into { 'YYYY-MM-DD': { pasos, kcal, ... } }. Steps and food add up within the day (in case the app
// sends several samples); weight is the day's average.
export function parseHealth(body) {
  const days = {}, weights = {};
  const put = (day, field, qty) => {
    if (!DAY.test(day) || !valid(field, qty)) return;
    if (field === 'peso') { (weights[day] = weights[day] || []).push(qty); return; }
    days[day] = days[day] || {};
    days[day][field] = (days[day][field] || 0) + qty;
  };
  const metrics = body?.data?.metrics;
  if (Array.isArray(metrics)) {
    for (const m of metrics) {
      const field = METRICS[m?.name];
      if (!field || !Array.isArray(m.data)) continue;
      for (const p of m.data) {
        const qty = finite(p?.qty ?? p?.Avg ?? p?.avg);
        if (qty === null) continue;
        put(String(p.date || '').slice(0, 10), field, toUnit(field, qty, m.units));
      }
    }
  } else if (FIELDS.some(f => body?.[`${f}_fechas`] !== undefined)) {
    // The free Shortcut: for each field, the dates and the values as two lists, one per line (or JSON arrays).
    for (const f of FIELDS) {
      const dates = lines(body[`${f}_fechas`]), values = lines(body[`${f}_valores`]);
      dates.forEach((d, i) => { const v = spanishNumber(values[i], f), day = isoDay(d); if (v !== null && day) put(day, f, v); });
    }
  } else {
    // A simple Shortcut: one day or a list of days, with our own field names.
    for (const d of Array.isArray(body?.dias) ? body.dias : [body]) {
      const day = String(d?.fecha || '').slice(0, 10);
      for (const f of FIELDS) { const v = finite(d?.[f]); if (v !== null) put(day, f, v); }
    }
  }
  for (const [day, list] of Object.entries(weights)) { days[day] = days[day] || {}; days[day].peso = list.reduce((a, b) => a + b, 0) / list.length; }
  for (const d of Object.values(days)) for (const f of Object.keys(d)) d[f] = f === 'peso' ? Math.round(d[f] * 100) / 100 : Math.round(d[f]);
  return days;
}

// A day sent again replaces the fields it brings (the app resends whole days), and only the last 1.500 days (about four years) are kept.
export function mergeHealth(stored, incoming, today) {
  const days = { ...(stored?.dias || {}) };
  for (const [day, values] of Object.entries(incoming)) if (day <= today) days[day] = { ...(days[day] || {}), ...values };
  const from = new Date(Date.parse(`${today}T12:00:00Z`) - 1500 * 864e5).toISOString().slice(0, 10);
  for (const day of Object.keys(days)) if (day < from) delete days[day];
  return { ...(stored || {}), dias: days, recibido: new Date().toISOString() };
}

const GOALS = new Set(['volumen', 'definicion', 'mantener']);
// Her goal: the kind, the weight she wants to reach, how many kg a week (positive to gain, negative to lose) and the daily
// calories she aims for (the one she has in MyFitnessPal; her phone does not send it).
export function cleanGoal(goal) {
  const tipo = GOALS.has(goal?.tipo) ? goal.tipo : null, peso = finite(goal?.peso), ritmo = finite(goal?.ritmo), kcal = finite(goal?.kcal);
  if (!tipo) throw new Error('objetivo');
  return { tipo, peso: peso && peso >= 30 && peso <= 200 ? Math.round(peso * 10) / 10 : null, ritmo: ritmo !== null && Math.abs(ritmo) <= 1.5 ? Math.round(ritmo * 100) / 100 : null,
    kcal: kcal !== null && kcal >= 800 && kcal <= 5000 ? Math.round(kcal) : null,
    // The day this phase (bulk, cut…) started, to show what changed since then.
    desde: DAY.test(String(goal?.desde || '')) ? String(goal.desde) : null };
}
// What the formulas need besides her weight: age and height.
export function cleanProfile(p) {
  const edad = finite(p?.edad), altura = finite(p?.altura);
  if ((edad !== null && (edad < 14 || edad > 99)) || (altura !== null && (altura < 120 || altura > 230))) throw new Error('perfil');
  return { edad: edad === null ? null : Math.round(edad), altura: altura === null ? null : Math.round(altura) };
}
// A day she marks as incomplete (out) or as fine after all (in); null lets the app decide.
export function markDay(stored, day, mark) {
  if (!DAY.test(String(day)) || ![null, 'fuera', 'dentro'].includes(mark ?? null)) throw new Error('dia');
  const marks = { ...(stored?.marcas || {}) };
  if (mark) marks[day] = mark; else delete marks[day];
  return { ...(stored || { dias: {} }), marcas: marks };
}
