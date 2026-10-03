import test from 'node:test';
import assert from 'node:assert/strict';
import {route,walkable} from '../control/trading-office.js';
test('César can leave his office through the door without crossing walls or desks',()=>{
 const path=route({x:810,y:660},{x:140,y:320});assert.ok(path.length>20);assert.ok(path.every(p=>walkable(p.x,p.y)));assert.deepEqual(path.at(-1),{x:140,y:320});
 const crossing=path.find(p=>p.x===680);assert.ok(crossing.y>=500&&crossing.y<=540);
});
test('clicking furniture stops at a reachable floor tile',()=>{
 assert.equal(walkable(200,370),false);const path=route({x:300,y:440},{x:200,y:370});assert.ok(path.length);assert.ok(path.every(p=>walkable(p.x,p.y)));assert.notDeepEqual(path.at(-1),{x:200,y:370});
});
