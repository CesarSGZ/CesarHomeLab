// Agent Office v2 · contabilidad de la cartera ficticia.
// Las únicas reglas son contables: precios reales recientes, caja (o margen) suficiente,
// deslizamiento y comisión. Qué comprar, cuánto y con qué riesgo lo deciden los agentes.
import {equity, freshQuote, fxValid, rollover, sell, monitor, id, referencePrice} from '../core.js';
import {isSpanish} from '../spain.js';

export const invested = book => book.positions.reduce((sum, p) => sum + p.qty * (p.mark ?? p.entry) / (p.markFx || p.entryFx || 1), 0);
export const buyingPower = (book, leverage = 1) => Math.max(0, equity(book) * leverage - invested(book));
export const positionEur = p => p.qty * (p.mark ?? p.entry) / (p.markFx || p.entryFx || 1);
export const positionPnl = p => positionEur(p) - (p.qty * p.entry + (p.entryFee || 0)) / (p.entryFx || 1);

// Compra a mercado sobre la referencia pública más reciente. Devuelve {ok, reason|position}.
export function openPosition(book, asset, order, quote, config, policy, t = Date.now()) {
  rollover(book, t);
  if (!fxValid(book, t)) return {ok: false, reason: 'Sin cambio EUR/USD reciente'};
  if (!freshQuote(quote, t, config)) return {ok: false, retry: true, reason: 'Sin precio reciente en sesión (mercado cerrado o dato retrasado)'};
  if (book.positions.some(p => p.symbol === asset.symbol)) return {ok: false, reason: 'Ya hay una posición abierta en ' + asset.symbol};
  if (book.positions.length >= policy.maxPositions) return {ok: false, reason: 'Cartera llena: el máximo acordado es ' + policy.maxPositions + ' posiciones'};
  const fx = isSpanish(asset.symbol) ? 1 : book.fx.rate, price = quote.price * (1 + config.slippageBps / 1e4);
  if (order.limit > 0 && price > order.limit) return {ok: false, retry: true, reason: 'Precio por encima del límite fijado (' + order.limit.toFixed(2) + ')'};
  if (!(quote.dollarVolume >= policy.minDollarVolume)) return {ok: false, reason: 'Liquidez insuficiente para entrar sin mover el precio'};
  const power = buyingPower(book, policy.leverage);
  let eur = Math.min(order.eur, power);
  // No se compra más del 10 % del volumen medio diario: por encima el precio de referencia no sería creíble.
  eur = Math.min(eur, quote.dollarVolume * 0.1 / fx);
  const qty = Math.floor((eur * fx - config.commission) / price);
  if (qty < 1) return {ok: false, reason: power < 50 ? 'Sin caja ni margen disponible' : 'El importe no alcanza para una acción'};
  const stopPct = order.stopPct > 0 ? order.stopPct : policy.stopPct, targetPct = order.targetPct > 0 ? order.targetPct : policy.targetPct, days = order.days > 0 ? order.days : policy.holdDays;
  const cost = (qty * price + config.commission) / fx;
  book.cash -= cost; book.entriesToday = (book.entriesToday || 0) + 1;
  const orderId = id(order.ideaId || asset.symbol, 'buy', t);
  book.orders.push({id: orderId, eventId: order.ideaId || null, symbol: asset.symbol, side: 'buy', qty, price, fee: config.commission, time: t, pricing: 'Referencia pública + deslizamiento estimado', source: quote.source || null, quoteTime: quote.time});
  const position = {id: orderId, eventId: order.ideaId || null, symbol: asset.symbol, sector: asset.sector, qty, entry: price, entryFx: fx, mark: quote.price, markFx: fx, allocation: cost, stop: price * (1 - stopPct / 100), target: price * (1 + targetPct / 100), expiresAt: t + days * 864e5, entryFee: config.commission, openedAt: t, thesis: String(order.thesis || '').slice(0, 300), strategy: order.strategy || null, currency: isSpanish(asset.symbol) ? 'EUR' : 'USD', pricing: 'Referencia pública + deslizamiento estimado', quoteTime: quote.time, by: order.by || 'operator'};
  book.positions.push(position);
  return {ok: true, position, cost};
}

export function closePosition(book, symbol, quote, config, t = Date.now(), reason = 'decisión') {
  const p = book.positions.find(x => x.symbol === symbol);
  if (!p) return {ok: false, reason: 'No hay posición en ' + symbol};
  const trade = sell(book, p, quote, config, t, reason);
  return trade ? {ok: true, trade} : {ok: false, retry: true, reason: 'Sin precio reciente en sesión para vender'};
}

// Mueve stop/objetivo/plazo de una posición abierta. Porcentajes respecto al último precio.
export function adjustPosition(book, symbol, {stopPct, targetPct, days}, t = Date.now()) {
  const p = book.positions.find(x => x.symbol === symbol);
  if (!p) return {ok: false, reason: 'No hay posición en ' + symbol};
  const ref = p.mark ?? p.entry, changes = [];
  const same = (a, b) => Math.abs(a / b - 1) < 0.004;
  if (stopPct > 0 && stopPct < 90 && !same(p.stop, ref * (1 - stopPct / 100))) { p.stop = ref * (1 - stopPct / 100); changes.push('stop ' + p.stop.toFixed(2)); }
  if (targetPct > 0 && targetPct < 1000 && !same(p.target, ref * (1 + targetPct / 100))) { p.target = ref * (1 + targetPct / 100); changes.push('objetivo ' + p.target.toFixed(2)); }
  if (days > 0 && days <= 60) { p.expiresAt = t + days * 864e5; changes.push('plazo ' + (days < 1 ? Math.round(days * 240) / 10 + ' h' : days + ' d')); }
  return changes.length ? {ok: true, changes} : {ok: false, reason: 'Esos niveles ya estaban puestos'};
}

// Stops, objetivos y plazos se cumplen por código en cada ciclo con precio reciente.
export function settlePositions(book, quotes, config, policy, t = Date.now()) {
  // Stop dinámico acordado por el equipo: con precio reciente el stop sube detrás del precio y nunca baja.
  if (policy.trailPct > 0) for (const p of book.positions) { const q = quotes[p.symbol]; if (!freshQuote(q, t, config)) continue; const trail = referencePrice(q) * (1 - policy.trailPct / 100); if (trail > p.stop) p.stop = trail; }
  const trades = monitor(book, quotes, config, t);
  // Llamada de margen: con apalancamiento, si el capital cae por debajo del 30 % de lo invertido se liquida todo.
  const inv = invested(book);
  if (policy.leverage > 1 && inv > 0 && equity(book) < inv * 0.3) {
    for (const p of [...book.positions]) { const trade = sell(book, p, quotes[p.symbol], config, t, 'margen'); if (trade) trades.push(trade); }
  }
  return trades;
}

export function bookStats(book, since = 0) {
  const closed = book.closed.filter(c => c.closedAt >= since), wins = closed.filter(c => c.pnl > 0), losses = closed.filter(c => c.pnl <= 0);
  const avg = a => a.length ? a.reduce((s, c) => s + c.pnl, 0) / a.length : 0;
  return {trades: closed.length, wins: wins.length, losses: losses.length, winRate: closed.length ? wins.length / closed.length : null, avgWin: avg(wins), avgLoss: avg(losses), realised: closed.reduce((s, c) => s + c.pnl, 0), best: closed.reduce((b, c) => !b || c.pnl > b.pnl ? c : b, null), worst: closed.reduce((b, c) => !b || c.pnl < b.pnl ? c : b, null)};
}
