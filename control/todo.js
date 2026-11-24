// Tareas, in Mission Control's style: one column, three tabs.
//   HOY      routines as orbs, what is due now, the next 14 days as a log, projects in progress
//   LISTAS   every list as a card; a list opens in place (tasks, the shopping list, ideas, projects)
//   RUTINAS  things done every day or some weekdays, with streaks and a heat map
// One bar adds anything ("pagar la luz el viernes #coche"); a sheet edits a task. Steps open inside the row.
// The same code runs inside Mission Control (#todo) and as the home-screen app (/control/tareas/).
(() => {
  const app = document.getElementById('todo-app');
  if (!app) return;
  const API = '/control/api/todo/status';
  let model, csrf = '', standalone = false;
  const read = (k, d) => { try { const v = localStorage.getItem('todo.' + k); return v === null ? d : JSON.parse(v); } catch { return d; } };
  const write = (k, v) => { try { localStorage.setItem('todo.' + k, JSON.stringify(v)); } catch { /* memory only */ } };
  const S = {
    doc: null, agent: null, queue: read('queue', []), tab: read('tab', 'hoy'), list: read('list', ''), open: null, sheet: null,
    expanded: new Set(), showDone: false, query: '', searching: false, target: '', error: '', preview: null, claudeTab: 'paste', claudeText: '', newKey: '', flash: '',
  };
  if (!['hoy', 'listas', 'rutinas'].includes(S.tab)) S.tab = 'hoy';
  const E = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const today = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
  const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const WEEKDAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const DAY_LETTERS = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
  const KIND_LABEL = { tasks: 'Tareas', check: 'Compra', ideas: 'Ideas', project: 'Proyecto', routine: 'Rutinas' };
  const cap = s => s.replace(/^./, c => c.toUpperCase());
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  const view = () => { try { return model.applyOps(S.doc, S.queue); } catch { return S.doc; } };
  const normal = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  // ---------- Icons ----------
  const I = {
    plus: '<path d="M12 5v14M5 12h14"/>', search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>', close: '<path d="M6 6l12 12M18 6L6 18"/>',
    back: '<path d="M15 5l-7 7 7 7"/>', chev: '<path d="M9 6l6 6-6 6"/>', star: '<path d="M12 3.2l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.5l-5.2 2.8 1-5.8L3.5 9.4l5.9-.8z"/>',
    cal: '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>', sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
    flame: '<path d="M12 21c-3.9 0-6.5-2.6-6.5-6.2 0-3.4 2.4-5.4 3.6-8 .4 2 1.5 3.2 2.6 3.7C11.5 7.2 13 4.6 15.3 3c-.3 3 1.2 4.6 2.4 6.3 1 1.4 1.8 3 1.8 5.5 0 3.6-3.6 6.2-7.5 6.2z"/>',
    list: '<path d="M9 6.5h11M9 12h11M9 17.5h11"/><circle cx="4.8" cy="6.5" r="1"/><circle cx="4.8" cy="12" r="1"/><circle cx="4.8" cy="17.5" r="1"/>',
    cart: '<path d="M3 4h2.5l2.2 11h10.6L20.5 7H7"/><circle cx="9.5" cy="19" r="1.4"/><circle cx="17" cy="19" r="1.4"/>',
    idea: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.4 1.1 2.2h5c0-.8.4-1.6 1.1-2.2A6 6 0 0 0 12 3z"/>', flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
    repeat: '<path d="M4 11V9a3 3 0 0 1 3-3h12l-3-3M20 13v2a3 3 0 0 1-3 3H5l3 3"/>', note: '<path d="M5 4h10l4 4v12H5zM14 4v5h5M8.5 13h7M8.5 16.5h5"/>',
    bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20.5a2 2 0 0 0 4 0"/>', trash: '<path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13M10 11v5.5M14 11v5.5"/>',
    upload: '<path d="M12 15V4M7.5 8.5L12 4l4.5 4.5M5 15v4.5h14V15"/>', spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>', key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l8-8M16 7l3 3M14 9l2 2"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', more: '<circle cx="5.5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="18.5" cy="12" r="1.3"/>',
    home: '<path d="M4 11l8-7 8 7M6.5 9.5V20h11V9.5"/>', app: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
  };
  const icon = (name, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${I[name] || I.list}</svg>`;
  const KIND_ICON = { tasks: 'list', ideas: 'idea', check: 'cart', project: 'flag', routine: 'flame' };
  const ORB = ['#52d9ff', '#c9ff3d', '#a98be0', '#ff8a5c', '#5ce1a5', '#ffd25c', '#ff6b9a'];
  const hash = s => [...String(s)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  const colourOf = id => ORB[hash(id) % ORB.length];
  const split = name => model.splitEmoji(name);
  const listMark = l => { const { emoji } = split(l.name); return emoji ? `<i class="emo">${E(emoji)}</i>` : icon(KIND_ICON[l.kind]); };

  // ---------- Dates ----------
  const t0 = () => today();
  const shortDate = (date, t = t0()) => { const d = new Date(date + 'T12:00:00Z'); return `${WEEKDAYS[d.getUTCDay()].slice(0, 3)} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}${date.slice(0, 4) !== t.slice(0, 4) ? ' ' + date.slice(0, 4) : ''}`; };
  function dueLabel(date, t = t0()) {
    const n = model.daysUntil(date, t);
    if (n === 0) return 'hoy'; if (n === 1) return 'mañana'; if (n === -1) return 'ayer';
    if (n < 0) return `hace ${-n} días`;
    if (n < 7) return WEEKDAYS[new Date(date + 'T12:00:00Z').getUTCDay()];
    return shortDate(date, t);
  }
  const REPEAT_LABEL = { day: ['Cada día', 'días'], week: ['Cada semana', 'semanas'], month: ['Cada mes', 'meses'], year: ['Cada año', 'años'] };

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
    try { S.doc = docOf(await call('POST', { ops: sent })); S.queue = S.queue.slice(sent.length); S.error = ''; }
    catch (e) { if (e.status === 400 || e.status === 413) { S.queue = S.queue.slice(sent.length); S.error = 'No se pudo guardar el último cambio (' + e.message + ').'; } }
    finally { flushing = false; write('queue', S.queue); write('cache', S.doc); paint(); }
    if (S.queue.length && !S.error) setTimeout(flush, 50);
  }
  function send(...ops) { S.queue.push(...ops); write('queue', S.queue); paint(); flush(); }
  setInterval(() => { if (S.queue.length) flush(); }, 20_000);
  addEventListener('online', flush);

  // ---------- Frame ----------
  let root;
  function paint() {
    if (!S.doc) return;
    try {
      if (!root) {
        app.innerHTML = '<div class="tk" id="tk"><header class="tk-head" id="tk-head"></header><div class="tk-bar" id="tk-bar"></div><main class="tk-body" id="tk-body"></main><div class="tk-sheet-wrap" id="tk-sheet" hidden></div></div>';
        root = document.getElementById('tk');
      }
      const doc = view(), t = t0();
      if (S.list && !doc.lists.some(l => l.id === S.list)) S.list = '';
      if (S.open && !find(S.open)) { S.open = null; if (S.sheet === 'task') S.sheet = null; }
      paintHead(doc, t);
      const bar = document.getElementById('tk-bar');
      if (!bar.contains(document.activeElement)) paintBar(doc, t);
      document.getElementById('tk-body').innerHTML = S.searching && S.query.trim() ? paintSearch(doc, t) : S.tab === 'hoy' ? paintHoy(doc, t) : S.tab === 'rutinas' ? paintRutinas(doc, t) : S.list ? paintList(doc, t) : paintListas(doc, t);
      paintSheet(doc, t);
      paintSummary(doc, t);
    } catch (error) {
      // Never a blank screen: say what failed so it can be fixed.
      S.error = 'Algo falló al pintar: ' + error.message;
      console.error(error);
    }
    paintStatus();
    S.flash = '';
  }
  function paintHead(doc, t) {
    const d = new Date(t + 'T12:00:00Z');
    const routines = model.routinesToday(doc, t), rDone = routines.filter(r => model.doneOn(r.task, t)).length;
    const now = nowRows(doc, t), doneToday = doneTodayRows(doc, t);
    const total = routines.length + now.length + doneToday.length, pct = total ? (rDone + doneToday.length) / total : 0;
    const tab = (id, label, n) => `<button type="button" role="tab" data-tab="${id}" aria-selected="${S.tab === id && !S.searching}">${label}${n ? `<b>${n}</b>` : ''}</button>`;
    document.getElementById('tk-head').innerHTML = `
      <div class="tk-top">
        <div><p class="tk-eyebrow"><span></span>Tareas · ${WEEKDAYS[d.getUTCDay()].slice(0, 3)} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}</p>
          <h1>${S.searching ? 'Buscar' : S.tab === 'hoy' ? 'Hoy' : S.tab === 'rutinas' ? 'Rutinas' : S.list ? E(split(doc.lists.find(l => l.id === S.list)?.name || '').name) : 'Listas'}</h1></div>
        <div class="tk-meter" title="Hoy hecho"><span><i style="width:${(pct * 100).toFixed(1)}%"></i></span><small>${Math.round(pct * 100)}% del día</small></div>
        <div class="tk-tools"><button type="button" class="tk-icon" data-act="search" aria-label="Buscar" aria-pressed="${S.searching}">${icon('search')}</button>
          <button type="button" class="tk-icon" data-act="menu" aria-label="Más">${icon('more')}</button></div>
      </div>
      <nav class="tk-tabs" role="tablist">${tab('hoy', 'Hoy', now.length)}${tab('listas', 'Listas', '')}${tab('rutinas', 'Rutinas', routines.length - rDone)}</nav>`;
  }

  // The one bar that adds everything. "#coche" sends it to that list; a date at the end becomes the deadline.
  function targetList(doc, text) {
    const tag = text.match(/(?:^|\s)#(\S+)/);
    if (tag) { const want = normal(tag[1]); const l = doc.lists.find(x => x.kind !== 'routine' && normal(split(x.name).name).replace(/\s+/g, '').startsWith(want)); if (l) return { list: l, text: text.replace(tag[0], ' ').trim() }; }
    if (S.tab === 'listas' && S.list) return { list: doc.lists.find(l => l.id === S.list), text };
    return { list: doc.lists.find(l => l.id === S.target) || doc.lists.find(l => l.kind === 'tasks') || doc.lists[0], text };
  }
  function paintBar(doc, t) {
    const bar = document.getElementById('tk-bar');
    if (S.searching) { bar.innerHTML = `<label class="tk-add search">${icon('search')}<input id="tk-q" type="search" placeholder="Buscar en todo" value="${E(S.query)}" enterkeyhint="search"></label>`; return; }
    const routine = S.tab === 'rutinas', l = S.tab === 'listas' && S.list ? doc.lists.find(x => x.id === S.list) : null;
    const ph = routine ? 'Nueva rutina: 💊 Vitamina D, 🏋️ Entrenar…' : l?.kind === 'check' ? 'Añadir a la compra' : l?.kind === 'ideas' ? 'Nueva idea' : l?.kind === 'project' ? 'Añadir a la checklist' : 'Añadir algo…';
    const lists = doc.lists.filter(x => x.kind !== 'routine');
    bar.innerHTML = `<form class="tk-add" id="tk-add" autocomplete="off">${icon('plus')}<input id="tk-title" maxlength="400" placeholder="${E(ph)}" aria-label="${E(ph)}" enterkeyhint="send">
      ${routine || l ? '' : `<label class="tk-target" title="Dónde va">${icon('chev')}<select id="tk-target" aria-label="Lista">${lists.map(x => `<option value="${E(x.id)}" ${x.id === (S.target || lists.find(y => y.kind === 'tasks')?.id) ? 'selected' : ''}>${E(split(x.name).name)}</option>`).join('')}</select></label>`}
      <button type="submit" class="tk-go" aria-label="Añadir">${icon('check')}</button></form><p class="tk-hint" id="tk-hint">${routine ? 'Empieza con un emoji y elige días y hora al crearla.' : l ? 'Una fecha al final («el viernes», «30/11») la pone en el calendario.' : 'Prueba «pagar la luz el viernes #coche»: lo entiendo.'}</p>`;
  }
  function hint() {
    const el = document.getElementById('tk-hint'), raw = document.getElementById('tk-title')?.value || '';
    if (!el) return;
    if (!raw.trim() || S.tab === 'rutinas') return;
    const doc = view(), { list, text } = targetList(doc, raw), p = model.parseQuick(text, t0());
    el.innerHTML = `→ ${E(split(list.name).name)}${p.due ? ` · <b>${E(shortDate(p.due))}</b>` : S.tab === 'hoy' && !S.list ? ' · hoy' : ''}`;
  }

  // ---------- Rows ----------
  const find = id => { for (const list of view().lists) { const task = list.tasks.find(x => x.id === id); if (task) return { task, list }; } return null; };
  const check = (task, cls = '') => `<button type="button" class="tk-check ${cls}" data-toggle="${E(task.id)}" aria-pressed="${task.done}" aria-label="${task.done ? 'Desmarcar' : 'Hecho'}: ${E(task.title)}"></button>`;
  function row(task, list, t, { showList = false, extra = '' } = {}) {
    const meta = [];
    if (showList) meta.push(`<span class="tk-tag">${listMark(list)}${E(split(list.name).name)}</span>`);
    if (task.due) { const n = model.daysUntil(task.due, t); meta.push(`<span class="tk-due ${!task.done && n < 0 ? 'late' : n <= 0 ? 'now' : n <= 2 ? 'soon' : ''}">${icon('cal')}${E(dueLabel(task.due, t))}</span>`); }
    if (task.repeat) meta.push(icon('repeat'));
    if (task.note.trim()) meta.push(`<span class="tk-note">${icon('note')}${E(task.note.trim().split('\n')[0].slice(0, 60))}</span>`);
    const open = S.expanded.has(task.id), steps = task.steps.length;
    return `<li class="tk-row${task.done ? ' done' : ''}${task.important ? ' star' : ''}${S.flash === task.id ? ' flash' : ''}">
      <div class="tk-row-main">${check(task)}
        <button type="button" class="tk-row-text" data-edit="${E(task.id)}"><span>${E(task.title)}</span>${meta.length ? `<small>${meta.join('')}</small>` : ''}</button>
        ${steps ? `<button type="button" class="tk-steps-btn" data-expand="${E(task.id)}" aria-expanded="${open}"><b>${task.steps.filter(s => s.done).length}/${steps}</b>${icon('chev', open ? 'down' : '')}</button>` : ''}${extra}
        <button type="button" class="tk-star" data-star="${E(task.id)}" aria-pressed="${task.important}" aria-label="Importante">${icon('star')}</button></div>
      ${open ? `<ul class="tk-substeps">${task.steps.map(s => `<li><button type="button" class="tk-check small" data-step="${E(task.id)}|${E(s.id)}" aria-pressed="${s.done}" aria-label="Paso hecho"></button><span class="${s.done ? 'done' : ''}">${E(s.title)}</span></li>`).join('')}
        <li><form class="tk-step-add" data-task="${E(task.id)}" autocomplete="off">${icon('plus')}<input maxlength="400" placeholder="Añadir paso" aria-label="Añadir paso"></form></li></ul>` : ''}</li>`;
  }
  const empty = (title, text, ic = 'check') => `<div class="tk-empty">${icon(ic)}<b>${title}</b><p>${text}</p></div>`;

  // ---------- HOY ----------
  const nowRows = (doc, t) => model.tasksFor(doc, 'myday', t).filter(r => !r.task.done).sort((a, b) => (a.task.due || '9').localeCompare(b.task.due || '9'));
  const doneTodayRows = (doc, t) => model.tasksFor(doc, 'myday', t).filter(r => r.task.done && (r.task.completed || '').slice(0, 10) === t);
  function paintHoy(doc, t) {
    const routines = model.routinesToday(doc, t), now = nowRows(doc, t), doneToday = doneTodayRows(doc, t);
    const soon = model.upcoming(doc, t, 120).filter(r => r.task.due > t && model.daysUntil(r.task.due, t) <= 14);
    const later = model.upcoming(doc, t, 200).filter(r => model.daysUntil(r.task.due, t) > 14).slice(0, 3);
    const projects = doc.lists.filter(l => l.kind === 'project').map(l => ({ l, p: model.progress(l) })).filter(x => x.p.total && x.p.done < x.p.total);
    const orbs = routines.length ? `<div class="tk-orbs">${routines.map(r => orb(r.task, t)).join('')}<button type="button" class="tk-orb add" data-tab="rutinas" aria-label="Rutinas">${icon('plus')}<span>Rutina</span></button></div>`
      : `<div class="tk-invite"><p>Lo que haces cada día, en un toque:</p><div class="tk-chips">${['💊 Pastilla', '🏋️ Entrenar', '💧 Beber agua', '📖 Leer', '🧘 Estirar'].map(x => `<button type="button" class="tk-chip" data-new-routine="${E(x)}">${E(x)}</button>`).join('')}</div></div>`;
    // The next two weeks as a log: one line per day that has something.
    const days = [];
    for (const r of soon) { const last = days.at(-1); if (last?.date === r.task.due) last.rows.push(r); else days.push({ date: r.task.due, rows: [r] }); }
    const log = days.length ? `<ol class="tk-log">${days.map(g => { const n = model.daysUntil(g.date, t), d = new Date(g.date + 'T12:00:00Z'); return `<li class="${n <= 2 ? 'soon' : ''}"><div class="tk-log-day"><b>${d.getUTCDate()}</b><small>${WEEKDAYS[d.getUTCDay()].slice(0, 3)}</small><em>${n === 1 ? 'mañana' : `en ${n} d`}</em></div><ul class="tk-rows">${g.rows.map(r => row(r.task, r.list, t, { showList: true })).join('')}</ul></li>`; }).join('')}</ol>` : '<p class="tk-quiet">Nada con fecha en las próximas dos semanas.</p>';
    return `
      <section class="tk-sec"><h2><span>Rutinas</span><small>${routines.filter(r => model.doneOn(r.task, t)).length}/${routines.length}</small></h2>${orbs}</section>
      <section class="tk-sec"><h2><span>Ahora</span><small>${now.length ? plural(now.length, 'pendiente', 'pendientes') : 'todo hecho'}</small></h2>
        ${now.length ? `<ul class="tk-rows">${now.map(r => row(r.task, r.list, t, { showList: true })).join('')}</ul>` : '<p class="tk-quiet">Nada para hoy. Escribe arriba y aparece aquí.</p>'}
        ${doneToday.length ? `<p class="tk-done-today">${icon('check')}${plural(doneToday.length, 'hecha', 'hechas')} hoy · ${doneToday.slice(0, 5).map(r => E(r.task.title)).join(' · ')}</p>` : ''}</section>
      <section class="tk-sec"><h2><span>Próximos 14 días</span><small>${plural(soon.length, 'plazo', 'plazos')}</small></h2>${log}
        ${later.length ? `<p class="tk-later">Después: ${later.map(r => `<button type="button" data-edit="${E(r.task.id)}">${E(r.task.title)} <i>${E(shortDate(r.task.due, t))}</i></button>`).join('')}</p>` : ''}</section>
      ${projects.length ? `<section class="tk-sec"><h2><span>Proyectos</span></h2><div class="tk-projects">${projects.map(({ l, p }) => `<button type="button" class="tk-project" data-open-list="${E(l.id)}"><span>${listMark(l)}${E(split(l.name).name)}</span><i class="tk-bar-mini"><i style="width:${(p.done / p.total * 100).toFixed(1)}%"></i></i><small>${p.done}/${p.total} · ${Math.round(p.done / p.total * 100)}%</small></button>`).join('')}</div></section>` : ''}`;
  }
  function orb(task, t) {
    const { emoji, name } = split(task.title), done = model.doneOn(task, t), st = model.streak(task, t);
    return `<button type="button" class="tk-orb${done ? ' done' : ''}" data-habit="${E(task.id)}" aria-pressed="${done}" style="--c:${colourOf(task.id)}" aria-label="${E(name)}${done ? ', hecha' : ''}">
      <span class="tk-orb-core">${emoji ? `<i class="emo">${E(emoji)}</i>` : `<i class="ini">${E(name.slice(0, 1).toUpperCase())}</i>`}</span>
      <span>${E(name)}</span><small>${task.habit?.time ? E(task.habit.time) : ''}${st ? ` 🔥${st}` : ''}</small></button>`;
  }

  // ---------- LISTAS ----------
  function paintListas(doc, t) {
    const lists = doc.lists.filter(l => l.kind !== 'routine').map(l => ({ l, open: l.tasks.filter(x => !x.done).length, p: model.progress(l) }));
    const active = lists.filter(x => x.open || x.l.kind === 'check'), quiet = lists.filter(x => !x.open && x.l.kind !== 'check');
    const order = { project: 0, tasks: 1, check: 2, ideas: 3 };
    active.sort((a, b) => order[a.l.kind] - order[b.l.kind] || b.open - a.open);
    const card = ({ l, open, p }) => `<button type="button" class="tk-card k-${l.kind}" data-open-list="${E(l.id)}" style="--c:${colourOf(l.id)}">
      <span class="tk-card-top">${listMark(l)}<em>${KIND_LABEL[l.kind]}</em></span><b>${E(split(l.name).name)}</b>
      ${l.kind === 'project' ? `<i class="tk-bar-mini"><i style="width:${p.total ? (p.done / p.total * 100).toFixed(1) : 0}%"></i></i><small>${p.done}/${p.total} hecho</small>`
        : `<small>${l.kind === 'check' ? `${open} por comprar` : l.kind === 'ideas' ? plural(open, 'idea', 'ideas') : plural(open, 'pendiente', 'pendientes')}${l.tasks.some(x => !x.done && x.due && x.due <= t) ? ' · <i class="late">vence</i>' : ''}</small>`}</button>`;
    return `<div class="tk-cards">${active.map(card).join('')}
        <button type="button" class="tk-card new" data-act="new-list">${icon('plus')}<b>Nueva lista</b><small>tareas, compra, ideas o proyecto</small></button>
        <button type="button" class="tk-card new" data-act="claude">${icon('spark')}<b>Desde Claude</b><small>pega una checklist de un chat</small></button></div>
      ${quiet.length ? `<p class="tk-sub">Vacías o terminadas</p><div class="tk-cards small">${quiet.map(card).join('')}</div>` : ''}`;
  }
  function paintList(doc, t) {
    const l = doc.lists.find(x => x.id === S.list);
    const open = l.tasks.filter(x => !x.done), done = l.tasks.filter(x => x.done);
    const head = `<div class="tk-list-head"><button type="button" class="tk-back" data-act="back">${icon('back')}Listas</button><span class="tk-kind">${listMark(l)}${KIND_LABEL[l.kind]}</span><button type="button" class="tk-icon" data-act="list-menu" aria-label="Opciones de la lista">${icon('more')}</button></div>`;
    let body;
    if (l.kind === 'project') {
      const p = model.progress(l);
      body = `<div class="tk-progress"><span><i style="width:${p.total ? (p.done / p.total * 100).toFixed(1) : 0}%"></i></span><b>${p.total ? Math.round(p.done / p.total * 100) : 0}%</b><small>${p.done}/${p.total}</small></div>`
        + (l.tasks.length ? model.sections(l).map(g => { const d = g.tasks.filter(x => x.done).length; return `<section class="tk-sec"><h2><span>${E(g.name || 'General')}</span><small>${d}/${g.tasks.length}</small></h2><ul class="tk-rows">${g.tasks.map(x => row(x, l, t)).join('')}</ul></section>`; }).join('')
          : empty('Checklist vacía', 'Añade arriba, o pega la lista de un chat de Claude en «Desde Claude».', 'flag'));
    } else if (l.kind === 'check') {
      done.sort((a, b) => a.title.localeCompare(b.title, 'es', { sensitivity: 'base' }));
      body = `<section class="tk-sec"><h2><span>Por comprar</span><small>${open.length}</small></h2>${open.length ? `<ul class="tk-rows">${open.map(x => row(x, l, t)).join('')}</ul>` : '<p class="tk-quiet">No falta nada. Toca abajo lo que se acabe.</p>'}</section>
        ${done.length ? `<section class="tk-sec"><h2><span>En casa</span><small>toca para volver a ponerlo</small></h2><div class="tk-pills">${done.map(x => `<button type="button" class="tk-pill" data-toggle="${E(x.id)}">${E(x.title)}</button>`).join('')}</div></section>` : ''}`;
    } else if (l.kind === 'ideas') {
      body = open.length ? `<div class="tk-ideas">${open.map(x => `<article class="tk-idea"><button type="button" data-edit="${E(x.id)}"><b>${E(x.title)}</b>${x.note.trim() ? `<p>${E(x.note.trim().slice(0, 200))}</p>` : ''}${x.due ? `<small>${icon('cal')}${E(shortDate(x.due, t))}</small>` : ''}</button><div>${check(x)}<button type="button" class="tk-star" data-star="${E(x.id)}" aria-pressed="${x.important}" aria-label="Importante">${icon('star')}</button></div></article>`).join('')}</div>`
        : empty('Sin ideas aún', 'Regalos, planes, sitios, pelis… apúntalas sin prisa.', 'idea');
      if (done.length) body += doneBlock(done, l, t);
    } else {
      const sorted = open.slice().sort((a, b) => (b.important - a.important) || (a.due || '9').localeCompare(b.due || '9'));
      body = (sorted.length ? `<ul class="tk-rows">${sorted.map(x => row(x, l, t)).join('')}</ul>` : empty('Todo hecho', 'No queda nada pendiente aquí.')) + (done.length ? doneBlock(done, l, t) : '');
    }
    return head + body;
  }
  function doneBlock(done, l, t) {
    done.sort((a, b) => (b.completed || '').localeCompare(a.completed || ''));
    return `<button type="button" class="tk-more" data-act="show-done" aria-expanded="${S.showDone}">${icon('chev', S.showDone ? 'down' : '')}${plural(done.length, 'hecha', 'hechas')}</button>${S.showDone ? `<ul class="tk-rows">${done.slice(0, 200).map(x => row(x, l, t)).join('')}</ul>` : ''}`;
  }

  // ---------- RUTINAS ----------
  function paintRutinas(doc, t) {
    const rows = model.routineRows(doc);
    if (!rows.length) return empty('Tus rutinas', 'La pastilla, entrenar, leer… Se reinician cada día y llevan tu racha.', 'flame') + `<div class="tk-chips center">${['💊 Pastilla', '🏋️ Entrenar', '💧 Beber agua', '📖 Leer'].map(x => `<button type="button" class="tk-chip" data-new-routine="${E(x)}">${E(x)}</button>`).join('')}</div>`;
    return `<div class="tk-routines">${rows.map(({ task }) => {
      const { emoji, name } = split(task.title), due = model.habitDue(task, t), done = model.doneOn(task, t), st = model.streak(task, t), hist = model.habitHistory(task, t, 28);
      return `<article class="tk-routine${due ? '' : ' rest'}" style="--c:${colourOf(task.id)}">
        <button type="button" class="tk-orb-core small${done ? ' done' : ''}" data-habit="${E(task.id)}" aria-pressed="${done}" aria-label="${E(name)}: hecha hoy">${emoji ? `<i class="emo">${E(emoji)}</i>` : icon('check')}</button>
        <button type="button" class="tk-routine-text" data-edit="${E(task.id)}"><b>${E(name)}</b><small>${E(model.scheduleText(task.habit))}${due ? '' : ' · hoy descansa'}</small></button>
        <span class="tk-streak${st ? '' : ' zero'}">${icon('flame')}${st}</span>
        <div class="tk-heat">${hist.map(h => `<i class="${h.done ? 'on' : h.due ? 'miss' : 'off'}${h.date === t ? ' now' : ''}" title="${h.date}"></i>`).join('')}</div></article>`;
    }).join('')}</div>`;
  }

  // ---------- Search ----------
  function paintSearch(doc, t) {
    const rows = model.tasksFor(doc, 'search', t, S.query);
    const open = rows.filter(r => !r.task.done), done = rows.filter(r => r.task.done);
    return rows.length ? `<ul class="tk-rows">${open.concat(done).slice(0, 200).map(r => row(r.task, r.list, t, { showList: true })).join('')}</ul>` : empty('Nada', `No hay nada con «${E(S.query)}».`, 'search');
  }

  // ---------- Sheets ----------
  const kindOption = (value, label, hint, checked = false) => `<label><input type="radio" name="kind" value="${value}" ${checked ? 'checked' : ''}><span>${icon(KIND_ICON[value])}<b>${label}</b><small>${hint}</small></span></label>`;
  const CLAUDE_PROMPT = 'Pásame esto como checklist en este formato exacto, sin nada más (lo voy a pegar en mi app de tareas):\n\n# 🇩🇪 Nombre del proyecto\n## Sección\n- [ ] Tarea (si tiene fecha límite, al final: 15/01/2027)\n- [x] Tarea que ya está hecha\n  - paso opcional dentro de una tarea\n## Otra sección\n- [ ] …';
  let sheetKey = '';
  function paintSheet(doc, t) {
    const el = document.getElementById('tk-sheet');
    if (!S.sheet) { el.hidden = true; el.innerHTML = ''; sheetKey = ''; return; }
    if (el.contains(document.activeElement) && /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) && sheetKey.startsWith(S.sheet + '|' + S.open)) return;
    const key = [S.sheet, S.open, S.claudeTab, S.newKey, S.agent?.created, S.preview ? JSON.stringify(S.preview.summary || S.preview.error) : '', S.sheet === 'task' ? JSON.stringify(find(S.open)?.task) : ''].join('|');
    if (key === sheetKey && !el.hidden) return;
    sheetKey = key; el.hidden = false;
    let inner = '';
    if (S.sheet === 'task') inner = taskSheet(doc, t);
    else if (S.sheet === 'menu') inner = `<h2>Tareas</h2><div class="tk-menu">
      <button type="button" data-act="claude">${icon('spark')}<span><b>Desde Claude</b><small>Pegar una checklist o dejar que Claude actualice tus listas</small></span></button>
      <button type="button" data-act="new-list">${icon('plus')}<span><b>Nueva lista</b><small>Tareas, compra, ideas o proyecto</small></span></button>
      <button type="button" data-act="import">${icon('upload')}<span><b>Importar de Microsoft To Do</b><small>Volver a traer listas (no duplica)</small></span></button>
      ${standalone ? `<a href="/control/">${icon('home')}<span><b>Mission Control</b><small>Volver al panel</small></span></a>` : `<a href="/control/tareas/">${icon('app')}<span><b>Abrir como app</b><small>Para instalarla en el móvil</small></span></a>`}</div>
      <div class="tk-foot"><span></span><button type="button" class="tk-btn" data-act="close">Cerrar</button></div>`;
    else if (S.sheet === 'new-list') inner = `<h2>Nueva lista</h2><form id="tk-new-list" autocomplete="off"><input id="tk-f-newname" maxlength="120" placeholder="Nombre (puede empezar con un emoji: 🎁 Regalos)" required>
      <div class="tk-kinds">${kindOption('tasks', 'Tareas', 'Con fechas y pasos', true)}${kindOption('project', 'Proyecto', 'Secciones y progreso')}${kindOption('check', 'Compra', 'Marcar y desmarcar')}${kindOption('ideas', 'Ideas', 'Sin prisa, en tarjetas')}</div>
      <div class="tk-foot"><button type="button" class="tk-btn" data-act="close">Cancelar</button><button class="tk-btn primary" type="submit">Crear</button></div></form>`;
    else if (S.sheet === 'list') {
      const l = doc.lists.find(x => x.id === S.list);
      if (!l) { S.sheet = null; return paintSheet(doc, t); }
      inner = `<h2>Lista</h2><form id="tk-rename" autocomplete="off"><input id="tk-f-listname" maxlength="120" value="${E(l.name)}" aria-label="Nombre">
        <div class="tk-kinds">${kindOption('tasks', 'Tareas', 'Con fechas y pasos', l.kind === 'tasks')}${kindOption('project', 'Proyecto', 'Secciones y progreso', l.kind === 'project')}${kindOption('check', 'Compra', 'Marcar y desmarcar', l.kind === 'check')}${kindOption('ideas', 'Ideas', 'Sin prisa, en tarjetas', l.kind === 'ideas')}</div>
        <div class="tk-foot">${doc.lists.length > 1 ? `<button type="button" class="tk-btn danger" data-act="delete-list">${icon('trash')}Eliminar</button>` : '<span></span>'}<span><button type="button" class="tk-btn" data-act="close">Cancelar</button><button class="tk-btn primary" type="submit">Guardar</button></span></div></form>`;
    } else if (S.sheet === 'claude') {
      const p = S.preview;
      const tabs = `<div class="tk-seg" role="tablist"><button type="button" role="tab" data-ctab="paste" aria-selected="${S.claudeTab === 'paste'}">Pegar de un chat</button><button type="button" role="tab" data-ctab="connect" aria-selected="${S.claudeTab === 'connect'}">Que Claude lo actualice</button></div>`;
      inner = `<h2>${icon('spark')}Desde Claude</h2>${tabs}` + (S.claudeTab === 'paste'
        ? `<p class="tk-p">Pide a Claude la checklist con este formato (por ejemplo en el chat «Moving to Ingolstadt») y pega aquí la respuesta. Se crea un proyecto con secciones; si luego pegas una versión nueva, solo añade lo que falte y marca lo que venga hecho.</p>
          <button type="button" class="tk-btn" data-act="copy-prompt">${icon('copy')}<span>Copiar la instrucción para Claude</span></button>
          <textarea id="tk-f-claude" rows="9" placeholder="# 🇩🇪 Mudanza a Ingolstadt\n## Papeles\n- [x] Contrato firmado\n- [ ] Anmeldung antes del 15/01">${E(S.claudeText)}</textarea>
          ${p?.error ? `<p class="tk-err">${E(p.error)}</p>` : ''}${p?.lists ? `<div class="tk-preview">${p.lists.map(l => `<p>${icon('flag')}<b>${E(l.name)}</b> · ${plural(l.tasks.length, 'cosa', 'cosas')}${model.sections(l).filter(s => s.name).length ? ` en ${model.sections(l).filter(s => s.name).length} secciones` : ''}</p>`).join('')}</div>` : ''}
          <div class="tk-foot"><span></span><span><button type="button" class="tk-btn" data-act="close">Cerrar</button><button type="button" class="tk-btn primary" data-act="claude-create" ${p?.lists ? '' : 'disabled'}>Crear proyecto</button></span></div>`
        : `<p class="tk-p">Con una llave, Claude (en Claude Code) puede leer tus listas y cambiarlas por ti: «añade a la mudanza lo del seguro», «marca el Anmeldung», «crea una rutina de vitamina D».</p>
          ${S.newKey ? `<div class="tk-key"><code>${E(S.newKey)}</code><button type="button" class="tk-btn" data-act="copy-key">${icon('copy')}<span>Copiar</span></button></div>
            <ol class="tk-how"><li>Cópiala: solo se enseña ahora.</li><li>En una sesión de Claude Code di <b>«conecta mis Tareas»</b>: te la pedirá en un formulario seguro para <code>cesar-solla.pages.dev</code> (no la pegues en el chat).</li></ol>`
            : `<p class="tk-p">${S.agent ? `Hay una llave activa desde el ${E(shortDate(S.agent.created.slice(0, 10)))}. Hacer una nueva retira la anterior.` : 'Aún no hay ninguna llave.'}</p>`}
          <div class="tk-foot">${S.agent && !S.newKey ? '<button type="button" class="tk-btn danger" data-act="agent-revoke">Retirar la llave</button>' : '<span></span>'}<span><button type="button" class="tk-btn" data-act="close">Cerrar</button>${S.newKey ? '' : `<button type="button" class="tk-btn primary" data-act="agent-key">${icon('key')}${S.agent ? 'Llave nueva' : 'Crear llave'}</button>`}</span></div>`);
    } else if (S.sheet === 'import') {
      const p = S.preview;
      inner = `<h2>Importar de Microsoft To Do</h2><ol class="tk-how"><li>En el PC con To Do, descarga <a href="/control/todo-export.cmd" download>todo-export.cmd</a> y ábrelo con doble clic.</li><li>Elige aquí <code>Escritorio\\Claude\\Datos\\microsoft-todo.json</code>.</li></ol>
        <label class="tk-drop">${icon('upload')}<span>Elegir el archivo</span><input type="file" id="tk-file" accept=".json,.txt,.md,application/json,text/plain"></label>
        ${p?.error ? `<p class="tk-err">${E(p.error)}</p>` : ''}${p?.lists ? `<p class="tk-p"><b>${p.summary.lists}</b> listas · <b>${p.summary.tasks}</b> tareas. Importar dos veces no duplica nada.</p>` : ''}
        <div class="tk-foot"><span></span><span><button type="button" class="tk-btn" data-act="close">Cerrar</button>${p?.lists ? `<button type="button" class="tk-btn primary" data-act="do-import">Importar</button>` : ''}</span></div>`;
    }
    el.innerHTML = `<div class="tk-sheet" role="dialog" aria-modal="true">${inner}</div>`;
    if (S.sheet !== 'task') el.querySelector('input:not([type=radio]):not([type=file]), textarea')?.focus();
  }
  function taskSheet(doc, t) {
    const f = find(S.open);
    if (!f) return '';
    const { task, list } = f;
    if (list.kind === 'routine') return routineSheet(task, t);
    const n = task.due ? model.daysUntil(task.due, t) : 0;
    const secs = [...new Set(list.tasks.map(x => x.section).filter(Boolean))];
    return `<div class="tk-sheet-head">${check(task)}<textarea id="tk-f-title" rows="1" maxlength="400" aria-label="Título">${E(task.title)}</textarea><button type="button" class="tk-icon" data-act="close" aria-label="Cerrar">${icon('close')}</button></div>
      <ul class="tk-substeps in-sheet">${task.steps.map(s => `<li><button type="button" class="tk-check small" data-step="${E(task.id)}|${E(s.id)}" aria-pressed="${s.done}" aria-label="Paso hecho"></button><span class="${s.done ? 'done' : ''}">${E(s.title)}</span><button type="button" class="tk-x" data-del-step="${E(s.id)}" aria-label="Quitar paso">${icon('close')}</button></li>`).join('')}
        <li><form class="tk-step-add" data-task="${E(task.id)}" autocomplete="off">${icon('plus')}<input maxlength="400" placeholder="Añadir paso" aria-label="Añadir paso"></form></li></ul>
      <p class="tk-label">Fecha límite</p>
      <div class="tk-chips">${[['Hoy', t], ['Mañana', model.addDays(t, 1)], ['Viernes', model.addDays(t, ((5 - model.weekday(t) + 7) % 7) || 7)], ['+1 semana', model.addDays(t, 7)], ['+1 mes', model.addDays(t, 30)]].map(([l, d]) => `<button type="button" class="tk-chip${task.due === d ? ' on' : ''}" data-due="${d}">${l}</button>`).join('')}
        <label class="tk-chip pick${task.due ? ' on' : ''}">${icon('cal')}<span>${task.due ? E(shortDate(task.due, t)) + (n < 0 ? ' · vencida' : '') : 'Elegir'}</span><input type="date" id="tk-f-due" value="${E(task.due)}"></label>${task.due ? '<button type="button" class="tk-chip ghost" data-due="">Sin fecha</button>' : ''}</div>
      <div class="tk-grid2">
        <button type="button" class="tk-toggle${task.myDay === t ? ' on' : ''}" data-act="myday">${icon('sun')}<span>${task.myDay === t ? 'En Hoy' : 'Poner en Hoy'}</span></button>
        <button type="button" class="tk-toggle${task.important ? ' on' : ''}" data-star="${E(task.id)}">${icon('star')}<span>${task.important ? 'Importante' : 'Marcar importante'}</span></button>
        <label class="tk-field">${icon('repeat')}<select id="tk-f-repeat" aria-label="Repetir"><option value="">No se repite</option>${model.REPEATS.map(r => `<option value="${r}" ${task.repeat?.every === r ? 'selected' : ''}>${REPEAT_LABEL[r][0]}</option>`).join('')}</select></label>
        <label class="tk-field">${icon(KIND_ICON[list.kind])}<select id="tk-f-list" aria-label="Lista">${doc.lists.filter(l => l.kind !== 'routine').map(l => `<option value="${E(l.id)}" ${l.id === list.id ? 'selected' : ''}>${E(split(l.name).name)}</option>`).join('')}</select></label>
        ${list.kind === 'project' ? `<label class="tk-field wide">${icon('flag')}<input id="tk-f-section" list="tk-secs" maxlength="80" value="${E(task.section)}" placeholder="Sección"><datalist id="tk-secs">${secs.map(s => `<option value="${E(s)}">`).join('')}</datalist></label>` : ''}
        <label class="tk-field wide">${icon('bell')}<input type="datetime-local" id="tk-f-reminder" value="${E(task.reminder)}" aria-label="Recordatorio"></label>
      </div>
      <textarea id="tk-f-note" class="tk-notes" rows="4" maxlength="20000" placeholder="Notas">${E(task.note)}</textarea>
      <div class="tk-foot"><button type="button" class="tk-btn danger" data-act="delete-task">${icon('trash')}Eliminar</button><small>${task.done && task.completed ? 'Hecha el ' + E(shortDate(task.completed.slice(0, 10), t)) : 'Creada el ' + E(shortDate(task.created.slice(0, 10), t))}</small><button type="button" class="tk-btn primary" data-act="close">Listo</button></div>`;
  }
  function routineSheet(task, t) {
    const days = task.habit?.days || [], st = model.streak(task, t), hist = model.habitHistory(task, t, 56), { emoji } = split(task.title);
    const dueDays = hist.filter(h => h.due).length, doneDays = hist.filter(h => h.done).length;
    return `<div class="tk-sheet-head routine" style="--c:${colourOf(task.id)}"><span class="tk-orb-core small done">${emoji ? `<i class="emo">${E(emoji)}</i>` : icon('flame')}</span><textarea id="tk-f-title" rows="1" maxlength="400" aria-label="Nombre">${E(task.title)}</textarea><button type="button" class="tk-icon" data-act="close" aria-label="Cerrar">${icon('close')}</button></div>
      <div class="tk-stats"><span><b>${st}</b>racha</span><span><b>${dueDays ? Math.round(doneDays / dueDays * 100) : 0}%</b>8 semanas</span><span><b>${(task.log || []).length}</b>veces</span></div>
      <p class="tk-label">Qué días</p><div class="tk-chips"><button type="button" class="tk-chip${days.length ? '' : ' on'}" data-days="all">Cada día</button>${[1, 2, 3, 4, 5, 6, 0].map(d => `<button type="button" class="tk-chip day${days.includes(d) ? ' on' : ''}" data-day="${d}">${DAY_LETTERS[d]}</button>`).join('')}
        <label class="tk-chip pick${task.habit?.time ? ' on' : ''}">${icon('bell')}<span>${task.habit?.time || 'Hora'}</span><input type="time" id="tk-f-time" value="${E(task.habit?.time || '')}"></label></div>
      <p class="tk-label">Últimas 8 semanas · toca un día para corregirlo</p>
      <div class="tk-heat big">${hist.map(h => `<button type="button" class="${h.done ? 'on' : h.due ? 'miss' : 'off'}${h.date === t ? ' now' : ''}" data-log="${h.date}" title="${E(shortDate(h.date, t))}" aria-label="${E(shortDate(h.date, t))}${h.done ? ', hecha' : ''}"></button>`).join('')}</div>
      <textarea id="tk-f-note" class="tk-notes" rows="3" maxlength="20000" placeholder="Notas (dosis, ejercicios…)">${E(task.note)}</textarea>
      <div class="tk-foot"><button type="button" class="tk-btn danger" data-act="delete-task">${icon('trash')}Eliminar</button><span></span><button type="button" class="tk-btn primary" data-act="close">Listo</button></div>`;
  }
  function closeSheet() { S.sheet = null; S.open = null; S.preview = null; S.newKey = ''; paint(); }
  function setPreview(text) {
    try { const lists = model.parseImport(text, t0()), summary = model.importSummary(lists); S.preview = summary.tasks ? { lists, summary } : { error: 'No he encontrado tareas en eso.' }; }
    catch { S.preview = { error: 'Ese texto no es una exportación de To Do ni una lista que entienda.' }; }
    paint();
  }
  function paintStatus() {
    let el = document.getElementById('tk-status');
    if (!el && root) { el = document.createElement('p'); el.id = 'tk-status'; el.className = 'tk-status'; el.setAttribute('role', 'status'); root.append(el); }
    if (el) el.textContent = S.error || (S.queue.length ? `${plural(S.queue.length, 'cambio', 'cambios')} sin guardar · reintentando` : '');
  }
  // Mission Control's home card shows what is coming.
  function paintSummary(doc, t) {
    const el = document.getElementById('todo-summary');
    if (!el) return;
    const next = model.upcoming(doc, t, 50), late = next.filter(r => r.task.due < t).length, week = next.filter(r => model.daysUntil(r.task.due, t) >= 0 && model.daysUntil(r.task.due, t) < 7).length;
    const r = model.routinesToday(doc, t), rd = r.filter(x => model.doneOn(x.task, t)).length;
    el.textContent = [r.length ? `Rutinas ${rd}/${r.length}` : '', late ? `${late} vencida${late === 1 ? '' : 's'}` : '', plural(week, 'plazo esta semana', 'plazos esta semana'), next[0] ? `próximo: ${next[0].task.title}` : ''].filter(Boolean).join(' · ');
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
  const toggleHabit = (id, date = t0()) => { const f = find(id); if (f) send({ op: 'habit.log', id, date, done: !model.doneOn(f.task, date) }); };
  function addRoutine(title, open = false) {
    const ops = view().lists.some(l => l.id === model.ROUTINES) ? [] : [{ op: 'list.add', id: model.ROUTINES, name: 'Rutinas', kind: 'routine' }];
    const task = model.normTask({ title, habit: { days: [], time: '' } });
    if (open) { S.open = task.id; S.sheet = 'task'; }
    send(...ops, { op: 'task.put', list: model.ROUTINES, task, end: true });
  }
  const setHabit = change => { const f = find(S.open); if (f) updateTask(S.open, { habit: { ...(f.task.habit || { days: [], time: '' }), ...change } }); };
  function go(tab, list = '') { S.tab = tab; S.list = list; S.searching = false; S.query = ''; S.showDone = false; write('tab', tab); write('list', list); paint(); scrollTo?.({ top: 0 }); document.getElementById('tk-body')?.scrollTo?.(0, 0); }
  function add() {
    const input = document.getElementById('tk-title'), raw = input?.value.trim();
    if (!raw) return;
    input.value = ''; hint();
    if (S.tab === 'rutinas') return addRoutine(raw, true);
    const doc = view(), t = t0(), { list, text } = targetList(doc, raw), p = model.parseQuick(text, t);
    if (list.kind === 'check') {
      const again = list.tasks.find(x => normal(x.title) === normal(p.title));
      if (again) { if (again.done) updateTask(again.id, { done: false, completed: '' }); return; }
    }
    const section = list.kind === 'project' ? (model.sections(list).at(-1)?.name || '') : '';
    S.flash = '';
    putTask(model.normTask({ title: p.title, due: p.due, myDay: S.tab === 'hoy' && !p.due ? t : '', section }), list.id);
    document.getElementById('tk-title')?.focus();
  }
  async function copy(text, button) {
    try { await navigator.clipboard.writeText(text); const s = button?.querySelector('span'); if (s) s.textContent = '¡Copiado!'; }
    catch { prompt('Copia esto:', text); }
  }

  app.addEventListener('click', async e => {
    const b = e.target.closest('button, a[data-act]');
    if (!b) { if (e.target.id === 'tk-sheet') closeSheet(); return; }
    const d = b.dataset;
    if (d.tab) { if (S.sheet) S.sheet = null; return go(d.tab); }
    if (d.openList) return go('listas', d.openList);
    if (d.habit) return toggleHabit(d.habit);
    if (d.newRoutine) return addRoutine(d.newRoutine);
    if (d.log) return toggleHabit(S.open, d.log);
    if (d.day !== undefined) { const f = find(S.open); if (!f) return; const days = new Set(f.task.habit?.days || []), x = +d.day; if (days.has(x)) days.delete(x); else days.add(x); return setHabit({ days: [...days] }); }
    if (d.days === 'all') return setHabit({ days: [] });
    if (d.toggle) return toggle(d.toggle);
    if (d.star) { const f = find(d.star); if (f) updateTask(f.task.id, { important: !f.task.important }); return; }
    if (d.expand) { if (S.expanded.has(d.expand)) S.expanded.delete(d.expand); else S.expanded.add(d.expand); return paint(); }
    if (d.edit) { S.open = d.edit; S.sheet = 'task'; return paint(); }
    if (d.step) { const [tid, sid] = d.step.split('|'), f = find(tid); if (f) updateTask(tid, { steps: f.task.steps.map(s => (s.id === sid ? { ...s, done: !s.done } : s)) }); return; }
    if (d.delStep) { const f = find(S.open); if (f) updateTask(S.open, { steps: f.task.steps.filter(s => s.id !== d.delStep) }); return; }
    if (d.due !== undefined) return updateTask(S.open, { due: d.due });
    if (d.ctab) { S.claudeTab = d.ctab; return paint(); }
    switch (d.act) {
      case 'search': S.searching = !S.searching; S.query = ''; paint(); if (S.searching) document.getElementById('tk-q')?.focus(); break;
      case 'menu': S.sheet = 'menu'; paint(); break;
      case 'back': go('listas'); break;
      case 'list-menu': S.sheet = 'list'; paint(); break;
      case 'show-done': S.showDone = !S.showDone; paint(); break;
      case 'close': closeSheet(); break;
      case 'new-list': S.sheet = 'new-list'; paint(); break;
      case 'import': S.sheet = 'import'; S.preview = null; paint(); break;
      case 'claude': S.sheet = 'claude'; S.newKey = ''; S.preview = null; if (S.claudeText.trim()) setPreview(S.claudeText); else paint(); break;
      case 'copy-prompt': copy(CLAUDE_PROMPT, b); break;
      case 'copy-key': copy(S.newKey, b); break;
      case 'myday': { const f = find(S.open); if (f) updateTask(S.open, { myDay: f.task.myDay === t0() ? '' : t0() }); break; }
      case 'claude-create': if (S.preview?.lists) { const lists = S.preview.lists.map(l => (l.kind === 'tasks' ? { ...l, kind: 'project' } : l)); send({ op: 'import', update: true, lists }); S.claudeText = ''; S.sheet = null; S.preview = null; go('listas', lists[0].id); } break;
      case 'do-import': if (S.preview?.lists) { send({ op: 'import', lists: S.preview.lists }); S.sheet = null; S.preview = null; go('listas'); } break;
      case 'agent-key': try { S.newKey = (await call('POST', { action: 'agent-key' })).key; S.agent = { created: new Date().toISOString() }; } catch { S.error = 'No se pudo crear la llave.'; } paint(); break;
      case 'agent-revoke': if (confirm('¿Retirar la llave? Claude dejará de poder tocar tus listas.')) { try { await call('POST', { action: 'agent-revoke' }); S.agent = null; } catch { /* stays */ } paint(); } break;
      case 'delete-list': { const l = view().lists.find(x => x.id === S.list); if (l && confirm(`¿Eliminar «${l.name}» y sus ${l.tasks.length} tareas?`)) { send({ op: 'list.delete', id: l.id }); S.sheet = null; go('listas'); } break; }
      case 'delete-task': { const f = find(S.open); if (f && confirm(`¿Eliminar «${f.task.title}»?`)) { send({ op: 'task.delete', id: f.task.id }); closeSheet(); } break; }
    }
  });
  app.addEventListener('submit', e => {
    e.preventDefault();
    const form = e.target;
    if (form.id === 'tk-add') return add();
    if (form.classList.contains('tk-step-add')) {
      const input = form.querySelector('input'), title = input.value.trim(), id = form.dataset.task, f = find(id);
      if (title && f) { updateTask(id, { steps: [...f.task.steps, { id: model.newId(), title, done: false }] }); sheetKey = ''; paint(); app.querySelector(`.tk-step-add[data-task="${CSS.escape(id)}"] input`)?.focus(); }
      return;
    }
    if (form.id === 'tk-new-list') { const name = document.getElementById('tk-f-newname').value.trim(), kind = form.elements.kind.value; if (name) { const id = model.newId(); send({ op: 'list.add', id, name, kind }); S.sheet = null; go('listas', id); } return; }
    if (form.id === 'tk-rename') { const name = document.getElementById('tk-f-listname').value.trim(), kind = form.elements.kind.value; const ops = []; if (name) ops.push({ op: 'list.rename', id: S.list, name }); ops.push({ op: 'list.kind', id: S.list, kind }); S.sheet = null; send(...ops); }
  });
  let previewTimer;
  app.addEventListener('input', e => {
    const id = e.target.id;
    if (id === 'tk-title') hint();
    if (id === 'tk-q') { S.query = e.target.value; document.getElementById('tk-body').innerHTML = S.query.trim() ? paintSearch(view(), t0()) : paintHoy(view(), t0()); }
    if (id === 'tk-f-claude') { S.claudeText = e.target.value; clearTimeout(previewTimer); previewTimer = setTimeout(() => { if (S.claudeText.trim()) setPreview(S.claudeText); else { S.preview = null; paint(); } }, 300); }
    if (id === 'tk-f-title') { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }
  });
  app.addEventListener('change', async e => {
    const id = e.target.id;
    if (id === 'tk-file') { const file = e.target.files?.[0]; if (file) setPreview(await file.text()); return; }
    if (id === 'tk-target') { S.target = e.target.value; hint(); return; }
    const f = S.open && find(S.open);
    if (!f) return;
    if (id === 'tk-f-title') { const title = e.target.value.replace(/\s+/g, ' ').trim(); if (title && title !== f.task.title) updateTask(S.open, { title }); }
    else if (id === 'tk-f-note') { if (e.target.value !== f.task.note) updateTask(S.open, { note: e.target.value }); }
    else if (id === 'tk-f-due') updateTask(S.open, { due: e.target.value });
    else if (id === 'tk-f-reminder') updateTask(S.open, { reminder: e.target.value.slice(0, 16) });
    else if (id === 'tk-f-time') setHabit({ time: e.target.value });
    else if (id === 'tk-f-section') updateTask(S.open, { section: e.target.value.trim() });
    else if (id === 'tk-f-repeat') updateTask(S.open, { repeat: e.target.value ? { every: e.target.value, interval: 1 } : null, due: e.target.value && !f.task.due ? t0() : f.task.due });
    else if (id === 'tk-f-list') updateTask(S.open, {}, e.target.value);
  });
  app.addEventListener('keydown', e => {
    if (e.key === 'Escape') { if (S.sheet) closeSheet(); else if (S.searching) { S.searching = false; paint(); } }
    if (e.key === 'Enter' && e.target.id === 'tk-f-title') { e.preventDefault(); e.target.blur(); }
  });
  // Date and time chips open the picker straight away where the browser allows it.
  app.addEventListener('click', e => { const input = e.target.closest('.tk-chip.pick')?.querySelector('input'); if (input && e.target !== input) { try { input.showPicker(); e.preventDefault(); } catch { /* the label opens it */ } } });
  app.addEventListener('dragover', e => { if (S.sheet === 'import') e.preventDefault(); });
  app.addEventListener('drop', async e => { if (S.sheet !== 'import') return; e.preventDefault(); const file = e.dataTransfer?.files?.[0]; if (file) setPreview(await file.text()); });
  // The phone's back gesture closes the sheet or goes back to the lists instead of leaving the app.
  addEventListener('popstate', () => { if (!standalone) return; if (S.sheet) closeSheet(); else if (S.list) go('listas'); else if (S.tab !== 'hoy') go('hoy'); });
  let lastKey = '';
  app.addEventListener('click', () => setTimeout(() => { const key = `${S.tab}|${S.list}|${S.sheet}`; if (standalone && key !== lastKey && (S.sheet || S.list || S.tab !== 'hoy')) history.pushState({}, ''); lastKey = key; }), true);
  document.addEventListener('visibilitychange', () => { if (!document.hidden && S.doc) refresh(); });

  async function refresh() {
    try { const out = await call('GET'); S.doc = docOf(out); S.agent = out.agent || null; write('cache', S.doc); S.error = ''; }
    catch { if (!S.doc) S.error = 'No se pudo leer tus tareas ahora mismo.'; }
    paint(); flush();
  }

  window.TodoLab = { async initialise(token, options = {}) {
    csrf = token; standalone = !!options.standalone;
    model = await import('/control/todo-model.js?v=20261124b');
    // /control/tareas/#rutinas (the icon's long-press shortcuts) opens that tab.
    const wanted = decodeURIComponent(location.hash.slice(1));
    if (standalone) { S.tab = ['hoy', 'listas', 'rutinas'].includes(wanted) ? wanted : 'hoy'; S.list = ''; }
    const cached = read('cache', null);
    if (cached?.lists) { S.doc = cached; paint(); }
    await refresh();
    if (!S.doc) { S.doc = model.emptyDoc(); paint(); }
  } };
})();
