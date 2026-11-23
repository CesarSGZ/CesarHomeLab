// Tareas: the Microsoft To Do replacement, organised around the day. The same code runs inside Mission Control (#todo)
// and as its own home-screen app (/control/tareas/).
//   Hoy       routines as bubbles, what is due today, deadlines coming, projects in progress
//   Fechas    every deadline on a timeline
//   Rutinas   things done every day or some weekdays (a pill, training), with streaks
//   Proyectos one-off checklists with sections (a move), which Claude can create and update
//   Listas    tasks, the shopping list, and ideas as cards
(() => {
  const app = document.getElementById('todo-app');
  if (!app) return;
  const API = '/control/api/todo/status';
  let model, csrf = '', standalone = false;
  const read = (k, d) => { try { const v = localStorage.getItem('todo.' + k); return v === null ? d : JSON.parse(v); } catch { return d; } };
  const write = (k, v) => { try { localStorage.setItem('todo.' + k, JSON.stringify(v)); } catch { /* memory only */ } };
  const savedView = read('view', 'today');
  // doc is what the server last confirmed; the queue holds changes it has not taken yet, shown on top.
  const S = { doc: null, agent: null, queue: read('queue', []), view: savedView === 'myday' ? 'today' : savedView, pane: 'list', open: null, showDone: false, query: '', modal: null, preview: null, error: '', addDue: '', addSection: '', claudeTab: 'paste', claudeText: '', newKey: '', flash: '' };
  const E = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const today = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
  const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const MONTHS_LONG = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const WEEKDAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const DAY_LETTERS = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
  const cap = s => s.replace(/^./, c => c.toUpperCase());
  const view = () => { try { return model.applyOps(S.doc, S.queue); } catch { return S.doc; } };
  const UI_VIEWS = { today: 'Hoy', planned: 'Fechas', routines: 'Rutinas', important: 'Importante', all: 'Todas', search: 'Buscar' };

  // ---------- Icons ----------
  const I = {
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
    star: '<path d="M12 3.2l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.5l-5.2 2.8 1-5.8L3.5 9.4l5.9-.8z"/>',
    cal: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    all: '<path d="M7.5 8.5c-2 0-3.5 1.6-3.5 3.5s1.5 3.5 3.5 3.5c3.5 0 5.5-7 9-7 2 0 3.5 1.6 3.5 3.5s-1.5 3.5-3.5 3.5c-3.5 0-5.5-7-9-7z"/>',
    list: '<path d="M9 6.5h11M9 12h11M9 17.5h11"/><circle cx="4.8" cy="6.5" r="1"/><circle cx="4.8" cy="12" r="1"/><circle cx="4.8" cy="17.5" r="1"/>',
    cart: '<path d="M3 4h2.5l2.2 11h10.6L20.5 7H7"/><circle cx="9.5" cy="19" r="1.4"/><circle cx="17" cy="19" r="1.4"/>',
    idea: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.4 1.1 2.2h5c0-.8.4-1.6 1.1-2.2A6 6 0 0 0 12 3z"/>',
    flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
    flame: '<path d="M12 21c-3.9 0-6.5-2.6-6.5-6.2 0-3.4 2.4-5.4 3.6-8 .4 2 1.5 3.2 2.6 3.7C11.5 7.2 13 4.6 15.3 3c-.3 3 1.2 4.6 2.4 6.3 1 1.4 1.8 3 1.8 5.5 0 3.6-3.6 6.2-7.5 6.2z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
    back: '<path d="M15 5l-7 7 7 7"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    more: '<circle cx="5.5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="18.5" cy="12" r="1.3"/>',
    bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20.5a2 2 0 0 0 4 0"/>',
    repeat: '<path d="M4 11V9a3 3 0 0 1 3-3h12l-3-3M20 13v2a3 3 0 0 1-3 3H5l3 3"/>',
    note: '<path d="M5 4h10l4 4v12H5zM14 4v5h5M8.5 13h7M8.5 16.5h5"/>',
    trash: '<path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13M10 11v5.5M14 11v5.5"/>',
    upload: '<path d="M12 15V4M7.5 8.5L12 4l4.5 4.5M5 15v4.5h14V15"/>',
    home: '<path d="M4 11l8-7 8 7M6.5 9.5V20h11V9.5"/>',
    app: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
    spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/>',
    grid: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l8-8M16 7l3 3M14 9l2 2"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  };
  const icon = (name, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${I[name]}</svg>`;
  const glyph = look => (look.emoji ? `<i class="emoji" aria-hidden="true">${E(look.emoji)}</i>` : icon(look.icon));

  // ---------- Colours ----------
  const VIEW_LOOK = { today: ['sun', '#d9822b'], planned: ['cal', '#1d8378'], routines: ['flame', '#e0573b'], important: ['star', '#c4466f'], all: ['all', '#4f5fbd'], search: ['search', '#5c6673'] };
  const PALETTES = { tasks: ['#2564cf', '#8a4fc4', '#2e8556', '#00838f', '#6656a8', '#5c6f2a'], ideas: ['#b7791f', '#a35f12', '#9a6a00', '#b5562c'], check: ['#c4466f', '#2e8556'], project: ['#0f7b6c', '#3b5bdb', '#7048e8', '#c2255c', '#e8590c'], routine: ['#e0573b'] };
  const HABIT_COLOURS = ['#e0573b', '#1c7ed6', '#2f9e44', '#9c36b5', '#f08c00', '#0c8599', '#d6336c'];
  const hash = s => [...String(s)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  const pick = (arr, key) => arr[hash(key) % arr.length];
  const listColour = l => pick(PALETTES[l.kind] || PALETTES.tasks, l.id);
  const KIND_ICON = { tasks: 'list', ideas: 'idea', check: 'cart', project: 'flag', routine: 'flame' };
  const lookOf = (id, doc) => {
    if (VIEW_LOOK[id]) return { icon: VIEW_LOOK[id][0], colour: VIEW_LOOK[id][1], name: UI_VIEWS[id] };
    const l = doc.lists.find(x => x.id === id);
    if (!l) return lookOf('today', doc);
    const { emoji, name } = model.splitEmoji(l.name);
    return { icon: KIND_ICON[l.kind] || 'list', emoji, colour: listColour(l), name, list: l };
  };
  const habitLook = task => { const { emoji, name } = model.splitEmoji(task.title); return { emoji, name, colour: pick(HABIT_COLOURS, task.id) }; };

  // ---------- Dates ----------
  const t0 = () => today();
  function niceDate(date, t = t0()) {
    const d = new Date(date + 'T12:00:00Z');
    return `${WEEKDAYS[d.getUTCDay()].slice(0, 3)} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}${date.slice(0, 4) !== t.slice(0, 4) ? ' ' + date.slice(0, 4) : ''}`;
  }
  function dueLabel(date, t = t0()) {
    const n = model.daysUntil(date, t);
    if (n === 0) return 'Hoy';
    if (n === 1) return 'Mañana';
    if (n === -1) return 'Ayer';
    if (n > 1 && n < 7) return cap(WEEKDAYS[new Date(date + 'T12:00:00Z').getUTCDay()]);
    return niceDate(date, t);
  }
  const countdown = n => (n < 0 ? `hace ${-n} d` : n === 0 ? 'hoy' : n === 1 ? 'mañana' : `en ${n} días`);
  const REPEAT_LABEL = { day: ['Cada día', 'días'], week: ['Cada semana', 'semanas'], month: ['Cada mes', 'meses'], year: ['Cada año', 'años'] };
  const repeatText = r => (r.interval === 1 ? REPEAT_LABEL[r.every][0] : `Cada ${r.interval} ${REPEAT_LABEL[r.every][1]}`);
  // The Hoy header changes with the time of day.
  const moment = () => { const h = new Date().getHours(); return h < 6 ? ['Buenas noches', 'night'] : h < 13 ? ['Buenos días', 'morning'] : h < 21 ? ['Buenas tardes', 'afternoon'] : ['Buenas noches', 'night']; };

  // ---------- Network ----------
  async function call(method, body) {
    const r = await fetch(API, { method, credentials: 'same-origin', headers: { accept: 'application/json', ...(method === 'POST' ? { 'x-csrf-token': csrf, 'content-type': 'application/json' } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
    if (r.status === 401) { location.replace(standalone ? '/control/login?app=tareas' : '/control/login'); throw new Error('session'); }
    const out = await r.json();
    if (!out.ok) { const e = new Error(out.error || 'unavailable'); e.status = r.status; throw e; }
    return out;
  }
  const docOf = out => ({ v: out.v, lists: out.lists });
  let flushing = false;
  async function flush() {
    if (flushing || !S.queue.length) return paintStatus();
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

  // ---------- Frame ----------
  let root;
  function paint() {
    if (!S.doc) return;
    if (!root) {
      app.innerHTML = `<div class="todo" id="todo-root"><aside class="todo-nav" id="todo-nav" aria-label="Listas"></aside><main class="todo-main" id="todo-main"></main>
        <aside class="todo-detail" id="todo-detail" aria-label="Detalles" hidden></aside><nav class="todo-tabs" id="todo-tabs" aria-label="Secciones"></nav><div class="todo-modal" id="todo-modal" hidden></div></div>`;
      root = document.getElementById('todo-root');
    }
    const doc = view(), t = t0();
    if (!UI_VIEWS[S.view] && !doc.lists.some(l => l.id === S.view)) S.view = 'today';
    if (S.open && !find(S.open)) { S.open = null; if (S.pane === 'detail') S.pane = 'list'; }
    root.dataset.pane = S.pane;
    root.classList.toggle('has-detail', !!S.open);
    paintNav(doc, t);
    paintMain(doc, t);
    paintTabs();
    // A field being edited in the open task keeps its panel as it is, so typing or the next tap is not lost.
    const detail = document.getElementById('todo-detail'), typing = detail.contains(document.activeElement) && /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
    if (!typing || !S.open) paintDetail(doc, t);
    paintModal();
    paintSummary(doc, t);
    S.flash = '';
  }
  // Phone: a tab bar like a native app, with the add button in the middle.
  function paintTabs() {
    const tab = (id, label, ic) => { const on = id === 'lists' ? S.pane === 'nav' : S.pane !== 'nav' && S.view === id; return `<button type="button" data-tab="${id}" aria-current="${on ? 'page' : 'false'}">${icon(ic)}<span>${label}</span></button>`; };
    document.getElementById('todo-tabs').innerHTML = tab('today', 'Hoy', 'sun') + tab('planned', 'Fechas', 'cal') + `<button type="button" class="todo-fab" data-act="quick-add" aria-label="Añadir">${icon('plus')}</button>` + tab('routines', 'Rutinas', 'flame') + tab('lists', 'Listas', 'grid');
  }

  function paintNav(doc, t) {
    const c = model.counts(doc, t);
    c.today = todayRows(doc, t).length; c.routines = model.routinesToday(doc, t).filter(r => !model.doneOn(r.task, t)).length;
    const item = (id, extra = '') => { const look = lookOf(id, doc); return `<button type="button" class="todo-nav-item" data-nav="${E(id)}" aria-current="${S.view === id && S.pane !== 'nav' ? 'page' : 'false'}" style="--c:${look.colour}">${glyph(look)}<span>${E(look.name)}</span>${extra || (c[id] ? `<b>${c[id]}</b>` : '')}</button>`; };
    const by = kinds => doc.lists.filter(l => kinds.includes(l.kind));
    const projects = by(['project']), lists = by(['tasks', 'check']), ideas = by(['ideas']);
    const ring = l => { const p = model.progress(l), pct = p.total ? p.done / p.total : 0; return `<svg class="mini-ring" viewBox="0 0 20 20" role="img" aria-label="${p.done} de ${p.total}"><circle cx="10" cy="10" r="8"/><circle cx="10" cy="10" r="8" class="on" stroke-dasharray="${(pct * 50.3).toFixed(1)} 60"/></svg>`; };
    document.getElementById('todo-nav').innerHTML = `
      <div class="todo-nav-top"><p class="todo-brand">${icon('check', 'brand')}<span>Tareas</span></p>
        <label class="todo-search">${icon('search')}<input type="search" id="todo-q" placeholder="Buscar" value="${E(S.query)}" aria-label="Buscar en todas las listas" enterkeyhint="search"></label></div>
      <div class="todo-nav-group">${['today', 'planned', 'routines', 'important'].map(id => item(id)).join('')}</div>
      <div class="todo-nav-group"><p class="todo-nav-head">Proyectos<button type="button" class="todo-nav-plus" data-act="claude" aria-label="Nuevo proyecto desde Claude">${icon('plus')}</button></p>${projects.map(l => item(l.id, ring(l))).join('') || '<p class="todo-nav-empty">Checklists como una mudanza. Pégalas desde un chat con Claude.</p>'}</div>
      <div class="todo-nav-group"><p class="todo-nav-head">Listas</p>${lists.map(l => item(l.id)).join('')}</div>
      ${ideas.length ? `<div class="todo-nav-group"><p class="todo-nav-head">Ideas</p>${ideas.map(l => item(l.id)).join('')}</div>` : ''}
      <div class="todo-nav-foot">
        <button type="button" class="todo-nav-item add" data-act="new-list">${icon('plus')}<span>Nueva lista</span></button>
        <button type="button" class="todo-nav-item add" data-act="claude">${icon('spark')}<span>Desde Claude</span></button>
        <div class="todo-nav-small"><button type="button" data-nav="all">${icon('all')}Todas</button><button type="button" data-act="import">${icon('upload')}To Do</button>
          ${standalone ? `<a href="/control/">${icon('home')}Mission Control</a>` : `<a href="/control/tareas/">${icon('app')}Abrir como app</a>`}</div>
      </div>`;
  }

  // ---------- Middle ----------
  function frame(look, sub, body, add, extraHead = '') {
    return `<div class="todo-main-bg${S.view === 'today' ? ' is-today' : ''}" style="--c:${look.colour}">
      ${S.view === 'today' ? '' : `<header class="todo-main-head">
        <button type="button" class="todo-icon-btn todo-back" data-act="to-nav" aria-label="Listas">${icon('back')}</button>
        <div><h1>${glyph(look)}<span>${E(look.name)}</span></h1>${sub ? `<p>${E(sub)}</p>` : ''}</div>
        ${look.list ? `<button type="button" class="todo-icon-btn" data-act="list-menu" aria-label="Opciones de la lista">${icon('more')}</button>` : ''}
      </header>${extraHead}`}
      <p class="todo-status" id="todo-status" role="status"></p>
      <div class="todo-scroll" id="todo-scroll">${body}</div>${add}</div>`;
  }
  function addBar(placeholder, { dates = true, sectionsOf = null } = {}) {
    const t = t0();
    const quick = S.addDue ? `<button type="button" class="todo-chip on" data-act="clear-due">${icon('cal')}${E(dueLabel(S.addDue, t))} ×</button>` : '';
    const secs = sectionsOf ? [...new Set([...model.sections(sectionsOf).map(s => s.name), S.addSection].filter(Boolean))] : [];
    const current = S.addSection || secs.at(-1) || '';
    return `<form class="todo-add" id="todo-add" autocomplete="off">
      <div class="todo-add-row">${icon('plus')}<input id="todo-title" maxlength="400" placeholder="${E(placeholder)}" aria-label="${E(placeholder)}" enterkeyhint="done"></div>
      <div class="todo-add-tools">${sectionsOf ? `<label class="todo-chip sel">${icon('flag')}<select id="todo-add-section" aria-label="Sección">${(secs.length ? secs : ['']).map(n => `<option value="${E(n)}" ${n === current ? 'selected' : ''}>${E(n || 'General')}</option>`).join('')}<option value="__new">Nueva sección…</option></select></label>` : ''}
        ${dates ? `${quick}${S.addDue ? '' : `<button type="button" class="todo-chip" data-quick="${t}">Hoy</button><button type="button" class="todo-chip" data-quick="${model.addDays(t, 1)}">Mañana</button>`}
        <label class="todo-chip pick">${icon('cal')}<span>Fecha</span><input type="date" id="todo-add-date" aria-label="Fecha límite"></label>` : ''}
        <span class="todo-add-hint" id="todo-add-hint"></span><button type="submit" class="todo-add-go">Añadir</button></div></form>`;
  }
  function paintMain(doc, t) {
    const look = lookOf(S.view, doc), list = look.list;
    let html;
    if (S.view === 'today') html = frame(look, '', paintToday(doc, t), addBar('Añadir algo para hoy («Llamar al taller el viernes»)'));
    else if (S.view === 'routines') html = frame(look, routineSub(doc, t), paintRoutines(doc, t), addBar('Nueva rutina: 💊 Pastilla, 🏋️ Entrenar…', { dates: false }));
    else if (list?.kind === 'project') { const p = model.progress(list); html = frame(look, `${p.done} de ${p.total} hechas`, paintProject(list, t), addBar('Añadir a la checklist', { sectionsOf: list }), projectBar(p)); }
    else html = frame(look, ...paintList(doc, t, look));
    document.getElementById('todo-main').innerHTML = html;
    paintStatus();
  }
  function paintList(doc, t, look) {
    const list = look.list, ideas = list?.kind === 'ideas', checklist = list?.kind === 'check';
    const rows = model.tasksFor(doc, S.view, t, S.query), open = rows.filter(r => !r.task.done), done = rows.filter(r => r.task.done);
    const sub = S.view === 'search' ? (S.query ? `${rows.length} resultado${rows.length === 1 ? '' : 's'} para «${S.query}»` : 'Escribe para buscar en todas las listas.')
      : open.length ? `${open.length} ${ideas ? 'idea' : checklist ? 'por comprar' : 'pendiente'}${open.length === 1 || checklist ? '' : 's'}` : '';
    let body = '';
    if (checklist) body = paintChecklist(open, done, t);
    else if (S.view === 'planned') body = paintPlanned(open, t);
    else if (ideas) body = open.length ? `<div class="todo-cards">${open.map(r => card(r, t)).join('')}</div>` : '';
    else if (open.length) body = `<ul class="todo-rows">${open.map(r => row(r, t)).join('')}</ul>`;
    if (!open.length && S.view !== 'search' && !checklist && S.view !== 'planned') body = emptyState(ideas);
    if (S.view !== 'planned' && !checklist && done.length) body += doneBlock(done, t);
    const add = S.view === 'search' ? '' : addBar(ideas ? 'Añadir una idea' : checklist ? 'Añadir artículo' : 'Añadir una tarea', { dates: !checklist });
    return [sub, body, add];
  }
  function doneBlock(done, t) {
    done.sort((a, b) => (b.task.completed || '').localeCompare(a.task.completed || ''));
    return `<button type="button" class="todo-done-toggle" data-act="show-done" aria-expanded="${S.showDone}">${icon('back', S.showDone ? 'down' : 'right')}Completadas <b>${done.length}</b></button>${S.showDone ? `<ul class="todo-rows">${done.slice(0, 300).map(r => row(r, t)).join('')}</ul>` : ''}`;
  }
  function emptyState(ideas) {
    const text = S.view === 'important' ? ['Nada marcado', 'Pulsa la estrella de una tarea para tenerla aquí.']
      : S.view === 'planned' ? ['Sin fechas', 'Escribe «mañana», «el viernes» o «30/11» al final de una tarea y se le pone la fecha.']
      : ideas ? ['Aún no hay ideas', 'Regalos, planes, sitios, películas… apúntalas sin fecha ni prisa.']
      : ['Todo hecho', 'No queda nada pendiente en esta lista.'];
    return `<div class="todo-empty">${icon(ideas ? 'idea' : S.view === 'planned' ? 'cal' : 'check')}<b>${text[0]}</b><p>${text[1]}</p></div>`;
  }

  // ---------- Hoy ----------
  const todayRows = (doc, t) => model.tasksFor(doc, 'myday', t).filter(r => !r.task.done);
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  function paintToday(doc, t) {
    const [hello, part] = moment(), d = new Date(t + 'T12:00:00Z');
    const routines = model.routinesToday(doc, t), routinesDone = routines.filter(r => model.doneOn(r.task, t)).length;
    const now = todayRows(doc, t).sort((a, b) => (a.task.due || '9').localeCompare(b.task.due || '9'));
    const doneToday = model.tasksFor(doc, 'myday', t).filter(r => r.task.done && (r.task.completed || '').slice(0, 10) === t);
    const soon = model.upcoming(doc, t, 80).filter(r => r.task.due > t && model.daysUntil(r.task.due, t) <= 21).slice(0, 12);
    const week = soon.filter(r => model.daysUntil(r.task.due, t) <= 7).length;
    const projects = doc.lists.filter(l => l.kind === 'project').map(l => ({ l, p: model.progress(l) })).filter(x => x.p.total && x.p.done < x.p.total);
    const total = routines.length + now.length + doneToday.length, finished = routinesDone + doneToday.length, pct = total ? finished / total : 0;
    const bits = [routines.length > routinesDone ? plural(routines.length - routinesDone, 'rutina', 'rutinas') : '', now.length ? plural(now.length, 'tarea', 'tareas') : '', week ? plural(week, 'plazo esta semana', 'plazos esta semana') : ''].filter(Boolean);
    const hero = `<section class="hoy-hero sky-${part}">
      <button type="button" class="todo-icon-btn todo-back light" data-act="to-nav" aria-label="Listas">${icon('back')}</button>
      <div class="hoy-date"><small>${WEEKDAYS[d.getUTCDay()]}</small><b>${d.getUTCDate()}</b><span>${MONTHS_LONG[d.getUTCMonth()]}</span></div>
      <div class="hoy-hello"><h1>${hello}</h1><p>${bits.length ? 'Te queda: ' + E(bits.join(' · ')) : total ? 'Día redondo. Nada pendiente.' : 'Día libre. Añade algo abajo o crea una rutina.'}</p></div>
      <div class="hoy-ring" role="img" aria-label="${Math.round(pct * 100)} % del día hecho"><svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="27"/><circle cx="32" cy="32" r="27" class="on" stroke-dasharray="${(pct * 169.6).toFixed(1)} 200"/></svg><b>${Math.round(pct * 100)}<small>%</small></b></div>
    </section>`;
    const bubbles = routines.length ? `<div class="bubbles">${routines.map(r => bubble(r.task, t)).join('')}</div>`
      : `<div class="hoy-invite"><p>Lo que haces cada día, en un toque. Empieza por:</p><div class="todo-chips">${['💊 Pastilla', '🏋️ Entrenar', '💧 Beber agua', '📖 Leer 20 min', '🧘 Estirar'].map(x => `<button type="button" class="todo-chip" data-new-routine="${E(x)}">${E(x)}</button>`).join('')}</div></div>`;
    const deadlineCards = `<div class="deadlines">${soon.map(r => { const n = model.daysUntil(r.task.due, t), { emoji, name } = model.splitEmoji(r.list.name); return `<button type="button" class="deadline ${n <= 2 ? 'hot' : n <= 7 ? 'warm' : ''}" data-open-task="${E(r.task.id)}"><b>${n}</b><small>${n === 1 ? 'día' : 'días'}</small><span>${E(r.task.title)}</span><em>${emoji ? E(emoji) + ' ' : ''}${E(name)} · ${E(niceDate(r.task.due, t))}</em></button>`; }).join('')}</div>`;
    const projectCards = `<div class="project-cards">${projects.map(({ l, p }) => { const look = lookOf(l.id, doc), next = l.tasks.find(x => !x.done); return `<button type="button" class="project-card" data-nav="${E(l.id)}" style="--c:${look.colour}"><span class="pc-name">${look.emoji ? `<i class="emoji">${E(look.emoji)}</i>` : icon('flag')}${E(look.name)}</span><span class="pc-bar"><i style="width:${(p.done / p.total * 100).toFixed(1)}%"></i></span><span class="pc-meta"><b>${Math.round(p.done / p.total * 100)}%</b> · ${p.done}/${p.total}${next ? ` · sigue: ${E(next.title)}` : ''}</span></button>`; }).join('')}</div>`;
    return `${hero}
      <section class="hoy-block"><h2>${icon('flame')}Rutinas de hoy${routines.length ? `<small>${routinesDone}/${routines.length}</small>` : ''}<button type="button" class="hoy-link" data-nav="routines">Ver todas</button></h2>${bubbles}</section>
      <section class="hoy-block"><h2>${icon('sun')}Para hoy${now.length ? `<small>${now.length}</small>` : ''}</h2>${now.length ? `<ul class="todo-rows">${now.map(r => row(r, t)).join('')}</ul>` : '<p class="hoy-quiet">Nada que venza hoy. Lo que añadas abajo aparece aquí.</p>'}
        ${doneToday.length ? `<p class="hoy-done">${icon('check')}${plural(doneToday.length, 'hecha', 'hechas')} hoy: ${doneToday.slice(0, 4).map(r => E(r.task.title)).join(', ')}${doneToday.length > 4 ? '…' : ''}</p>` : ''}</section>
      ${soon.length ? `<section class="hoy-block"><h2>${icon('cal')}Se acerca<button type="button" class="hoy-link" data-nav="planned">Todas las fechas</button></h2>${deadlineCards}</section>` : ''}
      ${projects.length ? `<section class="hoy-block"><h2>${icon('flag')}Proyectos en marcha</h2>${projectCards}</section>` : ''}`;
  }
  function bubble(task, t) {
    const look = habitLook(task), done = model.doneOn(task, t), st = model.streak(task, t);
    return `<button type="button" class="bubble${done ? ' done' : ''}" data-habit="${E(task.id)}" aria-pressed="${done}" style="--c:${look.colour}" aria-label="${E(look.name)}${done ? ', hecha' : ''}">
      <span class="bubble-orb">${look.emoji ? `<i class="emoji">${E(look.emoji)}</i>` : `<i class="initial">${E(look.name.slice(0, 1).toUpperCase())}</i>`}<span class="bubble-tick">${icon('check')}</span></span>
      <span class="bubble-name">${E(look.name)}</span><small>${task.habit?.time ? E(task.habit.time) : ''}${st ? `${task.habit?.time ? ' · ' : ''}🔥${st}` : ''}</small></button>`;
  }

  // ---------- Rutinas ----------
  function routineSub(doc, t) { const r = model.routinesToday(doc, t); return r.length ? `Hoy: ${r.filter(x => model.doneOn(x.task, t)).length} de ${r.length}` : 'Lo que se repite cada día o algunos días.'; }
  function paintRoutines(doc, t) {
    const rows = model.routineRows(doc);
    if (!rows.length) return `<div class="todo-empty">${icon('flame')}<b>Tus rutinas</b><p>La pastilla, entrenar, leer… Se reinician cada día y llevan la cuenta de tu racha.</p><div class="todo-chips center">${['💊 Pastilla', '🏋️ Entrenar', '💧 Beber agua', '📖 Leer 20 min'].map(x => `<button type="button" class="todo-chip" data-new-routine="${E(x)}">${E(x)}</button>`).join('')}</div></div>`;
    return `<div class="routine-cards">${rows.map(({ task }) => {
      const look = habitLook(task), due = model.habitDue(task, t), done = model.doneOn(task, t), st = model.streak(task, t);
      const hist = model.habitHistory(task, t, 28);
      return `<article class="routine-card${S.open === task.id ? ' sel' : ''}${due ? '' : ' rest'}" style="--c:${look.colour}">
        <button type="button" class="routine-toggle${done ? ' done' : ''}" data-habit="${E(task.id)}" aria-pressed="${done}" aria-label="${E(look.name)}: hecha hoy">${look.emoji ? `<i class="emoji">${E(look.emoji)}</i>` : icon('check')}</button>
        <button type="button" class="routine-body" data-open-task="${E(task.id)}"><b>${E(look.name)}</b><small>${E(model.scheduleText(task.habit))}${due ? '' : ' · hoy descansa'}</small></button>
        <span class="routine-streak${st ? '' : ' zero'}" title="Racha">${icon('flame')}<b>${st}</b></span>
        <div class="heat" aria-label="Últimas 4 semanas">${hist.map(h => `<i class="${h.done ? 'on' : h.due ? 'miss' : 'off'}${h.date === t ? ' now' : ''}" title="${h.date}"></i>`).join('')}</div>
      </article>`;
    }).join('')}</div>`;
  }

  // ---------- Proyectos ----------
  const projectBar = p => `<div class="project-progress"><span><i style="width:${p.total ? (p.done / p.total * 100).toFixed(1) : 0}%"></i></span><b>${p.total ? Math.round(p.done / p.total * 100) : 0}%</b></div>`;
  function paintProject(list, t) {
    if (!list.tasks.length) return `<div class="todo-empty">${icon('flag')}<b>Checklist vacía</b><p>Añade cosas abajo, o pega la lista que te haya hecho Claude en «Desde Claude».</p></div>`;
    return model.sections(list).map(g => {
      const d = g.tasks.filter(x => x.done).length;
      return `<section class="project-section${d === g.tasks.length ? ' complete' : ''}"><h3><span>${E(g.name || 'General')}</span><small>${d}/${g.tasks.length}</small><i class="sec-bar"><i style="width:${(d / g.tasks.length * 100).toFixed(1)}%"></i></i></h3>
        <ul class="todo-rows">${g.tasks.map(task => row({ task, list }, t)).join('')}</ul></section>`;
    }).join('');
  }

  // ---------- Rows, cards, timeline ----------
  function meta({ task, list }, t, withDue = true) {
    const m = [];
    if (UI_VIEWS[S.view]) { const { emoji, name } = model.splitEmoji(list.name); m.push(`<span>${emoji ? E(emoji) + ' ' : ''}${E(name)}</span>`); }
    if (task.myDay === t && S.view !== 'today') m.push(`<span>${icon('sun')}Hoy</span>`);
    if (task.steps.length) m.push(`<span>${task.steps.filter(s => s.done).length} de ${task.steps.length}</span>`);
    if (withDue && task.due) { const n = model.daysUntil(task.due, t); m.push(`<span class="due ${!task.done && n < 0 ? 'late' : n === 0 ? 'now' : ''}">${icon('cal')}${n < 0 && !task.done ? 'Vencida, ' + niceDate(task.due, t) : dueLabel(task.due, t)}</span>`); }
    if (task.reminder) m.push(`<span>${icon('bell')}</span>`);
    if (task.repeat) m.push(`<span>${icon('repeat')}</span>`);
    if (task.note.trim()) m.push(`<span>${icon('note')}Nota</span>`);
    return m.length ? `<small class="todo-meta">${m.join('<i>•</i>')}</small>` : '';
  }
  const check = task => `<button type="button" class="todo-check" data-toggle="${E(task.id)}" aria-pressed="${task.done}" aria-label="${task.done ? 'Marcar como pendiente' : 'Completar'}: ${E(task.title)}"></button>`;
  const star = task => `<button type="button" class="todo-star" data-star="${E(task.id)}" aria-pressed="${task.important}" aria-label="Importante">${icon('star')}</button>`;
  function row(r, t, extra = '') {
    const { task } = r;
    return `<li class="todo-row${task.done ? ' done' : ''}${S.open === task.id ? ' sel' : ''}${S.flash === task.id ? ' flash' : ''}">${check(task)}<button type="button" class="todo-row-body" data-open-task="${E(task.id)}"><span>${E(task.title)}</span>${meta(r, t, !extra)}</button>${extra}${star(task)}</li>`;
  }
  function card(r, t) {
    const { task } = r, note = task.note.trim();
    return `<article class="todo-card${S.open === task.id ? ' sel' : ''}"><button type="button" class="todo-card-body" data-open-task="${E(task.id)}"><b>${E(task.title)}</b>${note ? `<p>${E(note.slice(0, 220))}</p>` : ''}${meta(r, t)}</button>
      <div class="todo-card-foot">${check(task)}${star(task)}</div></article>`;
  }
  // The shopping list: what is needed on top, everything ticked below in alphabetical order, one tap to need it again.
  function paintChecklist(open, done, t) {
    done.sort((a, b) => a.task.title.localeCompare(b.task.title, 'es', { sensitivity: 'base' }));
    const top = open.length ? `<p class="todo-group">Por comprar <b>${open.length}</b></p><ul class="todo-rows">${open.map(r => row(r, t)).join('')}</ul>`
      : `<div class="todo-empty small">${icon('cart')}<b>No falta nada</b><p>Toca lo que necesites de abajo, o escríbelo.</p></div>`;
    return top + (done.length ? `<p class="todo-group muted">Marcado <b>${done.length}</b><small>toca para volver a ponerlo</small></p><ul class="todo-rows compact">${done.map(r => row(r, t)).join('')}</ul>` : '');
  }
  // Fechas: a two-week strip on top, then the timeline.
  function paintPlanned(open, t) {
    const late = open.filter(r => r.task.due < t).length;
    const strip = Array.from({ length: 14 }, (_, i) => { const date = model.addDays(t, i), n = open.filter(r => r.task.due === date).length, d = new Date(date + 'T12:00:00Z'); return `<span class="day${i === 0 ? ' now' : ''}${n ? ' has' : ''}${[0, 6].includes(d.getUTCDay()) ? ' we' : ''}"><small>${DAY_LETTERS[d.getUTCDay()]}</small><b>${d.getUTCDate()}</b><i>${n ? '●'.repeat(Math.min(n, 3)) : ''}</i></span>`; }).join('');
    const groups = [];
    for (const r of open) {
      const n = model.daysUntil(r.task.due, t);
      const key = n < 0 ? 'Vencidas' : n === 0 ? 'Hoy' : n === 1 ? 'Mañana' : n < 7 ? cap(WEEKDAYS[new Date(r.task.due + 'T12:00:00Z').getUTCDay()]) + ' ' + +r.task.due.slice(8) : n < 31 ? 'Este mes' : 'Más adelante';
      (groups.at(-1)?.key === key ? groups.at(-1) : (groups.push({ key, rows: [], late: n < 0 }), groups.at(-1))).rows.push(r);
    }
    return `<div class="day-strip">${late ? `<span class="day late"><small>!</small><b>${late}</b><i>tarde</i></span>` : ''}${strip}</div>`
      + (groups.length ? groups.map(g => `<p class="todo-group${g.late ? ' late' : ''}">${E(g.key)} <b>${g.rows.length}</b></p><ul class="todo-rows">${g.rows.map(r => { const n = model.daysUntil(r.task.due, t); return row(r, t, `<span class="todo-count ${n < 0 ? 'late' : n === 0 ? 'now' : n <= 2 ? 'soon' : ''}"><b>${n < 0 ? -n : n}</b>${n < 0 ? 'días tarde' : n === 0 ? 'hoy' : n === 1 ? 'día' : 'días'}</span>`); }).join('')}</ul>`).join('') : emptyState(false));
  }
  function paintStatus() {
    const el = document.getElementById('todo-status');
    if (el) el.textContent = S.error || (S.queue.length ? `${S.queue.length} cambio${S.queue.length === 1 ? '' : 's'} sin guardar · reintentando` : '');
  }

  // ---------- Detail panel ----------
  const find = id => { for (const list of view().lists) { const task = list.tasks.find(x => x.id === id); if (task) return { task, list }; } return null; };
  function paintDetail(doc, t) {
    const el = document.getElementById('todo-detail'), f = S.open && find(S.open);
    el.hidden = !f;
    if (!f) { el.innerHTML = ''; return; }
    const { task, list } = f;
    if (list.kind === 'routine') return paintRoutineDetail(el, task, t);
    const ideas = list.kind === 'ideas';
    const dn = task.due ? model.daysUntil(task.due, t) : 0;
    const dueText = !task.due ? '' : dn < 0 ? `Vencida el ${niceDate(task.due, t)}` : dn < 7 ? `Vence ${dueLabel(task.due, t).toLowerCase()} · ${niceDate(task.due, t)}` : `Vence el ${niceDate(task.due, t)}`;
    const dueBits = task.due ? `<span class="todo-chip on${dn < 0 && !task.done ? ' late' : ''}">${icon('cal')}${E(dueText)}</span><button type="button" class="todo-chip" data-due="">Quitar</button>`
      : `<button type="button" class="todo-chip" data-due="${t}">Hoy</button><button type="button" class="todo-chip" data-due="${model.addDays(t, 1)}">Mañana</button><button type="button" class="todo-chip" data-due="${model.addDays(t, 7)}">En una semana</button>`;
    const secs = list.kind === 'project' ? [...new Set(list.tasks.map(x => x.section).filter(Boolean))] : [];
    el.innerHTML = `<div class="todo-detail-in">
      <header class="todo-detail-head"><button type="button" class="todo-icon-btn" data-act="close-detail" aria-label="Cerrar">${icon('back', 'only-narrow')}${icon('close', 'only-wide')}</button><span>${E(list.name)}</span></header>
      <section class="todo-box">
        <div class="todo-title-row">${check(task)}<textarea id="td-f-title" rows="1" maxlength="400" aria-label="Título">${E(task.title)}</textarea>${star(task)}</div>
        <ul class="todo-steps">${task.steps.map(s => `<li><button type="button" class="todo-check small" data-step="${E(s.id)}" aria-pressed="${s.done}" aria-label="Paso hecho"></button><span class="${s.done ? 'done' : ''}">${E(s.title)}</span><button type="button" class="todo-icon-btn tiny" data-del-step="${E(s.id)}" aria-label="Quitar paso">${icon('close')}</button></li>`).join('')}</ul>
        <form id="td-step-add" class="todo-step-add" autocomplete="off">${icon('plus')}<input id="td-f-step" maxlength="400" placeholder="${task.steps.length ? 'Siguiente paso' : 'Agregar paso'}" aria-label="Nuevo paso"></form>
      </section>
      ${ideas ? '' : `<section class="todo-box"><button type="button" class="todo-line ${task.myDay === t ? 'on' : ''}" data-act="myday">${icon('sun')}<span>${task.myDay === t ? 'En «Hoy»' : 'Añadir a Hoy'}</span>${task.myDay === t ? icon('close', 'end') : ''}</button></section>`}
      <section class="todo-box">
        <div class="todo-line static">${icon('cal')}<span>${ideas ? 'Fecha (opcional)' : 'Fecha límite'}</span></div>
        <div class="todo-chips">${dueBits}<label class="todo-chip pick">${icon('cal')}<span>Elegir</span><input type="date" id="td-f-due" value="${E(task.due)}" aria-label="Elegir fecha"></label></div>
        <label class="todo-line">${icon('bell')}<span>Recordarme</span><input type="datetime-local" id="td-f-reminder" value="${E(task.reminder)}" aria-label="Recordatorio"></label>
        <label class="todo-line">${icon('repeat')}<span>Repetir</span><select id="td-f-repeat"><option value="">Nunca</option>${model.REPEATS.map(r => `<option value="${r}" ${task.repeat?.every === r ? 'selected' : ''}>${REPEAT_LABEL[r][0]}</option>`).join('')}</select>
          ${task.repeat ? `<input type="number" id="td-f-interval" min="1" max="99" value="${task.repeat.interval}" aria-label="Cada cuántos">` : ''}</label>
        ${task.repeat ? `<p class="todo-hint">${E(repeatText(task.repeat))}: al completarla aparece la siguiente.</p>` : ''}
      </section>
      <section class="todo-box"><label class="todo-line">${icon(KIND_ICON[list.kind] || 'list')}<span>Lista</span><select id="td-f-list">${doc.lists.filter(l => l.kind !== 'routine').map(l => `<option value="${E(l.id)}" ${l.id === list.id ? 'selected' : ''}>${E(l.name)}</option>`).join('')}</select></label>
        ${list.kind === 'project' ? `<label class="todo-line">${icon('flag')}<span>Sección</span><input id="td-f-section" list="td-sections" maxlength="80" value="${E(task.section)}" placeholder="General"><datalist id="td-sections">${secs.map(s => `<option value="${E(s)}">`).join('')}</datalist></label>` : ''}</section>
      <section class="todo-box"><textarea id="td-f-note" class="todo-note" rows="6" maxlength="20000" placeholder="Agregar nota" aria-label="Nota">${E(task.note)}</textarea></section>
      <footer class="todo-detail-foot"><span>${task.done && task.completed ? `Completada el ${E(niceDate(task.completed.slice(0, 10), t))}` : `Creada el ${E(niceDate(task.created.slice(0, 10), t))}`}</span>
        <button type="button" class="todo-icon-btn danger" data-act="delete-task" aria-label="Eliminar">${icon('trash')}</button></footer></div>`;
    const title = document.getElementById('td-f-title');
    title.style.height = 'auto'; title.style.height = title.scrollHeight + 'px';
  }
  function paintRoutineDetail(el, task, t) {
    const look = habitLook(task), days = task.habit?.days || [], st = model.streak(task, t), hist = model.habitHistory(task, t, 56);
    const doneDays = hist.filter(h => h.done).length, dueDays = hist.filter(h => h.due).length;
    el.innerHTML = `<div class="todo-detail-in" style="--c:${look.colour}">
      <header class="todo-detail-head"><button type="button" class="todo-icon-btn" data-act="close-detail" aria-label="Cerrar">${icon('back', 'only-narrow')}${icon('close', 'only-wide')}</button><span>Rutina</span></header>
      <section class="todo-box routine-hero"><span class="routine-big">${look.emoji ? `<i class="emoji">${E(look.emoji)}</i>` : icon('flame')}</span>
        <textarea id="td-f-title" rows="1" maxlength="400" aria-label="Nombre (puede empezar con un emoji)">${E(task.title)}</textarea>
        <div class="routine-stats"><span><b>${st}</b>racha</span><span><b>${dueDays ? Math.round(doneDays / dueDays * 100) : 0}%</b>8 semanas</span><span><b>${(task.log || []).length}</b>veces</span></div></section>
      <section class="todo-box"><div class="todo-line static">${icon('cal')}<span>¿Qué días?</span></div>
        <div class="todo-chips days"><button type="button" class="todo-chip${days.length ? '' : ' on'}" data-days="all">Cada día</button>${[1, 2, 3, 4, 5, 6, 0].map(d => `<button type="button" class="todo-chip day${days.includes(d) ? ' on' : ''}" data-day="${d}" aria-pressed="${days.includes(d)}">${DAY_LETTERS[d]}</button>`).join('')}</div>
        <label class="todo-line">${icon('bell')}<span>Hora (opcional)</span><input type="time" id="td-f-time" value="${E(task.habit?.time || '')}"></label></section>
      <section class="todo-box"><div class="todo-line static">${icon('grid')}<span>Últimas 8 semanas</span></div><div class="heat big">${hist.map(h => `<i class="${h.done ? 'on' : h.due ? 'miss' : 'off'}${h.date === t ? ' now' : ''}" title="${h.date}"></i>`).join('')}</div>
        <p class="todo-hint">¿Se te olvidó marcar algún día? Tócalo:</p><div class="todo-chips">${hist.slice(-7).map(h => `<button type="button" class="todo-chip${h.done ? ' on' : ''}" data-log="${h.date}">${DAY_LETTERS[model.weekday(h.date)]} ${+h.date.slice(8)}</button>`).join('')}</div></section>
      <section class="todo-box"><textarea id="td-f-note" class="todo-note" rows="4" maxlength="20000" placeholder="Notas (dosis, ejercicios…)" aria-label="Nota">${E(task.note)}</textarea></section>
      <footer class="todo-detail-foot"><span>Desde el ${E(niceDate(task.created.slice(0, 10), t))}</span><button type="button" class="todo-icon-btn danger" data-act="delete-task" aria-label="Eliminar rutina">${icon('trash')}</button></footer></div>`;
    const title = document.getElementById('td-f-title');
    title.style.height = 'auto'; title.style.height = title.scrollHeight + 'px';
  }

  // ---------- Modals ----------
  const CLAUDE_PROMPT = 'Pásame esto como checklist en este formato exacto, sin nada más (lo voy a pegar en mi app de tareas):\n\n# 🇩🇪 Nombre del proyecto\n## Sección\n- [ ] Tarea (si tiene fecha límite, al final: 15/01/2027)\n- [x] Tarea que ya está hecha\n  - paso opcional dentro de una tarea\n## Otra sección\n- [ ] …';
  const kindOption = (value, label, hint, checked = false, ic = KIND_ICON[value]) => `<label><input type="radio" name="kind" value="${value}" ${checked ? 'checked' : ''}><span>${icon(ic || 'list')}<b>${label}</b><small>${hint}</small></span></label>`;
  function paintModal() {
    const el = document.getElementById('todo-modal');
    if (!S.modal) { el.hidden = true; el.innerHTML = ''; el.dataset.kind = ''; return; }
    const key = [S.modal, S.claudeTab, S.newKey, S.agent?.created, S.preview ? JSON.stringify(S.preview.summary || S.preview.error) : ''].join('|');
    if (el.dataset.kind === key && !el.hidden) return;
    el.dataset.kind = key;
    el.hidden = false;
    let inner = '';
    if (S.modal === 'new-list') {
      inner = `<h2>Nueva lista</h2><form id="td-new-list" autocomplete="off"><input id="td-f-newname" maxlength="120" placeholder="Nombre (puede empezar con un emoji: 🎁 Regalos)" aria-label="Nombre de la lista" required>
        <div class="todo-kind four">${kindOption('tasks', 'Tareas', 'Cosas que hacer, con fechas', true)}${kindOption('project', 'Proyecto', 'Checklist con secciones y progreso')}${kindOption('check', 'Compra', 'Marcas y desmarcas lo mismo cada vez')}${kindOption('ideas', 'Ideas', 'Regalos, planes, sitios… en tarjetas')}</div>
        <div class="todo-modal-foot"><button type="button" class="todo-btn" data-act="close-modal">Cancelar</button><button class="todo-btn primary" type="submit">Crear</button></div></form>`;
    } else if (S.modal === 'list') {
      const list = view().lists.find(l => l.id === S.view);
      if (!list) { S.modal = null; return paintModal(); }
      inner = `<h2>Opciones de la lista</h2><form id="td-rename" autocomplete="off"><label class="todo-field">Nombre<input id="td-f-listname" maxlength="120" value="${E(list.name)}"></label>
        <div class="todo-kind four">${kindOption('tasks', 'Tareas', 'Filas con casilla y fecha', list.kind === 'tasks')}${kindOption('project', 'Proyecto', 'Secciones y progreso', list.kind === 'project')}${kindOption('check', 'Compra', 'Lo marcado queda abajo', list.kind === 'check')}${kindOption('ideas', 'Ideas', 'Tarjetas, sin prisas', list.kind === 'ideas')}</div>
        <div class="todo-modal-foot">${view().lists.length > 1 ? `<button type="button" class="todo-btn danger" data-act="delete-list">${icon('trash')}Eliminar</button>` : '<span></span>'}<span><button type="button" class="todo-btn" data-act="close-modal">Cancelar</button><button class="todo-btn primary" type="submit">Guardar</button></span></div></form>`;
    } else if (S.modal === 'claude') {
      const p = S.preview;
      const tabs = `<div class="todo-seg" role="tablist"><button type="button" role="tab" data-ctab="paste" aria-selected="${S.claudeTab === 'paste'}">${icon('copy')}Pegar de un chat</button><button type="button" role="tab" data-ctab="connect" aria-selected="${S.claudeTab === 'connect'}">${icon('key')}Que Claude lo actualice</button></div>`;
      const paste = `<p class="todo-hint flat">En el chat de Claude (por ejemplo «Moving to Ingolstadt») pide la checklist con este formato y pega aquí la respuesta. Se crea un proyecto con secciones. Si más adelante pegas una versión nueva, solo añade lo que falte y marca lo que venga hecho.</p>
        <button type="button" class="todo-btn" data-act="copy-prompt">${icon('copy')}<span>Copiar la instrucción para Claude</span></button>
        <textarea id="td-f-claude" rows="9" placeholder="# 🇩🇪 Mudanza a Ingolstadt\n## Papeles\n- [x] Contrato firmado\n- [ ] Anmeldung antes del 15/01\n## Casa\n- [ ] Buscar piso">${E(S.claudeText)}</textarea>
        ${p?.error ? `<p class="todo-error">${E(p.error)}</p>` : ''}
        ${p?.lists ? `<div class="todo-preview">${p.lists.map(l => { const secs = model.sections(l).filter(s => s.name); return `<p>${icon(KIND_ICON[l.kind === 'tasks' ? 'project' : l.kind] || 'flag')}<b>${E(l.name)}</b> · ${l.tasks.length} cosas${secs.length ? ` en ${secs.length} secciones` : ''}${l.tasks.filter(x => x.due).length ? ` · ${l.tasks.filter(x => x.due).length} con fecha` : ''}${l.tasks.filter(x => x.done).length ? ` · ${l.tasks.filter(x => x.done).length} hechas` : ''}</p>`; }).join('')}</div>` : ''}
        <div class="todo-modal-foot"><span></span><span><button type="button" class="todo-btn" data-act="close-modal">Cerrar</button><button type="button" class="todo-btn primary" data-act="claude-create" ${p?.lists ? '' : 'disabled'}>Crear proyecto</button></span></div>`;
      const connect = `<p class="todo-hint flat">Con una llave, Claude (en Claude Code, como esta conversación) puede leer tus listas y crear o actualizar checklists por ti: «añade a la mudanza lo del seguro», «marca el Anmeldung como hecho», «crea una rutina de vitamina D».</p>
        ${S.newKey ? `<div class="todo-key"><code id="td-key">${E(S.newKey)}</code><button type="button" class="todo-btn" data-act="copy-key">${icon('copy')}<span>Copiar</span></button></div>
          <ol class="todo-how"><li>Copia la llave: solo se enseña ahora.</li><li>En una sesión de Claude Code di <b>«conecta mis Tareas»</b>. Te la pedirá en un formulario seguro para <code>cesar-solla.pages.dev</code> (no la pegues en el chat).</li><li>Desde entonces puedes pedirle cambios en tus listas.</li></ol>`
        : `<p class="todo-hint flat">${S.agent ? `Hay una llave activa desde el ${E(niceDate(S.agent.created.slice(0, 10)))}. Si haces una nueva, la anterior deja de valer.` : 'Aún no hay ninguna llave.'}</p>`}
        <div class="todo-modal-foot">${S.agent && !S.newKey ? `<button type="button" class="todo-btn danger" data-act="agent-revoke">Retirar la llave</button>` : '<span></span>'}<span><button type="button" class="todo-btn" data-act="close-modal">Cerrar</button>${S.newKey ? '' : `<button type="button" class="todo-btn primary" data-act="agent-key">${icon('key')}${S.agent ? 'Hacer una llave nueva' : 'Crear llave'}</button>`}</span></div>`;
      inner = `<h2>${icon('spark')}Desde Claude</h2>${tabs}${S.claudeTab === 'paste' ? paste : connect}`;
    } else if (S.modal === 'import') {
      const p = S.preview;
      inner = `<h2>Traer tus tareas de Microsoft To Do</h2>
        <ol class="todo-how"><li>En el PC donde tienes To Do, descarga <a href="/control/todo-export.cmd" download>todo-export.cmd</a>.</li>
          <li>Ábrelo con <b>doble clic</b>. Si Windows avisa, pulsa «Más información» → «Ejecutar de todas formas». Entra con tu cuenta de Microsoft (solo lectura).</li>
          <li>Elige aquí <code>Escritorio\\Claude\\Datos\\microsoft-todo.json</code>.</li></ol>
        <label class="todo-drop">${icon('upload')}<span>Elegir o soltar el archivo</span><input type="file" id="td-file" accept=".json,.txt,.md,application/json,text/plain"></label>
        ${p?.error ? `<p class="todo-error">${E(p.error)}</p>` : ''}
        ${p?.lists ? `<div class="todo-preview"><p><b>${p.summary.lists}</b> listas · <b>${p.summary.tasks}</b> tareas (${p.summary.done} completadas) · <b>${p.summary.steps}</b> pasos</p>
          <ul>${p.lists.map(l => `<li>${icon(KIND_ICON[l.kind] || 'list')}<span>${E(l.name)}</span><small>${l.tasks.length}</small></li>`).join('')}</ul>
          <p class="todo-hint flat">Importar dos veces no duplica nada.</p></div>` : ''}
        <div class="todo-modal-foot"><span></span><span><button type="button" class="todo-btn" data-act="close-modal">Cerrar</button>${p?.lists ? `<button type="button" class="todo-btn primary" data-act="do-import">Importar ${p.summary.tasks}</button>` : ''}</span></div>`;
    } else if (S.modal === 'quick') {
      inner = `<h2>Añadir</h2><form id="td-quick" autocomplete="off"><input id="td-f-quick" maxlength="400" placeholder="Pagar la luz el viernes · Leche · 💊 Vitamina D…" aria-label="Qué quieres añadir">
        <div class="todo-kind four">${kindOption('today', 'Tarea', 'A «Hoy»; la fecha se lee del texto', true, 'sun')}${kindOption('routine', 'Rutina', 'Se repite: pastilla, entrenar…', false, 'flame')}${kindOption('shop', 'A la compra', 'Directo a la lista de la compra', false, 'cart')}${kindOption('idea', 'Idea', 'A tu primera lista de ideas', false, 'idea')}</div>
        <div class="todo-modal-foot"><button type="button" class="todo-btn" data-act="close-modal">Cancelar</button><button class="todo-btn primary" type="submit">Añadir</button></div></form>`;
    }
    el.innerHTML = `<div class="todo-sheet" role="dialog" aria-modal="true">${inner}</div>`;
    el.querySelector('input:not([type=radio]):not([type=file]), textarea')?.focus();
  }
  function closeModal() { S.modal = null; S.preview = null; S.newKey = ''; paint(); }
  function setPreview(text) {
    try {
      const lists = model.parseImport(text, t0()), summary = model.importSummary(lists);
      S.preview = summary.tasks ? { lists, summary } : { error: 'No he encontrado tareas en eso.' };
    } catch { S.preview = { error: 'Ese texto no es una exportación de To Do ni una lista que entienda.' }; }
    paintModal();
  }

  // Mission Control's home card shows what is coming.
  function paintSummary(doc, t) {
    const el = document.getElementById('todo-summary');
    if (!el) return;
    const next = model.upcoming(doc, t, 50), late = next.filter(r => r.task.due < t).length, week = next.filter(r => model.daysUntil(r.task.due, t) >= 0 && model.daysUntil(r.task.due, t) < 7).length;
    const r = model.routinesToday(doc, t), rd = r.filter(x => model.doneOn(x.task, t)).length;
    el.textContent = [r.length ? `Rutinas ${rd}/${r.length}` : '', late ? `${late} vencida${late === 1 ? '' : 's'}` : '', `${week} plazo${week === 1 ? '' : 's'} esta semana`, next[0] ? `próximo: ${next[0].task.title} (${countdown(model.daysUntil(next[0].task.due, t))})` : ''].filter(Boolean).join(' · ');
  }

  // ---------- Actions ----------
  function putTask(task, listId, end = false) { send({ op: 'task.put', list: listId, task, ...(end ? { end: true } : {}) }); }
  function updateTask(id, change, listId) { const f = find(id); if (f) putTask({ ...f.task, ...change }, listId || f.list.id); }
  function toggle(id) {
    const f = find(id);
    if (!f) return;
    if (f.task.done) return updateTask(id, { done: false, completed: '' });
    const { done, next } = model.completeTask(f.task, t0());
    S.flash = id;
    send({ op: 'task.put', list: f.list.id, task: done }, ...(next ? [{ op: 'task.put', list: f.list.id, task: next }] : []));
  }
  function toggleHabit(id, date = t0()) { const f = find(id); if (f) send({ op: 'habit.log', id, date, done: !model.doneOn(f.task, date) }); }
  function addRoutine(title, open = false) {
    const ops = view().lists.some(l => l.id === model.ROUTINES) ? [] : [{ op: 'list.add', id: model.ROUTINES, name: 'Rutinas', kind: 'routine' }];
    const task = model.normTask({ title, habit: { days: [], time: '' } });
    if (open) { S.open = task.id; S.pane = 'detail'; }
    send(...ops, { op: 'task.put', list: model.ROUTINES, task, end: true });
  }
  function setHabit(change) { const f = find(S.open); if (f) updateTask(S.open, { habit: { ...(f.task.habit || { days: [], time: '' }), ...change } }); }
  function go(viewId) { S.view = viewId; S.showDone = false; S.pane = 'list'; S.open = null; S.addSection = ''; write('view', viewId); paint(); document.getElementById('todo-scroll')?.scrollTo?.(0, 0); }
  const firstOf = kinds => view().lists.find(l => kinds.includes(l.kind));
  function addFromBar() {
    const input = document.getElementById('todo-title'), raw = input?.value.trim();
    if (!raw) return;
    const t = t0();
    if (S.view === 'routines') { addRoutine(raw, true); return; }
    const parsed = model.parseQuick(raw, t);
    const doc = view(), list = doc.lists.find(l => l.id === S.view) || firstOf(['tasks']) || doc.lists[0];
    const due = S.addDue || parsed.due || (S.view === 'planned' ? t : '');
    S.addDue = '';
    const again = list.kind === 'check' && list.tasks.find(x => x.title.toLowerCase() === parsed.title.toLowerCase());
    if (again) { if (again.done) updateTask(again.id, { done: false, completed: '' }); else paint(); return; }
    const section = list.kind === 'project' ? (S.addSection || model.sections(list).at(-1)?.name || '') : '';
    putTask(model.normTask({ title: parsed.title, myDay: S.view === 'today' && !due ? t : '', important: S.view === 'important', due, section }), list.id);
    document.getElementById('todo-title')?.focus();
  }
  function quickAdd(text, kind) {
    const t = t0(), raw = text.trim();
    if (!raw) return;
    if (kind === 'routine') { addRoutine(raw); return go('today'); }
    if (kind === 'shop') {
      let list = firstOf(['check']);
      if (!list) { const id = model.newId(); send({ op: 'list.add', id, name: '🛒 Lista de la compra', kind: 'check' }); list = { id, tasks: [] }; }
      const again = list.tasks.find(x => x.title.toLowerCase() === raw.toLowerCase());
      if (again) updateTask(again.id, { done: false, completed: '' }); else putTask(model.normTask({ title: raw }), list.id);
      return;
    }
    if (kind === 'idea') { const list = firstOf(['ideas']) || firstOf(['tasks']); return putTask(model.normTask({ title: raw }), list.id); }
    const p = model.parseQuick(raw, t);
    putTask(model.normTask({ title: p.title, due: p.due, myDay: p.due ? '' : t }), (firstOf(['tasks']) || view().lists[0]).id);
  }
  function hint() {
    const el = document.getElementById('todo-add-hint'), raw = document.getElementById('todo-title')?.value || '';
    if (!el) return;
    const p = model.parseQuick(raw, t0());
    el.innerHTML = p.due && !S.addDue && S.view !== 'routines' ? `${icon('cal')}${E(dueLabel(p.due))} · ${E(niceDate(p.due))}` : '';
  }
  async function copy(text, button) {
    try { await navigator.clipboard.writeText(text); const label = button?.querySelector('span'); if (label) label.textContent = '¡Copiado!'; }
    catch { prompt('Copia esto:', text); }
  }

  app.addEventListener('click', async e => {
    const b = e.target.closest('button, [data-act]');
    if (!b) { if (e.target.id === 'todo-modal') closeModal(); return; }
    if (b.dataset.tab) { if (b.dataset.tab === 'lists') { S.pane = 'nav'; S.open = null; paint(); } else go(b.dataset.tab); return; }
    if (b.dataset.nav) { S.query = ''; go(b.dataset.nav); return; }
    if (b.dataset.habit) { toggleHabit(b.dataset.habit); return; }
    if (b.dataset.newRoutine) { addRoutine(b.dataset.newRoutine); return; }
    if (b.dataset.log) { toggleHabit(S.open, b.dataset.log); paintDetail(view(), t0()); return; }
    if (b.dataset.day !== undefined) { const f = find(S.open); if (!f) return; const d = +b.dataset.day, days = new Set(f.task.habit?.days || []); if (days.has(d)) days.delete(d); else days.add(d); setHabit({ days: [...days] }); paintDetail(view(), t0()); return; }
    if (b.dataset.days === 'all') { setHabit({ days: [] }); paintDetail(view(), t0()); return; }
    if (b.dataset.toggle) { toggle(b.dataset.toggle); return; }
    if (b.dataset.star) { const f = find(b.dataset.star); if (f) updateTask(f.task.id, { important: !f.task.important }); return; }
    if (b.dataset.openTask) { S.open = b.dataset.openTask; S.pane = 'detail'; paint(); return; }
    if (b.dataset.step) { const f = find(S.open); if (f) updateTask(S.open, { steps: f.task.steps.map(s => (s.id === b.dataset.step ? { ...s, done: !s.done } : s)) }); return; }
    if (b.dataset.delStep) { const f = find(S.open); if (f) updateTask(S.open, { steps: f.task.steps.filter(s => s.id !== b.dataset.delStep) }); return; }
    if (b.dataset.due !== undefined) { updateTask(S.open, { due: b.dataset.due }); return; }
    if (b.dataset.quick) { S.addDue = b.dataset.quick; paint(); document.getElementById('todo-title')?.focus(); return; }
    if (b.dataset.ctab) { S.claudeTab = b.dataset.ctab; S.preview = S.claudeTab === 'paste' && S.claudeText.trim() ? S.preview : null; paintModal(); return; }
    const act = b.dataset.act;
    if (act === 'to-nav') { S.pane = 'nav'; paint(); }
    else if (act === 'close-detail') { S.open = null; S.pane = 'list'; paint(); }
    else if (act === 'show-done') { S.showDone = !S.showDone; paint(); }
    else if (act === 'clear-due') { S.addDue = ''; paint(); }
    else if (act === 'import') { S.modal = 'import'; S.preview = null; paint(); }
    else if (act === 'new-list') { S.modal = 'new-list'; paint(); }
    else if (act === 'list-menu') { S.modal = 'list'; paint(); }
    else if (act === 'quick-add') { S.modal = 'quick'; paint(); }
    else if (act === 'claude') { S.modal = 'claude'; S.newKey = ''; S.preview = null; if (S.claudeText.trim()) setPreview(S.claudeText); paint(); }
    else if (act === 'close-modal') closeModal();
    else if (act === 'copy-prompt') copy(CLAUDE_PROMPT, b);
    else if (act === 'copy-key') copy(S.newKey, b);
    else if (act === 'claude-create' && S.preview?.lists) {
      send({ op: 'import', update: true, lists: S.preview.lists.map(l => (l.kind === 'tasks' ? { ...l, kind: 'project' } : l)) });
      const name = S.preview.lists[0].name; S.claudeText = ''; closeModal();
      const made = view().lists.find(l => l.name.toLowerCase() === name.toLowerCase()); if (made) go(made.id);
    } else if (act === 'agent-key') {
      try { S.newKey = (await call('POST', { action: 'agent-key' })).key; S.agent = { created: new Date().toISOString() }; } catch { S.error = 'No se pudo crear la llave.'; }
      paintModal();
    } else if (act === 'agent-revoke') {
      if (confirm('¿Retirar la llave? Claude dejará de poder tocar tus listas.')) { try { await call('POST', { action: 'agent-revoke' }); S.agent = null; } catch { /* stays */ } paintModal(); }
    } else if (act === 'delete-list') {
      const list = view().lists.find(l => l.id === S.view);
      if (list && confirm(`¿Eliminar «${list.name}» y sus ${list.tasks.length} tareas?`)) { send({ op: 'list.delete', id: list.id }); S.modal = null; go('today'); }
    } else if (act === 'delete-task') {
      const f = find(S.open);
      if (f && confirm(`¿Eliminar «${f.task.title}»?`)) { send({ op: 'task.delete', id: f.task.id }); S.open = null; S.pane = 'list'; paint(); }
    } else if (act === 'myday') { const f = find(S.open); if (f) updateTask(S.open, { myDay: f.task.myDay === t0() ? '' : t0() }); }
    else if (act === 'do-import' && S.preview?.lists) { send({ op: 'import', lists: S.preview.lists }); S.modal = null; S.preview = null; go('today'); }
  });
  app.addEventListener('submit', e => {
    e.preventDefault();
    const id = e.target.id;
    if (id === 'todo-add') addFromBar();
    else if (id === 'td-step-add') {
      const title = document.getElementById('td-f-step').value.trim(), f = find(S.open);
      if (title && f) { updateTask(S.open, { steps: [...f.task.steps, { id: model.newId(), title, done: false }] }); paintDetail(view(), t0()); document.getElementById('td-f-step')?.focus(); }
    } else if (id === 'td-new-list') {
      const name = document.getElementById('td-f-newname').value.trim(), kind = e.target.elements.kind.value;
      if (name) { const lid = model.newId(); send({ op: 'list.add', id: lid, name, kind }); S.modal = null; go(lid); }
    } else if (id === 'td-rename') {
      const name = document.getElementById('td-f-listname').value.trim(), kind = e.target.elements.kind.value;
      const ops = []; if (name) ops.push({ op: 'list.rename', id: S.view, name }); ops.push({ op: 'list.kind', id: S.view, kind });
      S.modal = null; send(...ops);
    } else if (id === 'td-quick') {
      const text = document.getElementById('td-f-quick').value, kind = e.target.elements.kind.value;
      S.modal = null; quickAdd(text, kind); paint();
    }
  });
  let previewTimer;
  app.addEventListener('input', e => {
    if (e.target.id === 'todo-title') hint();
    if (e.target.id === 'td-f-claude') { S.claudeText = e.target.value; clearTimeout(previewTimer); previewTimer = setTimeout(() => { if (S.claudeText.trim()) setPreview(S.claudeText); else { S.preview = null; paintModal(); } }, 300); }
    if (e.target.id === 'todo-q') {
      S.query = e.target.value;
      if (S.query.trim()) { S.view = 'search'; S.pane = 'list'; paintMain(view(), t0()); paintTabs(); root.dataset.pane = S.pane; }
      else if (S.view === 'search') go('today');
    }
    if (e.target.id === 'td-f-title') { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }
  });
  app.addEventListener('change', async e => {
    const id = e.target.id;
    if (id === 'td-file') { const file = e.target.files?.[0]; if (file) setPreview(await file.text()); return; }
    if (id === 'todo-add-date') { S.addDue = e.target.value; paint(); document.getElementById('todo-title')?.focus(); return; }
    if (id === 'todo-add-section') {
      if (e.target.value === '__new') { const name = prompt('Nombre de la sección'); S.addSection = name?.trim() || S.addSection; paint(); document.getElementById('todo-title')?.focus(); }
      else S.addSection = e.target.value;
      return;
    }
    const f = S.open && find(S.open);
    if (!f) return;
    if (id === 'td-f-title') { const title = e.target.value.replace(/\s+/g, ' ').trim(); if (title && title !== f.task.title) updateTask(S.open, { title }); }
    else if (id === 'td-f-note') { if (e.target.value !== f.task.note) updateTask(S.open, { note: e.target.value }); }
    else if (id === 'td-f-due') { updateTask(S.open, { due: e.target.value }); paintDetail(view(), t0()); }
    else if (id === 'td-f-reminder') updateTask(S.open, { reminder: e.target.value.slice(0, 16) });
    else if (id === 'td-f-time') setHabit({ time: e.target.value });
    else if (id === 'td-f-section') updateTask(S.open, { section: e.target.value.trim() });
    else if (id === 'td-f-repeat') { updateTask(S.open, { repeat: e.target.value ? { every: e.target.value, interval: f.task.repeat?.interval || 1 } : null, due: e.target.value && !f.task.due ? t0() : f.task.due }); paintDetail(view(), t0()); }
    else if (id === 'td-f-interval') updateTask(S.open, { repeat: { ...f.task.repeat, interval: +e.target.value || 1 } });
    else if (id === 'td-f-list') { updateTask(S.open, {}, e.target.value); paintDetail(view(), t0()); }
  });
  app.addEventListener('keydown', e => {
    if (e.key === 'Escape') { if (S.modal) closeModal(); else if (S.open) { S.open = null; S.pane = 'list'; paint(); } }
    if (e.key === 'Enter' && e.target.id === 'td-f-title') { e.preventDefault(); e.target.blur(); }
  });
  // The date chip opens the calendar straight away where the browser allows it.
  app.addEventListener('click', e => { const input = e.target.closest('.todo-chip.pick')?.querySelector('input'); if (input && e.target !== input) { try { input.showPicker(); e.preventDefault(); } catch { /* the label opens it */ } } });
  app.addEventListener('dragover', e => { if (S.modal === 'import') e.preventDefault(); });
  app.addEventListener('drop', async e => { if (S.modal !== 'import') return; e.preventDefault(); const file = e.dataTransfer?.files?.[0]; if (file) setPreview(await file.text()); });
  // The phone's back gesture steps back (sheet → detail → Hoy) instead of leaving the app.
  addEventListener('popstate', () => { if (!standalone) return; if (S.modal) closeModal(); else if (S.pane === 'detail') { S.open = null; S.pane = 'list'; paint(); } else if (S.pane === 'nav' || S.view !== 'today') go('today'); });
  let lastKey = '';
  const syncHistory = () => { const key = `${S.pane}|${S.view}|${!!S.modal}`; if (standalone && key !== lastKey && (S.pane === 'detail' || S.modal || S.view !== 'today' || S.pane === 'nav')) history.pushState({}, ''); lastKey = key; };
  app.addEventListener('click', () => setTimeout(syncHistory), true);
  // A new day changes Hoy: refresh when the app comes back.
  document.addEventListener('visibilitychange', () => { if (!document.hidden && S.doc) refresh(); });

  async function refresh() {
    try { const out = await call('GET'); S.doc = docOf(out); S.agent = out.agent || null; write('cache', S.doc); S.error = ''; }
    catch { if (!S.doc) S.error = 'No se pudo leer tus tareas ahora mismo.'; }
    paint();
    flush();
  }

  window.TodoLab = { async initialise(token, options = {}) {
    csrf = token; standalone = !!options.standalone;
    model = await import('/control/todo-model.js?v=20261124a');
    // In the app, a link like /control/tareas/#planned opens that view (the icon's long-press shortcuts use it).
    const wanted = decodeURIComponent(location.hash.slice(1));
    if (standalone) S.view = wanted ? (wanted === 'myday' ? 'today' : wanted) : 'today';
    const cached = read('cache', null);
    if (cached?.lists) { S.doc = cached; paint(); }
    await refresh();
    if (!S.doc) { S.doc = model.emptyDoc(); paint(); }
  } };
})();
