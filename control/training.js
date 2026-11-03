(() => {
  const app = document.getElementById('training-app');
  if (!app) return;
  const API = '/control/api/training/status';
  const PHRASES = {
    hello: ['Vapor a presión. Abre la válvula.', 'La barra no se va a levantar sola, CesarVapor.', 'Marialópoda ya ha entrenado hoy. Solo lo dejo aquí.', 'Hoy se apunta todo, también lo feo.', 'RPE honesto, ego en la taquilla.', 'Cuatro años de notas para llegar aquí. Vamos a por la siguiente.'],
    rest: ['Respira. El sistema nervioso también cotiza.', 'Bebe agua, que luego te da dolor de cabeza.', 'Mira el móvil, pero no el de la bolsa.', 'Marialópoda descansa 2 minutos. Tú también puedes.', 'Ese @10 ha sido un @9 y lo sabes. O al revés.'],
    record: ['Esto va al historial y no se borra.', 'Nuevo techo. Mañana será suelo.', 'Marialópoda te lo va a reconocer. En privado.', 'Ni el 2022 tuyo se lo cree.'],
    done: ['Entreno apuntado. El Excel ya no tiene que adivinar nada.', 'Hecho. Ahora come, que el músculo no se hace con Python.', 'Sesión cerrada. Díselo a Marialópoda, que le hará ilusión.']
  };
  let model, F, csrf = '', S = {
    connected: null, rutina: [], alternativas: [], filas: [], bodyWeight: [], tab: 'hoy', dia: null, ejercicio: null, draft: {}, chosen: {},
    muscle: null, chart: null, metric: 'e1rm', more: false, editing: null, rest: null, restSeconds: 150, busy: false, error: '', hello: '', queue: [], plan: null
  };
  const read = (k, d) => { try { const v = localStorage.getItem('training.' + k); return v === null ? d : JSON.parse(v); } catch { return d; } };
  const write = (k, v) => { try { localStorage.setItem('training.' + k, JSON.stringify(v)); } catch { /* memory only */ } };
  const E = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[ch]));
  // The rest bar and dialogs live on <body>: the view's entrance transforms would otherwise anchor them to the page, not the screen.
  const portal = document.createElement('div');
  portal.className = 'training-view';
  portal.innerHTML = '<div id="tl-rest" hidden></div><div id="tl-layer" hidden></div>';
  document.body.append(portal);
  const $ = selector => app.querySelector(selector) || portal.querySelector(selector);
  const pick = list => list[Math.floor(Math.random() * list.length)];
  const N = value => new Intl.NumberFormat('es-ES', { maximumFractionDigits: 2 }).format(value);
  const N0 = value => new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(value);
  const today = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
  const shortDate = iso => { const [y, m, d] = iso.split('-'); const label = `${+d} ${['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'][m - 1]}`; return y === today().slice(0, 4) ? label : `${label} ${y.slice(2)}`; };

  // ---------- Today's plan: skips, order and swaps that expire with the date ----------
  function plan() {
    if (!S.plan || S.plan.fecha !== today()) S.plan = { fecha: today(), saltos: {}, orden: {}, cambios: {} };
    return S.plan;
  }
  const savePlan = () => write('plan', S.plan);
  const days = () => { const m = new Map(); S.rutina.forEach(r => { if (!m.has(r.dia)) m.set(r.dia, r.nombre); }); return [...m].sort((a, b) => a[0] - b[0]).map(([dia, nombre]) => ({ dia, nombre })); };
  function exercises(dia) {
    const p = plan();
    const list = S.rutina.filter(r => r.dia === dia && r.ejercicio).sort((a, b) => a.orden - b.orden).map(r => {
      const swap = p.cambios[`${dia}|${r.ejercicio}`];
      if (!swap) return { ...r, original: r.ejercicio };
      const alt = S.alternativas.find(a => a.ejercicio === swap);
      return { ...r, original: r.ejercicio, ejercicio: swap, referencia: alt?.referencia || '' };
    });
    if (p.orden[dia]) list.sort((a, b) => p.orden[dia].indexOf(a.original) - p.orden[dia].indexOf(b.original));
    return list;
  }
  const todayRows = (dia, name) => S.filas.filter(f => f[F.FECHA] === today() && f[F.DIA] === dia && f[F.EJ] === name).sort((a, b) => a[F.SERIE] - b[F.SERIE]);
  function setState(r) {
    const done = todayRows(S.dia, r.ejercicio), skipped = plan().saltos[`${S.dia}|${r.ejercicio}`] || [];
    const taken = new Set([...done.map(f => f[F.SERIE]), ...skipped]), free = [];
    for (let i = 1; i <= r.series; i++) if (!taken.has(i)) free.push(i);
    const wanted = S.chosen[r.ejercicio];
    return { done, skipped, free, active: free.includes(wanted) ? wanted : (free[0] ?? Math.max(r.series, ...taken) + 1), complete: !free.length };
  }
  function suggestedDay() {
    const list = days();
    if (!list.length) return null;
    let last = null;
    for (const f of S.filas) if (f[F.ORIGEN] === 'app' && (!last || f[F.FECHA] >= last[F.FECHA])) last = f;
    if (!last) return list[0].dia;
    if (last[F.FECHA] === today()) return last[F.DIA];
    return list[(list.findIndex(d => d.dia === last[F.DIA]) + 1) % list.length].dia;
  }
  function draftFor(r) {
    const s = setState(r), current = S.draft[r.ejercicio];
    if (current && current.serie === s.active) return current;
    const previous = s.done[s.done.length - 1];
    const last = model.sessions(S.filas, r.ejercicio, today())[0];
    const source = previous || last?.series.find(f => f[F.SERIE] === s.active) || last?.series[last.series.length - 1];
    const draft = { serie: s.active, kg: source ? model.num(source[F.KG]) ?? 0 : 0, reps: source ? model.num(source[F.REPS]) ?? r.reps : r.reps, rpe: previous ? model.num(previous[F.RPE]) : null };
    S.draft[r.ejercicio] = draft;
    return draft;
  }

  // ---------- Network ----------
  async function call(method, body) {
    const response = await fetch(API, { method, credentials: 'same-origin', headers: { accept: 'application/json', ...(method === 'POST' ? { 'x-csrf-token': csrf, 'content-type': 'application/json' } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
    if (response.status === 401) { location.replace('/control/login'); throw new Error('session'); }
    const result = await response.json();
    if (!result.ok) throw new Error(result.error || 'unavailable');
    return result;
  }
  const toRow = f => [f.fecha, f.dia, f.ejercicio, f.musculo, f.serie, f.reps ?? '', f.kg ?? '', f.rpe ?? '', f.nota || '', 'app', f.id];
  function merge(serverRows) {
    const pending = new Map(), deleted = new Set();
    for (const op of S.queue) { if (op.tipo === 'borrar') deleted.add(op.id); else pending.set(op.fila.id, toRow(op.fila)); }
    S.filas = serverRows.filter(f => !deleted.has(f[F.ID]) && !pending.has(f[F.ID])).concat([...pending.values()]);
  }
  async function load() {
    const data = await call('GET');
    S.connected = data.connected;
    if (!data.connected) return;
    S.rutina = data.rutina; S.alternativas = data.alternativas; S.bodyWeight = data.bodyWeight;
    merge(data.filas);
    write('cache', { rutina: S.rutina, alternativas: S.alternativas, filas: S.filas, bodyWeight: S.bodyWeight });
    S.error = '';
  }
  async function flush() {
    if (S.busy || !S.queue.length) return;
    S.busy = true;
    const sending = S.queue.slice();
    try {
      await call('POST', { action: 'ops', ops: sending });
      S.queue = S.queue.slice(sending.length);
      write('queue', S.queue);
    } catch { /* offline: retried later */ }
    S.busy = false;
    paintPending();
  }
  function enqueue(op) {
    S.queue.push(op);
    write('queue', S.queue);
    write('cache', { rutina: S.rutina, alternativas: S.alternativas, filas: S.filas, bodyWeight: S.bodyWeight });
    paintPending();
    flush();
  }
  function paintPending() {
    const n = S.queue.length, node = $('#tl-pending');
    if (node) { node.hidden = !n; node.textContent = n === 1 ? '1 cambio por subir' : `${n} cambios por subir`; }
  }

  // ---------- Paint ----------
  function paint() {
    if (S.connected === false) return paintConnect();
    if (!S.rutina.length) { app.innerHTML = `<p class="eyebrow"><span></span> TRAINING LAB</p><h2>Rutina vacía.</h2><p class="tl-note">Rellena la pestaña Rutina de tu Sheet y vuelve aquí.</p>`; return; }
    if (S.dia === null) S.dia = suggestedDay();
    if (!S.hello) S.hello = pick(PHRASES.hello);
    app.innerHTML = `<header class="tl-head"><div><p class="eyebrow"><span></span> TRAINING LAB</p><h2>${S.tab === 'hoy' ? `Día ${S.dia}` : 'Evolución'}</h2><p class="tl-hello">${E(S.hello)}</p></div>
      <div class="tl-head-side"><span class="tl-pending" id="tl-pending" hidden></span>
      <div class="tl-tabs" role="tablist"><button type="button" role="tab" data-tab="hoy" aria-selected="${S.tab === 'hoy'}">Hoy</button><button type="button" role="tab" data-tab="evo" aria-selected="${S.tab === 'evo'}">Evolución</button></div></div></header>
      ${S.error ? `<p class="tl-error" role="status">${E(S.error)}</p>` : ''}
      <div id="tl-body"></div>`;
    if (S.tab === 'hoy') paintToday(); else paintEvolution();
    paintRest(); paintPending();
  }
  function paintConnect() {
    app.innerHTML = `<p class="eyebrow"><span></span> TRAINING LAB</p><h2>Conecta tu Sheet.</h2><p class="tl-note">Pega el código de tu implementación de Apps Script: la URL que acaba en /exec, seguida de # y la clave.</p>
      <div class="tl-connect"><label for="tl-code">Código de conexión</label><textarea id="tl-code" autocomplete="off" spellcheck="false"></textarea>${S.error ? `<p class="tl-error" role="status">${E(S.error)}</p>` : ''}<button type="button" class="tl-primary" data-act="connect">Conectar</button></div>`;
  }

  function paintToday() {
    const list = exercises(S.dia), all = days();
    const dayRow = `<div class="tl-days" role="group" aria-label="Elegir día">${all.map(d => `<button type="button" data-day="${d.dia}" aria-pressed="${d.dia === S.dia}"><b>${d.dia}</b>${E(d.nombre)}</button>`).join('')}</div>`;
    if (!list.length) { $('#tl-body').innerHTML = `${dayRow}<p class="tl-note">Este día no tiene ejercicios en la pestaña Rutina.</p>`; return; }
    const pending = list.find(r => !setState(r).complete);
    if (!S.ejercicio || !list.some(r => r.ejercicio === S.ejercicio)) S.ejercicio = (pending || list[0]).ejercicio;
    const r = list.find(x => x.ejercicio === S.ejercicio);
    const anyDone = list.some(x => todayRows(S.dia, x.ejercicio).length);
    const week = model.weeklySets(S.filas, today());
    $('#tl-body').innerHTML = `${dayRow}<div class="tl-layout"><div>${paintFocus(r)}</div><aside class="tl-side">
      <div class="tl-side-head"><h3>Hoy</h3><button type="button" class="tl-link" data-act="order">Cambiar orden</button></div>
      <ul class="tl-list">${list.map(x => { const s = setState(x); return `<li class="${s.complete ? 'done' : ''}${x === r ? ' current' : ''}"><button type="button" data-ex="${E(x.ejercicio)}"><span>${E(x.ejercicio)}</span><span class="tl-dots" aria-label="${s.done.length} de ${x.series} series">${Array.from({ length: x.series }, (_, i) => `<i class="${s.done.some(f => f[F.SERIE] === i + 1) ? 'ok' : s.skipped.includes(i + 1) ? 'skip' : ''}"></i>`).join('')}</span></button></li>`; }).join('')}</ul>
      ${anyDone ? '<button type="button" class="tl-secondary" data-act="finish">Terminar entreno</button>' : ''}
      ${week.length ? `<h3>Series duras, 7 días</h3><ul class="tl-week">${week.map(([m, n]) => `<li><span>${E(m)}</span><b>${n}</b><i style="width:${Math.min(100, n / Math.max(...week.map(w => w[1])) * 100)}%"></i></li>`).join('')}</ul>` : ''}
    </aside></div>`;
  }
  function paintPrevious(r) {
    const all = model.sessions(S.filas, r.ejercicio, today());
    if (!all.length) return '<p class="tl-note">Sin historial. Esta primera serie marca la referencia.</p>';
    const visible = all.slice(0, S.more ? 6 : 2);
    const top = Math.max(...visible.flatMap(s => s.series.map(f => model.num(f[F.KG]) || 0)), 1);
    const cols = Math.max(r.series, ...visible.map(s => s.series.length));
    return `<div class="tl-prev">${visible.map((s, i) => {
      const note = s.series.find(f => f[F.ORIGEN] !== 'app')?.[F.NOTA];
      const cells = [];
      for (let c = 0; c < cols; c++) {
        const f = s.series[c];
        if (!f) { cells.push(note && c === s.series.length ? `<span class="tl-prev-note" style="grid-column:span ${cols - c}">${E(note)}</span>` : note ? '' : '<span class="tl-cell empty"></span>'); if (note && c === s.series.length) break; continue; }
        const kg = model.num(f[F.KG]), reps = model.num(f[F.REPS]), rpe = model.num(f[F.RPE]);
        cells.push(`<span class="tl-cell" style="--h:${Math.round((kg || 0) / top * 100)}%"><b>${kg === null ? '—' : N(kg)}</b><small>${reps === null ? 'sin repes' : `×${reps}`}${rpe ? ` @${N(rpe)}` : ''}</small></span>`);
      }
      return `<div class="tl-prev-row${i ? '' : ' last'}" style="--cols:${cols}"><span class="tl-date">${shortDate(s.fecha)}</span>${cells.join('')}</div>`;
    }).join('')}</div>`;
  }
  function paintFocus(r) {
    const s = setState(r), d = draftFor(r), mark = model.marks(S.filas, r.ejercicio, today());
    const live = model.e1rm(d.kg, d.reps, d.rpe);
    const hint = s.done.length ? null : model.suggestion(model.sessions(S.filas, r.ejercicio, today())[0], r);
    const cells = [];
    for (let i = 1; i <= Math.max(r.series, ...s.done.map(f => f[F.SERIE]), s.complete ? 0 : s.active); i++) {
      const f = s.done.find(x => x[F.SERIE] === i);
      if (f) cells.push(`<button type="button" class="ok" data-edit="${E(f[F.ID])}" aria-label="Corregir serie ${i}">${E(f[F.REPS])}<small>${N(+f[F.KG])} kg${f[F.RPE] !== '' ? ` @${N(+f[F.RPE])}` : ''}</small></button>`);
      else if (s.skipped.includes(i)) cells.push(`<button type="button" class="skipped" data-unskip="${i}" aria-label="Recuperar serie ${i}">Saltada<small>Recuperar</small></button>`);
      else if (i === s.active) cells.push('<button type="button" class="now" disabled>Ahora</button>');
      else cells.push(`<button type="button" data-choose="${i}">Serie ${i}</button>`);
    }
    return `<section class="tl-focus">
      <div class="tl-focus-head"><div><small>${E(r.musculo)}${r.referencia ? ` · Referencia ${E(r.referencia)}` : ''}</small><h3>${E(r.ejercicio)}</h3>${r.ejercicio !== r.original ? `<small>Hoy en lugar de ${E(r.original)}</small>` : ''}</div><button type="button" class="tl-chip" data-act="swap">Cambiar</button></div>
      ${paintPrevious(r)}
      <div class="tl-under"><span>${mark.bestE1rm ? `Mejor e1RM ${N0(mark.bestE1rm)} kg · Máximo ${N(mark.bestKg)} kg` : ''}</span>${model.sessions(S.filas, r.ejercicio, today()).length > 2 ? `<button type="button" class="tl-link" data-act="more">${S.more ? 'Ver menos' : 'Ver más'}</button>` : ''}</div>
      ${hint ? `<button type="button" class="tl-hint" data-hint-kg="${hint.kg}" data-hint-reps="${hint.reps}">${E(hint.text)}</button>` : ''}
      <div class="tl-inputs">
        <div class="tl-input"><label for="tl-kg">Kilos</label><input id="tl-kg" inputmode="decimal" value="${N(d.kg).replace(/\./g, '')}" autocomplete="off"><div><button type="button" data-step="kg" data-v="${-r.salto}" aria-label="Quitar ${N(r.salto)} kilos">−</button><button type="button" data-step="kg" data-v="${r.salto}" aria-label="Añadir ${N(r.salto)} kilos">+</button></div></div>
        <div class="tl-input"><label for="tl-reps">Repes</label><input id="tl-reps" inputmode="numeric" value="${d.reps}" autocomplete="off"><div><button type="button" data-step="reps" data-v="-1" aria-label="Una repetición menos">−</button><button type="button" data-step="reps" data-v="1" aria-label="Una repetición más">+</button></div></div>
      </div>
      <fieldset class="tl-rpe"><legend>RPE <span>10 = última repe posible</span></legend><div>${model.RPES.map(v => `<button type="button" data-rpe="${v}" aria-pressed="${d.rpe === v}" style="--heat:${(v - 6) / 4}">${N(v)}</button>`).join('')}</div></fieldset>
      <p class="tl-readout" id="tl-readout">${paintReadout(live, mark)}</p>
      <button type="button" class="tl-primary" data-act="set">Serie ${s.active} hecha</button>
      <div class="tl-sets">${cells.join('')}</div>
      ${s.complete ? '<p class="tl-note">Ejercicio terminado. Si queda una más, adelante.</p>' : `<button type="button" class="tl-link center" data-act="skip">Saltar serie ${s.active}</button>`}
    </section>`;
  }
  function paintReadout(value, mark) {
    if (!value) return 'e1RM estimado: indica kilos y hasta 15 repes';
    const gap = mark.bestE1rm ? value - mark.bestE1rm : null;
    const rounded = gap === null ? null : Math.round(gap);
    return `e1RM <b>${N0(value)} kg</b>${rounded === null ? '' : rounded > 0 ? ` · <em>+${rounded} kg sobre tu mejor marca</em>` : rounded === 0 ? ' · igualas tu mejor marca' : ` · a ${-rounded} kg de tu mejor marca`}`;
  }
  const readNumber = (id, fallback) => { const node = document.getElementById(id); if (!node) return fallback; const v = parseFloat(String(node.value).replace(',', '.')); return Number.isFinite(v) && v >= 0 ? v : fallback; };
  function keepDraft() {
    const d = S.draft[S.ejercicio];
    if (!d || !document.getElementById('tl-kg')) return;
    d.kg = readNumber('tl-kg', d.kg); d.reps = readNumber('tl-reps', d.reps);
  }
  function advance(r) {
    if (!setState(r).complete) return;
    const next = exercises(S.dia).find(x => !setState(x).complete);
    if (next) S.ejercicio = next.ejercicio;
  }
  function doSet() {
    const r = exercises(S.dia).find(x => x.ejercicio === S.ejercicio), d = draftFor(r);
    const kg = readNumber('tl-kg', d.kg), reps = readNumber('tl-reps', d.reps), mark = model.marks(S.filas, r.ejercicio);
    const fila = { id: 'a' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7), fecha: today(), dia: S.dia, ejercicio: r.ejercicio, musculo: r.musculo, serie: d.serie, reps, kg, rpe: d.rpe, nota: '' };
    const records = model.recordsFor({ kg, reps, rpe: d.rpe }, mark);
    S.filas.push(toRow(fila));
    enqueue({ tipo: 'guardar', fila });
    delete S.chosen[r.ejercicio];
    advance(r);
    S.rest = { end: Date.now() + S.restSeconds * 1000, phrase: pick(PHRASES.rest), warned: false };
    wakeLock();
    paint();
    if (records.length) showLayer(`<div class="tl-card" role="dialog" aria-label="Récord"><small>RÉCORD DE ${records.map(x => x.toUpperCase()).join(' Y ')}</small><strong>${N(kg)} kg × ${reps}</strong><p>${E(r.ejercicio)}${d.rpe ? ` @${N(d.rpe)}` : ''}</p><p>${E(pick(PHRASES.record))}</p><button type="button" class="tl-primary" data-act="close">Seguir</button></div>`);
  }

  // ---------- Layers ----------
  function showLayer(html) { const layer = $('#tl-layer'); layer.innerHTML = html; layer.hidden = false; }
  function closeLayer() { const layer = $('#tl-layer'); if (layer) { layer.hidden = true; layer.innerHTML = ''; } S.editing = null; }
  function layerOrder() {
    const list = exercises(S.dia);
    showLayer(`<div class="tl-card plain" role="dialog" aria-label="Cambiar orden"><h3>Orden de hoy</h3><ol class="tl-order">${list.map((x, i) => `<li><span>${E(x.ejercicio)}</span><button type="button" data-move="${i}" data-v="-1" ${i ? '' : 'disabled'} aria-label="Subir">↑</button><button type="button" data-move="${i}" data-v="1" ${i < list.length - 1 ? '' : 'disabled'} aria-label="Bajar">↓</button></li>`).join('')}</ol><button type="button" class="tl-primary" data-act="close-order">Listo</button></div>`);
  }
  function layerSwap() {
    const r = exercises(S.dia).find(x => x.ejercicio === S.ejercicio), used = new Set(exercises(S.dia).map(x => x.ejercicio));
    const options = model.alternatives(S.alternativas, S.filas, r, used);
    showLayer(`<div class="tl-card plain" role="dialog" aria-label="Cambiar ejercicio"><h3>Cambiar por</h3><p class="tl-note">Solo hoy. Lo que apuntes se guarda en el ejercicio que elijas.</p><div class="tl-options">
      ${r.ejercicio !== r.original ? `<button type="button" class="back" data-swap="${E(r.original)}">Volver a ${E(r.original)}</button>` : ''}
      ${options.map(a => `<button type="button" data-swap="${E(a.ejercicio)}"><b>${E(a.ejercicio)}</b>${a.referencia ? `<small>${E(a.referencia)}</small>` : ''}</button>`).join('')}</div>
      <label class="tl-field" for="tl-other">O escribe otro</label><input class="tl-text" id="tl-other" autocomplete="off"><button type="button" class="tl-primary" data-act="swap-other">Usar este</button><button type="button" class="tl-link center" data-act="close">Cancelar</button></div>`);
  }
  function doSwap(name) {
    const value = name.trim();
    if (!value) return;
    const r = exercises(S.dia).find(x => x.ejercicio === S.ejercicio), p = plan(), slot = `${S.dia}|${r.original}`;
    if (value === r.original) delete p.cambios[slot]; else p.cambios[slot] = value;
    savePlan(); S.ejercicio = value; closeLayer(); paint();
  }
  function layerEdit(id) {
    const f = S.filas.find(x => x[F.ID] === id);
    if (!f) return;
    S.editing = id;
    showLayer(`<div class="tl-card plain" role="dialog" aria-label="Corregir serie"><h3>Serie ${f[F.SERIE]}</h3><p class="tl-note">${E(f[F.EJ])}</p><div class="tl-inputs"><div class="tl-input"><label for="tl-ekg">Kilos</label><input id="tl-ekg" inputmode="decimal" value="${E(f[F.KG])}"></div><div class="tl-input"><label for="tl-ereps">Repes</label><input id="tl-ereps" inputmode="numeric" value="${E(f[F.REPS])}"></div></div>
      <label class="tl-field" for="tl-erpe">RPE</label><input class="tl-text" id="tl-erpe" inputmode="decimal" value="${E(f[F.RPE])}"><label class="tl-field" for="tl-enote">Nota</label><input class="tl-text" id="tl-enote" value="${E(f[F.NOTA])}">
      <button type="button" class="tl-primary" data-act="edit-save">Guardar cambios</button><button type="button" class="tl-link center" data-act="edit-delete">Borrar serie</button><button type="button" class="tl-link center" data-act="close">Cancelar</button></div>`);
  }
  function saveEdit() {
    const f = S.filas.find(x => x[F.ID] === S.editing);
    if (!f) return closeLayer();
    f[F.KG] = readNumber('tl-ekg', +f[F.KG]); f[F.REPS] = readNumber('tl-ereps', +f[F.REPS]);
    const rpe = parseFloat(String(document.getElementById('tl-erpe').value).replace(',', '.'));
    f[F.RPE] = Number.isFinite(rpe) && rpe >= 1 && rpe <= 10 ? rpe : '';
    f[F.NOTA] = document.getElementById('tl-enote').value.trim();
    enqueue({ tipo: 'guardar', fila: { id: f[F.ID], fecha: f[F.FECHA], dia: f[F.DIA], ejercicio: f[F.EJ], musculo: f[F.MUSC], serie: f[F.SERIE], reps: f[F.REPS], kg: f[F.KG], rpe: f[F.RPE] === '' ? null : f[F.RPE], nota: f[F.NOTA] } });
    S.draft = {}; closeLayer(); paint();
  }
  function deleteEdit() {
    const id = S.editing;
    S.filas = S.filas.filter(x => x[F.ID] !== id);
    S.queue = S.queue.filter(op => !(op.tipo === 'guardar' && op.fila.id === id));
    enqueue({ tipo: 'borrar', id });
    S.draft = {}; closeLayer(); paint();
  }
  function finish() {
    const sum = model.summary(S.filas, today());
    S.rest = null; releaseLock();
    showLayer(`<div class="tl-card" role="dialog" aria-label="Entreno terminado"><small>SESIÓN CERRADA</small><strong>${N(Math.round(sum.tonnes * 10) / 10)} t</strong><p>${sum.sets} ${sum.sets === 1 ? 'serie' : 'series'} en ${sum.exercises} ${sum.exercises === 1 ? 'ejercicio' : 'ejercicios'}${sum.rpe ? `, RPE medio ${N(Math.round(sum.rpe * 10) / 10)}` : ''}.</p><p>${E(pick(PHRASES.done))}</p><button type="button" class="tl-primary" data-act="close-finish">Hecho</button></div>`);
    paintRest();
  }

  // ---------- Rest timer: stores the end time, so a sleeping phone still shows the truth ----------
  function paintRest() {
    const node = $('#tl-rest');
    if (!node) return;
    if (!S.rest || S.tab !== 'hoy' || !document.getElementById('training')?.classList.contains('active')) { node.hidden = true; return; }
    const left = Math.ceil((S.rest.end - Date.now()) / 1000), over = left <= 0;
    if (node.hidden || !node.firstChild) { node.innerHTML = `<b role="timer"></b><span></span><button type="button" data-act="rest-more" aria-label="Sumar 30 segundos">+30</button><button type="button" data-act="rest-stop">Listo</button>`; node.hidden = false; }
    node.querySelector('b').textContent = over ? 'Ya' : `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
    node.querySelector('span').textContent = over ? 'A por la siguiente.' : S.rest.phrase;
    node.classList.toggle('over', over);
    if (over && !S.rest.warned) { S.rest.warned = true; beep(); }
  }
  let audio = null, lock = null;
  function beep() {
    try {
      audio ||= new (window.AudioContext || window.webkitAudioContext)();
      [0, .18].forEach(t => { const o = audio.createOscillator(), g = audio.createGain(); o.frequency.value = 880; g.gain.setValueAtTime(.15, audio.currentTime + t); g.gain.exponentialRampToValueAtTime(.001, audio.currentTime + t + .15); o.connect(g).connect(audio.destination); o.start(audio.currentTime + t); o.stop(audio.currentTime + t + .16); });
    } catch { /* the visual cue remains */ }
  }
  async function wakeLock() { try { if ('wakeLock' in navigator && !lock) { lock = await navigator.wakeLock.request('screen'); lock.addEventListener('release', () => { lock = null; }); } } catch { /* optional */ } }
  function releaseLock() { lock?.release(); lock = null; }

  // ---------- Evolution ----------
  function paintEvolution() {
    const usable = new Map();
    for (const f of S.filas) { if (model.num(f[F.KG]) === null) continue; const e = usable.get(f[F.EJ]) || { name: f[F.EJ], muscle: f[F.MUSC], n: 0 }; e.n++; usable.set(f[F.EJ], e); }
    const list = [...usable.values()], muscles = [...new Set(list.map(e => e.muscle))].sort((a, b) => a.localeCompare(b, 'es'));
    if (!list.length) { $('#tl-body').innerHTML = '<p class="tl-note">Todavía no hay series con peso.</p>'; return; }
    const first = S.filas.reduce((m, f) => (f[F.FECHA] < m ? f[F.FECHA] : m), today());
    const logged = S.filas.filter(f => f[F.ORIGEN] === 'app').length;
    const lifts = ['Bench Press', 'Overhead Press', 'Deadlift TG', 'Sentadilla (Poco Recorrido altura: 11,17)', 'Lat Pulldown TGD'].filter(n => usable.has(n)).map(n => { const p = model.progression(S.filas, n); return p.length ? { n, a: p[0].value, b: Math.max(...p.map(x => x.value)) } : null; }).filter(Boolean);
    if (!S.muscle || (S.muscle !== 'weight' && !muscles.includes(S.muscle))) S.muscle = usable.get(S.chart)?.muscle || (muscles.includes('Pecho') ? 'Pecho' : muscles[0]);
    const inMuscle = list.filter(e => e.muscle === S.muscle).sort((a, b) => b.n - a.n);
    if (S.muscle !== 'weight' && (!S.chart || !inMuscle.some(e => e.name === S.chart))) S.chart = (S.muscle === 'Pecho' && usable.has('Bench Press')) ? 'Bench Press' : inMuscle[0].name;
    $('#tl-body').innerHTML = `<div class="tl-kpis"><article><small>DESDE</small><strong>${first.slice(0, 4)}</strong><span>${N0(S.filas.length)} registros, ${N0(logged)} apuntados aquí</span></article>${lifts.slice(0, 3).map(l => `<article><small>${E(l.n.split(' (')[0].toUpperCase())}</small><strong>${N0(l.b)}</strong><span>e1RM, desde ${N0(l.a)} kg</span></article>`).join('')}</div>
      <div class="tl-chips" role="group" aria-label="Músculo">${muscles.map(m => `<button type="button" data-muscle="${E(m)}" aria-pressed="${m === S.muscle}">${E(m)}</button>`).join('')}${S.bodyWeight.length ? `<button type="button" data-muscle="weight" aria-pressed="${S.muscle === 'weight'}">Peso corporal</button>` : ''}</div>
      ${S.muscle === 'weight' ? '' : `<div class="tl-chips minor" role="group" aria-label="Ejercicio">${inMuscle.slice(0, 14).map(e => `<button type="button" data-chart="${E(e.name)}" aria-pressed="${e.name === S.chart}">${E(e.name)}</button>`).join('')}</div>
      <div class="tl-metrics" role="group" aria-label="Métrica">${[['e1rm', 'e1RM'], ['kg', 'Kilos'], ['relative', '× peso corporal']].map(([id, label]) => `<button type="button" data-metric="${id}" aria-pressed="${S.metric === id}">${label}</button>`).join('')}</div>`}
      <div class="tl-chart-box" id="tl-chart-box"></div><div id="tl-log"></div>`;
    if (S.muscle === 'weight') {
      drawChart(S.bodyWeight.map(m => ({ fecha: m.date.slice(0, 10), value: m.trend ?? m.weight })), 'Peso corporal', 'kg', 'Tendencia de Libra');
      return;
    }
    const metric = S.metric === 'relative' && !S.bodyWeight.length ? 'e1rm' : S.metric;
    const points = model.progression(S.filas, S.chart, metric, S.bodyWeight);
    drawChart(points, S.chart, metric === 'relative' ? '× peso' : 'kg', metric === 'e1rm' ? 'e1RM estimado con Epley; el RPE suma las repes en reserva' : metric === 'kg' ? 'Máximo apuntado de cada fecha' : 'e1RM entre tu peso más cercano');
    const log = model.sessions(S.filas, S.chart).slice(0, 12);
    $('#tl-log').innerHTML = log.length ? `<div class="tl-log"><table><caption>Últimos registros</caption><tbody>${log.map(s => `<tr><td>${shortDate(s.fecha)}</td><td>${s.series.map(f => `${f[F.REPS] === '' ? '?' : f[F.REPS]}×${f[F.KG] === '' ? '?' : N(+f[F.KG])}${f[F.RPE] !== '' ? ` @${N(+f[F.RPE])}` : ''}`).join(', ')}</td><td>${E(s.series.find(f => f[F.NOTA])?.[F.NOTA] || '')}</td></tr>`).join('')}</tbody></table></div>` : '';
  }
  function drawChart(points, title, unit, method) {
    const box = $('#tl-chart-box');
    if (!points.length) { box.innerHTML = `<h3>${E(title)}</h3><p class="tl-note">No hay datos suficientes para esta métrica.</p>`; return; }
    const W = 720, H = 300, pl = 44, pr = 16, pt = 14, pb = 28, t = iso => Date.parse(iso);
    const x0 = t(points[0].fecha), x1 = Math.max(t(points.at(-1).fecha), x0 + 864e5);
    const values = points.map(p => p.value), low = Math.min(...values), high = Math.max(...values);
    const raw = Math.max((high - low) / 4, unit === '× peso' ? .1 : 1), step = [.05, .1, .25, .5, 1, 2, 5, 10, 20, 25, 50, 100].find(s => s >= raw) || 200;
    const y0 = Math.floor(low / step) * step, y1 = Math.max(Math.ceil(high / step) * step, y0 + step);
    const X = iso => pl + (t(iso) - x0) / (x1 - x0) * (W - pl - pr), Y = v => H - pb - (v - y0) / (y1 - y0) * (H - pb - pt);
    const grid = [];
    for (let v = y0; v <= y1 + 1e-9; v += step) grid.push(`<line x1="${pl}" x2="${W - pr}" y1="${Y(v)}" y2="${Y(v)}"/><text x="${pl - 8}" y="${Y(v) + 4}" text-anchor="end">${N(Math.round(v * 100) / 100)}</text>`);
    for (let a = +points[0].fecha.slice(0, 4) + 1; a <= +points.at(-1).fecha.slice(0, 4); a++) { const px = X(`${a}-01-01`); if (px > pl + 18 && px < W - pr - 18) grid.push(`<text x="${px}" y="${H - 8}" text-anchor="middle">${a}</text>`); }
    let peak = points[0]; points.forEach(p => { if (p.value > peak.value) peak = p; });
    const fmt = value => (unit === '× peso' ? N(Math.round(value * 100) / 100) : N(Math.round(value * 2) / 2));
    const lead = () => `<b>${fmt(points[0].value)} → ${fmt(peak.value)} ${unit}</b>${peak.value > points[0].value && points[0].value ? ` · +${N0((peak.value / points[0].value - 1) * 100)} %` : ''}`;
    box.innerHTML = `<h3>${E(title)}</h3><p class="tl-chart-lead" id="tl-chart-lead">${lead()}</p><div class="tl-chart" id="tl-chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${E(title)}: ${E(unit)} a lo largo del tiempo">${grid.join('')}<path d="${points.map((p, i) => `${i ? 'L' : 'M'}${X(p.fecha).toFixed(1)} ${Y(p.value).toFixed(1)}`).join('')}"/><circle class="peak" cx="${X(peak.fecha)}" cy="${Y(peak.value)}" r="5"/><line class="guide" id="tl-guide" y1="${pt}" y2="${H - pb}" visibility="hidden"/><circle class="probe" id="tl-probe" r="5" visibility="hidden"/></svg></div><p class="tl-method">${E(method)}</p>`;
    const chart = $('#tl-chart'), guide = $('#tl-guide'), probe = $('#tl-probe'), label = $('#tl-chart-lead');
    const move = event => {
      const r = chart.getBoundingClientRect(), px = (event.clientX - r.left) / r.width * W;
      const near = points.reduce((a, b) => (Math.abs(X(b.fecha) - px) < Math.abs(X(a.fecha) - px) ? b : a));
      for (const [k, v] of [['x1', X(near.fecha)], ['x2', X(near.fecha)]]) guide.setAttribute(k, v);
      guide.setAttribute('visibility', 'visible'); probe.setAttribute('cx', X(near.fecha)); probe.setAttribute('cy', Y(near.value)); probe.setAttribute('visibility', 'visible');
      const row = near.row;
      label.innerHTML = `<b>${fmt(near.value)} ${unit}</b> · ${shortDate(near.fecha)}${row ? ` · ${E(row[F.REPS])}×${E(row[F.KG])}${row[F.RPE] !== '' ? ` @${E(row[F.RPE])}` : ''}` : ''}`;
    };
    const leave = () => { guide.setAttribute('visibility', 'hidden'); probe.setAttribute('visibility', 'hidden'); label.innerHTML = lead(); };
    chart.addEventListener('pointerdown', move); chart.addEventListener('pointermove', move); chart.addEventListener('pointerleave', leave); chart.addEventListener('pointercancel', leave);
    chart.addEventListener('pointerup', event => { if (event.pointerType !== 'mouse') leave(); });
  }

  // ---------- Events ----------
  const onClick = async event => {
    const b = event.target.closest('button');
    if (!b) return;
    const d = b.dataset;
    if (d.tab) { keepDraft(); S.tab = d.tab; return paint(); }
    if (d.day) { keepDraft(); S.dia = +d.day; S.ejercicio = null; return paint(); }
    if (d.ex) { keepDraft(); S.ejercicio = d.ex; return paint(); }
    if (d.rpe) { keepDraft(); const v = +d.rpe, draft = S.draft[S.ejercicio]; draft.rpe = draft.rpe === v ? null : v; app.querySelectorAll('[data-rpe]').forEach(x => x.setAttribute('aria-pressed', String(+x.dataset.rpe === draft.rpe))); $('#tl-readout').innerHTML = paintReadout(model.e1rm(draft.kg, draft.reps, draft.rpe), model.marks(S.filas, S.ejercicio, today())); return undefined; }
    if (d.step) { const draft = S.draft[S.ejercicio]; keepDraft(); draft[d.step] = Math.max(0, Math.round((draft[d.step] + +d.v) * 100) / 100); return paint(); }
    if (d.hintKg) { const draft = S.draft[S.ejercicio]; draft.kg = +d.hintKg; draft.reps = +d.hintReps; return paint(); }
    if (d.choose) { keepDraft(); S.chosen[S.ejercicio] = +d.choose; return paint(); }
    if (d.unskip) { const slot = `${S.dia}|${S.ejercicio}`, p = plan(); p.saltos[slot] = (p.saltos[slot] || []).filter(n => n !== +d.unskip); S.chosen[S.ejercicio] = +d.unskip; savePlan(); return paint(); }
    if (d.edit) return layerEdit(d.edit);
    if (d.move) { const list = exercises(S.dia).map(x => x.original), [item] = list.splice(+d.move, 1); list.splice(+d.move + +d.v, 0, item); plan().orden[S.dia] = list; savePlan(); return layerOrder(); }
    if (d.swap) return doSwap(d.swap);
    if (d.muscle) { S.muscle = d.muscle; S.chart = null; return paint(); }
    if (d.chart) { S.chart = d.chart; return paint(); }
    if (d.metric) { S.metric = d.metric; return paint(); }
    switch (d.act) {
      case 'set': return doSet();
      case 'skip': { keepDraft(); const r = exercises(S.dia).find(x => x.ejercicio === S.ejercicio), slot = `${S.dia}|${r.ejercicio}`, p = plan(); p.saltos[slot] = (p.saltos[slot] || []).concat(setState(r).active); savePlan(); delete S.chosen[r.ejercicio]; advance(r); return paint(); }
      case 'more': keepDraft(); S.more = !S.more; return paint();
      case 'order': keepDraft(); return layerOrder();
      case 'close-order': closeLayer(); S.ejercicio = null; return paint();
      case 'swap': keepDraft(); return layerSwap();
      case 'swap-other': return doSwap(document.getElementById('tl-other').value);
      case 'edit-save': return saveEdit();
      case 'edit-delete': return deleteEdit();
      case 'close': return closeLayer();
      case 'finish': keepDraft(); return finish();
      case 'close-finish': closeLayer(); S.ejercicio = null; S.hello = ''; return paint();
      case 'rest-more': if (S.rest) { S.rest.end = Math.max(S.rest.end, Date.now()) + 30000; S.rest.warned = false; paintRest(); } return undefined;
      case 'rest-stop': S.rest = null; return paintRest();
      case 'connect': {
        b.disabled = true; b.textContent = 'Conectando…';
        try { await call('POST', { action: 'connect', code: document.getElementById('tl-code').value }); S.error = ''; await load(); }
        catch (error) { S.error = error.message === 'invalid_code' ? 'Ese código no tiene el formato esperado: URL que acaba en /exec, seguida de # y la clave.' : 'El Sheet no ha respondido con ese código. Comprueba la implementación y la clave.'; }
        return paint();
      }
      default: return undefined;
    }
  };
  app.addEventListener('click', onClick);
  portal.addEventListener('click', onClick);
  portal.addEventListener('focusin', event => { if (event.target.matches('.tl-input input')) event.target.select(); });
  app.addEventListener('focusin', event => { if (event.target.matches('.tl-input input')) event.target.select(); });
  app.addEventListener('input', event => {
    if (!event.target.matches('#tl-kg, #tl-reps')) return;
    keepDraft();
    const draft = S.draft[S.ejercicio];
    $('#tl-readout').innerHTML = paintReadout(model.e1rm(draft.kg, draft.reps, draft.rpe), model.marks(S.filas, S.ejercicio, today()));
  });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') { paintRest(); if (S.rest) wakeLock(); flush(); } });
  window.addEventListener('online', flush);
  setInterval(() => { if (S.rest) paintRest(); }, 500);
  setInterval(flush, 30000);

  window.TrainingLab = { async initialise(token) {
    csrf = token;
    try {
      model = await import('./training-model.js?v=20261103rpe'); F = model.F;
      S.queue = read('queue', []); S.plan = read('plan', null);
      const cache = read('cache', null);
      if (cache) { Object.assign(S, cache); S.connected = true; paint(); }
      await flush();
      try { await load(); } catch (error) {
        if (!cache && error.message !== 'session') throw error;
        S.error = 'Sin conexión con el Sheet: uso lo último guardado y subiré los cambios en cuanto vuelva.';
      }
      if (!document.activeElement?.matches?.('#tl-kg, #tl-reps, #tl-code, .tl-text')) { keepDraft(); paint(); }
    } catch {
      app.innerHTML = '<p class="eyebrow"><span></span> TRAINING LAB</p><h2>Entrenamiento</h2><p class="tl-error">No se ha podido leer el Sheet. Vuelve a intentarlo en un momento.</p>';
    }
  } };
})();
