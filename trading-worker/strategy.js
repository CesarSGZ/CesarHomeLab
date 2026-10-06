export function quoteContext(q){if(!q)return null;const iso=t=>{const d=new Date(t);return Number.isFinite(t)&&Number.isFinite(d.getTime())?d.toISOString():null;};return {...q,timeISO:iso(q.time),fetchedAtISO:iso(q.fetchedAt)};}
// Editable business policy. Accounting, prices and the monthly API allowance remain outside this module.
const hour=3600e3,day=24*hour;
const closedStatuses=new Set(['descartado','caducado','abierto']);
const workflowKeys=['minScore','researchDailyLimit','researchIntervalMinutes','minRR','riskPct','researchBatchSize','enrichmentLimit','focusSectors','catalystKinds','weekendPlanning'];
const defaultWorkflow={minScore:45,researchDailyLimit:12,researchIntervalMinutes:30,minRR:2,riskPct:.35,researchBatchSize:1,enrichmentLimit:4,focusSectors:[],catalystKinds:[],weekendPlanning:true};
const finite=x=>Number.isFinite(x);
const timestamp=x=>typeof x==='number'?x:Date.parse(x);
const primarySource=e=>e.sources?.some(source=>{try{const u=new URL(typeof source==='string'?source:source.url);return u.protocol==='https:'&&!u.username&&!u.password;}catch{return false;}});
const newYorkDay=t=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(t));

export function requiresDeepAnalysis(event){
 // Regulatory boilerplate in an ordinary company's report is not a clinical catalyst.
 return /\b(?:fda|pdufa)\b|clinical|oncolog|biotech|ensayos?\s+cl[ií]nicos?/i.test([event.kind,event.title,event.summary].filter(Boolean).join(' '));
}

export function nextDeepAnalysisAt(now=Date.now()){
 const nextDay=new Date(Date.parse(newYorkDay(now)+'T12:00:00Z')+day).toISOString().slice(0,10),target=Date.parse(nextDay+'T00:00:00Z');let guess=target+5*hour;
 const clock=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
 for(let i=0;i<2;i++){const p=Object.fromEntries(clock.formatToParts(new Date(guess)).map(p=>[p.type,p.value])),local=Date.UTC(Number(p.year),Number(p.month)-1,Number(p.day),Number(p.hour),Number(p.minute),Number(p.second));guess+=target-local;}
 return guess;
}
const deferredToday=(e,now)=>!e.plan&&e.analysisDeferred?.day===newYorkDay(now);

export function validateWorkflowStrategy(value={},base=defaultWorkflow){
 if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).some(key=>!workflowKeys.includes(key)))throw Error('Parámetro de estrategia fuera del ámbito');
 const settings={...defaultWorkflow,...base};for(const key of workflowKeys)if(value[key]!==null&&value[key]!==undefined)settings[key]=value[key];
 for(const [key,min,max,integer] of [['minScore',30,90,false],['researchDailyLimit',1,12,true],['researchIntervalMinutes',30,240,true],['minRR',1,8,false],['riskPct',.1,2,false],['researchBatchSize',1,3,true],['enrichmentLimit',1,8,true]])if(!finite(settings[key])||settings[key]<min||settings[key]>max||integer&&!Number.isInteger(settings[key]))throw Error('Estrategia inválida: '+key);
 for(const [key,max] of [['focusSectors',4],['catalystKinds',6]]){const list=settings[key];if(!Array.isArray(list)||list.length>max||new Set(list).size!==list.length||list.some(x=>typeof x!=='string'||!x.trim()||x.length>80))throw Error('Estrategia inválida: '+key);settings[key]=list.map(x=>x.trim());}
 if(typeof settings.weekendPlanning!=='boolean')throw Error('Estrategia inválida: weekendPlanning');return settings;
}

export function workflowSettings(s){
 const base={...defaultWorkflow,minScore:s.policy?.minScore??45,researchDailyLimit:s.policy?.researchDailyLimit??12,researchIntervalMinutes:s.policy?.researchIntervalMinutes??30,minRR:s.config?.minRR??2,riskPct:s.config?.riskPct??.35};
 return validateWorkflowStrategy(s.company?.strategy||{},base);
}

