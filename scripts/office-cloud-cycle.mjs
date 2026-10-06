import {cloudDatabase} from './office-cloud-db.mjs';
import {locked,log} from '../trading-worker/store.js';
import {cycle,status} from '../trading-worker/v2/cycle.js';
import worker from '../trading-worker/index.js';
import {installPublicDataBridge} from './office-cloud-fetch.mjs';
import {startOfficeProgress} from './office-progress.mjs';
import {runOfficeTaskWhenAvailable,officeAvailability} from './office-availability.mjs';
const db=cloudDatabase();
const r=await fetch('https://cesar-solla.pages.dev/api/trading/development',{method:'POST',headers:{Authorization:'Bearer '+process.env.OFFICE_DEV_TOKEN,'Content-Type':'application/json'},body:JSON.stringify({action:'runtime-key'}),signal:AbortSignal.timeout(30000)});
if(!r.ok)throw Error('Conexión segura de IA HTTP '+r.status);const {key}=await r.json();if(key&&process.env.GITHUB_ACTIONS==='true')console.log('::add-mask::'+key);
const env={CONTROL_DB:db,OPENAI_RUNTIME_KEY:key};
installPublicDataBridge(process.env.OFFICE_DEV_TOKEN);
async function publish(){const live=await status(env);live.commands=(await db.prepare('SELECT id,path,status,completed_at,result FROM trading_command_queue ORDER BY created_at DESC LIMIT 10').all()).results.map(c=>({id:c.id,path:c.path,status:c.status,completedAt:c.completed_at,error:c.result?JSON.parse(c.result).error:null}));await db.prepare('INSERT INTO trading_status_cache(id,payload,updated_at) VALUES(1,?,?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload,updated_at=excluded.updated_at').bind(JSON.stringify(live),Date.now()).run();return live;}
const progress=startOfficeProgress(publish);
let ran=false,live,failure=null,outcome;
try{
 outcome=await runOfficeTaskWhenAvailable({db,run:async()=>{
 const commands=(await db.prepare("SELECT * FROM trading_command_queue WHERE status='queued' ORDER BY created_at LIMIT 10").all()).results;
 for(const command of commands){
  const claimed=await db.prepare("UPDATE trading_command_queue SET status='running' WHERE id=? AND status='queued' RETURNING id").bind(command.id).first();if(!claimed)continue;
  const result=await worker.fetch(new Request('https://internal'+command.path,{method:'POST',headers:{'Content-Type':'application/json'},body:command.body}),env,{});const response=await result.json();
  if(!response.ok&&response.error==='Ya hay una tarea en ejecución'&&(await officeAvailability(db)).status==='busy'){
   await db.prepare("UPDATE trading_command_queue SET status='queued' WHERE id=? AND status='running'").bind(command.id).run();throw Error(response.error);
  }
  await db.prepare('UPDATE trading_command_queue SET status=?,completed_at=?,result=? WHERE id=?').bind(response.ok?'complete':'failed',Date.now(),JSON.stringify(response),command.id).run();
  if(!response.ok)await locked(env,s=>log(s,'system','Orden del dashboard rechazada: '+String(response.error).slice(0,160),'error'));
  if(command.path==='/run'&&response.ok)ran=true;
 }
 return ran?{manual:true}:await cycle(env);
 }});
}catch(error){failure=error;}
finally{try{live=await progress.finish();}catch(error){if(!failure)failure=error;}}
if(failure)throw failure;
console.log(JSON.stringify({cycleStatus:outcome.status,retryAt:outcome.retryAt||null,lastTick:live.lastTick?new Date(live.lastTick).toISOString():null,error:live.lastError,cycle:outcome.result||null,positions:live.positions.length,orders:live.orders.length,closed:live.closed.length,equity:Math.round(live.company.equity),monthPnl:Math.round(live.company.monthPnl),mood:live.company.mood,market:live.market.status,remainingEur:live.budget.remainingEur,ai:live.budget.ai,meeting:live.meetings[0]?.topic||null,lastEvent:live.timeline.at(-1)?.text||null}));
