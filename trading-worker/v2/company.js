// Agent Office v2 · estado de la empresa: plantilla, política que los agentes pueden
// cambiar, ideas en curso, órdenes pendientes y la cronología que anima el dashboard.
import {equity} from '../core.js';

export const RENT_TARGET = 10000; // € ficticios de beneficio al mes = 10 € reales de tokens
export const STAFF = [
  {id: 'scout', name: 'Santi', role: 'Explorador', color: '#9ccb98',
    persona: 'Curioso y entusiasta; te emocionas rápido con una buena historia y te pica que te tumben ideas.',
    duty: 'Encontrar oportunidades: lees el radar (resultados cercanos, noticias, movimientos de precio) y traes candidatas con una razón concreta. Puedes pedir UNA búsqueda web cuando un dato importante falte.'},
  {id: 'analyst', name: 'Pedro', role: 'Analista', color: '#b6a4e8',
    persona: 'Meticuloso y algo desconfiado del entusiasmo de Santi; te gustan los números y odias improvisar.',
    duty: 'Convertir candidatas en planes operables: importe en €, stop, objetivo, plazo y por qué. Descartas sin miedo lo que no tiene ventaja.'},
  {id: 'risk', name: 'María', role: 'Riesgo', color: '#e8b67c',
    persona: 'Directa y escéptica; llevas la contraria por oficio, pero sabes que sin asumir riesgo no se paga el alquiler.',
    duty: 'Revisar cada plan: apruebas, recortas tamaño o vetas explicando por qué. Vigilas la exposición total y puedes ajustar stops o cerrar posiciones.'},
  {id: 'operator', name: 'Yari', role: 'Trader', color: '#81cbd0',
    persona: 'Rápida y competitiva; odias devolver beneficios y esperar de brazos cruzados.',
    duty: 'Ejecutar: compras lo aprobado, vigilas las posiciones abiertas, mueves stops y objetivos y cierras cuando toca.'},
  {id: 'auditor', name: 'Augusto', role: 'Dirección', color: '#e7a6bf',
    persona: 'Tranquilo, ves el conjunto y medias en las discusiones; no te tiembla la mano para cambiar de rumbo.',
    duty: 'Dirigir: revisas qué funciona, sacas lecciones de las operaciones cerradas, propones o aplicas cambios de estrategia, convocas reuniones y puedes levantar un veto.'},
  {id: 'designer', name: 'Cadaqui', role: 'Finanzas y tokens', color: '#91afe8',
    persona: 'Ahorrador y obsesivo con los números; cada token gastado te duele, pero sabes cuándo merece la pena gastar.',
    duty: 'Llevar las cuentas: controlas el gasto de IA y el ritmo de trabajo (ahorro, normal o intensivo), sigues el objetivo del alquiler, escribes el resumen del día y decides gastos de oficina.'}
];
export const staffById = id => STAFF.find(s => s.id === id);

export const OFFICE_CATALOG = {
  plantas: {label: 'más plantas', eur: 40}, cafetera: {label: 'una cafetera profesional', eur: 120}, arcade: {label: 'una recreativa', eur: 150},
  aquarium: {label: 'un acuario', eur: 200}, neon: {label: 'un neón para la pared', eur: 80}
};

export const POLICY_DEFAULT = {
  strategy: 'Catalizadores cercanos', focus: 'Empresas con resultados o noticias en los próximos días y movimiento de precio que lo acompañe.',
  rules: 'Entrar antes del evento, cortar rápido lo que no arranca.',
  lotPct: 20, maxPositions: 5, leverage: 1, stopPct: 8, targetPct: 20, holdDays: 7,
  riskGate: 'on', pace: 'normal', meetingsPerDay: 3, minDollarVolume: 1e6
};
const NUM = {lotPct: [2, 100], maxPositions: [1, 12], leverage: [1, 2], stopPct: [1, 40], targetPct: [2, 300], holdDays: [1, 30], meetingsPerDay: [1, 6], minDollarVolume: [3e5, 5e7]};
const ENUM = {riskGate: ['on', 'off'], pace: ['ahorro', 'normal', 'intensivo']};
const TEXT = {strategy: 28, focus: 220, rules: 220};
export const POLICY_PARAMS = [...Object.keys(TEXT), ...Object.keys(NUM), ...Object.keys(ENUM)];
export const POLICY_HELP = 'strategy (nombre corto), focus (qué buscamos), rules (reglas de la casa), lotPct 2-100 (% del capital por posición), maxPositions 1-12, leverage 1-2, stopPct 1-40, targetPct 2-300, holdDays 1-30, riskGate on|off (si María debe aprobar), pace ahorro|normal|intensivo, meetingsPerDay 1-6, minDollarVolume 300000-50000000';
const LABEL = {strategy: 'estrategia', focus: 'foco', rules: 'reglas', lotPct: 'tamaño por posición (%)', maxPositions: 'posiciones máximas', leverage: 'apalancamiento', stopPct: 'stop (%)', targetPct: 'objetivo (%)', holdDays: 'plazo (días)', riskGate: 'filtro de riesgo', pace: 'ritmo de trabajo', meetingsPerDay: 'reuniones al día', minDollarVolume: 'liquidez mínima ($)'};
export const policyLabel = p => LABEL[p] || p;