export function researchBrief(s,event,now=Date.now()){
 return {assignments:(s.company?.agency?.workQueue||[]).filter(w=>w.kind==='research'&&w.eventId===event.id&&workPending(w)&&(!w.notBefore||w.notBefore<=now)).slice(0,3).map(w=>({from:w.from,task:w.task,reason:w.reason})),preliminary:event.preliminary?{summary:event.preliminary.summary,missingEvidence:event.preliminary.missingEvidence,nextTask:event.preliminary.nextTask}:null,preRisk:event.preRisk?{summary:event.preRisk.summary,missingEvidence:event.preRisk.missingEvidence,nextTask:event.preRisk.nextTask}:null,analysisFollowup:event.analysisFollowup?{reason:event.analysisFollowup.reason,missingEvidence:event.analysisFollowup.missingEvidence,nextTask:event.analysisFollowup.nextTask}:null};
}

function researchPacing(s,now,approvedWaiting){
 const settings=workflowSettings(s),calendar=sessionCalendar(now),target=2;
 const nearing=Date.parse(calendar.nextSessionDate+'T13:30:00Z')-now<60*3600e3;
 const preparing=settings.weekendPlanning&&nearing&&approvedWaiting<target;
 const affordable=Math.max(0,Math.floor((s.operating?.paceEurPerDay||0)/.045));
 let limit=Math.min(settings.researchDailyLimit,affordable);
 if(s.company?.launch?.active){
  const callsToday=s.real.researchDay===newYorkDay(now)&&finite(s.real.researchCalls)?Math.max(0,Math.floor(s.real.researchCalls)):0;
  const costs=(s.real.events||[]).map(e=>e.research?.costEur).filter(cost=>finite(cost)&&cost>0),costEstimate=costs.length>=3?Math.max(.015,costs.reduce((sum,cost)=>sum+cost,0)/costs.length*1.3):.045;
  const planningReserveNeeded=selectPlanningCandidates(s,now).some(e=>!e.plan||!e.review);
  const pace=finite(s.operating?.paceEurPerDay)?Math.max(0,s.operating.paceEurPerDay):0,researchAllowance=pace*(planningReserveNeeded ? .7 : 1),reservedForAnalysis=pace*(planningReserveNeeded ? .3 : 0);
  const knownSpend=finite(s.operating?.daySpentEur)&&s.operating.daySpentEur>=0,dailyRemainingEur=knownSpend?Math.max(0,pace-s.operating.daySpentEur):null,spare=knownSpend?Math.max(0,Math.min(researchAllowance-s.operating.daySpentEur,s.operating.remainingEur||0)):0;
  const eligibleCount=new Set(selectResearchCandidates(s,now).map(e=>e.symbol)).size,extra=!s.operating?.exhausted&&s.operating?.remainingEur>0?Math.min(eligibleCount,Math.floor(spare/costEstimate)):0;
  limit=Math.min(settings.researchDailyLimit,callsToday+extra);
  return {target,preparing,limit,intervalMinutes:settings.researchIntervalMinutes,estimatedResearchCostEur:costEstimate,observedCostSamples:costs.length,researchAllowanceEur:researchAllowance,reservedForAnalysisEur:reservedForAnalysis,availableResearchEur:spare,dailyRemainingEur,reserveReleased:!planningReserveNeeded,reserveReason:planningReserveNeeded?'Reserva para valoración o revisión independiente pendiente':'Sin valoración o revisión lista; margen diario disponible para investigación'};
 }
 if(preparing&&!s.operating?.exhausted&&s.operating?.remainingEur>0&&finite(s.operating?.daySpentEur)){
  const callsToday=s.real.researchDay===newYorkDay(now)&&finite(s.real.researchCalls)?Math.max(0,Math.floor(s.real.researchCalls)):0;
  const spare=Math.max(0,(s.operating.paceEurPerDay||0)-s.operating.daySpentEur),extra=Math.floor(spare/.045);
  if(extra>0){const pendingFollowupCount=selectResearchCandidates(s,now).filter(e=>e.confirmed&&analysisFollowupPending(e)).length;limit=Math.min(settings.researchDailyLimit,Math.max(limit,callsToday+Math.min(pendingFollowupCount,extra)));}
 }
 return {target,preparing,limit,intervalMinutes:settings.researchIntervalMinutes};
}
export function sessionResearchPacing(s,now=Date.now()){
 return researchPacing(s,now,selectPlanningCandidates(s,now).filter(e=>e.plan&&e.review?.approve===true).length);
}

