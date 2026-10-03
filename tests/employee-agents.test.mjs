import test from 'node:test';
import assert from 'node:assert/strict';
import {initialiseEmployees,dueEmployee,executeEmployeeDecision,runEmployeeInitiative,employeeContext,pendingEmployeeWork,finishEmployeeWork,researchReadyAt} from '../trading-worker/employee-agents.js';
import {message} from '../trading-worker/governance.js';
const now=Date.parse('2026-10-03T12:00:00Z');
function fixture(){return {agents:['scout','analyst','risk','operator','auditor','designer'].map(id=>({id,name:id,paused:false})),company:{tasks:[]},governance:{messages:[]},messages:[],real:{events:[{id:'e1',symbol:'TEST',preScore:{eligible:true,score:80},confirmed:false}],book:{cash:10000,positions:[],closed:[]}},operating:{remainingEur:9,paceEurPerDay:.3},paused:false};}
const decision=(tool,extra={})=>({goal:'Comprobar evidencia',decision:'Falta fecha primaria',tool,target:'none',eventId:'',evidenceIds:['discovery'],nextTask:'Contrastar fecha',wakeHours:4,strategy:null,...extra});
test('employees have separate memories, mailboxes and wake schedules',()=>{const s=fixture(),a=initialiseEmployees(s,now);executeEmployeeDecision(s,'scout',decision('handoff',{target:'analyst',eventId:'e1',evidenceIds:['e1']}),now);assert.equal(a.actors.scout.memory.length,1);assert.equal(a.actors.analyst.memory.length,0);assert.equal(a.actors.analyst.inbox[0].from,'scout');assert.equal(a.actors.scout.nextWake,now+4*3600e3);assert.equal(a.actors.analyst.nextWake,now);});
test('an employee can prioritize real evidence without altering funds or approving trades',()=>{const s=fixture(),book=JSON.stringify(s.real.book);executeEmployeeDecision(s,'scout',decision('prioritize_research',{eventId:'e1',evidenceIds:['e1']}),now);assert.equal(s.real.events[0].employeePriority.owner,'scout');assert.equal(JSON.stringify(s.real.book),book);assert.throws(()=>executeEmployeeDecision(s,'operator',decision('prioritize_research',{eventId:'e1'}),now));assert.throws(()=>executeEmployeeDecision(s,'analyst',decision('prioritize_analysis',{eventId:'e1'}),now));assert.throws(()=>executeEmployeeDecision(s,'scout',decision('propose_change',{evidenceIds:['invented']}),now));});
test('idle initiatives have a shared daily ceiling, pacing, and individual pauses',()=>{const s=fixture(),a=initialiseEmployees(s,now);assert.equal(dueEmployee(s,now).id,'scout');s.agents[0].paused=true;assert.equal(dueEmployee(s,now).id,'analyst');a.lastDispatch=now;assert.equal(dueEmployee(s,now+30*60e3),null);a.runsToday=6;assert.equal(dueEmployee(s,now+2*3600e3),null);s.operating.remainingEur=0;assert.equal(dueEmployee(s,now+864e5),null);});
test('one bounded paid initiative records its actual decision and cost',async()=>{const s=fixture();let calls=0,checkpoints=0;await runEmployeeInitiative(s,{call:async(id,instructions,payload,schema,options)=>{calls++;assert.equal(id,'scout');assert.ok(options.capEur<=.0025);assert.equal(options.light,true);assert.ok(payload.tools.includes('wait'));return {...decision('wait'),_costEur:.0004};},checkpoint:async()=>checkpoints++,log:()=>{}},now);assert.equal(calls,1);assert.equal(s.company.agency.actors.scout.costEur,.0004);assert.equal(s.company.agency.actors.scout.lastAction.tool,'wait');assert.equal(s.agents[0].status,'esperando');assert.equal(checkpoints,2);});
test('pipeline results become actionable mail for the receiving specialist',()=>{const s=fixture(),a=initialiseEmployees(s,now);a.actors.analyst.nextWake=now+864e5;message(s,'scout','analyst','TEST: evidencia contrastada disponible',now);assert.equal(a.actors.analyst.inbox.length,1);assert.equal(a.actors.analyst.inbox[0].status,'pendiente');assert.equal(a.actors.analyst.nextWake,now);});

