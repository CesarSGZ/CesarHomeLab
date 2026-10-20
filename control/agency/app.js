// Agencia · vista del Mission Control. Pinta la oficina con el estado real del backend de la
// agencia (que corre en ServerCesar), el chat con el Director, las fichas del equipo, el karma
// de Reddit y el registro. Lee /control/api/agency/status y deja mensajes y órdenes en cola.
import { VW, VH } from './art.js';
import { agency } from './room.js';
import { chatCard, teamCard, karmaCard, logCard, headChip, esc } from './panel.js';

const PX = 4, root = document.getElementById('agency-app');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let started = false, csrf = '', live = null, selected = 'director', polling = false, timer = 0, draft = '';

async function api(path, body) {
  const r = await fetch('/control/api/agency/' + path, { method: body ? 'POST' : 'GET', credentials: 'same-origin', headers: { 'content-type': 'application/json', 'x-csrf-token': csrf }, body: body ? JSON.stringify(body) : undefined });
  const j = await r.json().catch(() => ({ ok: false, error: 'Respuesta no válida (HTTP ' + r.status + ')' }));
  if (!r.ok || j.ok === false) throw Error(j.error || 'HTTP ' + r.status);
  return j;
}

function shell() {
  root.innerHTML = `
  <header class="ag-head"><div><p class="ag-eyebrow">AGENT OFFICE · AGENCIA · SCARLETT STORM</p><h2>La oficina de Scarlett Storm</h2></div><span class="ag-chip" id="ag-chip"></span></header>
  <p class="ag-notice" id="ag-notice" role="status" hidden></p>
  <div class="ag-main">
    <div class="ag-left">
      <div class="ag-stage"><canvas class="ag-canvas" width="${VW * PX}" height="${VH * PX}" role="img" aria-label="Oficina de la agencia: el Director en su despacho, el Karma Farmer en la planta abierta y puestos libres para nuevos agentes."></canvas><div class="ag-toast" role="status" hidden></div></div>
      <div class="ag-things"><button type="button" data-go="director">Hablar con el Director</button><button type="button" data-go="karma-farmer">Ver al Karma Farmer</button><button type="button" data-go="kpis">Mirar el panel de KPIs</button></div>
      <section class="ag-card" id="ag-chat-card"></section>
      <section class="ag-card" id="ag-log"></section>
    </div>
    <aside class="ag-side"><section class="ag-card" id="ag-team"></section><section class="ag-card" id="ag-karma"></section></aside>
  </div>
  <p class="ag-foot">El equipo trabaja en ServerCesar y habla con esta página por HTTPS saliente: si el PC se apaga o pierde la red, la oficina se queda «sin señal». Karma Farmer usa un perfil local de navegador para leer Reddit y publicar. Los envíos sin confirmar requieren revisión.</p>`;
  const cv = root.querySelector('canvas'), g = cv.getContext('2d'), toastEl = root.querySelector('.ag-toast');
  const base = document.createElement('canvas'); base.width = VW; base.height = VH; agency.paintStatic(base.getContext('2d'));
  let toastTimer = 0;
  const toast = text => { toastEl.textContent = text; toastEl.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { toastEl.hidden = true; }, 4200); };
  const S = () => ({ agents: live?.state?.agents || [], reddit: live?.state?.reddit, online: !!live?.backend.online });
  const hour = () => { const p = new Intl.DateTimeFormat('es-ES', { timeZone: 'Europe/Madrid', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(new Date()); return Number(p.find(x => x.type === 'hour').value) + Number(p.find(x => x.type === 'minute').value) / 60; };
  function draw(t = performance.now() / 1000) {
    const c = { g, now: t, S: S(), hour: hour(), online: S().online };
    g.setTransform(PX, 0, 0, PX, 0, 0); g.imageSmoothingEnabled = false;
    g.drawImage(base, 0, 0); agency.drawWall(g, { t, hour: c.hour, S: c.S });
    const D = []; agency.items(D, c); D.sort((a, b) => a.y - b.y).forEach(d => d.f());
    if (c.hour < 7.5 || c.hour >= 22) { g.fillStyle = 'rgba(10,16,40,.32)'; g.fillRect(0, 0, VW, VH); }
  }
  function go(id) {
    if (id === 'kpis') { const r = live?.state?.reddit; toast(r?.configured ? `Karma total ${r.karma?.total ?? '—'} · últimos 7 días ${r.karma7d == null ? 'midiendo' : (r.karma7d >= 0 ? '+' : '') + r.karma7d} · ${r.posts?.length || 0} publicaciones registradas.` : 'El panel espera a que se conecte la cuenta de Reddit.'); return; }
    selected = id; paintTeam();
    if (id === 'director') { const input = root.querySelector('#ag-chat-input'); input?.scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth', block: 'center' }); input?.focus({ preventScroll: true }); toast('El Director te escucha: escríbele en el chat.'); }
    else { root.querySelector('#ag-agent-' + CSS.escape(id))?.scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth', block: 'center' }); const a = live?.state?.agents?.find(x => x.id === id); if (a) toast(a.name + ': ' + (a.detail || a.role)); }
  }
  cv.addEventListener('click', e => {
    const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * VW, y = (e.clientY - r.top) / r.height * VH;
    const hit = agency.hits(S()).find(h => x >= h.x && x <= h.x + h.w && y >= h.y && y <= h.y + h.h); if (hit) go(hit.id);
  });
  root.querySelector('.ag-things').addEventListener('click', e => { const b = e.target.closest('[data-go]'); if (b) go(b.dataset.go); });
  root.querySelector('#ag-team').addEventListener('click', e => {
    const b = e.target.closest('[data-cmd]'); if (!b) return;
    if (b.dataset.cmd === 'run-now' && !confirm('¿Publicar ahora en r/AskReddit? Cuenta como el post de hoy (máximo 2 en 24 h).')) return;
    b.disabled = true; api('command', { agent: b.dataset.agent, type: b.dataset.cmd }).then(() => { notice('Orden enviada: la oficina la recoge en unos segundos.'); refresh(); }).catch(err => { b.disabled = false; notice(err.message, true); });
  });
  root.querySelector('#ag-chat-card').addEventListener('submit', e => {
    if (e.target.id !== 'ag-chat-form') return; e.preventDefault();
    const input = e.target.querySelector('textarea'), text = input.value.trim(); if (text.length < 2) return;
    const btn = e.target.querySelector('button'); btn.disabled = true;
    api('chat', { text }).then(() => { input.value = ''; draft = ''; refresh(); }).catch(err => notice(err.message, true)).finally(() => { btn.disabled = false; });
  });
  root.querySelector('#ag-chat-card').addEventListener('input', e => { if (e.target.id === 'ag-chat-input') draft = e.target.value; });
  root.querySelector('#ag-chat-card').addEventListener('keydown', e => { if (e.target.id === 'ag-chat-input' && e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); e.target.form.requestSubmit(); } });
  let last = 0;
  const loop = now => { requestAnimationFrame(loop); if (document.hidden || !root.offsetParent) return; if (now - last < (reduced.matches ? 1000 : 66)) return; last = now; draw(now / 1000); };
  draw(); requestAnimationFrame(loop);
}

function notice(text, bad = false) { const el = root.querySelector('#ag-notice'); if (!el) return; el.textContent = text; el.dataset.bad = bad ? '1' : ''; el.hidden = false; clearTimeout(notice.t); notice.t = setTimeout(() => { el.hidden = true; }, 7000); }
function paintTeam() { root.querySelector('#ag-team').innerHTML = teamCard(live, selected); }
function paint() {
  root.querySelector('#ag-chip').textContent = headChip(live); root.querySelector('#ag-chip').dataset.on = live.backend.online ? '1' : '';
  const card = root.querySelector('#ag-chat-card'), logEl = card.querySelector('#ag-chat-log'), atEnd = !logEl || logEl.scrollHeight - logEl.scrollTop - logEl.clientHeight < 40, focused = document.activeElement?.id === 'ag-chat-input';
  card.innerHTML = chatCard(live);
  const input = card.querySelector('#ag-chat-input'); input.value = draft; if (focused) { input.focus({ preventScroll: true }); input.setSelectionRange(draft.length, draft.length); }
  const newLog = card.querySelector('#ag-chat-log'); if (atEnd) newLog.scrollTop = newLog.scrollHeight;
  paintTeam(); root.querySelector('#ag-karma').innerHTML = karmaCard(live); root.querySelector('#ag-log').innerHTML = logCard(live);
}
async function refresh() {
  if (polling) return; polling = true;
  try { const first = !live; live = await api('status'); if (first) shell(); paint(); }
  catch (e) { if (!live) root.innerHTML = `<div class="ag-card"><h3>Agencia</h3><p>No se pudo leer la oficina: ${esc(e.message)}</p><button type="button" id="ag-retry">Volver a intentar</button></div>`, root.querySelector('#ag-retry').onclick = refresh; else notice('Sin conexión con Mission Control: ' + e.message, true); }
  finally { polling = false; schedule(); }
}
const visible = () => document.getElementById('agency')?.classList.contains('active') && !document.hidden;
function schedule() {
  clearTimeout(timer);
  const busy = live && ((live.messages || []).some(m => m.role === 'owner' && m.status === 'queued') || live.state?.agents?.some(a => a.status === 'thinking' || a.status === 'working'));
  timer = setTimeout(() => { if (visible() || !live) refresh(); else schedule(); }, busy ? 3000 : 10000);
}
function initialise(token) {
  if (started || !root) return; started = true; csrf = token ?? window.AgencyPending?.csrf ?? '';
  refresh();
}
window.Agency = { initialise };
window.addEventListener('homelab:view', e => { if (e.detail === 'agency' && started) refresh(); });
if (window.AgencyPending) initialise(window.AgencyPending.csrf);
