import test from 'node:test';
import assert from 'node:assert/strict';
import {relay} from '../scripts/office-relay.mjs';
const base={workflow:'office-watchdog.yml',repository:'CesarSGZ/CesarHomeLab',token:'fixture'};
test('a dispatch accepted before timeout is reconciled without another POST',async()=>{
 let reads=0,posts=0;const dispatchAt=Date.now();
 const result=await relay({...base,now:()=>dispatchAt,pause:async()=>{},fetcher:async(u,o)=>{
  if(o.method==='POST'){posts++;throw new DOMException('timeout','TimeoutError');}
  return Response.json({workflow_runs:++reads===1?[{id:1,status:'completed'}]:[{id:2,status:'queued',event:'workflow_dispatch',head_branch:'main',created_at:new Date(dispatchAt).toISOString()},{id:1,status:'completed'}]});
 }});
 assert.equal(result.reconciled,true);assert.equal(posts,1);
});
test('transient read timeout recovers without duplicate dispatches',async()=>{
 let reads=0,posts=0;const waits=[];
 const result=await relay({...base,pause:async ms=>waits.push(ms),fetcher:async(u,o)=>{
  if(o.method==='POST'){posts++;return new Response(null,{status:204});}
  if(++reads===1)throw new DOMException('timeout','TimeoutError');
  return Response.json({workflow_runs:[]});
 }});
 assert.equal(result.queued,true);assert.equal(reads,2);assert.equal(posts,1);assert.deepEqual(waits,[2000]);
});
test('uncertain dispatch is never retried',async()=>{
 let posts=0;
 await assert.rejects(relay({...base,pause:async()=>{},fetcher:async(u,o)=>{
  if(o.method==='POST'){posts++;throw new DOMException('timeout','TimeoutError');}
  return Response.json({workflow_runs:[]});
 }}),/timeout/);
 assert.equal(posts,1);
});
test('supervisor hands over using the cheap relay mode',async()=>{
 const requests=[];const result=await relay({...base,fetcher:async(url,options)=>{requests.push({url,options});return options.method==='POST'?new Response(null,{status:204}):Response.json({workflow_runs:[{status:'completed'}]});}});
 assert.equal(result.queued,true);assert.deepEqual(JSON.parse(requests[1].options.body),{ref:'main',inputs:{relay:'true'}});
});
test('a pending supervisor prevents duplicate cloud relays',async()=>{
 let requests=0;const result=await relay({...base,fetcher:async()=>{requests++;return Response.json({workflow_runs:[{status:'queued'}]});}});
 assert.equal(result.queued,false);assert.equal(requests,1);
});
test('relay cannot dispatch outside the office or conceal dispatch failure',async()=>{
 await assert.rejects(relay({...base,workflow:'deploy.yml'}),/fuera de ámbito/);
 await assert.rejects(relay({...base,fetcher:async(u,o)=>o.method==='POST'?new Response(null,{status:403}):Response.json({workflow_runs:[]})}),/HTTP 403/);
});

