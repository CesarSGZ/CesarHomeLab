import test from 'node:test';
import assert from 'node:assert/strict';
import {createAdaptation,recordAdaptationObservation,adaptationMetrics,adaptationDecision,reviewAdaptation,adaptationEntryGuard,adaptationLimits} from '../trading-worker/adaptation.js';

const DAY=864e5,now=Date.parse('2026-10-04T16:00:00Z');
const book=()=>({currency:'EUR',cash:10000,initial:10000,positions:[],orders:[],closed:[],entriesToday:0});
const version=()=>({id:'pilot-1',program:{workflow:{riskPct:1,minRR:1.5}},previous:{config:{riskPct:.35,minRR:2}},tests:['validación de programa','pruebas sin red']});
const snapshot=()=>({book:book(),aiEur:.7});
const start=()=>createAdaptation(version(),snapshot(),now);
const trade=(id,pnl,extra={})=>({id,adaptationId:'pilot-1',qty:10,entry:50,entryFx:1,entryFee:1,pnl,closedAt:now+3*DAY,...extra});
const freeze=value=>{if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};

test('A validated pilot can start before any trades while preserving ledger and hard limits',()=>{
 const v=freeze(version()),s=freeze(snapshot()),before=JSON.stringify(s),a=createAdaptation(v,s,now);
 assert.equal(a.phase,'pilot');assert.equal(a.metrics.pilot.closed,0);assert.equal(a.effectiveSettings.riskPct,.6);assert.equal(a.requested.riskPct,1);assert.equal(a.effectiveSettings.minRR,1.5);
 assert.equal(a.expiresAt,now+21*DAY);assert.equal(JSON.stringify(s),before);assert.deepEqual(s.book.orders,[]);assert.equal(adaptationLimits.monthlyBudgetEur,10);assert.equal(adaptationLimits.maxEntries,2);assert.equal(adaptationLimits.maxPositions,20);
 assert.throws(()=>createAdaptation({...version(),tests:[]},snapshot(),now),/pruebas/);
 for(const workflow of [{riskPct:2.01,minRR:2},{riskPct:.05,minRR:2},{riskPct:.5,minRR:.99},{riskPct:.5,minRR:8.01}])assert.throws(()=>createAdaptation({...version(),program:{workflow}},snapshot(),now),/límites/);
});

test('Distinct evidence comparisons count once, and observations do not fabricate financial outcomes',()=>{
 const a=freeze(start()),row={eventId:'candidate',evidenceFingerprint:'facts-1',at:now,baselineEligible:false,pilotEligible:true,baselineScore:44,pilotScore:52};
 const first=recordAdaptationObservation(a,row),repeat=recordAdaptationObservation(first,{...row,at:now+1000}),updated=recordAdaptationObservation(repeat,{...row,evidenceFingerprint:'facts-2',at:now+1000});
 assert.equal(a.observations.length,0);assert.equal(first.observations.length,1);assert.equal(repeat.observations.length,1);assert.equal(updated.observations.length,2);
 const m=adaptationMetrics(updated,snapshot(),now+1000);assert.equal(m.observations,2);assert.equal(m.changedDecisions,2);assert.equal(m.pilot.closed,0);assert.equal(m.pilot.winRate,null);assert.equal(m.pilot.pnlNetCommissions,0);
 assert.throws(()=>recordAdaptationObservation(a,{...row,evidenceFingerprint:''}),/evidencia/);
});

test('Three actual pilot closes over three days can promote preliminarily without inventing a control group',()=>{
 const a=freeze(start()),s=snapshot();s.aiEur=.8;s.book.closed=[trade('one',20),trade('two',-10),trade('three',15),trade('historical',500,{closedAt:now-1})];
 const before=JSON.stringify(s),d=adaptationDecision(a,freeze(s),now+3*DAY),active=reviewAdaptation(a,s,now+3*DAY);
 assert.equal(d.action,'activate');assert.equal(d.phase,'active');assert.equal(d.metrics.pilot.closed,3);assert.equal(d.metrics.pilot.pnlNetCommissions,25);assert.equal(d.metrics.control.closed,0);assert.ok(d.metrics.limitations.some(x=>/Sin cierres de control/.test(x)));assert.match(d.reason,/no demuestra/);
 assert.equal(active.phase,'active');assert.equal(active.effectiveSettings.riskPct,.6);assert.equal(active.requested.riskPct,1);assert.equal(active.effectiveSettings.minRR,1.5);assert.equal(active.history.length,2);assert.equal(a.history.length,1);assert.equal(JSON.stringify(s),before);
 const second=reviewAdaptation(active,s,now+4*DAY);assert.equal(second.phase,'active');assert.equal(second.history.length,2);
});