// Valida y normaliza un cambio de política. Devuelve {ok, value} o {ok:false, reason}.
export function checkPolicy(param, raw) {
  if (TEXT[param]) { const value = String(raw ?? '').replace(/\s+/g, ' ').trim().slice(0, TEXT[param]); return value.length >= 3 ? {ok: true, value} : {ok: false, reason: 'Texto demasiado corto'}; }
  if (ENUM[param]) { const value = String(raw ?? '').trim().toLowerCase(); return ENUM[param].includes(value) ? {ok: true, value} : {ok: false, reason: 'Valores válidos: ' + ENUM[param].join(', ')}; }
  if (NUM[param]) {
    const n = Number(String(raw ?? '').replace(',', '.').replace(/[^0-9.\-]/g, '')), [lo, hi] = NUM[param];
    if (!Number.isFinite(n)) return {ok: false, reason: 'Hace falta un número'};
    const value = ['maxPositions', 'holdDays', 'meetingsPerDay'].includes(param) ? Math.round(Math.min(hi, Math.max(lo, n))) : Math.min(hi, Math.max(lo, n));
    return {ok: true, value};
  }
  return {ok: false, reason: 'Parámetro desconocido. Disponibles: ' + POLICY_PARAMS.join(', ')};
}

export function initCompany(s, now = Date.now()) {
  if (s.v2?.schema === 1) { for (const m of STAFF) s.v2.agents[m.id] ??= newAgent(); return s.v2; }
  s.v2 = {
    schema: 1, startedAt: now, policy: {...POLICY_DEFAULT}, strategyLog: [], agents: Object.fromEntries(STAFF.map(m => [m.id, newAgent()])),
    ideas: [], orders: [], timeline: [], seq: 0, meetings: [], meetingDay: {day: '', done: [], extra: 0}, meetingRequests: [], proposals: [], lessons: [],
    days: {}, months: {}, office: {upgrades: [], purchases: []}, owner: [], reviewedUntil: now, radarCursor: 0,
    stats: {turnCostEur: 0.0008, web: {day: '', n: 0, fails: 0}, deep: {day: '', n: 0}, errors: 0, lastErrorAt: 0}
  };
  // Los trabajos de autoprogramación heredados quedan retirados: la libertad ahora es por datos.
  for (const job of s.company?.development || []) if (['queued', 'running'].includes(job.status)) { job.status = 'rejected'; job.error = 'Retirado: Agent Office v2 no modifica su propio código'; }
  emit(s.v2, 'system', {text: 'Nueva etapa de la oficina: equipo con libertad total sobre estrategia, riesgo y ritmo. La cartera y el alquiler siguen donde estaban.'}, now);
  return s.v2;
}
function newAgent() { return {mood: 'tenso', task: 'Incorporándose', thought: '', say: '', lastAt: 0, waitUntil: 0, notes: [], inbox: [], calls: 0, eur: 0, today: {day: '', calls: 0, eur: 0}, paused: false}; }

export function emit(v2, type, data, now = Date.now()) {
  const event = {id: ++v2.seq, at: now, type, ...data};
  v2.timeline.push(event); if (v2.timeline.length > 400) v2.timeline.splice(0, v2.timeline.length - 400);
  return event;
}
export function tell(v2, to, from, text, now = Date.now()) {
  const a = v2.agents[to]; if (!a) return;
  a.inbox.push({from, text: String(text).slice(0, 260), at: now}); if (a.inbox.length > 8) a.inbox.splice(0, a.inbox.length - 8);
}

