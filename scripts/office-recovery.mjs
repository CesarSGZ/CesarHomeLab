const BUSY_ERROR='Ya hay una tarea en ejecución';
export function recoveryDecision(state,lockUntil,now=Date.now()){
 if(!Number.isFinite(now))throw Error('Hora del supervisor inválida');
 if(lockUntil!=null&&(!Number.isFinite(lockUntil)||lockUntil<0))throw Error('Lease del controlador inválida');
 // The SQL lease is acquired only when lock_until < now, including equality.
 if(lockUntil>0&&lockUntil>=now)return {status:'busy',retryAt:lockUntil,reason:'Recuperación pendiente: otra tarea conserva la lease'};
 if(!state?.lastTick||now-state.lastTick>10*60e3||state.lastError)return {status:'recover',reason:state?.lastError?'Ciclo anterior con incidencia':'Ciclo atrasado o aún no ejecutado'};
 return {status:'healthy',reason:'Motor reciente; no hace falta recuperarlo'};
}
export async function runOfficeRecovery({db,withLock,logger,runCycle,resumeEntries=false,clock=Date.now}){
 let resumeApplied=false;
 const readLease=async()=>{const row=await db.prepare('SELECT lock_until FROM trading_state WHERE id=1').first();return recoveryDecision(null,row?.lock_until,clock());};
 const defer=decision=>{
  if(resumeEntries&&!resumeApplied){const error=Error('Reanudación manual pendiente: la oficina está ocupada hasta '+new Date(decision.retryAt).toISOString()+'. No se ha aplicado la orden.');error.code='OFFICE_RESUME_PENDING';error.retryAt=decision.retryAt;throw error;}
  return {...decision,resumeApplied};
 };
 const guardedLock=async callback=>{
  try{await withLock({CONTROL_DB:db},callback);return null;}
  catch(error){
   if(error.message!==BUSY_ERROR)throw error;
   // Only a confirmed occupied lease turns a race into a routine wait.
   const lease=await readLease();if(lease.status!=='busy')throw error;return defer(lease);
  }
 };
 const lease=await readLease();if(lease.status==='busy')return defer(lease);
 if(resumeEntries){
  const busy=await guardedLock(s=>{s.paused=false;logger(s,'boss','César solicita continuar la preparación y las compras ficticias condicionadas; nuevas entradas reanudadas. No se fuerza ninguna orden.');});
  if(busy)return busy;resumeApplied=true;
 }
 const row=await db.prepare('SELECT payload,updated_at FROM trading_status_cache WHERE id=1').first(),state=row?JSON.parse(row.payload):null,decision=recoveryDecision(state,null,clock());
 if(decision.status!=='recover')return {...decision,resumeApplied};
 const busy=await guardedLock(s=>logger(s,'designer','Supervisor de Cadaqui: ciclo atrasado o fallido; se ejecuta recuperación automática sin llamada a IA.','warning'));
 if(busy)return busy;
 await runCycle();return {status:'recovered',reason:'Recuperación ejecutada y estado publicado',resumeApplied};
}
