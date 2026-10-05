import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,upgradeState} from '../trading-worker/engine.js';
import {refreshLaunch,launchContext} from '../trading-worker/launch.js';
import {installProgram} from '../trading-worker/company.js';
import {officeState} from '../trading-worker/office-boundary.js';
import {analysisEvidenceFingerprint,selectPlanningCandidates} from '../trading-worker/strategy.js';
import {referenceSource} from '../trading-worker/market-data.js';

const now=Date.parse('2026-10-05T14:00:00Z'),DAY=864e5;
function state(){
 const s=upgradeState(initialState());s.operating={month:'2026-10',spentEur:.3,remainingEur:9.7,exhausted:false};
 s.real.assets=[];s.real.events=[];s.real.profiles={};s.real.quotes={};s.real.stats={researched:0,rejected:0};return s;
}
function candidate(s,id,reason='Falta consenso verificable y calibración de escenarios'){
 const symbol='T'+id.toUpperCase().slice(0,7),source={url:'https://issuer.example/ir/'+id,claim:'El emisor publicó el resultado material y su fecha.'};
 const e={id,symbol,status:'descartado',confirmed:true,timing:'announced',date:new Date(now-DAY).toISOString(),source:source.url,sources:[source],summary:'Anuncio real del emisor; aún se evalúan los escenarios.',preScore:{score:60,eligible:true,blocked:false},research:{researchedAt:now-1000,worthAnalyzing:false,missingEvidence:[]},analysisAssessment:{decision:'reject',approve:false,reason,missingEvidence:[reason]},reasons:[reason],followupHistory:[{at:now-2000,fingerprint:'old'}]};
 s.real.assets.push({symbol,name:'Test Company Common Stock',exchange:'NASDAQ',marketCap:300e6,price:10,dataVerified:true,sector:'Industrial'});
 s.real.profiles[symbol]={fundamentals:{metrics:{annualEnd:'2025-12-31',cashLatest:50e6,cashDate:'2026-08-31',equityLatest:200e6,equityDate:'2026-08-31',shareGrowth:.02,revenueYoY:.1},source:'https://data.sec.gov/companyfacts'},market:{averageDollarVolume:5e6,seriesDiagnostic:{adjustments:{complete:true}}}};
 s.real.quotes[symbol]={source:referenceSource,referenceOnly:true,currency:'USD',price:10,time:now-DAY*3,fetchedAt:now,dollarVolume:5e6};
 s.real.events.push(e);return e;
}
test('A cold office reports the goal without creating pilots, plans, orders or model work',()=>{
 const s=state(),before=JSON.stringify(s.real.book),result=refreshLaunch(officeState(s),now);
 assert.equal(result.active,true);assert.equal(result.target,2);assert.equal(result.ready,0);assert.equal(result.priorityUseful,false);assert.equal(s.company.versions.length,0);assert.equal(JSON.stringify(s.real.book),before);assert.equal(launchContext(s).experimental,false);
});
test('Stagnation creates one bounded pilot and reopens at most two soft cases while preserving the real ledger and supplemental history',()=>{
 const s=state();s.real.stats.researched=3;const a=candidate(s,'one'),b=candidate(s,'two'),c=candidate(s,'three');a.analysisBlocked={reason:a.reasons[0],missingEvidence:a.reasons,fingerprint:'before'};
 a.analysisFollowup={at:now-2000,baselineResearchAt:now,reason:'Falta consenso',missingEvidence:['Consenso'],nextTask:'Buscar consenso de escenarios'};
 s.company.agency.workQueue=[{id:'old-query',kind:'research',eventId:a.id,status:'pending',task:'Buscar consenso de escenarios',reason:'Falta consenso',attempts:2}];
 const before=JSON.stringify(s.real.book),history=JSON.stringify(a.followupHistory),budget=JSON.stringify(s.operating),result=refreshLaunch(officeState(s),now),v=s.company.versions.find(v=>v.id===result.pilotId);
 assert.equal(v.program.threshold,35);assert.equal(v.program.workflow.minRR,1.3);assert.equal(v.adaptation.effectiveSettings.riskPct,.35);assert.equal(s.config.riskPct,.35);assert.equal(s.config.minRR,2);assert.equal(result.priorityUseful,true);assert.equal(result.reevaluatedIds.length,2);
 for(const e of [a,b]){assert.equal(e.status,'nuevo');assert.equal(e.plan,undefined);assert.equal(e.review,undefined);assert.equal(e.launchReevaluation.pilotId,v.id);assert.equal(e.preScore.adaptationId,v.id);assert.equal(e.research.worthAnalyzing,true);assert.equal(e.launchHistory.length,1);}
 assert.equal(a.launchHistory[0].assessment.decision,'reject');assert.equal(a.analysisBlocked,undefined);assert.equal(a.analysisFollowup,undefined);assert.equal(JSON.stringify(a.followupHistory),history);assert.equal(s.company.agency.workQueue[0].status,'archived');assert.match(s.company.agency.workQueue[0].result,/no se afirma resuelta/);assert.equal(s.company.agency.workQueue[0].attempts,2);assert.equal(c.status,'descartado');
 assert.equal(JSON.stringify(s.real.book),before);assert.equal(JSON.stringify(s.operating),budget);
 const context=launchContext(s,a);assert.equal(context.experimental,true);assert.equal(context.hypothesis.programId,v.id);assert.match(context.forecast,/no ventaja ni beneficio garantizados/);
 refreshLaunch(s,now+1000);assert.equal(s.company.versions.length,1);assert.equal(result.reevaluatedIds.length,2);assert.equal(a.launchHistory.length,1);assert.equal(c.status,'descartado');
});
test('Hard financial gaps and price diagnostics are never converted into a soft experimental reevaluation',()=>{
 const reasons=['Falta consenso y deuda posterior desconocida','Faltan sinergias y vencimientos de deuda','No hay calibración, pero financiación desconocida','Escenarios insuficientes; riesgo de insolvencia','Sin consenso con dilución pendiente','Falta ventaja demostrada con split no reconciliado','Consenso desconocido; precio anómalo'];
 for(const [index,reason] of reasons.entries()){
  const s=state();s.real.stats.researched=3;const e=candidate(s,String(index),reason);refreshLaunch(s,now);assert.equal(e.status,'descartado',reason);assert.equal(e.launchReevaluation,undefined,reason);assert.equal(s.real.book.orders.length,0);
 }
 const s=state();s.real.stats.researched=3;const e=candidate(s,'adjustment');s.real.profiles[e.symbol].market.seriesDiagnostic.adjustments.complete=false;refreshLaunch(s,now);assert.equal(e.launchReevaluation,undefined);
 const unknown=state();unknown.real.stats.researched=3;const u=candidate(unknown,'unknowncash');delete unknown.real.profiles[u.symbol].fundamentals.metrics.cashLatest;refreshLaunch(unknown,now);assert.equal(u.launchReevaluation,undefined);
});
test('Verified debt is not itself a veto, and missing primary evidence or identity remains essential',()=>{
 for(const reason of ['Falta consenso, con deuda verificada','Falta consenso; sin dilución','Falta consenso, con dilución ya verificada','Falta consenso; split reconciliado']){
  const s=state();s.real.stats.researched=3;const e=candidate(s,'verified',reason);refreshLaunch(s,now);assert.equal(e.status,'nuevo',reason);
 }
 for(const mutation of [(s,e)=>e.confirmed=false,(s,e)=>e.sources=[],(s,e)=>s.real.assets[0].dataVerified=false,(s,e)=>delete s.real.quotes[e.symbol],(s,e)=>e.synthetic=true]){
  const x=state();x.real.stats.researched=3;const bad=candidate(x,'bad');mutation(x,bad);refreshLaunch(x,now);assert.equal(bad.launchReevaluation,undefined);assert.ok(launchContext(x,bad).missing.essential.length>0);
 }
});
test('A real existing pilot and already approved plans are preserved instead of being replaced by launch defaults',()=>{
 const s=state();s.real.stats.researched=4;const e=candidate(s,'ready');e.status='espera';e.research.worthAnalyzing=true;e.plan={approve:true,expiresAt:now+DAY,entryMin:9.8,entryMax:10.2,stop:9.4,target:12};e.review={approve:true};const result=refreshLaunch(s,now);
 assert.equal(result.ready,1);assert.equal(result.priorityUseful,true);assert.equal(s.company.versions.length,0);assert.equal(e.plan.stop,9.4);
 const other=state();other.real.stats.researched=4;const program={scope:'agent-office',rationale:'Hipótesis independiente ya en revisión',threshold:40,rules:[],workflow:{researchDailyLimit:6,researchIntervalMinutes:45,riskPct:.35,minRR:1.5},visual:{focus:'pipeline',theme:'mint',headline:'Piloto propio',panels:['report','efficiency'],lighting:'day'}};
 const v=installProgram(other,program,{id:'existing'},now-1000),open=candidate(other,'existing');const launch=refreshLaunch(other,now);assert.equal(launch.pilotId,v.id);assert.equal(other.company.versions.length,1);assert.equal(v.program.workflow.minRR,1.5);assert.equal(open.preScore.adaptationId,v.id);
});
test('After two actual paper buys the launch goal completes without resetting it or changing capital',()=>{
 const s=state();s.real.book.orders=[{id:'one',side:'buy'},{id:'two',side:'buy'},{id:'close',side:'sell'}];const before=JSON.stringify(s.real.book);const result=refreshLaunch(s,now);assert.equal(result.active,false);assert.equal(result.buyCount,2);assert.equal(result.priorityUseful,false);assert.equal(result.phase,'complete');assert.equal(JSON.stringify(s.real.book),before);
 s.real.book.orders.push({id:'another-close',side:'sell'});assert.equal(refreshLaunch(s,now+DAY).active,false);
});

