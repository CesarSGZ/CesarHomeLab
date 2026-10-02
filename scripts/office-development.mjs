import {readFileSync,writeFileSync,appendFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {developmentFiles,validateEdits} from '../trading-worker/office-boundary.js';
const command=process.argv[2],endpoint='https://cesar-solla.pages.dev/api/trading/development';
const api=async body=>{const r=await fetch(endpoint,{method:'POST',headers:{Authorization:'Bearer '+process.env.OFFICE_DEV_TOKEN,'Content-Type':'application/json'},body:JSON.stringify(body)});if(!r.ok)throw Error('Control de desarrollo HTTP '+r.status);return r.json();};
if(command==='lease'){const {job}=await api({action:'lease'});writeFileSync('/tmp/office-job.json',JSON.stringify(job));appendFileSync(process.env.GITHUB_OUTPUT,'has_job='+!!job+'\n');}
if(command==='apply'){
 const job=JSON.parse(readFileSync('/tmp/office-job.json','utf8'));validateEdits(job.edits);const changed=new Map();
 for(const e of job.edits){const original=readFileSync(e.file,'utf8');const sha=createHash('sha1').update('blob '+Buffer.byteLength(original)+'\0').update(original).digest('hex');if(sha!==e.baseSha)throw Error('La fuente cambió desde la reunión');const current=changed.get(e.file)||original;if(current.split(e.find).length!==2)throw Error('La sustitución debe ser única');changed.set(e.file,current.replace(e.find,e.replace));}
 for(const [path,source] of changed){
  if(path.endsWith('.js')){
   // No host execution, credential access, reflection, dynamic evaluation or protected imports.
   if(/\b(?:process|globalThis|eval|Function|require|constructor|__proto__|prototype|Reflect|WebSocket|getOwnPropertyDescriptors?|getPrototypeOf|defineProperty|setPrototypeOf)\b|\bimport\s*\(|node:|javascript:|crypto-store|engine\.js|market-data\.js|index\.js|office-boundary\.js.*(?:set|write)/.test(source))throw Error('Acceso fuera del entorno autónomo');
   const imports=[...source.matchAll(/(?:from\s*|import\s*)['"]([^'"]+)['"]/g)].map(m=>m[1]);const permitted=['./core.js','./company.js','./governance.js','./fundamentals.js','./development.js','./office-boundary.js','./trading-office.js?v=20261002office9','./vendor/three.module.js'];if(imports.some(i=>!permitted.includes(i)))throw Error('Dependencia fuera de la oficina');
  }else if(/(?:^|})\s*(?:body|html|:root|\.mc-|#mc-)/m.test(source.replace(/body\[data-company-theme[^}]+}/g,'')))throw Error('CSS fuera de Agent Office');
 }
 for(const [path,source] of changed)writeFileSync(path,source);
 writeFileSync('/tmp/office-files.json',JSON.stringify([...changed.keys()]));
}
if(command==='commit'){
 const files=JSON.parse(readFileSync('/tmp/office-files.json','utf8'));if(files.some(f=>!developmentFiles.includes(f)))throw Error('Ámbito inválido');execFileSync('git',['config','user.name','Cadaqui · Agent Office']);execFileSync('git',['config','user.email','cadaqui@users.noreply.github.com']);execFileSync('git',['add','--',...files]);execFileSync('git',['commit','-m','Agent Office: mejora autónoma de Cadaqui']);const sha=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();writeFileSync('/tmp/office-commit',sha);appendFileSync(process.env.GITHUB_OUTPUT,'commit='+sha+'\n');
}
if(command==='finish'){const job=JSON.parse(readFileSync('/tmp/office-job.json','utf8'));if(job)await api({action:'complete',id:job.id,lease:job.lease,status:process.env.OFFICE_RESULT==='success'?'applied':'rejected',commit:process.env.OFFICE_COMMIT||'',error:process.env.OFFICE_RESULT==='success'?'':'Pruebas o despliegue fallidos; consultar ejecución GitHub Actions '+process.env.GITHUB_RUN_ID});}
