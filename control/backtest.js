// Backtest Lab (Mission Control 08): resultados de las estrategias frente al S&P 500, en simple.
// El cálculo lo hace backtest-lab/ (Python) en GitHub Actions; aquí solo se dibuja lo guardado en D1.
const app = document.getElementById('backtest-app');
let data = null, sid = null, tramo = 'test', loaded = false, loading = false, verTodas = false;

const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const nf = (d = 1) => new Intl.NumberFormat('es-ES', {minimumFractionDigits: d, maximumFractionDigits: d, useGrouping: 'always'});
const pct = (x, d = 1) => x === null || x === undefined ? '–' : nf(d).format(x * 100) + ' %';
const signed = (x, d = 1) => x === null || x === undefined ? '–' : (x > 0 ? '+' : '') + nf(d).format(x * 100);
const num = (x, d = 2) => x === null || x === undefined ? '–' : nf(d).format(x);
const fecha = s => s ? new Intl.DateTimeFormat('es-ES', {day: 'numeric', month: 'short', year: 'numeric'}).format(new Date(s)) : '–';
const anio = s => s ? s.slice(0, 4) : '';
const ZONA_CORTA = {'EE. UU.': 'EE. UU.', 'Europa': 'Europa', 'Asia-Pacífico': 'Asia', 'América': 'América'};
const zona = z => z ? `<i class="bt-zone">${ZONA_CORTA[z] || esc(z)}</i>` : '';

async function load() {
  if (loading) return;
  loading = true;
  try {
    const r = await fetch('/control/api/backtest/status', {credentials: 'same-origin', headers: {accept: 'application/json'}});
    const j = await r.json();
    if (!r.ok) throw new Error(j.error);
    data = j.result; loaded = true;
    render();
  } catch {
    app.innerHTML = '<div class="bt-empty"><strong>No se pudieron cargar los resultados.</strong><p>Vuelve a intentarlo en un momento.</p></div>';
  } finally { loading = false; }
}

function render() {
  if (!data || data.schema !== 2) {
    app.innerHTML = `<header class="bt-hero"><p class="eyebrow"><span></span> BACKTEST LAB</p><h2>¿Ganamos al <em>S&amp;P 500</em>?</h2></header>
      <div class="bt-empty"><strong>Calculando la primera versión…</strong><p>En cuanto termine el primer backtest aparecerán aquí los resultados.</p></div>`;
    return;
  }
  const s = data.strategies.find(x => x.id === sid) || data.strategies[0];
  sid = s.id;
  const k = s.kpis[tramo];
  const u = data.universe;
  app.innerHTML = `
    <header class="bt-hero">
      <p class="eyebrow"><span></span> BACKTEST LAB</p>
      <h2>¿Ganamos al <em>S&amp;P 500</em>?</h2>
      <p class="bt-sub">${nf(0).format(u.stocks)} acciones · ${u.markets} bolsas · todo en euros, con costes reales · datos hasta ${fecha(data.dataUntil)}</p>
    </header>
    <nav class="bt-switch" role="tablist" aria-label="Estrategia">${data.strategies.map(x => `
      <button type="button" role="tab" aria-selected="${x.id === s.id}" data-s="${esc(x.id)}">
        <small>${esc(x.kind)}</small><b>${esc(x.name)}</b><i class="dot ${esc(x.verdict.level)}"></i>
      </button>`).join('')}</nav>

    <section class="bt-verdict ${esc(s.verdict.level)}"><b>${esc(s.verdict.title)}</b><span>${esc(s.verdict.text)}</span></section>

    <div class="bt-tramo" role="group" aria-label="Periodo">
      <button type="button" aria-pressed="${tramo === 'test'}" data-t="test">Años no vistos · ${anio(s.kpis.test.from)}–hoy</button>
      <button type="button" aria-pressed="${tramo === 'full'}" data-t="full">Todo · ${anio(s.kpis.full.from)}–hoy</button>
    </div>
    <section class="bt-duels">
      ${duel('Rentabilidad al año', k.strategy.cagr, k.sp500.cagr, pct, true)}
      ${duel('Sharpe (rentabilidad / riesgo)', k.strategy.sharpe, k.sp500.sharpe, x => num(x), true)}
      ${duel('Peor caída', k.strategy.maxdd, k.sp500.maxdd, x => pct(x, 0), true)}
    </section>
    <p class="bt-mini">${num(k.strategy.tradesPerYear, 0)} compras al año · ${pct(k.strategy.hitRate, 0)} con beneficio · ${s.positions} posiciones · equiponderada del universo: ${pct(k.universe.cagr)} al año</p>

    <section class="bt-rules">
      <article class="buy"><h3>Compra</h3><ul>${s.rules.compra.map(r => `<li>${esc(r)}</li>`).join('')}</ul></article>
      <article class="sell"><h3>Vende</h3><ul>${s.rules.venta.map(r => `<li>${esc(r)}</li>`).join('')}</ul></article>
    </section>

    <section class="bt-card"><div class="bt-legend"><span class="s">Estrategia</span><span class="b">S&amp;P 500</span><span class="u">Universo equiponderado</span></div>
      <div class="bt-chart" id="bt-chart"></div></section>

    <section class="bt-card"><h3 class="bt-h">Cada año frente al S&amp;P 500</h3><div class="bt-years">${years(s)}</div></section>

    <section class="bt-card"><h3 class="bt-h">En cartera ahora</h3>${holdings(s)}</section>

    <details class="bt-card bt-more"><summary>Cómo se eligió</summary>${search(s)}</details>
    <details class="bt-card bt-more"><summary>Operaciones (${nf(0).format(s.tradesTotal)})</summary><div id="bt-trades"></div></details>
    <p class="bt-foot">Se recalcula solo cada sábado. Para cambiar una estrategia, pídeselo a Claude en el chat.</p>`;

  app.querySelectorAll('[data-s]').forEach(b => b.onclick = () => { sid = b.dataset.s; verTodas = false; render(); });
  app.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { tramo = b.dataset.t; render(); });
  app.querySelector('.bt-more:last-of-type').addEventListener('toggle', e => { if (e.target.open) trades(s); }, {once: true});
  chart(s);
}

