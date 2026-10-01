import test from 'node:test';
import assert from 'node:assert/strict';
import {estimated1RM,strengthPrescription,muscleFor,calibrationFor,muscleEvolution,datedArchiveRecords,bodyWeightAt,snapshotRecords} from '../control/training-model.js';
import {parseCvlpp,parseLegacy,parseLibra,validateTrainingSettings} from '../functions/_lib/training-archives.js';
import {onRequest} from '../functions/control/api/training/status.js';

test('Epley uses repetitions and load, not set count, with explicit domain limits',()=>{
  assert.equal(estimated1RM(100,6),120);assert.equal(estimated1RM(100,1),100);
  for(const reps of [0,16,2.5])assert.equal(estimated1RM(100,reps),null);
  assert.equal(estimated1RM(0,8),null);
  assert.equal(strengthPrescription('6x2x85').e1rm,undefined);
  assert.equal(strengthPrescription('6x2x85',{doubleSidedNotation:true}).load,170);
  assert.equal(strengthPrescription('2x8x26',{doubleSidedNotation:true}).reps,8);
  assert.equal(strengthPrescription('10x15 segundos').e1rm,undefined);
  assert.equal(strengthPrescription('5x115 (5x115 Fallo)').e1rm,undefined);
});
test('muscle identity does not merge generic alternatives across muscle groups',()=>{
  assert.equal(muscleFor('mismo pero vivagym','Biceps'),'biceps');
  assert.equal(muscleFor('mismo pero vivagym','Triceps'),'triceps');
  assert.equal(muscleFor('Hip Thrust','Quads'),'glutes');
});
test('weighted pull-ups include body mass instead of treating added weight as the whole load',()=>{
  const history=[{id:'one',observedAt:'2026-01-01',exercises:[{name:'Dominadas Lastradas',raw:'6x15',group:'Espalda'}]}];
  assert.equal(snapshotRecords(history)[0].e1rm,undefined);
  const record=snapshotRecords(history,{},[{date:'2026-01-01',weight:80}])[0];
  assert.equal(record.load,95);assert.equal(record.recordedLoad,15);assert.equal(record.e1rm,114);
});
const rec=(name,load,date,sequence=1)=>({name,muscle:'chest',variant:'chest:'+name.toLowerCase(),load,reps:6,e1rm:estimated1RM(load,6),date,sourceKey:'current',sequence});
test('personal equivalents translate progress without imposing a universal one-to-one factor',()=>{
  const records=[rec('Bench Press',100,'2026-01-01'),rec('Chest Machine',80,'2026-01-01'),rec('Chest Machine',96,'2026-01-08')];
  const calibration=calibrationFor(records,'chest');
  assert.equal(calibration.find(c=>c.name==='Chest Machine').factor,1.25);
  const result=muscleEvolution(records,'chest');
  assert.equal(result.points[0].value,120);assert.equal(result.points[0].derived,false);
  assert.equal(result.points[1].value,144);assert.equal(result.points[1].derived,true);
  assert.equal(muscleEvolution([rec('Unknown Machine',80,'2026-01-01')],'chest').points.length,0);
  assert.equal(muscleEvolution(records,'chest',{directOnly:true}).points.length,1);
});
test('week numbers and routine dates do not become invented session dates',()=>{
  const records=parseCvlpp([{name:'B1',rows:[['BP','Stage','Peso','¿Fallo?'],['S1','6x2(85)','88','0'],['S2','5x3','80','1']]}]);
  assert.equal(records[0].date,null);assert.equal(records[0].reps,2);assert.equal(records[0].load,88);
  assert.equal(records[1].e1rm,null);
  const aligned=datedArchiveRecords([{records}],{cvlppStart:'2020-01-06'});
  assert.equal(aligned[0].date,'2020-01-06');assert.equal(aligned[1].date,'2020-01-13');assert.equal(aligned[1].e1rm,null);
});
test('legacy columns preserve load-only records until repetitions and calendar are supplied',()=>{
  const rows=[[],[],['','Entrenamiento','Squat','Bench','Overhead','Deadlift 1x5','Día'],['','1','20','30','25','40','15 de octubre']];
  const records=parseLegacy(rows),bench=records.find(r=>r.name==='Bench');
  assert.equal(bench.load,30);assert.equal(bench.reps,null);assert.equal(bench.date,null);
  const aligned=datedArchiveRecords([{records}],{legacyBlocks:{cycle1:{startDate:'2018-10-15',defaultReps:5}}});
  assert.equal(aligned.find(r=>r.name==='Bench').date,'2018-10-15');assert.equal(aligned.find(r=>r.name==='Bench').e1rm,35);
});
test('Libra import preserves kg measurements and only matches nearby actual weights',()=>{
  const body=parseLibra('#Version: 6\n#Units: kg\n#date;weight;weight trend\n2021-09-14T10:03:00.000Z;80.3;80.3\n2021-09-16T10:03:00.000Z;79.7;80.1\n');
  assert.equal(body.length,2);assert.equal(body[1].weight,79.7);assert.equal(body[1].trend,80.1);
  assert.equal(bodyWeightAt(body,'2021-09-15').weight,80.3);
  assert.equal(bodyWeightAt(body,'2022-01-01'),null);
  assert.throws(()=>parseLibra('#Units: lbs\n2020-01-01;100'));
});
test('calendar alignment preserves month lengths and quarantines out-of-order source dates',()=>{
  const records=[{sourceKey:'legacy',block:'cycle2b',sequence:1,month:null,dayOfMonth:28},{sourceKey:'legacy',block:'cycle2b',sequence:2,month:null,dayOfMonth:1}];
  const aligned=datedArchiveRecords([{records}],{legacyBlocks:{cycle2b:{startDate:'2020-02-28'}}});
  assert.equal(aligned[1].date,'2020-03-01');
  const typo=[{sourceKey:'legacy',block:'cycle1',sequence:1,month:11,dayOfMonth:29},{sourceKey:'legacy',block:'cycle1',sequence:2,month:0,dayOfMonth:31},{sourceKey:'legacy',block:'cycle1',sequence:3,month:0,dayOfMonth:2}];
  const checked=datedArchiveRecords([{records:typo}],{legacyBlocks:{cycle1:{startDate:'2018-10-15'}}});
  assert.equal(checked[1].date,null);assert.match(checked[1].dateWarning,/fuera de orden/);assert.equal(checked[2].date,'2019-01-02');
});
test('settings reject invalid dates, factors and repetition counts',()=>{
  assert.throws(()=>validateTrainingSettings({cvlppStart:'2026-02-30'}));
  assert.throws(()=>validateTrainingSettings({factors:{a:0}}));
  assert.throws(()=>validateTrainingSettings({legacyBlocks:{cycle1:{defaultReps:30}}}));
  assert.equal(validateTrainingSettings({factors:{a:1.25}}).factors.a,1.25);
});
test('saving calibration remains owner-only and CSRF-protected',async()=>{
  const request=new Request('https://example.test/control/api/training/status',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action:'settings',settings:{factors:{}}})});
  assert.equal((await onRequest({request,data:{session:{user:{username:'SuperSanti86'}}},env:{}})).status,403);
  assert.equal((await onRequest({request,data:{session:{user:{username:'CesarVapor'},csrfToken:'secret'}},env:{}})).status,403);
});
test('valid settings are saved without dropping private measurements and malformed settings fail',async()=>{
  const dataset={history:[],bodyWeight:{measurements:[{weight:80}]},settings:{}};let saved;
  const db={prepare:sql=>({bind:(...values)=>({first:async()=>({payload:JSON.stringify(dataset)}),run:async()=>{saved=JSON.parse(values[0]);}})})};
  const request=body=>new Request('https://example.test/control/api/training/status',{method:'POST',headers:{'content-type':'application/json','x-csrf-token':'secret'},body:JSON.stringify(body)});
  const context={data:{session:{user:{username:'CesarVapor'},csrfToken:'secret'}},env:{CONTROL_DB:db}};
  const ok=await onRequest({...context,request:request({action:'settings',settings:{factors:{'chest:machine':1.25}}})});
  assert.equal(ok.status,200);assert.equal(saved.settings.factors['chest:machine'],1.25);assert.equal(saved.bodyWeight.measurements[0].weight,80);
  assert.equal((await onRequest({...context,request:request({action:'settings',settings:{cvlppStart:'2026-02-30'}})})).status,400);
});
