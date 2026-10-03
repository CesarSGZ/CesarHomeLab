import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {llm,initialState,upgradeState,verifyResearch,planProblems,reconsiderLegacyPlanning,cycle,locked,load,employeeFunctionOptions} from '../trading-worker/engine.js';
import {day} from '../trading-worker/core.js';
import {referenceSource} from '../trading-worker/market-data.js';
import {queueEmployeeWork,employeeTools,initiativeSchema} from '../trading-worker/employee-agents.js';
import {requiresDeepAnalysis,nextDeepAnalysisAt,selectPlanningCandidates} from '../trading-worker/strategy.js';

function memoryEnv(){
 const db=new DatabaseSync(':memory:');for(const file of ['0008_trading_lab.sql','0009_trading_operating_budget.sql'])db.exec(readFileSync(new URL('../migrations/'+file,import.meta.url),'utf8'));
 const wrap=(sql,args=[])=>({bind(...values){return wrap(sql,values);},async first(){return db.prepare(sql).get(...args)||null;},async all(){return {results:db.prepare(sql).all(...args)};},async run(){return db.prepare(sql).run(...args);}});
 return {OPENAI_RUNTIME_KEY:'test-only-not-a-live-key',CONTROL_DB:{prepare:wrap,async batch(ops){db.exec('BEGIN');try{const result=[];for(const op of ops)result.push(await op.run());db.exec('COMMIT');return result;}catch(error){db.exec('ROLLBACK');throw error;}}},_db:db};
}
const now=Date.parse('2026-10-03T12:00:00Z'),primary='https://ir.issuer.example/contract';
const researchAnswer=extra=>({confirmed:true,eventDate:new Date(now-864e5).toISOString(),timing:'announced',kind:'Contrato material',catalyst:'Contrato publicado ayer',primaryDomain:'issuer.example',sources:[{url:primary,claim:'El emisor publicó el contrato en la fecha indicada'}],_retrieved:[primary],summary:'Hecho primario anunciado con su fecha literal y riesgos aún pendientes de valoración. '.repeat(3),probabilityPositive:55,upsidePct:12,downsidePct:10,confidence:'baja',uncertainties:'No es una probabilidad calibrada',worthAnalyzing:true,...extra});

test('operational analysis ignores old administrative instructions and accounts only its bounded Luna call',async()=>{
 const env=memoryEnv(),s=upgradeState(initialState());s.real.book.fx={rate:1};s.company.tasks=[{owner:'analyst',task:'Esperar siete días antes de pensar en compras'}];let request;
 const original=globalThis.fetch;globalThis.fetch=async(url,options)=>{assert.equal(url,'https://api.openai.com/v1/responses');request=JSON.parse(options.body);return Response.json({status:'completed',usage:{input_tokens:500,output_tokens:200},output:[{type:'message',content:[{type:'output_text',text:'{"approve":false}'}]}]});};
 try{await llm(env,s,'analyst','Valora esta empresa con los datos disponibles.',{evidence:'Referencia fechada'}, {type:'object',properties:{approve:{type:'boolean'}},required:['approve'],additionalProperties:false},{work:true,light:true,outputTokens:800,capEur:.0035});
  assert.equal(request.model,'gpt-6-luna');assert.equal(request.max_output_tokens,800);assert.doesNotMatch(request.instructions,/Esperar siete días/);assert.match(request.instructions,/prioridad sobre reuniones/);assert.match(request.instructions,/mercado cerrado permite investigación/i);
  const recorded=env._db.prepare('SELECT actual,eur_actual,status FROM trading_calls').get();assert.ok(Math.abs(recorded.actual-.00015)<1e-10);assert.equal(recorded.status,'complete');assert.ok(env._db.prepare('SELECT spent_eur FROM trading_operating_budget').get().spent_eur<=10);assert.equal(s.real.book.orders.length,0);
 }finally{globalThis.fetch=original;env._db.close();}
});

