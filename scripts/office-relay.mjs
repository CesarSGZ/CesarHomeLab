// Infrastructure supervisor: no model call, trading decision or permanent GitHub credential.
export async function relay({workflow,repository,token,fetcher=fetch,pause=ms=>new Promise(resolve=>setTimeout(resolve,ms))}) {
 if(!['office-cloud-cycle.yml','office-development.yml'].includes(workflow)||repository!=='CesarSGZ/CesarHomeLab'||!token)throw Error('Relevo de oficina fuera de ámbito');
 const base='https://api.github.com/repos/'+repository+'/actions/workflows/'+workflow;
 const headers={Authorization:'Bearer '+token,Accept:'application/vnd.github+json','Content-Type':'application/json'};
 let response;
 for(let attempt=0;attempt<3;attempt++){
  try{
   response=await fetcher(base+'/runs?branch=main&per_page=10',{headers,signal:AbortSignal.timeout(30000)});
   if(response.status<500&&response.status!==429)break;
   if(attempt===2)break;
  }catch(error){if(attempt===2)throw error;}
  await pause(2000*(attempt+1));
 }
 if(!response.ok)throw Error('Consulta del supervisor HTTP '+response.status);
 const runs=(await response.json()).workflow_runs;
 if(runs.some(r=>['queued','in_progress','waiting','pending','requested'].includes(r.status)))return {queued:false,reason:'Ya hay un relevo activo o en cola'};
 const body={ref:'main',...(workflow==='office-development.yml'?{inputs:{relay:'true'}}:{})};
 const next=await fetcher(base+'/dispatches',{method:'POST',headers,body:JSON.stringify(body),signal:AbortSignal.timeout(30000)});
 if(next.status!==204)throw Error('Relevo del supervisor HTTP '+next.status);
 return {queued:true,workflow};
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/office-relay.mjs'))console.log(JSON.stringify(await relay({workflow:process.argv[2],repository:process.env.GITHUB_REPOSITORY,token:process.env.GH_TOKEN})));
