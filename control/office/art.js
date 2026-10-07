// Agent Office · pixel art dibujado por código. Sin imágenes externas.
// Todas las coordenadas son píxeles lógicos (tile = 16 px).
export const T = 16, COLS = 26, ROWS = 15, VW = COLS * T, VH = ROWS * T;
export const R = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x | 0, y | 0, w | 0, h | 0); };

export const PAL = {
  floorA: '#b47a45', floorB: '#a96f3c', floorC: '#bd8450', floorLine: '#8c5a30',
  wall: '#e9dfc6', wallShade: '#d6c9a9', trim: '#5b3b24', trimDark: '#3f2817', base: '#6e4a2e',
  navy: '#27425f', navyDark: '#1b2f47', navyLight: '#3b5f85', rug: '#2c4a6b', rugEdge: '#c9a55a',
  wood: '#9a6436', woodLight: '#b98049', woodDark: '#6b4324',
  metal: '#aab3bd', metalDark: '#6f7985', glass: 'rgba(170,215,235,.28)', glassEdge: 'rgba(225,245,255,.75)',
  screen: '#0f1a26', ink: '#1a1410', green: '#63d08a', red: '#f0605d', amber: '#f2b84b', blue: '#5cb7ea', lilac: '#c9b3f5',
  leaf: '#3f8f4f', leafDark: '#2c6a3a', leafLight: '#62b46a', pot: '#b5623d'
};

// ---------- Fuente 3x5 ----------
const GL = {
  A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110', E: '111100110100111', F: '111100110100100',
  G: '011100101101011', H: '101101111101101', I: '111010010010111', J: '001001001101010', K: '101101110101101', L: '100100100100111',
  M: '101111111101101', N: '110101101101101', O: '010101101101010', P: '110101110100100', Q: '010101101110011', R: '110101110101101',
  S: '011100010001110', T: '111010010010010', U: '101101101101111', V: '101101101101010', W: '101101111111101', X: '101101010101101',
  Y: '101101010010010', Z: '111001010100111', 0: '111101101101111', 1: '010110010010111', 2: '110001010100111', 3: '110001010001110',
  4: '101101111001001', 5: '111100110001110', 6: '011100111101111', 7: '111001010010010', 8: '111101111101111', 9: '111101111001110',
  '.': '000000000000010', ',': '000000000010100', ':': '000010000010000', '-': '000000111000000', '+': '000010111010000',
  '%': '101001010100101', '/': '001001010100100', '€': '011110100110011', '$': '011110010011110', '!': '010010010000010',
  '?': '110001010000010', '>': '100010001010100', '<': '001010100010001', '=': '000111000111000', '·': '000000010000000',
  '~': '000011110000000', "'": '010010000000000', '(': '001010010010001', ')': '100010010010100', '¡': '010000010010010', '¿': '010000010100011', '«': '000011110011000', '»': '000110011110000'
};
const plain = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();
export function text(g, str, x, y, c, max = 999) {
  g.fillStyle = c; let cx = x | 0;
  for (const ch of plain(str)) {
    if (cx - x > max - 3) break;
    const m = GL[ch];
    if (m) for (let i = 0; i < 15; i++) if (m[i] === '1') g.fillRect(cx + i % 3, (y | 0) + (i / 3 | 0), 1, 1);
    cx += 4;
  }
  return cx - x;
}
export const textW = s => plain(s).length * 4 - 1;

// ---------- Personajes ----------
export const LOOKS = {
  scout:    { skin: '#e9b98f', hair: '#6b4226', style: 'curly', shirt: '#c9cdd3', shirt2: '#a9aeb6', pants: '#3d5f8f', shoes: '#f1f1ee', detail: 'hoodie' },
  analyst:  { skin: '#e7b58a', hair: '#2a1d16', style: 'curly', shirt: '#dfa22a', shirt2: '#bb8420', pants: '#2c2c30', shoes: '#f1f1ee', glasses: true },
  risk:     { skin: '#d9a273', hair: '#17110f', style: 'long', shirt: '#b3262c', shirt2: '#8e1c22', pants: '#efe6d6', shoes: '#2b2622', flower: true, detail: 'vneck', earrings: true },
  operator: { skin: '#e2ad82', hair: '#17110f', style: 'bun', shirt: '#eadfcd', shirt2: '#c9bca6', pants: '#26262a', shoes: '#2b2622', detail: 'dots', earrings: true },
  auditor:  { skin: '#e9b98f', hair: '#8a5a34', style: 'wavy', shirt: '#e58a78', shirt2: '#c46f5f', pants: '#3d5f8f', shoes: '#f1f1ee' },
  designer: { skin: '#dba87c', hair: '#2a1d16', style: 'short', shirt: '#8f98a3', shirt2: '#737c87', pants: '#2f4668', shoes: '#f1f1ee', beard: true },
  cesar:    { skin: '#e2ad82', hair: '#3a2718', style: 'short', shirt: '#f3ead9', shirt2: '#d5cab5', pants: '#1f1f24', shoes: '#f1f1ee', beard: true, shades: true }
};
const dark = (hex, k = .72) => { const n = parseInt(hex.slice(1), 16); const f = v => Math.max(0, Math.min(255, v * k | 0)); return `rgb(${f(n >> 16)},${f(n >> 8 & 255)},${f(n & 255)})`; };

