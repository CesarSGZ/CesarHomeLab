import {quoteContext,researchReadyAt,researchEvidenceFingerprint,researchAssignmentAnswered,analysisFollowupPending} from './strategy.js';
import {message} from './governance.js';
import {strategyExperiments} from './company.js';
export {researchReadyAt} from './strategy.js';

export const employeeTools={
 scout:['request_research','prioritize_research','handoff','propose_change','wait'],
 analyst:['prepare_plan','prioritize_analysis','handoff','propose_change','wait'],
 risk:['review_plan','flag_risk','handoff','propose_change','wait'],
 operator:['prepare_execution','check_execution','handoff','propose_change','wait'],
 auditor:['tune_strategy','review_outcome','handoff','propose_change','wait'],
 designer:['plan_code','handoff','propose_change','wait']
};
const text={type:'string'},roles=Object.keys(employeeTools),hour=3600e3;
export const actionDescriptions={
 request_research:'Encarga investigación primaria de una candidata apta. Recomprueba una investigación no confirmada tras 24 h o una nueva fuente primaria. Una candidata confirmada sin plan admite preguntas concretas adicionales tras 4 h, sin repetir preguntas ya respondidas ni reabrir rechazos definitivos.',
 prioritize_research:'Prioriza una candidata apta y sin investigación para que Santi verifique fuentes primarias.',
 prepare_plan:'Encarga a Pedro preparar una tesis y umbrales de una candidata confirmada, incluso durante el fin de semana, usando datos y precio de referencia fechado. No compra.',
 prioritize_analysis:'Prioriza una candidata confirmada y sin plan para el análisis de Pedro.',
 review_plan:'Encarga a María contrastar un plan concreto, sus supuestos, escenarios y límites de riesgo; no aprueba mediante esta función.',
 flag_risk:'Registra una objeción de riesgo sobre una candidata o posición real y la entrega a Pedro.',
 prepare_execution:'Encarga a Yari preparar la vigilancia y comprobación de un plan aprobado para la siguiente sesión. Un precio antiguo nunca autoriza una operación.',
 check_execution:'Comprueba planes pendientes, posiciones y estado del mercado sin crear operaciones.',
 tune_strategy:'Presenta parámetros concretos de búsqueda y riesgo, con evidencia, a la validación y al debate de Augusto. Puede resolver cuellos de botella de investigación sin esperar cierres; no cambia el presupuesto.',
 review_outcome:'Registra una revisión de un cierre real o del cuello de botella actual y la entrega al equipo.',
 plan_code:'Encarga una mejora concreta del código de la oficina al flujo de desarrollo de Cadaqui, con pruebas y despliegue.',
 propose_change:'Propone un cambio concreto del sistema para debatirlo y validarlo.',
 handoff:'Entrega un encargo con evidencia a otro empleado y despierta su agente.',
 wait:'Espera con un motivo concreto y una fecha de revisión. Con trabajo útil disponible no esperes varios días.'
};
const strategyProperties={minScore:{type:['number','null']},researchDailyLimit:{type:['integer','null']},researchIntervalMinutes:{type:['integer','null']},riskPct:{type:['number','null'],minimum:.1,maximum:2},minRR:{type:['number','null'],minimum:1,maximum:8},researchBatchSize:{type:['integer','null']},enrichmentLimit:{type:['integer','null']},focusSectors:{type:['array','null'],maxItems:4,items:text},catalystKinds:{type:['array','null'],maxItems:6,items:text},weekendPlanning:{type:['boolean','null']}};
export const initiativeSchema={type:'object',additionalProperties:false,properties:{goal:text,decision:text,tool:{type:'string',enum:[...new Set(Object.values(employeeTools).flat())]},target:{type:'string',enum:[...roles,'none']},eventId:text,evidenceIds:{type:'array',maxItems:4,items:text},nextTask:text,wakeHours:{type:'integer',minimum:2,maximum:48},strategy:{anyOf:[{type:'object',additionalProperties:false,properties:strategyProperties,required:Object.keys(strategyProperties)},{type:'null'}]}},required:['goal','decision','tool','target','eventId','evidenceIds','nextTask','wakeHours','strategy']};