function duel(label, a, b, fmt, higherBetter) {
  const win = a !== null && b !== null && (higherBetter ? a > b : a < b);
  const vals = [Math.abs(a ?? 0), Math.abs(b ?? 0)], max = Math.max(...vals, 1e-9);
  return `<article class="bt-duel ${win ? 'win' : 'lose'}"><small>${label}</small>
    <div class="row s"><span>Estrategia</span><i style="--w:${(vals[0] / max * 100).toFixed(1)}%"></i><b>${fmt(a)}</b></div>
    <div class="row b"><span>S&amp;P 500</span><i style="--w:${(vals[1] / max * 100).toFixed(1)}%"></i><b>${fmt(b)}</b></div></article>`;
}

function years(s) {
  const rows = s.annual.filter(a => a.strategy !== null && a.sp500 !== null);
  const max = Math.max(...rows.map(a => Math.abs(a.strategy - a.sp500)), 0.05);
  return rows.map(a => {
    const d = a.strategy - a.sp500, w = Math.abs(d) / max * 50;
    const val = String(a.year) > s.trainEnd.slice(0, 4);
    return `<div class="yr${val ? ' val' : ''}" title="Estrategia ${pct(a.strategy)} · S&P 500 ${pct(a.sp500)}"><span>${a.year}</span>
      <div class="bar"><i class="${d >= 0 ? 'up' : 'down'}" style="width:${w.toFixed(1)}%"></i></div><b class="${d >= 0 ? 'up' : 'down'}">${signed(d)}</b></div>`;
  }).join('') + '<p class="bt-note">Puntos de diferencia con el S&amp;P 500. Más intenso: años no vistos al diseñar la estrategia.</p>';
}

function holdings(s) {
  if (!s.holdings.length) return '<p class="bt-note">Ahora mismo estaría en liquidez.</p>';
  const lista = s.holdings.slice().sort((a, b) => (b.ret ?? 0) - (a.ret ?? 0));
  return `<div class="bt-chips">${lista.map(h => `<span title="${esc(h.name)} · desde ${fecha(h.in)}">${zona(h.zone)}<b>${esc(h.ticker)}</b> <em class="${(h.ret ?? 0) >= 0 ? 'up' : 'down'}">${signed(h.ret, 0)} %</em></span>`).join('')}</div>
    <p class="bt-note">Lo que tendría la estrategia con el último cierre. No es una recomendación.</p>`;
}

function search(s) {
  const b = s.search || {};
  const sig = s.kpis.test.t;
  return `<ul class="bt-facts">
    <li><b>${b.variantes ?? '–'}</b> variantes probadas solo con ${anio(s.kpis.full.from)}–${anio(s.trainEnd)}</li>
    <li>Elegida antes de mirar ${Number(anio(s.trainEnd)) + 1}–hoy${b.miradasValidacion > 1 ? ` (periodo mirado ${b.miradasValidacion} veces en total: cada mirada le resta valor)` : ', que se evaluó una sola vez'}</li>
    <li>Significación en años no vistos: <b>t = ${num(sig)}</b> <small>(≥ 2 para fiarse)</small></li>
    <li>Probabilidad de que no sea suerte, corrigiendo por las variantes probadas: <b>${b.sharpeDeflactado === undefined || b.sharpeDeflactado === null ? '–' : pct(b.sharpeDeflactado, 0)}</b></li>
    ${b.nota ? `<li>${esc(b.nota)}</li>` : ''}
  </ul>`;
}

