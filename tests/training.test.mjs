import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {accessForUser} from '../functions/_lib/auth.js';
import {onRequest,renamePlan} from '../functions/control/api/training/status.js';
import {onRequest as pique} from '../functions/api/pique.js';
import {summarize,CESAR_COLUMNS,MARIA_COLUMNS} from '../functions/_lib/rivalry.js';
import {F,e1rm,sessions,progression,marks,recordsFor,suggestion,weeklySets,summary,alternatives,weightAt,exerciseName,knownParts,nameParts,sameExercise,findExercise,groupByExercise,WALK,walkOf,walkNote,muscleOf,defaultMeasure,sessionMeasures,standardFor,standardAt,percentile,strengthByMuscle,muscleHistory,yearReview,splitName,gymFor,pastSelf,liftPercentile,muscleOf as muscleOfName,TESTS,standardFor as stdFor} from '../control/training-model.js';

const row=(fecha,ej,serie,reps,kg,rpe='',origen='app',musc='Pecho')=>[fecha,1,ej,musc,serie,reps,kg,rpe,'',origen,`${fecha}${ej}${serie}`];
const owner={user:{username:'CesarVapor'},csrfToken:'test-token'};
const url='https://example.test/control/api/training/status';
const db=(rows={})=>({saved:null,prepare(sql){const self=this;return{bind(...args){return{first:async()=>rows[args[0]]?{payload:JSON.stringify(rows[args[0]])}:null,run:async()=>{self.saved={sql,args};}};}};}});