function hairFront(g, cx, y, L) {
  const h = L.hair, hd = dark(h);
  R(g, cx - 5, y, 10, 4, h); R(g, cx - 4, y - 1, 8, 1, h); R(g, cx - 5, y + 3, 10, 1, hd); R(g, cx - 5, y + 4, 1, 2, h); R(g, cx + 4, y + 4, 1, 2, h);
  if (L.style === 'curly') { for (let i = 0; i < 5; i++) R(g, cx - 5 + i * 2, y - 2 + (i % 2), 2, 2, h); R(g, cx - 6, y + 1, 1, 4, h); R(g, cx + 5, y + 1, 1, 4, h); R(g, cx - 3, y + 3, 2, 1, h); R(g, cx + 1, y + 3, 2, 1, h); }
  if (L.style === 'wavy') { R(g, cx - 5, y + 3, 4, 2, h); R(g, cx + 3, y + 3, 2, 1, h); R(g, cx - 6, y + 1, 1, 3, h); }
  if (L.style === 'long') { R(g, cx - 6, y + 1, 2, 15, h); R(g, cx + 4, y + 1, 2, 15, h); R(g, cx - 1, y + 3, 1, 1, L.skin); }
  if (L.style === 'bun') { R(g, cx - 2, y - 4, 4, 3, h); R(g, cx - 3, y - 3, 6, 2, h); R(g, cx - 1, y + 3, 1, 1, L.skin); }
  if (L.style === 'short') R(g, cx - 5, y + 3, 10, 1, h);
  if (L.flower) { R(g, cx + 3, y + 1, 3, 3, '#e03131'); R(g, cx + 4, y + 2, 1, 1, '#ffd43b'); }
}
function hairBack(g, cx, y, L) {
  const h = L.hair, hd = dark(h);
  R(g, cx - 5, y, 10, 9, h); R(g, cx - 4, y - 1, 8, 1, h); R(g, cx - 4, y + 8, 8, 1, hd);
  if (L.style === 'curly') { for (let i = 0; i < 5; i++) R(g, cx - 5 + i * 2, y - 2 + (i % 2), 2, 2, h); R(g, cx - 6, y + 1, 1, 5, h); R(g, cx + 5, y + 1, 1, 5, h); R(g, cx - 3, y + 3, 1, 1, hd); R(g, cx + 2, y + 5, 1, 1, hd); }
  if (L.style === 'long') { R(g, cx - 6, y + 1, 12, 16, h); R(g, cx - 1, y + 4, 1, 12, hd); R(g, cx + 2, y + 9, 1, 7, hd); }
  if (L.style === 'bun') { R(g, cx - 2, y - 4, 4, 3, h); R(g, cx - 3, y - 3, 6, 2, h); R(g, cx - 1, y, 2, 1, hd); }
  if (L.style === 'wavy') { R(g, cx - 6, y + 1, 1, 4, h); R(g, cx - 2, y + 3, 3, 1, hd); }
  if (L.flower) { R(g, cx - 6, y + 1, 3, 3, '#e03131'); R(g, cx - 5, y + 2, 1, 1, '#ffd43b'); }
}

