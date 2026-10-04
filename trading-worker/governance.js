import {day,equity} from './core.js';
export const objectives={scout:['Encontrar señales contrastables sin búsquedas aleatorias','Curioso, entusiasta y escéptico; humor rápido, contrasta antes de celebrar'],analyst:['Aceptar solo tesis con ventaja y escenarios justificables','Paciente y exigente; humor seco, pide escenarios y cifras'],risk:['Proteger el capital y cuestionar supuestos','Prudente e independiente; ironía amable, pregunta qué puede fallar'],operator:['Ejecutar el plan ficticio con datos válidos','Disciplinada y práctica; humor tranquilo, no confunde prisa con ejecución'],auditor:['Mejorar el resultado descontando IA, sin sobreajustar','Crítico y metódico; segundo al mando, calma al equipo sin apagar ideas'],designer:['Hacer visible la evidencia, costes y cambios solo en Agent Office','Claro y creativo; bromas sobre píxeles y bugs, convierte decisiones en herramientas']};
export function initialiseGovernance(s){s.real.stats??={startedAt:Date.now(),researched:s.real.events.filter(e=>e.research).length,rejected:s.real.events.filter(e=>e.research&&e.status==='descartado').length};s.policy??={version:1,minScore:45,researchIntervalMinutes:30,researchDailyLimit:12};s.governance??={reviews:[],changes:[],messages:[],lastDay:null};for(const a of s.agents){[a.objective,a.personality]=objectives[a.id]||['Esperar tareas',''];}return s;}
export function message(s,from,to,text,now=Date.now()){s.governance.messages.unshift({id:crypto.randomUUID(),from,to,text:String(text).slice(0,1000),time:now});s.governance.messages=s.governance.messages.slice(0,80);const actor=s.company?.agency?.actors?.[to];if(actor&&!actor.inbox.some(m=>m.from===from&&m.time===now)){actor.inbox.push({id:crypto.randomUUID(),from,to,time:now,task:String(text).slice(0,700),evidenceIds:[],eventId:'',status:'pendiente'});actor.inbox=actor.inbox.slice(-12);actor.nextWake=Math.min(actor.nextWake,now);}}
const finiteNonnegative=x=>Number.isFinite(x)&&x>=0;
const dataGap=/faltan? (?:datos|evidencia|expectativas|consenso)|faltan? .*?(?:datos|evidencia)|evidencia insuficiente|insuficiencia de evidencia|datos .*?(?:mixtos|fechas distintas)|necesita verific|exige verific|sin (?:datos|evidencia|consenso)|cotizaci[oó]n .*?(?:ausente|caducad|pendiente)|bloqueado por datos/i;
const economicGap=/fcf negativo|sin (?:ventaja|margen)|liquidez.*(?:inferior|insuficiente)|riesgo.*(?:desproporcion|excesivo)|(?:no|ni) ofrece.*riesgo.recompensa|beneficio.riesgo insuficiente|valoraci[oó]n.*(?:elevada|excesiva)|diluci[oó]n|apalancamiento.*(?:alto|elevado)|lote excede el riesgo/i;
const reasonOf=e=>[e.plan?e.plan.reason:e.analysisAssessment?.reason,e.review?.reason,...(e.reasons||[])].filter(x=>typeof x==='string'&&x.trim()).join(' ').slice(0,1200);
function decisionClass(e){
 const reason=reasonOf(e),terminal=e.status==='descartado',hasPlan=!!e.plan&&e.plan.approve!==false,typedData=!hasPlan&&e.analysisAssessment?.decision==='needs_evidence'||e.review?.decision==='needs_evidence';
 const followup=!!e.analysisFollowup&&(e.research?.researchedAt||0)<=(e.analysisFollowup.baselineResearchAt||0);
 const missing=typedData||!hasPlan&&(!!e.analysisBlocked||followup||!!e.research?.missingEvidence?.length)||dataGap.test(reason);
 const economic=terminal&&(economicGap.test(reason)||!missing&&(e.analysisAssessment?.decision==='reject'||e.review?.decision==='reject'));
 if(terminal&&missing)return {category:economic?'mixed':'data_discard',reason};
 if(!terminal&&missing&&!['abierto','caducado'].includes(e.status))return {category:'data_block',reason};
 if(economic)return {category:'economic',reason};
 if(terminal)return {category:'unclassified',reason};
 return {category:'none',reason};
}
function outcomeGroups(closed,field){
 const groups=new Map();for(const t of closed){const value=t[field],key=(typeof value==='string'&&value.trim()||Number.isFinite(value)?String(value):'unknown').slice(0,100);let g=groups.get(key);if(!g){g={key,closed:0,knownPnl:0,unknownPnl:0,realizedPnl:0,wins:0,losses:0,flat:0};groups.set(key,g);}g.closed++;if(Number.isFinite(t.pnl)){g.knownPnl++;g.realizedPnl+=t.pnl;if(t.pnl>0)g.wins++;else if(t.pnl<0)g.losses++;else g.flat++;}else g.unknownPnl++;}
 return [...groups.values()].sort((a,b)=>b.closed-a.closed||a.key.localeCompare(b.key)).slice(0,10).map(g=>({...g,realizedPnl:g.knownPnl?g.realizedPnl:null,winRate:g.knownPnl?g.wins/g.knownPnl:null,sample:g.knownPnl<20?'insufficient_for_profitability_claim':'descriptive_only'}));
}
// Pure snapshot: actual orders, captured trade provenance and stored answers, never a new ledger.
export function learningDigest(s,usage={confirmed:0,reserved:0},now=Date.now()){
 const events=s.real?.events||[],book=s.real?.book||{},closed=book.closed||[],orders=book.orders||[],buyOrders=orders.filter(o=>o.side==='buy');
 const classes=events.map(e=>({event:e,...decisionClass(e)})),count=category=>classes.filter(x=>x.category===category).length;
 const frequentReasons=classes.filter(x=>x.category!=='none'&&x.reason).reduce((groups,x)=>{const reason=x.reason.replace(/\s+/g,' ').trim().slice(0,180),key=x.category+'|'+reason;const item=groups.get(key)||{category:x.category,reason,count:0};item.count++;groups.set(key,item);return groups;},new Map());
 const blockers={dataBlocked:count('data_block'),dataGapDiscards:count('data_discard'),mixedRejections:count('mixed'),economicRejections:count('economic'),unclassifiedRejections:count('unclassified'),researchUnconfirmed:events.filter(e=>e.research&&!e.confirmed).length,frequentReasons:[...frequentReasons.values()].sort((a,b)=>b.count-a.count||a.reason.localeCompare(b.reason)).slice(0,6)};
 const boughtEventIds=new Set(buyOrders.map(o=>o.eventId)),funnel={observedEvents:events.length,signalBacked:events.filter(e=>e.signal||e.source||e.sources?.length).length,prequalified:events.filter(e=>e.preScore?.eligible).length,researchCompleted:events.filter(e=>e.research).length,catalystsConfirmed:events.filter(e=>e.confirmed).length,analysisReviewed:events.filter(e=>e.analysisAssessment||e.plan||e.previousPlan||e.review||boughtEventIds.has(e.id)).length,thesesPrepared:events.filter(e=>e.plan||e.previousPlan||boughtEventIds.has(e.id)).length,riskReviewed:events.filter(e=>e.review||e.previousReview||boughtEventIds.has(e.id)).length,riskApproved:events.filter(e=>e.review?.approve===true||e.previousReview?.approve===true||boughtEventIds.has(e.id)).length,buyOrders:buyOrders.length,closedPositions:closed.length,activePositions:book.positions?.length||0,cumulativeResearchDecisions:finiteNonnegative(s.real?.stats?.researched)?s.real.stats.researched:null,cumulativeDiscardDecisions:finiteNonnegative(s.real?.stats?.rejected)?s.real.stats.rejected:null};
 const stages=new Map(),seen=new Set();
 for(const e of events)for(const [stage,answer] of [['research',e.research],['analysis',e.analysisAssessment],['analysis',e.plan],['analysis',e.previousPlan],['risk',e.review],['risk',e.previousReview],['preparation',e.preliminary],['preparation',e.preRisk]]){
  if(!answer)continue;const cost=answer.costEur??answer._costEur,key=JSON.stringify([e.id,stage,answer.researchedAt??answer.preparedAt??answer.at??null,cost??null,answer.reason,answer.thesis,answer.summary]);if(seen.has(key))continue;seen.add(key);
  const g=stages.get(stage)||{stage,knownRecords:0,unknownRecords:0,knownCostEur:0};if(finiteNonnegative(cost)){g.knownRecords++;g.knownCostEur+=cost;}else g.unknownRecords++;stages.set(stage,g);
 }
 const byStage=[...stages.values()],rate=book.fx?.rate,fxKnown=Number.isFinite(rate)&&rate>0,confirmedUsd=finiteNonnegative(usage.confirmed)?usage.confirmed:null,reservedUsd=finiteNonnegative(usage.reserved)?usage.reserved:null;
 const daySpentEur=finiteNonnegative(s.operating?.daySpentEur)?s.operating.daySpentEur:null,paceEurPerDay=finiteNonnegative(s.operating?.paceEurPerDay)?s.operating.paceEurPerDay:null;
 const costs={global:{confirmedUsd,reservedUsd,estimatedConfirmedEur:confirmedUsd!==null&&fxKnown?confirmedUsd/rate:null,estimatedReservedEur:reservedUsd!==null&&fxKnown?reservedUsd/rate:null,eurConversion:fxKnown?'current_reference_fx':'unknown_fx'},storedWork:{knownRecords:byStage.reduce((n,g)=>n+g.knownRecords,0),unknownRecords:byStage.reduce((n,g)=>n+g.unknownRecords,0),knownCostEur:byStage.reduce((n,g)=>n+g.knownCostEur,0),byStage,scope:'Partial retained answers; excludes uncaptured/replaced work, failures, meetings and development. Not total office cost or cost per strategy.'},pacing:{daySpentEur,paceEurPerDay,overspendEur:daySpentEur!==null&&paceEurPerDay!==null?Math.max(0,daySpentEur-paceEurPerDay):null},monthlyAllowanceEur:10};
 const known=closed.filter(t=>Number.isFinite(t.pnl)),outcomes={closed:closed.length,knownPnl:known.length,unknownPnl:closed.length-known.length,realizedPnl:known.length?known.reduce((n,t)=>n+t.pnl,0):null,sample:known.length===0?'no_closed_results':known.length<20?'insufficient_for_profitability_claim':'descriptive_only',byCatalyst:outcomeGroups(closed,'catalystKind'),byStrategy:outcomeGroups(closed,'strategyVersion'),byAdaptation:outcomeGroups(closed,'adaptationId'),attribution:'Only provenance captured on a trade is grouped; historical missing fields stay unknown. Groups do not demonstrate causality.'};
 const experiments=[];
 if(blockers.dataBlocked+blockers.dataGapDiscards+blockers.mixedRejections)experiments.push({id:'resolve-evidence',owner:'scout',hypothesis:'Resolver preguntas financieras concretas puede mejorar el paso de investigación a tesis sin endurecer filtros por datos ausentes.',measure:'Preguntas resueltas, tesis evaluadas y coste por respuesta útil',basis:blockers.dataBlocked+blockers.dataGapDiscards+blockers.mixedRejections});
 if(blockers.economicRejections>=3)experiments.push({id:'alternate-catalysts',owner:'analyst',hypothesis:'Comparar otro tipo de catalizador o sector puede encontrar una ventaja donde las tesis actuales no la ofrecen.',measure:'Tesis completas y aprobaciones de riesgo por coste; después resultados de cierres',basis:blockers.economicRejections});
 if(classes.some(x=>x.event.status==='descartado'&&/lote excede el riesgo|riesgo por posici[oó]n/i.test(x.reason)))experiments.push({id:'sizing-pilot',owner:'risk',hypothesis:'Contrastar tamaño y límite de riesgo en un piloto ficticio acotado, con objeciones explícitas, puede resolver un bloqueo de ejecución.',measure:'Pérdida máxima prevista, límites del piloto y resultados observados',basis:'Bloqueo de tamaño documentado; no autoriza por sí mismo elevar el riesgo'});
 if(!buyOrders.length&&funnel.researchCompleted>=3)experiments.push({id:'funnel-pilot',owner:'auditor',hypothesis:'Probar una modificación concreta del embudo permite aprender antes de tener cierres; falta de operaciones no demuestra pérdidas ni rentabilidad.',measure:'Una hipótesis, plazo, gasto, conversión por etapa y criterios de reversión',basis:funnel.researchCompleted});
 return {at:now,funnel,blockers,costs,outcomes,experiments,limitations:'Embudo de eventos retenidos; decisiones acumuladas pueden contar varias investigaciones de una empresa. Datos ausentes no equivalen a cero ni a rechazo económico. Costes reales y P/L ficticio se mantienen separados. Las muestras pequeñas permiten hipótesis y pilotos, no afirmaciones de rentabilidad ni causalidad.'};
}
export function metrics(s,usage={confirmed:0,reserved:0},now=Date.now()){
 const b=s.real.book,closed=b.closed,wins=closed.filter(t=>t.pnl>0),losses=closed.filter(t=>t.pnl<0),profit=wins.reduce((n,t)=>n+t.pnl,0),loss=-losses.reduce((n,t)=>n+t.pnl,0),gross=equity(b)-b.initial;
 const rate=b.fx?.rate,aiEur=rate>0?(usage.confirmed||0)/rate:null,reservedEur=rate>0?(usage.reserved||0)/rate:null;
 const researched=s.real.stats?.researched??s.real.events.filter(e=>e.research).length,rejected=s.real.stats?.rejected??s.real.events.filter(e=>e.status==='descartado'&&e.research).length;
 return {at:now,grossPnl:gross,closedPnl:profit-loss,closed:closed.length,winRate:closed.length?wins.length/closed.length:null,profitFactor:loss>0?profit/loss:null,maxDrawdown:b.maxDrawdown||0,aiUsd:usage.confirmed||0,aiEur,reservedEur,netAfterAi:aiEur===null?null:gross-aiEur,efficiencyEquivalent:gross/1000,efficiencyNet:aiEur===null?null:gross/1000-aiEur,scale:1000,statsSince:s.real.stats?.startedAt||null,researched,rejected,conversion:researched?(researched-rejected)/researched:null,qualified:s.real.events.filter(e=>e.preScore?.eligible).length,learning:learningDigest(s,usage,now),limitations:'P/L ficticio; IA real. EUR de IA aproximado con cambio BCE actual. Equivalencia 1.000 € ficticios = 1 €; Investigaciones acumuladas desde activación del radar; alojamiento/datos y ajustes corporativos no incluidos.'};
}
export function chooseChange(s,k){
 if(s.governance.changes.some(c=>c.status==='aplicado'&&Date.now()-c.time<7*864e5))return {action:'hold',reason:'Periodo de observación de siete días'};
 if(k.closed>=10&&k.closedPnl<0&&k.winRate<.4&&s.config.riskPct>.1)return {action:'reduceRisk',reason:'Diez o más cierres, pérdida acumulada y menos del 40% de aciertos'};
 // Missing facts and spending before the first trade are not evidence that a strategy loses.
 // A sustained budget overrun may slow research; economic filters are changed by explicit pilots.
 const daily=[{day:day(k.at??Date.now()),pacing:k.learning?.costs?.pacing},...(s.governance.reviews||[]).map(r=>({day:r.day,pacing:r.kpis?.learning?.costs?.pacing}))],seen=new Set(),last=[];
 for(const row of daily){if(seen.has(row.day))continue;seen.add(row.day);last.push(row);if(last.length===3)break;}
 if(last.length===3&&last.every(r=>r.pacing?.paceEurPerDay>0&&r.pacing.daySpentEur>r.pacing.paceEurPerDay*1.25)&&s.policy.researchDailyLimit>6)return {action:'throttle',reason:'Tres revisiones diarias con gasto superior al 125% de la pauta mensual; moderar gasto, sin endurecer filtros'};
 if(k.learning?.blockers?.dataBlocked||k.learning?.blockers?.dataGapDiscards)return {action:'hold',reason:'Resolver carencias de datos y contrastar pilotos; los datos ausentes no prueban una mala estrategia'};
 return {action:'hold',reason:'Aprender del embudo y proponer pilotos concretos; sin evidencia para ajustar riesgo automáticamente'};
}
export function applyChange(s,decision,k,now=Date.now()){
 if(!['hold','reduceRisk','tighten','throttle'].includes(decision.action))throw Error('Cambio no permitido');
 if(decision.action==='hold')return null;
 const allowed=chooseChange(s,k);if(allowed.action!==decision.action)throw Error('El cambio no cumple la evidencia requerida');
 const before={policy:{...s.policy},riskPct:s.config.riskPct};
 if(decision.action==='reduceRisk')s.config.riskPct=Math.max(.1,Number((s.config.riskPct-.05).toFixed(2)));
 if(decision.action==='tighten')s.policy.minScore=Math.min(70,s.policy.minScore+5);
 if(decision.action==='throttle'){s.policy.researchDailyLimit=6;s.policy.researchIntervalMinutes=60;}
 if(s.company?.strategy)Object.assign(s.company.strategy,{minScore:s.policy.minScore,riskPct:s.config.riskPct,researchDailyLimit:s.policy.researchDailyLimit,researchIntervalMinutes:s.policy.researchIntervalMinutes});
 s.policy.version++;const change={id:crypto.randomUUID(),time:now,action:decision.action,reason:decision.reason,before,after:{policy:{...s.policy},riskPct:s.config.riskPct},baseline:k,status:'aplicado',scope:'trading-rules'};s.governance.changes.unshift(change);s.governance.changes=s.governance.changes.slice(0,40);return change;
}
export function rollback(s,k,now=Date.now()){
 const c=s.governance.changes.find(c=>c.status==='aplicado');if(!c||k.closed-c.baseline.closed<10||k.grossPnl-c.baseline.grossPnl>-s.real.book.initial*.02)return null;
 // Rollback only fields still owned by the change; preserve intervening owner settings.
 for(const key of ['minScore','researchDailyLimit','researchIntervalMinutes'])if(s.policy[key]===c.after.policy[key])s.policy[key]=c.before.policy[key];
 if(s.config.riskPct===c.after.riskPct)s.config.riskPct=c.before.riskPct;if(s.company?.strategy)Object.assign(s.company.strategy,{minScore:s.policy.minScore,riskPct:s.config.riskPct,researchDailyLimit:s.policy.researchDailyLimit,researchIntervalMinutes:s.policy.researchIntervalMinutes});s.policy.version++;c.status='revertido';c.rollbackAt=now;c.rollbackReason='Diez cierres nuevos y deterioro de P/L superior al 2% del capital inicial; no implica causalidad';return c;
}
export function visualManifest(k,review,version=1,now=Date.now()){
 const focus=k.maxDrawdown>=2?'risk':k.efficiencyNet<0?'economics':'pipeline';
 return {scope:'agent-office',version,updatedAt:now,focus,panels:['efficiency','radar','rules','communications'],summary:String(review?.summary||'KPIs sincronizados con datos reales; sin operaciones inventadas').slice(0,500),checks:['scope','allowlist','finite-data'],theme:focus==='risk'?'amber':focus==='economics'?'violet':'mint'};
}
export function validManifest(v){return v?.scope==='agent-office'&&['risk','economics','pipeline'].includes(v.focus)&&['amber','violet','mint'].includes(v.theme)&&Array.isArray(v.panels)&&v.panels.every(p=>['efficiency','radar','rules','communications'].includes(p))&&typeof v.summary==='string'&&v.summary.length<=500;}
export function dailyReview(s,k,now=Date.now()){
 initialiseGovernance(s);const today=day(now);if(s.governance.lastDay===today)return null;
 const reverted=rollback(s,k,now),decision=reverted?{action:'hold',reason:'Regla revertida; observar resultados'}:chooseChange(s,k),change=applyChange(s,decision,k,now);
 const review={time:now,day:today,kpis:k,decision,summary:change?'Cambio automático: '+decision.reason:decision.reason};s.governance.reviews.unshift(review);s.governance.reviews=s.governance.reviews.slice(0,60);s.governance.lastDay=today;
 message(s,'auditor','scout',review.summary,now);message(s,'auditor','risk','Riesgo por posición: '+s.config.riskPct+'%. Revisa hechos y mantén límites.',now);message(s,'auditor','designer','Refleja KPIs, evidencia y versión '+s.policy.version+' exclusivamente en Agent Office.',now);return review;
}