test('operational caps and remaining monthly rent are checked before contacting a model',async()=>{
 const env=memoryEnv(),s=initialState();s.real.book.fx={rate:1};let calls=0;const original=globalThis.fetch;globalThis.fetch=async()=>{calls++;throw Error('No request may spend money');};
 try{await assert.rejects(()=>llm(env,s,'analyst','Analiza',{}, {},{work:true,light:true,outputTokens:800,capEur:.0000001}),/Reserva supera/);assert.equal(env._db.prepare('SELECT COUNT(*) AS n FROM trading_calls').get().n,0);
  env._db.prepare('INSERT INTO trading_operating_budget(month,spent_eur,updated_at) VALUES (?,?,?)').run(day().slice(0,7),9.9999,Date.now());await assert.rejects(()=>llm(env,s,'analyst','Analiza',{}, {},{work:true,light:true,outputTokens:800,capEur:.0035}),/mensual/);assert.equal(calls,0);assert.equal(env._db.prepare('SELECT spent_eur FROM trading_operating_budget').get().spent_eur,9.9999);assert.equal(s.real.book.cash,10000);
 }finally{globalThis.fetch=original;env._db.close();}
});

test('research preserves an announcement publication date and never substitutes a future holding horizon',()=>{
 const e={date:null},answer=researchAnswer({});const verified=verifyResearch(answer,e,now);assert.equal(verified.confirmed,true);assert.equal(verified.timing,'announced');assert.equal(verified.date,answer.eventDate);
 assert.equal(verifyResearch(researchAnswer({_retrieved:[]}),e,now).confirmed,false);assert.equal(verifyResearch(researchAnswer({eventDate:new Date(now-8*864e5).toISOString()}),e,now).confirmed,false);assert.equal(verifyResearch(researchAnswer({eventDate:new Date(now+864e5).toISOString()}),e,now).confirmed,false);assert.equal(verifyResearch(researchAnswer({timing:'unresolved'}),e,now).confirmed,false);
 const scheduled=verifyResearch(researchAnswer({timing:'scheduled',eventDate:new Date(now+5*864e5).toISOString()}),e,now);assert.equal(scheduled.confirmed,true);assert.equal(scheduled.timing,'scheduled');assert.equal(verifyResearch(researchAnswer({timing:'scheduled'}),e,now).confirmed,false);
});

test('plans reject inconsistent thresholds and insufficient reward/risk before another employee is paid',()=>{
 const plan={holdingDays:7,entryMin:10,entryMax:10.5,stop:9,target:14};assert.deepEqual(planProblems(plan,{minRR:2}),[]);assert.match(planProblems({...plan,target:11},{minRR:2})[0],/Beneficio\/riesgo/);assert.match(planProblems({...plan,stop:10.1},{minRR:2})[0],/Umbrales/);assert.match(planProblems({...plan,holdingDays:31},{minRR:2})[0],/Duración/);assert.match(planProblems({...plan,target:NaN},{minRR:2})[0],/Umbrales/);
});

test('only legacy stale-price or administrative rejections are reconsidered once with decision history preserved',()=>{
 const stale={id:'stale',confirmed:true,status:'descartado',reasons:['Referencia de hace 19 horas: incumple el máximo de 120 segundos']},administrative={id:'admin',confirmed:true,status:'descartado',reasons:['Esperar siete días por encargo administrativo']},economic={id:'economic',confirmed:true,status:'descartado',reasons:['FCF negativo y valoración sin margen']},unconfirmed={id:'unknown',confirmed:false,status:'descartado',reasons:['Cotización antigua']},planned={id:'plan',confirmed:true,status:'descartado',reasons:['Cotización antigua'],plan:{expiresAt:now+864e5}},s={real:{events:[stale,administrative,economic,unconfirmed,planned]}};
 reconsiderLegacyPlanning(s,now);assert.equal(stale.status,'nuevo');assert.equal(administrative.status,'nuevo');assert.equal(economic.status,'descartado');assert.equal(unconfirmed.status,'descartado');assert.equal(planned.status,'descartado');assert.equal(stale.decisionHistory[0].reasons[0],'Referencia de hace 19 horas: incumple el máximo de 120 segundos');
 stale.status='descartado';stale.reasons=['Cotización antigua'];reconsiderLegacyPlanning(s,now+1000);assert.equal(stale.status,'descartado');assert.equal(stale.decisionHistory.length,1);
});

