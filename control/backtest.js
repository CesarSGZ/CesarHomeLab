// Backtest Lab (Mission Control 08): resultados de las estrategias frente al S&P 500, en simple.
// El cálculo lo hace backtest-lab/ (Python) en GitHub Actions; aquí solo se dibuja lo guardado en D1.
const app = document.getElementById('backtest-app');
let data = null, paper = null, vistaPaper = 'global', sid = null, tramo = 'test', loaded = false, loading = false, verTodas = false, ejemplo = 'ganadora', anioSel = null;

const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const nf = (d = 1) => new Intl.NumberFormat('es-ES', {minimumFractionDigits: d, maximumFractionDigits: d, useGrouping: 'always'});
const pct = (x, d = 1) => x === null || x === undefined ? '–' : nf(d).format(x * 100) + ' %';
const signed = (x, d = 1) => x === null || x === undefined ? '–' : (x > 0 ? '+' : '') + nf(d).format(x * 100);
const num = (x, d = 2) => x === null || x === undefined ? '–' : nf(d).format(x);
const fecha = s => s ? new Intl.DateTimeFormat('es-ES', {day: 'numeric', month: 'short', year: 'numeric'}).format(new Date(s)) : '–';
const anio = s => s ? s.slice(0, 4) : '';
const fechaHora = s => s ? new Intl.DateTimeFormat('es-ES', {day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'}).format(new Date(s)) : '–';
const ZONA_CORTA = {'EE. UU.': 'EE. UU.', 'Europa': 'Europa', 'Asia-Pacífico': 'Asia', 'América': 'América'};
const zona = z => z ? `<i class="bt-zone">${ZONA_CORTA[z] || esc(z)}</i>` : '';

async function load() {
  if (loading) return;
  loading = true;
  try {
    const r = await fetch('/control/api/backtest/status', {credentials: 'same-origin', headers: {accept: 'application/json'}});
    const j = await r.json();
    if (!r.ok) throw new Error(j.error);
    data = j.result; paper = j.paper || null; loaded = true;
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
  if (sid === 'paper' && paper) { renderPaper(); return; }
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
      </button>`).join('')}${pestanaPaper()}</nav>

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
    <p class="bt-mini">${num(k.strategy.tradesPerYear, 0)} compras al año · ${pct(k.strategy.hitRate, 0)} con beneficio · ${s.positions} posiciones${s.examples?.resumen ? ` · <b>${nf(0).format(s.examples.resumen.diasMedios)} días</b> de media en cartera cada acción` : ''} · equiponderada del universo: ${pct(k.universe.cagr)} al año</p>

    <section class="bt-rules">
      <article class="buy"><h3>Compra</h3><ul>${s.rules.compra.map(r => `<li>${esc(r)}</li>`).join('')}</ul></article>
      <article class="sell"><h3>Vende</h3><ul>${s.rules.venta.map(r => `<li>${esc(r)}</li>`).join('')}</ul></article>
    </section>

    ${s.examples?.ganadora ? `<section class="bt-card bt-ex"><header class="bt-exhead"><h3 class="bt-h">Un ejemplo real</h3>
      <div class="bt-pills" role="group" aria-label="Ejemplo">${[['ganadora', 'Una que salió bien'], ['perdedora', 'Una que salió mal']].map(([id, l]) =>
        `<button type="button" aria-pressed="${ejemplo === id}" data-ej="${id}">${l}</button>`).join('')}</div></header>
      <div id="bt-ex"></div></section>` : ''}

    <section class="bt-card"><div class="bt-legend"><span class="s">Estrategia</span><span class="b">S&amp;P 500</span><span class="u">Universo equiponderado</span></div>
      <div class="bt-chart" id="bt-chart"></div></section>

    <section class="bt-card"><h3 class="bt-h">Cada año frente al S&amp;P 500</h3><div class="bt-years">${years(s)}</div></section>

    ${s.examples?.resumen ? `<section class="bt-card"><header class="bt-exhead"><h3 class="bt-h">Un año de operaciones</h3><div class="bt-pills" id="bt-anios"></div></header><div id="bt-gantt"></div></section>` : ''}

    ${s.examples?.repetida ? `<section class="bt-card"><h3 class="bt-h">Una empresa a lo largo de los años · ${esc(s.examples.repetida.nombre)}</h3><div id="bt-rep"></div></section>` : ''}

    ${s.examples?.resumen ? resumen(s) : ''}

    <section class="bt-card"><h3 class="bt-h">En cartera ahora</h3>${holdings(s)}</section>

    <details class="bt-card bt-more"><summary>Cómo se eligió</summary>${search(s)}</details>
    <details class="bt-card bt-more"><summary>Operaciones (${nf(0).format(s.tradesTotal)})</summary><div id="bt-trades"></div></details>
    <p class="bt-foot">Se recalcula solo cada sábado. Para cambiar una estrategia, pídeselo a Claude en el chat.</p>`;

  app.querySelectorAll('[data-s]').forEach(b => b.onclick = () => { sid = b.dataset.s; verTodas = false; render(); });
  app.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { tramo = b.dataset.t; render(); });
  app.querySelector('.bt-more:last-of-type').addEventListener('toggle', e => { if (e.target.open) trades(s); }, {once: true});
  chart(s);
  if (s.examples?.ganadora) {
    app.querySelectorAll('[data-ej]').forEach(b => b.onclick = () => {
      ejemplo = b.dataset.ej;
      app.querySelectorAll('[data-ej]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      ejemploReal(s);
    });
    ejemploReal(s);
  }
  if (s.examples?.resumen) gantt(s);
  if (s.examples?.repetida) repetida(s);
}

const dinero = (x, m) => x === null || x === undefined ? '–' : `${nf(x < 10 ? 2 : x < 1000 ? 1 : 0).format(x)} ${m}`;

// Gráfico de precio con los tramos en cartera (verde/rojo) y marcas de compra ▲ y venta ▼.
function precioSvg(serie, tramos, opts = {}) {
  const n = serie.dates.length, narrow = (opts.ancho || 800) < 600;
  const W = narrow ? 600 : 1000, H = narrow ? 340 : 300, L = narrow ? 70 : 60, R = 14, T = 16, B = 28;
  const vals = serie.close.filter(v => v !== null), lo = Math.min(...vals), hi = Math.max(...vals);
  const x = i => L + i / Math.max(1, n - 1) * (W - L - R);
  const y = v => T + (1 - (v - lo) / (hi - lo || 1)) * (H - T - B);
  const idx = d => { const i = serie.dates.findIndex(z => z >= d); return i < 0 ? n - 1 : i; };
  const linea = serie.close.map((v, i) => v === null ? '' : `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('');
  const marcas = []; let last = '';
  serie.dates.forEach((d, i) => { const k = n > 400 ? d.slice(0, 4) : d.slice(0, 7); if (k !== last) { last = k; marcas.push([i, k]); } });
  const step = Math.ceil(marcas.length / (narrow ? 4 : 7));
  const etiqueta = k => k.length > 4 ? `${k.slice(5)}/${k.slice(2, 4)}` : k;
  const ticks = [lo, (lo + hi) / 2, hi];
  return `<svg viewBox="0 0 ${W} ${H}" class="bt-px" role="img" aria-label="Precio con compras y ventas">
    ${ticks.map(t => `<line class="grid" x1="${L}" x2="${W - R}" y1="${y(t)}" y2="${y(t)}"/><text class="axis" x="${L - 6}" y="${y(t) + 4}" text-anchor="end">${nf(t < 10 ? 2 : 0).format(t)}</text>`).join('')}
    ${marcas.filter((_, i) => i % step === 0).map(([i, k]) => `<text class="axis" x="${x(i)}" y="${H - 6}" text-anchor="middle">${etiqueta(k)}</text>`).join('')}
    ${tramos.map(t => { const a = idx(t.in), b = t.out ? idx(t.out) : n - 1; return `<rect class="hold ${(t.ret ?? 0) >= 0 ? 'up' : 'down'}" x="${x(a)}" y="${T}" width="${Math.max(2, x(b) - x(a))}" height="${H - T - B}"/>`; }).join('')}
    <path class="pxl" d="${linea}"/>
    ${tramos.map(t => {
      const a = idx(t.in), b = t.out ? idx(t.out) : null;
      const compra = `<path class="mk buy" d="M${x(a)},${y(serie.close[a]) + 8} l-7,13 h14 z"/>`;
      const venta = b !== null ? `<path class="mk sell" d="M${x(b)},${y(serie.close[b]) - 8} l-7,-13 h14 z"/>` : '';
      return compra + venta;
    }).join('')}
  </svg>`;
}

function ejemploReal(s) {
  const e = s.examples[ejemplo], box = app.querySelector('#bt-ex');
  if (!e) { box.innerHTML = ''; return; }
  const d = e.compra.datos || {}, m = e.moneda;
  const tiene = v => v !== null && v !== undefined;
  const vs = r => !tiene(r) ? '' : ` <small>(${r < 1 ? Math.round((1 - r) * 100) + ' % más barata' : Math.round((r - 1) * 100) + ' % más cara'} que su sector)</small>`;
  const vio = [
    tiene(d.per) ? `PER <b>${num(d.per, 1)}</b>${vs(d.per_rel)}` : '',
    tiene(d.pb) ? `P/VC <b>${num(d.pb, 2)}</b>${vs(d.pb_rel)}` : '',
    tiene(d.ev_ebitda) ? `EV/EBITDA <b>${num(d.ev_ebitda, 1)}</b>${vs(d.ev_ebitda_rel)}` : '',
    tiene(d.roe) ? `ROE <b>${pct(d.roe, 0)}</b>` : '',
    tiene(d.mom6m) ? `Subió <b>${signed(d.mom6m, 0)} %</b> en 6 meses` : '',
    tiene(d.sobreMedia200) ? `<b>${signed(d.sobreMedia200, 0)} %</b> sobre su media de 200` : '',
    d.puesto ? `Puesto <b>${d.puesto}</b> de ${nf(0).format(d.candidatas)} candidatas` : '',
  ].filter(Boolean);
  box.innerHTML = `<div class="bt-exgrid">
    <div><p class="bt-exname">${zona(e.zona)}<b>${esc(e.nombre)}</b> <span>${esc(e.ticker)}</span></p>
      <div class="bt-chart">${precioSvg(e.serie, [{in: e.compra.fecha, out: e.venta.abierta ? null : e.venta.fecha, ret: e.ganancia}], {ancho: box.clientWidth})}</div></div>
    <ol class="bt-steps">
      <li><i>1</i><div><small>El viernes antes · lo que vio</small><ul>${vio.map(v => `<li>${v}</li>`).join('')}</ul></div></li>
      <li class="b"><i>▲</i><div><small>${fecha(e.compra.fecha)} · compra</small><b>${dinero(e.compra.precio, m)}</b></div></li>
      <li class="v"><i>▼</i><div><small>${fecha(e.venta.fecha)} · venta</small><b>${dinero(e.venta.precio, m)}</b><span>${esc(e.venta.motivo)}</span></div></li>
    </ol></div>
    <div class="bt-res">
      <div class="${(e.ganancia ?? 0) >= 0 ? 'up' : 'down'}"><small>Ganamos</small><b>${signed(e.ganancia)} %</b><span>con costes, en ${e.dias} días</span></div>
      <div><small>La acción hizo</small><b>${signed(e.subidaAccion)} %</b><span>de la compra a la venta</span></div>
      <div><small>El S&amp;P 500 hizo</small><b>${signed(e.subidaSP500)} %</b><span>en esos mismos días</span></div>
    </div>`;
}

function gantt(s) {
  const lista = s.trades.filter(t => t.in);
  const anios = [...new Set(lista.map(t => t.in.slice(0, 4)))].sort();
  if (!anioSel || !anios.includes(anioSel)) anioSel = anios.length > 1 ? anios[anios.length - 2] : anios[0];
  const sel = app.querySelector('#bt-anios');
  sel.innerHTML = anios.slice(-6).map(a => `<button type="button" aria-pressed="${a === anioSel}" data-a="${a}">${a}</button>`).join('');
  sel.querySelectorAll('[data-a]').forEach(b => b.onclick = () => { anioSel = b.dataset.a; gantt(s); });
  const ini = new Date(`${anioSel}-01-01`), fin = new Date(`${Number(anioSel) + 1}-01-01`), span = fin - ini;
  const ops = lista.filter(t => new Date(t.in) < fin && (!t.out || new Date(t.out) >= ini)).sort((a, b) => a.in.localeCompare(b.in));
  const pos = d => Math.max(0, Math.min(100, (new Date(d) - ini) / span * 100));
  const ganadas = ops.filter(t => (t.ret ?? 0) > 0).length;
  const filas = ops.map(t => {
    const a = pos(t.in), b = t.out ? pos(t.out) : 100, r = t.ret ?? 0;
    return `<div class="row" title="${esc(t.name)} · ${fecha(t.in)} → ${t.out ? fecha(t.out) : 'abierta'} · ${signed(r)} %"><span>${esc(t.ticker)}</span>
      <div><i class="${r >= 0 ? 'up' : 'down'}" style="left:${a}%;width:${Math.max(0.8, b - a)}%;opacity:${Math.min(1, 0.35 + Math.abs(r) * 2)}"></i></div>
      <b class="${r >= 0 ? 'up' : 'down'}">${signed(r, 0)}</b></div>`;
  }).join('');
  app.querySelector('#bt-gantt').innerHTML = `<p class="bt-mini">${ops.length} operaciones · ${ganadas} ganaron, ${ops.length - ganadas} perdieron · cada barra es el tiempo en cartera</p>
    <div class="bt-months"><span></span>${['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'].map(x => `<span>${x}</span>`).join('')}<span></span></div>
    <div class="bt-gantt">${filas}</div>`;
}

function repetida(s) {
  const e = s.examples.repetida, box = app.querySelector('#bt-rep');
  box.innerHTML = `<div class="bt-chart">${precioSvg(e.serie, e.operaciones, {ancho: box.clientWidth})}</div>
    <div class="bt-res">
      <div><small>Veces que se compró</small><b>${e.operaciones.length}</b><span>▲ compra · ▼ venta</span></div>
      <div class="${(e.gananciaEstrategia ?? 0) >= 0 ? 'up' : 'down'}"><small>La estrategia ganó con ella</small><b>${signed(e.gananciaEstrategia, 0)} %</b><span>sumando todas sus operaciones</span></div>
      <div><small>Comprar y no tocarla</small><b>${signed(e.subidaAccion, 0)} %</b><span>en todo el periodo del gráfico</span></div>
    </div>`;
}

function resumen(s) {
  const r = s.examples.resumen, tot = Object.values(r.zonas).reduce((a, b) => a + b, 0);
  const anios = (new Date(data.dataUntil) - new Date(s.start)) / 3.15576e10;
  const orden = ['EE. UU.', 'Europa', 'Asia-Pacífico', 'América'];
  return `<section class="bt-card"><h3 class="bt-h">¿Con qué opera?</h3>
    <div class="bt-res">
      <div><small>Operaciones</small><b>${nf(0).format(r.operaciones / anios)}</b><span>al año, unas ${nf(1).format(r.operaciones / anios / 52)} por semana</span></div>
      <div><small>Salen bien</small><b>${pct(r.ganadoras, 0)}</b><span>las buenas ganan ${signed(r.mediaGanadora, 0)} % · las malas ${signed(r.mediaPerdedora, 0)} %</span></div>
      <div><small>En cartera</small><b>${nf(0).format(r.diasMedios)} días</b><span>de media cada operación</span></div>
    </div>
    <div class="bt-zonas">${Object.entries(r.zonas).map(([z, n]) => `<i style="flex:${n}" class="z${orden.indexOf(z)}" title="${esc(z)}: ${n}"><span>${esc(ZONA_CORTA[z] || z)} ${Math.round(n / tot * 100)} %</span></i>`).join('')}</div>
    <p class="bt-mini">Las más repetidas</p><div class="bt-chips">${r.masUsadas.map(x => `<span title="${esc(x.nombre)}"><b>${esc(x.ticker)}</b> ×${x.n} <em class="${(x.total ?? 0) >= 0 ? 'up' : 'down'}">${signed(x.total, 0)} %</em></span>`).join('')}</div>
  </section>`;
}

function pestanaPaper() {
  if (!paper) return '';
  const r = paper.ultima.valor / paper.historial[0].valor - 1;
  return `<button type="button" role="tab" aria-selected="${sid === 'paper'}" data-s="paper">
    <small>IBKR · dinero ficticio</small><b>Cartera paper</b><i class="dot ${r >= 0 ? 'gana' : 'pierde'}"></i></button>`;
}

function cabecera() {
  const u = data.universe;
  return `<header class="bt-hero"><p class="eyebrow"><span></span> BACKTEST LAB</p>
      <h2>¿Ganamos al <em>S&amp;P 500</em>?</h2>
      <p class="bt-sub">${nf(0).format(u.stocks)} acciones · ${u.markets} bolsas · todo en euros, con costes reales · datos hasta ${fecha(data.dataUntil)}</p></header>
    <nav class="bt-switch" role="tablist" aria-label="Estrategia">${data.strategies.map(x => `
      <button type="button" role="tab" aria-selected="${x.id === sid}" data-s="${esc(x.id)}">
        <small>${esc(x.kind)}</small><b>${esc(x.name)}</b><i class="dot ${esc(x.verdict.level)}"></i>
      </button>`).join('')}${pestanaPaper()}</nav>`;
}

function renderPaper() {
  const u = paper.ultima, h = paper.historial, ini = h[0];
  const ests = u.estrategias || {};
  if (vistaPaper !== 'global' && !ests[vistaPaper]) vistaPaper = 'global';
  const e = vistaPaper === 'global' ? null : ests[vistaPaper];
  const inicial = e ? e.asignado : (u.capitalInicial || ini.valor);
  const actual = e ? e.valor : u.valor;
  const rent = actual / inicial - 1;
  const rentSp = u.sp500eur && ini.sp500eur ? u.sp500eur / ini.sp500eur - 1 : null;
  const invertido = e ? e.invertido / e.valor : (u.efectivo !== null ? (u.valor - u.efectivo) / u.valor : null);
  const pos = (u.posiciones || []).filter(x => !e || x.estrategia === vistaPaper).sort((a, b) => (b.gananciaPct ?? 0) - (a.gananciaPct ?? 0));
  const ganan = pos.filter(x => (x.gananciaPct ?? 0) > 0).length;
  const ops = (paper.ejecuciones || []).filter(x => !e || x.estrategia === vistaPaper).slice(0, 30);
  const cerradas = (u.cerradas || []).filter(x => !e || x.estrategia === vistaPaper).slice().reverse();
  const conDias = pos.filter(x => x.dias !== null && x.dias !== undefined);
  const mediaDias = conDias.length ? conDias.reduce((a, x) => a + x.dias, 0) / conDias.length : null;
  const mediaCerr = cerradas.length ? cerradas.reduce((a, x) => a + (x.dias || 0), 0) / cerradas.length : null;
  const selector = Object.keys(ests).length ? `<div class="bt-pills bt-paper-sel" role="group" aria-label="Qué cartera ver">${[['global', 'Global'], ...Object.entries(ests).map(([k, x]) => [k, x.nombre])].map(([k, l]) =>
    `<button type="button" aria-pressed="${vistaPaper === k}" data-vp="${esc(k)}">${esc(l)}</button>`).join('')}</div>` : '';
  app.innerHTML = `${cabecera()}${selector}
    <section class="bt-verdict ${rentSp === null ? '' : rent >= rentSp ? 'gana' : 'pierde'}"><b>${signed(rent, 2)} % desde ${fecha(ini.fecha)}</b>
      <span>${rentSp === null ? '' : `El S&P 500 (en euros) ha hecho ${signed(rentSp, 2)} % en el mismo tiempo. `}Cuenta ${esc(u.cuenta)} · última foto ${fechaHora(u.fecha)}${u.ordenesPendientes ? ` · ${u.ordenesPendientes} órdenes pendientes` : ''}</span></section>
    <section class="bt-res bt-paper-kpis">
      <div><small>${e ? 'Valor de la estrategia' : 'Valor de la cuenta'}</small><b>${eur0(actual)}</b><span>empezó con ${eur0(inicial)}</span></div>
      <div class="${rent >= 0 ? 'up' : 'down'}"><small>Ganancia</small><b>${eur0(actual - inicial)}</b><span>${signed(rent, 2)} %${e && e.realizada ? ` · ${eur0(e.realizada)} ya cerrados` : ''}</span></div>
      <div><small>Invertido</small><b>${pct(invertido, 0)}</b><span>${pos.length} posiciones · ${ganan} en positivo</span></div>
    </section>
    <section class="bt-card"><div class="bt-legend"><span class="s">Cartera paper</span><span class="b">S&amp;P 500</span></div>
      <div class="bt-chart" id="bt-paper-chart"></div></section>
    <section class="bt-card"><h3 class="bt-h">Posiciones abiertas${mediaDias !== null ? ` · ${nf(0).format(mediaDias)} días de media en cartera` : ''}</h3>
      <div class="bt-table"><table><thead><tr><th>Valor</th><th>En cartera</th><th>Compra → ahora</th><th>Resultado</th></tr></thead><tbody>${pos.map(x => `
        <tr><td><b>${esc(x.simbolo)}</b><small>${nf(0).format(x.acciones)} acc. · ${esc(x.bolsa)}</small></td><td>${x.dias ?? '–'} días<small>desde ${fecha(x.desde)}</small></td>
        <td>${num(x.precioMedio)} → ${num(x.precio)}</td><td class="${(x.gananciaPct ?? 0) >= 0 ? 'up' : 'down'}"><b>${signed(x.gananciaPct)} %</b><small>${nf(0).format(x.ganancia ?? 0)} ${esc(x.divisa)}</small></td></tr>`).join('')}</tbody></table></div></section>
    ${cerradas.length ? `<section class="bt-card"><h3 class="bt-h">Posiciones cerradas · ${cerradas.length}${mediaCerr !== null ? ` · ${nf(0).format(mediaCerr)} días de media` : ''}</h3>
      <div class="bt-table"><table><thead><tr><th>Valor</th><th>Estuvo en cartera</th><th>Resultado</th></tr></thead><tbody>${cerradas.map(x => `
        <tr><td><b>${esc(x.simbolo)}</b></td><td>${x.dias} días<small>${fecha(x.desde)} → ${fecha(x.hasta)}</small></td>
        <td class="${(x.gananciaEur ?? 0) >= 0 ? 'up' : 'down'}"><b>${eur0(x.gananciaEur)}</b></td></tr>`).join('')}</tbody></table></div></section>` : ''}
    <section class="bt-card"><h3 class="bt-h">Últimas operaciones</h3>
      <div class="bt-table"><table><thead><tr><th>Día</th><th>Operación</th><th>Precio</th></tr></thead><tbody>${ops.map(e => `
        <tr><td>${fecha(e.fecha)}</td><td><span class="${e.lado === 'compra' ? 'up' : 'down'}">${e.lado === 'compra' ? '▲ Compra' : '▼ Venta'}</span> ${nf(0).format(e.acciones)} <b>${esc(e.simbolo)}</b></td><td>${num(e.precio)} ${esc(e.divisa)}</td></tr>`).join('')}</tbody></table></div></section>
    <p class="bt-foot">Dinero ficticio en la cuenta paper de Interactive Brokers. Cada lunes Claude aplica la cartera objetivo de las dos estrategias (50 % cada una).</p>`;
  app.querySelectorAll('[data-s]').forEach(b => b.onclick = () => { sid = b.dataset.s; render(); });
  app.querySelectorAll('[data-vp]').forEach(b => b.onclick = () => { vistaPaper = b.dataset.vp; renderPaper(); });
  graficoPaper(h, e ? vistaPaper : null, inicial);
}

const eur0 = x => x === null || x === undefined ? '–' : new Intl.NumberFormat('es-ES', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0, useGrouping: 'always'}).format(x);

function graficoPaper(h, clave, inicial) {
  const box = app.querySelector('#bt-paper-chart');
  if (h.length < 2) { box.innerHTML = '<p class="bt-note">La gráfica aparecerá en cuanto haya dos fotos de la cuenta (se toman cada día de mercado).</p>'; return; }
  const valorDe = x => clave ? (x.estrategias?.[clave] ?? null) : x.valor;
  const v = h.map(x => valorDe(x) === null ? null : valorDe(x) / inicial), b = h.map(x => x.sp500eur && h[0].sp500eur ? x.sp500eur / h[0].sp500eur : null);
  const all = [...v.filter(x => x !== null), ...b.filter(Boolean), 1], lo = Math.min(...all), hi = Math.max(...all);
  const narrow = box.clientWidth < 600, W = narrow ? 600 : 1000, H = narrow ? 360 : 300, L = 60, R = 12, T = 12, B = 28, n = h.length;
  const x = i => L + i / (n - 1) * (W - L - R), y = val => T + (1 - (val - lo) / (hi - lo || 1)) * (H - T - B);
  const path = arr => arr.map((val, i) => val === null ? '' : `${i && arr[i - 1] !== null ? 'L' : 'M'}${x(i).toFixed(1)},${y(val).toFixed(1)}`).join('');
  const ticks = [lo, 1, hi].filter((t, i, a) => a.indexOf(t) === i);
  box.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Cartera paper frente al S&P 500">
    ${ticks.map(t => `<line class="grid" x1="${L}" x2="${W - R}" y1="${y(t)}" y2="${y(t)}"/><text class="axis" x="${L - 6}" y="${y(t) + 4}" text-anchor="end">${signed(t - 1, 1)}%</text>`).join('')}
    <text class="axis" x="${L}" y="${H - 6}">${fecha(h[0].fecha)}</text><text class="axis" x="${W - R}" y="${H - 6}" text-anchor="end">${fecha(h[n - 1].fecha)}</text>
    <path class="ln sp500" d="${path(b)}"/><path class="ln strategy" d="${path(v)}"/></svg>`;
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