test('employee context includes assigned fundamentals, dated prices and current controls',()=>{
 const s=fixture();s.config={riskPct:.5,minRR:3,maxPositions:20};s.policy={minScore:45,researchDailyLimit:8};s.real.profiles={TEST:{checkedAt:now,fundamentals:{metrics:{annualEnd:'2025-12-31',fcf:5e6,cashLatest:20e6},evidence:[{metric:'cash',filed:'2026-03-01'}],source:'https://data.sec.gov/facts',checkedAt:now}}};s.real.quotes={TEST:{price:5,time:now-864e5,fetchedAt:now,source:'public',referenceOnly:true}};
 s.real.events[0].analysisDeferred={day:'2026-10-03',reason:'Cuota de dos análisis profundos agotada',nextAt:now+16*3600e3};
 const actor=initialiseEmployees(s,now).actors.analyst;actor.inbox.push({task:'Compara TEST',eventId:'e1',status:'pendiente'});
 const context=employeeContext(s,actor,now);assert.equal(context.configuration.config.riskPct,.5);assert.equal(context.configuration.policy.minScore,45);assert.equal(context.events[0].financialProfile.fundamentals.metrics.fcf,5e6);assert.equal(context.events[0].priceReference.time,now-864e5);assert.deepEqual(context.events[0].analysisDeferred,s.real.events[0].analysisDeferred);assert.equal(context.backlog.research.count,1);assert.ok(context.tools.includes('prepare_plan'));assert.equal(context.market.planningOutsideSession,true);
});

test('research retry is durable and respects cooldown or a new primary update',()=>{
 const s=fixture(),e=s.real.events[0];e.research={researchedAt:now-2*3600e3};e.researchAttemptAt=now-2*3600e3;
 executeEmployeeDecision(s,'scout',decision('request_research',{eventId:'e1',evidenceIds:['e1']}),now);
 const work=s.company.agency.workQueue[0];assert.equal(work.notBefore,now+22*3600e3);assert.equal(pendingEmployeeWork(s,'research',now).length,0);assert.equal(pendingEmployeeWork(s,'research',work.notBefore).length,1);assert.equal(e.researchAttemptAt,now-2*3600e3);
 e.primaryUpdatedAt=now-3600e3;assert.equal(researchReadyAt(e,now),now);
 executeEmployeeDecision(s,'scout',decision('request_research',{eventId:'e1',evidenceIds:['e1']}),now+3600e3);assert.equal(s.company.agency.workQueue.length,1);assert.equal(work.notBefore,now+3600e3);assert.equal(pendingEmployeeWork(s,'research',now+3600e3).length,1);assert.equal(e.employeePriority.notBefore,now+3600e3);
});

test('weekend analysis and risk support are preliminary until evidence and approval exist',()=>{
 const s=fixture(),originalBook=JSON.stringify(s.real.book);
 executeEmployeeDecision(s,'analyst',decision('prepare_plan',{eventId:'e1',evidenceIds:['e1']}),now);executeEmployeeDecision(s,'risk',decision('review_plan',{eventId:'e1',evidenceIds:['e1']}),now);
 assert.equal(pendingEmployeeWork(s,'analysis',now)[0].phase,'preliminary');assert.equal(pendingEmployeeWork(s,'risk',now)[0].phase,'preliminary');assert.throws(()=>executeEmployeeDecision(s,'operator',decision('prepare_execution',{eventId:'e1'}),now));assert.equal(JSON.stringify(s.real.book),originalBook);assert.equal(s.real.events[0].plan,undefined);assert.equal(s.real.events[0].review,undefined);
});

