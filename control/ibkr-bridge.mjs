// Node >=22. Solo consultas GET a IBKR; no existe ninguna función de órdenes.
import https from 'node:https';
import {existsSync,readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const envFile=fileURLToPath(new URL('./ibkr-bridge.env',import.meta.url));if(existsSync(envFile))process.loadEnvFile(envFile);
const base=new URL(process.env.IBKR_BASE_URL||'https://localhost:5000/v1/api');
const mission=new URL(process.env.MISSION_CONTROL_URL||'https://cesar-solla.pages.dev');
const token=process.env.TRADING_BRIDGE_TOKEN;
if(!token||token.length<40)throw Error('Configura TRADING_BRIDGE_TOKEN en ibkr-bridge.env');
if(mission.protocol!=='https:')throw Error('Mission Control debe usar HTTPS');
if(base.protocol!=='https:'||!['localhost','127.0.0.1'].includes(base.hostname))throw Error('Solo se permite un Gateway IBKR HTTPS local');
const ca=process.env.IBKR_CA_CERT?readFileSync(process.env.IBKR_CA_CERT):undefined;
function ib(path){
  if(!/^\/(iserver\/auth\/status$|iserver\/accounts$|iserver\/secdef\/search\?|iserver\/contract\/\d+\/info$|iserver\/marketdata\/snapshot\?)/.test(path))throw Error('Consulta no permitida');
  return new Promise((resolve,reject)=>{const r=https.get(new URL(base.pathname.replace(/\/$/,'')+path,base.origin),{ca,rejectUnauthorized:true},res=>{let body='';res.on('data',d=>body+=d);res.on('end',()=>{try{if(res.statusCode!==200)throw Error(`IBKR HTTP ${res.statusCode}`);resolve(JSON.parse(body));}catch(e){reject(e);}});});r.setTimeout(12000,()=>r.destroy(Error('Gateway sin respuesta')));r.on('error',reject);});
}
async function portal(body){const response=await fetch(new URL('/api/trading/bridge',mission),{method:body?'POST':'GET',headers:{authorization:`Bearer ${token}`,'content-type':'application/json'},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(20000)});if(!response.ok)throw Error(`Mission Control HTTP ${response.status}`);return response.json();}
const parse=value=>{const s=String(value??'').replace(/,/g,'');if(!/^\d+(\.\d+)?[MK]?$/i.test(s))return 0;return parseFloat(s)*(/M$/i.test(s)?1e6:/K$/i.test(s)?1e3:1);};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));const contracts={};let running=false;
async function tick(){if(running)return;running=true;try{
  const wanted=await portal();if(wanted.mode!=='real'){console.log('Demo activa: el puente espera al modo mercado real.');return;}
  const auth=await ib('/iserver/auth/status');if(!auth.authenticated)throw Error('Autentica Client Portal Gateway en tu navegador');await ib('/iserver/accounts');
  for(const a of wanted.symbols){if(contracts[a.symbol])continue;
    const matches=await ib(`/iserver/secdef/search?symbol=${encodeURIComponent(a.symbol)}&secType=STK`);
    const results=(Array.isArray(matches)?matches:[]).filter(x=>x.symbol===a.symbol&&x.sections?.some(s=>s.secType==='STK')&&/NASDAQ|NYSE|AMEX|ISLAND/i.test(x.description||''));
    if(results.length===1){const conid=Number(results[0].conid);const info=await ib(`/iserver/contract/${conid}/info`);if(info.currency==='USD'&&info.symbol===a.symbol&&info.secType==='STK')contracts[a.symbol]={conid};}
    await sleep(250);
  }
  const selected=wanted.symbols.filter(a=>contracts[a.symbol]).slice(0,40);const quotes={};
  if(selected.length){const endpoint=`/iserver/marketdata/snapshot?conids=${selected.map(a=>contracts[a.symbol].conid).join(',')}&fields=31,84,86,87,6509`;
    await ib(endpoint);await sleep(1300);const rows=await ib(endpoint);const byId=new Map(selected.map(a=>[contracts[a.symbol].conid,a.symbol]));
    for(const row of Array.isArray(rows)?rows:[]){const symbol=byId.get(Number(row.conid));if(!symbol)continue;const bid=parse(row['84']),ask=parse(row['86']);if(!bid||!ask)continue;quotes[symbol]={bid,ask,time:Number(row._updated)||0,dollarVolume:parse(row['87'])*parse(row['31']),realtime:String(row['6509']||'').startsWith('R')};}
  }
  const activeContracts=Object.fromEntries(selected.map(a=>[a.symbol,contracts[a.symbol]]));const result=await portal({authenticated:true,contracts:activeContracts,quotes,status:`${selected.length} contratos; ${Object.keys(quotes).length} snapshots. Permisos de compra sin verificar.`});console.log(new Date().toISOString(),`${result.accepted} snapshots enviados; solo simulación.`);
}catch(e){console.error(new Date().toISOString(),e.message);try{await portal({authenticated:false,contracts:{},quotes:{},status:String(e.message).slice(0,160)});}catch{/* No se imprimen tokens ni cuerpos de respuestas. */}}finally{running=false;}}
console.log('Puente IBKR iniciado. GET a Gateway local; cartera ficticia en Mission Control.');await tick();setInterval(tick,30000);