test('Preliminary promotion requires real unique complete closes, time and comparable known spending',()=>{
 const a=start(),s=snapshot();s.aiEur=.8;
 s.book.closed=[trade('one',20),trade('one',20),trade('two',5)];assert.equal(adaptationDecision(a,s,now+3*DAY).phase,'pilot');assert.equal(adaptationMetrics(a,s,now+3*DAY).pilot.closed,2);
 s.book.closed.push(trade('three',5));assert.equal(adaptationDecision(a,s,now+2*DAY).phase,'pilot');
 const noCost={...s,aiEur:null};assert.equal(adaptationDecision(a,noCost,now+3*DAY).phase,'pilot');assert.equal(adaptationMetrics(a,noCost,now+3*DAY).aiPeriodEur,null);
 assert.equal(adaptationDecision(a,{...s,aiEur:.1},now+3*DAY).phase,'pilot');
 s.book.closed.push(trade('invalid',undefined));assert.equal(adaptationDecision(a,s,now+3*DAY).phase,'pilot');assert.equal(adaptationMetrics(a,s,now+3*DAY).invalidPilotClosed,1);
 const negative={...s,book:{...s.book,closed:[trade('one',20),trade('two',-30),trade('three',5)]}};assert.equal(adaptationDecision(a,negative,now+3*DAY).phase,'pilot');
});

test('Contemporary untagged closes are descriptive controls, not other experiments or historic trades',()=>{
 const a=start(),s=snapshot();s.aiEur=.85;s.book.closed=[trade('pilot',10),trade('control',-5,{adaptationId:undefined}),trade('other-pilot',999,{adaptationId:'different'}),trade('old-control',999,{adaptationId:undefined,closedAt:now-1})];
 const m=adaptationMetrics(a,s,now+3*DAY);assert.equal(m.pilot.closed,1);assert.equal(m.control.closed,1);assert.equal(m.control.pnlNetCommissions,-5);assert.equal(m.aiPeriodEur,.15);assert.equal(m.rentEquivalentNetEur,-.14);assert.ok(m.limitations.some(x=>/no asignados aleatoriamente/.test(x)));
});

test('Monthly spending resets never become comparable by catching up to the previous month total',()=>{
 const initial={...snapshot(),aiMonth:'2026-10'},a=createAdaptation(version(),initial,now),s={...snapshot(),aiEur:.8,aiMonth:'2026-10'};s.book.closed=[trade('one',10),trade('two',10),trade('three',10)];
 assert.equal(a.base.aiMonth,'2026-10');assert.equal(adaptationMetrics(a,s,now+3*DAY).costsKnown,true);assert.equal(adaptationDecision(a,s,now+3*DAY).phase,'active');
 const nextMonth={...s,aiMonth:'2026-11'};for(const spent of [.1,.7,.9]){const m=adaptationMetrics(a,{...nextMonth,aiEur:spent},now+3*DAY);assert.equal(m.costsKnown,false);assert.equal(m.aiPeriodEur,null);assert.equal(m.aiCostPeriod.comparable,false);assert.equal(adaptationDecision(a,{...nextMonth,aiEur:spent},now+3*DAY).phase,'pilot');}
 assert.equal(adaptationMetrics(a,{...s,aiMonth:undefined},now+3*DAY).costsKnown,false);
 const legacy=start();assert.equal(adaptationMetrics(legacy,s,now+3*DAY).costsKnown,false);assert.equal(adaptationMetrics(legacy,{...s,aiMonth:undefined},now+3*DAY).costsKnown,true);
 const invalid=createAdaptation(version(),{...initial,aiMonth:'2026-13'},now);assert.equal(adaptationMetrics(invalid,{...s,aiMonth:'2026-13'},now+3*DAY).costsKnown,false);
});

test('Immediate rollback uses actual realized and marked losses instead of waiting for ten closes',()=>{
 const a=start(),s=snapshot();s.book.closed=[trade('one',-100.01)];assert.equal(adaptationDecision(a,s,now+3*DAY).action,'rollback');assert.equal(adaptationDecision(a,{...s,book:{...s.book,closed:[trade('one',-100)]}},now+3*DAY).phase,'pilot');
 const marked=snapshot();marked.book.cash=9500;marked.book.positions=[{id:'open',adaptationId:a.id,qty:10,entry:50,entryFx:1,entryFee:1,mark:39,markFx:1}];assert.equal(adaptationDecision(a,marked,now+DAY).action,'rollback');
 const reverted=reviewAdaptation(a,s,now+3*DAY);assert.equal(reverted.phase,'reverted');assert.equal(adaptationDecision(reverted,s,now+4*DAY).action,'hold');assert.equal(adaptationEntryGuard(reverted,{book:s.book,allocationEur:100},now+4*DAY).ok,false);
});

