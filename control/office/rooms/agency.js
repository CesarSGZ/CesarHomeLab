// Agent Office · sala de la agencia (captación de clics para una modelo). Todavía sin
// equipo: está de mudanza, con cajas, el aro de luz a medio montar y la pared a medio pintar.
// Cuando haya empleados y datos, su plano, sus objetos y su guion van aquí, separados de inversión.
import { T, R, PAL, VW, VH, text, textW, plant } from '../art.js';

const PINK = '#ff8fb1', HOT = '#ff5fa2', CARD = '#c99a62', CARD2 = '#a97b48', TAPE = '#e9dfc6';
function box(g, x, y, w, h, label, open) {
  R(g, x + 1, y + h, w, 2, 'rgba(0,0,0,.2)'); R(g, x, y, w, h, CARD); R(g, x, y, w, 1, '#dcb07a'); R(g, x + w - 1, y, 1, h, CARD2); R(g, x, y + h - 1, w, 1, CARD2);
  if (open) { R(g, x - 2, y - 3, w / 2, 3, CARD2); R(g, x + w / 2 + 2, y - 3, w / 2, 3, CARD2); R(g, x + 2, y - 2, w - 4, 2, '#3b3028'); } else R(g, x + (w >> 1) - 1, y, 3, h, TAPE);
  if (label) text(g, label, x + 2, y + (h >> 1) - 2, '#6b4324', w - 3);
}
function ringLight(g, x, y, on, t) {
  R(g, x - 4, y + 30, 9, 2, 'rgba(0,0,0,.22)'); R(g, x, y + 10, 1, 20, '#2b2622'); R(g, x - 4, y + 29, 9, 1, '#2b2622'); R(g, x - 3, y + 26, 1, 3, '#2b2622'); R(g, x + 3, y + 26, 1, 3, '#2b2622');
  const c = on ? '#fff6d8' : '#8f98a3'; if (on) { g.globalAlpha = .16 + Math.sin(t * 3) * .03; R(g, x - 12, y - 10, 25, 25, '#fff0b8'); g.globalAlpha = 1; }
  R(g, x - 4, y - 5, 9, 2, c); R(g, x - 4, y + 7, 9, 2, c); R(g, x - 6, y - 3, 2, 10, c); R(g, x + 5, y - 3, 2, 10, c); R(g, x - 5, y - 4, 1, 1, c); R(g, x + 5, y - 4, 1, 1, c); R(g, x - 5, y + 7, 1, 1, c); R(g, x + 5, y + 7, 1, 1, c); R(g, x - 1, y, 3, 5, '#1a1410');
}
const heart = (g, x, y, c) => { R(g, x, y + 1, 3, 3, c); R(g, x + 4, y + 1, 3, 3, c); R(g, x + 1, y, 1, 1, c); R(g, x + 5, y, 1, 1, c); R(g, x + 1, y + 4, 5, 1, c); R(g, x + 2, y + 5, 3, 1, c); R(g, x + 3, y + 6, 1, 1, c); R(g, x + 3, y + 1, 1, 1, c); };

