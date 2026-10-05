import test from 'node:test';
import assert from 'node:assert/strict';
import {newBook,defaults} from '../trading-worker/core.js';
import {learningDigest,metrics,chooseChange,applyChange,initialiseGovernance} from '../trading-worker/governance.js';

const now=Date.parse('2026-10-04T15:00:00Z');
const state=()=>initialiseGovernance({real:{book:newBook(now,'EUR'),events:[],stats:{startedAt:now,researched:0,rejected:0}},config:{...defaults},agents:[],policy:{version:1,minScore:45,researchDailyLimit:12,researchIntervalMinutes:30},governance:{changes:[],reviews:[],messages:[]},operating:{daySpentEur:.12,paceEurPerDay:.3,remainingEur:9.8}});

test('Learning with no orders reports an empty outcome sample and useful funnel experiments without changing money',()=>{
 const s=state();s.real.events=Array.from({length:4},(_,i)=>({id:'e'+i,status:'verificar',signal:{},preScore:{eligible:true},research:{costEur:.01,researchedAt:now-i},confirmed:false}));
 s.real.stats.researched=9;s.real.stats.rejected=5;const before=JSON.stringify(s),learning=learningDigest(s,{confirmed:.4,reserved:.02},now);
 assert.equal(learning.funnel.researchCompleted,4);assert.equal(learning.funnel.cumulativeResearchDecisions,9);assert.equal(learning.funnel.cumulativeDiscardDecisions,5);
 assert.equal(learning.funnel.buyOrders,0);assert.equal(learning.outcomes.sample,'no_closed_results');assert.equal(learning.outcomes.realizedPnl,null);assert.deepEqual(learning.outcomes.byStrategy,[]);
 assert.ok(learning.experiments.some(x=>x.id==='funnel-pilot'));assert.match(learning.limitations,/Datos ausentes no equivalen a cero/);assert.equal(JSON.stringify(s),before);
 assert.equal(metrics(s,{},now).learning.outcomes.realizedPnl,null);
});

test('Data gap discards and upfront IA spending cannot tighten filters or throttle research automatically',()=>{
 const s=state();s.real.book.fx={rate:1,time:now};s.real.stats.researched=30;s.real.stats.rejected=28;
 s.real.events=Array.from({length:20},(_,i)=>({id:'missing'+i,status:'descartado',confirmed:true,research:{},analysisAssessment:{decision:'reject',reason:'Faltan datos y evidencia suficiente para determinar escenarios'}}));
 s.real.events.push({id:'followup',status:'verificar',confirmed:true,research:{researchedAt:now-100},analysisFollowup:{baselineResearchAt:now-100},analysisAssessment:{decision:'needs_evidence',reason:'Contrastar caja y deuda'}});
 const k=metrics(s,{confirmed:.6,reserved:0},now),before=JSON.stringify({config:s.config,policy:s.policy,book:s.real.book});
 assert.equal(k.learning.blockers.dataGapDiscards,20);assert.equal(k.learning.blockers.dataBlocked,1);assert.equal(k.learning.blockers.economicRejections,0);
 assert.equal(chooseChange(s,k).action,'hold');assert.match(chooseChange(s,k).reason,/carencias de datos/);assert.throws(()=>applyChange(s,{action:'tighten',reason:'80% descartadas'},k,now),/evidencia/);
 assert.throws(()=>applyChange(s,{action:'throttle',reason:'No hay beneficios'},k,now),/evidencia/);assert.equal(JSON.stringify({config:s.config,policy:s.policy,book:s.real.book}),before);
});

test('Economic, mixed, data and unclassified rejections remain distinguishable',()=>{
 const s=state();s.real.events=[
  {id:'economic',status:'descartado',research:{},analysisAssessment:{decision:'reject',reason:'La tesis no ofrece una ventaja frente al riesgo'}},
  {id:'mixed',status:'descartado',research:{},reasons:['Faltan datos recientes y además tiene FCF negativo']},
  {id:'data',status:'descartado',research:{},reasons:['Datos de fechas distintas; necesita verificar deuda']},
  {id:'unknown',status:'descartado',research:{},reasons:['Se descarta por revisión antigua sin detalle']},
  {id:'pending',status:'nuevo',confirmed:true,research:{missingEvidence:['Consenso'],researchedAt:now},analysisAssessment:{decision:'needs_evidence',reason:'Faltan expectativas'}}
 ];
 const d=learningDigest(s,{},now);assert.equal(d.blockers.economicRejections,1);assert.equal(d.blockers.mixedRejections,1);assert.equal(d.blockers.dataGapDiscards,1);assert.equal(d.blockers.dataBlocked,1);assert.equal(d.blockers.unclassifiedRejections,1);
 assert.equal(d.blockers.frequentReasons.length,5);assert.ok(d.experiments.some(e=>e.id==='resolve-evidence'));
});

