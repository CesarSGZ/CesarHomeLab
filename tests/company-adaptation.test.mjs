import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,upgradeState} from '../trading-worker/engine.js';
import {installProgram,observeProgram,augmentScore,candidateStrategy,candidateStrategyGuard,validateProgram,strategyExperiments,initialiseCompany,testProgram,hasEconomicChange,canReplacePilot,compactContext} from '../trading-worker/company.js';
import {officeState} from '../trading-worker/office-boundary.js';

const DAY=864e5,now=Date.parse('2026-10-04T17:00:00Z');
const state=()=>{const s=upgradeState(initialState());s.operating={month:'2026-10',spentEur:.7,remainingEur:9.3};return s;};
const program=(extra={})=>({scope:'agent-office',rationale:'Comparar prioridades con datos reales',threshold:45,rules:[{feature:'relativeVolume',op:'gt',value:2,points:5}],workflow:{researchDailyLimit:6,researchIntervalMinutes:45,riskPct:1.2,minRR:1.5},visual:{focus:'pipeline',theme:'mint',headline:'Piloto acotado',panels:['report','efficiency'],lighting:'day'},...extra});
const event=(id='candidate')=>({id,symbol:'TEST',status:'nuevo',date:new Date(now+7*DAY).toISOString(),source:'https://issuer.example/news',signal:{publishedAt:now,strength:60}});
const asset={symbol:'TEST',name:'Test common stock',marketCap:250e6},profile={market:{relativeVolume:3,asOf:now},fundamentals:{metrics:{annualEnd:'2025-12-31'}}},rank={score:40,threshold:45,eligible:false,blocked:false};
const close=(id,adaptationId,pnl,closedAt=now+3*DAY)=>({id,adaptationId,pnl,qty:10,entry:50,entryFx:1,entryFee:1,closedAt});
function promote(s,v,at=now+3*DAY){s.real.book.closed.push(...[1,2,3].map(i=>close(v.id+'-'+i,v.id,10,at)));s.real.book.cash+=30;s.operating.spentEur+=.02;observeProgram(officeState(s),at);}

test('an active program respects later risk reductions, and rollback preserves those intervening settings',()=>{
 const s=state(),v=installProgram(s,program(),{id:'meeting'},now);promote(s,v);s.config.riskPct=.15;s.config.minRR=2.5;s.policy.minScore=60;
 const e=event();e.plan={adaptationId:v.id};assert.equal(candidateStrategy(s,e).config.riskPct,.15);assert.equal(candidateStrategy(s,e).config.minRR,2.5);
 s.real.book.closed.push(close('loss',v.id,-200,now+4*DAY));observeProgram(s,now+4*DAY);
 assert.equal(v.adaptation.phase,'reverted');assert.equal(s.config.riskPct,.15);assert.equal(s.config.minRR,2.5);assert.equal(s.policy.minScore,60);assert.equal(s.company.strategy.riskPct,.15);
 const stale=event();stale.preScore={adaptationId:v.id};assert.equal(candidateStrategy(s,stale).adaptationId,null);assert.equal(candidateStrategy(s,stale).strategyVersion,null);
});

test('Equivalent economic settings apply workflow and visuals without occupying a pilot',()=>{
 const s=state(),p=program({rules:[],workflow:{researchDailyLimit:3,researchIntervalMinutes:90,riskPct:.35,minRR:2}}),before=JSON.stringify(s.real.book);
 assert.equal(hasEconomicChange(s,p),false);const v=installProgram(officeState(s),p,{id:'workflow-only'},now);
 assert.equal(v.status,'solo flujo y visual');assert.equal(v.economicChange,false);assert.equal(v.adaptation,undefined);assert.equal(s.company.shadowProgram,null);assert.equal(s.policy.researchDailyLimit,3);assert.equal(s.company.ui.headline,p.visual.headline);assert.equal(JSON.stringify(s.real.book),before);
 const actual=installProgram(s,program(),{id:'economic'},now+1000);assert.equal(actual.status,'piloto');assert.equal(s.company.shadowProgram,actual.id);
});