test('A live pilot remains experimental after the two initial purchases and keeps its measured-learning goal',()=>{
 const s=state();s.real.stats.researched=3;const e=candidate(s,'pilot');refreshLaunch(s,now);const pilotId=e.preScore.adaptationId;
 s.real.book.orders.push({id:'first',side:'buy',adaptationId:pilotId},{id:'second',side:'buy',adaptationId:pilotId});
 assert.equal(refreshLaunch(s,now+1000).active,false);const context=launchContext(s,e);assert.equal(context.experimental,true);assert.equal(context.hypothesis.programId,pilotId);assert.match(context.goal,/Evaluar el piloto/);assert.equal(s.company.versions.length,1);
});
test('Actual unresolved price-series and lending questions remain essential even when adjustment factors exist',()=>{
 const hardQuestions=[
  'La caída de 88,7% no está corroborada ni explicada; faltan escenarios calibrados.',
  'Serie histórica independiente de precios y registro completo de acciones corporativas para confirmar o explicar la caída del 88,7%.',
  'El texto y cálculo de headroom de los covenants aplicables, ya que el 10-Q solo confirma cumplimiento.',
  'Covenants y headroom pendientes; consenso no disponible.',
  'Los términos completos de deuda no están cotejados; falta calibración.',
  'Información financiera posterior a la adquisición para cuantificar deuda consolidada, caja y coste financiero.'
 ];
 for(const question of hardQuestions){
  const s=state();s.real.stats.researched=3;const e=candidate(s,'actual','Falta calibración de escenarios');e.analysisAssessment.missingEvidence=[question];
  s.real.profiles[e.symbol].market.return1y=-.8818;s.real.profiles[e.symbol].market.seriesDiagnostic.corporateActions={reporting:'not_provided',splits:[],dividends:[]};
  refreshLaunch(s,now);assert.equal(e.launchReevaluation,undefined,question);assert.ok(launchContext(s,e).missing.essential.some(x=>x===question),question);assert.equal(s.real.book.orders.length,0);
 }
});