test('an invalid prepared plan does not call risk, invent an approval, or claim the plan was delivered',async()=>{
 const env=memoryEnv(),t=Date.now(),eventId='invalid-plan';env._db.prepare('INSERT INTO trading_secrets(name,cipher,iv,updated_at) VALUES (?,?,?,?)').run('openai','test-only','test-only',t);
 await locked(env,async s=>{
  s.real.assets=[{symbol:'SMALL',name:'Small Common Stock',exchange:'NASDAQ',marketCap:300e6,price:10,dataVerified:true}];s.real.events=[{id:eventId,symbol:'SMALL',status:'nuevo',confirmed:true,source:primary,sources:[{url:primary,claim:'Fecha primaria'}],date:new Date(t+864e5).toISOString(),summary:'Evento futuro contrastado con fuentes',preScore:{eligible:true,score:70}}];s.real.quotes={SMALL:{price:10,time:t-3600e3,fetchedAt:t,referenceOnly:true,currency:'USD',source:referenceSource,dollarVolume:5e6}};s.real.marketCheckedAt=t;s.real.marketProviderAt=t;s.real.book.fx={rate:1,time:t,checkedAt:t};s.real.lastScan=t;
  for(const a of s.agents)a.paused=!['analyst','risk','operator'].includes(a.id);s.company.agency.day=new Date(t).toISOString().slice(0,10);s.company.agency.runsToday=6;queueEmployeeWork(s,'analysis',eventId,{owner:'analyst',decision:'Valorar datos disponibles',nextTask:'Preparar plan',evidenceIds:[eventId],strategy:null},t);
 });
 let calls=0;const original=globalThis.fetch;globalThis.fetch=async(url,options)=>{assert.equal(url,'https://api.openai.com/v1/responses');const request=JSON.parse(options.body);calls++;assert.equal(request.model,'gpt-6-luna');return Response.json({status:'completed',usage:{input_tokens:500,output_tokens:200},output:[{type:'message',content:[{type:'output_text',text:JSON.stringify({approve:true,thesis:'Fixture con RR insuficiente',entryMin:9.9,entryMax:10.1,stop:9,target:11,holdingDays:7,bearCase:'Riesgo',baseCase:'Plano',bullCase:'Subida',invalidation:'Falla tesis',reason:'Fixture inválida'})}]}]});};
 try{await cycle(env);const {state:s}=await load(env),e=s.real.events[0],work=s.company.agency.workQueue.find(w=>w.eventId===eventId);assert.equal(calls,1);assert.equal(e.status,'descartado');assert.equal(e.plan,undefined);assert.equal(e.review,undefined);assert.equal(s.real.book.orders.length,0);assert.match(work.result,/riesgo insuficiente/i);assert.doesNotMatch(work.result,/plan elaborado/i);
 }finally{globalThis.fetch=original;env._db.close();}
});