test('Economic equality uses the current active rules and tested risk, rather than its unapplied target',()=>{
 const s=state(),active=installProgram(s,program(),{id:'active'},now);promote(s,active);
 const unchanged=program({workflow:{...active.program.workflow,riskPct:s.config.riskPct}});assert.equal(hasEconomicChange(s,unchanged),false);
 const v=installProgram(s,unchanged,{id:'same-effective'},now+4*DAY);assert.equal(v.status,'solo flujo y visual');assert.equal(s.company.shadowProgram,null);assert.equal(s.company.activeProgram,active.id);
 assert.equal(hasEconomicChange(s,{...unchanged,rules:[{...unchanged.rules[0],points:6}]}),true);
});

test('An equivalent legacy shadow is retired once without blocking a future economic hypothesis',()=>{
 for(const alreadyMigrated of [false,true]){
  const s=state(),p=program({rules:[],workflow:{researchDailyLimit:6,researchIntervalMinutes:45,riskPct:.35,minRR:2}}),old={id:'equivalent-old',version:1,status:'observación',program:p,previous:{policy:{...s.policy},config:{riskPct:.35,minRR:2}},tests:testProgram(p)};
  if(alreadyMigrated){const installed=installProgram(s,program(),{id:'temporary'},now);old.adaptation={...installed.adaptation,id:old.id,requested:{riskPct:.35,minRR:2},effectiveSettings:{riskPct:.35,minRR:2}};old.status='piloto';}
  s.company.versions=[old];s.company.shadowProgram=old.id;delete s.company.economicPilotMigration;const bookBefore=JSON.stringify(s.real.book);initialiseCompany(officeState(s),now+1000);
  assert.equal(s.company.shadowProgram,null);assert.equal(old.status,'solo flujo y visual');assert.equal(old.economicChange,false);assert.equal(s.company.economicPilotMigration,1);assert.match(old.gate,/equivalente/);assert.equal(JSON.stringify(s.real.book),bookBefore);
  const reason=old.gate,history=JSON.stringify(old.adaptation?.history);initialiseCompany(s,now+DAY);assert.equal(old.gate,reason);assert.equal(JSON.stringify(old.adaptation?.history),history);
  const next=installProgram(s,program(),{id:'real-change'},now+DAY);assert.equal(next.status,'piloto');assert.equal(s.company.shadowProgram,next.id);
 }
});

test('Legacy provenance is preserved when an equivalent pilot already has paper operations',()=>{
 for(const stage of ['position','closed','buy']){
  const s=state(),p=program({rules:[],workflow:{researchDailyLimit:6,researchIntervalMinutes:45,riskPct:.35,minRR:2}}),v={id:'with-provenance',version:1,status:'observación',program:p,previous:{policy:{...s.policy},config:{riskPct:.35,minRR:2}},tests:testProgram(p)};
  if(stage==='position'){s.real.book.positions=[{id:'open',adaptationId:v.id,qty:10,entry:50,mark:50,stop:45}];s.real.book.cash=9500;}else if(stage==='closed')s.real.book.closed=[close('past',v.id,10,now-1000)];else s.real.book.orders=[{id:'buy',side:'buy',adaptationId:v.id}];
  s.company.versions=[v];s.company.shadowProgram=v.id;delete s.company.economicPilotMigration;delete s.company.adaptationMigration;const before=JSON.stringify(s.real.book);initialiseCompany(s,now);
  assert.equal(s.company.shadowProgram,v.id);assert.equal(v.status,'piloto');assert.equal(canReplacePilot(s,program()),false);assert.equal(JSON.stringify(s.real.book),before);assert.match(v.gate,/procedencia/);
 }
});

