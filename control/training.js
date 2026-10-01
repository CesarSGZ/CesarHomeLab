(() => {
  const app = document.getElementById('training-app');
  if (!app) return;
  let dataset, csrf = '', phaseIndex = 0, activeDay = '', tab = 'routine', selectedKey = 'bench press', metric = 'load';
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
  function historyFor(key) {
    const current = dataset.phases[0].exercises.find(exercise => exercise.key === key && exercise.kind === 'main');
    const wantedKind = current ? 'main' : null;
    return dataset.history.map(snapshot => {
      const exercise = snapshot.exercises.find(exercise => exercise.key === key && (!wantedKind || exercise.kind === wantedKind));
      return exercise ? { ...exercise, snapshot } : null;
    }).filter(Boolean).sort((a,b) => a.snapshot.observedAt.localeCompare(b.snapshot.observedAt));
  }
  const options = (values, selected) => values.map(([value,label]) => `<option value="${escape(value)}"${String(value)===String(selected)?' selected':''}>${escape(label)}</option>`).join('');
  function render() {
    if (!activeDay || !days().includes(activeDay)) activeDay = days()[0] || '';
    const total = dataset.phases[0].exercises.filter(exercise => exercise.kind === 'main').length;
    app.innerHTML = `<div class="training-heading"><div><p class="eyebrow"><span></span> TRAINING LAB / TU REGISTRO</p><h2>Tu entrenamiento.<br><em>Con perspectiva.</em></h2><p>Rutinas, cargas anotadas y alternativas. Un registro de tu evolución, sin mezclar máquinas ni convertir tus notas en datos inventados.</p></div><button class="training-refresh" id="training-refresh" type="button">↻ Actualizar desde Sheets</button></div>
      <p class="training-signal" id="training-signal" role="status">Última lectura: ${date(dataset.checkedAt)} · Solo visible para CesarVapor</p>
      <div class="training-kpis"><article><small>RUTINA ACTUAL</small><strong>${new Set(dataset.phases[0].exercises.filter(e=>e.kind==='main').map(e=>e.day)).size} días</strong><span>Bloque principal de la hoja</span></article><article><small>EJERCICIOS PRINCIPALES</small><strong>${total}</strong><span>Sin contar alternativas</span></article><article><small>PLANES CONSERVADOS</small><strong>${dataset.phases.length}</strong><span>Las pestañas de tu entrenamiento</span></article><article><small>LECTURAS HISTÓRICAS</small><strong>${dataset.history.length}</strong><span>Versiones recuperadas + capturas</span></article></div>
      <div class="training-tabs" role="tablist" aria-label="Vistas de entrenamiento">${[['routine','Rutina'],['evolution','Evolución'],['alternatives','Alternativas']].map(([id,label])=>`<button type="button" role="tab" id="training-tab-${id}" aria-selected="${tab===id}" aria-controls="training-panel-${id}" data-training-tab="${id}" tabindex="${tab===id?'0':'-1'}">${label}</button>`).join('')}</div>
      <div class="training-panel${tab==='routine'?' active':''}" role="tabpanel" aria-labelledby="training-tab-routine" id="training-panel-routine"></div>
      <div class="training-panel${tab==='evolution'?' active':''}" role="tabpanel" aria-labelledby="training-tab-evolution" id="training-panel-evolution"></div>
      <div class="training-panel${tab==='alternatives'?' active':''}" role="tabpanel" aria-labelledby="training-tab-alternatives" id="training-panel-alternatives"></div>
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
    renderRoutine(); renderEvolution(); renderAlternatives();
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
    panel.querySelectorAll('[data-exercise]').forEach(button=>button.addEventListener('click',()=>{selectedKey=button.dataset.exercise;tab='evolution';renderEvolution();switchPanel();document.getElementById('training-exercise').focus();}));
  }
  function renderEvolution() {
    const panel=document.getElementById('training-panel-evolution');
    const inventory=availableExercises();
    if (!inventory.some(exercise=>exercise.key===selectedKey)) selectedKey=inventory[0]?.key||'';
    const chosen=inventory.find(exercise=>exercise.key===selectedKey);
    const history=historyFor(selectedKey),points=history.filter(exercise=>exercise.prescription);
    panel.innerHTML=`<div class="training-toolbar"><label><span>EJERCICIO EXACTO / MISMA VARIANTE</span><select id="training-exercise">${options(inventory.map(e=>[e.key,e.name]),selectedKey)}</select></label></div>
      <div class="training-trend"><div class="training-chart-shell"><div class="training-chart-head"><div><h3>${escape(chosen?.name||'Ejercicio')}</h3><p>${points.length} lecturas interpretables · Fechas de versión, no fechas de sesión</p></div><div class="training-metric" aria-label="Métrica"><button type="button" data-training-metric="load" aria-pressed="${metric==='load'}">Carga</button><button type="button" data-training-metric="reps" aria-pressed="${metric==='reps'}">Repeticiones</button></div></div><div id="training-chart"></div></div><aside class="training-point-inspector" id="training-inspector" aria-live="polite"></aside></div>
      <p class="training-note">${metric==='load'?'Carga anotada en tu unidad habitual (la hoja no declara unidades).':'Repeticiones de la primera pauta anotada.'} Solo se interpreta la primera expresión simple «reps × peso». Expresiones como «6×2×85», tiempos y anotaciones ambiguas se conservan como texto. No se estima tu 1RM ni se equiparan máquinas, recorridos o técnicas distintos. Las versiones no recuperables dejan huecos en el historial.</p>
      <div class="training-history-table"><table><thead><tr><th>Fecha de lectura</th><th>Nota original</th><th>Origen</th></tr></thead><tbody>${history.length?history.slice().reverse().map(exercise=>`<tr><td>${date(exercise.snapshot.observedAt)}</td><td>${escape(exercise.raw||'Sin anotación')}${exercise.secondaryRaw?`<br><small>${escape(exercise.secondaryMode)}: ${escape(exercise.secondaryRaw)}</small>`:''}</td><td>${exercise.kind==='main'?'Rutina':'Alternativa'} · ${escape(exercise.snapshot.title)} · ${escape(exercise.cell)}</td></tr>`).join(''):'<tr><td colspan="3">No hay lecturas históricas recuperadas para este nombre exacto.</td></tr>'}</tbody></table></div>`;
    document.getElementById('training-exercise').addEventListener('change',event=>{selectedKey=event.target.value;renderEvolution();});
    panel.querySelectorAll('[data-training-metric]').forEach(button=>button.addEventListener('click',()=>{metric=button.dataset.trainingMetric;renderEvolution();}));
    drawChart(points);
  }
  function inspectPoint(exercise) {
    const inspector=document.getElementById('training-inspector');
    if (!exercise) {inspector.innerHTML='<small>LECTURA HISTÓRICA</small><h4>Sin puntos comparables</h4><p>La anotación se mantiene en su formato original en la tabla. No se extrae un número si su significado es ambiguo.</p>';return;}
    inspector.innerHTML=`<small>${date(exercise.snapshot.observedAt).toUpperCase()}<br>${exercise.snapshot.origin==='revision'?'VERSIÓN RECUPERADA':'CAPTURA DE LA HOJA'}</small><strong>${number(exercise.prescription[metric])}<small style="font-size:12px;letter-spacing:0"> ${metric==='load'?'carga':'reps'}</small></strong><h4>${exercise.prescription.reps} repeticiones × ${number(exercise.prescription.load)} de carga</h4><p>${escape(exercise.raw)}</p><p class="training-provenance">${escape(exercise.snapshot.title)}<br>Celda ${escape(exercise.cell)} · ${exercise.kind==='main'?'Rutina principal':'Alternativa'}<br>${exercise.snapshot.origin==='revision'?'La fecha es la modificación de esa versión.':'La fecha es cuándo se leyó la hoja.'}</p>`;
  }
  function drawChart(points) {
    const container=document.getElementById('training-chart');
    if (!points.length) {container.innerHTML='<div class="training-empty">Todavía no hay una pauta numérica simple para dibujar este ejercicio. Sus notas siguen disponibles debajo.</div>';inspectPoint(null);return;}
    const width=760,height=350,left=54,right=24,top=24,bottom=48;
    const times=points.map(point=>Date.parse(point.snapshot.observedAt)), values=points.map(point=>point.prescription[metric]);
    const minTime=Math.min(...times),maxTime=Math.max(...times),low=Math.min(...values),high=Math.max(...values),margin=Math.max((high-low)*.2,high*.06,1),min= Math.max(0,low-margin),max=high+margin;
    const x=time=>left+(time-minTime)/(maxTime-minTime||1)*(width-left-right),y=value=>height-bottom-(value-min)/(max-min)*(height-top-bottom);
    const coords=points.map((point,index)=>[maxTime===minTime?width/2:x(times[index]),y(values[index])]);
    const path=coords.map(([px,py],index)=>`${index?'L':'M'}${px.toFixed(1)},${py.toFixed(1)}`).join(' ');
    const grid=Array.from({length:5},(_,i)=>{const value=min+(max-min)*i/4,py=y(value);return `<path class="chart-grid" d="M${left},${py}H${width-right}"/><text x="${left-12}" y="${py+4}" text-anchor="end">${number(value)}</text>`;}).join('');
    const labels=[0,Math.floor((points.length-1)/2),points.length-1].filter((i,index,a)=>a.indexOf(i)===index).map(i=>`<text x="${coords[i][0]}" y="${height-12}" text-anchor="middle">${escape(new Intl.DateTimeFormat('es-ES',{month:'short',year:'2-digit'}).format(new Date(times[i])))}</text>`).join('');
    container.innerHTML=`<svg class="training-chart" viewBox="0 0 ${width} ${height}" role="group" aria-label="Evolución de ${metric==='load'?'carga anotada':'repeticiones'}; selecciona un punto para ver su fuente">${grid}${points.length>1?`<path class="chart-area" d="${path} L${coords.at(-1)[0]},${height-bottom} L${coords[0][0]},${height-bottom}Z"/>`:''}<path class="chart-line" d="${path}"/>${coords.map(([px,py],i)=>`<circle class="training-point${i===points.length-1?' selected':''}" cx="${px}" cy="${py}" r="5" tabindex="0" role="button" data-point="${i}" aria-label="${date(points[i].snapshot.observedAt)}: ${number(values[i])}"><title>${escape(points[i].raw)}</title></circle>`).join('')}${labels}</svg>`;
    inspectPoint(points.at(-1));
    container.querySelectorAll('[data-point]').forEach(circle=>{
      const inspect=()=>{container.querySelectorAll('[data-point]').forEach(peer=>peer.classList.toggle('selected',peer===circle));inspectPoint(points[Number(circle.dataset.point)]);};
      circle.addEventListener('mouseenter',inspect);circle.addEventListener('focus',inspect);circle.addEventListener('click',inspect);circle.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();inspect();}});
    });
  }
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
  async function request(method='GET') {
    const response=await fetch('/control/api/training/status',{method,credentials:'same-origin',headers:{accept:'application/json',...(method==='POST'?{'x-csrf-token':csrf}:{})}});
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
  window.TrainingLab={async initialise(token){csrf=token;try{const result=await request();dataset=result.dataset;render();}catch(error){app.innerHTML=`<p class="eyebrow"><span></span> TRAINING LAB</p><h2>Entrenamiento</h2><p class="training-empty">${escape(error.message)}</p>`;}}};
})();
