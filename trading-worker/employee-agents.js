import {message} from './governance.js';

export const employeeTools={
 scout:['prioritize_research','handoff','propose_change','wait'],
 analyst:['prioritize_analysis','handoff','propose_change','wait'],
 risk:['flag_risk','handoff','propose_change','wait'],
 operator:['check_execution','handoff','propose_change','wait'],
 auditor:['review_outcome','handoff','propose_change','wait'],
 designer:['plan_code','handoff','propose_change','wait']
};
const text={type:'string'},roles=Object.keys(employeeTools);
export const actionDescriptions={prioritize_research:'Prioriza una candidata apta y sin investigación para que Santi verifique fuentes primarias en el ciclo de investigación.',prioritize_analysis:'Prioriza una candidata confirmada y sin plan para el análisis de Pedro.',flag_risk:'Registra una objeción de riesgo sobre una candidata o posición real.',check_execution:'Comprueba planes pendientes, posiciones y estado del mercado sin crear operaciones.',review_outcome:'Registra una revisión de un cierre real o del estado general para la reunión.',plan_code:'Envía una propuesta de código de la oficina al debate de Augusto y al desarrollo de Cadaqui.',propose_change:'Propone un cambio concreto del sistema para debatirlo y validarlo.',handoff:'Entrega un encargo a otro empleado y despierta su agente.',wait:'Decide esperar hasta la próxima activación cuando no hay una acción útil respaldada.'};
export const initiativeSchema={type:'object',additionalProperties:false,properties:{goal:text,decision:text,tool:{type:'string',enum:[...new Set(Object.values(employeeTools).flat())]},target:{type:'string',enum:[...roles,'none']},eventId:text,evidenceIds:{type:'array',maxItems:4,items:text},nextTask:text,wakeHours:{type:'integer',minimum:2,maximum:48}},required:['goal','decision','tool','target','eventId','evidenceIds','nextTask','wakeHours']};

export function initialiseEmployees(s,now=Date.now()){
 s.company??={};const c=s.company;c.agency??={version:2,actors:{},journal:[],lastDispatch:0,day:'',runsToday:0};
 for(const id of roles)c.agency.actors[id]??={id,goal:'Conservar capital y encontrar ventaja con evidencia',nextTask:'Examinar el estado y decidir una iniciativa útil',nextWake:now,inbox:[],memory:[],runs:0,costEur:0,lastAction:null};
 if(c.agency.version<2){c.agency.version=2;c.agency.lastDispatch=0;for(const a of Object.values(c.agency.actors)){a.nextWake=now;a.inbox.push({from:'system',time:now,task:'Las herramientas de iniciativa ya están registradas como funciones ejecutables. Puedes priorizar investigación, delegar o utilizar las funciones de tu rol.',status:'pendiente'});a.inbox=a.inbox.slice(-12);}}
 return c.agency;
}

export function dueEmployee(s,now=Date.now()){
 const agency=initialiseEmployees(s,now),day=new Date(now).toISOString().slice(0,10);
 if(agency.day!==day){agency.day=day;agency.runsToday=0;}
 if(s.paused||agency.runsToday>=6||now-agency.lastDispatch<60*60e3||s.operating?.remainingEur<.05)return null;
 return roles.map(id=>agency.actors[id]).filter(a=>a.nextWake<=now&&!s.agents.find(p=>p.id===a.id)?.paused).sort((a,b)=>a.nextWake-b.nextWake||a.runs-b.runs)[0]||null;
}