test('A newly prepared plan supersedes old evidence requests while their actual answer costs remain visible',()=>{
 const s=state();s.real.events=[{id:'resolved',status:'espera',confirmed:true,research:{researchedAt:now,costEur:.01,missingEvidence:['Una estimación histórica']},analysisAssessment:{decision:'needs_evidence',reason:'Faltan datos',at:now-20,_costEur:.002},analysisBlocked:{at:now-20},analysisFollowup:{baselineResearchAt:now-30},plan:{approve:true,preparedAt:now-1,_costEur:.003,reason:'Datos suficientes para el plan'},review:{approve:true,_costEur:.004},reasons:['Esperando apertura del mercado']}];
 const d=learningDigest(s,{},now);assert.equal(d.blockers.dataBlocked,0);assert.equal(d.funnel.thesesPrepared,1);assert.equal(d.funnel.riskApproved,1);assert.equal(d.costs.storedWork.knownRecords,4);assert.ok(Math.abs(d.costs.storedWork.knownCostEur-.019)<1e-10);
});

test('Closed outcomes use captured catalyst and strategy metadata and never borrow a mutated event or active version',()=>{
 const s=state();s.company={activeProgram:'current'};s.real.events=[{id:'old-event',kind:'Ahora otro catalizador',plan:{strategyVersion:99}}];
 s.real.book.closed=[
  {eventId:'captured1',symbol:'A',pnl:100,catalystKind:'Resultados',strategyVersion:2,adaptationId:'pilot-a'},
  {eventId:'captured2',symbol:'B',pnl:-50,catalystKind:'Contrato',strategyVersion:3,adaptationId:'pilot-b'},
  {eventId:'old-event',symbol:'C',pnl:200},
  {eventId:'unreported',symbol:'D',pnl:null,catalystKind:'Resultados',strategyVersion:2,adaptationId:'pilot-a'}
 ];
 const before=JSON.stringify(s.real.book),d=learningDigest(s,{confirmed:1,reserved:0},now);
 assert.equal(d.outcomes.realizedPnl,250);assert.equal(d.outcomes.knownPnl,3);assert.equal(d.outcomes.unknownPnl,1);assert.equal(d.outcomes.sample,'insufficient_for_profitability_claim');
 const v2=d.outcomes.byStrategy.find(g=>g.key==='2');assert.equal(v2.closed,2);assert.equal(v2.realizedPnl,100);assert.equal(v2.unknownPnl,1);assert.equal(v2.winRate,1);
 assert.equal(d.outcomes.byStrategy.find(g=>g.key==='unknown').realizedPnl,200);assert.ok(!d.outcomes.byStrategy.some(g=>g.key==='99'));
 assert.equal(d.outcomes.byCatalyst.find(g=>g.key==='unknown').closed,1);assert.ok(!d.outcomes.byCatalyst.some(g=>g.key==='Ahora otro catalizador'));
 assert.match(d.outcomes.attribution,/do not demonstrate causality/);assert.equal(JSON.stringify(s.real.book),before);
});

test('Global ledger cost, reserved cost and partial attributable answers stay separate, including unknown costs',()=>{
 const s=state();s.real.book.fx={rate:2,time:now};const plan={preparedAt:now,_costEur:.02,thesis:'Contrastar escenario'};
 s.real.events=[{id:'e',research:{costEur:.1,researchedAt:now},plan,previousPlan:{...plan,withdrawnAt:now+1},review:{approve:true,at:now+2},preliminary:{_costEur:null,summary:'Pendiente'}}];
 const d=learningDigest(s,{confirmed:2,reserved:1},now);assert.equal(d.costs.global.estimatedConfirmedEur,1);assert.equal(d.costs.global.estimatedReservedEur,.5);
 assert.equal(d.costs.storedWork.knownRecords,2);assert.equal(d.costs.storedWork.unknownRecords,2);assert.ok(Math.abs(d.costs.storedWork.knownCostEur-.12)<1e-10);
 assert.match(d.costs.storedWork.scope,/Not total office cost or cost per strategy/);assert.equal(d.costs.monthlyAllowanceEur,10);
 s.real.book.fx=null;const missing=learningDigest(s,{},now);assert.equal(missing.costs.global.confirmedUsd,null);assert.equal(missing.costs.global.estimatedConfirmedEur,null);assert.equal(missing.costs.global.eurConversion,'unknown_fx');
});