test('A different validated hypothesis can replace an untraded pilot without erasing its history or spending',()=>{
 const s=state(),first=installProgram(s,program(),{id:'first'},now),e=event();augmentScore(s,e,asset,profile,rank,now);
 e.plan={adaptationId:first.id,stop:45,target:65};e.review={approve:true};e.status='espera';s.real.events=[e];s.operating.spentEur=.72;
 const alternative=program({threshold:48,rules:[{feature:'relativeVolume',op:'gt',value:2,points:9}]}),baseline=JSON.stringify(first.adaptation.base),before=JSON.stringify(s.real.book);
 assert.equal(canReplacePilot(s,alternative),true);const second=installProgram(officeState(s),alternative,{id:'second'},now+3600e3);
 assert.equal(second.status,'piloto');assert.equal(s.company.shadowProgram,second.id);assert.equal(first.status,'sustituido');assert.equal(first.adaptation.phase,'reverted');assert.equal(first.supersededBy,second.id);assert.equal(first.adaptation.observations.length,1);assert.equal(JSON.stringify(first.adaptation.base),baseline);assert.equal(second.adaptation.effectiveSettings.riskPct,.6);assert.equal(second.adaptation.base.aiEur,.72);assert.equal(s.operating.spentEur,.72);assert.equal(JSON.stringify(s.real.book),before);
 assert.equal(e.plan,undefined);assert.equal(e.review,undefined);assert.equal(e.previousPlan.stop,45);assert.equal(e.previousReview.approve,true);assert.equal(e.status,'nuevo');
 const info=strategyExperiments(s)[0];assert.equal(info.threshold,48);assert.equal(info.rules[0].points,9);assert.equal(info.rationale,alternative.rationale);
});

test('The same hypothesis cannot reset a pilot and a traded pilot cannot be replaced',()=>{
 const s=state(),p=program(),first=installProgram(s,p,{id:'first'},now),startedAt=first.adaptation.startedAt,expiresAt=first.adaptation.expiresAt;
 assert.equal(canReplacePilot(s,p),false);const repeated=installProgram(s,{...p,rationale:'Otra redacción',visual:{...p.visual,headline:'Solo diseño'}},{id:'same'},now+DAY);
 assert.equal(repeated.status,'solo flujo y visual');assert.equal(s.company.shadowProgram,first.id);assert.equal(first.adaptation.startedAt,startedAt);assert.equal(first.adaptation.expiresAt,expiresAt);
 const alternative=program({threshold:48});s.real.book.closed=[close('own-trade',first.id,10,now+DAY)];assert.equal(canReplacePilot(s,alternative),false);
 const deferred=installProgram(s,alternative,{id:'after-trade'},now+2*DAY);assert.equal(deferred.status,'solo flujo y visual');assert.equal(deferred.adaptation,undefined);assert.equal(first.adaptation.phase,'pilot');assert.equal(s.company.shadowProgram,first.id);
});

test('Pilot scoring, metadata and candidate risk take effect immediately without changing base settings or ledger',()=>{
 const s=state(),before=JSON.stringify(s.real.book),v=installProgram(officeState(s),program(),{id:'meeting'},now),e=event(),score=augmentScore(officeState(s),e,asset,profile,rank,now);
 assert.equal(v.status,'piloto');assert.equal(s.company.shadowProgram,v.id);assert.equal(s.company.activeProgram,null);assert.equal(score.score,45);assert.equal(score.eligible,true);assert.equal(score.adaptationId,v.id);assert.equal(score.programVersion,v.version);assert.equal(e.experiment.observationOnly,false);
 e.preScore=score;const policy=candidateStrategy(s,e);assert.equal(policy.adaptationId,v.id);assert.equal(policy.strategyVersion,v.version);assert.equal(policy.config.riskPct,.6);assert.equal(policy.config.minRR,1.5);assert.equal(s.config.riskPct,.35);assert.equal(s.config.minRR,2);assert.equal(JSON.stringify(s.real.book),before);
 augmentScore(s,e,asset,profile,rank,now+1000);assert.equal(v.observations,1);
 const info=strategyExperiments(s)[0];assert.equal(info.phase,'pilot');assert.equal(info.requested.riskPct,1.2);assert.equal(info.effective.riskPct,.6);
});

