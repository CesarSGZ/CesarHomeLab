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
  return smooth(radius + 1, radius + 6, clearance(point, rectangles));
}
export function layoutFleet(width, height, rectangles) {
  const mobile=width<680,kinds=['plane','satellite','drone','uav','satellite','plane','drone'];
  return Array.from({length:mobile?9:18},(_,id)=>{
    const node={id,kind:kinds[id%kinds.length],size:mobile?(id<4?16:23):(id<8?34:42),phase:(id*.618033)%1,lane:id<(mobile?4:8)?'gutter':'cruise'};
    return {...node,...flightPosition(node,0,width,height)};
  });
}
// The viewport is a continuous airspace. Scrolling changes the reading mask,
// never restarts or teleports the fleet. Opposite directions keep it organic.
export function flightPosition(node,time,width,height){
  const mobile=width<680,margin=mobile?11:28,direction=node.id%2?1:-1;
  const wrap=(value,length)=>((value%length)+length)%length;
  if(node.lane==='gutter'){
    const travel=height+node.size*4,speed=mobile?7+node.id:11+node.id;
    const y=wrap(node.phase*travel+time*speed*direction,travel)-node.size*2;
    const x=(node.id%2?width-margin:margin)+Math.sin(time*.09+node.phase*6)*(mobile?1:6);
    return{x,y,heading:direction>0?Math.PI:0};
  }
  const travel=width+node.size*4,speed=(mobile?6:10)+(node.id%5)*1.5;
  const x=wrap(node.phase*travel+time*speed*direction,travel)-node.size*2;
  const base=height*(.20+((node.id*.271)%1)*.58),wave=time*.035+node.phase*6;
  const y=base+Math.sin(wave)*height*.10;
  return{x,y,heading:Math.atan2(Math.cos(wave)*height*.0035,speed*direction)+Math.PI/2};
}
export function linkPairs(nodes, width, mobile) {
  const pairs = [];
  for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
    const distance = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
    if (distance > 65 && distance < Math.min(mobile ? 330 : 620, width * .8)) pairs.push({ a: nodes[i], b: nodes[j], distance });
  }
  return pairs.sort((a, b) => a.distance - b.distance);
}
