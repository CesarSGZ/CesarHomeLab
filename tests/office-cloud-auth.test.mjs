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