const instant=Date.parse('2026-10-05T21:05:00Z');
const cloud={...base,workflow:'office-cloud-cycle.yml'};
const oldQueue={id:37,status:'queued',head_branch:'main',created_at:new Date(instant-16*60e3).toISOString(),event:'workflow_dispatch'};
function replay(snapshots,{postError=null}={}){
 const requests=[];let reads=0;
 return {requests,options:{now:()=>instant,pause:async()=>{},fetcher:async(url,options)=>{
  requests.push({url,method:options.method||'GET',body:options.body});
  if(options.method==='POST'){if(postError)throw postError;return new Response(null,{status:204});}
  return Response.json({workflow_runs:snapshots[Math.min(reads++,snapshots.length-1)]});
 }}};
}
test('one cloud request queued beyond fifteen minutes gets one replacement after reconfirmation, without cancelling any run',async()=>{
 const f=replay([[oldQueue],[oldQueue]]),result=await relay({...cloud,...f.options});
 assert.equal(result.queued,true);assert.equal(result.replacementRequested,true);assert.equal(result.staleQueuedRunId,37);assert.equal(result.queuedAgeMs,16*60e3);
 assert.equal(f.requests.filter(r=>r.method==='GET').length,2);assert.equal(f.requests.filter(r=>r.method==='POST').length,1);
 assert.ok(f.requests.every(r=>!r.url.includes('/cancel')));assert.ok(f.requests.find(r=>r.method==='POST').url.endsWith('/dispatches'));
});
test('an active execution, protected wait or more than one queued request prevents replacements regardless of age',async()=>{
 for(const runs of [[{...oldQueue,status:'in_progress'}],[{...oldQueue,status:'waiting'}],[{...oldQueue,status:'pending'}],[{...oldQueue,status:'requested'}],[oldQueue,{...oldQueue,id:38}],[oldQueue,{...oldQueue,id:38,created_at:new Date(instant).toISOString()}]]){
  const f=replay([runs]),result=await relay({...cloud,...f.options});assert.equal(result.queued,false);assert.equal(f.requests.filter(r=>r.method==='POST').length,0);
 }
});
test('young, undated, future-dated or unidentified queued requests are not replaced',async()=>{
 for(const run of [{...oldQueue,created_at:new Date(instant-14*60e3).toISOString()},{...oldQueue,created_at:undefined},{...oldQueue,created_at:'unknown'},{...oldQueue,created_at:new Date(instant+1).toISOString()},{...oldQueue,id:undefined}]){
  const f=replay([[run]]);assert.equal((await relay({...cloud,...f.options})).queued,false);assert.equal(f.requests.filter(r=>r.method==='POST').length,0);
 }
});
test('a queued request acquiring a runner during reconfirmation remains untouched',async()=>{
 const f=replay([[oldQueue],[{...oldQueue,status:'in_progress'}]]),result=await relay({...cloud,...f.options});
 assert.equal(result.queued,false);assert.equal(f.requests.length,2);assert.ok(f.requests.every(r=>r.method==='GET'));
});
test('a newly appeared queued request prevents replacement of the old request',async()=>{
 const fresh={...oldQueue,id:38,created_at:new Date(instant).toISOString()},f=replay([[oldQueue],[fresh]]),result=await relay({...cloud,...f.options});
 assert.equal(result.queued,false);assert.equal(f.requests.filter(r=>r.method==='POST').length,0);assert.equal(result.queuedRunId,38);
});
test('a completed queue item during reconfirmation permits a normal handoff rather than a claimed recovery',async()=>{
 const f=replay([[oldQueue],[{...oldQueue,status:'completed'}]]),result=await relay({...cloud,...f.options});
 assert.equal(result.queued,true);assert.equal(result.replacementRequested,undefined);assert.equal(f.requests.filter(r=>r.method==='POST').length,1);
});
test('manual development work is preserved because relay inputs cannot be proven from a run listing',async()=>{
 for(const event of ['workflow_dispatch',undefined]){
  const f=replay([[{...oldQueue,event}]]),result=await relay({...base,...f.options});
  assert.equal(result.queued,false);assert.equal(f.requests.filter(r=>r.method==='POST').length,0);assert.match(result.reason,/manual/);
 }
});
test('an old scheduled development request may get a cheap relay replacement',async()=>{
 const run={...oldQueue,event:'schedule'},f=replay([[run],[run]]),result=await relay({...base,...f.options});
 assert.equal(result.replacementRequested,true);assert.deepEqual(JSON.parse(f.requests.find(r=>r.method==='POST').body),{ref:'main',inputs:{relay:'true'}});
});
test('an uncertain replacement is not submitted twice when no new run appears',async()=>{
 const timeout=new DOMException('timeout','TimeoutError'),f=replay([[oldQueue]],{postError:timeout});
 await assert.rejects(relay({...cloud,...f.options}),e=>e===timeout);assert.equal(f.requests.filter(r=>r.method==='POST').length,1);assert.ok(f.requests.every(r=>!r.url.includes('/cancel')));
});
test('a replacement accepted before timeout is observed without resubmitting it',async()=>{
 const fresh={...oldQueue,id:38,created_at:new Date(instant).toISOString()},f=replay([[oldQueue],[oldQueue],[fresh,oldQueue]],{postError:new DOMException('timeout','TimeoutError')});
 const result=await relay({...cloud,...f.options});assert.equal(result.reconciled,true);assert.equal(result.replacementRequested,true);assert.equal(f.requests.filter(r=>r.method==='POST').length,1);
});
test('a malformed supervisor listing remains a visible error and cannot cause a dispatch',async()=>{
 let posts=0;await assert.rejects(relay({...cloud,pause:async()=>{},fetcher:async(u,o)=>{if(o.method==='POST')posts++;return Response.json({not_runs:[]});}}),/sin listado/);assert.equal(posts,0);
});

test('a cron or wrong-branch run appearing during an uncertain POST is not dispatch evidence',async()=>{
 for(const change of [{event:'schedule'},{head_branch:'feature'},{event:'workflow_run'}]){
  const fresh={...oldQueue,id:38,created_at:new Date(instant).toISOString(),...change},timeout=new DOMException('timeout','TimeoutError'),f=replay([[],[fresh]],{postError:timeout});
  await assert.rejects(relay({...cloud,...f.options}),e=>e===timeout);assert.equal(f.requests.filter(r=>r.method==='POST').length,1);
 }
});
test('dispatch reconciliation accepts second-rounded timestamps but rejects older or implausible future runs',async()=>{
 for(const offset of [-2000,2000]){
  const fresh={...oldQueue,id:38,created_at:new Date(instant+offset).toISOString()},timeout=new DOMException('timeout','TimeoutError'),f=replay([[],[fresh]],{postError:timeout});
  await assert.rejects(relay({...cloud,...f.options}),e=>e===timeout);assert.equal(f.requests.filter(r=>r.method==='POST').length,1);
 }
 const fresh={...oldQueue,id:38,created_at:new Date(instant-500).toISOString()},f=replay([[],[fresh]],{postError:new DOMException('timeout','TimeoutError')});
 const result=await relay({...cloud,...f.options});assert.equal(result.reconciled,true);assert.equal(result.observedRunId,38);assert.equal(f.requests.filter(r=>r.method==='POST').length,1);
});
test('a new run with unknown event, branch or timestamp leaves a POST failure visible',async()=>{
 for(const field of ['event','head_branch','created_at']){
  const fresh={...oldQueue,id:38,created_at:new Date(instant).toISOString(),[field]:undefined},timeout=new DOMException('timeout','TimeoutError'),f=replay([[],[fresh]],{postError:timeout});
  await assert.rejects(relay({...cloud,...f.options}),e=>e===timeout);assert.equal(f.requests.filter(r=>r.method==='POST').length,1);
 }
});
