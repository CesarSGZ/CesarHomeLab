import {cloudDatabase} from './office-cloud-db.mjs';
import {locked,log} from '../trading-worker/engine.js';
const db=cloudDatabase();
if(process.env.OFFICE_RESUME_ENTRIES==='1')await locked({CONTROL_DB:db},s=>{s.paused=false;log(s,'boss','César solicita continuar la preparación y las compras ficticias condicionadas; nuevas entradas reanudadas. No se fuerza ninguna orden.');});
const row=await db.prepare('SELECT payload,updated_at FROM trading_status_cache WHERE id=1').first();
const state=row?JSON.parse(row.payload):null;
if(!state?.lastTick||Date.now()-state.lastTick>10*60e3||state.lastError){
 await locked({CONTROL_DB:db},s=>log(s,'designer','Supervisor de Cadaqui: ciclo atrasado o fallido; se ejecuta recuperación automática sin llamada a IA.','warning'));
 await import('./office-cloud-cycle.mjs');
 console.log('Recuperación ejecutada y estado publicado.');
}else console.log('Supervisor de Cadaqui: motor reciente; no hace falta recuperarlo.');
