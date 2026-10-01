import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { clearance, nodeVisibility, layoutFleet, flightPosition, linkPairs } from '../aerospace-model.mjs';

test('reading areas hide nodes before their outlines reach text', () => {
  const boxes = [{ left: 100, right: 200, top: 100, bottom: 200 }];
  assert.equal(clearance({ x: 150, y: 150 }, boxes), 0);
  assert.equal(nodeVisibility({ x: 90, y: 150 }, 25, boxes), 0);
  assert.equal(nodeVisibility({ x: 30, y: 150 }, 25, boxes), 1);
});
test('continuous airspace has a lighter mobile fleet and reading masks determine visibility', () => {
  const boxes = [{ left: 100, right: 1340, top: 200, bottom: 700 }];
  const desktop = layoutFleet(1440, 1000, boxes), mobile = layoutFleet(390, 844, []);
  assert.equal(desktop.length,18);
  assert.equal(mobile.length,9);
  assert.ok(desktop.some(node=>nodeVisibility(node,node.size*.61,boxes)===0));
  assert.equal(new Set(desktop.map(node => node.kind)).size, 4);
  const narrowGutters = layoutFleet(1250, 720, [{ left: 68, right: 1181, top: 120, bottom: 710 }]);
  assert.ok(narrowGutters.filter(node => node.x > 1200).length >= 3);
});
test('aircraft actually travel continuously instead of bobbing in static slots',()=>{
  for(const width of [390,1440]){
    const nodes=layoutFleet(width,844,[]);
    for(const node of nodes){const a=flightPosition(node,0,width,844),b=flightPosition(node,20,width,844);assert.ok(Math.hypot(a.x-b.x,a.y-b.y)>100);assert.ok(Number.isFinite(b.heading));}
    assert.deepEqual(layoutFleet(width,844,[{left:0,right:width,top:0,bottom:844}]),nodes);
  }
});
test('connections exclude distant nodes', () => {
  const nodes = [{ x: 30, y: 100, id: 0 }, { x: 160, y: 100, id: 1 }, { x: 1400, y: 900, id: 2 }];
  const pairs = linkPairs(nodes, 1440, false);
  assert.equal(pairs.length, 1); assert.equal(pairs[0].a.id, 0); assert.equal(pairs[0].b.id, 1);
});
test('background is public-only, noninteractive, pausable and motion-aware', async () => {
  const page = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  const renderer = await readFile(new URL('../aerospace-network.js', import.meta.url), 'utf8');
  const control = await readFile(new URL('../control/index.html', import.meta.url), 'utf8');
  assert.match(page, /id="aerospace-network" aria-hidden="true"/);
  assert.match(page, /id="ambient-toggle"/);
  assert.doesNotMatch(control, /aerospace-network/);
  for (const feature of ['prefers-reduced-motion', 'visibilitychange', 'destination-out']) assert.ok(renderer.includes(feature));
});
