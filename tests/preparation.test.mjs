import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,upgradeState} from '../trading-worker/engine.js';
import {queueEmployeeWork,pendingEmployeeWork} from '../trading-worker/employee-agents.js';
import {runPreparation,recordFinancialWork,refreshSessionPlan,requestAnalysisEvidence,recoverDataGapRejections,blockAnalysisForEvidence} from '../trading-worker/preparation.js';
import {selectPlanningCandidates,analysisBlockedForEvidence,pipelineSummary} from '../trading-worker/strategy.js';
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

test('missing analyst evidence becomes a bounded concrete scout assignment, not approval or final rejection',()=>{
 const s=fixture(),e=s.real.events[0];Object.assign(e,{confirmed:true,research:{researchedAt:now-5*3600e3},plan:{entryMin:4,entryMax:5,stop:3,target:8},review:{approve:false}});
 const book=JSON.stringify(s.real.book),reply={reason:'Agreement terms missing',missingEvidence:['Closing terms'],nextResearchTask:'Read the primary agreement and identify closing conditions'};
 assert.equal(requestAnalysisEvidence(s,e,reply,now),true);assert.equal(e.status,'verificar');assert.equal(e.confirmed,true);assert.equal(e.plan,undefined);assert.equal(e.review,undefined);assert.equal(e.analysisAssessment.executable,false);
 assert.equal(s.company.agency.workQueue.find(w=>w.kind==='research').task,reply.nextResearchTask);assert.equal(JSON.stringify(s.real.book),book);
 const watch=refreshSessionPlan(s,now).watchlist[0];assert.equal(watch.stage,'research');assert.equal(watch.nextTask,reply.nextResearchTask);assert.equal(watch.executable,false);
 assert.equal(requestAnalysisEvidence(s,e,reply,now+1),false);assert.equal(e.followupHistory.length,1);
 e.research.researchedAt=now+2;assert.equal(requestAnalysisEvidence(s,e,{...reply,missingEvidence:['Incremental margin'],nextResearchTask:'Verify incremental margin in the latest filing'},now+3),true);
 e.research.researchedAt=now+4;assert.equal(requestAnalysisEvidence(s,e,{...reply,nextResearchTask:'A third expensive repeated assignment'},now+5),false);
});

test('legacy data gaps recover once while economic and risk rejections remain final',()=>{
 const s=fixture(),base={...s.real.events[0],confirmed:true,date:'2026-10-06T20:00:00Z',sources:[{url:'https://issuer.example/results'}],status:'descartado',research:{researchedAt:now-864e5},analysisVersion:2};
 s.real.events=[{...base,id:'missing',reasons:['Faltan datos sobre condiciones del contrato']},{...base,id:'economics',reasons:['Datos de fechas distintas; la hipótesis no está calibrada ni ofrece una relación riesgo-recompensa atractiva']},{...base,id:'risk',review:{approve:false},reasons:['Faltan datos y riesgo de dilución']}];
 recoverDataGapRejections(s,now);assert.equal(s.real.events[0].status,'verificar');assert.equal(s.real.events[1].status,'descartado');assert.equal(s.real.events[2].status,'descartado');
 const count=s.company.agency.workQueue.length;recoverDataGapRejections(s,now+1);assert.equal(s.company.agency.workQueue.length,count);assert.equal(s.real.book.orders.length,0);
});