// A future announced event and an already published catalyst are distinct facts.
// An analyst's holding horizon never becomes a date supposedly announced by an issuer.
export function catalystReady(e,now=Date.now()){
 if(e?.confirmed!==true||!primarySource(e))return false;const date=timestamp(e.date);if(!finite(date))return false;
 const timing=e.timing??e.research?.timing??'scheduled';
 if(timing==='announced')return date<=now&&now-date<=7*day;
 return timing==='scheduled'&&date>now&&date<=now+45*day;
}

export function researchEvidenceFingerprint(e){
 return JSON.stringify([e.source||'',e.signal?.url||'',e.signal?.headline||e.title||'',e.signal?.excerpt||'',e.signal?.publishedAt||0,e.date||'',e.evidenceUpdatedAt||0]);
}

const lastAttempt=e=>Math.max(finite(e.researchAttemptAt)?e.researchAttemptAt:0,finite(e.research?.researchedAt)?e.research.researchedAt:0);
const workPending=w=>['queued','pending','running','blocked','pendiente','asignada'].includes(w.status||'queued');
const dated=x=>{const value=timestamp(x);return finite(value)?value:0;};
const taskKey=task=>String(task||'').trim().replace(/\s+/g,' ').toLowerCase();
const requestTime=w=>Math.max(dated(w.createdAt),dated(w.updatedAt));
export function primaryResearchUpdateAt(event,now=Date.now()){
 const updates=[dated(event.primaryUpdatedAt),dated(event.signal?.primaryUpdatedAt),...(event.sources||[]).map(source=>primarySource({sources:[source]})?dated(source.publishedAt||source.updatedAt):0)];
 return Math.max(0,...updates.filter(at=>at<=now));
}
export function researchReadyAt(event,now=Date.now()){
 const previous=lastAttempt(event);
 return !previous||primaryResearchUpdateAt(event,now)>previous?now:Math.max(now,previous+(event.confirmed?4:24)*hour);
}
export function researchAssignmentAnswered(s,event,task){
 const key=taskKey(task),fingerprint=researchEvidenceFingerprint(event);
 return !!key&&(s.company?.agency?.workQueue||[]).some(w=>w.kind==='research'&&w.eventId===event.id&&w.status==='complete'&&taskKey(w.task)===key&&w.evidenceFingerprintAtFinish===fingerprint);
}
export function pendingResearchAssignment(s,event,now=Date.now()){
 const previous=lastAttempt(event),retryDue=finite(event.researchRetryAfter)&&event.researchRetryAfter<=now;
 return (s.company?.agency?.workQueue||[]).filter(w=>w.kind==='research'&&w.eventId===event.id&&workPending(w)&&(!w.notBefore||w.notBefore<=now)&&(requestTime(w)>previous||retryDue&&requestTime(w)>dated(event.research?.researchedAt))&&taskKey(w.task).length>=12&&!researchAssignmentAnswered(s,event,w.task)).sort((a,b)=>requestTime(b)-requestTime(a))[0]||null;
}
export function analysisFollowupPending(event){
 return !!event.analysisFollowup&&dated(event.research?.researchedAt)<=dated(event.analysisFollowup.baselineResearchAt);
}
const metadataKeys=new Set(['checkedAt','fetchedAt','researchedAt','costEur','_costEur','annualAgeDays','marketCapAt','extractorVersion']);
function evidenceValue(value){
 if(value===undefined)return null;
 if(Array.isArray(value))return value.map(evidenceValue);
 if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).filter(([key])=>!metadataKeys.has(key)).sort(([a],[b])=>a.localeCompare(b)).map(([key,item])=>[key,evidenceValue(item)]));
 return value;
}
const evidenceSources=sources=>(sources||[]).map(evidenceValue).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));
export function analysisEvidenceFingerprint(s,event){
 const profile=s.real.profiles?.[event.symbol],f=profile?.fundamentals,m=profile?.market;
 const marketKeys=['return5d','return21d','return63d','return1y','drawdown1y','drawdownObserved','relativeVolume','averageDollarVolume','adjustedCloseAvailable','returnBasis','definitions','seriesDiagnostic'];
 return JSON.stringify(evidenceValue({facts:{date:event.date,timing:event.timing,kind:event.kind,summary:event.summary,source:event.source,sources:evidenceSources(event.sources)},financial:{metrics:f?.metrics||null,latestQuarter:f?.latestQuarter||null,evidence:f?.evidence||null},market:m?Object.fromEntries(marketKeys.map(key=>[key,m[key]])):null,research:{findings:event.research?.taskFindings||event.research?.supplement?.findings||null,sources:evidenceSources(event.research?.supplement?.sources)}}));
}
export function analysisEvidenceScope(answer={}){
 // The caller may identify a price-data guard explicitly. Unclassified and legacy
 // requests stay conservative: a market move cannot answer a financial question.
 return ['primary_financial','market','mixed'].includes(answer.evidenceScope)?answer.evidenceScope:answer.guard==='price_series'?'market':'primary_financial';
}
function blockedEvidenceValue(fingerprint,scope){
 try{const value=JSON.parse(fingerprint);if(!value||typeof value!=='object'||Array.isArray(value))return fingerprint;
  if(scope!=='market'){
   delete value.market;
   // Price-derived valuation ratios do not resolve missing debt or liquidity facts.
   if(value.financial?.metrics)for(const key of ['marketCap','pe','pb','evToEbitda','enterpriseValue'])delete value.financial.metrics[key];
  }
  else if(value.market){const market=value.market,diagnostic=market.seriesDiagnostic;
   value.market={adjustedCloseAvailable:market.adjustedCloseAvailable,returnBasis:market.returnBasis,definitions:market.definitions,seriesDiagnostic:diagnostic?{adjustments:diagnostic.adjustments,corporateActions:diagnostic.corporateActions,oneYear:{sufficientCoverage:diagnostic.oneYear?.sufficientCoverage,minimumCalendarDays:diagnostic.oneYear?.minimumCalendarDays,minimumSessions:diagnostic.oneYear?.minimumSessions}}:null};
  }
  return JSON.stringify(evidenceValue(value));
 }catch{return fingerprint;}
}
export function analysisBlockedForEvidence(s,event){
 const block=event.analysisBlocked;if(!block)return false;
 const scope=block.evidenceScope||'primary_financial';
 return blockedEvidenceValue(block.fingerprint,scope)===blockedEvidenceValue(analysisEvidenceFingerprint(s,event),scope);
}
function researchIntervalReadyAt(s,now,intervalMinutes){
 const last=s.real.lastResearch||0,failed=(s.real.events||[]).some(e=>e.researchAttemptAt>=last&&e.researchAttemptAt-last<1000&&e.researchRetryAfter>now);
 return failed?now:Math.max(now,last+intervalMinutes*60e3);
}
function queuedPriority(s,e,kind,now){return (s.company?.agency?.workQueue||[]).filter(w=>workPending(w)&&(!w.notBefore||w.notBefore<=now)&&w.kind===kind&&(w.eventId===e.id||w.symbol===e.symbol)).reduce((n,w)=>Math.max(n,w.time||w.createdAt||0),0);}
function priority(s,e,kind,now){const mark=Math.max(e.employeePriority?.time||0,queuedPriority(s,e,kind,now));return finite(mark)&&mark<=now&&now-mark<=7*day?mark:0;}
function focusBoost(e,s,settings){const sector=s.real.assets?.find(a=>a.symbol===e.symbol)?.sector||'',kind=e.kind||e.signal?.kind||'';return Number(settings.focusSectors.some(x=>sector.toLowerCase().includes(x.toLowerCase())))+Number(settings.catalystKinds.some(x=>kind.toLowerCase().includes(x.toLowerCase())));}
function order(s,rows,kind,settings,now){return rows.sort((a,b)=>(kind==='research'?Number(b.confirmed&&analysisFollowupPending(b))-Number(a.confirmed&&analysisFollowupPending(a)):0)||Number(!!priority(s,b,kind,now))-Number(!!priority(s,a,kind,now))||focusBoost(b,s,settings)-focusBoost(a,s,settings)||(b.preScore?.score||0)-(a.preScore?.score||0)||priority(s,b,kind,now)-priority(s,a,kind,now)||(timestamp(a.date)||now+45*day)-(timestamp(b.date)||now+45*day));}

