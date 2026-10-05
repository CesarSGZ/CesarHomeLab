import {cloudDatabase} from './office-cloud-db.mjs';
import {locked,log} from '../trading-worker/engine.js';
import {runOfficeRecovery} from './office-recovery.mjs';
const result=await runOfficeRecovery({db:cloudDatabase(),withLock:locked,logger:log,runCycle:()=>import('./office-cloud-cycle.mjs'),resumeEntries:process.env.OFFICE_RESUME_ENTRIES==='1'});
console.log(JSON.stringify(result));
