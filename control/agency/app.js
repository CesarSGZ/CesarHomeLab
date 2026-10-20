// Agencia · vista del Mission Control. Dibuja la sala en pixel art y su panel. Todavía no
// hay agentes: no llama a ningún servicio ni a ningún modelo.
import { VW, VH } from './art.js';
import { agency } from './room.js';
import { agencyMain, agencySide } from './panel.js';

const PX = 4, root = document.getElementById('agency-app');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let started = false;

function initialise() {
  if (started || !root) return; started = true;
  root.innerHTML = `
  <header class="ag-head"><p class="ag-eyebrow">AGENT OFFICE · AGENCIA · EN PREPARACIÓN</p><h2>La agencia de César</h2></header>
  <div class="ag-main">
    <div class="ag-left">
      <div class="ag-stage"><canvas class="ag-canvas" width="${VW * PX}" height="${VH * PX}" role="img" aria-label="La sala de la agencia, todavía de mudanza: cajas, un aro de luz, un sofá con plástico y un neón de «Próximamente»."></canvas><div class="ag-toast" role="status" hidden></div></div>
      <div class="ag-things" aria-label="Cosas de la sala"></div>
      <section class="ag-card">${agencyMain()}</section>
    </div>
    <aside class="ag-side"><section class="ag-card">${agencySide()}</section></aside>
  </div>`;
  const cv = root.querySelector('canvas'), g = cv.getContext('2d'), toastEl = root.querySelector('.ag-toast');
  const base = document.createElement('canvas'); base.width = VW; base.height = VH; agency.paintStatic(base.getContext('2d'));
  const fx = { ringOn: false }; let toastTimer = 0;
  const api = { fx, toast(text) { toastEl.textContent = text; toastEl.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { toastEl.hidden = true; }, 4200); draw(); } };
  const things = agency.things(api), label = t => typeof t.label === 'function' ? t.label() : t.label;

  function draw(t = performance.now() / 1000) {
    g.setTransform(PX, 0, 0, PX, 0, 0); g.imageSmoothingEnabled = false;
    g.drawImage(base, 0, 0); agency.drawWall(g, { t, fx });
    const D = []; agency.items(D, { g, now: t, fx }); D.sort((a, b) => a.y - b.y).forEach(d => d.f());
  }
  const buttons = root.querySelector('.ag-things');
  const paintButtons = () => { const seen = new Set(); buttons.innerHTML = ''; for (const t of things) { const l = label(t); if (seen.has(l)) continue; seen.add(l); const b = document.createElement('button'); b.type = 'button'; b.textContent = l; b.onclick = () => { t.use(); paintButtons(); }; buttons.append(b); } };
  paintButtons();
  cv.addEventListener('click', e => {
    const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * VW, y = (e.clientY - r.top) / r.height * VH;
    const hit = things.find(t => t.hit && x >= t.hit[0] && x <= t.hit[0] + t.hit[2] && y >= t.hit[1] && y <= t.hit[1] + t.hit[3]);
    if (hit) { hit.use(); paintButtons(); }
  });
  // Solo se anima mientras la vista está a la vista; con movimiento reducido, un fotograma por segundo.
  let last = 0;
  const loop = now => { requestAnimationFrame(loop); if (document.hidden || !root.offsetParent) return; if (reduced.matches && now - last < 1000) return; last = now; draw(now / 1000); };
  draw(); requestAnimationFrame(loop);
}
window.Agency = { initialise };
if (window.AgencyPending) initialise();