test('exhausted evidence requests wait for meaningful facts without another queue, approval, or economic rejection',()=>{
 const s=fixture(),e=s.real.events[0];Object.assign(e,{confirmed:true,date:'2026-10-07T20:00:00Z',sources:[{url:'https://issuer.example/contract',claim:'Fecha y contrato primarios'}],status:'nuevo',research:{researchedAt:now-3600e3,worthAnalyzing:true},followupHistory:[{fingerprint:'first'},{fingerprint:'second'}],plan:{entryMin:4,entryMax:5,stop:3,target:8},review:{approve:false}});
 const reply={decision:'needs_evidence',approve:false,reason:'Faltan los covenants',missingEvidence:['Covenants y vencimientos'],nextResearchTask:'Read the debt annex and identify covenants'},book=JSON.stringify(s.real.book),queue=JSON.stringify(s.company.agency.workQueue);
 assert.equal(requestAnalysisEvidence(s,e,reply,now),false);const blocked=blockAnalysisForEvidence(s,e,reply,now,'risk');assert.equal(blocked.guard,'followup_limit');assert.equal(blocked.owner,'risk');assert.equal(e.status,'verificar');assert.equal(e.plan,undefined);assert.equal(e.review,undefined);assert.ok(e.previousPlan);assert.ok(e.previousReview);assert.equal(e.analysisAssessment.executable,false);assert.deepEqual(e.analysisBlocked.missingEvidence,reply.missingEvidence);assert.equal(e.followupHistory.length,2);assert.equal(JSON.stringify(s.company.agency.workQueue),queue);assert.equal(JSON.stringify(s.real.book),book);assert.equal(analysisBlockedForEvidence(s,e),true);assert.equal(selectPlanningCandidates(s,now).length,0);assert.equal(pipelineSummary(s,now).blockerStage,'analysis_evidence');assert.equal(pipelineSummary(s,now).counts.analysisBlocked,1);
 s.real.profiles.TEST.checkedAt=now+1000;s.real.profiles.TEST.fundamentals.checkedAt=now+1000;s.real.profiles.TEST.fundamentals.metrics.annualAgeDays++;s.real.profiles.TEST.market.asOf='2026-10-03T20:00:00Z';s.real.profiles.TEST.market.checkedAt=now+1000;s.real.quotes.TEST={...s.real.quotes.TEST,price:6,time:now+1000,fetchedAt:now+1000};e.research.researchedAt=now+1000;e.research.costEur=.002;
 assert.equal(analysisBlockedForEvidence(s,e),true);assert.equal(selectPlanningCandidates(s,now+2*864e5).length,0,'Time, refreshed metadata and a quote alone cannot repeat paid analysis');
 s.real.profiles.TEST.fundamentals.metrics.cashLatest=25e6;assert.equal(analysisBlockedForEvidence(s,e),false);assert.equal(selectPlanningCandidates(s,now+1000)[0],e);
 blockAnalysisForEvidence(s,e,reply,now+1000);assert.equal(selectPlanningCandidates(s,now+2000).length,0);assert.equal(e.analysisBlockHistory.length,2);blockAnalysisForEvidence(s,e,reply,now+3000);assert.equal(e.analysisBlockHistory.length,2);assert.equal(e.followupHistory.length,2);assert.equal(JSON.stringify(s.company.agency.workQueue),queue);
 s.real.profiles.TEST.fundamentals.latestQuarter={end:'2026-06-30',filed:'2026-08-01',metrics:{revenue:130e6}};assert.equal(selectPlanningCandidates(s,now+4000)[0],e);blockAnalysisForEvidence(s,e,reply,now+4000);
 s.real.profiles.TEST.market.seriesDiagnostic={adjustments:{complete:true,observedFactorChanges:0},last:{rawClose:5,adjustedClose:5}};assert.equal(selectPlanningCandidates(s,now+5000).length,0,'A corrected price series does not answer a financial covenant request');
 e.sources.push({url:'https://issuer.example/debt-annex',claim:'Fuente nueva con covenants y vencimientos'});assert.equal(selectPlanningCandidates(s,now+6000)[0],e);
 assert.throws(()=>blockAnalysisForEvidence(s,e,{...reply,decision:'reject'},now+7000),/Solo una evaluación/);assert.equal(e.followupHistory.length,2);assert.equal(s.real.book.orders.length,0);
});

