import {developmentResultBody,queueDevelopmentResult,drainDevelopmentResults} from '../scripts/office-development-results.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {runtimeDatabase,validateRuntimeDbRequest,runtimeSqlStatements,runtimeDbLimits,readRuntimeBody} from '../trading-worker/runtime-db.js';
import {onRequest as pagesRequest} from '../functions/api/trading/development.js';
import worker from '../trading-worker/index.js';
import {locked,llm} from '../trading-worker/engine.js';

const token='fixture-runtime-developer-token-never-real';
const statement=(sql,params=[])=>({action:'runtime-db',sql,params});
async function fixture(){
 const sqlite=new DatabaseSync(':memory:');
 for(const name of ['0008_trading_lab.sql','0009_trading_operating_budget.sql','0010_office_development.sql','0011_office_cloud_runner.sql'])sqlite.exec(readFileSync(new URL('../migrations/'+name,import.meta.url),'utf8'));
 const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token)))].map(x=>x.toString(16).padStart(2,'0')).join('');
 sqlite.prepare('INSERT INTO trading_dev_auth VALUES (1,?,?)').run(hash,Date.now());
 const counters={prepare:0,batch:0};
 const prepare=(sql,params=[])=>({sql,params,bind(...values){return prepare(sql,values);},async first(){return sqlite.prepare(sql).get(...params)||null;}});
 const db={prepare(sql){counters.prepare++;return prepare(sql);},async batch(rows){
  counters.batch++;sqlite.exec('BEGIN');
  try{const result=rows.map(({sql,params})=>({success:true,results:sqlite.prepare(sql).all(...params),meta:{}}));sqlite.exec('COMMIT');return result;}
  catch(error){sqlite.exec('ROLLBACK');throw error;}
 }};
 return {env:{CONTROL_DB:db},sqlite,counters};
}
function client(env){
 const query=async body=>(await runtimeDatabase(env,{action:'runtime-db',...body})).result;
 const prepare=(sql,params=[])=>({sql,params,bind(...values){return prepare(sql,values);},async first(column){const row=(await query({sql,params}))[0].results[0]||null;return column?row?.[column]??null:row;},async all(){return (await query({sql,params}))[0];},async run(){return (await query({sql,params}))[0];}});
 return {prepare,batch:rows=>query({batch:rows.map(({sql,params})=>({sql,params}))})};
}
test('the RPC performs real lease RETURNING and bound payload writes without interpolating user data',async()=>{
 const f=await fixture(),now=Date.now(),payload=JSON.stringify({memo:"'; DROP TABLE trading_state; --"});
 await runtimeDatabase(f.env,statement('INSERT OR IGNORE INTO trading_state (id,payload,updated_at) VALUES (1,?,?)',[payload,now]));
 const result=await runtimeDatabase(f.env,statement('UPDATE trading_state SET lease_token=?,lock_until=? WHERE id=1 AND lock_until<? RETURNING payload',['lease-fixture',now+900000,now]));
 assert.equal(result.success,true);assert.equal(result.result[0].results[0].payload,payload);
 await runtimeDatabase(f.env,statement('UPDATE trading_state SET payload=?,updated_at=?,lock_until=? WHERE id=1 AND lease_token=?',[payload,now,now+900000,'wrong-lease']));
 assert.equal(f.sqlite.prepare('SELECT lease_token FROM trading_state').get().lease_token,'lease-fixture');assert.equal(f.sqlite.prepare('SELECT COUNT(*) AS n FROM trading_state').get().n,1);
});
test('an invalid query anywhere in a batch is rejected before prepare or execution',async()=>{
 const f=await fixture(),before={...f.counters};
 await assert.rejects(()=>runtimeDatabase(f.env,{action:'runtime-db',batch:[{sql:'INSERT OR IGNORE INTO trading_budget(day) VALUES (?)',params:['2026-10-06']},{sql:'DELETE FROM trading_state',params:[]}]}),/lista permitida/);
 assert.deepEqual(f.counters,before);assert.equal(f.sqlite.prepare('SELECT COUNT(*) AS n FROM trading_budget').get().n,0);
});
test('credential reads, auth hashes, secret writes and SQL fragments remain outside the RPC',()=>{
 for(const sql of ['SELECT cipher,iv FROM trading_secrets WHERE name=?','SELECT token_hash FROM trading_dev_auth WHERE id=1','DELETE FROM trading_secrets WHERE name=?','SELECT * FROM users','SELECT * FROM trading_state WHERE id=1; DROP TABLE trading_state','SELECT * FROM trading_state WHERE id=1 -- bypass','select * from trading_state where id=1']){
  assert.throws(()=>validateRuntimeDbRequest(statement(sql,['openai'])),/lista permitida/);
 }
 assert.equal(validateRuntimeDbRequest(statement('SELECT name FROM trading_secrets')).length,1);
});
test('parameter arity, SQL shape, budget boundaries and lease windows cannot be changed by the client',()=>{
 const now=Date.now(),lease='UPDATE trading_state SET lease_token=?,lock_until=? WHERE id=1 AND lock_until<? RETURNING payload',reserve='UPDATE trading_budget SET spent=spent+?,calls=calls+1 WHERE day=? AND spent+?<=? RETURNING spent';
 for(const body of [statement(lease,['lease',now+86400000,now]),statement(lease,['lease',now+900000,now-600000]),statement(reserve,[-1,'2026-10-06',-1,10]),statement(reserve,[.1,'2026-10-06',0,10]),statement(reserve,[.1,'2026-10-06',.1,11]),statement(reserve,[.1,'2026-10-06',.1]),statement('SELECT * FROM trading_state WHERE id=1',{}),{...statement('SELECT * FROM trading_state WHERE id=1'),operation:'arbitrary'}]){
  assert.throws(()=>validateRuntimeDbRequest(body,now),/fuera de|límites/);
 }
 assert.throws(()=>validateRuntimeDbRequest({action:'runtime-db',batch:Array.from({length:11},()=>({sql:'SELECT * FROM trading_state WHERE id=1',params:[]}))}),/Lote/);
});
test('actual engine lock and cost settlement use the exact RPC without OAuth or a database credential',async()=>{
 const f=await fixture(),db=client(f.env),env={CONTROL_DB:db,OPENAI_RUNTIME_KEY:'fixture-openai-key-never-real'};
 const saved=globalThis.fetch;let calls=0;
 globalThis.fetch=async url=>{assert.equal(url,'https://api.openai.com/v1/responses');calls++;return Response.json({status:'completed',usage:{input_tokens:1000,output_tokens:100},output:[{type:'message',content:[{type:'output_text',text:'{"approve":true}'}]}]});};
 try{await locked(env,async s=>{s.real.book.fx={rate:1.16};const reply=await llm(env,s,'analyst','Fixture analysis',{}, {type:'object',properties:{approve:{type:'boolean'}},required:['approve'],additionalProperties:false},{light:true});assert.equal(reply.approve,true);});}
 finally{globalThis.fetch=saved;}
 assert.equal(calls,1);assert.equal(f.sqlite.prepare('SELECT lock_until FROM trading_state').get().lock_until,0);
 assert.equal(f.sqlite.prepare('SELECT status FROM trading_calls').get().status,'complete');assert.ok(f.sqlite.prepare('SELECT spent_eur FROM trading_operating_budget').get().spent_eur>0);
});
test('current engine and infrastructure literal queries are covered, with credential operations deliberately excluded',()=>{
 const paths=['trading-worker/engine.js','scripts/office-cloud-cycle.mjs','scripts/office-recovery.mjs','scripts/office-availability.mjs'];
 const protectedSql=new Set(['SELECT cipher,iv FROM trading_secrets WHERE name=?','DELETE FROM trading_secrets WHERE name=?','INSERT INTO trading_secrets (name,cipher,iv,updated_at) VALUES (?,?,?,?) ON CONFLICT(name) DO UPDATE SET cipher=excluded.cipher,iv=excluded.iv,updated_at=excluded.updated_at']);
 const allowed=new Set(runtimeSqlStatements);let checked=0;
 for(const path of paths){const source=readFileSync(new URL('../'+path,import.meta.url),'utf8');
  for(const m of source.matchAll(/\.prepare\(\s*(['"])((?:\\.|(?!\1)[^\\])*)\1\s*\)/g)){
   const sql=m[2].replace(/\\'/g,"'").replace(/\\"/g,'"');if(protectedSql.has(sql)){assert.ok(!allowed.has(sql));continue;}
   assert.ok(allowed.has(sql),'Missing legitimate runtime query in '+path+': '+sql);checked++;
  }
 }
 assert.ok(checked>=30);
});
test('Pages executes authenticated RPC directly through D1 and Worker enforces the same allowlist',async()=>{
 const f=await fixture();
 f.env.TRADING_SERVICE={fetch(){throw Error('Pages RPC must not forward to Worker');}};
 for(const handler of [request=>pagesRequest({request,env:f.env}),request=>worker.fetch(request,f.env,{})]){
  const response=await handler(new Request('https://fixture.example/runtime-db',{method:'POST',headers:{authorization:'Bearer '+token,'content-type':'application/json'},body:JSON.stringify(statement('SELECT lock_until FROM trading_state WHERE id=1'))}));
  assert.equal(response.status,200);assert.deepEqual((await response.json()).result[0].results,[]);
  const rejected=await handler(new Request('https://fixture.example/runtime-db',{method:'POST',headers:{authorization:'Bearer '+token},body:JSON.stringify(statement('SELECT cipher FROM trading_secrets'))}));assert.equal(rejected.status,400);
 }
});
test('authorization happens before reading a large or malformed request body',async()=>{
 const f=await fixture();let reads=0;
 for(const handler of [request=>pagesRequest({request,env:f.env}),request=>worker.fetch(request,f.env,{})]){
  const request={url:'https://fixture.example/runtime-db',method:'POST',headers:new Headers({authorization:'Bearer wrong'}),body:{getReader(){reads++;throw Error('Body must not be read');}}};
  const response=await handler(request);assert.equal(response.status,401);
 }
 assert.equal(reads,0);assert.equal(f.counters.batch,0);
});
test('streamed UTF-8 body size is capped at two MiB without trusting Content-Length',async()=>{
 const tooLarge=new TextEncoder().encode(JSON.stringify({action:'runtime-db',sql:'x',params:['é'.repeat(1050000)]}));
 assert.ok(tooLarge.length>runtimeDbLimits.bodyBytes);
 const request=new Request('https://fixture.example',{method:'POST',body:new ReadableStream({start(c){c.enqueue(tooLarge);c.close();}}),duplex:'half'});
 await assert.rejects(()=>readRuntimeBody(request),e=>e.status===413);
 const normal=new Request('https://fixture.example',{method:'POST',body:JSON.stringify(statement('SELECT name FROM trading_secrets'))});
 assert.equal((await readRuntimeBody(normal)).body.sql,'SELECT name FROM trading_secrets');
});
test('database errors are exposed as transient server failures rather than successful or replayed mutations',async()=>{
 const f=await fixture();f.env.CONTROL_DB.batch=async()=>{throw Error('D1 unavailable');};
 const response=await pagesRequest({request:new Request('https://fixture.example',{method:'POST',headers:{authorization:'Bearer '+token},body:JSON.stringify(statement('INSERT OR IGNORE INTO trading_budget(day) VALUES (?)',['2026-10-06']))}),env:f.env});
 assert.equal(response.status,503);assert.equal((await response.json()).success,false);assert.equal(f.sqlite.prepare('SELECT COUNT(*) AS n FROM trading_budget').get().n,0);
});

test('durable development results use the RPC for their DDL, queue, reads and acknowledgements without duplicate completion',async()=>{
 const f=await fixture(),db=client(f.env),commit='a'.repeat(40),job={id:'job-fixture',lease:'lease-fixture',status:'running',summary:'Verified infrastructure change',meetingId:'meeting-fixture'};
 await locked({CONTROL_DB:db},s=>{s.company.development=[job];});
 const before=JSON.parse(f.sqlite.prepare('SELECT payload FROM trading_state').get().payload),body=developmentResultBody(job,{status:'applied',commit});
 assert.equal((await queueDevelopmentResult(db,body)).persisted,true);
 const result=await drainDevelopmentResults({db,withLock:locked});assert.equal(result.recorded,1);assert.equal(result.remaining,0);
 const after=JSON.parse(f.sqlite.prepare('SELECT payload FROM trading_state').get().payload);assert.equal(after.company.development[0].status,'applied');assert.equal(after.company.development[0].commit,commit);assert.deepEqual(after.real.book,before.real.book);
 assert.equal((await drainDevelopmentResults({db,withLock:locked})).recorded,0);assert.equal(f.sqlite.prepare("SELECT COUNT(*) AS n FROM trading_development_results WHERE status='complete'").get().n,1);
});
