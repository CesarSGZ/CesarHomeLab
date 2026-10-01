import { layoutFleet, nodeVisibility, linkPairs, smooth, clamp } from './aerospace-model.mjs?v=20261001b';

const canvas = document.querySelector('#aerospace-network');
const toggle = document.querySelector('#ambient-toggle');
const ctx = canvas?.getContext('2d', { alpha: true });
if (!ctx) { canvas?.remove(); toggle?.remove(); }
else initialise();

function initialise() {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const storageKey = 'csg-ambient-paused';
  let paused = false;
  try { paused = localStorage.getItem(storageKey) === 'true'; } catch {}
  let width = document.documentElement.clientWidth, height = innerHeight, mobile = width < 680;
  let frame = 0, last = 0, elapsed = 0, clock = 0, dirty = true;
  let rectangles = [], bands = [], fleet = [], pointer = { x: -1000, y: -1000 };
  // Decorations occupy whitespace only, including during scrolling and resizing.
  const readingSelector = '.nav-wrap,main h1,main h2,main h3,main p,main .eyebrow,.hero-actions,.identity,.scroll-hint,.pillars,.belief-statement,.log-content,.log-meta,.tenure-overview,.capability-atlas,.tool-marquee,.credential-grid,.language-console,.final-actions,main footer,.ambient-toggle';

  function measure() {
    rectangles = [...document.querySelectorAll(readingSelector)].map(el => el.getBoundingClientRect())
      .filter(r => r.width && r.height && r.bottom > -50 && r.top < height + 50)
      .map(r => ({ left: r.left - 8, right: r.right + 8, top: r.top - 8, bottom: r.bottom + 8 }));
    bands = [...document.querySelectorAll('main > .section')].map(el => ({
      rect: el.getBoundingClientRect(), light: el.matches('.manifest,.trajectory,.credentials')
    }));
    const previous = new Map(fleet.map(node => [node.id, node]));
    fleet = layoutFleet(width, height, rectangles).map(node => {
      const old = previous.get(node.id);
      return { ...node, tx: node.x, ty: node.y, x: old?.x ?? node.x, y: old?.y ?? node.y };
    });
    toggle.dataset.tone = lightAt(height - 40) ? 'light' : 'dark';
    dirty = false;
  }
  function lightAt(y) {
    return document.documentElement.dataset.theme !== 'night' && bands.some(b => b.light && y >= b.rect.top && y < b.rect.bottom);
  }
  function colour(id, y) {
    return (lightAt(y) ? ['#4d7c93', '#748c48', '#8d739f'] : ['#91cbdf', '#bad689', '#bdaae4'])[id % 3];
  }
  function resize() {
    width = document.documentElement.clientWidth; height = innerHeight; mobile = width < 680;
    const ratio = Math.min(devicePixelRatio || 1, mobile ? 1.5 : 2);
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    dirty = true; restart();
  }
  function path(points, closed = false, fill = false) {
    ctx.beginPath(); points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
    if (closed) ctx.closePath();
    if (fill) ctx.fill();
    ctx.stroke();
  }
  function circle(x, y, radius, fill = false) {
    ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); if (fill) ctx.fill(); ctx.stroke();
  }
  function glyph(node) {
    if (node.kind === 'plane' || node.kind === 'uav') {
      if (node.kind === 'plane') {
        // A friendly, tapered fuselage and swept wings, rather than an emoji.
        ctx.beginPath(); ctx.moveTo(0, -22); ctx.quadraticCurveTo(3, -21, 3, -9);
        ctx.lineTo(19, 3); ctx.quadraticCurveTo(20, 6, 17, 5); ctx.lineTo(3, 0);
        ctx.lineTo(2, 13); ctx.lineTo(8, 18); ctx.lineTo(8, 20); ctx.lineTo(0, 17);
        ctx.lineTo(-8, 20); ctx.lineTo(-8, 18); ctx.lineTo(-2, 13); ctx.lineTo(-3, 0);
        ctx.lineTo(-17, 5); ctx.quadraticCurveTo(-20, 6, -19, 3); ctx.lineTo(-3, -9);
        ctx.quadraticCurveTo(-3, -21, 0, -22); ctx.closePath(); ctx.fill(); ctx.stroke();
        path([[-1.5, -14], [1.5, -14]]); path([[0, -6], [0, 11]]);
      } else {
        path([[0, -19], [2, -9], [21, -3], [21, 0], [2, -2], [1.5, 12], [8, 16], [8, 18], [0, 15], [-8, 18], [-8, 16], [-1.5, 12], [-2, -2], [-21, 0], [-21, -3], [-2, -9]], true, true);
        path([[-5, -12], [5, -12]]); circle(0, -12, 1.8);
      }
      ctx.globalAlpha *= .45;
      path([[-4, 24], [-4, 34]]); path([[4, 26], [4, 39]]);
    } else if (node.kind === 'satellite') {
      ctx.rotate(-.35);
      ctx.beginPath(); ctx.roundRect(-5, -7, 10, 14, 2); ctx.fill(); ctx.stroke();
      for (const side of [-1, 1]) {
        path([[side * 5, 0], [side * 10, 0]]);
        path([[side * 10, -9], [side * 23, -9], [side * 23, 9], [side * 10, 9]], true, true);
        path([[side * 16.5, -9], [side * 16.5, 9]]);
        path([[side * 10, -3], [side * 23, -3]]); path([[side * 10, 3], [side * 23, 3]]);
      }
      path([[0, -7], [0, -13], [5, -17]]); circle(5, -17, 1.2, true);
      ctx.globalAlpha *= .55; ctx.beginPath(); ctx.arc(5, -17, 7 + Math.sin(clock * .7 + node.phase) * 1.5, -1.8, -.1); ctx.stroke();
    } else {
      for (const [x, y] of [[-13, -13], [13, -13], [-13, 13], [13, 13]]) {
        path([[x * .25, y * .25], [x, y]]); circle(x, y, 6.5);
        ctx.save(); ctx.translate(x, y); ctx.rotate(clock * 1.8 + node.phase * 6);
        path([[-4, 0], [4, 0]]); path([[0, -4], [0, 4]]); ctx.restore();
      }
      ctx.beginPath(); ctx.roundRect(-4, -6, 8, 12, 3); ctx.fill(); ctx.stroke(); circle(0, 1, 1.2);
    }
  }
  function renderFleet(dt) {
    const visible = [], blend = reduced.matches || paused ? 1 : 1 - Math.exp(-dt * 2.3);
    for (const node of fleet) {
      node.x += (node.tx - node.x) * blend; node.y += (node.ty - node.y) * blend;
      const phase = clock * .065 + node.phase * Math.PI * 2, amplitude = mobile ? 5 : 12;
      const edge = node.size * .68 + 3;
      const point = { ...node, x: clamp(node.x + Math.sin(phase) * amplitude, edge, width - edge),
        y: clamp(node.y + Math.cos(phase * .85) * amplitude * .7, node.size, height - node.size) };
      const cycle = (clock / 58 + node.phase) % 1;
      const presence = reduced.matches || paused ? .9 : .6 + .4 * smooth(0, .1, cycle) * (1 - smooth(.86, 1, cycle));
      const visibility = nodeVisibility(point, node.size * .61, rectangles) * presence;
      if (visibility < .02) continue;
      visible.push({ ...point, visibility });
      ctx.save(); ctx.translate(point.x, point.y);
      const nearPointer = Math.max(0, 1 - Math.hypot(point.x - pointer.x, point.y - pointer.y) / 110);
      ctx.globalAlpha = visibility * (lightAt(point.y) ? .54 : .64);
      ctx.strokeStyle = colour(node.id, point.y); ctx.fillStyle = `${colour(node.id, point.y)}16`;
      if (nearPointer > .05 && !reduced.matches) {
        ctx.save(); ctx.globalAlpha *= nearPointer * .35; circle(0, 0, node.size * .72); ctx.restore();
      }
      ctx.rotate(node.kind === 'plane' || node.kind === 'uav' ? Math.atan2(-Math.sin(phase * .85) * .85, Math.cos(phase)) * .23 + .35 : Math.sin(phase) * .12);
      ctx.scale(node.size / 42, node.size / 42); ctx.lineWidth = 1.35; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      glyph(node); ctx.restore();
    }
    return visible;
  }
  function renderLinks(nodes) {
    const pairs = linkPairs(nodes, width, mobile), period = (clock % 17) / 17;
    const fade = (reduced.matches || paused) ? .6 : smooth(0, .16, period) * (1 - smooth(.75, 1, period));
    if (!pairs.length) return;
    const offset = Math.floor(clock / 17) * 3, used = new Set(); let drawn = 0;
    for (let i = 0; i < pairs.length && drawn < (mobile ? 2 : 5); i++) {
      const { a, b } = pairs[(i + offset) % pairs.length];
      if (used.has(a.id) && used.has(b.id)) continue;
      used.add(a.id); used.add(b.id); drawn++;
      const middle = { x: (a.x + b.x) / 2 - (b.y - a.y) * .13, y: (a.y + b.y) / 2 + (b.x - a.x) * .13 };
      ctx.save(); ctx.strokeStyle = colour(a.id, a.y); ctx.fillStyle = ctx.strokeStyle;
      ctx.globalAlpha = Math.min(a.visibility, b.visibility) * fade * .25;
      ctx.lineWidth = .8; ctx.setLineDash([2, 6]); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.quadraticCurveTo(middle.x, middle.y, b.x, b.y); ctx.stroke();
      ctx.setLineDash([]); const t = (clock * .07 + i * .23) % 1;
      const x = (1 - t) ** 2 * a.x + 2 * (1 - t) * t * middle.x + t * t * b.x;
      const y = (1 - t) ** 2 * a.y + 2 * (1 - t) * t * middle.y + t * t * b.y;
      ctx.globalAlpha *= 2.5; circle(x, y, 1.65, true); ctx.globalAlpha *= .15; circle(x, y, 5, true); ctx.restore();
    }
  }
  function renderDust() {
    ctx.save(); ctx.globalAlpha = .16;
    for (let i = 0; i < (mobile ? 16 : 43); i++) {
      const x = ((i * 127.17) % width), y = ((i * 83.71 + 97) % height);
      ctx.fillStyle = colour(i, y); ctx.fillRect(x, y, i % 5 ? 1 : 1.5, i % 5 ? 1 : 1.5);
    }
    ctx.restore();
  }
  function render(now = 0) {
    frame = 0;
    if (document.hidden) return;
    const moving = !paused && !reduced.matches;
    const dt = last ? Math.min((now - last) / 1000, .1) : 1 / 30;
    last = now; elapsed += dt;
    if (moving && !dirty && elapsed < 1 / (mobile ? 20 : 30)) { frame = requestAnimationFrame(render); return; }
    if (moving) clock += elapsed;
    if (dirty) measure();
    ctx.clearRect(0, 0, width, height); renderDust(); renderLinks(renderFleet(elapsed));
    // Even connection paths are erased behind text and interactive content.
    ctx.save(); ctx.globalCompositeOperation = 'destination-out'; ctx.globalAlpha = 1; ctx.fillStyle = '#000';
    for (const box of rectangles) ctx.fillRect(box.left, box.top, box.right - box.left, box.bottom - box.top);
    ctx.restore(); elapsed = 0;
    if (moving) frame = requestAnimationFrame(render);
  }
  function restart() { cancelAnimationFrame(frame); last = 0; elapsed = 0; frame = requestAnimationFrame(render); }
  function updateToggle() {
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.setAttribute('aria-label', paused ? 'Resume background network' : 'Pause background network');
    toggle.title = paused ? 'Reanudar el fondo animado' : 'Pausar el fondo animado';
  }
  toggle.addEventListener('click', () => { paused = !paused; try { localStorage.setItem(storageKey, String(paused)); } catch {} updateToggle(); restart(); });
  addEventListener('resize', resize, { passive: true });
  addEventListener('scroll', () => { dirty = true; if (!frame) restart(); }, { passive: true });
  addEventListener('pointermove', event => { if (event.pointerType === 'mouse') pointer = { x: event.clientX, y: event.clientY }; }, { passive: true });
  document.addEventListener('pointerleave', () => { pointer = { x: -1000, y: -1000 }; });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { cancelAnimationFrame(frame); frame = 0; } else { dirty = true; restart(); } });
  addEventListener('csg:theme', () => { dirty = true; restart(); });
  reduced.addEventListener('change', restart);
  const observer = new ResizeObserver(() => { dirty = true; if (!frame) restart(); });
  observer.observe(document.querySelector('main'));
  document.fonts.ready.then(() => { dirty = true; restart(); });
  updateToggle(); resize();
}