export function initialiseEmployees(s,now=Date.now()){
 s.company??={};const c=s.company;c.agency??={version:3,actors:{},journal:[],workQueue:[],lastDispatch:0,day:'',runsToday:0};
 c.agency.workQueue??=[];
 for(const id of roles)c.agency.actors[id]??={id,goal:'Conservar capital y encontrar ventaja con evidencia',nextTask:'Examinar el estado y decidir una iniciativa útil',nextWake:now,inbox:[],memory:[],runs:0,runsToday:0,costEur:0,lastAction:null};
 if(c.agency.version<3){c.agency.version=3;c.agency.lastDispatch=0;for(const a of Object.values(c.agency.actors)){a.nextWake=now;a.goal=s.agents.find(p=>p.id===a.id)?.objective||a.goal;a.nextTask={scout:'Confirmar y actualizar catalizadores aptos usando fuentes primarias',analyst:'Comparar candidatas y preparar planes preliminares o confirmados',risk:'Contrastar supuestos y preparar revisión independiente del radar',operator:'Preparar vigilancia y comprobaciones de la próxima sesión',auditor:'Evaluar costes y cuellos de botella; proponer parámetros concretos',designer:'Convertir el estado y los pendientes del equipo en mejoras de código útiles'}[a.id];a.inbox.push({from:'system',time:now,task:'Nuevas herramientas ejecutables: investigación/reintentos, planificación fuera de sesión, revisión, preapertura y parámetros de estrategia. La configuración y los perfiles disponibles están en el contexto. Resuelve trabajo concreto y comparte resultados; no esperes datos que ya están disponibles.',status:'pendiente'});a.inbox=a.inbox.slice(-12);}}
 return c.agency;
}

export function dueEmployee(s,now=Date.now()){
 const agency=initialiseEmployees(s,now),day=new Date(now).toISOString().slice(0,10);
 if(agency.day!==day){agency.day=day;agency.runsToday=0;for(const actor of Object.values(agency.actors)){actor.runsToday=0;actor.attemptsToday=0;}}
 if(agency.runsToday>=6||now-agency.lastDispatch<hour||s.operating?.remainingEur<.05)return null;
 return roles.map(id=>agency.actors[id]).filter(a=>a.nextWake<=now&&!s.agents.find(p=>p.id===a.id)?.paused).sort((a,b)=>Math.max(a.attemptsToday||0,a.runsToday||0)-Math.max(b.attemptsToday||0,b.runsToday||0)||Number(b.inbox.some(m=>m.status==='pendiente'))-Number(a.inbox.some(m=>m.status==='pendiente'))||a.nextWake-b.nextWake||a.runs-b.runs)[0]||null;
}

function eventStage(e){return !e.confirmed||analysisFollowupPending(e)?'research':!e.plan?'analysis':!e.review?'risk':e.review.approve&&e.status==='espera'?'execution':null;}
const workOwner={research:'scout',analysis:'analyst',risk:'risk',execution:'operator',strategy:'auditor',code:'designer'};

