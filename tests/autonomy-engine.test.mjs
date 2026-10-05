import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {llm,initialState,upgradeState,verifyResearch,planProblems,reconsiderLegacyPlanning,cycle,locked,load,employeeFunctionOptions,planningRiskContext,constrainEntryRange,reconsiderRangeValidation,requestPlanRevision,reconsiderRiskRevisions,requestRiskClarification,reconsiderMechanicalReviews} from '../trading-worker/engine.js';
import {day,assess,freshQuote} from '../trading-worker/core.js';
import {referenceSource} from '../trading-worker/market-data.js';
import {queueEmployeeWork,employeeTools,initiativeSchema} from '../trading-worker/employee-agents.js';
import {requiresDeepAnalysis,nextDeepAnalysisAt,selectPlanningCandidates} from '../trading-worker/strategy.js';

function memoryEnv(){
 const db=new DatabaseSync(':memory:');for(const file of ['0008_trading_lab.sql','0009_trading_operating_budget.sql'])db.exec(readFileSync(new URL('../migrations/'+file,import.meta.url),'utf8'));
 const wrap=(sql,args=[])=>({bind(...values){return wrap(sql,values);},async first(){return db.prepare(sql).get(...args)||null;},async all(){return {results:db.prepare(sql).all(...args)};},async run(){return db.prepare(sql).run(...args);}});
 return {OPENAI_RUNTIME_KEY:'test-only-not-a-live-key',CONTROL_DB:{prepare:wrap,async batch(ops){db.exec('BEGIN');try{const result=[];for(const op of ops)result.push(await op.run());db.exec('COMMIT');return result;}catch(error){db.exec('ROLLBACK');throw error;}}},_db:db};
}
const now=Date.parse('2026-10-03T12:00:00Z'),primary='https://ir.issuer.example/contract';
const researchAnswer=extra=>({confirmed:true,eventDate:new Date(now-864e5).toISOString(),timing:'announced',kind:'Contrato material',catalyst:'Contrato publicado ayer',primaryDomain:'issuer.example',sources:[{url:primary,claim:'El emisor publicó el contrato en la fecha indicada'}],_retrieved:[primary],summary:'Hecho primario anunciado con su fecha literal y riesgos aún pendientes de valoración. '.repeat(3),probabilityPositive:55,upsidePct:12,downsidePct:10,confidence:'baja',uncertainties:'No es una probabilidad calibrada',worthAnalyzing:true,taskResolved:true,taskFindings:'El documento primario respalda el hecho fechado',missingEvidence:[],...extra});
const preparedAnswer=extra=>({decision:'prepare',missingEvidence:[],nextResearchTask:'',approve:true,thesis:'Tesis de fixture contrastada con un documento primario y datos fechados',entryMin:9.8,entryMax:10.2,stop:9.5,target:12,holdingDays:7,exitBeforeCatalyst:false,bearCase:'El contrato no genera el flujo previsto',baseCase:'Ingresos según el contrato',bullCase:'Ejecución superior a la estimada',invalidation:'Cancelación o financiación fuera de los términos',reason:'Escenarios de fixture con relación beneficio/riesgo válida',...extra});
const reviewedAnswer=extra=>({decision:'approve',missingEvidence:[],nextResearchTask:'',approve:true,reason:'Caja, condiciones, tamaño y escenarios de la fixture comprobados',...extra});
const researchFixtureSchema=()=>{const answer=researchAnswer({});delete answer._retrieved;const properties=Object.fromEntries(Object.entries(answer).map(([key,value])=>[key,key==='sources'?{type:'array',items:{type:'object',additionalProperties:false,properties:{url:{type:'string'},claim:{type:'string'}},required:['url','claim']}}:key==='missingEvidence'?{type:'array',maxItems:3,items:{type:'string'}}:{type:typeof value}]));return {type:'object',additionalProperties:false,properties,required:Object.keys(properties)};};

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

test('a token-truncated web draft is repaired once without web, preserves only original retrieved URLs, and accounts both actual costs',async()=>{
 const env=memoryEnv(),s=upgradeState(initialState()),schema=researchFixtureSchema(),originalFetch=globalThis.fetch,consulted='https://ir.issuer.example/annex',unconsulted='https://unconsulted.example/invented';s.real.book.fx={rate:1};
 const payload={company:{symbol:'SMALL'},assignedWork:{nextTask:'Confirm consideration from the signed annex'}},partialDraft='{"confirmed":false,"summary":"The primary announcement was located, but the annex did not provide complete funding details; uncertainty remains.';
 const answer=researchAnswer({confirmed:false,worthAnalyzing:false,taskResolved:false,timing:'unresolved',eventDate:'',sources:[{url:consulted,claim:'Se consultó la página, pero falta evidencia para resolver la financiación'}],summary:'Hay un anuncio primario, pero el borrador no permite comprobar las condiciones económicas completas. Se conserva la carencia sin completar hechos.',taskFindings:'Financiación sin resolver en los datos del borrador',missingEvidence:['Funding conditions from the full annex']});delete answer._retrieved;
 const requests=[];globalThis.fetch=async(url,options)=>{
  assert.equal(url,'https://api.openai.com/v1/responses');const body=JSON.parse(options.body);requests.push(body);assert.equal(body.model,'gpt-6-luna');assert.equal(body.text.format.strict,true);assert.deepEqual(body.text.format.schema,schema);
  if(requests.length===1){assert.equal(body.tools[0].type,'web_search');return Response.json({status:'incomplete',incomplete_details:{reason:'max_output_tokens'},usage:{input_tokens:500,output_tokens:100},output:[{type:'web_search_call',action:{sources:[{url:consulted}]}},{type:'message',content:[{type:'output_text',text:partialDraft}]}]});}
  assert.equal(requests.length,2,'Repair cannot become a repeated or recursive model loop');assert.equal(body.tools,undefined);assert.equal(body.max_tool_calls,undefined);assert.equal(body.max_output_tokens,3200);const input=JSON.parse(body.input);assert.deepEqual(input.original,payload);assert.equal(input.partialDraft,partialDraft);assert.deepEqual(input.consultedSources,[consulted]);
  return Response.json({status:'completed',usage:{input_tokens:300,output_tokens:200},output:[{type:'message',content:[{type:'output_text',text:JSON.stringify(answer),annotations:[{type:'url_citation',url:unconsulted}]}]}]});
 };
 try{
  const result=await llm(env,s,'scout','Investiga la evidencia primaria sin inventar información faltante.',payload,schema,{web:true,work:true,outputTokens:3200});
  assert.equal(requests.length,2);assert.deepEqual(result._retrieved,[consulted]);assert.equal(result.confirmed,false);assert.equal(result.taskResolved,false);assert.deepEqual(result.missingEvidence,answer.missingEvidence);assert.ok(Math.abs(result._costEur-.01023)<1e-10);
  const rows=env._db.prepare('SELECT actual,eur_actual,status FROM trading_calls ORDER BY rowid').all();assert.equal(rows.length,2);assert.deepEqual(rows.map(r=>r.status),['complete','complete']);assert.ok(Math.abs(rows[0].actual-.0101)<1e-10);assert.ok(Math.abs(rows[1].actual-.00013)<1e-10);assert.ok(Math.abs(env._db.prepare('SELECT spent_eur FROM trading_operating_budget').get().spent_eur-.01023)<1e-10);assert.ok(Math.abs(env._db.prepare('SELECT spent FROM trading_budget').get().spent-.01023)<1e-10);assert.equal(s.real.book.orders.length,0);assert.equal(s.real.book.cash,10000);
 }finally{globalThis.fetch=originalFetch;env._db.close();}
});

