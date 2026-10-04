import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,upgradeState} from '../trading-worker/engine.js';
import {queueEmployeeWork,pendingEmployeeWork} from '../trading-worker/employee-agents.js';
import {runPreparation,recordFinancialWork,refreshSessionPlan} from '../trading-worker/preparation.js';
import {officeState} from '../trading-worker/office-boundary.js';

const now=Date.parse('2026-10-03T12:00:00Z');
function fixture(){
 const s=upgradeState(initialState());s.operating={remainingEur:9,paceEurPerDay:.3,exhausted:false};
 s.real.assets=[{symbol:'TEST',name:'Test Technology',sector:'Technology',exchange:'NASDAQ',marketCap:300e6,price:5}];
 s.real.events=[{id:'e1',symbol:'TEST',confirmed:false,status:'verificar',date:null,kind:'Previsiones',summary:'Señal de guidance pendiente de contrastar',signal:{headline:'TEST raises guidance',publishedAt:now-864e5,strength:27},preScore:{score:70,eligible:true}}];
 s.real.profiles={TEST:{checkedAt:now-60000,errors:[],fundamentals:{checkedAt:now-60000,source:'https://data.sec.gov/facts',metrics:{annualEnd:'2025-12-31',annualAgeDays:276,fcf:5e6,cashLatest:20e6,revenueYoY:.1},evidence:[{metric:'fcf',filed:'2026-03-01'}]},market:{asOf:'2026-10-02T20:00:00Z',averageDollarVolume:2e6}}};
 s.real.quotes={TEST:{price:5,time:now-864e5,fetchedAt:now-60000,referenceOnly:true,source:'Yahoo Finance · referencia pública',currency:'USD'}};s.real.marketStatus='Mercado cerrado';return s;
}
const answer={summary:'Caja positiva, guidance pendiente de contrastar',thesis:'La señal merece verificar fuente primaria antes de valorar una entrada',missingEvidence:['Fuente y fecha del guidance'],worthFurtherWork:true,nextOwner:'scout',nextTask:'Consultar anuncio de resultados y guidance del emisor',_costEur:.0008};
const hooks=call=>({call,checkpoint:async()=>{},log:()=>{}});

test('weekend preliminary work uses cached dated financial evidence and creates no orders',async()=>{
 const s=fixture(),book=JSON.stringify(s.real.book);let calls=0;
 await runPreparation(officeState(s),hooks(async(id,instructions,payload,schema,options)=>{
  calls++;assert.equal(id,'analyst');assert.equal(options.light,true);assert.equal(options.work,true);assert.ok(options.capEur<=.0035);assert.equal(payload.financialProfile.checkedAt,now-60000);assert.equal(payload.financialProfile.fundamentals.checkedAt,now-60000);assert.equal(payload.financialProfile.fundamentals.metrics.fcf,5e6);assert.equal(payload.financialProfile.fundamentals.evidence[0].filed,'2026-03-01');assert.equal(payload.quote.time,now-864e5);return answer;
 }),now);
 assert.equal(calls,1);assert.equal(s.real.events[0].preliminary.executable,false);assert.equal(s.real.events[0].preliminary.costEur,.0008);assert.equal(s.real.events[0].plan,undefined);assert.equal(JSON.stringify(s.real.book),book);
 assert.equal(s.company.sessionPlan.target,2);assert.equal(s.company.sessionPlan.shortfall,2);assert.equal(s.company.sessionPlan.ready.length,0);assert.equal(s.company.sessionPlan.watchlist[0].executable,false);
 const mail=s.company.agency.actors.scout.inbox.find(m=>m.from==='analyst');assert.equal(mail.eventId,'e1');assert.match(mail.task,/guidance/);assert.equal(pendingEmployeeWork(s,'research',now)[0].from,'analyst');
});

