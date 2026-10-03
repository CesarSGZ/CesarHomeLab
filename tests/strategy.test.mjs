import test from 'node:test';
import assert from 'node:assert/strict';
import {catalystReady,researchEvidenceFingerprint,selectResearchCandidates,selectPlanningCandidates,workflowSettings,validateWorkflowStrategy,pipelineSummary} from '../trading-worker/strategy.js';
const now=Date.parse('2026-10-03T12:00:00Z'),day=864e5;
const candidate=(id,extra={})=>({id,symbol:id,status:'verificar',confirmed:false,preScore:{eligible:true,score:60},...extra});
const confirmed=(id,extra={})=>candidate(id,{confirmed:true,status:'nuevo',date:'2026-10-07T20:00:00Z',timing:'scheduled',sources:[{url:'https://issuer.example/investors/results',claim:'Fecha publicada por el emisor'}],...extra});
const fixture=events=>({real:{events,assets:events.map(e=>({symbol:e.symbol,sector:'Technology'})),book:{positions:[],closed:[]}},config:{minRR:2,riskPct:.35},policy:{minScore:45,researchDailyLimit:6,researchIntervalMinutes:60},company:{agency:{workQueue:[]}},operating:{remainingEur:9,exhausted:false},paused:false});

test('a primary dated announcement can be analyzed after publication without inventing a future date',()=>{
 assert.equal(catalystReady(confirmed('future'),now),true);
 assert.equal(catalystReady(confirmed('announced',{timing:'announced',date:new Date(now-day).toISOString()}),now),true);
 assert.equal(catalystReady(confirmed('old',{timing:'announced',date:new Date(now-8*day).toISOString()}),now),false);
 assert.equal(catalystReady(confirmed('past',{date:new Date(now-day).toISOString()}),now),false);
 assert.equal(catalystReady(confirmed('far',{date:new Date(now+46*day).toISOString()}),now),false);
 assert.equal(catalystReady(confirmed('not-yet',{timing:'announced'}),now),false);
 assert.equal(catalystReady(confirmed('fake',{sources:[{url:'javascript:alert(1)'}]}),now),false);
 assert.equal(catalystReady(confirmed('calendar',{sources:[]}),now),false);
});

test('research has company cooldowns and does not repeat the same unresolved evidence every day',()=>{
 const old=candidate('old',{researchAttemptAt:now-30*3600e3,research:{researchedAt:now-30*3600e3},source:'https://issuer.example/news'});old.researchFingerprint=researchEvidenceFingerprint(old);
 const cooled=candidate('recent',{researchAttemptAt:now-23*3600e3}),sameCompany=candidate('new-signal',{symbol:'recent',preScore:{eligible:true,score:95}}),fresh=candidate('fresh',{preScore:{eligible:true,score:55}}),ineligible=candidate('unfit',{preScore:{eligible:false,score:100}});
 const s=fixture([old,cooled,sameCompany,fresh,ineligible]);assert.deepEqual(selectResearchCandidates(s,now).map(e=>e.id),['fresh']);
 assert.ok(selectResearchCandidates(s,now+19*3600e3).some(e=>e.id==='old'));
 old.employeePriority={owner:'scout',time:now-3600e3};assert.equal(selectResearchCandidates(s,now)[0].id,'old');
});

test('new evidence reopens research after the 24-hour company cooldown',()=>{
 const e=candidate('updated',{researchAttemptAt:now-26*3600e3,research:{researchedAt:now-26*3600e3},source:'https://issuer.example/old'});e.researchFingerprint=researchEvidenceFingerprint(e);e.source='https://issuer.example/new';assert.equal(selectResearchCandidates(fixture([e]),now).length,1);
 e.researchAttemptAt=now-3600e3;assert.equal(selectResearchCandidates(fixture([e]),now).length,0);
});

test('employee priorities and structured research requests choose useful work without changing scores',()=>{
 const high=candidate('high',{preScore:{eligible:true,score:90}}),assigned=candidate('assigned',{preScore:{eligible:true,score:50}}),s=fixture([high,assigned]);s.company.agency.workQueue.push({id:'q1',kind:'research',eventId:'assigned',createdAt:now-1000,status:'pending',notBefore:now-1000});
 assert.deepEqual(selectResearchCandidates(s,now).map(e=>e.id),['assigned','high']);assert.equal(assigned.preScore.score,50);
 s.company.agency.workQueue[0].notBefore=now+day;assert.deepEqual(selectResearchCandidates(s,now).map(e=>e.id),['high','assigned']);
});

test('weekend preparation includes scheduled events and fresh announcements but skips expired, rejected and opened plans',()=>{
 const future=confirmed('future'),published=confirmed('published',{timing:'announced',date:new Date(now-day).toISOString()}),expired=confirmed('expired',{plan:{expiresAt:now-1}}),rejected=confirmed('rejected',{review:{approve:false}}),opened=confirmed('opened',{status:'abierto'}),pending=candidate('pending',{date:future.date});
 const s=fixture([future,published,expired,rejected,opened,pending]);assert.deepEqual(new Set(selectPlanningCandidates(s,now).map(e=>e.id)),new Set(['future','published']));
 s.company.strategy={weekendPlanning:false};assert.equal(selectPlanningCandidates(s,now).length,0);
});

test('business settings can adapt selection and workload but cannot alter rent or paper accounting',()=>{
 const s=fixture([]);s.company.strategy={minScore:50,researchDailyLimit:8,researchBatchSize:2,enrichmentLimit:6,focusSectors:['Health Care'],weekendPlanning:true,minRR:null};const before=JSON.stringify(s.real.book),w=workflowSettings(s);
 assert.equal(w.minScore,50);assert.equal(w.researchDailyLimit,8);assert.equal(w.minRR,2);assert.equal(w.riskPct,.35);assert.deepEqual(w.focusSectors,['Health Care']);assert.equal(JSON.stringify(s.real.book),before);
 assert.throws(()=>validateWorkflowStrategy({allowanceEur:100}),/fuera del ámbito/);assert.throws(()=>validateWorkflowStrategy({riskPct:10}),/riskPct/);assert.throws(()=>validateWorkflowStrategy({researchDailyLimit:100}),/researchDailyLimit/);assert.throws(()=>validateWorkflowStrategy({focusSectors:['X','X']}),/focusSectors/);
});

test('pipeline summary explains next work and counts only real approved plans for the next session',()=>{
 const plan=confirmed('ready',{status:'espera',plan:{expiresAt:now+5*day},review:{approve:true}}),review=confirmed('review',{plan:{expiresAt:now+5*day}}),screen=confirmed('screen'),research=candidate('research'),s=fixture([plan,review,screen,research]);s.company.agency.workQueue.push({kind:'analysis',phase:'preliminary',status:'pending',eventId:'research'});
 const summary=pipelineSummary(s,now);assert.equal(summary.marketOpen,false);assert.equal(summary.nextSessionDate,'2026-10-05');assert.equal(summary.readyNextSession,1);assert.equal(summary.counts.analysisReady,1);assert.equal(summary.counts.riskPending,1);assert.equal(summary.counts.researchQueue,1);assert.equal(summary.counts.supportPending,1);assert.equal(summary.blockerStage,'session');
 s.operating.exhausted=true;assert.equal(pipelineSummary(s,now).blockerStage,'budget');
});
