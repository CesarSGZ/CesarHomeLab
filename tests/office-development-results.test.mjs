import test from 'node:test';
import assert from 'node:assert/strict';
import {developmentResultBody,queueDevelopmentResult,drainDevelopmentResults} from '../scripts/office-development-results.mjs';
const now=Date.parse('2026-10-06T10:00:00Z'),commit='a'.repeat(40);
function fixture(count=1){
 const records=new Map(),state={company:{development:Array.from({length:count},(_,i)=>({id:'job-'+i,lease:'lease-'+i,status:'running',summary:'Verified change '+i,meetingId:'m1'})),reports:[],meetings:[]},logs:[],real:{book:{cash:10000,positions:[],orders:[]}}};
 let lockUntil=0,locks=0,uncertainCheckpoint=false,failRead=false,uncertainInsert=false;
 const db={prepare(sql){return {params:[],bind(...params){this.params=params;return this;},async first(){
  if(failRead)throw Error('D1 unavailable');
  if(sql==='SELECT lock_until FROM trading_state WHERE id=1')return {lock_until:lockUntil};
  if(sql.includes('COUNT(*)'))return {n:[...records.values()].filter(r=>r.status==='pending').length};
  if(sql.includes('WHERE id=?'))return records.get(this.params[0])||null;
  throw Error('Unexpected read: '+sql);
 },async all(){assert.match(sql,/WHERE status='pending' ORDER BY created_at LIMIT/);return {results:[...records.values()].filter(r=>r.status==='pending').sort((a,b)=>a.created_at-b.created_at).slice(0,this.params[0])};},async run(){
  if(sql.startsWith('CREATE TABLE'))return {};
  if(sql.startsWith('INSERT OR IGNORE')){const [id,job_id,lease_token,payload,created_at]=this.params;if(!records.has(id))records.set(id,{id,job_id,lease_token,payload,created_at,status:'pending'});if(uncertainInsert){uncertainInsert=false;throw Error('Insert response lost');}return {};}
  if(sql.startsWith('UPDATE')){const failed=sql.includes("status='failed'"),id=this.params[failed?2:1],row=records.get(id);if(row?.status==='pending'){row.status=failed?'failed':'complete';row.finished_at=this.params[0];row.error=failed?this.params[1]:null;}return {};}
  throw Error('Unexpected mutation: '+sql);
 }};}};
 const withLock=async(env,callback)=>{locks++;if(lockUntil>=now&&lockUntil>0)throw Error('Ya hay una tarea en ejecución');await callback(state);if(uncertainCheckpoint){uncertainCheckpoint=false;throw Error('D1 checkpoint response lost');}};
 return {db,state,records,options:{db,withLock,clock:()=>now},get locks(){return locks;},set lockUntil(value){lockUntil=value;},set uncertainCheckpoint(value){uncertainCheckpoint=value;},set failRead(value){failRead=value;},set uncertainInsert(value){uncertainInsert=value;}};
}
const body=job=>developmentResultBody(job,{status:'applied',commit});
test('an occupied lease durably retains the deployment result without reporting it applied, then recovers once',async()=>{
 const f=fixture(),book=JSON.stringify(f.state.real.book),result=body(f.state.company.development[0]);f.lockUntil=now+60000;
 assert.equal((await queueDevelopmentResult(f.db,result,now)).persisted,true);
 let recovered=await drainDevelopmentResults(f.options);assert.equal(recovered.status,'pending');assert.equal(recovered.remaining,1);assert.equal(recovered.retryAt,now+60000);assert.equal(f.locks,0);assert.equal(f.state.company.development[0].status,'running');
 f.lockUntil=0;recovered=await drainDevelopmentResults(f.options);assert.equal(recovered.status,'complete');assert.equal(recovered.recorded,1);assert.equal(f.state.company.development[0].status,'applied');assert.equal(f.state.company.development[0].commit,commit);assert.equal(f.state.logs.length,1);
 assert.equal((await drainDevelopmentResults(f.options)).recorded,0);assert.equal(f.state.logs.length,1);assert.equal(JSON.stringify(f.state.real.book),book);
});
test('duplicate delivery is idempotent and conflicting outcomes for one job and lease are rejected',async()=>{
 const f=fixture(),job=f.state.company.development[0],result=body(job);f.uncertainInsert=true;
 await queueDevelopmentResult(f.db,result,now);await queueDevelopmentResult(f.db,result,now+1);assert.equal(f.records.size,1);
 await assert.rejects(()=>queueDevelopmentResult(f.db,developmentResultBody(job,{status:'rejected',error:'Validation failed'}),now+2),/resultado diferente/);
 assert.equal(f.state.company.development[0].status,'running');assert.equal(f.locks,0);
});
test('an uncertain checkpoint remains pending and replay reconciles terminal state without duplicating logs',async()=>{
 const f=fixture(),result=body(f.state.company.development[0]);await queueDevelopmentResult(f.db,result,now);f.uncertainCheckpoint=true;
 await assert.rejects(()=>drainDevelopmentResults(f.options),/checkpoint response lost/);assert.equal([...f.records.values()][0].status,'pending');assert.equal(f.state.company.development[0].status,'applied');assert.equal(f.state.logs.length,1);
 const recovered=await drainDevelopmentResults(f.options);assert.equal(recovered.reconciled,1);assert.equal(recovered.recorded,0);assert.equal(recovered.remaining,0);assert.equal(f.state.logs.length,1);
});
test('real database errors propagate while confirmed queued results remain recoverable',async()=>{
 const f=fixture();await queueDevelopmentResult(f.db,body(f.state.company.development[0]),now);f.failRead=true;
 await assert.rejects(()=>drainDevelopmentResults(f.options),/D1 unavailable/);assert.equal(f.locks,0);assert.equal([...f.records.values()][0].status,'pending');assert.equal(f.state.company.development[0].status,'running');
});
test('applied requires a confirmed commit and stale leases never overwrite a different job result',async()=>{
 const f=fixture(),job=f.state.company.development[0];assert.throws(()=>developmentResultBody(job,{status:'applied'}),/commit confirmado/);
 await queueDevelopmentResult(f.db,body(job),now);job.lease='new-lease';
 await assert.rejects(()=>drainDevelopmentResults(f.options),error=>error.code==='OFFICE_DEVELOPMENT_RESULT_CONFLICT');assert.equal(job.status,'running');assert.equal(f.state.logs.length,0);assert.equal([...f.records.values()][0].status,'failed');
});
test('recovery is bounded to five results so pending work prevents a new lease until drained',async()=>{
 const f=fixture(7);for(const [i,job]of f.state.company.development.entries())await queueDevelopmentResult(f.db,body(job),now+i);
 let recovered=await drainDevelopmentResults(f.options);assert.equal(recovered.recorded,5);assert.equal(recovered.remaining,2);assert.equal(recovered.status,'pending');
 recovered=await drainDevelopmentResults(f.options);assert.equal(recovered.recorded,2);assert.equal(recovered.remaining,0);assert.equal(f.state.logs.length,7);
});

test('a rejected deployment outcome is preserved honestly and a no-longer-running job is not retried forever',async()=>{
 const rejected=fixture(),job=rejected.state.company.development[0],result=developmentResultBody(job,{status:'rejected',error:'Tests failed; deployment was reverted'});
 await queueDevelopmentResult(rejected.db,result,now);assert.equal((await drainDevelopmentResults(rejected.options)).recorded,1);
 assert.equal(job.status,'rejected');assert.equal(job.commit,null);assert.equal(job.error,result.error);assert.equal(rejected.state.logs[0].type,'warning');
 const stale=fixture();await queueDevelopmentResult(stale.db,body(stale.state.company.development[0]),now);stale.state.company.development[0].status='queued';
 await assert.rejects(()=>drainDevelopmentResults(stale.options),error=>error.code==='OFFICE_DEVELOPMENT_RESULT_CONFLICT');assert.equal([...stale.records.values()][0].status,'failed');assert.equal(stale.state.logs.length,0);
});