test('ordinary weekend planning uses Luna despite a full Sol quota, obtains independent risk review, and waits with a real session plan',async()=>{
 const env=memoryEnv(),t=Date.parse('2026-10-03T15:00:00Z'),eventId='weekend-plan',friday=Date.parse('2026-10-02T19:50:00Z'),originalNow=Date.now,originalFetch=globalThis.fetch;Date.now=()=>t;
 try{
  env._db.prepare('INSERT INTO trading_secrets(name,cipher,iv,updated_at) VALUES (?,?,?,?)').run('openai','test-only','test-only',t);
  for(const id of ['deep-1','deep-2'])env._db.prepare('INSERT INTO trading_calls(id,day,model,reserved,actual,status,created_at,eur_actual,fx_rate,agent) VALUES (?,?,?,?,?,?,?,?,?,?)').run(id,day(t),'gpt-6.1-sol',.01,.001,'complete',t,.001,1,'analyst');
  env._db.prepare('INSERT INTO trading_budget(day,spent,calls) VALUES (?,?,?)').run(day(t),.002,2);
  await locked(env,async s=>{
   s.real.assets=[{symbol:'SMALL',name:'Small Common Stock',exchange:'NASDAQ',marketCap:300e6,price:10,dataVerified:true}];s.real.events=[{id:eventId,symbol:'SMALL',status:'nuevo',confirmed:true,timing:'scheduled',kind:'Resultados',source:primary,sources:[{url:primary,claim:'Fecha primaria y guidance de resultados'}],date:'2026-10-07T20:00:00Z',summary:'Resultados futuros de una operadora de peajes con guía positiva respaldada. Un regulatory report obligatorio describe los riesgos regulatorios del sector.',research:{worthAnalyzing:true,uncertainties:'Sorpresa pendiente'},preScore:{eligible:true,score:70}}];
   s.real.profiles={SMALL:{checkedAt:t,fundamentals:{checkedAt:t,source:'https://data.sec.gov/test',metrics:{fcf:2e6,revenueYoY:.1,netMargin:.15,shareGrowth:.01,cashLatest:20e6,annualAgeDays:180}},market:{asOf:new Date(friday).toISOString(),averageDollarVolume:5e6}}};s.real.quotes={SMALL:{price:10,time:friday,fetchedAt:t,referenceOnly:true,currency:'USD',source:referenceSource,dollarVolume:5e6}};s.real.marketCheckedAt=t;s.real.marketProviderAt=t;s.real.book.fx={rate:1,time:friday,checkedAt:t};s.real.lastScan=t;
   for(const a of s.agents)a.paused=!['analyst','risk','operator'].includes(a.id);s.company.agency.day=new Date(t).toISOString().slice(0,10);s.company.agency.runsToday=6;s.company.agency.preparationDay=new Date(t).toISOString().slice(0,10);s.company.agency.preparationCalls=2;
   queueEmployeeWork(s,'analysis',eventId,{owner:'analyst',decision:'Preparar siguiente sesión',nextTask:'Valorar tesis',evidenceIds:[eventId],strategy:null},t);queueEmployeeWork(s,'risk',eventId,{owner:'risk',decision:'Revisión independiente',nextTask:'Revisar el plan preparado',evidenceIds:[eventId],strategy:null},t);
  });
  const requests=[];globalThis.fetch=async(url,options)=>{
   assert.equal(url,'https://api.openai.com/v1/responses');const body=JSON.parse(options.body),input=JSON.parse(body.input);requests.push(body);assert.equal(body.model,'gpt-6-luna');assert.equal(input.financialProfile.fundamentals.metrics.fcf,2e6);assert.equal(input.quote.time,friday);assert.equal(input.quote.timeISO,'2026-10-02T19:50:00.000Z');assert.equal(input.quote.fetchedAtISO,'2026-10-03T15:00:00.000Z');
   const answer=body.text.format.schema.properties.holdingDays?{approve:true,thesis:'Tesis de fixture con escenarios y fecha primaria',entryMin:9.8,entryMax:10.2,stop:9.5,target:12,holdingDays:7,bearCase:'Guía incumplida',baseCase:'Plano',bullCase:'Resultados superiores',invalidation:'Falla guía',reason:'Datos suficientes en fixture'}:{approve:true,reason:'Revisión independiente de la fixture: lote y escenarios válidos'};
   return Response.json({status:'completed',usage:{input_tokens:500,output_tokens:200},output:[{type:'message',content:[{type:'output_text',text:JSON.stringify(answer)}]}]});
  };
  await cycle(env);const {state:s}=await load(env),event=s.real.events[0];assert.equal(requests.length,2);assert.equal(event.status,'espera');assert.ok(event.plan);assert.equal(event.review.approve,true);assert.equal(event.plan.referenceAt,friday);assert.equal(s.real.book.orders.length,0);assert.equal(s.company.sessionPlan.ready.length,1);assert.equal(s.company.pipeline.readyNextSession,1);assert.equal(s.company.sessionPlan.date,'2026-10-05');
  const work=s.company.agency.workQueue.filter(w=>w.eventId===eventId);assert.equal(work.find(w=>w.kind==='analysis').status,'complete');assert.equal(work.find(w=>w.kind==='risk').status,'complete');assert.match(work.find(w=>w.kind==='risk').result,/riesgo aprobado/);assert.equal(env._db.prepare('SELECT COUNT(*) AS n FROM trading_calls WHERE model=?').get('gpt-6.1-sol').n,2);assert.equal(env._db.prepare('SELECT COUNT(*) AS n FROM trading_calls WHERE model=?').get('gpt-6-luna').n,2);
 }finally{Date.now=originalNow;globalThis.fetch=originalFetch;env._db.close();}
});

