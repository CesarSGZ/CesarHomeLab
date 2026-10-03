import test from 'node:test';
import assert from 'node:assert/strict';
import {route,walkable,canvasResolution,canOccupy} from '../control/trading-office.js';
test('César can leave the boss office only through its doorway',()=>{
 const path=route({x:1300,y:740},{x:144,y:288});assert.ok(path.length>40);assert.ok(path.every(p=>walkable(p.x,p.y)));assert.deepEqual(path.at(-1),{x:144,y:288});const crossing=path.find(p=>p.x===1056);assert.ok(crossing.y>=496&&crossing.y<=704);
});
test('furniture blocks navigation while bathroom and coffee remain reachable',()=>{
 assert.equal(walkable(240,392),false);const atDesk=route({x:400,y:520},{x:240,y:392});assert.ok(atDesk.every(p=>walkable(p.x,p.y)));assert.notDeepEqual(atDesk.at(-1),{x:240,y:392});const bath=route({x:1300,y:740},{x:1408,y:208});assert.deepEqual(bath.at(-1),{x:1408,y:208});assert.ok(bath.every(p=>walkable(p.x,p.y)));
});
test('retina canvas uses physical pixel resolution rather than stretching a fixed bitmap',()=>{
 assert.deepEqual(canvasResolution(1098,732,2),{width:2196,height:1464,ratio:2});assert.deepEqual(canvasResolution(341,381.92,1.25),{width:426,height:477,ratio:1.25});
});
test('an occupied chair or bathroom cannot be assigned to two employees',()=>{
 const claims=new Map([['toilet','risk'],['seat0','scout']]);assert.equal(canOccupy(claims,'toilet','boss'),false);assert.equal(canOccupy(claims,'toilet','risk'),true);assert.equal(canOccupy(claims,'boss-chair','boss'),true);
});