test('A newer balance-sheet request without a material transaction does not invalidate the latest dated reported balance',()=>{
 const s=state();s.real.stats.researched=3;const e=candidate(s,'dated','Falta consenso comparable y escenarios calibrados');
 const request='Confirmación de efectivo y deuda neta posteriores al 30 de abril de 2026, o evidencia SEC de que no hubo cambios materiales.';
 e.analysisAssessment.missingEvidence=[request];e.research.missingEvidence=[request];refreshLaunch(s,now);assert.equal(e.status,'nuevo');assert.equal(s.real.book.orders.length,0);
 const material=state();material.real.stats.researched=3;const bad=candidate(material,'acquire','Falta consenso comparable y escenarios calibrados');bad.analysisAssessment.missingEvidence=[request,'Información financiera posterior a la adquisición que permita evaluar deuda consolidada y caja.'];refreshLaunch(material,now);assert.equal(bad.launchReevaluation,undefined);
});

test('Hard outcomes free the two economic slots immediately, with four lifetime unique attempts and no repeat model work',()=>{
 const s=state();s.real.stats.researched=5;const first=candidate(s,'first'),second=candidate(s,'second');refreshLaunch(s,now);const pilotId=s.company.launch.pilotId;
 for(const e of [first,second]){e.status='verificar';e.analysisBlocked={reason:'La caída de 88,7% no está corroborada ni explicada',missingEvidence:['Serie histórica independiente de precios y registro de acciones corporativas'],fingerprint:analysisEvidenceFingerprint(s,e)};e.reasons=[e.analysisBlocked.reason];}
 const apog=candidate(s,'apog','El calendario no demuestra ventaja; la reacción no está calibrada'),ango=candidate(s,'ango','Faltan expectativas verificadas y ventaja demostrable'),odc=candidate(s,'odc','Falta consenso comparable');apog.preScore.score=55;odc.preScore.score=54;ango.preScore.score=50;
 const budget=JSON.stringify(s.operating),before=JSON.stringify(s.real.book);const result=refreshLaunch(s,now+1000);
 assert.equal(result.pilotId,pilotId);assert.equal(result.reevaluatedIds.length,4);assert.equal(result.reevaluationCapacity.hardBlocked,2);assert.equal(apog.status,'nuevo');assert.equal(odc.status,'nuevo');assert.equal(ango.status,'descartado');assert.equal(first.launchHistory.length,1);assert.equal(second.launchHistory.length,1);assert.equal(s.company.versions.length,1);
 for(const e of [apog,odc]){e.status='verificar';e.analysisBlocked={reason:'Headroom pendiente',missingEvidence:['Covenants pendientes'],fingerprint:analysisEvidenceFingerprint(s,e)};e.reasons=['Covenants pendientes'];}
 refreshLaunch(s,now+DAY);assert.equal(result.reevaluatedIds.length,4);assert.equal(ango.status,'descartado');assert.equal(JSON.stringify(s.operating),budget);assert.equal(JSON.stringify(s.real.book),before);
});

test('Blocked evidence, unanswered followups and future retries do not masquerade as useful planning priority',()=>{
 const s=state();s.real.stats.researched=3;const blocked=candidate(s,'blocked'),followup=candidate(s,'followup');refreshLaunch(s,now);
 blocked.status='verificar';blocked.analysisBlocked={reason:'No se repite evaluación hasta nueva evidencia',missingEvidence:['Calibración'],fingerprint:analysisEvidenceFingerprint(s,blocked)};
 followup.status='verificar';followup.analysisFollowup={baselineResearchAt:followup.research.researchedAt,missingEvidence:['Consenso'],nextTask:'Contrastar el siguiente informe'};
 const retry=candidate(s,'retry');retry.status='nuevo';retry.research.worthAnalyzing=true;retry.retryAfter=now+DAY;
 assert.equal(selectPlanningCandidates(s,now+1000).length,0);const result=refreshLaunch(s,now+1000);assert.equal(result.ready,0);assert.equal(result.priorityUseful,false);
 delete retry.retryAfter;assert.equal(refreshLaunch(s,now+2000).priorityUseful,true);
});