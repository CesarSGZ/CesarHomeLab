import test from 'node:test';
import assert from 'node:assert/strict';
import {activeFiles,NODES,LINKS,PROCESSES,ZONES,neighboursOf} from '../control/galaxy-model.js';
import {onRequest} from '../functions/control/api/github/status.js';

const sha='a'.repeat(40);
const ctx=(username,method='GET')=>({request:new Request('https://example.test/control/api/github/status',{method}),data:{session:username?{user:{username}}:null},env:{},waitUntil:()=>{}});
test('only current active files become source nodes',()=>{
  assert.deepEqual(activeFiles(['index.html','index.html','assets/ebay/item/01.jpg','functions/_lib/ebay-client.js','migrations/0003_ebay_store.sql','migrations/0007_private_chat.sql','constellation.css','control/index.html','migrations/0001_mission_control.sql']),['control/index.html','index.html','migrations/0001_mission_control.sql']);
});
test('every link, process step and zone resolves to a real piece, and every piece is explained',()=>{
  const ids=new Set(NODES.map(n=>n.id)),zones=new Set(ZONES.map(z=>z.id));assert.equal(ids.size,NODES.length);
  LINKS.forEach(e=>{assert.ok(ids.has(e.from),e.from);assert.ok(ids.has(e.to),e.to);});
  PROCESSES.forEach(p=>p.steps.forEach(s=>assert.ok(ids.has(s[0]),s[0])));
  NODES.forEach(n=>{assert.ok(zones.has(n.zone));assert.ok(n.detail.length>100,n.id);assert.ok(n.where.length);assert.equal(typeof n.matches,'function');assert.ok(neighboursOf(n.id).length,n.id);});
});
test('every workflow in the repository appears on the map',async()=>{
  const {readdirSync}=await import('node:fs');
  const mapped=new Set(NODES.flatMap(n=>n.workflow?[].concat(n.workflow):[]));
  for(const file of readdirSync(new URL('../.github/workflows/',import.meta.url)))assert.ok(mapped.has(file),file+' is not on the map');
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
  assert.equal(response.status,200);assert.equal(body.source,'github');assert.equal(body.sha,sha);assert.deepEqual(body.files,['index.html']);assert.equal(body.commits[0].message,'Latest change');assert.equal(body.deployment.conclusion,'success');assert.equal(urls.length,4);assert.ok(urls.some(u=>u.includes('/actions/runs?')));assert.equal(response.headers.get('cache-control'),'no-store');
});
test('upstream errors are explicit and never labelled as fresh data',async t=>{
  t.mock.method(globalThis,'fetch',async()=>new Response('',{status:429}));
  const response=await onRequest(ctx('CesarVapor'));assert.equal(response.status,503);assert.deepEqual(await response.json(),{ok:false,error:'github_rate_limited'});
});
test('an incomplete GitHub tree is rejected',async t=>{
  t.mock.method(globalThis,'fetch',async url=>url.includes('/commits?')?Response.json([{sha,commit:{author:{date:'2026-09-28',name:'Test'},message:'Test'}}]):url.includes('/git/trees/')?Response.json({truncated:true,tree:[]}):Response.json({workflow_runs:[]}));
  const response=await onRequest(ctx('CesarVapor'));assert.equal(response.status,503);
});
