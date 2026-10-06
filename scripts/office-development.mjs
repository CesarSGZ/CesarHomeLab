import {validateSource} from './office-source-validation.mjs';
import {readFileSync,writeFileSync,appendFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {developmentFiles,validateEdits} from '../trading-worker/office-boundary.js';
import {cloudDatabase} from './office-cloud-db.mjs';
import {locked} from '../trading-worker/engine.js';
import {developmentAction} from '../trading-worker/development.js';
import {runOfficeTaskWhenAvailable} from './office-availability.mjs';
import {developmentResultBody,queueDevelopmentResult,drainDevelopmentResults} from './office-development-results.mjs';
const command=process.argv[2];
const localDevelopment=async body=>{const env={CONTROL_DB:cloudDatabase()},outcome=await runOfficeTaskWhenAvailable({db:env.CONTROL_DB,run:async()=>{let result;await locked(env,s=>{result=developmentAction(s,body);});return result;}});return outcome.status==='busy'?{job:null,busy:true,retryAt:outcome.retryAt}:outcome.result;};
if(command==='lease'){const recovery=await drainDevelopmentResults({db:cloudDatabase(),withLock:locked});if(recovery.remaining)console.log(JSON.stringify({developmentResults:recovery}));const {job}=recovery.remaining?{job:null}:await localDevelopment({action:'lease'});writeFileSync('/tmp/office-job.json',JSON.stringify(job));appendFileSync(process.env.GITHUB_OUTPUT,'has_job='+!!job+'\n');}
if(command==='apply'){
 const job=JSON.parse(readFileSync('/tmp/office-job.json','utf8'));validateEdits(job.edits);const changed=new Map();
 for(const e of job.edits){const original=readFileSync(e.file,'utf8');const sha=createHash('sha1').update('blob '+Buffer.byteLength(original)+'\0').update(original).digest('hex');if(sha!==e.baseSha)throw Error('La fuente cambió desde la reunión');const current=changed.get(e.file)||original;if(current.split(e.find).length!==2)throw Error('La sustitución debe ser única');changed.set(e.file,current.replace(e.find,e.replace));}
 for(const [path,source] of changed)validateSource(path,source);
 for(const [path,source] of changed)writeFileSync(path,source);
 writeFileSync('/tmp/office-files.json',JSON.stringify([...changed.keys()]));
}
if(command==='commit'){
 const files=JSON.parse(readFileSync('/tmp/office-files.json','utf8'));if(files.some(f=>!developmentFiles.includes(f)))throw Error('Ámbito inválido');execFileSync('git',['config','user.name','Cadaqui · Agent Office']);execFileSync('git',['config','user.email','cadaqui@users.noreply.github.com']);execFileSync('git',['add','--',...files]);execFileSync('git',['commit','-m','Agent Office: mejora autónoma de Cadaqui']);const sha=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();writeFileSync('/tmp/office-commit',sha);appendFileSync(process.env.GITHUB_OUTPUT,'commit='+sha+'\n');
}
if(command==='finish'){const job=JSON.parse(readFileSync('/tmp/office-job.json','utf8'));if(job){const db=cloudDatabase(),body=developmentResultBody(job,{status:process.env.OFFICE_RESULT==='success'?'applied':'rejected',commit:process.env.OFFICE_COMMIT||'',error:process.env.OFFICE_RESULT==='success'?'':'Pruebas o despliegue fallidos; consultar ejecución GitHub Actions '+process.env.GITHUB_RUN_ID});await queueDevelopmentResult(db,body);const recovery=await drainDevelopmentResults({db,withLock:locked});console.log(JSON.stringify({developmentResults:recovery,jobId:job.id,result:body.status,recorded:!recovery.remaining}));}}
