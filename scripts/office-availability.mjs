import {recoveryDecision} from './office-recovery.mjs';
export async function officeAvailability(db,clock=Date.now){
 const row=await db.prepare('SELECT lock_until FROM trading_state WHERE id=1').first(),decision=recoveryDecision(null,row?.lock_until,clock());
 return decision.status==='busy'?{...decision,reason:'Otra tarea mantiene el bloqueo; trabajo aplazado sin ejecutar'}:{status:'ready'};
}
// Deferral is accepted only for a confirmed occupied lease. Never clear a lease,
// retry the mutation, or report an unexecuted cycle as completed.
export async function runOfficeTaskWhenAvailable({db,run,clock=Date.now}){
 const availability=await officeAvailability(db,clock);if(availability.status==='busy')return availability;
 try{return {status:'complete',result:await run()};}
 catch(error){
  if(error.message!=='Ya hay una tarea en ejecución')throw error;
  const current=await officeAvailability(db,clock);if(current.status!=='busy')throw error;return current;
 }
}