export function queueEmployeeWork(s,kind,eventId,decision,now=Date.now()){
 const agency=initialiseEmployees(s,now),owner=workOwner[kind];if(!owner)throw Error('Tipo de encargo inválido');
 let work=agency.workQueue.find(w=>w.kind===kind&&w.eventId===eventId&&['pending','running','blocked'].includes(w.status));
 const event=s.real.events.find(e=>e.id===eventId),notBefore=kind==='research'&&event?researchReadyAt(event,now):now;
 if(kind==='research'&&event?.confirmed&&researchAssignmentAnswered(s,event,decision.nextTask))return agency.workQueue.find(w=>w.kind==='research'&&w.eventId===eventId&&w.status==='complete'&&w.evidenceFingerprintAtFinish===researchEvidenceFingerprint(event)&&String(w.task).trim().replace(/\s+/g,' ').toLowerCase()===String(decision.nextTask).trim().replace(/\s+/g,' ').toLowerCase());
 if(work){if(kind==='research'&&work.status!=='running'){const task=String(decision.nextTask).slice(0,500);if(task!==work.task){work.task=task;work.reason=String(decision.decision).slice(0,700);work.updatedAt=now;work.evidenceFingerprintAtRequest=event?researchEvidenceFingerprint(event):null;}work.notBefore=Math.min(work.notBefore,notBefore);if(event?.employeePriority?.workId===work.id){event.employeePriority.notBefore=work.notBefore;event.employeePriority.time=Math.max(work.createdAt,work.updatedAt||0);}}if(['strategy','code'].includes(kind)&&work.status!=='running'){work.reason=String(decision.decision).slice(0,700);work.task=String(decision.nextTask).slice(0,500);work.strategy=decision.strategy||null;work.evidenceIds=decision.evidenceIds||[];}return work;}
 work={id:crypto.randomUUID(),kind,phase:['analysis','risk'].includes(kind)&&(!event?.confirmed||kind==='risk'&&!event?.plan)?'preliminary':'confirmed',owner,from:decision.owner||owner,eventId,reason:String(decision.decision).slice(0,700),task:String(decision.nextTask).slice(0,500),evidenceIds:decision.evidenceIds||[],strategy:decision.strategy||null,createdAt:now,notBefore,status:'pending',attempts:0,result:null};
 if(kind==='research'&&event)work.evidenceFingerprintAtRequest=researchEvidenceFingerprint(event);
 agency.workQueue.unshift(work);agency.workQueue=agency.workQueue.filter((w,i)=>i<60||['pending','running','blocked'].includes(w.status)).slice(0,120);
 if(event)event.employeePriority={owner,kind,time:now,notBefore,reason:work.reason,workId:work.id};
 const actor=agency.actors[owner];actor.nextWake=Math.min(actor.nextWake,notBefore);return work;
}

export function pendingEmployeeWork(s,kind,now=Date.now()){
 return initialiseEmployees(s,now).workQueue.filter(w=>w.kind===kind&&['pending','blocked'].includes(w.status)&&w.notBefore<=now).sort((a,b)=>a.createdAt-b.createdAt);
}

export function finishEmployeeWork(s,workId,result,{status='complete',target,eventId}={},now=Date.now()){
 const agency=initialiseEmployees(s,now),work=agency.workQueue.find(w=>w.id===workId);if(!work)throw Error('Encargo inexistente');
 if(!['complete','blocked','failed'].includes(status))throw Error('Resultado de encargo inválido');
 work.status=status;work.result=String(result).slice(0,1000);work.finishedAt=now;work.attempts++;
 if(work.kind==='research'&&status==='complete'){const event=s.real.events.find(e=>e.id===work.eventId);if(event)work.evidenceFingerprintAtFinish=researchEvidenceFingerprint(event);}
 if(status==='blocked')work.notBefore=now+(work.kind==='research'?24:2)*hour;
 const actor=agency.actors[work.owner];actor.memory.push({time:now,goal:actor.goal,decision:work.task,result:work.result,workId:work.id});actor.memory=actor.memory.slice(-8);
 const peer=target||({research:'analyst',analysis:'risk',risk:'operator',execution:'auditor',strategy:'scout',code:'auditor'}[work.kind]);
 if(peer){const receiver=agency.actors[peer];receiver.inbox.push({id:crypto.randomUUID(),from:work.owner,to:peer,time:now,task:work.result,evidenceIds:work.evidenceIds,eventId:eventId||work.eventId,status:'pendiente',workId:work.id});receiver.inbox=receiver.inbox.slice(-12);receiver.nextWake=Math.min(receiver.nextWake,now);message(s,work.owner,peer,work.result,now);}
 const remaining=agency.workQueue.filter(w=>w.owner===work.owner&&['pending','running','blocked'].includes(w.status)).sort((a,b)=>a.createdAt-b.createdAt);
 actor.nextTask=remaining[0]?.task||(status==='complete'?'Contrastar el resultado y seguir el encargo con '+(s.agents.find(a=>a.id===peer)?.name||'el equipo')+': ':'Resolver el bloqueo: ')+work.result.slice(0,240);
 agency.journal.unshift({agent:work.owner,time:now,tool:work.kind,decision:work.task,result:work.result,evidenceIds:work.evidenceIds,workId:work.id});agency.journal=agency.journal.slice(0,80);return work;
}

