import {runOfficeTaskWhenAvailable} from './office-availability.mjs';
import {developmentAction} from '../trading-worker/development.js';

const table='trading_development_results',sha=/^[a-f0-9]{40}$/;
export function developmentResultBody(job,{status,commit='',error=''}={}){
 if(!job||typeof job.id!=='string'||!job.id||job.id.length>120||typeof job.lease!=='string'||!job.lease||job.lease.length>120)throw Error('Identidad o lease del resultado inválida');
 if(!['applied','rejected'].includes(status)||typeof commit!=='string'||commit&&!sha.test(commit)||status==='applied'&&!sha.test(commit))throw Error('Resultado de desarrollo sin estado o commit confirmado');
 if(typeof error!=='string'||status==='applied'&&error)throw Error('Error del resultado incompatible con un despliegue aplicado');
 return {action:'complete',id:job.id,lease:job.lease,status,commit,error:error.slice(0,1500)};
}
const key=body=>JSON.stringify([body.id,body.lease]);
async function ensure(db){
 await db.prepare('CREATE TABLE IF NOT EXISTS '+table+' (id TEXT PRIMARY KEY, job_id TEXT NOT NULL, lease_token TEXT NOT NULL, payload TEXT NOT NULL, status TEXT NOT NULL DEFAULT \'pending\', created_at INTEGER NOT NULL, finished_at INTEGER, error TEXT)').run();
}
export async function queueDevelopmentResult(db,body,now=Date.now()){
 body=developmentResultBody(body,body);const id=key(body),payload=JSON.stringify(body);await ensure(db);let writeError=null;
 try{await db.prepare('INSERT OR IGNORE INTO '+table+' (id,job_id,lease_token,payload,created_at) VALUES (?,?,?,?,?)').bind(id,body.id,body.lease,payload,now).run();}catch(error){writeError=error;}
 // Reconcile an uncertain insert by reading its unique key; never submit it twice.
 const stored=await db.prepare('SELECT * FROM '+table+' WHERE id=?').bind(id).first();
 if(!stored){if(writeError)throw writeError;throw Error('No se confirmó la conservación del resultado de desarrollo');}
 if(stored.payload!==payload)throw Error('Ya existe un resultado diferente para este trabajo y lease');
 return {id,status:stored.status,persisted:true};
}
function conflict(message){const error=Error(message);error.code='OFFICE_DEVELOPMENT_RESULT_CONFLICT';return error;}
function matches(job,body){return job.status===body.status&&(job.commit||'')===body.commit&&(job.error||'')===body.error;}
export async function drainDevelopmentResults({db,withLock,clock=Date.now,limit=5}){
 if(typeof withLock!=='function'||!Number.isInteger(limit)||limit<1||limit>5)throw Error('Recuperación de resultados fuera de límites');
 await ensure(db);const rows=(await db.prepare('SELECT * FROM '+table+' WHERE status=\'pending\' ORDER BY created_at LIMIT ?').bind(limit).all()).results;let recorded=0,reconciled=0,busy=null;
 for(const row of rows){
  try{
   const payload=JSON.parse(row.payload),body=developmentResultBody(payload,payload);
   const outcome=await runOfficeTaskWhenAvailable({db,clock,run:async()=>{
    let alreadyRecorded=false;await withLock({CONTROL_DB:db},state=>{
     const job=state.company?.development?.find(job=>job.id===body.id);
     if(!job||job.lease!==body.lease)throw conflict('Resultado pendiente con trabajo o lease distinto; requiere revisión');
     if(['applied','rejected'].includes(job.status)){
      if(!matches(job,body))throw conflict('Resultado pendiente contradice el resultado ya registrado');
      alreadyRecorded=true;return;
     }
     if(job.status!=='running')throw conflict('El trabajo pendiente ya no está en ejecución; requiere revisión');
     developmentAction(state,body,clock());
    });return {alreadyRecorded};
   }});
   if(outcome.status==='busy'){busy=outcome;break;}
   // Ack only after the protected state checkpoint completed successfully.
   await db.prepare('UPDATE '+table+' SET status=\'complete\',finished_at=?,error=NULL WHERE id=? AND status=\'pending\'').bind(clock(),row.id).run();
   if(outcome.result.alreadyRecorded)reconciled++;else recorded++;
  }catch(error){
   if(error.code==='OFFICE_DEVELOPMENT_RESULT_CONFLICT')await db.prepare('UPDATE '+table+' SET status=\'failed\',finished_at=?,error=? WHERE id=? AND status=\'pending\'').bind(clock(),String(error.message).slice(0,1500),row.id).run();
   throw error;
  }
 }
 const remaining=(await db.prepare('SELECT COUNT(*) AS n FROM '+table+' WHERE status=\'pending\'').first()).n;
 return {status:remaining?'pending':'complete',recorded,reconciled,remaining,retryAt:busy?.retryAt||null};
}
