import test from 'node:test';
import assert from 'node:assert/strict';
import {activeFiles,SYSTEMS,CONNECTIONS,JOURNEYS} from '../control/galaxy-model.js';
import {onRequest} from '../functions/control/api/github/status.js';

const sha='a'.repeat(40);
const ctx=(username,method='GET')=>({request:new Request('https://example.test/control/api/github/status',{method}),data:{session:username?{user:{username}}:null},env:{},waitUntil:()=>{}});
test('only current active files become source nodes',()=>{
  assert.deepEqual(activeFiles(['index.html','index.html','assets/ebay/item/01.jpg','functions/_lib/ebay-client.js','migrations/0003_ebay_store.sql','migrations/0007_private_chat.sql','constellation.css','control/index.html','migrations/0001_mission_control.sql']),['control/index.html','index.html','migrations/0001_mission_control.sql']);
});
test('all map connections and teaching steps resolve to real systems',()=>{
  const ids=new Set(SYSTEMS.map(n=>n.id));assert.equal(ids.size,8);
  CONNECTIONS.forEach(e=>{assert.ok(ids.has(e.from));assert.ok(ids.has(e.to));});
  JOURNEYS.forEach(j=>j.steps.forEach(s=>assert.ok(ids.has(s[0]))));
  SYSTEMS.forEach(n=>{assert.ok(n.explanation.length>100);assert.equal(typeof n.matches,'function');});
});
test('authentication and capabilities are enforced before upstream requests',async t=>{
  const mock=t.mock.method(globalThis,'fetch',()=>{throw Error('must not fetch');});
  assert.equal((await onRequest(ctx(null))).status,401);
  assert.equal((await onRequest(ctx('SuperSanti86'))).status,403);
  assert.equal((await onRequest(ctx('unknown'))).status,403);
  assert.equal((await onRequest(ctx('CesarVapor','POST'))).status,405);
  assert.equal(mock.mock.callCount(),0);
});
test('owner receives one consistent latest-commit tree and read-only deployment status',async t=>{
  const urls=[];
  t.mock.method(globalThis,'fetch',async(url,options)=>{
    urls.push(url);assert.equal(options.method,undefined);
    if(url.includes('/commits?'))return Response.json([{sha,commit:{author:{date:'2026-09-28T10:00:00Z',name:'Test'},message:'Latest change\nMore text'}}]);
    if(url.includes('/git/trees/')){assert.ok(url.includes(sha));return Response.json({truncated:false,tree:[{type:'blob',path:'index.html'},{type:'blob',path:'assets/ebay/old.jpg'},{type:'tree',path:'control'}]});}
    return Response.json({workflow_runs:[{status:'completed',conclusion:'success',head_sha:sha,html_url:'https://github.com/CesarSGZ/CesarHomeLab/actions/runs/1',updated_at:'2026-09-28T10:00:00Z'}]});
  });
  const response=await onRequest(ctx('CesarVapor')),body=await response.json();
  assert.equal(response.status,200);assert.equal(body.source,'github');assert.equal(body.sha,sha);assert.deepEqual(body.files,['index.html']);assert.equal(body.commits[0].message,'Latest change');assert.equal(body.deployment.conclusion,'success');assert.equal(urls.length,3);assert.equal(response.headers.get('cache-control'),'no-store');
});
test('upstream errors are explicit and never labelled as fresh data',async t=>{
  t.mock.method(globalThis,'fetch',async()=>new Response('',{status:429}));
  const response=await onRequest(ctx('CesarVapor'));assert.equal(response.status,503);assert.deepEqual(await response.json(),{ok:false,error:'github_rate_limited'});
});
test('an incomplete GitHub tree is rejected',async t=>{
  t.mock.method(globalThis,'fetch',async url=>url.includes('/commits?')?Response.json([{sha,commit:{author:{date:'2026-09-28',name:'Test'},message:'Test'}}]):url.includes('/git/trees/')?Response.json({truncated:true,tree:[]}):Response.json({workflow_runs:[]}));
  const response=await onRequest(ctx('CesarVapor'));assert.equal(response.status,503);
});
