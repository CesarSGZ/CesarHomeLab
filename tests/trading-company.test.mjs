import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,upgradeState} from '../trading-worker/engine.js';
import {dueMeeting,holdMeeting,validateProgram,installProgram,observeProgram,executeProgram,compactContext,measureEvidence,initialiseCompany,staff} from '../trading-worker/company.js';
import {officeState,validateEdits} from '../trading-worker/office-boundary.js';
import {developmentAction} from '../trading-worker/development.js';
const state=()=>upgradeState(initialState());
test('Cesar directive reaches all six employees once and remains in meeting context without paid work',()=>{
 const s=state(),book=JSON.stringify(s.real.book);delete s.company.ownerDirectiveDelivered;s.governance.messages=[];
 initialiseCompany(s,Date.parse('2026-10-04T12:00:00Z'));const deliveries=s.governance.messages.filter(m=>m.from==='boss');
 assert.equal(deliveries.length,6);assert.deepEqual(new Set(deliveries.map(m=>m.to)),new Set(staff));assert.match(compactContext(s).ownerDirective,/dos planes/);
 initialiseCompany(s,Date.parse('2026-10-04T13:00:00Z'));assert.equal(s.governance.messages.filter(m=>m.from==='boss').length,6);assert.equal(JSON.stringify(s.real.book),book);
});
const program=()=>({scope:'agent-office',rationale:'Probar con paciencia',threshold:45,rules:[{feature:'relativeVolume',op:'gt',value:2,points:5}],workflow:{researchDailyLimit:5,researchIntervalMinutes:60,riskPct:.35,minRR:2},visual:{focus:'economics',theme:'violet',headline:'Preservar alquiler',panels:['report','efficiency'],lighting:'warm'}});
test('Meetings respect Madrid time, complete slots and resume partial work',()=>{const s=state(),morning=Date.parse('2026-10-02T09:01:00Z');assert.equal(dueMeeting(s,morning).slot,'planning');s.company.meetings.push({id:'2026-10-02:planning',status:'completa'});assert.equal(dueMeeting(s,morning),null);assert.equal(dueMeeting(s,Date.parse('2026-10-02T20:31:00Z')).slot,'closing');});
test('Six employees discuss prior ideas, Augusto decides and actual report uses ledger',async()=>{const s=state(),seen=[];s.operating={spentEur:0,remainingEur:10};const now=Date.parse('2026-10-02T09:01:00Z');await holdMeeting(officeState(s),{budget:async()=>({...s.operating,paceEurPerDay:.3}),checkpoint:async()=>{},log:()=>{},call:async(id,_instructions,payload)=>{seen.push({id,payload});if(seen.length<=12)return {facts:'No cierres',evidence:['closed'],idea:'Conservar',replyTo:payload.earlierIdeas?.length?'Coincido':'',uncertainty:'Muestra pequeña',nextTask:'Observar'};return {summary:'Paciente',decisions:[{kind:'hold'}],assignments:[],reportToCesar:'Sin evidencia para cambiar',codeFiles:[],codeRationale:''};}},now);assert.equal(seen.length,13);assert.equal(seen[5].payload.earlierIdeas.length,0);assert.equal(seen[6].payload.allIdeas.length,6);assert.equal(s.company.meetings[0].responses.length,6);assert.equal(s.company.meetings[0].status,'completa');assert.equal(s.company.reports[0].pnlToday,0);assert.equal(s.real.book.orders.length,0);});
test('Exhausted rent skips discussions while preserving paper money',async()=>{const s=state();let calls=0;await holdMeeting(s,{budget:async()=>({remainingEur:0,paceEurPerDay:0}),checkpoint:async()=>{},log:()=>{},call:async()=>calls++},Date.parse('2026-10-02T09:01:00Z'));assert.equal(calls,0);assert.equal(s.real.book.cash,10000);assert.equal(s.company.meetings[0].status,'omitida');});
test('Validated programs begin a limited pilot without previous closes, and missing metrics stay neutral',()=>{const s=state(),p=program(),now=Date.now();assert.equal(executeProgram(p,{},40).score,40);assert.equal(executeProgram(p,{relativeVolume:3},40).score,45);assert.throws(()=>validateProgram({...p,rules:[{feature:'unknown',op:'gt',value:0,points:5}]}));const before={riskPct:s.config.riskPct,minRR:s.config.minRR},v=installProgram(officeState(s),p,{id:'meeting'},now);observeProgram(officeState(s),now+864e5);assert.equal(s.company.activeProgram,null);assert.equal(v.status,'piloto');assert.equal(v.adaptation.phase,'pilot');assert.equal(v.adaptation.metrics.pilot.closed,0);assert.deepEqual({riskPct:s.config.riskPct,minRR:s.config.minRR},before);const second=installProgram(s,p,{id:'next'},now+864e5);assert.equal(s.company.shadowProgram,v.id);assert.equal(second.status,'solo flujo y visual');assert.equal(second.adaptation,undefined);});
test('Office autonomy cannot mutate cash, original quotes or monthly conditions',()=>{const s=state(),p=officeState(s);assert.throws(()=>p.real.book.cash=0);assert.throws(()=>p.real.quotes.TEST={price:100});assert.throws(()=>p.config.maxEntries=200);assert.throws(()=>p.real={});p.company.tasks.push({task:'Reorganizar'});assert.equal(s.company.tasks.length,1);});
test('Source changes have exact scope and leases protect deployment results',()=>{const s=state(),edits=[{file:'trading-worker/company.js',baseSha:'a'.repeat(40),find:'old',replace:'new'}];assert.throws(()=>validateEdits([{...edits[0],file:'index.html'}]));s.company.development=[{id:'job',status:'queued',edits,summary:'Mejorar reuniones'}];const r=developmentAction(s,{action:'lease'},0);assert.equal(r.job.status,'running');assert.equal(developmentAction(s,{action:'lease'},1).job,null);assert.throws(()=>developmentAction(s,{action:'complete',id:'job',lease:'wrong',status:'applied'}));developmentAction(s,{action:'complete',id:'job',lease:r.job.lease,status:'applied',commit:'b'.repeat(40)});assert.equal(s.company.development[0].status,'applied');});
test('An invalid implementation is rejected without cancelling the employee meeting or report',async()=>{const s=state();s.operating={spentEur:0,remainingEur:10};let calls=0;await holdMeeting(officeState(s),{budget:async()=>({...s.operating,paceEurPerDay:.3}),checkpoint:async()=>{},log:()=>{},call:async()=>{calls++;if(calls<=12)return {facts:'Sin cierres',evidence:[],idea:'Medir',replyTo:'',uncertainty:'Muestra corta',nextTask:'Observar'};if(calls===13)return {summary:'Medir sin operar',decisions:[{kind:'experiment'}],assignments:[],reportToCesar:'Informe contrastado',codeFiles:[],codeRationale:''};const p=program();p.workflow.minRR=0;return p;}},Date.parse('2026-10-02T09:01:00Z'));const m=s.company.meetings[0];assert.equal(m.status,'completa');assert.match(m.programRejected.reason,/Flujo/);assert.match(s.company.reports[0].text,/rechazada/);assert.equal(s.company.versions.length,0);assert.equal(s.real.book.orders.length,0);});