test('a filtered incomplete web response without usage is not repaired and retains its uncertain reservation',async()=>{
 const env=memoryEnv(),s=initialState(),schema=researchFixtureSchema(),originalFetch=globalThis.fetch;s.real.book.fx={rate:1};let calls=0;
 globalThis.fetch=async(url)=>{assert.equal(url,'https://api.openai.com/v1/responses');calls++;return Response.json({status:'incomplete',incomplete_details:{reason:'content_filter'},output:[{type:'web_search_call',action:{sources:[{url:primary}]}},{type:'message',content:[{type:'output_text',text:'A sufficiently long partial draft exists and has a consulted source, but the failure reason does not authorize another request.'}]}]});};
 try{
  await assert.rejects(()=>llm(env,s,'scout','Research',{},schema,{web:true,work:true,outputTokens:3200}),/incompleta/i);assert.equal(calls,1);
  const row=env._db.prepare('SELECT reserved,actual,eur_reserved,eur_actual,status FROM trading_calls').get();assert.equal(row.actual,null);assert.equal(row.eur_actual,null);assert.ok(row.reserved>0);assert.equal(row.status,'uncertain-cost-retained');assert.ok(Math.abs(env._db.prepare('SELECT spent_eur FROM trading_operating_budget').get().spent_eur-row.eur_reserved)<1e-10);assert.ok(Math.abs(env._db.prepare('SELECT spent FROM trading_budget').get().spent-row.reserved)<1e-10);assert.equal(s.real.book.orders.length,0);assert.equal(s.real.book.cash,10000);
 }finally{globalThis.fetch=originalFetch;env._db.close();}
});

test('a recent failed attempt one millisecond after lastResearch does not delay another ready company or pay for the failed task again',async()=>{
 const env=memoryEnv(),t=Date.parse('2026-10-03T15:00:00Z'),friday=Date.parse('2026-10-02T19:50:00Z'),lastResearch=t-30e3,baseline=t-5*3600e3,originalNow=Date.now,originalFetch=globalThis.fetch;Date.now=()=>t;
 try{
  env._db.prepare('INSERT INTO trading_secrets(name,cipher,iv,updated_at) VALUES (?,?,?,?)').run('openai','test-only','test-only',t);
  await locked(env,async s=>{
   s.real.assets=['FAIL','READY'].map(symbol=>({symbol,name:symbol+' Common Stock',exchange:'NASDAQ',marketCap:300e6,price:10,dataVerified:true}));
   s.real.events=s.real.assets.map(a=>({id:a.symbol,symbol:a.symbol,status:'verificar',confirmed:true,timing:'scheduled',kind:'Contrato material',source:primary,sources:[{url:primary,claim:'El emisor confirma el contrato y su fecha'}],date:'2026-10-07T20:00:00Z',summary:'Contrato primario confirmado; falta comprobar financiación en su anexo.',preScore:{eligible:true,score:70},research:{worthAnalyzing:true,researchedAt:baseline},researchAttemptAt:a.symbol==='FAIL'?lastResearch+1:baseline,...(a.symbol==='FAIL'?{researchRetryAfter:t+4*3600e3}:{}),analysisFollowup:{at:t-3600e3,baselineResearchAt:baseline,nextTask:'Read the signed annex and verify financing conditions'}}));
   s.real.quotes=Object.fromEntries(s.real.assets.map(a=>[a.symbol,{price:10,time:friday,fetchedAt:t,referenceOnly:true,currency:'USD',source:referenceSource,dollarVolume:5e6}]));s.real.marketCheckedAt=t;s.real.marketProviderAt=t;s.real.book.fx={rate:1,time:friday,checkedAt:t};s.real.lastScan=t;s.real.lastResearch=lastResearch;s.real.researchDay=day(t);s.real.researchCalls=6;
   for(const a of s.agents)a.paused=a.id!=='scout';s.company.agency.day=new Date(t).toISOString().slice(0,10);s.company.agency.runsToday=6;s.company.agency.preparationDay=new Date(t).toISOString().slice(0,10);s.company.agency.preparationCalls=2;
   for(const e of s.real.events)queueEmployeeWork(s,'research',e.id,{owner:'analyst',decision:'Resolver financiación pendiente',nextTask:e.analysisFollowup.nextTask,evidenceIds:[e.id],strategy:null},t-3600e3);
  });
  let calls=0;globalThis.fetch=async(url,options)=>{assert.equal(url,'https://api.openai.com/v1/responses');calls++;const body=JSON.parse(options.body),payload=JSON.parse(body.input);assert.equal(body.model,'gpt-6-luna');assert.equal(payload.company.symbol,'READY');assert.equal(body.tools[0].type,'web_search');const answer=researchAnswer({timing:'scheduled',eventDate:'2026-10-07T20:00:00Z',taskResolved:true,taskFindings:'El anexo documenta la financiación sin emitir acciones nuevas.'});delete answer._retrieved;assert.deepEqual(new Set(Object.keys(answer)),new Set(body.text.format.schema.required));return Response.json({status:'completed',usage:{input_tokens:500,output_tokens:200},output:[{type:'web_search_call',action:{sources:[{url:primary}]}},{type:'message',content:[{type:'output_text',text:JSON.stringify(answer)}]}]});};
  await cycle(env);const s=(await load(env)).state,failed=s.real.events.find(e=>e.symbol==='FAIL'),ready=s.real.events.find(e=>e.symbol==='READY');assert.equal(calls,1);assert.equal(s.real.researchCalls,7);assert.equal(failed.researchAttemptAt,lastResearch+1);assert.equal(failed.research.researchedAt,baseline);assert.equal(failed.researchRetryAfter,t+4*3600e3);assert.equal(ready.research.researchedAt,t);assert.equal(ready.research.supplement.taskResolved,true);assert.equal(s.company.agency.workQueue.find(w=>w.kind==='research'&&w.eventId==='FAIL').status,'pending');assert.equal(s.company.agency.workQueue.find(w=>w.kind==='research'&&w.eventId==='READY').status,'complete');assert.equal(env._db.prepare('SELECT COUNT(*) AS n FROM trading_calls').get().n,1);assert.ok(Math.abs(env._db.prepare('SELECT spent_eur FROM trading_operating_budget').get().spent_eur-.01015)<1e-10);assert.equal(s.real.book.orders.length,0);
 }finally{Date.now=originalNow;globalThis.fetch=originalFetch;env._db.close();}
});

