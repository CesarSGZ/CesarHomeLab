import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {expireUnfilledPlans} from '../trading-worker/plan-lifecycle.js';
import {cycle,initialState,upgradeState,locked,load} from '../trading-worker/engine.js';
import {officeState} from '../trading-worker/office-boundary.js';
import {selectPlanningCandidates,pipelineSummary} from '../trading-worker/strategy.js';
import {employeeContext,initialiseEmployees} from '../trading-worker/employee-agents.js';
import {compactContext,madridDay} from '../trading-worker/company.js';
import {referenceSource} from '../trading-worker/market-data.js';

const now=Date.parse('2026-10-05T14:00:00Z');
function expiredEvent(extra={}){return {id:'expired-plan',symbol:'TEST',status:'espera',confirmed:true,timing:'scheduled',date:'2026-10-08T12:00:00Z',source:'https://issuer.example/results',sources:[{url:'https://issuer.example/results',claim:'Publicación primaria futura de fixture'}],summary:'Resultados confirmados con hipótesis de fixture y plan ya vencido',preScore:{eligible:true,score:60},research:{worthAnalyzing:true},plan:{approve:true,entryMin:9.8,entryMax:10.2,stop:9.5,target:12,holdingDays:1,expiresAt:now-1,preparedAt:now-864e5,thesis:'No perseguir el precio',adaptationId:'pilot'},review:{approve:true,decision:'approve',reason:'Riesgo revisado en fixture',_costEur:.0008},reasons:['Precio fuera de la zona de entrada'],...extra};}
function fixture(){const s=upgradeState(initialState());s.real.events=[expiredEvent()];s.real.assets=[{symbol:'TEST',name:'Test Common Stock',exchange:'NASDAQ',marketCap:300e6,price:10,dataVerified:true}];s.real.quotes={TEST:{source:referenceSource,referenceOnly:true,currency:'USD',price:10,time:now,fetchedAt:now,dollarVolume:5e6}};s.real.book.fx={rate:1.12,time:now,checkedAt:now};return s;}
function memoryEnv(){
 const db=new DatabaseSync(':memory:');for(const file of ['0008_trading_lab.sql','0009_trading_operating_budget.sql'])db.exec(readFileSync(new URL('../migrations/'+file,import.meta.url),'utf8'));
 const wrap=(sql,args=[])=>({bind(...values){return wrap(sql,values);},async first(){return db.prepare(sql).get(...args)||null;},async all(){return {results:db.prepare(sql).all(...args)};},async run(){return db.prepare(sql).run(...args);}});
 return {OPENAI_RUNTIME_KEY:'fixture-only-not-a-live-key',CONTROL_DB:{prepare:wrap,async batch(ops){const result=[];for(const op of ops)result.push(await op.run());return result;}},_db:db};
}

test('An unfilled expiry becomes terminal before selection, retains exact paid decisions, and archives stale financial assignments honestly',()=>{
 const s=fixture(),e=s.real.events[0],plan=JSON.stringify(e.plan),review=JSON.stringify(e.review),ledger=JSON.stringify(s.real.book);
 s.company.agency.workQueue=[{id:'old-exec',eventId:e.id,kind:'execution',status:'pending',attempts:2,task:'Comprobar el rango',notBefore:now},{id:'old-risk',eventId:e.id,kind:'risk',status:'blocked',attempts:1,notBefore:now},{id:'learn',eventId:e.id,kind:'strategy',status:'pending',task:'Revisar el embudo',notBefore:now}];
 const rows=expireUnfilledPlans(officeState(s),now);assert.equal(rows.length,1);assert.equal(e.status,'caducado');assert.equal(e.plan,undefined);assert.equal(e.review,undefined);assert.equal(JSON.stringify(e.planLifecycleHistory[0].plan),plan);assert.equal(JSON.stringify(e.planLifecycleHistory[0].review),review);assert.deepEqual(e.planLifecycleHistory[0].previousReasons,['Precio fuera de la zona de entrada']);assert.equal(e.planLifecycleHistory[0].previousStatus,'espera');
 assert.deepEqual(rows[0].archivedWorkIds,['old-exec','old-risk']);assert.equal(s.company.agency.workQueue[0].status,'archived');assert.equal(s.company.agency.workQueue[0].attempts,2);assert.match(s.company.agency.workQueue[0].result,/sin compra/);assert.equal(s.company.agency.workQueue[2].status,'pending');assert.equal(selectPlanningCandidates(s,now).length,0);assert.equal(pipelineSummary(s,now).counts.approvedWaiting,0);assert.equal(JSON.stringify(s.real.book),ledger);
 assert.equal(expireUnfilledPlans(s,now+1000).length,0);assert.equal(e.planLifecycleHistory.length,1);assert.equal(s.company.planningOutcomes.length,1);assert.equal(s.company.planLifecycle.expiredWithoutEntryTotal,1);
});

test('Expiry housekeeping never modifies opened or historically bought events, positions, stops or the ledger',()=>{
 const s=fixture(),open=expiredEvent({id:'open',symbol:'OPEN',status:'abierto'}),owned=expiredEvent({id:'owned',symbol:'OWNED'}),bought=expiredEvent({id:'bought',symbol:'BOUGHT'}),valid=expiredEvent({id:'valid',symbol:'VALID',plan:{entryMin:9,entryMax:10,stop:8,target:12,expiresAt:now+1}});
 s.real.events=[open,owned,bought,valid];s.real.book.positions=[{eventId:'owned',symbol:'OWNED',qty:1,entry:10,mark:10,stop:8,target:12,expiresAt:now-1}];s.real.book.orders=[{eventId:'bought',side:'buy',symbol:'BOUGHT'}];const before=JSON.stringify(s);
 assert.equal(expireUnfilledPlans(officeState(s),now).length,0);assert.equal(JSON.stringify(s),before);assert.equal(owned.plan.stop,9.5);assert.equal(s.real.book.positions[0].stop,8);
});

