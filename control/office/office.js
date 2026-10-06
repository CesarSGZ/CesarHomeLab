// Agent Office · simulación visual. Recibe el estado real (setState) y los eventos
// reales del motor (play) y los convierte en coreografía. No llama a ningún modelo.
import { T, R, PAL, LOOKS, text, textW, drawChar, chair, desk, plant, sofa, tank, coffeeMachine, whiteboard, arcade, aquarium, monitor } from './art.js';

export const COLS = 26, ROWS = 15, VW = COLS * T, VH = ROWS * T, PXS = 4;
export const STAFF = [
  { id: 'scout', name: 'Santi', role: 'Explorador', color: '#9ccb98', seat: [2, 8], screens: ['scan', 'table'] },
  { id: 'analyst', name: 'Pedro', role: 'Analista', color: '#b6a4e8', seat: [7, 8], screens: ['bars', 'code'] },
  { id: 'risk', name: 'María', role: 'Riesgo', color: '#e8b67c', seat: [12, 8], screens: ['table', 'bars'] },
  { id: 'operator', name: 'Yari', role: 'Trader', color: '#81cbd0', seat: [2, 12], screens: ['up', 'table'] },
  { id: 'auditor', name: 'Augusto', role: 'Dirección', color: '#e7a6bf', seat: [7, 12], screens: ['code', 'bars'] },
  { id: 'designer', name: 'Cadaqui', role: 'Finanzas y tokens', color: '#91afe8', seat: [12, 12], screens: ['bars', 'table'] },
  { id: 'cesar', name: 'César', role: 'Dueño', color: '#f3ead9', seat: [22, 12], screens: ['up', 'off'] }
];
const MEET = { scout: [21, 4, 'down', 0], analyst: [23, 4, 'down', 0], risk: [24, 5, 'left', 7], operator: [21, 7, 'up', 0], auditor: [20, 5, 'right', 7], designer: [23, 7, 'up', 0], cesar: [22, 7, 'up', 0] };
const SPOT = { coffee: [2, 4, 'up'], tank: [6, 4, 'up'], board: [14, 4, 'up'], strategy: [13, 13, 'right'], sofaA: [8, 3, 'down'], sofaB: [10, 3, 'down'], arcade: [4, 12, 'down'], window: [11, 4, 'up'] };
const VIS = 2;
const TALK = {
  calm: ['¿Café?', 'Hoy pinta tranquilo.', 'Vamos por delante del alquiler.', '¿Viste el cierre de ayer?', 'Sin prisa pero sin pausa.', 'Me gusta cómo va el mes.'],
  tense: ['Vamos justos este mes.', 'Hay que mover ficha.', '¿Cuántos días quedan?', 'Necesitamos una buena entrada.', 'Ojo con los tokens.', 'No podemos fallar la siguiente.'],
  panic: ['¡No llegamos al alquiler!', 'Esto hay que arriesgarlo.', '¿Y si cambiamos de estrategia?', 'Nos quedamos sin tokens…', 'O remontamos o cerramos.', 'Necesito otro café.'],
  joy: ['¡Menudo mes!', 'El alquiler está pagado.', 'Esto hay que celebrarlo.', '¿Ampliamos la oficina?', 'Así da gusto.']
};
const pick = a => a[Math.random() * a.length | 0];

function buildGrid(up) {
  const b = Array.from({ length: ROWS }, () => new Uint8Array(COLS));
  const blk = (x0, y0, x1 = x0, y1 = y0) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (b[y]) b[y][x] = 1; };
  blk(0, 0, COLS - 1, 2); blk(0, ROWS - 1, COLS - 1, ROWS - 1); blk(0, 0, 0, ROWS - 1); blk(COLS - 1, 0, COLS - 1, ROWS - 1);
  blk(1, 3, 6, 3); blk(8, 3, 10, 3);
  for (const y of [7, 11]) for (const x of [1, 6, 11]) blk(x, y, x + 2, y);
  blk(19, 3, 19, 5); blk(19, 8); blk(19, 9, 24, 9); blk(21, 5, 23, 6); blk(20, 3); blk(24, 3);
  blk(19, 10, 19, 11); blk(21, 11, 23, 11); blk(24, 13);
  blk(14, 13, 17, 13); blk(18, 3);
  if (up.has('arcade')) blk(4, 13); if (up.has('aquarium')) blk(9, 13, 10, 13);
  return b;
}
function findPath(grid, sx, sy, tx, ty) {
  if (sx === tx && sy === ty) return [];
  const key = (x, y) => y * COLS + x, prev = new Int16Array(COLS * ROWS).fill(-1), q = [[sx, sy]]; prev[key(sx, sy)] = key(sx, sy);
  for (let i = 0; i < q.length; i++) {
    const [x, y] = q[i];
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS || prev[key(nx, ny)] >= 0) continue;
      const goal = nx === tx && ny === ty; if (grid[ny][nx] && !goal) continue;
      prev[key(nx, ny)] = key(x, y);
      if (goal) { const out = []; let k = key(nx, ny); while (k !== key(sx, sy)) { out.unshift([k % COLS, k / COLS | 0]); k = prev[k]; } return out; }
      q.push([nx, ny]);
    }
  }
  return null;
}

