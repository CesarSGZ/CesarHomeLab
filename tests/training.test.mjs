import test from 'node:test';
import assert from 'node:assert/strict';
import {parseCsv,parsePrescription,parseTrainingRows} from '../functions/_lib/training.js';
import {accessForUser} from '../functions/_lib/auth.js';
import {onRequest} from '../functions/control/api/training/status.js';

test('CSV preserves commas, escaped quotes and line breaks inside notes',()=>{
  assert.deepEqual(parseCsv('A,B\r\n"one,two","note ""quoted"""\r\n'),[['A','B'],['one,two','note "quoted"']]);
});
test('Only simple repetition and load prescriptions are interpreted',()=>{
  assert.deepEqual(parsePrescription('7x37,5 (Limit)'),{reps:7,load:37.5});
  assert.deepEqual(parsePrescription('5x120 o 10x100'),{reps:5,load:120});
  assert.equal(parsePrescription('6x2x85 (Muy Limit)'),null);
  assert.equal(parsePrescription('10x15 segundos'),null);
  assert.equal(parsePrescription('MORIRx45'),null);
});
test('New and old column layouts retain original notes and separate alternatives',()=>{
  const current=parseTrainingRows([['Días','Series','Ejercicio','Reps x Peso'],['Día 1','4','Bench Press','5x120'],['Alternativas'],['Músculo','','Ejercicio','Modalidad'],['Pecho','','Other machine','8x70']]);
  assert.equal(current.length,2);assert.equal(current[0].kind,'main');assert.equal(current[1].kind,'alternative');assert.equal(current[1].group,'Pecho');
  const old=parseTrainingRows([['Días','Series','Músculo','Ejercicio','Reps x Peso'],['Día 2','3','Espalda','Deadlift','6x150 (note)']]);
  assert.equal(old[0].name,'Deadlift');assert.equal(old[0].cell,'E2');assert.equal(old[0].raw,'6x150 (note)');
});
test('Training belongs only to the owner, not Minecraft operators or standard users',()=>{
  assert.ok(accessForUser({username:'CesarVapor'}).capabilities.includes('training:read'));
  for(const username of ['SuperSanti86','another-user']){
    assert.ok(!accessForUser({username}).views.includes('training'));
    assert.ok(!accessForUser({username}).capabilities.includes('training:read'));
  }
});
test('Alternative modalities preserve both original notes without mixing their loads',()=>{
  const exercises=parseTrainingRows([['Alternativas'],['Músculo','','Ejercicio','Modalidad RIR0/1','','Modalidad Heavy/Light'],['Biceps','','Curl','6x50 (nota)','','5x50, 10x40']]);
  assert.equal(exercises[0].raw,'6x50 (nota)');assert.equal(exercises[0].secondaryRaw,'5x50, 10x40');assert.equal(exercises[0].secondaryMode,'Modalidad Heavy/Light');assert.equal(exercises[0].secondaryCell,'F3');assert.deepEqual(exercises[0].prescription,{reps:6,load:50});
});
test('Training API rejects unauthenticated users and non-owners before reading data',async()=>{
  for(const [session,status] of [[null,401],[{user:{username:'SuperSanti86'}},403]]){
    const result=await onRequest({request:new Request('https://example.test/control/api/training/status'),data:{session},env:{}});
    assert.equal(result.status,status);
  }
});
test('Refresh requires CSRF; GET returns the existing private snapshot',async()=>{
  const session={user:{username:'CesarVapor'},csrfToken:'test-token'};
  const rejected=await onRequest({request:new Request('https://example.test/control/api/training/status',{method:'POST'}),data:{session},env:{}});
  assert.equal(rejected.status,403);
  const dataset={checkedAt:'2026-10-01',history:[],phases:[]};
  const response=await onRequest({request:new Request('https://example.test/control/api/training/status'),data:{session},env:{CONTROL_DB:{prepare:()=>({bind:()=>({first:async()=>({payload:JSON.stringify(dataset),updated_at:'2026-10-01'})})})}}});
  assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'no-store');
  assert.deepEqual((await response.json()).dataset,dataset);
});