test('e1RM counts reps in reserve and refuses sets it cannot estimate',()=>{
  assert.equal(e1rm(100,5,10),100*(1+5/30));
  assert.equal(e1rm(100,5,8),100*(1+7/30));
  assert.equal(e1rm(100,5,''),100*(1+5/30));
  assert.equal(e1rm(100,1,10),100);
  assert.equal(e1rm(100,16,8),null);
  assert.equal(e1rm('',5,8),null);
  assert.equal(e1rm(0,5,8),null);
});
test('Sessions come newest first and can stop before today',()=>{
  const rows=[row('2026-01-01','A',1,5,100),row('2026-01-08','A',2,5,105),row('2026-01-08','A',1,5,100),row('2026-01-08','B',1,5,1)];
  const all=sessions(rows,'A');
  assert.deepEqual(all.map(s=>s.fecha),['2026-01-08','2026-01-01']);
  assert.deepEqual(all[0].series.map(r=>r[F.SERIE]),[1,2]);
  assert.deepEqual(sessions(rows,'A','2026-01-08').map(s=>s.fecha),['2026-01-01']);
});
test('Progression picks the best set per date in each metric',()=>{
  const rows=[row('2026-01-01','A',1,5,100,9),row('2026-01-01','A',2,3,110,10),row('2026-02-01','A',1,'',120)];
  assert.deepEqual(progression(rows,'A').map(p=>p.fecha),['2026-01-01']);
  assert.deepEqual(progression(rows,'A','kg').map(p=>p.value),[110,120]);
  const relative=progression(rows,'A','relative',[{date:'2026-01-02T10:00:00Z',weight:80,trend:80}]);
  assert.equal(relative.length,1);assert.ok(Math.abs(relative[0].value-e1rm(110,3,10)/80)<1e-9);
  assert.equal(weightAt([{date:'2020-01-01',weight:80}],'2026-01-01'),null);
});
test('Records: more load, more reps at the same load, or a higher e1RM; first sets are not records',()=>{
  const mark=marks([row('2026-01-01','A',1,5,100,9)],'A');
  assert.deepEqual(recordsFor({kg:102.5,reps:5,rpe:9},mark),['kilos','e1RM']);
  assert.deepEqual(recordsFor({kg:100,reps:6,rpe:9},mark),['repes','e1RM']);
  assert.deepEqual(recordsFor({kg:100,reps:5,rpe:9},mark),[]);
  assert.deepEqual(recordsFor({kg:50,reps:5,rpe:9},marks([],'A')),[]);
  assert.equal(marks([row('2026-02-01','A',1,5,150)],'A','2026-02-01').bestKg,0);
});
test('Suggestions follow the hardest set and stay silent without RPE',()=>{
  const last=rpe=>({series:[row('2026-01-01','A',1,5,100,rpe),row('2026-01-01','A',2,4,100,rpe)]});
  assert.equal(suggestion(last(8),{salto:5}).kg,105);
  assert.deepEqual([suggestion(last(9),{salto:5}).kg,suggestion(last(9),{salto:5}).reps],[100,6]);
  assert.equal(suggestion(last(10),{salto:5}).kg,100);
  assert.equal(suggestion(last(''),{salto:5}),null);
  assert.equal(suggestion(null),null);
});
test('Weekly sets count only logged hard work in the window; summary adds it up',()=>{
  const rows=[row('2026-03-10','A',1,5,100,8),row('2026-03-10','A',2,5,100,5),row('2026-03-01','A',1,5,100,8),row('2026-03-10','A',1,5,100,8,'Excel')];
  assert.deepEqual(weeklySets(rows,'2026-03-10'),[['Pecho',1]]);
  const sum=summary([row('2026-03-10','A',1,5,100,8),row('2026-03-10','B',1,10,50,9)],'2026-03-10');
  assert.deepEqual([sum.sets,sum.exercises,sum.tonnes,sum.rpe],[2,2,1,8.5]);
});
test('Alternatives prefer the same movement and skip what is already planned',()=>{
  const list=[{musculo:'Isquios',ejercicio:'Deadlift TG',referencia:'8x175'},{musculo:'Isquios',ejercicio:'Leg Curl',referencia:''},{musculo:'Pecho',ejercicio:'Pecho HS',referencia:''},{musculo:'Isquios',ejercicio:'Usado',referencia:''}];
  const out=alternatives(list,[],{ejercicio:'Deadlift',original:'Deadlift',musculo:'Isquios'},new Set(['Usado']));
  assert.deepEqual(out.map(a=>a.ejercicio),['Deadlift TG','Leg Curl']);
});
test('New exercises get a distinct name per gym and variant',()=>{
  assert.equal(exerciseName('Leg Extension','Basic Fit Getafe','Unilateral'),'Leg Extension · Basic Fit Getafe · Unilateral');
  assert.equal(exerciseName('  Leg  Extension ','',''),'Leg Extension');
  assert.equal(exerciseName('','',''),'');
  assert.equal(exerciseName('Lat Pulldown','TGD','Vivagym','Agarre neutro'),'Lat Pulldown · TGD · Vivagym · Agarre neutro');
  assert.deepEqual(nameParts('Remo T · Sterling · Vivagym'),{base:'Remo T',tags:['Sterling','Vivagym']});
  assert.deepEqual(knownParts(['Remo T · Sterling · Vivagym','Remo T','Curl · TGD · Basic Fit Getafe · Unilateral']),{bases:['Curl','Remo T'],machines:['Sterling','TGD'],gyms:['Basic Fit Getafe','Vivagym'],variants:['Unilateral']});
});
test('The same exercise is recognised through accents, capitals and tag order',()=>{
  assert.ok(sameExercise('Bíceps Curl Scott · TG','biceps curl scott · tg'));
  assert.ok(sameExercise('Leg Extension · TGD · Unilateral','leg extension · unilateral · TGD'));
  assert.deepEqual(splitName('Lat Pulldown · TGD · Dreamfit'),{base:'Lat Pulldown',machine:'TGD',gym:'Dreamfit',variant:''});
  assert.deepEqual(splitName('Tríceps Dumbbell Extension · Mancuerna · Sentado en banco · Unilateral'),{base:'Tríceps Dumbbell Extension',machine:'Mancuerna',gym:'',variant:'Sentado en banco · Unilateral'});
  assert.ok(TESTS.every(t=>!/Vivagym$|º/.test(t.ejercicio)&&standardFor(t.ejercicio)),'every test lift has a standard');
  assert.equal(gymFor('tgd',''),'Dreamfit');assert.equal(gymFor('TGD','Vivagym'),'Vivagym');assert.equal(gymFor('HS',''),'');
  assert.ok(!sameExercise('Deadlift','Deadlift · TG'));
  assert.equal(findExercise(['Deadlift · TG','Deadlift'],'deadlift · tg'),'Deadlift · TG');
  assert.equal(findExercise(['Deadlift'],'Deadlift · TG'),null);
});
test('Options are grouped by exercise, with the current one first',()=>{
  const out=groupByExercise([{ejercicio:'Curl · HS'},{ejercicio:'Remo T · TGD'},{ejercicio:'Remo T'},{ejercicio:'Ab'}],'Remo T');
  assert.deepEqual(out.map(g=>g.base),['Remo T','Ab','Curl']);
  assert.deepEqual(out[0].items.map(i=>i.tags),[[],['TGD']]);
  assert.deepEqual(groupByExercise([],'Solo').map(g=>[g.base,g.items.length]),[['Solo',0]]);
});
test('Training belongs only to the owner',async()=>{
  assert.ok(accessForUser({username:'CesarVapor'}).capabilities.includes('training:read'));
  for(const username of ['SuperSanti86','another-user'])assert.ok(!accessForUser({username}).capabilities.includes('training:read'));
  assert.equal((await onRequest({request:new Request(url),data:{session:null},env:{}})).status,401);
  assert.equal((await onRequest({request:new Request(url),data:{session:{user:{username:'SuperSanti86'}}},env:{}})).status,403);
});
test('API: unconnected state, CSRF, code validation and never leaking the key',async()=>{
  const none=await onRequest({request:new Request(url),data:{session:owner},env:{CONTROL_DB:db()}});
  assert.deepEqual(await none.json(),{ok:true,connected:false});
  assert.equal((await onRequest({request:new Request(url,{method:'POST',body:'{}'}),data:{session:owner},env:{CONTROL_DB:db()}})).status,403);
  const post=body=>new Request(url,{method:'POST',headers:{'x-csrf-token':'test-token'},body:JSON.stringify(body)});
  assert.equal((await onRequest({request:post({action:'connect',code:'https://evil.test/exec#abcdefabcdefabcdef'}),data:{session:owner},env:{CONTROL_DB:db()}})).status,400);
  assert.equal((await onRequest({request:post({action:'ops',ops:[]}),data:{session:owner},env:{CONTROL_DB:db()}})).status,409);
  const real=globalThis.fetch;
  try {
    let sent=null;
    globalThis.fetch=async(target,init)=>{sent={target:String(target),init};return new Response(JSON.stringify(init?.method==='POST'?{ok:true}:{rutina:[],alternativas:[],filas:[]}));};
    const env={CONTROL_DB:db({'training-lab':{sheet:{url:'https://script.google.com/macros/s/x/exec',key:'secret-key'},bodyWeight:[]}})};
    const read=await onRequest({request:new Request(url),data:{session:owner},env});
    assert.ok(!(await read.text()).includes('secret-key'));
    assert.equal((await onRequest({request:post({action:'ops',ops:[{tipo:'guardar',fila:{id:'a',fecha:'nope',ejercicio:'A',serie:1}}]}),data:{session:owner},env})).status,400);
    assert.equal((await onRequest({request:post({action:'ops',ops:[{tipo:'alternativa',ejercicio:' '}]}),data:{session:owner},env})).status,400);
    assert.equal((await onRequest({request:post({action:'ops',ops:[{tipo:'alternativa',ejercicio:'Remo · Vivagym',musculo:'Espalda'}]}),data:{session:owner},env})).status,200);
    const ok=await onRequest({request:post({action:'ops',ops:[{tipo:'guardar',fila:{id:'a',fecha:'2026-01-01',ejercicio:'A',serie:1,reps:5,kg:100,rpe:8}}]}),data:{session:owner},env});
    assert.equal(ok.status,200);assert.equal(JSON.parse(sent.init.body).k,'secret-key');
    globalThis.fetch=async()=>new Response(JSON.stringify({error:'clave'}));
    assert.equal((await onRequest({request:new Request(url),data:{session:owner},env})).status,503);
  } finally { globalThis.fetch=real; }
});
test('Sheet script: resent operations do not duplicate rows and deletes apply',()=>{
  const tabs={Registro:[['Fecha','Día','Ejercicio','Músculo','Serie','Reps','Kg','RPE','Nota','Origen','ID']],Rutina:[[]],Alternativas:[[]]};
  const sheet=data=>({getLastRow:()=>data.length,deleteRow:n=>data.splice(n-1,1),getDataRange:()=>({getValues:()=>data}),getRange:(r,c,nr=1,nc=1)=>({setNumberFormat(){},getValues:()=>data.slice(r-1,r-1+nr).map(x=>x.slice(c-1,c-1+nc)),setValues:v=>v.forEach((x,i)=>{data[r-1+i]=data[r-1+i]||[];x.forEach((y,j)=>{data[r-1+i][c-1+j]=y;});})})});
  const box={SpreadsheetApp:{getActive:()=>({getSheetByName:n=>sheet(tabs[n])})},PropertiesService:{getScriptProperties:()=>({getProperty:()=>'k',setProperty(){}})},LockService:{getScriptLock:()=>({waitLock(){},releaseLock(){}})},ContentService:{MimeType:{JSON:'j'},createTextOutput:t=>({setMimeType:()=>t})},Utilities:{},Session:{},Logger:{log(){}}};
  vm.createContext(box);vm.runInContext(readFileSync(new URL('../training-backend/Code.gs',import.meta.url),'utf8'),box);
  const fila={id:'a1',fecha:'2026-01-01',dia:1,ejercicio:'A',musculo:'Pecho',serie:1,reps:5,kg:100,rpe:8,nota:''};
  const send=ops=>JSON.parse(box.doPost({postData:{contents:JSON.stringify({k:'k',ops})}}));
  assert.deepEqual(send([{tipo:'guardar',fila}]),{ok:true});send([{tipo:'guardar',fila}]);
  assert.equal(tabs.Registro.length,2);assert.equal(tabs.Registro[1][7],8);assert.equal(tabs.Registro[1][9],'app');
  send([{tipo:'guardar',fila:{...fila,kg:105}}]);assert.equal(tabs.Registro[1][6],105);assert.equal(tabs.Registro.length,2);
  send([{tipo:'borrar',id:'a1'}]);assert.equal(tabs.Registro.length,1);
  tabs.Alternativas=[['Músculo','Ejercicio','Referencia']];
  send([{tipo:'alternativa',musculo:'Pecho',ejercicio:'Press · Vivagym',referencia:''}]);send([{tipo:'alternativa',musculo:'Pecho',ejercicio:'Press · Vivagym',referencia:''}]);
  assert.deepEqual(tabs.Alternativas.slice(1),[['Pecho','Press · Vivagym','']]);
  assert.equal(JSON.parse(box.doGet({parameter:{k:'mala'}})).error,'clave');
  assert.equal(JSON.parse(box.doPost({postData:{contents:JSON.stringify({k:'mala',ops:[]})}})).error,'clave');
});

