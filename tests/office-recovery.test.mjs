import test from 'node:test';
import assert from 'node:assert/strict';
import {recoveryDecision,runOfficeRecovery} from '../scripts/office-recovery.mjs';
const now=Date.parse('2026-10-05T07:00:00Z');
function fixture({lease=0,state={lastTick:now,lastError:null},lockError=null,cycleError=null}={}){
 const actions=[],office={paused:true},leases=Array.isArray(lease)?[...lease]:[lease];let reads=0;
 const db={prepare(sql){return {async first(){actions.push(sql.includes('lock_until')?'read-lease':'read-cache');if(sql.includes('lock_until'))return {lock_until:leases[Math.min(reads++,leases.length-1)]};return state===null?null:{payload:JSON.stringify(state),updated_at:now};}};}};
 const options={db,clock:()=>now,withLock:async(env,callback)=>{assert.equal(env.CONTROL_DB,db);actions.push('lock');if(lockError)throw lockError;await callback(office);},logger:(s,agent)=>{assert.equal(s,office);actions.push('log:'+agent);},runCycle:async()=>{actions.push('cycle');if(cycleError)throw cycleError;}};
 return {options,actions,office};
}

test('the supervisor treats equality as occupied and waits until the SQL lease can actually be acquired',()=>{
 for(const until of [now,now+60000])assert.equal(recoveryDecision({lastTick:now},until,now).status,'busy');
 assert.equal(recoveryDecision({lastTick:now},now-1,now).status,'healthy');assert.equal(recoveryDecision(null,now-1,now).status,'recover');
 assert.throws(()=>recoveryDecision(null,'not-a-time',now),/Lease/);
});

test('an occupied routine watchdog does not lock, write, read cache, log or start a cycle',async()=>{
 const f=fixture({lease:now+5*60e3,state:{lastTick:now-20*60e3,lastError:'Old error'}}),result=await runOfficeRecovery(f.options);
 assert.deepEqual(f.actions,['read-lease']);assert.equal(result.status,'busy');assert.equal(result.retryAt,now+5*60e3);assert.equal(result.resumeApplied,false);assert.equal(f.office.paused,true);
});

test('a required manual resume is explicitly pending rather than silently accepted when the lease is occupied',async()=>{
 const f=fixture({lease:now});f.options.resumeEntries=true;
 await assert.rejects(()=>runOfficeRecovery(f.options),error=>error.code==='OFFICE_RESUME_PENDING'&&error.retryAt===now&&/No se ha aplicado/.test(error.message));
 assert.deepEqual(f.actions,['read-lease']);assert.equal(f.office.paused,true);
});

test('an expired lease with stale state recovers once while a fresh motor remains untouched',async()=>{
 const stale=fixture({lease:now-1,state:{lastTick:now-11*60e3,lastError:null}}),result=await runOfficeRecovery(stale.options);
 assert.equal(result.status,'recovered');assert.deepEqual(stale.actions,['read-lease','read-cache','lock','log:system','cycle']);
 const fresh=fixture({lease:now-1});assert.equal((await runOfficeRecovery(fresh.options)).status,'healthy');assert.deepEqual(fresh.actions,['read-lease','read-cache']);
});

test('manual resume is applied before recovery only after the lease is free',async()=>{
 const f=fixture({lease:now-1,state:null});f.options.resumeEntries=true;const result=await runOfficeRecovery(f.options);
 assert.equal(result.status,'recovered');assert.equal(result.resumeApplied,true);assert.equal(f.office.paused,false);
 assert.deepEqual(f.actions,['read-lease','lock','log:boss','read-cache','lock','log:system','cycle']);
});

test('a race is a routine wait only for the specific busy error and a newly confirmed occupied lease',async()=>{
 const busy=Error('Ya hay una tarea en ejecución'),f=fixture({lease:[now-1,now+60000],state:null,lockError:busy});
 assert.equal((await runOfficeRecovery(f.options)).status,'busy');assert.deepEqual(f.actions,['read-lease','read-cache','lock','read-lease']);
 const manual=fixture({lease:[now-1,now+60000],lockError:busy});manual.options.resumeEntries=true;
 await assert.rejects(()=>runOfficeRecovery(manual.options),e=>e.code==='OFFICE_RESUME_PENDING');assert.equal(manual.office.paused,true);
 const expired=fixture({lease:[now-1,now-1],state:null,lockError:busy});await assert.rejects(()=>runOfficeRecovery(expired.options),e=>e===busy);assert.ok(!expired.actions.includes('cycle'));
});

test('database, cache, lock and cycle failures remain explicit infrastructure errors',async()=>{
 const network=Error('D1 network failure'),dbFailure=fixture();dbFailure.options.db.prepare=()=>({first:async()=>{throw network;}});
 await assert.rejects(()=>runOfficeRecovery(dbFailure.options),e=>e===network);
 const lockFailure=fixture({state:null,lockError:network});await assert.rejects(()=>runOfficeRecovery(lockFailure.options),e=>e===network);assert.deepEqual(lockFailure.actions,['read-lease','read-cache','lock']);
 const cycleFailure=fixture({state:null,cycleError:network});await assert.rejects(()=>runOfficeRecovery(cycleFailure.options),e=>e===network);assert.equal(cycleFailure.actions.at(-1),'cycle');
 const corrupt=fixture();corrupt.options.db.prepare=sql=>({first:async()=>sql.includes('lock_until')?{lock_until:0}:{payload:'invalid-json'}});
 await assert.rejects(()=>runOfficeRecovery(corrupt.options),SyntaxError);
});