test('A truncated chair gets one migration retry without repeating the twelve employee turns or resetting costs',async()=>{
 const s=state(),now=Date.parse('2026-10-03T12:00:00Z');delete s.company.chairRecoveryMigration;s.operating={spentEur:.013,remainingEur:9.987};
 const voices=staff.map(agent=>({agent,facts:'Dato real',idea:'Preparar planes',evidence:[],uncertainty:'Sin ventaja confirmada',nextTask:'Comparar empresas'})),responses=voices.map(v=>({...v,replyTo:'Priorizar datos'}));
 const m={id:'2026-10-03:planning',day:'2026-10-03',slot:'planning',scheduledTime:'11:00',status:'omitida',attempts:2,error:'Respuesta de IA incompleta',voices,responses,costEur:.013};s.company.meetings.push(m);
 assert.equal(dueMeeting(s,now).id,m.id);assert.equal(m.chairRecoveryPending,true);let calls=0;
 await holdMeeting(s,{budget:async()=>({...s.operating,paceEurPerDay:.3}),checkpoint:async()=>{},log:()=>{},call:async(id,instructions,payload,_schema,options)=>{calls++;assert.equal(id,'auditor');assert.equal(options.outputTokens,2300);assert.match(instructions,/350 palabras/);assert.equal(payload.voices,voices);assert.equal(payload.responses,responses);assert.ok(payload.context.pipeline);assert.ok(payload.context.strategy);s.operating.spentEur+=.001;return {summary:'Planes para próxima sesión',decisions:[{kind:'hold'}],assignments:[],reportToCesar:'Preparación sin operaciones',codeFiles:[],codeRationale:''};}},now);
 assert.equal(calls,1);assert.equal(m.status,'completa');assert.equal(m.attempts,3);assert.ok(m.costEur>=.014-1e-8);assert.equal(m.chairRecoveryPending,false);assert.equal(m.voices.length,6);assert.equal(dueMeeting(s,now),null);
 // The same old failure cannot gain another migration retry.
 m.status='omitida';m.error='Respuesta de IA incompleta';delete m.chair;initialiseCompany(s,now);assert.equal(dueMeeting(s,now),null);
});