export function employeeContext(s,actor,now=Date.now()){
 const assigned=JSON.stringify([actor.inbox,s.company.tasks?.filter(t=>t.owner===actor.id)||[]]);
 const events=s.real.events.filter(e=>!['caducado','descartado'].includes(e.status)).sort((a,b)=>Number(assigned.includes(b.symbol))-Number(assigned.includes(a.symbol))||(b.preScore?.score||0)-(a.preScore?.score||0)).slice(0,6);
 return {now:new Date(now).toISOString(),role:s.agents.find(a=>a.id===actor.id)?.role,goal:actor.goal,nextTask:actor.nextTask,inbox:actor.inbox.slice(-4),memory:actor.memory.slice(-3),tools:employeeTools[actor.id],budget:{remaining:s.operating?.remainingEur,pace:s.operating?.paceEurPerDay},events:events.map(e=>({id:e.id,symbol:e.symbol,status:e.status,confirmed:e.confirmed,date:e.date,score:e.preScore?.score,eligible:!!e.preScore?.eligible,summary:e.summary?.slice(0,280),research:!!e.research,plan:!!e.plan,review:e.review?.approve})),positions:s.real.book.positions.slice(0,20).map(p=>({id:p.id,symbol:p.symbol,entry:p.entry,mark:p.mark,stop:p.stop,target:p.target})),closed:s.real.book.closed.slice(-3).map(t=>({id:t.id,symbol:t.symbol,pnl:t.pnl,reason:t.reason})),metrics:s.kpis,assignments:s.company.tasks?.filter(t=>t.owner===actor.id).slice(-2)||[],recentChanges:s.company.development?.slice(0,2).map(j=>({summary:j.summary,status:j.status}))||[]};
}

export function executeEmployeeDecision(s,id,decision,now=Date.now()){
 const agency=initialiseEmployees(s,now),actor=agency.actors[id];if(!actor||!employeeTools[id].includes(decision.tool))throw Error('Herramienta ajena al empleado');
 if(!Number.isInteger(decision.wakeHours)||decision.wakeHours<2||decision.wakeHours>48)throw Error('Cadencia inválida');
 const event=s.real.events.find(e=>e.id===decision.eventId),position=s.real.book.positions.find(p=>p.id===decision.eventId||p.symbol===decision.eventId),trade=s.real.book.closed.find(t=>t.id===decision.eventId||t.symbol===decision.eventId);
 const known=new Set([...s.real.events.map(e=>e.id),...s.real.book.positions.flatMap(p=>[p.id,p.symbol]),...s.real.book.closed.flatMap(t=>[t.id,t.symbol]),'kpis','budget','discovery']);
 if(decision.evidenceIds.some(x=>!known.has(x)))throw Error('Referencia de evidencia desconocida');
 let result='Iniciativa registrada';
 if(decision.tool==='prioritize_research'){if(!event||event.research||!event.preScore?.eligible)throw Error('Candidata no apta para investigación');event.employeePriority={owner:id,time:now,reason:decision.decision};result='Candidata priorizada para la próxima investigación de Santi';}
 else if(decision.tool==='prioritize_analysis'){if(!event?.confirmed||event.plan)throw Error('Falta evidencia confirmada o ya existe plan');event.employeePriority={owner:id,time:now,reason:decision.decision};result='Análisis priorizado; conserva límites y validación';}
 else if(decision.tool==='flag_risk'){if(!event&&!position)throw Error('Plan o posición inexistente');s.company.riskNotes??=[];s.company.riskNotes.unshift({owner:id,eventId:decision.eventId,time:now,note:decision.decision});s.company.riskNotes=s.company.riskNotes.slice(0,20);result='Observación de riesgo guardada para el análisis y la reunión';}
 else if(decision.tool==='check_execution'){const plans=s.real.events.filter(e=>e.plan&&e.review?.approve&&e.status==='espera');actor.executionCheck={time:now,waitingPlans:plans.length,positions:s.real.book.positions.length,marketStatus:s.real.marketStatus};result='Estado real de ejecución revisado; sin crear órdenes';}
 else if(decision.tool==='review_outcome'){if(decision.eventId&&!trade&&!event)throw Error('Cierre o candidata inexistente');result='Revisión registrada para contrastar en la siguiente reunión';}
 else if(['plan_code','propose_change'].includes(decision.tool)){s.company.employeeIdeas??=[];s.company.employeeIdeas.unshift({owner:id,time:now,goal:decision.goal,proposal:decision.decision,evidenceIds:decision.evidenceIds,nextTask:decision.nextTask,status:'propuesta'});s.company.employeeIdeas=s.company.employeeIdeas.slice(0,24);result='Propuesta enviada al debate y al flujo de desarrollo de Cadaqui';}
 else if(decision.tool==='handoff'){if(!roles.includes(decision.target)||decision.target===id)throw Error('Destinatario inválido');const peer=agency.actors[decision.target],mail={id:crypto.randomUUID(),from:id,to:decision.target,time:now,task:decision.nextTask,evidenceIds:decision.evidenceIds,eventId:decision.eventId,status:'pendiente'};peer.inbox.push(mail);peer.inbox=peer.inbox.slice(-12);peer.nextWake=Math.min(peer.nextWake,now);message(s,id,decision.target,decision.decision+' · '+decision.nextTask,now);result='Encargo entregado a '+s.agents.find(a=>a.id===decision.target)?.name;}
 else if(decision.tool==='wait')result='Espera decidida por el empleado para evitar gasto sin utilidad';
 actor.goal=String(decision.goal).slice(0,250);actor.nextTask=String(decision.nextTask).slice(0,450);actor.nextWake=now+decision.wakeHours*3600e3;actor.inbox.forEach(m=>m.status='leído');actor.lastAction={time:now,tool:decision.tool,decision:decision.decision,result,evidenceIds:decision.evidenceIds};actor.memory.push({time:now,goal:actor.goal,decision:decision.decision,result});actor.memory=actor.memory.slice(-8);actor.runs++;
 agency.journal.unshift({agent:id,...actor.lastAction});agency.journal=agency.journal.slice(0,80);return result;
}