test('Treadmill rows keep speed and incline in the note and stay out of hard sets and session totals',()=>{
  const walk=['2026-11-09',2,WALK,'Cardio',1,30,'','',walkNote(6.5,2),'app','w1'];
  assert.equal(walkNote(6.5,2),'6,5 km/h, 2°');
  assert.deepEqual(walkOf(walk),{vel:6.5,inc:2,min:30,km:3.25});
  assert.deepEqual(weeklySets([walk],'2026-11-09'),[]);
  assert.equal(summary([walk,row('2026-11-09','A',1,5,100)],'2026-11-09').sets,1);
});
test('Muscles come from the exercise name, so the same lift lands in the same group since the first row',()=>{
  assert.equal(muscleOf('Overhead Press','Hombros'),'deltAnt');
  assert.equal(muscleOf('Lateral Raise Polea · Basic Fit Getafe','Hombros'),'deltLat');
  assert.equal(muscleOf('Rope Face Pull','Hombros'),'deltPost');
  assert.equal(muscleOf('Lat Pulldown · TGD','Espalda'),'dorsal');
  assert.equal(muscleOf('Remo T · TGD','Espalda'),'espalda');
  assert.equal(muscleOf('Something new','Pecho'),'pecho');
  assert.equal(defaultMeasure('Bench Press'),'rm');
  assert.equal(defaultMeasure('Rope Face Pull'),'volumen');
});
test('Session measures: best e1RM, mean load and mean load by mean reps',()=>{
  const [s]=sessionMeasures([row('2026-01-01','A',1,10,100,10),row('2026-01-01','A',2,8,90,10)],'A');
  assert.equal(s.rm,100*(1+10/30));assert.equal(s.medio,95);assert.equal(s.volumen,95*9);
});
test('Strength standards: interpolated by body weight, every variant counted with its factor',()=>{
  assert.deepEqual(standardAt('bench',85),[60.5,80,103.5,130.5,158]);
  assert.deepEqual(standardFor('Sentadilla · Poco recorrido'),{std:'squat',factor:0.8,note:'recorrido parcial ×0,8'});
  assert.deepEqual(standardFor('Leg Extension · HS · Unilateral'),{std:'legExt',factor:1.8,note:'a un lado ×1,8'});
  assert.equal(standardFor('Lateral Raise Dumbbells · Unilateral').factor,1,'dumbbell standards are already per side');
  assert.equal(standardFor('Hacka · Goma morada o roja'),null);
  assert.equal(standardFor('Tríceps Polea X').std,'pushdown');
  assert.deepEqual(standardFor('Remo Medio · TG'),{std:'machineRow',factor:2,note:'apuntado por lado ×2'});
  assert.equal(standardFor('St Leg Curl · TGD').factor,1);
  assert.deepEqual(percentile(103.5,standardAt('bench',85)),{level:2,pct:50});
  assert.equal(percentile(30,standardAt('bench',85)).level,-1);
  const rows=[row('2026-06-01','Bench Press',1,1,103.5),row('2026-06-01','Pecho Máquina · HS',1,1,500),row('2026-06-01','Bench Press Inclinado',1,1,10)];
  const pecho=strengthByMuscle(rows,85,'2026-11-09').find(m=>m.id==='pecho');
  assert.equal(pecho.rated.pct,50,'the median keeps one generous machine from deciding the muscle');
  assert.equal(pecho.stale,null);
  const old=strengthByMuscle([row('2023-06-01','Bench Press',1,1,103.5)],85,'2026-11-09').find(m=>m.id==='pecho');
  assert.equal(old.stale,'2023-06-01');
  assert.deepEqual(muscleHistory(rows,'pecho',[],85).map(p=>p.fecha),['2026-05-15']);
});
test('Year review compares the same exercise and ignores jumps that are a change of machine',()=>{
  const rows=[row('2025-11-01','Bench Press',1,1,100),row('2026-10-01','Bench Press',1,1,110),row('2025-11-01','Leg Press',1,1,100),row('2026-10-01','Leg Press',1,1,300)];
  const y=yearReview(rows,'2026-11-09',85);
  assert.deepEqual(y.changes.map(c=>[c.name,Math.round(c.change*100)]),[['Bench Press',10]]);
  assert.equal(y.muscles[0].name,'Pecho');assert.ok(y.muscles[0].now>y.muscles[0].before);
});

