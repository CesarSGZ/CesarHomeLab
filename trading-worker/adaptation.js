// Measured policy experiments. This module reads paper outcomes; it never writes a ledger.
const DAY=864e5;
export const adaptationLimits=Object.freeze({monthlyBudgetEur:10,maxEntries:2,maxPositions:20,pilotPositions:2,pilotExposurePct:10,pilotRiskStepPct:.25,maxRiskPct:2,minRR:1,maxRR:8,maxPilotDays:21,minClosed:3,minDays:3,lossPct:1});
const finite=n=>typeof n==='number'&&Number.isFinite(n);
const validMonth=m=>typeof m==='string'&&/^\d{4}-(?:0[1-9]|1[0-2])$/.test(m);
const copy=o=>structuredClone(o);
const round=n=>Math.round(n*1e8)/1e8;
const markedValue=p=>finite(p.qty)&&p.qty>0&&finite(p.mark??p.entry)&&finite(p.markFx??p.entryFx??1)&&(p.markFx??p.entryFx??1)>0?p.qty*(p.mark??p.entry)/(p.markFx??p.entryFx??1):null;
const entryValue=p=>finite(p.qty)&&p.qty>0&&finite(p.entry)&&p.entry>0&&finite(p.entryFx??1)&&(p.entryFx??1)>0?p.qty*p.entry/(p.entryFx??1):null;
const bookEquity=b=>{if(!b||!finite(b.cash)||!Array.isArray(b.positions))return null;const marks=b.positions.map(markedValue);return marks.some(v=>v===null)?null:b.cash+marks.reduce((n,v)=>n+v,0);};
const settings=w=>{if(!w||!finite(w.riskPct)||w.riskPct<.1||w.riskPct>2||!finite(w.minRR)||w.minRR<1||w.minRR>8)throw Error('Parámetros económicos del experimento fuera de límites');return {riskPct:w.riskPct,minRR:w.minRR};};

export function createAdaptation(version,snapshot,now=Date.now()){
 if(!version||typeof version.id!=='string'||!version.id||!finite(now))throw Error('Identidad o fecha del experimento inválida');
 const requested=settings(version.program?.workflow),previous=settings(version.previous?.config),book=snapshot?.book,eq=bookEquity(book);
 if(!finite(book?.initial)||book.initial<=0||!finite(eq)||eq<=0||!Array.isArray(book.closed)||!Array.isArray(version.tests)||!version.tests.length)throw Error('El piloto requiere libro válido y pruebas previas registradas');
 const base={at:now,equity:eq,initial:book.initial,currency:book.currency||null,riskPct:previous.riskPct,minRR:previous.minRR,closed:book.closed.length,aiEur:finite(snapshot.aiEur)&&snapshot.aiEur>=0?snapshot.aiEur:null,aiMonth:snapshot.aiMonth==null?null:String(snapshot.aiMonth)};
 const effectiveSettings={riskPct:Math.min(requested.riskPct,adaptationLimits.maxRiskPct,round(base.riskPct+adaptationLimits.pilotRiskStepPct)),minRR:requested.minRR};
 const a={id:version.id,phase:'pilot',startedAt:now,expiresAt:now+adaptationLimits.maxPilotDays*DAY,base,requested,effectiveSettings,observations:[],history:[{at:now,phase:'pilot',reason:'Piloto limitado tras validaciones; rentabilidad todavía no demostrada'}]};
 a.metrics=adaptationMetrics(a,snapshot,now);return a;
}

export function recordAdaptationObservation(adaptation,observation){
 if(!adaptation||!['pilot','active'].includes(adaptation.phase))return copy(adaptation);
 if(!observation||typeof observation.eventId!=='string'||!observation.eventId||typeof observation.evidenceFingerprint!=='string'||!observation.evidenceFingerprint||!finite(observation.at)||observation.at<adaptation.startedAt||typeof observation.baselineEligible!=='boolean'||typeof observation.pilotEligible!=='boolean')throw Error('La observación requiere candidata, evidencia y decisiones reales fechadas');
 const key=JSON.stringify([observation.eventId,observation.evidenceFingerprint]);
 if(adaptation.observations.some(o=>o.id===key))return copy(adaptation);
 const row={id:key,eventId:observation.eventId,evidenceFingerprint:observation.evidenceFingerprint,at:observation.at,baselineEligible:observation.baselineEligible,pilotEligible:observation.pilotEligible,baselineScore:finite(observation.baselineScore)?observation.baselineScore:null,pilotScore:finite(observation.pilotScore)?observation.pilotScore:null};
 return {...copy(adaptation),observations:[...adaptation.observations,row].slice(-500)};
}