test('native initiative functions use strict complete schemas and expose strategy only on tune_strategy',()=>{
 const options=employeeFunctionOptions('auditor',employeeTools.auditor,initiativeSchema);assert.equal(options.tool_choice,'required');assert.equal(options.parallel_tool_calls,false);
 for(const tool of options.tools){assert.equal(tool.strict,true);assert.equal(tool.parameters.additionalProperties,false);assert.deepEqual(new Set(tool.parameters.required),new Set(Object.keys(tool.parameters.properties)));assert.equal(tool.parameters.properties.tool,undefined);
  if(tool.name==='tune_strategy'){assert.ok(tool.parameters.properties.strategy);const object=tool.parameters.properties.strategy.anyOf.find(x=>x.type==='object');assert.equal(object.additionalProperties,false);assert.deepEqual(new Set(object.required),new Set(Object.keys(object.properties)));assert.ok(object.properties.researchBatchSize);assert.ok(object.properties.weekendPlanning);}
  else assert.equal(tool.parameters.properties.strategy,undefined);
 }
 assert.throws(()=>employeeFunctionOptions('operator',['tune_strategy'],initiativeSchema),/fuera del rol/);
});

test('a specialist task created after a slow initiative is consumed in the same cycle using the current clock',async()=>{
 const env=memoryEnv(),start=Date.parse('2026-10-03T15:00:00Z'),eventId='same-cycle-preparation',friday=Date.parse('2026-10-02T19:50:00Z'),originalNow=Date.now,originalFetch=globalThis.fetch;let clock=start;
 // Monotonic millisecond ticks model the DB/checkpoint time before the initiative;
 // its actual model request then takes another five seconds.
 Date.now=()=>clock++;
 try{
  env._db.prepare('INSERT INTO trading_secrets(name,cipher,iv,updated_at) VALUES (?,?,?,?)').run('openai','test-only','test-only',start);
  await locked(env,async s=>{
   s.real.assets=[{symbol:'SMALL',name:'Small Common Stock',exchange:'NASDAQ',marketCap:300e6,price:10,dataVerified:true}];s.real.events=[{id:eventId,symbol:'SMALL',status:'verificar',confirmed:false,source:primary,date:null,kind:'Contrato',summary:'Señal pendiente de evidencia primaria',signal:{url:primary,headline:'Contrato comunicado',publishedAt:friday,strength:28},preScore:{eligible:true,score:70}}];s.real.profiles={SMALL:{checkedAt:start,fundamentals:{checkedAt:start,source:'https://data.sec.gov/test',metrics:{fcf:2e6,revenueYoY:.1,cashLatest:20e6}},market:{asOf:new Date(friday).toISOString(),averageDollarVolume:5e6}}};s.real.quotes={SMALL:{price:10,time:friday,fetchedAt:start,referenceOnly:true,currency:'USD',source:referenceSource,dollarVolume:5e6}};s.real.marketCheckedAt=start;s.real.marketProviderAt=start;s.real.book.fx={rate:1,time:friday,checkedAt:start};s.real.lastScan=start;
   for(const a of s.agents)a.paused=a.id!=='analyst';for(const a of Object.values(s.company.agency.actors))a.nextWake=start+864e5;s.company.agency.actors.analyst.nextWake=start-1;s.company.agency.day=new Date(start).toISOString().slice(0,10);s.company.agency.runsToday=0;s.company.agency.lastDispatch=0;
  });
  const cycleStartedAt=clock,requests=[];let initiativeReturnedAt;
  globalThis.fetch=async(url,options)=>{
   assert.equal(url,'https://api.openai.com/v1/responses');const body=JSON.parse(options.body);requests.push(body);assert.equal(body.model,'gpt-6-luna');
   if(body.tools){assert.ok(body.tools.some(t=>t.name==='prepare_plan'));clock+=5000;initiativeReturnedAt=clock;return Response.json({status:'completed',usage:{input_tokens:500,output_tokens:120},output:[{type:'function_call',name:'prepare_plan',arguments:JSON.stringify({goal:'Preparar próximas compras con rigor',decision:'Usar el perfil descargado para identificar la evidencia necesaria',target:'none',eventId,evidenceIds:[eventId],nextTask:'Comparar la señal con los fundamentales y señalar faltantes',wakeHours:4})}]});}
   const input=JSON.parse(body.input);assert.equal(input.event.id,eventId);assert.equal(input.financialProfile.fundamentals.metrics.fcf,2e6);return Response.json({status:'completed',usage:{input_tokens:500,output_tokens:200},output:[{type:'message',content:[{type:'output_text',text:JSON.stringify({summary:'Perfil comparado; falta contraste del contrato',thesis:'La señal merece verificación antes de valoración',missingEvidence:['Documento primario del contrato'],worthFurtherWork:false,nextOwner:'auditor',nextTask:'Mantener pendiente hasta nueva evidencia'})}]}]});
  };
  await cycle(env);const {state:s}=await load(env),work=s.company.agency.workQueue.find(w=>w.eventId===eventId&&w.kind==='analysis'),event=s.real.events[0];
  assert.equal(requests.length,2);assert.equal(s.company.agency.actors.analyst.lastAction.tool,'prepare_plan');assert.equal(work.phase,'preliminary');assert.equal(work.status,'complete');assert.ok(work.notBefore>cycleStartedAt,'The new task was not due at the cycle start');assert.ok(work.createdAt<=work.finishedAt);assert.ok(work.finishedAt>=initiativeReturnedAt,'Preparation must use the clock after the initiative returns');assert.ok(event.preliminary);assert.equal(event.preliminary.executable,false);assert.equal(event.plan,undefined);assert.equal(event.review,undefined);assert.equal(s.real.book.orders.length,0);
 }finally{Date.now=originalNow;globalThis.fetch=originalFetch;env._db.close();}
});

