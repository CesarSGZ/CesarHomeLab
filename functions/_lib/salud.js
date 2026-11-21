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
  } else {
    // Shortcut: one day or a list of days, with our own field names.
    for (const d of Array.isArray(body?.dias) ? body.dias : [body]) {
      const day = String(d?.fecha || '').slice(0, 10);
      for (const f of FIELDS) { const v = finite(d?.[f]); if (v !== null) put(day, f, v); }
    }
  }
  for (const [day, list] of Object.entries(weights)) { days[day] = days[day] || {}; days[day].peso = list.reduce((a, b) => a + b, 0) / list.length; }
  for (const d of Object.values(days)) for (const f of Object.keys(d)) d[f] = f === 'peso' ? Math.round(d[f] * 100) / 100 : Math.round(d[f]);
  return days;
}

// A day sent again replaces the fields it brings (the app resends whole days), and only the last 400 days are kept.
export function mergeHealth(stored, incoming, today) {
  const days = { ...(stored?.dias || {}) };
  for (const [day, values] of Object.entries(incoming)) if (day <= today) days[day] = { ...(days[day] || {}), ...values };
  const from = new Date(Date.parse(`${today}T12:00:00Z`) - 400 * 864e5).toISOString().slice(0, 10);
  for (const day of Object.keys(days)) if (day < from) delete days[day];
  return { ...(stored || {}), dias: days, recibido: new Date().toISOString() };
}

const GOALS = new Set(['volumen', 'definicion', 'mantener']);
export function cleanGoal(goal) {
  const tipo = GOALS.has(goal?.tipo) ? goal.tipo : null, peso = finite(goal?.peso);
  if (!tipo) throw new Error('objetivo');
  return { tipo, peso: peso && peso >= 30 && peso <= 200 ? Math.round(peso * 10) / 10 : null };
}
