// Agent Office · dashboard. Lee el estado real que publica el motor, reparte los eventos
// nuevos en el tiempo para que la oficina los represente y pinta los paneles.
import {createOffice, STAFF} from './office.js';
import {drawChar, LOOKS} from './art.js';

const root = document.getElementById('trading-app');
let csrf = '', live = null, office = null, tab = 'cartera', selected = 'scout', started = false, polling = false, lastSeen = 0, primed = false, portrait = 0;
const pending = []; let nextPlayAt = 0, notice = null;
const esc = x => String(x ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const money = (x, d = 0) => new Intl.NumberFormat('es-ES', {style: 'currency', currency: 'EUR', maximumFractionDigits: d, minimumFractionDigits: d}).format(x || 0);
const signed = (x, d = 0) => (x >= 0 ? '+' : '') + money(x, d);
const pct = x => (x >= 0 ? '+' : '') + (x || 0).toFixed(1).replace('.', ',') + ' %';
const hm = t => t ? new Intl.DateTimeFormat('es-ES', {timeZone: 'Europe/Madrid', hour: '2-digit', minute: '2-digit'}).format(new Date(t)) : '—';
const dm = t => t ? new Intl.DateTimeFormat('es-ES', {timeZone: 'Europe/Madrid', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'}).format(new Date(t)) : '—';
const ago = t => { if (!t) return 'nunca'; const s = Math.max(0, (Date.now() - t) / 1000 | 0); return s < 90 ? 'hace ' + s + ' s' : s < 5400 ? 'hace ' + Math.round(s / 60) + ' min' : 'hace ' + Math.round(s / 3600) + ' h'; };
const who = id => STAFF.find(s => s.id === id) || (id === 'cesar' ? {name: 'César', color: '#f3ead9'} : null);
const MOOD = {joy: 'Eufóricos', calm: 'Tranquilos', tense: 'Tensos', panic: 'Agobiados'};
const STATUS = {nueva: 'Nueva', plan: 'Con plan', aprobada: 'Aprobada', vetada: 'Vetada', ordenada: 'Orden enviada', comprada: 'En cartera', cerrada: 'Cerrada', descartada: 'Descartada', caducada: 'Caducada'};

async function api(path, body) {
  const r = await fetch('/control/api/trading/' + path, {method: body === undefined ? 'GET' : 'POST', credentials: 'same-origin', headers: {'content-type': 'application/json', 'x-csrf-token': csrf}, body: body === undefined ? undefined : JSON.stringify(body)});
  const j = await r.json().catch(() => ({ok: false, error: 'Respuesta no válida (HTTP ' + r.status + ')'}));
  if (!r.ok || j.ok === false) throw Error(j.error || 'HTTP ' + r.status);
  return j;
}
function flash(text, bad = false) { notice = {text, bad, until: Date.now() + 7000}; paintNotice(); }
function paintNotice() { const el = root.querySelector('#ao-notice'); if (!el) return; const on = notice && notice.until > Date.now(); el.hidden = !on; if (on) { el.textContent = notice.text; el.dataset.bad = notice.bad ? '1' : ''; } }

function shell() {
  root.innerHTML = `
  <header class="ao-head">
    <div><p class="ao-eyebrow">AGENT OFFICE · DATOS REALES · CAPITAL FICTICIO</p><h2>La oficina de César</h2></div>
    <div class="ao-head-actions"><span class="ao-chip" id="ao-clock"></span><button type="button" id="ao-run">Ejecutar ciclo</button><button type="button" id="ao-pause"></button></div>
  </header>
  <p class="ao-notice" id="ao-notice" role="status" hidden></p>
  <div class="ao-kpis" id="ao-kpis"></div>
  <div class="ao-main">
    <div class="ao-left">
      <div id="ao-stage"></div>
      <p class="ao-hint">Clic en un personaje para ver su ficha · con el foco en la oficina, WASD o flechas mueven a César</p>
      <form class="ao-owner" id="ao-owner"><label for="ao-owner-text">Háblale al equipo</label><div><input id="ao-owner-text" maxlength="400" placeholder="Ej.: quiero más riesgo esta semana" autocomplete="off"><button type="submit">Enviar</button><button type="button" id="ao-call">Convocar reunión</button></div></form>
      <section class="ao-card ao-today" id="ao-today"></section>
    </div>
    <aside class="ao-side">
      <section class="ao-card" id="ao-agent"></section>
      <section class="ao-card ao-meet" id="ao-meet" hidden><h3>Reunión en curso</h3><div id="ao-meet-body"></div></section>
      <section class="ao-card"><h3>En directo</h3><div class="ao-feed" id="ao-feed" aria-live="polite"></div></section>
    </aside>
  </div>
  <nav class="ao-tabs" id="ao-tabs" role="tablist">${[['cartera', 'Cartera'], ['ideas', 'Ideas'], ['reuniones', 'Reuniones'], ['diario', 'Diario'], ['estrategia', 'Estrategia'], ['ajustes', 'Ajustes']].map(([k, l]) => `<button type="button" role="tab" data-tab="${k}">${l}</button>`).join('')}</nav>
  <section class="ao-panel" id="ao-panel"></section>
  <p class="ao-foot">Solo simulación: no hay bróker ni órdenes reales. Los precios son referencias públicas con retraso; las ventas y compras ficticias incluyen deslizamiento y comisión estimados.</p>`;
  office = createOffice(root.querySelector('#ao-stage'), {onSelect: id => { if (id !== 'cesar') { selected = id; paintAgent(); } }, onMeeting});
  root.querySelector('#ao-tabs').addEventListener('click', e => { const b = e.target.closest('[data-tab]'); if (b) { tab = b.dataset.tab; paintPanel(); } });
  root.querySelector('#ao-run').addEventListener('click', () => command('run', {}, 'Ciclo pedido: se ejecutará en el próximo relevo (hasta 5 min).'));
  root.querySelector('#ao-pause').addEventListener('click', () => command('control', {paused: !live.paused}, live.paused ? 'Compras reanudadas.' : 'Compras en pausa: el equipo sigue trabajando, pero no se abren posiciones.'));
  root.querySelector('#ao-call').addEventListener('click', () => { const t = root.querySelector('#ao-owner-text').value.trim(); command('meeting', {topic: t || 'Reunión convocada por César'}, 'Reunión convocada: empezará en el próximo ciclo.').then(ok => { if (ok) root.querySelector('#ao-owner-text').value = ''; }); });
  root.querySelector('#ao-owner').addEventListener('submit', e => { e.preventDefault(); const input = root.querySelector('#ao-owner-text'), t = input.value.trim(); if (t.length < 3) return flash('Escribe el mensaje para el equipo.', true); command('owner', {text: t}, 'Mensaje enviado: Augusto lo leerá en el próximo ciclo.').then(ok => { if (ok) input.value = ''; }); });
  root.querySelector('#ao-panel').addEventListener('click', panelClick);
  root.querySelector('#ao-panel').addEventListener('submit', panelSubmit);
  root.querySelector('#ao-agent').addEventListener('click', e => { const chip = e.target.closest('[data-agent]'); if (chip) { selected = chip.dataset.agent; paintAgent(); } const p = e.target.closest('[data-pause]'); if (p) command('agent', {id: selected, paused: p.dataset.pause === '1'}, 'Cambio pedido.'); });
}
async function command(path, body, okText) { try { await api(path, body); flash(okText); return true; } catch (e) { flash(e.message, true); return false; } }

// ---- eventos → escena y feed ----
function feedLine(e) {
  const a = who(e.agent || e.from), to = who(e.to); let text = e.text || '';
  if (e.type === 'handoff' && to) text = '→ ' + to.name + ': ' + text;
  if (e.type === 'meeting') text = 'Reunión «' + e.topic + '»: ' + (e.decision || '');
  if (e.type === 'strategy') text = 'Cambio de ' + (e.label || 'regla') + ': ' + e.value + (e.text ? ' · ' + e.text : '');
  if (e.type === 'upgrade') text = 'Compra para la oficina: ' + e.label;
  if (e.type === 'owner') text = 'César: ' + e.text;
  const kind = e.type === 'trade' ? (e.side === 'buy' ? 'buy' : e.pnl >= 0 ? 'win' : 'loss') : e.type;
  return `<div class="ao-line" data-kind="${esc(kind)}" style="--c:${esc(a?.color || '#8b9bab')}"><time>${hm(e.at)}</time><b>${esc(a?.name || (e.type === 'owner' ? 'Dueño' : 'Oficina'))}</b><span>${esc(text)}</span></div>`;
}
function addFeed(e, prepend = true) { const f = root.querySelector('#ao-feed'); if (!f) return; f.insertAdjacentHTML(prepend ? 'afterbegin' : 'beforeend', feedLine(e)); while (f.children.length > 60) f.lastChild.remove(); }
function stage(e) {
  const agent = e.agent === 'cesar' ? 'operator' : e.agent;
  if (e.type === 'handoff') office.play({type: 'handoff', from: e.from, to: e.to, text: e.text});
  else if (e.type === 'say') office.play({type: 'say', agent, text: e.text});
  else if (e.type === 'research') office.play({type: 'research', agent, symbol: e.symbol, text: e.text});
  else if (e.type === 'trade') office.play({type: 'trade', agent: STAFF.some(s => s.id === agent) ? agent : 'operator', side: e.side, symbol: e.symbol, pnl: e.pnl, text: e.text});
  else if (e.type === 'meeting') office.play({type: 'meeting', topic: e.topic, lines: e.lines, decision: e.decision, participants: e.participants?.length ? e.participants : undefined});
  else if (e.type === 'strategy') office.play({type: 'strategy', agent: STAFF.some(s => s.id === agent) ? agent : 'auditor', name: (live.board?.name || '').toUpperCase(), lines: live.board?.lines || [], text: 'Cambiamos ' + (e.label || 'las reglas') + ': ' + e.value});
  else if (e.type === 'upgrade') office.play({type: 'upgrade', item: e.item, label: e.label});
  else if (e.type === 'summary') office.play({type: 'say', agent: 'designer', text: 'Resumen del día listo: ' + e.text});
  else if (e.type === 'system' || e.type === 'owner') office.toast?.(e.type === 'owner' ? 'César: ' + e.text : e.text);
}
function intake() {
  const events = live.timeline || [];
  if (!primed) {
    primed = true; const recent = Date.now() - 4 * 60e3;
    for (const e of events.slice(-45)) { if (e.at >= recent && e.id > lastSeen) pending.push(e); else addFeed(e); }
    lastSeen = events.at(-1)?.id || 0; return;
  }
  for (const e of events) if (e.id > lastSeen) { pending.push(e); lastSeen = e.id; }
  if (pending.length > 40) for (const e of pending.splice(0, pending.length - 40)) addFeed(e);
}
function pump() {
  if (!office || !pending.length || Date.now() < nextPlayAt || document.hidden) return;
  const e = pending.shift(); addFeed(e); stage(e);
  // Un lote llega cada ~5 min: se reparte para que siempre esté pasando algo.
  const gap = e.type === 'meeting' ? 12 + (e.lines?.length || 0) * 5 : Math.max(5, Math.min(22, 230 / (pending.length + 1)));
  nextPlayAt = Date.now() + gap * 1000;
}
function onMeeting(m) {
  const box = root.querySelector('#ao-meet'), body = root.querySelector('#ao-meet-body'); if (!box) return;
  if (m.phase === 'start') { box.hidden = false; body.innerHTML = `<p class="ao-meet-topic">${esc(m.topic)}</p>`; }
  else if (m.phase === 'line') { const a = who(m.agent); body.insertAdjacentHTML('beforeend', `<p><b class="ao-name" style="--c:${esc(a?.color)}">${esc(a?.name)}:</b> ${esc(m.text)}</p>`); body.scrollTop = body.scrollHeight; }
  else { body.insertAdjacentHTML('beforeend', `<p class="ao-meet-end">Acuerdo: ${esc(m.decision)}</p>`); setTimeout(() => { box.hidden = true; }, 15000); }
}

// ---- paneles ----
function paintKpis() {
  const c = live.company, b = live.budget, missing = Math.max(0, c.rentTarget - c.monthPnl), bar = Math.max(0, Math.min(100, c.rentPct));
  const tok = Math.max(0, Math.min(100, b.remainingEur / b.allowanceEur * 100));
  root.querySelector('#ao-kpis').innerHTML = `
    <div class="ao-kpi"><span>Capital</span><strong>${money(c.equity)}</strong><small>hoy <b data-sign="${c.dayPnl >= 0 ? 'up' : 'down'}">${signed(c.dayPnl)}</b> · caja ${money(c.cash)}</small></div>
    <div class="ao-kpi"><span>Alquiler del mes</span><strong data-sign="${c.monthPnl >= 0 ? 'up' : 'down'}">${signed(c.monthPnl)}</strong><div class="ao-bar" role="img" aria-label="${bar.toFixed(0)} % del alquiler"><i style="width:${bar}%"></i></div><small>${missing ? 'faltan ' + money(missing) + ' · ' + money(c.needPerDay) + ' al día' : 'alquiler cubierto'}</small></div>
    <div class="ao-kpi"><span>Tokens de IA</span><strong>${money(b.remainingEur, 2)}</strong><div class="ao-bar" data-tone="${tok < 20 ? 'bad' : 'blue'}" role="img" aria-label="${tok.toFixed(0)} % de los tokens"><i style="width:${tok}%"></i></div><small>hoy ${money(b.todaySpentEur || 0, 3)}${b.todayAllowanceEur != null ? ' de ' + money(b.todayAllowanceEur, 3) : ''} · ritmo ${esc(b.pace)}</small></div>
    <div class="ao-kpi"><span>Fin de mes</span><strong>${c.daysLeft} ${c.daysLeft === 1 ? 'día' : 'días'}</strong><small>${c.stats.trades} operaciones cerradas · ${c.stats.wins} con beneficio</small></div>
    <div class="ao-kpi"><span>Ánimo</span><strong>${MOOD[c.mood] || '—'}</strong><small>${esc(live.policy.strategy)}</small></div>`;
  root.querySelector('#ao-clock').textContent = (live.market.open ? 'Mercado abierto' : 'Mercado cerrado') + ' · último ciclo ' + ago(live.lastTick);
  root.querySelector('#ao-clock').dataset.state = live.connections.scheduler ? (live.market.open ? 'open' : 'closed') : 'late';
  root.querySelector('#ao-pause').textContent = live.paused ? 'Reanudar compras' : 'Pausar compras';
  if (live.budget.ai && !live.budget.ai.ok && live.budget.ai.reason && !(notice && notice.until > Date.now())) { notice = {text: live.budget.ai.reason, bad: true, until: Date.now() + 9000}; paintNotice(); }
}
function paintAgent() {
  const el = root.querySelector('#ao-agent'), a = live.agents.find(x => x.id === selected) || live.agents[0]; if (!a) return;
  const idle = a.waitUntil > Date.now();
  el.innerHTML = `<div class="ao-chips">${live.agents.map(x => `<button type="button" data-agent="${x.id}" aria-pressed="${x.id === a.id}" style="--c:${esc(x.color)}">${esc(x.name)}${x.work || x.inbox ? '<i></i>' : ''}</button>`).join('')}</div>
    <div class="ao-who"><canvas width="32" height="44" aria-hidden="true"></canvas><div><h3><span class="ao-name" style="--c:${esc(a.color)}">${esc(a.name)}</span> <small>${esc(a.role)} · ${esc(a.mood)}</small></h3><p class="ao-duty">${esc(a.duty)}</p></div></div>
    <dl class="ao-facts"><dt>Ahora</dt><dd>${a.paused ? 'En pausa por César' : esc(a.task || '—')}${idle && !a.paused ? ' · descansa hasta las ' + hm(a.waitUntil) : ''}</dd>
    ${a.thought ? `<dt>Piensa</dt><dd>${esc(a.thought)}</dd>` : ''}${a.say ? `<dt>Dijo</dt><dd>«${esc(a.say)}»</dd>` : ''}
    ${a.notes?.length ? `<dt>Se apunta</dt><dd>${esc(a.notes.at(-1))}</dd>` : ''}
    <dt>Actividad</dt><dd>último turno ${ago(a.lastAt)} · ${a.today?.calls || 0} turnos hoy (${money(a.today?.eur || 0, 4)}) · ${a.calls} en total (${money(a.eur, 3)})</dd></dl>
    <button type="button" class="ao-ghost" data-pause="${a.paused ? 0 : 1}">${a.paused ? 'Reactivar a ' + esc(a.name) : 'Pausar a ' + esc(a.name)}</button>`;
  const g = el.querySelector('canvas').getContext('2d'); clearInterval(portrait); let t = 0;
  const draw = () => { t += .12; g.clearRect(0, 0, 32, 44); drawChar(g, 16, 40, LOOKS[a.id], {dir: 'down', pose: a.mood === 'agobiado' ? 'panic' : a.mood === 'euforico' ? 'cheer' : 'talk', t}); };
  draw(); portrait = setInterval(draw, 140);
}
function paintToday() {
  const d = live.days[0], el = root.querySelector('#ao-today'); if (!d) { el.innerHTML = '<h3>Hoy</h3><p class="ao-muted">Todavía no hay actividad registrada hoy.</p>'; return; }
  const facts = [d.ideas ? d.ideas + ' ideas nuevas' : null, d.bought?.length ? 'compras: ' + d.bought.join(', ') : null, d.sold?.length ? 'cierres: ' + d.sold.map(s => s.symbol + ' ' + signed(s.pnl)).join(', ') : null, d.meetings ? d.meetings + (d.meetings === 1 ? ' reunión' : ' reuniones') : null, d.changes?.length ? 'cambios: ' + d.changes.join('; ') : null, 'IA ' + money(d.spentEur || 0, 3)].filter(Boolean);
  el.innerHTML = `<h3>${d.final ? 'Resumen de hoy' : 'Hoy, de momento'} <small data-sign="${d.pnl >= 0 ? 'up' : 'down'}">${signed(d.pnl)}</small></h3>${d.headline ? `<p class="ao-headline">${esc(d.headline)}</p>` : ''}${d.text ? `<p>${esc(d.text)}</p>` : ''}<p class="ao-muted">${esc(facts.join(' · '))}</p>`;
}
function spark(points, w = 640, h = 120) {
  if (points.length < 2) return '<p class="ao-muted">La curva aparecerá cuando haya más datos.</p>';
  const xs = points.map(p => p.time), ys = points.map(p => p.value), x0 = Math.min(...xs), x1 = Math.max(...xs), lo = Math.min(...ys), hi = Math.max(...ys), pad = (hi - lo) * .1 || 50;
  const X = t => 4 + (t - x0) / (x1 - x0 || 1) * (w - 8), Y = v => h - 16 - (v - (lo - pad)) / ((hi + pad) - (lo - pad)) * (h - 28);
  const up = ys.at(-1) >= ys[0];
  return `<svg class="ao-spark" viewBox="0 0 ${w} ${h}" role="img" aria-label="Evolución del capital: de ${money(ys[0])} a ${money(ys.at(-1))}"><polyline fill="none" stroke="${up ? 'var(--ao-up)' : 'var(--ao-down)'}" stroke-width="2" stroke-linejoin="round" points="${points.map(p => X(p.time).toFixed(1) + ',' + Y(p.value).toFixed(1)).join(' ')}"/><circle cx="${X(xs.at(-1)).toFixed(1)}" cy="${Y(ys.at(-1)).toFixed(1)}" r="3" fill="${up ? 'var(--ao-up)' : 'var(--ao-down)'}"/><text x="4" y="${h - 3}">${esc(dm(x0))} · ${money(ys[0])}</text><text x="${w - 4}" y="${h - 3}" text-anchor="end">ahora · ${money(ys.at(-1))}</text></svg>`;
}
const PANELS = {
  cartera() {
    const p = live.positions, o = live.orders, c = live.closed;
    return `<div class="ao-cols"><div><h3>Posiciones abiertas</h3>${p.length ? `<div class="ao-scroll"><table><thead><tr><th>Valor</th><th class="n">Invertido</th><th class="n">Resultado</th><th class="n">Stop</th><th class="n">Objetivo</th><th>Vence</th><th></th></tr></thead><tbody>${p.map(x => `<tr><td><b>${esc(x.symbol)}</b><small>${esc(x.name)}</small></td><td class="n">${money(x.eur)}</td><td class="n" data-sign="${x.pnl >= 0 ? 'up' : 'down'}">${signed(x.pnl)}<small>${pct(x.pnlPct)}</small></td><td class="n">${x.stop.toFixed(2)} $</td><td class="n">${x.target.toFixed(2)} $</td><td>${esc(dm(x.expiresAt))}</td><td><button type="button" class="ao-ghost" data-close="${esc(x.id)}">Cerrar</button></td></tr><tr class="ao-sub"><td colspan="7">${esc(x.thesis || 'Sin tesis registrada')}</td></tr>`).join('')}</tbody></table></div>` : '<p class="ao-muted">Sin posiciones. El equipo está buscando y analizando candidatas.</p>'}
      ${o.length ? `<h3>Órdenes esperando precio</h3><ul class="ao-list">${o.map(x => `<li><b>${x.side === 'buy' ? 'Compra' : 'Venta'} ${esc(x.symbol)}</b>${x.eur ? ' · ' + money(x.eur) : ''}<small>${esc(x.note || 'Se ejecuta en el siguiente ciclo')}</small></li>`).join('')}</ul>` : ''}</div>
      <div><h3>Capital</h3>${spark(live.curve)}<h3>Últimos cierres</h3>${c.length ? `<div class="ao-scroll"><table><thead><tr><th>Valor</th><th class="n">Resultado</th><th>Motivo</th><th>Cierre</th></tr></thead><tbody>${c.slice(0, 12).map(x => `<tr><td><b>${esc(x.symbol)}</b></td><td class="n" data-sign="${x.pnl >= 0 ? 'up' : 'down'}">${signed(x.pnl)}<small>${pct(x.pnlPct)}</small></td><td>${esc(x.reason)}</td><td>${esc(dm(x.closedAt))}</td></tr>`).join('')}</tbody></table></div>` : '<p class="ao-muted">Aún no se ha cerrado ninguna operación.</p>'}</div></div>`;
  },
  ideas() {
    const groups = [['nueva', 'plan', 'vetada'], ['aprobada', 'ordenada', 'comprada'], ['cerrada', 'descartada', 'caducada']], titles = ['En análisis', 'Aprobadas y en cartera', 'Terminadas'];
    return `<div class="ao-cols ao-cols-3">${groups.map((g, i) => { const items = live.ideas.filter(x => g.includes(x.status)); return `<div><h3>${titles[i]} <small>${items.length}</small></h3>${items.length ? items.slice(0, 12).map(x => `<article class="ao-idea" data-status="${esc(x.status)}"><header><b>${esc(x.symbol)}</b><span>${esc(STATUS[x.status] || x.status)}</span></header><p>${esc(x.thesis)}</p>${x.plan ? `<p class="ao-muted">Plan: ${money(x.plan.eur)} · stop −${x.plan.stopPct} % · objetivo +${x.plan.targetPct} % · ${x.plan.days} días</p>` : ''}${x.risk ? `<p class="ao-muted">María: ${esc(x.risk)}</p>` : ''}${x.research ? `<p class="ao-muted">Web (${esc(x.research.sentiment)}): ${esc(x.research.summary)}</p>` : ''}<footer>${esc(who(x.by)?.name || '')} · ${esc(dm(x.updatedAt))}${x.result != null ? ' · ' + signed(x.result) : ''}</footer></article>`).join('') : '<p class="ao-muted">Nada por aquí.</p>'}</div>`; }).join('')}</div>`;
  },
  reuniones() {
    return live.meetings.length ? live.meetings.map((m, i) => `<details class="ao-meeting" ${i === 0 ? 'open' : ''}><summary><b>${esc(m.topic)}</b><span>${esc(dm(m.at))} · ${m.lines.length} intervenciones · ${money(m.costEur, 4)}</span></summary>${m.lines.map(l => `<p><b class="ao-name" style="--c:${esc(who(l.agent)?.color)}">${esc(who(l.agent)?.name)}:</b> ${esc(l.text)}</p>`).join('')}<p class="ao-meet-end">${esc(m.summary || '')}</p>${m.decisions.length ? `<ul class="ao-list">${m.decisions.map(d => `<li>${d.applied ? 'Aplicado' : 'No aplicado'}: ${esc(d.label || d.param)} = ${esc(d.value)}<small>${esc(d.reason || '')}</small></li>`).join('')}</ul>` : ''}${m.tasks.length ? `<ul class="ao-list">${m.tasks.map(t => `<li>Encargo a ${esc(who(t.to)?.name)}: ${esc(t.text)}</li>`).join('')}</ul>` : ''}</details>`).join('') : '<p class="ao-muted">Todavía no ha habido reuniones. Las fijas son a las 09:30, 15:00 y 22:10 (hora de Madrid); el equipo puede cambiar cuántas hace.</p>';
  },
  diario() {
    return live.days.length ? `<div class="ao-days">${live.days.map(d => `<article class="ao-day"><header><b>${esc(new Intl.DateTimeFormat('es-ES', {weekday: 'long', day: 'numeric', month: 'long'}).format(new Date(d.day + 'T12:00:00')))}</b><span data-sign="${d.pnl >= 0 ? 'up' : 'down'}">${signed(d.pnl)}</span></header>${d.headline ? `<p class="ao-headline">${esc(d.headline)}</p>` : ''}${d.text ? `<p>${esc(d.text)}</p>` : ''}<p class="ao-muted">${esc([d.ideas + ' ideas', (d.bought?.length || 0) + ' compras', (d.sold?.length || 0) + ' cierres', d.meetings + ' reuniones', 'IA ' + money(d.spentEur || 0, 3), d.final ? null : 'día en curso'].filter(Boolean).join(' · '))}</p></article>`).join('')}</div>` : '<p class="ao-muted">El diario se escribe cada noche tras el cierre del mercado.</p>';
  },
  estrategia() {
    const p = live.policy, rows = [['Estrategia', p.strategy], ['Qué buscan', p.focus], ['Reglas de la casa', p.rules], ['Tamaño por posición', p.lotPct + ' % del capital'], ['Posiciones máximas', p.maxPositions], ['Apalancamiento', '×' + p.leverage], ['Stop por defecto', '−' + p.stopPct + ' %'], ['Objetivo por defecto', '+' + p.targetPct + ' %'], ['Plazo por defecto', p.holdDays + ' días'], ['Filtro de riesgo (María aprueba)', p.riskGate === 'on' ? 'activo' : 'desactivado'], ['Ritmo de trabajo', p.pace], ['Reuniones al día', p.meetingsPerDay]];
    return `<div class="ao-cols"><div><h3>Reglas vigentes <small>las decide el equipo</small></h3><table><tbody>${rows.map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')}</tbody></table>${live.lessons.length ? `<h3>Lecciones de la casa</h3><ul class="ao-list">${live.lessons.map(l => `<li>${esc(l)}</li>`).join('')}</ul>` : ''}</div>
      <div><h3>Cambios</h3>${live.strategyLog.length ? `<ul class="ao-list">${live.strategyLog.map(c => `<li><b>${esc(c.label)}</b>: ${esc(c.from)} → ${esc(c.to)}<small>${esc(who(c.by)?.name || '')} · ${esc(dm(c.at))}${c.reason ? ' · ' + esc(c.reason) : ''}</small></li>`).join('')}</ul>` : '<p class="ao-muted">Todavía no han cambiado nada.</p>'}
      <h3>Propuestas</h3>${live.proposals.length ? `<ul class="ao-list">${live.proposals.map(x => `<li><b>${esc(x.param)} = ${esc(x.value)}</b> <em>${esc(x.status)}</em><small>${esc(who(x.by)?.name || '')}: ${esc(x.text)}</small></li>`).join('')}</ul>` : '<p class="ao-muted">Ninguna propuesta pendiente.</p>'}</div></div>`;
  },
  ajustes() {
    const k = live.connections, src = Object.entries(live.radar.sources || {});
    return `<div class="ao-cols"><div><h3>Conexiones</h3><ul class="ao-list"><li><b>OpenAI</b>: ${k.openai ? 'clave guardada' : 'sin clave'}</li><li><b>Motor</b>: ${k.scheduler ? 'ciclos al día' : 'último ciclo ' + ago(live.lastTick)}${live.lastError ? '<small>' + esc(live.lastError) + '</small>' : ''}</li><li><b>Precios</b>: ${esc(live.market.status || '—')}${live.market.error ? '<small>' + esc(live.market.error) + '</small>' : ''}</li><li><b>Radar</b>: ${live.radar.events} señales · barrido ${ago(live.radar.lastScan)}${src.length ? '<small>' + esc(src.map(([n, v]) => n + (v.error ? ' (sin respuesta)' : '')).join(' · ')) + '</small>' : ''}</li><li><b>Cambio EUR/USD</b>: ${live.market.fx ? live.market.fx.rate + ' (' + esc(live.market.fx.date) + ')' : 'pendiente'}</li></ul></div>
      <div><h3>Clave de OpenAI</h3><form id="ao-key" class="ao-form"><label for="ao-key-input">Clave nueva (se guarda cifrada y no se vuelve a mostrar)</label><input id="ao-key-input" type="password" autocomplete="off" placeholder="sk-…"><button type="submit">Guardar clave</button></form>
      <h3>Gasto de IA por empleado</h3><table><thead><tr><th>Empleado</th><th class="n">Hoy</th><th class="n">Total</th></tr></thead><tbody>${live.agents.map(a => `<tr><td>${esc(a.name)}</td><td class="n">${money(a.today?.eur || 0, 4)}</td><td class="n">${money(a.eur, 3)}</td></tr>`).join('')}</tbody></table><p class="ao-muted">Un turno cuesta de media ${money(live.budget.turnCostEur, 4)}. Búsquedas web hoy: ${live.budget.webToday}.</p></div></div>`;
  }
};
function paintPanel() { for (const b of root.querySelectorAll('#ao-tabs [data-tab]')) b.setAttribute('aria-selected', b.dataset.tab === tab); const el = root.querySelector('#ao-panel'), keep = el.scrollTop, open = [...el.querySelectorAll('details')].map(d => d.open); if (tab === 'ajustes' && el.querySelector('#ao-key-input')?.value) return; el.innerHTML = PANELS[tab](); if (tab === 'reuniones' && open.length) el.querySelectorAll('details').forEach((d, i) => { if (i < open.length) d.open = open[i]; }); el.scrollTop = keep; }
function panelClick(e) { const b = e.target.closest('[data-close]'); if (b) command('close', {id: b.dataset.close}, 'Cierre pedido: se ejecutará con el siguiente precio válido.'); }
function panelSubmit(e) { if (e.target.id !== 'ao-key') return; e.preventDefault(); const input = e.target.querySelector('input'), key = input.value.trim(); if (!key) return; api('key', {key}).then(() => { input.value = ''; flash('Clave guardada.'); }).catch(err => flash(err.message, true)); }

function paint() {
  office.setState({equity: live.company.equity, monthPnl: live.company.monthPnl, rentTarget: live.company.rentTarget, daysLeft: live.company.daysLeft, tokensLeft: live.budget.remainingEur / live.budget.allowanceEur, tokensEur: live.budget.remainingEur, marketOpen: live.market.open, mood: live.company.mood, positions: live.positions.map(p => ({symbol: p.symbol, pnlPct: p.pnlPct})), strategy: {name: (live.board.name || '').toUpperCase(), lines: live.board.lines}, upgrades: live.office.upgrades, hour: null, agents: Object.fromEntries(live.agents.map(a => [a.id, {idle: a.waitUntil > Date.now() || a.paused}]))});
  paintKpis(); paintAgent(); paintToday(); paintPanel(); paintNotice();
}
async function refresh() {
  if (polling) return; polling = true;
  try {
    const next = await api('status'); if (next.v !== 2) throw Error('El motor nuevo aún no ha publicado su primer estado. Se actualizará solo en unos minutos.');
    const first = !live; live = next; if (first) shell(); intake(); paint();
  } catch (e) { if (!live) { root.innerHTML = `<div class="ao-error"><h2>Agent Office</h2><p>${esc(e.message)}</p><button type="button" id="ao-retry">Volver a intentar</button></div>`; root.querySelector('#ao-retry').addEventListener('click', refresh); } else flash('Sin conexión con la oficina: ' + e.message, true); }
  finally { polling = false; }
}
const visible = () => document.getElementById('trading')?.classList.contains('active') && !document.hidden;
async function initialise(token) { if (started) return; started = true; csrf = token; await refresh(); setInterval(() => { if (visible()) refresh(); }, 8000); setInterval(() => { if (visible() && live) pump(); }, 1000); }
window.TradingLab = {initialise}; window.addEventListener('homelab:trading-init', e => initialise(e.detail)); if (window.TradingLabPending) initialise(window.TradingLabPending);
window.addEventListener('homelab:view', e => { if (e.detail === 'trading' && started) refresh(); });
