import test from 'node:test';
import assert from 'node:assert/strict';
import {defaults,newBook,allocation} from '../trading-worker/core.js';
import {officeState} from '../trading-worker/office-boundary.js';
import {workflowSettings,validateWorkflowStrategy} from '../trading-worker/strategy.js';
import {initialiseEmployees,initiativeSchema,validateEmployeeStrategy,executeEmployeeDecision,pendingEmployeeWork} from '../trading-worker/employee-agents.js';
import {runPreparation} from '../trading-worker/preparation.js';

const now=Date.parse('2026-10-04T12:00:00Z');
function fixture(){return {config:{...defaults},mode:'real',automatic:true,paused:false,real:{book:newBook(now,'EUR'),quotes:{},events:[],assets:[],profiles:{}},agents:['scout','analyst','risk','operator','auditor','designer'].map(id=>({id,name:id,paused:false})),policy:{version:1,minScore:45,researchDailyLimit:6,researchIntervalMinutes:60},company:{tasks:[],meetings:[],reports:[],versions:[],version:0,activeProgram:null,shadowProgram:null},governance:{messages:[]},operating:{allowanceEur:10,remainingEur:10,spentEur:0,paceEurPerDay:.3,exhausted:false}};}
const proposal=(extra={})=>({goal:'Evaluar flexibilidad con capital ficticio',decision:'Probar un umbral menor con riesgo acotado y comparar resultados',tool:'tune_strategy',target:'none',eventId:'',evidenceIds:['kpis','configuration'],nextTask:'Observar resultados y costes antes de ampliar el cambio',wakeHours:4,strategy:{riskPct:1.25,minRR:1.5},...extra});

test('wider paper limits do not change existing values or the default strategy',()=>{
 const s=fixture(),before=JSON.stringify(s);const current=workflowSettings(s);assert.equal(current.riskPct,.35);assert.equal(current.minRR,2);assert.equal(defaults.riskPct,.35);assert.equal(defaults.minRR,2);assert.equal(JSON.stringify(s),before);
 s.config.riskPct=.6;s.config.minRR=3;s.company.strategy={riskPct:null,minRR:null};assert.equal(workflowSettings(s).riskPct,.6);assert.equal(workflowSettings(s).minRR,3);
 assert.equal(validateWorkflowStrategy({riskPct:.1,minRR:1}).riskPct,.1);assert.equal(validateWorkflowStrategy({riskPct:2,minRR:8}).minRR,8);assert.equal(validateWorkflowStrategy({riskPct:1.25,minRR:1.5}).riskPct,1.25);
});

test('model schema, structured validation and the code boundary share the paper risk ranges',()=>{
 const shape=initiativeSchema.properties.strategy.anyOf[0].properties;assert.equal(shape.riskPct.minimum,.1);assert.equal(shape.riskPct.maximum,2);assert.equal(shape.minRR.minimum,1);assert.equal(shape.minRR.maximum,8);
 const s=fixture(),view=officeState(s);for(const riskPct of [.1,.35,1,1.25,2]){validateWorkflowStrategy({riskPct});validateEmployeeStrategy({riskPct});view.config.riskPct=riskPct;assert.equal(s.config.riskPct,riskPct);}
 for(const minRR of [1,1.5,2,8]){validateWorkflowStrategy({minRR});validateEmployeeStrategy({minRR});view.config.minRR=minRR;assert.equal(s.config.minRR,minRR);}
 for(const riskPct of [.099,2.001,NaN,Infinity,'1']){assert.throws(()=>validateWorkflowStrategy({riskPct}));assert.throws(()=>validateEmployeeStrategy({riskPct}));assert.throws(()=>view.config.riskPct=riskPct);}
 for(const minRR of [.999,8.001,NaN,Infinity,'2']){assert.throws(()=>validateWorkflowStrategy({minRR}));assert.throws(()=>validateEmployeeStrategy({minRR}));assert.throws(()=>view.config.minRR=minRR);}
});

test('a documented structured decision pilots wider paper settings without altering the global economy, rent or allocation',async()=>{
 const s=fixture();initialiseEmployees(s,now);const view=officeState(s),book=JSON.stringify(s.real.book),conditions={dailyBudget:s.config.dailyBudget,maxEntries:s.config.maxEntries,maxPositions:s.config.maxPositions,maxPositionPct:s.config.maxPositionPct,maxExposurePct:s.config.maxExposurePct,allowanceEur:s.operating.allowanceEur};
 executeEmployeeDecision(view,'auditor',proposal(),now);const work=pendingEmployeeWork(view,'strategy',now)[0];assert.equal(work.reason,proposal().decision);assert.deepEqual(work.evidenceIds,proposal().evidenceIds);assert.equal(s.config.riskPct,.35);assert.equal(s.config.minRR,2);
 await runPreparation(view,{call:async()=>assert.fail('Applying validated settings must not consume model tokens'),checkpoint:async()=>{},log:()=>{}},now);
 assert.equal(s.config.riskPct,.35);assert.equal(s.config.minRR,2);assert.equal(workflowSettings(s).riskPct,.35);assert.equal(workflowSettings(s).minRR,2);assert.equal(work.status,'complete');assert.match(work.result,/Piloto económico/);assert.equal(s.company.strategyHistory[0].status,'pilot');assert.equal(s.company.strategyHistory[0].reason,proposal().decision);assert.deepEqual(s.company.strategyHistory[0].evidenceIds,proposal().evidenceIds);assert.equal(JSON.stringify(s.real.book),book);
 const pilot=s.company.versions.find(v=>v.id===s.company.shadowProgram);assert.equal(pilot.adaptation.requested.riskPct,1.25);assert.equal(pilot.adaptation.requested.minRR,1.5);assert.equal(pilot.adaptation.effectiveSettings.riskPct,.6);assert.equal(pilot.adaptation.effectiveSettings.minRR,1.5);
 assert.deepEqual({dailyBudget:s.config.dailyBudget,maxEntries:s.config.maxEntries,maxPositions:s.config.maxPositions,maxPositionPct:s.config.maxPositionPct,maxExposurePct:s.config.maxExposurePct,allowanceEur:s.operating.allowanceEur},conditions);assert.equal(s.config.maxEntries,2);assert.equal(s.config.maxPositions,20);assert.equal(s.operating.allowanceEur,10);
 for(const [cash,expected] of [[10000,500],[15000,750],[20000,1000]])assert.equal(allocation({...s.real.book,cash,positions:[]}),expected);
});

test('evidence and protected user conditions are still required when expanding paper risk',()=>{
 const s=fixture();initialiseEmployees(s,now);const view=officeState(s);assert.throws(()=>executeEmployeeDecision(view,'auditor',proposal({evidenceIds:[]}),now),/Falta evidencia/);assert.throws(()=>executeEmployeeDecision(view,'auditor',proposal({evidenceIds:['invented']}),now),/evidencia desconocida/);
 for(const setting of [{maxEntries:3},{maxPositions:30},{dailyBudget:10},{allowanceEur:20},{maxPositionPct:10}]){assert.throws(()=>validateWorkflowStrategy(setting));assert.throws(()=>validateEmployeeStrategy(setting));}
 for(const key of ['maxEntries','maxPositions','dailyBudget','maxPositionPct','maxExposurePct'])assert.throws(()=>view.config[key]=99,/Condición de César protegida/);
 assert.throws(()=>view.real.book.cash=20000,/contabilidad/i);assert.throws(()=>view.real.quotes.TEST={price:1},/contabilidad/i);assert.equal(s.config.riskPct,.35);assert.equal(s.config.minRR,2);assert.equal(s.company.agency.workQueue.length,0);
});