test('preliminary cache avoids new calls until meaningful financial evidence changes',async()=>{
 const s=fixture();let calls=0;const runHooks=hooks(async()=>{calls++;return answer;});await runPreparation(s,runHooks,now);
 const request=()=>queueEmployeeWork(s,'analysis','e1',{owner:'analyst',decision:'Revisar ficha',nextTask:'Comparar datos actualizados',evidenceIds:['e1']},now+1000);
 request();await runPreparation(s,runHooks,now+1000);assert.equal(calls,1);
 s.real.profiles.TEST.checkedAt=now+2000;s.real.quotes.TEST.fetchedAt=now+2000;request();await runPreparation(s,runHooks,now+2000);assert.equal(calls,1);
 s.real.profiles.TEST.fundamentals.metrics.cashLatest=10e6;request();await runPreparation(s,runHooks,now+3000);assert.equal(calls,2);assert.equal(s.company.agency.preparationCalls,2);
 s.operating.exhausted=true;s.operating.remainingEur=0;request();await runPreparation(s,runHooks,now+4000);assert.equal(calls,2);assert.equal(pendingEmployeeWork(s,'analysis',now+4000).length,0);
});

test('paused employees do not block a different specialist and global pause spends no tokens',async()=>{
 const s=fixture();s.agents.find(a=>a.id==='analyst').paused=true;
 for(const [kind,owner] of [['analysis','analyst'],['risk','risk']])queueEmployeeWork(s,kind,'e1',{owner,decision:'Comparar',nextTask:'Revisar',evidenceIds:['e1']},now);
 let calls=0;await runPreparation(s,hooks(async id=>{calls++;assert.equal(id,'risk');return answer;}),now);
 assert.equal(calls,1);assert.equal(pendingEmployeeWork(s,'analysis',now).length,1);assert.ok(s.real.events[0].preRisk);
 s.paused=true;await runPreparation(s,hooks(async()=>assert.fail('Global pause must not call the model')),now+3600e3);
});

test('an unusable profile requests enrichment instead of paying for an empty analysis',async()=>{
 const s=fixture();s.real.profiles.TEST={checkedAt:now,errors:['SEC temporarily unavailable']};
 await runPreparation(s,hooks(async()=>assert.fail('No usable financial profile')),now);
 const work=s.company.agency.workQueue.find(w=>w.kind==='analysis');assert.equal(work.status,'blocked');assert.match(work.result,/enriquecimiento/);assert.equal(s.company.agency.actors.scout.inbox.at(-1).from,'analyst');assert.equal(s.company.agency.preparationCalls,0);
});

test('execution preparation requires a current approved plan and never executes a trade',async()=>{
 const s=fixture(),event=s.real.events[0];Object.assign(event,{confirmed:true,date:'2026-10-06T20:00:00Z',sources:[{url:'https://issuer.example/results',claim:'Earnings scheduled'}],status:'espera',plan:{entryMin:4.8,entryMax:5.1,stop:4.5,target:6.5,expiresAt:now+3*864e5,referenceAt:now-864e5},review:{approve:true}});
 const book=JSON.stringify(s.real.book);queueEmployeeWork(s,'execution','e1',{owner:'operator',decision:'Preparar próxima sesión',nextTask:'Verificar precios el lunes',evidenceIds:['e1']},now);
 await runPreparation(s,hooks(async()=>assert.fail('Execution preparation uses code')),now);
 assert.equal(s.company.sessionPlan.date,'2026-10-05');assert.equal(s.company.sessionPlan.ready.length,1);assert.equal(s.company.agency.workQueue.find(w=>w.kind==='execution').status,'complete');assert.equal(s.company.agency.actors.auditor.inbox.at(-1).from,'operator');assert.equal(JSON.stringify(s.real.book),book);
 event.plan.expiresAt=now-1;assert.equal(refreshSessionPlan(s,now).ready.length,0);queueEmployeeWork(s,'execution','e1',{owner:'operator',decision:'Volver a comprobar',nextTask:'Actualizar plan caducado',evidenceIds:['e1']},now+1);await runPreparation(s,hooks(async()=>assert.fail('No paid call for expired execution')),now+1);assert.equal(s.company.agency.workQueue.find(w=>w.kind==='execution'&&w.status==='blocked').result.includes('vigentes'),true);
});

