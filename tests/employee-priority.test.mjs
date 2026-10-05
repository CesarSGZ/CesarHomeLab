import test from 'node:test';
import assert from 'node:assert/strict';
import {defaults,newBook} from '../trading-worker/core.js';
import {initialiseEmployees,runEmployeeInitiative,queueEmployeeWork} from '../trading-worker/employee-agents.js';
import {runPreparation} from '../trading-worker/preparation.js';

const now=Date.parse('2026-10-05T12:00:00Z');
function fixture(){
 const s={mode:'real',automatic:true,paused:false,config:{...defaults},agents:['scout','analyst','risk','operator','auditor','designer'].map(id=>({id,name:id,paused:false,status:'esperando',task:'Sin tarea'})),real:{book:newBook(now,'EUR'),quotes:{},events:[{id:'fresh',symbol:'FRESH',status:'verificar',confirmed:false,preScore:{eligible:true,score:70},source:'https://issuer.example/release',summary:'Anuncio pendiente de contraste'}],assets:[],profiles:{FRESH:{checkedAt:now,fundamentals:{checkedAt:now,source:'https://data.sec.gov/facts',metrics:{annualEnd:'2025-12-31',fcf:5e6},evidence:[]},market:{asOf:'2026-10-02T20:00:00Z'}}}},policy:{version:1,minScore:45,researchDailyLimit:6,researchIntervalMinutes:60},company:{tasks:[],meetings:[],reports:[],versions:[],version:0},governance:{messages:[]},operating:{remainingEur:9,spentEur:1,paceEurPerDay:.3,exhausted:false}};
 initialiseEmployees(s,now);return s;
}
const decision={goal:'Resolver evidencia',decision:'Preservar presupuesto mientras falta una fuente concreta',tool:'wait',target:'none',eventId:'',evidenceIds:['discovery'],nextTask:'Contrastar la siguiente fuente primaria',wakeHours:2,strategy:null,_costEur:.0004};
const answer={summary:'Ficha financiera contrastada; falta confirmar el anuncio',thesis:'Investigar el hecho material antes de una tesis ejecutable',missingEvidence:['Documento primario del anuncio'],worthFurtherWork:true,nextOwner:'scout',nextTask:'Contrastar el comunicado oficial de FRESH',_costEur:.0005};
const confirmed=()=>({id:'confirmed',symbol:'READY',confirmed:true,status:'nuevo',date:'2026-10-08T20:00:00Z',timing:'scheduled',source:'https://issuer.example/results',sources:[{url:'https://issuer.example/results',claim:'El emisor confirma la fecha'}],summary:'Catalizador fechado y contrastado',preScore:{eligible:true,score:80},research:{worthAnalyzing:true},plan:null});
const queue=(s,at=now)=>queueEmployeeWork(s,'analysis','fresh',{owner:'analyst',decision:'Comparar una nueva empresa con evidencia ya descargada',nextTask:'Revisar los datos financieros de FRESH',evidenceIds:['fresh']},at);
const hooks=call=>({call,checkpoint:async()=>{},log:()=>{}});

test('launch operational priority skips paid initiatives and preserves counters, cash and launch state',async()=>{
 const s=fixture(),agency=s.company.agency;s.company.launch={active:true,target:2,priorityUseful:true,ready:0};s.company.pipeline={counts:{analysisReady:1}};
 agency.runsToday=2;agency.lastDispatch=now-7200e3;agency.actors.analyst.costEur=.01;const book=JSON.stringify(s.real.book),launch=JSON.stringify(s.company.launch);let calls=0,checkpoints=0;
 const result=await runEmployeeInitiative(s,{call:async()=>{calls++;return decision;},checkpoint:async()=>checkpoints++,log:()=>{}},now);
 assert.equal(result,null);assert.equal(calls,0);assert.equal(checkpoints,1);assert.equal(agency.runsToday,2);assert.equal(agency.lastDispatch,now-7200e3);assert.equal(agency.actors.analyst.costEur,.01);assert.equal(agency.actors.analyst.attemptsToday,undefined);
 assert.equal(s.agents.find(a=>a.id==='analyst').status,'pendiente');assert.match(s.agents.find(a=>a.id==='analyst').task,/Prioridad operativa/);assert.equal(JSON.stringify(s.real.book),book);assert.equal(JSON.stringify(s.company.launch),launch);
});