test('research preserves an announcement publication date and never substitutes a future holding horizon',()=>{
 const e={date:null},answer=researchAnswer({});const verified=verifyResearch(answer,e,now);assert.equal(verified.confirmed,true);assert.equal(verified.timing,'announced');assert.equal(verified.date,answer.eventDate);
 assert.equal(verifyResearch(researchAnswer({_retrieved:[]}),e,now).confirmed,false);assert.equal(verifyResearch(researchAnswer({eventDate:new Date(now-8*864e5).toISOString()}),e,now).confirmed,false);assert.equal(verifyResearch(researchAnswer({eventDate:new Date(now+864e5).toISOString()}),e,now).confirmed,false);assert.equal(verifyResearch(researchAnswer({timing:'unresolved'}),e,now).confirmed,false);
 const scheduled=verifyResearch(researchAnswer({timing:'scheduled',eventDate:new Date(now+5*864e5).toISOString()}),e,now);assert.equal(scheduled.confirmed,true);assert.equal(scheduled.timing,'scheduled');assert.equal(verifyResearch(researchAnswer({timing:'scheduled'}),e,now).confirmed,false);
});

test('plans reject inconsistent thresholds and insufficient reward/risk before another employee is paid',()=>{
 const plan={holdingDays:7,exitBeforeCatalyst:false,entryMin:10,entryMax:10.5,stop:9,target:14};assert.deepEqual(planProblems(plan,{minRR:2}),[]);assert.match(planProblems({...plan,target:11},{minRR:2})[0],/Beneficio\/riesgo/);assert.match(planProblems({...plan,stop:10.1},{minRR:2})[0],/Umbrales/);assert.match(planProblems({...plan,holdingDays:31},{minRR:2})[0],/Duración/);assert.match(planProblems({...plan,target:NaN},{minRR:2})[0],/Umbrales/);
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
 let calls=0;const original=globalThis.fetch;globalThis.fetch=async(url,options)=>{assert.equal(url,'https://api.openai.com/v1/responses');const request=JSON.parse(options.body);calls++;assert.equal(request.model,'gpt-6-luna');return Response.json({status:'completed',usage:{input_tokens:500,output_tokens:200},output:[{type:'message',content:[{type:'output_text',text:JSON.stringify({decision:'prepare',missingEvidence:[],nextResearchTask:'',approve:true,thesis:'Fixture con RR insuficiente',entryMin:9.9,entryMax:10.1,stop:9,target:11,holdingDays:7,exitBeforeCatalyst:false,bearCase:'Riesgo',baseCase:'Plano',bullCase:'Subida',invalidation:'Falla tesis',reason:'Fixture inválida'})}]}]});};
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
   s.real.assets=[{symbol:'SMALL',name:'Small Common Stock',sector:'Technology',exchange:'NASDAQ',marketCap:300e6,price:10,dataVerified:true}];s.real.events=[{id:eventId,symbol:'SMALL',status:'nuevo',confirmed:true,timing:'scheduled',kind:'Resultados',source:primary,sources:[{url:primary,claim:'Fecha primaria y guidance de resultados'}],date:'2026-10-07T20:00:00Z',summary:'Resultados futuros de una operadora de peajes con guía positiva respaldada. Un regulatory report obligatorio describe los riesgos regulatorios del sector.',research:{worthAnalyzing:true,uncertainties:'Sorpresa pendiente'},preScore:{eligible:true,score:70}}];
   s.real.peers={Technology:{pe:{n:6,median:14},evToEbitda:{n:5,median:8}}};s.real.profiles={SMALL:{checkedAt:t,fundamentals:{checkedAt:t,source:'https://data.sec.gov/test',metrics:{fcf:2e6,revenueYoY:.1,netMargin:.15,shareGrowth:.01,cashLatest:20e6,annualAgeDays:180}},market:{asOf:new Date(friday).toISOString(),averageDollarVolume:5e6}}};s.real.quotes={SMALL:{price:10,time:friday,fetchedAt:t,referenceOnly:true,currency:'USD',source:referenceSource,dollarVolume:5e6}};s.real.marketCheckedAt=t;s.real.marketProviderAt=t;s.real.book.fx={rate:1,time:friday,checkedAt:t};s.real.lastScan=t;
   for(const a of s.agents)a.paused=!['analyst','risk','operator'].includes(a.id);s.company.agency.day=new Date(t).toISOString().slice(0,10);s.company.agency.runsToday=6;s.company.agency.preparationDay=new Date(t).toISOString().slice(0,10);s.company.agency.preparationCalls=2;
   queueEmployeeWork(s,'analysis',eventId,{owner:'analyst',decision:'Preparar siguiente sesión',nextTask:'Valorar tesis',evidenceIds:[eventId],strategy:null},t);queueEmployeeWork(s,'risk',eventId,{owner:'risk',decision:'Revisión independiente',nextTask:'Revisar el plan preparado',evidenceIds:[eventId],strategy:null},t);
  });
  const requests=[];globalThis.fetch=async(url,options)=>{
   assert.equal(url,'https://api.openai.com/v1/responses');const body=JSON.parse(options.body),input=JSON.parse(body.input);requests.push(body);assert.equal(body.model,'gpt-6-luna');assert.equal(input.financialProfile.fundamentals.metrics.fcf,2e6);assert.equal(input.quote.time,friday);assert.equal(input.quote.timeISO,'2026-10-02T19:50:00.000Z');assert.equal(input.quote.fetchedAtISO,'2026-10-03T15:00:00.000Z');
   if(body.text.format.schema.properties.holdingDays){assert.equal(input.sectorComparison.sector,'Technology');assert.deepEqual(input.sectorComparison.metrics,{pe:{n:6,median:14},evToEbitda:{n:5,median:8}});assert.match(input.sectorComparison.basis,/no TTM ni consenso/);assert.match(body.instructions,/condición escrita en la tesis no bloquea automáticamente/);assert.match(body.instructions,/drawdown1y es caída desde el máximo observado, NO retorno anual/);}
   const answer=body.text.format.schema.properties.holdingDays?{decision:'prepare',missingEvidence:[],nextResearchTask:'',approve:true,thesis:'Tesis de fixture con escenarios y fecha primaria',entryMin:9.8,entryMax:10.2,stop:9.5,target:12,holdingDays:7,exitBeforeCatalyst:false,bearCase:'Guía incumplida',baseCase:'Plano',bullCase:'Resultados superiores',invalidation:'Falla guía',reason:'Datos suficientes en fixture'}:{decision:'approve',missingEvidence:[],nextResearchTask:'',approve:true,reason:'Revisión independiente de la fixture: lote y escenarios válidos'};
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

test('a real cycle hands missing evidence to Santi, spends nothing while pending, then prepares and reviews after the one supplementary answer',async()=>{
 const env=memoryEnv(),start=Date.parse('2026-10-03T15:00:00Z'),friday=Date.parse('2026-10-02T19:50:00Z'),eventId='supplementary-cycle',originalNow=Date.now,originalFetch=globalThis.fetch;let clock=start;Date.now=()=>clock;
 const task='Read the signed contract annex and identify the cash consideration and financing';
 try{
  env._db.prepare('INSERT INTO trading_secrets(name,cipher,iv,updated_at) VALUES (?,?,?,?)').run('openai','test-only','test-only',start);
  await locked(env,async s=>{
   s.real.assets=[{symbol:'SMALL',name:'Small Common Stock',exchange:'NASDAQ',marketCap:300e6,price:10,dataVerified:true}];
   s.real.events=[{id:eventId,symbol:'SMALL',status:'nuevo',confirmed:true,timing:'announced',kind:'Contrato material',source:primary,sources:[{url:primary,claim:'Contrato material publicado por el emisor el viernes'}],date:new Date(friday).toISOString(),summary:'Contrato material anunciado con fecha comprobada; faltan las condiciones del anexo.',research:{worthAnalyzing:true,researchedAt:start-2*3600e3},researchAttemptAt:start-2*3600e3,preScore:{eligible:true,score:70}}];
   s.real.profiles={SMALL:{checkedAt:start,fundamentals:{checkedAt:start,source:'https://data.sec.gov/test',metrics:{fcf:2e6,revenueYoY:.1,cashLatest:20e6,annualAgeDays:180}},market:{asOf:new Date(friday).toISOString(),averageDollarVolume:5e6}}};s.real.quotes={SMALL:{price:10,time:friday,fetchedAt:start,referenceOnly:true,currency:'USD',source:referenceSource,dollarVolume:5e6}};s.real.marketCheckedAt=start;s.real.marketProviderAt=start;s.real.book.fx={rate:1,time:friday,checkedAt:start};s.real.lastScan=start;
   for(const a of s.agents)a.paused=!['scout','analyst','risk','operator'].includes(a.id);s.company.agency.day=new Date(start).toISOString().slice(0,10);s.company.agency.runsToday=6;s.company.agency.preparationDay=new Date(start).toISOString().slice(0,10);s.company.agency.preparationCalls=2;
  });
  const requests=[];let analysisCalls=0;
  globalThis.fetch=async(url,options)=>{
   assert.equal(url,'https://api.openai.com/v1/responses');const body=JSON.parse(options.body),payload=JSON.parse(body.input);requests.push(body);assert.equal(body.model,'gpt-6-luna');let answer,web=[];
   if(body.tools?.[0]?.type==='web_search'){
    assert.equal(payload.assignedWork.assignments.length,1);assert.equal(payload.assignedWork.assignments[0].task,task);assert.equal(payload.assignedWork.analysisFollowup.nextTask,task);assert.equal(payload.priorConfirmation.date,new Date(friday).toISOString());
    answer=researchAnswer({eventDate:new Date(friday).toISOString(),summary:'El anexo primario especifica la contraprestación en efectivo y la financiación disponible. No hay emisión nueva de acciones según los términos consultados. '.repeat(2),taskFindings:'El anexo aporta contraprestación y condiciones de financiación.',taskResolved:true});delete answer._retrieved;web=[{type:'web_search_call',action:{sources:[{url:primary}]}}];
   }else if(body.text.format.schema.properties.holdingDays){
    analysisCalls++;answer=analysisCalls===1?preparedAnswer({decision:'needs_evidence',approve:false,entryMin:0,entryMax:0,stop:0,target:0,missingEvidence:['Cash consideration and funding conditions in the signed annex'],nextResearchTask:task,reason:'La señal es plausible, pero aún faltan condiciones concretas del contrato'}):preparedAnswer();
    if(analysisCalls===2){assert.equal(payload.event.research.supplement.taskResolved,true);assert.ok(payload.event.research.researchedAt>start-2*3600e3);}
   }else answer=reviewedAnswer();
   assert.deepEqual(new Set(Object.keys(answer)),new Set(body.text.format.schema.required),'The mocked model follows the strict production decision schema');
   return Response.json({status:'completed',usage:{input_tokens:500,output_tokens:200},output:[...web,{type:'message',content:[{type:'output_text',text:JSON.stringify(answer)}]}]});
  };
  await cycle(env);let s=(await load(env)).state,e=s.real.events[0],researchWork=s.company.agency.workQueue.find(w=>w.kind==='research'&&w.eventId===eventId);
  assert.equal(requests.length,1);assert.equal(e.status,'verificar');assert.equal(e.confirmed,true);assert.equal(e.analysisAssessment.decision,'needs_evidence');assert.equal(e.plan,undefined);assert.equal(researchWork.status,'pending');assert.equal(researchWork.task,task);assert.equal(researchWork.notBefore,start+2*3600e3);assert.equal(s.company.pipeline.counts.researchFollowupPending,1);
  const spent=env._db.prepare('SELECT spent_eur FROM trading_operating_budget').get().spent_eur;
  clock=start+5*60e3;await cycle(env);s=(await load(env)).state;assert.equal(requests.length,1);assert.equal(env._db.prepare('SELECT spent_eur FROM trading_operating_budget').get().spent_eur,spent);assert.equal(s.real.events[0].plan,undefined);assert.equal(s.real.book.orders.length,0);
  clock=researchWork.notBefore+1000;await locked(env,async state=>{state.real.lastScan=clock;state.real.marketCheckedAt=clock;state.real.book.fx.checkedAt=clock;});
  await cycle(env);s=(await load(env)).state;e=s.real.events[0];researchWork=s.company.agency.workQueue.find(w=>w.id===researchWork.id);
  assert.equal(requests.length,4);assert.equal(analysisCalls,2);assert.equal(e.research.supplement.taskResolved,true);assert.equal(researchWork.status,'complete');assert.ok(researchWork.evidenceFingerprintAtFinish);assert.ok(e.plan);assert.equal(e.review.approve,true);assert.equal(e.status,'espera');assert.equal(s.real.book.orders.length,0);assert.equal(s.company.sessionPlan.ready.length,1);assert.equal(s.company.pipeline.counts.researchFollowupPending,0);
  const finalSpent=env._db.prepare('SELECT spent_eur FROM trading_operating_budget').get().spent_eur;assert.ok(finalSpent>spent&&finalSpent<10);
  await cycle(env);assert.equal(requests.length,4);assert.equal(env._db.prepare('SELECT spent_eur FROM trading_operating_budget').get().spent_eur,finalSpent);assert.equal((await load(env)).state.real.book.orders.length,0);
 }finally{Date.now=originalNow;globalThis.fetch=originalFetch;env._db.close();}
});

test('an entry pause permits complete analysis and risk review during an open session but prevents an otherwise valid paper buy',async()=>{
 const env=memoryEnv(),t=Date.parse('2026-10-05T15:00:00Z'),eventId='paused-entry-preparation',originalNow=Date.now,originalFetch=globalThis.fetch;Date.now=()=>t;
 try{
  env._db.prepare('INSERT INTO trading_secrets(name,cipher,iv,updated_at) VALUES (?,?,?,?)').run('openai','test-only','test-only',t);
  await locked(env,async s=>{
   s.paused=true;s.real.assets=[{symbol:'SMALL',name:'Small Common Stock',exchange:'NASDAQ',marketCap:300e6,price:10,dataVerified:true}];s.real.events=[{id:eventId,symbol:'SMALL',status:'nuevo',confirmed:true,timing:'scheduled',kind:'Contrato',source:primary,sources:[{url:primary,claim:'Condiciones y fecha del contrato confirmadas por el emisor'}],date:'2026-10-07T20:00:00Z',summary:'Un contrato con fecha futura y términos primarios verificables.',research:{worthAnalyzing:true},preScore:{eligible:true,score:70}}];s.real.profiles={SMALL:{checkedAt:t,fundamentals:{checkedAt:t,source:'https://data.sec.gov/test',metrics:{fcf:2e6,cashLatest:20e6}}}};s.real.quotes={SMALL:{price:10,time:t-60e3,fetchedAt:t,referenceOnly:true,currency:'USD',source:referenceSource,dollarVolume:5e6}};s.real.marketCheckedAt=t;s.real.marketProviderAt=t;s.real.book.fx={rate:1,time:t,checkedAt:t};s.real.lastScan=t;
   for(const a of s.agents)a.paused=!['analyst','risk','operator'].includes(a.id);s.company.agency.day=new Date(t).toISOString().slice(0,10);s.company.agency.runsToday=6;
  });
  let calls=0;globalThis.fetch=async(url,options)=>{assert.equal(url,'https://api.openai.com/v1/responses');const body=JSON.parse(options.body);calls++;const answer=body.text.format.schema.properties.holdingDays?preparedAnswer():reviewedAnswer();assert.deepEqual(new Set(Object.keys(answer)),new Set(body.text.format.schema.required));return Response.json({status:'completed',usage:{input_tokens:500,output_tokens:200},output:[{type:'message',content:[{type:'output_text',text:JSON.stringify(answer)}]}]});};
  await cycle(env);let s=(await load(env)).state,e=s.real.events[0];assert.equal(calls,2);assert.ok(e.plan);assert.equal(e.review.approve,true);assert.equal(e.status,'espera');assert.equal(s.paused,true);assert.equal(s.company.sessionPlan.ready.length,1);assert.equal(s.company.pipeline.blockerStage,'paused');assert.match(e.reasons[0],/nuevas entradas pausadas/i);assert.equal(s.real.book.orders.length,0);assert.equal(s.real.book.positions.length,0);assert.equal(s.real.book.cash,10000);
  assert.equal(freshQuote(s.real.quotes.SMALL,t,s.config),true);assert.equal(assess(s.real.book,s.real.assets[0],e,e.plan,s.real.quotes.SMALL,s.config,t).ok,true,'The pause is the actual blocker, not a stale quote or invalid plan');
  await cycle(env);s=(await load(env)).state;assert.equal(calls,2);assert.equal(s.real.book.orders.length,0);assert.equal(s.real.book.positions.length,0);assert.equal(s.paused,true);
 }finally{Date.now=originalNow;globalThis.fetch=originalFetch;env._db.close();}
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
  globalThis.fetch=async(url,options)=>{calls++;assert.equal(url,'https://api.openai.com/v1/responses');assert.equal(JSON.parse(options.body).model,'gpt-6.1-sol');return Response.json({status:'completed',usage:{input_tokens:500,output_tokens:200},output:[{type:'message',content:[{type:'output_text',text:JSON.stringify({decision:'reject',missingEvidence:[],nextResearchTask:'',approve:false,thesis:'Fixture',entryMin:0,entryMax:0,stop:0,target:0,holdingDays:7,exitBeforeCatalyst:false,bearCase:'Riesgo clínico',baseCase:'Pendiente',bullCase:'Hipótesis',invalidation:'Falta evidencia',reason:'El análisis profundo no justifica entrada'})}]}]});};
  await cycle(env);s=(await load(env)).state;e=s.real.events[0];assert.equal(calls,1);assert.equal(e.analysisDeferred,undefined);assert.equal(e.status,'descartado');assert.equal(env._db.prepare('SELECT COUNT(*) AS n FROM trading_calls WHERE day=? AND model=?').get(day(clock),'gpt-6.1-sol').n,1);assert.equal(s.real.book.orders.length,0);
 }finally{Date.now=originalNow;globalThis.fetch=originalFetch;env._db.close();}
});