test('explicit market evidence guards reopen for corrected adjustments, while financial and mixed guards ignore routine market updates',()=>{
 const s=fixture(),e=s.real.events[0];Object.assign(e,{confirmed:true,date:'2026-10-07T20:00:00Z',sources:[{url:'https://issuer.example/results'}],research:{worthAnalyzing:true}});
 const market=s.real.profiles.TEST.market;market.seriesDiagnostic={adjustments:{complete:false,observedFactorChanges:0},corporateActions:{reporting:'not_provided',splits:[]},oneYear:{sufficientCoverage:true},last:{value:5}};
 const reply={decision:'needs_evidence',approve:false,evidenceScope:'market',reason:'Falta corroborar el ajuste corporativo',missingEvidence:['Registro de splits y ajuste histórico'],nextResearchTask:'Verify split data against a dated independent price series'};
 blockAnalysisForEvidence(s,e,reply,now);assert.equal(e.analysisBlocked.evidenceScope,'market');
 market.return5d=.2;market.relativeVolume=3;market.asOf='2026-10-03';market.seriesDiagnostic.last.value=6;assert.equal(analysisBlockedForEvidence(s,e),true,'New price and volume are not a corrected corporate-action record');
 market.seriesDiagnostic.adjustments.complete=true;market.seriesDiagnostic.corporateActions={reporting:'provider_reported',splits:[{date:'2026-09-01',ratio:10}]};assert.equal(analysisBlockedForEvidence(s,e),false);assert.deepEqual(selectPlanningCandidates(s,now),[e]);assert.equal(e.plan,undefined);assert.equal(s.real.book.orders.length,0);
 for(const scope of ['primary_financial','mixed']){blockAnalysisForEvidence(s,e,{...reply,evidenceScope:scope,missingEvidence:['Post-acquisition debt and cash']},now+1000);market.return5d+=.1;market.relativeVolume+=1;market.seriesDiagnostic.corporateActions.splits.push({date:'2026-09-02',ratio:2});assert.equal(analysisBlockedForEvidence(s,e),true);s.real.profiles.TEST.fundamentals.metrics.cashLatest+=1;assert.equal(analysisBlockedForEvidence(s,e),false);}
});

test('session watchlist labels approved execution, unresolved data and timed waits without promising an order',()=>{
 const s=fixture(),e=s.real.events[0];Object.assign(e,{confirmed:true,date:'2026-10-07T20:00:00Z',sources:[{url:'https://issuer.example/results'}],research:{worthAnalyzing:true},status:'espera',plan:{entryMin:4,entryMax:5,stop:3,target:8,expiresAt:now+864e5},review:{approve:true}});
 const book=JSON.stringify(s.real.book);let watch=refreshSessionPlan(s,now).watchlist[0];assert.equal(watch.stage,'execution');assert.match(watch.nextTask,/cotización/);assert.equal(watch.executable,false);assert.equal(refreshSessionPlan(s,now).ready.length,1);
 blockAnalysisForEvidence(s,e,{decision:'needs_evidence',approve:false,evidenceScope:'primary_financial',reason:'Falta deuda posterior',missingEvidence:['Deuda pro forma'],nextResearchTask:'Verify debt after the material acquisition'},now+1);
 watch=refreshSessionPlan(s,now+1).watchlist[0];assert.equal(watch.stage,'blocked');assert.equal(watch.nextTask,e.analysisBlocked.nextTask);assert.equal(watch.reason,e.analysisBlocked.reason);assert.equal(refreshSessionPlan(s,now+1).ready.length,0);
 e.sources.push({url:'https://issuer.example/new-debt',claim:'New debt terms'});e.retryAfter=now+3600e3;watch=refreshSessionPlan(s,now+2).watchlist[0];assert.equal(watch.stage,'waiting');assert.equal(watch.nextAt,e.retryAfter);
 watch=refreshSessionPlan(s,e.retryAfter).watchlist[0];assert.equal(watch.stage,'analysis');assert.equal(JSON.stringify(s.real.book),book);
});

