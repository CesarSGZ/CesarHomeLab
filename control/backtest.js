// Backtest Lab (Mission Control 08). Muestra el último backtest guardado en D1 y permite encolar uno nuevo.
// El cálculo NO se hace aquí: lo ejecuta el workflow backtest-lab.yml (Python) y deja el resultado en D1.
import {PARAM_LIMITS, MOMENTUM_LOOKBACKS} from './backtest-model.js';

const app = document.getElementById('backtest-app');
let csrf = '', state = null, strategyId = 'vct', period = 'full', loaded = false, loading = false, poll = null, tradeFilter = '', tradeLimit = 25;

const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const pct = (x, dec = 1, sign = false) => x === null || x === undefined ? '–' : (sign && x > 0 ? '+' : '') + new Intl.NumberFormat('es-ES', {minimumFractionDigits: dec, maximumFractionDigits: dec}).format(x * 100) + ' %';
const num = (x, dec = 2) => x === null || x === undefined ? '–' : new Intl.NumberFormat('es-ES', {minimumFractionDigits: dec, maximumFractionDigits: dec}).format(x);
const eur = x => x === null || x === undefined ? '–' : new Intl.NumberFormat('es-ES', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0}).format(x);
const fecha = s => s ? new Intl.DateTimeFormat('es-ES', {day: '2-digit', month: 'short', year: 'numeric'}).format(new Date(s)) : '–';
const fechaHora = s => s ? new Intl.DateTimeFormat('es-ES', {day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'}).format(new Date(s)) : '–';
const pp = x => x === null || x === undefined ? '–' : `${x > 0 ? '+' : ''}${num(x * 100, 1)} pp`;
const cls = x => x === null || x === undefined ? '' : x < 0 ? 'neg' : 'pos';
const PERIODS = [['full', 'Todo el periodo'], ['train', 'Entrenamiento'], ['test', 'Validación (fuera de muestra)']];
const REASONS = {'pierde media 200': 'Perdió la media de 200', 'deja de cumplir criterios': 'Dejó de cumplir', 'sin datos': 'Sin datos', abierta: 'Abierta'};

async function api(method = 'GET', body, query = '') {
  const response = await fetch('/control/api/backtest/status' + query, {
    method, credentials: 'same-origin',
    headers: {accept: 'application/json', ...(body ? {'content-type': 'application/json', 'x-csrf-token': csrf} : {})},
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => ({ok: false, error: 'invalid_response'}));
  if (!response.ok && !data.request) throw new Error(data.error || 'request_failed');
  return data;
}

async function load() {
  if (loading) return;
  loading = true;
  try { state = await api(); loaded = true; render(); schedulePoll(); }
  catch { app.innerHTML = '<p class="eyebrow"><span></span> BACKTEST LAB</p><h2>No se pudo cargar.</h2><p class="bt-muted">El servicio no responde. Vuelve a intentarlo en un momento.</p>'; }
  finally { loading = false; }
}

function schedulePoll() {
  clearTimeout(poll);
  if (!state?.active) return;
  poll = setTimeout(async () => {
    try {
      const before = state.request?.status;
      const fresh = await api('GET', undefined, '?only=request');
      state.request = fresh.request; state.active = fresh.active;
      if (before && before !== fresh.request?.status) { await load(); return; }
      renderRunStatus();
    } catch { /* se reintenta en el siguiente ciclo */ }
    schedulePoll();
  }, 20000);
}

const strategy = () => state.result?.strategies.find(s => s.id === strategyId) || state.result?.strategies[0];

function render() {
  if (!state.result) {
    app.innerHTML = `${heading()}<div class="bt-empty"><strong>Todavía no hay resultados guardados.</strong><p>Pulsa «Ejecutar backtest»: GitHub Actions descargará los datos de Yahoo Finance, calculará las dos estrategias y dejará aquí el informe (unos 15-25 minutos la primera vez).</p></div>${runPanel()}`;
    bindRun(); return;
  }
  const s = strategy();
  strategyId = s.id;
  app.innerHTML = `${heading()}
    <div class="bt-tabs" role="tablist" aria-label="Estrategias">${state.result.strategies.map(x => `<button type="button" role="tab" aria-selected="${x.id === s.id}" data-bt-strategy="${x.id}">${esc(x.id === 'vct' ? 'Valor + calidad + tendencia' : 'Tendencia + momentum')}<small>${x.id === 'vct' ? 'Fundamentales · desde ' + x.start.slice(0, 4) : 'Solo precio · desde ' + x.start.slice(0, 4)}</small></button>`).join('')}</div>
    ${verdict(s)}
    <section class="bt-rules" aria-label="La estrategia en simple">
      ${[['compra', 'Compra cuando', 'B'], ['venta', 'Vende cuando', 'S'], ['cartera', 'Cómo es la cartera', 'P']].map(([k, t, i]) => `<article><header><b>${i}</b><h3>${t}</h3></header><ul>${(s.rules?.[k] || []).map(r => `<li>${esc(r)}</li>`).join('')}</ul></article>`).join('')}
    </section>
    <div class="bt-periods" role="group" aria-label="Periodo">${PERIODS.map(([id, label]) => `<button type="button" aria-pressed="${period === id}" data-bt-period="${id}">${label}</button>`).join('')}</div>
    ${kpis(s)}
    <section class="bt-card"><header><div><small>CAPITAL · ESCALA LOGARÍTMICA</small><h3>Estrategia frente al IBEX con dividendos</h3></div><div class="bt-legend"><span class="s">Estrategia</span><span class="i">IBEX 35 + dividendos</span><span class="e">Equiponderada del universo</span></div></header>
      <div class="bt-chart" id="bt-chart"></div><p class="bt-note">Zona sombreada: periodo de entrenamiento. A la derecha, validación fuera de muestra (datos que no se usaron para decidir nada).</p></section>
    <div class="bt-two">
      <section class="bt-card"><header><div><small>AÑO A AÑO</small><h3>Rentabilidad por año</h3></div></header>${annual(s)}</section>
      <section class="bt-card"><header><div><small>LO QUE HAY HOY EN CARTERA</small><h3>Posiciones abiertas (${s.openPositions.length})</h3></div></header>${openPositions(s)}</section>
    </div>
    <section class="bt-card"><header><div><small>TODAS LAS OPERACIONES · ${s.trades.length}</small><h3>Lista de operaciones</h3></div><label class="bt-search"><span class="bt-sr">Buscar</span><input type="search" id="bt-trade-search" placeholder="Buscar valor o sector…" value="${esc(tradeFilter)}"></label></header><div id="bt-trades"></div></section>
    ${s.grid ? grid(s) : ''}
    ${limitations()}
    ${runPanel()}`;
  app.querySelectorAll('[data-bt-strategy]').forEach(b => b.addEventListener('click', () => { strategyId = b.dataset.btStrategy; tradeLimit = 25; render(); }));
  app.querySelectorAll('[data-bt-period]').forEach(b => b.addEventListener('click', () => { period = b.dataset.btPeriod; render(); }));
  const search = app.querySelector('#bt-trade-search');
  search.addEventListener('input', () => { tradeFilter = search.value; tradeLimit = 25; renderTrades(s); });
  renderTrades(s);
  drawChart(s);
  bindRun();
}

function heading() {
  const r = state.result;
  const quien = r ? (r.trigger === 'weekly' ? 'recálculo semanal automático' : r.trigger === 'manual' ? `lanzado por ${esc(r.requestedBy || 'ti')}` : 'carga inicial') : '';
  return `<div class="bt-heading"><div><p class="eyebrow"><span></span> BACKTEST LAB / MERCADO CONTINUO ESPAÑOL</p><h2>¿Bate la estrategia al IBEX?<br><em>Sin maquillar los números.</em></h2>
    <p>Dos estrategias semanales sobre ~${r?.data?.tickers || 117} valores del mercado continuo, con costes tipo Interactive Brokers, impuesto ITF y datos gratuitos de Yahoo Finance. Solo simulación: no hay conexión con ningún bróker.</p></div>
    <a class="bt-jump" href="#bt-run">Ejecutar backtest ↓</a></div>
    ${r ? `<p class="bt-strip"><span><i></i>Datos hasta ${fecha(r.dataUntil)}</span><span>Calculado ${fechaHora(r.generatedAt)} · ${quien}</span><span>${r.data.tickers} valores · fundamentales fiables en ${r.data.fundamentalsReliable}</span></p>` : ''}`;
}

function verdict(s) {
  const v = s.verdict;
  return `<section class="bt-verdict ${esc(v.level)}" aria-label="Veredicto"><small>VEREDICTO AUTOMÁTICO · REGLA FIJA</small><strong>${esc(v.title)}</strong><p>${esc(v.text)}</p></section>`;
}

function kpis(s) {
  const m = s.metrics[period], st = m.strategy || {}, ib = m.ibex || {}, ew = m.ew || {};
  const years = st.years ? `${num(st.years, 1)} años` : '';
  const tile = (label, value, sub, tone = '') => `<article class="${tone}"><small>${label}</small><strong>${value}</strong><span>${sub}</span></article>`;
  const gap = st.cagr !== undefined && ib.cagr !== undefined ? st.cagr - ib.cagr : null;
  return `<p class="bt-period-label">${esc(st.period || '')} · ${years}</p><div class="bt-kpis">
    ${tile('RENTABILIDAD ANUAL (CAGR)', pct(st.cagr), `IBEX ${pct(ib.cagr)} · Equiponderada ${pct(ew.cagr)}`, cls(gap))}
    ${tile('DIFERENCIA CON EL IBEX', pp(gap), 'puntos porcentuales por año', cls(gap))}
    ${tile('PEOR CAÍDA', pct(st.maxdd), `IBEX ${pct(ib.maxdd)}`)}
    ${tile('SHARPE', num(st.sharpe), `IBEX ${num(ib.sharpe)} · volatilidad ${pct(st.vol, 0)}`)}
    ${tile('OPERACIONES / AÑO', num(st.tradesPerYear, 0), `${pct(st.hitRate, 0)} con beneficio`)}
    ${tile('INVERTIDO DE MEDIA', pct(st.exposure, 0), period === 'full' ? `${eur(s.capital)} → ${eur(s.finalValue)} · costes ${eur(s.costs)}` : `ganancia media ${pct(st.avgWin, 0)} · pérdida ${pct(st.avgLoss, 0)}`)}
  </div>`;
}

function annual(s) {
  const rows = s.annual.slice().reverse().map(a => {
    const d = a.strategy !== null && a.ibex !== null ? a.strategy - a.ibex : null;
    const test = String(a.year) > s.trainEnd.slice(0, 4);
    return `<tr><td>${a.year}${test ? ' <i title="Validación fuera de muestra">VAL</i>' : ''}</td><td class="${cls(a.strategy)}">${pct(a.strategy)}</td><td class="${cls(a.ibex)}">${pct(a.ibex)}</td><td class="${cls(d)}"><b>${pp(d)}</b></td></tr>`;
  }).join('');
  return `<div class="bt-table"><table><thead><tr><th>Año</th><th>Estrategia</th><th>IBEX + div.</th><th>Diferencia</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

function openPositions(s) {
  if (!s.openPositions.length) return '<p class="bt-muted bt-pad">Ahora mismo la estrategia estaría en liquidez.</p>';
  return `<div class="bt-table"><table><thead><tr><th>Valor</th><th>Desde</th><th>Precio entrada</th><th>Resultado</th></tr></thead><tbody>${s.openPositions.map(t => `<tr><td><b>${esc(t.ticker)}</b><small>${esc(t.name)}</small></td><td>${fecha(t.in)}</td><td>${num(t.pin, 2)} €</td><td class="${cls(t.ret)}">${pct(t.ret)}</td></tr>`).join('')}</tbody></table></div>
    <p class="bt-note bt-pad">Es lo que tendría la estrategia según el último cierre. No es una recomendación de compra.</p>`;
}

function renderTrades(s) {
  const box = app.querySelector('#bt-trades');
  const q = tradeFilter.trim().toLowerCase();
  const list = s.trades.slice().reverse().filter(t => !q || `${t.ticker} ${t.name} ${t.sector}`.toLowerCase().includes(q));
  box.innerHTML = `<div class="bt-table"><table><thead><tr><th>Valor</th><th>Entrada</th><th>Salida</th><th>Días</th><th>Motivo de salida</th><th>Resultado</th></tr></thead><tbody>${list.slice(0, tradeLimit).map(t => `<tr><td><b>${esc(t.ticker)}</b><small>${esc(t.name)}</small></td><td>${fecha(t.in)}<small>${num(t.pin, 2)} €</small></td><td>${t.out ? fecha(t.out) : '—'}<small>${num(t.pout, 2)} €</small></td><td>${t.days}</td><td>${esc(REASONS[t.reason] || t.reason)}</td><td class="${cls(t.ret)}"><b>${pct(t.ret)}</b></td></tr>`).join('')}</tbody></table></div>
    ${list.length > tradeLimit ? `<button type="button" class="bt-more" id="bt-more">Ver ${Math.min(50, list.length - tradeLimit)} más (${list.length - tradeLimit} restantes)</button>` : ''}
    <p class="bt-note bt-pad">Precios de mercado ajustados por splits. El resultado incluye dividendos, comisiones, ITF y deslizamiento.</p>`;
  box.querySelector('#bt-more')?.addEventListener('click', () => { tradeLimit += 50; renderTrades(s); });
}

function grid(s) {
  return `<section class="bt-card"><header><div><small>CÓMO SE ELIGIERON LOS PARÁMETROS</small><h3>Solo con datos de entrenamiento</h3></div></header>
    <p class="bt-pad bt-muted">Se probaron estas combinaciones solo hasta ${fecha(s.trainEnd)} y se eligió la de mayor Sharpe. La validación se calcula después y se enseña para ver la dispersión, no para elegir.</p>
    <div class="bt-table"><table><thead><tr><th>Ventana</th><th>Posiciones</th><th>Sharpe entren.</th><th>CAGR entren.</th><th>CAGR validación</th></tr></thead><tbody>${s.grid.map(g => `<tr class="${g.elegida ? 'chosen' : ''}"><td>${esc(MOMENTUM_LOOKBACKS[g.momentum] || g.momentum)}${g.elegida ? ' <i>ELEGIDA</i>' : ''}</td><td>${g.n}</td><td>${num(g['Sharpe entrenamiento'])}</td><td class="${cls(g['CAGR entrenamiento'])}">${pct(g['CAGR entrenamiento'])}</td><td class="${cls(g['CAGR validacion'])}">${pct(g['CAGR validacion'])}</td></tr>`).join('')}</tbody></table></div></section>`;
}

function limitations() {
  const d = state.result.data;
  return `<details class="bt-card bt-limits"><summary><small>ANTES DE FIARTE</small><h3>Qué puede estar inflando o desinflando estos números</h3></summary><ul>
    <li><b>Sin mirar al futuro.</b> Señales con el cierre del viernes y ejecución en la apertura del lunes. Cada cuenta anual solo se usa desde su fecha real de publicación (o 90 días después del cierre si no se conoce).</li>
    <li><b>Supervivencia.</b> Yahoo solo tiene empresas que siguen cotizando: de los ${d.tickers} valores, solo ${d.since2008} cotizaban en 2008. Faltan quiebras como Popular, Abengoa o Bankia. Los años antiguos salen mejor de lo que fueron.</li>
    <li><b>Pocos fundamentales.</b> Yahoo da solo ${d.fundamentalYears} ejercicios de cuentas, así que la estrategia de valor solo puede probarse desde abril de 2023: todo mercado alcista.</li>
    <li><b>Costes incluidos.</b> Comisión 0,05 % (mínimo 3 €), ITF del 0,2 % en compras de empresas de más de 1.000 M€, y deslizamiento de 0,05-0,40 % según la liquidez. No incluye impuestos.</li>
    <li><b>Sobreajuste.</b> Cada vez que cambias parámetros mirando el periodo de validación, ese periodo deja de ser «fuera de muestra». La prueba de verdad es la cuenta paper.</li>
  </ul></details>`;
}

function field(strategyKey, name, limit, current) {
  const id = `bt-${strategyKey}-${name}`;
  const value = current ?? limit.default;
  if (limit.type === 'enum') {
    const labels = name === 'momentum' ? MOMENTUM_LOOKBACKS : {auto: 'Automática (la mejor en entrenamiento)', manual: 'Manual (los valores de abajo)'};
    return `<label for="${id}"><span>${esc(limit.label)}</span><select id="${id}" data-param="${strategyKey}.${name}">${limit.values.map(v => `<option value="${v}"${v === value ? ' selected' : ''}>${esc(labels[v] || v)}</option>`).join('')}</select></label>`;
  }
  return `<label for="${id}"><span>${esc(limit.label)}</span><input id="${id}" type="number" inputmode="decimal" data-param="${strategyKey}.${name}" min="${limit.min}" max="${limit.max}" step="${limit.step || 1}" value="${value}"></label>`;
}

function runPanel() {
  const used = state.result?.params || {};
  const current = k => ({...(used[k] || {}), ...(k === 'momentum' && used.momentum_modo ? {modo: used.momentum_modo} : {})});
  const can = state.canRun;
  return `<section class="bt-card bt-run" id="bt-run"><header><div><small>EJECUTAR</small><h3>Relanzar el backtest</h3></div></header>
    <p class="bt-pad bt-muted">Se ejecuta en GitHub Actions con el mismo código Python del motor: actualiza los precios, recalcula las dos estrategias y sustituye este informe. Lo recoge en menos de 10 minutos y tarda unos 5-15 más. Cada sábado se recalcula solo con los valores por defecto.</p>
    <form id="bt-form" class="bt-form">
      <fieldset><legend>Valor + calidad + tendencia</legend>${Object.entries(PARAM_LIMITS.vct).map(([n, l]) => field('vct', n, l, current('vct')[n])).join('')}</fieldset>
      <fieldset><legend>Tendencia + momentum</legend>${Object.entries(PARAM_LIMITS.momentum).map(([n, l]) => field('momentum', n, l, current('momentum')[n])).join('')}</fieldset>
      <p class="bt-warning">Cuidado con ajustar parámetros hasta que el resultado guste: es la forma más rápida de engañarse. Decide con el periodo de entrenamiento y mira la validación una sola vez.</p>
      <div class="bt-actions"><button type="submit" class="bt-primary" ${can ? '' : 'disabled'}>Ejecutar backtest</button><button type="button" class="bt-ghost" id="bt-defaults">Valores por defecto</button><button type="button" class="bt-ghost" id="bt-cancel" hidden>Cancelar petición</button></div>
      <p class="bt-run-status" id="bt-run-status" role="status" aria-live="polite"></p>
    </form></section>`;
}

function renderRunStatus() {
  const box = app.querySelector('#bt-run-status'), submit = app.querySelector('#bt-form [type=submit]'), cancel = app.querySelector('#bt-cancel');
  if (!box) return;
  const r = state.request;
  let text = '', tone = '';
  if (state.active && r?.status === 'queued') { text = `En cola desde ${fechaHora(r.requestedAt)}. GitHub Actions la recogerá en menos de 10 minutos.`; tone = 'wait'; }
  else if (state.active && r?.status === 'running') { text = `Ejecutándose desde ${fechaHora(r.startedAt)}. Esta página se actualizará sola al terminar.`; tone = 'wait'; }
  else if (r?.status === 'failed') { text = `La última ejecución falló (${fechaHora(r.finishedAt)}): ${r.error || 'error desconocido'}. Puedes volver a lanzarla.`; tone = 'error'; }
  else if (r?.status === 'done') { text = `Última ejecución manual terminada ${fechaHora(r.finishedAt)}.`; tone = 'ok'; }
  else if (r?.status === 'cancelled') { text = 'Petición cancelada.'; }
  box.textContent = text; box.className = 'bt-run-status ' + tone;
  if (submit) submit.disabled = !state.canRun || state.active;
  if (cancel) cancel.hidden = !(state.active && r?.status === 'queued');
}

function bindRun() {
  const form = app.querySelector('#bt-form');
  if (!form) return;
  renderRunStatus();
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const params = {vct: {}, momentum: {}};
    form.querySelectorAll('[data-param]').forEach(input => {
      const [k, n] = input.dataset.param.split('.'), limit = PARAM_LIMITS[k][n];
      params[k][n] = limit.type === 'enum' ? input.value : Number(input.value);
    });
    const box = app.querySelector('#bt-run-status');
    box.textContent = 'Enviando…'; box.className = 'bt-run-status wait';
    try {
      const data = await api('POST', {action: 'run', params});
      state.request = data.request; state.active = ['queued', 'running'].includes(data.request?.status);
      renderRunStatus(); schedulePoll();
    } catch (error) {
      box.textContent = error.message === 'invalid_params' ? 'Algún valor está fuera de los límites permitidos.' : 'No se pudo encolar la ejecución.';
      box.className = 'bt-run-status error';
    }
  });
  app.querySelector('#bt-defaults')?.addEventListener('click', () => {
    form.querySelectorAll('[data-param]').forEach(input => { const [k, n] = input.dataset.param.split('.'); input.value = PARAM_LIMITS[k][n].default; });
  });
  app.querySelector('#bt-cancel')?.addEventListener('click', async () => {
    try { const data = await api('POST', {action: 'cancel'}); state.request = data.request; state.active = false; renderRunStatus(); } catch { /* el estado se refresca solo */ }
  });
}

// ---------------------------------------------------------------- gráfico (SVG propio, sin librerías)
function drawChart(s) {
  const box = app.querySelector('#bt-chart');
  const c = s.curve, n = c.dates.length;
  const narrow = box.clientWidth < 600;   // en móvil, lienzo más alto para que se lea
  const W = narrow ? 600 : 1000, H = narrow ? 560 : 420, L = narrow ? 70 : 58, R = 16, T = 14, B = 34, DD = narrow ? 130 : 90, gap = 26;
  const mainH = H - T - B - DD - gap;
  const keys = ['ew', 'ibex', 'strategy'];
  const all = keys.flatMap(k => c[k]).filter(v => v > 0);
  const lo = Math.log(Math.min(...all)), hi = Math.log(Math.max(...all));
  const x = i => L + (i / (n - 1)) * (W - L - R);
  const y = v => T + (1 - (Math.log(v) - lo) / (hi - lo || 1)) * mainH;
  const dds = Object.fromEntries(keys.map(k => { let peak = -Infinity; return [k, c[k].map(v => { peak = Math.max(peak, v); return v / peak - 1; })]; }));
  const ddMin = Math.min(-0.05, ...keys.flatMap(k => dds[k]));
  const ddTop = T + mainH + gap, yd = v => ddTop + (v / ddMin) * DD;
  const path = (arr, fy) => arr.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${fy(v).toFixed(1)}`).join('');
  const trainIdx = c.dates.findIndex(d => d > s.trainEnd);
  const ticks = [0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4, 6, 8, 12, 16].filter(t => Math.log(t) >= lo - 0.01 && Math.log(t) <= hi + 0.01);
  const years = []; let last = '';
  c.dates.forEach((d, i) => { const yv = d.slice(0, 4); if (yv !== last) { last = yv; years.push([i, yv]); } });
  const step = Math.ceil(years.length / 10);
  box.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Evolución del capital de la estrategia frente al IBEX 35 con dividendos y la cartera equiponderada">
    ${trainIdx > 0 ? `<rect class="train" x="${L}" y="${T}" width="${x(trainIdx) - L}" height="${H - T - B}"/><text class="zone" x="${L + 6}" y="${T + 14}">ENTRENAMIENTO</text><text class="zone" x="${x(trainIdx) + 6}" y="${T + 14}">VALIDACIÓN</text>` : ''}
    ${ticks.map(t => `<line class="grid" x1="${L}" x2="${W - R}" y1="${y(t)}" y2="${y(t)}"/><text class="axis" x="${L - 8}" y="${y(t) + 4}" text-anchor="end">${num(t, t % 1 ? 2 : 0)}×</text>`).join('')}
    ${years.filter((_, i) => i % step === 0).map(([i, yv]) => `<text class="axis" x="${x(i)}" y="${H - 10}" text-anchor="middle">${yv}</text>`).join('')}
    <line class="grid zero" x1="${L}" x2="${W - R}" y1="${yd(0)}" y2="${yd(0)}"/><text class="axis" x="${L - 8}" y="${yd(0) + 4}" text-anchor="end">0 %</text><text class="axis" x="${L - 8}" y="${yd(ddMin) + 4}" text-anchor="end">${pct(ddMin, 0)}</text><text class="zone" x="${L + 6}" y="${ddTop - 8}">CAÍDA DESDE MÁXIMOS</text>
    ${keys.map(k => `<path class="dd ${k}" d="${path(dds[k], yd)}"/>`).join('')}
    ${keys.map(k => `<path class="line ${k}" d="${path(c[k], y)}"/>`).join('')}
    <line class="cursor" id="bt-cursor" x1="0" x2="0" y1="${T}" y2="${H - B}" visibility="hidden"/>
    <rect class="hit" x="${L}" y="${T}" width="${W - L - R}" height="${H - T - B}"/></svg>
    <div class="bt-tip" id="bt-tip" hidden></div>`;
  const svg = box.querySelector('svg'), tip = box.querySelector('#bt-tip'), cursor = box.querySelector('#bt-cursor');
  const show = clientX => {
    const r = svg.getBoundingClientRect(), px = (clientX - r.left) / r.width * W;
    const i = Math.max(0, Math.min(n - 1, Math.round((px - L) / (W - L - R) * (n - 1))));
    cursor.setAttribute('x1', x(i)); cursor.setAttribute('x2', x(i)); cursor.setAttribute('visibility', 'visible');
    tip.hidden = false;
    tip.innerHTML = `<b>${fecha(c.dates[i])}</b><span class="s">Estrategia ${pct(c.strategy[i] - 1, 0, true)}</span><span class="i">IBEX ${pct(c.ibex[i] - 1, 0, true)}</span><span class="e">Equipond. ${pct(c.ew[i] - 1, 0, true)}</span>`;
    const left = x(i) / W * r.width;
    tip.style.left = `${Math.min(r.width - tip.offsetWidth - 4, Math.max(4, left + 12))}px`;
  };
  svg.addEventListener('pointermove', e => show(e.clientX));
  svg.addEventListener('pointerleave', () => { tip.hidden = true; cursor.setAttribute('visibility', 'hidden'); });
}

function initialise(token) {
  if (!app || csrf) return;
  csrf = token || '';
  const maybeLoad = id => { if (id === 'backtest' && !loaded) load(); };
  addEventListener('homelab:view', e => maybeLoad(e.detail));
  if (document.getElementById('backtest')?.classList.contains('active')) load();
}

window.BacktestLab = {initialise};
if (window.BacktestLabPending) initialise(window.BacktestLabPending);