test('actual work results are remembered and delivered to the next employee',()=>{
 const s=fixture();executeEmployeeDecision(s,'analyst',decision('prepare_plan',{eventId:'e1',evidenceIds:['e1']}),now);
 const work=pendingEmployeeWork(s,'analysis',now)[0];finishEmployeeWork(s,work.id,'Datos de caja revisados; falta confirmar fecha primaria',{target:'risk'},now+1000);
 assert.equal(work.status,'complete');assert.equal(pendingEmployeeWork(s,'analysis',now+1000).length,0);assert.ok(s.company.agency.actors.analyst.memory.some(m=>m.workId===work.id));assert.equal(s.company.agency.actors.risk.inbox[0].eventId,'e1');assert.equal(s.company.agency.actors.risk.inbox[0].task,'Datos de caja revisados; falta confirmar fecha primaria');assert.equal(s.governance.messages.filter(m=>m.from==='analyst'&&m.to==='risk').length,1);
});

test('concrete strategy proposals cannot alter capital, token allowance or policy before validation',()=>{
 const s=fixture();s.policy={minScore:45};s.config={riskPct:.5};const old=JSON.stringify({book:s.real.book,policy:s.policy,config:s.config,operating:s.operating});
 executeEmployeeDecision(s,'auditor',decision('tune_strategy',{strategy:{researchDailyLimit:8,researchBatchSize:2,enrichmentLimit:6,minScore:50,minRR:null,riskPct:null,researchIntervalMinutes:null,focusSectors:[],catalystKinds:['results'],weekendPlanning:true},evidenceIds:['discovery','kpis']}),now);
 assert.equal(pendingEmployeeWork(s,'strategy',now)[0].strategy.researchDailyLimit,8);assert.equal(JSON.stringify({book:s.real.book,policy:s.policy,config:s.config,operating:s.operating}),old);
 assert.throws(()=>executeEmployeeDecision(s,'auditor',decision('tune_strategy',{strategy:{dailyBudget:100}}),now));assert.throws(()=>executeEmployeeDecision(s,'auditor',decision('tune_strategy',{strategy:{riskPct:10}}),now));assert.throws(()=>executeEmployeeDecision(s,'scout',decision('tune_strategy',{strategy:{minScore:50}}),now));
});

test('capability upgrade preserves expenses and history while replacing stale waiting tasks',()=>{
 const s=fixture(),agency=initialiseEmployees(s,now);agency.version=2;agency.runsToday=4;agency.actors.analyst.costEur=.003;agency.actors.analyst.runs=3;agency.actors.analyst.nextTask='Esperar 7 días a una configuración ausente';agency.actors.analyst.memory.push({result:'Resultado real anterior'});
 initialiseEmployees(s,now+1000);assert.equal(agency.version,3);assert.equal(agency.runsToday,4);assert.equal(agency.actors.analyst.costEur,.003);assert.equal(agency.actors.analyst.runs,3);assert.equal(agency.actors.analyst.memory[0].result,'Resultado real anterior');assert.match(agency.actors.analyst.nextTask,/Comparar/);assert.equal(agency.actors.analyst.nextWake,now+1000);
});

test('a busy employee cannot consume the daily initiatives before unserved colleagues',()=>{
 const s=fixture(),agency=initialiseEmployees(s,now);dueEmployee(s,now);executeEmployeeDecision(s,'scout',decision('request_research',{eventId:'e1'}),now);agency.actors.scout.nextWake=now;agency.actors.scout.inbox.push({status:'pendiente',task:'Otra idea'});assert.equal(dueEmployee(s,now+3600e3).id,'analyst');
 executeEmployeeDecision(s,'scout',decision('wait',{wakeHours:48}),now);assert.equal(agency.actors.scout.nextWake,now+6*3600e3);
});

test('a rejected paid decision retains its actual cost and does not monopolize initiatives',async()=>{
 const s=fixture();await runEmployeeInitiative(s,{call:async()=>({...decision('prepare_execution',{eventId:'e1'}),_costEur:.0006}),checkpoint:async()=>{},log:()=>{}},now);
 const actor=s.company.agency.actors.scout;assert.equal(actor.costEur,.0006);assert.equal(actor.attemptsToday,1);assert.match(actor.lastError,/Herramienta ajena/);actor.nextWake=now;assert.equal(dueEmployee(s,now+3600e3).id,'analyst');
});