test('validated autonomous strategy changes are applied while protected accounting remains intact',async()=>{
 const s=fixture();s.real.events=[];const book=JSON.stringify(s.real.book),budget=s.config.dailyBudget;
 queueEmployeeWork(s,'strategy','',{owner:'auditor',decision:'Enriquecer más fichas y espaciar llamadas',nextTask:'Observar conversión del radar',evidenceIds:['discovery'],strategy:{enrichmentLimit:6,researchDailyLimit:8,researchIntervalMinutes:60,minScore:50}},now);
 await runPreparation(officeState(s),hooks(async()=>assert.fail('Validated parameters require no model call')),now);
 assert.equal(s.company.strategy.enrichmentLimit,6);assert.equal(s.policy.researchDailyLimit,8);assert.equal(s.policy.minScore,50);assert.equal(s.company.strategyHistory.length,1);assert.equal(s.config.dailyBudget,budget);assert.equal(JSON.stringify(s.real.book),book);
 queueEmployeeWork(s,'strategy','',{owner:'auditor',decision:'Invalid unsafe change',nextTask:'Reject',evidenceIds:['budget'],strategy:{dailyBudget:100}},now+1);await runPreparation(officeState(s),hooks(async()=>assert.fail('Unsafe strategy must not call')),now+1);assert.equal(s.company.agency.workQueue.find(w=>w.status==='failed').kind,'strategy');assert.equal(s.config.dailyBudget,budget);assert.equal(s.company.strategy.enrichmentLimit,6);
});

test('real pipeline outcomes create durable records even without an earlier initiative',()=>{
 const s=fixture(),event=s.real.events[0];recordFinancialWork(s,event,'analysis','Tesis descartada: no hay ventaja suficiente',now,'auditor');
 const work=s.company.agency.workQueue[0];assert.equal(work.owner,'analyst');assert.equal(work.status,'complete');assert.equal(s.company.agency.actors.auditor.inbox.at(-1).task,'Tesis descartada: no hay ventaja suficiente');assert.equal(s.company.agency.actors.risk.inbox.length,0);assert.match(s.company.agency.actors.analyst.nextTask,/seguir el encargo/);assert.equal(s.company.agency.actors.analyst.memory.at(-1).workId,work.id);
});

test('a developer request queues a concrete patch for the existing deployment pipeline',async t=>{
 const s=fixture();s.real.events=[];const sha='a'.repeat(40),source='export const officeTitle = "Oficina";';
 t.mock.method(globalThis,'fetch',async url=>{assert.match(url,/api.github.com\/repos\/CesarSGZ\/CesarHomeLab\/contents\/control\/trading\.js/);return Response.json({sha,content:btoa(source)});});
 queueEmployeeWork(s,'code','',{owner:'designer',decision:'Mostrar los bloqueos útiles',nextTask:'Mejorar claridad del panel',evidenceIds:['kpis']},now);
 const book=JSON.stringify(s.real.book);let calls=0;
 await runPreparation(s,hooks(async(id,instructions,payload,schema,options)=>{calls++;assert.equal(id,'designer');assert.equal(payload.sources[0].sha,sha);assert.ok(options.capEur<=.02);return {summary:'Título claro para César',edits:[{file:'control/trading.js',baseSha:sha,find:'"Oficina"',replace:'"Estado de la oficina"'}]};}),now);
 assert.equal(calls,1);assert.equal(s.company.development[0].status,'queued');assert.equal(s.company.development[0].edits[0].baseSha,sha);assert.equal(s.company.agency.workQueue[0].status,'complete');assert.equal(JSON.stringify(s.real.book),book);
});