test('deep analysis requires medical complexity and its daily reset follows New York daylight saving time',()=>{
 assert.equal(requiresDeepAnalysis({kind:'Resultados',summary:'Regulatory filing and general riesgos regulatorios de una empresa de peajes'}),false);assert.equal(requiresDeepAnalysis({kind:'Contrato',summary:'Sector energético regulatorio'}),false);
 for(const summary of ['FDA PDUFA decision','Clinical trial results','Ensayo clínico fase 3','Oncology treatment approval','Biotech catalyst'])assert.equal(requiresDeepAnalysis({kind:'Evento',summary}),true);
 assert.equal(nextDeepAnalysisAt(Date.parse('2026-10-03T15:00:00Z')),Date.parse('2026-10-04T04:00:00Z'));assert.equal(nextDeepAnalysisAt(Date.parse('2026-11-01T15:00:00Z')),Date.parse('2026-11-02T05:00:00Z'));assert.equal(nextDeepAnalysisAt(Date.parse('2026-03-08T15:00:00Z')),Date.parse('2026-03-09T04:00:00Z'));
});

test('partial research findings cannot claim the assigned evidence is fully resolved',()=>{
 const reply=researchAnswer({taskResolved:true,missingEvidence:['Debt maturities and covenants remain unverified']});
 const result=verifyResearch(reply,{date:null},now);assert.equal(result.confirmed,true);assert.equal(result.research.taskResolved,false);assert.deepEqual(result.research.missingEvidence,reply.missingEvidence);assert.equal(result.research.taskFindings,reply.taskFindings);
 assert.equal(verifyResearch(researchAnswer({taskResolved:true,missingEvidence:[]}),{date:null},now).research.taskResolved,true);
});


