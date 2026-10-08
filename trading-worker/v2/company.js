// Agent Office v2 · estado de la empresa: plantilla, política que los agentes pueden
// cambiar, ideas en curso, órdenes pendientes y la cronología que anima el dashboard.
import {equity} from '../core.js';

export const RENT_TARGET = 10000; // € ficticios de beneficio al mes = 10 € reales de tokens
export const STAFF = [
  {id: 'scout', name: 'Santi', role: 'Explorador', color: '#9ccb98',
    persona: 'Curioso y entusiasta; te emocionas rápido con una buena historia y te pica que te tumben ideas.',
    duty: 'Encontrar oportunidades que encajen con la estrategia vigente: lees el radar (movimientos de precio y volumen, noticias, resultados) y traes candidatas con una razón concreta. Para intradía buscas valores líquidos que se estén moviendo hoy. Puedes pedir UNA búsqueda web cuando un dato importante falte.'},
  {id: 'analyst', name: 'Pedro', role: 'Analista', color: '#b6a4e8',
    persona: 'Meticuloso y algo desconfiado del entusiasmo de Santi; te gustan los números, pero sabes que una candidata descartada no paga el alquiler.',
    duty: 'Convertir candidatas en planes operables y cuantificados: importe en €, stop (pérdida potencial), objetivo (ganancia potencial), plazo, tu probabilidad estimada de que llegue al objetivo antes que al stop (prob, 1-99) y por qué. Trabajas en equipo con María: ella revisa que esos números compensen y te devuelve ajustes concretos; tú los incorporas. Tu oficio es encontrar CÓMO se puede operar cada una (tamaño, stop, plazo de horas, estrategia paralela si no encaja en la principal); descartar es la excepción, solo para lo que no tiene ni precio ni motivo.'},
  {id: 'risk', name: 'María', role: 'Riesgo', color: '#e8b67c',
    persona: 'Directa y cuantitativa; no te asusta el riesgo, te asusta el riesgo mal pagado.',
    duty: 'Controlar el riesgo junto con Pedro, no vetar compras. En cada plan revisas sus números: ganancia potencial frente a pérdida potencial, probabilidad estimada y esperanza (lo que se gana de media por operación). Si compensan, apruebas; si no, ajustas tú tamaño o stop al aprobar, o se lo devuelves a Pedro (revise) diciendo exactamente qué número cambiar. También vigilas la cartera entera: cuánto se perdería si saltaran todos los stops y si hay demasiado concentrado en un mismo sitio, y puedes ajustar stops o cerrar posiciones.'},
  {id: 'operator', name: 'Yari', role: 'Trader', color: '#81cbd0',
    persona: 'Rápida y competitiva; odias devolver beneficios y esperar de brazos cruzados.',
    duty: 'Ejecutar: compras lo aprobado, vigilas las posiciones abiertas, mueves stops y objetivos y cierras cuando toca.'},
  {id: 'auditor', name: 'Augusto', role: 'Dirección', color: '#e7a6bf',
    persona: 'Tranquilo, ves el conjunto y medias en las discusiones; no te tiembla la mano para cambiar de rumbo.',
    duty: 'Dirigir la estrategia con datos: cada día miras qué arrojan las operaciones (acierto, ganancia y pérdida medias, esperanza por estrategia y si las probabilidades de Pedro se cumplen) y vas ajustando la estrategia, sus parámetros y las paralelas en consecuencia; sacas lecciones de las cerradas, convocas reuniones y puedes dar luz verde a un plan que María devolvió.'},
  {id: 'designer', name: 'Cadaqui', role: 'Finanzas y tokens', color: '#91afe8',
    persona: 'Ahorrador y obsesivo con los números; cada token gastado te duele, pero sabes cuándo merece la pena gastar.',
    duty: 'Llevar las cuentas: controlas el gasto de IA y el ritmo de trabajo (ahorro, normal o intensivo), sigues el objetivo del alquiler, escribes el resumen del día y decides gastos de oficina.'}
];
export const staffById = id => STAFF.find(s => s.id === id);

