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
 for(const [key,min,max,integer] of [['minScore',30,90,false],['researchDailyLimit',1,12,true],['researchIntervalMinutes',30,240,true],['minRR',2,8,false],['riskPct',.1,1,false],['researchBatchSize',1,3,true],['enrichmentLimit',1,8,true]])if(!finite(settings[key])||settings[key]<min||settings[key]>max||integer&&!Number.isInteger(settings[key]))throw Error('Estrategia inválida: '+key);
 for(const [key,max] of [['focusSectors',4],['catalystKinds',6]]){const list=settings[key];if(!Array.isArray(list)||list.length>max||new Set(list).size!==list.length||list.some(x=>typeof x!=='string'||!x.trim()||x.length>80))throw Error('Estrategia inválida: '+key);settings[key]=list.map(x=>x.trim());}
 if(typeof settings.weekendPlanning!=='boolean')throw Error('Estrategia inválida: weekendPlanning');return settings;
}

export function workflowSettings(s){
 const base={...defaultWorkflow,minScore:s.policy?.minScore??45,researchDailyLimit:s.policy?.researchDailyLimit??12,researchIntervalMinutes:s.policy?.researchIntervalMinutes??30,minRR:s.config?.minRR??2,riskPct:s.config?.riskPct??.35};
 return validateWorkflowStrategy(s.company?.strategy||{},base);
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
function queuedPriority(s,e,kind,now){return (s.company?.agency?.workQueue||[]).filter(w=>workPending(w)&&(!w.notBefore||w.notBefore<=now)&&w.kind===kind&&(w.eventId===e.id||w.symbol===e.symbol)).reduce((n,w)=>Math.max(n,w.time||w.createdAt||0),0);}
function priority(s,e,kind,now){const mark=Math.max(e.employeePriority?.time||0,queuedPriority(s,e,kind,now));return finite(mark)&&mark<=now&&now-mark<=7*day?mark:0;}
function focusBoost(e,s,settings){const sector=s.real.assets?.find(a=>a.symbol===e.symbol)?.sector||'',kind=e.kind||e.signal?.kind||'';return Number(settings.focusSectors.some(x=>sector.toLowerCase().includes(x.toLowerCase())))+Number(settings.catalystKinds.some(x=>kind.toLowerCase().includes(x.toLowerCase())));}
function order(s,rows,kind,settings,now){return rows.sort((a,b)=>Number(!!priority(s,b,kind,now))-Number(!!priority(s,a,kind,now))||focusBoost(b,s,settings)-focusBoost(a,s,settings)||(b.preScore?.score||0)-(a.preScore?.score||0)||priority(s,b,kind,now)-priority(s,a,kind,now)||(timestamp(a.date)||now+45*day)-(timestamp(b.date)||now+45*day));}

export function selectResearchCandidates(s,now=Date.now()){
 const settings=workflowSettings(s),events=s.real.events||[],companyAttempts=new Map();
 for(const e of events)companyAttempts.set(e.symbol,Math.max(companyAttempts.get(e.symbol)||0,lastAttempt(e)));
 const rows=events.filter(e=>{
  if(e.confirmed||closedStatuses.has(e.status)||!e.preScore?.eligible)return false;
  const companyAt=companyAttempts.get(e.symbol)||0;if(companyAt&&now-companyAt<day)return false;
  const attempted=lastAttempt(e);if(!attempted||!e.research)return true;
  const explicitlyQueued=priority(s,e,'research',now)>attempted;
  const changed=e.researchFingerprint?e.researchFingerprint!==researchEvidenceFingerprint(e):(e.evidenceUpdatedAt||e.signal?.publishedAt||0)>attempted;
  return explicitlyQueued||changed||now-attempted>=2*day;
 });return order(s,rows,'research',settings,now);
}

export function selectPlanningCandidates(s,now=Date.now()){
 const settings=workflowSettings(s),weekend=['Sat','Sun'].includes(new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',weekday:'short'}).format(new Date(now)));
 if(weekend&&!settings.weekendPlanning)return [];
 const rows=(s.real.events||[]).filter(e=>!closedStatuses.has(e.status)&&!deferredToday(e,now)&&catalystReady(e,now)&&e.research?.worthAnalyzing!==false&&(!e.plan||finite(e.plan.expiresAt)&&e.plan.expiresAt>now)&&e.plan?.approve!==false&&e.review?.approve!==false);
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
 const confirmed=events.filter(e=>!closedStatuses.has(e.status)&&catalystReady(e,now)),deferred=confirmed.filter(e=>deferredToday(e,now)),prepared=planning.filter(e=>e.plan),approved=prepared.filter(e=>e.review?.approve===true),riskPending=prepared.filter(e=>!e.review),supportPending=work.filter(w=>w.phase==='preliminary'||['analysis','risk','market','profile','development','strategy','code','execution'].includes(w.kind));
 const counts={signals:events.filter(e=>!closedStatuses.has(e.status)).length,researchQueue:researchQueue.length,researched:events.filter(e=>e.research).length,confirmed:confirmed.length,analysisReady:planning.filter(e=>!e.plan).length,analysisDeferred:deferred.length,riskPending:riskPending.length,plansPrepared:prepared.length,approvedWaiting:approved.length,supportPending:supportPending.length,positions:s.real.book?.positions?.length||0,closed:s.real.book?.closed?.length||0};
 let blocker='',blockerStage='';
 if(s.operating?.exhausted||s.operating?.remainingEur===0){blockerStage='budget';blocker='Presupuesto mensual de IA agotado; vigilancia por código activa';}
 else if(s.paused){blockerStage='paused';blocker='Nuevas entradas pausadas por César';}
 else if(approved.length){blockerStage=calendar.marketOpen?'execution':'session';blocker=calendar.marketOpen?'Comprobar precio y condiciones de los planes aprobados':'Planes preparados; esperar sesión y validar precio de entrada';}
 else if(riskPending.length){blockerStage='risk';blocker='Planes pendientes de la revisión independiente de María';}
 else if(planning.length){blockerStage='analysis';blocker='Catalizadores contrastados pendientes de valoración y plan de Pedro';}
 else if(deferred.length){blockerStage='analysis_quota';blocker='Revisión profunda aplazada por cuota diaria; se reabre tras medianoche de Nueva York';}
 else if(supportPending.length){blockerStage='support';blocker='Resolver datos, comprobaciones o código solicitados por empleados';}
 else if(researchQueue.length){blockerStage='research';blocker='Santi debe contrastar las fuentes y la ventaja de las candidatas priorizadas';}
 else{blockerStage='discovery';blocker='Sin candidata preparada: buscar señales nuevas y resolver datos que falten';}
 return {at:now,...calendar,counts,researchQueue:researchQueue.length,supportPending:supportPending.length,analysisDeferred:deferred.length,nextAnalysisAt:deferred.length?Math.min(...deferred.map(e=>e.analysisDeferred.nextAt||nextDeepAnalysisAt(now))):null,approvedWaiting:approved.length,readyNextSession:!calendar.marketOpen?approved.length:0,blockerStage,blocker};
}
