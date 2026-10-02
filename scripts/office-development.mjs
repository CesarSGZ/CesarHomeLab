import {validateSource} from './office-source-validation.mjs';
import {readFileSync,writeFileSync,appendFileSync,mkdirSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {developmentFiles,validateEdits} from '../trading-worker/office-boundary.js';
const command=process.argv[2],endpoint='https://cesar-solla.pages.dev/api/trading/development';
const api=async body=>{const r=await fetch(endpoint,{method:'POST',headers:{Authorization:'Bearer '+process.env.OFFICE_DEV_TOKEN,'Content-Type':'application/json'},body:JSON.stringify(body)});if(!r.ok)throw Error('Control de desarrollo HTTP '+r.status);return r.json();};
if(command==='auth'){const result=await api({action:'deployment-auth'});const config=result.config||process.env.OFFICE_WRANGLER_AUTH;if(!config)throw Error('Credencial de despliegue no configurada');mkdirSync(process.env.HOME+'/.config/.wrangler/config',{recursive:true});writeFileSync(process.env.HOME+'/.config/.wrangler/config/default.toml',config,{mode:0o600});}
if(command==='save-auth'){const config=readFileSync(process.env.HOME+'/.config/.wrangler/config/default.toml','utf8');await api({action:'deployment-auth',config});}
if(command==='lease'){const {job}=await api({action:'lease'});writeFileSync('/tmp/office-job.json',JSON.stringify(job));appendFileSync(process.env.GITHUB_OUTPUT,'has_job='+!!job+'\n');}
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
if(command==='finish'){const job=JSON.parse(readFileSync('/tmp/office-job.json','utf8'));if(job)await api({action:'complete',id:job.id,lease:job.lease,status:process.env.OFFICE_RESULT==='success'?'applied':'rejected',commit:process.env.OFFICE_COMMIT||'',error:process.env.OFFICE_RESULT==='success'?'':'Pruebas o despliegue fallidos; consultar ejecución GitHub Actions '+process.env.GITHUB_RUN_ID});}
