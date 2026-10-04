import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {cycle,locked,load} from '../trading-worker/engine.js';
import {referenceSource} from '../trading-worker/market-data.js';

function memoryEnv(){
 const db=new DatabaseSync(':memory:');for(const file of ['0008_trading_lab.sql','0009_trading_operating_budget.sql'])db.exec(readFileSync(new URL('../migrations/'+file,import.meta.url),'utf8'));
 const wrap=(sql,args=[])=>({bind(...values){return wrap(sql,values);},async first(){return db.prepare(sql).get(...args)||null;},async all(){return {results:db.prepare(sql).all(...args)};},async run(){return db.prepare(sql).run(...args);}});
 return {OPENAI_RUNTIME_KEY:'test-only-not-a-live-key',CONTROL_DB:{prepare:wrap,async batch(ops){db.exec('BEGIN');try{const result=[];for(const op of ops)result.push(await op.run());db.exec('COMMIT');return result;}catch(error){db.exec('ROLLBACK');throw error;}}},_db:db};
}

test('a third evidence request waits without repeated cost and only new material evidence permits a fresh economic decision',async()=>{
 const env=memoryEnv(),start=Date.parse('2026-10-03T15:00:00Z'),friday=Date.parse('2026-10-02T19:50:00Z'),eventId='bounded-evidence',originalNow=Date.now,originalFetch=globalThis.fetch;let clock=start;Date.now=()=>clock;
 try{
  env._db.prepare('INSERT INTO trading_secrets(name,cipher,iv,updated_at) VALUES (?,?,?,?)').run('openai','test-only','test-only',start);
  await locked(env,async s=>{
   s.real.assets=[{symbol:'SMALL',name:'Small Common Stock',exchange:'NASDAQ',marketCap:300e6,price:10,dataVerified:true}];
   s.real.events=[{id:eventId,symbol:'SMALL',status:'nuevo',confirmed:true,timing:'scheduled',kind:'Contrato material',source:'https://issuer.example/contract',sources:[{url:'https://issuer.example/contract',claim:'Contrato y fecha futura publicados por el emisor'}],date:'2026-10-07T20:00:00Z',summary:'Contrato confirmado; la evaluación requiere términos de financiación.',research:{worthAnalyzing:true,researchedAt:start-3600e3},preScore:{eligible:true,score:70},followupHistory:[{at:start-8*3600e3,fingerprint:'completed-first',nextTask:'Check primary contract'},{at:start-4*3600e3,fingerprint:'completed-second',nextTask:'Check financing annex'}]}];
   s.real.profiles={SMALL:{checkedAt:start,fundamentals:{checkedAt:start,source:'https://data.sec.gov/test',metrics:{fcf:2e6,cashLatest:20e6,shareGrowth:.01,annualAgeDays:180}},market:{asOf:new Date(friday).toISOString(),averageDollarVolume:5e6}}};s.real.quotes={SMALL:{price:10,time:friday,fetchedAt:start,referenceOnly:true,currency:'USD',source:referenceSource,dollarVolume:5e6}};s.real.marketCheckedAt=start;s.real.marketProviderAt=start;s.real.book.fx={rate:1,time:friday,checkedAt:start};s.real.lastScan=start;
   for(const a of s.agents)a.paused=!['analyst','risk','operator'].includes(a.id);s.company.agency.day=new Date(start).toISOString().slice(0,10);s.company.agency.runsToday=6;
  });
  let calls=0;globalThis.fetch=async(url,options)=>{
   assert.equal(url,'https://api.openai.com/v1/responses');const body=JSON.parse(options.body),payload=JSON.parse(body.input);calls++;assert.equal(body.model,'gpt-6-luna');assert.equal(body.tools,undefined);assert.ok(body.text.format.schema.properties.holdingDays,'Only Pedro evaluates; no paid research or risk review follows');
   const answer={decision:calls===1?'needs_evidence':'reject',missingEvidence:calls===1?['Exact dilution terms from financing']:[],nextResearchTask:calls===1?'Read the financing annex and establish dilution terms':'',approve:false,thesis:'Tesis de fixture pendiente de términos financieros',entryMin:0,entryMax:0,stop:0,target:0,holdingDays:7,bearCase:'Dilución',baseCase:'Pendiente',bullCase:'Hipótesis',invalidation:'Condiciones desfavorables',reason:calls===1?'Faltan condiciones de financiación':'Los nuevos términos implican dilución incompatible con la tesis'};
   if(calls===2){assert.equal(payload.financialProfile.fundamentals.metrics.shareGrowth,.4);assert.equal(payload.event.sources.at(-1).url,'https://issuer.example/financing');}
   assert.deepEqual(new Set(Object.keys(answer)),new Set(body.text.format.schema.required));return Response.json({status:'completed',usage:{input_tokens:500,output_tokens:200},output:[{type:'message',content:[{type:'output_text',text:JSON.stringify(answer)}]}]});
  };
  await cycle(env);let s=(await load(env)).state,e=s.real.events[0];assert.equal(calls,1);assert.equal(e.status,'verificar');assert.equal(e.analysisBlocked.guard,'followup_limit');assert.equal(e.analysisAssessment.decision,'needs_evidence');assert.equal(e.analysisAssessment.executable,false);assert.equal(e.followupHistory.length,2);assert.equal(e.analysisBlockHistory.length,1);assert.equal(e.plan,undefined);assert.equal(s.company.pipeline.counts.analysisBlocked,1);assert.equal(s.company.pipeline.blockerStage,'analysis_evidence');assert.equal(s.company.agency.workQueue.some(w=>w.kind==='research'),false);
  const spent=env._db.prepare('SELECT spent_eur FROM trading_operating_budget').get().spent_eur;
  clock+=5*60e3;await locked(env,async state=>{state.real.profiles.SMALL.checkedAt=clock;state.real.profiles.SMALL.fundamentals.checkedAt=clock;state.real.profiles.SMALL.fundamentals.metrics.annualAgeDays++;state.real.quotes.SMALL.fetchedAt=clock;});await cycle(env);s=(await load(env)).state;assert.equal(calls,1);assert.equal(env._db.prepare('SELECT spent_eur FROM trading_operating_budget').get().spent_eur,spent);assert.equal(s.real.events[0].status,'verificar');assert.equal(s.real.book.orders.length,0);
  clock+=1000;await locked(env,async state=>{state.real.profiles.SMALL.fundamentals.metrics.shareGrowth=.4;state.real.events[0].sources.push({url:'https://issuer.example/financing',claim:'Los términos de financiación de la fixture implican aumento del 40% de acciones'});});await cycle(env);s=(await load(env)).state;e=s.real.events[0];assert.equal(calls,2);assert.equal(e.status,'descartado');assert.match(e.reasons[0],/dilución/);assert.equal(e.followupHistory.length,2);assert.equal(s.real.book.orders.length,0);assert.equal(s.real.book.cash,10000);assert.equal(s.company.agency.workQueue.some(w=>w.kind==='research'),false);assert.ok(env._db.prepare('SELECT spent_eur FROM trading_operating_budget').get().spent_eur>spent);
  await cycle(env);assert.equal(calls,2);assert.equal((await load(env)).state.real.book.orders.length,0);
 }finally{Date.now=originalNow;globalThis.fetch=originalFetch;env._db.close();}
});
