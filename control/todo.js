(() => {
  const app = document.getElementById('todo-app');
  if (!app) return;
  const API = '/control/api/todo/status';
  let model, shell = null, csrf = '';
  const read = (k, d) => { try { const v = localStorage.getItem('todo.' + k); return v === null ? d : JSON.parse(v); } catch { return d; } };
  const write = (k, v) => { try { localStorage.setItem('todo.' + k, JSON.stringify(v)); } catch { /* memory only */ } };
  // doc is what the server last confirmed; the queue holds changes it has not taken yet, shown on top.
  const S = { doc: null, queue: read('queue', []), view: read('view', 'myday'), open: null, showDone: false, layer: null, preview: null, error: '' };
  const E = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const today = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
  const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const WEEKDAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const view = () => { try { return model.applyOps(S.doc, S.queue); } catch { return S.doc; } };

  // ---------- Network ----------
  async function call(method, body) {
    const r = await fetch(API, { method, credentials: 'same-origin', headers: { accept: 'application/json', ...(method === 'POST' ? { 'x-csrf-token': csrf, 'content-type': 'application/json' } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
    if (r.status === 401) { location.replace('/control/login'); throw new Error('session'); }
    const out = await r.json();
    if (!out.ok) { const e = new Error(out.error || 'unavailable'); e.status = r.status; throw e; }
    return out;
  }
  const docOf = out => ({ v: out.v, lists: out.lists });
  let flushing = false;
  async function flush() {
    if (flushing || !S.queue.length) return paintPending();
    flushing = true;
    const sent = S.queue.slice();
    try {
      S.doc = docOf(await call('POST', { ops: sent }));
      S.queue = S.queue.slice(sent.length); S.error = '';
    } catch (e) {
      // A change the server refuses would block everything behind it: it is dropped and said so.
      if (e.status === 400 || e.status === 413) { S.queue = S.queue.slice(sent.length); S.error = 'No se pudo guardar el último cambio (' + e.message + ').'; }
    } finally {
      flushing = false; write('queue', S.queue); write('cache', S.doc); paint();
    }
    if (S.queue.length && !S.error) setTimeout(flush, 50);
  }
  function send(...ops) { S.queue.push(...ops); write('queue', S.queue); paint(); flush(); }
  setInterval(() => { if (S.queue.length) flush(); }, 20_000);
  addEventListener('online', flush);

  // ---------- Paint ----------
  const listName = id => model.SMART[id] || view().lists.find(l => l.id === id)?.name || 'Tareas';
  function niceDate(date) {
    const t = today();
    if (date === t) return 'Hoy';
    if (date === model.addDays(t, 1)) return 'Mañana';
    if (date === model.addDays(t, -1)) return 'Ayer';
    const d = new Date(date + 'T12:00:00Z');
    const near = date > t && date <= model.addDays(t, 6);
    return near ? WEEKDAYS[d.getUTCDay()].replace(/^./, c => c.toUpperCase()) : `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}${date.slice(0, 4) !== t.slice(0, 4) ? ' ' + date.slice(0, 4) : ''}`;
  }
  const REPEAT_LABEL = { day: ['cada día', 'días'], week: ['cada semana', 'semanas'], month: ['cada mes', 'meses'], year: ['cada año', 'años'] };
  const repeatText = r => (r.interval === 1 ? REPEAT_LABEL[r.every][0] : `cada ${r.interval} ${REPEAT_LABEL[r.every][1]}`);

  function paint() {
    if (!S.doc) return;
    if (!shell) { app.innerHTML = '<div id="todo-shell"></div><div class="fin-layer td-layer" id="todo-layer" hidden></div>'; shell = document.getElementById('todo-shell'); }
    const layer = document.getElementById('todo-layer'), typing = layer.contains(document.activeElement) && /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
    // A field edited in the open task keeps its sheet as it is, so typing or the next tap is not lost.
    const keep = S.keepLayer || typing;
    S.keepLayer = false;
    const doc = view(), t = today();
    if (!model.SMART[S.view] && !doc.lists.some(l => l.id === S.view)) S.view = 'myday';
    const c = model.counts(doc, t);
    const nav = (id, label, icon) => `<button type="button" data-nav="${E(id)}" aria-current="${S.view === id ? 'page' : 'false'}"><i aria-hidden="true">${icon}</i><span>${E(label)}</span>${c[id] ? `<b>${c[id]}</b>` : ''}</button>`;
    const total = doc.lists.reduce((n, l) => n + l.tasks.length, 0);
    shell.innerHTML = `<header class="tl-head"><div><p class="eyebrow"><span></span> TAREAS</p><h2>${E(listName(S.view))}</h2><p class="tl-hello">${E(hello(doc, t, total))}</p></div>
      <div class="tl-head-side"><span class="tl-pending" id="todo-pending" hidden></span><div class="td-head-actions">
        ${model.SMART[S.view] ? '' : '<button type="button" class="td-ghost" data-act="list-menu">Lista…</button>'}<button type="button" class="td-ghost" data-act="import">Importar</button></div></div></header>
      ${S.error ? `<p class="tl-error" role="status">${E(S.error)}</p>` : ''}
      <div class="td-layout">
        <nav class="td-nav" aria-label="Listas">${nav('myday', 'Mi día', '☀')}${nav('important', 'Importante', '★')}${nav('planned', 'Planeado', '▦')}${nav('all', 'Todas', '∞')}
          <hr>${doc.lists.map(l => nav(l.id, l.name, '≡')).join('')}
          <button type="button" class="td-new-list" data-act="new-list"><i aria-hidden="true">+</i><span>Nueva lista</span></button></nav>
        <section class="td-main">${paintAdd()}${paintTasks(doc, t)}</section>
      </div>`;
    paintPending();
    // On the phone the lists are a sideways strip: keep the open one in sight.
    shell.querySelector('.td-nav [aria-current=page]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    if (S.layer && !keep) paintLayer();
  }
  function hello(doc, t, total) {
    if (!total) return 'Aún no hay tareas. Escribe la primera o trae las de Microsoft To Do con «Importar».';
    if (S.view === 'myday') { const d = new Date(t + 'T12:00:00Z'); return `${WEEKDAYS[d.getUTCDay()].replace(/^./, c => c.toUpperCase())}, ${d.getUTCDate()} de ${MONTHS[d.getUTCMonth()]}. Lo que toca hoy y lo vencido.`; }
    const open = model.tasksFor(doc, S.view, t).filter(r => !r.task.done).length;
    return open ? `${open} pendiente${open === 1 ? '' : 's'}.` : 'Nada pendiente aquí.';
  }
  const paintAdd = () => `<form class="td-add" id="todo-add" autocomplete="off"><span aria-hidden="true">+</span><input id="todo-title" maxlength="400" placeholder="Añadir una tarea${S.view === 'myday' ? ' para hoy' : ''}" aria-label="Nueva tarea" enterkeyhint="done"><button type="submit">Añadir</button></form>`;

  function row({ task, list }, t) {
    const meta = [];
    if (model.SMART[S.view]) meta.push(E(list.name));
    if (task.myDay === t && S.view !== 'myday') meta.push('☀ Mi día');
    if (task.steps.length) meta.push(`${task.steps.filter(s => s.done).length} de ${task.steps.length}`);
    if (task.due) meta.push(`<em class="${!task.done && task.due < t ? 'late' : task.due === t ? 'today' : ''}">${niceDate(task.due)}</em>`);
    if (task.repeat) meta.push('↻');
    if (task.reminder) meta.push('⏰');
    if (task.note.trim()) meta.push('✎');
    return `<li class="${task.done ? 'done' : ''}"><button type="button" class="td-check" data-toggle="${E(task.id)}" aria-pressed="${task.done}" aria-label="${task.done ? 'Marcar como pendiente' : 'Completar'}: ${E(task.title)}"></button>
      <button type="button" class="td-open" data-open-task="${E(task.id)}"><span>${E(task.title)}</span>${meta.length ? `<small>${meta.join(' · ')}</small>` : ''}</button>
      <button type="button" class="td-star" data-star="${E(task.id)}" aria-pressed="${task.important}" aria-label="Importante">${task.important ? '★' : '☆'}</button></li>`;
  }
  function paintTasks(doc, t) {
    const rows = model.tasksFor(doc, S.view, t), open = rows.filter(r => !r.task.done), done = rows.filter(r => r.task.done);
    let body;
    if (S.view === 'planned') {
      const names = { overdue: 'Vencidas', today: 'Hoy', tomorrow: 'Mañana', week: 'Esta semana', later: 'Más adelante' };
      body = Object.entries(names).map(([k, label]) => { const g = open.filter(r => model.dueBucket(r.task.due, t) === k); return g.length ? `<p class="td-group">${label}</p><ul class="td-list">${g.map(r => row(r, t)).join('')}</ul>` : ''; }).join('');
    } else body = open.length ? `<ul class="td-list">${open.map(r => row(r, t)).join('')}</ul>` : '';
    if (!open.length) body = `<p class="td-empty">${S.view === 'myday' ? 'Nada para hoy. Añade algo arriba o abre una tarea y pulsa «Añadir a Mi día».' : 'Todo hecho por aquí.'}</p>`;
    if (S.view !== 'planned' && done.length) {
      done.sort((a, b) => (b.task.completed || '').localeCompare(a.task.completed || ''));
      body += `<button type="button" class="td-done-toggle" data-act="show-done" aria-expanded="${S.showDone}">${S.showDone ? '▾' : '▸'} Completadas <b>${done.length}</b></button>${S.showDone ? `<ul class="td-list">${done.slice(0, 300).map(r => row(r, t)).join('')}</ul>${done.length > 300 ? `<p class="td-empty">Y ${done.length - 300} más antiguas.</p>` : ''}` : ''}`;
    }
    return body;
  }
  function paintPending() {
    const el = document.getElementById('todo-pending');
    if (el) { el.hidden = !S.queue.length; el.textContent = S.queue.length ? `${S.queue.length} sin guardar · reintentando` : ''; }
  }

  // ---------- Layers: task detail, list menu, import ----------
  const find = id => { for (const list of view().lists) { const task = list.tasks.find(x => x.id === id); if (task) return { task, list }; } return null; };
  function paintLayer() {
    const layer = document.getElementById('todo-layer');
    if (!layer) return;
    layer.hidden = false;
    if (S.layer === 'task') {
      const found = find(S.open);
      if (!found) { S.layer = null; layer.hidden = true; return; }
      const { task, list } = found, t = today(), lists = view().lists;
      layer.innerHTML = `<div class="fin-sheet td-sheet" role="dialog" aria-modal="true" aria-label="Tarea">
        <div class="td-sheet-head"><button type="button" class="td-check" data-toggle="${E(task.id)}" aria-pressed="${task.done}" aria-label="Completar"></button>
          <textarea id="td-f-title" rows="1" maxlength="400" aria-label="Título">${E(task.title)}</textarea>
          <button type="button" class="td-star" data-star="${E(task.id)}" aria-pressed="${task.important}" aria-label="Importante">${task.important ? '★' : '☆'}</button></div>
        <ul class="td-steps">${task.steps.map(s => `<li><button type="button" class="td-check small" data-step="${E(s.id)}" aria-pressed="${s.done}" aria-label="Paso hecho"></button><span class="${s.done ? 'done' : ''}">${E(s.title)}</span><button type="button" class="td-x" data-del-step="${E(s.id)}" aria-label="Quitar paso">×</button></li>`).join('')}
          <li><form id="td-step-add" autocomplete="off"><input id="td-f-step" maxlength="400" placeholder="+ Siguiente paso" aria-label="Nuevo paso"></form></li></ul>
        <button type="button" class="td-row-btn ${task.myDay === t ? 'on' : ''}" data-act="myday">☀ ${task.myDay === t ? 'Quitar de Mi día' : 'Añadir a Mi día'}</button>
        <div class="td-fields">
          <label>Vence<input type="date" id="td-f-due" value="${E(task.due)}"></label>
          <label>Recordatorio<input type="datetime-local" id="td-f-reminder" value="${E(task.reminder)}"></label>
          <label>Repetir<select id="td-f-repeat"><option value="">No se repite</option>${model.REPEATS.map(r => `<option value="${r}" ${task.repeat?.every === r ? 'selected' : ''}>${REPEAT_LABEL[r][0].replace('cada', 'Cada')}</option>`).join('')}</select></label>
          ${task.repeat ? `<label>Cada<input type="number" id="td-f-interval" min="1" max="99" value="${task.repeat.interval}"></label>` : ''}
          <label>Lista<select id="td-f-list">${lists.map(l => `<option value="${E(l.id)}" ${l.id === list.id ? 'selected' : ''}>${E(l.name)}</option>`).join('')}</select></label>
        </div>
        ${task.repeat ? `<p class="td-hint">↻ Se repite ${repeatText(task.repeat)}: al completarla aparece la siguiente.</p>` : ''}
        <label class="td-note">Nota<textarea id="td-f-note" rows="5" maxlength="20000">${E(task.note)}</textarea></label>
        <p class="td-hint">Creada el ${E(task.created.slice(0, 10))}${task.done && task.completed ? ` · completada el ${E(task.completed.slice(0, 10))}` : ''}</p>
        <div class="td-sheet-foot"><button type="button" class="td-danger" data-act="delete-task">Eliminar</button><button type="button" class="td-primary" data-act="close">Listo</button></div></div>`;
      const title = document.getElementById('td-f-title');
      title.style.height = title.scrollHeight + 'px';
    } else if (S.layer === 'list') {
      const list = view().lists.find(l => l.id === S.view);
      if (!list) { S.layer = null; layer.hidden = true; return; }
      layer.innerHTML = `<div class="fin-sheet td-sheet" role="dialog" aria-modal="true" aria-label="Lista"><h3>Lista</h3>
        <form id="td-rename" autocomplete="off"><label class="td-note">Nombre<input id="td-f-listname" maxlength="120" value="${E(list.name)}"></label><button class="td-primary" type="submit">Guardar nombre</button></form>
        ${view().lists.length > 1 ? `<p class="td-hint">Al eliminarla se borran también sus ${list.tasks.length} tareas.</p><button type="button" class="td-danger" data-act="delete-list">Eliminar la lista</button>` : '<p class="td-hint">Es tu única lista: no se puede eliminar.</p>'}
        <div class="td-sheet-foot"><span></span><button type="button" class="td-ghost" data-act="close">Cerrar</button></div></div>`;
    } else if (S.layer === 'import') {
      const p = S.preview;
      layer.innerHTML = `<div class="fin-sheet td-sheet" role="dialog" aria-modal="true" aria-label="Importar"><h3>Traer tus tareas de Microsoft To Do</h3>
        <ol class="td-steps-how">
          <li>En tu PC, descarga <a href="todo-export.ps1" download>todo-export.ps1</a>.</li>
          <li>Ábrelo con clic derecho → <b>Ejecutar con PowerShell</b>. Te pedirá entrar con tu cuenta de Microsoft (solo lectura).</li>
          <li>Deja el archivo <code>Escritorio\\Claude\\Datos\\microsoft-todo.json</code> aquí abajo.</li></ol>
        <label class="td-drop" id="td-drop"><input type="file" id="td-file" accept=".json,.txt,.md,application/json,text/plain"><span>Elegir o soltar el archivo</span></label>
        <details class="td-paste"><summary>O pega una lista en texto</summary><textarea id="td-f-paste" rows="7" placeholder="# Compra\n- leche\n- [x] pan\n\n# Casa\n- Llamar al fontanero\n  - pedir presupuesto"></textarea><button type="button" class="td-ghost" data-act="parse-paste">Leer el texto</button></details>
        ${p?.error ? `<p class="tl-error">${E(p.error)}</p>` : ''}
        ${p?.lists ? `<div class="td-preview"><p><b>${p.summary.lists}</b> listas · <b>${p.summary.tasks}</b> tareas (${p.summary.done} completadas) · <b>${p.summary.steps}</b> pasos</p>
          <ul>${p.lists.map(l => `<li>${E(l.name)} <small>${l.tasks.length}</small></li>`).join('')}</ul>
          <p class="td-hint">Se suman a lo que ya tienes. Si importas el mismo archivo otra vez, no se duplica nada.</p>
          <button type="button" class="td-primary" data-act="do-import">Importar ${p.summary.tasks} tareas</button></div>` : ''}
        <div class="td-sheet-foot"><span></span><button type="button" class="td-ghost" data-act="close">Cerrar</button></div></div>`;
    }
  }
  function closeLayer() { S.layer = null; S.open = null; S.preview = null; const layer = document.getElementById('todo-layer'); if (layer) { layer.hidden = true; layer.innerHTML = ''; } paint(); }
  function putTask(task, listId) { send({ op: 'task.put', list: listId, task }); }
  function updateTask(id, change) { const f = find(id); if (f) putTask({ ...f.task, ...change }, change.__list || f.list.id); }
  function toggle(id) {
    const f = find(id);
    if (!f) return;
    if (f.task.done) return updateTask(id, { done: false, completed: '' });
    const { done, next } = model.completeTask(f.task, today());
    send({ op: 'task.put', list: f.list.id, task: done }, ...(next ? [{ op: 'task.put', list: f.list.id, task: next }] : []));
  }
  function setPreview(text) {
    try {
      const lists = model.parseImport(text);
      const summary = model.importSummary(lists);
      S.preview = summary.tasks ? { lists, summary } : { error: 'No he encontrado tareas en eso.' };
    } catch { S.preview = { error: 'Ese archivo no es una exportación de To Do ni una lista de texto.' }; }
    paintLayer();
  }

  // ---------- Events ----------
  app.addEventListener('click', e => {
    const b = e.target.closest('button, [data-act]');
    if (!b) { if (e.target.id === 'todo-layer') closeLayer(); return; }
    if (b.dataset.nav) { S.view = b.dataset.nav; S.showDone = false; write('view', S.view); paint(); return; }
    if (b.dataset.toggle) { toggle(b.dataset.toggle); return; }
    if (b.dataset.star) { const f = find(b.dataset.star); if (f) updateTask(f.task.id, { important: !f.task.important }); return; }
    if (b.dataset.openTask) { S.open = b.dataset.openTask; S.layer = 'task'; paintLayer(); return; }
    if (b.dataset.step) { const f = find(S.open); if (f) updateTask(S.open, { steps: f.task.steps.map(s => (s.id === b.dataset.step ? { ...s, done: !s.done } : s)) }); return; }
    if (b.dataset.delStep) { const f = find(S.open); if (f) updateTask(S.open, { steps: f.task.steps.filter(s => s.id !== b.dataset.delStep) }); return; }
    const act = b.dataset.act;
    if (act === 'close') closeLayer();
    else if (act === 'show-done') { S.showDone = !S.showDone; paint(); }
    else if (act === 'import') { S.layer = 'import'; S.preview = null; paintLayer(); }
    else if (act === 'list-menu') { S.layer = 'list'; paintLayer(); }
    else if (act === 'new-list') {
      const name = prompt('Nombre de la lista nueva');
      if (name?.trim()) { const id = model.newId(); send({ op: 'list.add', id, name: name.trim() }); S.view = id; write('view', id); paint(); }
    } else if (act === 'delete-list') {
      const list = view().lists.find(l => l.id === S.view);
      if (list && confirm(`¿Eliminar «${list.name}» y sus ${list.tasks.length} tareas?`)) { send({ op: 'list.delete', id: list.id }); S.view = 'myday'; write('view', S.view); closeLayer(); }
    } else if (act === 'delete-task') {
      const f = find(S.open);
      if (f && confirm(`¿Eliminar «${f.task.title}»?`)) { send({ op: 'task.delete', id: f.task.id }); closeLayer(); }
    } else if (act === 'myday') { const f = find(S.open); if (f) updateTask(S.open, { myDay: f.task.myDay === today() ? '' : today() }); }
    else if (act === 'parse-paste') setPreview(document.getElementById('td-f-paste')?.value);
    else if (act === 'do-import' && S.preview?.lists) {
      send({ op: 'import', lists: S.preview.lists });
      S.view = 'all'; write('view', S.view); closeLayer();
    }
  });
  app.addEventListener('submit', e => {
    e.preventDefault();
    if (e.target.id === 'todo-add') {
      const input = document.getElementById('todo-title'), title = input.value.trim();
      if (!title) return;
      const doc = view(), t = today(), smart = model.SMART[S.view];
      const listId = smart ? doc.lists[0].id : S.view;
      putTask(model.normTask({ title, myDay: S.view === 'myday' ? t : '', important: S.view === 'important', due: S.view === 'planned' ? t : '' }), listId);
      document.getElementById('todo-title')?.focus();
    } else if (e.target.id === 'td-step-add') {
      const input = document.getElementById('td-f-step'), title = input.value.trim(), f = find(S.open);
      if (title && f) { updateTask(S.open, { steps: [...f.task.steps, { id: model.newId(), title, done: false }] }); document.getElementById('td-f-step')?.focus(); }
    } else if (e.target.id === 'td-rename') {
      const name = document.getElementById('td-f-listname').value.trim();
      if (name) { send({ op: 'list.rename', id: S.view, name }); closeLayer(); }
    }
  });
  app.addEventListener('change', async e => {
    const id = e.target.id, f = S.open && find(S.open);
    if (id === 'td-file') { const file = e.target.files?.[0]; if (file) setPreview(await file.text()); return; }
    if (!f) return;
    S.keepLayer = ['td-f-title', 'td-f-note', 'td-f-due', 'td-f-reminder'].includes(id);
    if (id === 'td-f-title') { const title = e.target.value.replace(/\s+/g, ' ').trim(); if (title && title !== f.task.title) updateTask(S.open, { title }); }
    else if (id === 'td-f-note') { if (e.target.value !== f.task.note) updateTask(S.open, { note: e.target.value }); }
    else if (id === 'td-f-due') updateTask(S.open, { due: e.target.value });
    else if (id === 'td-f-reminder') updateTask(S.open, { reminder: e.target.value.slice(0, 16) });
    else if (id === 'td-f-repeat') updateTask(S.open, { repeat: e.target.value ? { every: e.target.value, interval: f.task.repeat?.interval || 1 } : null, due: e.target.value && !f.task.due ? today() : f.task.due });
    else if (id === 'td-f-interval') updateTask(S.open, { repeat: { ...f.task.repeat, interval: +e.target.value || 1 } });
    else if (id === 'td-f-list') updateTask(S.open, { __list: e.target.value });
    S.keepLayer = false;
  });
  app.addEventListener('keydown', e => {
    if (e.key === 'Escape' && S.layer) closeLayer();
    if (e.key === 'Enter' && e.target.id === 'td-f-title') { e.preventDefault(); e.target.blur(); }
  });
  app.addEventListener('dragover', e => { if (S.layer === 'import') e.preventDefault(); });
  app.addEventListener('drop', async e => { if (S.layer !== 'import') return; e.preventDefault(); const file = e.dataTransfer?.files?.[0]; if (file) setPreview(await file.text()); });
  // A new day changes Mi día: repaint when the tab comes back.
  document.addEventListener('visibilitychange', () => { if (!document.hidden && S.doc) refresh(); });

  async function refresh() {
    try { S.doc = docOf(await call('GET')); write('cache', S.doc); S.error = ''; }
    catch (e) { if (!S.doc) S.error = 'No se pudo leer tus tareas ahora mismo.'; }
    if (!S.layer) paint();
    flush();
  }

  window.TodoLab = { async initialise(token) {
    csrf = token;
    model = await import('./todo-model.js?v=20261123a');
    const cached = read('cache', null);
    if (cached?.lists) { S.doc = cached; paint(); }
    await refresh();
    if (!S.doc) { S.doc = model.emptyDoc(); paint(); }
  } };
})();