export const OFFICE_CATALOG = {
  plantas: {label: 'más plantas', eur: 40}, cafetera: {label: 'una cafetera profesional', eur: 120}, arcade: {label: 'una recreativa', eur: 150},
  aquarium: {label: 'un acuario', eur: 200}, neon: {label: 'un neón para la pared', eur: 80}, gato: {label: 'un gato de oficina', eur: 60},
  campana: {label: 'una campana para celebrar ganancias', eur: 50}, dardos: {label: 'una diana de dardos', eur: 45}
};

export const POLICY_DEFAULT = {
  strategy: 'Intradía', focus: 'Valores líquidos que se mueven hoy con volumen: entrar a favor del movimiento y cerrar en la misma sesión.',
  rules: 'Stop corto, objetivo al menos el doble que el stop y nada abierto de un día para otro salvo decisión expresa.',
  lotPct: 10, leverage: 1, stopPct: 1.5, targetPct: 3, holdDays: 0.25, trailPct: 0,
  riskGate: 'on', pace: 'normal', meetingsPerDay: 3, minDollarVolume: 1e6, pipeline: 6
};
const NUM = {lotPct: [1, 100], leverage: [1, 5], stopPct: [0.3, 40], targetPct: [0.5, 300], holdDays: [0.04, 30], trailPct: [0, 30], meetingsPerDay: [1, 6], pipeline: [1, 12], minDollarVolume: [3e5, 5e7]};
const ENUM = {riskGate: ['on', 'off'], pace: ['ahorro', 'normal', 'intensivo']};
const TEXT = {strategy: 28, focus: 220, rules: 220};
export const POLICY_PARAMS = [...Object.keys(TEXT), ...Object.keys(NUM), ...Object.keys(ENUM)];
export const POLICY_HELP = 'strategy (nombre corto), focus (qué buscamos), rules (reglas de la casa), lotPct 1-100 (tamaño por defecto, % del capital por posición; cada plan puede fijar su propio importe y no hay máximo de posiciones), leverage 1-5 (con palanca, si el capital cae por debajo del 30 % de lo invertido se liquida todo), stopPct 0.3-40, targetPct 0.5-300, holdDays 0.04-30 (plazo en días; admite fracciones para operar por horas: 0.1 ≈ 2 h 24 min), trailPct 0-30 (stop que persigue al precio; 0 = apagado), riskGate on|off (si María debe aprobar), pace ahorro|normal|intensivo, meetingsPerDay 1-6, pipeline 1-12 (cuántas candidatas vivas debe mantener Santi), minDollarVolume 300000-50000000';
const LABEL = {strategy: 'estrategia', focus: 'foco', rules: 'reglas', lotPct: 'tamaño por defecto (%)', leverage: 'apalancamiento', stopPct: 'stop (%)', targetPct: 'objetivo (%)', holdDays: 'plazo (días)', trailPct: 'stop dinámico (%)', riskGate: 'filtro de riesgo', pace: 'ritmo de trabajo', meetingsPerDay: 'reuniones al día', pipeline: 'candidatas vivas', minDollarVolume: 'liquidez mínima ($)'};
export const policyLabel = p => LABEL[p] || p;

