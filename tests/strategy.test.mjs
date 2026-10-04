import test from 'node:test';
import assert from 'node:assert/strict';
import {catalystReady,researchEvidenceFingerprint,selectResearchCandidates,selectPlanningCandidates,workflowSettings,validateWorkflowStrategy,pipelineSummary,researchBrief,sessionResearchPacing,analysisFollowupPending} from '../trading-worker/strategy.js';
const now=Date.parse('2026-10-03T12:00:00Z'),day=864e5;
const candidate=(id,extra={})=>({id,symbol:id,status:'verificar',confirmed:false,preScore:{eligible:true,score:60},...extra});
const confirmed=(id,extra={})=>candidate(id,{confirmed:true,status:'nuevo',date:'2026-10-07T20:00:00Z',timing:'scheduled',sources:[{url:'https://issuer.example/investors/results',claim:'Fecha publicada por el emisor'}],...extra});
const fixture=events=>({real:{events,assets:events.map(e=>({symbol:e.symbol,sector:'Technology'})),book:{positions:[],closed:[]}},config:{minRR:2,riskPct:.35},policy:{minScore:45,researchDailyLimit:6,researchIntervalMinutes:60},company:{agency:{workQueue:[]}},operating:{remainingEur:9,exhausted:false},paused:false});

test('next session preparation increases useful research within the daily allowance, not approval',()=>{
 const s=fixture([candidate('A')]);s.policy.researchDailyLimit=2;s.operating.paceEurPerDay=.3;
 const sunday=Date.parse('2026-10-04T12:00:00Z');let pace=sessionResearchPacing(s,sunday);
 assert.equal(pace.target,2);assert.equal(pace.limit,6);assert.equal(pace.intervalMinutes,45);assert.equal(s.real.events[0].plan,undefined);
 s.operating.paceEurPerDay=.09;assert.equal(sessionResearchPacing(s,sunday).limit,2);
 s.operating.paceEurPerDay=.01;assert.equal(sessionResearchPacing(s,sunday).limit,0);
 s.company.strategy={weekendPlanning:false};s.operating.paceEurPerDay=.3;assert.equal(sessionResearchPacing(s,sunday).limit,2);
});

test('next-session preparation can finish concrete confirmed follow-ups using spare daily allowance without resetting counters',()=>{
 const sunday=Date.parse('2026-10-04T12:00:00Z'),baseline=sunday-5*3600e3,events=Array.from({length:4},(_,i)=>confirmed('supplement-'+i,{research:{researchedAt:baseline,worthAnalyzing:true},researchAttemptAt:baseline,analysisFollowup:{at:sunday-3*3600e3,baselineResearchAt:baseline,nextTask:'Read the annex and check consideration and financing'}})),s=fixture(events);
 s.company.agency.workQueue=events.map(e=>({kind:'research',eventId:e.id,status:'pending',task:e.analysisFollowup.nextTask,createdAt:sunday-3*3600e3,notBefore:sunday-3600e3}));
 s.real.researchDay='2026-10-04';s.real.researchCalls=6;s.operating.paceEurPerDay=.3;s.operating.daySpentEur=.16;
 const before=JSON.stringify({book:s.real.book,researchCalls:s.real.researchCalls,operating:s.operating});const pacing=sessionResearchPacing(s,sunday);
 assert.equal(pipelineSummary(s,sunday).marketOpen,false);assert.equal(pacing.preparing,true);assert.equal(pacing.limit,9);assert.equal(pacing.intervalMinutes,45);assert.equal(JSON.stringify({book:s.real.book,researchCalls:s.real.researchCalls,operating:s.operating}),before);assert.equal(events.some(e=>e.plan),false);
 s.company.strategy={researchDailyLimit:1};assert.equal(sessionResearchPacing(s,sunday).limit,9,'The adaptive base of one does not strand concrete follow-ups');
 s.operating.daySpentEur=.26;assert.equal(sessionResearchPacing(s,sunday).limit,6);s.operating.daySpentEur=undefined;assert.equal(sessionResearchPacing(s,sunday).limit,6);
 s.operating.daySpentEur=.16;s.operating.remainingEur=0;assert.equal(sessionResearchPacing(s,sunday).limit,6);s.operating.remainingEur=9;s.operating.exhausted=true;assert.equal(sessionResearchPacing(s,sunday).limit,6);s.operating.exhausted=false;
 s.real.researchDay='2026-10-03';assert.equal(sessionResearchPacing(s,sunday).limit,6);assert.equal(s.real.researchCalls,6);s.real.researchDay='2026-10-04';s.real.researchCalls=11;assert.equal(sessionResearchPacing(s,sunday).limit,12);
 s.real.researchCalls=6;for(const e of events)e.status='descartado';assert.equal(sessionResearchPacing(s,sunday).limit,6,'Final rejections never create extra research allowance');
 for(const e of events)e.status='nuevo';for(const w of s.company.agency.workQueue)w.notBefore=sunday+3600e3;assert.equal(sessionResearchPacing(s,sunday).limit,6,'The increase does not bypass task cooldowns');assert.equal(sessionResearchPacing(s,sunday+3600e3).limit,9);
 s.company.strategy={researchDailyLimit:1,weekendPlanning:false};assert.equal(sessionResearchPacing(s,sunday).limit,1);
 s.company.strategy={researchDailyLimit:1};const fridayEvening=Date.parse('2026-10-02T20:30:00Z');assert.equal(sessionResearchPacing(s,fridayEvening).preparing,false);assert.equal(sessionResearchPacing(s,fridayEvening).limit,1,'No increase when the next session is more than sixty hours away');
});

