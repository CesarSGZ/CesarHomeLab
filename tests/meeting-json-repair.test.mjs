import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {llm,initialState} from '../trading-worker/engine.js';
import {voiceSchema,chairSchema,programSchema} from '../trading-worker/company.js';

function fixture(){
 const db=new DatabaseSync(':memory:');for(const file of ['0008_trading_lab.sql','0009_trading_operating_budget.sql'])db.exec(readFileSync(new URL('../migrations/'+file,import.meta.url),'utf8'));
 const prepare=(sql,args=[])=>({bind(...values){return prepare(sql,values);},async first(){return db.prepare(sql).get(...args)||null;},async all(){return {results:db.prepare(sql).all(...args)};},async run(){return db.prepare(sql).run(...args);}});
 const env={OPENAI_RUNTIME_KEY:'fixture-never-real',CONTROL_DB:{prepare,async batch(rows){db.exec('BEGIN');try{const results=[];for(const row of rows)results.push(await row.run());db.exec('COMMIT');return results;}catch(error){db.exec('ROLLBACK');throw error;}}},_db:db};
 const state=initialState();state.real.book.fx={rate:1};return {env,state};
}
const voice={facts:'Dos posiciones abiertas',evidence:['positions'],idea:'Revisar exposición',replyTo:'Contrastar escenarios',uncertainty:'Muestra pequeña',nextTask:'Revisar las posiciones'};
const chair={summary:'Conservar y comparar',officeStatus:'Dos posiciones',concerns:'Muestra pequeña',expectations:'Observar resultados',goals:[],decisions:[],assignments:[],reportToCesar:'Se conserva la estrategia',codeFiles:[],codeRationale:''};
const options={light:true,outputTokens:1000,capEur:.025,repairMeetingJson:true};
function response(text,extra={}){return Response.json({status:'completed',usage:{input_tokens:1000,output_tokens:200},output:[{type:'message',content:[{type:'output_text',text}]}],...extra});}
async function withFetch(run,handler){const original=globalThis.fetch;globalThis.fetch=handler;try{return await run();}finally{globalThis.fetch=original;}}

test('one meeting formatting repair preserves the response cap and accounts for both confirmed calls',async()=>{
 for(const [schema,answer] of [[voiceSchema,voice],[chairSchema,chair]]){
  const {env,state}=fixture(),requests=[],draft=JSON.stringify(answer)+' trailing text';
  const result=await withFetch(()=>llm(env,state,'auditor','Meeting fixture',{},schema,options),async(url,init)=>{assert.equal(url,'https://api.openai.com/v1/responses');requests.push(JSON.parse(init.body));return response(requests.length===1?draft:JSON.stringify(answer));});
  assert.equal(requests.length,2);assert.deepEqual(JSON.parse(requests[1].input),{draft});assert.equal(requests[1].max_output_tokens,1000);assert.equal(requests[1].model,'gpt-6-luna');assert.equal(requests[1].tools,undefined);assert.match(requests[1].instructions,/Repara únicamente el formato/);
  assert.ok(Math.abs(result._costEur-.0004)<1e-12);assert.ok(Math.abs(env._db.prepare('SELECT spent_eur FROM trading_operating_budget').get().spent_eur-.0004)<1e-12);assert.equal(env._db.prepare('SELECT COUNT(*) AS n FROM trading_calls').get().n,2);
  assert.equal(state.logs.some(row=>row.text.includes(draft)),false,'Raw model drafts are never logged');
 }
});

test('malformed repaired output fails after two calls without a recursive formatting loop',async()=>{
 const {env,state}=fixture();let calls=0;
 await withFetch(()=>assert.rejects(()=>llm(env,state,'scout','Meeting fixture',{},voiceSchema,options),SyntaxError),async()=>{calls++;return response(JSON.stringify(voice)+' extra');});
 assert.equal(calls,2);assert.ok(Math.abs(env._db.prepare('SELECT spent_eur FROM trading_operating_budget').get().spent_eur-.0004)<1e-12);
});

test('a formatting repair cannot consume the original cap again after paid usage exhausts its remainder',async()=>{
 const {env,state}=fixture();let calls=0;
 await withFetch(()=>assert.rejects(()=>llm(env,state,'scout','Meeting fixture',{},voiceSchema,options),SyntaxError),async()=>{calls++;return response(JSON.stringify(voice)+' extra',{usage:{input_tokens:240000,output_tokens:1600}});});
 assert.equal(calls,1);assert.ok(Math.abs(env._db.prepare('SELECT spent_eur FROM trading_operating_budget').get().spent_eur-.0248)<1e-12);
});

test('the second request must reserve its own input and output within the remaining meeting allowance',async()=>{
 const {env,state}=fixture();let calls=0;
 await withFetch(()=>assert.rejects(()=>llm(env,state,'scout','Meeting fixture',{},voiceSchema,options),/Reserva supera presupuesto/),async()=>{calls++;return response(JSON.stringify(voice)+' extra',{usage:{input_tokens:239000,output_tokens:1000}});});
 assert.equal(calls,1,'A positive remainder is not permission to reuse the full original cap');assert.ok(Math.abs(env._db.prepare('SELECT spent_eur FROM trading_operating_budget').get().spent_eur-.0244)<1e-12);
});

test('unknown charges and incomplete responses never trigger meeting formatting retries',async()=>{
 for(const extra of [{usage:undefined},{status:'incomplete',incomplete_details:{reason:'max_output_tokens'}}]){
  const {env,state}=fixture();let calls=0;
  await withFetch(()=>assert.rejects(()=>llm(env,state,'scout','Meeting fixture',{},voiceSchema,options)),async()=>{calls++;return response(JSON.stringify(voice)+' extra',extra);});assert.equal(calls,1);
 }
});

test('the repair opt-in rejects operational, web, tool, deep and executable program requests before spending',async()=>{
 for(const [schema,extra] of [[voiceSchema,{work:true}],[voiceSchema,{web:true}],[voiceSchema,{actions:['wait']}],[voiceSchema,{deep:true}],[voiceSchema,{light:false}],[programSchema,{}],[voiceSchema,{capEur:undefined}]]){
  const {env,state}=fixture();let calls=0;
  await withFetch(()=>assert.rejects(()=>llm(env,state,'auditor','Not a meeting',{},schema,{...options,...extra}),/reservada/),async()=>{calls++;throw Error('No network request expected');});assert.equal(calls,0);assert.equal(env._db.prepare('SELECT COUNT(*) AS n FROM trading_calls').get().n,0);
 }
});

test('ordinary model decisions retain strict parsing and do not inherit meeting recovery',async()=>{
 const {env,state}=fixture();let calls=0;
 await withFetch(()=>assert.rejects(()=>llm(env,state,'scout','Meeting fixture',{},voiceSchema,{...options,repairMeetingJson:false}),SyntaxError),async()=>{calls++;return response(JSON.stringify(voice)+' extra');});assert.equal(calls,1);
});

test('an ambiguous draft cannot be turned into an empty decision presented as a successful repair',async()=>{
 const {env,state}=fixture();let calls=0;
 await withFetch(()=>assert.rejects(()=>llm(env,state,'scout','Meeting fixture',{},voiceSchema,options),/conservar el significado/),async()=>{calls++;return response(calls===1?JSON.stringify(voice)+' '+JSON.stringify({...voice,idea:'Contradictoria'}):JSON.stringify({...voice,idea:''}));});assert.equal(calls,2);
});
