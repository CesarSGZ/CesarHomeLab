import test from 'node:test';
import assert from 'node:assert/strict';
import {startOfficeProgress} from '../scripts/office-progress.mjs';

function deferred(){let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return {promise,resolve,reject};}
function timer(){let callback,delay,cleared=0;return {set(fn,ms){callback=fn;delay=ms;return 42;},clear(id){assert.equal(id,42);cleared++;},fire(){return callback();},get delay(){return delay;},get cleared(){return cleared;}};}

test('slow progress publishing never overlaps and the terminal cache write is last',async()=>{
 const clock=timer(),first=deferred(),writes=[];let calls=0,active=0,maxActive=0,current='analyst working';
 const progress=startOfficeProgress(async()=>{calls++;active++;maxActive=Math.max(maxActive,active);const snapshot=current;if(calls===1)await first.promise;writes.push(snapshot);active--;return snapshot;},{setIntervalFn:clock.set,clearIntervalFn:clock.clear});
 assert.equal(clock.delay,20000);const running=clock.fire();await Promise.resolve();assert.equal(calls,1);
 assert.equal(clock.fire(),running);assert.equal(clock.fire(),running);assert.equal(calls,1);
 current='cycle complete';const final=progress.finish();assert.equal(clock.cleared,1);assert.equal(calls,1);assert.equal(progress.finish(),final);await clock.fire();assert.equal(calls,1);
 first.resolve();assert.equal(await final,'cycle complete');assert.equal(calls,2);assert.equal(maxActive,1);assert.deepEqual(writes,['analyst working','cycle complete']);assert.equal(clock.cleared,1);
});

test('a transient progress failure can recover and does not prevent the final publication',async()=>{
 const clock=timer(),errors=[];let calls=0;
 const progress=startOfficeProgress(async()=>{calls++;if(calls===1)throw Error('temporary cache outage');return calls===2?'risk working':'cycle complete';},{setIntervalFn:clock.set,clearIntervalFn:clock.clear,onError:error=>errors.push(error.message)});
 await clock.fire();assert.equal(errors[0],'temporary cache outage');assert.equal(await clock.fire(),'risk working');assert.equal(await progress.finish(),'cycle complete');assert.equal(calls,3);assert.equal(clock.cleared,1);
});

test('finish without intermediate activity publishes once and stops all future timer work',async()=>{
 const clock=timer();let calls=0;
 const progress=startOfficeProgress(async()=>{calls++;return {busy:false};},{setIntervalFn:clock.set,clearIntervalFn:clock.clear});
 const result=await progress.finish();assert.deepEqual(result,{busy:false});await clock.fire();await progress.finish();assert.equal(calls,1);assert.equal(clock.cleared,1);
});

test('terminal publication failures remain visible and are not retried by stale timer callbacks',async()=>{
 const clock=timer();let calls=0;
 const progress=startOfficeProgress(async()=>{calls++;throw Error('final cache unavailable');},{setIntervalFn:clock.set,clearIntervalFn:clock.clear});
 await assert.rejects(progress.finish(),/final cache unavailable/);await clock.fire();assert.equal(calls,1);assert.equal(clock.cleared,1);
});
