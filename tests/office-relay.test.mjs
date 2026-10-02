import test from 'node:test';
import assert from 'node:assert/strict';
import {relay} from '../scripts/office-relay.mjs';
const base={workflow:'office-development.yml',repository:'CesarSGZ/CesarHomeLab',token:'fixture'};
test('supervisor hands over using the cheap relay mode',async()=>{
 const requests=[];const result=await relay({...base,fetcher:async(url,options)=>{requests.push({url,options});return options.method==='POST'?new Response(null,{status:204}):Response.json({workflow_runs:[{status:'completed'}]});}});
 assert.equal(result.queued,true);assert.deepEqual(JSON.parse(requests[1].options.body),{ref:'main',inputs:{relay:'true'}});
});
test('a pending supervisor prevents duplicate cloud relays',async()=>{
 let requests=0;const result=await relay({...base,fetcher:async()=>{requests++;return Response.json({workflow_runs:[{status:'queued'}]});}});
 assert.equal(result.queued,false);assert.equal(requests,1);
});
test('relay cannot dispatch outside the office or conceal dispatch failure',async()=>{
 await assert.rejects(relay({...base,workflow:'deploy.yml'}),/fuera de ámbito/);
 await assert.rejects(relay({...base,fetcher:async(u,o)=>o.method==='POST'?new Response(null,{status:403}):Response.json({workflow_runs:[]})}),/HTTP 403/);
});