test('Renaming moves rows with their origin, fixes the routine and merges alternatives without duplicates',()=>{
  const sheet={filas:[['2024-01-01','','Curl','Bíceps',1,8,40,'','8x40','Excel','x1'],['2026-01-01',1,'Curl · TG','Bíceps',1,7,50,9,'','app','x2']],
    rutina:[{dia:1,nombre:'Brazo',orden:1,ejercicio:'Curl · TG',musculo:'Bíceps',series:4,reps:7,referencia:'7x50',salto:2.5}],
    alternativas:[{musculo:'Bíceps',ejercicio:'Curl · TGD',referencia:''},{musculo:'Bíceps',ejercicio:'Curl · TG',referencia:'7x50'}]};
  const plan=renamePlan(sheet,'Curl · TG','Curl · TGD');
  assert.deepEqual(plan.ops.map(o=>[o.fila.id,o.fila.ejercicio,o.fila.origen,o.fila.rpe]),[['x2','Curl · TGD','app',9]]);
  assert.equal(plan.rutina[0][3],'Curl · TGD');
  assert.deepEqual(plan.alternativas,[['Bíceps','Curl · TGD','']]);
  assert.equal(renamePlan(sheet,'Nope','X').found,0);
  assert.deepEqual(splitName('Leg Extension · TGD · Basic Fit Getafe · Unilateral parcial'),{base:'Leg Extension',machine:'TGD',gym:'Basic Fit Getafe',variant:'Unilateral parcial'});
});
test('API rename: owner only through CSRF, validated, and sent to the Sheet in one request',async()=>{
  const real=globalThis.fetch,post=body=>new Request(url,{method:'POST',headers:{'x-csrf-token':'test-token'},body:JSON.stringify(body)});
  const env={CONTROL_DB:db({'training-lab':{sheet:{url:'https://script.google.com/macros/s/x/exec',key:'secret-key'},bodyWeight:[]}})};
  try {
    const sent=[];
    globalThis.fetch=async(target,init)=>{sent.push(init);return new Response(JSON.stringify(init?.method==='POST'?{ok:true}:{rutina:[],alternativas:[],filas:[['2024-01-01','','A','Pecho',1,5,100,'','','Excel','r1']]}));};
    assert.equal((await onRequest({request:post({action:'rename',from:'A',to:'A'}),data:{session:owner},env})).status,400);
    assert.equal((await onRequest({request:post({action:'rename',from:'Z',to:'B'}),data:{session:owner},env})).status,404);
    const ok=await onRequest({request:post({action:'rename',from:' A ',to:'B  · TG'}),data:{session:owner},env});
    assert.equal(ok.status,200);assert.deepEqual(await ok.json(),{ok:true,rows:1});
    const body=JSON.parse(sent.at(-1).body);
    assert.equal(body.k,'secret-key');assert.equal(body.ops[0].fila.ejercicio,'B · TG');assert.equal(body.ops[0].fila.origen,'Excel');
  } finally { globalThis.fetch=real; }
});

