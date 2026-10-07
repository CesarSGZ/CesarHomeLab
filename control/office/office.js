// Agent Office · simulación visual. Recibe el estado real (setState) y los eventos
// reales del motor (play) y los convierte en coreografía. Además deja a César pasearse
// e interactuar, y dirige bromas y vida de oficina que salen del estado real (gags.js).
// No llama a ningún modelo.
import { T, R, PAL, COLS, ROWS, VW, VH, LOOKS, text, textW, drawChar, cat as drawCat, roomba, prompt } from './art.js';
import * as G from './gags.js';
import { trading, STAFF, TEAM, MEET, SPOT, VIS } from './rooms/trading.js';
import { agency } from './rooms/agency.js';

export { STAFF };
export const PXS = 4, ROOMS = { trading, agency };
const pick = a => a[Math.random() * a.length | 0];

function buildGrids(up) {
  const out = {};
  for (const room of Object.values(ROOMS)) {
    const b = Array.from({ length: ROWS }, () => new Uint8Array(COLS));
    const blk = (x0, y0, x1 = x0, y1 = y0) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (b[y]) b[y][x] = 1; };
    blk(0, 0, COLS - 1, 2); blk(0, ROWS - 1, COLS - 1, ROWS - 1); blk(0, 0, 0, ROWS - 1); blk(COLS - 1, 0, COLS - 1, ROWS - 1);
    room.blocks(blk, up); b[room.door.at[1]][room.door.at[0]] = 0; out[room.id] = b;
  }
  return out;
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
  root.innerHTML = '<div class="ao-scroll"><div class="ao-world"><canvas class="ao-canvas" width="' + VW + '" height="' + VH + '" tabindex="0" aria-label="Oficina de agentes. Flechas o WASD mueven a César, E interactúa, H muestra la ayuda."></canvas><div class="ao-bubbles"></div></div></div><div class="ao-rooms" role="tablist" aria-label="Salas">' + Object.values(ROOMS).map(r => '<button type="button" role="tab" data-room="' + r.id + '">' + r.name + '</button>').join('') + '</div><div class="ao-toast" hidden></div>'
    + '<button type="button" class="ao-act" hidden></button><button type="button" class="ao-help-btn" aria-label="Ayuda y teclas" title="Teclas (H)">?</button><div class="ao-menu" role="dialog" aria-label="Mesa de César" hidden></div><div class="ao-help" role="dialog" aria-label="Teclas" hidden></div>';
  const cv = root.querySelector('canvas'), g = cv.getContext('2d'), bubbles = root.querySelector('.ao-bubbles'), toastEl = root.querySelector('.ao-toast'), tabsEl = root.querySelector('.ao-rooms'), actBtn = root.querySelector('.ao-act'), scroller = root.querySelector('.ao-scroll'), menuEl = root.querySelector('.ao-menu'), helpEl = root.querySelector('.ao-help');
  cv.width = VW * PXS; cv.height = VH * PXS;
  let S = { equity: 10000, monthPnl: 0, dayPnl: 0, rentTarget: 10000, daysLeft: 25, tokensLeft: .88, tokensEur: 8.82, marketOpen: false, positions: [], strategy: { name: 'Catalizadores', lines: ['EVENTOS CERCANOS', 'STOP CORTO'] }, mood: 'tense', hour: null, upgrades: [], agents: {}, life: {}, policy: {}, catalog: {}, meetingTopic: null };
  let up = new Set(S.upgrades), grids = buildGrids(up), view = 'trading', now = 0, raf = 0, alive = true, last = performance.now(), primed = false;
  const timers = [], parts = [], keys = new Set(), gifts = new Map(), seenGags = new Map();
  const sleep = ms => new Promise(r => timers.push({ at: now + ms / 1000, r }));
  const px = (tx, ty) => [tx * T + 8, ty * T + 14], tileOf = e => [Math.round((e.x - 8) / T), Math.round((e.y - 14) / T)];
  const fx = { dimUntil: 0, webUntil: 0, bellUntil: 0, dart: null, feedUntil: 0 };
  let nextGag = 18, lastGreet = 0, near = null, arc = null, coffees = 0, meetAsked = -999, checkAt = 0, lastLabel = '';

  const A = STAFF.map((d, i) => { const [x, y] = px(...d.seat); return { ...d, look: LOOKS[d.id], x, y, tx: d.seat[0], ty: d.seat[1], dir: 'up', pose: 'type', path: [], arrive: null, token: 0, busy: false, real: false, bubble: null, sweat: false, seated: true, oy: 0, room: 'trading', home: 'trading', next: 6 + i * 5 + Math.random() * 10, screen: null, talkI: 0, greetAt: 0, peekAt: 0, caf: 0 }; });
  const by = id => A.find(a => a.id === id), me = by('cesar');
  const atDesk = a => a.room === a.home && a.seated && a.tx === a.seat[0] && a.ty === a.seat[1] && !a.path.length;
  const freeTeam = () => A.filter(a => a !== me && !a.busy && atDesk(a) && a.pose !== 'sleep');
  const ag = id => S.agents?.[id] || {};
  const onSofa = a => a.seated && !a.path.length && a.ty === 3 && a.tx >= 8 && a.tx <= 10;

  function setView(room) { if (!ROOMS[room]) return; view = room; for (const b of tabsEl.children) b.setAttribute('aria-selected', b.dataset.room === room); for (const a of A) if (a.bubble) a.bubble.el.hidden = a.room !== room; opts.onRoom?.(room); }
  tabsEl.addEventListener('click', e => { const b = e.target.closest('[data-room]'); if (b) { setView(b.dataset.room); cv.focus({ preventScroll: true }); } });
  // ---- acciones de agente (promesas resueltas por el bucle) ----
  // Cambio de sala: se camina hasta la puerta, se aparece al otro lado y se sigue.
  async function goto(a, tx, ty, o = {}) {
    const room = o.room || (a === me ? a.room : a.home);
    if (room !== a.room) { const d = ROOMS[a.room].door, tok = a.token; if (!await step(a, d.at[0], d.at[1], { fast: o.fast }) || tok !== a.token) return false; enter(a, d.to); }
    return step(a, tx, ty, o);
  }
  function enter(a, room) { const from = ROOMS[a.room].door; a.room = room; [a.x, a.y] = px(...from.arrive); a.tx = from.arrive[0]; a.ty = from.arrive[1]; if (a.bubble) { a.bubble.el.remove(); a.bubble = null; } if (a === me) setView(room); }
  function step(a, tx, ty, o = {}) {
    return new Promise(res => {
      if (a.arrive) a.arrive(false);
      const [sx, sy] = tileOf(a), p = findPath(grids[a.room], sx, sy, tx, ty);
      if (!p) { res(false); return; }
      a.path = p; a.seated = false; a.oy = 0; a.pose = 'walk'; a.fast = !!o.fast;
      a.arrive = ok => { a.arrive = null; if (ok) { a.tx = tx; a.ty = ty; a.pose = 'stand'; if (o.dir) a.dir = o.dir; } res(ok); };
      if (!p.length) a.arrive(true);
    });
  }
  async function goHome(a, tok) {
    const ok = await goto(a, ...a.seat, { room: a.home }); if (!ok || tok !== a.token) return false;
    a.seated = true; a.dir = 'up'; a.pose = 'type'; return true;
  }
  function say(a, str, ms) {
    const dur = ms ?? Math.min(7000, 1600 + str.length * 55);
    if (a.bubble) a.bubble.el.remove();
    const el = document.createElement('div'); el.className = 'ao-bubble'; el.style.setProperty('--c', a.color); el.innerHTML = '<b></b><span></span>'; el.firstChild.textContent = a.name; el.hidden = a.room !== view; bubbles.appendChild(el);
    a.bubble = { el, str, shown: 0, start: now, until: now + dur / 1000 };
    return sleep(dur);
  }
  function emote(a, ch, c = PAL.amber) { parts.push({ x: a.x, y: a.y - 30, vy: -9, life: 1.6, str: ch, c, room: a.room }); }
  const float = (x, y, str, c = PAL.amber, life = 2, room = 'trading') => parts.push({ x, y, vy: -10, life, str, c, room });
  function confetti(x, y, n = 26) { for (let i = 0; i < n; i++) parts.push({ kind: 'dot', x: x + (Math.random() - .5) * 30, y, vx: (Math.random() - .5) * 60, vy: -30 - Math.random() * 50, life: 1.6 + Math.random(), c: pick([PAL.amber, PAL.green, PAL.red, PAL.blue, PAL.lilac, '#fff']) }); }
  function toast(str, kind = 'info') { toastEl.textContent = str; toastEl.dataset.kind = kind; toastEl.hidden = false; clearTimeout(toast.h); toast.h = setTimeout(() => toastEl.hidden = true, 5200); }
  const claim = a => { a.token++; a.busy = true; if (a.arrive) a.arrive(false); a.path = []; return a.token; };
  const release = a => { a.busy = false; a.next = now + (ag(a.id).idle ? 7 : 16) + Math.random() * 26; };
  const moodKey = () => S.mood === 'joy' ? 'joy' : S.mood === 'panic' ? 'panic' : S.mood === 'tense' ? 'tense' : 'calm';
  const face = (a, b) => { const dx = b.x - a.x, dy = b.y - a.y; a.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'); };
  const rest = a => { if (atDesk(a)) { a.pose = 'type'; a.dir = 'up'; } else if (!a.seated) a.pose = 'stand'; };
  // Comentario corto sin moverse del sitio; no interrumpe escenas reales.
  async function aside(a, str, o = {}) {
    if (!a || a === me || a.real || (a.busy && !o.force)) return false;
    const tok = claim(a); if (o.to) face(a, o.to); else if (a.seated) a.dir = 'down';
    a.pose = o.pose || 'talk'; await say(a, str, o.ms);
    if (tok !== a.token) return true; if (atDesk(a)) { rest(a); release(a); } else if (a.seated) release(a); else { await goHome(a, tok); if (tok === a.token) release(a); }
    return true;
  }

  // ---- escenas derivadas de eventos reales ----
  const queue = []; let running = 0;
  const SCENES = {
    async research(e) {
      const a = by(e.agent || 'scout'), tok = claim(a); await goHome(a, tok); a.screen = ['scan', 'scan'];
      await say(a, e.text || ('Mirando ' + e.symbol + '…')); await sleep(1800); a.screen = null; release(a);
    },
    async say(e) { const a = by(e.agent); if (!a) return; const tok = claim(a); if (a.seated) a.dir = 'down'; a.pose = 'talk'; await say(a, e.text); if (tok !== a.token) return; if (atDesk(a)) rest(a); else await goHome(a, tok); if (tok === a.token) release(a); },
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
      const who = (e.participants || TEAM).map(by).filter(Boolean), toks = who.map(claim);
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
        if (e.pnl > 0) {
          if (up.has('campana')) { fx.bellUntil = now + 1.6; float(16 * T + 8, 9 * T, '¡DING!', PAL.amber); } confetti(a.x, a.y - 30, 14);
          const all = A.filter(x => !x.busy && x.id !== 'cesar'); a.pose = 'cheer'; a.dir = 'down'; all.forEach(x => { x.pose = 'cheer'; x.dir = 'down'; x.busy = true; x.token++; }); await sleep(1900); all.forEach(x => { if (x.seated) { x.pose = 'type'; x.dir = 'up'; } else x.pose = 'stand'; release(x); });
        }
        else { a.pose = 'panic'; a.dir = 'down'; await sleep(1700); const r = by('risk'); if (!r.busy) { const tr = claim(r); r.pose = 'sit'; r.dir = 'down'; await say(r, pick(['Estaba dentro del riesgo previsto.', 'Te dije que ese stop era justo.', 'Anotado. Revisamos tamaño.'])); if (tr === r.token) { r.pose = 'type'; r.dir = 'up'; } release(r); } }
      } else emote(a, '$', PAL.green);
      if (tok === a.token) { a.pose = 'type'; a.dir = 'up'; } a.screen = null; release(a);
    },
    async strategy(e) {
      const a = by(e.agent || 'auditor'), tok = claim(a); await goto(a, ...SPOT.strategy.slice(0, 2), { dir: 'left' }); a.pose = 'talk';
      S.strategy = { name: e.name, lines: e.lines || [] }; parts.push({ x: 16 * T, y: 11 * T + 6, vy: -8, life: 2, str: 'NUEVA', c: PAL.amber });
      await say(a, e.text || ('Cambiamos a: ' + e.name)); toast('Nueva estrategia: ' + e.name, 'ok'); await goHome(a, tok); release(a);
    },
    async upgrade(e) {
      addUpgrade(e.item); toast('Nuevo en la oficina: ' + (e.label || e.item), 'ok'); confetti(VW / 2, 5 * T, 18); await sleep(900);
      const line = { gato: ['scout', '¡Un gato! Se llama Dividendo.'], campana: ['operator', 'Esa campana la toco yo. Solo yo.'], dardos: ['analyst', 'Por fin una forma seria de elegir acciones.'], arcade: ['operator', 'El récord va a ser mío en una hora.'], aquarium: ['risk', 'Peces. Algo en esta oficina que no pierde dinero.'], neon: ['designer', '¿Eso cuánta luz gasta?'], cafetera: ['analyst', 'Café de verdad. Sube mi productividad un 4 %. Estimado.'], plantas: ['auditor', 'Más verde. Así parece que nos va bien.'] }[e.item];
      if (line) await aside(by(line[0]), line[1]);
    },
    async bell(e) {
      toast(e.open ? 'Abre Nueva York' : 'Cierra Nueva York', 'meeting'); float(27, 12, e.open ? '¡DING DING!' : 'CIERRE', e.open ? PAL.green : PAL.red, 2.6);
      const who = freeTeam(); who.forEach(a => { a.token++; a.busy = true; a.pose = 'sit'; a.dir = 'down'; }); await sleep(500);
      const y = by('operator'); if (who.includes(y)) { y.pose = e.open ? 'cheer' : 'sit'; await say(y, e.open ? (S.positions.length ? '¡Abre! A ver qué hacen las nuestras.' : '¡Abre! Y nosotros sin nada en cartera.') : (S.dayPnl >= 0 ? 'Cierre. Hoy no nos han hecho daño.' : 'Cierre. Mañana será otro día.')); } else await sleep(1200);
      who.forEach(a => { rest(a); release(a); });
    },
    async bossAway() {
      const plan = G.bossAway(S), tokMe = claim(me); closeMenu(); leaveAct(); me.manual = true; me.lock = true;
      await goto(me, 7, 13, { dir: 'down' }); if (tokMe !== me.token) { me.lock = false; return; }
      me.away = true; toast('César sale a tomar el aire…'); await sleep(900);
      const who = freeTeam(), toks = who.map(claim), mine = id => who.includes(by(id));
      for (const l of plan.lines) if (mine(l.who)) { const a = by(l.who); a.pose = 'sit'; a.dir = 'down'; await say(a, l.text, 1900); }
      if (plan.party) {
        const spots = [SPOT.sofaA, SPOT.sofaB, up.has('arcade') ? SPOT.arcade : SPOT.coffee, SPOT.window, up.has('dardos') ? SPOT.darts : SPOT.tank, SPOT.coffee];
        who.forEach((a, i) => { const sp = spots[i % spots.length]; goto(a, sp[0], sp[1], { dir: sp[2], fast: true }).then(ok => { if (!ok || a.token !== toks[i]) return; if (sp === SPOT.sofaA || sp === SPOT.sofaB) { a.seated = true; a.pose = 'sit'; } else a.pose = i % 2 ? 'cheer' : 'drink'; }); });
        for (let i = 0; i < 5; i++) { await sleep(1100); const a = pick(who); if (a) float(a.x, a.y - 34, pick(['~', 'JA', 'JE', '~~']), PAL.lilac, 1.4); }
      } else { who.forEach(a => { a.pose = 'type'; a.dir = 'up'; a.sweatOn = now + 6; }); await sleep(4200); }
      me.away = false; me.x = px(7, 13)[0]; me.y = px(7, 13)[1]; me.dir = 'up'; me.pose = 'stand'; toast('César vuelve.');
      for (const l of plan.back) if (mine(l.who)) { const a = by(l.who); if (plan.party) a.pose = 'panic'; say(a, l.text, 1700); break; }
      await Promise.all(who.map(async (a, i) => { if (a.token !== toks[i]) return; await goto(a, ...a.seat, { fast: true }); if (a.token !== toks[i]) return; a.seated = true; a.dir = 'up'; a.pose = 'type'; a.frantic = now + 5; release(a); }));
      const back = plan.back[1]; if (back && mine(back.who)) await aside(by(back.who), back.text);
      me.lock = false; me.idleAt = now + 25;
    }
  };
  async function pump() {
    while (queue.length && running < 2) {
      const i = queue.findIndex(e => !(e._who || []).some(id => by(id)?.real)); if (i < 0) break;
      const e = queue.splice(i, 1)[0], who = (e._who || []).map(by).filter(Boolean); running++; who.forEach(a => a.real = true);
      Promise.resolve(SCENES[e.type]?.(e)).catch(err => console.warn('office scene', err)).finally(() => { who.forEach(a => a.real = false); running--; pump(); });
    }
  }
  function play(e) {
    e._who = e.type === 'meeting' ? (e.participants || TEAM) : [e.agent, e.from, e.to].filter(id => id && id !== 'cesar');
    if (e.type === 'meeting') queue.unshift(e); else queue.push(e); if (queue.length > 12) queue.splice(4, 1); pump();
  }
  function addUpgrade(item) { if (up.has(item)) return; S.upgrades = [...new Set([...S.upgrades, item])]; up = new Set(S.upgrades); grids = buildGrids(up); if (item === 'gato') kitty.x = 0; }

  // ---- vida de oficina (local, en función del estado real) ----
  async function idle(a) {
    const tok = claim(a), mood = moodKey(), ok = () => tok === a.token;
    const opt = ['coffee', 'coffee', 'chat', 'chat', 'board', 'tank', 'stretch', 'window'];
    if (mood === 'calm' || mood === 'joy') opt.push('sofa'); if (up.has('arcade') && mood !== 'panic') opt.push('arcade'); if (mood === 'panic') opt.push('board', 'tank', 'chat');
    if (up.has('dardos') && mood !== 'panic') opt.push('darts'); if (up.has('aquarium')) opt.push('aquarium'); if (up.has('cafetera')) opt.push('coffee');
    if (ag(a.id).idle) opt.push('solitaire', 'solitaire', 'visit', 'visit'); else if (!S.marketOpen) opt.push('visit');
    const what = pick(opt);
    try {
      if (what === 'stretch') { a.pose = 'cheer'; a.dir = 'down'; await sleep(900); }
      else if (what === 'visit') {
        const sp = pick(agency.spots); if (!await goto(a, sp[0], sp[1], { room: 'agency', dir: sp[2] }) || !ok()) return;
        await sleep(900); a.pose = 'talk'; await say(a, pick(agency.visitLines)); if (!ok()) return; a.pose = 'stand'; await sleep(1500 + Math.random() * 2500);
      }
      else if (what === 'solitaire') { a.screen = ['game', 'game']; await sleep(7000 + Math.random() * 5000); if (ok()) a.screen = null; }
      else if (what === 'chat') {
        const b = pick(A.filter(x => x !== a && !x.busy && atDesk(x) && x.id !== 'cesar')); if (!b) return;
        const tb = claim(b), [l1, l2] = G.recentPair(a.id, b.id, S) || G.smalltalk(a.id, b.id, S); await goto(a, b.seat[0] + VIS, b.seat[1], { dir: 'left' }); if (!ok()) { if (tb === b.token) { rest(b); release(b); } return; }
        if (tb === b.token) { b.pose = 'sit'; b.dir = 'right'; } a.pose = 'talk'; await say(a, l1); if (ok()) a.pose = 'stand'; if (tb === b.token) { b.pose = 'talk'; await say(b, l2); }
        if (tb === b.token) { b.pose = 'type'; b.dir = 'up'; release(b); }
      } else {
        const sp = SPOT[what === 'sofa' ? (Math.random() < .5 ? 'sofaA' : 'sofaB') : what]; if (!await goto(a, sp[0], sp[1], { dir: sp[2] }) || !ok()) return;
        if (what === 'coffee') { fx.pourUntil = now + 1.4; await sleep(1300); a.dir = 'down'; a.pose = 'drink'; await sleep((up.has('cafetera') ? 2200 : 3400) + Math.random() * 2000); a.caf = now + (up.has('cafetera') ? 45 : 30); float(a.x, a.y - 34, '¡CAFEINA!', PAL.amber, 1.2); }
        else if (what === 'sofa') { a.seated = true; a.pose = 'sit'; a.oy = 0; await sleep(6000 + Math.random() * 4000); }
        else if (what === 'board') { await sleep(1200); emote(a, mood === 'panic' ? '!' : mood === 'joy' ? '+' : '?', mood === 'panic' ? PAL.red : PAL.amber); await sleep(1500); }
        else if (what === 'tank') { await sleep(1000); if (S.tokensLeft < .3) { a.pose = 'panic'; await say(a, 'Casi no quedan tokens…', 2200); } else await sleep(1200); }
        else if (what === 'darts') { await sleep(700); throwDart(a); await sleep(1500); }
        else if (what === 'aquarium') { fx.feedUntil = now + 4; await sleep(3000); }
        else await sleep(2500 + Math.random() * 2500);
      }
    } finally { if (ok()) { await goHome(a, tok); if (ok()) release(a); } }
  }
  function throwDart(a) { fx.dart = [3 + Math.random() * 7 | 0, 3 + Math.random() * 7 | 0]; parts.push({ kind: 'plane', x: a.x, y: a.y - 22, tx: 314, ty: 20, t0: now, dur: .35, c: PAL.amber, dart: true }); }
  function spotFor(to, a) {
    if (to[0] === '@') { const b = by(to.slice(1)); return b && atDesk(b) ? [b.seat[0] + VIS, b.seat[1], 'left'] : null; }
    if (to === 'home') return [...a.seat, 'up'];
    if ((to === 'arcade' && !up.has('arcade')) || (to === 'darts' && !up.has('dardos')) || (to === 'aquarium' && !up.has('aquarium')) || (to === 'bell' && !up.has('campana'))) return SPOT.coffee;
    return SPOT[to] || null;
  }
  function doFx(name, a) {
    if (name === 'cobweb') fx.webUntil = now + 5;
    else if (name === 'lights') fx.dimUntil = now + 6;
    else if (name === 'measure') float(6 * T + 8, 28, Math.round(S.tokensLeft * 100) + '%', S.tokensLeft < .25 ? PAL.red : PAL.blue, 2.4);
    else if (name === 'confetti') confetti(a.x, a.y - 30, 30);
    else if (name === 'dart') throwDart(a);
    else if (name === 'ding') { fx.bellUntil = now + 1.4; float(16 * T + 8, 9 * T, '¡DING!'); }
    else if (name.startsWith('plane:')) { const b = by(name.slice(6)); if (b) parts.push({ kind: 'plane', x: a.x, y: a.y - 24, tx: b.x, ty: b.y - 26, t0: now, dur: 1.1, c: '#f6f4ec' }); }
  }
  // Gag dirigido: varios empleados, frases con datos reales. Una escena real lo interrumpe.
  async function runGag(gag) {
    seenGags.set(gag.id, now); const who = [...new Set(gag.steps.map(s => s.who))].map(by), toks = who.map(claim), ok = () => who.every((a, i) => a.token === toks[i]);
    try {
      for (const st of gag.steps) {
        if (!ok()) break; const a = by(st.who);
        if (st.to) { const sp = spotFor(st.to, a); if (sp) { await goto(a, sp[0], sp[1], { dir: sp[2] }); if (!ok()) break; if (st.to[0] === '@') { const b = by(st.to.slice(1)); if (b && atDesk(b) && who.includes(b)) { b.pose = 'sit'; b.dir = 'right'; } } } }
        if (st.fx) doFx(st.fx, a);
        const visitor = who.some(x => x !== a && !x.seated && x.tx === a.seat[0] + VIS && x.ty === a.seat[1]);
        if (a.seated) a.dir = visitor ? 'right' : 'down'; a.pose = st.pose && st.pose !== 'sit' ? st.pose : 'talk';
        if (st.say) await say(a, st.say); else await sleep(st.wait || 900);
        if (!ok()) break; if (atDesk(a)) { a.pose = 'sit'; } else if (!a.seated) a.pose = 'stand';
      }
    } finally { await Promise.all(who.map(async (a, i) => { if (a.token !== toks[i]) return; if (!atDesk(a)) await goHome(a, toks[i]); else rest(a); if (a.token === toks[i]) release(a); })); }
  }

  // ---- el gato y el robot aspirador ----
  const kitty = { x: 0, y: 0, path: [], st: 'sit', dir: 'left', next: 0, onSofa: false };
  const robot = { x: 3 * T, dir: 1 };
  function catStep(dt) {
    if (!up.has('gato')) return;
    if (!kitty.x) { [kitty.x, kitty.y] = px(15, 6); kitty.next = now + 3; }
    if (kitty.path.length) {
      const [tx, ty] = px(...kitty.path[0]), dx = tx - kitty.x, dy = ty - kitty.y, d = Math.hypot(dx, dy), sp = 30 * dt; kitty.st = 'walk'; if (Math.abs(dx) > .5) kitty.dir = dx > 0 ? 'right' : 'left';
      if (d <= sp) { kitty.x = tx; kitty.y = ty; kitty.path.shift(); if (!kitty.path.length) { kitty.st = 'sit'; kitty.then?.(); kitty.then = null; } } else { kitty.x += dx / d * sp; kitty.y += dy / d * sp; }
      return;
    }
    if (now < kitty.next) return;
    if (kitty.onSofa) { kitty.onSofa = false; [kitty.x, kitty.y] = px(9, 4); }
    const r = Math.random(), [cx, cy] = tileOf(kitty), go = (tx, ty, then) => { const p = findPath(grids.trading, cx, cy, tx, ty); if (p && p.length) { kitty.path = p; kitty.then = then; } };
    if (r < .3) go(9, 4, () => { kitty.onSofa = true; kitty.x = 9 * T + 8; kitty.y = 61; kitty.st = 'sleep'; kitty.next = now + 25 + Math.random() * 30; });
    else if (r < .55) { const a = pick(A.filter(x => x !== me && atDesk(x) && !x.busy && x.pose !== 'sleep')); if (a) go(a.seat[0] - 1, a.seat[1], () => { kitty.dir = 'right'; kitty.next = now + 9; a.screen = ['cat', 'cat']; setTimeout(() => { if (a.screen?.[0] === 'cat') a.screen = null; }, 5000); aside(a, pick(['¡Quita, que me escribes en el plan!', 'El gato ha pulsado algo. Espero que no sea «comprar».', 'No, Dividendo. Ahora no.'])); }); }
    else if (r < .7) go(22, 13, () => { kitty.next = now + 14; });
    else { for (let i = 0; i < 12; i++) { const tx = 1 + Math.random() * 17 | 0, ty = 4 + Math.random() * 9 | 0; if (!grids.trading[ty][tx]) { go(tx, ty, () => { kitty.next = now + 5 + Math.random() * 9; }); break; } } }
    kitty.next = Math.max(kitty.next, now + 3);
  }

  // ---- César: cosas que puede usar ----
  const open = tab => opts.onOpen?.(tab);
  const api = { S, me, G, fx, toast, open, float, aside, by, emote, throwDart, play: e => play(e), now: () => now, meetAsked: () => meetAsked, drinkCoffee, sitSofa, useMeeting, openMenu, startArcade, ringBell };
  const THINGS = Object.fromEntries(Object.values(ROOMS).map(r => [r.id, r.things(api)]));
  const things = (room = me.room) => THINGS[room].filter(t => !t.need || up.has(t.need));
  const labelOf = t => typeof t.label === 'function' ? t.label() : t.label;
  function findNear() {
    if (me.away || arc || me.lock || !me.manual) return null; let best = null, bd = 1e9;
    for (const a of A) { if (a === me || a.room !== me.room) continue; const d = Math.hypot(a.x - me.x, a.y - me.y) - 8; if (d < 26 && d < bd) { bd = d; best = { kind: 'agent', a, x: a.x, y: a.y - 40, label: 'Hablar con ' + a.name }; } }
    if (up.has('gato') && kitty.x && me.room === 'trading') { const d = Math.hypot(kitty.x - me.x, kitty.y - me.y); if (d < 16 && d < bd) { bd = d; best = { kind: 'cat', x: kitty.x, y: kitty.y - 22, label: 'Acariciar' }; } }
    for (const t of things()) for (const at of t.at) { const [x, y] = px(...at), d = Math.hypot(x - me.x, y - me.y); if (d < 14 && d < bd) { bd = d; best = { kind: 'thing', t, x: t.hit[0] + t.hit[2] / 2, y: Math.max(3, t.hit[1] - 11), label: labelOf(t) }; } }
    if (me.act === 'sofa') best = { kind: 'thing', t: THINGS.trading.find(t => t.id === 'sofa'), x: me.x, y: 34, label: 'Levantarse' };
    return best;
  }
  function leaveAct() {
    if (me.act === 'sofa') { [me.x, me.y] = px(9, 4); me.tx = 9; me.ty = 4; }
    if (me.act === 'desk') closeMenu(true);
    if (me.act) { me.act = null; me.seated = false; me.oy = 0; me.pose = 'stand'; }
  }
  function interact() {
    if (arc) { arcPress(); return; } if (me.away || me.lock) return;
    if (!me.manual) { claim(me); me.manual = true; me.idleAt = now + 30; openMenu(); return; } // sentado en su mesa: E abre la mesa
    const n = near || findNear(); if (!n) { emote(me, '?'); return; }
    me.idleAt = now + 30;
    if (n.kind === 'agent') talk(n.a); else if (n.kind === 'cat') { for (let i = 0; i < 3; i++) parts.push({ x: kitty.x - 4 + i * 4, y: kitty.y - 14 - i * 2, vy: -8, life: 1.3 + i * .2, str: '+', c: '#ff8fb1' }); kitty.st = 'sit'; kitty.path = []; kitty.next = now + 6; toast(G.objectLine('cat', S)); }
    else { if (n.t.dir && !me.act) me.dir = n.t.dir; n.t.use(); }
  }
  async function talk(a) {
    opts.onSelect?.(a.id);
    if (a.real) { toast(a.name + ' está en plena faena; ahora te atiende.'); emote(a, '…'); return; }
    const asleep = a.pose === 'sleep', lines = G.talkLines(a.id, S), line = lines[a.talkI++ % lines.length], tok = claim(a), desk = atDesk(a);
    face(me, a); me.pose = 'talk'; if (a.seated) { a.pose = 'talk'; a.dir = desk ? (Math.abs(me.x - a.x) > 10 ? (me.x > a.x ? 'right' : 'left') : 'down') : 'down'; } else { face(a, me); a.pose = 'talk'; }
    if (asleep) { a.pose = 'panic'; await say(a, G.reactLine(a.id, S, { asleep: true }), 1500); if (tok !== a.token) return; a.pose = 'talk'; }
    await say(a, line); if (!me.path.length && !me.act) me.pose = 'stand';
    if (tok !== a.token) return; if (desk) { rest(a); release(a); } else if (a.seated) release(a); else { await goHome(a, tok); if (tok === a.token) release(a); }
  }
  async function summon(id) {
    const a = by(id); if (!a || a === me) return; opts.onSelect?.(id);
    if (me.away) return; if (a.real) { toast(a.name + ' está en plena faena; irá en cuanto termine.'); return; }
    if (ag(id).paused) toast(a.name + ' está en pausa, pero viene igualmente.');
    const [cx, cy] = tileOf(me), spot = [[1, 0], [-1, 0], [0, 1], [0, -1], [2, 0], [-2, 0]].map(([dx, dy]) => [cx + dx, cy + dy]).find(([x, y]) => grids[me.room][y] && !grids[me.room][y][x]); if (!spot) return;
    const tok = claim(a); emote(me, '!'); float(me.x, me.y - 42, '¡' + a.name.toUpperCase() + '!', a.color, 1.6);
    if (a.pose === 'sleep') { a.pose = 'panic'; await sleep(600); }
    if (!await goto(a, spot[0], spot[1], { fast: true, room: me.room }) || tok !== a.token) return;
    face(a, me); if (!me.act && !me.path.length) face(me, a); a.pose = 'talk'; await say(a, pick(['¿Me llamabas, jefe?', 'Dime, jefe.', 'Aquí estoy.']), 1400); if (tok !== a.token) return;
    const lines = G.talkLines(id, S); for (let i = 0; i < 2 && tok === a.token; i++) await say(a, lines[a.talkI++ % lines.length]);
    if (tok !== a.token) return; await goHome(a, tok); if (tok === a.token) release(a);
  }
  async function wave() {
    if (me.away || arc || me.lock) return; if (!me.manual) { claim(me); me.manual = true; } me.idleAt = now + 30;
    if (now < (me.waveAt || 0)) return; me.waveAt = now + 6; const keep = me.pose; me.pose = 'cheer'; setTimeout(() => { if (me.pose === 'cheer') me.pose = me.act ? keep : 'stand'; }, 900);
    const n = findNear();
    if (n?.kind === 'agent' && !n.a.real) { float(me.x, me.y - 42, '¡EY!', PAL.amber, 1.2); aside(n.a, G.reactLine(n.a.id, S, { asleep: n.a.pose === 'sleep', hour: hourNow() }), { to: me, force: !n.a.real && n.a.busy && atDesk(n.a) }); return; }
    float(me.x, me.y - 42, '¡VAMOS, EQUIPO!', PAL.amber, 1.8);
    const who = freeTeam(), lines = G.pepTalk(S, who.map(a => a.id)); who.forEach(a => { if (!lines.some(l => l.who === a.id)) { a.dir = 'down'; a.pose = 'sit'; setTimeout(() => { if (!a.busy) rest(a); }, 2500); } });
    for (const l of lines) { await aside(by(l.who), l.text, { ms: 2100 }); }
  }
  async function five() {
    if (me.away || arc || me.lock) return; const n = findNear(); if (n?.kind !== 'agent') { emote(me, '?'); return; }
    const a = n.a; if (a.real) { toast(a.name + ' está en plena faena.'); return; } if (now < (a.fiveAt || 0)) return; a.fiveAt = now + 8;
    if (!me.manual) { claim(me); me.manual = true; } me.idleAt = now + 30; const r = G.highFive(a.id, S);
    if (r.ok) { me.pose = 'cheer'; float((a.x + me.x) / 2, Math.min(a.y, me.y) - 34, '¡CHOCA!', PAL.green, 1.4); setTimeout(() => { if (me.pose === 'cheer') me.pose = 'stand'; }, 900); }
    aside(a, r.text, { to: me, pose: r.ok ? 'cheer' : undefined, ms: 1900, force: a.busy && atDesk(a) });
  }
  async function drinkCoffee() {
    if (me.act) return; me.act = 'drink'; fx.pourUntil = now + 1.4; me.pose = 'drink'; me.dir = 'down'; coffees++; me.caf = now + 30; toast(G.objectLine('coffee', S, coffees));
    if (coffees >= 3) aside(by('risk'), 'Veto ese café, jefe. Llevas ' + coffees + '.');
    await sleep(3200); if (me.act === 'drink') { me.act = null; me.pose = 'stand'; }
  }
  async function sitSofa() {
    if (me.act === 'sofa') { leaveAct(); return; } if (me.act) return;
    me.act = 'sofa'; me.x = 9 * T + 8; me.y = 62; me.tx = 9; me.ty = 3; me.seated = true; me.pose = 'sit'; me.dir = 'down'; toast(G.objectLine('sofa', S)); const mark = ++me.sofaN || (me.sofaN = 1);
    await sleep(3500); if (me.act !== 'sofa' || mark !== me.sofaN) return;
    const a = pick(freeTeam().filter(x => ag(x.id).idle)) || pick(freeTeam()); if (!a) return;
    const tok = claim(a); if (!await goto(a, ...SPOT.sofaA.slice(0, 2), { dir: 'down' }) || tok !== a.token) return;
    if (me.act !== 'sofa') { await goHome(a, tok); if (tok === a.token) release(a); return; }
    a.seated = true; a.pose = 'sit'; a.dir = 'down'; const lines = G.talkLines(a.id, S);
    await say(a, 'Ya que estamos, jefe…', 1400); for (let i = 0; i < 2 && tok === a.token && me.act === 'sofa'; i++) { a.pose = 'talk'; await say(a, lines[a.talkI++ % lines.length]); a.pose = 'sit'; await sleep(900); }
    if (tok !== a.token) return; await goHome(a, tok); if (tok === a.token) release(a);
  }
  function useMeeting() {
    if (me.act !== 'meet') { if (me.act) return; const [mx, my] = px(22, 7); me.x = mx; me.y = my; me.tx = 22; me.ty = 7; me.act = 'meet'; me.seated = true; me.pose = 'sit'; me.dir = 'up'; toast(S.meetingTopic ? 'Te sientas a escuchar la reunión.' : 'Estás en la sala. Pulsa E otra vez para convocar reunión.'); return; }
    if (S.meetingTopic) { toast('Ya hay una reunión en marcha.'); return; }
    if (now - meetAsked < 90) { toast('La reunión ya está pedida: empieza en el próximo ciclo (hasta 5 min).'); return; }
    meetAsked = now; opts.onCommand?.('meeting', { topic: 'Reunión convocada por César desde la sala' }, 'Reunión convocada: empezará en el próximo ciclo.');
    float(22 * T + 8, 4 * T, 'REUNION', PAL.amber, 2.4); aside(by('auditor'), 'Recibido, jefe. Aviso al resto: empezamos en el próximo ciclo.');
  }
  function ringBell() {
    fx.bellUntil = now + 1.4; float(16 * T + 8, 9 * T, '¡DING!'); toast(G.objectLine('bell', S));
    if (S.life?.streak?.kind === 'win') { freeTeam().forEach(a => { a.token++; a.busy = true; a.pose = 'cheer'; a.dir = 'down'; setTimeout(() => { rest(a); release(a); }, 1300); }); }
    else { const r = by('risk'); if (!r.busy && !r.real) aside(r, 'Esa campana es para cuando ganamos, jefe.'); else aside(by('operator'), '¡Eh! Que la campana es mía.'); }
  }

  // ---- menú de la mesa de César y ayuda ----
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function openMenu() {
    if (me.act && me.act !== 'desk') return; helpEl.hidden = true; const [dx, dy] = px(22, 12); me.x = dx; me.y = dy; me.tx = 22; me.ty = 12; me.act = 'desk'; me.seated = true; me.pose = 'type'; me.dir = 'up';
    const left = Object.entries(S.catalog || {}).filter(([k]) => !up.has(k) && !gifts.has(k));
    menuEl.innerHTML = '<h4>Tu mesa</h4><p>Llamar a tu despacho</p><div class="ao-menu-row">' + STAFF.filter(s => s.id !== 'cesar').map((s, i) => '<button type="button" data-summon="' + s.id + '" style="--c:' + s.color + '">' + (i + 1) + ' · ' + esc(s.name) + '</button>').join('') + '</div>'
      + '<p>Regalar algo a la oficina <small>no toca la caja de la empresa</small></p><div class="ao-menu-row">' + (left.length ? left.map(([k, v]) => '<button type="button" data-gift="' + esc(k) + '">' + esc(v.label) + '</button>').join('') : '<span>Ya lo tienen todo.</span>') + '</div>'
      + '<div class="ao-menu-row ao-menu-end"><button type="button" data-meet>Convocar reunión</button><button type="button" data-keys>Teclas</button><button type="button" data-close>Levantarse</button></div>';
    menuEl.hidden = false; menuEl.querySelector('button')?.focus({ preventScroll: true });
  }
  function closeMenu(keepAct) { if (menuEl.hidden) return; menuEl.hidden = true; if (!keepAct && me.act === 'desk') { me.act = null; me.seated = false; me.pose = 'stand'; me.dir = 'down'; [me.x, me.y] = px(22, 13); me.tx = 22; me.ty = 13; } cv.focus({ preventScroll: true }); }
  menuEl.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.summon) { closeMenu(); summon(b.dataset.summon); }
    else if (b.dataset.gift) { const k = b.dataset.gift; gifts.set(k, Date.now()); opts.onCommand?.('gift', { item: k }, 'Regalo enviado: el equipo lo recibirá en el próximo ciclo.'); addUpgrade(k); confetti(VW / 2, 5 * T, 18); toast('Regalas ' + (S.catalog[k]?.label || k) + ' a la oficina.', 'ok'); closeMenu(); }
    else if (b.dataset.meet !== undefined) { closeMenu(); if (now - meetAsked < 90) toast('La reunión ya está pedida.'); else { meetAsked = now; opts.onCommand?.('meeting', { topic: 'Reunión convocada por César' }, 'Reunión convocada: empezará en el próximo ciclo.'); aside(by('auditor'), 'Recibido, jefe. Empezamos en el próximo ciclo.'); } }
    else if (b.dataset.keys !== undefined) { closeMenu(); toggleHelp(true); }
    else closeMenu();
  });
  menuEl.addEventListener('keydown', e => { if (e.key === 'Escape') { e.preventDefault(); closeMenu(); } });
  function toggleHelp(on = helpEl.hidden) {
    if (on) { helpEl.innerHTML = '<h4>Cómo jugar</h4><dl>' + G.KEYS.map(([k, v]) => '<dt>' + esc(k) + '</dt><dd>' + esc(v) + '</dd>').join('') + '</dl><p>Acércate a un empleado o a un objeto y pulsa <b>E</b>. Nada de esto gasta tokens.</p><button type="button">Entendido</button>'; helpEl.hidden = false; helpEl.querySelector('button').focus({ preventScroll: true }); }
    else { helpEl.hidden = true; cv.focus({ preventScroll: true }); }
  }
  helpEl.addEventListener('click', e => { if (e.target.closest('button')) toggleHelp(false); });
  helpEl.addEventListener('keydown', e => { if (e.key === 'Escape' || e.key.toLowerCase() === 'h') { e.preventDefault(); toggleHelp(false); } });
  root.querySelector('.ao-help-btn').addEventListener('click', () => toggleHelp());
  actBtn.addEventListener('click', () => { interact(); cv.focus({ preventScroll: true }); });

  // ---- recreativa: STONKS ----
  let record = 0; try { record = Number(localStorage.getItem('ao-stonks')) || 0; } catch { /* sin almacenamiento */ }
  function startArcade() { if (me.act) return; me.act = 'arcade'; me.pose = 'stand'; me.dir = 'down'; arc = { t: 0, dur: 20, price: 100, v: 0, hist: [100], pos: null, score: 0, n: 0, acc: 0, buyAt: -1 }; toast('STONKS: compra abajo y vende arriba. E compra y vende, Esc sale.'); }
  function arcPress() { if (!arc || arc.done) return; if (arc.pos == null) { arc.pos = arc.price; arc.buyAt = arc.hist.length - 1; } else { arc.score += (arc.price / arc.pos - 1) * 100; arc.pos = null; arc.n++; arc.buyAt = -1; } }
  function endArcade(quit) {
    if (!arc) return; if (arc.pos != null) { arc.score += (arc.price / arc.pos - 1) * 100; arc.n++; }
    const score = Math.round(arc.score * 10) / 10, played = !quit || arc.n > 0; arc = null; me.act = null;
    if (!played) return; const r = G.arcadeVerdict(score, record, S); if (score > record) { record = score; try { localStorage.setItem('ao-stonks', String(score)); } catch { /* da igual */ } confetti(me.x, me.y - 30, 16); }
    toast(r.toast, score > 0 ? 'ok' : 'info'); aside(by(r.who), r.text);
  }
  function arcStep(dt) {
    arc.t += dt; arc.acc += dt;
    while (arc.acc > .05) { arc.acc -= .05; arc.v = arc.v * .88 + (Math.random() - .5) * 1.1 + Math.sin(arc.t * 1.9) * .12 + (100 - arc.price) * .004; arc.price = Math.max(72, Math.min(128, arc.price + arc.v)); arc.hist.push(arc.price); if (arc.hist.length > 104) { arc.hist.shift(); if (arc.buyAt >= 0) arc.buyAt--; } }
    if (arc.t >= arc.dur) endArcade(false);
  }
  function drawArcade() {
    const w = 150, h = 98, x = (VW - w) / 2 | 0, y = (VH - h) / 2 | 0;
    R(g, 0, 0, VW, VH, 'rgba(6,10,16,.55)'); R(g, x - 3, y - 3, w + 6, h + 6, '#3a2a5c'); R(g, x - 3, y - 3, w + 6, 2, '#7d5fc7'); R(g, x, y, w, h, '#0b0f14');
    text(g, 'STONKS', x + 5, y + 5, PAL.amber); const left = Math.max(0, Math.ceil(arc.dur - arc.t)) + 'S'; text(g, left, x + w - 5 - textW(left), y + 5, left.length < 3 && arc.dur - arc.t < 5 ? PAL.red : '#6f8aa6');
    const live = arc.pos != null ? (arc.price / arc.pos - 1) * 100 : 0, tot = arc.score + live, sc = (tot >= 0 ? '+' : '-') + Math.abs(tot).toFixed(1) + '%'; text(g, sc, x + w / 2 - textW(sc) / 2, y + 5, tot >= 0 ? PAL.green : PAL.red);
    const gx = x + 6, gy = y + 16, gw = w - 12, gh = 58; R(g, gx, gy, gw, gh, '#10151b'); for (let i = 1; i < 4; i++) R(g, gx, gy + i * gh / 4, gw, 1, '#18212b');
    const Y = p => gy + gh - 2 - (p - 72) / 56 * (gh - 4);
    if (arc.pos != null) { const yy = Y(arc.pos) | 0; for (let i = 0; i < gw; i += 4) R(g, gx + i, yy, 2, 1, PAL.amber); }
    arc.hist.forEach((p, i) => { const xx = gx + gw - arc.hist.length + i; if (xx < gx) return; const c = arc.pos != null && i >= arc.buyAt ? (p >= arc.pos ? PAL.green : PAL.red) : '#5cb7ea'; R(g, xx, Y(p), 1, 2, c); });
    R(g, gx + gw - 2, Y(arc.price) - 1, 3, 3, '#fff');
    const hint = arc.pos == null ? 'E  COMPRAR' : 'E  VENDER'; R(g, x + w / 2 - textW(hint) / 2 - 4, y + h - 19, textW(hint) + 8, 9, arc.pos == null ? '#1d3b2a' : '#4a1f1f'); text(g, hint, x + w / 2 - textW(hint) / 2, y + h - 17, arc.pos == null ? PAL.green : PAL.red);
    const rec = 'RECORD ' + (record >= 0 ? '+' : '-') + Math.abs(record).toFixed(1) + '%   ESC SALIR'; text(g, rec, x + w / 2 - textW(rec) / 2, y + h - 7, '#4d627a');
  }

  // ---- dibujo ----
  const bgs = Object.fromEntries(Object.values(ROOMS).map(r => { const c = document.createElement('canvas'); c.width = VW; c.height = VH; r.paintStatic(c.getContext('2d')); return [r.id, c]; }));

  const hourNow = () => S.hour ?? (d => d.getHours() + d.getMinutes() / 60)(new Date());
  function frame(tms) {
    if (!alive) return; raf = requestAnimationFrame(frame);
    const dt = Math.min(.05, (tms - last) / 1000); last = tms; now += dt;
    for (let i = timers.length - 1; i >= 0; i--) if (timers[i].at <= now) timers.splice(i, 1)[0].r();
    const hour = hourNow(), night = hour < 7 || hour >= 22;
    S.weekday = S.weekday ?? new Date().getDay();
    if (arc) arcStep(dt);
    // jugador
    let kx = (keys.has('d') || keys.has('arrowright') ? 1 : 0) - (keys.has('a') || keys.has('arrowleft') ? 1 : 0), ky = (keys.has('s') || keys.has('arrowdown') ? 1 : 0) - (keys.has('w') || keys.has('arrowup') ? 1 : 0);
    if (arc || me.away || me.lock || !menuEl.hidden) kx = ky = 0;
    const moving = !!(kx || ky) || (me.manual && me.path.length > 0);
    if (kx || ky) {
      if (me.act) leaveAct();
      if (!me.manual) { claim(me); me.manual = true; me.seated = false; me.oy = 0; me.path = []; }
      if (me.path.length) { me.path = []; me.arrive?.(false); }
      me.seated = false; me.idleAt = now + 25; me.pose = 'walk'; me.dir = kx > 0 ? 'right' : kx < 0 ? 'left' : ky > 0 ? 'down' : 'up';
      const v = 54 * (me.caf > now ? 1.45 : 1), nx = me.x + kx * v * dt, ny = me.y + ky * v * dt, free = (x, y) => { const tx = x / T | 0, ty = (y - 4) / T | 0; return grids[me.room][ty] && !grids[me.room][ty][tx]; };
      if (free(nx, me.y)) me.x = nx; if (free(me.x, ny)) me.y = ny; me.still = now;
      const door = ROOMS[me.room].door, [mtx, mty] = [me.x / T | 0, (me.y - 4) / T | 0]; if (mtx === door.at[0] && mty === door.at[1]) { enter(me, door.to); me.dir = door.to === 'agency' ? 'left' : 'right'; }
    } else if (me.manual && !me.lock) {
      if (!me.path.length && !me.act && me.pose === 'walk') me.pose = 'stand';
      if (me.act || me.path.length || arc) me.idleAt = now + 25;
      if (now > me.idleAt) { me.manual = false; const [tx, ty] = tileOf(me); [me.x, me.y] = px(tx, ty); const tok = me.token; goHome(me, tok).then(() => { if (tok === me.token) release(me); }); }
    }
    // movimiento y vida
    for (const a of A) {
      if (a.path.length) {
        const [tx, ty] = px(...a.path[0]), dx = tx - a.x, dy = ty - a.y, d = Math.hypot(dx, dy), sp = (a === me ? 60 : a.fast ? 56 : S.mood === 'panic' ? 48 : 36) * (a.caf > now ? 1.45 : 1) * dt;
        a.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'); a.pose = 'walk';
        if (a.caf > now && a.room === view && (now * 14 | 0) % 3 === 0) parts.push({ kind: 'dot', x: a.x - (dx / d) * 6, y: a.y - 6, vx: 0, vy: -14, life: .35, c: PAL.amber, room: a.room });
        if (d <= sp) { a.x = tx; a.y = ty; a.path.shift(); if (!a.path.length) a.arrive?.(true); } else { a.x += dx / d * sp; a.y += dy / d * sp; }
      }
      if (a !== me && !a.busy && a.seated) {
        if (night && !queue.length) a.pose = 'sleep'; else if (a.pose === 'sleep') a.pose = 'type';
        if (!night && now > a.next && !me.away) idle(a);
      }
      if (a !== me && !a.busy && !a.seated && !a.path.length) { const tok = claim(a); goHome(a, tok).then(() => { if (tok === a.token) release(a); }); } // nadie se queda plantado en mitad de la oficina
      a.sweat = (S.mood === 'panic' || a.sweatOn > now) && a.pose !== 'sleep' && a !== me;
    }
    catStep(dt);
    if (night) { robot.x += robot.dir * 16 * dt; if (robot.x > 17.5 * T) robot.dir = -1; if (robot.x < 1.5 * T) robot.dir = 1; if (Math.abs(robot.x - me.x) < 8 && Math.abs(9 * T + 13 - me.y) < 8) robot.dir = me.x > robot.x ? -1 : 1; }
    // reacciones a César y director de gags (cada 0,4 s)
    if (now > checkAt) {
      checkAt = now + .4; near = findNear();
      const label = near ? near.label : ''; if (label !== lastLabel) { lastLabel = label; actBtn.hidden = !label; actBtn.textContent = label ? 'E · ' + label : ''; }
      if (me.manual && !me.away && !arc && me.room === 'trading') {
        if (moving) { me.still = now; if (now > lastGreet + 5) { const a = A.find(x => x !== me && x.room === me.room && !x.busy && atDesk(x) && now > x.greetAt && Math.hypot(x.x - me.x, x.y - me.y) < 30); if (a) { lastGreet = now; a.greetAt = now + 50 + Math.random() * 50; const asleep = a.pose === 'sleep'; aside(a, G.reactLine(a.id, S, { asleep, hour }), { to: me, pose: asleep ? 'panic' : undefined, ms: 1700 }); } } }
        else if (!me.act && now - (me.still || now) > 2.4) {
          const a = A.find(x => x !== me && !x.busy && atDesk(x) && x.pose !== 'sleep' && now > x.peekAt && ((Math.abs(me.x - x.x) < 14 && me.y - x.y > 6 && me.y - x.y < 24) || (Math.abs(me.y - x.y) < 9 && Math.abs(me.x - x.x) < 24)));
          if (a) { a.peekAt = now + 70; me.still = now; const r = G.peekLine(a.id, S); if (r.caught) { a.screen = ['game', 'game']; setTimeout(() => { if (a.screen?.[0] === 'game') a.screen = null; }, 1100); emote(a, '!', PAL.red); } aside(a, r.text, { to: me }); }
        }
      }
      if (!night && !me.away && !arc && now > nextGag && !queue.length && !running) {
        const free = freeTeam().map(a => a.id);
        if (free.length >= 2) { S.bossNear = me.manual && A.some(a => a !== me && Math.hypot(a.x - me.x, a.y - me.y) < 60); const gag = G.pickGag(S, free, seenGags, now); if (gag) { runGag(gag); nextGag = now + 28 + Math.random() * 30; } else nextGag = now + 10; }
        else nextGag = now + 6;
      }
      if (S.monthPnl >= S.rentTarget && Math.random() < .06) confetti(40 + Math.random() * (VW - 80), 3 * T, 8);
    }
    // --- pintar ---
    g.setTransform(PXS, 0, 0, PXS, 0, 0); g.imageSmoothingEnabled = false; g.drawImage(bgs[view], 0, 0); ROOMS[view].drawWall(g, { S, up, fx, t: now, hour });
    const health = S.mood === 'panic' ? 'wilt' : S.monthPnl >= S.rentTarget ? 'bloom' : '', idleDays = S.life?.everTraded ? S.life.daysSinceTrade || 0 : 0;
    const D = [];
    ROOMS[view].items(D, { g, S, up, fx, now, by, ag, me, health, idleDays });
    if (view === 'trading' && up.has('gato') && kitty.x) D.push({ y: kitty.onSofa ? 66 : kitty.y + .1, f: () => { if (!(night && !kitty.path.length && !kitty.onSofa)) drawCat(g, kitty.x, kitty.y, now, kitty.st, kitty.dir); } });
    if (night && view === 'trading') D.push({ y: 9 * T + 14, f: () => roomba(g, robot.x, 9 * T + 13, now, up.has('gato') && !kitty.path.length && !kitty.onSofa ? (robot.dir > 0 ? 'right' : 'left') : null) });
    for (const a of A) if (a.room === view && !(a === me && me.away)) D.push({ y: onSofa(a) ? 65 : a.y + (a.seated && a.dir === 'up' ? 0 : .2), f: () => { drawChar(g, a.x, a.y + a.oy + (onSofa(a) ? 3 : 0), a.look, { dir: a.dir, pose: a.frantic > now && a.pose === 'type' ? 'type' : a.pose, seated: a.seated, t: (now + a.tx * .37) * (a.frantic > now ? 2.4 : 1), sweat: a.sweat || a.frantic > now }); } });
    D.sort((p, q) => p.y - q.y).forEach(d => d.f());
    // etiquetas
    for (const a of A) { if (a.room !== view || (a === me && me.away) || (a.seated && !onSofa(a) && (a.tx !== a.seat[0] || a.ty !== a.seat[1]))) continue; const w = textW(a.name) + 4, x = (a.x - w / 2) | 0, y = (a.y + a.oy + (onSofa(a) ? 6 : 3)) | 0; R(g, x, y, w, 7, 'rgba(12,18,26,.78)'); R(g, x, y + 6, w, 1, a.color); text(g, a.name, x + 2, y + 1, '#f3f6fa'); }
    // luz
    const dark = Math.max(night ? .42 : hour < 8 || hour > 20 ? .18 : 0, fx.dimUntil > now ? .38 : 0);
    if (dark) { g.fillStyle = `rgba(10,16,40,${dark})`; g.fillRect(0, 0, VW, VH); g.globalCompositeOperation = 'lighter'; if (view === 'trading') for (const s of STAFF) { const a = by(s.id); if (atDesk(a) && a.pose !== 'sleep' && !(a === me && me.away)) { const gr = g.createRadialGradient(s.seat[0] * T + 8, s.seat[1] * T - 8, 2, s.seat[0] * T + 8, s.seat[1] * T - 8, 34); gr.addColorStop(0, 'rgba(120,170,230,.30)'); gr.addColorStop(1, 'rgba(120,170,230,0)'); g.fillStyle = gr; g.fillRect(s.seat[0] * T - 30, s.seat[1] * T - 44, 76, 72); } } g.globalCompositeOperation = 'source-over'; }
    if (S.mood === 'panic' && (now * 1.5 | 0) % 2) { g.fillStyle = 'rgba(240,60,50,.05)'; g.fillRect(0, 0, VW, VH); }
    // partículas
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i]; if ((p.room || 'trading') !== view) { if (p.kind !== 'plane') p.life -= dt; if (p.life <= 0 || (p.kind === 'plane' && now - p.t0 > p.dur)) parts.splice(i, 1); continue; }
      if (p.kind === 'plane') { const k = (now - p.t0) / p.dur; if (k >= 1) { parts.splice(i, 1); if (!p.dart) float(p.tx, p.ty - 4, '¡AY!', PAL.red, .9); continue; } const x = p.x + (p.tx - p.x) * k, y = p.y + (p.ty - p.y) * k - Math.sin(k * Math.PI) * (p.dart ? 6 : 22); if (p.dart) R(g, x, y, 2, 1, p.c); else { R(g, x - 2, y, 5, 1, p.c); R(g, x, y - 1, 2, 1, p.c); R(g, x - 1, y + 1, 2, 1, '#c9c4b4'); } continue; }
      p.life -= dt; if (p.life <= 0) { parts.splice(i, 1); continue; }
      if (p.kind === 'dot') { p.vy += 120 * dt; p.x += p.vx * dt; p.y += p.vy * dt; R(g, p.x, p.y, 2, (now * 12 + i | 0) % 2 + 1, p.c); continue; }
      p.y += p.vy * dt; const w = textW(p.str) + 4, x = Math.max(1, Math.min(VW - w - 1, p.x - w / 2)); R(g, x, p.y - 1, w, 7, 'rgba(12,18,26,.8)'); text(g, p.str, x + 2, p.y, p.c);
    }
    if (near && !arc && menuEl.hidden && me.room === view) prompt(g, near.x, near.y, near.label, now);
    if (arc) drawArcade();
    // bocadillos DOM y cámara (en pantallas estrechas la oficina es más ancha que la vista y sigue a César)
    const k = cv.clientWidth / VW;
    if (me.manual && !me.away && me.room === view && scroller.scrollWidth > scroller.clientWidth + 2) scroller.scrollLeft += (me.x * k - scroller.clientWidth / 2 - scroller.scrollLeft) * Math.min(1, dt * 5);
    for (const a of A) if (a.bubble) {
      const bb = a.bubble; if (now > bb.until) { bb.el.remove(); a.bubble = null; continue; }
      const n = Math.min(bb.str.length, ((now - bb.start) * 38) | 0); if (n !== bb.shown) { bb.shown = n; bb.el.lastChild.textContent = bb.str.slice(0, n); }
      const half = bb.el.offsetWidth / 2 + 4; bb.el.style.left = Math.max(half, Math.min(cv.clientWidth - half, a.x * k)) + 'px'; bb.el.style.top = ((a.y + a.oy - 32) * k) + 'px';
    }
  }
  const MOVE = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'];
  const kd = e => {
    const k = e.key.toLowerCase(); if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (MOVE.includes(k)) { keys.add(k); e.preventDefault(); return; }
    if (e.repeat) { if (['e', ' ', 'f'].includes(k)) e.preventDefault(); return; }
    if (k === 'e' || k === 'enter') { e.preventDefault(); interact(); }
    else if (k === ' ') { e.preventDefault(); if (arc) arcPress(); else wave(); }
    else if (k === 'f') { e.preventDefault(); five(); }
    else if (k >= '1' && k <= '6') { e.preventDefault(); if (!arc) summon(TEAM[Number(k) - 1]); }
    else if (k === 'h' || k === '?') { e.preventDefault(); toggleHelp(); }
    else if (k === 'escape') { if (!helpEl.hidden) { e.preventDefault(); toggleHelp(false); } else if (arc) { e.preventDefault(); endArcade(true); } else if (me.act) { e.preventDefault(); leaveAct(); } }
  }, ku = e => keys.delete(e.key.toLowerCase());
  cv.addEventListener('keydown', kd); cv.addEventListener('keyup', ku); cv.addEventListener('blur', () => keys.clear());
  function walkTo(tx, ty, then) {
    if (me.away || me.lock || arc) return; if (me.act) leaveAct(); claim(me); me.manual = true; me.idleAt = now + 30; const [cx, cy] = tileOf(me); [me.x, me.y] = px(cx, cy);
    goto(me, tx, ty, { room: view }).then(ok => { if (ok) { me.still = now; then?.(); } });
  }
  cv.addEventListener('click', e => {
    const r = cv.getBoundingClientRect(), k = VW / r.width, x = (e.clientX - r.left) * k, y = (e.clientY - r.top) * k; cv.focus({ preventScroll: true });
    if (arc) { arcPress(); return; }
    let best = null, bd = 16; for (const a of A) { if (a === me || a.room !== view) continue; const d = Math.hypot(a.x - x, a.y - 13 - y); if (d < bd) { bd = d; best = a; } }
    if (best) { opts.onSelect?.(best.id); if (e.detail >= 2 && !me.away) { const [bx, by2] = tileOf(best), spot = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => [bx + dx, by2 + dy]).find(([tx, ty]) => grids[view][ty] && !grids[view][ty][tx]); if (spot) walkTo(spot[0], spot[1], () => talk(best)); } return; }
    const th = things(view).find(t => x >= t.hit[0] && x <= t.hit[0] + t.hit[2] && y >= t.hit[1] && y <= t.hit[1] + t.hit[3]);
    if (th) { const [cx, cy] = me.room === view ? tileOf(me) : ROOMS[view].door.at, at = [...th.at].sort((p, q) => Math.hypot(p[0] - cx, p[1] - cy) - Math.hypot(q[0] - cx, q[1] - cy))[0]; walkTo(at[0], at[1], () => { if (th.dir) me.dir = th.dir; th.use(); }); return; }
    const tx = x / T | 0, ty = (y - 4) / T | 0; if (grids[view][ty] && !grids[view][ty][tx]) walkTo(tx, ty);
  });
  setView('trading'); raf = requestAnimationFrame(frame);
  return {
    toast, summon, play, staff: STAFF,
    room: () => view, setRoom: setView,
    setState(s) {
      const wasOpen = S.marketOpen; Object.assign(S, s);
      for (const [k, at] of gifts) if ((s.upgrades || []).includes(k) || Date.now() - at > 20 * 60e3) gifts.delete(k);
      if (s.upgrades) { S.upgrades = [...new Set([...s.upgrades, ...gifts.keys()])]; up = new Set(S.upgrades); grids = buildGrids(up); }
      if (primed && s.marketOpen !== undefined && s.marketOpen !== wasOpen) play({ type: 'bell', open: !!s.marketOpen }); primed = true;
    },
    agentState: id => { const a = by(id); return a && { pose: a.pose, busy: a.busy, seated: a.seated, x: a.x, y: a.y }; },
    // para pruebas y capturas: colocar a César y forzar acciones sin teclado
    debug: { place(tx, ty) { closeMenu(); leaveAct(); if (!me.manual) { claim(me); me.manual = true; } me.path = []; me.seated = false; [me.x, me.y] = px(tx, ty); me.pose = 'stand'; me.idleAt = now + 600; near = findNear(); checkAt = 0; }, interact, wave, five, gag(id) { seenGags.clear(); const free = freeTeam().map(a => a.id), gg = G.pickGag(S, free, new Map(G.GAG_IDS.filter(x => x !== id).map(x => [x, now])), now); if (gg) runGag(gg); return gg?.id || null; }, near: () => near && near.label, arcade: () => arc && { t: arc.t, score: arc.score }, me: () => ({ act: me.act, away: !!me.away, x: me.x, y: me.y, pose: me.pose }), cat: () => ({ ...kitty }) },
    destroy() { alive = false; cancelAnimationFrame(raf); root.innerHTML = ''; }
  };
}
