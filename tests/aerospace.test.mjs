import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { clearance, nodeVisibility, layoutFleet, linkPairs } from '../aerospace-model.mjs';

test('reading areas hide nodes before their outlines reach text', () => {
  const boxes = [{ left: 100, right: 200, top: 100, bottom: 200 }];
  assert.equal(clearance({ x: 150, y: 150 }, boxes), 0);
  assert.equal(nodeVisibility({ x: 90, y: 150 }, 25, boxes), 0);
  assert.equal(nodeVisibility({ x: 30, y: 150 }, 25, boxes), 1);
});
test('fleet fits available whitespace with a lighter mobile budget', () => {
  const boxes = [{ left: 100, right: 1340, top: 200, bottom: 700 }];
  const desktop = layoutFleet(1440, 1000, boxes), mobile = layoutFleet(390, 844, []);
  assert.ok(desktop.length >= 7 && desktop.length <= 15);
  assert.ok(mobile.length > 0 && mobile.length <= 7);
  assert.ok(desktop.every(node => clearance(node, boxes) > node.size * .5));
  assert.equal(new Set(desktop.map(node => node.kind)).size, 4);
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
