import test from 'node:test';import assert from 'node:assert/strict';
import {cloudDatabase} from '../scripts/office-cloud-db.mjs';
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
