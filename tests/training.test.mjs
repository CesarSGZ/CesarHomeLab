import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {accessForUser} from '../functions/_lib/auth.js';
import {onRequest} from '../functions/control/api/training/status.js';
import {F,e1rm,sessions,progression,marks,recordsFor,suggestion,weeklySets,summary,alternatives,weightAt} from '../control/training-model.js';

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
  assert.equal(JSON.parse(box.doGet({parameter:{k:'mala'}})).error,'clave');
  assert.equal(JSON.parse(box.doPost({postData:{contents:JSON.stringify({k:'mala',ops:[]})}})).error,'clave');
});