test('Rejected plan histories retain the veto and exact-expiry plans cannot remain approved in the backlog',()=>{
 const s=fixture(),e=s.real.events[0];e.status='descartado';e.plan.expiresAt=now;e.review={approve:false,decision:'reject',reason:'La tesis ya no es válida'};e.reasons=['La tesis ya no es válida'];
 expireUnfilledPlans(s,now);assert.equal(e.status,'caducado');assert.equal(e.planLifecycleHistory[0].review.reason,'La tesis ya no es válida');assert.equal(e.planLifecycleHistory[0].previousStatus,'descartado');assert.equal(e.planLifecycleHistory[0].previousReasons[0],'La tesis ya no es válida');assert.equal(s.company.planningOutcomes[0].reviewApproved,false);
});

test('A real cycle archives an expired approved plan before preparation, creates no trade or model call, and reports its outcome once to the auditor',async()=>{
 const env=memoryEnv(),originalNow=Date.now,originalFetch=globalThis.fetch;let clock=now,fetches=0;Date.now=()=>clock;
 try{
  env._db.prepare('INSERT INTO trading_secrets(name,cipher,iv,updated_at) VALUES (?,?,?,?)').run('openai','fixture','fixture',clock);
  await locked(env,async s=>{
   const f=fixture();s.real=f.real;s.company=f.company;s.real.lastScan=clock;s.real.marketCheckedAt=clock;s.real.book.fx={rate:1.12,time:clock,checkedAt:clock};
   for(const a of s.agents)a.paused=a.id!=='operator';initialiseEmployees(s,clock);s.company.agency.day=new Date(clock).toISOString().slice(0,10);s.company.agency.runsToday=6;s.company.agency.preparationDay=s.company.agency.day;s.company.agency.preparationCalls=2;
   for(const actor of Object.values(s.company.agency.actors))actor.nextWake=clock+864e5;
   s.company.agency.workQueue=[{id:'expired-execution',eventId:'expired-plan',kind:'execution',phase:'confirmed',owner:'operator',from:'operator',status:'pending',attempts:0,task:'Comprobar la entrada aprobada',reason:'Fixture',evidenceIds:['expired-plan'],createdAt:clock-1000,notBefore:clock}];
   const day=madridDay(clock);s.company.meetings=[{id:day+':planning',day,status:'completa'},{id:day+':closing',day,status:'completa'}];
  });
  globalThis.fetch=async()=>{fetches++;throw Error('No network or paid model call is allowed in this regression');};
  await cycle(env);let s=(await load(env)).state,e=s.real.events[0];assert.equal(fetches,0);assert.equal(env._db.prepare('SELECT COUNT(*) AS n FROM trading_calls').get().n,0);assert.equal(s.real.book.orders.length,0);assert.equal(s.real.book.positions.length,0);assert.equal(e.status,'caducado');assert.equal(e.plan,undefined);assert.equal(e.review,undefined);assert.equal(s.company.pipeline.counts.approvedWaiting,0);assert.equal(s.company.pipeline.counts.supportPending,0);assert.equal(s.company.sessionPlan.ready.length,0);assert.equal(s.company.agency.workQueue.find(w=>w.id==='expired-execution').status,'archived');
  const auditor=s.company.agency.actors.auditor;assert.ok(auditor.inbox.some(m=>m.eventId==='expired-plan'&&/vencido|caducado/.test(m.task)));assert.equal(s.company.planningOutcomes.length,1);assert.equal(s.logs.filter(l=>/plan vencido sin entrada/i.test(l.text||l.message||'')).length,1);
  clock+=60e3;await cycle(env);s=(await load(env)).state;assert.equal(fetches,0);assert.equal(s.company.planLifecycle.expiredWithoutEntryTotal,1);assert.equal(s.company.planningOutcomes.length,1);assert.equal(s.real.events[0].planLifecycleHistory.length,1);assert.equal(s.real.book.orders.length,0);
 }finally{Date.now=originalNow;globalThis.fetch=originalFetch;env._db.close();}
});
test('employees and meetings can review expired entry terms and their last actual blockers without inventing a return',()=>{
 const s=fixture(),event=s.real.events[0];expireUnfilledPlans(s,now);
 const employee=employeeContext(s,s.company.agency.actors.auditor,now).planningFeedback,meeting=compactContext(s,now).planningFeedback;
 assert.deepEqual(employee,meeting);assert.equal(employee.expiredWithoutEntryTotal,1);
 assert.equal(employee.recent[0].entryMin,9.8);assert.equal(employee.recent[0].entryMax,10.2);assert.deepEqual(employee.recent[0].lastBlockers,['Precio fuera de la zona de entrada']);
 assert.equal(employee.recent[0].lastReference.price,10);assert.equal(employee.recent[0].lastReference.time,now);assert.equal(employee.recent[0].reviewApproved,true);
 assert.equal('pnl' in employee.recent[0],false);assert.equal(s.real.book.orders.length,0);assert.equal(event.status,'caducado');
});
