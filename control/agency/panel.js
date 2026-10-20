// Agencia · paneles alrededor de la oficina, a partir del estado real (GET /control/api/agency/status).
export const esc = x => String(x ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const tz = { timeZone: 'Europe/Madrid' };
export const hm = t => t ? new Intl.DateTimeFormat('es-ES', { ...tz, hour: '2-digit', minute: '2-digit' }).format(new Date(t)) : '—';
export const dm = t => t ? new Intl.DateTimeFormat('es-ES', { ...tz, day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(t)) : '—';
export const ago = t => { if (!t) return 'nunca'; const s = Math.max(0, (Date.now() - t) / 1000 | 0); return s < 90 ? 'hace ' + s + ' s' : s < 5400 ? 'hace ' + Math.round(s / 60) + ' min' : s < 172800 ? 'hace ' + Math.round(s / 3600) + ' h' : 'hace ' + Math.round(s / 86400) + ' días'; };
const STATUS = { working: ['Trabajando', 'ok'], thinking: ['Pensando', 'ok'], resting: ['Descansando', 'rest'], paused: ['En pausa', 'off'], blocked: ['PROTOCOLO OSIRIS', 'off'], error: ['Error', 'bad'], completed: ['Completado', 'ok'] };
const CMD = { pause: 'Pausar', resume: 'Reanudar', 'run-now': 'Publicar ahora' };
const NAMES = { system: 'Sistema', director: 'Director' };
const who = (id, agents) => NAMES[id] || agents.find(a => a.id === id)?.name || id;

export function chatCard(live) {
  const msgs = live.messages || [], waiting = msgs.some(m => m.role === 'owner' && m.status === 'queued'), director = live.state?.agents?.find(a => a.id === 'director');
  const thinking = director?.status === 'thinking';
  return `<h3>Chat con el Director <small>${live.backend.online ? 'en su mesa' : 'sin conexión con la oficina'}</small></h3>
  <div class="ag-chat" id="ag-chat-log" aria-live="polite">${msgs.length ? msgs.map(m => `<div class="ag-msg" data-role="${m.role}"><p>${esc(m.text)}</p>${m.actions?.length ? `<ul>${m.actions.map(a => `<li>${esc(a)}</li>`).join('')}</ul>` : ''}<small>${m.role === 'owner' ? 'Tú' : 'Director'} · ${esc(dm(m.at))}${m.role === 'owner' && m.status === 'queued' ? ' · sin leer' : ''}</small></div>`).join('')
    : '<p class="ag-muted">Escríbele al Director: dale órdenes generales («esta semana preguntas sobre viajes», «pausa a Reddit hasta el lunes», «¿cómo vamos de karma?»). Él decide qué directrices pasar al equipo.</p>'}
  ${waiting || thinking ? `<div class="ag-msg ag-typing" data-role="director"><p>${thinking ? 'El Director está escribiendo' : live.backend.online ? 'El Director va a leer tu mensaje' : 'El mensaje espera a que la oficina vuelva a tener conexión'}<span>…</span></p></div>` : ''}</div>
  <form class="ag-form" id="ag-chat-form"><label class="ag-sr" for="ag-chat-input">Mensaje para el Director</label><textarea id="ag-chat-input" rows="2" maxlength="2000" placeholder="Escribe al Director…"></textarea><button type="submit">Enviar</button></form>
  ${directivesBlock(live)}`;
}
function directivesBlock(live) {
  const d = live.state?.directives || [], agents = live.state?.agents || [];
  return `<h4>Directrices que está aplicando</h4>${d.length ? `<ul class="ag-list">${d.map(x => `<li>${esc(x.text)}<small>Para ${esc(x.target === 'all' ? 'todo el equipo' : who(x.target, agents))} · ${esc(dm(x.createdAt))}</small></li>`).join('')}</ul>` : '<p class="ag-muted">Ninguna todavía. Cuando le pidas algo permanente, el Director la anotará aquí.</p>'}`;
}

export function teamCard(live, selected) {
  const agents = live.state?.agents || [], on = live.backend.online;
  if (!agents.length) return `<h3>Equipo</h3><p class="ag-muted">${on ? 'El backend todavía no ha publicado su equipo.' : 'El backend de la agencia no ha conectado todavía con Mission Control.'}</p>`;
  return `<h3>Equipo <small>${agents.length} en plantilla</small></h3>${agents.map(a => {
    const [label, tone] = on ? (a.id === 'karma-farmer' && a.status === 'blocked' ? ['PROTOCOLO OSIRIS', 'off'] : STATUS[a.status] || [a.status, 'rest']) : ['Sin conexión', 'off'];
    const cmds = (a.commands || []).filter(c => c === 'run-now' || (c === 'pause') !== (a.status === 'paused'));
    return `<article class="ag-agent" id="ag-agent-${esc(a.id)}" data-selected="${a.id === selected}"><header><b>${esc(a.name)}</b><span class="ag-pill" data-tone="${tone}">${esc(label)}</span></header>
      <p class="ag-muted">${esc(a.role)}</p>${a.detail ? `<p>${esc(a.detail)}</p>` : ''}
      ${a.stats?.length ? `<dl class="ag-stats">${a.stats.map(s => `<div><dt>${esc(s.label)}</dt><dd>${esc(s.value)}</dd></div>`).join('')}</dl>` : ''}
      <p class="ag-muted">Última vez: ${esc(a.lastResult || '—')}${a.lastRunAt ? ' · ' + esc(ago(a.lastRunAt)) : ''}${a.nextRunAt ? ' · próxima: ' + esc(dm(a.nextRunAt)) : ''}</p>
      ${cmds.length ? `<div class="ag-actions">${cmds.map(c => `<button type="button" data-cmd="${c}" data-agent="${esc(a.id)}">${CMD[c]}</button>`).join('')}</div>` : ''}</article>`;
  }).join('')}`;
}

function bars(history) {
  const days = []; for (let i = 1; i < history.length; i++) days.push({ day: history[i].day, v: history[i].total - history[i - 1].total });
  const last = days.slice(-14); if (!last.length) return '<p class="ag-muted">La gráfica de karma diario aparece a partir del segundo día de mediciones.</p>';
  const w = 320, h = 90, max = Math.max(1, ...last.map(d => Math.abs(d.v))), bw = Math.floor((w - 8) / last.length), mid = h - 18;
  return `<svg class="ag-bars" viewBox="0 0 ${w} ${h}" role="img" aria-label="Karma ganado por día, últimos ${last.length} días">${last.map((d, i) => { const bh = Math.max(1, Math.round(Math.abs(d.v) / max * (mid - 12))); return `<g><title>${esc(d.day)}: ${d.v >= 0 ? '+' : ''}${d.v}</title><rect x="${4 + i * bw + 1}" y="${d.v >= 0 ? mid - bh : mid}" width="${bw - 3}" height="${bh}" rx="2" class="${d.v >= 0 ? 'up' : 'down'}"/></g>`; }).join('')}<line x1="4" x2="${w - 4}" y1="${mid}" y2="${mid}"/><text x="4" y="${h - 3}">${esc(last[0].day.slice(5))}</text><text x="${w - 4}" y="${h - 3}" text-anchor="end">${esc(last.at(-1).day.slice(5))}</text></svg>`;
}
export function karmaCard(live) {
  const r = live.state?.reddit;
  if (r?.protocol === 'PROTOCOLO OSIRIS') return '<h3>Reddit</h3><p class="ag-muted">PROTOCOLO OSIRIS</p>';
  if (!r) return '<h3>Reddit</h3><p class="ag-muted">Sin datos todavía.</p>';
  if (!r.configured) return '<h3>Reddit</h3><p class="ag-muted">PROTOCOLO OSIRIS</p>';
  const k7 = r.karma7d, week = (r.posts || []).filter(p => p.createdAt > Date.now() - 7 * 864e5);
  const tile = (label, value, tone = '') => `<div class="ag-tile"><span>${esc(label)}</span><b data-tone="${tone}">${esc(value)}</b></div>`;
  return `<h3>Reddit <small>u/${esc(r.username)} · medido ${esc(ago(r.checkedAt))}</small></h3>
  <div class="ag-tiles">${tile('Karma 7 días', k7 == null ? 'midiendo' : (k7 >= 0 ? '+' : '') + k7, k7 > 0 ? 'up' : k7 < 0 ? 'down' : '')}${tile('Karma total', r.karma?.total ?? '—')}${tile('Posts 7 días', week.length)}${tile('Votos de esos posts', r.postScore7d ?? '—')}</div>
  ${bars(r.history || [])}
  <h4>Publicaciones</h4>${r.posts?.length ? `<ul class="ag-list ag-posts">${r.posts.slice(0, 12).map(p => `<li><a href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">${esc(p.title)}</a><small>r/${esc(p.subreddit)} · ${esc(dm(p.createdAt))} · ${p.score ?? '—'} votos · ${p.comments ?? '—'} comentarios${p.removed ? ' · <em>retirado por moderación</em>' : ''}</small></li>`).join('')}</ul>` : '<p class="ag-muted">Todavía no ha publicado nada.</p>'}`;
}

export function logCard(live) {
  const agents = live.state?.agents || [], ev = live.events || [];
  return `<h3>Registro <small>lo que va haciendo el equipo</small></h3><div class="ag-feed">${ev.length ? ev.slice(0, 60).map(e => `<p data-level="${esc(e.level)}"><time>${esc(dm(e.at))}</time><b>${esc(who(e.agent, agents))}</b> ${esc(e.text)}</p>`).join('') : '<p class="ag-muted">Sin actividad todavía.</p>'}</div>`;
}

export function headChip(live) {
  const b = live.backend, llm = live.state?.llm;
  return b.online ? `Oficina conectada · IA hoy ${llm ? '$' + (llm.usdToday || 0).toFixed(3) : '—'}` : b.seenAt ? 'Oficina sin señal ' + ago(b.seenAt) : 'Oficina aún sin conectar';
}