test('day-only announcements are accepted today without inventing a future publication hour and optional forecasts can remain unknown',()=>{
 const t=Date.parse('2026-10-05T12:00:00Z'),event={date:null};
 const reply=researchAnswer({eventDate:'2026-10-05',probabilityPositive:null,upsidePct:null,downsidePct:null});
 const v=verifyResearch(reply,event,t);assert.equal(v.confirmed,true);assert.equal(v.datePrecision,'day');assert.equal(v.date,'2026-10-05T00:00:00.000Z');assert.equal(v.research.probabilityPositive,null);
 assert.equal(verifyResearch({...reply,eventDate:'2026-10-06'},event,t).confirmed,false);
 assert.equal(verifyResearch({...reply,_retrieved:[]},event,t).confirmed,false);
 assert.throws(()=>verifyResearch({...reply,upsidePct:-1},event,t),/Estimaciones/);
});

test('launch prepares two independently reviewed experimental plans outside session then uses real references for paper entries without more model calls',async()=>{
 const env=memoryEnv(),weekend=Date.parse('2026-10-03T15:00:00Z'),friday=Date.parse('2026-10-02T19:50:00Z'),originalNow=Date.now,originalFetch=globalThis.fetch;let clock=weekend;Date.now=()=>clock;
 try{
  env._db.prepare('INSERT INTO trading_secrets(name,cipher,iv,updated_at) VALUES (?,?,?,?)').run('openai','test-only','test-only',clock);
  await locked(env,async s=>{
   s.real.assets=['TESTA','TESTB','HARD'].map(symbol=>({symbol,name:symbol+' Common Stock',exchange:'NASDAQ',sector:'Technology',marketCap:300e6,price:10,dataVerified:true}));
   s.real.events=s.real.assets.map(a=>({id:a.symbol,symbol:a.symbol,status:'descartado',confirmed:true,timing:'scheduled',kind:'Resultados',source:primary,sources:[{url:primary,claim:'La empresa confirma el hecho y su fecha'}],date:'2026-10-07T20:00:00Z',summary:'Resultados fechados y guía anterior contrastados con fuentes primarias. La reacción del mercado sigue siendo una hipótesis incierta.',preScore:{eligible:true,score:60},research:{worthAnalyzing:true,researchedAt:clock-3600e3},analysisAssessment:{reason:a.symbol==='HARD'?'Financiación desconocida y riesgo de insolvencia':'Falta consenso de analistas y una probabilidad calibrada'},reasons:[a.symbol==='HARD'?'Financiación desconocida y riesgo de insolvencia':'Falta consenso y ventaja demostrada']}));
   s.real.profiles=Object.fromEntries(s.real.assets.map(a=>[a.symbol,{checkedAt:clock,fundamentals:{checkedAt:clock,metrics:{annualEnd:'2025-12-31',annualAgeDays:180,fcf:2e6,revenueYoY:.1,netMargin:.15,equityLatest:30e6,equityDate:'2026-06-30',cashLatest:20e6,cashDate:'2026-06-30',shareGrowth:.01}},market:{averageDollarVolume:5e6,return1y:.1,seriesDiagnostic:{adjustments:{complete:true}}}}]));
   s.real.quotes=Object.fromEntries(s.real.assets.map(a=>[a.symbol,{symbol:a.symbol,price:10,time:friday,fetchedAt:clock,referenceOnly:true,currency:'USD',source:referenceSource,dollarVolume:5e6}]));
   s.real.marketCheckedAt=clock;s.real.marketProviderAt=clock;s.real.book.fx={rate:1,time:friday,checkedAt:clock};s.real.lastScan=clock;
   for(const a of s.agents)a.paused=!['analyst','risk','operator'].includes(a.id);
   s.company.agency.day=new Date(clock).toISOString().slice(0,10);s.company.agency.runsToday=6;s.company.agency.preparationDay=new Date(clock).toISOString().slice(0,10);s.company.agency.preparationCalls=2;
  });
  let calls=0;globalThis.fetch=async(url,options)=>{
   assert.equal(url,'https://api.openai.com/v1/responses');calls++;const body=JSON.parse(options.body),input=JSON.parse(body.input);
   assert.equal(body.model,'gpt-6-luna');assert.equal(body.tools,undefined);assert.equal(input.launch.experimental,true);assert.ok(input.launch.hypothesis.rationale);assert.equal(input.config.minRR,1.3);
   const answer=body.text.format.schema.properties.holdingDays?preparedAnswer({target:11.3,reason:'Experimento incierto, no ventaja demostrada'}):reviewedAnswer({reason:'Revisión independiente: riesgo acotado, consenso no imprescindible'});
   return Response.json({status:'completed',usage:{input_tokens:500,output_tokens:200},output:[{type:'message',content:[{type:'output_text',text:JSON.stringify(answer)}]}]});
  };
  await cycle(env);let s=(await load(env)).state;
  assert.equal(calls,4);assert.equal(s.company.sessionPlan.ready.length,2);assert.equal(s.real.book.orders.length,0);assert.equal(s.real.events.find(e=>e.symbol==='HARD').plan,undefined);
  const pilot=s.company.shadowProgram;assert.ok(pilot);assert.equal(s.company.versions.filter(v=>v.adaptation?.phase==='pilot').length,1);
  clock=Date.parse('2026-10-05T15:00:00Z');
  await locked(env,async s=>{s.real.lastScan=clock;s.real.marketCheckedAt=clock;s.real.marketProviderAt=clock;s.real.book.fx={rate:1,time:clock,checkedAt:clock};for(const q of Object.values(s.real.quotes)){q.time=clock;q.fetchedAt=clock;}s.company.agency.day=new Date(clock).toISOString().slice(0,10);s.company.agency.runsToday=6;});
  await cycle(env);s=(await load(env)).state;
  assert.equal(calls,4);assert.equal(s.real.book.positions.length,2);assert.equal(s.real.book.orders.length,2);assert.equal(s.real.book.entriesToday,2);
  for(const p of s.real.book.positions){assert.equal(p.adaptationId,pilot);assert.equal(p.forecast.uncalibrated,true);assert.equal(p.forecast.target,11.3);}
  assert.ok(Math.abs(s.real.book.cash+s.real.book.positions.reduce((n,p)=>n+p.qty*p.entry+p.entryFee,0)-10000)<1e-8);
  assert.ok(env._db.prepare('SELECT spent_eur FROM trading_operating_budget').get().spent_eur<10);
 }finally{Date.now=originalNow;globalThis.fetch=originalFetch;env._db.close();}
});


