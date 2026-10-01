(() => {
  const app = document.getElementById('training-app');
  if (!app) return;
  let dataset, model, analytics, csrf = '', phaseIndex = 0, activeDay = '', tab = 'evolution', selectedKey = 'bench press', selectedMuscle='chest', metric = 'absolute', scope='timeline', directOnly=false;
  const escape = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const date = value => value ? new Intl.DateTimeFormat('es-ES',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(value)) : 'Sin fecha de inicio';
  const number = value => new Intl.NumberFormat('es-ES',{maximumFractionDigits:2}).format(value);
  const phase = () => dataset.phases[phaseIndex];
  const main = () => phase().exercises.filter(exercise => exercise.kind === 'main');
  const days = () => [...new Set(main().map(exercise => exercise.day))];
  function availableExercises() {
    const map = new Map();
    [...dataset.phases.flatMap(p => p.exercises), ...dataset.history.flatMap(p => p.exercises)].forEach(exercise => { if (!map.has(exercise.key)) map.set(exercise.key, exercise); });
    return [...map.values()].sort((a,b) => a.name.localeCompare(b.name,'es'));
  }
  const options = (values, selected) => values.map(([value,label]) => `<option value="${escape(value)}"${String(value)===String(selected)?' selected':''}>${escape(label)}</option>`).join('');
  function render() {
    if (!activeDay || !days().includes(activeDay)) activeDay = days()[0] || '';
    const total = dataset.phases[0].exercises.filter(exercise => exercise.kind === 'main').length;
    const currentDays=new Set(dataset.phases[0].exercises.filter(exercise=>exercise.kind==='main').map(exercise=>exercise.day)).size;
    const records=model.allStrengthRecords(dataset), masses=dataset.bodyWeight?.measurements||[];
    app.innerHTML = `<div class="training-heading"><div><p class="eyebrow"><span></span> TRAINING LAB / FUERZA EN PERSPECTIVA</p><h2>Tu fuerza.<br><em>A lo largo del tiempo.</em></h2><p>Un ejercicio de referencia por músculo. 1RM estimada, equivalencias personales y peso corporal, con el origen de cada punto a un clic.</p></div><button class="training-refresh" id="training-refresh" type="button">↻ Actualizar desde Sheets</button></div>
      <p class="training-signal" id="training-signal" role="status">Última lectura: ${date(dataset.checkedAt)} · Solo visible para CesarVapor</p>
      <div class="training-kpis"><article><small>REGISTROS DE FUERZA</small><strong>${number(records.length)}</strong><span>Notas originales, incluidas las pendientes</span></article><article><small>FUENTES DE ENTRENAMIENTO</small><strong>${1+(dataset.archives?.length||0)}</strong><span>${dataset.phases.length} planes actuales + históricos</span></article><article><small>PESO CORPORAL</small><strong>${masses.length}</strong><span>Mediciones importadas desde Libra</span></article><article><small>RUTINA ACTUAL</small><strong>${currentDays} días</strong><span>${total} ejercicios principales</span></article></div>
      <div class="training-tabs" role="tablist" aria-label="Vistas de entrenamiento">${[['evolution','Evolución'],['weight','Peso corporal'],['routine','Rutina'],['alternatives','Alternativas'],['settings','Equivalencias y fechas']].map(([id,label])=>`<button type="button" role="tab" id="training-tab-${id}" aria-selected="${tab===id}" aria-controls="training-panel-${id}" data-training-tab="${id}" tabindex="${tab===id?'0':'-1'}">${label}</button>`).join('')}</div>
      <div class="training-panel${tab==='routine'?' active':''}" role="tabpanel" aria-labelledby="training-tab-routine" id="training-panel-routine"></div>
      <div class="training-panel${tab==='evolution'?' active':''}" role="tabpanel" aria-labelledby="training-tab-evolution" id="training-panel-evolution"></div>
      <div class="training-panel${tab==='alternatives'?' active':''}" role="tabpanel" aria-labelledby="training-tab-alternatives" id="training-panel-alternatives"></div>
      <div class="training-panel${tab==='weight'?' active':''}" role="tabpanel" aria-labelledby="training-tab-weight" id="training-panel-weight"></div>
      <div class="training-panel${tab==='settings'?' active':''}" role="tabpanel" aria-labelledby="training-tab-settings" id="training-panel-settings"></div>
      <a class="training-source-link" href="https://docs.google.com/spreadsheets/d/${encodeURIComponent(dataset.source.id)}/edit" target="_blank" rel="noopener noreferrer">Abrir mi hoja original ↗</a>`;
    app.querySelectorAll('[data-training-tab]').forEach(button => {
      button.addEventListener('click',()=>{tab=button.dataset.trainingTab; switchPanel();});
      button.addEventListener('keydown',event=>{
        if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
        event.preventDefault();const buttons=[...app.querySelectorAll('[data-training-tab]')], index=buttons.indexOf(button);
        const next=event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+(event.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;
        buttons[next].click();buttons[next].focus();
      });
    });
    document.getElementById('training-refresh').addEventListener('click',refresh);
    renderRoutine(); renderEvolution(); renderAlternatives(); renderWeight(); renderSettings();
  }
  function switchPanel() {
    app.querySelectorAll('[data-training-tab]').forEach(button=>{const active=button.dataset.trainingTab===tab;button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;});
    app.querySelectorAll('.training-panel').forEach(panel=>panel.classList.toggle('active',panel.id===`training-panel-${tab}`));
  }
  function phaseSelect(id) {
    return `<label><span>PLAN / PESTAÑA</span><select id="${id}">${options(dataset.phases.map((p,index)=>[index,p.title]),phaseIndex)}</select></label>`;
  }
  function renderRoutine() {
    const panel=document.getElementById('training-panel-routine');
    const exercises=main().filter(exercise=>exercise.day===activeDay);
    panel.innerHTML=`<div class="training-toolbar">${phaseSelect('training-plan')}<div class="training-days" aria-label="Día de rutina">${days().map(day=>`<button type="button" data-training-day="${escape(day)}" aria-pressed="${day===activeDay}">${escape(day)}</button>`).join('')}</div></div>
      <div class="training-plan-intro"><div><h3>${escape(activeDay)} · ${exercises.length} ejercicios</h3><p>${phase().planDate?'Plan iniciado el '+date(phase().planDate):'Esta pestaña no indica una fecha de inicio'} · ${escape(phase().title)}</p></div><span class="training-plan-symbol" aria-hidden="true">${escape(activeDay.match(/\d+/)?.[0]||'—')}</span></div>
      <div class="training-routine">${exercises.map(exercise=>`<button type="button" class="training-exercise" data-exercise="${escape(exercise.key)}"><div><small>${escape(exercise.group)} · ${exercise.sets??'—'} SERIES</small><strong>${escape(exercise.name)}</strong><p>${escape(exercise.raw||'Sin carga anotada')}</p></div><b aria-hidden="true">↗</b></button>`).join('')}</div>
      <p class="training-note">Estas son las referencias que has escrito en la hoja, no un contador de sesiones realizadas. Pulsa un ejercicio para ver sus lecturas históricas. Las agrupaciones de la rutina son orientativas según el nombre del ejercicio.</p>`;
    document.getElementById('training-plan').addEventListener('change',event=>{phaseIndex=Number(event.target.value);activeDay=days()[0];renderRoutine();renderAlternatives();});
    panel.querySelectorAll('[data-training-day]').forEach(button=>button.addEventListener('click',()=>{activeDay=button.dataset.trainingDay;renderRoutine();}));
    bindExercises(panel);
  }
  function bindExercises(panel) {
    panel.querySelectorAll('[data-exercise]').forEach(button=>button.addEventListener('click',()=>{selectedKey=button.dataset.exercise;const exercise=availableExercises().find(e=>e.key===selectedKey);selectedMuscle=model.muscleFor(exercise?.name,exercise?.group)||'chest';tab='evolution';renderEvolution();switchPanel();document.getElementById('training-reference-title').focus();}));
  }
  function renderEvolution() { analytics.renderEvolution(); }
  function renderWeight() { analytics.renderWeight(); }
  function renderSettings() { analytics.renderSettings(); }
  function renderAlternatives() {
    const panel=document.getElementById('training-panel-alternatives');
    const alternatives=phase().exercises.filter(exercise=>exercise.kind==='alternative'),groups=[...new Set(alternatives.map(e=>e.group))];
    panel.innerHTML=`<div class="training-toolbar">${phaseSelect('training-alternative-plan')}<label><span>GRUPO MUSCULAR</span><select id="training-muscle">${options([['all','Todos los grupos'],...groups.map(g=>[g,g])],'all')}</select></label><label><span>BUSCAR MÁQUINA O EJERCICIO</span><input id="training-search" type="search" placeholder="Polea, Vivagym, Scott…" autocomplete="off"></label></div><div class="training-alternatives" id="training-alternative-list"></div><p class="training-note">Cada alternativa conserva su propio peso y sus notas. No equivale a la carga de otra máquina del mismo músculo. «Mismo pero Vivagym» se conserva tal como figura en la hoja.</p>`;
    const update=()=>{
      const group=document.getElementById('training-muscle').value,query=document.getElementById('training-search').value.toLocaleLowerCase('es');
      const filtered=alternatives.filter(e=>(group==='all'||e.group===group)&&`${e.name} ${e.raw}`.toLocaleLowerCase('es').includes(query));
      document.getElementById('training-alternative-list').innerHTML=filtered.length?filtered.map(exercise=>`<button type="button" class="training-exercise" data-exercise="${escape(exercise.key)}"><small>${escape(exercise.group)}</small><strong>${escape(exercise.name)}</strong><p>${exercise.rawMode?`${escape(exercise.rawMode)} · `:''}${escape(exercise.raw||'Sin carga anotada')}${exercise.secondaryRaw?`<br>${escape(exercise.secondaryMode)} · ${escape(exercise.secondaryRaw)}`:''}</p><b>Ver evolución ↗</b></button>`).join(''):'<p class="training-empty">No hay alternativas con estos filtros.</p>';
      bindExercises(panel);
    };
    document.getElementById('training-alternative-plan').addEventListener('change',event=>{phaseIndex=Number(event.target.value);activeDay=days()[0];renderRoutine();renderAlternatives();});
    document.getElementById('training-muscle').addEventListener('change',update);document.getElementById('training-search').addEventListener('input',update);update();
  }
  async function request(method='GET',body=null) {
    const response=await fetch('/control/api/training/status',{method,credentials:'same-origin',headers:{accept:'application/json',...(method==='POST'?{'x-csrf-token':csrf}:{}),...(body?{'content-type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});
    if (response.status===401) {location.replace('/control/login');throw new Error('Sesión caducada.');}
    const result=await response.json();
    if(!response.ok||!result.ok)throw new Error(result.error==='not_authorised'?'Tu cuenta no tiene acceso a este apartado.':'No se ha podido leer el entrenamiento.');
    return result;
  }
  async function refresh() {
    const button=document.getElementById('training-refresh');button.disabled=true;button.textContent='Actualizando…';
    try {const result=await request('POST');dataset=result.dataset;render();const signal=document.getElementById('training-signal');signal.textContent=result.refreshError||`${result.refresh==='recent'?'Lectura reciente conservada':'Hoja actualizada'} · ${date(dataset.checkedAt)} · Las nuevas anotaciones se conservarán como capturas`;signal.classList.toggle('error',Boolean(result.refreshError));}
    catch(error){const signal=document.getElementById('training-signal');signal.textContent=error.message;signal.classList.add('error');}
    finally{const current=document.getElementById('training-refresh');current.disabled=false;current.textContent='↻ Actualizar desde Sheets';}
  }
  window.TrainingLab={async initialise(token){csrf=token;try{
    const [math,views]=await Promise.all([import('./training-model.js?v=20261001strength'),import('./training-analytics.js?v=20261001strength')]);model=math;
    analytics=views.createTrainingAnalytics({getDataset:()=>dataset,getState:()=>({selectedMuscle,metric,scope,directOnly}),setState:state=>{if(state.selectedMuscle!==undefined)selectedMuscle=state.selectedMuscle;if(state.metric!==undefined)metric=state.metric;if(state.scope!==undefined)scope=state.scope;if(state.directOnly!==undefined)directOnly=state.directOnly;},escape,date,number,options,
      openSettings:()=>{tab='settings';renderSettings();switchPanel();document.getElementById('training-settings-muscle').focus();},
      saveSettings:async settings=>{const result=await request('POST',{action:'settings',settings});dataset=result.dataset;render();}});
    const result=await request();dataset=result.dataset;render();
  }catch(error){app.innerHTML=`<p class="eyebrow"><span></span> TRAINING LAB</p><h2>Entrenamiento</h2><p class="training-empty">${escape(error.message)}</p>`;}}};
})();
