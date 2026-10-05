import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {cycle,locked,load,planProblems} from '../trading-worker/engine.js';
import {installProgram} from '../trading-worker/company.js';
import {day} from '../trading-worker/core.js';
import {referenceSource} from '../trading-worker/market-data.js';
function memoryEnv(){
 const db=new DatabaseSync(':memory:');for(const file of ['0008_trading_lab.sql','0009_trading_operating_budget.sql'])db.exec(readFileSync(new URL('../migrations/'+file,import.meta.url),'utf8'));
 const wrap=(sql,args=[])=>({bind(...values){return wrap(sql,values);},async first(){return db.prepare(sql).get(...args)||null;},async all(){return {results:db.prepare(sql).all(...args)};},async run(){return db.prepare(sql).run(...args);}});
 return {OPENAI_RUNTIME_KEY:'fixture-only',CONTROL_DB:{prepare:wrap,async batch(ops){const values=[];for(const op of ops)values.push(await op.run());return values;}},_db:db};
}
const program={scope:'agent-office',rationale:'Probar relaciones B/R menores con riesgo limitado',threshold:45,rules:[],workflow:{researchDailyLimit:6,researchIntervalMinutes:60,riskPct:1,minRR:1.2},visual:{focus:'economics',theme:'violet',headline:'Piloto medido',panels:['report','efficiency'],lighting:'warm'}};
const answer={decision:'prepare',missingEvidence:[],nextResearchTask:'',approve:true,thesis:'Plan exclusivamente de fixture',entryMin:9.8,entryMax:10.2,stop:9,target:11.8,holdingDays:7,exitBeforeCatalyst:false,bearCase:'Contrato falla',baseCase:'Contrato cumplido',bullCase:'Mayor demanda',invalidation:'Cancelación del contrato',reason:'Datos de fixture suficientes'};
test('pilot parameters reach both specialists and real paper execution; capacity and captured outcomes remain enforced',async()=>{
 const env=memoryEnv(),originalNow=Date.now,originalFetch=globalThis.fetch;let clock=Date.parse('2026-10-05T14:00:00Z'),pilotId,requests=[];Date.now=()=>clock;
 const refresh=async()=>locked(env,async s=>{s.real.marketCheckedAt=clock;s.real.lastScan=clock;s.real.book.fx={rate:1,time:clock,checkedAt:clock};for(const q of Object.values(s.real.quotes)){q.time=clock;q.fetchedAt=clock;}s.company.agency.day=new Date(clock).toISOString().slice(0,10);s.company.agency.runsToday=6;s.company.agency.preparationDay=s.company.agency.day;s.company.agency.preparationCalls=2;});
 try{
  env._db.prepare('INSERT INTO trading_secrets(name,cipher,iv,updated_at) VALUES (?,?,?,?)').run('openai','fixture','fixture',clock);
  await locked(env,async s=>{
   s.operating={spentEur:0,remainingEur:10};s.real.assets=['ONE','TWO','THREE'].map(symbol=>({symbol,name:symbol+' Common Stock',exchange:'NASDAQ',marketCap:300e6,price:10,sector:'Technology',dataVerified:true}));
   pilotId=installProgram(s,program,{id:'fixture'},clock).id;
   s.real.events=s.real.assets.map((a,i)=>({id:a.symbol,symbol:a.symbol,confirmed:true,timing:'scheduled',date:'2026-10-10T14:00:00Z',kind:'Contrato material',source:'https://issuer.example/contract',sources:[{url:'https://issuer.example/contract',claim:'Contrato de fixture'}],summary:'Contrato de fixture con términos conocidos',status:'nuevo',preScore:{eligible:true,score:70-i,adaptationId:pilotId},research:{worthAnalyzing:true,researchedAt:clock},...(i===2?{retryAfter:clock+864e5}: {})}));
   s.real.quotes=Object.fromEntries(s.real.assets.map(a=>[a.symbol,{price:10,time:clock,fetchedAt:clock,referenceOnly:true,currency:'USD',source:referenceSource,dollarVolume:5e6}]));
   for(const a of s.agents)a.paused=!['analyst','risk','operator'].includes(a.id);
  });await refresh();
  globalThis.fetch=async(url,options)=>{assert.equal(url,'https://api.openai.com/v1/responses');const body=JSON.parse(options.body),input=JSON.parse(body.input);requests.push(input);assert.equal(input.config.riskPct,.6);assert.equal(input.config.minRR,1.2);const value=body.text.format.schema.properties.thesis?answer:{decision:'approve',missingEvidence:[],nextResearchTask:'',approve:true,reason:'Riesgo de fixture aprobado'};return Response.json({status:'completed',usage:{input_tokens:300,output_tokens:200},output:[{type:'message',content:[{type:'output_text',text:JSON.stringify(value)}]}]});};
  assert.match(planProblems(answer,{minRR:2})[0],/Beneficio/);await cycle(env);let s=(await load(env)).state;
  assert.equal(requests.length,4);assert.equal(s.real.book.positions.length,2);assert.equal(s.real.book.orders.length,2);assert.equal(s.config.riskPct,.35);assert.equal(s.config.minRR,2);assert.equal(s.company.activeProgram,null);
  for(const p of s.real.book.positions){assert.equal(p.adaptationId,pilotId);assert.equal(p.strategyVersion,1);assert.equal(p.catalystKind,'Contrato material');assert.equal(p.catalystTiming,'scheduled');assert.equal(p.stop,9);}
  clock+=5*60e3;await locked(env,async state=>{state.real.events.find(e=>e.id==='THREE').retryAfter=clock;});await refresh();await cycle(env);s=(await load(env)).state;
  assert.equal(s.real.book.orders.length,2);assert.equal(s.real.events.find(e=>e.id==='THREE').plan.approve,true);assert.equal(s.real.events.find(e=>e.id==='THREE').review.approve,true);assert.match(s.real.events.find(e=>e.id==='THREE').reasons.join(' '),/dos entradas/);
  clock+=864e5;await refresh();await cycle(env);s=(await load(env)).state;assert.equal(s.real.book.positions.length,2);assert.equal(s.real.book.orders.length,2);assert.match(s.real.events.find(e=>e.id==='THREE').reasons.join(' '),/dos posiciones|10%/);
  await locked(env,async state=>{state.real.quotes.ONE.price=12;state.real.quotes.TWO.price=12;state.real.events.find(e=>e.id==='THREE').retryAfter=clock+864e5;});await cycle(env);s=(await load(env)).state;
  assert.equal(s.real.book.positions.length,0);assert.equal(s.real.book.closed.length,2);for(const t of s.real.book.closed){assert.equal(t.adaptationId,pilotId);assert.equal(t.catalystKind,'Contrato material');assert.equal(t.strategyVersion,1);assert.ok(t.pnl>0);}
  assert.equal(s.kpis.learning.outcomes.byStrategy[0].key,'1');assert.equal(s.kpis.learning.outcomes.byCatalyst[0].key,'Contrato material');assert.equal(s.company.versions.find(v=>v.id===pilotId).adaptation.phase,'pilot');
  assert.ok(env._db.prepare('SELECT spent_eur FROM trading_operating_budget').get().spent_eur<10);assert.ok(s.real.book.cash>10000);
 }finally{Date.now=originalNow;globalThis.fetch=originalFetch;env._db.close();}
});
