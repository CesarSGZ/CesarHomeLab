// Infrastructure supervisor: no model call, trading decision or permanent GitHub credential.
const pendingStatuses=new Set(['queued','in_progress','waiting','pending','requested']);
const staleQueueAfterMs=15*60*1000;
function queueGate(runs,workflow,now){
 const pending=runs.filter(r=>pendingStatuses.has(r.status));
 if(!pending.length)return {blocked:false};
 const queued=pending.filter(r=>r.status==='queued');
 if(pending.length!==1||queued.length!==1)return {blocked:true,reason:'Ya hay un relevo activo o varias peticiones en cola',pendingRuns:pending.map(r=>({id:r.id,status:r.status}))};
 const run=queued[0],createdAt=Date.parse(run.created_at),ageMs=now-createdAt;
 if(!Number.isFinite(createdAt)||ageMs<staleQueueAfterMs)return {blocked:true,reason:'Ya hay un relevo en cola; todavía no se considera antiguo',queuedRunId:run.id,queuedAgeMs:Number.isFinite(ageMs)?ageMs:null};
 // A manual watchdog run may carry resume_entries. Its inputs are not available
 // here, so never replace it with a cheap relay.
 if(workflow==='office-watchdog.yml'&&!['schedule','workflow_run'].includes(run.event))return {blocked:true,reason:'La cola del supervisor puede contener una petición manual; no se sustituye automáticamente',queuedRunId:run.id,queuedAgeMs:ageMs};
 if(!Number.isSafeInteger(run.id)||run.id<=0)return {blocked:true,reason:'La petición antigua no tiene una identidad válida; no se sustituye automáticamente'};
 return {blocked:true,recoverable:true,runId:run.id,ageMs};
}
export async function relay({workflow,repository,token,fetcher=fetch,now=()=>Date.now(),pause=ms=>new Promise(resolve=>setTimeout(resolve,ms))}) {
 if(!['office-cloud-cycle.yml','office-watchdog.yml'].includes(workflow)||repository!=='CesarSGZ/CesarHomeLab'||!token)throw Error('Relevo de oficina fuera de ámbito');
 const base='https://api.github.com/repos/'+repository+'/actions/workflows/'+workflow;
 const headers={Authorization:'Bearer '+token,Accept:'application/vnd.github+json','Content-Type':'application/json'};
 const listRuns=async()=>{let response;
 for(let attempt=0;attempt<3;attempt++){
  try{
   response=await fetcher(base+'/runs?branch=main&per_page=100',{headers,signal:AbortSignal.timeout(30000)});
   if(!response.ok){if(response.status<500&&response.status!==429||attempt===2)throw Error('Consulta del supervisor HTTP '+response.status);}
   else {const runs=(await response.json()).workflow_runs;if(!Array.isArray(runs))throw Error('Respuesta del supervisor sin listado de ejecuciones');return runs;}
  }catch(error){if(attempt===2)throw error;}
  await pause(2000*(attempt+1));
 }
 };
 let runs=await listRuns(),gate=queueGate(runs,workflow,now()),recovery=null;
 if(gate.blocked&&!gate.recoverable)return {queued:false,...gate};
 if(gate.recoverable){
  // Re-read after a short delay: a runner may have acquired the queued request.
  // Never cancel a run. At most one replacement request is accepted, and an
  // additional queued request prevents this path until it has been handled.
  const previousRunId=gate.runId;await pause(2000);runs=await listRuns();gate=queueGate(runs,workflow,now());
  if(gate.blocked&&(!gate.recoverable||gate.runId!==previousRunId))return {queued:false,...gate,reason:gate.reason||'La cola cambió durante la comprobación; se conserva el relevo existente'};
  if(gate.recoverable)recovery={staleQueuedRunId:gate.runId,queuedAgeMs:gate.ageMs};
 }

 const body={ref:'main',...(workflow==='office-watchdog.yml'?{inputs:{relay:'true'}}:{})};
 const dispatchStartedAt=now();let next;
 try{next=await fetcher(base+'/dispatches',{method:'POST',headers,body:JSON.stringify(body),signal:AbortSignal.timeout(30000)});}
 catch(error){
  // A timeout may occur after GitHub accepted the dispatch. Reconcile before reporting failure;
  // never submit the uncertain POST twice.
  const previous=new Set(runs.map(r=>r.id));
  for(let attempt=0;attempt<3;attempt++){
   await pause(2000*(attempt+1));
   // Lists are second-rounded. Only a new manual dispatch on the requested
   // branch within this attempt's time window is evidence; a cron is not.
   const observed=(await listRuns()).find(r=>r.id&&!previous.has(r.id)&&r.event==='workflow_dispatch'&&r.head_branch==='main'&&Date.parse(r.created_at)>=dispatchStartedAt-1000&&Date.parse(r.created_at)<=now()+1000);
   if(observed)return {queued:true,workflow,reconciled:true,observedRunId:observed.id,...(recovery?{replacementRequested:true,...recovery}:{})};
  }
  throw error;
 }
 if(next.status!==204)throw Error('Relevo del supervisor HTTP '+next.status);
 return {queued:true,workflow,...(recovery?{replacementRequested:true,...recovery}:{})};
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/office-relay.mjs'))console.log(JSON.stringify(await relay({workflow:process.argv[2],repository:process.env.GITHUB_REPOSITORY,token:process.env.GH_TOKEN})));
