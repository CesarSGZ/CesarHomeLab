import test from 'node:test';
import assert from 'node:assert/strict';
// The UI module registers listeners at import time; no page or API is created.
const savedDocument=globalThis.document,savedWindow=globalThis.window;
globalThis.document={getElementById(){return null;}};globalThis.window={addEventListener(){}};
const {officeSummary,employeeWorkView,sessionPreparation,sessionOpening}=await import('../control/trading.js');
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

const now=Date.parse('2026-10-05T10:52:00Z');
function preparedFixture(){const s=fixture();s.agents.push({id:'operator',status:'esperando',task:'Esperando referencias públicas válidas'},{id:'scout',status:'esperando',task:'0 candidatos nuevos'},{id:'risk',status:'esperando',task:'Controles activos'},{id:'auditor',status:'esperando',task:'Esperando cierres'});s.book={positions:[],closed:[]};s.company.pipeline={marketOpen:false,nextSessionDate:'2026-10-05',counts:{researchQueue:27,analysisReady:0,analysisBlocked:2,riskPending:0,approvedWaiting:2,closed:0}};s.company.sessionPlan={date:'2026-10-05',ready:[{symbol:'ANGO'},{symbol:'ODC'}]};s.company.launch={active:true,priorityUseful:true,ready:0,target:2};return s;}

test('approved plans supersede stale launch and meeting goals while the market is closed',()=>{
 const s=preparedFixture(),before=JSON.stringify(s),x=officeSummary(s,now);
 assert.equal(x.readyCount,2);assert.equal(x.counts.approvedWaiting,2);assert.equal(x.headline,'Espera de apertura');
 assert.equal(x.goals[0].owner,'operator');assert.match(x.goals[0].text,/Revalidar ANGO, ODC al abrir/);assert.match(x.goals[0].due,/15:30/);assert.match(x.status,/2 planes aprobados/);assert.ok(!x.status.includes('preparar 2'));assert.match(x.expectations,/precio puede impedir/);
 const y=employeeWorkView(s,'operator',now);assert.equal(y.phase,'market_wait');assert.equal(y.working,false);assert.match(y.reason,/ANGO, ODC/);assert.match(y.reason,/solo si/);assert.match(y.nextLabel,/15:30/);assert.equal(JSON.stringify(s),before,'presentation must not change the ledger or scheduling');
});

test('research budget waiting shows known available and estimated cost rather than claiming analysis',()=>{
 const s=preparedFixture();s.company.sessionPlan.researchPacing={availableResearchEur:.0066569,estimatedResearchCostEur:.03987};s.company.agency.actors.scout={nextWake:now+3600000};
 const v=employeeWorkView(s,'scout',now);assert.equal(v.statusLabel,'Espera de cuota');assert.equal(v.working,false);assert.match(v.reason,/27 investigaciones/);assert.match(v.reason,/0,0067 €/);assert.match(v.reason,/0,0399 €/);assert.match(v.reason,/radar por código/);assert.match(v.nextLabel,/cuota y presupuesto/);
 delete s.company.sessionPlan.researchPacing.availableResearchEur;assert.equal(employeeWorkView(s,'scout',now).phase,'queued','missing budget data does not mean zero');
});

test('running appearance requires a current confirmed cycle and an enabled employee',()=>{
 const s=preparedFixture(),a=s.agents.find(a=>a.id==='analyst');a.status='trabajando';a.task='Analizando TEST';s.busy=false;assert.equal(employeeWorkView(s,'analyst',now).working,false);assert.notEqual(employeeWorkView(s,'analyst',now).statusLabel,'Trabajando');
 s.busy=true;assert.equal(employeeWorkView(s,'analyst',now).phase,'working');assert.equal(employeeWorkView(s,'analyst',now).currentTask,'Analizando TEST');
 a.paused=true;assert.equal(employeeWorkView(s,'analyst',now).phase,'paused');assert.match(employeeWorkView(s,'analyst',now).nextLabel,/manual/);
 s.runtimeUnavailable=true;assert.equal(employeeWorkView(s,'analyst',now).phase,'incident');assert.equal(employeeWorkView(s,'analyst',now).working,false);assert.match(employeeWorkView(s,'analyst',now).nextLabel,/sin confirmar/);
});

test('scheduled and blocked assignments expose the specific reason and next eligibility',()=>{
 const s=fixture();s.company.agency.workQueue=[{owner:'analyst',status:'pending',task:'Revisar nuevos resultados de TEST',createdAt:now,notBefore:now+7200000}];
 let v=employeeWorkView(s,'analyst',now);assert.equal(v.statusLabel,'Programado');assert.equal(v.currentTask,'Revisar nuevos resultados de TEST');assert.equal(v.nextAt,now+7200000);assert.match(v.nextLabel,/Elegible desde/);
 Object.assign(s.company.agency.workQueue[0],{status:'blocked',result:'Falta el vencimiento de deuda primario'});v=employeeWorkView(s,'analyst',now);assert.equal(v.statusLabel,'Bloqueado');assert.match(v.reason,/vencimiento de deuda/);
});

test('market open switches prepared orders to revalidation and audit waits for actual closes',()=>{
 const s=preparedFixture();s.company.pipeline.marketOpen=true;assert.equal(employeeWorkView(s,'operator',now).phase,'entry_check');assert.match(employeeWorkView(s,'operator',now).reason,/referencias válidas/);assert.equal(officeSummary(s,now).headline,'Revalidar entradas');assert.equal(employeeWorkView(s,'auditor',now).phase,'results_wait');
 s.paused=true;assert.equal(employeeWorkView(s,'operator',now).phase,'paused');assert.match(employeeWorkView(s,'operator',now).reason,/salidas por reglas continúan/);
});

test('planned New York opening is converted with US daylight saving time, including Europe transition weeks',()=>{
 for(const [day,iso] of [['2026-10-05','2026-10-05T13:30:00.000Z'],['2026-10-30','2026-10-30T13:30:00.000Z'],['2026-11-02','2026-11-02T14:30:00.000Z']]){
  const s=fixture();s.company.sessionPlan={date:day,ready:[]};assert.equal(new Date(sessionOpening(s)).toISOString(),iso);
 }
 assert.equal(sessionOpening(fixture()),null);
});