test('clinical analysis exhausts its actual daily quota explicitly and automatically reopens on the next New York day',async()=>{
 const env=memoryEnv(),t=Date.parse('2026-10-03T15:00:00Z'),friday=Date.parse('2026-10-02T19:50:00Z'),eventId='fda-quota',originalNow=Date.now,originalFetch=globalThis.fetch;let clock=t;Date.now=()=>clock;
 try{
  env._db.prepare('INSERT INTO trading_secrets(name,cipher,iv,updated_at) VALUES (?,?,?,?)').run('openai','test-only','test-only',t);
  for(const id of ['quota-deep-1','quota-deep-2'])env._db.prepare('INSERT INTO trading_calls(id,day,model,reserved,actual,status,created_at,eur_actual,fx_rate,agent) VALUES (?,?,?,?,?,?,?,?,?,?)').run(id,day(t),'gpt-6.1-sol',.01,.001,'complete',t,.001,1,'analyst');env._db.prepare('INSERT INTO trading_budget(day,spent,calls) VALUES (?,?,?)').run(day(t),.002,2);
  await locked(env,async s=>{
   s.real.assets=[{symbol:'BIOT',name:'Biot Common Stock',exchange:'NASDAQ',marketCap:300e6,price:10,dataVerified:true}];s.real.events=[{id:eventId,symbol:'BIOT',status:'nuevo',confirmed:true,timing:'scheduled',kind:'Decisión FDA',source:primary,sources:[{url:primary,claim:'FDA PDUFA date confirmed by issuer'}],date:'2026-10-07T20:00:00Z',summary:'La decisión FDA tras un ensayo clínico tiene escenarios regulatorios inciertos.',research:{worthAnalyzing:true},preScore:{eligible:true,score:70}}];s.real.profiles={BIOT:{checkedAt:t,fundamentals:{checkedAt:t,source:'https://data.sec.gov/test',metrics:{cashLatest:20e6}},market:{asOf:new Date(friday).toISOString(),averageDollarVolume:5e6}}};s.real.quotes={BIOT:{price:10,time:friday,fetchedAt:t,referenceOnly:true,currency:'USD',source:referenceSource,dollarVolume:5e6}};s.real.marketCheckedAt=t;s.real.marketProviderAt=t;s.real.book.fx={rate:1,time:friday,checkedAt:t};s.real.lastScan=t;
   for(const a of s.agents)a.paused=!['analyst','risk'].includes(a.id);s.company.agency.day=new Date(t).toISOString().slice(0,10);s.company.agency.runsToday=6;queueEmployeeWork(s,'analysis',eventId,{owner:'analyst',decision:'Valorar catalizador clínico',nextTask:'Contrastar escenarios FDA',evidenceIds:[eventId],strategy:null},t);
  });
  let calls=0;globalThis.fetch=async()=>{calls++;throw Error('The exhausted clinical quota must not call any model');};await cycle(env);let s=(await load(env)).state,e=s.real.events[0];assert.equal(calls,0);assert.equal(e.status,'espera');assert.match(e.reasons[0],/dos revisiones profundas agotada/);assert.equal(e.analysisDeferred.day,day(t));assert.equal(e.analysisDeferred.nextAt,Date.parse('2026-10-04T04:00:00Z'));assert.equal(s.company.pipeline.counts.analysisReady,0);assert.equal(s.company.pipeline.counts.analysisDeferred,1);assert.equal(s.company.pipeline.blockerStage,'analysis_quota');assert.equal(selectPlanningCandidates(s,t).length,0);assert.equal(s.real.book.orders.length,0);
  await cycle(env);s=(await load(env)).state;assert.equal(calls,0);assert.equal(s.logs.filter(l=>/cuota diaria de dos revisiones profundas agotada/i.test(l.text)).length,1);
  clock=e.analysisDeferred.nextAt+1000;assert.equal(selectPlanningCandidates(s,clock)[0].id,eventId);
  await locked(env,async s=>{s.real.marketCheckedAt=clock;s.real.marketProviderAt=clock;s.real.book.fx.checkedAt=clock;s.company.agency.day=new Date(clock).toISOString().slice(0,10);s.company.agency.runsToday=6;});
  globalThis.fetch=async(url,options)=>{calls++;assert.equal(url,'https://api.openai.com/v1/responses');assert.equal(JSON.parse(options.body).model,'gpt-6.1-sol');return Response.json({status:'completed',usage:{input_tokens:500,output_tokens:200},output:[{type:'message',content:[{type:'output_text',text:JSON.stringify({approve:false,thesis:'Fixture',entryMin:0,entryMax:0,stop:0,target:0,holdingDays:7,bearCase:'Riesgo clínico',baseCase:'Pendiente',bullCase:'Hipótesis',invalidation:'Falta evidencia',reason:'El análisis profundo no justifica entrada'})}]}]});};
  await cycle(env);s=(await load(env)).state;e=s.real.events[0];assert.equal(calls,1);assert.equal(e.analysisDeferred,undefined);assert.equal(e.status,'descartado');assert.equal(env._db.prepare('SELECT COUNT(*) AS n FROM trading_calls WHERE day=? AND model=?').get(day(clock),'gpt-6.1-sol').n,1);assert.equal(s.real.book.orders.length,0);
 }finally{Date.now=originalNow;globalThis.fetch=originalFetch;env._db.close();}
});

test('deep analysis requires medical complexity and its daily reset follows New York daylight saving time',()=>{
 assert.equal(requiresDeepAnalysis({kind:'Resultados',summary:'Regulatory filing and general riesgos regulatorios de una empresa de peajes'}),false);assert.equal(requiresDeepAnalysis({kind:'Contrato',summary:'Sector energético regulatorio'}),false);
 for(const summary of ['FDA PDUFA decision','Clinical trial results','Ensayo clínico fase 3','Oncology treatment approval','Biotech catalyst'])assert.equal(requiresDeepAnalysis({kind:'Evento',summary}),true);
 assert.equal(nextDeepAnalysisAt(Date.parse('2026-10-03T15:00:00Z')),Date.parse('2026-10-04T04:00:00Z'));assert.equal(nextDeepAnalysisAt(Date.parse('2026-11-01T15:00:00Z')),Date.parse('2026-11-02T05:00:00Z'));assert.equal(nextDeepAnalysisAt(Date.parse('2026-03-08T15:00:00Z')),Date.parse('2026-03-09T04:00:00Z'));
});