// o: {dir, pose, t, sweat}. pose: stand|walk|sit|type|drink|cheer|panic|sleep|talk
// Sprite de 16x28 px: cabeza 10, tronco 9, piernas 6. Origen = centro de los pies.
function body(g, cx, fy, L, o) {
  const dir = o.dir || 'down', pose = o.pose || 'stand', t = o.t || 0;
  const f = pose === 'walk' ? (t * 7 | 0) % 4 : 0;
  const seated = pose === 'sit' || pose === 'type' || pose === 'sleep' || o.seated;
  let bob = pose === 'walk' ? f % 2 : pose === 'type' ? ((t * 4 | 0) % 2) : 0;
  const lift = pose === 'cheer' ? -Math.abs(Math.sin(t * 9) * 3) | 0 : 0;
  if (pose === 'sleep') bob = 2;
  const X = cx + (pose === 'panic' ? ((t * 18 | 0) % 2 ? 1 : -1) : 0);
  const side = dir === 'left' || dir === 'right';
  if (dir === 'right') { g.save(); g.translate(cx * 2, 0); g.scale(-1, 1); }
  const drop = seated ? 4 : 0, by = fy - 15 + drop + lift + (pose === 'walk' ? bob : 0), hy = fy - 25 + drop + lift + bob;
  const s2 = L.shirt2, pd = dark(L.pants);
  if (!seated) {
    if (side) {
      if (f === 1 || f === 3) { R(g, X - 4, fy - 6 + lift, 3, 4, L.pants); R(g, X - 5, fy - 2 + lift, 4, 2, L.shoes); R(g, X + 1, fy - 6 + lift, 3, 3, pd); R(g, X + 1, fy - 3 + lift, 4, 2, L.shoes); }
      else { R(g, X - 2, fy - 6 + lift, 4, 4, L.pants); R(g, X - 3, fy - 2 + lift, 5, 2, L.shoes); }
    } else {
      const l = f === 1 ? 1 : 0, r = f === 3 ? 1 : 0;
      R(g, X - 4, fy - 6 + lift, 4, 4 - l, L.pants); R(g, X - 4, fy - 2 - l + lift, 4, 2, L.shoes);
      R(g, X, fy - 6 + lift, 4, 4 - r, L.pants); R(g, X, fy - 2 - r + lift, 4, 2, L.shoes); R(g, X - 1, fy - 5 + lift, 2, 3, pd);
    }
  } else if (dir === 'down') { R(g, X - 4, fy - 4, 3, 2, L.pants); R(g, X + 1, fy - 4, 3, 2, L.pants); R(g, X - 4, fy - 2, 3, 2, L.shoes); R(g, X + 1, fy - 2, 3, 2, L.shoes); }
  else if (side) { R(g, X - 5, fy - 4, 6, 2, L.pants); R(g, X - 6, fy - 2, 3, 2, L.shoes); }
  // tronco
  if (side) {
    R(g, X - 3, by, 7, 9, L.shirt); R(g, X - 3, by + 8, 7, 1, s2); R(g, X + 3, by + 1, 1, 7, s2);
    const sw = pose === 'walk' ? (f === 1 ? -2 : f === 3 ? 2 : 0) : 0;
    if (pose === 'drink') { R(g, X - 5, by + 2, 4, 2, s2); R(g, X - 7, by, 2, 3, '#f5f5f0'); }
    else if (pose === 'cheer' || pose === 'panic') { R(g, X - 1, by - 5, 2, 7, s2); R(g, X - 1, by - 6, 2, 1, L.skin); }
    else if (pose === 'talk') { const k = (t * 3 | 0) % 2; R(g, X - 4, by + 3 - k, 4, 2, s2); R(g, X - 5, by + 3 - k, 1, 2, L.skin); }
    else { R(g, X - 1 + sw, by + 2, 2, 6, s2); R(g, X - 1 + sw, by + 8, 2, 1, L.skin); }
  } else {
    R(g, X - 4, by, 8, 9, L.shirt); R(g, X - 4, by + 8, 8, 1, s2); R(g, X - 5, by, 1, 2, L.shirt); R(g, X + 4, by, 1, 2, L.shirt);
    if (dir === 'down') {
      R(g, X - 1, by, 2, 1, dark(L.skin, .86));
      if (L.detail === 'hoodie') { R(g, X - 1, by + 1, 1, 4, '#7b5a3c'); R(g, X + 1, by + 1, 1, 4, '#7b5a3c'); R(g, X - 2, by + 5, 4, 2, s2); }
      if (L.detail === 'dots') for (let i = 0; i < 8; i++) R(g, X - 3 + (i * 3) % 7, by + 1 + (i * 2) % 7, 1, 1, '#8a6f52');
      if (L.detail === 'vneck') { R(g, X - 1, by + 1, 2, 2, L.skin); R(g, X - 2, by, 1, 1, L.skin); R(g, X + 1, by, 1, 1, L.skin); }
      if (L.shades) { R(g, X - 1, by + 1, 2, 3, '#fff'); R(g, X - 3, by + 3, 1, 1, '#d33'); }
      if (L.glasses) R(g, X - 1, by + 3, 2, 2, '#3b5f85');
    }
    const aw = pose === 'walk' ? (f === 1 ? 1 : f === 3 ? -1 : 0) : 0;
    if (pose === 'cheer') { R(g, X - 6, by - 5, 2, 7, s2); R(g, X + 4, by - 5, 2, 7, s2); R(g, X - 6, by - 6, 2, 1, L.skin); R(g, X + 4, by - 6, 2, 1, L.skin); }
    else if (pose === 'panic') { R(g, X - 6, by - 4, 2, 6, s2); R(g, X + 4, by - 4, 2, 6, s2); R(g, X - 5, by - 5, 2, 1, L.skin); R(g, X + 3, by - 5, 2, 1, L.skin); }
    else if (pose === 'drink' && dir === 'down') { R(g, X - 5, by + 2, 1, 6, s2); R(g, X - 5, by + 8, 1, 1, L.skin); const up = (t * 1.1 | 0) % 3 === 0; R(g, X + 4, by + (up ? -1 : 3), 1, 4, s2); R(g, X + 2, by + (up ? -3 : 2), 3, 3, '#f5f5f0'); R(g, X + 2, by + (up ? -3 : 2), 3, 1, '#6b4324'); }
    else if (pose === 'talk' && dir === 'down') { const k = (t * 3 | 0) % 2; R(g, X - 5, by + 2, 1, 6, s2); R(g, X - 5, by + 8, 1, 1, L.skin); R(g, X + 4, by + 1 - k, 2, 4, s2); R(g, X + 5, by - k, 1, 1, L.skin); }
    else if (pose === 'type' && dir === 'up') { const k = (t * 9 | 0) % 2; R(g, X - 6, by + 1 - k, 2, 4, s2); R(g, X + 4, by + k, 2, 4, s2); }
    else { R(g, X - 5, by + 2 + aw, 1, 6, s2); R(g, X + 4, by + 2 - aw, 1, 6, s2); R(g, X - 5, by + 8 + aw, 1, 1, L.skin); R(g, X + 4, by + 8 - aw, 1, 1, L.skin); }
  }
  // cabeza
  if (dir === 'up') { R(g, X - 2, hy + 9, 4, 2, dark(L.skin, .86)); hairBack(g, X, hy, L); if (L.earrings) { R(g, X - 6, hy + 7, 1, 1, '#f2c94c'); R(g, X + 5, hy + 7, 1, 1, '#f2c94c'); } }
  else if (side) {
    R(g, X - 5, hy + 1, 9, 9, L.skin); R(g, X - 6, hy + 6, 1, 1, L.skin); R(g, X - 4, hy + 10, 7, 1, dark(L.skin, .86));
    const h = L.hair;
    R(g, X - 5, hy, 10, 3, h); R(g, X - 4, hy - 1, 8, 1, h); R(g, X, hy + 3, 5, 6, h); R(g, X + 4, hy + 1, 1, 8, h); R(g, X - 5, hy + 3, 2, 1, h);
    if (L.style === 'curly') { for (let i = 0; i < 5; i++) R(g, X - 5 + i * 2, hy - 2 + (i % 2), 2, 2, h); R(g, X + 5, hy + 1, 1, 6, h); }
    if (L.style === 'long') R(g, X, hy + 3, 6, 13, h);
    if (L.style === 'bun') R(g, X + 3, hy - 2, 4, 4, h);
    if (L.style === 'wavy') R(g, X - 6, hy + 1, 2, 2, h);
    if (L.flower) { R(g, X + 1, hy + 1, 3, 3, '#e03131'); R(g, X + 2, hy + 2, 1, 1, '#ffd43b'); }
    R(g, X + 1, hy + 6, 1, 2, dark(L.skin, .8));
    if (pose === 'sleep') R(g, X - 4, hy + 7, 2, 1, PAL.ink); else R(g, X - 4, hy + 6, 1, 2, PAL.ink);
    if (L.shades) R(g, X - 6, hy + 5, 5, 2, '#111'); if (L.glasses) { R(g, X - 6, hy + 5, 4, 1, '#20242b'); R(g, X - 6, hy + 8, 4, 1, '#20242b'); R(g, X - 6, hy + 5, 1, 3, '#20242b'); R(g, X - 3, hy + 5, 1, 4, '#20242b'); R(g, X - 2, hy + 6, 4, 1, '#20242b'); }
    if (L.beard) { R(g, X - 5, hy + 9, 6, 2, dark(L.hair, 1.15)); R(g, X - 1, hy + 7, 2, 2, dark(L.hair, 1.15)); }
    if ((pose === 'talk' && (t * 6 | 0) % 2) || pose === 'panic') R(g, X - 5, hy + 9, 2, 1, '#5a2420');
    if (L.earrings) R(g, X + 1, hy + 8, 1, 1, '#f2c94c');
  } else {
    R(g, X - 5, hy + 1, 10, 9, L.skin); R(g, X - 6, hy + 5, 1, 3, L.skin); R(g, X + 5, hy + 5, 1, 3, L.skin); R(g, X - 4, hy + 10, 8, 1, dark(L.skin, .86));
    const blink = pose === 'sleep' || ((t * 1000 + cx * 37) % 3400 < 130);
    if (blink) { R(g, X - 3, hy + 7, 2, 1, PAL.ink); R(g, X + 1, hy + 7, 2, 1, PAL.ink); }
    else { R(g, X - 3, hy + 6, 2, 2, '#fff'); R(g, X + 1, hy + 6, 2, 2, '#fff'); const e = pose === 'panic' ? 0 : 1; R(g, X - 3 + e, hy + 6, 1, 2, PAL.ink); R(g, X + 1, hy + 6, 1, 2, PAL.ink); if (pose === 'panic' || o.sweat) { R(g, X - 4, hy + 4, 3, 1, dark(L.hair, .8)); R(g, X + 1, hy + 4, 3, 1, dark(L.hair, .8)); } }
    R(g, X - 4, hy + 8, 1, 1, 'rgba(230,110,100,.5)'); R(g, X + 3, hy + 8, 1, 1, 'rgba(230,110,100,.5)');
    if (L.beard) { const bc = dark(L.hair, 1.15); R(g, X - 5, hy + 7, 1, 3, bc); R(g, X + 4, hy + 7, 1, 3, bc); R(g, X - 4, hy + 9, 8, 2, bc); R(g, X - 2, hy + 8, 4, 1, bc); }
    const talk = pose === 'talk' && (t * 6 | 0) % 2;
    if (pose === 'panic' || talk) R(g, X - 1, hy + 9, 2, 2, '#5a2420'); else if (pose === 'cheer') { R(g, X - 2, hy + 9, 4, 1, '#5a2420'); R(g, X - 1, hy + 10, 2, 1, '#fff'); } else R(g, X - 1, hy + 9, 2, 1, L.beard ? '#e6a08a' : dark(L.skin, .68));
    if (L.glasses) { g.fillStyle = '#20242b'; for (const q of [-5, 1]) { g.fillRect(X + q, hy + 5, 4, 1); g.fillRect(X + q, hy + 8, 4, 1); g.fillRect(X + q, hy + 5, 1, 4); g.fillRect(X + q + 3, hy + 5, 1, 4); } g.fillRect(X - 1, hy + 6, 2, 1); }
    if (L.shades) { R(g, X - 5, hy + 5, 10, 1, '#111'); R(g, X - 5, hy + 6, 4, 2, '#111'); R(g, X + 1, hy + 6, 4, 2, '#111'); R(g, X - 4, hy + 6, 1, 1, '#5d7186'); R(g, X + 2, hy + 6, 1, 1, '#5d7186'); }
    if (L.earrings) { R(g, X - 6, hy + 8, 1, 1, '#f2c94c'); R(g, X + 5, hy + 8, 1, 1, '#f2c94c'); }
    hairFront(g, X, hy, L);
  }
  if (dir === 'right') g.restore();
}
let OC, SC;
export function drawChar(g, cx, fy, L, o = {}) {
  cx = Math.round(cx); fy = Math.round(fy);
  if (!OC) { OC = document.createElement('canvas'); SC = document.createElement('canvas'); OC.width = SC.width = 40; OC.height = SC.height = 48; }
  const c = OC.getContext('2d'), s = SC.getContext('2d'), pose = o.pose || 'stand', t = o.t || 0;
  c.clearRect(0, 0, 40, 48); body(c, 20, 44, L, o);
  s.globalCompositeOperation = 'source-over'; s.clearRect(0, 0, 40, 48); s.drawImage(OC, 0, 0); s.globalCompositeOperation = 'source-in'; s.fillStyle = '#1c1512'; s.fillRect(0, 0, 40, 48);
  if (!(pose === 'sit' || pose === 'type' || pose === 'sleep' || o.seated)) { R(g, cx - 5, fy - 1, 10, 2, 'rgba(0,0,0,.25)'); R(g, cx - 4, fy + 1, 8, 1, 'rgba(0,0,0,.25)'); }
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) g.drawImage(SC, cx - 20 + dx, fy - 44 + dy);
  g.drawImage(OC, cx - 20, fy - 44);
  if (pose === 'panic' || o.sweat) { const k = (t * 6 | 0) % 3; R(g, cx - 8 - k, fy - 23 + k * 2, 1, 2, '#8fd3ff'); R(g, cx + 7 + k, fy - 24 + k * 2, 1, 2, '#8fd3ff'); }
  if (pose === 'sleep') { const k = (t * 1.5) % 3; text(g, 'Z', cx + 6 + k * 2, fy - 26 - k * 3, 'rgba(255,255,255,' + (1 - k / 3).toFixed(2) + ')'); }
}