export const agency = {
  id: 'agency', name: 'Agencia', door: { at: [25, 9], to: 'trading', arrive: [1, 9] },
  blocks(blk) { blk(2, 3, 6, 3); blk(10, 3, 12, 3); blk(3, 6, 4, 6); blk(8, 5); blk(17, 5); blk(21, 4); blk(14, 11, 15, 11); blk(6, 12, 8, 12); blk(19, 12, 20, 12); blk(22, 8); blk(1, 13); blk(14, 3, 15, 3); blk(2, 8, 4, 8); blk(22, 13, 23, 13); blk(12, 7); blk(16, 5); },
  paintStatic(b) {
    for (let y = 3 * T; y < VH; y += 8) for (let x = 0; x < VW; x += 16) R(b, x, y, 16, 8, ((x / 16 + y / 8) | 0) % 2 ? '#c9c2cf' : '#d3ccd8');
    for (let y = 3 * T; y < VH; y += 8) R(b, 0, y + 7, VW, 1, 'rgba(60,40,70,.10)');
    R(b, 9 * T, 5 * T, 7 * T, 5 * T, '#f3d9e3'); for (let i = 0; i < 7 * T; i += 6) for (let j = 0; j < 5 * T; j += 6) R(b, 9 * T + i + 2, 5 * T + j + 2, 1, 1, '#e7b6c8'); // alfombra aún con el plástico
    R(b, 0, 0, VW, 3 * T, '#efe6ea'); R(b, 0, 0, 228, 3 * T - 5, '#f6c6d6'); for (let i = 0; i < 14; i++) R(b, 226 + (i % 3) * 2, 2 + i * 3, 4 + (i * 7) % 6, 3, '#f6c6d6'); // pared a medio pintar
    R(b, 0, 0, VW, 4, '#4a2d3e'); R(b, 0, 3 * T - 5, VW, 5, '#7a4d63'); R(b, 0, 3 * T - 5, VW, 1, '#4a2d3e'); R(b, 0, 3 * T, VW, 3, 'rgba(0,0,0,.14)');
    R(b, 0, 0, 3, VH, '#4a2d3e'); R(b, VW - 3, 0, 3, VH, '#4a2d3e'); R(b, 0, VH - 6, VW, 6, '#4a2d3e');
    R(b, 34, 10, 76, 38, '#2b2622'); R(b, 36, 12, 72, 54, '#f7f1f4'); R(b, 36, 12, 72, 1, '#fff'); R(b, 32, 8, 80, 3, '#8f98a3'); // fondo de fotografía enrollado
    R(b, 300, 12, 52, 32, '#5b3b24'); R(b, 302, 14, 48, 28, '#bfe3f7'); R(b, 325, 12, 2, 32, '#5b3b24'); R(b, 300, 27, 52, 1, '#5b3b24'); for (let i = 0; i < 5; i++) R(b, 304 + i * 9, 36 - (i * 5) % 9, 6, 6 + (i * 5) % 9, '#8fb3cf');
    R(b, 372, 16, 20, 24, '#f6f4ec'); R(b, 372, 16, 20, 1, '#fff'); for (let i = 0; i < 4; i++) R(b, 375, 20 + i * 5, 14 - (i % 2) * 4, 1, '#b9b3a4'); R(b, 380, 13, 4, 4, HOT); // lista de tareas clavada
    R(b, VW - 4, 9 * T - 6, 4, 26, '#1a1410'); R(b, VW - 6, 9 * T - 8, 6, 2, '#4a2d3e'); R(b, VW - 6, 9 * T + 20, 6, 2, '#4a2d3e'); R(b, VW - 30, 9 * T + 2, 25, 11, '#3b3028'); text(b, 'INV', VW - 28, 9 * T + 5, '#c9a55a'); text(b, '>', VW - 12, 9 * T + 5, PAL.green);
    R(b, 244, 30, 16, 12, '#e9e2d2'); R(b, 246, 26, 12, 5, '#f6c6d6'); R(b, 250, 20, 2, 7, '#8f98a3'); R(b, 247, 17, 8, 4, '#f6c6d6'); // cubo y rodillo
  },
  drawWall(g, c) {
    const { t, fx } = c, on = (t * 5 | 0) % 31 !== 0;
    const col = on ? HOT : '#6b3550'; if (on) { g.globalAlpha = .18; R(g, 146, 10, 78, 30, HOT); g.globalAlpha = 1; }
    heart(g, 152, 15, col); heart(g, 211, 15, col); text(g, 'PROXIMAMENTE', 162, 16, col); text(g, 'AGENCIA', 172, 27, on ? '#ffe45c' : '#6b5a2a'); R(g, 150, 36, 70, 1, col);
    if (fx.ringOn) { g.globalAlpha = .10; R(g, 36, 12, 72, 54, '#fff0b8'); g.globalAlpha = 1; }
  },
  items(D, c) {
    const { g, now, fx } = c;
    D.push({ y: 64, f: () => { R(g, 10 * T, 50, 48, 14, 'rgba(0,0,0,.18)'); R(g, 10 * T, 44, 48, 12, '#e58fb0'); R(g, 10 * T + 2, 54, 44, 8, '#f2a9c4'); R(g, 10 * T, 52, 4, 12, '#c96f93'); R(g, 10 * T + 44, 52, 4, 12, '#c96f93'); g.globalAlpha = .35; R(g, 10 * T - 2, 42, 52, 24, '#eaf6ff'); g.globalAlpha = 1; for (let i = 0; i < 5; i++) R(g, 10 * T + 3 + i * 10, 45 + (i % 2) * 6, 5, 1, '#fff'); } }); // sofá con el plástico puesto
    D.push({ y: 6 * T + 15, f: () => { box(g, 3 * T - 8, 6 * T - 4, 25, 14, 'LUCES'); box(g, 4 * T + 3, 6 * T, 15, 10, ''); box(g, 3 * T - 5, 6 * T - 15, 29, 11, 'FRAGIL'); } });
    D.push({ y: 5 * T + 15, f: () => box(g, 8 * T - 3, 5 * T - 2, 21, 13, 'ROPA', true) });
    D.push({ y: 11 * T + 15, f: () => { box(g, 14 * T - 4, 11 * T - 3, 33, 14, 'ATREZZO'); box(g, 16 * T - 2, 11 * T + 2, 13, 9, ''); box(g, 14 * T, 11 * T - 14, 28, 11, 'CABLES', true); } });
    D.push({ y: 12 * T + 15, f: () => { const x = 6 * T, y = 12 * T - 2; R(g, x + 2, y + 13, 44, 3, 'rgba(0,0,0,.18)'); R(g, x, y + 4, 48, 5, PAL.woodLight); R(g, x, y + 9, 48, 2, PAL.woodDark); R(g, x + 4, y - 8, 3, 12, PAL.woodDark); R(g, x + 12, y - 5, 3, 9, PAL.woodDark); R(g, x + 24, y - 2, 14, 6, '#2a2f37'); R(g, x + 25, y - 1, 12, 4, '#ff8fb1'); R(g, x + 40, y + 1, 5, 3, '#f6f4ec'); } }); // mesa a medio montar con el portátil encima
    D.push({ y: 12 * T + 15.5, f: () => { const x = 19 * T + 2, y = 12 * T - 18; R(g, x, y, 28, 2, '#8f98a3'); R(g, x + 1, y, 1, 32, '#8f98a3'); R(g, x + 26, y, 1, 32, '#8f98a3'); R(g, x - 1, y + 31, 30, 2, '#6f7985'); ['#ff5fa2', '#1a1410', '#f6f4ec', '#c9b3f5', '#e03131'].forEach((col, i) => { R(g, x + 4 + i * 5, y + 2, 1, 2, '#555'); R(g, x + 2 + i * 5, y + 4, 5, 12 + (i % 2) * 4, col); }); } }); // burro de ropa
    D.push({ y: 5 * T + 16, f: () => ringLight(g, 17 * T + 8, 5 * T - 22, fx.ringOn, now) });
    D.push({ y: 4 * T + 15, f: () => { const x = 21 * T + 2, y = 4 * T - 26; R(g, x, y, 2, 40, '#c7a35a'); R(g, x + 10, y, 2, 40, '#c7a35a'); for (let i = 0; i < 5; i++) R(g, x, y + 5 + i * 8, 12, 1, '#a9853f'); } }); // escalera
    D.push({ y: 8 * T + 15, f: () => { const x = 22 * T + 3, y = 8 * T - 12; R(g, x + 4, y + 8, 1, 18, '#2b2622'); R(g, x, y + 24, 9, 1, '#2b2622'); R(g, x + 1, y, 8, 7, '#1a1410'); R(g, x + 9, y + 2, 3, 3, '#5d7186'); R(g, x + 2, y + 1, 2, 1, (now * 2 | 0) % 2 ? '#e03131' : '#5a1717'); } }); // cámara en trípode
    D.push({ y: 13 * T + 14, f: () => plant(g, 1 * T + 8, 13 * T + 14, now, true) });
    D.push({ y: 3 * T + 16, f: () => { const x = 14 * T, y = 3 * T - 14; R(g, x + 2, y + 30, 28, 2, 'rgba(0,0,0,.2)'); R(g, x, y, 32, 22, '#e9dfc6'); R(g, x + 3, y + 3, 26, 16, '#bfe3f7'); R(g, x + 5, y + 5, 6, 12, 'rgba(255,255,255,.5)'); for (let i = 0; i < 5; i++) { R(g, x + 2 + i * 7, y - 2, 3, 3, (now * 2 + i | 0) % 4 ? '#fff6c2' : '#d9c27a'); } R(g, x, y + 22, 32, 8, '#f2a9c4'); R(g, x, y + 22, 32, 1, '#fff'); R(g, x + 6, y + 19, 3, 3, HOT); R(g, x + 12, y + 18, 2, 4, '#1a1410'); R(g, x + 18, y + 19, 5, 3, '#c9b3f5'); } }); // tocador con bombillas
    D.push({ y: 8 * T + 14, f: () => { const x = 2 * T, y = 9 * T - 2; for (let i = 0; i < 3; i++) { R(g, x + i * 3, y - i * 5, 44, 6, ['#b39ddb', '#f2a9c4', '#9fd3c7'][i]); R(g, x + i * 3, y - i * 5, 44, 1, 'rgba(255,255,255,.5)'); R(g, x + i * 3, y - i * 5, 3, 6, 'rgba(0,0,0,.18)'); } } }); // rollos de alfombra y fondos
    D.push({ y: 13 * T + 12, f: () => { const x = 22 * T, y = 13 * T - 12; R(g, x + 1, y + 22, 20, 2, 'rgba(0,0,0,.2)'); R(g, x, y, 22, 14, '#0b0f14'); R(g, x + 1, y + 1, 20, 12, '#141a22'); text(g, '0', x + 9, y + 2, PINK); text(g, 'CLICS', x + 2, y + 8, '#6f8aa6'); R(g, x + 9, y + 14, 4, 5, '#2b323c'); R(g, x + 4, y + 19, 14, 2, '#2b323c'); } }); // la pantalla de métricas, todavía a cero
    D.push({ y: 7 * T + 15, f: () => { const x = 12 * T + 4, y = 7 * T - 8; R(g, x + 1, y + 20, 14, 2, 'rgba(0,0,0,.2)'); R(g, x, y + 6, 16, 12, '#e58fb0'); R(g, x, y, 16, 8, '#f2a9c4'); R(g, x, y, 16, 1, '#fff'); R(g, x - 2, y + 6, 3, 12, '#c96f93'); R(g, x + 15, y + 6, 3, 12, '#c96f93'); R(g, x + 3, y + 8, 10, 5, '#f8c8d8'); } }); // sillón
    D.push({ y: 4 * T + 14, f: () => { for (const [dx, c] of [[0, '#f6c6d6'], [9, '#c9b3f5'], [4, '#fff']]) { R(g, 15 * T + 12 + dx, 5 * T + 4 - (dx === 4 ? 7 : 0), 7, 7, '#8f98a3'); R(g, 15 * T + 12 + dx, 5 * T + 4 - (dx === 4 ? 7 : 0), 7, 2, c); } } }); // botes de pintura
  },
  // Lo que César puede tocar aquí. api lo aporta office.js.
  things(api) {
    const lines = ['Luces, cables, atrezzo… y ni un empleado todavía.', 'Aquí va a haber movimiento. De momento, cartón.', 'Una caja dice «FRÁGIL». Como el alquiler de los de al lado.'];
    let n = 0;
    return [
      { id: 'boxes', at: [[3, 7], [4, 7], [5, 6]], dir: 'up', hit: [3 * T - 2, 5 * T - 4, 34, 28], label: 'Mirar las cajas', use() { api.toast(lines[n++ % lines.length]); } },
      { id: 'boxes2', at: [[14, 12], [15, 12], [13, 11], [16, 11]], dir: 'up', hit: [14 * T, 10 * T - 4, 34, 28], label: 'Mirar las cajas', use() { api.toast(lines[n++ % lines.length]); } },
      { id: 'ring', at: [[17, 6], [18, 5]], dir: 'up', hit: [17 * T - 2, 4 * T - 8, 20, 36], label: () => api.fx.ringOn ? 'Apagar el aro de luz' : 'Encender el aro de luz', use() { api.fx.ringOn = !api.fx.ringOn; api.toast(api.fx.ringOn ? 'Aro de luz encendido. Favorece hasta a las cajas.' : 'Aro de luz apagado.'); } },
      { id: 'laptop', at: [[7, 13], [6, 13], [8, 13]], dir: 'up', hit: [6 * T, 11 * T + 2, 48, 26], label: 'Mirar el portátil', use() { api.toast('Un portátil abierto con una hoja vacía: «Plan de la agencia». El panel de esta sala aparecerá cuando haya equipo.'); api.open('agency'); } },
      { id: 'sofa2', at: [[10, 4], [11, 4], [12, 4]], dir: 'up', hit: [10 * T, 42, 48, 24], label: 'Tocar el sofá', use() { api.toast('Sigue con el plástico puesto. Cruje.'); } },
      { id: 'vanity', at: [[14, 4], [15, 4]], dir: 'up', hit: [14 * T, 3 * T - 16, 32, 32], label: 'Mirarse en el tocador', use() { api.toast('Bombillas de camerino. Las gafas de sol, por fin, justificadas.'); } },
      { id: 'metrics', at: [[22, 12], [23, 12], [21, 13]], dir: 'down', hit: [22 * T, 13 * T - 14, 24, 26], label: 'Mirar la pantalla', use() { api.toast('0 clics. Normal: todavía no hay nadie trabajando aquí.'); } },
      { id: 'neon2', at: [[9, 4], [13, 4]], dir: 'up', hit: [146, 10, 78, 30], label: 'Mirar el neón', use() { api.toast('«Próximamente». Lo único que ya funciona en esta sala.'); } }
    ];
  },
  // frases de quien se asoma desde la otra sala sin trabajo
  visitLines: ['¿Y aquí qué van a montar?', 'Huele a pintura y a negocio nuevo.', 'A ver si estos pagan su parte del alquiler.', 'Me pido el sofá cuando le quiten el plástico.', 'Mucha caja y poco empleado.', '¿Un aro de luz? Yo con eso analizaba mejor.'],
  spots: [[5, 7, 'left'], [13, 12, 'right'], [18, 6, 'left'], [11, 5, 'up'], [20, 9, 'down'], [21, 12, 'right']]
};