function compactProfile(profile){
 if(!profile)return null;const f=profile.fundamentals,m=f?.metrics||{};
 const quarter=f?.latestQuarter;
 return {checkedAt:profile.checkedAt,errors:profile.errors?.slice(0,2),fundamentals:f?{checkedAt:f.checkedAt,source:f.source,metrics:Object.fromEntries(['annualEnd','annualAgeDays','revenueYoY','fcf','netMargin','cashLatest','cashDate','debtToEbitda','shareGrowth','pe','pb','evToEbitda','roe'].map(k=>[k,m[k]??null])),latestQuarter:quarter?{start:quarter.start,end:quarter.end,filed:quarter.filed,metrics:quarter.metrics,evidence:quarter.evidence?.slice(0,3),limitations:quarter.limitations}:null,evidence:f.evidence?.slice(0,3),limitations:f.limitations?.slice(0,1)}:null,market:profile.market?{asOf:profile.market.asOf,return5d:profile.market.return5d,return21d:profile.market.return21d,return63d:profile.market.return63d,averageDollarVolume:profile.market.averageDollarVolume,relativeVolume:profile.market.relativeVolume,beta1y:profile.market.beta1y}:null};
}
export function employeeContext(s,actor,now=Date.now()){
 const assigned=JSON.stringify([actor.inbox,s.company.tasks?.filter(t=>t.owner===actor.id)||[]]);
 const events=s.real.events.filter(e=>!['caducado','descartado'].includes(e.status)).sort((a,b)=>Number(assigned.includes(b.id)||assigned.includes(b.symbol))-Number(assigned.includes(a.id)||assigned.includes(a.symbol))||Number(workOwner[eventStage(b)]===actor.id)-Number(workOwner[eventStage(a)]===actor.id)||(b.preScore?.score||0)-(a.preScore?.score||0)).slice(0,3);
 const active=s.real.events.filter(e=>!['caducado','descartado','abierto'].includes(e.status));
 const backlog=Object.fromEntries(['research','analysis','risk','execution'].map(kind=>[kind,{count:active.filter(e=>eventStage(e)===kind).length,ids:active.filter(e=>eventStage(e)===kind).slice(0,6).map(e=>e.id)}]));
 return {now:new Date(now).toISOString(),role:s.agents.find(a=>a.id===actor.id)?.role,goal:actor.goal,nextTask:actor.nextTask,inbox:actor.inbox.slice(-4),memory:actor.memory.slice(-3),tools:employeeTools[actor.id],budget:{remaining:s.operating?.remainingEur,pace:s.operating?.paceEurPerDay,monthlyProfit:s.operating?.monthlyProfit,benefitEquivalent:s.operating?.benefitEquivalent,unitsRemaining:s.operating?.unitsRemaining,daysLeft:s.operating?.daysLeft,targetPaperProfit:10000,maxRealTokenCostEur:10,rule:'Rentabilidad ficticia no garantizada; no aumentar riesgo por prisa'},sessionPreparation:s.company.sessionPlan||null,configuration:{config:{riskPct:s.config?.riskPct,minRR:s.config?.minRR,maxEntries:s.config?.maxEntries,maxPositions:s.config?.maxPositions,horizonDays:s.config?.horizonDays},policy:s.policy,strategy:s.company.strategy||null,activeProgram:s.company.activeProgram,shadowProgram:s.company.shadowProgram},market:{status:s.real.marketStatus,at:s.real.marketAt,providerError:s.real.marketError,planningOutsideSession:true},discovery:{universe:s.real.discovery?.universe,enriched:s.real.discovery?.enriched,queued:s.real.discovery?.queued,lastAt:s.real.discovery?.lastAt,sources:s.real.discovery?.sources},backlog,workQueue:initialiseEmployees(s,now).workQueue.filter(w=>['pending','running','blocked'].includes(w.status)).slice(0,8).map(w=>({id:w.id,owner:w.owner,kind:w.kind,phase:w.phase,eventId:w.eventId,status:w.status,notBefore:w.notBefore,task:w.task?.slice(0,240),reason:w.reason?.slice(0,180),result:w.result})),events:events.map(e=>({id:e.id,symbol:e.symbol,status:e.status,confirmed:e.confirmed,date:e.date,score:e.preScore?.score,eligible:!!e.preScore?.eligible,reasons:e.preScore?.reasons||e.reasons,summary:e.summary?.slice(0,350),sources:e.sources?.slice(0,2),research:e.research?{researchedAt:e.research.researchedAt,probabilityPositive:e.research.probabilityPositive,upsidePct:e.research.upsidePct,downsidePct:e.research.downsidePct,uncertainties:e.research.uncertainties?.slice(0,200)}:null,researchReadyAt:researchReadyAt(e,now),analysisFollowup:analysisFollowupPending(e)?{reason:e.analysisFollowup.reason,missingEvidence:e.analysisFollowup.missingEvidence,nextTask:e.analysisFollowup.nextTask,baselineResearchAt:e.analysisFollowup.baselineResearchAt}:null,analysisDeferred:e.analysisDeferred||null,financialProfile:compactProfile(s.real.profiles?.[e.symbol]),priceReference:quoteContext(s.real.quotes?.[e.symbol]),plan:e.plan||null,review:e.review||null})),positions:s.real.book.positions.slice(0,20).map(p=>({id:p.id,symbol:p.symbol,entry:p.entry,mark:p.mark,stop:p.stop,target:p.target})),closed:s.real.book.closed.slice(-3).map(t=>({id:t.id,symbol:t.symbol,pnl:t.pnl,reason:t.reason})),metrics:s.kpis,experiments:strategyExperiments(s),assignments:s.company.tasks?.filter(t=>t.owner===actor.id).slice(-2)||[],recentChanges:s.company.development?.slice(0,2).map(j=>({summary:j.summary,status:j.status}))||[]};
}