test('Economic rejection ratios alone only propose alternate hypotheses; spending throttle needs three measured daily overruns',()=>{
 const s=state();s.real.stats.researched=25;s.real.stats.rejected=25;s.real.events=Array.from({length:25},(_,i)=>({id:'e'+i,status:'descartado',research:{},analysisAssessment:{decision:'reject',reason:'Valoración excesiva sin ventaja'}}));
 let k=metrics(s,{},now);assert.equal(chooseChange(s,k).action,'hold');assert.ok(k.learning.experiments.some(e=>e.id==='alternate-catalysts'));
 s.operating={...s.operating,daySpentEur:.45,paceEurPerDay:.3};k=metrics(s,{},now);assert.equal(chooseChange(s,k).action,'hold');
 const overrun={daySpentEur:.45,paceEurPerDay:.3,overspendEur:.15};s.governance.reviews=[{day:'2026-10-03',kpis:{learning:{costs:{pacing:overrun}}}},{day:'2026-10-02',kpis:{learning:{costs:{pacing:overrun}}}}];
 assert.equal(chooseChange(s,k).action,'throttle');const before=JSON.stringify(s.real.book),budget=s.config.dailyBudget,change=applyChange(s,chooseChange(s,k),k,now);
 assert.equal(change.action,'throttle');assert.equal(s.policy.researchDailyLimit,6);assert.equal(s.policy.minScore,45);assert.equal(s.config.riskPct,defaults.riskPct);assert.equal(s.config.dailyBudget,budget);assert.equal(JSON.stringify(s.real.book),before);
});

test('Actual losses preserve automatic risk reduction independently of data bottlenecks',()=>{
 const s=state();s.real.book.closed=Array.from({length:10},(_,i)=>({pnl:i<3?10:-20,catalystKind:'Resultados',strategyVersion:1}));
 const k=metrics(s,{confirmed:.1,reserved:0},now);assert.equal(k.closedPnl,-110);assert.equal(chooseChange(s,k).action,'reduceRisk');
 const paper=JSON.stringify(s.real.book),budget=s.config.dailyBudget;applyChange(s,chooseChange(s,k),k,now);assert.equal(s.config.riskPct,.3);assert.equal(s.config.dailyBudget,budget);assert.equal(JSON.stringify(s.real.book),paper);
});

const forecast=()=>({preparedAt:now-5*864e5,referenceAt:now-6*864e5,entryMin:9.8,entryMax:10.2,stop:9,target:14,holdingDays:8,bearCase:'La reacción puede revertir',baseCase:'Comprobar continuidad tras el anuncio',bullCase:'Nueva guía puede mejorar expectativas',invalidation:'Pérdida del nivel de soporte',probabilityPositive:55,upsidePct:20,downsidePct:10,uncalibrated:true});

test('Forecast learning compares captured scenarios with price returns and explicitly separates FX and realized ledger P/L',()=>{
 const s=state();s.real.book.closed=[{id:'trade',symbol:'SMALL',entry:10,exit:12,entryFx:1,exitFx:1.2,openedAt:now-4*864e5,closedAt:now,reason:'objetivo',pnl:-2,forecast:forecast()}];
 s.real.events=[{id:'mutated',plan:{target:999,stop:1,bullCase:'An invented later plan'}}];const before=JSON.stringify(s),d=learningDigest(s,{},now),f=d.outcomes.forecast,row=f.rows[0];
 assert.equal(f.knownForecastClosed,1);assert.equal(f.actualReturnKnown,1);assert.ok(Math.abs(f.meanActualReturnPct-20)<1e-10);
 assert.equal(f.meanActualCapitalReturnPct,0);assert.equal(f.baseCurrency,'EUR');assert.match(f.actualReturnBasis,/USD/);assert.match(f.actualCapitalReturnBasis,/recorded entryFx and exitFx/);
 assert.equal(row.plannedTarget,14);assert.equal(row.plannedStop,9);assert.equal(row.realizedR,2);assert.equal(row.holdingDays,4);assert.equal(row.plannedHoldingDays,8);
 assert.ok(Math.abs(row.upsideScenarioGapPp)<1e-10);assert.ok(Math.abs(row.downsideScenarioGapPp-30)<1e-10);assert.equal(row.uncalibrated,true);
 assert.equal(row.hypothesis.bull,forecast().bullCase);assert.equal(d.outcomes.realizedPnl,-2);assert.equal(JSON.stringify(s),before);
});

