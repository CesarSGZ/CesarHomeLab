import {execFileSync} from 'node:child_process';
import {randomBytes} from 'node:crypto';
const args=['wrangler','secret','list','--config','trading-worker/wrangler.jsonc'];
const names=JSON.parse(execFileSync('npx',args,{encoding:'utf8'}));
if(!names.some(s=>s.name==='TRADING_ENCRYPTION_SECRET')){
  execFileSync('npx',['wrangler','secret','put','TRADING_ENCRYPTION_SECRET','--config','trading-worker/wrangler.jsonc'],{input:randomBytes(48).toString('base64'),stdio:['pipe','pipe','pipe']});
  console.log('Trading Lab: clave de cifrado creada en Cloudflare.');
}else console.log('Trading Lab: se conserva la clave de cifrado existente.');