export function validateEmployeeStrategy(strategy){
 if(!strategy||Object.keys(strategy).some(k=>!Object.hasOwn(strategyProperties,k)))throw Error('Parámetros de estrategia fuera del laboratorio');
 const limits={minScore:[30,90],researchDailyLimit:[1,12,true],researchIntervalMinutes:[30,240,true],riskPct:[.1,2],minRR:[1,8],researchBatchSize:[1,3,true],enrichmentLimit:[1,8,true]};
 for(const [key,[min,max,integer]] of Object.entries(limits)){const v=strategy[key];if(v!==null&&v!==undefined&&(!Number.isFinite(v)||v<min||v>max||integer&&!Number.isInteger(v)))throw Error('Parámetros de estrategia fuera del laboratorio');}
 for(const [key,max] of [['focusSectors',4],['catalystKinds',6]]){const v=strategy[key];if(v!==null&&v!==undefined&&(!Array.isArray(v)||v.length>max||new Set(v).size!==v.length||v.some(x=>typeof x!=='string'||!x.length||x.length>80)))throw Error('Foco de estrategia inválido');}
 if(strategy.weekendPlanning!==null&&strategy.weekendPlanning!==undefined&&typeof strategy.weekendPlanning!=='boolean')throw Error('Planificación inválida');
 if(!Object.values(strategy).some(v=>v!==null&&v!==undefined))throw Error('Cambio de estrategia vacío');
 return strategy;
}