test('Migration does not retry meetings omitted for budget, historic days or missing employee rounds',()=>{
 for(const extra of [{error:'Tope de gasto de reunión alcanzado'},{day:'2026-10-02'},{responses:[]}]){
  const s=state();delete s.company.chairRecoveryMigration;const now=Date.parse('2026-10-03T12:00:00Z'),voices=staff.map(agent=>({agent}));
  s.company.meetings.push({id:'2026-10-03:planning',day:'2026-10-03',status:'omitida',attempts:2,error:'Respuesta de IA incompleta',voices,responses:voices,...extra});
  assert.equal(dueMeeting(s,now),null);assert.equal(s.company.meetings[0].status,'omitida');
 }
});

test('Meeting context distinguishes dated announcements from future events and describes the real work queue',()=>{
 const s=state(),now=Date.parse('2026-10-03T12:00:00Z'),source={url:'https://issuer.example/news',claim:'Publicado por el emisor'};
 s.company.strategy={enrichmentLimit:6};s.company.agency.workQueue=[{kind:'analysis',eventId:'published',phase:'preliminary',status:'pending',createdAt:now}];
 s.real.events=[{id:'published',symbol:'PUB',confirmed:true,timing:'announced',date:new Date(now-864e5).toISOString(),status:'nuevo',sources:[source],preScore:{eligible:true,score:65},research:{costEur:.01}},{id:'old',symbol:'OLD',confirmed:true,timing:'announced',date:new Date(now-8*864e5).toISOString(),status:'nuevo',sources:[source],research:{}},{id:'future',symbol:'FUT',confirmed:true,date:new Date(now+864e5).toISOString(),status:'nuevo',sources:[source],research:{}}];
 const proof=measureEvidence(s,now);assert.equal(proof.rows[0].status,'elegible');assert.equal(proof.rows[0].timing,'announced');assert.equal(proof.rows[1].status,'pausada');assert.equal(proof.rows[2].status,'elegible');assert.equal(proof.groups[0].unknownCosts,1);
 const context=compactContext(s,now);assert.equal(context.snapshotAt,new Date(now).toISOString());assert.equal(context.strategy.enrichmentLimit,6);assert.equal(context.pipeline.counts.supportPending,1);assert.equal(context.pipeline.counts.analysisReady,2);assert.equal(context.evidence[0].timing,'announced');assert.equal(context.evidenceProtocol.rows[0].date,s.real.events[0].date);
});

