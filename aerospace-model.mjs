// Geometry shared by the ambient renderer and its tests. No personal data.
export const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
export function smooth(low, high, value) {
  const t = clamp((value - low) / (high - low), 0, 1);
  return t * t * (3 - 2 * t);
}
export function clearance(point, rectangles) {
  let distance = Infinity;
  for (const box of rectangles) {
    const dx = Math.max(box.left - point.x, 0, point.x - box.right);
    const dy = Math.max(box.top - point.y, 0, point.y - box.bottom);
    distance = Math.min(distance, Math.hypot(dx, dy));
  }
  return distance;
}
export function nodeVisibility(point, radius, rectangles) {
  return smooth(radius + 3, radius + 15, clearance(point, rectangles));
}
export function layoutFleet(width, height, rectangles) {
  const mobile = width < 680, size = mobile ? 29 : 41;
  const columns = mobile ? [25, width - 25, width * .25, width * .5, width * .75]
    : [32, width - 32, width * .15, width * .32, width * .52, width * .72, width * .88];
  const candidates = [];
  for (let y = 112; y < height - 46; y += mobile ? 44 : 52) {
    for (const x of columns) {
      if (clearance({ x, y }, rectangles) > size * .58 + 8) candidates.push({ x, y });
    }
  }
  const nodes = [], kinds = ['plane', 'satellite', 'drone', 'uav', 'satellite', 'plane', 'drone'];
  for (let i = 0; i < (mobile ? 7 : 15); i++) {
    const target = { x: i < 10 ? (i % 2 ? width - 32 : 32) : width * [.5, .73, .26, .6, .86][i - 10],
      y: height * (.16 + (i % 7) * .115) };
    const available = candidates.filter(p => nodes.every(n => Math.hypot(n.x - p.x, n.y - p.y) > (mobile ? 73 : 95)));
    available.sort((a, b) => Math.hypot(a.x - target.x, a.y - target.y) - Math.hypot(b.x - target.x, b.y - target.y));
    if (!available.length) break;
    nodes.push({ ...available[0], id: i, kind: kinds[i % kinds.length], size: size * (i % 3 === 0 ? 1.14 : 1), phase: (i * .618033) % 1 });
  }
  return nodes;
}
export function linkPairs(nodes, width, mobile) {
  const pairs = [];
  for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
    const distance = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
    if (distance > 65 && distance < Math.min(mobile ? 330 : 620, width * .8)) pairs.push({ a: nodes[i], b: nodes[j], distance });
  }
  return pairs.sort((a, b) => a.distance - b.distance);
}