function outcomes(rows){
 const pnl=rows.reduce((n,t)=>n+t.pnl,0),invested=rows.reduce((n,t)=>n+entryValue(t),0);
 return {closed:rows.length,pnlNetCommissions:round(pnl),wins:rows.filter(t=>t.pnl>0).length,winRate:rows.length?rows.filter(t=>t.pnl>0).length/rows.length:null,returnOnInvestedPct:invested>0?round(pnl/invested*100):null};
}
export function adaptationMetrics(a,snapshot,now=Date.now()){
 const b=snapshot?.book||{},raw=Array.isArray(b.closed)?b.closed:[],seen=new Set(),rows=raw.filter(t=>{if(typeof t.id!=='string'||!t.id)return true;if(seen.has(t.id))return false;seen.add(t.id);return true;}),inPeriod=t=>finite(t.closedAt)&&t.closedAt>=a.startedAt&&t.closedAt<=now,valid=t=>typeof t.id==='string'&&!!t.id&&finite(t.pnl)&&entryValue(t)!==null;
 const pilotRows=rows.filter(t=>t.adaptationId===a.id&&inPeriod(t)),controlRows=rows.filter(t=>!t.adaptationId&&inPeriod(t)),pilot=outcomes(pilotRows.filter(valid)),control=outcomes(controlRows.filter(valid));
 const positions=(Array.isArray(b.positions)?b.positions:[]).filter(p=>p.adaptationId===a.id),values=positions.map(markedValue),entries=positions.map(entryValue),marksKnown=values.every(v=>v!==null)&&entries.every(v=>v!==null),eq=bookEquity(b),exposure=marksKnown?values.reduce((n,v)=>n+v,0):null;
 const unrealized=marksKnown?positions.reduce((n,p,i)=>n+values[i]-entries[i]-(finite(p.entryFee)?p.entryFee/(p.entryFx||1):0),0):null;
 const aiNow=snapshot?.aiEur,aiMonth=snapshot?.aiMonth??null,monthProvided=a.base.aiMonth!=null||aiMonth!=null,monthsComparable=!monthProvided||validMonth(a.base.aiMonth)&&validMonth(aiMonth)&&a.base.aiMonth===aiMonth,costsKnown=monthsComparable&&finite(a.base.aiEur)&&finite(aiNow)&&aiNow>=a.base.aiEur,aiPeriodEur=costsKnown?round(aiNow-a.base.aiEur):null;
 const observed=(a.observations||[]).filter(o=>o.at>=a.startedAt&&o.at<=now),limitations=['Muestra preliminar: no demuestra causalidad ni rentabilidad futura','Coste IA del periodo compartido con toda la oficina; no atribución exclusiva al piloto'];
 if(!control.closed)limitations.push('Sin cierres de control comparables: no hay estimación contrafactual');
 if(!costsKnown)limitations.push('Coste IA desconocido o contador no comparable; no activar');
 if(pilotRows.some(t=>!valid(t)))limitations.push('Hay cierres del piloto con datos incompletos');
 if(control.closed)limitations.push('Controles contemporáneos, no asignados aleatoriamente: comparación descriptiva');
 return {at:now,ageDays:Math.max(0,(now-a.startedAt)/DAY),observations:observed.length,changedDecisions:observed.filter(o=>o.baselineEligible!==o.pilotEligible).length,pilot,control,invalidPilotClosed:pilotRows.filter(t=>!valid(t)).length,pilotPositions:positions.length,pilotExposure:exposure,pilotExposurePct:finite(eq)&&eq>0&&exposure!==null?round(exposure/eq*100):null,unrealizedPnl:unrealized,pilotPnlIncludingOpen:unrealized===null?null:round(pilot.pnlNetCommissions+unrealized),costsKnown,aiPeriodEur,aiCostPeriod:{baseMonth:a.base.aiMonth??null,currentMonth:aiMonth,comparable:monthsComparable},rentEquivalentNetEur:b.currency==='EUR'&&costsKnown?round(pilot.pnlNetCommissions/1000-aiPeriodEur):null,currency:b.currency||null,limitations};
}

