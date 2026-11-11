(() => {
  const app = document.getElementById('finance-app');
  if (!app) return;
  const API = '/control/api/finance/status';
  let model, M, R, csrf = '';
  const S = { connected: null, movimientos: [], recurrentes: [], categorias: [], tab: 'resumen', month: null, tipo: 'Gasto', cat: '', repeat: 'no', noTime: false, range: 3, queue: [], error: '', layer: null };
  const read = (k, d) => { try { const v = localStorage.getItem('finance.' + k); return v === null ? d : JSON.parse(v); } catch { return d; } };
  const write = (k, v) => { try { localStorage.setItem('finance.' + k, JSON.stringify(v)); } catch { /* memory only */ } };
  const E = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const today = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
  const nowTime = () => new Date().toTimeString().slice(0, 5);
  const EUR = v => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: Math.abs(v) >= 1000 ? 0 : 2 }).format(v || 0);
  const shortDate = s => `${+s.slice(8, 10)} ${model.MONTHS[+s.slice(5, 7) - 1].slice(0, 3)}`;
  const amountOf = id => { const v = parseFloat(String(document.getElementById(id)?.value || '').replace(/\./g, '').replace(',', '.')); return Number.isFinite(v) && v > 0 ? Math.round(v * 100) / 100 : null; };

  // ---------- Network: writes queue up offline and go out when the Sheet answers ----------
  async function call(method, body) {
    const r = await fetch(API, { method, credentials: 'same-origin', headers: { accept: 'application/json', ...(method === 'POST' ? { 'x-csrf-token': csrf, 'content-type': 'application/json' } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
    if (r.status === 401) { location.replace('/control/login'); throw new Error('session'); }
    const out = await r.json();
    if (!out.ok) throw new Error(out.error || 'unavailable');
    return out;
  }
  async function load() {
    const d = await call('GET');
    S.connected = d.connected;
    if (!d.connected) return;
    S.movimientos = (d.movimientos || []).map(model.normMov).filter(m => m[M.ID]); S.recurrentes = (d.recurrentes || []).map(model.normRec).filter(r => r[R.ID]); S.categorias = (d.categorias || []).filter(c => c[1]).map(c => [c[0] === 'Ingreso' ? 'Ingreso' : 'Gasto', String(c[1]), c[2] === '' ? '' : +c[2] || '']);
    // Pending queued rows stay visible until the Sheet has them.
    for (const op of S.queue) if (op.tipo === 'guardar' && op.tabla === 'Movimientos' && !S.movimientos.some(m => m[M.ID] === op.fila[M.ID])) S.movimientos.push(op.fila);
    write('cache', { movimientos: S.movimientos, recurrentes: S.recurrentes, categorias: S.categorias });
    applyRecurring();
  }
  let flushing = false;
  async function flush() {
    if (flushing || !S.queue.length) return;
    flushing = true;
    // Only what was sent leaves the queue: anything saved while the request was out goes in the next one.
    const sent = S.queue.slice(), more = () => S.queue.length > 0;
    let ok = false;
    try { const ops = sent.filter(o => o.tipo), cats = sent.find(o => o.categorias)?.categorias; await call('POST', { action: 'ops', ops, ...(cats ? { categorias: cats } : {}) }); S.queue = S.queue.filter(o => !sent.includes(o)); write('queue', S.queue); ok = true; }
    catch { /* stays queued */ } finally { flushing = false; paintPending(); }
    if (ok && more()) flush();
  }
  function enqueue(op) { S.queue.push(op); write('queue', S.queue); write('cache', { movimientos: S.movimientos, recurrentes: S.recurrentes, categorias: S.categorias }); flush(); }
  // Recurring charges whose day has come are written once, with an ID that cannot repeat.
  function applyRecurring() {
    for (const fila of model.dueRecurring(S.recurrentes, S.movimientos, today())) { S.movimientos.push(fila); enqueue({ tipo: 'guardar', tabla: 'Movimientos', fila }); }
  }

  // ---------- Paint ----------
  function paint() {
    if (S.connected === false) return paintConnect();
    S.month ||= today().slice(0, 7);
    app.innerHTML = `<header class="tl-head"><div><p class="eyebrow"><span></span> GASTOS</p><h2>${S.tab === 'recurrentes' ? 'Recurrentes' : S.tab === 'stats' ? 'Estadísticas' : cap(model.monthName(S.month))}</h2><p class="tl-hello">${E(hello())}</p></div>
      <div class="tl-head-side"><span class="tl-pending" id="fin-pending" hidden></span><div class="tl-tabs" role="tablist">${[['resumen', 'Resumen'], ['movimientos', 'Movimientos'], ['recurrentes', 'Recurrentes'], ['stats', 'Estadísticas']].map(([id, label]) => `<button type="button" role="tab" data-tab="${id}" aria-selected="${S.tab === id}">${label}</button>`).join('')}</div></div></header>
      ${S.error ? `<p class="tl-error" role="status">${E(S.error)}</p>` : ''}
      <div id="fin-body">${S.tab === 'resumen' ? paintSummary() : S.tab === 'movimientos' ? paintList() : S.tab === 'stats' ? paintStats() : paintRecurring()}</div><div class="fin-layer" id="fin-layer" hidden></div>`;
    paintPending();
    if (S.layer) paintLayer();
  }
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  function hello() {
    const p = model.pace(S.movimientos, S.month, today());
    if (!p) return 'Apunta cada gasto en dos toques: importe, categoría y listo.';
    return p.ratio <= 0.9 ? `Vas un ${Math.round((1 - p.ratio) * 100)} % por debajo de tu ritmo habitual este mes. Bien.` : p.ratio <= 1.1 ? 'Vas a tu ritmo de siempre este mes.' : `Vas un ${Math.round((p.ratio - 1) * 100)} % por encima de tu ritmo habitual este mes.`;
  }
  function paintPending() { const n = document.getElementById('fin-pending'); if (n) { n.hidden = !S.queue.length; n.textContent = S.queue.length === 1 ? '1 cambio por subir' : `${S.queue.length} cambios por subir`; } }
  function paintConnect() {
    app.innerHTML = `<p class="eyebrow"><span></span> GASTOS</p><h2>Conecta tu Sheet de gastos.</h2>
      <p class="tl-note">Crea un Google Sheet, pega el script de <code>finance-backend/Code.gs</code> en Extensiones → Apps Script, ejecuta <code>instalar</code> e impleméntalo como aplicación web. Después pega aquí la URL que acaba en /exec, seguida de # y la clave que te da.</p>
      <div class="tl-connect"><label for="fin-code">Código de conexión</label><textarea id="fin-code" autocomplete="off" spellcheck="false"></textarea>${S.error ? `<p class="tl-error" role="status">${E(S.error)}</p>` : ''}<button type="button" class="tl-primary" data-act="connect">Conectar</button></div>`;
  }
  const catsOf = tipo => S.categorias.filter(c => c[0] === tipo).map(c => c[1]);
  function quickAdd() {
    const cats = catsOf(S.tipo);
    if (!cats.includes(S.cat)) S.cat = cats[0] || '';
    return `<section class="fin-add" aria-label="Apuntar"><div class="tl-kind" role="group" aria-label="Tipo"><button type="button" data-tipo="Gasto" aria-pressed="${S.tipo === 'Gasto'}">Gasto</button><button type="button" data-tipo="Ingreso" aria-pressed="${S.tipo === 'Ingreso'}">Ingreso</button></div>
      <label class="fin-amount"><span>€</span><input id="fin-importe" inputmode="decimal" placeholder="0,00" autocomplete="off" aria-label="Importe"></label>
      <div class="tl-chips" role="group" aria-label="Categoría">${cats.map(c => `<button type="button" data-cat="${E(c)}" aria-pressed="${c === S.cat}">${E(c)}</button>`).join('')}<button type="button" class="more" data-act="new-cat">+ Categoría</button></div>
      <input class="tl-text fin-concept" id="fin-concepto" placeholder="Concepto (opcional)" maxlength="200" autocomplete="off">
      <div class="fin-when"><input class="tl-text" id="fin-fecha" type="date" value="${today()}" aria-label="Fecha"><input class="tl-text" id="fin-hora" type="time" value="${nowTime()}" aria-label="Hora" ${S.noTime ? 'disabled' : ''}><button type="button" class="tl-chip" data-act="no-time" aria-pressed="${S.noTime}">Hora desconocida</button></div>
      <div class="fin-repeat"><span class="tl-field">Se repite</span><div class="tl-chips" role="group" aria-label="Se repite">${[['no', 'No'], ['mensual', 'Cada mes'], ['anual', 'Cada año'], ['semanal', 'Cada semana']].map(([v, l]) => `<button type="button" data-repeat="${v}" aria-pressed="${S.repeat === v}">${l}</button>`).join('')}</div>
        ${S.repeat !== 'no' ? `<p class="tl-note">Se apuntará solo ${repeatText(S.repeat)} a partir de la fecha de arriba. Lo verás y lo podrás pausar en Recurrentes.</p>` : ''}</div>
      <button type="button" class="tl-primary" data-act="add">Apuntar ${S.tipo === 'Gasto' ? 'gasto' : 'ingreso'}${S.repeat !== 'no' ? ' recurrente' : ''}</button></section>`;
  }
  function repeatText(freq) {
    const f = document.getElementById('fin-fecha')?.value || today(), d = +f.slice(8, 10);
    return freq === 'anual' ? `cada año el ${d} de ${model.MONTHS[+f.slice(5, 7) - 1]}` : freq === 'semanal' ? `cada ${model.WEEKDAYS[(new Date(f + 'T12:00:00Z').getUTCDay() + 6) % 7]}` : `cada mes el día ${d}`;
  }
  function paintSummary() {
    const t = model.monthTotals(S.movimientos, S.month), usual = model.usualSpend(S.movimientos, S.month), fixed = model.fixedPerMonth(S.recurrentes);
    const next = model.upcoming(S.recurrentes, today(), 35).slice(0, 6), bud = model.budgets(S.categorias, t), series = model.monthlySeries(S.movimientos, S.month);
    const top = Math.max(1, ...t.porCategoria.map(c => c[1]));
    return `${S.month === today().slice(0, 7) ? quickAdd() : ''}
      <div class="tl-kpis"><article><small>GASTADO</small><strong>${EUR(t.gastos)}</strong><span>${usual ? `${t.gastos <= usual ? 'por debajo' : 'por encima'} de tu media (${EUR(usual)})` : 'este mes'}</span></article>
        <article><small>INGRESOS</small><strong>${EUR(t.ingresos)}</strong><span>este mes</span></article>
        <article><small>AHORRO</small><strong class="${t.neto >= 0 ? 'up' : 'down'}">${EUR(t.neto)}</strong><span>${t.ahorro === null ? 'sin ingresos aún' : `${Math.round(t.ahorro * 100)} % de lo que entra`}</span></article>
        <article><small>RECURRENTES AL MES</small><strong>${EUR(fixed.gastos)}</strong><span>${fixed.ingresos ? `frente a ${EUR(fixed.ingresos)} de ingresos recurrentes` : 'recurrentes activos'}</span></article></div>
      ${next.length ? `<h3 class="tl-section">Próximos cobros</h3><ul class="fin-next">${next.map(x => `<li><span>${shortDate(x.fecha)}</span><b>${E(x.rec[R.CONCEPTO] || x.rec[R.CAT])}</b><em class="${x.rec[R.TIPO] === 'Ingreso' ? 'in' : ''}">${x.rec[R.TIPO] === 'Ingreso' ? '+' : '−'}${EUR(+x.rec[R.IMPORTE])}</em></li>`).join('')}</ul>` : ''}
      <h3 class="tl-section">En qué se va este mes</h3>
      ${t.porCategoria.length ? `<ul class="fin-cats">${t.porCategoria.map(([c, v]) => { const b = bud.find(x => x.cat === c); return `<li><span>${E(c)}${b ? `<small>${Math.round(b.share * 100)} % de ${EUR(b.budget)}</small>` : ''}</span><b>${EUR(v)}</b><i class="${b && b.share > 1 ? 'over' : ''}" style="width:${Math.max(3, v / top * 100)}%"></i></li>`; }).join('')}</ul>` : '<p class="tl-note">Aún no hay gastos este mes.</p>'}
      <h3 class="tl-section">Últimos 12 meses</h3>${chart(series)}
      <p class="tl-method">Los datos viven en tu Google Sheet: puedes editarlo a mano y aquí se relee al abrir. Los recurrentes se apuntan solos el día que tocan.</p>`;
  }
  function chart(series) {
    const max = Math.max(1, ...series.flatMap(s => [s.gastos, s.ingresos])), w = 640, h = 180, bw = w / series.length;
    const bars = series.map((s, i) => { const x = i * bw, hi = s.ingresos / max * (h - 30), hg = s.gastos / max * (h - 30);
      return `<g><title>${cap(model.monthName(s.month))}: ingresos ${EUR(s.ingresos)}, gastos ${EUR(s.gastos)}</title><rect x="${x + bw * .14}" y="${h - 20 - hi}" width="${bw * .33}" height="${hi}" rx="3" class="in"/><rect x="${x + bw * .5}" y="${h - 20 - hg}" width="${bw * .33}" height="${hg}" rx="3" class="out"/><text x="${x + bw / 2}" y="${h - 4}" text-anchor="middle">${model.MONTHS[+s.month.slice(5, 7) - 1].slice(0, 1).toUpperCase()}</text></g>`; }).join('');
    return `<figure class="fin-chart"><svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Ingresos y gastos de los últimos 12 meses">${bars}</svg><figcaption><i class="in"></i>Ingresos <i class="out"></i>Gastos</figcaption></figure>`;
  }
  function paintList() {
    const rows = S.movimientos.filter(m => model.monthOf(m[M.FECHA]) === S.month).sort((a, b) => (a[M.FECHA] + (a[M.HORA] || '') < b[M.FECHA] + (b[M.HORA] || '') ? 1 : -1));
    const days = [...new Set(rows.map(r => r[M.FECHA]))];
    return `<div class="fin-month"><button type="button" class="tl-chip" data-month="-1" aria-label="Mes anterior">‹</button><b>${cap(model.monthName(S.month))}</b><button type="button" class="tl-chip" data-month="1" aria-label="Mes siguiente" ${S.month >= today().slice(0, 7) ? 'disabled' : ''}>›</button></div>
      ${rows.length ? days.map(d => `<h4 class="fin-day">${shortDate(d)}</h4><ul class="fin-list">${rows.filter(r => r[M.FECHA] === d).map(r => `<li><button type="button" data-edit="${E(r[M.ID])}"><span>${E(r[M.CONCEPTO] || r[M.CAT])}<small>${E(r[M.CAT])}${r[M.HORA] ? ` · ${E(r[M.HORA])}` : ''}${r[M.ORIGEN] === 'recurrente' ? ' · recurrente' : ''}</small></span><b class="${r[M.TIPO] === 'Ingreso' ? 'in' : ''}">${r[M.TIPO] === 'Ingreso' ? '+' : '−'}${EUR(+r[M.IMPORTE])}</b></button></li>`).join('')}</ul>`).join('') : '<p class="tl-note">No hay movimientos este mes.</p>'}`;
  }
  // ---------- Statistics ----------
  function paintStats() {
    const to = today(), from = S.range ? model.shiftDays(to, -Math.round(S.range * 30.44)) : '', rows = model.habitRows(S.movimientos, from, to);
    const ranges = `<div class="tl-chips fin-range" role="group" aria-label="Periodo">${[[1, 'Último mes'], [3, '3 meses'], [12, '12 meses'], [0, 'Todo']].map(([v, l]) => `<button type="button" data-range="${v}" aria-pressed="${S.range === v}">${l}</button>`).join('')}</div>`;
    if (!rows.length) return `${ranges}<p class="tl-note">Aún no hay gastos apuntados a mano en este periodo. En cuanto apuntes unos cuantos, aquí verás a qué horas, qué días y en qué gastas más.</p>`;
    const total = rows.reduce((t, m) => t + +m[M.IMPORTE], 0), H = model.byHour(rows), W = model.byWeekday(rows), parts = model.dayparts(H.hours), cats = model.categoryStats(rows);
    const topDay = W.reduce((a, b) => (b.total > a.total ? b : a)), topPart = parts.reduce((a, b) => (b.total > a.total ? b : a)), topHour = H.hours.reduce((a, b) => (b.total > a.total ? b : a));
    const series = model.categorySeries(S.movimientos, to.slice(0, 7), cats.slice(0, 5).map(c => c.cat), 6);
    return `${ranges}
      <div class="tl-kpis"><article><small>GASTADO</small><strong>${EUR(total)}</strong><span>${rows.length} ${rows.length === 1 ? 'gasto apuntado' : 'gastos apuntados'} a mano</span></article>
        <article><small>GASTO MEDIO</small><strong>${EUR(total / rows.length)}</strong><span>por compra</span></article>
        <article><small>DÍA QUE MÁS</small><strong>${cap(model.WEEKDAYS[topDay.d])}</strong><span>${Math.round(topDay.total / total * 100)} % del gasto</span></article>
        <article><small>FRANJA QUE MÁS</small><strong>${H.known ? cap(topPart.name) : '—'}</strong><span>${H.known ? `sobre todo a las ${topHour.h}:00` : 'sin horas apuntadas'}</span></article></div>
      <h3 class="tl-section">A qué hora gastas</h3>
      ${H.known ? bars(H.hours.map(x => ({ label: x.h % 3 ? '' : String(x.h), value: x.total, title: `${x.h}:00–${x.h}:59: ${EUR(x.total)} en ${x.count} ${x.count === 1 ? 'gasto' : 'gastos'}` })), 'Gasto por hora del día') : ''}
      <p class="tl-method">${H.known ? `Con ${H.known} ${H.known === 1 ? 'gasto que tiene' : 'gastos que tienen'} hora.` : 'Ningún gasto de este periodo tiene hora.'}${H.unknown ? ` ${H.unknown} sin hora no cuentan aquí.` : ''}</p>
      <h3 class="tl-section">Qué día de la semana</h3>
      ${bars(W.map(x => ({ label: model.WEEKDAYS[x.d].slice(0, 2), value: x.total, title: `${cap(model.WEEKDAYS[x.d])}: ${EUR(x.total)} en ${x.count} ${x.count === 1 ? 'gasto' : 'gastos'}` })), 'Gasto por día de la semana')}
      <h3 class="tl-section">En qué</h3>
      <ul class="fin-cats">${cats.map(c => `<li><span>${E(c.cat)}<small>${c.count} ${c.count === 1 ? 'gasto' : 'gastos'} · ${EUR(c.ticket)} de media</small></span><b>${EUR(c.total)}</b><i style="width:${Math.max(3, c.total / cats[0].total * 100)}%"></i></li>`).join('')}</ul>
      <h3 class="tl-section">Evolución por categoría</h3>
      <div class="fin-evo">${series.map(s => `<div><span>${E(s.cat)}</span>${spark(s.values)}<b>${EUR(s.values[s.values.length - 1])}</b></div>`).join('')}<p class="tl-method">Gasto de cada mes en los últimos 6 meses; la cifra es el mes en curso.</p></div>
      <p class="tl-method">Aquí solo cuenta lo que apuntas a mano: los recurrentes (alquiler, suscripciones…) son fijos y no dicen nada de tus hábitos.</p>`;
  }
  function bars(items, label) {
    const max = Math.max(1, ...items.map(x => x.value)), w = 640, h = 150, bw = w / items.length;
    return `<figure class="fin-chart"><svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}">${items.map((x, i) => { const bh = x.value / max * (h - 26);
      return `<g><title>${E(x.title)}</title><rect x="${i * bw + bw * .15}" y="${h - 18 - bh}" width="${bw * .7}" height="${x.value ? Math.max(bh, 2) : 0}" rx="3" class="out"/>${x.label ? `<text x="${i * bw + bw / 2}" y="${h - 4}" text-anchor="middle">${E(x.label)}</text>` : ''}</g>`; }).join('')}</svg></figure>`;
  }
  function spark(values) {
    const max = Math.max(1, ...values), w = 120, h = 30, step = w / (values.length - 1 || 1);
    const pts = values.map((v, i) => `${(i * step).toFixed(1)},${(h - 3 - v / max * (h - 6)).toFixed(1)}`).join(' ');
    return `<svg viewBox="0 0 ${w} ${h}" aria-hidden="true"><polyline points="${pts}"/></svg>`;
  }
  const freqText = r => (r[R.FREQ] === 'anual' ? `cada año, el ${r[R.DIA]} de ${model.MONTHS[(+r[R.MES] || 1) - 1]}` : r[R.FREQ] === 'semanal' ? `cada ${model.WEEKDAYS[(+r[R.DIA] || 1) - 1]}` : `cada mes, el día ${r[R.DIA]}`);
  function paintRecurring() {
    const fixed = model.fixedPerMonth(S.recurrentes);
    return `<p class="tl-note">Alquiler, suscripciones, nómina, seguros… Pon el día habitual de cobro y se apuntan solos en Movimientos ese día. También puedes marcar «Se repite» al apuntar un gasto o ingreso.</p>
      <div class="tl-kpis two"><article><small>GASTOS RECURRENTES</small><strong>${EUR(fixed.gastos)}</strong><span>al mes de media</span></article><article><small>INGRESOS RECURRENTES</small><strong>${EUR(fixed.ingresos)}</strong><span>al mes de media</span></article></div>
      <ul class="fin-list">${S.recurrentes.map(r => `<li class="${r[R.ACTIVO] === false || String(r[R.ACTIVO]) === 'false' ? 'paused' : ''}"><button type="button" data-rec="${E(r[R.ID])}"><span>${E(r[R.CONCEPTO] || r[R.CAT])}<small>${E(r[R.CAT])} · ${freqText(r)}${r[R.ACTIVO] === false || String(r[R.ACTIVO]) === 'false' ? ' · en pausa' : ''}</small></span><b class="${r[R.TIPO] === 'Ingreso' ? 'in' : ''}">${r[R.TIPO] === 'Ingreso' ? '+' : '−'}${EUR(+r[R.IMPORTE])}</b></button></li>`).join('')}</ul>
      <button type="button" class="tl-primary" data-act="new-rec">Nuevo recurrente</button>`;
  }

  // ---------- Layers: edit a movement, create or edit a recurring item, add a category ----------
  function paintLayer() {
    const node = document.getElementById('fin-layer'), L = S.layer;
    node.hidden = false;
    const catOptions = (tipo, current) => catsOf(tipo).map(c => `<option${c === current ? ' selected' : ''}>${E(c)}</option>`).join('');
    if (L.kind === 'edit') {
      const m = S.movimientos.find(x => x[M.ID] === L.id);
      node.innerHTML = `<div class="tl-card plain" role="dialog" aria-label="Corregir movimiento"><h3>${m[M.TIPO]}</h3>
        <label class="tl-field" for="fin-e-importe">Importe</label><input class="tl-text" id="fin-e-importe" inputmode="decimal" value="${String(m[M.IMPORTE]).replace('.', ',')}">
        <label class="tl-field" for="fin-e-cat">Categoría</label><select class="tl-text" id="fin-e-cat">${catOptions(m[M.TIPO], m[M.CAT])}</select>
        <label class="tl-field" for="fin-e-concepto">Concepto</label><input class="tl-text" id="fin-e-concepto" value="${E(m[M.CONCEPTO])}" maxlength="200">
        <div class="fin-row"><label><span class="tl-field">Fecha</span><input class="tl-text" id="fin-e-fecha" type="date" value="${E(m[M.FECHA])}"></label><label><span class="tl-field">Hora</span><input class="tl-text" id="fin-e-hora" type="time" value="${E(m[M.HORA] || '')}"></label></div>
        <p class="tl-note">Deja la hora vacía si no la sabes.</p>
        <button type="button" class="tl-primary" data-act="edit-save">Guardar</button><button type="button" class="tl-link center" data-act="edit-delete">Borrar</button><button type="button" class="tl-link center" data-act="close">Cancelar</button></div>`;
    } else if (L.kind === 'rec') {
      const r = S.recurrentes.find(x => x[R.ID] === L.id) || ['', 'Gasto', '', '', '', 'mensual', +today().slice(8, 10), '', today(), '', true];
      const tipo = L.tipo || r[R.TIPO], freq = L.freq || r[R.FREQ];
      node.innerHTML = `<div class="tl-card plain" role="dialog" aria-label="Gasto o ingreso recurrente"><h3>${L.id ? 'Editar recurrente' : 'Nuevo recurrente'}</h3>
        <div class="tl-kind" role="group" aria-label="Tipo"><button type="button" data-rtipo="Gasto" aria-pressed="${tipo === 'Gasto'}">Gasto</button><button type="button" data-rtipo="Ingreso" aria-pressed="${tipo === 'Ingreso'}">Ingreso</button></div>
        <label class="tl-field" for="fin-r-concepto">Concepto</label><input class="tl-text" id="fin-r-concepto" value="${E(r[R.CONCEPTO])}" placeholder="Alquiler, Netflix, nómina…" maxlength="200">
        <label class="tl-field" for="fin-r-importe">Importe</label><input class="tl-text" id="fin-r-importe" inputmode="decimal" value="${r[R.IMPORTE] === '' ? '' : String(r[R.IMPORTE]).replace('.', ',')}">
        <label class="tl-field" for="fin-r-cat">Categoría</label><select class="tl-text" id="fin-r-cat">${catOptions(tipo, r[R.CAT])}</select>
        <span class="tl-field">Cada cuánto</span><div class="tl-chips" role="group" aria-label="Frecuencia">${[['mensual', 'Mensual'], ['anual', 'Anual'], ['semanal', 'Semanal']].map(([v, l]) => `<button type="button" data-freq="${v}" aria-pressed="${freq === v}">${l}</button>`).join('')}</div>
        ${freq === 'semanal' ? `<label class="tl-field" for="fin-r-dia">Día de la semana</label><select class="tl-text" id="fin-r-dia">${model.WEEKDAYS.map((d, i) => `<option value="${i + 1}"${+r[R.DIA] === i + 1 ? ' selected' : ''}>${cap(d)}</option>`).join('')}</select>`
          : `<div class="fin-row"><label><span class="tl-field">Día de cobro</span><input class="tl-text" id="fin-r-dia" inputmode="numeric" value="${E(r[R.DIA] || 1)}"></label>${freq === 'anual' ? `<label><span class="tl-field">Mes</span><select class="tl-text" id="fin-r-mes">${model.MONTHS.map((m, i) => `<option value="${i + 1}"${+r[R.MES] === i + 1 ? ' selected' : ''}>${cap(m)}</option>`).join('')}</select></label>` : ''}</div>`}
        <label class="tl-field" for="fin-r-desde">Desde</label><input class="tl-text" id="fin-r-desde" type="date" value="${E(r[R.DESDE] || today())}">
        <button type="button" class="tl-primary" data-act="rec-save">Guardar</button>
        ${L.id ? `<button type="button" class="tl-link center" data-act="rec-pause">${r[R.ACTIVO] === false || String(r[R.ACTIVO]) === 'false' ? 'Reactivar' : 'Pausar'}</button><button type="button" class="tl-link center" data-act="rec-delete">Borrar</button>` : ''}
        <button type="button" class="tl-link center" data-act="close">Cancelar</button></div>`;
    } else if (L.kind === 'cat') {
      node.innerHTML = `<div class="tl-card plain" role="dialog" aria-label="Nueva categoría"><h3>Nueva categoría de ${S.tipo.toLowerCase()}</h3>
        <label class="tl-field" for="fin-c-nombre">Nombre</label><input class="tl-text" id="fin-c-nombre" maxlength="60" autocomplete="off">
        <label class="tl-field" for="fin-c-presupuesto">Presupuesto al mes (opcional)</label><input class="tl-text" id="fin-c-presupuesto" inputmode="decimal">
        <button type="button" class="tl-primary" data-act="cat-save">Crear</button><button type="button" class="tl-link center" data-act="close">Cancelar</button></div>`;
    }
  }
  function closeLayer() { S.layer = null; const n = document.getElementById('fin-layer'); if (n) { n.hidden = true; n.innerHTML = ''; } }

  function add() {
    const importe = amountOf('fin-importe');
    if (!importe) return document.getElementById('fin-importe').focus();
    const fecha = document.getElementById('fin-fecha').value || today(), concepto = document.getElementById('fin-concepto').value.trim();
    // The time is now unless it was changed by hand; «Hora desconocida» leaves it empty so it never skews the hour statistics.
    const timeInput = document.getElementById('fin-hora'), hora = S.noTime ? '' : model.normTime(timeInput.dataset.touched ? timeInput.value : nowTime());
    let fila = [fecha, S.tipo, importe, S.cat || 'Otros', concepto, '', 'app', model.newId(), hora];
    if (S.repeat !== 'no') {
      // A recurring item starting that day; this first charge carries the ID the automatic ones use, so it is never written twice.
      const d = new Date(fecha + 'T12:00:00Z'), freq = S.repeat;
      const rec = ['f' + Date.now().toString(36), S.tipo, importe, fila[3], concepto, freq, freq === 'semanal' ? (d.getUTCDay() + 6) % 7 + 1 : d.getUTCDate(), freq === 'anual' ? d.getUTCMonth() + 1 : '', fecha, '', true];
      S.recurrentes.push(rec); enqueue({ tipo: 'guardar', tabla: 'Recurrentes', fila: rec });
      fila = [fecha, S.tipo, importe, fila[3], concepto, '', 'recurrente', model.recurringId(rec, fecha), hora];
    }
    S.movimientos.push(fila); enqueue({ tipo: 'guardar', tabla: 'Movimientos', fila });
    if (S.repeat !== 'no') applyRecurring();
    S.repeat = 'no'; S.noTime = false;
    paint();
    const done = app.querySelector('.fin-add');
    done?.classList.add('saved'); setTimeout(() => done?.classList.remove('saved'), 900);
  }
  function saveEdit() {
    const m = S.movimientos.find(x => x[M.ID] === S.layer.id), importe = amountOf('fin-e-importe');
    if (!m || !importe) return;
    m[M.IMPORTE] = importe; m[M.CAT] = document.getElementById('fin-e-cat').value; m[M.CONCEPTO] = document.getElementById('fin-e-concepto').value.trim(); m[M.FECHA] = document.getElementById('fin-e-fecha').value || m[M.FECHA]; m[M.HORA] = model.normTime(document.getElementById('fin-e-hora').value);
    enqueue({ tipo: 'guardar', tabla: 'Movimientos', fila: [...m] }); closeLayer(); paint();
  }
  function deleteEdit() {
    const id = S.layer.id;
    S.movimientos = S.movimientos.filter(x => x[M.ID] !== id); S.queue = S.queue.filter(o => !(o.tabla === 'Movimientos' && o.fila?.[M.ID] === id));
    enqueue({ tipo: 'borrar', tabla: 'Movimientos', id }); closeLayer(); paint();
  }
  function saveRec() {
    const L = S.layer, old = S.recurrentes.find(x => x[R.ID] === L.id), importe = amountOf('fin-r-importe');
    if (!importe) return document.getElementById('fin-r-importe').focus();
    const tipo = L.tipo || old?.[R.TIPO] || 'Gasto', freq = L.freq || old?.[R.FREQ] || 'mensual';
    const dia = Math.min(freq === 'semanal' ? 7 : 31, Math.max(1, parseInt(document.getElementById('fin-r-dia').value, 10) || 1));
    const fila = [L.id || 'f' + Date.now().toString(36), tipo, importe, document.getElementById('fin-r-cat').value, document.getElementById('fin-r-concepto').value.trim(), freq, dia,
      freq === 'anual' ? +document.getElementById('fin-r-mes').value : '', document.getElementById('fin-r-desde').value || today(), old?.[R.HASTA] || '', old ? old[R.ACTIVO] !== false && String(old[R.ACTIVO]) !== 'false' : true];
    S.recurrentes = S.recurrentes.filter(x => x[R.ID] !== fila[R.ID]).concat([fila]);
    enqueue({ tipo: 'guardar', tabla: 'Recurrentes', fila }); closeLayer(); applyRecurring(); paint();
  }
  function pauseRec() {
    const r = S.recurrentes.find(x => x[R.ID] === S.layer.id);
    r[R.ACTIVO] = r[R.ACTIVO] === false || String(r[R.ACTIVO]) === 'false';
    enqueue({ tipo: 'guardar', tabla: 'Recurrentes', fila: model.normRec(r) });
    closeLayer(); paint();
  }
  function deleteRec() { const id = S.layer.id; S.recurrentes = S.recurrentes.filter(x => x[R.ID] !== id); enqueue({ tipo: 'borrar', tabla: 'Recurrentes', id }); closeLayer(); paint(); }
  function saveCat() {
    const name = document.getElementById('fin-c-nombre').value.trim(), budget = amountOf('fin-c-presupuesto');
    if (!name) return document.getElementById('fin-c-nombre').focus();
    if (!S.categorias.some(c => c[0] === S.tipo && c[1].toLowerCase() === name.toLowerCase())) S.categorias.push([S.tipo, name, budget || '']);
    S.cat = name;
    S.queue = S.queue.filter(o => !o.categorias); enqueue({ categorias: S.categorias.map(c => [c[0], String(c[1]), c[2] === '' ? '' : +c[2]]) }); closeLayer(); paint();
  }
  async function connect(button) {
    button.disabled = true; button.textContent = 'Comprobando…'; S.error = '';
    try { await call('POST', { action: 'connect', code: document.getElementById('fin-code').value }); await load(); }
    catch (e) { S.error = e.message === 'invalid_code' ? 'Ese código no tiene el formato esperado: URL que acaba en /exec, # y la clave.' : 'El Sheet no ha respondido con ese código.'; }
    paint();
  }

  app.addEventListener('click', event => {
    const b = event.target.closest('button');
    if (!b || b.disabled) return;
    const d = b.dataset;
    if (d.tab) { S.tab = d.tab; closeLayer(); return paint(); }
    if (d.tipo) { S.tipo = d.tipo; return keepForm(paint); }
    if (d.cat) { S.cat = d.cat; app.querySelectorAll('[data-cat]').forEach(x => x.setAttribute('aria-pressed', String(x === b))); return undefined; }
    if (d.repeat) { S.repeat = d.repeat; return keepForm(paint); }
    if (d.range) { S.range = +d.range; return paint(); }
    if (d.month) { S.month = model.shiftMonth(S.month, +d.month); return paint(); }
    if (d.edit) { S.layer = { kind: 'edit', id: d.edit }; return paintLayer(); }
    if (d.rec) { S.layer = { kind: 'rec', id: d.rec }; return paintLayer(); }
    if (d.rtipo) { S.layer.tipo = d.rtipo; return paintLayer(); }
    if (d.freq) { S.layer.freq = d.freq; return paintLayer(); }
    switch (d.act) {
      case 'connect': return connect(b);
      case 'add': return add();
      case 'no-time': S.noTime = !S.noTime; return keepForm(paint);
      case 'new-cat': S.layer = { kind: 'cat' }; return paintLayer();
      case 'cat-save': return saveCat();
      case 'new-rec': S.layer = { kind: 'rec', id: null }; return paintLayer();
      case 'rec-save': return saveRec();
      case 'rec-pause': return pauseRec();
      case 'rec-delete': return deleteRec();
      case 'edit-save': return saveEdit();
      case 'edit-delete': return deleteEdit();
      case 'close': return closeLayer();
      default: return undefined;
    }
  });
  // Repainting the quick form keeps what was already typed.
  function keepForm(fn) {
    const ids = ['fin-importe', 'fin-concepto', 'fin-fecha', 'fin-hora'], kept = ids.map(id => document.getElementById(id)).map(n => n && { v: n.value, t: n.dataset.touched });
    fn();
    ids.forEach((id, i) => { const n = document.getElementById(id); if (n && kept[i]) { n.value = kept[i].v; if (kept[i].t) n.dataset.touched = '1'; } });
    const h = document.getElementById('fin-hora'); if (h && S.noTime) h.disabled = true;
  }
  app.addEventListener('input', event => { if (event.target.id === 'fin-hora') event.target.dataset.touched = '1'; });
  app.addEventListener('change', event => { if (event.target.id === 'fin-fecha' && S.repeat !== 'no') keepForm(paint); });
  app.addEventListener('keydown', event => { if (event.key === 'Enter' && event.target.id === 'fin-importe') add(); });
  window.addEventListener('online', flush);
  setInterval(flush, 30000);

  window.FinanceLab = { async initialise(token) {
    csrf = token;
    try {
      model = await import('./finance-model.js?v=20261112hora'); M = model.M; R = model.R;
      S.queue = read('queue', []).map(o => (o.tabla === 'Movimientos' && o.fila ? { ...o, fila: model.normMov(o.fila) } : o));
      const cache = read('cache', null);
      if (cache) { Object.assign(S, cache); S.movimientos = S.movimientos.map(model.normMov); S.connected = true; paint(); }
      await flush();
      try { await load(); } catch (error) { if (!cache && error.message !== 'session') throw error; S.error = 'Sin conexión con el Sheet: enseño lo último guardado y subiré los cambios en cuanto vuelva.'; }
      if (!S.layer && !document.activeElement?.matches?.('#fin-importe, #fin-concepto, #fin-code')) paint();
    } catch {
      app.innerHTML = '<p class="eyebrow"><span></span> GASTOS</p><h2>Gastos</h2><p class="tl-error">No se ha podido leer el Sheet. Vuelve a intentarlo en un momento.</p>';
    }
  } };
})();