test('Santi receives the analyst questions for the selected company only',()=>{
 const e=candidate('A',{preliminary:{summary:'Agreement needs terms',missingEvidence:['Read the annex'],nextTask:'Find consideration and closing conditions'}}),s=fixture([e]);
 s.company.agency.workQueue=[{kind:'research',eventId:'A',status:'pending',notBefore:now-1,from:'analyst',task:'Read the material agreement',reason:'Missing terms'},{kind:'research',eventId:'B',status:'pending',notBefore:now-1,task:'Other company'},{kind:'research',eventId:'A',status:'complete',notBefore:now-1,task:'Old'}];
 const brief=researchBrief(s,e,now);assert.equal(brief.assignments.length,1);assert.equal(brief.assignments[0].task,'Read the material agreement');assert.equal(brief.preliminary.missingEvidence[0],'Read the annex');
});

test('concrete ready analyst follow-ups receive their additional research capacity before a new broad search',()=>{
 const baseline=now-5*3600e3,followup=confirmed('followup',{preScore:{eligible:true,score:55},research:{researchedAt:baseline,worthAnalyzing:true},analysisFollowup:{baselineResearchAt:baseline,nextTask:'Read the annex and validate financing and cash'}}),fresh=candidate('fresh',{preScore:{eligible:true,score:90}}),s=fixture([fresh,followup]);
 s.company.agency.workQueue=[{kind:'research',eventId:followup.id,status:'pending',createdAt:now-3600e3,notBefore:now-1,task:followup.analysisFollowup.nextTask},{kind:'research',eventId:fresh.id,status:'pending',createdAt:now-1000,notBefore:now-1,task:'Search for the primary date of this new opportunity'}];
 assert.deepEqual(selectResearchCandidates(s,now).map(e=>e.id),['followup','fresh']);
});

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

test('a dated primary update bypasses cooldown but a headline rewrite does not',()=>{
 const e=candidate('updated',{researchAttemptAt:now-3600e3,research:{researchedAt:now-3600e3},source:'https://issuer.example/old'}),s=fixture([e]);e.researchFingerprint=researchEvidenceFingerprint(e);e.title='A different model summary';
 assert.equal(selectResearchCandidates(s,now).length,0);
 e.primaryUpdatedAt=now-1800e3;assert.equal(selectResearchCandidates(s,now)[0],e);
 e.primaryUpdatedAt=now+3600e3;assert.equal(selectResearchCandidates(s,now).length,0);
});

test('confirmed research needs a new concrete assignment and four-hour cooldown without reopening final rejections',()=>{
 const at=now-5*3600e3,e=confirmed('supplement',{researchAttemptAt:at,research:{researchedAt:at,worthAnalyzing:true}}),s=fixture([e]);
 assert.equal(selectResearchCandidates(s,now).length,0);
 const work={id:'supplement-work',kind:'research',eventId:e.id,status:'pending',createdAt:now-3600e3,notBefore:now-3600e3,task:'Read the agreement annex and determine consideration and financing'};s.company.agency.workQueue.push(work);
 assert.deepEqual(selectResearchCandidates(s,now),[e]);
 work.createdAt=at;assert.equal(selectResearchCandidates(s,now).length,0);work.createdAt=now-3600e3;
 e.researchAttemptAt=now-2*3600e3;e.research.researchedAt=e.researchAttemptAt;assert.equal(selectResearchCandidates(s,now).length,0);
 e.primaryUpdatedAt=now-1800e3;assert.deepEqual(selectResearchCandidates(s,now),[e]);
 for(const status of ['descartado','caducado','abierto']){e.status=status;assert.equal(selectResearchCandidates(s,now).length,0);}e.status='nuevo';
 e.review={approve:false};assert.equal(selectResearchCandidates(s,now).length,0);delete e.review;
 e.plan={approve:true};assert.equal(selectResearchCandidates(s,now).length,0);delete e.plan;
 e.research.worthAnalyzing=false;assert.equal(selectResearchCandidates(s,now).length,0);
});