test('Pilot entry limits use current equity and actual candidate capital without forcing any orders',()=>{
 const a=start(),b=book(),before=JSON.stringify(b);let guard=adaptationEntryGuard(a,{book:freeze(b),allocationEur:500},now);
 assert.equal(guard.ok,true);assert.equal(guard.projectedExposurePct,5);assert.equal(JSON.stringify(b),before);
 const occupied=book();occupied.cash=9500;occupied.positions=[{adaptationId:a.id,qty:10,entry:50,mark:50}];assert.equal(adaptationEntryGuard(a,{book:occupied,allocationEur:500},now).ok,true);
 assert.equal(adaptationEntryGuard(a,{book:occupied,allocationEur:501},now).ok,false);
 occupied.cash=9000;occupied.positions.push({adaptationId:a.id,qty:10,entry:50,mark:50});assert.match(adaptationEntryGuard(a,{book:occupied,allocationEur:1},now).reasons.join(' '),/dos posiciones/);
 const shrunk=book();shrunk.cash=9000;assert.equal(adaptationEntryGuard(a,{book:shrunk,allocationEur:950},now).ok,false);
});

test('Passive appreciation pauses new pilot capital without reversing gains, while position and loss limits still apply',()=>{
 const a=start(),s=snapshot();s.book.cash=9000;s.book.positions=[{id:'appreciated',adaptationId:a.id,qty:20,entry:50,entryFx:1,entryFee:1,mark:65,markFx:1}];
 const m=adaptationMetrics(a,s,now+DAY);assert.ok(m.pilotExposurePct>10);assert.ok(m.pilotPnlIncludingOpen>0);assert.equal(adaptationDecision(a,s,now+DAY).phase,'pilot');
 const guard=adaptationEntryGuard(a,{book:s.book,allocationEur:1},now+DAY);assert.equal(guard.ok,false);assert.match(guard.reasons.join(' '),/10%/);assert.ok(!guard.reasons.some(r=>/dos posiciones/.test(r)));
 const crowded={...s,book:{...s.book,cash:8900,positions:[...s.book.positions,...[1,2].map(i=>({id:'extra-'+i,adaptationId:a.id,qty:1,entry:50,mark:50}))]}};assert.equal(adaptationDecision(a,crowded,now+DAY).action,'rollback');
 const losing={...s,book:{...s.book,positions:[{...s.book.positions[0],mark:44}]}};assert.equal(adaptationDecision(a,losing,now+DAY).action,'rollback');
});

test('Global limits, invalid exposure and policy corruption block an experimental entry',()=>{
 const a=start(),b=book();b.entriesToday=2;assert.match(adaptationEntryGuard(a,{book:b,allocationEur:500},now).reasons.join(' '),/dos entradas/);
 b.entriesToday=0;b.positions=Array.from({length:20},()=>({qty:1,entry:1}));assert.match(adaptationEntryGuard(a,{book:b,allocationEur:1},now).reasons.join(' '),/veinte posiciones/);
 assert.equal(adaptationEntryGuard(a,{book:book(),allocationEur:null},now).ok,false);assert.equal(adaptationEntryGuard(a,{book:{...book(),currency:'USD'},allocationEur:500},now).ok,false);
 const corrupted={...a,effectiveSettings:{riskPct:.7,minRR:1.5}};assert.match(adaptationEntryGuard(corrupted,{book:book(),allocationEur:500},now).reasons.join(' '),/0,25/);
 assert.equal(adaptationDecision(a,{...snapshot(),validationFailures:['datos corruptos']},now).phase,'reverted');
});

test('A pilot expires without evidence, and a validated active strategy retains global controls',()=>{
 const a=start(),s=snapshot();const expired=reviewAdaptation(a,s,now+21*DAY);assert.equal(expired.phase,'reverted');assert.ok(expired.missingEvidence.includes('Tres cierres propios válidos'));
 assert.equal(adaptationEntryGuard(a,{book:s.book,allocationEur:500},now+21*DAY).ok,false);
 const active={...a,phase:'active',effectiveSettings:{riskPct:1.5,minRR:1}};assert.equal(adaptationEntryGuard(active,{book:book(),allocationEur:1500},now+30*DAY).ok,true);
 const b=book();b.entriesToday=2;assert.equal(adaptationEntryGuard(active,{book:b,allocationEur:1500},now+30*DAY).ok,false);
});
