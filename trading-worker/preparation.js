import {pendingEmployeeWork,queueEmployeeWork,finishEmployeeWork,launchHasPlanningWork} from './employee-agents.js';
import {workflowSettings,validateWorkflowStrategy,pipelineSummary,researchEvidenceFingerprint,catalystReady,quoteContext,sessionResearchPacing,analysisFollowupPending,analysisEvidenceFingerprint,selectPlanningCandidates} from './strategy.js';
import {prepareDevelopment} from './development.js';
import {developmentFiles} from './office-boundary.js';
import {installProgram,canReplacePilot} from './company.js';

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

export function blockAnalysisForEvidence(s,event,answer,now=Date.now(),owner='analyst'){
 if(answer.decision!=='needs_evidence'||answer.approve!==false)throw Error('Solo una evaluación pendiente de evidencia puede bloquearse por datos');
 const fingerprint=analysisEvidenceFingerprint(s,event),guard=(event.followupHistory?.length||0)>=2?'followup_limit':'incomplete_request';
 const missingEvidence=(answer.missingEvidence||[]).filter(x=>typeof x==='string'&&x.trim()).slice(0,3),reason=String(answer.reason||'Falta evidencia suficiente para completar la evaluación').slice(0,1200),nextTask=String(answer.nextResearchTask||'').slice(0,1000);
 const blocked={at:now,owner,guard,reason,missingEvidence,nextTask,fingerprint};
 event.analysisBlockHistory??=[];
 if(event.analysisBlocked?.fingerprint!==fingerprint)event.analysisBlockHistory.push({at:now,owner,guard,reason,missingEvidence,nextTask,fingerprint,status:event.status});
 event.analysisBlockHistory=event.analysisBlockHistory.slice(-12);event.analysisBlocked=blocked;event.analysisAssessment={...answer,at:now,executable:false};
 if(event.plan)event.previousPlan={...event.plan,withdrawnAt:now,reason:'Evaluación bloqueada por evidencia pendiente'};
 if(event.review)event.previousReview={...event.review,withdrawnAt:now};
 delete event.plan;delete event.review;event.status='verificar';event.reasons=['Bloqueado por datos: '+reason,'No se repite IA ni se crean nuevos encargos hasta recibir evidencia significativa'];
 return blocked;
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
 const resultText=String(result).slice(0,1000),planFingerprint=JSON.stringify([event.plan?.preparedAt,event.plan?.entryMin,event.plan?.entryMax,event.plan?.stop,event.plan?.target,event.plan?.expiresAt]);
 const previous=kind==='execution'?event.executionCheck:null,previousWork=previous&&s.company.agency.workQueue.find(w=>w.id===previous.workId&&w.status==='complete');
 if(!works.length&&previousWork&&previous.result===resultText&&previous.planFingerprint===planFingerprint){previous.at=now;previous.checks++;previousWork.lastCheckedAt=now;previousWork.checks=previous.checks;return previousWork;}
 if(!works.length)works=[queueEmployeeWork(s,kind,event.id,{owner,decision:'Trabajo operativo seleccionado por el flujo de la empresa',nextTask:({research:'Contrastar fuentes de ',analysis:'Valorar y preparar tesis de ',risk:'Revisar independientemente el plan de ',execution:'Comprobar la ejecución ficticia de '}[kind])+event.symbol,evidenceIds:[event.id],strategy:null},now)];
 for(const work of works)complete(s,work,result,target||(kind==='research'?(catalystReady(event,now)?'analyst':'scout'):undefined),now);
 if(kind==='execution')event.executionCheck={at:now,result:resultText,planFingerprint,workId:works[0].id,checks:1};
}
export function refreshSessionPlan(s,now=Date.now()){
 const pipeline=pipelineSummary(s,now),plans=s.real.events.filter(e=>e.plan?.expiresAt>now&&e.review?.approve&&catalystReady(e,now)&&['nuevo','espera'].includes(e.status));
 s.company.pipeline=pipeline;
 s.company.sessionPlan={at:now,date:pipeline.nextSessionDate,calendarBasis:pipeline.sessionCalendarBasis,ready:plans.map(e=>({eventId:e.id,symbol:e.symbol,entryMin:e.plan.entryMin,entryMax:e.plan.entryMax,stop:e.plan.stop,target:e.plan.target,expiresAt:e.plan.expiresAt,referenceAt:e.plan.referenceAt,conditions:e.reasons||[]})),target:2,shortfall:Math.max(0,2-plans.length),researchPacing:sessionResearchPacing(s,now),watchlist:s.real.events.filter(e=>e.preScore?.eligible&&!['descartado','caducado','abierto'].includes(e.status)).sort((a,b)=>(b.preScore?.score||0)-(a.preScore?.score||0)).slice(0,2).map(e=>({eventId:e.id,symbol:e.symbol,stage:!e.confirmed||analysisFollowupPending(e)?'research':!e.plan?'analysis':!e.review?'risk':'review',nextTask:analysisFollowupPending(e)?e.analysisFollowup.nextTask:e.preliminary?.nextTask||'Contrastar catalizador, ventaja y escenarios',executable:false})),steps:plans.length?['Actualizar referencia en sesión','Revalidar entrada, liquidez, riesgo y capital','Registrar compra ficticia solo si se mantienen las condiciones']:['Contrastar catalizadores de la cola','Valorar las tesis y revisar riesgos','Preparar experimentos con riesgo y salidas definidos']};
 return s.company.sessionPlan;
}
function seedUsefulWork(s,now){
 const queue=s.company.agency.workQueue;if(queue.some(w=>w.kind==='analysis'&&['pending','running'].includes(w.status)))return;
 const event=s.real.events.filter(e=>!e.confirmed&&e.preScore?.eligible&&!['descartado','caducado','abierto'].includes(e.status)&&s.real.profiles?.[e.symbol]&&!e.preliminary).sort((a,b)=>(b.preScore?.score||0)-(a.preScore?.score||0))[0];
 if(event&&on(s,'analyst'))queueEmployeeWork(s,'analysis',event.id,{owner:'analyst',decision:'Preanálisis del radar con datos ya disponibles',nextTask:'Identificar tesis, riesgos y evidencia específica que debe contrastar Santi',evidenceIds:[event.id,'discovery'],strategy:null},now);
}
const economicSettings=['minScore','riskPct','minRR'];
const operationalSettings=['researchDailyLimit','researchIntervalMinutes','researchBatchSize','enrichmentLimit','focusSectors','catalystKinds','weekendPlanning'];
const settingChanged=(a,b)=>JSON.stringify(a)!==JSON.stringify(b);
function strategyProgram(s,requested,reason){
 const active=s.company.versions?.find(v=>v.id===s.company.activeProgram)?.program;
 const visual=s.company.ui||active?.visual||{focus:'economics',theme:'mint',headline:'Aprendizaje con capital ficticio',panels:['report','efficiency'],lighting:'warm'};
 return {scope:'agent-office',rationale:reason.slice(0,1500),threshold:requested.minScore,rules:structuredClone(active?.rules||[]),workflow:{researchDailyLimit:s.policy.researchDailyLimit,researchIntervalMinutes:s.policy.researchIntervalMinutes,riskPct:requested.riskPct,minRR:requested.minRR},visual:structuredClone(visual)};
}
function recordStrategyDecision(s,work,entry,now){
 const key=JSON.stringify([work.strategyRequestKey,entry.status,entry.programId,entry.after,entry.requested]);if(work.strategyDecisionKey===key)return false;
 work.strategyDecisionKey=key;s.company.strategyHistory??=[];s.company.strategyHistory.unshift({time:now,workId:work.id,owner:work.from,reason:work.reason,evidenceIds:[...work.evidenceIds],...entry});s.company.strategyHistory=s.company.strategyHistory.slice(0,30);return true;
}
function prepareStrategyChange(s,work,log,now){
 const known=new Set([...s.real.events.map(e=>e.id),...s.real.book.positions.flatMap(p=>[p.id,p.symbol]),...s.real.book.closed.flatMap(t=>[t.id,t.symbol]),'kpis','budget','discovery','configuration']);
 if(typeof work.reason!=='string'||!work.reason.trim())throw Error('Falta motivo para modificar la estrategia');
 if(!Array.isArray(work.evidenceIds)||!work.evidenceIds.length||work.evidenceIds.some(id=>!known.has(id)))throw Error('Falta evidencia válida para modificar la estrategia');
 // Economic settings always describe the current baseline, never an unpromoted proposal.
 const before={...workflowSettings(s),minScore:s.policy.minScore,riskPct:s.config.riskPct,minRR:s.config.minRR},requested=validateWorkflowStrategy(work.strategy,before),economicFields=economicSettings.filter(k=>settingChanged(before[k],requested[k]));
 const requestKey=JSON.stringify([work.strategy,work.reason,work.evidenceIds]),freshRequest=work.strategyRequestKey!==requestKey;
 const appliedOperationalFields=freshRequest?operationalSettings.filter(k=>settingChanged(before[k],requested[k])):[];
 const immediate=validateWorkflowStrategy(freshRequest?Object.fromEntries(operationalSettings.map(k=>[k,requested[k]])):{},before);
 s.company.strategy=immediate;
 if(appliedOperationalFields.length){Object.assign(s.policy,{researchDailyLimit:immediate.researchDailyLimit,researchIntervalMinutes:immediate.researchIntervalMinutes});s.policy.version++;work.strategyOperationalAppliedAt=now;}
 work.strategyRequestKey=requestKey;
 const history={before,requested,after:workflowSettings(s),appliedOperationalFields,economicFields};
 if(!economicFields.length){recordStrategyDecision(s,work,{...history,status:appliedOperationalFields.length?'operational':'unchanged'},now);complete(s,work,appliedOperationalFields.length?'Ajustes operacionales aplicados y registrados; la economía vigente se conserva':'Parámetros ya vigentes; no se crea un piloto ni se repite consumo','scout',now);log(s,'auditor','Decisión operacional registrada: '+work.reason);return;}
 const proposedProgram=strategyProgram(s,requested,work.reason);
 if(s.company.shadowProgram&&!canReplacePilot(s,proposedProgram)){
  const result=(appliedOperationalFields.length?'Ajustes operacionales aplicados; ':'')+'cambios económicos diferidos: ya existe el piloto '+s.company.shadowProgram+'. No se han aplicado ni se reinicia su observación.';
  const changed=recordStrategyDecision(s,work,{...history,status:'deferred',programId:s.company.shadowProgram},now);
  if(changed){finishEmployeeWork(s,work.id,result,{status:'blocked',target:'auditor'},now);log(s,'auditor',result,'warning');}else {work.status='blocked';work.notBefore=now+2*3600e3;}
  return;
 }
 let version;
 try{version=installProgram(s,proposedProgram,{id:'initiative:'+work.id},now);}
 catch(error){recordStrategyDecision(s,work,{...history,status:'pilot_rejected',error:error.message},now);finishEmployeeWork(s,work.id,(appliedOperationalFields.length?'Ajustes operacionales aplicados; ':'')+'piloto económico rechazado: '+error.message,{status:'failed',target:'auditor'},now);log(s,'auditor','Piloto rechazado: '+error.message,'warning');return;}
 Object.assign(version,{initiativeId:work.id,owner:work.from,reason:work.reason,evidenceIds:[...work.evidenceIds]});
 recordStrategyDecision(s,work,{...history,after:workflowSettings(s),status:'pilot',programId:version.id,pilotEffective:version.adaptation?.effectiveSettings},now);
 complete(s,work,'Piloto económico v'+version.version+' iniciado; la economía global sigue vigente hasta promoción. '+(appliedOperationalFields.length?'Ajustes operacionales aplicados. ':'' )+'Resultados reales y costes determinarán la revisión.','auditor',now);log(s,'auditor','Piloto validado para la propuesta: '+work.reason);
}
export async function runPreparation(s,{call,checkpoint,log},now=Date.now()){
 const company=s.company,agency=company.agency;refreshSessionPlan(s,now);
 // Pausar entradas no suspende investigación, revisión ni preparación.
 for(const w of pendingEmployeeWork(s,'strategy',now).filter(w=>on(s,w.owner))){
  try{prepareStrategyChange(s,w,log,now);}
  catch(error){finishEmployeeWork(s,w.id,'Cambio rechazado: '+error.message,{status:'failed',target:'auditor'},now);}
 }
 for(const w of pendingEmployeeWork(s,'execution',now).filter(w=>on(s,w.owner))){const e=s.real.events.find(e=>e.id===w.eventId);if(e?.plan?.expiresAt>now&&e.review?.approve&&catalystReady(e,now)&&['nuevo','espera'].includes(e.status)){complete(s,w,'Preapertura preparada para '+e.symbol+': actualizar precio y revalidar los límites en sesión','auditor',now);}else finishEmployeeWork(s,w.id,'Falta un catalizador y plan vigentes con revisión de riesgo aprobada',{status:'blocked',target:'risk'},now);}
 if(agency.preparationDay!==new Date(now).toISOString().slice(0,10)){agency.preparationDay=new Date(now).toISOString().slice(0,10);agency.preparationCalls=0;}
 const launchAnalystPriority=!!company.launch?.active&&on(s,'analyst')&&selectPlanningCandidates(s,now).some(e=>!e.plan);
 if(!launchAnalystPriority&&workflowSettings(s).weekendPlanning&&s.operating?.remainingEur>.01)seedUsefulWork(s,now);
 for(const work of [...pendingEmployeeWork(s,'analysis',now),...pendingEmployeeWork(s,'risk',now)].filter(w=>w.phase==='preliminary')){
  if(!on(s,work.owner))continue;
  const event=s.real.events.find(e=>e.id===work.eventId);if(!event){finishEmployeeWork(s,work.id,'Candidata retirada del radar',{status:'failed',target:'auditor'},now);continue;}
  const profile=s.real.profiles?.[event.symbol],fingerprint=preparationFingerprint(event,profile,s.real.quotes?.[event.symbol]),field=work.kind==='risk'?'preRisk':'preliminary';
  if(event[field]?.fingerprint===fingerprint){complete(s,work,'Se reutiliza el preanálisis guardado; no se repite consumo',event[field].nextOwner,now);continue;}
  if(!profile||!profile.fundamentals?.metrics&&!profile.market){finishEmployeeWork(s,work.id,'Falta ficha financiera utilizable; enriquecimiento solicitado a Santi',{status:'blocked',target:'scout'},now);continue;}
  if(launchAnalystPriority&&!event.confirmed){work.launchDeferredAt??=now;work.launchPriorityReason='Primero preparar los planes de candidatas confirmadas; el preanálisis permanece en cola sin consumo';continue;}
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
 if(work&&!launchHasPlanningWork(s,now)&&s.operating?.remainingEur>.04&&!company.development?.some(j=>['queued','running'].includes(j.status))&&company.lastCodeDay!==new Date(now).toISOString().slice(0,10)){
  try{const files=/estrategia|selecci|catalizador|radar|flujo/i.test(work.task+' '+work.reason)?['trading-worker/strategy.js','trading-worker/preparation.js']:['control/trading.js'];const request={id:work.id,day:new Date(now).toISOString().slice(0,10),chair:{codeFiles:files.filter(f=>developmentFiles.includes(f)),decisions:[{title:work.reason,owner:work.from,evidence:work.evidenceIds}],codeRationale:work.task}};const job=await prepareDevelopment(s,request,(id,instructions,payload,schema,tokens)=>call(id,instructions,payload,schema,{light:true,work:true,outputTokens:tokens,capEur:.02}),checkpoint,now);complete(s,work,job?'Parche real en cola de pruebas y despliegue: '+job.summary:request.codeOutcome||'No procede parche adicional hoy','auditor',now);}
  catch(error){finishEmployeeWork(s,work.id,'Desarrollo aplazado: '+error.message,{status:'failed',target:'designer'},now);log(s,'designer','Desarrollo aplazado: '+error.message,'warning');}
 }
 refreshSessionPlan(s,now);await checkpoint();
}