test('a completed supplemental question is not paid again against unchanged evidence',()=>{
 const at=now-5*3600e3,e=confirmed('answered',{researchAttemptAt:at,research:{researchedAt:at,worthAnalyzing:true}}),s=fixture([e]),task='Read the agreement annex and determine consideration';
 s.company.agency.workQueue=[{kind:'research',eventId:e.id,status:'complete',task,finishedAt:at,evidenceFingerprintAtFinish:researchEvidenceFingerprint(e)},{kind:'research',eventId:e.id,status:'pending',task:'  READ the agreement annex and determine consideration  ',createdAt:now-1000,notBefore:now-1000}];
 assert.equal(selectResearchCandidates(s,now).length,0);
 s.company.agency.workQueue[1].task='Check the newly reported cash financing terms';assert.deepEqual(selectResearchCandidates(s,now),[e]);
});

test('a transport failure retries the unanswered supplementary task after its delay without another employee decision',()=>{
 const successAt=now-8*3600e3,failedAt=now-3600e3,e=confirmed('retry',{research:{researchedAt:successAt,worthAnalyzing:true},researchAttemptAt:failedAt,researchRetryAfter:failedAt+4*3600e3}),s=fixture([e]);
 s.company.agency.workQueue=[{kind:'research',eventId:e.id,status:'pending',task:'Read the annex and check actual consideration',createdAt:now-2*3600e3,notBefore:now-2*3600e3}];
 assert.equal(selectResearchCandidates(s,now).length,0);assert.equal(selectResearchCandidates(s,e.researchRetryAfter-1).length,0);assert.deepEqual(selectResearchCandidates(s,e.researchRetryAfter),[e]);
 s.company.agency.workQueue[0].status='complete';assert.equal(selectResearchCandidates(s,e.researchRetryAfter).length,0);
});

test('planning waits for the actual follow-up answer and retry date, then resumes without changing approval',()=>{
 const at=now-5*3600e3,e=confirmed('followup',{research:{researchedAt:at,worthAnalyzing:true},analysisFollowup:{at:now-3600e3,baselineResearchAt:at,missingEvidence:['Agreement consideration']}}),s=fixture([e]);
 assert.equal(analysisFollowupPending(e),true);assert.equal(selectPlanningCandidates(s,now).length,0);assert.equal(pipelineSummary(s,now).counts.analysisReady,0);assert.equal(pipelineSummary(s,now).blockerStage,'research_followup');assert.equal(pipelineSummary(s,now).counts.researchFollowupPending,1);
 e.research.researchedAt=at+1000;assert.equal(analysisFollowupPending(e),false);assert.deepEqual(selectPlanningCandidates(s,now),[e]);
 e.retryAfter=now+3600e3;assert.equal(selectPlanningCandidates(s,now).length,0);assert.equal(pipelineSummary(s,now).counts.analysisReady,0);
 assert.deepEqual(selectPlanningCandidates(s,e.retryAfter),[e]);assert.equal(e.plan,undefined);assert.equal(e.review,undefined);
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

test('pausing entries leaves research and planning visible and only pauses execution of approved plans',()=>{
 const s=fixture([confirmed('plan-me')]);s.paused=true;
 assert.equal(pipelineSummary(s,now).blockerStage,'analysis');assert.equal(pipelineSummary(s,now).entriesPaused,true);assert.equal(selectPlanningCandidates(s,now).length,1);
 s.real.events=[candidate('research-me')];assert.equal(pipelineSummary(s,now).blockerStage,'research');assert.equal(selectResearchCandidates(s,now).length,1);
 s.real.events=[confirmed('ready',{plan:{expiresAt:now+day},review:{approve:true},status:'espera'})];assert.equal(pipelineSummary(s,now).blockerStage,'paused');assert.equal(pipelineSummary(s,now).readyNextSession,1);assert.match(pipelineSummary(s,now).blocker,/Planes preparados/);
});
