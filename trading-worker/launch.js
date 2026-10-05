import {installProgram} from './company.js';
import {catalystReady,workflowSettings,analysisFollowupPending,selectPlanningCandidates} from './strategy.js';
import {eligible} from './core.js';

const DAY=864e5;
const referenceSource='Yahoo Finance · referencia pública';
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const text=x=>String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const soft=/consenso|consensus|calibr|ventaja.{0,30}(?:demostr|confirm|cuantific)|(?:demostr|confirm).{0,30}ventaja|escenarios?|sinergias?|synerg|expectativas|expectations|impacto.{0,40}(?:cuantific|materialidad)|(?:cuantific|materialidad).{0,40}impacto|datos.{0,25}(?:mixtos|fechas distintas)|referencia.{0,25}(?:historica|cierre)/;
const hard=[
 /insolvenc|bankrupt|chapter\s*11|quiebra|going concern|riesgo de continuidad/,
 /(?:deuda|financiacion|funding|vencimientos?|covenants|caja).{0,80}(?:desconocid|inciert|sin verificar|no verificada|sin confirmar|no confirmada|sin datos|pendiente|faltan|no consta|no reconciliad)/,
 /(?:falta|faltan|desconocid|no consta|sin datos|sin evidencia|no se conoce).{0,80}(?:deuda|financiacion|funding|vencimientos?|covenants|caja)/,
 /deuda.{0,30}(?:critica|post.?transaccion|post.?adquisicion|impago)|financiacion.{0,30}(?:critica|necesaria)|debt.{0,40}(?:unknown|uncertain|unverified|critical|maturity|covenant)|funding gap/,
 /dilucion|dilution|emision.{0,25}(?:incierta|pendiente)|split|ajuste.{0,30}corporativo|corporate action|precio.{0,30}(?:anomal|inconsisten|errone|no reconcili)|serie.{0,30}(?:inconsisten|sin reconciliar)|price.{0,25}(?:anomal|inconsisten)/,
 /identidad.{0,40}(?:ausente|desconoc|pendiente|no verificada)|fuente.{0,40}(?:ausente|no verificada|sin confirmar)|liquidez.{0,35}(?:insuficiente|inferior)|patrimonio.{0,30}(?:negativo|no positivo)/
];
function pendingEvidenceLines(e){
 const lines=[...(e.analysisAssessment?.missingEvidence||[]),...(e.review?.missingEvidence||[]),...(e.analysisBlocked?.missingEvidence||[]),...(e.research?.missingEvidence||[]),...(e.research?.supplement?.missingEvidence||[])];
 if(analysisFollowupPending(e))lines.push(...(e.analysisFollowup?.missingEvidence||[]));
 return [...new Set(lines.filter(x=>typeof x==='string'&&x.trim()).map(x=>x.trim()))];
}
function answerLines(e){
 const lines=[...(e.reasons||[]),e.analysisAssessment?.reason,e.review?.reason,e.analysisBlocked?.reason,...pendingEvidenceLines(e)];
 if(analysisFollowupPending(e))lines.push(e.analysisFollowup?.reason,e.analysisFollowup?.nextTask);
 return [...new Set(lines.filter(x=>typeof x==='string'&&x.trim()).map(x=>x.trim()))];
}
function unresolvedHard(line,pending=false){
 const clean=text(line)
  .replace(/(?:deuda|caja|financiacion|dilucion|split|ajuste corporativo|accion corporativa|headroom|covenants)\s+(?:ya\s+)?(?:verificad[oa]s?|contrastad[oa]s?|confirmad[oa]s?|conocid[oa]s?|reconciliad[oa]s?)/g,'hecho confirmado')
  .replace(/(?:sin|ausencia de|no hay)\s+dilucion(?:\s+(?:relevante|significativa))?(?=\s*[,.;]|\s*$)/g,'hecho confirmado');
 const missingFacts=/serie\s+(?:historica\s+)?independiente(?:\s+de\s+precios)?|registro.{0,35}acciones corporativas|\bcovenants\b|\bheadroom\b|terminos.{0,25}deuda|acuerdo.{0,25}prestamo|contrato.{0,25}abl/;
 const priceGap=/(?:caida|desplome|serie|precio).{0,130}(?:no (?:esta |estan )?(?:corroborad|explicad)|sin (?:corroborar|explicar)|no explica|anomal|no resuelt)/;
 const debtGap=/(?:covenants|headroom|terminos(?: completos)?).{0,100}(?:pendiente|no (?:estan |han sido )?(?:cotejad|verificad)|sin (?:cotejar|verificar))|(?:informacion|estados|situacion|deuda|financiacion).{0,100}(?:posterior|despues).{0,60}(?:adquisicion|compra|integracion)/;
 return hard.some(pattern=>pattern.test(clean))||priceGap.test(clean)||debtGap.test(clean)||pending&&missingFacts.test(clean);
}
function balanceRefreshRequest(s,e,line,now){
 const m=s.real.profiles?.[e.symbol]?.fundamentals?.metrics;
 const fresh=m&&[[m.cashLatest,m.cashDate],[m.equityLatest,m.equityDate]].every(([value,date])=>finite(value)&&value>0&&finite(Date.parse(date))&&Date.parse(date)<=now&&now-Date.parse(date)<=180*DAY);
 const wording=text(line),material=answerLines(e).some(x=>/(?:adquisicion|post.?adquisicion|compra|integracion).{0,100}(?:deuda|financia|caja|consolidada)|(?:deuda|financia|caja|consolidada).{0,100}(?:adquisicion|post.?adquisicion|compra|integracion)/.test(text(x)));
 return !!fresh&&!material&&/(?:caja|efectivo|cash|deuda|balance)/.test(wording)&&/posterior(?:es)?\s+al?\s+\d/.test(wording)&&!/covenants|headroom|impago|critica|insolvenc/.test(wording);
}
function evidenceState(s,e,now){
 const essential=[],lines=answerLines(e),asset=(s.real.assets||[]).find(a=>a.symbol===e.symbol),profile=s.real.profiles?.[e.symbol],m=profile?.fundamentals?.metrics,q=s.real.quotes?.[e.symbol];
 if(e.synthetic===true||!e.confirmed||!catalystReady(e,now))essential.push('Catalizador primario y fecha válidos pendientes');
 if(!asset||eligible(asset,s.config)||asset.dataVerified!==true)essential.push('Identidad de una acción pequeña elegible pendiente');
 if(!m||!m.annualEnd)essential.push('Ficha financiera fechada pendiente');
 if(m){
  for(const [value,date,label] of [[m.cashLatest,m.cashDate,'caja'],[m.equityLatest,m.equityDate,'patrimonio']]){
   const at=Date.parse(date);if(!finite(value)||!finite(at)||at>now||now-at>180*DAY)essential.push('Dato reciente de '+label+' pendiente');
   else if(value<=0)essential.push(label+' reciente no positivo');
  }
  if(finite(m.shareGrowth)&&m.shareGrowth>.3)essential.push('Dilución anual superior al 30% documentada');
 }
 const priced=q?.referenceOnly===true&&q.source===referenceSource&&q.currency==='USD'&&finite(q.price)&&q.price>0&&finite(q.time)&&q.time<=now+5000&&now-q.time<=7*DAY&&finite(q.fetchedAt)&&q.fetchedAt<=now+5000&&now-q.fetchedAt<=7*DAY;
 if(!priced)essential.push('Referencia pública válida y fechada pendiente para preparar');
 const volume=q?.dollarVolume??profile?.market?.averageDollarVolume;if(!finite(volume)||volume<s.config.minDollarVolume)essential.push('Liquidez verificable suficiente pendiente');
 if(profile?.market?.seriesDiagnostic?.adjustments?.complete===false)essential.push('Serie sin ajustes completos; reconciliar acciones corporativas antes de experimentar');
 const pending=new Set(pendingEvidenceLines(e));
 for(const line of lines)if(!balanceRefreshRequest(s,e,line,now)&&unresolvedHard(line,pending.has(line)))essential.push(line);
 return {essential:[...new Set(essential)].slice(0,12),uncertain:lines.filter(line=>balanceRefreshRequest(s,e,line,now)||soft.test(text(line))&&!unresolvedHard(line,pending.has(line))).slice(0,8),lines};
}
const readyEvents=(s,now)=>selectPlanningCandidates(s,now).filter(e=>e.plan?.expiresAt>now&&e.review?.approve===true&&evidenceState(s,e,now).essential.length===0);
function archiveSoftResearch(s,e,now){
 const archived=[];
 for(const w of s.company.agency?.workQueue||[]){
  if(w.eventId!==e.id||w.kind!=='research'||!['pending','running','blocked'].includes(w.status))continue;
  const wording=[w.task,w.reason].filter(Boolean).join(' ');
  if(!balanceRefreshRequest(s,e,wording,now)&&(!soft.test(text(wording))||unresolvedHard(wording,true)))continue;
  w.status='archived';w.finishedAt=now;w.launchArchived=true;w.result='Consulta blanda archivada para reevaluación experimental; no se afirma resuelta';archived.push(w.id);
 }
 return archived;
}
function reopen(s,e,pilot,now,missing){
 e.launchHistory??=[];
 e.launchHistory.push({at:now,pilotId:pilot.id,reason:'Reevaluación experimental de incertidumbre blanda; no es aprobación',status:e.status,reasons:structuredClone(e.reasons||[]),assessment:structuredClone(e.analysisAssessment||null),plan:structuredClone(e.plan||null),review:structuredClone(e.review||null),block:structuredClone(e.analysisBlocked||null),followup:structuredClone(e.analysisFollowup||null),uncertain:missing.uncertain,archivedWorkIds:archiveSoftResearch(s,e,now)});
 e.launchHistory=e.launchHistory.slice(-8);
 delete e.analysisAssessment;delete e.plan;delete e.review;delete e.analysisBlocked;delete e.analysisFollowup;
 e.launchReevaluation={pilotId:pilot.id,at:now};e.status='nuevo';e.reasons=['Reevaluación de arranque bajo hipótesis experimental; aún sin plan ni aprobación'];
 e.preScore={...(e.preScore||{}),adaptationId:pilot.id,programVersion:pilot.version,eligible:true,blocked:false};
 if(e.research)e.research.worthAnalyzing=true;
}
function defaultVisual(s){
 const current=s.company.ui;if(current&&['risk','economics','pipeline'].includes(current.focus)&&['amber','violet','mint'].includes(current.theme)&&['day','warm','night'].includes(current.lighting)&&typeof current.headline==='string'&&current.headline.length<=200&&Array.isArray(current.panels)&&current.panels.length>=2&&new Set(current.panels).size===current.panels.length&&current.panels.every(p=>['efficiency','radar','rules','communications','meetings','report'].includes(p)))return structuredClone(current);
 return {focus:'pipeline',theme:'mint',headline:'Primeros planes con datos reales',panels:['report','efficiency','radar'],lighting:'day'};
}
export function refreshLaunch(s,now=Date.now()){
 s.company??={};const company=s.company,launch=company.launch??={createdAt:now,target:2,reevaluatedIds:[]};
 launch.target=2;launch.buyCount=(s.real?.book?.orders||[]).filter(o=>o.side==='buy').length;launch.active=s.mode==='real'&&launch.buyCount<2;launch.ready=readyEvents(s,now).length;launch.updatedAt=now;launch.reevaluatedIds??=[];
 if(!launch.active){launch.phase='complete';launch.priorityUseful=false;return launch;}
 const events=s.real.events||[],researched=Math.max(finite(s.real.stats?.researched)?s.real.stats.researched:0,events.filter(e=>e.research).length);
 let pilot=(company.versions||[]).find(v=>v.id===company.shadowProgram&&v.adaptation?.phase==='pilot'&&v.adaptation.expiresAt>now);
 if(pilot){launch.pilotId=pilot.id;launch.pilotOrigin=pilot.initiativeId?'initiative':'existing';}
 if(!pilot&&!launch.pilotAttemptedAt&&researched>=3&&launch.ready===0&&launch.buyCount===0){
  launch.pilotAttemptedAt=now;const settings=workflowSettings(s),active=(company.versions||[]).find(v=>v.id===company.activeProgram);
  const program={scope:'agent-office',rationale:'Primeros planes experimentales: evaluar catalizadores primarios verificables sin exigir consenso ni ventaja ya demostrada; preservar alertas financieras, datos, presupuesto y límites. Revisar resultados reales con incertidumbre explícita.',threshold:35,rules:structuredClone(active?.program?.rules||[]),workflow:{researchDailyLimit:settings.researchDailyLimit,researchIntervalMinutes:settings.researchIntervalMinutes,riskPct:s.config.riskPct,minRR:1.3},visual:defaultVisual(s)};
  const version=installProgram(s,program,{id:'launch:initial-paper-plans'},now);launch.createdProgramId=version.id;
  if(version.adaptation?.phase==='pilot'){pilot=version;launch.pilotId=version.id;launch.pilotOrigin='launch';}else launch.reason=version.gate;
 }
 // Up to two economic cases at once. A hard-data failure frees its slot, but four unique attempts is the lifetime ceiling.
 const tried=new Set(launch.reevaluatedIds);
 for(const e of events)if(e.launchReevaluation)tried.add(e.id);
 launch.reevaluatedIds=[...tried];
 const hardFailures=events.filter(e=>tried.has(e.id)&&evidenceState(s,e,now).essential.length>0);
 const economicUsed=launch.reevaluatedIds.length-hardFailures.length;
 launch.reevaluationCapacity={maximum:4,total:launch.reevaluatedIds.length,economicUsed,hardBlocked:hardFailures.length};
 if(pilot&&launch.ready===0&&economicUsed<2&&launch.reevaluatedIds.length<4){
  const candidates=events.filter(e=>!e.plan&&!['abierto','caducado'].includes(e.status)&&!tried.has(e.id)&&!e.launchReevaluation&&['descartado','verificar','espera'].includes(e.status)&&e.preScore?.blocked!==true).map(e=>({e,missing:evidenceState(s,e,now)})).filter(x=>x.missing.essential.length===0&&x.missing.uncertain.length>0).sort((a,b)=>(b.e.preScore?.score||0)-(a.e.preScore?.score||0));
  const capacity=Math.min(2-economicUsed,4-launch.reevaluatedIds.length);
  for(const {e,missing} of candidates.slice(0,capacity)){reopen(s,e,pilot,now,missing);launch.reevaluatedIds.push(e.id);}
  launch.reevaluationCapacity={maximum:4,total:launch.reevaluatedIds.length,economicUsed:economicUsed+Math.min(capacity,candidates.length),hardBlocked:hardFailures.length};
 }
 launch.phase=launch.ready?'plans_ready':pilot?'experimental':'gathering_evidence';
 const useful=selectPlanningCandidates(s,now).some(e=>evidenceState(s,e,now).essential.length===0);
 launch.priorityUseful=launch.ready>0||useful&&s.operating?.exhausted!==true&&s.operating?.remainingEur>.01;
 return launch;
}
export function launchContext(s,event){
 const launch=s.company?.launch,pilot=(s.company?.versions||[]).find(v=>v.id===(event?.launchReevaluation?.pilotId||event?.plan?.adaptationId||event?.preScore?.adaptationId||launch?.pilotId)),a=pilot?.adaptation;
 const missing=event?evidenceState(s,event,Date.now()):{essential:[],uncertain:[]};
 return {goal:launch?.active===true?'Preparar y ejecutar las primeras dos compras ficticias solo con planes válidos y revisión independiente':a?.phase==='pilot'?'Evaluar el piloto con operaciones válidas, costes medidos y aprendizaje sin garantías':'Preparar operaciones ficticias válidas y aprender de resultados medidos',active:launch?.active===true,target:2,buyCount:launch?.buyCount||0,ready:launch?.ready||0,experimental:!!a&&['pilot','active'].includes(a.phase),hypothesis:pilot?{programId:pilot.id,threshold:pilot.program.threshold,rules:pilot.program.rules,rationale:pilot.program.rationale,effective:a?.effectiveSettings||null}:null,missing:{essential:missing.essential,uncertain:missing.uncertain},forecast:'Hipótesis exploratoria, no ventaja ni beneficio garantizados. La falta de consenso o de una probabilidad calibrada es incertidumbre; las carencias financieras, identidad, fuente primaria, ajustes corporativos, precio y límites siguen bloqueando.'};
}