function trades(s) {
  const box = app.querySelector('#bt-trades');
  const list = s.trades.slice().reverse();
  const shown = verTodas ? list : list.slice(0, 40);
  box.innerHTML = `<div class="bt-table"><table><thead><tr><th>Valor</th><th>Entrada</th><th>Salida</th><th>Resultado</th></tr></thead><tbody>${shown.map(t => `
    <tr><td>${zona(t.zone)}<b>${esc(t.ticker)}</b><small>${esc(t.name)}</small></td><td>${fecha(t.in)}</td><td>${t.out ? fecha(t.out) : 'abierta'}</td><td class="${(t.ret ?? 0) >= 0 ? 'up' : 'down'}">${signed(t.ret)} %</td></tr>`).join('')}</tbody></table></div>
    ${!verTodas && list.length > 40 ? `<button type="button" class="bt-ghost" id="bt-all">Ver las últimas ${list.length}</button>` : ''}`;
  box.querySelector('#bt-all')?.addEventListener('click', () => { verTodas = true; trades(s); });
}

function chart(s) {
  const box = app.querySelector('#bt-chart');
  const c = s.curve, n = c.dates.length;
  const narrow = box.clientWidth < 600;
  const W = narrow ? 600 : 1000, H = narrow ? 420 : 380, L = narrow ? 64 : 54, R = 12, T = 12, B = 30;
  const keys = ['universe', 'sp500', 'strategy'];
  const all = keys.flatMap(k => c[k]).filter(v => v > 0);
  const lo = Math.log(Math.min(...all)), hi = Math.log(Math.max(...all));
  const x = i => L + i / (n - 1) * (W - L - R);
  const y = v => T + (1 - (Math.log(v) - lo) / (hi - lo || 1)) * (H - T - B);
  const path = k => c[k].map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('');
  const split = c.dates.findIndex(d => d > s.trainEnd);
  const ticks = [0.5, 1, 2, 3, 5, 8, 12, 20, 30, 50].filter(t => Math.log(t) >= lo - .01 && Math.log(t) <= hi + .01);
  const yrs = []; let last = '';
  c.dates.forEach((d, i) => { if (d.slice(0, 4) !== last) { last = d.slice(0, 4); yrs.push([i, last]); } });
  const step = Math.ceil(yrs.length / (narrow ? 5 : 9));
  box.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Capital de la estrategia frente al S&P 500">
    ${split > 0 ? `<rect class="seen" x="${L}" y="${T}" width="${x(split) - L}" height="${H - T - B}"/><text class="zone" x="${x(split) + 6}" y="${T + 14}">AÑOS NO VISTOS →</text>` : ''}
    ${ticks.map(t => `<line class="grid" x1="${L}" x2="${W - R}" y1="${y(t)}" y2="${y(t)}"/><text class="axis" x="${L - 8}" y="${y(t) + 4}" text-anchor="end">${t}×</text>`).join('')}
    ${yrs.filter((_, i) => i % step === 0).map(([i, yv]) => `<text class="axis" x="${x(i)}" y="${H - 8}" text-anchor="middle">${yv}</text>`).join('')}
    ${keys.map(k => `<path class="ln ${k}" d="${path(k)}"/>`).join('')}
    <line class="cur" x1="0" x2="0" y1="${T}" y2="${H - B}" visibility="hidden"/><rect class="hit" x="${L}" y="${T}" width="${W - L - R}" height="${H - T - B}"/></svg><div class="bt-tip" hidden></div>`;
  const svg = box.querySelector('svg'), tip = box.querySelector('.bt-tip'), cur = box.querySelector('.cur');
  svg.addEventListener('pointermove', e => {
    const r = svg.getBoundingClientRect(), i = Math.max(0, Math.min(n - 1, Math.round(((e.clientX - r.left) / r.width * W - L) / (W - L - R) * (n - 1))));
    cur.setAttribute('x1', x(i)); cur.setAttribute('x2', x(i)); cur.setAttribute('visibility', 'visible');
    tip.hidden = false;
    tip.innerHTML = `<b>${fecha(c.dates[i])}</b><span class="s">Estrategia ×${num(c.strategy[i])}</span><span class="b">S&amp;P 500 ×${num(c.sp500[i])}</span>`;
    tip.style.left = `${Math.min(r.width - tip.offsetWidth - 4, Math.max(4, x(i) / W * r.width + 12))}px`;
  });
  svg.addEventListener('pointerleave', () => { tip.hidden = true; cur.setAttribute('visibility', 'hidden'); });
}

function initialise() {
  if (!app || app.dataset.ready) return;
  app.dataset.ready = '1';
  addEventListener('homelab:view', e => { if (e.detail === 'backtest' && !loaded) load(); });
  if (document.getElementById('backtest')?.classList.contains('active')) load();
}

window.BacktestLab = {initialise};
if (window.BacktestLabPending) initialise();
