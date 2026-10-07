// Agent Office · sala de inversión: plano, mobiliario, pared con datos del mercado y
// los sitios donde el equipo de inversión trabaja y descansa. Solo dibuja y describe;
// el movimiento, las escenas y la interacción viven en office.js.
import { T, R, PAL, VW, VH, text, textW, chair, desk, plant, sofa, tank, coffeeMachine, whiteboard, arcade, aquarium, papers, cobweb, trophy, pizza, bell, dartboard, neon, coffeePro } from '../art.js';
import * as G from '../gags.js';

export const STAFF = [
  { id: 'scout', name: 'Santi', role: 'Explorador', color: '#9ccb98', seat: [2, 8], screens: ['scan', 'table'] },
  { id: 'analyst', name: 'Pedro', role: 'Analista', color: '#b6a4e8', seat: [7, 8], screens: ['bars', 'code'] },
  { id: 'risk', name: 'María', role: 'Riesgo', color: '#e8b67c', seat: [12, 8], screens: ['table', 'bars'] },
  { id: 'operator', name: 'Yari', role: 'Trader', color: '#81cbd0', seat: [2, 12], screens: ['up', 'table'] },
  { id: 'auditor', name: 'Augusto', role: 'Dirección', color: '#e7a6bf', seat: [7, 12], screens: ['code', 'bars'] },
  { id: 'designer', name: 'Cadaqui', role: 'Finanzas y tokens', color: '#91afe8', seat: [12, 12], screens: ['bars', 'table'] },
  { id: 'cesar', name: 'César', role: 'Dueño', color: '#f3ead9', seat: [22, 12], screens: ['up', 'off'] }
];
export const TEAM = STAFF.filter(s => s.id !== 'cesar').map(s => s.id);
export const MEET = { scout: [21, 4, 'down', 0], analyst: [23, 4, 'down', 0], risk: [24, 5, 'left', 7], operator: [21, 7, 'up', 0], auditor: [20, 5, 'right', 7], designer: [23, 7, 'up', 0], cesar: [22, 7, 'up', 0] };
export const SPOT = { coffee: [2, 4, 'up'], tank: [6, 4, 'up'], board: [14, 4, 'up'], strategy: [13, 13, 'right'], sofaA: [8, 3, 'down'], sofaB: [10, 3, 'down'], arcade: [17, 5, 'right'], window: [11, 4, 'up'], darts: [18, 4, 'up'], bell: [16, 11, 'up'], aquarium: [17, 11, 'up'] };
export const VIS = 2;
function sky(h) { if (h < 6 || h >= 21.5) return ['#0c1330', '#1b2450', 0]; if (h < 8) return ['#f3a66b', '#f7d7a0', .6]; if (h < 18.5) return ['#6fb7ea', '#bfe3f7', 1]; if (h < 21.5) return ['#3c3a78', '#f08a5d', .55]; return ['#0c1330', '#1b2450', 0]; }
  const TONE = { ok: PAL.green, bad: PAL.red, warn: PAL.amber, dim: '#3f5a78' };

