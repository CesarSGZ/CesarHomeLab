import {pendingEmployeeWork,queueEmployeeWork,finishEmployeeWork} from './employee-agents.js';
import {workflowSettings,validateWorkflowStrategy,pipelineSummary,researchEvidenceFingerprint,catalystReady,quoteContext,sessionResearchPacing,analysisFollowupPending} from './strategy.js';
import {prepareDevelopment} from './development.js';
import {developmentFiles} from './office-boundary.js';

const schema={type:'object',additionalProperties:false,properties:{summary:{type:'string'},thesis:{type:'string'},missingEvidence:{type:'array',maxItems:4,items:{type:'string'}},worthFurtherWork:{type:'boolean'},nextOwner:{type:'string',enum:['scout','analyst','risk','auditor']},nextTask:{type:'string'}},required:['summary','thesis','missingEvidence','worthFurtherWork','nextOwner','nextTask']};
const on=(s,id)=>!s.agents.find(a=>a.id===id)?.paused;
export function requestAnalysisEvidence(s,event,answer,now=Date.now(),owner='analyst'){
 const missing=Array.isArray(answer.missingEvidence)?answer.missingEvidence.filter(x=>typeof x==='string'&&x.trim()).slice(0,3):[];
 const task=String(answer.nextResearchTask||'').trim();if(!missing.length||task.length<12)return false;
 const fingerprint=JSON.stringify([event.summary,event.sources,s.real.profiles?.[event.symbol]?.fundamentals?.metrics,event.research?.researchedAt,missing,task]);
 const history=event.followupHistory??=[];if(history.length>=2||history.some(h=>h.fingerprint===fingerprint))return false;
 const followup={at:now,owner,reason:answer.reason,missingEvidence:missing,nextTask:task,baselineResearchAt:event.research?.researchedAt||event.researchAttemptAt||0,fingerprint,attempts:history.length+1};
 history.push(followup);event.analysisFollowup=followup;event.analysisAssessment={...answer,at:now,executable:false};
 if(event.plan)event.previousPlan={...event.plan,withdrawnAt:now,reason:'Faltan datos para la revisión'};
 delete event.plan;delete event.review;event.status='verificar';event.reasons=['Investigación adicional solicitada por '+owner+': '+task];
 queueEmployeeWork(s,'research',event.id,{owner,decision:String(answer.reason||'Completar evidencia antes de planificar'),nextTask:task,evidenceIds:[event.id],strategy:null},now);
 return true;
}