test('without useful operational priority employees still take bounded independent initiatives',async()=>{
 for(const launch of [{active:true,priorityUseful:false,ready:0},{active:false,priorityUseful:true,ready:2},{active:true,priorityUseful:true,ready:2}]){
  const s=fixture();s.company.launch=launch;let calls=0;
  await runEmployeeInitiative(s,hooks(async()=>{calls++;return decision;}),now);
  assert.equal(calls,1);assert.equal(s.company.agency.runsToday,1);assert.equal(s.company.agency.actors.scout.costEur,.0004);assert.equal(s.company.agency.actors.scout.lastAction.tool,'wait');
 }
});

test('confirmed planning candidates defer preliminary calls without consuming their daily allowance',async()=>{
 const s=fixture();s.real.events.push(confirmed());s.company.launch={active:true,target:2,priorityUseful:true,ready:0};const work=queue(s),book=JSON.stringify(s.real.book),launch=JSON.stringify(s.company.launch);let calls=0;
 await runPreparation(s,hooks(async()=>{calls++;return answer;}),now);
 assert.equal(calls,0);assert.equal(s.company.agency.preparationCalls,0);assert.equal(work.status,'pending');assert.equal(work.launchDeferredAt,now);assert.match(work.launchPriorityReason,/confirmadas/);assert.equal(s.real.events[0].preliminary,undefined);assert.equal(s.real.events[1].plan,null);assert.equal(JSON.stringify(s.real.book),book);assert.equal(JSON.stringify(s.company.launch),launch);
});

test('preliminary analysis continues when confirmed-looking events cannot advance to planning',async()=>{
 for(const extra of [{confirmed:false},{analysisFollowup:{baselineResearchAt:now-1000},research:{researchedAt:now-1000,worthAnalyzing:true}},{date:'2026-10-01T20:00:00Z'}]){
  const s=fixture();s.real.events.push({...confirmed(),...extra});s.company.launch={active:true,target:2,priorityUseful:false,ready:0};const work=queue(s);let calls=0;
  await runPreparation(s,hooks(async()=>{calls++;return answer;}),now);
  assert.equal(calls,1);assert.equal(s.company.agency.preparationCalls,1);assert.equal(work.status,'complete');assert.equal(s.real.events[0].preliminary.summary,answer.summary);
 }
});

test('cached preliminary results are reused free even when launch prioritizes a confirmed plan',async()=>{
 const s=fixture();queue(s);let calls=0;const runHooks=hooks(async()=>{calls++;return answer;});await runPreparation(s,runHooks,now);
 s.real.events.push(confirmed());s.company.launch={active:true,target:2,priorityUseful:true,ready:0};const work=queue(s,now+1000);
 await runPreparation(s,runHooks,now+1000);
 assert.equal(calls,1);assert.equal(s.company.agency.preparationCalls,1);assert.equal(work.status,'complete');assert.match(work.result,/reutiliza/);
});

test('launch preserves queued code work without spending on patch generation',async()=>{
 const s=fixture();s.real.events.push(confirmed());s.company.launch={active:true,target:2,priorityUseful:true,ready:0};const work=queueEmployeeWork(s,'code','',{owner:'designer',decision:'Mejorar los informes',nextTask:'Mostrar el avance de los planes en la oficina',evidenceIds:['kpis']},now);
 let calls=0;await runPreparation(s,hooks(async()=>{calls++;return answer;}),now);
 assert.equal(calls,0,'Confirmed planning work takes precedence over patch generation');assert.equal(work.status,'pending');assert.equal(work.attempts,0);assert.equal(s.company.development,undefined);
});

test('approved waiting plans do not suspend independent initiatives or spend new analysis tokens',async()=>{
 const s=fixture();s.company.launch={active:true,priorityUseful:true,ready:1};
 s.real.events.push({...confirmed(),plan:{approve:true,entryMin:9,entryMax:10,stop:8,target:13,expiresAt:now+864e5},review:{approve:true}});
 s.company.pipeline={counts:{approvedWaiting:1,analysisReady:0,riskPending:0}};const before=JSON.stringify(s.real.book);let calls=0;
 await runEmployeeInitiative(s,hooks(async()=>{calls++;return decision;}),now);
 assert.equal(calls,1);assert.equal(s.company.agency.runsToday,1);assert.equal(JSON.stringify(s.real.book),before);
});
