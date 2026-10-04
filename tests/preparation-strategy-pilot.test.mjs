import test from 'node:test';
import assert from 'node:assert/strict';
import {defaults,newBook} from '../trading-worker/core.js';
import {officeState} from '../trading-worker/office-boundary.js';
import {initialiseEmployees,queueEmployeeWork} from '../trading-worker/employee-agents.js';
import {runPreparation} from '../trading-worker/preparation.js';
import {workflowSettings} from '../trading-worker/strategy.js';
import {candidateStrategy,observeProgram} from '../trading-worker/company.js';

const now=Date.parse('2026-10-04T12:00:00Z'),day=864e5;
function fixture(){const s={config:{...defaults},mode:'real',automatic:true,paused:false,real:{book:newBook(now,'EUR'),quotes:{},events:[],assets:[],profiles:{}},agents:['scout','analyst','risk','operator','auditor','designer'].map(id=>({id,name:id,paused:false})),policy:{version:1,minScore:45,researchDailyLimit:6,researchIntervalMinutes:60},company:{tasks:[],meetings:[],reports:[],versions:[],version:0,activeProgram:null,shadowProgram:null},governance:{messages:[]},operating:{allowanceEur:10,spentEur:.5,remainingEur:9.5,paceEurPerDay:.3,exhausted:false}};initialiseEmployees(s,now);return s;}
const prepare=(s,time=now)=>runPreparation(officeState(s),{call:async()=>assert.fail('Strategy preparation must not spend model tokens'),checkpoint:async()=>{},log:()=>{}},time);
const enqueue=(s,strategy,time=now,extra={})=>queueEmployeeWork(s,'strategy','',{owner:'auditor',decision:'Probar una hipótesis económica y medir el resultado',nextTask:'Revisar el piloto y mantener la separación de costes',evidenceIds:['configuration','kpis'],strategy,...extra},time);
const visual={focus:'risk',theme:'violet',headline:'Vista actual de la empresa',panels:['report','efficiency'],lighting:'warm'};

test('mixed initiatives apply operational routing now and preserve active rules in a bounded economic pilot',async()=>{
 const s=fixture(),rules=[{feature:'relativeVolume',op:'gt',value:2,points:5}];s.company.activeProgram='active-4';s.company.version=4;s.company.versions=[{id:'active-4',version:4,status:'activo',program:{scope:'agent-office',rationale:'Programa vigente',threshold:45,rules,workflow:{researchDailyLimit:6,researchIntervalMinutes:60,riskPct:.35,minRR:2},visual}}];s.company.ui=visual;
 const book=JSON.stringify(s.real.book),original=JSON.stringify(s.company.versions[0].program),w=enqueue(s,{minScore:40,riskPct:1.25,minRR:1.5,researchDailyLimit:8,researchIntervalMinutes:45,enrichmentLimit:6,focusSectors:['Technology'],catalystKinds:['guidance']});
 await prepare(s);const pilot=s.company.versions.find(v=>v.id===s.company.shadowProgram);
 assert.equal(w.status,'complete');assert.match(w.result,/Piloto económico/);assert.equal(pilot.status,'piloto');assert.deepEqual(pilot.program.rules,rules);assert.deepEqual(pilot.program.visual,visual);assert.equal(JSON.stringify(s.company.versions.find(v=>v.id==='active-4').program),original);
 assert.equal(pilot.program.threshold,40);assert.equal(pilot.adaptation.requested.riskPct,1.25);assert.equal(pilot.adaptation.effectiveSettings.riskPct,.6);assert.equal(pilot.adaptation.effectiveSettings.minRR,1.5);assert.equal(pilot.initiativeId,w.id);assert.equal(pilot.reason,w.reason);assert.deepEqual(pilot.evidenceIds,w.evidenceIds);
 assert.equal(s.policy.minScore,45);assert.equal(s.config.riskPct,.35);assert.equal(s.config.minRR,2);assert.equal(s.policy.researchDailyLimit,8);assert.equal(s.policy.researchIntervalMinutes,45);assert.equal(workflowSettings(s).enrichmentLimit,6);assert.deepEqual(workflowSettings(s).focusSectors,['Technology']);assert.deepEqual(workflowSettings(s).catalystKinds,['guidance']);assert.equal(workflowSettings(s).minScore,45);assert.equal(workflowSettings(s).riskPct,.35);
 const history=s.company.strategyHistory[0];assert.equal(history.status,'pilot');assert.deepEqual(history.economicFields,['minScore','riskPct','minRR']);assert.equal(history.after.minScore,45);assert.equal(history.requested.minScore,40);assert.equal(history.programId,pilot.id);assert.deepEqual(history.evidenceIds,w.evidenceIds);assert.equal(JSON.stringify(s.real.book),book);
 const selected=candidateStrategy(s,{preScore:{adaptationId:pilot.id}});assert.equal(selected.config.riskPct,.6);assert.equal(selected.config.minRR,1.5);assert.equal(selected.adaptationId,pilot.id);assert.equal(candidateStrategy(s,{}).config.riskPct,.35);assert.equal(s.operating.spentEur,.5);
});

test('operational-only initiatives and null economics do not create or restart a pilot',async()=>{
 const s=fixture(),book=JSON.stringify(s.real.book);const w=enqueue(s,{researchDailyLimit:8,researchBatchSize:2,enrichmentLimit:6,focusSectors:['Health Care'],catalystKinds:['results'],weekendPlanning:false,minScore:null,riskPct:null,minRR:null});await prepare(s);
 assert.equal(w.status,'complete');assert.match(w.result,/operacionales aplicados/);assert.equal(s.company.versions.length,0);assert.equal(s.company.shadowProgram,null);assert.equal(s.company.strategyHistory[0].status,'operational');assert.equal(s.config.riskPct,.35);assert.equal(s.config.minRR,2);assert.equal(s.policy.minScore,45);assert.equal(workflowSettings(s).researchBatchSize,2);assert.equal(workflowSettings(s).weekendPlanning,false);assert.equal(JSON.stringify(s.real.book),book);
});

