import test from 'node:test';
import assert from 'node:assert/strict';
// The UI module registers listeners at import time; no page or API is created.
const savedDocument=globalThis.document,savedWindow=globalThis.window;
globalThis.document={getElementById(){return null;}};globalThis.window={addEventListener(){}};
const {officeSummary,employeeWorkView,sessionPreparation}=await import('../control/trading.js');
globalThis.document=savedDocument;globalThis.window=savedWindow;

function fixture(){return {agents:[{id:'analyst',task:'Vieja tarea administrativa',status:'esperando',objective:'Comparar oportunidades con evidencia'}],events:[],company:{meetings:[{status:'completa',chair:{officeStatus:'Esperar siete días',concerns:'Antigua preocupación',goals:[{title:'Viejo objetivo',owner:'analyst'}]}}],agency:{actors:{analyst:{nextTask:'Esperar siete días',lastAction:{time:10,result:'Espera antigua'}}},workQueue:[]}}};}

test('current pipeline blockage and counts supersede an older meeting summary',()=>{
 const s=fixture();s.company.pipeline={blocker:'Falta contrastar el catalizador de TEST.',nextSessionDate:'2026-10-05',counts:{researchQueue:4,analysisReady:2,approvedWaiting:0,supportPending:3}};
 const x=officeSummary(s);assert.equal(x.status,s.company.pipeline.blocker);assert.equal(x.counts.approvedWaiting,0);assert.equal(x.counts.analysisReady,2);assert.ok(!x.concern.includes('Antigua'));assert.match(x.expectations,/2026-10-05/);
 s.runtimeUnavailable=true;assert.match(officeSummary(s).status,/Incidencia/);
});

test('each employee shows its own operational queue and completed work instead of stale administrative instructions',()=>{
 const s=fixture();s.company.agency.workQueue=[{owner:'scout',status:'running',task:'Otra tarea',createdAt:1},{owner:'analyst',status:'pending',task:'Comparar las métricas de TEST',createdAt:2,notBefore:100},{owner:'analyst',status:'complete',task:'Análisis previo',finishedAt:20,result:'Riesgos y valoración contrastados'}];
 const work=employeeWorkView(s,'analyst');assert.equal(work.active.length,1);assert.equal(work.currentTask,'Comparar las métricas de TEST');assert.equal(work.result,'Riesgos y valoración contrastados');assert.equal(officeSummary(s).goals[1].text,'Comparar las métricas de TEST');
 s.company.agency.workQueue=s.company.agency.workQueue.filter(w=>w.owner!=='analyst'||w.status==='complete');assert.ok(!employeeWorkView(s,'analyst').currentTask.includes('siete días'));
});

test('weekend preliminary work is visible without becoming an approved purchase plan',()=>{
 const s=fixture();s.company.pipeline={nextSessionDate:'2026-10-05'};s.events=[{id:'e1',symbol:'TEST',preliminary:{summary:'Comparación preparada',missingEvidence:['Fecha primaria'],executable:false},preRisk:{summary:'Dilución pendiente',missingEvidence:['Caja trimestral'],executable:false}}];
 const preliminary=sessionPreparation(s);assert.equal(preliminary.date,'2026-10-05');assert.equal(preliminary.ready.length,0);assert.equal(preliminary.notes[0].analysis.executable,false);
 s.company.sessionPlan={date:'2026-10-05',ready:[{eventId:'e2',symbol:'REAL',conditions:['Referencia fresca','Precio en rango']}],steps:['Consultar referencias de la sesión']};const prepared=sessionPreparation(s);assert.deepEqual(prepared.ready.map(p=>p.symbol),['REAL']);assert.equal(prepared.notes.length,1);assert.equal(prepared.steps[0],'Consultar referencias de la sesión');
});
