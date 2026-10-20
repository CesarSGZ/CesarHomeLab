// Agencia · la oficina que lleva la cuenta de Scarlett Storm. Planta abierta con seis puestos
// (el primero es del Karma Farmer; los demás esperan a los agentes que vayan llegando), despacho
// acristalado del Director con el panel de KPIs y sala de reuniones. Todo sale del estado real
// del backend: quién trabaja, quién descansa y qué número enseña la pantalla.
import { T, R, PAL, VW, VH, LOOKS, text, textW, drawChar, chair, desk, plant, coffeeMachine, papers } from './art.js';

// Puestos de la planta abierta, en orden de llegada. El Director tiene su despacho.
export const SEATS = [[3, 7], [8, 7], [13, 7], [3, 12], [8, 12], [13, 12]];
export const DIRECTOR = { seat: [21, 4], color: '#f2c94c' };
const COLORS = { 'karma-farmer': '#ff6a2b' }, SPARE = ['spare1', 'spare2', 'spare3', 'spare4'];
const CRIMSON = '#e23a5b', GOLD = '#f2c94c', INK = '#141a22';

function sky(h) { if (h < 6.5 || h >= 21.5) return ['#0c1330', '#1b2450', 0]; if (h < 8.5) return ['#f3a66b', '#f7d7a0', .6]; if (h < 19) return ['#6fb7ea', '#bfe3f7', 1]; return ['#3c3a78', '#f08a5d', .5]; }
const bigText = (g, s, x, y, c, k = 2) => { g.save(); g.translate(x, y); g.scale(k, k); text(g, s, 0, 0, c); g.restore(); };
function bolt(g, x, y, c) { R(g, x + 4, y, 3, 1, c); R(g, x + 3, y + 1, 3, 1, c); R(g, x + 2, y + 2, 3, 1, c); R(g, x + 1, y + 3, 6, 1, c); R(g, x + 3, y + 4, 3, 1, c); R(g, x + 2, y + 5, 3, 1, c); R(g, x + 1, y + 6, 2, 1, c); R(g, x, y + 7, 2, 1, c); }
function bubble(g, cx, y, str, c) {
  const w = textW(str) + 6, x = Math.max(2, Math.min(VW - w - 2, Math.round(cx - w / 2)));
  R(g, x, y, w, 9, '#f6f4ec'); R(g, x, y + 9, w, 1, 'rgba(0,0,0,.25)'); R(g, x - 1, y + 1, 1, 7, '#f6f4ec'); R(g, x + w, y + 1, 1, 7, '#f6f4ec');
  R(g, Math.round(cx) - 1, y + 9, 3, 2, '#f6f4ec'); R(g, Math.round(cx), y + 11, 1, 1, '#f6f4ec'); text(g, str, x + 3, y + 2, c);
}
function nameTag(g, cx, y, name, c) { const w = textW(name) + 4, x = Math.round(cx - w / 2); R(g, x, y, w, 7, 'rgba(12,18,26,.82)'); R(g, x, y + 6, w, 1, c); text(g, name, x + 2, y + 1, '#f3f6fa'); }
const LAMP = { working: PAL.green, thinking: PAL.green, resting: PAL.amber, paused: '#8f98a3', blocked: PAL.red, error: PAL.red, completed: PAL.green };

// Qué hace cada uno en pantalla según su estado real.
function look(a, c) {
  const night = c.hour < 8 || c.hour >= 23.5, st = c.online ? a.status : 'offline';
  if (st === 'working') return { pose: 'type', m: ['reddit', 'typing'], say: /^Publicando/.test(a.detail) ? 'PUBLICANDO' : /^Pensando/.test(a.detail) ? 'PENSANDO...' : 'LEYENDO REDDIT' };
  if (st === 'blocked') return { pose: 'sit', m: ['alert', 'off'], say: a.id === 'karma-farmer' ? 'PROTOCOLO OSIRIS' : 'NO DISPONIBLE' };
  if (st === 'error') return { pose: 'sit', m: ['alert', 'reddit'], say: 'ERROR' };
  if (st === 'completed') return { pose: 'sit', m: ['reddit', 'saver'], say: 'COMPLETADO' };
  if (st === 'paused') return { pose: 'sit', m: ['off', 'off'], sign: 'PAUSA' };
  if (st === 'offline') return { pose: 'sleep', m: ['off', 'off'] };
  if (night) return { pose: 'sleep', m: ['saver', 'off'] };
  return { pose: 'sit', m: ['saver', 'reddit'] };
}

