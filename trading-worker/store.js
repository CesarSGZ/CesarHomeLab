// Agent Office · estado persistente en D1: carga, bloqueo con lease, secretos y presupuesto.
// Las sentencias SQL son literales: el puente runtime-db solo acepta las de su lista.
import universe from './universe.json' with {type:'json'};
import {defaults,day,newBook,equity} from './core.js';
import {encryptSecret,decryptSecret} from '../functions/_lib/crypto-store.js';

const KEEP=['schema','mode','automatic','paused','config','real','logs','lastTick','lastError','operatingLedger','v2'];
export function initialState(){const t=Date.now();return {schema:7,mode:'real',automatic:true,paused:false,config:{...defaults},real:{assets:universe.assets,events:[],quotes:{},book:newBook(t,'EUR'),catalogAt:universe.fetchedAt,total:universe.total,counts:universe.counts,calendarCursor:0,calendarCoverage:{},lastScan:0,marketAt:0,marketCheckedAt:0,marketStatus:'Esperando el primer ciclo'},logs:[],lastTick:0,lastError:null};}
// El estado de la versión anterior (gobierno, lanzamiento, autoprogramación…) ya no se usa:
// se conserva solo lo que el motor actual lee. La cartera y el ledger no se tocan.
export function upgradeState(s){
  if(s.schema<7){for(const k of Object.keys(s))if(!KEEP.includes(k))delete s[k];s.mode='real';s.logs=(s.logs||[]).slice(0,300);s.schema=7;}
  s.real.calendarCoverage??={};s.real.calendarCursor??=0;return s;
}
const baseAssets=new Map(universe.assets.map(a=>[a.symbol,a]));
export async function encodeState(state){const packed={...state,real:{...state.real,assets:undefined,assetRows:state.real.assets.map(a=>[a.symbol,a.exchange,a.marketCap,a.price,a.volume,a.contractVerified?1:0,a.conid||null,baseAssets.get(a.symbol)?.name===a.name?null:a.name,a.sector,a.dataVerified?1:0])}};return JSON.stringify(packed);}
export async function decodeState(payload){let s;if(payload.startsWith('gz:')){const bytes=Uint8Array.from(atob(payload.slice(3)),c=>c.charCodeAt(0));s=JSON.parse(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).text());}else s=JSON.parse(payload);if(s.real.assetRows){s.real.assets=s.real.assetRows.map(([symbol,exchange,marketCap,price,volume,verified,conid,name,sector,dataVerified])=>({...baseAssets.get(symbol),symbol,exchange,marketCap,price,volume,name:name||baseAssets.get(symbol)?.name||symbol,sector:sector||'Sin sector',source:'https://www.nasdaq.com/market-activity/stocks/'+symbol.toLowerCase(),contractVerified:!!verified,conid,dataVerified:!!dataVerified}));delete s.real.assetRows;}return s;}
export async function load(env){const row=await env.CONTROL_DB.prepare('SELECT * FROM trading_state WHERE id=1').first();return row?{state:upgradeState(await decodeState(row.payload)),busy:row.lock_until>Date.now()}: {state:upgradeState(initialState()),busy:false};}
export async function locked(env,fn){
  if(!await env.CONTROL_DB.prepare('SELECT id FROM trading_state WHERE id=1').first())await env.CONTROL_DB.prepare('INSERT OR IGNORE INTO trading_state (id,payload,updated_at) VALUES (1,?,?)').bind(await encodeState(initialState()),Date.now()).run();
  const token=crypto.randomUUID();const lease=await env.CONTROL_DB.prepare('UPDATE trading_state SET lease_token=?,lock_until=? WHERE id=1 AND lock_until<? RETURNING payload').bind(token,Date.now()+900000,Date.now()).first();
  if(!lease)throw Error('Ya hay una tarea en ejecución');
  const state=upgradeState(await decodeState(lease.payload));
  const checkpoint=async()=>{await env.CONTROL_DB.prepare('UPDATE trading_state SET payload=?,updated_at=?,lock_until=? WHERE id=1 AND lease_token=?').bind(await encodeState(state),Date.now(),Date.now()+900000,token).run();};
  try{const result=await fn(state,checkpoint);await checkpoint();return result;}
  catch(e){state.lastError=e.message;log(state,'system',e.message,'error');await checkpoint();throw e;}
  finally{await env.CONTROL_DB.prepare('UPDATE trading_state SET lock_until=0,lease_token=NULL WHERE id=1 AND lease_token=?').bind(token).run();}
}
export function log(s,agent,text,type='info'){s.logs.unshift({id:crypto.randomUUID(),time:Date.now(),agent,text,type});s.logs=s.logs.slice(0,300);}
export async function secret(env,name){if(name==='openai'&&env.OPENAI_RUNTIME_KEY)return env.OPENAI_RUNTIME_KEY;const r=await env.CONTROL_DB.prepare('SELECT cipher,iv FROM trading_secrets WHERE name=?').bind(name).first();return r?decryptSecret(r.cipher,r.iv,env.TRADING_ENCRYPTION_SECRET):null;}
export async function storeSecret(env,name,value){if(!value){await env.CONTROL_DB.prepare('DELETE FROM trading_secrets WHERE name=?').bind(name).run();return;}const enc=await encryptSecret(value,env.TRADING_ENCRYPTION_SECRET);await env.CONTROL_DB.prepare('INSERT INTO trading_secrets (name,cipher,iv,updated_at) VALUES (?,?,?,?) ON CONFLICT(name) DO UPDATE SET cipher=excluded.cipher,iv=excluded.iv,updated_at=excluded.updated_at').bind(name,enc.cipher,enc.iv,Date.now()).run();}
export async function cost(env){const row=await env.CONTROL_DB.prepare('SELECT * FROM trading_budget WHERE day=?').bind(day()).first()||{day:day(),spent:0,calls:0,input_tokens:0,output_tokens:0};const usage=await env.CONTROL_DB.prepare('SELECT COALESCE(SUM(actual),0) AS confirmed, COALESCE(SUM(CASE WHEN actual IS NULL THEN reserved ELSE 0 END),0) AS reserved FROM trading_calls WHERE day=?').bind(day()).first();return {...row,...usage};}
export async function operatingBudget(env,s){const month=day().slice(0,7),row=await env.CONTROL_DB.prepare('SELECT * FROM trading_operating_budget WHERE month=?').bind(month).first();const daysLeft=new Date(Number(month.slice(0,4)),Number(month.slice(5)),0).getDate()-Number(day().slice(8))+1;const rate=s.real.book.fx?.rate;const monthlyProfit=s.operatingLedger?.month===month?equity(s.real.book)-s.operatingLedger.openingEquity:0;const prior=await env.CONTROL_DB.prepare('SELECT COALESCE(SUM(COALESCE(actual,reserved)),0) AS usd, COALESCE(SUM(CASE WHEN day=? THEN COALESCE(actual,reserved) ELSE 0 END),0) AS todayUsd FROM trading_calls WHERE day LIKE ?').bind(day(),month+'%').first();const spent=row?.spent_eur??(rate>0?(prior?.usd||0)/rate:0);return {month,daySpentEur:rate>0?(prior?.todayUsd||0)/rate:null,monthlyProfit,benefitEquivalent:monthlyProfit/1000,rentCoveragePct:monthlyProfit/100,netVersusRent:monthlyProfit/1000-10,allowanceEur:10,spentEur:spent,remainingEur:Math.max(0,10-spent),unitsRemaining:Math.max(0,(10-spent)*1000),unitsInitial:10000,daysLeft,paceEurPerDay:Math.max(0,10-spent)/daysLeft,exhausted:spent>=10,conversion:'1 € real = 1.000 unidades de funcionamiento; no se resetea la cartera ficticia'};}