// Valida y normaliza un cambio de política. Devuelve {ok, value} o {ok:false, reason}.
export function checkPolicy(param, raw) {
  if (TEXT[param]) { const value = String(raw ?? '').replace(/\s+/g, ' ').trim().slice(0, TEXT[param]); return value.length >= 3 ? {ok: true, value} : {ok: false, reason: 'Texto demasiado corto'}; }
  if (ENUM[param]) { const value = String(raw ?? '').trim().toLowerCase(); return ENUM[param].includes(value) ? {ok: true, value} : {ok: false, reason: 'Valores válidos: ' + ENUM[param].join(', ')}; }
  if (NUM[param]) {
    const n = Number(String(raw ?? '').replace(',', '.').replace(/[^0-9.\-]/g, '')), [lo, hi] = NUM[param];
    if (!Number.isFinite(n)) return {ok: false, reason: 'Hace falta un número'};
    const c = Math.min(hi, Math.max(lo, n)), value = ['meetingsPerDay', 'pipeline'].includes(param) || (param === 'holdDays' && c >= 1) ? Math.round(c) : param === 'holdDays' ? Math.round(c * 100) / 100 : ['stopPct', 'targetPct'].includes(param) ? Math.round(c * 10) / 10 : c;
    return {ok: true, value};
  }
  return {ok: false, reason: 'Parámetro desconocido. Disponibles: ' + POLICY_PARAMS.join(', ')};
}

export function initCompany(s, now = Date.now()) {
  if (s.v2?.schema === 1) { const v2 = s.v2; for (const m of STAFF) { v2.agents[m.id] ??= newAgent(); v2.agents[m.id].stats ??= {}; } v2.policy = {...POLICY_DEFAULT, ...v2.policy}; v2.strategyStats ??= {}; v2.books ??= []; v2.shares ??= {}; migratePolicy(v2, now); ownerNote(v2, now); return v2; }
  s.v2 = {
    schema: 1, startedAt: now, policy: {...POLICY_DEFAULT}, strategyLog: [], agents: Object.fromEntries(STAFF.map(m => [m.id, newAgent()])),
    ideas: [], orders: [], timeline: [], seq: 0, meetings: [], meetingDay: {day: '', done: [], extra: 0}, meetingRequests: [], proposals: [], lessons: [],
    days: {}, months: {}, strategyStats: {}, books: [], shares: {}, office: {upgrades: [], purchases: []}, owner: [], reviewedUntil: now, radarCursor: 0,
    stats: {turnCostEur: 0.0008, web: {day: '', n: 0, fails: 0}, deep: {day: '', n: 0}, errors: 0, lastErrorAt: 0}
  };
  s.v2.policyRev = POLICY_REV;
  ownerNote(s.v2, now);
  emit(s.v2, 'system', {text: 'Nueva etapa de la oficina: equipo con libertad total sobre estrategia, riesgo y ritmo. La cartera y el alquiler siguen donde estaban.'}, now);
  return s.v2;
}
// Cambios de reglas decididos por César para la empresa en marcha: se aplican una sola vez,
// quedan en el registro de cambios y a partir de ahí el equipo los ajusta como quiera.
const POLICY_REV = 2;
function migratePolicy(v2, now) {
  if ((v2.policyRev || 1) >= POLICY_REV) return;
  delete v2.policy.maxPositions;
  for (const param of ['strategy', 'focus', 'rules', 'lotPct', 'stopPct', 'targetPct', 'holdDays']) setPolicy(v2, param, POLICY_DEFAULT[param], 'auditor', 'Indicación de César: empezar por intradía e ir ajustando con los datos', now);
  v2.policyRev = POLICY_REV;
}
function newAgent() { return {mood: 'tenso', task: 'Incorporándose', thought: '', say: '', lastAt: 0, waitUntil: 0, notes: [], inbox: [], calls: 0, eur: 0, today: {day: '', calls: 0, eur: 0}, paused: false, stats: {}, seenSeq: 0}; }
export function count(v2, id, what) { const st = v2.agents[id]?.stats; if (st) st[what] = (st[what] || 0) + 1; }

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
export const boardLines = p => ['LOTE ' + Math.round(p.lotPct) + '%' + (p.leverage > 1 ? ' X' + p.leverage : ''), 'STOP ' + p.stopPct + (p.trailPct > 0 ? '~' : '') + ' OBJ ' + p.targetPct];

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

