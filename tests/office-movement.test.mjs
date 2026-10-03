import test from 'node:test';
import assert from 'node:assert/strict';
import {route,walkable,clearSegment,stations,spriteSize,interactionChoice,canvasResolution,canOccupy} from '../control/trading-office.js';
test('César can leave the boss office only through its doorway',()=>{
 const path=route({x:1300,y:762},{x:144,y:288});assert.ok(path.length>40);assert.ok(path.every(p=>walkable(p.x,p.y)));assert.deepEqual(path.at(-1),{x:144,y:288});const crossing=path.find(p=>p.x===1056);assert.ok(crossing.y>=528&&crossing.y<=704);
});
test('furniture blocks navigation while bathroom and coffee remain reachable',()=>{
 assert.equal(walkable(240,392),false);const atDesk=route({x:400,y:520},{x:240,y:392});assert.ok(atDesk.every(p=>walkable(p.x,p.y)));assert.notDeepEqual(atDesk.at(-1),{x:240,y:392});const bath=route({x:1300,y:762},{x:1408,y:224});assert.deepEqual(bath.at(-1),{x:1408,y:224});assert.ok(bath.every(p=>walkable(p.x,p.y)));
});
test('retina canvas uses physical pixel resolution rather than stretching a fixed bitmap',()=>{
 assert.deepEqual(canvasResolution(1098,732,2),{width:2196,height:1464,ratio:2});assert.deepEqual(canvasResolution(341,381.92,1.25),{width:426,height:477,ratio:1.25});
});
test('an occupied chair or bathroom cannot be assigned to two employees',()=>{
 const claims=new Map([['toilet','risk'],['seat0','scout']]);assert.equal(canOccupy(claims,'toilet','boss'),false);assert.equal(canOccupy(claims,'toilet','risk'),true);assert.equal(canOccupy(claims,'boss-chair','boss'),true);
});
test('every object has a walkable approach distinct from furniture seating poses',()=>{
 for(const st of stations){assert.ok(walkable(st.x,st.y),st.id);const path=route({x:400,y:752},st);assert.ok(path.length>0,st.id);assert.ok(Math.hypot(path.at(-1).x-st.x,path.at(-1).y-st.y)<24,st.id);for(let i=1;i<path.length;i++)assert.ok(clearSegment(path[i-1],path[i]),st.id);}
 assert.notEqual(stations.find(s=>s.id==='toilet').poseY,stations.find(s=>s.id==='toilet').y);
 assert.equal(clearSegment({x:1000,y:350},{x:1150,y:350}),false);
 assert.equal(clearSegment({x:400,y:392},{x:80,y:392}),false);
});
test('walking frames retain physical height and nearby interactions override drinking',()=>{
 assert.equal(spriteSize({w:200,h:310}).height,spriteSize({w:210,h:280}).height);
 assert.equal(spriteSize({w:200,h:300},true).height,105);
 assert.equal(interactionChoice('door',true),'door');assert.equal(interactionChoice('reports',true),'reports');assert.equal(interactionChoice(null,true),'drink');
});