test('Pilot capacity protects the actual portfolio, preserves observations and falls back to the current strategy',()=>{
 const s=state(),v=installProgram(s,program(),{id:'meeting'},now);s.real.book.cash=9000;s.real.book.positions=[1,2].map(i=>({id:'open-'+i,adaptationId:v.id,qty:10,entry:50,mark:50,entryFx:1,markFx:1,stop:45}));
 const before=JSON.stringify(s.real.book),e=event(),score=augmentScore(s,e,asset,profile,rank,now);e.plan={adaptationId:v.id};
 assert.equal(score.adaptationId,undefined);assert.equal(score.score,40);assert.equal(e.experiment.observationOnly,true);assert.equal(v.observations,1);assert.equal(candidateStrategyGuard(s,e,now).ok,false);assert.match(candidateStrategyGuard(s,e,now).reasons.join(' '),/dos posiciones/);assert.equal(JSON.stringify(s.real.book),before);
 const blocked=augmentScore(s,event('unverified'),asset,profile,{...rank,blocked:true},now);assert.equal(blocked.eligible,false);
});

test('Execution capacity uses actual EUR lot cost, and an existing baseline plan keeps its original policy',()=>{
 const s=state(),v=installProgram(s,program(),{id:'meeting'},now);s.real.book.cash=9500;s.real.book.positions=[{id:'existing',adaptationId:v.id,qty:10,entry:50,mark:50.1,entryFx:1,markFx:1}];
 const e={...event(),plan:{adaptationId:v.id},preScore:{adaptationId:v.id}};
 assert.equal(candidateStrategyGuard(s,e,now,498).ok,true);assert.equal(candidateStrategyGuard(s,e,now,500).ok,false);
 const baseline={...event('legacy-plan'),plan:{stop:45,target:65},preScore:{adaptationId:v.id}};assert.equal(candidateStrategy(s,baseline).adaptationId,null);assert.equal(candidateStrategy(s,baseline).config.riskPct,.35);assert.equal(candidateStrategy(s,baseline).config.minRR,2);
 assert.equal(candidateStrategyGuard(s,{plan:{adaptationId:'missing'}},now,100).ok,false);
});

test('Repeated market timestamps do not manufacture observations, while changed financial evidence counts',()=>{
 const s=state(),v=installProgram(s,program(),{id:'meeting'},now),e=event(),first={...profile,fundamentals:{metrics:{annualEnd:'2025-12-31',revenueYoY:.2}}};
 augmentScore(s,e,asset,first,rank,now);assert.equal(v.observations,1);
 const refreshed={...first,market:{...first.market,asOf:now+1000,checkedAt:now+1000}};augmentScore(s,e,asset,refreshed,rank,now+1000);assert.equal(v.observations,1);
 const changed={...refreshed,fundamentals:{metrics:{...first.fundamentals.metrics,revenueYoY:.3}}};augmentScore(s,e,asset,changed,rank,now+2000);assert.equal(v.observations,2);
});