test('an unencodable evidence request is explicitly blocked without inventing a task or consuming a follow-up slot',()=>{
 const s=fixture(),e=s.real.events[0],reply={decision:'needs_evidence',approve:false,reason:'Solicitud sin dato concreto',missingEvidence:[],nextResearchTask:''};
 assert.equal(requestAnalysisEvidence(s,e,reply,now),false);const blocked=blockAnalysisForEvidence(s,e,reply,now);assert.equal(blocked.guard,'incomplete_request');assert.equal(blocked.nextTask,'');assert.deepEqual(blocked.missingEvidence,[]);assert.equal(e.followupHistory,undefined);assert.equal(s.company.agency.workQueue.length,0);assert.equal(e.status,'verificar');assert.equal(s.real.book.orders.length,0);
});

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

test('paused employees do not block another specialist and entry pause keeps preparation working',async()=>{
 const s=fixture();s.agents.find(a=>a.id==='analyst').paused=true;
 for(const [kind,owner] of [['analysis','analyst'],['risk','risk']])queueEmployeeWork(s,kind,'e1',{owner,decision:'Comparar',nextTask:'Revisar',evidenceIds:['e1']},now);
 let calls=0;await runPreparation(s,hooks(async id=>{calls++;assert.equal(id,'risk');return answer;}),now);
 assert.equal(calls,1);assert.equal(pendingEmployeeWork(s,'analysis',now).length,1);assert.ok(s.real.events[0].preRisk);
 s.paused=true;s.agents.find(a=>a.id==='analyst').paused=false;s.company.agency.preparationCalls=0;await runPreparation(s,hooks(async()=>{calls++;return answer;}),now+3600e3);assert.equal(calls,2);assert.equal(s.real.book.orders.length,0);
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
 assert.equal(s.company.strategy.enrichmentLimit,6);assert.equal(s.policy.researchDailyLimit,8);assert.equal(s.policy.minScore,45);assert.equal(s.company.versions.find(v=>v.id===s.company.shadowProgram).program.threshold,50);assert.equal(s.company.strategyHistory.length,1);assert.equal(s.config.dailyBudget,budget);assert.equal(JSON.stringify(s.real.book),book);
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

test('unchanged execution checks stay observable without flooding employee memory and the work journal',()=>{
 const s=fixture(),event=s.real.events[0],book=JSON.stringify(s.real.book);
 event.plan={preparedAt:now,entryMin:4,entryMax:5,stop:3,target:8,expiresAt:now+864e5};
 const result='TEST: Precio fuera de la zona de entrada';recordFinancialWork(s,event,'execution',result,now);
 for(let i=1;i<=300;i++)recordFinancialWork(s,event,'execution',result,now+i*300000);
 const agency=s.company.agency;assert.equal(agency.workQueue.length,1);assert.equal(agency.journal.length,1);assert.equal(agency.actors.operator.memory.length,1);assert.equal(agency.actors.auditor.inbox.length,1);
 assert.equal(event.executionCheck.checks,301);assert.equal(event.executionCheck.at,now+300*300000);assert.equal(agency.workQueue[0].lastCheckedAt,event.executionCheck.at);assert.equal(JSON.stringify(s.real.book),book);
 recordFinancialWork(s,event,'execution','TEST: compra ficticia registrada',now+301*300000);assert.equal(agency.journal.length,2);assert.equal(agency.actors.auditor.inbox.length,2);
 event.plan.preparedAt++;recordFinancialWork(s,event,'execution','TEST: compra ficticia registrada',now+302*300000);assert.equal(agency.journal.length,3);assert.equal(JSON.stringify(s.real.book),book);
});
test('an explicit pending execution assignment completes even if its result matches a previous check',()=>{
 const s=fixture(),event=s.real.events[0],result='TEST: Esperar sesión';recordFinancialWork(s,event,'execution',result,now);
 const assigned=queueEmployeeWork(s,'execution',event.id,{owner:'operator',decision:'Nueva comprobación solicitada',nextTask:'Comprobar la vigencia de TEST',evidenceIds:[event.id]},now+1);
 recordFinancialWork(s,event,'execution',result,now+2);assert.equal(assigned.status,'complete');assert.equal(assigned.finishedAt,now+2);assert.equal(s.company.agency.journal.length,2);
});