export function createOffice(root, opts = {}) {
  root.classList.add('ao-stage');
  root.innerHTML = '<canvas class="ao-canvas" width="' + VW + '" height="' + VH + '" tabindex="0" aria-label="Oficina de agentes"></canvas><div class="ao-bubbles"></div><div class="ao-toast" hidden></div>';
  const cv = root.querySelector('canvas'), g = cv.getContext('2d'), bubbles = root.querySelector('.ao-bubbles'), toastEl = root.querySelector('.ao-toast');
  cv.width = VW * PXS; cv.height = VH * PXS;
  let S = { equity: 10000, monthPnl: 0, rentTarget: 10000, daysLeft: 25, tokensLeft: .88, tokensEur: 8.82, marketOpen: false, positions: [], strategy: { name: 'Catalizadores', lines: ['EVENTOS CERCANOS', 'STOP CORTO'] }, mood: 'tense', hour: null, upgrades: [], agents: {}, meetingTopic: null };
  let up = new Set(S.upgrades), grid = buildGrid(up), now = 0, raf = 0, alive = true, last = performance.now();
  const timers = [], parts = [], keys = new Set();
  const sleep = ms => new Promise(r => timers.push({ at: now + ms / 1000, r }));
  const px = (tx, ty) => [tx * T + 8, ty * T + 14];

  const A = STAFF.map((d, i) => { const [x, y] = px(...d.seat); return { ...d, look: LOOKS[d.id], x, y, tx: d.seat[0], ty: d.seat[1], dir: 'up', pose: 'type', path: [], arrive: null, token: 0, busy: false, bubble: null, sweat: false, seated: true, oy: 0, next: 6 + i * 5 + Math.random() * 10, screen: null }; });
  const by = id => A.find(a => a.id === id);

  // ---- acciones de agente (promesas resueltas por el bucle) ----
  function goto(a, tx, ty, o = {}) {
    return new Promise(res => {
      if (a.arrive) a.arrive(false);
      const sx = Math.round((a.x - 8) / T), sy = Math.round((a.y - 14) / T);
      const p = findPath(grid, sx, sy, tx, ty);
      if (!p) { res(false); return; }
      a.path = p; a.seated = false; a.oy = 0; a.pose = 'walk'; a.fast = !!o.fast;
      a.arrive = ok => { a.arrive = null; if (ok) { a.tx = tx; a.ty = ty; a.pose = 'stand'; if (o.dir) a.dir = o.dir; } res(ok); };
      if (!p.length) a.arrive(true);
    });
  }
  async function goHome(a, tok) {
    const ok = await goto(a, ...a.seat); if (!ok || tok !== a.token) return false;
    a.seated = true; a.dir = 'up'; a.pose = 'type'; return true;
  }
  function say(a, str, ms) {
    const dur = ms ?? Math.min(7000, 1600 + str.length * 55);
    if (a.bubble) a.bubble.el.remove();
    const el = document.createElement('div'); el.className = 'ao-bubble'; el.style.setProperty('--c', a.color); el.innerHTML = '<b></b><span></span>'; el.firstChild.textContent = a.name; bubbles.appendChild(el);
    a.bubble = { el, str, shown: 0, start: now, until: now + dur / 1000 };
    return sleep(dur);
  }
  function emote(a, ch, c = PAL.amber) { parts.push({ x: a.x, y: a.y - 30, vy: -9, life: 1.6, str: ch, c }); }
  function toast(str, kind = 'info') { toastEl.textContent = str; toastEl.dataset.kind = kind; toastEl.hidden = false; clearTimeout(toast.h); toast.h = setTimeout(() => toastEl.hidden = true, 5200); }
  const claim = a => { a.token++; a.busy = true; if (a.arrive) a.arrive(false); return a.token; };
  const release = a => { a.busy = false; a.next = now + (S.agents?.[a.id]?.idle ? 7 : 16) + Math.random() * 26; };
  const moodKey = () => S.mood === 'joy' ? 'joy' : S.mood === 'panic' ? 'panic' : S.mood === 'tense' ? 'tense' : 'calm';

  // ---- escenas derivadas de eventos reales ----
  const queue = []; let running = 0;
  const SCENES = {
    async research(e) {
      const a = by(e.agent || 'scout'), tok = claim(a); await goHome(a, tok); a.screen = ['scan', 'scan'];
      await say(a, e.text || ('Mirando ' + e.symbol + '…')); await sleep(1800); a.screen = null; release(a);
    },
    async say(e) { const a = by(e.agent); if (!a) return; const tok = claim(a); if (a.seated) { a.pose = 'sit'; a.dir = 'down'; } await say(a, e.text); if (tok === a.token && a.seated) { a.pose = 'type'; a.dir = 'up'; } release(a); },
    async handoff(e) {
      const a = by(e.from), b = by(e.to); if (!a || !b || a === b) return; const ta = claim(a), tb = claim(b);
      const gob = goHome(b, tb); await goto(a, b.seat[0] + VIS, b.seat[1], { dir: 'left', fast: S.mood === 'panic' }); await gob;
      b.pose = 'sit'; b.dir = 'right'; a.dir = 'left'; a.pose = 'talk';
      await say(a, e.text); a.pose = 'stand';
      if (e.reply) { b.pose = 'talk'; await say(b, e.reply); }
      if (e.rebuttal) { a.pose = 'talk'; await say(a, e.rebuttal); a.pose = 'stand'; }
      b.pose = 'type'; b.dir = 'up'; release(b); await goHome(a, ta); release(a);
    },
    async meeting(e) {
      const who = (e.participants || STAFF.filter(s => s.id !== 'cesar').map(s => s.id)).map(by).filter(Boolean), toks = who.map(claim);
      S.meetingTopic = e.topic; toast('Reunión: ' + e.topic, 'meeting'); opts.onMeeting?.({ phase: 'start', topic: e.topic });
      await Promise.all(who.map(async a => { const [mx, my, d, oy] = MEET[a.id]; await sleep(Math.random() * 900); const ok = await goto(a, mx, my, { dir: d, fast: true }); if (ok) { a.seated = true; a.pose = 'sit'; a.dir = d; a.oy = oy; } }));
      await sleep(600);
      for (const l of e.lines || []) { const a = by(l.agent); if (!a) continue; a.pose = 'talk'; opts.onMeeting?.({ phase: 'line', agent: a.id, text: l.text }); await say(a, l.text); a.pose = 'sit'; await sleep(250); }
      if (e.decision) { toast('Acuerdo: ' + e.decision, 'ok'); opts.onMeeting?.({ phase: 'end', decision: e.decision }); who.forEach(a => emote(a, e.mood === 'bad' ? '…' : '!', PAL.green)); await sleep(1600); }
      S.meetingTopic = null;
      await Promise.all(who.map(async (a, i) => { await sleep(i * 350); await goHome(a, toks[i]); release(a); }));
    },
    async trade(e) {
      const a = by(e.agent || 'operator'), tok = claim(a); await goHome(a, tok);
      const good = e.side === 'buy' || (e.pnl ?? 0) >= 0; a.screen = good ? ['up', 'up'] : ['down', 'alert'];
      await say(a, e.text || (e.side === 'buy' ? 'Comprado ' + e.symbol : 'Vendido ' + e.symbol));
      if (e.side === 'sell') {
        const str = (e.pnl >= 0 ? '+' : '') + Math.round(e.pnl) + '€'; parts.push({ x: a.x, y: a.y - 34, vy: -12, life: 2.4, str, c: e.pnl >= 0 ? PAL.green : PAL.red });
        if (e.pnl > 0) { const all = A.filter(x => !x.busy && x.id !== 'cesar'); a.pose = 'cheer'; a.dir = 'down'; all.forEach(x => { x.pose = 'cheer'; x.dir = 'down'; x.busy = true; x.token++; }); await sleep(1900); all.forEach(x => { if (x.seated) { x.pose = 'type'; x.dir = 'up'; } else x.pose = 'stand'; release(x); }); }
        else { a.pose = 'panic'; a.dir = 'down'; await sleep(1700); const r = by('risk'); if (!r.busy) { const tr = claim(r); r.pose = 'sit'; r.dir = 'down'; await say(r, pick(['Estaba dentro del riesgo previsto.', 'Te dije que ese stop era justo.', 'Anotado. Revisamos tamaño.'])); if (tr === r.token) { r.pose = 'type'; r.dir = 'up'; } release(r); } }
      } else emote(a, '$', PAL.green);
      if (tok === a.token) { a.pose = 'type'; a.dir = 'up'; } a.screen = null; release(a);
    },
    async strategy(e) {
      const a = by(e.agent || 'auditor'), tok = claim(a); await goto(a, ...SPOT.strategy.slice(0, 2), { dir: 'left' }); a.pose = 'talk';
      S.strategy = { name: e.name, lines: e.lines || [] }; parts.push({ x: 16 * T, y: 11 * T + 6, vy: -8, life: 2, str: 'NUEVA', c: PAL.amber });
      await say(a, e.text || ('Cambiamos a: ' + e.name)); toast('Nueva estrategia: ' + e.name, 'ok'); await goHome(a, tok); release(a);
    },
    async upgrade(e) { S.upgrades = [...new Set([...S.upgrades, e.item])]; up = new Set(S.upgrades); grid = buildGrid(up); toast('La oficina invierte en: ' + (e.label || e.item), 'ok'); await sleep(800); }
  };
  async function pump() {
    while (queue.length && running < 2) {
      const i = queue.findIndex(e => !(e._who || []).some(id => by(id)?.busy)); if (i < 0) break;
      const e = queue.splice(i, 1)[0]; running++;
      Promise.resolve(SCENES[e.type]?.(e)).catch(err => console.warn('office scene', err)).finally(() => { running--; pump(); });
    }
  }
  function play(e) {
    e._who = e.type === 'meeting' ? (e.participants || STAFF.filter(s => s.id !== 'cesar').map(s => s.id)) : [e.agent, e.from, e.to].filter(Boolean);
    if (e.type === 'meeting') queue.unshift(e); else queue.push(e); if (queue.length > 12) queue.splice(4, 1); pump();
  }

  // ---- vida de oficina (local, en función del estado real) ----
  async function idle(a) {
    const tok = claim(a), mood = moodKey(), ok = () => tok === a.token;
    const opt = ['coffee', 'coffee', 'chat', 'chat', 'board', 'tank', 'stretch', 'window'];
    if (mood === 'calm' || mood === 'joy') opt.push('sofa'); if (up.has('arcade') && mood !== 'panic') opt.push('arcade'); if (mood === 'panic') opt.push('board', 'tank', 'chat');
    const what = pick(opt);
    try {
      if (what === 'stretch') { a.pose = 'cheer'; a.dir = 'down'; await sleep(900); }
      else if (what === 'chat') {
        const b = pick(A.filter(x => x !== a && !x.busy && x.seated && x.id !== 'cesar')); if (!b) return;
        const tb = claim(b); await goto(a, b.seat[0] + VIS, b.seat[1], { dir: 'left' }); if (!ok()) { release(b); return; }
        b.pose = 'sit'; b.dir = 'right'; a.pose = 'talk'; await say(a, pick(TALK[mood])); a.pose = 'stand'; b.pose = 'talk'; await say(b, pick(TALK[mood].filter(x => x !== a.bubble?.str)));
        if (tb === b.token) { b.pose = 'type'; b.dir = 'up'; release(b); }
      } else {
        const sp = SPOT[what === 'sofa' ? (Math.random() < .5 ? 'sofaA' : 'sofaB') : what]; if (!await goto(a, sp[0], sp[1], { dir: sp[2] }) || !ok()) return;
        if (what === 'coffee') { await sleep(900); a.dir = 'down'; a.pose = 'drink'; await sleep(3800 + Math.random() * 2500); }
        else if (what === 'sofa') { a.seated = true; a.pose = 'sit'; a.oy = 0; await sleep(6000 + Math.random() * 4000); }
        else if (what === 'board') { await sleep(1200); emote(a, mood === 'panic' ? '!' : mood === 'joy' ? '+' : '?', mood === 'panic' ? PAL.red : PAL.amber); await sleep(1500); }
        else if (what === 'tank') { await sleep(1000); if (S.tokensLeft < .3) { a.pose = 'panic'; await say(a, 'Casi no quedan tokens…', 2200); } else await sleep(1200); }
        else await sleep(2500 + Math.random() * 2500);
      }
    } finally { if (ok()) { await goHome(a, tok); if (ok()) release(a); } }
  }

  // ---- dibujo ----
  const bg = document.createElement('canvas'); bg.width = VW; bg.height = VH; const b = bg.getContext('2d');
  function paintStatic() {
    for (let y = 3 * T; y < VH; y += 8) for (let x = 0; x < VW + 32; x += 32) { const o = (y / 8 % 2) * 16, k = (x * 13 + y * 7) % 5; R(b, x - o, y, 32, 8, k === 0 ? PAL.floorC : k < 3 ? PAL.floorA : PAL.floorB); R(b, x - o, y, 1, 8, 'rgba(90,55,25,.35)'); R(b, x - o, y + 7, 32, 1, 'rgba(60,35,15,.16)'); }
    const rug = (x, y, w, h, c = PAL.rug, d = PAL.navyLight) => { R(b, x, y, w, h, c); R(b, x + 1, y + 1, w - 2, 1, PAL.rugEdge); R(b, x + 1, y + h - 2, w - 2, 1, PAL.rugEdge); R(b, x + 1, y + 1, 1, h - 2, PAL.rugEdge); R(b, x + w - 2, y + 1, 1, h - 2, PAL.rugEdge); for (let i = x + 5; i < x + w - 5; i += 6) for (let j = y + 5; j < y + h - 5; j += 6) R(b, i, j, 1, 1, d); };
    for (const s of STAFF) if (s.id !== 'cesar') rug((s.seat[0] - 2) * T + 6, (s.seat[1] - 1) * T - 3, 68, 40);
    rug(20 * T, 4 * T - 2, 5 * T - 2, 4 * T + 10, '#3a3550', '#5a5378'); rug(20 * T + 2, 10 * T + 8, 5 * T - 6, 3 * T + 2, '#2f4d3f', '#4c7a63'); rug(8 * T - 6, 4 * T + 3, 60, 22, '#6a3f3a', '#96615a');
    R(b, 6 * T, VH - 13, 2 * T, 7, '#3b3028'); text(b, 'HOLA', 6 * T + 8, VH - 12, '#c9a55a');
    R(b, 0, 0, VW, 3 * T, PAL.wall); R(b, 0, 0, VW, 4, PAL.trimDark); R(b, 0, 12, VW, 1, PAL.wallShade); R(b, 0, 3 * T - 5, VW, 5, PAL.base); R(b, 0, 3 * T - 5, VW, 1, PAL.trim);
    for (let x = 0; x < VW; x += 20) R(b, x, 13, 1, 30, 'rgba(120,100,60,.08)');
    R(b, 0, 3 * T, VW, 3, 'rgba(0,0,0,.14)');
    R(b, 0, 0, 3, VH, PAL.trimDark); R(b, VW - 3, 0, 3, VH, PAL.trimDark); R(b, 0, VH - 6, VW, 6, PAL.trimDark); R(b, 0, VH - 6, VW, 1, PAL.trim);
    R(b, 16, 24, 62, 3, PAL.wood); R(b, 16, 27, 62, 1, PAL.woodDark); for (let i = 0; i < 5; i++) R(b, 20 + i * 12, 18, 5, 6, ['#f5f5f0', '#c96f4a', '#f5f5f0', '#6fa8c9', '#d9b44a'][i]);
    R(b, 16, 42, 64, 6, '#e3dccb'); R(b, 16, 42, 64, 1, '#fff'); R(b, 16, 48, 64, 15, PAL.navy); for (let i = 0; i < 4; i++) { R(b, 17 + i * 16, 50, 14, 12, PAL.navyLight); R(b, 23 + i * 16, 52, 2, 1, PAL.rugEdge); } R(b, 16, 63, 64, 2, 'rgba(0,0,0,.2)');
    R(b, 54, 40, 14, 3, '#9aa3ad'); R(b, 60, 35, 2, 6, '#c7ced6'); R(b, 58, 35, 3, 1, '#c7ced6');
    R(b, 81, 14, 14, 49, PAL.metal); R(b, 81, 14, 14, 1, '#e6ebf0'); R(b, 81, 32, 14, 1, PAL.metalDark); R(b, 92, 20, 1, 8, PAL.metalDark); R(b, 92, 36, 1, 14, PAL.metalDark); R(b, 82, 63, 12, 2, 'rgba(0,0,0,.2)'); R(b, 83, 22, 4, 4, '#f2b84b'); R(b, 84, 40, 5, 4, '#f6f4ec');
    R(b, 124, 12, 52, 32, PAL.trim); R(b, 178, 11, 88, 34, '#0b0f14'); R(b, 178, 11, 88, 1, '#39424d'); R(b, 180, 13, 84, 30, '#10151b');
    R(b, 324, 11, 72, 30, '#0b0f14'); R(b, 326, 13, 68, 26, '#10151b'); R(b, 270, 14, 22, 22, '#0b0f14'); R(b, 271, 15, 20, 20, '#141a22');
    R(b, 294, 16, 13, 13, PAL.trimDark); R(b, 295, 17, 11, 11, '#f6f4ec');
    const vg = (y0, y1) => { R(b, 19 * T + 6, y0, 4, y1 - y0, PAL.glass); R(b, 19 * T + 6, y0, 1, y1 - y0, PAL.glassEdge); R(b, 19 * T + 9, y0, 1, y1 - y0, 'rgba(30,50,70,.5)'); };
    vg(3 * T, 6 * T); vg(8 * T, 9 * T); vg(9 * T, 12 * T);
    for (const y of [6 * T, 8 * T, 12 * T]) R(b, 19 * T + 5, y - 1, 6, 2, PAL.trimDark);
  }
  paintStatic();

  function sky(h) { if (h < 6 || h >= 21.5) return ['#0c1330', '#1b2450', 0]; if (h < 8) return ['#f3a66b', '#f7d7a0', .6]; if (h < 18.5) return ['#6fb7ea', '#bfe3f7', 1]; if (h < 21.5) return ['#3c3a78', '#f08a5d', .55]; return ['#0c1330', '#1b2450', 0]; }
  function drawWall(t, hour) {
    const [c1, c2, day] = sky(hour);
    const gr = g.createLinearGradient(0, 14, 0, 42); gr.addColorStop(0, c1); gr.addColorStop(1, c2); g.fillStyle = gr; g.fillRect(126, 14, 48, 28);
    g.save(); g.beginPath(); g.rect(126, 14, 48, 28); g.clip();
    if (day < .2) { for (let i = 0; i < 9; i++) R(g, 128 + (i * 37) % 44, 16 + (i * 11) % 12, 1, 1, (t * 2 + i | 0) % 5 ? '#fff' : '#889'); R(g, 164, 17, 4, 4, '#f3f0d8'); R(g, 166, 17, 2, 2, c1); }
    else { R(g, 160, 18, 5, 5, day > .9 ? '#fff6c2' : '#ffb36b'); for (let i = 0; i < 2; i++) { const cx = 120 + ((t * (2 + i) + i * 30) % 62); R(g, cx, 19 + i * 7, 10, 3, 'rgba(255,255,255,.85)'); R(g, cx + 2, 18 + i * 7, 5, 1, 'rgba(255,255,255,.85)'); } }
    const sil = day > .2 ? '#4f6f93' : '#0a0f22';
    [[126, 12], [131, 18], [137, 9], [143, 15], [152, 16], [158, 10], [164, 20], [170, 13]].forEach(([x, h], i) => { R(g, x, 42 - h, 5, h, sil); R(g, x + 4, 42 - h, 1, h, 'rgba(0,0,0,.18)'); if (day < .5) for (let k = 0; k < h - 3; k += 3) if ((i + k) % 2) R(g, x + 1 + (k % 2) * 2, 42 - h + 2 + k, 1, 1, '#ffd98a'); });
    g.restore(); R(g, 149, 12, 2, 32, PAL.trim); R(g, 124, 27, 52, 1, PAL.trim); R(g, 122, 43, 56, 2, PAL.trimDark);
    R(g, 12, 3, 258, 8, '#0b0f14'); const on = S.marketOpen; R(g, 14, 5, 3, 3, on ? PAL.green : PAL.red); if (on && (t * 2 | 0) % 2) R(g, 13, 4, 5, 5, 'rgba(99,208,138,.4)'); text(g, 'NYSE', 20, 5, on ? PAL.green : '#8a5a58');
    const tk = (S.positions.length ? S.positions.map(p => p.symbol + ' ' + (p.pnlPct >= 0 ? '+' : '') + p.pnlPct.toFixed(1) + '%').join('   ') : 'SIN POSICIONES · BUSCANDO OPORTUNIDADES') + '   ·   ';
    g.save(); g.beginPath(); g.rect(42, 3, 226, 8); g.clip(); const w = textW(tk) + 1, off = (t * 12) % w; for (let x = 42 - off; x < 270; x += w) text(g, tk, x, 5, S.positions.length ? PAL.amber : '#5d7791'); g.restore();
    const bx = 182, byy = 14, pct = Math.max(0, Math.min(1, S.monthPnl / S.rentTarget)), gain = S.monthPnl >= 0;
    text(g, 'CAPITAL', bx, byy + 1, '#6f8aa6'); const eq = Math.round(S.equity).toLocaleString('es-ES') + '€'; text(g, eq, bx + 80 - textW(eq), byy + 1, '#e9f2fb');
    text(g, 'MES', bx, byy + 8, '#6f8aa6'); const mp = (gain ? '+' : '') + Math.round(S.monthPnl).toLocaleString('es-ES') + '€'; text(g, mp, bx + 80 - textW(mp), byy + 8, gain ? PAL.green : PAL.red);
    text(g, 'ALQUILER', bx, byy + 15, '#6f8aa6'); R(g, bx + 35, byy + 15, 45, 5, '#1c2a3a'); R(g, bx + 35, byy + 15, Math.max(1, Math.round(45 * pct)), 5, pct >= 1 ? PAL.green : pct > .5 ? PAL.amber : PAL.red); for (let i = 1; i < 4; i++) R(g, bx + 35 + i * 11, byy + 15, 1, 5, '#10151b');
    text(g, 'IA ' + S.tokensEur.toFixed(2) + '€', bx, byy + 23, S.tokensLeft < .2 ? PAL.red : PAL.blue); const dl = S.daysLeft + ' DIAS'; text(g, dl, bx + 80 - textW(dl), byy + 23, PAL.amber);
    text(g, 'MOOD', 273, 17, '#6f8aa6'); const mc = { calm: PAL.green, joy: PAL.lilac, tense: PAL.amber, panic: PAL.red }[S.mood] || PAL.amber; R(g, 275, 24, 12, 9, mc); R(g, 277, 26, 2, 2, '#141a22'); R(g, 283, 26, 2, 2, '#141a22'); if (S.mood === 'panic' || S.mood === 'tense') { R(g, 278, 30, 6, 1, '#141a22'); if (S.mood === 'panic') { R(g, 277, 31, 1, 1, '#141a22'); R(g, 284, 31, 1, 1, '#141a22'); } } else { R(g, 277, 29, 1, 1, '#141a22'); R(g, 284, 29, 1, 1, '#141a22'); R(g, 278, 30, 6, 1, '#141a22'); }
    const hh = (hour % 12) / 12 * Math.PI * 2, mm = (hour % 1) * Math.PI * 2; R(g, 300 + Math.round(Math.sin(hh) * 2), 22 - Math.round(Math.cos(hh) * 2), 1, 1, '#1a1410'); R(g, 300 + Math.round(Math.sin(hh)), 22 - Math.round(Math.cos(hh)), 1, 1, '#1a1410'); for (let i = 1; i <= 4; i++) R(g, 300 + Math.round(Math.sin(mm) * i), 22 - Math.round(Math.cos(mm) * i), 1, 1, '#c0392b'); R(g, 300, 22, 1, 1, '#1a1410');
    if (S.meetingTopic) { R(g, 326, 13, 68, 26, '#162c44'); text(g, 'REUNION', 329, 15, PAL.amber); if ((t * 2 | 0) % 2) R(g, 388, 15, 3, 3, PAL.red); const words = S.meetingTopic.split(' '); let line = '', ly = 22; for (const wd of words) { if (line && textW(line + ' ' + wd) > 62) { text(g, line, 329, ly, '#e9f2fb'); line = wd; ly += 6; if (ly > 34) break; } else line = (line ? line + ' ' : '') + wd; } if (ly <= 34) text(g, line, 329, ly, '#e9f2fb'); }
    else { text(g, 'SALA LIBRE', 341, 17, '#3f5a78'); for (let i = 0; i < 9; i++) R(g, 330 + i * 7, 37 - ((i * 5 + (t | 0)) % 6), 5, (i * 5 + (t | 0)) % 6 + 1, '#1f3550'); }
    coffeeMachine(g, 26, 44, t);
  }

  function frame(tms) {
    if (!alive) return; raf = requestAnimationFrame(frame);
    const dt = Math.min(.05, (tms - last) / 1000); last = tms; now += dt;
    for (let i = timers.length - 1; i >= 0; i--) if (timers[i].at <= now) timers.splice(i, 1)[0].r();
    const hour = S.hour ?? (d => d.getHours() + d.getMinutes() / 60)(new Date());
    const night = hour < 7 || hour >= 22;
    // jugador
    const me = by('cesar'); let kx = (keys.has('d') || keys.has('arrowright') ? 1 : 0) - (keys.has('a') || keys.has('arrowleft') ? 1 : 0), ky = (keys.has('s') || keys.has('arrowdown') ? 1 : 0) - (keys.has('w') || keys.has('arrowup') ? 1 : 0);
    if (kx || ky) {
      if (!me.manual) { claim(me); me.manual = true; me.seated = false; me.oy = 0; me.path = []; }
      me.idleAt = now + 25; me.pose = 'walk'; me.dir = kx > 0 ? 'right' : kx < 0 ? 'left' : ky > 0 ? 'down' : 'up';
      const nx = me.x + kx * 52 * dt, ny = me.y + ky * 52 * dt, free = (x, y) => { const tx = x / T | 0, ty = (y - 4) / T | 0; return grid[ty] && !grid[ty][tx]; };
      if (free(nx, me.y)) me.x = nx; if (free(me.x, ny)) me.y = ny;
    } else if (me.manual) { me.pose = 'stand'; if (now > me.idleAt) { me.manual = false; me.x = Math.round((me.x - 8) / T) * T + 8; me.y = Math.round((me.y - 14) / T) * T + 14; const tok = me.token; goHome(me, tok).then(() => release(me)); } }
    // movimiento y vida
    for (const a of A) {
      if (a.path.length) {
        const [tx, ty] = px(...a.path[0]), dx = tx - a.x, dy = ty - a.y, d = Math.hypot(dx, dy), sp = (a.fast ? 56 : S.mood === 'panic' ? 48 : 36) * dt;
        a.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'); a.pose = 'walk';
        if (d <= sp) { a.x = tx; a.y = ty; a.path.shift(); if (!a.path.length) a.arrive?.(true); } else { a.x += dx / d * sp; a.y += dy / d * sp; }
      }
      if (a.id !== 'cesar' && !a.busy && a.seated) {
        if (night && !queue.length) a.pose = 'sleep'; else if (a.pose === 'sleep') a.pose = 'type';
        if (!night && now > a.next) idle(a);
      }
      a.sweat = S.mood === 'panic' && a.pose !== 'sleep' && a.id !== 'cesar';
    }
    // --- pintar ---
    g.setTransform(PXS, 0, 0, PXS, 0, 0); g.imageSmoothingEnabled = false; g.drawImage(bg, 0, 0); drawWall(now, hour);
    const D = [];
    D.push({ y: 62, f: () => tank(g, 6 * T + 1, 46, S.tokensLeft, now) }, { y: 64, f: () => sofa(g, 8 * T, 50) });
    for (const s of STAFF) {
      const [sx, sy] = s.seat, a = by(s.id), away = !a.seated || a.tx !== sx || a.ty !== sy, dx = (sx - 1) * T, dy = (sy - 1) * T + 2;
      let m = a.screen || s.screens; if (away) m = ['off', 'off']; if (a.pose === 'sleep') m = ['off', 'off'];
      if (s.id === 'operator' && !a.screen && !away) m = [S.monthPnl >= 0 ? 'up' : 'down', 'table'];
      D.push({ y: dy + 12, f: () => desk(g, dx, dy, { m1: m[0], m2: m[1], t: now, seed: sx + sy, color: s.color }) });
      D.push({ y: sy * T + 14.5, f: () => chair(g, sx * T + 8, sy * T + 15, true, s.id === 'cesar' ? '#6b3b28' : PAL.navy) });
    }
    D.push({ y: 6 * T + 14, f: () => { const x = 21 * T - 2, y = 5 * T + 2; R(g, x + 2, y + 30, 48, 3, 'rgba(0,0,0,.2)'); R(g, x, y, 52, 26, PAL.woodLight); R(g, x, y, 52, 1, '#cf965c'); R(g, x, y + 26, 52, 4, PAL.woodDark); R(g, x + 20, y + 9, 12, 7, '#2a2f37'); R(g, x + 5, y + 5, 8, 10, '#f2efe6'); R(g, x + 38, y + 12, 8, 10, '#f2efe6'); R(g, x + 16, y + 19, 4, 4, '#f5f5f0'); } });
    for (const id in MEET) { const [mx, my, d, oy] = MEET[id]; if (id === 'cesar') continue; const cx = mx * T + 8, fy = my * T + 15 + oy; D.push({ y: d === 'up' ? fy + .5 : fy - 9, f: () => chair(g, cx, fy, d === 'up') }); }
    D.push({ y: 9 * T + 6, f: () => { const x = 19 * T + 6, w = VW - 3 - x, y = 9 * T - 12; R(g, x, y, w, 16, PAL.glass); R(g, x, y, w, 1, PAL.glassEdge); R(g, x, y + 16, w, 3, PAL.trimDark); for (let i = x + 30; i < x + w; i += 34) R(g, i, y, 1, 16, 'rgba(225,245,255,.5)'); } });
    D.push({ y: 13 * T + 14, f: () => whiteboard(g, 14 * T, 13 * T - 20, 'ESTRATEGIA', [S.strategy.name, ...(S.strategy.lines || [])]) });
    for (const [x, y, big] of [[18, 3, 1], [24, 13, 1], [20, 3, 0], [24, 3, 0]]) D.push({ y: y * T + 14, f: () => plant(g, x * T + 8, y * T + 14, now, !!big) });
    if (up.has('arcade')) D.push({ y: 13 * T + 15, f: () => arcade(g, 4 * T + 1, 13 * T - 2, now) });
    if (up.has('aquarium')) D.push({ y: 13 * T + 15, f: () => aquarium(g, 9 * T + 1, 13 * T - 2, now) });
    for (const a of A) D.push({ y: a.y + (a.seated && a.dir === 'up' ? 0 : .2), f: () => { drawChar(g, a.x, a.y + a.oy, a.look, { dir: a.dir, pose: a.pose, seated: a.seated, t: now + a.tx * .37, sweat: a.sweat }); } });
    D.sort((p, q) => p.y - q.y).forEach(d => d.f());
    // etiquetas
    for (const a of A) { if (a.seated && (a.tx !== a.seat[0] || a.ty !== a.seat[1])) continue; const w = textW(a.name) + 4, x = (a.x - w / 2) | 0, y = (a.y + a.oy + 3) | 0; R(g, x, y, w, 7, 'rgba(12,18,26,.78)'); R(g, x, y + 6, w, 1, a.color); text(g, a.name, x + 2, y + 1, '#f3f6fa'); }
    // luz
    const dark = night ? .42 : hour < 8 || hour > 20 ? .18 : 0;
    if (dark) { g.fillStyle = `rgba(10,16,40,${dark})`; g.fillRect(0, 0, VW, VH); g.globalCompositeOperation = 'lighter'; for (const s of STAFF) { const a = by(s.id); if (a.seated && a.pose !== 'sleep' && a.tx === s.seat[0]) { const gr = g.createRadialGradient(s.seat[0] * T + 8, s.seat[1] * T - 8, 2, s.seat[0] * T + 8, s.seat[1] * T - 8, 34); gr.addColorStop(0, 'rgba(120,170,230,.30)'); gr.addColorStop(1, 'rgba(120,170,230,0)'); g.fillStyle = gr; g.fillRect(s.seat[0] * T - 30, s.seat[1] * T - 44, 76, 72); } } g.globalCompositeOperation = 'source-over'; }
    if (S.mood === 'panic' && (now * 1.5 | 0) % 2) { g.fillStyle = 'rgba(240,60,50,.05)'; g.fillRect(0, 0, VW, VH); }
    // partículas
    for (let i = parts.length - 1; i >= 0; i--) { const p = parts[i]; p.life -= dt; p.y += p.vy * dt; if (p.life <= 0) { parts.splice(i, 1); continue; } const w = textW(p.str) + 4; R(g, p.x - w / 2, p.y - 1, w, 7, 'rgba(12,18,26,.8)'); text(g, p.str, p.x - w / 2 + 2, p.y, p.c); }
    // bocadillos DOM
    const k = cv.clientWidth / VW;
    for (const a of A) if (a.bubble) {
      const bb = a.bubble; if (now > bb.until) { bb.el.remove(); a.bubble = null; continue; }
      const n = Math.min(bb.str.length, ((now - bb.start) * 38) | 0); if (n !== bb.shown) { bb.shown = n; bb.el.lastChild.textContent = bb.str.slice(0, n); }
      bb.el.style.left = Math.max(70, Math.min(cv.clientWidth - 70, a.x * k)) + 'px'; bb.el.style.top = ((a.y + a.oy - 32) * k) + 'px';
    }
  }
  const kd = e => { const k = e.key.toLowerCase(); if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) { keys.add(k); e.preventDefault(); } }, ku = e => keys.delete(e.key.toLowerCase());
  cv.addEventListener('keydown', kd); cv.addEventListener('keyup', ku); cv.addEventListener('blur', () => keys.clear());
  cv.addEventListener('click', e => { const r = cv.getBoundingClientRect(), k = VW / r.width, x = (e.clientX - r.left) * k, y = (e.clientY - r.top) * k; let best = null, bd = 18; for (const a of A) { const d = Math.hypot(a.x - x, a.y - 13 - y); if (d < bd) { bd = d; best = a; } } if (best) opts.onSelect?.(best.id); cv.focus(); });
  raf = requestAnimationFrame(frame);
  return {
    toast,
    setState(s) { Object.assign(S, s); if (s.upgrades) { up = new Set(S.upgrades); grid = buildGrid(up); } },
    play, staff: STAFF,
    agentState: id => { const a = by(id); return a && { pose: a.pose, busy: a.busy, seated: a.seated }; },
    destroy() { alive = false; cancelAnimationFrame(raf); root.innerHTML = ''; }
  };
}