export function executeEmployeeDecision(s,id,decision,now=Date.now()){
 const agency=initialiseEmployees(s,now),actor=agency.actors[id];if(!actor||!employeeTools[id].includes(decision.tool))throw Error('Herramienta ajena al empleado');
 if(!Number.isInteger(decision.wakeHours)||decision.wakeHours<2||decision.wakeHours>48)throw Error('Cadencia inválida');
 const event=s.real.events.find(e=>e.id===decision.eventId),position=s.real.book.positions.find(p=>p.id===decision.eventId||p.symbol===decision.eventId),trade=s.real.book.closed.find(t=>t.id===decision.eventId||t.symbol===decision.eventId);
 const known=new Set([...s.real.events.map(e=>e.id),...s.real.book.positions.flatMap(p=>[p.id,p.symbol]),...s.real.book.closed.flatMap(t=>[t.id,t.symbol]),'kpis','budget','discovery','configuration']);
 if(!Array.isArray(decision.evidenceIds)||decision.evidenceIds.some(x=>!known.has(x)))throw Error('Referencia de evidencia desconocida');
 let result='Iniciativa registrada';const queue=(kind)=>queueEmployeeWork(s,kind,decision.eventId,{...decision,owner:id},now);
 if(['request_research','prioritize_research'].includes(decision.tool)){
  if(!event||!event.preScore?.eligible||['abierto','caducado','descartado'].includes(event.status)||event.confirmed&&(event.plan||event.review?.approve===false||event.research?.worthAnalyzing===false||decision.tool!=='request_research'||String(decision.nextTask||'').trim().length<12)||decision.tool==='prioritize_research'&&event.research)throw Error('Candidata no apta para investigación');
  const work=queue('research');result=work.status==='complete'?'Pregunta ya respondida con la misma evidencia; reutilizar el resultado sin consumo':work.notBefore>now?'Recomprobación encargada tras el cooldown: '+new Date(work.notBefore).toISOString():'Investigación primaria encargada a Santi';
 }else if(['prepare_plan','prioritize_analysis'].includes(decision.tool)){
  if(!event||event.plan||decision.tool==='prioritize_analysis'&&!event.confirmed||!event.confirmed&&!event.preScore?.eligible)throw Error('Falta evidencia confirmada o ya existe plan');const work=queue('analysis');result=work.phase==='preliminary'?'Comparación preliminar encargada a Pedro; no autoriza compras sin evidencia contrastada':'Plan encargado a Pedro; puede analizar fuera de sesión con referencias fechadas';
 }else if(decision.tool==='review_plan'){
  if(!event||event.review||!event.plan&&!event.preScore?.eligible)throw Error('No hay candidata o plan pendiente de revisión');const work=queue('risk');result=work.phase==='preliminary'?'Lista de riesgos preliminar encargada a María; no constituye aprobación':'Contraste independiente encargado a María sobre el plan real';
 }else if(decision.tool==='prepare_execution'){
  if(!event?.plan||!event.review?.approve||event.status!=='espera')throw Error('No existe plan aprobado pendiente');queue('execution');result='Preapertura y vigilancia encargadas a Yari; ejecución solo con cotización válida';
 }else if(decision.tool==='flag_risk'){
  if(!event&&!position)throw Error('Plan o posición inexistente');s.company.riskNotes??=[];s.company.riskNotes.unshift({owner:id,eventId:decision.eventId,time:now,note:decision.decision});s.company.riskNotes=s.company.riskNotes.slice(0,20);message(s,id,'analyst','Riesgo en '+(event?.symbol||position.symbol)+': '+decision.decision,now);result='Objeción de riesgo entregada a Pedro para contrastar su tesis';
 }else if(decision.tool==='check_execution'){
  const plans=s.real.events.filter(e=>e.plan&&e.review?.approve&&e.status==='espera');actor.executionCheck={time:now,waitingPlans:plans.length,positions:s.real.book.positions.length,marketStatus:s.real.marketStatus};result='Comprobación real: '+plans.length+' planes en espera y '+s.real.book.positions.length+' posiciones; sin crear órdenes';
 }else if(decision.tool==='tune_strategy'){
  validateEmployeeStrategy(decision.strategy);if(!decision.evidenceIds.length)throw Error('Falta evidencia para modificar el sistema');queue('strategy');s.company.employeeIdeas??=[];s.company.employeeIdeas.unshift({owner:id,time:now,goal:decision.goal,proposal:decision.decision,evidenceIds:decision.evidenceIds,nextTask:decision.nextTask,strategy:decision.strategy,status:'validación pendiente'});s.company.employeeIdeas=s.company.employeeIdeas.slice(0,24);message(s,id,'scout','Ajuste concreto de flujo propuesto: '+decision.decision,now);result='Parámetros concretos enviados a validación central; presupuesto y libro conservados';
 }else if(decision.tool==='review_outcome'){
  if(decision.eventId&&!trade&&!event)throw Error('Cierre o candidata inexistente');message(s,id,decision.target!=='none'&&roles.includes(decision.target)?decision.target:'scout',decision.decision+' · '+decision.nextTask,now);result='Revisión de hechos entregada al equipo para resolver el siguiente cuello de botella';
 }else if(['plan_code','propose_change'].includes(decision.tool)){
  s.company.employeeIdeas??=[];s.company.employeeIdeas.unshift({owner:id,time:now,goal:decision.goal,proposal:decision.decision,evidenceIds:decision.evidenceIds,nextTask:decision.nextTask,status:'propuesta'});s.company.employeeIdeas=s.company.employeeIdeas.slice(0,24);if(decision.tool==='plan_code')queue('code');message(s,id,'auditor',decision.decision+' · '+decision.nextTask,now);result='Propuesta concreta entregada a Augusto y al flujo de desarrollo de Cadaqui';
 }else if(decision.tool==='handoff'){
  if(!roles.includes(decision.target)||decision.target===id)throw Error('Destinatario inválido');const peer=agency.actors[decision.target],mail={id:crypto.randomUUID(),from:id,to:decision.target,time:now,task:decision.nextTask,evidenceIds:decision.evidenceIds,eventId:decision.eventId,status:'pendiente'};peer.inbox.push(mail);peer.inbox=peer.inbox.slice(-12);peer.nextWake=Math.min(peer.nextWake,now);message(s,id,decision.target,decision.decision+' · '+decision.nextTask,now);result='Encargo entregado a '+s.agents.find(a=>a.id===decision.target)?.name;
 }else if(decision.tool==='wait')result='Espera decidida por el empleado: '+String(decision.decision).slice(0,200);
 actor.goal=String(decision.goal).slice(0,250);actor.nextTask=String(decision.nextTask).slice(0,450);const useful=s.real.events.some(e=>!['descartado','caducado'].includes(e.status)&&workOwner[eventStage(e)]===id&&(e.confirmed||e.preScore?.eligible));actor.nextWake=now+Math.min(decision.wakeHours,useful?6:48)*hour;actor.inbox.forEach(m=>m.status='leído');actor.lastAction={time:now,tool:decision.tool,decision:decision.decision,result,evidenceIds:decision.evidenceIds};actor.memory.push({time:now,goal:actor.goal,decision:decision.decision,result});actor.memory=actor.memory.slice(-8);actor.runs++;actor.runsToday=(actor.runsToday||0)+1;
 agency.journal.unshift({agent:id,...actor.lastAction});agency.journal=agency.journal.slice(0,80);return result;
}

