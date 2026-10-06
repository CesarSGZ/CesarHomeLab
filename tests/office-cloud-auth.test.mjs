import test from 'node:test';import assert from 'node:assert/strict';
import {cloudDatabase} from '../scripts/office-cloud-db.mjs';

test('office scoped transport avoids Cloudflare credentials and preserves D1 batch semantics',async()=>{
 const requests=[],db=cloudDatabase({officeToken:'fixture-office-token',apiToken:'unrelated-page-token',config:{unusableOAuth:true},fetcher:async(url,options)=>{requests.push({url,headers:options.headers,body:JSON.parse(options.body)});return Response.json({success:true,result:[{success:true,results:[{n:1}]}]});}});
 assert.equal(await db.prepare('SELECT COUNT(*) AS n FROM trading_calls WHERE day=?').bind('2026-10-06').first('n'),1);
 await db.batch([db.prepare('SELECT name FROM trading_secrets')]);
 assert.equal(requests[0].url,'https://cesar-solla.pages.dev/api/trading/development');assert.equal(requests[0].headers.Authorization,'Bearer fixture-office-token');
 assert.deepEqual(requests[0].body,{action:'runtime-db',sql:'SELECT COUNT(*) AS n FROM trading_calls WHERE day=?',params:['2026-10-06']});
 assert.deepEqual(requests[1].body,{action:'runtime-db',batch:[{sql:'SELECT name FROM trading_secrets',params:[]}]});
});

test('office bridge auth rejection never retries or switches to broader credentials',async()=>{
 let calls=0;const db=cloudDatabase({officeToken:'fixture-office-token',apiToken:'unused',fetcher:async()=>{calls++;return Response.json({success:false,errors:[{message:'denied'}]},{status:403});}});
 await assert.rejects(()=>db.prepare('SELECT name FROM trading_secrets').all(),/D1 remoto HTTP 403/);assert.equal(calls,1);
});
test('a temporary OAuth authorization rejection is retried with the same bound query and never duplicate successful writes',async()=>{
 const requests=[],waits=[];const db=cloudDatabase({config:'oauth_token = "test-only"',sleep:async ms=>waits.push(ms),fetcher:async(url,options)=>{requests.push(JSON.parse(options.body));return requests.length===1?Response.json({success:false,errors:[{message:'The given account is not valid or is not authorized to access this service'}]},{status:403}):Response.json({success:true,result:[{success:true,results:[{id:1}]}]});}});
 assert.deepEqual(await db.prepare('INSERT INTO test VALUES (?) RETURNING id').bind(4).first(),{id:1});assert.equal(requests.length,2);assert.deepEqual(requests[0],requests[1]);assert.deepEqual(waits,[2000]);
});
test('persistent authorization failure is bounded and an uncertain server error is never retried',async()=>{
 let calls=0;const db=cloudDatabase({config:'oauth_token = "test-only"',sleep:async()=>{},fetcher:async()=>{calls++;return Response.json({success:false,errors:[{message:'denied'}]},{status:403});}});await assert.rejects(()=>db.prepare('SELECT 1').first(),/D1 remoto HTTP 403/);assert.equal(calls,4);
 calls=0;const unknown=cloudDatabase({config:'oauth_token = "test-only"',sleep:async()=>{},fetcher:async()=>{calls++;return Response.json({success:false,errors:[{message:'unknown execution state'}]},{status:500});}});await assert.rejects(()=>unknown.prepare('UPDATE test SET value=2').run(),/D1 remoto HTTP 500/);assert.equal(calls,1);
});
test('read-only controller queries recover from timeouts and transient server errors with the same parameters',async()=>{
 const requests=[],waits=[],db=cloudDatabase({config:'oauth_token = "test-only"',sleep:async ms=>waits.push(ms),fetcher:async(url,options)=>{
  requests.push(JSON.parse(options.body));if(requests.length===1)throw new DOMException('Read timed out','TimeoutError');
  if(requests.length===2)return new Response('Temporary gateway error',{status:502});
  return Response.json({success:true,result:[{success:true,results:[{lock_until:0}]}]});
 }});
 assert.deepEqual(await db.prepare('SELECT lock_until FROM trading_state WHERE id=?').bind(1).first(),{lock_until:0});assert.equal(requests.length,3);assert.deepEqual(requests[0],requests[2]);assert.deepEqual(waits,[2000,4000]);
});
test('uncertain lease writes and mixed batches are never replayed; exhausted read retries remain errors',async()=>{
 for(const sql of ['UPDATE trading_state SET lock_until=? RETURNING payload','SELECT 1; UPDATE trading_state SET lock_until=0']){
  let calls=0;const error=new DOMException('Unknown execution outcome','TimeoutError'),db=cloudDatabase({config:'oauth_token = "test-only"',sleep:async()=>{},fetcher:async()=>{calls++;throw error;}});
  await assert.rejects(()=>db.prepare(sql).bind(100).first(),e=>e===error);assert.equal(calls,1);
 }
 let calls=0;const error=new TypeError('fetch failed'),db=cloudDatabase({config:'oauth_token = "test-only"',sleep:async()=>{},fetcher:async()=>{calls++;throw error;}});
 await assert.rejects(()=>db.batch([db.prepare('SELECT 1'),db.prepare('UPDATE test SET value=2')]),e=>e===error);assert.equal(calls,1);
 calls=0;await assert.rejects(()=>db.prepare('SELECT payload FROM trading_state').first(),e=>e===error);assert.equal(calls,4);
});