test('Meeting and developer contexts separate the executable base, owned pilot and unapplied latest proposal',async()=>{
 const s=state(),now=Date.parse('2026-10-05T09:01:00Z');s.operating={month:'2026-10',spentEur:.2,remainingEur:9.8};
 const pilotProgram={...program(),threshold:35,workflow:{researchDailyLimit:6,researchIntervalMinutes:45,riskPct:1.2,minRR:1.3}},pilot=installProgram(s,pilotProgram,{id:'pilot'},now-1000);
 s.real.book.orders.push({id:'paper-buy',side:'buy',adaptationId:pilot.id});
 const proposal={...program(),threshold:60,rules:[{feature:'relativeVolume',op:'gt',value:2,points:18}],workflow:{researchDailyLimit:2,researchIntervalMinutes:180,riskPct:2,minRR:1.1}},latest=installProgram(s,proposal,{id:'blocked-economics'},now);
 assert.equal(latest.status,'solo flujo y visual');assert.equal(s.company.shadowProgram,pilot.id);
 const before=JSON.stringify({book:s.real.book,config:s.config,versions:s.company.versions,operating:s.operating}),context=compactContext(s,now);
 assert.equal(context.program.threshold,s.policy.minScore);assert.deepEqual(context.program.rules,[]);assert.equal(context.program.workflow.riskPct,.35);assert.equal(context.program.workflow.minRR,2);
 assert.equal(context.program.workflow.researchDailyLimit,2);assert.equal(context.program.workflow.researchIntervalMinutes,180,'The operational change did apply despite the economic gate');
 assert.equal(context.programState.active,null);assert.equal(context.programState.pilot.id,pilot.id);assert.equal(context.programState.pilot.program.threshold,35);assert.equal(context.programState.pilot.effectiveSettings.riskPct,.6);assert.equal(context.programState.pilot.effectiveSettings.minRR,1.3);
 assert.equal(context.programState.latestProposal.id,latest.id);assert.equal(context.programState.latestProposal.economicApplication,'not_applied');assert.equal(context.programState.latestProposal.program.workflow.riskPct,2);assert.equal(context.programState.latestProposal.effectiveSettings,null);assert.match(context.programState.latestProposal.gate,/operaciones propias/);
 assert.equal(JSON.stringify({book:s.real.book,config:s.config,versions:s.company.versions,operating:s.operating}),before,'Context creation is read-only');
 let calls=0,chairPayload,designerPayload;
 await holdMeeting(officeState(s),{budget:async()=>({...s.operating,paceEurPerDay:.3}),checkpoint:async()=>{},log:()=>{},call:async(id,instructions,payload)=>{
  calls++;if(calls<=12)return {facts:'Un piloto tiene una compra ficticia',evidence:['configuration'],idea:'Conservar economía y mejorar claridad',replyTo:'',uncertainty:'Sin cierres',nextTask:'Mostrar estados separados'};
  if(id==='auditor'){chairPayload=payload;return {summary:'Actualizar interfaz sin confundir propuestas',decisions:[{kind:'visual'}],assignments:[],reportToCesar:'El piloto sigue en evaluación',codeFiles:[],codeRationale:''};}
  designerPayload=payload;assert.match(instructions,/base realmente ejecutable/);return {...payload.currentProgram,rationale:'Conservar economía y actualizar visualización'};
 }},now);
 assert.equal(calls,14);assert.deepEqual(chairPayload.currentCode,context.program);assert.deepEqual(designerPayload.currentProgram,context.program);assert.equal(designerPayload.context.programState.pilot.id,pilot.id);assert.equal(designerPayload.context.programState.latestProposal.id,latest.id);
 assert.equal(s.company.meetings[0].status,'completa');assert.equal(s.company.shadowProgram,pilot.id);assert.equal(s.real.book.orders.length,1);assert.equal(s.config.riskPct,.35);
});
test('Larger discussion limits resume four remembered voices immediately and preserve every prior paid contribution and cost',async()=>{
 const s=state(),now=Date.parse('2026-10-05T21:15:00Z');delete s.company.discussionHeadroomMigration;s.company.chairRecoveryMigration=1;s.operating={month:'2026-10',spentEur:.011,remainingEur:9.989};
 const voices=staff.slice(0,4).map(agent=>({agent,name:s.agents.find(a=>a.id===agent).name,facts:'Dato contrastado',idea:'Idea ya pagada de '+agent,evidence:['configuration'],uncertainty:'Sin cierres',nextTask:'Revisar',time:now-60000})),saved=structuredClone(voices);
 const m={id:'2026-10-05:closing',day:'2026-10-05',slot:'closing',scheduledTime:'22:30',status:'parcial',attempts:1,error:'Respuesta de IA incompleta: max_output_tokens',retryAt:now+3600e3,voices,responses:[],costEur:.011};s.company.meetings.push(m);
 const pending=dueMeeting(s,now);assert.equal(pending.id,m.id);assert.equal(m.retryAt,now);assert.equal(m.discussionRecoveryPending,true);
 const requested=[];await holdMeeting(officeState(s),{budget:async()=>({...s.operating,paceEurPerDay:.3}),checkpoint:async()=>{},log:()=>{},call:async(id,instructions,payload,_schema,options)=>{
  requested.push({id,round:payload.allIdeas?'response':payload.context&&payload.voices?'chair':'voice',tokens:options.outputTokens});s.operating.spentEur+=.0006;
  assert.ok(options.capEur<=.025-.011+1e-12,'Existing paid cost consumes the same meeting cap');
  if(payload.voices)return {summary:'Continuar investigación eficiente',decisions:[{kind:'hold'}],assignments:[],reportToCesar:'Debate recuperado con cuatro aportaciones anteriores',codeFiles:[],codeRationale:''};
  if(payload.allIdeas){assert.equal(options.outputTokens,600);assert.match(instructions,/65 palabras/);}else{assert.equal(options.outputTokens,1000);assert.match(instructions,/120 palabras/);}
  return {facts:'Referencia guardada',evidence:['configuration'],idea:'Propuesta recuperada',replyTo:'Contrastar alternativas',uncertainty:'Muestra preliminar',nextTask:'Investigar sin repetir'};
 }},now);
 assert.deepEqual(m.voices.slice(0,4),saved);assert.deepEqual(requested.filter(r=>r.round==='voice').map(r=>r.id),staff.slice(4));assert.equal(requested.filter(r=>r.round==='response').length,6);assert.equal(requested.filter(r=>r.round==='chair').length,1);
 assert.equal(requested.length,9);assert.equal(m.attempts,2);assert.equal(m.status,'completa');assert.equal(m.discussionRecoveryPending,false);assert.equal(m.discussionRecoveryAttemptedAt,now);assert.ok(Math.abs(m.costEur-(.011+9*.0006))<1e-10);assert.ok(m.costEur<=.025);assert.equal(s.real.book.orders.length,0);
});