export const agency = {
  id: 'agency', name: 'Agencia',
  // Asigna puesto y aspecto a cada agente del backend (el Director aparte). Así un agente nuevo
  // aparece solo en el primer puesto libre, sin tocar el dibujo.
  layout(agents = []) {
    let spare = 0;
    return agents.filter(a => a.id !== 'director').slice(0, SEATS.length).map((a, i) => ({ ...a, seat: SEATS[i], look: LOOKS[a.id] || LOOKS[SPARE[spare++ % SPARE.length]], color: COLORS[a.id] || ['#7d5fc7', '#2f9e8f', '#c9cdd3', '#b3262c'][i % 4] }));
  },
  paintStatic(b) {
    // suelo: moqueta de oficina en la planta, parqué en el despacho y moqueta clara en la sala
    for (let y = 3 * T; y < VH; y += 8) for (let x = 0; x < VW; x += 16) R(b, x, y, 16, 8, ((x / 16 + y / 8) | 0) % 2 ? '#3d4858' : '#425063');
    for (let y = 3 * T; y < 9 * T; y += 8) for (let x = 17 * T; x < VW + 32; x += 32) { const o = (y / 8 % 2) * 16, k = (x * 13 + y * 7) % 5; R(b, x - o, y, 32, 8, k === 0 ? PAL.floorC : k < 3 ? PAL.floorA : PAL.floorB); R(b, x - o, y, 1, 8, 'rgba(90,55,25,.35)'); R(b, x - o, y + 7, 32, 1, 'rgba(60,35,15,.16)'); }
    for (let y = 10 * T; y < VH; y += 8) for (let x = 17 * T; x < VW; x += 16) R(b, x, y, 16, 8, ((x / 16 + y / 8) | 0) % 2 ? '#56627a' : '#5b6881');
    R(b, 1 * T, 9 * T + 4, 15 * T, 18, '#2c3644'); for (let i = 1 * T + 4; i < 16 * T - 4; i += 8) R(b, i, 9 * T + 12, 4, 1, '#3a4658'); // pasillo
    for (const [sx, sy] of SEATS) { R(b, (sx - 2) * T + 6, (sy - 1) * T - 3, 68, 40, '#364153'); R(b, (sx - 2) * T + 7, (sy - 1) * T - 2, 66, 1, '#4b586c'); }
    R(b, 18 * T + 4, 6 * T - 4, 6 * T, 2 * T + 6, '#7a2e3d'); R(b, 18 * T + 6, 6 * T - 2, 6 * T - 4, 2 * T + 2, '#8e3a4b'); // alfombra del despacho
    // pared
    R(b, 0, 0, VW, 3 * T, '#e8e4dc'); R(b, 0, 0, VW, 4, '#2a2f37'); R(b, 0, 12, VW, 1, '#d6d0c4'); R(b, 0, 3 * T - 5, VW, 5, '#4a4f58'); R(b, 0, 3 * T - 5, VW, 1, '#2a2f37'); R(b, 0, 3 * T, VW, 3, 'rgba(0,0,0,.18)');
    R(b, 0, 0, 3, VH, '#2a2f37'); R(b, VW - 3, 0, 3, VH, '#2a2f37'); R(b, 0, VH - 6, VW, 6, '#2a2f37');
    R(b, 128, 4, 160, 39, '#3a1621'); R(b, 128, 4, 160, 1, '#5a2433'); R(b, 128, 42, 160, 1, '#24090f'); // panel granate detrás del rótulo
    for (const wx of [12, 66]) { R(b, wx - 2, 8, 52, 36, '#2a2f37'); R(b, wx + 23, 8, 2, 36, '#2a2f37'); R(b, wx - 2, 25, 52, 1, '#2a2f37'); R(b, wx - 4, 43, 56, 2, '#7d838d'); } // ventanas
    R(b, 292, 6, 116, 38, '#11161d'); R(b, 292, 6, 116, 1, '#39424d'); R(b, 348, 44, 4, 3, '#2a2f37'); // marco del panel de KPIs
    R(b, 114, 14, 10, 14, '#f6f4ec'); R(b, 115, 15, 8, 8, '#e9b98f'); R(b, 117, 16, 4, 2, '#2a1d16'); R(b, 115, 23, 8, 4, CRIMSON); // foto enmarcada de la clienta
    // mamparas de vidrio del despacho y de la sala de reuniones
    const glass = (x, y, w, h) => { R(b, x, y, w, h, PAL.glass); R(b, x, y, Math.max(1, w), 1, PAL.glassEdge); };
    glass(17 * T, 3 * T, 3, 3 * T); glass(17 * T, 8 * T - 4, 3, T + 4); R(b, 17 * T - 1, 3 * T, 5, 2, '#2a2f37'); R(b, 17 * T - 1, 9 * T - 1, 5, 2, '#2a2f37');
    glass(17 * T, 9 * T - 2, VW - 17 * T - 3, 3); R(b, 17 * T, 9 * T + 1, VW - 17 * T - 3, 2, '#2a2f37');
    glass(17 * T, 10 * T + 2, VW - 17 * T - 3, 3); glass(17 * T, 10 * T + 2, 3, T); glass(17 * T, 13 * T - 4, 3, 2 * T - 2);
    text(b, 'DIRECCION', 18 * T + 2, 9 * T - 9, '#dfe8f0'); text(b, 'SALA DE REUNIONES', 18 * T + 2, 10 * T + 6, '#dfe8f0');
  },
  drawWall(g, c) {
    const { t, hour = 12, S = {} } = c, [c1, c2, day] = sky(hour);
    for (const wx of [12, 66]) {
      const gr = g.createLinearGradient(0, 10, 0, 42); gr.addColorStop(0, c1); gr.addColorStop(1, c2); g.fillStyle = gr;
      g.fillRect(wx, 10, 23, 15); g.fillRect(wx + 25, 10, 23, 15); g.fillRect(wx, 26, 23, 17); g.fillRect(wx + 25, 26, 23, 17);
      const sil = day > .2 ? '#4f6f93' : '#0a0f22';
      [[0, 12], [6, 19], [12, 9], [19, 16], [27, 22], [34, 11], [40, 17]].forEach(([dx, h], i) => { R(g, wx + dx, 43 - h, 6, h, sil); if (day < .5) for (let k = 0; k < h - 3; k += 3) if ((i + k + wx) % 2) R(g, wx + dx + 2, 45 - h + k, 1, 1, '#ffd98a'); });
      R(g, wx + 23, 8, 2, 36, '#2a2f37'); R(g, wx - 2, 25, 52, 1, '#2a2f37');
    }
    // rótulo de la agencia
    const flick = (t * 7 | 0) % 53 !== 0, glow = flick ? CRIMSON : '#7a2436';
    if (flick) { g.globalAlpha = .14 + Math.sin(t * 2) * .03; R(g, 132, 6, 152, 34, CRIMSON); g.globalAlpha = 1; }
    bolt(g, 140, 12, GOLD); bolt(g, 268, 12, GOLD);
    bigText(g, 'SCARLETT STORM', 152, 11, glow); text(g, 'AGENCIA  ·  TALENT MANAGEMENT', 208 - textW('AGENCIA  ·  TALENT MANAGEMENT') / 2, 30, GOLD);
    // panel de KPIs del despacho, con datos reales
    const r = S.reddit || {}, kf = (S.agents || []).find(a => a.id === 'karma-farmer'), on = !!S.online;
    R(g, 294, 8, 112, 34, '#0b1117');
    text(g, 'KPIS · REDDIT', 297, 10, '#6f8aa6'); R(g, 398, 10, 3, 3, on ? ((t * 2 | 0) % 2 ? PAL.green : '#1d3b2a') : PAL.red);
    const row = (y, k, v, col) => { text(g, k, 297, y, '#8ea3b8'); text(g, v, 403 - textW(v), y, col); };
    const k7 = r.karma7d, k7s = k7 == null ? '—' : (k7 >= 0 ? '+' : '') + k7;
    row(17, 'KARMA 7 DIAS', k7s, k7 > 0 ? PAL.green : k7 < 0 ? PAL.red : '#e9f2fb');
    row(23, 'KARMA TOTAL', r.karma?.total != null ? String(r.karma.total) : '—', '#e9f2fb');
    row(29, 'POSTS 7 DIAS', String((r.posts || []).filter(p => p.createdAt > Date.now() - 7 * 864e5).length), '#e9f2fb');
    const next = kf?.nextRunAt ? new Intl.DateTimeFormat('es-ES', { timeZone: 'Europe/Madrid', hour: '2-digit', minute: '2-digit' }).format(new Date(kf.nextRunAt)) : (r.posts || []).some(p => p.createdAt > Date.now() - 20 * 3600e3) ? 'HECHO' : '—';
    row(35, 'PROXIMO POST', on ? next : 'SIN SEÑAL', on ? PAL.amber : PAL.red);
  },
  items(D, c) {
    const { g, now, S = {} } = c, staff = agency.layout(S.agents);
    // mesas de la planta abierta: ocupadas o vacantes
    SEATS.forEach(([sx, sy], i) => {
      const a = staff[i], dx = (sx - 1) * T, dy = (sy - 1) * T + 2, L = a ? look(a, c) : null;
      D.push({ y: dy + 12, f: () => {
        desk(g, dx, dy, { m1: L ? L.m[0] : 'off', m2: L ? L.m[1] : 'off', t: now, seed: sx + sy, color: a ? a.color : '#4a525e' });
        if (a) { R(g, dx + 44, dy + 2, 3, 3, (c.online ? LAMP[a.status] : null) || '#5a5f66'); if (a.status === 'working') papers(g, dx + 36, dy + 5, 2); }
        else { R(g, dx + 13, dy + 4, 31, 7, '#f6f4ec'); R(g, dx + 13, dy + 10, 31, 1, '#b9b3a4'); text(g, 'VACANTE', dx + 15, dy + 5, '#8a6f52'); }
        if (L?.sign) { R(g, dx + 14, dy - 18, 21, 7, '#b3352f'); text(g, L.sign, dx + 15, dy - 17, '#fff'); }
      } });
      D.push({ y: sy * T + 14.5, f: () => chair(g, sx * T + 8, sy * T + 15, true, a ? PAL.navy : '#3b4250') });
      if (a) D.push({ y: sy * T + 14, f: () => drawChar(g, sx * T + 8, sy * T + 14, a.look, { dir: 'up', pose: L.pose, seated: true, t: now + i * .37 }) });
    });
    // despacho del Director
    const [dsx, dsy] = DIRECTOR.seat, dcx = dsx * T + 8, dfy = dsy * T + 14, dir = (S.agents || []).find(a => a.id === 'director');
    D.push({ y: dfy - 1, f: () => chair(g, dcx, dfy + 1, false, '#4a1f2a') });
    D.push({ y: dfy - 2, f: () => { R(g, 18 * T + 2, 3 * T + 2, 28, 34, '#5b3b24'); for (let i = 0; i < 3; i++) { R(g, 18 * T + 3, 3 * T + 4 + i * 11, 26, 1, '#3f2817'); for (let k = 0; k < 6; k++) R(g, 18 * T + 4 + k * 4, 3 * T + 5 + i * 11, 3, 9 - (k % 3), ['#b3262c', '#2f4668', '#c9a55a', '#3f8f4f', '#f6f4ec', '#7d5fc7'][(k + i) % 6]); } } }); // librería
    D.push({ y: dfy - 2, f: () => { R(g, 23 * T + 4, 3 * T + 10, 30, 16, '#3f2817'); R(g, 23 * T + 4, 3 * T + 10, 30, 1, '#6b4324'); R(g, 23 * T + 8, 3 * T + 3, 6, 7, '#2a2f37'); R(g, 23 * T + 9, 3 * T + 4, 4, 5, '#f2c94c'); R(g, 23 * T + 22, 3 * T + 4, 8, 6, '#c9a55a'); } }); // aparador con trofeo
    const dl = dir ? (c.online ? dir.status : 'offline') : 'offline', sipping = dl === 'resting' && (now % 24) < 4;
    D.push({ y: dfy, f: () => drawChar(g, dcx, dfy, LOOKS.director, { dir: 'down', pose: dl === 'thinking' ? 'talk' : dl === 'offline' ? 'sleep' : sipping ? 'drink' : 'sit', seated: true, t: now }) });
    D.push({ y: dfy + 2, f: () => { const x = dcx - 30, y = dfy - 6; R(g, x + 2, y + 24, 60, 3, 'rgba(0,0,0,.25)'); R(g, x, y, 60, 7, '#6b4324'); R(g, x, y, 60, 1, '#9a6436'); R(g, x, y + 7, 60, 16, '#4a2d1c'); R(g, x + 2, y + 9, 56, 12, '#5b3b24'); R(g, x + 21, y + 13, 18, 5, '#2b2622'); text(g, 'DIRECTOR', x + 22, y + 13, GOLD); R(g, x + 6, y - 6, 16, 7, '#20242b'); R(g, x + 13, y - 3, 2, 2, '#8f98a3'); R(g, x + 44, y + 1, 8, 4, '#f6f4ec'); R(g, x + 45, y + 2, 5, 1, '#9aa'); R(g, x + 30, y + 1, 4, 4, '#f5f5f0'); R(g, x + 31, y + 2, 2, 1, '#6b4324'); } }); // mesa con nombre
    for (const [gx, gy] of [[19, 7], [23, 7]]) D.push({ y: gy * T + 14.5, f: () => chair(g, gx * T + 8, gy * T + 15, true, '#4a1f2a') });
    D.push({ y: 8 * T + 10, f: () => plant(g, 24 * T + 10, 8 * T + 10, now, true) });
    // sala de reuniones
    D.push({ y: 12 * T + 10, f: () => { const x = 19 * T, y = 11 * T + 10; R(g, x + 2, y + 18, 72, 3, 'rgba(0,0,0,.22)'); R(g, x, y, 76, 16, '#e9e2d2'); R(g, x, y, 76, 1, '#fff'); R(g, x, y + 16, 76, 3, '#b9b3a4'); R(g, x + 30, y + 4, 14, 7, '#2a2f37'); R(g, x + 8, y + 5, 7, 6, '#f6f4ec'); R(g, x + 56, y + 4, 4, 4, '#f5f5f0'); } });
    for (const [cx, up] of [[20, true], [22, true], [24, true]]) D.push({ y: 11 * T + 9, f: () => chair(g, cx * T, 11 * T + 10, !up, PAL.navy) });
    for (const cx of [20, 22, 24]) D.push({ y: 13 * T + 15, f: () => chair(g, cx * T, 13 * T + 14, true, PAL.navy) });
    D.push({ y: 13 * T + 4, f: () => { const x = VW - 24, y = 11 * T - 2; R(g, x, y, 19, 30, '#f6f4ec'); R(g, x, y, 14, 1, '#fff'); text(g, 'PLAN', x + 1, y + 2, CRIMSON); for (let i = 0; i < 4; i++) R(g, x + 2, y + 10 + i * 4, 10 - (i % 2) * 4, 1, '#8ea3b8'); R(g, x + 8, y + 30, 2, 8, '#8f98a3'); } });
    // zona común: café, fuente de agua, impresora, plantas
    D.push({ y: 3 * T + 15, f: () => coffeeMachine(g, 1 * T + 2, 3 * T - 6, now) });
    D.push({ y: 3 * T + 15, f: () => { const x = 3 * T + 4, y = 3 * T - 8; R(g, x, y + 10, 10, 14, '#d7dde4'); R(g, x + 1, y, 8, 10, '#8fd3ff'); R(g, x + 1, y, 8, 2, '#bfe8ff'); R(g, x + 3, y + 13, 4, 2, '#5d7186'); } });
    D.push({ y: 3 * T + 15, f: () => { const x = 6 * T, y = 3 * T + 2; R(g, x, y, 22, 12, '#c9cdd3'); R(g, x, y, 22, 1, '#eef0f2'); R(g, x + 3, y + 3, 16, 2, '#2a2f37'); R(g, x + 4, y - 3, 12, 3, '#f6f4ec'); R(g, x + 18, y + 7, 2, 2, (now * 2 | 0) % 2 ? PAL.green : '#1d3b2a'); } });
    D.push({ y: 3 * T + 15, f: () => { const x = 10 * T - 2, y = 3 * T - 4; R(g, x, y, 42, 18, '#e9e2d2'); R(g, x + 1, y + 1, 40, 16, '#fbf8f0'); text(g, 'OBJETIVOS', x + 2, y + 2, CRIMSON); text(g, '1 KARMA', x + 2, y + 8, '#55666f'); text(g, '2 FANS', x + 2, y + 13, '#9aa3ad'); } });
    for (const [px, py] of [[1, 13], [16, 13], [16, 4], [1, 8]]) D.push({ y: py * T + 14, f: () => plant(g, px * T + 8, py * T + 14, now, true) });
    // etiquetas y bocadillos encima de todo
    D.push({ y: 999, f: () => {
      staff.forEach((a, i) => { const [sx, sy] = SEATS[i], L = look(a, c); nameTag(g, sx * T + 8, sy * T + 17, a.name.toUpperCase(), a.color); if (L.say) bubble(g, sx * T + 8, sy * T - 30, L.say, L.say === 'ERROR' ? PAL.red : INK); });
      if (dl === 'thinking') bubble(g, dcx, dfy - 36, 'PENSANDO' + '...'.slice(0, (now * 3 | 0) % 4), INK);
      else if (dl === 'offline') bubble(g, dcx, dfy - 36, 'SIN CONEXION', PAL.red);
    } });
  },
  // Zonas que se pueden pulsar en el lienzo: personas y algún objeto.
  hits(S = {}) {
    const out = [{ id: 'director', x: DIRECTOR.seat[0] * T - 6, y: DIRECTOR.seat[1] * T - 16, w: 28, h: 46 }, { id: 'kpis', x: 292, y: 6, w: 116, h: 38 }];
    agency.layout(S.agents).forEach((a, i) => { const [sx, sy] = SEATS[i]; out.push({ id: a.id, x: (sx - 1) * T, y: (sy - 1) * T - 14, w: 48, h: 50 }); });
    return out;
  }
};