test('conditional paper risk arithmetic is known from a dated reference without claiming an executable price or creating a plan',()=>{
 const s=initialState();s.real.book.fx={rate:1.12};const before=JSON.stringify(s.real.book),q={price:90,time:now-864e5},r=planningRiskContext(s.real.book,q,s.config);
 assert.equal(r.known,true);assert.equal(r.wholeSharesAtReference,6);assert.equal(r.lotBudgetEur,500);assert.equal(r.maximumStopLossEur,35);
 assert.ok(Math.abs((r.assumedEntryUSD-r.minimumStopUSDAtReference)*r.wholeSharesAtReference/1.12-35)<1e-8);
 assert.match(r.basis,/No es orden/);assert.equal(r.referenceAt,q.time);assert.equal(JSON.stringify(s.real.book),before);
 assert.equal(planningRiskContext(s.real.book,{},s.config).known,false);
});


test('entry-range arithmetic narrows only the approved price cap, preserving the analyst hypothesis, stop and target for independent review',()=>{
 const plan=preparedAnswer({entryMin:89,entryMax:92,stop:86,target:95}),before=JSON.stringify(plan),fixed=constrainEntryRange(plan,{minRR:1.3});
 assert.equal(fixed.entryMin,89);assert.equal(fixed.stop,86);assert.equal(fixed.target,95);assert.ok(fixed.entryMax<92);assert.deepEqual(planProblems(fixed,{minRR:1.3}),[]);
 assert.equal(fixed.rangeAdjustment.originalEntryMax,92);assert.equal(JSON.stringify(plan),before);
 assert.equal(constrainEntryRange({...plan,entryMin:91},{minRR:1.3}).entryMax,92);
 assert.equal(constrainEntryRange({...plan,target:85},{minRR:1.3}).target,85);
 const e={id:'math',confirmed:true,status:'descartado',date:'2026-10-07T20:00:00Z',sources:[{url:primary}],launchReevaluation:{pilotId:'fixture'},reasons:['Beneficio/riesgo insuficiente antes de revisar']},s={real:{events:[e]}};
 reconsiderRangeValidation(s,now);assert.equal(e.status,'nuevo');assert.equal(e.plan,undefined);e.status='descartado';e.reasons=['Beneficio/riesgo insuficiente antes de revisar'];reconsiderRangeValidation(s,now+1);assert.equal(e.status,'descartado');assert.equal(e.decisionHistory.length,1);
});