test('A current-day omitted second round receives one headroom recovery and never repeats completed voices or replies after another truncation',async()=>{
 const s=state(),now=Date.parse('2026-10-05T21:15:00Z');delete s.company.discussionHeadroomMigration;s.company.chairRecoveryMigration=1;s.operating={month:'2026-10',spentEur:.014,remainingEur:9.986};
 const voices=staff.map(agent=>({agent,name:s.agents.find(a=>a.id===agent).name,facts:'Hecho',idea:'Idea '+agent,evidence:[],uncertainty:'Sin muestra',nextTask:'Contrastar'})),responses=voices.slice(0,2).map(v=>({...v,replyTo:'Respuesta pagada'})),saved=JSON.stringify({voices,responses});
 const m={id:'2026-10-05:planning',day:'2026-10-05',slot:'planning',scheduledTime:'11:00',status:'omitida',attempts:2,error:'Respuesta de IA incompleta: max_output_tokens',voices,responses,costEur:.014};s.company.meetings.push(m);
 assert.equal(dueMeeting(s,now).id,m.id);let calls=0;
 await holdMeeting(s,{budget:async()=>({...s.operating,paceEurPerDay:.3}),checkpoint:async()=>{},log:()=>{},call:async(id,_instructions,payload,_schema,options)=>{calls++;assert.equal(id,staff[2]);assert.ok(payload.allIdeas);assert.equal(options.outputTokens,600);s.operating.spentEur+=.0007;throw Error('Respuesta de IA incompleta: max_output_tokens');}},now);
 assert.equal(calls,1);assert.equal(m.status,'omitida');assert.equal(m.attempts,3);assert.equal(m.discussionRecoveryPending,false);assert.equal(JSON.stringify({voices:m.voices,responses:m.responses}),saved);assert.ok(Math.abs(m.costEur-.0147)<1e-10);
 assert.equal(dueMeeting(s,now+60000)?.id,'2026-10-05:closing','The failed morning meeting is not reopened again');initialiseCompany(s,now+60000);assert.equal(m.status,'omitida');assert.equal(m.discussionRecoveryPending,false);
});

