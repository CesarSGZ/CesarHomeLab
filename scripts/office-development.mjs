import {validateSource} from './office-source-validation.mjs';
import {readFileSync,writeFileSync,appendFileSync,mkdirSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {developmentFiles,validateEdits} from '../trading-worker/office-boundary.js';
import {cloudDatabase} from './office-cloud-db.mjs';
import {locked} from '../trading-worker/engine.js';
import {developmentAction} from '../trading-worker/development.js';
const command=process.argv[2],endpoint='https://cesar-solla.pages.dev/api/trading/development';
const api=async body=>{const r=await fetch(endpoint,{method:'POST',headers:{Authorization:'Bearer '+process.env.OFFICE_DEV_TOKEN,'Content-Type':'application/json'},body:JSON.stringify(body)});if(!r.ok)throw Error('Control de desarrollo HTTP '+r.status);return r.json();};
const validAuth=config=>typeof config==='string'&&/oauth_token\s*=\s*"[^"]+"/.test(config)&&/refresh_token\s*=\s*"[^"]+"/.test(config);
if(command==='auth'){
 const result=await api({action:'deployment-auth'});const candidates=[result.config,process.env.OFFICE_WRANGLER_AUTH].filter(validAuth).sort((a,b)=>Date.parse(b.match(/expiration_time\s*=\s*"([^"]+)"/)?.[1]||0)-Date.parse(a.match(/expiration_time\s*=\s*"([^"]+)"/)?.[1]||0));let config=candidates[0];if(!validAuth(config))throw Error('Credencial de despliegue no configurada');
 const expiry=config.match(/expiration_time\s*=\s*"([^"]+)"/)?.[1];
 console.log('Sesión del controlador: '+(validAuth(result.config)?'almacenada':'respaldo')+'; caducidad '+(expiry||'desconocida'));
 if(!expiry||Date.parse(expiry)<Date.now()+300000){
  const refresh=config.match(/refresh_token\s*=\s*"([^"]+)"/)[1];
  const r=await fetch('https://dash.cloudflare.com/oauth2/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'refresh_token',refresh_token:refresh,client_id:'54d11594-84e4-41aa-b438-e81b8fa78ee7'})});const j=await r.json();
  if(!r.ok||!j.access_token)throw Error('Renovación Cloudflare HTTP '+r.status+' '+String(j.error||'sin token').slice(0,80));
  config=config.replace(/oauth_token\s*=\s*"[^"]+"/,'oauth_token = '+JSON.stringify(j.access_token)).replace(/expiration_time\s*=\s*"[^"]+"/,'expiration_time = '+JSON.stringify(new Date(Date.now()+j.expires_in*1000).toISOString()));
  if(j.refresh_token)config=config.replace(/refresh_token\s*=\s*"[^"]+"/,'refresh_token = '+JSON.stringify(j.refresh_token));
  await api({action:'deployment-auth',config});console.log('Sesión renovada y guardada antes del despliegue.');
 }
 await api({action:'deployment-auth',config});mkdirSync(process.env.HOME+'/.config/.wrangler/config',{recursive:true});writeFileSync(process.env.HOME+'/.config/.wrangler/config/default.toml',config,{mode:0o600});
}
if(command==='save-auth'){const config=readFileSync(process.env.HOME+'/.config/.wrangler/config/default.toml','utf8');if(validAuth(config))await api({action:'deployment-auth',config});else console.log('Se conserva la credencial anterior; la sesión actual está vacía.');}
const localDevelopment=async body=>{const env={CONTROL_DB:cloudDatabase()};const row=await env.CONTROL_DB.prepare('SELECT lock_until FROM trading_state WHERE id=1').first();if(row?.lock_until>Date.now())return {job:null,busy:true};let result;await locked(env,s=>{result=developmentAction(s,body);});return result;};
if(command==='lease'){const {job}=await localDevelopment({action:'lease'});writeFileSync('/tmp/office-job.json',JSON.stringify(job));appendFileSync(process.env.GITHUB_OUTPUT,'has_job='+!!job+'\n');}
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
if(command==='finish'){const job=JSON.parse(readFileSync('/tmp/office-job.json','utf8'));if(job)await localDevelopment({action:'complete',id:job.id,lease:job.lease,status:process.env.OFFICE_RESULT==='success'?'applied':'rejected',commit:process.env.OFFICE_COMMIT||'',error:process.env.OFFICE_RESULT==='success'?'':'Pruebas o despliegue fallidos; consultar ejecución GitHub Actions '+process.env.GITHUB_RUN_ID});}