test('a correctable risk veto returns to Pedro once, preserves the original, and never approves the plan',()=>{
 const t=Date.parse('2026-10-05T08:00:00Z'),s=upgradeState(initialState()),e={id:'repair',symbol:'ODC',status:'descartado',confirmed:true,timing:'scheduled',date:'2026-10-08T20:00:00Z',source:primary,sources:[{url:primary,claim:'Evento confirmado'}],summary:'Resultados primarios futuros',research:{worthAnalyzing:true},preScore:{eligible:true,score:70},plan:{...preparedAnswer(),expiresAt:t+864e5},review:reviewedAnswer({decision:'reject',approve:false,reason:'El plan no cumple su propia invalidación temporal: horizonte incompatible'})};s.real.events=[e];
 const original=structuredClone(e.plan);reconsiderRiskRevisions(s,t);assert.equal(e.status,'nuevo');assert.equal(e.plan,undefined);assert.equal(e.review,undefined);assert.deepEqual(e.planReviewHistory[0].plan,original);assert.equal(e.planReviewHistory[0].review.approve,false);assert.equal(e.planRepair.reviewReason,e.planReviewHistory[0].review.reason);assert.equal(selectPlanningCandidates(s,t)[0],e);
 const work=s.company.agency.workQueue.find(w=>w.eventId===e.id&&w.kind==='analysis');assert.equal(work.owner,'analyst');assert.equal(work.from,'risk');assert.ok(s.company.agency.actors.analyst.inbox.some(m=>m.from==='risk'));
 e.plan={...original};e.review=reviewedAnswer({decision:'revise_plan',approve:false,reason:'Aún falla el tamaño'});e.status='descartado';reconsiderRiskRevisions(s,t+1);assert.equal(e.status,'descartado');assert.equal(e.planReviewHistory.length,1);assert.equal(requestPlanRevision(s,e,e.review,t+2),false);
});