test('Promotion needs actual own closes, three days and known cost, and applies only the risk already tested',()=>{
 const s=state(),v=installProgram(officeState(s),program(),{id:'meeting'},now);observeProgram(s,now+3*DAY);assert.equal(v.status,'piloto');assert.equal(s.company.activeProgram,null);
 s.real.book.closed=[close('a',v.id,20),close('b',v.id,-5),close('c',v.id,10),close('other','other-experiment',500)];s.real.book.cash+=25;s.operating.spentEur=null;observeProgram(s,now+3*DAY);assert.equal(v.status,'piloto');assert.equal(v.adaptation.metrics.costsKnown,false);
 s.operating.spentEur=.74;observeProgram(s,now+3*DAY);assert.equal(v.status,'activo');assert.equal(v.adaptation.phase,'active');assert.equal(s.company.activeProgram,v.id);assert.equal(s.company.shadowProgram,null);assert.equal(v.adaptation.metrics.pilot.closed,3);assert.equal(v.adaptation.metrics.pilot.pnlNetCommissions,25);
 assert.equal(v.adaptation.requested.riskPct,1.2);assert.equal(s.config.riskPct,.6);assert.equal(s.config.minRR,1.5);assert.equal(s.company.strategy.riskPct,.6);assert.match(v.gate,/no demuestra/);assert.ok(v.adaptation.metrics.limitations.some(x=>/Sin cierres de control/.test(x)));
});

test('Reversion withdraws pending plans while preserving positions, stops and their original trading plan',()=>{
 const s=state(),v=installProgram(s,program(),{id:'meeting'},now),pending=event('pending'),open=event('already-open');
 pending.plan={adaptationId:v.id,stop:45,target:65,thesis:'Pendiente'};pending.review={approve:true};pending.status='espera';open.plan={adaptationId:v.id,stop:43,target:64};open.review={approve:true};open.status='abierto';s.real.events=[pending,open];
 s.real.book.cash=9500;s.real.book.positions=[{id:'open',eventId:open.id,adaptationId:v.id,qty:10,entry:50,mark:50,entryFx:1,markFx:1,entryFee:1,stop:43,target:64}];s.real.book.closed=[close('lost',v.id,-101,now+DAY)];s.real.book.cash-=101;
 const positions=JSON.stringify(s.real.book.positions),orders=JSON.stringify(s.real.book.orders);observeProgram(officeState(s),now+DAY);
 assert.equal(v.status,'revertido');assert.equal(s.company.shadowProgram,null);assert.equal(pending.plan,undefined);assert.equal(pending.review,undefined);assert.equal(pending.status,'nuevo');assert.equal(pending.previousPlan.stop,45);assert.equal(pending.previousPlan.withdrawnAt,now+DAY);assert.equal(open.plan.stop,43);assert.equal(open.review.approve,true);
 assert.equal(JSON.stringify(s.real.book.positions),positions);assert.equal(JSON.stringify(s.real.book.orders),orders);assert.equal(candidateStrategyGuard(s,{plan:{adaptationId:v.id}},now+DAY).ok,false);
});

test('Legacy observation migrates once after actual operating cost is available, without resetting its existing book',()=>{
 const s=state(),p=program(),legacy={id:'old-shadow',version:7,status:'observación',program:p,previous:{policy:{...s.policy},config:{riskPct:s.config.riskPct,minRR:s.config.minRR}},tests:testProgram(p),observations:12,notBefore:now+7*DAY};
 delete s.company.adaptationMigration;delete s.operating;s.company.versions=[legacy];s.company.shadowProgram=legacy.id;const before=JSON.stringify(s.real.book);initialiseCompany(s,now);assert.equal(legacy.adaptation,undefined);assert.equal(s.company.adaptationMigration,undefined);
 s.operating={spentEur:.4};initialiseCompany(officeState(s),now+1000);assert.equal(legacy.status,'piloto');assert.equal(legacy.adaptation.startedAt,now+1000);assert.equal(legacy.adaptation.base.aiEur,.4);assert.equal(s.company.adaptationMigration,1);
 const id=legacy.adaptation.id,baseline=JSON.stringify(legacy.adaptation.base);initialiseCompany(s,now+DAY);assert.equal(legacy.adaptation.id,id);assert.equal(legacy.adaptation.startedAt,now+1000);assert.equal(JSON.stringify(legacy.adaptation.base),baseline);assert.equal(JSON.stringify(s.real.book),before);
});

