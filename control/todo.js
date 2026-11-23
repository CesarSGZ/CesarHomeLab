// Tareas: the Microsoft To Do replacement. The same code runs inside Mission Control (#todo) and as its own
// home-screen app (/control/tareas/). Layout follows To Do: lists on the left, tasks in the middle, details on the right;
// on a phone each of those is a screen of its own.
(() => {
  const app = document.getElementById('todo-app');
  if (!app) return;
  const API = '/control/api/todo/status';
  let model, csrf = '', standalone = false;
  const read = (k, d) => { try { const v = localStorage.getItem('todo.' + k); return v === null ? d : JSON.parse(v); } catch { return d; } };
  const write = (k, v) => { try { localStorage.setItem('todo.' + k, JSON.stringify(v)); } catch { /* memory only */ } };
  // doc is what the server last confirmed; the queue holds changes it has not taken yet, shown on top.
  const S = { doc: null, queue: read('queue', []), view: read('view', 'myday'), pane: 'list', open: null, showDone: false, query: '', modal: null, preview: null, error: '', addDue: '' };
  const E = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const today = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
  const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const MONTHS_LONG = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const WEEKDAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const cap = s => s.replace(/^./, c => c.toUpperCase());
  const view = () => { try { return model.applyOps(S.doc, S.queue); } catch { return S.doc; } };

  // ---------- Icons (24px line icons in the spirit of To Do) ----------
  const I = {
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
    star: '<path d="M12 3.2l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.5l-5.2 2.8 1-5.8L3.5 9.4l5.9-.8z"/>',
    cal: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    all: '<path d="M7.5 8.5c-2 0-3.5 1.6-3.5 3.5s1.5 3.5 3.5 3.5c3.5 0 5.5-7 9-7 2 0 3.5 1.6 3.5 3.5s-1.5 3.5-3.5 3.5c-3.5 0-5.5-7-9-7z"/>',
    list: '<path d="M9 6.5h11M9 12h11M9 17.5h11"/><circle cx="4.8" cy="6.5" r="1"/><circle cx="4.8" cy="12" r="1"/><circle cx="4.8" cy="17.5" r="1"/>',
    idea: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.4 1.1 2.2h5c0-.8.4-1.6 1.1-2.2A6 6 0 0 0 12 3z"/>',
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
    folder: '<path d="M3.5 6.5a2 2 0 0 1 2-2H10l2 2.5h6.5a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/>',
  };
  const glyph = look => (look.emoji ? `<i class="emoji" aria-hidden="true">${E(look.emoji)}</i>` : icon(look.icon));
  const icon = (name, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${I[name]}</svg>`;

  // ---------- Colours: each list keeps its own, like To Do's themes ----------
  const SMART_LOOK = { myday: ['sun', '#c4742c'], important: ['star', '#c4466f'], planned: ['cal', '#1d8378'], all: ['all', '#4f5fbd'], search: ['search', '#5c6673'] };
  const PALETTE = ['#2564cf', '#8a4fc4', '#c4466f', '#2e8556', '#b85c1d', '#00838f', '#6656a8', '#5c6f2a'];
  const IDEA_PALETTE = ['#b7791f', '#a35f12', '#9a6a00', '#b5562c'];
  const hash = s => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  const listColour = l => (l.kind === 'ideas' ? IDEA_PALETTE : PALETTE)[hash(l.id) % (l.kind === 'ideas' ? IDEA_PALETTE : PALETTE).length];
  const lookOf = (id, doc) => {
    if (SMART_LOOK[id]) return { icon: SMART_LOOK[id][0], colour: SMART_LOOK[id][1], name: id === 'search' ? 'Buscar' : model.SMART[id] };
    const l = doc.lists.find(x => x.id === id);
    if (!l) return lookOf('myday', doc);
    const { emoji, name } = model.splitEmoji(l.name);
    return { icon: l.kind === 'ideas' ? 'idea' : 'list', emoji, colour: listColour(l), name, list: l };
  };

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
  const longToday = t => { const d = new Date(t + 'T12:00:00Z'); return `${cap(WEEKDAYS[d.getUTCDay()])}, ${d.getUTCDate()} de ${MONTHS_LONG[d.getUTCMonth()]}`; };
  const REPEAT_LABEL = { day: ['Cada día', 'días'], week: ['Cada semana', 'semanas'], month: ['Cada mes', 'meses'], year: ['Cada año', 'años'] };
  const repeatText = r => (r.interval === 1 ? REPEAT_LABEL[r.every][0] : `Cada ${r.interval} ${REPEAT_LABEL[r.every][1]}`);

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

  // ---------- Paint ----------
  let root;
  function paint() {
    if (!S.doc) return;
    if (!root) {
      app.innerHTML = `<div class="todo" id="todo-root"><aside class="todo-nav" id="todo-nav" aria-label="Listas"></aside><main class="todo-main" id="todo-main"></main>
        <aside class="todo-detail" id="todo-detail" aria-label="Detalles de la tarea" hidden></aside><div class="todo-modal" id="todo-modal" hidden></div></div>`;
      root = document.getElementById('todo-root');
    }
    const doc = view(), t = t0();
    if (S.view !== 'search' && !model.SMART[S.view] && !doc.lists.some(l => l.id === S.view)) S.view = 'myday';
    if (S.open && !find(S.open)) { S.open = null; if (S.pane === 'detail') S.pane = 'list'; }
    root.dataset.pane = S.pane;
    root.classList.toggle('has-detail', !!S.open);
    paintNav(doc, t);
    paintMain(doc, t);
    // A field being edited in the open task keeps its panel as it is, so typing or the next tap is not lost.
    const detail = document.getElementById('todo-detail'), typing = detail.contains(document.activeElement) && /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
    if (!typing || !S.open) paintDetail(doc, t);
    paintModal();
    paintSummary(doc, t);
  }

  function paintNav(doc, t) {
    const c = model.counts(doc, t);
    const item = id => { const look = lookOf(id, doc); return `<button type="button" class="todo-nav-item" data-nav="${E(id)}" aria-current="${S.view === id ? 'page' : 'false'}" style="--c:${look.colour}">${glyph(look)}<span>${E(look.name)}</span>${c[id] ? `<b>${c[id]}</b>` : ''}</button>`; };
    const tasks = doc.lists.filter(l => l.kind !== 'ideas'), ideas = doc.lists.filter(l => l.kind === 'ideas');
    const next = model.upcoming(doc, t, 3);
    document.getElementById('todo-nav').innerHTML = `
      <div class="todo-nav-top"><p class="todo-brand">${icon('sun', 'brand')}<span>Tareas</span></p>
        <label class="todo-search">${icon('search')}<input type="search" id="todo-q" placeholder="Buscar" value="${E(S.query)}" aria-label="Buscar en todas las tareas" enterkeyhint="search"></label></div>
      ${next.length ? `<button type="button" class="todo-soon" data-nav="planned"><small>Próximas fechas</small>${next.map(r => { const n = model.daysUntil(r.task.due, t); return `<span class="${n < 0 ? 'late' : n === 0 ? 'now' : ''}"><em>${countdown(n)}</em>${E(r.task.title)}</span>`; }).join('')}</button>` : ''}
      <div class="todo-nav-group">${['myday', 'important', 'planned', 'all'].map(item).join('')}</div>
      <div class="todo-nav-group"><p class="todo-nav-head">Listas</p>${tasks.map(l => item(l.id)).join('')}</div>
      ${ideas.length ? `<div class="todo-nav-group"><p class="todo-nav-head">Ideas</p>${ideas.map(l => item(l.id)).join('')}</div>` : ''}
      <div class="todo-nav-foot">
        <button type="button" class="todo-nav-item add" data-act="new-list">${icon('plus')}<span>Nueva lista</span></button>
        <button type="button" class="todo-nav-item add" data-act="import">${icon('upload')}<span>Importar de To Do</span></button>
        ${standalone ? `<a class="todo-nav-item add" href="/control/">${icon('home')}<span>Mission Control</span></a>` : `<a class="todo-nav-item add" href="/control/tareas/">${icon('app')}<span>Abrir como app</span></a>`}
      </div>`;
  }

  function paintMain(doc, t) {
    const look = lookOf(S.view, doc), list = look.list, ideas = list?.kind === 'ideas', checklist = list?.kind === 'check';
    const rows = model.tasksFor(doc, S.view, t, S.query), open = rows.filter(r => !r.task.done), done = rows.filter(r => r.task.done);
    let sub = '';
    if (S.view === 'myday') sub = longToday(t);
    else if (S.view === 'search') sub = S.query ? `${rows.length} resultado${rows.length === 1 ? '' : 's'} para «${S.query}»` : 'Escribe para buscar en todas las listas.';
    else sub = open.length ? `${open.length} ${ideas ? 'idea' : 'pendiente'}${open.length === 1 ? '' : 's'}` : '';
    let body = '';
    if (checklist) body = paintChecklist(open, done, t);
    else if (S.view === 'planned') body = paintPlanned(open, t);
    else if (ideas) body = open.length ? `<div class="todo-cards">${open.map(r => card(r, t)).join('')}</div>` : '';
    else if (open.length) body = `<ul class="todo-rows">${open.map(r => row(r, t)).join('')}</ul>`;
    if (!open.length && S.view !== 'search' && !checklist) body = emptyState(ideas);
    if (S.view !== 'planned' && !checklist && done.length) {
      done.sort((a, b) => (b.task.completed || '').localeCompare(a.task.completed || ''));
      body += `<button type="button" class="todo-done-toggle" data-act="show-done" aria-expanded="${S.showDone}">${icon('back', S.showDone ? 'down' : 'right')}Completadas <b>${done.length}</b></button>${S.showDone ? `<ul class="todo-rows">${done.slice(0, 300).map(r => row(r, t)).join('')}</ul>` : ''}`;
    }
    const canAdd = S.view !== 'search';
    const quick = S.addDue ? `<button type="button" class="todo-chip on" data-act="clear-due">${icon('cal')}${E(dueLabel(S.addDue, t))} ×</button>` : '';
    document.getElementById('todo-main').innerHTML = `<div class="todo-main-bg" style="--c:${look.colour}">
      <header class="todo-main-head">
        <button type="button" class="todo-icon-btn todo-back" data-act="to-nav" aria-label="Listas">${icon('back')}</button>
        <div><h1>${glyph(look)}<span>${E(look.name)}</span></h1>${sub ? `<p>${E(sub)}</p>` : ''}</div>
        ${list ? `<button type="button" class="todo-icon-btn" data-act="list-menu" aria-label="Opciones de la lista">${icon('more')}</button>` : ''}
      </header>
      <p class="todo-status" id="todo-status" role="status">${S.error ? E(S.error) : ''}</p>
      <div class="todo-scroll">${body}</div>
      ${canAdd ? `<form class="todo-add" id="todo-add" autocomplete="off">
        <div class="todo-add-row">${icon('plus')}<input id="todo-title" maxlength="400" placeholder="${ideas ? 'Añadir una idea' : checklist ? 'Añadir artículo' : 'Añadir una tarea'}" aria-label="${ideas ? 'Nueva idea' : checklist ? 'Nuevo artículo' : 'Nueva tarea'}" enterkeyhint="done"></div>
        <div class="todo-add-tools" id="todo-add-tools">${quick}
          ${S.addDue ? '' : `<button type="button" class="todo-chip" data-quick="${t}">Hoy</button><button type="button" class="todo-chip" data-quick="${model.addDays(t, 1)}">Mañana</button>`}
          <label class="todo-chip pick">${icon('cal')}<span>Fecha</span><input type="date" id="todo-add-date" aria-label="Fecha de vencimiento"></label>
          <span class="todo-add-hint" id="todo-add-hint"></span><button type="submit" class="todo-add-go">Añadir</button></div></form>` : ''}
    </div>`;
    paintStatus();
  }
  function emptyState(ideas) {
    const text = S.view === 'myday' ? ['Céntrate en tu día', 'Añade lo de hoy, o abre una tarea y pulsa «Añadir a Mi día». Lo que vence hoy aparece aquí solo.']
      : S.view === 'important' ? ['Nada marcado', 'Pulsa la estrella de una tarea para tenerla aquí.']
      : S.view === 'planned' ? ['Sin fechas', 'Escribe «mañana», «el viernes» o «30/11» al final de una tarea y se le pone la fecha.']
      : ideas ? ['Aún no hay ideas', 'Regalos, planes, sitios, películas… apúntalas sin fecha ni prisa.']
      : ['Todo hecho', 'No queda nada pendiente en esta lista.'];
    return `<div class="todo-empty">${icon(ideas ? 'idea' : S.view === 'planned' ? 'cal' : 'sun')}<b>${text[0]}</b><p>${text[1]}</p></div>`;
  }
  function meta({ task, list }, t, withDue = true) {
    const m = [];
    if (model.SMART[S.view] || S.view === 'search') m.push(`<span>${E(list.name)}</span>`);
    if (task.myDay === t && S.view !== 'myday') m.push(`<span>${icon('sun')}Mi día</span>`);
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
    return `<li class="todo-row${task.done ? ' done' : ''}${S.open === task.id ? ' sel' : ''}">${check(task)}<button type="button" class="todo-row-body" data-open-task="${E(task.id)}"><span>${E(task.title)}</span>${meta(r, t, !extra)}</button>${extra}${star(task)}</li>`;
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
      : `<div class="todo-empty small">${icon('list')}<b>No falta nada</b><p>Toca lo que necesites de abajo, o escríbelo.</p></div>`;
    return top + (done.length ? `<p class="todo-group muted">Marcado <b>${done.length}</b><small>toca para volver a ponerlo</small></p><ul class="todo-rows compact">${done.map(r => row(r, t)).join('')}</ul>` : '');
  }
  // Planeado is a timeline: overdue, today, tomorrow, each day of the week, later.
  function paintPlanned(open, t) {
    const groups = [];
    for (const r of open) {
      const n = model.daysUntil(r.task.due, t);
      const key = n < 0 ? 'Vencidas' : n === 0 ? 'Hoy' : n === 1 ? 'Mañana' : n < 7 ? cap(WEEKDAYS[new Date(r.task.due + 'T12:00:00Z').getUTCDay()]) + ' ' + +r.task.due.slice(8) : n < 31 ? 'Este mes' : 'Más adelante';
      (groups.at(-1)?.key === key ? groups.at(-1) : (groups.push({ key, rows: [], late: n < 0 }), groups.at(-1))).rows.push(r);
    }
    return groups.map(g => `<p class="todo-group${g.late ? ' late' : ''}">${E(g.key)} <b>${g.rows.length}</b></p><ul class="todo-rows">${g.rows.map(r => { const n = model.daysUntil(r.task.due, t); return row(r, t, `<span class="todo-count ${n < 0 ? 'late' : n === 0 ? 'now' : ''}"><b>${n < 0 ? -n : n}</b>${n < 0 ? 'días tarde' : n === 0 ? 'hoy' : n === 1 ? 'día' : 'días'}</span>`); }).join('')}</ul>`).join('');
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
    const { task, list } = f, ideas = list.kind === 'ideas';
    const dn = task.due ? model.daysUntil(task.due, t) : 0;
    const dueText = !task.due ? '' : dn < 0 ? `Vencida el ${niceDate(task.due, t)}` : dn < 7 ? `Vence ${dueLabel(task.due, t).toLowerCase()} · ${niceDate(task.due, t)}` : `Vence el ${niceDate(task.due, t)}`;
    const dueBits = task.due ? `<span class="todo-chip on${dn < 0 && !task.done ? ' late' : ''}">${icon('cal')}${E(dueText)}</span><button type="button" class="todo-chip" data-due="">Quitar</button>`
      : `<button type="button" class="todo-chip" data-due="${t}">Hoy</button><button type="button" class="todo-chip" data-due="${model.addDays(t, 1)}">Mañana</button><button type="button" class="todo-chip" data-due="${model.addDays(t, 7)}">En una semana</button>`;
    el.innerHTML = `<div class="todo-detail-in">
      <header class="todo-detail-head"><button type="button" class="todo-icon-btn" data-act="close-detail" aria-label="Cerrar">${icon('back', 'only-narrow')}${icon('close', 'only-wide')}</button><span>${E(list.name)}</span></header>
      <section class="todo-box">
        <div class="todo-title-row">${check(task)}<textarea id="td-f-title" rows="1" maxlength="400" aria-label="Título">${E(task.title)}</textarea>${star(task)}</div>
        <ul class="todo-steps">${task.steps.map(s => `<li><button type="button" class="todo-check small" data-step="${E(s.id)}" aria-pressed="${s.done}" aria-label="Paso hecho"></button><span class="${s.done ? 'done' : ''}">${E(s.title)}</span><button type="button" class="todo-icon-btn tiny" data-del-step="${E(s.id)}" aria-label="Quitar paso">${icon('close')}</button></li>`).join('')}</ul>
        <form id="td-step-add" class="todo-step-add" autocomplete="off">${icon('plus')}<input id="td-f-step" maxlength="400" placeholder="${task.steps.length ? 'Siguiente paso' : 'Agregar paso'}" aria-label="Nuevo paso"></form>
      </section>
      ${ideas ? '' : `<section class="todo-box"><button type="button" class="todo-line ${task.myDay === t ? 'on' : ''}" data-act="myday">${icon('sun')}<span>${task.myDay === t ? 'Añadida a Mi día' : 'Añadir a Mi día'}</span>${task.myDay === t ? icon('close', 'end') : ''}</button></section>`}
      <section class="todo-box">
        <div class="todo-line static">${icon('cal')}<span>${ideas ? 'Fecha (opcional)' : 'Fecha de vencimiento'}</span></div>
        <div class="todo-chips">${dueBits}<label class="todo-chip pick">${icon('cal')}<span>Elegir</span><input type="date" id="td-f-due" value="${E(task.due)}" aria-label="Elegir fecha"></label></div>
        <label class="todo-line">${icon('bell')}<span>Recordarme</span><input type="datetime-local" id="td-f-reminder" value="${E(task.reminder)}" aria-label="Recordatorio"></label>
        <label class="todo-line">${icon('repeat')}<span>Repetir</span><select id="td-f-repeat"><option value="">Nunca</option>${model.REPEATS.map(r => `<option value="${r}" ${task.repeat?.every === r ? 'selected' : ''}>${REPEAT_LABEL[r][0]}</option>`).join('')}</select>
          ${task.repeat ? `<input type="number" id="td-f-interval" min="1" max="99" value="${task.repeat.interval}" aria-label="Cada cuántos">` : ''}</label>
        ${task.repeat ? `<p class="todo-hint">${E(repeatText(task.repeat))}: al completarla aparece la siguiente.</p>` : ''}
      </section>
      <section class="todo-box"><label class="todo-line">${icon(list.kind === 'ideas' ? 'idea' : 'list')}<span>Lista</span><select id="td-f-list">${doc.lists.map(l => `<option value="${E(l.id)}" ${l.id === list.id ? 'selected' : ''}>${E(l.name)}</option>`).join('')}</select></label></section>
      <section class="todo-box"><textarea id="td-f-note" class="todo-note" rows="6" maxlength="20000" placeholder="Agregar nota" aria-label="Nota">${E(task.note)}</textarea></section>
      <footer class="todo-detail-foot"><span>${task.done && task.completed ? `Completada el ${E(niceDate(task.completed.slice(0, 10), t))}` : `Creada el ${E(niceDate(task.created.slice(0, 10), t))}`}</span>
        <button type="button" class="todo-icon-btn danger" data-act="delete-task" aria-label="Eliminar tarea">${icon('trash')}</button></footer></div>`;
    const title = document.getElementById('td-f-title');
    title.style.height = 'auto'; title.style.height = title.scrollHeight + 'px';
  }

  // ---------- Modals: new list, list options, import ----------
  function paintModal() {
    const el = document.getElementById('todo-modal');
    if (!S.modal) { el.hidden = true; el.innerHTML = ''; return; }
    if (el.dataset.kind === S.modal + (S.preview ? JSON.stringify(S.preview.summary || S.preview.error) : '') && !el.hidden) return;
    el.dataset.kind = S.modal + (S.preview ? JSON.stringify(S.preview.summary || S.preview.error) : '');
    el.hidden = false;
    let inner = '';
    if (S.modal === 'new-list') {
      inner = `<h2>Nueva lista</h2><form id="td-new-list" autocomplete="off"><input id="td-f-newname" maxlength="120" placeholder="Nombre" aria-label="Nombre de la lista" required>
        <div class="todo-kind"><label><input type="radio" name="kind" value="tasks" checked><span>${icon('list')}<b>Tareas</b><small>Cosas que hacer, con fechas</small></span></label>
        <label><input type="radio" name="kind" value="ideas"><span>${icon('idea')}<b>Ideas</b><small>Regalos, planes, sitios… en tarjetas</small></span></label>
        <label><input type="radio" name="kind" value="check"><span>${icon('list')}<b>Compra</b><small>Marcas y desmarcas lo mismo cada vez</small></span></label></div>
        <div class="todo-modal-foot"><button type="button" class="todo-btn" data-act="close-modal">Cancelar</button><button class="todo-btn primary" type="submit">Crear</button></div></form>`;
    } else if (S.modal === 'list') {
      const list = view().lists.find(l => l.id === S.view);
      if (!list) { S.modal = null; return paintModal(); }
      inner = `<h2>Opciones de la lista</h2><form id="td-rename" autocomplete="off"><label class="todo-field">Nombre<input id="td-f-listname" maxlength="120" value="${E(list.name)}"></label>
        <div class="todo-kind"><label><input type="radio" name="kind" value="tasks" ${list.kind !== 'ideas' ? 'checked' : ''}><span>${icon('list')}<b>Tareas</b><small>Filas con casilla y fecha</small></span></label>
        <label><input type="radio" name="kind" value="ideas" ${list.kind === 'ideas' ? 'checked' : ''}><span>${icon('idea')}<b>Ideas</b><small>Tarjetas, sin prisas</small></span></label>
        <label><input type="radio" name="kind" value="check" ${list.kind === 'check' ? 'checked' : ''}><span>${icon('list')}<b>Compra</b><small>Lo marcado queda abajo para desmarcarlo</small></span></label></div>
        <div class="todo-modal-foot">${view().lists.length > 1 ? `<button type="button" class="todo-btn danger" data-act="delete-list">${icon('trash')}Eliminar</button>` : '<span></span>'}<span><button type="button" class="todo-btn" data-act="close-modal">Cancelar</button><button class="todo-btn primary" type="submit">Guardar</button></span></div></form>`;
    } else if (S.modal === 'import') {
      const p = S.preview;
      inner = `<h2>Traer tus tareas de Microsoft To Do</h2>
        <ol class="todo-how"><li>En el PC donde tienes To Do, descarga <a href="/control/todo-export.ps1" download>todo-export.ps1</a>.</li>
          <li>Clic derecho → <b>Ejecutar con PowerShell</b> y entra con tu cuenta de Microsoft (solo lectura).</li>
          <li>Elige aquí <code>Escritorio\\Claude\\Datos\\microsoft-todo.json</code>.</li></ol>
        <label class="todo-drop">${icon('upload')}<span>Elegir o soltar el archivo</span><input type="file" id="td-file" accept=".json,.txt,.md,application/json,text/plain"></label>
        <details class="todo-paste"><summary>O pega una lista en texto</summary><textarea id="td-f-paste" rows="7" placeholder="# Compra\n- leche\n- [x] pan\n\n# Ideas regalos\n- Libro para mamá"></textarea><button type="button" class="todo-btn" data-act="parse-paste">Leer el texto</button></details>
        ${p?.error ? `<p class="todo-error">${E(p.error)}</p>` : ''}
        ${p?.lists ? `<div class="todo-preview"><p><b>${p.summary.lists}</b> listas · <b>${p.summary.tasks}</b> tareas (${p.summary.done} completadas) · <b>${p.summary.steps}</b> pasos</p>
          <ul>${p.lists.map(l => `<li>${icon(l.kind === 'ideas' ? 'idea' : 'list')}<span>${E(l.name)}</span><small>${l.kind === 'ideas' ? 'ideas · ' : l.kind === 'check' ? 'compra · ' : ''}${l.tasks.length}</small></li>`).join('')}</ul>
          <p class="todo-hint">Las listas de ideas (regalos, planes, viajes…) se verán como tarjetas y la de la compra como lista para marcar y desmarcar; se cambia luego en cada lista. Importar dos veces no duplica nada.</p></div>` : ''}
        <div class="todo-modal-foot"><span></span><span><button type="button" class="todo-btn" data-act="close-modal">Cerrar</button>${p?.lists ? `<button type="button" class="todo-btn primary" data-act="do-import">Importar ${p.summary.tasks}</button>` : ''}</span></div>`;
    }
    el.innerHTML = `<div class="todo-sheet" role="dialog" aria-modal="true">${inner}</div>`;
    el.querySelector('input:not([type=radio]):not([type=file])')?.focus();
  }
  function closeModal() { S.modal = null; S.preview = null; paint(); }
  function setPreview(text) {
    try {
      const lists = model.parseImport(text), summary = model.importSummary(lists);
      S.preview = summary.tasks ? { lists, summary } : { error: 'No he encontrado tareas en eso.' };
    } catch { S.preview = { error: 'Ese archivo no es una exportación de To Do ni una lista de texto.' }; }
    paintModal();
  }

  // Mission Control's home card shows what is coming.
  function paintSummary(doc, t) {
    const el = document.getElementById('todo-summary');
    if (!el) return;
    const next = model.upcoming(doc, t, 50), late = next.filter(r => r.task.due < t).length, week = next.filter(r => model.daysUntil(r.task.due, t) >= 0 && model.daysUntil(r.task.due, t) < 7).length;
    el.textContent = next.length ? `${late ? `${late} vencida${late === 1 ? '' : 's'} · ` : ''}${week} esta semana · la próxima: ${next[0].task.title} (${countdown(model.daysUntil(next[0].task.due, t))})` : 'Sin fechas límite pendientes.';
  }

  // ---------- Actions ----------
  function putTask(task, listId) { send({ op: 'task.put', list: listId, task }); }
  function updateTask(id, change, listId) { const f = find(id); if (f) putTask({ ...f.task, ...change }, listId || f.list.id); }
  function toggle(id) {
    const f = find(id);
    if (!f) return;
    if (f.task.done) return updateTask(id, { done: false, completed: '' });
    const { done, next } = model.completeTask(f.task, t0());
    send({ op: 'task.put', list: f.list.id, task: done }, ...(next ? [{ op: 'task.put', list: f.list.id, task: next }] : []));
  }
  function go(viewId) { S.view = viewId; S.showDone = false; S.pane = 'list'; S.open = null; write('view', viewId); paint(); document.getElementById('todo-main')?.scrollTo?.(0, 0); }
  function addFromBar() {
    const input = document.getElementById('todo-title'), raw = input?.value.trim();
    if (!raw) return;
    const doc = view(), t = t0(), parsed = model.parseQuick(raw, t);
    const list = doc.lists.find(l => l.id === S.view) || doc.lists.find(l => l.kind !== 'ideas') || doc.lists[0];
    const due = S.addDue || parsed.due || (S.view === 'planned' ? t : '');
    const again = list.kind === 'check' && list.tasks.find(x => x.title.toLowerCase() === parsed.title.toLowerCase());
    if (again) { S.addDue = ''; if (again.done) updateTask(again.id, { done: false, completed: '' }); document.getElementById('todo-title').value = ''; return; }
    S.addDue = '';
    putTask(model.normTask({ title: parsed.title, myDay: S.view === 'myday' ? t : '', important: S.view === 'important', due }), list.id);
    document.getElementById('todo-title')?.focus();
  }
  function hint() {
    const el = document.getElementById('todo-add-hint'), raw = document.getElementById('todo-title')?.value || '';
    if (!el) return;
    const p = model.parseQuick(raw, t0());
    el.innerHTML = p.due && !S.addDue ? `${icon('cal')}${E(dueLabel(p.due))} · ${E(niceDate(p.due))}` : '';
  }

  app.addEventListener('click', e => {
    const b = e.target.closest('button, [data-act]');
    if (!b) { if (e.target.id === 'todo-modal') closeModal(); return; }
    if (b.dataset.nav) { if (b.dataset.nav !== 'search') { S.query = ''; } go(b.dataset.nav); return; }
    if (b.dataset.toggle) { toggle(b.dataset.toggle); return; }
    if (b.dataset.star) { const f = find(b.dataset.star); if (f) updateTask(f.task.id, { important: !f.task.important }); return; }
    if (b.dataset.openTask) { S.open = b.dataset.openTask; S.pane = 'detail'; paint(); return; }
    if (b.dataset.step) { const f = find(S.open); if (f) updateTask(S.open, { steps: f.task.steps.map(s => (s.id === b.dataset.step ? { ...s, done: !s.done } : s)) }); return; }
    if (b.dataset.delStep) { const f = find(S.open); if (f) updateTask(S.open, { steps: f.task.steps.filter(s => s.id !== b.dataset.delStep) }); return; }
    if (b.dataset.due !== undefined) { updateTask(S.open, { due: b.dataset.due }); return; }
    if (b.dataset.quick) { S.addDue = b.dataset.quick; paint(); document.getElementById('todo-title')?.focus(); return; }
    const act = b.dataset.act;
    if (act === 'to-nav') { S.pane = 'nav'; paint(); }
    else if (act === 'close-detail') { S.open = null; S.pane = 'list'; paint(); }
    else if (act === 'show-done') { S.showDone = !S.showDone; paint(); }
    else if (act === 'clear-due') { S.addDue = ''; paint(); }
    else if (act === 'import') { S.modal = 'import'; S.preview = null; paint(); }
    else if (act === 'new-list') { S.modal = 'new-list'; paint(); }
    else if (act === 'list-menu') { S.modal = 'list'; paint(); }
    else if (act === 'close-modal') closeModal();
    else if (act === 'delete-list') {
      const list = view().lists.find(l => l.id === S.view);
      if (list && confirm(`¿Eliminar «${list.name}» y sus ${list.tasks.length} tareas?`)) { send({ op: 'list.delete', id: list.id }); S.modal = null; go('myday'); }
    } else if (act === 'delete-task') {
      const f = find(S.open);
      if (f && confirm(`¿Eliminar «${f.task.title}»?`)) { send({ op: 'task.delete', id: f.task.id }); S.open = null; S.pane = 'list'; paint(); }
    } else if (act === 'myday') { const f = find(S.open); if (f) updateTask(S.open, { myDay: f.task.myDay === t0() ? '' : t0() }); }
    else if (act === 'parse-paste') setPreview(document.getElementById('td-f-paste')?.value);
    else if (act === 'do-import' && S.preview?.lists) { send({ op: 'import', lists: S.preview.lists }); S.modal = null; S.preview = null; go('all'); }
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
    }
  });
  app.addEventListener('input', e => {
    if (e.target.id === 'todo-title') hint();
    if (e.target.id === 'todo-q') {
      S.query = e.target.value;
      if (S.query.trim()) { S.view = 'search'; S.pane = 'list'; paintMain(view(), t0()); }
      else if (S.view === 'search') go(read('view', 'myday') === 'search' ? 'myday' : read('view', 'myday'));
    }
    if (e.target.id === 'td-f-title') { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }
  });
  app.addEventListener('change', async e => {
    const id = e.target.id;
    if (id === 'td-file') { const file = e.target.files?.[0]; if (file) setPreview(await file.text()); return; }
    if (id === 'todo-add-date') { S.addDue = e.target.value; paint(); document.getElementById('todo-title')?.focus(); return; }
    const f = S.open && find(S.open);
    if (!f) return;
    if (id === 'td-f-title') { const title = e.target.value.replace(/\s+/g, ' ').trim(); if (title && title !== f.task.title) updateTask(S.open, { title }); }
    else if (id === 'td-f-note') { if (e.target.value !== f.task.note) updateTask(S.open, { note: e.target.value }); }
    else if (id === 'td-f-due') { updateTask(S.open, { due: e.target.value }); paintDetail(view(), t0()); }
    else if (id === 'td-f-reminder') updateTask(S.open, { reminder: e.target.value.slice(0, 16) });
    else if (id === 'td-f-repeat') { updateTask(S.open, { repeat: e.target.value ? { every: e.target.value, interval: f.task.repeat?.interval || 1 } : null, due: e.target.value && !f.task.due ? t0() : f.task.due }); paintDetail(view(), t0()); }
    else if (id === 'td-f-interval') updateTask(S.open, { repeat: { ...f.task.repeat, interval: +e.target.value || 1 } });
    else if (id === 'td-f-list') { updateTask(S.open, {}, e.target.value); paintDetail(view(), t0()); }
  });
  app.addEventListener('keydown', e => {
    if (e.key === 'Escape') { if (S.modal) closeModal(); else if (S.open) { S.open = null; S.pane = 'list'; paint(); } }
    if (e.key === 'Enter' && e.target.id === 'td-f-title') { e.preventDefault(); e.target.blur(); }
  });
  // The date chip in the add bar opens the calendar straight away where the browser allows it.
  app.addEventListener('click', e => { const input = e.target.closest('.todo-chip.pick')?.querySelector('input'); if (input && e.target !== input) { try { input.showPicker(); e.preventDefault(); } catch { /* the label opens it */ } } });
  app.addEventListener('dragover', e => { if (S.modal === 'import') e.preventDefault(); });
  app.addEventListener('drop', async e => { if (S.modal !== 'import') return; e.preventDefault(); const file = e.dataTransfer?.files?.[0]; if (file) setPreview(await file.text()); });
  // The phone's back gesture steps back through the screens (detail → list → lists) instead of leaving.
  addEventListener('popstate', () => { if (S.pane === 'detail') { S.open = null; S.pane = 'list'; paint(); } else if (S.pane === 'list' && standalone) { S.pane = 'nav'; paint(); } });
  let lastPane = 'list';
  const syncHistory = () => { if (standalone && S.pane !== lastPane && (S.pane === 'detail' || (S.pane === 'list' && lastPane === 'nav'))) history.pushState({ pane: S.pane }, ''); lastPane = S.pane; };
  app.addEventListener('click', () => setTimeout(syncHistory), true);
  // A new day changes Mi día: refresh when the app comes back.
  document.addEventListener('visibilitychange', () => { if (!document.hidden && S.doc) refresh(); });

  async function refresh() {
    try { S.doc = docOf(await call('GET')); write('cache', S.doc); S.error = ''; }
    catch { if (!S.doc) S.error = 'No se pudo leer tus tareas ahora mismo.'; }
    paint();
    flush();
  }

  window.TodoLab = { async initialise(token, options = {}) {
    csrf = token; standalone = !!options.standalone;
    model = await import('/control/todo-model.js?v=20261123b');
    // In the app, a link like /control/tareas/#planned opens that list (the icon's long-press shortcuts use it).
    const wanted = decodeURIComponent(location.hash.slice(1));
    if (standalone && wanted) S.view = wanted;
    if (standalone && matchMedia('(max-width: 700px)').matches && !wanted) S.pane = 'nav';
    const cached = read('cache', null);
    if (cached?.lists) { S.doc = cached; paint(); }
    await refresh();
    if (!S.doc) { S.doc = model.emptyDoc(); paint(); }
  } };
})();
