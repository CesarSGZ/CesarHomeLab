// Agent Office v2 · ciclo de la oficina (cada ~5 min desde GitHub Actions).
// 1) datos gratis por código: radar, cambio, precios, stops y órdenes pendientes;
// 2) IA con el presupuesto repartido: reunión si toca y turnos de los empleados;
// 3) diario y estado para el dashboard.
import {locked, load, log, operatingBudget, cost} from '../store.js';
import {scout} from '../radar.js';
import {equity, day, sample, freshQuote, fxValid} from '../core.js';
import {regularSession, parseChart, referenceSource} from '../market-data.js';
import {openPosition, closePosition, settlePositions, positionEur, positionPnl, invested, buyingPower, bookStats} from './book.js';
import {callModel} from './llm.js';
import {STAFF, staffById, RENT_TARGET, OFFICE_CATALOG, initCompany, emit, tell, expireIdeas, madrid, companyMood, eur, boardLines, policyLabel, creditStrategy, lifeStats} from './company.js';
import {takeTurn, workFor, brief, HOUSE} from './agents.js';
import {meetingDue, holdMeeting} from './meeting.js';

const PACE = {ahorro: 0.6, normal: 1, intensivo: 1.5};
const WEB_LIMIT = {ahorro: 1, normal: 3, intensivo: 6};
const CADENCE = {session: {scout: 10, analyst: 20, risk: 20, operator: 10, auditor: 40, designer: 60}, day: {scout: 25, analyst: 40, risk: 60, operator: 60, auditor: 60, designer: 90}, night: {scout: 240, analyst: 240, risk: 240, operator: 240, auditor: 240, designer: 240}};
const short = (s, n) => String(s || '').replace(/\s+/g, ' ').trim().slice(0, n);