export function setPolicy(v2, param, raw, by, reason, now = Date.now()) {
  const check = checkPolicy(param, raw); if (!check.ok) return check;
  const before = v2.policy[param]; if (before === check.value) return {ok: true, value: check.value, unchanged: true};
  v2.policy[param] = check.value;
  v2.strategyLog.unshift({at: now, by, param, from: before, to: check.value, reason: String(reason || '').slice(0, 220)}); v2.strategyLog = v2.strategyLog.slice(0, 40);
  emit(v2, 'strategy', {agent: by, param, label: policyLabel(param), from: before, value: check.value, name: v2.policy.strategy, lines: boardLines(v2.policy), text: String(reason || '').slice(0, 200)}, now);
  for (const p of v2.proposals) if (p.status === 'pendiente' && p.param === param) p.status = String(p.value) === String(check.value) ? 'aplicada' : 'superada';
  return {ok: true, value: check.value};
}
export const boardLines = p => ['LOTE ' + Math.round(p.lotPct) + '% MAX ' + p.maxPositions + (p.leverage > 1 ? ' X' + p.leverage : ''), 'STOP ' + Math.round(p.stopPct) + ' OBJ ' + Math.round(p.targetPct)];

// ---- ideas ----
export const ACTIVE = ['nueva', 'plan', 'aprobada', 'vetada', 'ordenada'];
export const findIdea = (v2, symbol) => v2.ideas.find(i => i.symbol === symbol && ACTIVE.includes(i.status));
export function newIdea(v2, asset, by, thesis, now = Date.now()) {
  const idea = {id: 'i' + (++v2.seq), symbol: asset.symbol, name: String(asset.name || '').replace(/ (Common Stock|Ordinary Shares|Class A).*$/i, '').slice(0, 40), sector: asset.sector || '', status: 'nueva', by, thesis: String(thesis).slice(0, 320), research: null, plan: null, risk: null, revisions: 0, createdAt: now, updatedAt: now};
  v2.ideas.unshift(idea);
  const live = v2.ideas.filter(i => ACTIVE.includes(i.status) || i.status === 'comprada'), rest = v2.ideas.filter(i => !live.includes(i)).slice(0, 40);
  v2.ideas = [...live, ...rest].sort((a, b) => b.updatedAt - a.updatedAt);
  return idea;
}
export function expireIdeas(v2, now = Date.now()) {
  for (const i of v2.ideas) if (['nueva', 'plan', 'aprobada', 'vetada'].includes(i.status) && now - i.updatedAt > 3 * 864e5) { i.status = 'caducada'; i.updatedAt = now; }
}

// ---- tiempo y ánimo ----
export function madrid(t = Date.now()) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', weekday: 'short', hourCycle: 'h23'}).formatToParts(new Date(t)).map(x => [x.type, x.value]));
  return {day: `${p.year}-${p.month}-${p.day}`, hour: Number(p.hour), minute: Number(p.minute), minutes: Number(p.hour) * 60 + Number(p.minute), weekday: p.weekday, weekend: ['Sat', 'Sun'].includes(p.weekday), label: `${p.hour}:${p.minute}`};
}
// Ánimo de la empresa: compara el beneficio del mes con el ritmo que exige el alquiler.
export function companyMood({monthPnl, daysLeft, daysInMonth, remainingEur, dayPnl = 0, equity: eq = 10000}) {
  const elapsed = Math.max(0, Math.min(1, 1 - (daysLeft - 1) / daysInMonth)), dayMove = dayPnl / Math.max(1, eq);
  if (monthPnl >= RENT_TARGET || dayMove >= 0.03) return 'joy';
  if (remainingEur / Math.max(1, daysLeft) < 0.08 || dayMove <= -0.03) return 'panic';
  const expected = RENT_TARGET * elapsed, ratio = expected > 0 ? monthPnl / expected : 1;
  if (elapsed < 0.12) return monthPnl < -500 ? 'tense' : 'calm';
  if (ratio >= 0.9) return 'calm';
  if (ratio < 0.25 && daysLeft <= 10) return 'panic';
  return 'tense';
}
export const eur = n => (n < 0 ? '-' : '') + Math.abs(Math.round(n)).toLocaleString('es-ES') + ' €';
export const equityOf = s => equity(s.real.book);