// ---------- Mobiliario ----------
export function chair(g, cx, fy, back = true, c = PAL.navy) {
  if (back) { R(g, cx - 6, fy - 8, 12, 7, PAL.navyDark); R(g, cx - 5, fy - 7, 10, 5, c); R(g, cx - 5, fy - 7, 10, 1, PAL.navyLight); R(g, cx - 1, fy - 1, 2, 2, PAL.metalDark); R(g, cx - 4, fy + 1, 8, 1, PAL.metalDark); }
  else { R(g, cx - 5, fy - 16, 10, 9, c); R(g, cx - 5, fy - 16, 10, 1, PAL.navyLight); R(g, cx - 5, fy - 7, 10, 3, PAL.navyDark); R(g, cx - 4, fy - 4, 1, 4, PAL.metalDark); R(g, cx + 3, fy - 4, 1, 4, PAL.metalDark); }
}
export function monitor(g, x, y, mode, t, seed = 0) {
  R(g, x, y, 14, 10, '#11161d'); R(g, x + 1, y + 1, 12, 8, PAL.screen); R(g, x + 6, y + 10, 2, 2, '#2b323c'); R(g, x + 4, y + 12, 6, 1, '#2b323c');
  if (mode === 'off') { R(g, x + 2, y + 2, 3, 1, '#1c2a3a'); return; }
  if (mode === 'up' || mode === 'down') {
    const c = mode === 'up' ? PAL.green : PAL.red; let py = mode === 'up' ? 7 : 2;
    for (let i = 0; i < 12; i++) { const n = Math.sin(seed * 9 + i * 1.7 + Math.floor(t * 2) * .7) * 1.4; const d = mode === 'up' ? -i * .45 : i * .45; const yy = Math.max(1, Math.min(8, py + d + n)) | 0; R(g, x + 1 + i, y + yy, 1, 1, c); R(g, x + 1 + i, y + yy + 1, 1, 9 - yy - 1, mode === 'up' ? 'rgba(99,208,138,.18)' : 'rgba(240,96,93,.18)'); }
  } else if (mode === 'scan') {
    const o = (t * 6 | 0) % 8; for (let r = 0; r < 4; r++) R(g, x + 2, y + 2 + r * 2, 3 + ((seed * 7 + r * 5 + o) % 8), 1, r === o % 4 ? PAL.amber : '#3f6f96');
  } else if (mode === 'alert') {
    if ((t * 3 | 0) % 2) R(g, x + 1, y + 1, 12, 8, '#5b1717'); text(g, '!', x + 6, y + 3, PAL.red);
  } else if (mode === 'table') {
    for (let r = 0; r < 4; r++) { R(g, x + 2, y + 2 + r * 2, 4, 1, '#6f8aa6'); R(g, x + 8, y + 2 + r * 2, 3, 1, (seed + r) % 3 ? PAL.green : PAL.red); }
  } else if (mode === 'code') {
    const o = (t * 4 | 0); for (let r = 0; r < 4; r++) R(g, x + 2 + (r % 2), y + 2 + r * 2, 2 + ((seed * 3 + r * 7 + o) % 7), 1, [PAL.lilac, PAL.blue, PAL.green, '#6f8aa6'][r]);
  } else if (mode === 'game') {
    R(g, x + 1, y + 1, 12, 8, '#1d5b3a'); for (let i = 0; i < 4; i++) { R(g, x + 2 + i * 3, y + 2 + ((i + (t | 0)) % 2), 2, 3, '#f6f4ec'); R(g, x + 2 + i * 3, y + 2 + ((i + (t | 0)) % 2), 1, 1, i % 2 ? PAL.red : PAL.ink); } R(g, x + 3 + ((t * 3 | 0) % 7), y + 7, 2, 1, '#f6f4ec');
  } else if (mode === 'cat') {
    for (let r = 0; r < 4; r++) R(g, x + 2, y + 2 + r * 2, 2 + ((seed + r * 5 + (t * 8 | 0)) % 9), 1, r % 2 ? PAL.lilac : PAL.amber);
  } else if (mode === 'bars') {
    for (let i = 0; i < 5; i++) { const h = 2 + ((seed * 5 + i * 3 + (t | 0)) % 5); R(g, x + 2 + i * 2, y + 9 - h, 1, h, i % 2 ? PAL.blue : PAL.lilac); }
  }
}
export function desk(g, x, y, o) {
  // superficie 48x13 con dos monitores encima
  R(g, x + 1, y + 13, 46, 3, 'rgba(0,0,0,.18)');
  R(g, x, y + 1, 48, 10, PAL.woodLight); R(g, x, y + 1, 48, 1, '#cf965c'); R(g, x, y + 11, 48, 3, PAL.woodDark); R(g, x + 1, y + 14, 2, 2, PAL.trimDark); R(g, x + 45, y + 14, 2, 2, PAL.trimDark);
  monitor(g, x + 8, y - 9, o.m1 || 'off', o.t, o.seed); monitor(g, x + 25, y - 9, o.m2 || 'off', o.t, o.seed + 3);
  R(g, x + 14, y + 6, 18, 3, '#2a2f37'); R(g, x + 15, y + 7, 16, 1, '#4a525e'); R(g, x + 35, y + 6, 3, 3, '#2a2f37');
  R(g, x + 3, y + 4, 4, 4, o.color || PAL.lilac); R(g, x + 4, y + 5, 2, 2, '#fff');
  if (o.seed % 3 === 0) { R(g, x + 41, y - 3, 4, 6, PAL.pot); R(g, x + 40, y - 7, 6, 5, PAL.leaf); R(g, x + 42, y - 9, 2, 3, PAL.leafLight); }
  else if (o.seed % 3 === 1) { R(g, x + 42, y + 2, 4, 4, '#f5f5f0'); R(g, x + 46, y + 3, 1, 2, '#f5f5f0'); R(g, x + 43, y + 3, 2, 1, '#6b4324'); }
  else { R(g, x + 40, y + 2, 6, 7, '#f2efe6'); R(g, x + 41, y + 4, 4, 1, '#9aa'); R(g, x + 41, y + 6, 3, 1, '#9aa'); }
}
// health: 'wilt' (mes en peligro), 'bloom' (alquiler pagado) o normal
export function plant(g, cx, fy, t, big = true, health = '') {
  const s = Math.sin(t * 1.3 + cx) > .6 ? 1 : 0;
  if (health === 'wilt') {
    R(g, cx - 4, fy - 1, 9, 2, 'rgba(0,0,0,.2)'); R(g, cx - 3, fy - 7, 7, 7, PAL.pot); R(g, cx - 4, fy - 8, 9, 2, '#cf7a51');
    if (big) { R(g, cx - 1, fy - 17, 2, 9, '#7a6a3a'); R(g, cx - 6, fy - 13, 5, 3, '#8d7b3f'); R(g, cx - 7, fy - 11, 2, 3, '#8d7b3f'); R(g, cx + 1, fy - 15, 5, 3, '#a08a45'); R(g, cx + 5, fy - 13, 2, 4, '#a08a45'); R(g, cx - 2, fy - 19, 3, 2, '#6f8a3a'); }
    else { R(g, cx - 4, fy - 11, 9, 3, '#8d7b3f'); R(g, cx - 5, fy - 9, 2, 2, '#a08a45'); R(g, cx + 4, fy - 9, 2, 2, '#a08a45'); }
    if ((t * .7 + cx | 0) % 9 === 0) R(g, cx + 6, fy - 4, 2, 1, '#a08a45');
    return;
  }
  R(g, cx - 4, fy - 1, 9, 2, 'rgba(0,0,0,.2)'); R(g, cx - 3, fy - 7, 7, 7, PAL.pot); R(g, cx - 4, fy - 8, 9, 2, '#cf7a51');
  if (big) { R(g, cx - 6 + s, fy - 17, 5, 9, PAL.leafDark); R(g, cx + 1 + s, fy - 19, 5, 11, PAL.leaf); R(g, cx - 2 + s, fy - 23, 4, 14, PAL.leaf); R(g, cx - 1 + s, fy - 25, 2, 4, PAL.leafLight); R(g, cx - 7 + s, fy - 14, 2, 3, PAL.leaf); R(g, cx + 5 + s, fy - 15, 2, 3, PAL.leafLight); }
  else { R(g, cx - 4, fy - 13, 9, 5, PAL.leaf); R(g, cx - 2 + s, fy - 16, 5, 4, PAL.leafLight); }
  if (health === 'bloom') { const top = big ? fy - 24 : fy - 16; for (const [dx, dy, c] of [[-4, 6, '#ff8fb1'], [3, 3, '#ffd43b'], [0, 0, '#ff8fb1']]) { R(g, cx + dx + s, top + dy, 2, 2, c); R(g, cx + dx + s, top + dy, 1, 1, '#fff'); } }
}
export function sofa(g, x, y) {
  R(g, x, y + 14, 48, 3, 'rgba(0,0,0,.2)'); R(g, x, y - 6, 48, 12, PAL.navy); R(g, x, y - 6, 48, 1, PAL.navyLight); R(g, x + 2, y + 4, 44, 8, PAL.navyLight); R(g, x, y + 2, 4, 12, PAL.navyDark); R(g, x + 44, y + 2, 4, 12, PAL.navyDark); R(g, x + 2, y + 12, 44, 3, PAL.navyDark);
  R(g, x + 23, y + 4, 1, 8, PAL.navy); R(g, x + 6, y - 2, 7, 7, '#d8c7a3'); R(g, x + 35, y - 2, 7, 7, '#b8553f');
}
export function tank(g, x, y, level, t) {
  // depósito de tokens: bidón de agua cuyo nivel = tokens restantes
  const low = level < .2, blink = low && (t * 3 | 0) % 2;
  R(g, x + 1, y + 15, 12, 2, 'rgba(0,0,0,.22)'); R(g, x + 2, y + 2, 10, 14, '#dfe5ea'); R(g, x + 2, y + 2, 10, 1, '#fff'); R(g, x + 3, y + 8, 8, 3, '#b9c2cb'); R(g, x + 5, y + 9, 1, 2, PAL.blue); R(g, x + 8, y + 9, 1, 2, PAL.red);
  R(g, x + 3, y - 14, 8, 16, 'rgba(190,225,245,.35)'); R(g, x + 3, y - 14, 8, 1, PAL.glassEdge); R(g, x + 3, y - 14, 1, 16, PAL.glassEdge);
  const h = Math.round(15 * Math.max(0, Math.min(1, level)));
  R(g, x + 4, y + 2 - h, 6, h, blink ? '#ff8f8f' : low ? PAL.red : level < .45 ? PAL.amber : PAL.blue);
  if (h > 3) { const b = (t * 5 | 0) % h; R(g, x + 5 + (b % 3), y + 1 - b, 1, 1, 'rgba(255,255,255,.8)'); }
  R(g, x + 4, y - 16, 6, 2, '#6f7985');
}
export function coffeeMachine(g, x, y, t) {
  R(g, x, y - 12, 13, 14, '#2f343b'); R(g, x, y - 12, 13, 2, '#555d68'); R(g, x + 2, y - 8, 9, 5, '#14181d'); R(g, x + 5, y - 5, 3, 2, '#f5f5f0'); R(g, x + 9, y - 10, 2, 1, PAL.green);
  const k = (t * 3) % 3; R(g, x + 6, y - 15 - k, 1, 2, `rgba(255,255,255,${.5 - k * .15})`); R(g, x + 8, y - 14 - k, 1, 1, `rgba(255,255,255,${.4 - k * .12})`);
}
export function whiteboard(g, x, y, title, lines) {
  R(g, x + 4, y + 26, 2, 8, PAL.metalDark); R(g, x + 58, y + 26, 2, 8, PAL.metalDark); R(g, x + 2, y + 33, 6, 1, PAL.metalDark); R(g, x + 56, y + 33, 6, 1, PAL.metalDark);
  R(g, x, y, 64, 27, PAL.metal); R(g, x + 1, y + 1, 62, 25, '#f6f4ec'); R(g, x + 1, y + 24, 62, 2, '#d9d4c4'); R(g, x + 48, y + 23, 5, 2, '#c0392b'); R(g, x + 55, y + 23, 5, 2, '#2b6cb0');
  text(g, title, x + 3, y + 3, '#c0392b', 58); R(g, x + 3, y + 9, 40, 1, '#c0392b');
  lines.slice(0, 2).forEach((l, i) => text(g, l, x + 3, y + 11 + i * 6, i ? '#2b6cb0' : '#2b3a4a', 60));
}
export function arcade(g, x, y, t) {
  R(g, x + 1, y + 15, 12, 2, 'rgba(0,0,0,.25)'); R(g, x + 1, y - 14, 12, 30, '#3a2a5c'); R(g, x + 1, y - 14, 12, 2, '#7d5fc7'); R(g, x + 2, y - 10, 10, 8, '#0b0f14');
  const k = (t * 4 | 0) % 6; R(g, x + 3 + k, y - 7, 2, 2, PAL.amber); R(g, x + 9, y - 8 + (k % 3), 1, 1, PAL.red); R(g, x + 2, y, 10, 3, '#241a3b'); R(g, x + 4, y - 1, 1, 2, PAL.red); R(g, x + 8, y + 1, 2, 1, PAL.blue);
}
export function aquarium(g, x, y, t) {
  R(g, x, y + 4, 30, 12, PAL.woodDark); R(g, x, y - 10, 30, 14, '#1f6f9c'); R(g, x, y - 10, 30, 1, PAL.glassEdge); R(g, x + 1, y + 1, 28, 2, '#c8b27a');
  for (let i = 0; i < 3; i++) { const fx = x + 3 + ((t * (5 + i * 2) + i * 9) % 22), fyy = y - 7 + i * 3; R(g, fx, fyy, 3, 2, [PAL.amber, '#ff8a65', PAL.lilac][i]); R(g, fx - 1, fyy, 1, 2, '#fff8'); }
  R(g, x + 22, y - 3, 1, 4, PAL.leafLight); R(g, x + 24, y - 5, 1, 6, PAL.leaf);
}