async function refreshFx(s, now, fetcher) {
  const book = s.real.book; if (book.fx && now - book.fx.checkedAt < 3600e3) return;
  try {
    const r = await fetcher('https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml', {signal: AbortSignal.timeout(15000)}); if (!r.ok) throw Error('Cambio BCE no disponible');
    const xml = await r.text(), rate = Number(xml.match(/currency=['"]USD['"]\s+rate=['"]([\d.]+)['"]/)?.[1]), date = xml.match(/time=['"]([\d-]+)['"]/)?.[1], time = Date.parse(date + 'T00:00:00Z');
    if (!(rate > 0) || !Number.isFinite(time)) throw Error('Cambio BCE inválido');
    book.fx = {rate, time, date, checkedAt: now, source: 'BCE · referencia diaria, no precio de conversión ejecutable'};
  } catch (e) { log(s, 'system', e.message, 'warning'); }
}

export async function refreshQuotes(s, symbols, {now = Date.now(), fetcher = fetch, session = regularSession(now)} = {}) {
  const d = s.real, gap = session ? 4 * 60e3 : 3 * 3600e3;
  const need = [...new Set(symbols)].filter(sym => { const q = d.quotes[sym]; return !q || now - (q.fetchedAt || 0) > gap; }).slice(0, 24);
  d.marketCheckedAt = now; if (!need.length) return {updated: 0, errors: []};
  let updated = 0; const errors = [];
  for (let i = 0; i < need.length; i += 4) {
    const batch = await Promise.allSettled(need.slice(i, i + 4).map(async symbol => {
      const r = await fetcher('https://query1.finance.yahoo.com/v8/finance/chart/' + encodeURIComponent(symbol.replaceAll('.', '-')) + '?interval=1d&range=1mo&includePrePost=false', {headers: {'User-Agent': 'Mozilla/5.0', Accept: 'application/json'}, signal: AbortSignal.timeout(12000)});
      if (!r.ok) throw Error('Proveedor HTTP ' + r.status); return {symbol, q: parseChart(await r.json(), symbol, now)};
    }));
    batch.forEach((result, j) => { if (result.status === 'fulfilled') { const {symbol, q} = result.value; d.quotes[symbol] = q; const a = d.assets.find(a => a.symbol === symbol); if (a) a.dataVerified = true; updated++; } else errors.push(need[i + j] + ': ' + String(result.reason.message).slice(0, 80)); });
    if (errors.some(e => e.includes('429'))) break;
  }
  if (updated) { d.marketAt = now; d.marketProviderAt = now; }
  d.marketError = errors.length ? errors.slice(0, 4).join('; ') : null;
  d.marketStatus = (session ? 'Mercado abierto · ' : 'Mercado cerrado · ') + updated + ' precios actualizados de ' + need.length + (errors.length ? ' · ' + errors.length + ' sin respuesta' : '');
  for (const sym of Object.keys(d.quotes)) if (now - (d.quotes[sym].fetchedAt || 0) > 10 * 864e5) delete d.quotes[sym];
  return {updated, errors};
}

function onClosed(s, trade, now) {
  const v2 = s.v2, pctMove = (trade.exit / trade.entry - 1) * 100, why = {stop: 'saltó el stop', objetivo: 'tocó el objetivo', tiempo: 'se acabó el plazo', margen: 'llamada de margen'}[trade.reason] || 'venta decidida';
  const idea = v2.ideas.find(i => i.id === trade.eventId); if (idea) { idea.status = 'cerrada'; idea.updatedAt = now; idea.result = Math.round(trade.pnl); }
  creditStrategy(v2, trade, now);
  emit(v2, 'trade', {agent: 'operator', side: 'sell', symbol: trade.symbol, pnl: Math.round(trade.pnl * 100) / 100, pnlPct: Math.round(pctMove * 10) / 10, reason: trade.reason, text: `${trade.symbol}: ${why}. ${trade.pnl >= 0 ? 'Ganamos' : 'Perdemos'} ${eur(Math.abs(trade.pnl))}.`}, now);
  log(s, 'operator', `${trade.symbol}: cierre ${trade.reason}, ${trade.pnl.toFixed(2)} EUR ficticios`);
  if (['stop', 'objetivo', 'tiempo', 'margen'].includes(trade.reason)) tell(v2, 'operator', 'system', `${trade.symbol} se cerró solo (${why}): ${eur(trade.pnl)}`, now);
  v2.agents.auditor.waitUntil = 0;
}

export function processOrders(s, now = Date.now()) {
  const v2 = s.v2, book = s.real.book, done = [];
  for (const o of [...v2.orders]) {
    const idea = v2.ideas.find(i => i.id === o.ideaId), drop = () => { v2.orders = v2.orders.filter(x => x !== o); };
    if (now > o.expiresAt) { drop(); if (idea && idea.status === 'ordenada') { idea.status = 'caducada'; idea.updatedAt = now; } tell(v2, o.by, 'system', `La orden de ${o.side === 'buy' ? 'compra' : 'venta'} de ${o.symbol} caducó sin precio válido`, now); continue; }
    const q = s.real.quotes[o.symbol];
    if (o.side === 'buy') {
      if (s.paused) { o.note = 'César tiene las compras en pausa'; continue; }
      const asset = s.real.assets.find(a => a.symbol === o.symbol), r = asset ? openPosition(book, asset, o, q, s.config, v2.policy, now) : {ok: false, reason: 'Símbolo desconocido'};
      if (r.ok) { drop(); if (idea) { idea.status = 'comprada'; idea.updatedAt = now; } emit(v2, 'trade', {agent: o.by, side: 'buy', symbol: o.symbol, eur: Math.round(r.cost), price: r.position.entry, text: `Dentro de ${o.symbol}: ${eur(r.cost)} a ${r.position.entry.toFixed(2)} $.`}, now); log(s, 'operator', `${o.symbol}: compra ficticia de ${r.cost.toFixed(2)} EUR`); done.push(o); }
      else if (r.retry) o.note = r.reason;
      else { drop(); if (idea) { idea.status = 'aprobada'; idea.updatedAt = now; } tell(v2, o.by, 'system', `No se pudo comprar ${o.symbol}: ${r.reason}`, now); }
    } else {
      const r = closePosition(book, o.symbol, q, s.config, now, 'decisión');
      if (r.ok) { drop(); onClosed(s, r.trade, now); done.push(o); } else if (r.retry) o.note = r.reason; else drop();
    }
  }
  return done;
}

// Una ronda solo se gasta si hay algo nuevo que mirar: movimiento en la oficina, radar
// recién barrido o precios que se han movido. Si no, se espera cuatro veces más.
function news(s, id, session) {
  const v2 = s.v2, a = v2.agents[id];
  if (v2.timeline.some(e => e.id > (a.seenSeq || 0) && ['trade', 'strategy', 'meeting', 'owner', 'upgrade'].includes(e.type) && e.agent !== id)) return true;
  if (id === 'scout') return (s.real.lastScan || 0) > a.lastAt;
  if ((id === 'operator' || id === 'risk') && session) return s.real.book.positions.some(p => { const ref = a.marks?.[p.symbol]; return !ref || Math.abs((p.mark ?? p.entry) / ref - 1) >= 0.015; });
  return false;
}
function cadenceDue(s, id, phase, now, session) { const gap = now - s.v2.agents[id].lastAt, every = CADENCE[phase][id] * 60e3; return gap >= every * 4 || (gap >= every && news(s, id, session)); }
export function pickAgents(s, phase, now) {
  const v2 = s.v2;
  return STAFF.map(m => {
    const a = v2.agents[m.id]; if (a.paused) return null;
    const inbox = a.inbox.length, work = workFor(s, m.id).length, due = cadenceDue(s, m.id, phase, now, phase === 'session'), waiting = a.waitUntil > now;
    if (!inbox && !work && (waiting || !due)) return null;
    if (!inbox && waiting && work <= (a.workSeen || 0)) return null; // pidió descanso con ese mismo trabajo delante: se respeta
    if (phase === 'night' && !inbox && !work) return null;
    return {m, score: inbox * 30 + work * 40 + (due ? 10 + Math.min(60, (now - a.lastAt) / 60e3) : 0)};
  }).filter(Boolean).sort((x, y) => y.score - x.score).map(x => x.m);
}

// Cuántos turnos de IA caben en este ciclo según lo que queda de presupuesto para hoy.
export function planTurns(s, {phase, leftToday, now, manual}) {
  const v2 = s.v2, pace = v2.policy.pace, per = Math.max(0.0003, v2.stats.turnCostEur * 1.25);
  let base = phase === 'session' ? {ahorro: 2, normal: 3, intensivo: 4}[pace] : phase === 'day' ? {ahorro: 1, normal: 1, intensivo: 2}[pace] : 1;
  const m = madrid(now), minutesLeft = Math.max(30, (30 * 60 - m.minutes) % 1440 || 1440); // hasta las 06:00 de Madrid, cuando cambia el día de Nueva York
  const affordable = leftToday / per, cycles = minutesLeft / 5, perCycle = affordable / cycles;
  if (affordable < 1) return 0;
  if (perCycle < base) { if (perCycle >= 1) base = Math.floor(perCycle); else { const every = Math.ceil(1 / perCycle); base = Math.floor(now / 300000) % every === 0 ? 1 : 0; } }
  return manual ? Math.max(2, base) : base;
}

function dayRecord(s, now, budget) {
  const v2 = s.v2, m = madrid(now), book = s.real.book, eq = equity(book);
  if (v2.dayBase?.day !== m.day) v2.dayBase = {day: m.day, at: now, equity: eq, spentEur: budget.spentEur, seq: v2.seq};
  const base = v2.dayBase, ev = v2.timeline.filter(e => e.id > base.seq), sells = ev.filter(e => e.type === 'trade' && e.side === 'sell'), buys = ev.filter(e => e.type === 'trade' && e.side === 'buy');
  const rec = v2.days[m.day] ??= {day: m.day, final: false};
  Object.assign(rec, {equityOpen: Math.round(base.equity), equityClose: Math.round(eq), pnl: Math.round(eq - base.equity), bought: buys.map(e => e.symbol), sold: sells.map(e => ({symbol: e.symbol, pnl: Math.round(e.pnl)})), meetings: ev.filter(e => e.type === 'meeting').length, changes: ev.filter(e => e.type === 'strategy').map(e => e.label + ' → ' + e.value), ideas: ev.filter(e => e.type === 'handoff' && e.to === 'analyst' && e.symbol).length, spentEur: Math.max(0, Number((budget.spentEur - base.spentEur).toFixed(4))), positions: book.positions.length});
  const keys = Object.keys(v2.days).sort(); for (const k of keys.slice(0, Math.max(0, keys.length - 45))) delete v2.days[k];
  return rec;
}
const summarySchema = {type: 'object', additionalProperties: false, required: ['headline', 'text', 'grade'], properties: {headline: {type: 'string'}, text: {type: 'string'}, grade: {type: 'string', enum: ['buen día', 'día flojo', 'mal día', 'día decisivo']}}};
async function closeDay(env, s, rec, envx) {
  const v2 = s.v2, member = staffById('designer');
  rec.final = true; rec.headline = rec.pnl >= 0 ? 'Día en positivo: ' + eur(rec.pnl) : 'Día en negativo: ' + eur(rec.pnl); rec.text = '';
  try {
    const res = await envx.call(env, s, {agent: 'designer', maxOut: 320, schema: summarySchema,
      instructions: HOUSE + '\n\nERES CADAQUI, Finanzas y tokens. ' + member.persona + ' Escribe el RESUMEN DEL DÍA para César, el dueño: headline (máx. 70 caracteres, con gancho) y text (máx. 90 palabras, en pasado, concreto: qué se hizo, qué salió bien o mal, cómo vamos con el alquiler y qué toca mañana). Usa solo los datos del contexto.',
      input: {...brief(s, envx), hoy: rec, reuniones: v2.meetings.filter(mt => madrid(mt.at).day === rec.day).map(mt => mt.topic + ': ' + mt.summary), frasesDelDia: v2.timeline.filter(e => e.id > v2.dayBase.seq && ['handoff', 'trade'].includes(e.type)).slice(-8).map(e => short(e.text, 100))}});
    rec.headline = short(res.data.headline, 80) || rec.headline; rec.text = short(res.data.text, 700); rec.grade = res.data.grade;
    const a = v2.agents.designer; a.calls++; a.eur += res.costEur;
  } catch (error) { rec.text = 'Resumen automático sin IA: ' + (rec.sold.length ? rec.sold.length + ' cierres, ' : '') + (rec.bought.length ? rec.bought.length + ' compras, ' : '') + rec.meetings + ' reuniones.'; }
  emit(v2, 'summary', {agent: 'designer', day: rec.day, text: rec.headline}, envx.now);
}

export async function cycle(env, {manual = false, call = callModel, fetcher = fetch, clock = Date.now, radar = scout} = {}) {
  return locked(env, async (s, checkpoint) => {
    if (!manual && !s.automatic) return {skipped: true};
    const started = clock(); let now = started;
    s.lastTick = now; s.lastError = null; s.mode = 'real';
    const v2 = initCompany(s, now), book = s.real.book, month = day(now).slice(0, 7);
    if (s.operatingLedger?.month !== month) {
      if (s.operatingLedger?.month) { const profit = equity(book) - s.operatingLedger.openingEquity, paid = profit >= RENT_TARGET; v2.months[s.operatingLedger.month] = {profit: Math.round(profit), paid, equity: Math.round(equity(book))}; emit(v2, 'system', {kind: paid ? 'rent-paid' : 'rent-missed', text: paid ? `¡Alquiler de ${s.operatingLedger.month} pagado! Beneficio del mes: ${eur(profit)}.` : `No se llegó al alquiler de ${s.operatingLedger.month}: ${eur(profit)} de ${eur(RENT_TARGET)}.`}, now); }
      s.operatingLedger = {month, openingEquity: equity(book), startedAt: now};
    }
    // 1 · Datos sin IA
    if (now - (s.real.lastScan || 0) > 15 * 60e3) { try { await radar(s); } catch (e) { log(s, 'scout', 'Radar: ' + short(e.message, 120), 'warning'); s.real.lastScan = now; } await checkpoint(); }
    await refreshFx(s, now, fetcher);
    const session = regularSession(now), m = madrid(now), phase = session ? 'session' : (m.hour >= 7 && m.minutes < 23 * 60 + 30) ? 'day' : 'night';
    const watch = [...book.positions.map(p => p.symbol), ...v2.orders.map(o => o.symbol), ...v2.ideas.filter(i => ['aprobada', 'plan', 'nueva', 'vetada', 'ordenada'].includes(i.status)).map(i => i.symbol)];
    await refreshQuotes(s, watch, {now, fetcher, session});
    for (const trade of settlePositions(book, s.real.quotes, s.config, v2.policy, now)) onClosed(s, trade, now);
    processOrders(s, now); expireIdeas(v2, now); sample(book, now);
    let budget = await operatingBudget(env, s);
    const daysInMonth = new Date(Number(month.slice(0, 4)), Number(month.slice(5)), 0).getDate();
    v2.mood = companyMood({monthPnl: budget.monthlyProfit, daysLeft: budget.daysLeft, daysInMonth, remainingEur: budget.remainingEur, dayPnl: equity(book) - (v2.dayBase?.day === m.day ? v2.dayBase.equity : equity(book)), equity: equity(book)});
    dayRecord(s, now, budget); await checkpoint();
    // 2 · IA
    const keyPresent = !!env.OPENAI_RUNTIME_KEY || !!(await env.CONTROL_DB.prepare("SELECT name FROM trading_secrets WHERE name='openai'").first());
    const result = {turns: 0, meeting: null, phase};
    const today = day(now); if (v2.stats.web.day !== today) v2.stats.web = {day: today, n: 0, fails: 0};
    const allowanceToday = Math.min(budget.remainingEur, budget.remainingEur / Math.max(1, budget.daysLeft) * PACE[v2.policy.pace]);
    let leftToday = allowanceToday - (budget.daySpentEur || 0);
    const envx = {call, checkpoint, session, mood: {joy: 'euforia', calm: 'tranquilos', tense: 'tensos', panic: 'agobiados'}[v2.mood], budget, allowanceToday, webLimit: v2.stats.web.fails >= 2 ? 0 : WEB_LIMIT[v2.policy.pace], monthStart: s.operatingLedger.startedAt, now};
    v2.ai = {ok: keyPresent && fxValid(book, now) && leftToday > 0.002 && !budget.exhausted, reason: !keyPresent ? 'Falta conectar la clave de OpenAI' : !fxValid(book, now) ? 'Falta el cambio EUR/USD' : budget.exhausted ? 'Tokens del mes agotados' : leftToday <= 0.002 ? 'Presupuesto de IA de hoy agotado: hoy solo rutinas por código' : null, allowanceToday, leftToday};
    if (v2.ai.ok) {
      let errors = 0; const fail = (who, error) => { errors++; v2.stats.errors++; v2.stats.lastErrorAt = now; log(s, who, 'IA: ' + short(error.message, 140), 'warning'); if (['sin_presupuesto', 'sin_clave', 'clave_invalida', 'sin_fx'].includes(error.code)) errors = 99; };
      const due = meetingDue(s, now, session);
      if (due && leftToday > v2.stats.turnCostEur * 12) {
        try { const meeting = await holdMeeting(env, s, due, envx); result.meeting = meeting.topic; leftToday -= meeting.costEur; } catch (error) { fail('auditor', error); }
        await checkpoint();
      }
      let turns = result.meeting ? 0 : planTurns(s, {phase, leftToday, now, manual});
      const queue = turns ? pickAgents(s, phase, now) : [], acted = {}; let chain = session ? 2 : 1;
      while (queue.length && turns > 0 && errors < 2 && clock() - started < 4.5 * 60e3) {
        const member = queue.shift(); now = clock(); envx.now = now; turns--;
        try {
          const r = await takeTurn(env, s, member, envx); result.turns++; leftToday -= r.costEur; acted[member.id] = (acted[member.id] || 0) + 1;
          processOrders(s, now);
          for (const id of r.wake) { if ((acted[id] || 0) >= 2 || queue.some(q => q.id === id)) continue; queue.unshift(staffById(id)); if (turns < 1 && chain > 0 && leftToday > v2.stats.turnCostEur * 3) { turns++; chain--; } }
        } catch (error) { fail(member.id, error); v2.agents[member.id].lastAt = now; }
        await checkpoint();
      }
      budget = await operatingBudget(env, s); envx.budget = budget; envx.now = clock();
      const rec = dayRecord(s, envx.now, budget);
      if (!rec.final && madrid(envx.now).minutes >= 22 * 60 + 20 && errors < 2) { await closeDay(env, s, rec, envx); await checkpoint(); }
    } else if (v2.ai.reason && v2.aiNotice !== today + v2.ai.reason) { v2.aiNotice = today + v2.ai.reason; emit(v2, 'system', {text: v2.ai.reason}, now); }
    for (const d of Object.values(v2.days)) if (!d.final && d.day < madrid(now).day) { d.final = true; d.headline ??= d.pnl >= 0 ? 'Día en positivo: ' + eur(d.pnl) : 'Día en negativo: ' + eur(d.pnl); d.text ??= ''; }
    return result;
  });
}

export async function status(env) {
  const {state: s, busy} = await load(env); const now = Date.now(), v2 = initCompany(s, now), book = s.real.book, eq = equity(book);
  const budget = await operatingBudget(env, s), calls = await cost(env), session = regularSession(now);
  const secrets = await env.CONTROL_DB.prepare('SELECT name FROM trading_secrets').all(), configured = new Set((secrets.results || []).map(r => r.name));
  const month = day(now).slice(0, 7), daysInMonth = new Date(Number(month.slice(0, 4)), Number(month.slice(5)), 0).getDate();
  const mood = companyMood({monthPnl: budget.monthlyProfit, daysLeft: budget.daysLeft, daysInMonth, remainingEur: budget.remainingEur, dayPnl: eq - (v2.dayBase?.equity ?? eq), equity: eq});
  const name = sym => short(String(s.real.assets.find(a => a.symbol === sym)?.name || '').replace(/ (Common Stock|Ordinary Shares|Class A).*$/i, ''), 40);
  const st = bookStats(book, s.operatingLedger?.startedAt || 0);
  return {
    ok: true, v: 2, time: now, lastTick: s.lastTick, lastError: s.lastError, busy, paused: s.paused, automatic: s.automatic,
    company: {equity: eq, cash: book.cash, invested: invested(book), buyingPower: buyingPower(book, v2.policy.leverage), initial: book.initial, monthPnl: budget.monthlyProfit, monthOpen: s.operatingLedger?.openingEquity ?? book.initial, rentTarget: RENT_TARGET, rentPct: budget.monthlyProfit / RENT_TARGET * 100, daysLeft: budget.daysLeft, needPerDay: Math.max(0, RENT_TARGET - budget.monthlyProfit) / Math.max(1, budget.daysLeft), dayPnl: eq - (v2.dayBase?.equity ?? eq), mood, maxDrawdown: book.maxDrawdown, months: v2.months, stats: {trades: st.trades, wins: st.wins, losses: st.losses, realised: st.realised}},
    budget: {allowanceEur: budget.allowanceEur, spentEur: budget.spentEur, remainingEur: budget.remainingEur, todaySpentEur: budget.daySpentEur, todayAllowanceEur: v2.ai?.allowanceToday ?? null, pace: v2.policy.pace, turnCostEur: v2.stats.turnCostEur, callsToday: calls.calls || 0, ai: v2.ai || null, webToday: v2.stats.web.n},
    market: {open: session, status: s.real.marketStatus, at: s.real.marketAt, error: s.real.marketError, fx: book.fx ? {rate: book.fx.rate, date: book.fx.date} : null},
    policy: v2.policy, board: {name: v2.policy.strategy, lines: boardLines(v2.policy)}, strategyLog: v2.strategyLog.slice(0, 15).map(c => ({...c, label: policyLabel(c.param)})),
    agents: STAFF.map(mb => { const a = v2.agents[mb.id]; return {id: mb.id, name: mb.name, role: mb.role, color: mb.color, duty: mb.duty, persona: mb.persona, mood: a.mood, task: a.task, thought: a.thought, say: a.say, lastAt: a.lastAt, waitUntil: a.waitUntil, paused: a.paused, calls: a.calls, eur: a.eur, today: a.today, notes: a.notes.slice(-3), inbox: a.inbox.length, work: workFor(s, mb.id).length}; }),
    positions: book.positions.map(p => ({id: p.id, symbol: p.symbol, name: name(p.symbol), qty: p.qty, entry: p.entry, mark: p.mark ?? p.entry, eur: positionEur(p), pnl: positionPnl(p), pnlPct: ((p.mark ?? p.entry) / p.entry - 1) * 100, stop: p.stop, target: p.target, openedAt: p.openedAt, expiresAt: p.expiresAt, thesis: p.thesis, fresh: freshQuote(s.real.quotes[p.symbol], now, s.config)})),
    orders: v2.orders.map(o => ({id: o.id, side: o.side, symbol: o.symbol, eur: o.eur || null, at: o.at, note: o.note || null})),
    closed: book.closed.slice(-40).reverse().map(c => ({symbol: c.symbol, pnl: c.pnl, pnlPct: (c.exit / c.entry - 1) * 100, reason: c.reason, openedAt: c.openedAt, closedAt: c.closedAt})),
    ideas: v2.ideas.slice(0, 40).map(i => ({id: i.id, symbol: i.symbol, name: i.name, status: i.status, by: i.by, thesis: i.thesis, plan: i.plan, risk: i.risk, research: i.research && {summary: i.research.summary, sentiment: i.research.sentiment, sources: i.research.sources}, updatedAt: i.updatedAt, result: i.result ?? null})),
    timeline: v2.timeline.slice(-220), meetings: v2.meetings.slice(0, 14), proposals: v2.proposals.slice(0, 12), lessons: v2.lessons,
    life: lifeStats(s, now), days: Object.values(v2.days).sort((a, b) => b.day.localeCompare(a.day)).slice(0, 30), office: {upgrades: v2.office.upgrades, purchases: v2.office.purchases, catalog: OFFICE_CATALOG}, owner: v2.owner.slice(-5),
    curve: book.curve.slice(-300), radar: {events: s.real.events.length, lastScan: s.real.lastScan, sources: s.real.discovery?.sources || {}},
    universe: {total: s.real.assets.length},
    connections: {openai: configured.has('openai'), market: Object.values(s.real.quotes).some(q => freshQuote(q, now, s.config)), source: referenceSource, fx: fxValid(book, now), scheduler: s.lastTick ? now - s.lastTick < 10 * 60e3 : false}
  };
}

// Órdenes de César desde el dashboard.
export function ownerCommand(s, path, body, now = Date.now()) {
  const v2 = initCompany(s, now);
  if (path === '/owner') { const text = short(body.text, 400); if (text.length < 3) throw Error('Mensaje vacío'); v2.owner.push({text, at: now}); v2.owner = v2.owner.slice(-10); tell(v2, 'auditor', 'cesar', text, now); v2.agents.auditor.waitUntil = 0; emit(v2, 'owner', {text}, now); return; }
  if (path === '/meeting') { const topic = short(body.topic, 90) || 'Reunión convocada por César'; v2.meetingRequests = [{topic, by: 'auditor', at: now, owner: true}, ...v2.meetingRequests.filter(r => !r.owner)].slice(0, 3); emit(v2, 'owner', {text: 'César convoca reunión: ' + topic}, now); return; }
  if (path === '/gift') {
    const key = String(body.item || '').toLowerCase(), item = OFFICE_CATALOG[key]; if (!item) throw Error('Eso no está en el catálogo');
    if (v2.office.upgrades.includes(key)) throw Error('Eso ya está en la oficina');
    v2.office.upgrades.push(key); v2.office.purchases.push({item: key, eur: 0, at: now, by: 'cesar'}); // regalo del dueño: no toca la caja
    emit(v2, 'upgrade', {agent: 'cesar', gift: true, item: key, label: item.label, text: 'César regala ' + item.label}, now); return;
  }
  throw Error('Acción desconocida');
}