export function selectResearchCandidates(s,now=Date.now()){
 const settings=workflowSettings(s),events=s.real.events||[],companyAttempts=new Map(),dailyAttempts=new Map();
 for(const e of events)if(e.researchAttempts?.day===newYorkDay(now))dailyAttempts.set(e.symbol,(dailyAttempts.get(e.symbol)||0)+e.researchAttempts.count);
 for(const e of events)companyAttempts.set(e.symbol,Math.max(companyAttempts.get(e.symbol)||0,lastAttempt(e)));
 const rows=events.filter(e=>{
  if(closedStatuses.has(e.status)||!e.preScore?.eligible||e.researchRetryAfter>now||(dailyAttempts.get(e.symbol)||0)>=2)return false;
  const companyAt=companyAttempts.get(e.symbol)||0,newPrimary=primaryResearchUpdateAt(e,now)>companyAt;
  if(e.confirmed){
   if(e.plan||e.review?.approve===false||e.research?.worthAnalyzing===false||!pendingResearchAssignment(s,e,now))return false;
   return newPrimary||!companyAt||now-companyAt>=4*hour;
  }
  if(companyAt&&now-companyAt<day&&!newPrimary)return false;
  const attempted=lastAttempt(e);if(!attempted||!e.research)return true;
  const explicitlyQueued=priority(s,e,'research',now)>attempted;
  const changed=e.researchFingerprint?e.researchFingerprint!==researchEvidenceFingerprint(e):(e.evidenceUpdatedAt||e.signal?.publishedAt||0)>attempted;
  return explicitlyQueued||changed||newPrimary||now-attempted>=2*day;
 });return order(s,rows,'research',settings,now);
}