test('Missing forecasts, prices, FX and numerical estimates remain unknown rather than zero or inferred from current events',()=>{
 const s=state();s.real.book.closed=[
  {id:'first',eventId:'e',symbol:'A',entry:10,exit:11,openedAt:now-864e5,closedAt:now,reason:'tiempo',forecast:{...forecast(),probabilityPositive:null,upsidePct:null,downsidePct:null}},
  {id:'second',symbol:'B',entry:10,exit:null,openedAt:now+1,closedAt:now,reason:'stop',forecast:forecast()},
  {id:'historic',eventId:'e',symbol:'C',entry:10,exit:20,reason:'manual'}
 ];s.real.events=[{id:'e',plan:forecast()}];const f=learningDigest(s,{},now).outcomes.forecast;
 assert.equal(f.knownForecastClosed,2);assert.equal(f.unknownForecastClosed,1);assert.equal(f.actualReturnKnown,1);assert.equal(f.actualCapitalReturnKnown,0);assert.equal(f.meanActualCapitalReturnPct,null);
 assert.equal(f.scenarioComparisons.upsideKnown,0);assert.equal(f.scenarioComparisons.downsideKnown,0);assert.equal(f.scenarioComparisons.meanUpsideGapPp,null);
 const a=f.rows.find(r=>r.symbol==='A'),b=f.rows.find(r=>r.symbol==='B');assert.equal(a.estimatedUpsidePct,null);assert.equal(a.probabilityPositive,null);assert.equal(a.actualCapitalReturnPct,null);assert.equal(b.actualReturnPct,null);assert.equal(b.holdingDays,null);
 assert.equal(f.holdingKnown,1);assert.equal(f.meanHoldingDays,1);assert.match(f.limitations,/stay unknown/);
});

test('Forecast averages, scenario distances, exit counts and holding medians use only their stated observed samples',()=>{
 const s=state(),durations=[1,3,5,7],exits=[9,10,11,12],reasons=['stop','tiempo','objetivo','manual'];
 s.real.book.closed=durations.map((holding,i)=>({id:'t'+i,symbol:'A'+i,entry:10,exit:exits[i],entryFx:1,exitFx:1,openedAt:now-holding*864e5,closedAt:now,reason:reasons[i],forecast:forecast()}));
 const f=learningDigest(s,{},now).outcomes.forecast;assert.equal(f.knownForecastClosed,4);assert.equal(f.meanHoldingDays,4);assert.equal(f.medianHoldingDays,4);
 assert.ok(Math.abs(f.meanActualReturnPct-5)<1e-10);assert.ok(Math.abs(f.meanActualCapitalReturnPct-5)<1e-10);assert.equal(f.meanRealizedR,.5);
 assert.deepEqual(f.exits,{target:1,stop:1,time:1,other:1});assert.equal(f.scenarioComparisons.upsideKnown,4);assert.equal(f.scenarioComparisons.downsideKnown,4);
 assert.ok(Math.abs(f.scenarioComparisons.meanUpsideGapPp+15)<1e-10);assert.ok(Math.abs(f.scenarioComparisons.meanDownsideGapPp-15)<1e-10);
 assert.match(f.scenarioComparisons.basis,/not errors of a calibrated prediction/);assert.match(f.limitations,/do not establish calibrated probabilities/);
});

test('Pedro receives the measurable experiment objective without changing paper capital or monthly budget',()=>{
 const s=state();s.agents=[{id:'analyst'}];const before=JSON.stringify({book:s.real.book,operating:s.operating,config:s.config});initialiseGovernance(s);
 assert.equal(s.agents[0].objective,'Preparar experimentos medibles con datos reales, escenarios e invalidación; registrar incertidumbres y riesgo');
 assert.equal(JSON.stringify({book:s.real.book,operating:s.operating,config:s.config}),before);
});