export async function runEmployeeInitiative(s,{call,checkpoint,log},now=Date.now()){
 if(s.company?.launch?.active&&s.company.launch.priorityUseful){
  const agency=initialiseEmployees(s,now),counts=s.company.pipeline?.counts||{},owner=counts.analysisReady?'analyst':counts.riskPending?'risk':counts.approvedWaiting?'operator':'scout';
  const work=agency.workQueue.filter(w=>w.owner===owner&&['research','analysis','risk','execution'].includes(w.kind)&&w.phase!=='preliminary'&&['pending','running','blocked'].includes(w.status)&&w.notBefore<=now).sort((a,b)=>a.createdAt-b.createdAt)[0],agent=s.agents.find(a=>a.id===owner);
  if(agent&&!agent.paused&&agent.status!=='trabajando'){agent.status='pendiente';agent.task='Prioridad operativa: '+(work?.task||({analyst:'Preparar planes fundamentados con los datos disponibles',risk:'Revisar los planes pendientes de forma independiente',operator:'Comprobar los planes preparados y sus condiciones de ejecución',scout:'Contrastar las candidatas priorizadas con fuentes primarias'}[owner]));}
  await checkpoint();return null;
 }
 const actor=dueEmployee(s,now);if(!actor)return null;
 const agency=s.company.agency,agent=s.agents.find(a=>a.id===actor.id),cap=Math.min(.0025,(s.operating.paceEurPerDay||0)*.04);
 if(cap<.0008)return null;
 agency.lastDispatch=now;agency.runsToday++;actor.attemptsToday=(actor.attemptsToday||0)+1;agent.status='trabajando';agent.task='Iniciativa propia · '+actor.nextTask;await checkpoint();
 try{const answer=await call(actor.id,'Eres un agente especialista autónomo de una empresa ficticia, con objetivo, memoria e inbox propios. Elige UNA función útil para hacer avanzar trabajo real. Hay configuración, perfiles y referencias fechadas: no afirmes que faltan sin comprobar el contexto. Fuera de sesión y fines de semana se investigan catalizadores, se comparan tesis y se preparan planes y revisiones para la próxima sesión; las compras esperan precios válidos. Santi solicita investigación/reintentos con cooldown; Pedro prepara planes confirmados; María contrasta planes y objeta riesgos; Yari prepara preapertura; Augusto propone parámetros concretos y resuelve cuellos de botella; Cadaqui encarga mejoras de código. Compartid hechos y discrepancias mediante handoff y resultados, no charlas continuas. Decide cuándo volver (2-48 h), normalmente 2-6 h si hay backlog; no esperes 48 h por datos presentes. Si falta evidencia, encarga el siguiente paso específico. La meta de 10.000 EUR ficticios al mes paga 10 EUR reales de IA según la ficción; es ambiciosa, no obliga a asumir riesgos ni a fabricar beneficios. No afirmes trabajo realizado antes del resultado. Usa solo IDs conocidos; configuration, kpis, budget y discovery son evidencia disponible. strategy=null salvo tune_strategy: propone parámetros concretos útiles y deja null los demás para conservarlos. Autonomía amplia para cambiar lógica mediante propuestas y desarrollo de oficina, con controles de presupuesto y dinero ficticio permanentes. Máximo 100 palabras entre textos.',employeeContext(s,actor,now),initiativeSchema,{light:true,outputTokens:550,capEur:cap,actions:employeeTools[actor.id]});actor.costEur+=Number.isFinite(answer._costEur)?answer._costEur:0;const result=executeEmployeeDecision(s,actor.id,answer,now);log(s,actor.id,'Iniciativa propia: '+result);}catch(error){actor.nextWake=now+2*hour;actor.lastError=String(error.message).slice(0,180);log(s,actor.id,'Iniciativa aplazada: '+actor.lastError,'warning');}finally{agent.status='esperando';agent.task=actor.nextTask;await checkpoint();}return actor;
}
