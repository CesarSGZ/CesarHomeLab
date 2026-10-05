import test from 'node:test';import assert from 'node:assert/strict';
import {runOfficeTaskWhenAvailable} from '../scripts/office-availability.mjs';
const now=Date.parse('2026-10-05T19:00:00Z');
const fixture=leases=>{let reads=0,runs=0;return {get runs(){return runs;},get reads(){return reads;},options:{clock:()=>now,db:{prepare(sql){assert.equal(sql,'SELECT lock_until FROM trading_state WHERE id=1');return {first:async()=>({lock_until:leases[Math.min(reads++,leases.length-1)]})};}},run:async()=>{runs++;return 'actual work';}}};};
test('a cloud controller defers an occupied lease without executing or reporting a completed cycle',async()=>{
 for(const until of [now,now+60000]){const f=fixture([until]),result=await runOfficeTaskWhenAvailable(f.options);assert.equal(result.status,'busy');assert.equal(result.retryAt,until);assert.equal(f.runs,0);assert.equal(f.reads,1);assert.equal(result.result,undefined);}
 const f=fixture([now-1]);assert.deepEqual(await runOfficeTaskWhenAvailable(f.options),{status:'complete',result:'actual work'});assert.equal(f.runs,1);
});
test('a lease race is deferred only after the active lease is verified, and mutations are never retried',async()=>{
 const f=fixture([0,now+60000]),busy=Error('Ya hay una tarea en ejecución');let attempts=0;f.options.run=async()=>{attempts++;throw busy;};assert.equal((await runOfficeTaskWhenAvailable(f.options)).status,'busy');assert.equal(attempts,1);assert.equal(f.reads,2);
 const expired=fixture([0,0]);expired.options.run=async()=>{throw busy;};await assert.rejects(()=>runOfficeTaskWhenAvailable(expired.options),e=>e===busy);
 const failed=fixture([0]);failed.options.run=async()=>{throw Error('Database timeout');};await assert.rejects(()=>runOfficeTaskWhenAvailable(failed.options),/Database timeout/);assert.equal(failed.reads,1);
});
test('failed lease reads cannot silently defer or run a trading task',async()=>{
 const f=fixture([0]);f.options.db.prepare=()=>({first:async()=>{throw Error('Cloudflare unavailable');}});await assert.rejects(()=>runOfficeTaskWhenAvailable(f.options),/Cloudflare unavailable/);assert.equal(f.runs,0);
});