test('an explicit API token authenticates D1 without reading an OAuth config',async()=>{
 const headers=[];const db=cloudDatabase({apiToken:' fixture-api-token ',config:{unusableOAuth:true},fetcher:async(_url,options)=>{headers.push(options.headers.Authorization);return Response.json({success:true,result:[{success:true,results:[{value:7}]}]});}});
 assert.equal(await db.prepare('SELECT 7 AS value').first('value'),7);assert.deepEqual(headers,['Bearer fixture-api-token']);
});
test('OAuth is used only when no API token was configured',async()=>{
 const headers=[];const db=cloudDatabase({apiToken:'',config:'oauth_token = "fixture-oauth"',fetcher:async(_url,options)=>{headers.push(options.headers.Authorization);return Response.json({success:true,result:[{success:true,results:[{value:1}]}]});}});
 assert.equal(await db.prepare('SELECT 1 AS value').first('value'),1);assert.deepEqual(headers,['Bearer fixture-oauth']);
});
test('an API token rejection remains an API token rejection and cannot fall back to stale OAuth',async()=>{
 const headers=[];const db=cloudDatabase({apiToken:'fixture-api-token',config:'oauth_token = "obsolete-oauth"',sleep:async()=>{},fetcher:async(_url,options)=>{headers.push(options.headers.Authorization);return Response.json({success:false,errors:[{message:'API token denied'}]},{status:403});}});
 await assert.rejects(()=>db.prepare('SELECT 1').first(),/D1 remoto HTTP 403/);assert.equal(headers.length,4);assert.ok(headers.every(h=>h==='Bearer fixture-api-token'));
});
test('the API token defaults to the controller environment without requiring a Wrangler file',async()=>{
 const previous=process.env.CLOUDFLARE_API_TOKEN;process.env.CLOUDFLARE_API_TOKEN='fixture-env-api-token';
 try{const db=cloudDatabase({config:{unusableOAuth:true},fetcher:async(_url,options)=>{assert.equal(options.headers.Authorization,'Bearer fixture-env-api-token');return Response.json({success:true,result:[{success:true,results:[{value:1}]}]});}});assert.equal(await db.prepare('SELECT 1 AS value').first('value'),1);}
 finally{if(previous===undefined)delete process.env.CLOUDFLARE_API_TOKEN;else process.env.CLOUDFLARE_API_TOKEN=previous;}
});