test('another economic initiative remains honestly blocked while operations proceed and the existing pilot continues',async()=>{
 const s=fixture();enqueue(s,{riskPct:.5,minRR:1.5});await prepare(s);const first=s.company.shadowProgram,start=s.company.versions[0].adaptation.startedAt;
 s.real.book.closed.push({id:'actual-pilot-close',adaptationId:first,qty:50,entry:10,entryFx:1,pnl:0,closedAt:now+500});const book=JSON.stringify(s.real.book);
 const later=now+1000,w=enqueue(s,{riskPct:1.5,minRR:1,minScore:35,researchDailyLimit:8,focusSectors:['Technology']},later);await prepare(s,later);
 assert.equal(w.status,'blocked');assert.match(w.result,/cambios económicos diferidos/);assert.equal(s.company.shadowProgram,first);assert.equal(s.company.versions.length,1);assert.equal(s.company.versions[0].adaptation.startedAt,start);assert.equal(s.policy.researchDailyLimit,8);assert.equal(s.policy.minScore,45);assert.equal(s.config.riskPct,.35);assert.equal(s.config.minRR,2);assert.equal(workflowSettings(s).riskPct,.35);assert.deepEqual(workflowSettings(s).focusSectors,['Technology']);assert.equal(s.company.strategyHistory[0].status,'deferred');assert.equal(s.company.strategyHistory[0].requested.riskPct,1.5);
 const entries=s.company.strategyHistory.length;await prepare(s,w.notBefore);assert.equal(w.status,'blocked');assert.equal(s.company.strategyHistory.length,entries);assert.equal(s.company.versions.length,1);
 // Another operational decision is not overwritten when this old economic proposal retries.
 s.policy.researchDailyLimit=9;s.company.strategy.researchDailyLimit=9;await prepare(s,w.notBefore);assert.equal(s.policy.researchDailyLimit,9);assert.equal(s.company.strategy.researchDailyLimit,9);assert.equal(s.company.shadowProgram,first);
 observeProgram(officeState(s),now+22*day);assert.equal(s.company.shadowProgram,null);await prepare(s,now+22*day);
 assert.equal(w.status,'complete');assert.equal(s.company.versions.length,2);assert.notEqual(s.company.shadowProgram,first);assert.equal(s.company.strategyHistory[0].status,'pilot');assert.equal(s.company.versions[0].program.workflow.researchDailyLimit,9);assert.equal(s.config.riskPct,.35);assert.equal(s.policy.minScore,45);assert.equal(JSON.stringify(s.real.book),book);
});

test('employees can replace an untraded hypothesis without restarting an identical one or raising global risk',async()=>{
 const s=fixture(),book=JSON.stringify(s.real.book);enqueue(s,{riskPct:.5,minRR:1.5});await prepare(s);const first=s.company.shadowProgram;
 const same=enqueue(s,{riskPct:.5,minRR:1.5},now+1);await prepare(s,now+1);assert.equal(same.status,'blocked');assert.equal(s.company.shadowProgram,first);
 const different=enqueue(s,{riskPct:.75,minRR:1.2},now+2);await prepare(s,different.notBefore);assert.equal(different.status,'complete');assert.notEqual(s.company.shadowProgram,first);
 assert.equal(s.company.versions.find(v=>v.id===first).adaptation.phase,'reverted');assert.equal(s.company.versions[0].adaptation.effectiveSettings.riskPct,.6);assert.equal(s.config.riskPct,.35);assert.equal(JSON.stringify(s.real.book),book);
});

test('economic defaults only change after the independent pilot reviewer promotes recorded outcomes',async()=>{
 const s=fixture();enqueue(s,{minScore:40,riskPct:1.25,minRR:1.5});await prepare(s);const id=s.company.shadowProgram;
 observeProgram(officeState(s),now+day);assert.equal(s.config.riskPct,.35);assert.equal(s.policy.minScore,45);assert.equal(s.company.shadowProgram,id);
 // Closed trades are test inputs to the reviewer; preparation itself never creates them.
 s.real.book.closed=Array.from({length:3},(_,i)=>({id:'closed-'+i,adaptationId:id,qty:50,entry:10,entryFx:1,pnl:0,closedAt:now+3*day-3600e3*i}));s.operating.spentEur=.51;
 observeProgram(officeState(s),now+3*day);assert.equal(s.company.activeProgram,id);assert.equal(s.company.shadowProgram,null);assert.equal(s.config.riskPct,.6);assert.equal(s.config.minRR,1.5);assert.equal(s.policy.minScore,40);assert.equal(workflowSettings(s).riskPct,.6);assert.equal(s.config.maxEntries,2);assert.equal(s.config.maxPositions,20);assert.equal(s.operating.allowanceEur,10);
});

test('invalid reasons, unknown evidence and unsafe settings cannot start experiments or alter operations',async()=>{
 for(const extra of [{decision:''},{evidenceIds:[]},{evidenceIds:['unknown']},{strategy:{dailyBudget:100}}]){
  const s=fixture(),book=JSON.stringify(s.real.book),w=enqueue(s,{riskPct:1.25,researchDailyLimit:8},now,extra);await prepare(s);assert.equal(w.status,'failed');assert.equal(s.company.versions.length,0);assert.equal(s.policy.researchDailyLimit,6);assert.equal(s.config.riskPct,.35);assert.equal(s.company.strategyHistory?.length||0,0);assert.equal(JSON.stringify(s.real.book),book);
 }
});