test('Headroom recovery does not bypass meeting spend limits, historical days or the previously consumed chair exception',async()=>{
 const now=Date.parse('2026-10-05T21:15:00Z');
 for(const extra of [{day:'2026-10-04'},{error:'Tope de gasto de reunión alcanzado'},{error:'Respuesta de IA incompleta: content_filter'},{chairRecoveryGrantedAt:now-1000},{discussionRecoveryGrantedAt:now-1000}]){
  const s=state();delete s.company.discussionHeadroomMigration;s.company.chairRecoveryMigration=1;const m={id:'2026-10-05:planning',day:'2026-10-05',status:'omitida',attempts:2,error:'Respuesta de IA incompleta: max_output_tokens',voices:[],responses:[],costEur:.02,...extra};s.company.meetings.push(m);initialiseCompany(s,now);assert.equal(m.status,'omitida');assert.equal(m.discussionRecoveryPending,undefined);
 }
 const s=state();delete s.company.discussionHeadroomMigration;s.company.chairRecoveryMigration=1;s.operating={month:'2026-10',spentEur:.0247,remainingEur:9.9753};
 const m={id:'2026-10-05:closing',day:'2026-10-05',slot:'closing',scheduledTime:'22:30',status:'omitida',attempts:2,error:'Respuesta de IA incompleta: max_output_tokens',voices:[],responses:[],costEur:.0247};s.company.meetings.push(m);let calls=0;
 await holdMeeting(s,{budget:async()=>({...s.operating,paceEurPerDay:.3}),checkpoint:async()=>{},log:()=>{},call:async()=>{calls++;}},now);
 assert.equal(calls,0);assert.equal(m.costEur,.0247);assert.equal(m.status,'omitida');assert.match(m.error,/Tope de gasto/);assert.equal(m.capEur,.025);assert.equal(m.discussionRecoveryPending,false);
});
test('Meeting context sends learning once and bounded evidence/source examples without losing real totals or mutating the source',()=>{
 const s=state(),now=Date.parse('2026-10-05T21:15:00Z'),source={url:'https://issuer.example/news',claim:'Fuente primaria'};
 s.kpis={closed:2,grossPnl:12,learning:{marker:'UNIQUE_LEARNING_CONTEXT',funnel:{paperBuys:2},limitations:'Muestra pequeña'}};
 s.real.events=Array.from({length:34},(_,i)=>({id:'fact-'+i,symbol:'T'+i,date:new Date(now+864e5).toISOString(),confirmed:true,status:'nuevo',sources:[source],preScore:{eligible:true,score:65},research:{costEur:.01}}));
 s.real.discovery={lastAt:now,universe:2280,enriched:250,queued:12,newSignals:2,qualification:{evaluated:34,blocked:3},sources:Object.fromEntries(Array.from({length:9},(_,i)=>['Source '+i,{at:now,items:20,matched:2,filteredNoise:1,error:i===0?'unavailable '.repeat(30):null,unneededBody:'large detail '.repeat(100)}]))};
 const before=JSON.stringify({kpis:s.kpis,events:s.real.events,discovery:s.real.discovery}),context=compactContext(s,now);
 assert.equal(JSON.stringify(context).split('UNIQUE_LEARNING_CONTEXT').length-1,1);assert.deepEqual(context.learning,s.kpis.learning);assert.equal(context.kpis.learning,undefined);assert.equal(context.kpis.grossPnl,12);
 assert.equal(context.evidenceProtocol.count,34);assert.equal(context.evidenceProtocol.rows.length,8);assert.equal(context.evidenceProtocol.omitted,26);assert.equal(context.evidenceProtocol.groups[0].count,34);assert.equal(context.evidenceProtocol.groups[0].costed,34);
 assert.equal(context.sources.universe,2280);assert.equal(context.sources.queued,12);assert.equal(context.sources.sourceCount,9);assert.equal(Object.keys(context.sources.sources).length,6);assert.equal(context.sources.omittedSources,3);assert.equal(context.sources.sources['Source 0'].error.length,180);assert.equal(context.sources.sources['Source 0'].unneededBody,undefined);
 assert.equal(context.programState.currentProgram,undefined,'The complete baseline appears once under context.program');assert.equal(JSON.stringify({kpis:s.kpis,events:s.real.events,discovery:s.real.discovery}),before);
});

test('Both truncated meetings can recover once, with the already scheduled closing discussion taking priority',()=>{
 const s=state(),now=Date.parse('2026-10-05T21:15:00Z');delete s.company.discussionHeadroomMigration;s.company.chairRecoveryMigration=1;
 s.company.meetings=['planning','closing'].map(slot=>({id:'2026-10-05:'+slot,day:'2026-10-05',slot,status:'omitida',attempts:2,error:'Respuesta de IA incompleta: max_output_tokens',voices:[],responses:[],costEur:.01}));
 const due=dueMeeting(s,now);assert.equal(due.id,'2026-10-05:closing');assert.equal(s.company.meetings[0].discussionRecoveryPending,true);assert.equal(s.company.meetings[1].discussionRecoveryPending,true);
 s.company.meetings[1].status='completa';assert.equal(dueMeeting(s,now).id,'2026-10-05:planning');assert.equal(s.company.meetings[0].costEur,.01);
});