export const trading = {
  id: 'trading', name: 'Inversión', door: { at: [0, 9], to: 'agency', arrive: [24, 9] },
  blocks(blk, up) {
    blk(1, 3, 6, 3); blk(8, 3, 10, 3);
    for (const y of [7, 11]) for (const x of [1, 6, 11]) blk(x, y, x + 2, y);
    blk(19, 3, 19, 5); blk(19, 8); blk(19, 9, 24, 9); blk(21, 5, 23, 6); blk(20, 3); blk(24, 3);
    blk(19, 10, 19, 11); blk(21, 11, 23, 11); blk(24, 13);
    blk(14, 13, 17, 13); blk(18, 3);
    if (up.has('arcade')) blk(18, 5); if (up.has('aquarium')) blk(17, 10, 18, 10);
    if (up.has('campana')) blk(16, 10); if (up.has('plantas')) { blk(1, 5); blk(1, 13); blk(14, 5); }
  },
  paintStatic(b) {
    for (let y = 3 * T; y < VH; y += 8) for (let x = 0; x < VW + 32; x += 32) { const o = (y / 8 % 2) * 16, k = (x * 13 + y * 7) % 5; R(b, x - o, y, 32, 8, k === 0 ? PAL.floorC : k < 3 ? PAL.floorA : PAL.floorB); R(b, x - o, y, 1, 8, 'rgba(90,55,25,.35)'); R(b, x - o, y + 7, 32, 1, 'rgba(60,35,15,.16)'); }
    const rug = (x, y, w, h, c = PAL.rug, d = PAL.navyLight) => { R(b, x, y, w, h, c); R(b, x + 1, y + 1, w - 2, 1, PAL.rugEdge); R(b, x + 1, y + h - 2, w - 2, 1, PAL.rugEdge); R(b, x + 1, y + 1, 1, h - 2, PAL.rugEdge); R(b, x + w - 2, y + 1, 1, h - 2, PAL.rugEdge); for (let i = x + 5; i < x + w - 5; i += 6) for (let j = y + 5; j < y + h - 5; j += 6) R(b, i, j, 1, 1, d); };
    for (const s of STAFF) if (s.id !== 'cesar') rug((s.seat[0] - 2) * T + 6, (s.seat[1] - 1) * T - 3, 68, 40);
    rug(20 * T, 4 * T - 2, 5 * T - 2, 4 * T + 10, '#3a3550', '#5a5378'); rug(20 * T + 2, 10 * T + 8, 5 * T - 6, 3 * T + 2, '#2f4d3f', '#4c7a63'); rug(8 * T - 6, 4 * T + 3, 60, 22, '#6a3f3a', '#96615a');
    R(b, 6 * T, VH - 13, 2 * T, 7, '#3b3028');
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
    // puerta a la otra sala
    R(b, 0, 9 * T - 6, 4, 26, '#1a1410'); R(b, 0, 9 * T - 8, 6, 2, PAL.trim); R(b, 0, 9 * T + 20, 6, 2, PAL.trim); R(b, 5, 9 * T + 2, 22, 11, '#3b3028'); text(b, '<', 7, 9 * T + 5, '#ff8fb1'); text(b, 'AG', 13, 9 * T + 5, '#c9a55a');
  },
  drawWall(g, c) {
    const {S, up, fx, t, hour} = c;
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
    else {
      // sala libre: carrusel con datos reales de la empresa
      const sl = G.slides(S), cur = sl[(t / 4.5 | 0) % sl.length], c = TONE[cur[2]] || '#3f5a78';
      text(g, cur[0], 360 - textW(cur[0]) / 2, 17, '#6f8aa6', 66); text(g, cur[1], 360 - Math.min(64, textW(cur[1])) / 2, 26, c, 66);
      for (let i = 0; i < sl.length; i++) R(g, 360 - sl.length * 2 + i * 4, 36, 2, 1, i === (t / 4.5 | 0) % sl.length ? c : '#1f3550');
    }
    if (up.has('cafetera')) coffeePro(g, 25, 44, t); else coffeeMachine(g, 26, 44, t);
    if (fx.pourUntil > t) { R(g, 31, 41, 1, 3, '#6b4324'); R(g, 30, 44, 3, 3, '#f5f5f0'); R(g, 30, 44, 3, 1, '#6b4324'); for (let i = 0; i < 3; i++) { const k = (t * 4 + i * .9) % 3; R(g, 29 + i * 2, 38 - k * 3, 1, 2, `rgba(255,255,255,${.7 - k * .2})`); } }
    if (up.has('dardos')) dartboard(g, 309, 13, fx.dart);
    const cups = Math.min(3, S.life?.monthsPaid || 0); for (let i = 0; i < cups; i++) trophy(g, 26 + i * 24, 18);
    const mat = S.mood === 'panic' ? 'SOS' : S.mood === 'joy' ? 'OLE' : 'HOLA'; text(g, mat, 7 * T - textW(mat) / 2, VH - 12, S.mood === 'panic' ? PAL.red : '#c9a55a');
  },

  things(api) {
    const {S, me, G, fx, toast, open, float, aside, by, emote, throwDart, play, drinkCoffee, sitSofa, useMeeting, openMenu, startArcade, ringBell} = api;
    return [
    { id: 'coffee', at: [[2, 4]], dir: 'up', hit: [22, 28, 20, 20], label: 'Café', use: drinkCoffee },
    { id: 'shelf', at: [[3, 4], [4, 4]], dir: 'up', hit: [44, 14, 34, 26], label: 'Leer el diario', use() { toast(G.objectLine('shelf', S)); open('diario'); } },
    { id: 'fridge', at: [[5, 4]], dir: 'up', hit: [81, 14, 14, 49], label: 'Nevera', use() { toast(G.objectLine('fridge', S)); } },
    { id: 'tank', at: [[6, 4]], dir: 'up', hit: [98, 30, 12, 34], label: 'Bidón de tokens', use() { toast(G.objectLine('tank', S)); float(6 * T + 8, 28, Math.round(S.tokensLeft * 100) + '%', S.tokensLeft < .25 ? PAL.red : PAL.blue, 2.4); aside(by('designer'), S.tokensLeft < .25 ? 'No lo mires tanto, que baja.' : 'Está controlado, jefe. Lo miro yo.'); } },
    { id: 'sofa', at: [[8, 4], [9, 4], [10, 4]], dir: 'up', hit: [8 * T, 42, 48, 24], label: () => me.act === 'sofa' ? 'Levantarse' : 'Sentarse', use: sitSofa },
    { id: 'kpi', at: [[12, 4], [13, 4], [14, 4], [15, 4], [16, 4]], dir: 'up', hit: [178, 11, 88, 34], label: 'Ver la cartera', use() { open('cartera'); emote(me, '!', PAL.green); } },
    { id: 'mood', at: [[17, 4]], dir: 'up', hit: [270, 14, 38, 24], label: 'Ánimo', use() { toast(G.objectLine('mood', S)); } },
    { id: 'darts', need: 'dardos', at: [[18, 4]], dir: 'up', hit: [308, 13, 14, 14], label: 'Tirar un dardo', use() { throwDart(me); setTimeout(() => toast(G.objectLine('darts', S)), 400); } },
    { id: 'strategy', at: [[14, 12], [15, 12], [16, 12], [17, 12], [13, 13]], dir: 'down', hit: [14 * T, 13 * T - 20, 64, 34], label: 'Ver la estrategia', use() { open('estrategia'); emote(me, '?'); } },
    { id: 'meet', at: [[22, 7]], dir: 'up', hit: [21 * T - 2, 5 * T + 2, 52, 44], label: () => me.act === 'meet' ? (api.now() - api.meetAsked() < 90 ? 'Reunión pedida' : 'Convocar reunión') : 'Sentarse en la sala', use: useMeeting },
    { id: 'desk', at: [[22, 12]], dir: 'up', hit: [21 * T, 10 * T + 2, 48, 30], label: 'Mi mesa', use: openMenu },
    { id: 'arcade', need: 'arcade', at: [[17, 5], [18, 6]], dir: 'right', hit: [18 * T, 5 * T - 16, 14, 32], label: 'Jugar', use: startArcade },
    { id: 'aquarium', need: 'aquarium', at: [[17, 11], [18, 11]], dir: 'up', hit: [17 * T, 10 * T - 12, 32, 28], label: 'Dar de comer', use() { fx.feedUntil = api.now() + 4; toast(G.objectLine('aquarium', S)); } },
    { id: 'bell', need: 'campana', at: [[16, 11], [15, 10], [16, 9]], dir: 'up', hit: [16 * T, 9 * T + 4, 16, 26], label: 'Tocar la campana', use: ringBell },
    { id: 'door', at: [[6, 13], [7, 13]], dir: 'down', hit: [6 * T, VH - 15, 2 * T, 12], label: 'Salir un momento', use() { play({ type: 'bossAway' }); } }
  ];
  },
  items(D, c) {
    const {g, S, up, fx, now, by, ag, me, health, idleDays} = c;
    D.push({ y: 62, f: () => tank(g, 6 * T + 1, 46, S.tokensLeft, now) }, { y: 64, f: () => sofa(g, 8 * T, 50) });
    for (const s of STAFF) {
      const [sx, sy] = s.seat, a = by(s.id), away = !a.seated || a.tx !== sx || a.ty !== sy || (a === me && me.away), dx = (sx - 1) * T, dy = (sy - 1) * T + 2, st = ag(s.id);
      let m = a.screen || s.screens; if (away) m = ['off', 'off']; if (a.pose === 'sleep') m = ['off', 'off'];
      if (s.id === 'operator' && !a.screen && !away) m = [S.monthPnl >= 0 ? 'up' : 'down', 'table'];
      if (a.frantic > now) m = ['code', 'scan'];
      D.push({ y: dy + 12, f: () => {
        desk(g, dx, dy, { m1: m[0], m2: m[1], t: now, seed: sx + sy, color: s.color });
        const pile = Math.min(6, (st.work || 0) + (st.inbox || 0)); if (pile) papers(g, dx + 36, dy + 5, pile);
        if (s.id === 'operator' && idleDays >= 2) { cobweb(g, dx + 20, dy - 9, idleDays >= 5 || fx.webUntil > now); if (fx.webUntil > now && (now * 4 | 0) % 2) R(g, dx + 19, dy - 10, 12, 1, 'rgba(255,255,255,.5)'); }
        if (st.paused) { R(g, dx + 14, dy - 18, 21, 7, '#b3352f'); text(g, 'PAUSA', dx + 15, dy - 17, '#fff'); }
      } });
      D.push({ y: sy * T + 14.5, f: () => chair(g, sx * T + 8, sy * T + 15, true, s.id === 'cesar' ? '#6b3b28' : PAL.navy) });
    }
    D.push({ y: 6 * T + 14, f: () => { const x = 21 * T - 2, y = 5 * T + 2; R(g, x + 2, y + 30, 48, 3, 'rgba(0,0,0,.2)'); R(g, x, y, 52, 26, PAL.woodLight); R(g, x, y, 52, 1, '#cf965c'); R(g, x, y + 26, 52, 4, PAL.woodDark); R(g, x + 20, y + 9, 12, 7, '#2a2f37'); R(g, x + 5, y + 5, 8, 10, '#f2efe6'); R(g, x + 38, y + 12, 8, 10, '#f2efe6'); R(g, x + 16, y + 19, 4, 4, '#f5f5f0'); if (S.dayPnl / Math.max(1, S.equity) >= .015) pizza(g, x + 34, y + 2); } });
    for (const id in MEET) { const [mx, my, d, oy] = MEET[id], cx = mx * T + 8, fy = my * T + 15 + oy; D.push({ y: d === 'up' ? fy + .5 : fy - 9, f: () => chair(g, cx, fy, d === 'up', id === 'cesar' ? '#6b3b28' : PAL.navy) }); }
    D.push({ y: 9 * T + 6, f: () => { const x = 19 * T + 6, w = VW - 3 - x, y = 9 * T - 12; R(g, x, y, w, 16, PAL.glass); R(g, x, y, w, 1, PAL.glassEdge); R(g, x, y + 16, w, 3, PAL.trimDark); for (let i = x + 30; i < x + w; i += 34) R(g, i, y, 1, 16, 'rgba(225,245,255,.5)'); if (up.has('neon')) { const str = (S.strategy.name || 'TO THE MOON').slice(0, 22); neon(g, x + w / 2 - textW(str) / 2, y + 6, str, now); } } });
    D.push({ y: 13 * T + 14, f: () => whiteboard(g, 14 * T, 13 * T - 20, 'ESTRATEGIA', [S.strategy.name, ...(S.strategy.lines || [])]) });
    for (const [x, y, big] of [[18, 3, 1], [24, 13, 1], [20, 3, 0], [24, 3, 0], ...(up.has('plantas') ? [[1, 5, 1], [1, 13, 1], [14, 5, 0]] : [])]) D.push({ y: y * T + 14, f: () => plant(g, x * T + 8, y * T + 14, now, !!big, health) });
    if (up.has('arcade')) D.push({ y: 5 * T + 15, f: () => arcade(g, 18 * T + 1, 5 * T - 2, now) });
    if (up.has('aquarium')) D.push({ y: 10 * T + 15, f: () => { aquarium(g, 17 * T + 1, 10 * T - 2, fx.feedUntil > now ? now * 3 : now); if (fx.feedUntil > now) for (let i = 0; i < 5; i++) R(g, 17 * T + 6 + i * 5, 10 * T - 10 + ((now * 9 + i * 3) % 8), 1, 1, '#f2d9a0'); } });
    if (up.has('campana')) D.push({ y: 10 * T + 15, f: () => bell(g, 16 * T + 1, 9 * T + 8, now, fx.bellUntil > now ? 1 : 0) });
  }
};