export function adaptationDecision(a,snapshot,now=Date.now()){
 const m=adaptationMetrics(a,snapshot,now),result=(phase,action,reason,missingEvidence=[])=>({phase,action,reason,missingEvidence,metrics:m});
 if(a.phase==='reverted')return result('reverted','hold','Experimento ya revertido');
 const invalidPolicy=!finite(a.effectiveSettings?.riskPct)||a.effectiveSettings.riskPct<.1||a.effectiveSettings.riskPct>2||!finite(a.effectiveSettings?.minRR)||a.effectiveSettings.minRR<1||a.effectiveSettings.minRR>8;
 if(invalidPolicy||snapshot?.validationFailures?.length)return result('reverted','rollback','Incumplimiento de validaciones del experimento');
 if(m.pilotPnlIncludingOpen!==null&&m.pilotPnlIncludingOpen<-a.base.initial*adaptationLimits.lossPct/100)return result('reverted','rollback','Pérdida del piloto superior al 1% del capital inicial; no implica causalidad');
 if(a.phase==='active')return result('active','hold','Estrategia activa con revisión de resultados y límites');
 // Passive appreciation can exceed the entry exposure cap. Block new capital at
 // the entry guard; do not treat a favorable marked move as a failed experiment.
 if(m.pilotPositions>adaptationLimits.pilotPositions)return result('reverted','rollback','Número de posiciones del piloto superior a su límite');
 const missing=[];
 if(m.pilot.closed<adaptationLimits.minClosed)missing.push('Tres cierres propios válidos');
 if(m.ageDays<adaptationLimits.minDays)missing.push('Tres días de observación');
 if(!m.costsKnown)missing.push('Coste IA real comparable');
 if(m.invalidPilotClosed)missing.push('Datos completos de todos los cierres propios');
 if(m.pilot.pnlNetCommissions<0)missing.push('Resultado cerrado no negativo después de comisiones');
 if(!missing.length)return result('active','activate','Activación preliminar tras tres cierres, tres días, costes conocidos y P/L no negativo; no demuestra ventaja causal');
 if(now>=a.expiresAt)return result('reverted','rollback','Piloto caducado a los 21 días sin evidencia suficiente',missing);
 return result('pilot','hold','Piloto limitado en marcha; conservar incertidumbre y revisar datos reales',missing);
}

export function reviewAdaptation(a,snapshot,now=Date.now()){
 const decision=adaptationDecision(a,snapshot,now),next={...copy(a),phase:decision.phase,metrics:decision.metrics,reviewedAt:now,reviewReason:decision.reason,missingEvidence:decision.missingEvidence};
 if(a.phase!==decision.phase){next.history=[...(a.history||[]),{at:now,phase:decision.phase,reason:decision.reason}];if(decision.phase==='active'){next.activatedAt=now;next.effectiveSettings={...a.effectiveSettings};}else next.revertedAt=now;}
 return next;
}

export function adaptationEntryGuard(a,{book,allocationEur},now=Date.now()){
 const reasons=[],eq=bookEquity(book),positions=Array.isArray(book?.positions)?book.positions:[],own=positions.filter(p=>p.adaptationId===a.id),ownValues=own.map(markedValue),settings=a.effectiveSettings;
 if(!['pilot','active'].includes(a.phase))reasons.push('Experimento inactivo');
 if(a.phase==='pilot'&&now>=a.expiresAt)reasons.push('Piloto caducado');
 if(book?.currency!=='EUR')reasons.push('Exposición EUR incompatible con la divisa del libro');
 if(!finite(allocationEur)||allocationEur<=0||!finite(eq)||eq<=0||ownValues.some(v=>v===null))reasons.push('Exposición candidata o cartera desconocida');
 if(!finite(settings?.riskPct)||settings.riskPct<.1||settings.riskPct>2||!finite(settings?.minRR)||settings.minRR<1||settings.minRR>8)reasons.push('Parámetros económicos inválidos');
 if(positions.length>=adaptationLimits.maxPositions)reasons.push('Límite global de veinte posiciones');
 if(!Number.isInteger(book?.entriesToday)||book.entriesToday<0||book.entriesToday>=adaptationLimits.maxEntries)reasons.push('Límite global de dos entradas por sesión o contador desconocido');
 const projectedExposurePct=finite(eq)&&eq>0&&finite(allocationEur)&&ownValues.every(v=>v!==null)?round((ownValues.reduce((n,v)=>n+v,0)+allocationEur)/eq*100):null;
 if(a.phase==='pilot'){
  if(settings?.riskPct>round(a.base.riskPct+adaptationLimits.pilotRiskStepPct))reasons.push('Aumento de riesgo del piloto superior a 0,25 puntos');
  if(own.length>=adaptationLimits.pilotPositions)reasons.push('Límite de dos posiciones simultáneas del piloto');
  if(projectedExposurePct!==null&&projectedExposurePct>adaptationLimits.pilotExposurePct+1e-8)reasons.push('Exposición del piloto superior al 10% del patrimonio');
 }
 return {ok:!reasons.length,reasons,effectiveSettings:copy(settings),pilotPositions:own.length,projectedExposurePct};
}