export function recoverDataGapRejections(s,now=Date.now()){
 if(s.company.dataGapRecovery===1)return;s.company.dataGapRecovery=1;
 for(const e of s.real.events){
  if(e.status!=='descartado'||!e.confirmed||!catalystReady(e,now)||!e.preScore?.eligible||e.plan||e.review||e.followupHistory?.length)continue;
  const reason=(e.reasons||[]).join(' ');
  if(!/faltan? datos|faltan? .*evidencia|insuficiencia de evidencia|evidencia insuficiente|datos .*mixtos|datos .*fechas distintas|necesita verific|exige verific/i.test(reason))continue;
  if(/fcf negativo|sin margen|liquidez.*inferior|riesgo.*desproporcion|sin ventaja|(?:no|ni) ofrece.*riesgo.recompensa/i.test(reason))continue;
  e.decisionHistory??=[];e.decisionHistory.push({at:now,status:e.status,reasons:e.reasons,reason:'Resolver carencia de datos; no constituye aprobación ni nueva tesis'});
  requestAnalysisEvidence(s,e,{reason,missingEvidence:['Resolver las carencias concretas del análisis previo'],nextResearchTask:'Contrastar fuentes primarias y aportar datos fechados para resolver: '+reason.slice(0,600)},now);
 }
}
function compactProfile(p){return p?{checkedAt:p.checkedAt,market:p.market,fundamentals:p.fundamentals?{latestQuarter:p.fundamentals.latestQuarter,metrics:p.fundamentals.metrics,source:p.fundamentals.source,checkedAt:p.fundamentals.checkedAt,evidence:p.fundamentals.evidence?.slice(0,6),limitations:p.fundamentals.limitations?.slice(0,2)}:null,errors:p.errors?.slice(0,3)}:null;}
function preparationFingerprint(event,profile,quote){return JSON.stringify([researchEvidenceFingerprint(event),profile?.fundamentals?.metrics||null,profile?.market?.asOf||null,quote?.time||null,quote?.price||null]);}
function complete(s,work,result,target,now){return finishEmployeeWork(s,work.id,result,{target,eventId:work.eventId},now);}
export function recordFinancialWork(s,event,kind,result,now=Date.now(),target){
 const owner={research:'scout',analysis:'analyst',risk:'risk',execution:'operator'}[kind];if(!owner)throw Error('Tipo de trabajo financiero desconocido');
 let works=s.company.agency.workQueue.filter(w=>w.kind===kind&&w.eventId===event.id&&['pending','running','blocked'].includes(w.status));
 if(!works.length)works=[queueEmployeeWork(s,kind,event.id,{owner,decision:'Trabajo operativo seleccionado por el flujo de la empresa',nextTask:({research:'Contrastar fuentes de ',analysis:'Valorar y preparar tesis de ',risk:'Revisar independientemente el plan de ',execution:'Comprobar la ejecución ficticia de '}[kind])+event.symbol,evidenceIds:[event.id],strategy:null},now)];
 for(const work of works)complete(s,work,result,target||(kind==='research'?(catalystReady(event,now)?'analyst':'scout'):undefined),now);
}
export function refreshSessionPlan(s,now=Date.now()){
 const pipeline=pipelineSummary(s,now),plans=s.real.events.filter(e=>e.plan?.expiresAt>now&&e.review?.approve&&catalystReady(e,now)&&['nuevo','espera'].includes(e.status));
 s.company.pipeline=pipeline;
 s.company.sessionPlan={at:now,date:pipeline.nextSessionDate,calendarBasis:pipeline.sessionCalendarBasis,ready:plans.map(e=>({eventId:e.id,symbol:e.symbol,entryMin:e.plan.entryMin,entryMax:e.plan.entryMax,stop:e.plan.stop,target:e.plan.target,expiresAt:e.plan.expiresAt,referenceAt:e.plan.referenceAt,conditions:e.reasons||[]})),target:2,shortfall:Math.max(0,2-plans.length),researchPacing:sessionResearchPacing(s,now),watchlist:s.real.events.filter(e=>e.preScore?.eligible&&!['descartado','caducado','abierto'].includes(e.status)).sort((a,b)=>(b.preScore?.score||0)-(a.preScore?.score||0)).slice(0,2).map(e=>({eventId:e.id,symbol:e.symbol,stage:!e.confirmed||analysisFollowupPending(e)?'research':!e.plan?'analysis':!e.review?'risk':'review',nextTask:analysisFollowupPending(e)?e.analysisFollowup.nextTask:e.preliminary?.nextTask||'Contrastar catalizador, ventaja y escenarios',executable:false})),steps:plans.length?['Actualizar referencia en sesión','Revalidar entrada, liquidez, riesgo y capital','Registrar compra ficticia solo si se mantienen las condiciones']:['Contrastar catalizadores de la cola','Valorar las tesis y revisar riesgos','Preparar entradas solo con ventaja suficiente']};
 return s.company.sessionPlan;
}
function seedUsefulWork(s,now){
 const queue=s.company.agency.workQueue;if(queue.some(w=>w.kind==='analysis'&&['pending','running'].includes(w.status)))return;
 const event=s.real.events.filter(e=>!e.confirmed&&e.preScore?.eligible&&!['descartado','caducado','abierto'].includes(e.status)&&s.real.profiles?.[e.symbol]&&!e.preliminary).sort((a,b)=>(b.preScore?.score||0)-(a.preScore?.score||0))[0];
 if(event&&on(s,'analyst'))queueEmployeeWork(s,'analysis',event.id,{owner:'analyst',decision:'Preanálisis del radar con datos ya disponibles',nextTask:'Identificar tesis, riesgos y evidencia específica que debe contrastar Santi',evidenceIds:[event.id,'discovery'],strategy:null},now);
}
export async function runPreparation(s,{call,checkpoint,log},now=Date.now()){
 const company=s.company,agency=company.agency;refreshSessionPlan(s,now);
 // Pausar entradas no suspende investigación, revisión ni preparación.
 for(const w of pendingEmployeeWork(s,'strategy',now).filter(w=>on(s,w.owner))){
  try{const before=workflowSettings(s),after=validateWorkflowStrategy(w.strategy,before);company.strategy=after;Object.assign(s.policy,{minScore:after.minScore,researchDailyLimit:after.researchDailyLimit,researchIntervalMinutes:after.researchIntervalMinutes});s.policy.version++;s.config.riskPct=after.riskPct;s.config.minRR=after.minRR;company.strategyHistory??=[];company.strategyHistory.unshift({time:now,owner:w.from,before,after,reason:w.reason,evidenceIds:w.evidenceIds});company.strategyHistory=company.strategyHistory.slice(0,30);complete(s,w,'Estrategia aplicada y registrada; los resultados se evaluarán con paciencia','scout',now);log(s,'auditor','Decisión autónoma aplicada: '+w.reason);}
  catch(error){finishEmployeeWork(s,w.id,'Cambio rechazado: '+error.message,{status:'failed',target:'auditor'},now);}
 }
 for(const w of pendingEmployeeWork(s,'execution',now).filter(w=>on(s,w.owner))){const e=s.real.events.find(e=>e.id===w.eventId);if(e?.plan?.expiresAt>now&&e.review?.approve&&catalystReady(e,now)&&['nuevo','espera'].includes(e.status)){complete(s,w,'Preapertura preparada para '+e.symbol+': actualizar precio y revalidar los límites en sesión','auditor',now);}else finishEmployeeWork(s,w.id,'Falta un catalizador y plan vigentes con revisión de riesgo aprobada',{status:'blocked',target:'risk'},now);}
 if(agency.preparationDay!==new Date(now).toISOString().slice(0,10)){agency.preparationDay=new Date(now).toISOString().slice(0,10);agency.preparationCalls=0;}
 if(workflowSettings(s).weekendPlanning&&s.operating?.remainingEur>.01)seedUsefulWork(s,now);
 for(const work of [...pendingEmployeeWork(s,'analysis',now),...pendingEmployeeWork(s,'risk',now)].filter(w=>w.phase==='preliminary')){
  if(!on(s,work.owner))continue;
  const event=s.real.events.find(e=>e.id===work.eventId);if(!event){finishEmployeeWork(s,work.id,'Candidata retirada del radar',{status:'failed',target:'auditor'},now);continue;}
  const profile=s.real.profiles?.[event.symbol],fingerprint=preparationFingerprint(event,profile,s.real.quotes?.[event.symbol]),field=work.kind==='risk'?'preRisk':'preliminary';
  if(event[field]?.fingerprint===fingerprint){complete(s,work,'Se reutiliza el preanálisis guardado; no se repite consumo',event[field].nextOwner,now);continue;}
  if(!profile||!profile.fundamentals?.metrics&&!profile.market){finishEmployeeWork(s,work.id,'Falta ficha financiera utilizable; enriquecimiento solicitado a Santi',{status:'blocked',target:'scout'},now);continue;}
  if(agency.preparationCalls>=2||s.operating?.exhausted||!(s.operating?.remainingEur>.01))continue;
  work.status='running';work.attempts++;agency.preparationCalls++;const employee=s.agents.find(a=>a.id===work.owner);employee.status='trabajando';employee.task=(work.kind==='risk'?'Precomprobación de riesgo ':'Preanálisis de ')+event.symbol;await checkpoint();
  try{
   const answer=await call(work.owner,'Realiza un trabajo preliminar útil con la información ya descargada. '+(work.kind==='risk'?'Identifica objeciones de liquidez, caja, deuda, dilución y dependencia del catalizador.':'Compara salud financiera, valoración, señal y posibles escenarios del catalizador; identifica qué información concreta permitiría una tesis.')+' No es una aprobación ni un plan ejecutable. Si falta fecha o hecho primario confirmado, encarga su comprobación a Santi. La referencia del cierre sirve para investigar en fin de semana. No rechaces solo porque no existe precio de ejecución ahora. No inventes información; diferencia hipótesis y hechos. La ausencia de datos se escribe en missingEvidence. Da una siguiente tarea específica. Máximo 160 palabras entre campos.',{now:new Date(now).toISOString(),event:{id:event.id,symbol:event.symbol,kind:event.kind,date:event.date,confirmed:event.confirmed,summary:event.summary,signal:event.signal,sources:event.sources,research:event.research,preScore:event.preScore},financialProfile:compactProfile(s.real.profiles[event.symbol]),quote:quoteContext(s.real.quotes[event.symbol]),work:work.task,configuration:workflowSettings(s)},schema,{light:true,work:true,outputTokens:800,capEur:.0035});
   event[field]={...answer,at:now,fingerprint,costEur:answer._costEur,executable:false};complete(s,work,event.symbol+': '+answer.summary+' · '+answer.nextTask,answer.nextOwner,now);log(s,work.owner,event.symbol+': '+answer.summary);
   if(answer.worthFurtherWork&&answer.nextOwner==='scout'&&!event.confirmed)queueEmployeeWork(s,'research',event.id,{owner:work.owner,decision:answer.summary,nextTask:answer.nextTask,evidenceIds:[event.id],strategy:null},now);
  }catch(error){finishEmployeeWork(s,work.id,'Preanálisis pendiente: '+error.message,{status:'failed',target:work.owner},now);log(s,work.owner,'Preanálisis aplazado: '+error.message,'warning');}
  employee.status='esperando';employee.task=agency.actors[work.owner]?.nextTask||'Trabajo preliminar registrado';await checkpoint();
 }
 const work=pendingEmployeeWork(s,'code',now).find(w=>on(s,'designer'));
 if(work&&s.operating?.remainingEur>.04&&!company.development?.some(j=>['queued','running'].includes(j.status))&&company.lastCodeDay!==new Date(now).toISOString().slice(0,10)){
  try{const files=/estrategia|selecci|catalizador|radar|flujo/i.test(work.task+' '+work.reason)?['trading-worker/strategy.js','trading-worker/preparation.js']:['control/trading.js'];const request={id:work.id,day:new Date(now).toISOString().slice(0,10),chair:{codeFiles:files.filter(f=>developmentFiles.includes(f)),decisions:[{title:work.reason,owner:work.from,evidence:work.evidenceIds}],codeRationale:work.task}};const job=await prepareDevelopment(s,request,(id,instructions,payload,schema,tokens)=>call(id,instructions,payload,schema,{light:true,work:true,outputTokens:tokens,capEur:.02}),checkpoint,now);complete(s,work,job?'Parche real en cola de pruebas y despliegue: '+job.summary:request.codeOutcome||'No procede parche adicional hoy','auditor',now);}
  catch(error){finishEmployeeWork(s,work.id,'Desarrollo aplazado: '+error.message,{status:'failed',target:'designer'},now);log(s,'designer','Desarrollo aplazado: '+error.message,'warning');}
 }
 refreshSessionPlan(s,now);await checkpoint();
}