test('A new pilot compares alternative rules against the active strategy without applying its rules twice',()=>{
 const s=state(),active=installProgram(s,program(),{id:'meeting'},now);promote(s,active);assert.equal(s.company.activeProgram,active.id);
 const alternative=program({rules:[{feature:'relativeVolume',op:'gt',value:2,points:9}],threshold:48}),pilot=installProgram(s,alternative,{id:'next'},now+4*DAY),e=event('alternative'),scored=augmentScore(s,e,asset,profile,rank,now+4*DAY);
 assert.equal(scored.score,49);assert.equal(scored.eligible,true);assert.equal(scored.adaptationId,pilot.id);assert.equal(pilot.adaptation.observations[0].baselineScore,45);assert.equal(pilot.adaptation.observations[0].pilotScore,49);assert.equal(pilot.adaptation.observations[0].baselineEligible,true);assert.equal(pilot.adaptation.effectiveSettings.riskPct,.85);
});

test('Reverting a promoted replacement restores the previous active program as well as its policy',()=>{
 const s=state(),active=installProgram(s,program(),{id:'meeting'},now);promote(s,active);
 const replacement=installProgram(s,program({threshold:50,rules:[{feature:'relativeVolume',op:'gt',value:2,points:15}]}),{id:'next'},now+4*DAY);promote(s,replacement,now+7*DAY);assert.equal(s.company.activeProgram,replacement.id);assert.equal(s.config.riskPct,.85);
 s.real.book.closed.push(close('replacement-loss',replacement.id,-140,now+8*DAY));s.real.book.cash-=140;observeProgram(s,now+8*DAY);
 assert.equal(replacement.status,'revertido');assert.equal(s.company.activeProgram,active.id);assert.equal(s.config.riskPct,.6);assert.equal(s.config.minRR,1.5);assert.equal(s.policy.minScore,45);
 const e=event('after-rollback'),score=augmentScore(s,e,asset,profile,rank,now+8*DAY);assert.equal(score.score,45);assert.equal(score.adaptationId,active.id);
});

test('Meeting baseline uses active rules and current global risk while retaining requested versus tested pilot settings',()=>{
 const s=state(),active=installProgram(s,program({threshold:47}),{id:'active'},now);promote(s,active);s.config.riskPct=.2;s.config.minRR=2.5;
 const pilot=installProgram(s,program({threshold:39,rules:[{feature:'relativeVolume',op:'gt',value:2,points:12}]}),{id:'next-pilot'},now+4*DAY);
 s.real.book.orders.push({id:'owned',side:'buy',adaptationId:pilot.id});
 const latest=installProgram(s,program({threshold:70,rules:[],workflow:{researchDailyLimit:3,researchIntervalMinutes:120,riskPct:2,minRR:1}}),{id:'not-applied'},now+5*DAY);
 const context=compactContext(s,now+5*DAY);
 assert.equal(context.program.threshold,47);assert.deepEqual(context.program.rules,active.program.rules);assert.equal(context.program.workflow.riskPct,.2);assert.equal(context.program.workflow.minRR,2.5);
 assert.equal(context.program.workflow.researchDailyLimit,3);assert.equal(context.programState.active.id,active.id);assert.equal(context.programState.active.effectiveSettings.riskPct,.2);assert.equal(context.programState.active.program.workflow.riskPct,1.2,'Original request remains a historical request, not the risk now in force');
 assert.equal(context.programState.pilot.id,pilot.id);assert.equal(context.programState.pilot.program.workflow.riskPct,1.2);assert.equal(context.programState.pilot.effectiveSettings.riskPct,.45);assert.equal(context.programState.pilot.effectiveSettings.minRR,1.5);
 assert.equal(context.programState.latestProposal.id,latest.id);assert.equal(context.programState.latestProposal.economicApplication,'not_applied');assert.equal(context.programState.latestProposal.effectiveSettings,null);
 assert.equal(context.strategy.minScore,47);assert.equal(context.strategy.riskPct,.2);assert.equal(context.strategy.minRR,2.5);validateProgram(context.program);
});