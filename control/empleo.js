// Empleo: the job search for María, in Mission Control's style. Four tabs:
//   OFERTAS       what the robot (scripts/empleo-buscar.mjs) and Claude found, best fit first; «Ya aplicada» turns one
//                 into an application with everything already filled in
//   CANDIDATURAS  every application, how far it got, and which ones need a follow-up message
//   RESULTADOS    reply and interview rates by CV version, channel, message, location, freshness, day and hour
//   AJUSTES       CV versions, the robot's last runs and the key for Claude and the robot
// The data and every change live in control/empleo-model.js (applyOps), the same code the API runs.
(() => {
  const app = document.getElementById('empleo-app');
  if (!app) return;
  const API = '/control/api/empleo/status';
  let model, csrf = '';
  const read = (k, d) => { try { const v = localStorage.getItem('empleo.' + k); return v === null ? d : JSON.parse(v); } catch { return d; } };
  const write = (k, v) => { try { localStorage.setItem('empleo.' + k, JSON.stringify(v)); } catch { /* memory only */ } };
  const S = { doc: null, agent: null, tab: read('tab', 'ofertas'), filter: 'new', appFilter: 'open', query: '', open: new Set(), sheet: null, error: '', newKey: '', flash: '', busy: false };
  const E = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const today = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
  const nowTime = () => new Date().toTimeString().slice(0, 5);
  const pct = x => `${Math.round(x * 100)} %`;
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const short = d => (d ? `${Number(d.slice(8, 10))} ${MONTHS[Number(d.slice(5, 7)) - 1]}` : '');
  function ago(date) {
    if (!date) return '';
    const n = model.daysBetween(date.slice(0, 10), today());
    return n <= 0 ? 'hoy' : n === 1 ? 'ayer' : `hace ${n} días`;
  }
  function since(iso) {
    if (!iso) return '';
    const m = Math.round((Date.now() - Date.parse(iso)) / 6e4);
    return m < 60 ? `hace ${Math.max(1, m)} min` : m < 1440 ? `hace ${Math.round(m / 60)} h` : `hace ${Math.round(m / 1440)} días`;
  }

  // ---------- Network ----------
  async function call(method, body) {
    const r = await fetch(API, { method, credentials: 'same-origin', headers: { accept: 'application/json', ...(method === 'POST' ? { 'x-csrf-token': csrf, 'content-type': 'application/json' } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
    if (r.status === 401) { location.replace('/control/login'); throw new Error('session'); }
    const out = await r.json();
    if (!out.ok) throw new Error(out.error || 'unavailable');
    return out;
  }
  const docOf = out => ({ v: out.v, offers: out.offers || [], apps: out.apps || [], cvs: out.cvs || [], runs: out.runs || [] });
  async function send(...ops) {
    try { S.doc = model.applyOps(S.doc, ops); } catch (e) { S.error = 'Ese cambio no es válido (' + e.message + ').'; return paint(); }
    paint();
    try { S.doc = docOf(await call('POST', { ops })); S.error = ''; }
    catch (e) { S.error = 'No se pudo guardar (' + e.message + '). Recarga la página.'; }
    paint();
  }
  async function refresh() {
    try { const out = await call('GET'); S.doc = docOf(out); S.agent = out.agent; S.error = ''; }
    catch { if (!S.doc) S.error = 'No se pudo leer Empleo ahora mismo.'; }
    paint();
  }

  // ---------- Frame ----------
  let root;
  function paint() {
    if (!S.doc) return;
    try {
      if (!root) {
        app.innerHTML = '<div class="em" id="em"><header class="em-head" id="em-head"></header><div class="em-body" id="em-body"></div><div class="em-sheet-wrap" id="em-sheet" hidden></div><p class="em-status" id="em-status" role="status"></p></div>';
        root = document.getElementById('em');
      }
      const t = today(), st = model.stats(S.doc, t);
      document.getElementById('em-head').innerHTML = paintHead(st);
      const body = document.getElementById('em-body');
      if (!body.contains(document.activeElement) || document.activeElement.tagName === 'BUTTON') {
        body.innerHTML = S.tab === 'candidaturas' ? paintApps(t) : S.tab === 'resultados' ? paintResults(st) : S.tab === 'ajustes' ? paintSettings() : paintOffers(t);
      }
      paintSheet(t);
      paintSummary(st);
    } catch (error) {
      S.error = 'Algo falló al pintar: ' + error.message;
      console.error(error);
    }
    document.getElementById('em-status').textContent = S.error || S.flash;
    S.flash = '';
  }

  function paintHead(st) {
    const fresh = S.doc.offers.filter(o => o.status === 'new').length;
    const tab = (id, label, count) => `<button role="tab" data-act="tab" data-id="${id}" aria-selected="${S.tab === id}">${label}${count ? `<b>${count}</b>` : ''}</button>`;
    return `<div class="em-top">
        <div><p class="em-eyebrow"><span></span>EMPLEO · MARÍA · RRHH CERCA DE MÚNICH</p><h1>Candidaturas</h1></div>
        <div class="em-kpis">
          <div><strong>${st.n}</strong><small>enviadas</small></div>
          <div><strong>${st.week}</strong><small>esta semana</small></div>
          <div><strong>${st.interviews}</strong><small>entrevistas</small></div>
          <div class="${st.followUps ? 'hot' : ''}"><strong>${st.followUps}</strong><small>follow-ups</small></div>
        </div>
      </div>
      <nav class="em-tabs" role="tablist">${tab('ofertas', 'Ofertas', fresh)}${tab('candidaturas', 'Candidaturas', st.open)}${tab('resultados', 'Resultados')}${tab('ajustes', 'Ajustes')}</nav>`;
  }

  // ---------- Ofertas ----------
  const BAD = /alemán|senior/i, GOOD = /inglés|español|Selección|Mercado español/i;
  function paintOffers(t) {
    const all = S.doc.offers, q = S.query.trim().toLowerCase();
    const counts = Object.fromEntries(model.OFFER_STATUS.map(s => [s, all.filter(o => o.status === s).length]));
    let list = all.filter(o => o.status === S.filter);
    if (q) list = list.filter(o => `${o.title} ${o.company} ${o.location}`.toLowerCase().includes(q));
    list = S.filter === 'new' || S.filter === 'saved' ? list.sort((a, b) => b.score - a.score || (b.posted || '').localeCompare(a.posted || '')) : list;
    const label = { new: 'Nuevas', saved: 'Guardadas', applied: 'Aplicadas', discarded: 'Descartadas' };
    const last = S.doc.runs[0];
    const robot = last ? `Robot: última búsqueda ${since(last.at)}${S.doc.runs.filter(r => r.at === last.at).some(r => r.error) ? ' · <b class="bad">con fallos</b>' : ''}` : 'El robot aún no ha buscado: mira Ajustes';
    return `<div class="em-toolbar">
        <div class="em-chips">${model.OFFER_STATUS.map(s => `<button data-act="filter" data-id="${s}" aria-pressed="${S.filter === s}">${label[s]} <b>${counts[s]}</b></button>`).join('')}</div>
        <div class="em-actions"><input type="search" id="em-q" placeholder="Buscar empresa o puesto" value="${E(S.query)}"><button class="em-btn" data-act="new-offer">+ Oferta</button></div>
      </div>
      <p class="em-note">${robot}. Las nuevas aparecen solas varias veces al día; la nota sale de reglas (inglés, alemán, selección, español…).</p>
      ${list.length ? `<div class="em-offers">${list.map(o => offerCard(o, t)).join('')}</div>` : `<p class="em-empty">${S.filter === 'new' ? 'No hay ofertas nuevas ahora mismo. El robot vuelve a mirar en unas horas.' : 'Nada por aquí.'}</p>`}`;
  }
  function offerCard(o, t) {
    const open = S.open.has(o.id), tone = o.score >= 70 ? 'top' : o.score >= 50 ? 'mid' : 'low';
    const chips = o.reasons.map(r => `<span class="${BAD.test(r) ? 'bad' : GOOD.test(r) ? 'good' : ''}">${E(r)}</span>`).join('');
    const days = o.posted ? model.daysBetween(o.posted, t) : null;
    return `<article class="em-offer ${o.status}">
      <div class="em-score ${tone}" title="Encaje con el perfil de María"><b>${o.score}</b></div>
      <div class="em-offer-main">
        <h3>${o.url ? `<a href="${E(o.url)}" target="_blank" rel="noopener noreferrer">${E(o.title)}</a>` : E(o.title)}</h3>
        <p class="em-meta">${E(o.company)}${o.location ? ` · ${E(o.location)}` : ''}${days !== null ? ` · publicada ${days <= 0 ? 'hoy' : days === 1 ? 'ayer' : `hace ${days} días`}` : ''}${o.track ? ` · vía ${o.track}` : ''}${o.source !== 'manual' ? ` · ${E(o.source)}` : ''}</p>
        <div class="em-reasons">${chips}${o.letter ? '<span class="good">Carta lista</span>' : ''}</div>
        ${open ? `<div class="em-more">${o.snippet ? `<p>${E(o.snippet)}…</p>` : ''}${o.note ? `<p class="em-claude"><b>Nota:</b> ${E(o.note)}</p>` : ''}${o.letter ? `<div class="em-letter"><header><b>Carta de presentación</b><button class="em-link" data-act="copy-letter" data-id="${o.id}">Copiar</button></header><pre>${E(o.letter)}</pre></div>` : '<p class="em-hint">Pídele a Claude la carta para esta oferta: la deja aquí.</p>'}</div>` : ''}
      </div>
      <div class="em-offer-acts">
        ${o.status !== 'applied' ? `<button class="em-btn primary" data-act="apply" data-id="${o.id}">Ya aplicada</button>` : '<span class="em-done">Aplicada</span>'}
        <button class="em-link" data-act="more" data-id="${o.id}">${open ? 'Menos' : 'Ver más'}</button>
        ${o.status === 'new' ? `<button class="em-link" data-act="offer-status" data-id="${o.id}" data-status="saved">Guardar</button>` : ''}
        ${o.status === 'new' || o.status === 'saved' ? `<button class="em-link" data-act="offer-status" data-id="${o.id}" data-status="discarded">Descartar</button>` : ''}
        ${o.status === 'discarded' ? `<button class="em-link" data-act="offer-status" data-id="${o.id}" data-status="new">Recuperar</button>` : ''}
      </div>
    </article>`;
  }

  // ---------- Candidaturas ----------
  function paintApps(t) {
    const apps = S.doc.apps.filter(a => S.appFilter === 'all' || (a.open && a.phase !== 'rejected' && model.followUp(a, t) !== 'lost'))
      .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));
    const follow = S.doc.apps.filter(a => model.followUp(a, t) === 'follow');
    const phaseSelect = a => `<select data-act="phase" data-id="${a.id}" aria-label="Fase de ${E(a.company)}">${Object.entries(model.PHASES).map(([k, v]) => `<option value="${k}"${a.phase === k ? ' selected' : ''}>${v}</option>`).join('')}</select>`;
    return `<div class="em-toolbar">
        <div class="em-chips"><button data-act="app-filter" data-id="open" aria-pressed="${S.appFilter === 'open'}">En marcha</button><button data-act="app-filter" data-id="all" aria-pressed="${S.appFilter === 'all'}">Todas <b>${S.doc.apps.length}</b></button></div>
        <div class="em-actions"><button class="em-btn" data-act="new-app">+ Candidatura</button></div>
      </div>
      ${follow.length ? `<div class="em-alert"><b>Toca follow-up (${follow.length})</b><p>Una semana sin respuesta: un mensaje corto al recruiter por LinkedIn reactiva muchas.</p><ul>${follow.map(a => `<li><button class="em-link" data-act="edit-app" data-id="${a.id}">${E(a.company)} · ${E(a.title)}</button><small>${ago(a.date)}</small><button class="em-link" data-act="followed" data-id="${a.id}">Hecho</button></li>`).join('')}</ul></div>` : ''}
      ${apps.length ? `<div class="em-apps">${apps.map(a => {
        const f = model.followUp(a, t);
        return `<article class="em-app ${model.isInterview(a) ? 'win' : ''} ${a.open ? '' : 'closed'}">
          <button class="em-app-main" data-act="edit-app" data-id="${a.id}">
            <strong>${E(a.company)}</strong><span>${E(a.title)}</span>
            <small>${short(a.date)}${a.time ? ` ${a.time}` : ''}${a.cv ? ` · ${E(a.cv)}` : ''}${a.channel ? ` · ${E(a.channel)}` : ''}${a.message ? ' · con mensaje' : ''}${f === 'follow' ? ' · <b class="hot">follow-up</b>' : f === 'lost' ? ' · sin respuesta' : ''}</small>
          </button>
          ${phaseSelect(a)}
        </article>`;
      }).join('')}</div>` : `<p class="em-empty">${S.doc.apps.length ? 'Ninguna en marcha.' : 'Todavía no hay candidaturas. Marca una oferta como «Ya aplicada» o añade una a mano.'}</p>`}`;
  }

  // ---------- Resultados ----------
  function paintResults(st) {
    if (!st.n) return '<p class="em-empty">Los resultados aparecen en cuanto haya candidaturas. Con unas 10 por grupo ya se puede comparar.</p>';
    const maxW = Math.max(1, ...st.weeks.map(w => w.n)), maxF = Math.max(1, ...st.funnel.map(f => f.n));
    const tiles = [['Tasa de respuesta', pct(st.replyRate), `${st.replies} de ${st.n}`], ['Tasa de entrevista', pct(st.interviewRate), `${st.interviews} de ${st.n}`], ['Respuesta media', st.avgReplyDays === null ? '—' : `${st.avgReplyDays.toFixed(1)} días`, 'desde que se envía'], ['En marcha', String(st.open), 'sin cerrar']];
    return `<div class="em-tiles">${tiles.map(([l, v, s]) => `<div><small>${l}</small><strong>${v}</strong><span>${s}</span></div>`).join('')}</div>
      <section class="em-panel"><h2>Lo que funciona</h2>${st.insights.length ? `<ul class="em-insights">${st.insights.map(i => `<li>${E(i.text)}</li>`).join('')}</ul>` : `<p class="em-hint">Aún no hay bastantes datos para comparar. Cambia una sola cosa cada vez (por ejemplo, la versión del CV) y espera a tener ${model.ENOUGH} candidaturas de cada opción.</p>`}</section>
      <div class="em-two">
        <section class="em-panel"><h2>Embudo</h2>${st.funnel.map(f => `<div class="em-bar"><span>${f.label}</span><i style="--w:${f.n / maxF * 100}%"></i><b>${f.n}</b></div>`).join('')}</section>
        <section class="em-panel"><h2>Por semana</h2><div class="em-weeks">${st.weeks.map(w => `<div title="Semana del ${short(w.start)}: ${w.n} enviadas, ${w.interviews} con entrevista"><i style="--h:${w.n / maxW * 100}%"></i><em style="--h:${w.interviews / maxW * 100}%"></em><small>${short(w.start)}</small></div>`).join('')}</div><p class="em-hint">Barra clara: enviadas. Verde: con entrevista.</p></section>
      </div>
      ${st.groups.filter(g => g.rows.length).map(g => `<section class="em-panel"><h2>${g.label}</h2>
        <table class="em-table"><thead><tr><th>Opción</th><th>Enviadas</th><th>Respuesta</th><th>Entrevista</th></tr></thead><tbody>
        ${g.rows.map(r => `<tr class="${r.enough ? '' : 'few'}"><td>${E(r.key)}${r.enough ? '' : ' <small>pocos datos</small>'}</td><td>${r.n}</td><td><div class="em-rate"><i style="--w:${r.replyRate * 100}%"></i><b>${pct(r.replyRate)}</b></div></td><td><div class="em-rate win"><i style="--w:${r.interviewRate * 100}%"></i><b>${pct(r.interviewRate)}</b></div></td></tr>`).join('')}
        </tbody></table></section>`).join('')}`;
  }

  // ---------- Ajustes ----------
  function paintSettings() {
    const bySource = {};
    for (const r of S.doc.runs) if (!bySource[r.source]) bySource[r.source] = r;
    const name = { ba: 'Agencia de Empleo alemana', arbeitnow: 'Arbeitnow (en inglés)' };
    return `<section class="em-panel"><h2>Versiones del CV</h2>
        <p class="em-hint">Cada vez que cambies el CV, crea una versión nueva y apunta qué cambia. Al registrar una candidatura eliges con cuál fue.</p>
        <div class="em-cvs">${S.doc.cvs.map(c => `<div class="em-cv"><b>${E(c.id)}</b><span>${E(c.what) || '—'}</span><small>${short(c.date)}</small><button class="em-link" data-act="edit-cv" data-id="${E(c.id)}">Editar</button></div>`).join('')}</div>
        <button class="em-btn" data-act="new-cv">+ Versión</button></section>
      <section class="em-panel"><h2>Robot de ofertas</h2>
        <p class="em-hint">Busca en la Agencia de Empleo alemana y en Arbeitnow cuatro veces al día entre semana (sobre las 7:15, 11:15, 15:15 y 19:15) y una el fin de semana. LinkedIn no deja leer sus ofertas a un robot: esas las busca Claude cuando se lo pidas.</p>
        ${Object.keys(bySource).length ? `<ul class="em-runs">${Object.values(bySource).map(r => `<li><b>${E(name[r.source] || r.source)}</b><span>${since(r.at)} · ${r.seen} vistas · ${r.added} nuevas</span>${r.error ? `<em>${E(r.error)}</em>` : ''}</li>`).join('')}</ul>` : '<p class="em-empty">Todavía no ha buscado. Crea la llave de abajo y guárdala como secreto EMPLEO_KEY en GitHub.</p>'}
      </section>
      <section class="em-panel"><h2>Llave para Claude y el robot</h2>
        <p class="em-hint">Con esta llave Claude puede leer las ofertas, añadir las que encuentre en LinkedIn, escribir la carta de cada una y registrar candidaturas; el robot la usa para subir ofertas. Hacer una nueva anula la anterior.</p>
        ${S.newKey ? `<div class="em-key"><code>${E(S.newKey)}</code><button class="em-btn" data-act="copy-key">Copiar</button><p>Solo se enseña ahora. Guárdala como secreto <b>EMPLEO_KEY</b> en GitHub (y dásela a Claude con su herramienta de credenciales, nunca en el chat).</p></div>` : ''}
        <p>${S.agent ? `Llave activa desde el ${short(S.agent.created.slice(0, 10))}.` : 'No hay llave.'}</p>
        <div class="em-row"><button class="em-btn" data-act="make-key">${S.agent ? 'Hacer una nueva' : 'Crear la llave'}</button>${S.agent ? '<button class="em-link" data-act="revoke-key">Anular</button>' : ''}</div>
      </section>`;
  }

  // ---------- Sheets ----------
  const field = (label, html, cls = '') => `<label class="em-field ${cls}"><span>${label}</span>${html}</label>`;
  const input = (name, value, attrs = '') => `<input name="${name}" value="${E(value ?? '')}" ${attrs}>`;
  const select = (name, options, value, blank = '—') => `<select name="${name}"><option value="">${blank}</option>${options.map(([k, v]) => `<option value="${E(k)}"${value === k ? ' selected' : ''}>${E(v)}</option>`).join('')}</select>`;
  function paintSheet(t) {
    const wrap = document.getElementById('em-sheet');
    if (!S.sheet) { wrap.hidden = true; wrap.innerHTML = ''; return; }
    if (!wrap.hidden && wrap.contains(document.activeElement)) return;
    wrap.hidden = false;
    const s = S.sheet;
    if (s.kind === 'app') {
      const a = s.app, cvs = S.doc.cvs.map(c => [c.id, `${c.id}${c.what ? ' · ' + c.what : ''}`]);
      wrap.innerHTML = `<form class="em-sheet" data-form="app"><h2>${s.isNew ? 'Nueva candidatura' : 'Candidatura'}</h2>
        <div class="em-grid">
          ${field('Empresa', input('company', a.company, 'required'))}${field('Puesto', input('title', a.title))}
          ${field('Enlace', input('url', a.url, 'type="url" placeholder="https://"'), 'wide')}
          ${field('Fecha', input('date', a.date, 'type="date"'))}${field('Hora', input('time', a.time, 'type="time"'))}
          ${field('Vía', select('track', Object.entries(model.TRACKS).map(([k, v]) => [k, `${k} · ${v}`]), a.track))}${field('Canal', select('channel', model.CHANNELS.map(c => [c, c]), a.channel))}
          ${field('Versión de CV', select('cv', cvs, a.cv))}${field('Ubicación en el CV', select('location', Object.entries(model.LOCATIONS), a.location))}
          ${field('Días desde que se publicó', input('daysPosted', a.daysPosted, 'type="number" min="0" max="365" inputmode="numeric"'))}${field('Idioma de la oferta', select('lang', [['en', 'Inglés'], ['de', 'Alemán']], a.lang))}
          ${field('Contacto (recruiter)', input('contact', a.contact))}${field('Fase', select('phase', Object.entries(model.PHASES), a.phase, 'Enviada'))}
          ${field('Fecha de respuesta', input('replyDate', a.replyDate, 'type="date"'))}
          <label class="em-check"><input type="checkbox" name="message"${a.message ? ' checked' : ''}> Mensaje al recruiter o referido</label>
          <label class="em-check"><input type="checkbox" name="open"${a.open !== false ? ' checked' : ''}> Sigue abierta</label>
          ${field('Notas / feedback de la entrevista', `<textarea name="notes" rows="3">${E(a.notes)}</textarea>`, 'wide')}
        </div>
        <div class="em-sheet-acts"><button type="submit" class="em-btn primary">Guardar</button><button type="button" class="em-link" data-act="close">Cancelar</button>${s.isNew ? '' : `<button type="button" class="em-link danger" data-act="delete-app" data-id="${a.id}">Borrar</button>`}</div>
      </form>`;
    } else if (s.kind === 'offer') {
      wrap.innerHTML = `<form class="em-sheet" data-form="offer"><h2>Añadir oferta</h2><p class="em-hint">Para las que veas en LinkedIn u otra web. Pega la descripción y se puntúa igual que las del robot.</p>
        <div class="em-grid">${field('Puesto', input('title', '', 'required'), 'wide')}${field('Empresa', input('company', ''))}${field('Ciudad', input('location', ''))}
        ${field('Enlace', input('url', '', 'type="url" placeholder="https://"'), 'wide')}${field('Publicada', input('posted', t, 'type="date"'))}
        ${field('Descripción (opcional)', '<textarea name="description" rows="5"></textarea>', 'wide')}</div>
        <div class="em-sheet-acts"><button type="submit" class="em-btn primary">Añadir</button><button type="button" class="em-link" data-act="close">Cancelar</button></div></form>`;
    } else if (s.kind === 'cv') {
      wrap.innerHTML = `<form class="em-sheet" data-form="cv"><h2>${s.isNew ? 'Nueva versión del CV' : 'Versión ' + E(s.cv.id)}</h2>
        <div class="em-grid">${field('Código', input('id', s.cv.id, s.isNew ? 'required' : 'readonly'))}${field('Fecha', input('date', s.cv.date || t, 'type="date"'))}
        ${field('Qué cambia respecto a la anterior', `<textarea name="what" rows="3">${E(s.cv.what)}</textarea>`, 'wide')}</div>
        <div class="em-sheet-acts"><button type="submit" class="em-btn primary">Guardar</button><button type="button" class="em-link" data-act="close">Cancelar</button>${s.isNew ? '' : `<button type="button" class="em-link danger" data-act="delete-cv" data-id="${E(s.cv.id)}">Borrar</button>`}</div></form>`;
    }
    wrap.querySelector('input,select,textarea')?.focus({ preventScroll: true });
  }

  // Everything already known goes in, so registering an application takes two taps.
  function appFromOffer(o) {
    const t = today(), last = read('last', {});
    return {
      id: model.newId(), offer: o.id, date: t, time: nowTime(), company: o.company || '—', title: o.title, url: o.url, track: o.track || last.track || '',
      channel: last.channel || '', cv: o.cv || last.cv || S.doc.cvs.at(-1)?.id || '', location: last.location || 'madrid',
      daysPosted: o.posted ? Math.max(0, model.daysBetween(o.posted, t)) : null, lang: o.lang, message: false, contact: '', phase: 'sent', open: true, replyDate: '', notes: '',
    };
  }
  function blankApp() {
    const last = read('last', {});
    return { id: model.newId(), offer: '', date: today(), time: nowTime(), company: '', title: '', url: '', track: last.track || '', channel: last.channel || '', cv: last.cv || S.doc.cvs.at(-1)?.id || '', location: last.location || 'madrid', daysPosted: null, lang: '', message: false, contact: '', phase: 'sent', open: true, replyDate: '', notes: '' };
  }
  const findApp = id => S.doc.apps.find(a => a.id === id);
  const findOffer = id => S.doc.offers.find(o => o.id === id);

  // ---------- Events ----------
  app.addEventListener('click', async event => {
    const b = event.target.closest('[data-act]');
    if (!b || b.tagName === 'SELECT') return;
    const { act, id } = b.dataset;
    if (act === 'tab') { S.tab = id; write('tab', id); }
    else if (act === 'filter') S.filter = id;
    else if (act === 'app-filter') S.appFilter = id;
    else if (act === 'more') { if (S.open.has(id)) S.open.delete(id); else S.open.add(id); }
    else if (act === 'offer-status') return send({ op: 'offer.put', offer: { id, status: b.dataset.status } });
    else if (act === 'apply') { const o = findOffer(id); if (o) S.sheet = { kind: 'app', isNew: true, app: appFromOffer(o) }; }
    else if (act === 'new-app') S.sheet = { kind: 'app', isNew: true, app: blankApp() };
    else if (act === 'edit-app') { const a = findApp(id); if (a) S.sheet = { kind: 'app', isNew: false, app: a }; }
    else if (act === 'followed') { const a = findApp(id); if (a) return send({ op: 'app.put', app: { id, followed: today(), notes: `${a.notes ? a.notes + '\n' : ''}${today()}: follow-up enviado` , date: a.date } }); }
    else if (act === 'delete-app') { if (confirm('¿Borrar esta candidatura?')) { S.sheet = null; return send({ op: 'app.delete', id }); } return; }
    else if (act === 'new-offer') S.sheet = { kind: 'offer' };
    else if (act === 'new-cv') { const n = S.doc.cvs.length; S.sheet = { kind: 'cv', isNew: true, cv: { id: `CV-${String.fromCharCode(65 + Math.min(n, 25))}`, date: today(), what: '' } }; }
    else if (act === 'edit-cv') { const c = S.doc.cvs.find(c => c.id === id); if (c) S.sheet = { kind: 'cv', isNew: false, cv: c }; }
    else if (act === 'delete-cv') { if (confirm('¿Borrar esta versión? Las candidaturas que la usan la conservan.')) { S.sheet = null; return send({ op: 'cv.delete', id }); } return; }
    else if (act === 'close') S.sheet = null;
    else if (act === 'copy-letter') { const o = findOffer(id); try { await navigator.clipboard.writeText(o.letter); S.flash = 'Carta copiada.'; } catch { S.flash = 'No se pudo copiar.'; } }
    else if (act === 'make-key') {
      if (S.agent && !confirm('La llave anterior dejará de funcionar (también en GitHub). ¿Seguir?')) return;
      try { S.newKey = (await call('POST', { action: 'agent-key' })).key; S.agent = { created: new Date().toISOString() }; } catch (e) { S.error = 'No se pudo crear la llave (' + e.message + ').'; }
    }
    else if (act === 'revoke-key') { if (!confirm('¿Anular la llave? El robot y Claude dejarán de poder entrar.')) return; try { await call('POST', { action: 'agent-revoke' }); S.agent = null; S.newKey = ''; } catch (e) { S.error = e.message; } }
    else if (act === 'copy-key') { try { await navigator.clipboard.writeText(S.newKey); S.flash = 'Llave copiada.'; } catch { S.flash = 'No se pudo copiar.'; } }
    paint();
  });
  app.addEventListener('change', event => {
    const el = event.target;
    if (el.dataset.act === 'phase') {
      const a = findApp(el.dataset.id);
      if (!a) return;
      const change = { id: a.id, phase: el.value };
      if (el.value !== 'sent' && !a.replyDate) change.replyDate = today();
      if (el.value === 'rejected') change.open = false;
      send({ op: 'app.put', app: change });
    }
  });
  app.addEventListener('input', event => { if (event.target.id === 'em-q') { S.query = event.target.value; const pos = event.target.selectionStart; document.getElementById('em-body').innerHTML = paintOffers(today()); const q = document.getElementById('em-q'); q.focus(); q.setSelectionRange(pos, pos); } });
  app.addEventListener('submit', event => {
    event.preventDefault();
    const form = event.target, f = new FormData(form), get = k => String(f.get(k) ?? '').trim();
    if (form.dataset.form === 'app') {
      const a = { ...S.sheet.app, company: get('company'), title: get('title'), url: get('url'), date: get('date'), time: get('time'), track: get('track'), channel: get('channel'), cv: get('cv'), location: get('location'), daysPosted: get('daysPosted') === '' ? null : Number(get('daysPosted')), lang: get('lang'), contact: get('contact'), phase: get('phase') || 'sent', replyDate: get('replyDate'), message: f.has('message'), open: f.has('open'), notes: get('notes') };
      if (a.phase !== 'sent' && !a.replyDate) a.replyDate = today();
      write('last', { track: a.track, channel: a.channel, cv: a.cv, location: a.location });
      S.sheet = null;
      send({ op: 'app.put', app: a });
    } else if (form.dataset.form === 'offer') {
      const base = { source: 'manual', title: get('title'), company: get('company'), location: get('location'), url: get('url'), posted: get('posted'), found: new Date().toISOString() };
      const s = model.scoreOffer({ ...base, description: get('description') }) || { score: 20, reasons: ['No parece de RRHH'], lang: '', german: '', spanish: false, track: '' };
      S.sheet = null; S.filter = 'new';
      send({ op: 'offer.put', offer: { ...base, ...s, id: model.newId(), snippet: get('description').slice(0, 500) } });
    } else if (form.dataset.form === 'cv') {
      S.sheet = null;
      send({ op: 'cv.put', cv: { id: get('id'), date: get('date'), what: get('what') } });
    }
  });
  addEventListener('keydown', event => { if (event.key === 'Escape' && S.sheet) { S.sheet = null; paint(); } });
  app.addEventListener('mousedown', event => { if (event.target.id === 'em-sheet') { S.sheet = null; paint(); } });

  // Mission Control's home card.
  function paintSummary(st) {
    const el = document.getElementById('empleo-summary');
    if (!el) return;
    const fresh = S.doc.offers.filter(o => o.status === 'new').length;
    el.textContent = [plural(fresh, 'oferta nueva', 'ofertas nuevas'), plural(st.n, 'candidatura', 'candidaturas'), plural(st.interviews, 'entrevista', 'entrevistas'), st.followUps ? plural(st.followUps, 'follow-up', 'follow-ups') : ''].filter(Boolean).join(' · ');
  }

  window.EmpleoLab = { async initialise(token) {
    csrf = token;
    model = await import('/control/empleo-model.js?v=20261125b');
    if (!['ofertas', 'candidaturas', 'resultados', 'ajustes'].includes(S.tab)) S.tab = 'ofertas';
    await refresh();
    if (!S.doc) { S.doc = model.emptyDoc(); paint(); }
    setInterval(() => { if (!S.sheet && document.visibilityState === 'visible') refresh(); }, 10 * 60_000);
  } };
})();