test('Every strength test is a standardised lift of its own muscle',()=>{
  for(const t of TESTS){assert.ok(stdFor(t.ejercicio),t.ejercicio);assert.equal(muscleOfName(t.ejercicio),t.group,t.ejercicio);}
});
test('Past self: the session near three months ago, or the muscle on a machine never used before',()=>{
  const rows=[row('2026-08-10','Bench Press',1,5,100),row('2026-10-30','Bench Press',1,5,110),row('2026-08-10','Pecho Máquina · HS',1,5,100)];
  const p=pastSelf(rows,'Bench Press','2026-11-09',85);assert.equal(p.kind,'exercise');assert.equal(p.fecha,'2026-08-10');
  const m=pastSelf(rows,'Chest Press · Impulse · Vivagym','2026-11-09',85);assert.equal(m.kind,'muscle');assert.equal(m.name,'Pecho');
  assert.equal(liftPercentile('Bench Press',103.5,85).pct,50);assert.equal(liftPercentile('Step Down',100,85),null);
});
test('Rivalry summary: days this week, today, records against your own past and treadmill km',()=>{
  const c=(fecha,ej,reps,kg,origen='app',nota='')=>[fecha,1,ej,'X',1,reps,kg,'',nota,origen,fecha+ej];
  const rows=[c('2026-10-01','Bench Press',5,100,'Excel'),c('2026-11-03','Bench Press',6,100),c('2026-11-09','Squat',5,100),c('2026-11-02','Squat',5,90),c('2026-11-09','Caminadora',30,'','app','6 km/h, 0°'),c('2026-11-04','Abs',5,500,'Excel')];
  const s=summarize(rows,CESAR_COLUMNS,'2026-11-09');
  assert.equal(s.week,1);assert.equal(s.lastWeek,3);assert.equal(s.trainedToday,true);assert.equal(s.walkedToday,true);assert.equal(s.walkWeek,3);
  assert.deepEqual(s.records.map(r=>r.ejercicio),['Bench Press'],'a record needs an earlier mark and an app row');
  assert.equal(s.records[0].mejora,2.9);
  const m=summarize([['2026-11-09',1,'Hip thrust','Glúteos',1,8,100,'','app','x']],MARIA_COLUMNS,'2026-11-09');assert.equal(m.trainedToday,true);
});
test('Pique endpoint: only with the key of María, CORS for her app, and only the summary',async()=>{
  const real=globalThis.fetch,purl='https://example.test/api/pique';
  const env={CONTROL_DB:db({'maria-lab':{sheet:{url:'https://script.google.com/macros/s/m/exec',key:'maria-key-123456'}},'training-lab':{sheet:{url:'https://script.google.com/macros/s/c/exec',key:'cesar-key'}}})};
  try {
    globalThis.fetch=async()=>new Response(JSON.stringify({rutina:[],alternativas:[],filas:[['2026-11-09',1,'Bench Press','Pecho',1,5,100,'','secret note','app','a']]}));
    assert.equal((await pique({request:new Request(purl),env})).status,401);
    assert.equal((await pique({request:new Request(purl,{headers:{'x-pique':'wrong'}}),env})).status,401);
    const pre=await pique({request:new Request(purl,{method:'OPTIONS',headers:{origin:'https://cesarsgz.github.io'}}),env});
    assert.equal(pre.status,204);assert.equal(pre.headers.get('access-control-allow-origin'),'https://cesarsgz.github.io');
    assert.equal((await pique({request:new Request(purl,{method:'OPTIONS',headers:{origin:'https://evil.test'}}),env})).headers.get('access-control-allow-origin'),null);
    const ok=await pique({request:new Request(purl,{headers:{'x-pique':'maria-key-123456',origin:'https://cesarsgz.github.io'}}),env});
    assert.equal(ok.status,200);const text=await ok.text();
    assert.ok(!text.includes('secret note')&&!text.includes('cesar-key'));assert.ok(JSON.parse(text).rival.year>=0);
  } finally { globalThis.fetch=real; }
});

test('Rival connection: owner only, validated against her Sheet, stored apart from his own',async()=>{
  const real=globalThis.fetch,post=body=>new Request(url,{method:'POST',headers:{'x-csrf-token':'test-token'},body:JSON.stringify(body)});
  const store=db({'training-lab':{sheet:{url:'https://script.google.com/macros/s/x/exec',key:'secret-key'},bodyWeight:[]}}),env={CONTROL_DB:store};
  try {
    globalThis.fetch=async()=>new Response(JSON.stringify({rutina:[],filas:[]}));
    assert.equal((await onRequest({request:post({action:'connect-rival',code:'nope'}),data:{session:owner},env})).status,400);
    const ok=await onRequest({request:post({action:'connect-rival',code:'https://script.google.com/macros/s/m/exec#abcdefabcdefabcdef'}),data:{session:owner},env});
    assert.equal(ok.status,200);assert.equal(store.saved.args[0],'maria-lab');assert.ok(!(await ok.text()).includes('abcdef'));
  } finally { globalThis.fetch=real; }
});