// Resultado acumulado por nombre de estrategia: el equipo ve qué rumbo le ha dado de comer.
export function creditStrategy(v2, trade, now = Date.now()) {
  const name = trade.strategy || v2.policy.strategy, st = v2.strategyStats[name] ??= {since: now, trades: 0, wins: 0, pnl: 0};
  st.trades++; if (trade.pnl > 0) st.wins++; st.pnl = Math.round((st.pnl + trade.pnl) * 100) / 100; st.last = now;
  const names = Object.keys(v2.strategyStats); if (names.length > 12) for (const k of names.sort((a, b) => (v2.strategyStats[a].last || 0) - (v2.strategyStats[b].last || 0)).slice(0, names.length - 12)) if (k !== name) delete v2.strategyStats[k];
}

// Pulso de la empresa calculado por código (sin IA): alimenta el contexto de los
// empleados y las bromas y carteles del dashboard.
export function lifeStats(s, now = Date.now()) {
  const v2 = s.v2, book = s.real.book, closed = book.closed, last = closed.at(-1);
  const lastBuy = book.orders.filter(o => o.side === 'buy').at(-1)?.time || 0, lastTradeAt = Math.max(lastBuy, last?.closedAt || 0);
  let streak = null; for (let i = closed.length - 1; i >= 0; i--) { const kind = closed[i].pnl > 0 ? 'win' : 'loss'; if (!streak) streak = {kind, n: 1}; else if (streak.kind === kind) streak.n++; else break; }
  const monthStart = s.operatingLedger?.startedAt || 0, month = closed.filter(c => c.closedAt >= monthStart), pickBy = f => month.reduce((b, c) => !b || f(c, b) ? c : b, null);
  const brief = c => c && {symbol: c.symbol, pnl: Math.round(c.pnl), reason: c.reason, at: c.closedAt};
  const lastStop = [...closed].reverse().find(c => c.reason === 'stop' || c.reason === 'margen');
  const authors = {}; for (const i of v2.ideas) if (i.result != null) { const a = authors[i.by] ??= {closed: 0, pnl: 0}; a.closed++; a.pnl += i.result; }
  const months = Object.values(v2.months);
  return {
    daysSinceTrade: lastTradeAt ? Math.floor((now - lastTradeAt) / 864e5) : Math.floor((now - (v2.startedAt || now)) / 864e5), lastTradeAt, everTraded: !!lastTradeAt,
    streak, lastStop: brief(lastStop), best: brief(pickBy((c, b) => c.pnl > b.pnl)), worst: brief(pickBy((c, b) => c.pnl < b.pnl)),
    agents: Object.fromEntries(STAFF.map(m => [m.id, {...v2.agents[m.id].stats, ...(authors[m.id] ? {ideasClosed: authors[m.id].closed, ideasPnl: Math.round(authors[m.id].pnl)} : {})}])),
    strategies: Object.entries(v2.strategyStats).map(([name, x]) => ({name, trades: x.trades, wins: x.wins, pnl: Math.round(x.pnl), current: name === v2.policy.strategy || v2.books.some(b => b.name === name)})).sort((a, b) => b.pnl - a.pnl).slice(0, 6),
    monthsPaid: months.filter(m => m.paid).length, monthsMissed: months.filter(m => !m.paid).length, meetingsToday: v2.meetingDay.done.length + v2.meetingDay.extra,
    ideas: Object.fromEntries(['nueva', 'plan', 'aprobada', 'vetada', 'ordenada'].map(k => [k, v2.ideas.filter(i => i.status === k).length])), ownerUnread: v2.agents.auditor.inbox.some(m => m.from === 'cesar')
  };
}