// ---------- Vida de oficina ----------
export function papers(g, x, y, n) { for (let i = 0; i < Math.min(6, n); i++) { R(g, x + (i % 2), y - i * 2, 7, 2, i % 2 ? '#f2efe6' : '#e2ddcf'); R(g, x + 1 + (i % 2), y - i * 2, 4, 1, '#b9b3a4'); } }
export function cobweb(g, x, y, big) {
  const c = 'rgba(235,240,245,.85)'; for (let i = 0; i < (big ? 9 : 6); i++) { R(g, x + i, y + i, 1, 1, c); if (i % 2 === 0) { R(g, x + i, y, 1, 1, c); R(g, x, y + i, 1, 1, c); } }
  R(g, x + 2, y + 1, 2, 1, c); R(g, x + 1, y + 2, 1, 2, c); if (big) { R(g, x + 4, y + 2, 3, 1, c); R(g, x + 2, y + 4, 1, 3, c); R(g, x + 6, y + 7, 1, 3, '#2b2622'); R(g, x + 5, y + 10, 3, 2, '#2b2622'); }
}
export function trophy(g, x, y, gold = true) { const c = gold ? '#f2c94c' : '#b9c2cb'; R(g, x, y, 5, 3, c); R(g, x - 1, y, 1, 2, c); R(g, x + 5, y, 1, 2, c); R(g, x + 2, y + 3, 1, 2, c); R(g, x + 1, y + 5, 3, 1, '#6b4324'); R(g, x + 1, y, 1, 1, '#fff'); }
export function pizza(g, x, y) { R(g, x, y, 12, 9, '#c9a26b'); R(g, x, y, 12, 1, '#e3c08a'); R(g, x + 1, y + 2, 10, 6, '#e8c15a'); for (const [dx, dy] of [[2, 3], [6, 2], [8, 5], [4, 6]]) R(g, x + dx, y + dy, 2, 2, '#c0392b'); R(g, x + 9, y + 2, 2, 3, '#c9a26b'); }
export function bell(g, x, y, t, ring = 0) {
  const sw = ring > 0 ? Math.round(Math.sin(t * 30) * 2) : 0;
  R(g, x + 3, y + 22, 8, 2, 'rgba(0,0,0,.22)'); R(g, x + 6, y, 2, 22, PAL.woodDark); R(g, x + 3, y + 20, 8, 2, PAL.wood); R(g, x + 2, y - 2, 10, 2, PAL.woodDark);
  R(g, x + 3 + sw, y + 1, 8, 6, '#d9a531'); R(g, x + 4 + sw, y, 6, 1, '#f2c94c'); R(g, x + 2 + sw, y + 7, 10, 2, '#b98a22'); R(g, x + 4 + sw, y + 2, 1, 3, '#fff3b0'); R(g, x + 6 + sw * 2, y + 9, 2, 2, '#6b4324');
  if (ring > 0) { R(g, x - 1, y + 2, 1, 3, '#fff3b0'); R(g, x + 14, y + 2, 1, 3, '#fff3b0'); R(g, x - 3, y + 1, 1, 5, 'rgba(255,243,176,.5)'); R(g, x + 16, y + 1, 1, 5, 'rgba(255,243,176,.5)'); }
}
export function dartboard(g, x, y, dart) {
  R(g, x, y, 13, 13, '#2b2622'); R(g, x + 1, y + 1, 11, 11, '#e9dfc6'); R(g, x + 2, y + 2, 9, 9, '#27425f'); R(g, x + 3, y + 3, 7, 7, '#e9dfc6'); R(g, x + 4, y + 4, 5, 5, PAL.red); R(g, x + 6, y + 6, 1, 1, '#fff');
  if (dart) { R(g, x + dart[0], y + dart[1], 1, 1, '#111'); R(g, x + dart[0] + 1, y + dart[1] - 1, 2, 1, PAL.amber); }
}
export function neon(g, x, y, str, t) {
  const on = (t * 7 | 0) % 23 !== 0, c = on ? ['#ff5fa2', '#5ce1ff', '#ffe45c'][(t * .25 | 0) % 3] : '#5a3550', w = textW(str);
  if (on) { g.globalAlpha = .22; R(g, x - 3, y - 3, w + 6, 11, c); g.globalAlpha = .18; R(g, x - 5, y - 5, w + 10, 15, c); g.globalAlpha = 1; }
  text(g, str, x, y, c); text(g, str, x, y - 1, 'rgba(255,255,255,' + (on ? .55 : .1) + ')');
}
export function coffeePro(g, x, y, t) {
  R(g, x - 1, y - 16, 16, 18, '#c7ced6'); R(g, x - 1, y - 16, 16, 2, '#f0f3f6'); R(g, x + 1, y - 12, 12, 6, '#1b2026'); R(g, x + 2, y - 11, 4, 2, PAL.green); R(g, x + 8, y - 11, 4, 1, PAL.amber);
  R(g, x + 3, y - 5, 2, 3, '#6f7985'); R(g, x + 9, y - 5, 2, 3, '#6f7985'); R(g, x + 2, y - 2, 4, 3, '#f5f5f0'); R(g, x + 8, y - 2, 4, 3, '#f5f5f0'); R(g, x + 14, y - 13, 2, 8, '#8f98a3');
  for (let i = 0; i < 2; i++) { const k = (t * 3 + i * 1.3) % 3; R(g, x + 4 + i * 6, y - 19 - k, 1, 2, `rgba(255,255,255,${.6 - k * .18})`); }
}
// gato: st = walk|sit|sleep; dir = left|right
export function cat(g, cx, fy, t, st = 'sit', dir = 'left') {
  const c = '#d98a3d', d = '#b06a26', w = '#f6efe2';
  if (dir === 'right') { g.save(); g.translate(cx * 2, 0); g.scale(-1, 1); }
  if (st === 'sleep') { R(g, cx - 5, fy - 4, 10, 4, c); R(g, cx - 6, fy - 3, 2, 3, c); R(g, cx - 5, fy - 5, 3, 2, c); R(g, cx - 5, fy - 6, 1, 1, d); R(g, cx - 3, fy - 6, 1, 1, d); R(g, cx + 3, fy - 2, 3, 1, d); R(g, cx - 2, fy - 4, 2, 1, d); R(g, cx + 1, fy - 4, 2, 1, d); }
  else {
    const k = st === 'walk' ? (t * 8 | 0) % 2 : 0, sit = st === 'sit';
    R(g, cx - 4, fy - 1, 9, 1, 'rgba(0,0,0,.2)');
    R(g, cx - 3, fy - (sit ? 7 : 6), 8, sit ? 6 : 4, c); R(g, cx - 1, fy - (sit ? 6 : 5), 2, 1, d); R(g, cx + 2, fy - (sit ? 6 : 5), 2, 1, d);
    if (!sit) { R(g, cx - 3 + k, fy - 2, 1, 2, d); R(g, cx - 1 - k, fy - 2, 1, 2, c); R(g, cx + 2 + k, fy - 2, 1, 2, d); R(g, cx + 4 - k, fy - 2, 1, 2, c); } else { R(g, cx - 3, fy - 1, 2, 1, w); R(g, cx, fy - 1, 2, 1, w); }
    R(g, cx - 6, fy - (sit ? 10 : 9), 5, 4, c); R(g, cx - 6, fy - (sit ? 11 : 10), 1, 1, c); R(g, cx - 2, fy - (sit ? 11 : 10), 1, 1, c); R(g, cx - 5, fy - (sit ? 9 : 8), 1, 1, '#1a1410'); R(g, cx - 3, fy - (sit ? 9 : 8), 1, 1, '#1a1410'); R(g, cx - 5, fy - (sit ? 7 : 6), 2, 1, w);
    const tail = Math.round(Math.sin(t * 3) * 1.5); R(g, cx + 5, fy - (sit ? 4 : 7) + tail, 1, 3, d); R(g, cx + 6, fy - (sit ? 5 : 8) + tail, 1, 2, d);
  }
  if (dir === 'right') g.restore();
}
export function roomba(g, x, y, t, rider) { R(g, x - 4, y + 2, 9, 1, 'rgba(0,0,0,.25)'); R(g, x - 4, y - 1, 9, 3, '#2f343b'); R(g, x - 3, y - 2, 7, 1, '#555d68'); R(g, x - 1, y - 2, 2, 1, (t * 2 | 0) % 2 ? PAL.green : '#1d3b2a'); R(g, x - 5, y, 1, 1, '#8f98a3'); R(g, x + 5, y, 1, 1, '#8f98a3'); if (rider) cat(g, x, y - 1, t, 'sit', rider); }
// etiqueta «E · ACCIÓN» sobre lo que César puede usar
export function prompt(g, cx, y, label, t) {
  const w = textW(label) + 15, x = Math.max(2, Math.min(414 - w, Math.round(cx - w / 2))), b = (t * 3 | 0) % 2;
  R(g, x, y - b, w, 9, 'rgba(12,18,26,.9)'); R(g, x, y - b + 8, w, 1, PAL.amber); R(g, x + 2, y - b + 1, 7, 7, PAL.amber); text(g, 'E', x + 4, y - b + 2, '#1a1410'); text(g, label, x + 12, y - b + 2, '#f3f6fa');
}
