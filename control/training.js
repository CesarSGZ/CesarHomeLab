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
    muscle: null, chart: null, measures: {}, strength: null, allEx: false, recentMore: false, more: false, editing: null, rest: null, restSeconds: 150, busy: false, error: '', hello: '', queue: [], plan: null, swaps: {}, kind: {}
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

  // ---------- Today's plan: skips, order and extras expire with the date; a swapped exercise stays until changed back ----------
  const saveSwaps = () => write('cambios', S.swaps);
  function plan() {
    if (!S.plan || S.plan.fecha !== today()) S.plan = { fecha: today(), saltos: {}, orden: {}, cambios: {}, extras: {} };
    S.plan.extras ||= {};
    return S.plan;
  }
  const savePlan = () => write('plan', S.plan);
  const days = () => { const m = new Map(); S.rutina.forEach(r => { if (!m.has(r.dia)) m.set(r.dia, r.nombre); }); return [...m].sort((a, b) => a[0] - b[0]).map(([dia, nombre]) => ({ dia, nombre })); };
  function exercises(dia) {
    const p = plan();
    const list = S.rutina.filter(r => r.dia === dia && r.ejercicio).sort((a, b) => a.orden - b.orden).map(r => {
      const swap = S.swaps[`${dia}|${r.ejercicio}`];
      if (!swap) return { ...r, original: r.ejercicio };
      const alt = S.alternativas.find(a => a.ejercicio === swap);
      return { ...r, original: r.ejercicio, ejercicio: swap, referencia: alt?.referencia || '', musculo: alt?.musculo || r.musculo };
    });
    for (const extra of p.extras[dia] || []) if (!list.some(x => x.ejercicio === extra.ejercicio)) list.push({ dia, orden: 99, series: 4, reps: 8, salto: 2.5, referencia: '', ...extra, original: extra.ejercicio });
    if (p.orden[dia]) { const at = x => { const i = p.orden[dia].indexOf(x.original); return i < 0 ? 99 : i; }; list.sort((a, b) => at(a) - at(b)); }
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
    for (const f of S.filas) if (f[F.ORIGEN] === 'app' && !model.isWalk(f) && (!last || f[F.FECHA] >= last[F.FECHA])) last = f;
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

  // ---------- You against yourself and against Marialópoda ----------
  const bw = () => { const m = S.bodyWeight.at(-1); return m ? m.trend ?? m.weight : 85; };
  const muscleName = group => model.MUSCLES.find(m => m.id === group)?.name || '';
  const mondayOf = iso => { const d = new Date(`${iso}T12:00:00Z`); return new Date(d.getTime() - ((d.getUTCDay() + 6) % 7) * 864e5).toISOString().slice(0, 10); };
  // Your side, from the rows on this phone, so a set logged a minute ago already counts.
  function mine() {
    const mon = mondayOf(today()), lifts = S.filas.filter(f => !model.isWalk(f) && f[F.FECHA] <= today());
    const walks = S.filas.filter(f => model.isWalk(f) && f[F.FECHA] >= mon && f[F.FECHA] <= today());
    return { ...(S.me || {}), week: new Set(lifts.filter(f => f[F.FECHA] >= mon).map(f => f[F.FECHA])).size, trainedToday: lifts.some(f => f[F.FECHA] === today()),
      walkWeek: Math.round(walks.reduce((t, f) => t + model.walkOf(f).km, 0) * 10) / 10, walkedToday: walks.some(f => f[F.FECHA] === today()) };
  }
  const veces = n => (n === 1 ? '1 entreno' : `${n} entrenos`);
  // Weights are not comparable between the two of you, so it is always each one against their own past.
  function rivalLines() {
    const R = S.rival, me = mine(), out = [];
    if (!R || R.today !== today()) return out;
    if (R.trainedToday && !me.trainedToday) out.push('Marialópoda ya ha entrenado hoy. Tú sigues leyendo esto.');
    if (R.trainedToday && me.trainedToday) out.push('Hoy habéis entrenado los dos. Empate técnico, de momento.');
    if (!R.trainedToday && me.trainedToday) out.push('Hoy tú sí y Marialópoda todavía no. Díselo, con cariño.');
    if (R.week > me.week) out.push(`Marialópoda lleva ${veces(R.week)} esta semana; tú, ${me.week}. Ejem.`);
    else if (R.week && R.week === me.week) out.push(`Empate a ${veces(R.week)} esta semana. Desempata.`);
    else if (me.week > R.week) out.push(`Vas ${me.week} a ${R.week} en entrenos esta semana. No te relajes.`);
    const rec = R.records?.[0];
    if (rec) out.push(`Marialópoda se ha superado en ${rec.ejercicio.toLowerCase()}: ${rec.reps} × ${N(rec.kg)} kg, un ${N(rec.mejora)} % por encima de su mejor marca.`);
    const mineRecs = me.records?.length || 0, hers = R.records?.length || 0;
    if (hers || mineRecs) out.push(`Marcas superadas en dos semanas: Marialópoda ${hers}, tú ${mineRecs}.${hers > mineRecs ? ' Te toca.' : ''}`);
    if (R.walkedToday && !me.walkedToday) out.push('Marialópoda ya ha hecho caminadora hoy. La cinta te espera.');
    if (R.walkWeek) out.push(`Marialópoda lleva ${N(R.walkWeek)} km de caminadora esta semana; tú, ${N(me.walkWeek)}.`);
    else if (me.walkWeek) out.push(`Caminadora esta semana: tú ${N(me.walkWeek)} km, Marialópoda 0. De momento.`);
    if (R.streak >= 3) out.push(`Marialópoda lleva ${R.streak} semanas seguidas entrenando${me.streak && me.streak < R.streak ? `; tú, ${me.streak}` : ''}.`);
    if (!R.trainedToday && R.lastDay && Date.parse(today()) - Date.parse(R.lastDay) >= 4 * 864e5) out.push(`Marialópoda no entrena desde el ${shortDate(R.lastDay)}. Ventaja tuya.`);
    return out;
  }
  function rivalStrip() {
    if (!S.rival && !read('rivalHidden', false)) return `<div class="tl-rival off"><small>PIQUE</small><span>Conecta el Sheet de Marialópoda y verás cómo va su semana frente a la tuya.</span><button type="button" class="tl-link" data-act="rival-connect">Conectar</button><button type="button" class="tl-link" data-act="rival-hide" aria-label="No mostrar">×</button></div>`;
    const lines = rivalLines();
    if (!lines.length) return '';
    S.rivalIndex = (S.rivalIndex ?? Math.floor(Math.random() * lines.length)) % lines.length;
    return `<button type="button" class="tl-rival" data-act="rival-next" aria-label="Siguiente pique"><small>PIQUE</small><span>${E(lines[S.rivalIndex])}</span></button>`;
  }

  // Your session three months ago, or, on a new machine, your muscle three months ago against other men.
  function paintDuel(r) {
    const rival = model.pastSelf(S.filas, r.ejercicio, today(), bw());
    if (!rival) return '';
    const best = model.bestToday(S.filas, r.ejercicio, today());
    if (rival.kind === 'exercise') {
      const win = best > rival.value;
      return `<p class="tl-duel${win ? ' win' : ''}">${win ? `Vas por delante de tu yo del ${shortDate(rival.fecha)} (${rival.reps} × ${N(rival.kg)} kg)` : `Tu yo del ${shortDate(rival.fecha)} hizo ${rival.reps} × ${N(rival.kg)} kg. Hoy, a por él.`}</p>`;
    }
    const now = model.liftPercentile(r.ejercicio, best, bw(), S.filas, today()), win = now && !now.provisional && now.pct > rival.pct;
    return `<p class="tl-duel${win ? ' win' : ''}">${win ? `En esta máquina tu ${rival.name.toLowerCase()} ya supera al de hace tres meses: ${now.pct} % de los hombres frente a ${rival.pct} %.` : `Máquina nueva, mismo rival: hace tres meses tu ${rival.name.toLowerCase()} superaba al ${rival.pct} % de los hombres. Iguálalo aquí.`}</p>`;
  }
  // Against other men, so any machine or variant tells you how good the set is.
  function standing(name, value) {
    const p = model.liftPercentile(name, value, bw(), S.filas, today());
    if (!p) return '';
    // A machine still being calibrated is worth the muscle's level: no promise of a jump until it has two sessions.
    if (p.provisional) return ` · máquina nueva: cuenta como tu nivel actual (${p.pct} %) hasta tener dos sesiones`;
    const group = model.muscleOf(name), level = group && model.muscleLevel(S.filas, group, bw(), today());
    return ` · superas al ${p.reliability === 'alta' ? '' : '≈'}${p.pct} %${level && p.pct > level.pct ? ` <em>por encima de tu nivel de ${E(muscleName(group).toLowerCase())} (${level.pct} %)</em>` : ''}`;
  }

  function layerRival(message) {
    showLayer(`<div class="tl-card plain" role="dialog" aria-label="Conectar el pique"><h3>Pique con Marialópoda</h3>
      <p class="tl-note">Pega el código de conexión de Marialópoda: la URL de su Apps Script que acaba en /exec, seguida de # y su clave. Se guarda en el servidor y solo se usa para leer su resumen: días entrenados, récords frente a sí misma y caminadora. Ella verá lo mismo de ti en su app.</p>
      <label class="tl-field" for="tl-rival-code">Código de Marialópoda</label><textarea class="tl-text" id="tl-rival-code" autocomplete="off" spellcheck="false" style="height:90px"></textarea>
      ${message ? `<p class="tl-error" role="status">${E(message)}</p>` : ''}
      <button type="button" class="tl-primary" data-act="rival-save">Conectar</button><button type="button" class="tl-link center" data-act="close">Cancelar</button></div>`);
  }
  async function saveRival(button) {
    button.disabled = true; button.textContent = 'Comprobando…';
    try { await call('POST', { action: 'connect-rival', code: document.getElementById('tl-rival-code').value }); }
    catch (error) { return layerRival(error.message === 'invalid_code' ? 'Ese código no tiene el formato esperado: URL que acaba en /exec, # y la clave.' : 'Su Sheet no ha respondido con ese código.'); }
    closeLayer();
    try { await load(); } catch { /* shown on the next load */ }
    return paint();
  }

  // ---------- Strength tests ----------
  function layerTests(only, reliable) {
    const strength = model.strengthByMuscle(S.filas, bw(), today());
    const groups = model.MUSCLES.filter(m => model.TESTS.some(t => t.group === m.id) && (!only || m.id === only))
      .map(m => ({ ...m, s: strength.find(x => x.id === m.id) }))
      .sort((a, b) => (!a.s.rated || a.s.stale ? 0 : 1) - (!b.s.rated || b.s.stale ? 0 : 1));
    showLayer(`<div class="tl-card plain" role="dialog" aria-label="Test de fuerza"><h3>Test de fuerza</h3>
      <p class="tl-note">${reliable ? 'Para que este músculo sea más fiable hace falta un ejercicio que pese igual en cualquier gimnasio: barra o mancuernas. Las máquinas y las poleas se calibran con ellos.' : 'Las máquinas pesan distinto en cada gimnasio, así que la comparación fiable sale de barra y mancuernas; las máquinas y poleas se calibran con el resto del músculo.'} Elige uno y se añade a tu entreno de hoy con 4 series. Calienta en las dos primeras y en las dos últimas busca tu tope para 3 a 6 repes. Con tu mejor serie calculo tu 1RM y a cuántos hombres de tu peso superas.</p>
      ${groups.map(g => `<section class="tl-option-group"><div class="tl-option-head"><h4>${E(g.name)}</h4><small class="tl-test-state">${!g.s.rated ? 'sin datos' : g.s.stale ? `último dato ${shortDate(g.s.stale)}` : `superas al ${g.s.rated.pct} %`}</small></div>
        <div class="tl-options">${model.TESTS.filter(t => t.group === g.id).sort((a, b) => model.isFreeWeight(b.ejercicio) - model.isFreeWeight(a.ejercicio)).map(t => `<button type="button" data-test="${E(t.ejercicio)}"><b>${E(t.ejercicio)}</b><small>${model.isFreeWeight(t.ejercicio) ? 'Peso libre, fiabilidad alta. ' : 'Calibrada. '}${E(t.how)}</small></button>`).join('')}</div></section>`).join('')}
      <button type="button" class="tl-link center" data-act="close">Cancelar</button></div>`);
  }
  function startTest(name) {
    const t = model.TESTS.find(x => x.ejercicio === name), p = plan();
    p.extras[S.dia] = (p.extras[S.dia] || []).filter(x => x.ejercicio !== name).concat({ ejercicio: name, musculo: t.musculo, series: 4, reps: 5, salto: 2.5, referencia: '', test: true, how: t.how });
    savePlan(); S.tab = 'hoy'; S.ejercicio = name; closeLayer(); paint();
    app.scrollIntoView({ block: 'start' });
  }
  const testBanner = r => (r.test ? `<div class="tl-test"><b>Test de fuerza</b><span>${E(r.how || '')} Series 1 y 2: calentamiento, unas 10 y 5 repes ligeras. Series 3 y 4: tu tope para 3 a 6 repes (RPE 9 o 10). Cuenta la mejor.</span></div>` : '');
  function testResult(r) {
    const best = model.bestToday(S.filas, r.ejercicio, today()), p = model.liftPercentile(r.ejercicio, best, bw(), S.filas, today()), group = model.muscleOf(r.ejercicio);
    if (!p) return '';
    return `<div class="tl-card" role="dialog" aria-label="Resultado del test"><small>TEST DE ${E(muscleName(group).toUpperCase())}</small><strong>${p.pct} %</strong>
      <p>Superas al ${p.pct} % de los hombres de tu peso en ${E(r.ejercicio)}: 1RM estimado de ${N0(best)} kg, nivel ${p.level < 0 ? 'por debajo de principiante' : model.LEVELS[p.level].toLowerCase()}.</p><p>${p.reliability === 'alta' ? 'Peso libre: es la medida más fiable y ya cuenta en tu mapa de fuerza.' : p.provisional ? 'Es una máquina nueva: hasta su segunda sesión vale lo mismo que tu nivel actual.' : 'Máquina calibrada con el resto del músculo: ya cuenta en tu mapa de fuerza.'}</p><button type="button" class="tl-primary" data-act="close">Seguir</button></div>`;
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
    for (const op of S.queue) { if (op.tipo === 'borrar') deleted.add(op.id); else if (op.tipo === 'guardar') pending.set(op.fila.id, toRow(op.fila)); }
    S.filas = serverRows.filter(f => !deleted.has(f[F.ID]) && !pending.has(f[F.ID])).concat([...pending.values()]);
  }
  async function load() {
    const data = await call('GET');
    S.connected = data.connected;
    if (!data.connected) return;
    S.rutina = data.rutina; S.alternativas = data.alternativas; S.bodyWeight = data.bodyWeight; S.rival = data.rival || null; S.me = data.me || null;
    merge(data.filas);
    for (const op of S.queue) if (op.tipo === 'alternativa' && !S.alternativas.some(a => a.ejercicio === op.ejercicio)) S.alternativas.push({ musculo: op.musculo, ejercicio: op.ejercicio, referencia: op.referencia });
    write('cache', { rutina: S.rutina, alternativas: S.alternativas, filas: S.filas, bodyWeight: S.bodyWeight, rival: S.rival, me: S.me });
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
    write('cache', { rutina: S.rutina, alternativas: S.alternativas, filas: S.filas, bodyWeight: S.bodyWeight, rival: S.rival, me: S.me });
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
    $('#tl-body').innerHTML = `${rivalStrip()}${dayRow}<div class="tl-layout"><div>${paintFocus(r)}</div><aside class="tl-side">
      <div class="tl-side-head"><h3>Hoy</h3><span><button type="button" class="tl-link" data-act="new">Añadir</button><button type="button" class="tl-link" data-act="order">Cambiar orden</button></span></div>
      <ul class="tl-list">${list.map(x => { const s = setState(x); return `<li class="${s.complete ? 'done' : ''}${x === r ? ' current' : ''}"><button type="button" data-ex="${E(x.ejercicio)}"><span>${E(x.ejercicio)}</span><span class="tl-dots" aria-label="${s.done.length} de ${x.series} series">${Array.from({ length: x.series }, (_, i) => `<i class="${s.done.some(f => f[F.SERIE] === i + 1) ? 'ok' : s.skipped.includes(i + 1) ? 'skip' : ''}"></i>`).join('')}</span></button></li>`; }).join('')}</ul>
      ${anyDone ? '<button type="button" class="tl-secondary" data-act="finish">Terminar entreno</button>' : ''}
      ${paintWalkToday()}
      ${week.length ? `<h3>Series duras, 7 días</h3><ul class="tl-week">${week.map(([m, n]) => `<li><span>${E(m)}</span><b>${n}</b><i style="width:${Math.min(100, n / Math.max(...week.map(w => w[1])) * 100)}%"></i></li>`).join('')}</ul>` : ''}
    </aside></div>`;
  }
  function paintPrevious(r) {
    const s = setState(r), all = model.sessions(S.filas, r.ejercicio, s.complete && s.done.length ? null : today());
    if (!all.length) return '<p class="tl-note">Sin historial. Esta primera serie marca la referencia.</p>';
    const visible = all.slice(0, S.more ? 6 : 2);
    const top = Math.max(...visible.flatMap(s => s.series.map(f => model.num(f[F.KG]) || 0)), 1);
    const cols = Math.max(r.series, ...visible.map(s => s.series.length));
    return `<div class="tl-prev">${visible.map((s, i) => {
      const note = s.series.find(f => f[F.ORIGEN] !== 'app')?.[F.NOTA], roles = model.setRoles(s.series), work = roles.filter(x => x === 'work').length;
      const cells = [];
      for (let c = 0; c < cols; c++) {
        const f = s.series[c];
        if (!f) { cells.push(note && c === s.series.length ? `<span class="tl-prev-note" style="grid-column:span ${cols - c}">${E(note)}</span>` : note ? '' : '<span class="tl-cell empty"></span>'); if (note && c === s.series.length) break; continue; }
        const kg = model.num(f[F.KG]), reps = model.num(f[F.REPS]), rpe = model.num(f[F.RPE]);
        const role = roles[c] === 'drop' ? ' drop' : roles[c] === 'warmup' ? ' warm' : '';
        cells.push(`<span class="tl-cell${role}" style="--h:${Math.round((kg || 0) / top * 100)}%"${role ? ` title="${roles[c] === 'drop' ? 'Dropset' : 'Calentamiento'}"` : ''}><b>${kg === null ? '—' : N(kg)}</b><small>${reps === null ? 'sin repes' : `×${reps}`}${rpe ? ` @${N(rpe)}` : ''}${roles[c] === 'drop' ? ' drop' : ''}</small></span>`);
      }
      return `<div class="tl-prev-row${i ? '' : ' last'}" style="--cols:${cols}"><span class="tl-date">${s.fecha === today() ? 'Hoy' : shortDate(s.fecha)}${s.fecha !== today() && note === undefined && work < r.series - 1 ? '<small>corta</small>' : ''}</span>${cells.join('')}</div>`;
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
      <div class="tl-focus-head"><div><small>${E(r.musculo)}${r.referencia ? ` · Referencia ${E(r.referencia)}` : ''}</small><h3>${E(r.ejercicio)}</h3>${r.ejercicio !== r.original ? `<small>En lugar de ${E(r.original)}</small>` : ''}<button type="button" class="tl-link tl-rename" data-rename="${E(r.ejercicio)}">Corregir nombre</button></div><button type="button" class="tl-chip" data-act="swap">Cambiar</button></div>
      ${testBanner(r)}${paintPrevious(r)}
      <div class="tl-under"><span>${mark.bestE1rm ? `Mejor e1RM ${N0(mark.bestE1rm)} kg · Máximo ${N(mark.bestKg)} kg` : ''}</span>${model.sessions(S.filas, r.ejercicio, today()).length > 2 ? `<button type="button" class="tl-link" data-act="more">${S.more ? 'Ver menos' : 'Ver más'}</button>` : ''}</div>
      ${paintDuel(r)}
      ${hint ? `<button type="button" class="tl-hint" data-hint-kg="${hint.kg}" data-hint-reps="${hint.reps}">${E(hint.text)}</button>` : ''}
      <div class="tl-inputs">
        <div class="tl-input"><label for="tl-kg">Kilos</label><input id="tl-kg" inputmode="decimal" value="${N(d.kg).replace(/\./g, '')}" autocomplete="off"><div><button type="button" data-step="kg" data-v="${-r.salto}" aria-label="Quitar ${N(r.salto)} kilos">−</button><button type="button" data-step="kg" data-v="${r.salto}" aria-label="Añadir ${N(r.salto)} kilos">+</button></div></div>
        <div class="tl-input"><label for="tl-reps">Repes</label><input id="tl-reps" inputmode="numeric" value="${d.reps}" autocomplete="off"><div><button type="button" data-step="reps" data-v="-1" aria-label="Una repetición menos">−</button><button type="button" data-step="reps" data-v="1" aria-label="Una repetición más">+</button></div></div>
      </div>
      <fieldset class="tl-rpe"><legend>RPE <span>10 = última repe posible</span></legend><div>${model.RPES.map(v => `<button type="button" data-rpe="${v}" aria-pressed="${d.rpe === v}" style="--heat:${(v - 6) / 4}">${N(v)}</button>`).join('')}</div></fieldset>
      <p class="tl-readout" id="tl-readout">${paintReadout(live, mark)}</p>
      ${s.complete ? `<div class="tl-kind" role="group" aria-label="Qué es esta serie"><button type="button" data-kind="extra" aria-pressed="${S.kind[r.ejercicio] !== 'drop'}">Serie extra</button><button type="button" data-kind="drop" aria-pressed="${S.kind[r.ejercicio] === 'drop'}">Dropset</button></div>` : ''}
      <button type="button" class="tl-primary" data-act="set">${s.complete && S.kind[r.ejercicio] === 'drop' ? 'Dropset hecho' : `Serie ${s.active} hecha`}</button>
      <div class="tl-sets">${cells.join('')}</div>
      ${s.complete ? `<p class="tl-note">${s.done.length > r.series ? `Llevas ${s.done.length} series, ${s.done.length - r.series} más de lo previsto: volumen que suma.` : 'Ejercicio terminado.'} ¿Otra? Márcala como serie extra o como dropset: el dropset no baja tu media ni cuenta como bajón.</p>` : `<button type="button" class="tl-link center" data-act="skip">Saltar serie ${s.active}</button>`}
    </section>`;
  }
  function paintReadout(value, mark) {
    if (!value) return 'e1RM estimado: indica kilos y hasta 15 repes';
    const gap = mark.bestE1rm ? value - mark.bestE1rm : null;
    const rounded = gap === null ? null : Math.round(gap);
    return `e1RM <b>${N0(value)} kg</b>${rounded === null ? '' : rounded > 0 ? ` · <em>+${rounded} kg sobre tu mejor marca</em>` : rounded === 0 ? ' · igualas tu mejor marca' : ` · a ${-rounded} kg de tu mejor marca`}${standing(S.ejercicio, value)}`;
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
    const fila = { id: 'a' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7), fecha: today(), dia: S.dia, ejercicio: r.ejercicio, musculo: r.musculo, serie: d.serie, reps, kg, rpe: d.rpe, nota: setState(r).complete && S.kind[r.ejercicio] === 'drop' ? 'Dropset' : '' };
    const records = model.recordsFor({ kg, reps, rpe: d.rpe }, mark);
    const group = model.muscleOf(r.ejercicio), lift = model.liftPercentile(r.ejercicio, model.e1rm(kg, reps, d.rpe), bw(), S.filas, today()), set = lift && !lift.provisional ? lift : null;
    // The year's best before today; today's own earlier sets only raise the bar, so a warm-up is never "the record to beat".
    const before = set && group ? model.muscleRecord(S.filas, group, bw(), today()) : null, earlier = set && group ? model.bestOfMuscle(S.filas, group, bw(), today(), today()) : null;
    const muscleBest = set && before && set.pct > before.pct && (!earlier || set.pct > earlier.pct) ? { group, now: set.pct, before } : null;
    S.filas.push(toRow(fila));
    enqueue({ tipo: 'guardar', fila });
    delete S.chosen[r.ejercicio]; delete S.kind[r.ejercicio];
    const finished = setState(r).complete, testDone = r.test && finished && testResult(r);
    const from = document.querySelector('#training-app [data-act="set"]')?.getBoundingClientRect();
    advance(r);
    S.rest = { end: Date.now() + S.restSeconds * 1000, phrase: pick(PHRASES.rest), warned: false };
    wakeLock();
    paint();
    // The reward: the new set pops in; a finished exercise lights up in the list and gets a longer chime.
    const big = records.length || muscleBest;
    chime(big ? 'record' : finished ? 'exercise' : 'set');
    buzz(big || finished ? [18, 50, 28] : 14);
    sparks(from, big ? 18 : finished ? 14 : 8);
    pop($(`.tl-sets [data-edit="${CSS.escape(fila.id)}"]`));
    if (finished) pop($(`.tl-list [data-ex="${CSS.escape(r.ejercicio)}"]`)?.closest('li'));
    const muscleText = muscleBest ? `<p>Tu mejor ${E(muscleName(group).toLowerCase())} del año frente a otros: superas al ${muscleBest.now} %, antes ${muscleBest.before.pct} % con ${E(muscleBest.before.name)}.</p>` : '';
    if (testDone) showLayer(testDone.replace('<p>Ya cuenta', `${muscleText}<p>Ya cuenta`));
    else if (records.length || muscleBest) showLayer(`<div class="tl-card" role="dialog" aria-label="Récord"><small>${records.length ? `RÉCORD DE ${records.map(x => x.toUpperCase()).join(' Y ')}` : `RÉCORD DE ${E(muscleName(group).toUpperCase())}`}</small><strong>${N(kg)} kg × ${reps}</strong><p>${E(r.ejercicio)}${d.rpe ? ` @${N(d.rpe)}` : ''}</p>${muscleText}<p>${E(pick(PHRASES.record))}</p><button type="button" class="tl-primary" data-act="close">Seguir</button></div>`);
  }

  // ---------- Layers ----------
  function showLayer(html) { const layer = $('#tl-layer'); layer.innerHTML = html; layer.hidden = false; }
  function closeLayer() { const layer = $('#tl-layer'); if (layer) { layer.hidden = true; layer.innerHTML = ''; } S.editing = null; S.renaming = null; }
  function layerOrder() {
    const list = exercises(S.dia);
    showLayer(`<div class="tl-card plain" role="dialog" aria-label="Cambiar orden"><h3>Orden de hoy</h3><ol class="tl-order">${list.map((x, i) => `<li><span>${E(x.ejercicio)}</span><button type="button" data-move="${i}" data-v="-1" ${i ? '' : 'disabled'} aria-label="Subir">↑</button><button type="button" data-move="${i}" data-v="1" ${i < list.length - 1 ? '' : 'disabled'} aria-label="Bajar">↓</button></li>`).join('')}</ol><button type="button" class="tl-primary" data-act="close-order">Listo</button></div>`);
  }
  function layerSwap() {
    const r = exercises(S.dia).find(x => x.ejercicio === S.ejercicio), used = new Set(exercises(S.dia).map(x => x.ejercicio));
    const current = model.nameParts(r.ejercicio).base;
    const groups = model.groupByExercise(model.alternatives(S.alternativas, S.filas, r, used), current);
    showLayer(`<div class="tl-card plain" role="dialog" aria-label="Cambiar ejercicio"><h3>Cambiar por</h3><p class="tl-note">Se queda en este día hasta que lo vuelvas a cambiar. Lo que apuntes se guarda en el ejercicio que elijas.</p>${r.ejercicio !== r.original ? `<div class="tl-options"><button type="button" class="back" data-swap="${E(r.original)}">Volver a ${E(r.original)}</button></div>` : ''}
      ${groups.map(g => `<section class="tl-option-group"><div class="tl-option-head"><h4>${E(g.base)}</h4><button type="button" class="tl-link" data-new-base="${E(g.base)}">Otra máquina o gimnasio</button></div>
        ${g.items.length ? `<div class="tl-options">${g.items.map(a => `<button type="button" data-swap="${E(a.ejercicio)}"><b>${E(a.tags.join(' · ') || (/dumbbell|mancuerna|barra|barbell/i.test(g.base) ? 'Peso libre' : 'Sin máquina'))}</b>${a.referencia ? `<small>${E(a.referencia)}</small>` : ''}</button>`).join('')}</div>` : ''}</section>`).join('')}
      <button type="button" class="tl-primary" data-act="new">Crear ejercicio nuevo</button><button type="button" class="tl-link center" data-act="close">Cancelar</button></div>`);
  }
  // A new gym or machine: the name decides the history, so each combination starts its own.
  const allNames = () => new Set([...S.alternativas.map(a => a.ejercicio), ...S.rutina.map(r => r.ejercicio), ...S.filas.map(f => f[F.EJ])].filter(Boolean));
  function layerNew(chosenBase) {
    const current = exercises(S.dia).find(x => x.ejercicio === S.ejercicio);
    const { bases, machines, gyms } = model.knownParts(allNames());
    const muscles = [...new Set([...S.rutina.map(r => r.musculo), ...S.alternativas.map(a => a.musculo)].filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'));
    const base = chosenBase || model.nameParts(current?.ejercicio || '').base;
    const muscle = S.alternativas.find(a => model.nameParts(a.ejercicio).base === base)?.musculo || current?.musculo;
    S.newVariant = '';
    showLayer(`<div class="tl-card plain" role="dialog" aria-label="Ejercicio nuevo"><h3>Ejercicio nuevo</h3><p class="tl-note">Cada máquina, gimnasio o modalidad lleva sus propios pesos e historial. TG es Technogym, TGD Technogym Discos (en Dreamfit) y HS Hammer Strength.</p>
      <label class="tl-field" for="tl-new-base">Ejercicio</label><input class="tl-text" id="tl-new-base" list="tl-new-bases" value="${E(base)}" autocomplete="off"><datalist id="tl-new-bases">${bases.map(b => `<option value="${E(b)}"></option>`).join('')}</datalist>
      <label class="tl-field" for="tl-new-machine">Máquina o marca</label><input class="tl-text" id="tl-new-machine" list="tl-new-machines" placeholder="TGD, HS, Impulse..." autocomplete="off"><datalist id="tl-new-machines">${machines.map(b => `<option value="${E(b)}"></option>`).join('')}</datalist>
      <label class="tl-field" for="tl-new-gym">Gimnasio</label><input class="tl-text" id="tl-new-gym" list="tl-new-gyms" placeholder="Dreamfit, Vivagym Lluc, Basic Fit Getafe..." autocomplete="off"><datalist id="tl-new-gyms">${gyms.map(b => `<option value="${E(b)}"></option>`).join('')}</datalist>
      <span class="tl-field">Modalidad</span><div class="tl-chips tl-new-variants" role="group" aria-label="Modalidad">${['Normal', 'Unilateral', 'Poco recorrido', 'Con parada', 'Agarre neutro'].map(v => `<button type="button" data-variant="${v === 'Normal' ? '' : v}" aria-pressed="${v === 'Normal'}">${v}</button>`).join('')}</div>
      <input class="tl-text" id="tl-new-variant" placeholder="U otra: altura 5, goma roja..." autocomplete="off" aria-label="Otra modalidad">
      <label class="tl-field" for="tl-new-muscle">Músculo</label><select class="tl-text" id="tl-new-muscle">${muscles.map(m => `<option${m === muscle ? ' selected' : ''}>${E(m)}</option>`).join('')}</select>
      <p class="tl-new-name" id="tl-new-name" role="status"></p>
      ${current ? `<button type="button" class="tl-primary" data-act="new-swap">Sustituir ${E(current.ejercicio)} hoy</button>` : ''}
      <button type="button" class="tl-secondary" data-act="new-add">Añadirlo a hoy sin sustituir</button><button type="button" class="tl-link center" data-act="close">Cancelar</button></div>`);
    previewNew();
  }
  // Written with other accents or capitals, it is still the exercise that already exists.
  const newName = () => {
    const name = model.exerciseName(document.getElementById('tl-new-base').value, document.getElementById('tl-new-machine').value, model.gymFor(document.getElementById('tl-new-machine').value, document.getElementById('tl-new-gym').value), document.getElementById('tl-new-variant').value || S.newVariant);
    return model.findExercise(allNames(), name) || name;
  };
  function previewNew() {
    const node = document.getElementById('tl-new-name');
    if (!node) return;
    const name = newName(), rows = S.filas.filter(f => f[F.EJ] === name).length, exists = allNames().has(name);
    node.innerHTML = name ? `<b>${E(name)}</b>${exists ? ` ya existe${rows ? `, con ${rows} registros` : ''}: seguirás su historial.` : ' empieza historial propio.'}` : 'Escribe el nombre del ejercicio.';
  }
  function createExercise(swap) {
    const name = newName();
    if (!document.getElementById('tl-new-base').value.trim()) return previewNew();
    const musculo = document.getElementById('tl-new-muscle').value;
    if (!S.alternativas.some(a => a.ejercicio === name)) {
      S.alternativas.push({ musculo, ejercicio: name, referencia: '' });
      enqueue({ tipo: 'alternativa', musculo, ejercicio: name, referencia: '' });
    }
    if (swap) return doSwap(name);
    const p = plan();
    p.extras[S.dia] = (p.extras[S.dia] || []).filter(x => x.ejercicio !== name).concat({ ejercicio: name, musculo });
    savePlan(); S.ejercicio = name; closeLayer(); return paint();
  }
  function doSwap(name) {
    const value = name.trim();
    if (!value) return;
    const r = exercises(S.dia).find(x => x.ejercicio === S.ejercicio), p = plan(), slot = `${S.dia}|${r.original}`;
    if (value === r.original) delete S.swaps[slot]; else S.swaps[slot] = value;
    delete p.cambios[slot];
    savePlan(); saveSwaps(); S.ejercicio = value; closeLayer(); paint();
  }
  // ---------- Fixing a name: rewrites its rows, the routine and the alternatives in the Sheet ----------
  function layerRename(name) {
    const parts = model.splitName(name), { bases, machines, gyms, variants } = model.knownParts(allNames());
    const list = (id, items) => `<datalist id="${id}">${items.map(b => `<option value="${E(b)}"></option>`).join('')}</datalist>`;
    S.renaming = name;
    showLayer(`<div class="tl-card plain" role="dialog" aria-label="Corregir nombre"><h3>Corregir nombre</h3><p class="tl-note">${E(name)}</p>
      <label class="tl-field" for="tl-rn-base">Ejercicio</label><input class="tl-text tl-rn" id="tl-rn-base" list="tl-rn-bases" value="${E(parts.base)}" autocomplete="off">${list('tl-rn-bases', bases)}
      <label class="tl-field" for="tl-rn-machine">Máquina o marca</label><input class="tl-text tl-rn" id="tl-rn-machine" list="tl-rn-machines" value="${E(parts.machine)}" placeholder="TGD, HS, Impulse..." autocomplete="off">${list('tl-rn-machines', machines)}
      <label class="tl-field" for="tl-rn-gym">Gimnasio</label><input class="tl-text tl-rn" id="tl-rn-gym" list="tl-rn-gyms" value="${E(parts.gym)}" placeholder="Dreamfit, Vivagym Lluc, Basic Fit Getafe..." autocomplete="off">${list('tl-rn-gyms', gyms)}
      <label class="tl-field" for="tl-rn-variant">Modalidad</label><input class="tl-text tl-rn" id="tl-rn-variant" list="tl-rn-variants" value="${E(parts.variant)}" placeholder="Unilateral, Poco recorrido..." autocomplete="off">${list('tl-rn-variants', variants)}
      <p class="tl-new-name" id="tl-rn-name" role="status"></p>
      <button type="button" class="tl-primary" data-act="rename-save">Cambiar el nombre</button><button type="button" class="tl-link center" data-act="close">Cancelar</button></div>`);
    previewRename();
  }
  const renameTarget = () => {
    const [base, machine, gym, variant] = ['base', 'machine', 'gym', 'variant'].map(k => document.getElementById(`tl-rn-${k}`).value);
    const name = model.exerciseName(base, machine, model.gymFor(machine, gym), variant);
    return model.findExercise([...allNames()].filter(n => n !== S.renaming), name) || name;
  };
  function previewRename(message) {
    const node = document.getElementById('tl-rn-name');
    if (!node) return;
    const to = renameTarget(), rows = S.filas.filter(f => f[F.EJ] === S.renaming).length, merged = S.filas.filter(f => f[F.EJ] === to).length;
    const exists = to !== S.renaming && allNames().has(to);
    node.innerHTML = message ? `<span class="tl-error">${E(message)}</span>` : !document.getElementById('tl-rn-base').value.trim() ? 'Escribe el nombre del ejercicio.'
      : to === S.renaming ? 'Es el mismo nombre.'
        : `<b>${E(to)}</b>. ${rows === 1 ? 'Cambia 1 registro' : `Cambian sus ${N0(rows)} registros`}, la rutina y las alternativas.${exists ? ` Ya existe${merged ? `, con ${N0(merged)} registros` : ''}: se juntarán los dos historiales.` : ''}`;
  }
  async function saveRename(button) {
    const from = S.renaming, to = renameTarget();
    if (!document.getElementById('tl-rn-base').value.trim() || to === from) return previewRename();
    button.disabled = true; button.textContent = 'Cambiando en el Sheet…';
    await flush();
    if (S.queue.length) { button.disabled = false; button.textContent = 'Cambiar el nombre'; return previewRename('Hay series sin subir y sin conexión no puedo cambiar el nombre. Prueba cuando vuelva la red.'); }
    try { await call('POST', { action: 'rename', from, to }); }
    catch { button.disabled = false; button.textContent = 'Cambiar el nombre'; return previewRename('El Sheet no ha respondido. No se ha cambiado nada; vuelve a intentarlo.'); }
    // The same change here, so the screen is right before the Sheet is read again.
    const swap = n => (n === from ? to : n);
    S.filas.forEach(f => { f[F.EJ] = swap(f[F.EJ]); });
    S.rutina = S.rutina.map(r => ({ ...r, ejercicio: swap(r.ejercicio) }));
    S.alternativas = S.alternativas.map(a => ({ ...a, ejercicio: swap(a.ejercicio) })).filter((a, i, l) => l.findIndex(b => b.ejercicio === a.ejercicio) === i);
    const p = plan();
    S.swaps = Object.fromEntries(Object.entries(S.swaps).map(([k, v]) => [k.replace(`|${from}`, `|${to}`), swap(v)]).filter(([k, v]) => !k.endsWith(`|${v}`)));
    saveSwaps();
    Object.values(p.extras).forEach(list => list.forEach(x => { x.ejercicio = swap(x.ejercicio); }));
    Object.keys(p.orden).forEach(d => { p.orden[d] = p.orden[d].map(swap); });
    savePlan();
    if (S.measures[from]) { S.measures[to] ||= S.measures[from]; delete S.measures[from]; write('measures', S.measures); }
    if (S.draft[from]) { S.draft[to] = S.draft[from]; delete S.draft[from]; }
    S.ejercicio = swap(S.ejercicio); S.chart = swap(S.chart);
    write('cache', { rutina: S.rutina, alternativas: S.alternativas, filas: S.filas, bodyWeight: S.bodyWeight, rival: S.rival, me: S.me });
    closeLayer(); paint();
    try { await load(); paint(); } catch { /* the local copy already has the new name */ }
    return undefined;
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
  const walkLine = () => { const w = walksToday().map(model.walkOf); if (!w.length) return ''; const min = w.reduce((a, x) => a + x.min, 0), km = w.reduce((a, x) => a + x.km, 0); return `<p>Y ${N(min)} min de caminadora, ${N(Math.round(km * 100) / 100)} km.</p>`; };
  // The summary: the big number, a few facts, then what went better than before.
  function finish() {
    const planned = Object.fromEntries(exercises(S.dia).map(x => [x.ejercicio, x.series]));
    const rep = model.workoutReport(S.filas, today(), planned), me = mine();
    const ahead = [...new Set(S.filas.filter(f => f[F.FECHA] === today() && !model.isWalk(f)).map(f => f[F.EJ]))]
      .filter(n => { const past = model.pastSelf(S.filas, n, today(), bw()); return past?.kind === 'exercise' && model.bestToday(S.filas, n, today()) > past.value; }).length;
    const change = rep.previous ? rep.tonnes / rep.previous.tonnes - 1 : null;
    const wins = [
      ...rep.records.slice(0, 3).map(x => `<li class="win"><b>Récord</b> ${E(x.name)}: +${N0(x.gain)} kg de e1RM</li>`),
      ...(rep.records.length > 3 ? [`<li class="win"><b>+${rep.records.length - 3}</b> récords más</li>`] : []),
      // Above double, the last time was usually a half-logged day: not a fair comparison.
      // Only a rise: a short day should not sour the card.
      ...(change !== null && change >= .03 && change <= 1 ? [`<li class="win"><b>+${N0(change * 100)} %</b> de volumen frente al Día ${E(S.dia)} del ${shortDate(rep.previous.fecha)}</li>`] : []),
      ...(ahead ? [`<li class="win"><b>${ahead}</b> ${ahead === 1 ? 'ejercicio' : 'ejercicios'} por delante de tu yo de hace tres meses</li>`] : []),
      ...rep.extra.slice(0, 2).map(x => `<li class="win"><b>+${x.work - x.planned}</b> ${x.work - x.planned === 1 ? 'serie extra' : 'series extra'} en ${E(x.name)}: volumen que suma</li>`),
      ...rep.drops.slice(0, 2).map(x => `<li class="win"><b>Dropset</b> en ${E(x.name)}: buen remate, sin bajar tu media</li>`),
      ...rep.short.slice(0, 2).map(x => `<li><b>${x.work} de ${x.planned}</b> series en ${E(x.name)}: no cuenta como bajón. La próxima, a por todas</li>`),
      ...(rep.muscles.length ? [`<li><b>Trabajado</b> ${E(rep.muscles.join(', ').toLowerCase())}</li>`] : [])
    ];
    const lead = rep.records.length ? `${rep.records.length === 1 ? 'Un récord' : `${rep.records.length} récords`} hoy. Así se hace.` : change > .03 && change <= 1 ? 'Más volumen que la última vez. Sube la cuesta.' : ahead ? 'Hoy le has ganado a tu yo del pasado.' : pick(PHRASES.done);
    S.rest = null; releaseLock();
    showLayer(`<div class="tl-card tl-finish" role="dialog" aria-label="Entreno terminado"><small>SESIÓN CERRADA</small><strong>${N(Math.round(rep.tonnes * 10) / 10)} t</strong><p class="tl-finish-lead">${E(lead)}</p>
      <div class="tl-finish-stats"><span><b>${rep.sets}</b>series</span><span><b>${rep.exercises}</b>${rep.exercises === 1 ? 'ejercicio' : 'ejercicios'}</span>${rep.minutes ? `<span><b>${rep.minutes}</b>min</span>` : ''}${rep.rpe ? `<span><b>${N(Math.round(rep.rpe * 10) / 10)}</b>RPE medio</span>` : ''}</div>
      ${wins.length ? `<ul class="tl-finish-wins">${wins.join('')}</ul>` : ''}
      ${walkLine()}<p>Esta semana llevas ${veces(me.week)}${S.rival && S.rival.today === today() ? `; Marialópoda, ${veces(S.rival.week)}` : ''}.</p>
      <button type="button" class="tl-primary" data-act="close-finish">Hecho</button></div>`);
    paintRest();
    chime('finish'); buzz([20, 60, 20, 60, 40]); confetti();
  }

  // ---------- Treadmill: any day, without touching the routine ----------
  const walksToday = () => S.filas.filter(f => model.isWalk(f) && f[F.FECHA] === today());
  function paintWalkToday() {
    const list = walksToday();
    return `<div class="tl-walk"><div class="tl-side-head"><h3>Caminadora</h3><button type="button" class="tl-link" data-act="walk">${list.length ? 'Añadir' : 'Apuntar'}</button></div>
      ${list.map(f => { const w = model.walkOf(f); return `<button type="button" class="tl-walk-item" data-walk="${E(f[F.ID])}"><b>${N(w.min)} min</b><span>${N(w.vel)} km/h · ${N(w.inc)}° · ${N(Math.round(w.km * 100) / 100)} km</span></button>`; }).join('')}</div>`;
  }
  const walkField = (id, label, value, step) => `<div class="tl-input"><label for="${id}">${label}</label><input id="${id}" inputmode="decimal" value="${N(value)}" autocomplete="off"><div><button type="button" data-wstep="${id}" data-v="${-step}" aria-label="Bajar ${label.toLowerCase()}">−</button><button type="button" data-wstep="${id}" data-v="${step}" aria-label="Subir ${label.toLowerCase()}">+</button></div></div>`;
  function layerWalk(id) {
    const f = id ? S.filas.find(x => x[F.ID] === id) : null;
    const lastWalk = S.filas.filter(model.isWalk).sort((a, b) => (a[F.FECHA] < b[F.FECHA] ? -1 : 1)).at(-1);
    const v = f ? model.walkOf(f) : lastWalk ? model.walkOf(lastWalk) : model.WALK_DEFAULT;
    S.editing = f ? id : null;
    showLayer(`<div class="tl-card plain" role="dialog" aria-label="Caminadora"><h3>Caminadora</h3><p class="tl-note">Se guarda en el Registro como un ejercicio más, sin kilos: no suma toneladas ni series duras.</p>
      <div class="tl-inputs three">${walkField('tl-winc', 'Inclinación', v.inc, 0.5)}${walkField('tl-wvel', 'km/h', v.vel, 0.1)}${walkField('tl-wmin', 'Minutos', v.min, 5)}</div>
      <p class="tl-readout" id="tl-wkm"></p>
      <button type="button" class="tl-primary" data-act="walk-save">${f ? 'Guardar cambios' : 'Apuntar caminadora'}</button>
      ${f ? '<button type="button" class="tl-link center" data-act="edit-delete">Borrar</button>' : ''}<button type="button" class="tl-link center" data-act="close">Cancelar</button></div>`);
    walkKm();
  }
  function walkKm() {
    const node = document.getElementById('tl-wkm');
    if (node) node.innerHTML = `Son unos <b>${N(Math.round(readNumber('tl-wvel', 0) * readNumber('tl-wmin', 0) / 60 * 100) / 100)} km</b>`;
  }
  function saveWalk() {
    const min = readNumber('tl-wmin', 0), vel = readNumber('tl-wvel', 0), inc = readNumber('tl-winc', 0);
    if (!min) return document.getElementById('tl-wmin').focus();
    const nota = model.walkNote(vel, inc), f = S.filas.find(x => x[F.ID] === S.editing);
    let fila;
    if (f) { f[F.REPS] = min; f[F.NOTA] = nota; fila = { id: f[F.ID], fecha: f[F.FECHA], dia: f[F.DIA], ejercicio: model.WALK, musculo: 'Cardio', serie: f[F.SERIE], reps: min, kg: null, rpe: null, nota }; }
    else { fila = { id: 'a' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7), fecha: today(), dia: S.dia, ejercicio: model.WALK, musculo: 'Cardio', serie: walksToday().length + 1, reps: min, kg: null, rpe: null, nota }; S.filas.push(toRow(fila)); }
    enqueue({ tipo: 'guardar', fila });
    closeLayer(); paint();
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
  // ---------- Small rewards: a soft chime, a tap and a spark; bigger when an exercise or the session is done ----------
  const NOTES = {
    set: [[784, 0], [1175, .07]],
    exercise: [[659, 0], [831, .08], [988, .16], [1319, .25]],
    record: [[784, 0], [988, .08], [1175, .16], [1568, .26], [1976, .36]],
    finish: [[523, 0], [659, .13], [784, .26], [1047, .4], [784, .56], [1047, .7]]
  };
  function chime(kind) {
    try {
      audio ||= new (window.AudioContext || window.webkitAudioContext)();
      if (audio.state === 'suspended') audio.resume();
      const now = audio.currentTime, long = kind === 'finish' ? .5 : .3;
      for (const [freq, at] of NOTES[kind]) {
        const o = audio.createOscillator(), g = audio.createGain();
        o.type = 'triangle'; o.frequency.value = freq;
        g.gain.setValueAtTime(.0001, now + at); g.gain.exponentialRampToValueAtTime(.13, now + at + .012); g.gain.exponentialRampToValueAtTime(.0001, now + at + long);
        o.connect(g).connect(audio.destination); o.start(now + at); o.stop(now + at + long + .02);
      }
    } catch { /* silent phone: the visual reward stays */ }
  }
  const buzz = pattern => { try { navigator.vibrate?.(pattern); } catch { /* not on iOS */ } };
  const still = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  function pop(node) {
    if (!node || still()) return;
    node.classList.remove('tl-pop'); void node.offsetWidth; node.classList.add('tl-pop');
    node.addEventListener('animationend', () => node.classList.remove('tl-pop'), { once: true });
  }
  function sparks(rect, count) {
    if (!rect || still()) return;
    const x = rect.left + rect.width / 2, y = rect.top + rect.height / 2;
    for (let i = 0; i < count; i++) {
      const s = document.createElement('i'), a = (i / count) * Math.PI * 2 + Math.random() * .4, d = 34 + Math.random() * 30;
      s.className = 'tl-spark'; s.style.left = `${x}px`; s.style.top = `${y}px`;
      s.style.setProperty('--dx', `${Math.cos(a) * d}px`); s.style.setProperty('--dy', `${Math.sin(a) * d}px`);
      if (i % 3 === 0) s.style.background = 'var(--tl-hot)';
      s.addEventListener('animationend', () => s.remove());
      portal.append(s);
    }
  }
  function confetti() {
    if (still()) return;
    const colors = ['var(--tl-accent)', 'var(--tl-hot)', 'var(--tl-ink)', '#7fc8ff'];
    for (let i = 0; i < 42; i++) {
      const c = document.createElement('i');
      c.className = 'tl-confetti';
      c.style.left = `${Math.random() * 100}vw`; c.style.background = colors[i % colors.length];
      c.style.setProperty('--dx', `${(Math.random() - .5) * 120}px`); c.style.setProperty('--r', `${(Math.random() - .5) * 900}deg`);
      c.style.setProperty('--t', `${1.6 + Math.random() * 1.2}s`); c.style.setProperty('--d', `${Math.random() * .35}s`);
      c.addEventListener('animationend', () => c.remove());
      portal.append(c);
    }
  }
  async function wakeLock() { try { if ('wakeLock' in navigator && !lock) { lock = await navigator.wakeLock.request('screen'); lock.addEventListener('release', () => { lock = null; }); } } catch { /* optional */ } }
  function releaseLock() { lock?.release(); lock = null; }

  // ---------- Evolution ----------
  const bodyNow = () => { const m = S.bodyWeight.at(-1); return m ? { kg: m.trend ?? m.weight, fecha: m.date.slice(0, 10) } : null; };
  const pct = value => `${N0(value)} %`;
  const setsText = series => {
    const reps = series.map(f => f[F.REPS]).filter(v => v !== '');
    const kgs = [...new Set(series.map(f => model.num(f[F.KG])).filter(v => v > 0))];
    const rpes = series.map(f => model.num(f[F.RPE])).filter(Boolean);
    return `${reps.join('·')}${reps.length ? ' repes' : ''}${kgs.length ? ` × ${kgs.map(N).join('/')} kg` : ''}${rpes.length ? ` @${N(Math.max(...rpes))}` : ''}`;
  };
  function paintEvolution() {
    const rows = S.filas.filter(f => !model.isWalk(f)), routine = new Set(S.rutina.map(r => r.ejercicio));
    const usable = new Map();
    for (const f of rows) {
      if (model.num(f[F.KG]) === null) continue;
      const group = model.muscleOf(f[F.EJ], f[F.MUSC]);
      if (!group) continue;
      const e = usable.get(f[F.EJ]) || { name: f[F.EJ], group, n: 0, dates: new Set() };
      e.n++; e.dates.add(f[F.FECHA]); usable.set(f[F.EJ], e);
    }
    const list = [...usable.values()];
    if (!list.length) { $('#tl-body').innerHTML = '<p class="tl-note">Todavía no hay series con peso.</p>'; return; }
    const first = rows.reduce((m, f) => (f[F.FECHA] < m ? f[F.FECHA] : m), today());
    const logged = rows.filter(f => f[F.ORIGEN] === 'app').length;
    const lifts = ['Bench Press · Barra Olímpica 20kg', 'Overhead Press · Barra Olímpica 20kg', 'Deadlift · TG · Dreamfit', 'Sentadilla · Barra Olímpica 20kg · Poco recorrido', 'Lat Pulldown · TGD · Dreamfit'].filter(n => usable.has(n)).map(n => { const p = model.progression(rows, n); return p.length ? { n, a: p[0].value, b: Math.max(...p.map(x => x.value)) } : null; }).filter(Boolean);
    const groups = model.MUSCLES.filter(m => list.some(e => e.group === m.id));
    const extra = [...(S.filas.some(model.isWalk) ? [['walk', 'Caminadora']] : []), ...(S.bodyWeight.length ? [['weight', 'Peso corporal']] : [])];
    if (!groups.some(g => g.id === S.muscle) && !extra.some(([id]) => id === S.muscle)) S.muscle = usable.get(S.chart)?.group || (groups.some(g => g.id === 'pecho') ? 'pecho' : groups[0].id);
    const inMuscle = list.filter(e => e.group === S.muscle).sort((a, b) => b.dates.size - a.dates.size);
    const main = inMuscle.filter(e => e.dates.size >= 3 || routine.has(e.name)), hidden = inMuscle.length - main.length;
    const shown = S.allEx ? inMuscle : main;
    if (S.chart !== '*' && !inMuscle.some(e => e.name === S.chart)) S.chart = '*';
    const isGroup = groups.some(g => g.id === S.muscle), measure = S.chart === '*' ? null : measureOf(S.chart);
    $('#tl-body').innerHTML = `<div class="tl-kpis"><article><small>DESDE</small><strong>${first.slice(0, 4)}</strong><span>${N0(rows.length)} registros, ${N0(logged)} apuntados aquí</span></article>${lifts.slice(0, 3).map(l => `<article><small>${E(l.n.split(' · ')[0].toUpperCase())}</small><strong>${N0(l.b)}</strong><span>e1RM, desde ${N0(l.a)} kg</span></article>`).join('')}</div>
      ${paintHero(rows, first)}
      ${paintStale()}
      ${paintHabits()}
      ${paintYear()}
      <h3 class="tl-section">Por músculo, desde el principio</h3>
      <div class="tl-chips" role="group" aria-label="Músculo">${groups.map(g => `<button type="button" data-muscle="${g.id}" aria-pressed="${g.id === S.muscle}">${E(g.name)}</button>`).join('')}${extra.map(([id, label]) => `<button type="button" data-muscle="${id}" aria-pressed="${S.muscle === id}">${label}</button>`).join('')}</div>
      ${isGroup ? `<div class="tl-chips minor" role="group" aria-label="Ejercicio"><button type="button" data-chart="*" aria-pressed="${S.chart === '*'}">Todo el músculo</button>${shown.map(e => `<button type="button" data-chart="${E(e.name)}" aria-pressed="${e.name === S.chart}">${E(e.name)}</button>`).join('')}${hidden ? `<button type="button" class="more" data-act="all-ex">${S.allEx ? 'Solo los habituales' : `+${hidden} sueltos`}</button>` : ''}</div>` : ''}
      ${measure ? `<div class="tl-metrics" role="group" aria-label="Qué medir">${measuresOf().map(id => `<button type="button" data-measure="${id}" aria-pressed="${measure === id}">${model.MEASURES[id].name}</button>`).join('')}</div>` : ''}
      <div class="tl-chart-box" id="tl-chart-box"></div><div id="tl-log"></div>
      ${paintStrength()}
      ${paintRecent()}`;
    if (S.muscle === 'weight') return drawChart(S.bodyWeight.map(m => ({ fecha: m.date.slice(0, 10), value: m.trend ?? m.weight })), 'Peso corporal', 'kg', 'Tendencia de Libra');
    if (S.muscle === 'walk') return paintWalkEvolution();
    if (S.chart === '*') {
      const group = groups.find(g => g.id === S.muscle), points = model.muscleHistory(rows, S.muscle, S.bodyWeight, bodyNow()?.kg || 85)
        .map(p => ({ fecha: p.fecha, value: p.value, detail: p.rated.tests.map(t => `${t.name} ${N0(t.value)} kg`).join(', ') }));
      drawChart(points, group.name, '%', 'Hombres a los que superas, trimestre a trimestre: mediana de sus ejercicios frente a los baremos de Strength Level. Sirve para seguir el músculo aunque cambies de máquina.');
      $('#tl-log').innerHTML = points.length ? '' : `<p class="tl-note">Ninguno de sus ejercicios tiene baremo: elige uno arriba para ver su evolución.</p>`;
      return undefined;
    }
    // A short session is left out of averages and volume: fewer sets is not a weaker day.
    const all = model.sessionMeasures(rows, S.chart, S.bodyWeight), points = all.filter(s => s[measure] > 0 && !(s.short && measure !== 'rm' && measure !== 'relative')).map(s => ({ fecha: s.fecha, value: s[measure], detail: `${setsText(s.series)}${s.drops ? ` · ${s.drops === 1 ? 'dropset' : `${s.drops} drops`}` : ''}${s.short ? ' · sesión corta' : s.extra ? ' · series extra' : ''}` }));
    const M = model.MEASURES[measure];
    drawChart(points, S.chart, M.unit, M.text);
    $('#tl-chart-box h3').insertAdjacentHTML('afterend', `<button type="button" class="tl-link tl-rename" data-rename="${E(S.chart)}">Corregir nombre</button>`);
    const log = all.slice(-12).reverse();
    $('#tl-log').innerHTML = log.length ? `<div class="tl-log"><table><caption>Últimas sesiones</caption><tbody>${log.map(s => `<tr><td>${dateLabel(s.fecha)}</td><td>${s.series.map(f => `${f[F.REPS] === '' ? '?' : f[F.REPS]}×${f[F.KG] === '' ? '?' : N(+f[F.KG])}${f[F.RPE] !== '' ? ` @${N(+f[F.RPE])}` : ''}`).join(', ')}</td><td>${s[measure] ? `${fmtUnit(s[measure], M.unit)}` : ''}</td><td>${E(s.series.find(f => f[F.NOTA])?.[F.NOTA] || '')}</td></tr>`).join('')}</tbody></table></div>` : '';
    return undefined;
  }
  // The default suits the exercise: e1RM for compound lifts, kg × reps for isolation; a choice is remembered per exercise.
  const measuresOf = () => ['rm', 'volumen', 'medio', ...(S.bodyWeight.length ? ['relative'] : [])];
  const measureOf = name => (measuresOf().includes(S.measures[name]) ? S.measures[name] : model.defaultMeasure(name));
  const fmtUnit = (value, unit) => (unit === '× peso' ? `${N(Math.round(value * 100) / 100)} ×` : unit === '%' ? pct(value) : `${N(value >= 100 ? Math.round(value) : Math.round(value * 10) / 10)} ${unit}`);
  const quarter = iso => `${Math.ceil(+iso.slice(5, 7) / 3)}.º trimestre de ${iso.slice(0, 4)}`;
  const dateLabel = iso => (iso === today() ? 'Hoy' : shortDate(iso));

  function paintHero(rows, first) {
    const weeks = Math.max(1, Math.round((Date.parse(today()) - Date.parse(first)) / 6048e5));
    const tonnes = rows.reduce((t, f) => t + (model.num(f[F.KG]) || 0) * (model.num(f[F.REPS]) || 0), 0) / 1000;
    S.agoList = model.yearHighlights(model.yearReview(S.filas, today(), bw()), today());
    return `<p class="tl-hero"><b>${N0(weeks)} semanas</b> entrenando, <b>${N0(rows.length)} registros</b> y más de <b>${N0(tonnes)} toneladas</b> movidas.</p>${agoCard()}`;
  }
  function agoCard() {
    const list = S.agoList || [];
    if (!list.length) return '';
    const i = (S.agoIndex || 0) % list.length, h = list[i];
    const body = h.kind === 'muscle'
      ? `Hace un año superabas al ${h.before} % de los hombres en ${E(h.name.toLowerCase())}.<strong>Ahora, al ${h.now} %.</strong>`
      : `Hace un año, en ${E(h.name)}, tu ${model.MEASURES[h.measure].name} era ${fmtUnit(h.before, model.MEASURES[h.measure].unit)}.<strong>Ahora, ${fmtUnit(h.now, model.MEASURES[h.measure].unit)}.</strong>`;
    return `<button type="button" class="tl-ago" data-act="ago"${list.length > 1 ? ' aria-label="Ver otra mejora"' : ''}>${body}${list.length > 1 ? `<small>Toca para ver otra · ${i + 1} de ${list.length}</small>` : ''}</button>`;
  }
  // How complete the last four weeks were against the routine, with a comment instead of a verdict.
  function paintHabits() {
    const planned = {};
    for (const r of S.rutina) if (r.ejercicio) { planned[r.ejercicio] = r.series; const swap = S.swaps[`${r.dia}|${r.ejercicio}`]; if (swap) planned[swap] = r.series; }
    const h = model.setHabits(S.filas, today(), planned);
    if (h.sessions < 4) return '';
    const share = Math.round(h.full / h.sessions * 100), names = list => [...new Set(list.map(x => x.name.split(' · ')[0]))];
    const repeated = Object.entries(h.short.reduce((m, x) => ({ ...m, [x.name]: (m[x.name] || 0) + 1 }), {})).filter(([, n]) => n >= 2).map(([n]) => n.split(' · ')[0]);
    const lines = [
      share >= 85 ? `Has completado el ${share} % de los ejercicios con todas sus series. Constancia de manual.` : share >= 65 ? `Has completado el ${share} % de los ejercicios con todas sus series. Bien, con margen.` : `Solo el ${share} % de los ejercicios llegó a todas sus series. No pasa nada por un día flojo, pero si se repite, quizá la rutina pide menos series o más descanso.`,
      ...(repeated.length ? [`Se quedan cortos a menudo: ${E(repeated.slice(0, 3).join(', '))}. Si es pereza, empieza por ellos; si no llegas, baja un poco el peso.`] : []),
      ...(h.extra.length ? [`Series extra en ${E(names(h.extra).slice(0, 3).join(', '))}: buena señal si llegas fresco.`] : []),
      ...(h.drops.length ? [`${h.drops.length === 1 ? 'Un dropset' : `${h.drops.length} dropsets`} este mes: no bajan tu media ni cuentan como bajón.`] : [])
    ];
    return `<section class="tl-habits"><h3 class="tl-section">Tus series, últimas 4 semanas</h3><div class="tl-habits-bar"><i style="width:${share}%"></i></div><ul>${lines.map(l => `<li>${l}</li>`).join('')}</ul></section>`;
  }
  // Which muscles have waited longest: tap one to open its chart below.
  function paintStale() {
    const list = model.staleMuscles(S.filas, today()).slice(0, 6);
    if (!list.length) return '';
    const when = d => (d === 0 ? 'hoy' : d === 1 ? 'ayer' : `hace ${d} días`);
    return `<section class="tl-stale"><h3 class="tl-section">Lo que más tiempo llevas sin entrenar</h3>
      <div class="tl-stale-list">${list.map(m => `<button type="button" class="${m.days >= 14 ? 'hot' : m.days >= 7 ? 'warm' : ''}"${m.open ? ` data-muscle="${m.open}"` : ' disabled'}><b>${m.days}</b><span>${E(m.name)}<small>${when(m.days)}</small></span></button>`).join('')}</div></section>`;
  }
  function paintYear() {
    const now = bodyNow(), y = model.yearReview(S.filas, today(), now?.kg || 85);
    const ups = y.changes.filter(c => c.change >= 0.02), downs = y.changes.filter(c => c.change <= -0.02);
    const muscles = y.muscles.filter(m => m.now !== m.before);
    if (!y.changes.length && !muscles.length) return '';
    const diff = y.year.days - y.previous.days;
    const change = c => `${c.change > 0 ? '+' : '−'}${N0(Math.abs(c.change) * 100)} %`;
    const item = (c, cls) => `<li class="${cls}"><b>${change(c)}</b><span>${E(c.name)}<small>${model.MEASURES[c.measure].name}: de ${fmtUnit(c.before, model.MEASURES[c.measure].unit)} a ${fmtUnit(c.now, model.MEASURES[c.measure].unit)}</small></span></li>`;
    return `<section class="tl-year"><h3 class="tl-section">Tu último año</h3>
      <p class="tl-year-lead"><b>${y.year.days} días</b> de entreno en los últimos 12 meses${y.previous.days ? `, ${diff > 0 ? `${diff} más que` : diff < 0 ? `${-diff} menos que` : 'los mismos que'} en los 12 anteriores` : ''}.</p>
      <div class="tl-year-grid">
        ${ups.length || downs.length ? `<div><h4>Ejercicios</h4><ul class="tl-review">${ups.slice(0, 6).map(c => item(c, 'up')).join('')}${downs.slice(-3).reverse().map(c => item(c, 'down')).join('')}</ul></div>` : ''}
        ${muscles.length ? `<div><h4>Frente a otros hombres</h4><ul class="tl-review">${muscles.slice(0, 8).map(m => `<li class="${m.now > m.before ? 'up' : 'down'}"><b>${m.now > m.before ? '+' : '−'}${Math.abs(m.now - m.before)}</b><span>${E(m.name)}<small>Superas al ${pct(m.now)}; hace un año, al ${pct(m.before)}</small></span></li>`).join('')}</ul></div>` : ''}
      </div>
      <p class="tl-method">Lo mejor de los últimos 3 meses frente a lo mejor de hace un año, con la misma máquina. Los músculos solo comparan ejercicios hechos en los dos años, en puntos de porcentaje.</p></section>`;
  }

  function paintStrength() {
    const now = bodyNow(), kg = now?.kg || 85, list = model.strengthByMuscle(S.filas, kg, today());
    const rated = list.filter(m => m.rated).sort((a, b) => b.rated.pct - a.rated.pct), none = list.filter(m => !m.rated);
    if (!rated.length) return '';
    const level = l => (l < 0 ? 'Por debajo de principiante' : model.LEVELS[l]);
    return `<section class="tl-strength"><div class="tl-section-head"><h3 class="tl-section">Frente a otros hombres</h3><button type="button" class="tl-chip" data-act="tests">Hacer un test</button></div>
      <p class="tl-note">Cada músculo, por lo mejor del último año. Comparado con los hombres de ${now ? `tu peso (${N(Math.round(kg * 10) / 10)} kg en Libra)` : 'unos 85 kg'} que registran sus marcas en Strength Level.</p>
      <ul class="tl-str">${rated.map(m => `<li class="${S.strength === m.id ? 'open' : ''}"><button type="button" data-strength="${m.id}" aria-expanded="${S.strength === m.id}">
        <span class="tl-str-name">${E(m.name)}<small class="tl-rel ${m.rated.reliability}">${model.RELIABILITY[m.rated.reliability]}${m.stale ? ` · último dato ${shortDate(m.stale)}` : ''}</small></span><span class="tl-str-level lv${m.rated.level + 1}">${level(m.rated.level)}</span><b>${pct(m.rated.pct)}</b>
        <span class="tl-str-bar" aria-hidden="true"><i class="lv${m.rated.level + 1}" style="width:${m.rated.pct}%"></i>${model.TIERS.map(t => `<em style="left:${t}%"></em>`).join('')}</span></button>
        ${S.strength === m.id ? `<ul class="tl-str-detail">${m.rated.tests.map(t => { const note = model.standardFor(t.name)?.note; const kind = t.reliability === 'alta' ? 'peso libre' : t.provisional ? 'máquina nueva: vale tu nivel hasta la 2.ª sesión' : t.reliability === 'media' ? 'máquina calibrada' : 'máquina sin nada con qué compararla'; return `<li><span>${E(t.name)}<small class="tl-rel ${t.reliability}">${kind}</small></span><span>${N0(t.logged)} kg e1RM${note ? ` (${note})` : ''}, ${shortDate(t.fecha)}</span><b>${pct(t.pct)}</b></li>`; }).join('')}${model.TESTS.some(t => t.group === m.id) ? `<li class="tl-str-test">${m.rated.reliability !== 'alta' && model.TESTS.some(t => t.group === m.id && model.isFreeWeight(t.ejercicio)) ? `<button type="button" class="tl-chip" data-test-reliable="${m.id}">Aumentar fiabilidad</button>` : ''}<button type="button" class="tl-link" data-test-group="${m.id}">Hacer un test de ${E(m.name.toLowerCase())}</button></li>` : ''}</ul>` : ''}</li>`).join('')}</ul>
      ${none.length ? `<p class="tl-note">Sin datos todavía: ${none.map(m => E(m.name)).join(', ')}.${none.some(m => model.TESTS.some(t => t.group === m.id)) ? ' Un test lo arregla.' : ''}</p>` : ''}
      <p class="tl-method">Las marcas del baremo dividen principiante, novato, intermedio, avanzado y élite: más fuerte que el 5, 20, 50, 80 y 95 % de esos hombres, no de toda la población. Cada músculo es la mediana de sus ejercicios, y la barra y las mancuernas cuentan doble porque pesan igual en todas partes. Las máquinas y poleas pesan distinto en cada gimnasio: se calibran con el resto del músculo en los trimestres que compartís, y una máquina nueva vale tu nivel actual hasta su segunda sesión. Fiabilidad alta: hay peso libre en el último año; media: solo máquinas calibradas; baja: máquinas sin nada con qué compararlas. Cuenta cualquier máquina, gimnasio o modalidad: lo unilateral se multiplica por 1,8 y el recorrido parcial por 0,8; lo hecho con goma no cuenta. Toca un músculo para ver sus ejercicios.</p></section>`;
  }

  function paintRecent() {
    const dates = [...new Set(S.filas.map(f => f[F.FECHA]))].sort().reverse().slice(0, S.recentMore ? 12 : 4);
    if (!dates.length) return '';
    const dayName = dia => S.rutina.find(r => r.dia === +dia)?.nombre;
    return `<section class="tl-recent"><h3 class="tl-section">Últimos entrenos</h3>${dates.map(fecha => {
      const rows = S.filas.filter(f => f[F.FECHA] === fecha), dia = rows.find(f => f[F.DIA] !== '' && !model.isWalk(f))?.[F.DIA];
      const names = [...new Set(rows.map(f => f[F.EJ]))];
      return `<article><h4>${dateLabel(fecha)}${dia && dayName(dia) ? `<small>Día ${E(dia)} · ${E(dayName(dia))}</small>` : ''}</h4><table><tbody>${names.map(n => {
        const series = rows.filter(f => f[F.EJ] === n).sort((a, b) => a[F.SERIE] - b[F.SERIE]);
        const text = n === model.WALK ? series.map(f => { const w = model.walkOf(f); return `${N(w.min)} min a ${N(w.vel)} km/h, ${N(w.inc)}°`; }).join(' + ') : setsText(series);
        return `<tr><td>${E(n)}</td><td>${E(text)}</td></tr>`;
      }).join('')}</tbody></table></article>`;
    }).join('')}<button type="button" class="tl-link" data-act="recent-more">${S.recentMore ? 'Ver menos' : 'Ver más entrenos'}</button></section>`;
  }

  function paintWalkEvolution() {
    const days = model.sessions(S.filas, model.WALK).reverse();
    const points = days.map(s => ({ fecha: s.fecha, value: s.series.reduce((a, f) => a + model.walkOf(f).km, 0), detail: s.series.map(f => { const w = model.walkOf(f); return `${N(w.min)} min a ${N(w.vel)} km/h, ${N(w.inc)}°`; }).join(' + ') }));
    const km = points.reduce((a, p) => a + p.value, 0), min = days.flatMap(s => s.series).reduce((a, f) => a + model.walkOf(f).min, 0);
    drawChart(points, 'Caminadora', 'km', `Kilómetros de cada día. En total, ${N(Math.round(km * 10) / 10)} km en ${N0(min)} minutos y ${days.length} ${days.length === 1 ? 'día' : 'días'}.`);
    $('#tl-log').innerHTML = `<div class="tl-log"><table><caption>Últimas caminatas</caption><tbody>${days.slice(-12).reverse().flatMap(s => s.series.map(f => { const w = model.walkOf(f); return `<tr><td>${dateLabel(s.fecha)}</td><td>${N(w.min)} min</td><td>${N(w.vel)} km/h, ${N(w.inc)}°</td><td>${N(Math.round(w.km * 100) / 100)} km</td></tr>`; })).join('')}</tbody></table></div>`;
  }

  function drawChart(points, title, unit, method) {
    const box = $('#tl-chart-box');
    if (!points.length) { box.innerHTML = `<h3>${E(title)}</h3><p class="tl-note">No hay datos suficientes para esta medida.</p>`; return; }
    const W = 720, H = 300, pl = 44, pr = 16, pt = 14, pb = 28, t = iso => Date.parse(iso);
    const x0 = t(points[0].fecha), x1 = Math.max(t(points.at(-1).fecha), x0 + 864e5);
    const values = points.map(p => p.value), low = Math.min(...values), high = Math.max(...values);
    const raw = Math.max((high - low) / 4, unit === '× peso' ? .1 : 1), step = [.05, .1, .25, .5, 1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000].find(s => s >= raw) || 2000;
    const y0 = Math.floor(low / step) * step, y1 = Math.max(Math.ceil(high / step) * step, y0 + step);
    const X = iso => (x1 === x0 ? (pl + W - pr) / 2 : pl + (t(iso) - x0) / (x1 - x0) * (W - pl - pr)), Y = v => H - pb - (v - y0) / (y1 - y0) * (H - pb - pt);
    const grid = [];
    for (let v = y0; v <= y1 + 1e-9; v += step) grid.push(`<line x1="${pl}" x2="${W - pr}" y1="${Y(v)}" y2="${Y(v)}"/><text x="${pl - 8}" y="${Y(v) + 4}" text-anchor="end">${N(Math.round(v * 100) / 100)}</text>`);
    for (let a = +points[0].fecha.slice(0, 4) + 1; a <= +points.at(-1).fecha.slice(0, 4); a++) { const px = X(`${a}-01-01`); if (px > pl + 18 && px < W - pr - 18) grid.push(`<text x="${px}" y="${H - 8}" text-anchor="middle">${a}</text>`); }
    let peak = points[0]; points.forEach(p => { if (p.value > peak.value) peak = p; });
    const last = points.at(-1);
    const lead = () => (unit === '%' ? `<b>${pct(points[0].value)} → ${pct(last.value)}</b> de los hombres${peak !== last ? ` · máximo ${pct(peak.value)} en ${quarter(peak.fecha)}` : ''}`
      : `<b>${fmtUnit(points[0].value, unit)} → ${fmtUnit(peak.value, unit)}</b>${peak.value > points[0].value && points[0].value ? ` · +${N0((peak.value / points[0].value - 1) * 100)} %` : ''}${peak !== last ? ` · último ${fmtUnit(last.value, unit)}` : ''}`);
    box.innerHTML = `<h3>${E(title)}</h3><p class="tl-chart-lead" id="tl-chart-lead">${lead()}</p><div class="tl-chart" id="tl-chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${E(title)}: ${E(unit)} a lo largo del tiempo">${grid.join('')}<path d="${points.map((p, i) => `${i ? 'L' : 'M'}${X(p.fecha).toFixed(1)} ${Y(p.value).toFixed(1)}`).join('')}"/>${points.length < 40 ? points.map(p => `<circle class="dot" cx="${X(p.fecha).toFixed(1)}" cy="${Y(p.value).toFixed(1)}" r="3"/>`).join('') : ''}<circle class="peak" cx="${X(peak.fecha)}" cy="${Y(peak.value)}" r="5"/><line class="guide" id="tl-guide" y1="${pt}" y2="${H - pb}" visibility="hidden"/><circle class="probe" id="tl-probe" r="5" visibility="hidden"/></svg></div><p class="tl-method">${E(method)}</p>`;
    const chart = $('#tl-chart'), guide = $('#tl-guide'), probe = $('#tl-probe'), label = $('#tl-chart-lead');
    const move = event => {
      const r = chart.getBoundingClientRect(), px = (event.clientX - r.left) / r.width * W;
      const near = points.reduce((a, b) => (Math.abs(X(b.fecha) - px) < Math.abs(X(a.fecha) - px) ? b : a));
      for (const [k, v] of [['x1', X(near.fecha)], ['x2', X(near.fecha)]]) guide.setAttribute(k, v);
      guide.setAttribute('visibility', 'visible'); probe.setAttribute('cx', X(near.fecha)); probe.setAttribute('cy', Y(near.value)); probe.setAttribute('visibility', 'visible');
      label.innerHTML = `<b>${fmtUnit(near.value, unit)}</b> · ${unit === '%' ? quarter(near.fecha) : dateLabel(near.fecha)}${near.detail ? ` · ${E(near.detail)}` : ''}`;
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
    if (d.kind) {
      keepDraft(); S.kind[S.ejercicio] = d.kind;
      // A dropset starts about a quarter lighter than the last set, rounded to the machine's step.
      const r = exercises(S.dia).find(x => x.ejercicio === S.ejercicio), draft = S.draft[S.ejercicio], last = todayRows(S.dia, S.ejercicio).at(-1);
      if (d.kind === 'drop' && last && draft) { const step = r.salto || 2.5; draft.kg = Math.max(step, Math.round(model.num(last[F.KG]) * 0.75 / step) * step); }
      return paint();
    }
    if (d.choose) { keepDraft(); S.chosen[S.ejercicio] = +d.choose; return paint(); }
    if (d.unskip) { const slot = `${S.dia}|${S.ejercicio}`, p = plan(); p.saltos[slot] = (p.saltos[slot] || []).filter(n => n !== +d.unskip); S.chosen[S.ejercicio] = +d.unskip; savePlan(); return paint(); }
    if (d.edit) return layerEdit(d.edit);
    if (d.move) { const list = exercises(S.dia).map(x => x.original), [item] = list.splice(+d.move, 1); list.splice(+d.move + +d.v, 0, item); plan().orden[S.dia] = list; savePlan(); return layerOrder(); }
    if (d.swap) return doSwap(d.swap);
    if (d.newBase) { keepDraft(); return layerNew(d.newBase); }
    if (d.variant !== undefined) { S.newVariant = d.variant; document.getElementById('tl-new-variant').value = ''; portal.querySelectorAll('[data-variant]').forEach(x => x.setAttribute('aria-pressed', String(x === b))); return previewNew(); }
    if (d.muscle) { const fromStale = b.closest('.tl-stale'); S.muscle = d.muscle; S.chart = '*'; S.allEx = false; paint(); if (fromStale) $('#tl-chart-box')?.scrollIntoView({ behavior: still() ? 'auto' : 'smooth', block: 'center' }); return undefined; }
    if (d.chart) { S.chart = d.chart; return paint(); }
    if (d.measure) { S.measures[S.chart] = d.measure; write('measures', S.measures); return paint(); }
    if (d.strength) { S.strength = S.strength === d.strength ? null : d.strength; return paint(); }
    if (d.walk) return layerWalk(d.walk);
    if (d.test) return startTest(d.test);
    if (d.testGroup) return layerTests(d.testGroup);
    if (d.testReliable) return layerTests(d.testReliable, true);
    if (d.rename) { keepDraft(); return layerRename(d.rename); }
    if (d.wstep) { const node = document.getElementById(d.wstep); node.value = N(Math.max(0, Math.round((readNumber(d.wstep, 0) + +d.v) * 10) / 10)); return walkKm(); }
    switch (d.act) {
      case 'set': return doSet();
      case 'walk': keepDraft(); return layerWalk();
      case 'tests': return layerTests();
      case 'ago': { S.agoIndex = (S.agoIndex || 0) + 1; const node = app.querySelector('.tl-ago'); if (node) node.outerHTML = agoCard(); return undefined; }
      case 'rival-connect': return layerRival();
      case 'rival-save': return saveRival(b);
      case 'rival-hide': write('rivalHidden', true); return paint();
      case 'rival-next': S.rivalIndex = (S.rivalIndex || 0) + 1; return paint();
      case 'walk-save': return saveWalk();
      case 'rename-save': return saveRename(b);
      case 'all-ex': S.allEx = !S.allEx; return paint();
      case 'recent-more': S.recentMore = !S.recentMore; return paint();
      case 'skip': { keepDraft(); const r = exercises(S.dia).find(x => x.ejercicio === S.ejercicio), slot = `${S.dia}|${r.ejercicio}`, p = plan(); p.saltos[slot] = (p.saltos[slot] || []).concat(setState(r).active); savePlan(); delete S.chosen[r.ejercicio]; advance(r); return paint(); }
      case 'more': keepDraft(); S.more = !S.more; return paint();
      case 'order': keepDraft(); return layerOrder();
      case 'close-order': closeLayer(); S.ejercicio = null; return paint();
      case 'swap': keepDraft(); return layerSwap();
      case 'new': keepDraft(); return layerNew();
      case 'new-swap': return createExercise(true);
      case 'new-add': return createExercise(false);
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
  portal.addEventListener('input', event => { if (!event.target.closest('.tl-card')) return; if (event.target.matches('#tl-wvel, #tl-wmin')) walkKm(); else if (event.target.matches('.tl-rn')) previewRename(); else previewNew(); });
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
      model = await import('./training-model.js?v=20261111fiable'); F = model.F;
      S.queue = read('queue', []); S.plan = read('plan', null); S.measures = read('measures', {}); S.swaps = read('cambios', {});
      // Swaps used to last one day: today's carry on.
      if (S.plan?.fecha === today() && Object.keys(S.plan.cambios || {}).length) { S.swaps = { ...S.plan.cambios, ...S.swaps }; S.plan.cambios = {}; saveSwaps(); savePlan(); }
      const cache = read('cache', null);
      if (cache) { Object.assign(S, cache); S.connected = true; paint(); }
      await flush();
      try { await load(); } catch (error) {
        if (!cache && error.message !== 'session') throw error;
        S.error = 'Sin conexión con el Sheet: uso lo último guardado y subiré los cambios en cuanto vuelva.';
      }
      if (!document.activeElement?.matches?.('#tl-kg, #tl-reps, #tl-code, .tl-text') && document.getElementById('tl-layer').hidden) { keepDraft(); paint(); }
    } catch {
      app.innerHTML = '<p class="eyebrow"><span></span> TRAINING LAB</p><h2>Entrenamiento</h2><p class="tl-error">No se ha podido leer el Sheet. Vuelve a intentarlo en un momento.</p>';
    }
  } };
})();