test('Pedro receives the actual risk veto and María reviews a repaired plan without creating a paper fill outside session',async()=>{
 const env=memoryEnv(),t=Date.parse('2026-10-05T08:00:00Z'),friday=Date.parse('2026-10-02T19:50:00Z'),originalNow=Date.now,originalFetch=globalThis.fetch;Date.now=()=>t;
 try{env._db.prepare('INSERT INTO trading_secrets(name,cipher,iv,updated_at) VALUES (?,?,?,?)').run('openai','test-only','test-only',t);
 await locked(env,async s=>{s.paused=true;s.real.assets=[{symbol:'SMALL',name:'Small Common Stock',exchange:'NASDAQ',marketCap:300e6,price:10,dataVerified:true}];s.real.events=[{id:'risk-repair',symbol:'SMALL',status:'descartado',confirmed:true,timing:'scheduled',source:primary,sources:[{url:primary,claim:'Evento confirmado'}],date:'2026-10-08T20:00:00Z',summary:'Catalizador futuro contrastado',preScore:{eligible:true,score:70},research:{worthAnalyzing:true,researchedAt:friday},plan:{...preparedAnswer(),expiresAt:t+5*864e5},review:reviewedAnswer({decision:'reject',approve:false,reason:'Horizonte incompatible con la invalidación temporal'})}];s.real.quotes={SMALL:{price:10,time:friday,fetchedAt:t,referenceOnly:true,currency:'USD',source:referenceSource,dollarVolume:5e6}};s.real.marketCheckedAt=t;s.real.marketProviderAt=t;s.real.book.fx={rate:1.1227,time:friday,checkedAt:t};s.real.lastScan=t;for(const a of s.agents)a.paused=!['analyst','risk','operator'].includes(a.id);s.company.agency.day=new Date(t).toISOString().slice(0,10);s.company.agency.runsToday=6;s.company.agency.preparationDay=new Date(t).toISOString().slice(0,10);s.company.agency.preparationCalls=2;});
 let calls=0;globalThis.fetch=async(url,options)=>{assert.equal(url,'https://api.openai.com/v1/responses');calls++;const body=JSON.parse(options.body),input=JSON.parse(body.input);assert.equal(input.planRepair.attempt,1);assert.equal(input.planRepair.previousReview.approve,false);let answer;
 if(body.text.format.schema.properties.holdingDays){assert.match(input.planRepair.reviewReason,/Horizonte incompatible/);assert.equal(input.previousPlanRisk.known,true);answer=preparedAnswer({holdingDays:2,exitBeforeCatalyst:true});}else{assert.equal(input.planMath.withinGrossRiskLimit,true);assert.equal(input.plan.exitBeforeCatalyst,true);assert.ok(input.plan.expiresAt<Date.parse('2026-10-08T20:00:00Z'));answer=reviewedAnswer();}
 assert.deepEqual(new Set(Object.keys(answer)),new Set(body.text.format.schema.required));return Response.json({status:'completed',usage:{input_tokens:500,output_tokens:200},output:[{type:'message',content:[{type:'output_text',text:JSON.stringify(answer)}]}]});};
 await cycle(env);const s=(await load(env)).state,e=s.real.events[0];assert.equal(calls,2);assert.equal(e.review.approve,true);assert.equal(e.status,'espera');assert.equal(e.planReviewHistory.length,1);assert.equal(s.company.sessionPlan.ready.length,1);assert.equal(s.real.book.orders.length,0);assert.equal(s.real.book.cash,10000);
 }finally{Date.now=originalNow;globalThis.fetch=originalFetch;env._db.close();}
});

test('a mathematically valid revise-plan veto receives only one independent clarification without changing levels or inventing approval',()=>{
 const t=Date.parse('2026-10-05T08:00:00Z'),s=upgradeState(initialState()),plan={...preparedAnswer(),expiresAt:t+2*864e5},review=reviewedAnswer({decision:'revise_plan',approve:false,reason:'Cálculos válidos pero aclara el redondeo de la prosa'}),e={id:'clarify',symbol:'SMALL',status:'descartado',confirmed:true,timing:'scheduled',date:'2026-10-08T20:00:00Z',source:primary,sources:[{url:primary,claim:'Evento confirmado'}],summary:'Evento futuro',preScore:{eligible:true,score:70},plan,review};s.real.book.fx={rate:1.1227,time:t};s.real.events=[e];const before=JSON.stringify(plan);
 reconsiderMechanicalReviews(s,t);assert.equal(e.status,'nuevo');assert.equal(e.review,undefined);assert.equal(JSON.stringify(e.plan),before);assert.equal(e.reviewClarification.previousReview.approve,false);assert.equal(e.reviewClarification.mechanicalFacts.planMath.withinGrossRiskLimit,true);assert.equal(s.company.agency.workQueue[0].owner,'risk');
 e.review=review;e.status='descartado';assert.equal(requestRiskClarification(s,e,review,t+1),false);assert.equal(e.status,'descartado');
 const unsafe={...e,id:'unsafe',plan:{...plan,stop:8},reviewClarification:undefined};assert.equal(requestRiskClarification(s,unsafe,review,t),false);const factual={...e,id:'factual',reviewClarification:undefined};assert.equal(requestRiskClarification(s,factual,{...review,decision:'needs_evidence'},t),false);assert.equal(s.real.book.orders.length,0);
});
test('exceptional risk reasoning uses Sol low within the same two-call quota and monthly budget as deep analysis',async()=>{
 const env=memoryEnv(),s=upgradeState(initialState()),original=globalThis.fetch;s.real.book.fx={rate:1};let calls=0;globalThis.fetch=async(url,options)=>{calls++;assert.equal(url,'https://api.openai.com/v1/responses');const body=JSON.parse(options.body);assert.equal(body.model,'gpt-6.1-sol');assert.equal(body.reasoning.effort,'low');return Response.json({status:'completed',usage:{input_tokens:500,output_tokens:200},output:[{type:'message',content:[{type:'output_text',text:'{"approve":false}'}]}]});};
 try{const schema={type:'object',additionalProperties:false,properties:{approve:{type:'boolean'}},required:['approve']};await llm(env,s,'risk','Aclara el veto',{},schema,{work:true,deep:true,outputTokens:1400});await llm(env,s,'risk','Aclara el segundo veto',{},schema,{work:true,deep:true,outputTokens:1400});await assert.rejects(()=>llm(env,s,'risk','No repetir',{},schema,{work:true,deep:true}),/Dos análisis profundos/);await assert.rejects(()=>llm(env,s,'analyst','No sobrepasar la cuota compartida',{},schema,{work:true}),/Dos análisis profundos/);assert.equal(calls,2);assert.equal(s.real.book.orders.length,0);assert.ok(env._db.prepare('SELECT spent_eur FROM trading_operating_budget').get().spent_eur<10);}
 finally{globalThis.fetch=original;env._db.close();}
});