export async function runEmployeeInitiative(s,{call,checkpoint,log},now=Date.now()){
 const actor=dueEmployee(s,now);if(!actor)return null;
 const agency=s.company.agency,agent=s.agents.find(a=>a.id===actor.id),cap=Math.min(.0025,(s.operating.paceEurPerDay||0)*.04);
 if(cap<.0008)return null;
 agency.lastDispatch=now;agency.runsToday++;agent.status='trabajando';agent.task='Iniciativa propia · '+actor.nextTask;await checkpoint();
 try{const answer=await call(actor.id,'Eres un agente especialista distinto de tus compañeros, con objetivo, memoria e inbox propios. Elige UNA herramienta útil de tools para avanzar tu tarea o encargar un trabajo a otro empleado. Decide cuándo volver (2-48 horas): esperar es correcto si falta evidencia. Usa solo los IDs suministrados; eventId vacío cuando no procede. evidenceIds puede referenciar kpis, budget o discovery. No afirmes trabajo realizado antes del resultado de la herramienta. prioritize_research solo candidatas sin investigación y score apto; prioritize_analysis solo evidencia confirmada sin plan; flag_risk solo posición o candidata conocida; review_outcome usa cierre real o eventId vacío; plan_code/propose_change envía al debate de Augusto; handoff entrega encargo a un compañero; check_execution revisa las órdenes sin ejecutarlas. Objetivo común: eficiencia y beneficio ficticio paciente. Máximo 90 palabras en total. No se concede acceso a claves, dinero real, otros proyectos ni al presupuesto permanente.',employeeContext(s,actor,now),initiativeSchema,{light:true,outputTokens:550,capEur:cap,actions:employeeTools[actor.id]});const result=executeEmployeeDecision(s,actor.id,answer,now);actor.costEur+=Number.isFinite(answer._costEur)?answer._costEur:0;log(s,actor.id,'Iniciativa propia: '+result);}catch(error){actor.nextWake=now+6*3600e3;actor.lastError=String(error.message).slice(0,180);log(s,actor.id,'Iniciativa aplazada: '+actor.lastError,'warning');}finally{agent.status='esperando';agent.task=actor.nextTask;await checkpoint();}return actor;
}
