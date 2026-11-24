// Mudanza: the relocation plan as a dashboard. Countdown and progress on top, what is urgent now,
// then every item by month (a timeline) or by area, each with its date, who does it and how.
// ≈ marks an approximate date; a deadline turns red when it passes. Ticks are saved in D1 (personal_datasets 'mudanza').
(() => {
  const app = document.getElementById('mudanza-app');
  if (!app) return;
  const API = '/control/api/mudanza/status';
  let model, csrf = '';
  const S = { plan: null, ticks: {}, view: 'mes', filter: 'open', open: new Set(), importing: false, preview: null, error: '', busy: false };
  const read = (k, d) => { try { const v = localStorage.getItem('mudanza.' + k); return v === null ? d : JSON.parse(v); } catch { return d; } };
  const write = (k, v) => { try { localStorage.setItem('mudanza.' + k, JSON.stringify(v)); } catch { /* memory only */ } };
  const E = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const today = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
  const DAYS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
  const short = date => { const d = new Date(date + 'T12:00:00Z'); return `${DAYS[d.getUTCDay()]} ${d.getUTCDate()} ${model.MONTHS[d.getUTCMonth()].slice(0, 3)}${date.slice(0, 4) !== today().slice(0, 4) ? ' ' + date.slice(0, 4) : ''}`; };
  const until = date => {
    const n = model.daysUntil(date, today());
    return n === 0 ? 'hoy' : n === 1 ? 'mañana' : n === -1 ? 'ayer' : n < 0 ? `hace ${-n} d` : `en ${n} d`;
  };

  async function call(method, body) {
    const r = await fetch(API, { method, credentials: 'same-origin', headers: { accept: 'application/json', ...(method === 'POST' ? { 'x-csrf-token': csrf, 'content-type': 'application/json' } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
    if (r.status === 401) { location.replace('/control/login'); throw new Error('session'); }
    const out = await r.json();
    if (!out.ok) throw new Error(out.error || 'unavailable');
    return out;
  }
  const take = out => { S.plan = out.plan; S.ticks = out.ticks || {}; write('cache', { plan: S.plan, ticks: S.ticks }); };

  // ---------- Pieces ----------
  function dueChip(item, state) {
    if (!item.due) return '';
    const n = model.daysUntil(item.due, today()), done = state === 'done';
    const cls = item.approx ? 'approx' : done ? '' : n < 0 ? 'late' : n <= 3 ? 'soon' : '';
    const label = item.approx ? `≈ ${short(item.due)}` : `${short(item.due)}${done ? '' : ' · ' + until(item.due)}`;
    return `<span class="mz-due ${cls}" title="${item.approx ? 'Fecha aproximada' : item.deadline ? 'Fecha límite' : 'Fecha prevista'}">${item.deadline ? '<b>LÍMITE</b>' : ''}${E(label)}</span>`;
  }
  function row(item) {
    const state = model.stateOf(item, S.ticks), open = S.open.has(item.id), done = state === 'done';
    const tick = S.ticks[item.id];
    const doneOn = done ? (tick?.done ? tick.at.slice(0, 10) : item.doneOn) : '';
    return `<li class="mz-item s-${state}${item.deadline ? ' is-deadline' : ''}">
      <div class="mz-line">
        <button type="button" class="mz-check" data-tick="${E(item.id)}" aria-pressed="${done}" aria-label="${done ? 'Desmarcar' : 'Marcar hecho'}: ${E(item.title)}"></button>
        <button type="button" class="mz-text" data-expand="${E(item.id)}" aria-expanded="${open}">
          <span class="mz-title">${E(item.title)}</span>
          <span class="mz-meta">${dueChip(item, state)}<span class="mz-state">${model.STATE_LABEL[state]}</span>${item.who ? `<span class="mz-who">${E(item.who)}</span>` : ''}</span>
        </button>
      </div>
      ${open ? `<div class="mz-how">${item.how ? E(item.how).replace(/\n/g, '<br>') : '<i>Sin más detalles.</i>'}${doneOn ? `<p class="mz-doneon">Hecho el ${E(short(doneOn))}</p>` : ''}</div>` : ''}
    </li>`;
  }
  const visible = items => items.filter(i => {
    const st = model.stateOf(i, S.ticks);
    return S.filter === 'all' || (S.filter === 'open' ? st !== 'done' : st === 'done');
  });

  // ---------- Page ----------
  function paint() {
    if (S.importing) return paintImport();
    if (!S.plan) {
      app.innerHTML = `<div class="mz"><header class="mz-head"><p class="mz-eyebrow"><span></span> MUDANZA</p><h1>Sin plan todavía</h1></header>
        ${S.error ? `<p class="mz-err">${E(S.error)}</p>` : ''}
        <div class="mz-empty"><p>El plan es privado: no está en el código. Cárgalo desde el fichero <code>mudanza-plan.json</code> que te prepara Claude (Documentos → Relocation Ingolstadt).</p>
        <button type="button" class="mz-btn primary" data-act="import">Cargar el plan</button></div></div>`;
      return;
    }
    const p = S.plan, t = today(), prog = model.progress(p, S.ticks), pct = prog.total ? Math.round(prog.done / prog.total * 100) : 0;
    const left = p.start ? model.daysUntil(p.start, t) : null;
    const lines = model.deadlines(p, S.ticks), next = model.soon(p, S.ticks, t, 14).filter(i => !i.deadline);
    const groups = (S.view === 'mes' ? model.byMonth(p) : model.bySection(p)).map(g => ({ ...g, shown: visible(g.items) })).filter(g => g.shown.length);
    const late = lines.filter(i => i.due < t).length;
    app.innerHTML = `<div class="mz">
      <header class="mz-head">
        <div><p class="mz-eyebrow"><span></span> MUDANZA${p.updated ? ` · ACTUALIZADO ${E(short(p.updated).toUpperCase())}` : ''}</p><h1>${E(p.title)}</h1></div>
        <div class="mz-count">${left !== null ? `<b>${left > 0 ? left : 0}</b><small>${left > 0 ? 'días para empezar' : 'ya empezaste'}${p.startLabel ? '<br>' + E(p.startLabel) : ''}</small>` : ''}</div>
      </header>
      <div class="mz-progress"><span><i style="width:${pct}%"></i></span><b>${pct}%</b><small>${prog.done}/${prog.total} hecho${late ? ` · <em>${late} plazo${late > 1 ? 's' : ''} vencido${late > 1 ? 's' : ''}</em>` : ''}</small></div>
      ${S.error ? `<p class="mz-err">${E(S.error)}</p>` : ''}
      ${p.status ? `<section class="mz-card mz-status"><h2>Estado actual</h2><p>${E(p.status).replace(/\n/g, '<br>')}</p>${p.facts.length ? `<dl class="mz-facts">${p.facts.map(f => `<div><dt>${E(f.label)}</dt><dd>${E(f.value)}</dd></div>`).join('')}</dl>` : ''}</section>` : ''}
      <div class="mz-two">
        <section class="mz-card"><h2>Plazos <small>${lines.length}</small></h2>${lines.length ? `<ul class="mz-list">${lines.map(row).join('')}</ul>` : '<p class="mz-quiet">Ningún plazo abierto.</p>'}</section>
        <section class="mz-card"><h2>Próximas 2 semanas <small>${next.length}</small></h2>${next.length ? `<ul class="mz-list">${next.map(row).join('')}</ul>` : '<p class="mz-quiet">Nada más con fecha en 14 días.</p>'}</section>
      </div>
      <div class="mz-bar">
        <div class="mz-seg" role="group" aria-label="Agrupar">${[['mes', 'Por mes'], ['area', 'Por área']].map(([v, l]) => `<button type="button" data-view="${v}" aria-pressed="${S.view === v}">${l}</button>`).join('')}</div>
        <div class="mz-seg" role="group" aria-label="Mostrar">${[['open', 'Pendiente'], ['all', 'Todo'], ['done', 'Hecho']].map(([v, l]) => `<button type="button" data-filter="${v}" aria-pressed="${S.filter === v}">${l}</button>`).join('')}</div>
      </div>
      <div class="mz-groups">${groups.length ? groups.map(g => { const d = g.items.filter(i => model.isDone(i, S.ticks)).length; return `<section class="mz-group"><h2><span>${E(g.name)}</span><small>${d}/${g.items.length}</small></h2><ul class="mz-list">${g.shown.map(row).join('')}</ul></section>`; }).join('') : '<p class="mz-quiet">Nada que enseñar con este filtro.</p>'}</div>
      ${p.money.length ? `<section class="mz-card"><h2>Dinero</h2><dl class="mz-facts">${p.money.map(f => `<div><dt>${E(f.label)}</dt><dd>${E(f.value)}</dd></div>`).join('')}</dl></section>` : ''}
      <footer class="mz-foot"><button type="button" class="mz-btn" data-act="import">Actualizar el plan</button><small>Lo que marcas se guarda aparte: cargar un plan nuevo no lo borra.</small></footer>
    </div>`;
  }
  function paintImport() {
    const pv = S.preview;
    app.innerHTML = `<div class="mz"><header class="mz-head"><div><p class="mz-eyebrow"><span></span> MUDANZA</p><h1>Cargar el plan</h1></div></header>
      <section class="mz-card"><p>Elige o arrastra <code>mudanza-plan.json</code>, o pega su contenido. Sustituye el plan; lo que ya marcaste se queda.</p>
        <input type="file" id="mz-file" accept="application/json,.json">
        <textarea id="mz-text" rows="8" placeholder='{"title": "Mudanza a Ingolstadt", "items": [...]}'></textarea>
        ${pv?.error ? `<p class="mz-err">${E(pv.error)}</p>` : pv?.plan ? `<p class="mz-ok">${E(pv.plan.title)} · ${pv.plan.items.length} tareas en ${pv.plan.sections.length} áreas${pv.plan.updated ? ` · actualizado ${E(short(pv.plan.updated))}` : ''}</p>` : ''}
        <div class="mz-actions"><button type="button" class="mz-btn" data-act="cancel">Cancelar</button><button type="button" class="mz-btn primary" data-act="do-import" ${pv?.plan && !S.busy ? '' : 'disabled'}>Cargar</button></div>
      </section></div>`;
  }
  function setPreview(text) {
    try { S.preview = { plan: model.normPlan(text) }; } catch { S.preview = { error: 'Eso no parece un plan de mudanza (JSON con "items").' }; }
    paintImport();
  }

  // ---------- Actions ----------
  async function tick(id) {
    const item = S.plan.items.find(i => i.id === id);
    if (!item) return;
    const done = !model.isDone(item, S.ticks);
    S.ticks = model.applyTick(S.ticks, id, done); S.error = ''; paint();
    try { take(await call('POST', { action: 'tick', id, done })); } catch (e) { if (e.message !== 'session') S.error = 'No se pudo guardar; vuelve a intentarlo.'; }
    paint();
  }
  app.addEventListener('click', async e => {
    const b = e.target.closest('button');
    if (!b) return;
    const d = b.dataset;
    if (d.tick) return tick(d.tick);
    if (d.expand) { if (S.open.has(d.expand)) S.open.delete(d.expand); else S.open.add(d.expand); return paint(); }
    if (d.view) { S.view = d.view; write('view', S.view); return paint(); }
    if (d.filter) { S.filter = d.filter; write('filter', S.filter); return paint(); }
    if (d.act === 'import') { S.importing = true; S.preview = null; return paint(); }
    if (d.act === 'cancel') { S.importing = false; return paint(); }
    if (d.act === 'do-import' && S.preview?.plan) {
      S.busy = true; paintImport();
      try { take(await call('POST', { action: 'import', plan: S.preview.plan })); S.importing = false; S.error = ''; }
      catch (err) { if (err.message !== 'session') S.preview = { error: 'No se pudo cargar: ' + err.message }; }
      S.busy = false; paint();
    }
  });
  app.addEventListener('input', e => { if (e.target.id === 'mz-text' && e.target.value.trim()) setPreview(e.target.value); });
  app.addEventListener('change', async e => { if (e.target.id === 'mz-file') { const f = e.target.files?.[0]; if (f) setPreview(await f.text()); } });
  app.addEventListener('dragover', e => { if (S.importing) e.preventDefault(); });
  app.addEventListener('drop', async e => { if (!S.importing) return; e.preventDefault(); const f = e.dataTransfer?.files?.[0]; if (f) setPreview(await f.text()); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden && model && !S.importing) refresh(); });

  async function refresh() {
    try { take(await call('GET')); S.error = ''; }
    catch (e) { if (e.message !== 'session' && !S.plan) S.error = 'No se pudo leer el plan ahora mismo.'; }
    paint();
  }

  window.MudanzaLab = { async initialise(token) {
    csrf = token;
    model = await import('/control/mudanza-model.js?v=20261124a');
    S.view = read('view', 'mes'); S.filter = read('filter', 'open');
    const cached = read('cache', null);
    if (cached?.plan) { S.plan = cached.plan; S.ticks = cached.ticks || {}; paint(); }
    await refresh();
  } };
})();