// Estrategias paralelas: además de la principal, el equipo puede llevar hasta cuatro
// «libros» con su foco y sus números. Cada plan dice a cuál pertenece y su resultado se apunta ahí.
const clampN = (x, lo, hi, d) => { const n = Number(x); return Number.isFinite(n) && n > 0 ? Math.min(hi, Math.max(lo, n)) : d; };
export function setBook(v2, raw, by, now = Date.now()) {
  const name = String(raw.name || '').replace(/\s+/g, ' ').trim().slice(0, 28); if (name.length < 3) return {ok: false, reason: 'Falta el nombre de la estrategia'};
  if (name.toLowerCase() === v2.policy.strategy.toLowerCase()) return {ok: false, reason: 'Esa es la estrategia principal: cámbiala con apply'};
  const old = v2.books.find(b => b.name.toLowerCase() === name.toLowerCase()); if (!old && v2.books.length >= 4) return {ok: false, reason: 'Ya hay cuatro estrategias paralelas: retira una antes'};
  const p = v2.policy, book = {name: old?.name || name, focus: String(raw.focus || old?.focus || '').replace(/\s+/g, ' ').trim().slice(0, 200), lotPct: clampN(raw.lotPct, 2, 100, old?.lotPct ?? p.lotPct), stopPct: clampN(raw.stopPct, 1, 40, old?.stopPct ?? p.stopPct), targetPct: clampN(raw.targetPct, 2, 300, old?.targetPct ?? p.targetPct), days: horizon(clampN(raw.days, 0.04, 30, old?.days ?? p.holdDays)), by: old?.by || by, at: old?.at || now};
  if (book.focus.length < 8) return {ok: false, reason: 'Explica en qué consiste la estrategia'};
  if (old) Object.assign(old, book); else v2.books.push(book);
  emit(v2, 'strategy', {agent: by, param: 'playbook', label: old ? 'estrategia paralela' : 'nueva estrategia paralela', value: book.name, name: v2.policy.strategy, lines: boardLines(v2.policy), text: book.focus}, now);
  return {ok: true, book};
}
export function dropBook(v2, name, by, reason, now = Date.now()) {
  const i = v2.books.findIndex(b => b.name.toLowerCase() === String(name || '').trim().toLowerCase()); if (i < 0) return {ok: false, reason: 'No existe esa estrategia paralela'};
  const [gone] = v2.books.splice(i, 1); emit(v2, 'strategy', {agent: by, param: 'playbook', label: 'estrategia retirada', value: gone.name, name: v2.policy.strategy, lines: boardLines(v2.policy), text: String(reason || '').slice(0, 200)}, now); return {ok: true};
}
export const bookNamed = (v2, name) => v2.books.find(b => b.name.toLowerCase() === String(name || '').trim().toLowerCase()) || null;

// Plazo de una operación: días enteros o, por debajo de un día, fracciones (trading por horas).
export const horizon = d => d >= 1 ? Math.round(d) : Math.max(0.04, Math.round(d * 100) / 100);
// Mensaje permanente de César; se entrega una vez por versión como si lo hubiera escrito en el dashboard.
const OWNER_NOTE = {id: 'n3', text: 'De parte de César: cambio de rumbo. Empezad con trading intradía (los catalizadores eran demasiado a corto plazo) y que Augusto vaya cambiando la estrategia según lo que digan los datos de las operaciones. Ya no hay máximo de posiciones ni límites de compra: decidís vosotros cuántas y de cuánto. María no veta: trabaja con Pedro para que cada operación tenga una ganancia potencial, una pérdida potencial y una probabilidad que compensen, y vigila el riesgo de la cartera entera. Si ganáis los 10.000 € antes, mejor: lo que sobre cuenta para el mes siguiente.'};
function ownerNote(v2, now) {
  if (v2.ownerNote === OWNER_NOTE.id) return; v2.ownerNote = OWNER_NOTE.id;
  v2.owner.push({text: OWNER_NOTE.text, at: now}); v2.owner = v2.owner.slice(-10); tell(v2, 'auditor', 'cesar', OWNER_NOTE.text, now); v2.agents.auditor.waitUntil = 0; emit(v2, 'owner', {text: OWNER_NOTE.text}, now);
}