export function selectPlanningCandidates(s,now=Date.now()){
 const settings=workflowSettings(s),weekend=['Sat','Sun'].includes(new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',weekday:'short'}).format(new Date(now)));
 if(weekend&&!settings.weekendPlanning)return [];
 const rows=(s.real.events||[]).filter(e=>!closedStatuses.has(e.status)&&!deferredToday(e,now)&&!(e.retryAfter>now)&&!analysisFollowupPending(e)&&!analysisBlockedForEvidence(s,e)&&catalystReady(e,now)&&e.research?.worthAnalyzing!==false&&(!e.plan||finite(e.plan.expiresAt)&&e.plan.expiresAt>now)&&e.plan?.approve!==false&&e.review?.approve!==false);
 return order(s,rows,'analysis',settings,now);
}

function sessionCalendar(now){
 const p=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit',weekday:'short',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date(now)).map(p=>[p.type,p.value]));
 const minutes=Number(p.hour)*60+Number(p.minute),weekday=!['Sat','Sun'].includes(p.weekday),open=weekday&&minutes>=572&&minutes<960;let date=new Date(p.year+'-'+p.month+'-'+p.day+'T12:00:00Z');
 if(!weekday||minutes>=960){do{date=new Date(date.getTime()+day);}while([0,6].includes(date.getUTCDay()));}
 return {marketOpen:open,nextSessionDate:date.toISOString().slice(0,10),sessionCalendarBasis:'Semana regular; la ejecución depende de una cotización válida durante sesión'};
}

export function pipelineSummary(s,now=Date.now()){
 const events=s.real.events||[],work=(s.company?.agency?.workQueue||[]).filter(workPending),planning=selectPlanningCandidates(s,now),researchQueue=selectResearchCandidates(s,now),calendar=sessionCalendar(now);
 const confirmed=events.filter(e=>!closedStatuses.has(e.status)&&catalystReady(e,now)),deferred=confirmed.filter(e=>deferredToday(e,now)),followup=confirmed.filter(analysisFollowupPending),blocked=confirmed.filter(e=>analysisBlockedForEvidence(s,e)),prepared=planning.filter(e=>e.plan),approved=prepared.filter(e=>e.review?.approve===true),riskPending=prepared.filter(e=>!e.review),supportPending=work.filter(w=>w.phase==='preliminary'||['analysis','risk','market','profile','development','strategy','code','execution'].includes(w.kind));
 const counts={signals:events.filter(e=>!closedStatuses.has(e.status)).length,researchQueue:researchQueue.length,researched:events.filter(e=>e.research).length,confirmed:confirmed.length,analysisReady:planning.filter(e=>!e.plan).length,analysisDeferred:deferred.length,analysisBlocked:blocked.length,researchFollowupPending:followup.length,riskPending:riskPending.length,plansPrepared:prepared.length,approvedWaiting:approved.length,supportPending:supportPending.length,positions:s.real.book?.positions?.length||0,closed:s.real.book?.closed?.length||0};
 let blocker='',blockerStage='';
 if(s.operating?.exhausted||s.operating?.remainingEur===0){blockerStage='budget';blocker='Presupuesto mensual de IA agotado; vigilancia por código activa';}
 else if(approved.length&&s.paused){blockerStage='paused';blocker='Planes preparados; nuevas entradas pausadas por César';}
 else if(approved.length){blockerStage=calendar.marketOpen?'execution':'session';blocker=calendar.marketOpen?'Comprobar precio y condiciones de los planes aprobados':'Planes preparados; esperar sesión y validar precio de entrada';}
 else if(riskPending.length){blockerStage='risk';blocker='Planes pendientes de la revisión independiente de María';}
 else if(planning.length){blockerStage='analysis';blocker='Catalizadores contrastados pendientes de valoración y plan de Pedro';}
 else if(followup.length){blockerStage='research_followup';blocker='Santi debe resolver preguntas concretas de Pedro antes de repetir la valoración';}
 else if(deferred.length){blockerStage='analysis_quota';blocker='Revisión profunda aplazada por cuota diaria; se reabre tras medianoche de Nueva York';}
 else if(blocked.length){blockerStage='analysis_evidence';blocker='Evaluación bloqueada por datos; se conserva el presupuesto hasta que cambien hechos o evidencia financiera';}
 else if(supportPending.length){blockerStage='support';blocker='Resolver datos, comprobaciones o código solicitados por empleados';}
 else if(researchQueue.length){blockerStage='research';blocker='Santi debe contrastar las fuentes y la ventaja de las candidatas priorizadas';}
 else{blockerStage='discovery';blocker='Sin candidata preparada: buscar señales nuevas y resolver datos que falten';}
 const globalResearchAt=researchIntervalReadyAt(s,now,researchPacing(s,now,approved.length).intervalMinutes);
 const nextResearchAt=followup.length?Math.max(globalResearchAt,Math.min(...followup.map(e=>Math.max(researchReadyAt(e,now),e.researchRetryAfter||0,...work.filter(w=>w.kind==='research'&&w.eventId===e.id).map(w=>w.notBefore||0))))):null;
 return {at:now,...calendar,counts,entriesPaused:!!s.paused,researchQueue:researchQueue.length,supportPending:supportPending.length,analysisDeferred:deferred.length,analysisBlocked:blocked.length,nextAnalysisAt:deferred.length?Math.min(...deferred.map(e=>e.analysisDeferred.nextAt||nextDeepAnalysisAt(now))):null,researchFollowupPending:followup.length,nextResearchAt,approvedWaiting:approved.length,readyNextSession:!calendar.marketOpen?approved.length:0,blockerStage,blocker};
}

export function planningFeedback(s,limit=4){return {expiredWithoutEntryTotal:s.company?.planLifecycle?.expiredWithoutEntryTotal||0,recent:(s.company?.planningOutcomes||[]).slice(0,limit).map(o=>({symbol:o.symbol,kind:o.kind,preparedAt:o.preparedAt,expiredAt:o.expiredAt,reviewApproved:o.reviewApproved,entryMin:o.entryMin??null,entryMax:o.entryMax??null,lastBlockers:o.lastBlockers||[],lastReference:o.lastReference||null,adaptationId:o.adaptationId||null,reason:o.reason})),interpretation:'Planes sin entrada son resultados de preparación, no pérdidas ni beneficios realizados; revisad filtros, plazos y entradas con evidencia, sin perseguir el precio.'};}
