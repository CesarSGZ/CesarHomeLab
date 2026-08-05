const navItems=[...document.querySelectorAll('.nav-item')];
const views=[...document.querySelectorAll('.view')];
const sidebar=document.querySelector('.sidebar');
const menu=document.querySelector('.menu-toggle');
let allowedViews=new Set(['overview']);
let capabilities=new Set();
let accessProfile='standard';

function showView(id,push=true){
  const requested=allowedViews.has(id)?id:'overview';
  const next=document.getElementById(requested)||document.getElementById('overview');
  views.forEach(view=>view.classList.toggle('active',view===next));
  navItems.forEach(item=>item.classList.toggle('active',item.dataset.view===next.id));
  document.getElementById('view-code').textContent=`${next.dataset.title.toUpperCase()} · ${next.dataset.code}`;
  if(push)history.replaceState(null,'',`#${next.id}`);
  sidebar.classList.remove('open');
  menu.setAttribute('aria-expanded','false');
}

navItems.forEach(item=>item.addEventListener('click',()=>showView(item.dataset.view)));
document.querySelectorAll('[data-open]').forEach(button=>button.addEventListener('click',()=>showView(button.dataset.open)));
menu.addEventListener('click',()=>{const open=sidebar.classList.toggle('open');menu.setAttribute('aria-expanded',String(open))});

const clock=document.getElementById('system-time');
function tick(){clock.textContent=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Madrid',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(new Date())+' CET'}
tick();setInterval(tick,1000);

const canvas=document.getElementById('control-grid'),ctx=canvas.getContext('2d');
function drawGrid(){const d=devicePixelRatio||1;canvas.width=innerWidth*d;canvas.height=innerHeight*d;ctx.setTransform(d,0,0,d,0,0);ctx.clearRect(0,0,innerWidth,innerHeight);ctx.strokeStyle='rgba(82,217,255,.12)';ctx.lineWidth=.5;for(let x=0;x<innerWidth;x+=48){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,innerHeight);ctx.stroke()}for(let y=0;y<innerHeight;y+=48){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(innerWidth,y);ctx.stroke()}}
addEventListener('resize',drawGrid);drawGrid();

const restartButton=document.getElementById('restart-server');
const commandFeedback=document.getElementById('command-feedback');
let minecraftState=null;
let csrfToken='';

function setText(selector,value){
  document.querySelectorAll(selector).forEach(element=>{element.textContent=value});
}

function relativeTime(timestamp){
  if(!timestamp)return 'NEVER';
  const seconds=Math.max(0,Math.round((Date.now()-timestamp)/1000));
  if(seconds<10)return 'NOW';
  if(seconds<60)return `${seconds}S AGO`;
  const minutes=Math.round(seconds/60);
  return `${minutes}M AGO`;
}

async function loadSession(){
  try{
    const response=await fetch('/control/api/session',{credentials:'same-origin',headers:{accept:'application/json'}});
    if(response.status===401){location.replace('/control/login');return null}
    if(!response.ok)return null;
    const data=await response.json();
    return data.ok?data:null;
  }catch{return null}
}

function hasCapability(capability){
  return capabilities.has(capability);
}

function applyAccess(data){
  csrfToken=data.csrfToken||'';
  allowedViews=new Set(data.access?.views||['overview']);
  capabilities=new Set(data.access?.capabilities||[]);
  accessProfile=data.access?.profile||'standard';
  const owner=accessProfile==='owner';
  const minecraftOperator=accessProfile==='minecraft-operator';
  const username=data.user.username;

  navItems.forEach(item=>{item.hidden=!allowedViews.has(item.dataset.view)});
  views.forEach(view=>{view.hidden=!allowedViews.has(view.id)});
  document.querySelectorAll('[data-owner-only]').forEach(element=>{element.hidden=!owner});
  document.querySelectorAll('[data-standard-only]').forEach(element=>{element.hidden=owner});
  document.querySelectorAll('[data-requires]').forEach(element=>{
    element.hidden=!hasCapability(element.dataset.requires);
  });

  document.getElementById('session-name').textContent=`${username}.`;
  document.getElementById('session-role').textContent=data.user.role.toUpperCase();
  document.getElementById('session-avatar').textContent=username
    .split(/[^a-z0-9]+/i)
    .filter(Boolean)
    .map(part=>part[0])
    .join('')
    .slice(0,2)
    .toUpperCase()||'US';

  const overviewIntro=document.getElementById('overview-intro');
  const accessSummary=document.getElementById('access-summary');
  if(owner){
    overviewIntro.textContent='Your private home for live infrastructure and engineering systems, from server operations to thermal integration.';
    accessSummary.textContent='OWNER ACCESS · 3 MODULES';
  }else if(minecraftOperator){
    overviewIntro.textContent='A focused home for shared tools. Your account currently includes Minecraft server operations.';
    accessSummary.textContent='STANDARD ACCESS · MINECRAFT ENABLED';
  }else{
    overviewIntro.textContent='A simple, focused home. Shared tools will appear here when they are assigned to your account.';
    accessSummary.textContent='STANDARD ACCESS';
  }

  if(minecraftOperator){
    document.getElementById('infrastructure-nav-label').textContent='Minecraft Server';
    document.getElementById('infrastructure').dataset.title='Minecraft Server';
    document.getElementById('infrastructure-eyebrow').textContent='Minecraft operations';
    document.getElementById('infrastructure-title').textContent='Server control.';
    document.getElementById('infrastructure-intro').textContent='Live status and authorised recovery controls for the shared Minecraft server.';
  }

  document.body.classList.remove('access-pending');
}

function renderMinecraft(data){
  minecraftState=data;
  const connected=Boolean(data?.agent?.connected);
  const serverStatus=connected?(data.server.status||'unknown'):'unknown';
  const online=connected&&serverStatus==='online';
  const statusLabel=serverStatus.toUpperCase();
  const meta=connected
    ? `${data.server.version||'Minecraft'} · ${data.server.playersOnline??'—'} / ${data.server.playersMax??'—'} players`
    : 'The secure command channel is waiting for the server agent.';

  setText('[data-agent-label]',connected?'AGENT ONLINE':'AGENT OFFLINE');
  setText('[data-server-status]',connected?`${statusLabel} · SERVER LINKED`:'Waiting for server agent');
  setText('[data-server-meta]',meta);
  setText('[data-detail-status]',statusLabel);
  setText('[data-detail-players]',`${data.server.playersOnline??'—'} / ${data.server.playersMax??'—'}`);
  setText('[data-detail-version]',data.server.version||'—');
  setText('[data-detail-seen]',relativeTime(data.agent.lastSeen));
  setText('[data-connection-pill]',connected?'CONNECTED':'OFFLINE');

  document.querySelectorAll('[data-server-orb]').forEach(element=>element.classList.toggle('online',online));
  document.querySelectorAll('[data-agent-dot]').forEach(element=>element.classList.toggle('online',connected));
  document.querySelectorAll('[data-connection-pill]').forEach(element=>element.classList.toggle('online',connected));

  restartButton.disabled=!connected;
  if(!connected){
    commandFeedback.className='command-feedback';
    commandFeedback.textContent='Agent pairing required.';
  }else if(data.lastCommand?.status==='queued'||data.lastCommand?.status==='claimed'){
    restartButton.disabled=true;
    commandFeedback.className='command-feedback';
    commandFeedback.textContent=`RESTART ${data.lastCommand.status.toUpperCase()} · PLEASE WAIT`;
  }else if(data.lastCommand?.status==='failed'){
    commandFeedback.className='command-feedback error';
    commandFeedback.textContent=`LAST RESTART FAILED · ${data.lastCommand.result||'CHECK SERVER AGENT'}`;
  }else if(data.lastCommand?.status==='succeeded'){
    commandFeedback.className='command-feedback success';
    commandFeedback.textContent='LAST RESTART COMPLETED SUCCESSFULLY';
  }else{
    commandFeedback.className='command-feedback success';
    commandFeedback.textContent='SECURE COMMAND CHANNEL READY';
  }
}

async function refreshMinecraft(){
  try{
    const response=await fetch('/control/api/minecraft/status',{credentials:'same-origin',headers:{accept:'application/json'}});
    if(!response.ok)throw new Error('status_unavailable');
    renderMinecraft(await response.json());
  }catch{
    renderMinecraft({agent:{connected:false,lastSeen:null},server:{status:'unknown'}});
  }
}

function formatTemperature(value){return `${Number(value).toFixed(1)} °C`}
function formatPower(value){return `${Number(value).toFixed(0)} W`}

function makeElement(tag,className,text){
  const element=document.createElement(tag);
  if(className)element.className=className;
  if(text!==undefined)element.textContent=text;
  return element;
}

function renderExperimentLedger(experiments){
  const ledger=document.getElementById('thermal-experiment-ledger');
  ledger.replaceChildren();
  experiments.forEach((experiment,index)=>{
    const row=makeElement('article','experiment-row');
    const heading=makeElement('header');
    const sequence=makeElement('b',null,String(index+1).padStart(2,'0'));
    const title=makeElement('div');
    title.append(
      makeElement('strong',null,experiment.id),
      makeElement('span',null,experiment.role)
    );
    heading.append(sequence,title);

    const profile=makeElement('div','experiment-profile');
    profile.append(
      makeElement('small',null,'LOAD PROFILE'),
      makeElement('p',null,experiment.profile),
      makeElement('small',null,'INSTRUMENTATION'),
      makeElement('p',null,experiment.instrumentation)
    );

    const channels=makeElement('div','experiment-channels');
    channels.append(makeElement('small',null,'MEASURED CHANNELS'));
    const channelList=makeElement('ul');
    experiment.measured_channels.forEach(channel=>channelList.append(makeElement('li',null,channel)));
    channels.append(channelList);

    const outcome=makeElement('div','experiment-outcome');
    outcome.append(
      makeElement('small',null,'KEY RESULT'),
      makeElement('strong',null,experiment.key_result),
      makeElement('small',null,'FEEDS'),
      makeElement('p',null,experiment.used_by.join(' · '))
    );
    row.append(heading,profile,channels,outcome);
    ledger.append(row);
  });
}

function formatLineageMetric(value,unit){
  if(value===null||value===undefined)return 'NOT REPORTED';
  const decimals=unit.includes('°C')?2:1;
  if(Array.isArray(value))return `CPU ${value[0].toFixed(decimals)}${unit} · GPU ${value[1].toFixed(decimals)}${unit}`;
  return `${Number(value).toFixed(decimals)}${unit}`;
}

function renderModelLineage(models){
  const lineage=document.getElementById('thermal-model-lineage');
  lineage.replaceChildren();
  models.forEach(model=>{
    const card=makeElement('article','lineage-card');
    const heading=makeElement('header');
    heading.append(
      makeElement('span',null,model.id),
      makeElement('b',model.decision.startsWith('ACCEPTED')?'accepted':model.decision==='SUPERSEDED'?'superseded':'rejected',model.decision)
    );
    const name=makeElement('strong','lineage-name',model.name);
    const family=makeElement('p','lineage-family',model.family);

    const flow=makeElement('div','lineage-flow');
    const input=makeElement('div');
    input.append(makeElement('small',null,'INPUTS'),makeElement('span',null,model.inputs.join(' + ')));
    const states=makeElement('div');
    states.append(makeElement('small',null,'MODEL / STATES'),makeElement('span',null,model.states));
    const output=makeElement('div');
    output.append(makeElement('small',null,'OUTPUTS'),makeElement('span',null,model.outputs.join(' + ')));
    flow.append(input,makeElement('i',null,'→'),states,makeElement('i',null,'→'),output);

    const sources=makeElement('div','lineage-sources');
    const calibration=makeElement('p');
    calibration.append(makeElement('b',null,'CALIBRATION · '),document.createTextNode(model.calibration_source));
    const validation=makeElement('p');
    validation.append(makeElement('b',null,'HELD-OUT VALIDATION · '),document.createTextNode(model.validation_source));
    sources.append(calibration,validation);

    let plot=null;
    if(model.validation_plot){
      plot=makeElement('figure','lineage-plot');
      const plotImage=makeElement('img');
      plotImage.src=model.validation_plot;
      plotImage.alt=`Measured and modelled calibration/validation curves for ${model.name}`;
      plotImage.loading='lazy';
      const plotCaption=makeElement('figcaption',null,'MEASURED CURVE VS MODEL OUTPUT');
      plot.append(plotImage,plotCaption);
    }

    const metrics=makeElement('div','lineage-metrics');
    [
      ['CAL FIT',formatLineageMetric(model.calibration_fit_pct,'%')],
      ['CAL RMSE',formatLineageMetric(model.calibration_rmse_C,' °C')],
      ['VAL FIT',formatLineageMetric(model.validation_fit_pct,'%')],
      ['VAL RMSE',formatLineageMetric(model.validation_rmse_C,' °C')]
    ].forEach(([label,value])=>{
      const metric=makeElement('div');
      metric.append(makeElement('small',null,label),makeElement('strong',null,value));
      metrics.append(metric);
    });

    const verification=makeElement('p','lineage-verification');
    verification.append(makeElement('b',null,'VERIFICATION · '),document.createTextNode(model.verification));
    const authority=makeElement('p','lineage-authority');
    authority.append(makeElement('b',null,'PERMITTED USE · '),document.createTextNode(model.authority));
    card.append(heading,name,family,flow,sources);
    if(plot)card.append(plot);
    card.append(metrics,verification,authority);
    lineage.append(card);
  });
}

function renderThermalLab(data){
  const headline=data.headline_metrics;
  const board=data.motherboard_telemetry;
  document.getElementById('thermal-config').textContent=`${data.project.configuration_id} · SPINE ${data.configuration.case.spine_position}`;
  document.getElementById('thermal-ambient').textContent=`${data.project.ambient_C.toFixed(1)} °C AMBIENT`;
  document.getElementById('thermal-cpu').textContent=formatTemperature(headline.cpu_only.mean_temperature_C);
  document.getElementById('thermal-cpu-power').textContent=`${formatPower(headline.cpu_only.mean_power_W)} mean package`;
  document.getElementById('thermal-gpu').textContent=formatTemperature(headline.gpu_only.mean_temperature_C);
  document.getElementById('thermal-gpu-power').textContent=`${formatPower(headline.gpu_only.mean_power_W)} mean board`;
  document.getElementById('thermal-power').textContent=formatPower(headline.full_combined.mean_chip_power_W);
  document.getElementById('thermal-vrm').textContent=formatTemperature(board.full_combined.vrm_load_peak_C);
  document.getElementById('thermal-gpu-fit').textContent=`${data.model_quality.gpu_physical.validation_fit_pct.toFixed(1)}% FIT`;
  document.getElementById('thermal-cpu-fit').textContent=`${data.model_quality.cpu_physical.full_validation_fit_pct.toFixed(1)}% FIT`;

  const scenarios=document.getElementById('thermal-scenarios');
  scenarios.replaceChildren();
  const baselineScenario=data.configuration_screening.find(scenario=>scenario.configuration_id==='CFG-000');
  const baselinePeak=baselineScenario
    ?(baselineScenario.gpu_peak_model_low_C+baselineScenario.gpu_peak_model_high_C)/2
    :80.31;
  const confidenceLabels={
    medium:'medium',
    'medium-low':'medium-low',
    reference:'reference',
    'low for GPU; useful CPU experiment':'low for GPU'
  };
  data.configuration_screening.filter(scenario=>scenario.configuration_id!=='CFG-000').slice(0,6).forEach(scenario=>{
    const row=document.createElement('div');
    row.className='scenario-row';
    const label=document.createElement('div');
    const code=document.createElement('small');
    code.textContent=scenario.configuration_id;
    const name=document.createElement('strong');
    name.textContent=scenario.physical_change;
    const hypothesis=document.createElement('p');
    hypothesis.textContent=scenario.hypothesis||'Hypothesis pending physical validation.';
    const midpoint=(scenario.gpu_peak_model_low_C+scenario.gpu_peak_model_high_C)/2;
    const gain=Math.max(0,baselinePeak-midpoint);
    const meta=document.createElement('em');
    meta.textContent=`${confidenceLabels[scenario.evidence_confidence]||scenario.evidence_confidence} confidence · central improvement estimate ${gain.toFixed(1)} °C`;
    const risk=document.createElement('p');
    risk.className='scenario-risk';
    risk.textContent=`Risk: ${scenario.main_risk||'requires A/B validation'}`;
    label.append(code,name,hypothesis,meta,risk);
    const range=document.createElement('span');
    range.textContent=scenario.gpu_peak_model_low_C===scenario.gpu_peak_model_high_C
      ?formatTemperature(scenario.gpu_peak_model_low_C)
      :`${scenario.gpu_peak_model_low_C.toFixed(1)}–${scenario.gpu_peak_model_high_C.toFixed(1)} °C`;
    range.setAttribute('aria-label','Modelled GPU maximum-temperature interval');
    row.append(label,range);
    scenarios.append(row);
  });
  renderExperimentLedger(data.experimental_campaign||[]);
  renderModelLineage(data.model_lineage||[]);
}

async function loadThermalLab(){
  try{
    const response=await fetch('/control/data/terra-thermal-summary.json?v=20260805o',{credentials:'same-origin',headers:{accept:'application/json'}});
    if(!response.ok)throw new Error('thermal_data_unavailable');
    renderThermalLab(await response.json());
  }catch{
    document.getElementById('thermal-scenarios').textContent='Thermal dataset unavailable.';
  }
}

document.querySelectorAll('[data-thermal-view]').forEach(button=>button.addEventListener('click',()=>{
  document.querySelectorAll('[data-thermal-view]').forEach(peer=>{
    const active=peer===button;
    peer.classList.toggle('active',active);
    peer.setAttribute('aria-pressed',String(active));
  });
  document.querySelectorAll('[data-thermal-panel]').forEach(panel=>panel.classList.toggle('active',panel.dataset.thermalPanel===button.dataset.thermalView));
}));

restartButton.addEventListener('click',async()=>{
  if(!minecraftState?.agent?.connected)return;
  const approved=window.confirm('Force restart the Minecraft server now? The Java process will be terminated immediately. Connected players will be disconnected and unsaved data may be lost.');
  if(!approved)return;

  restartButton.disabled=true;
  commandFeedback.className='command-feedback';
  commandFeedback.textContent='QUEUEING HARD RESTART REQUEST…';

  try{
    const response=await fetch('/control/api/minecraft/restart',{
      method:'POST',
      credentials:'same-origin',
      headers:{
        'content-type':'application/json',
        'idempotency-key':crypto.randomUUID(),
        'x-csrf-token':csrfToken
      },
      body:'{}'
    });
    const data=await response.json();
    if(!response.ok)throw new Error(data.error||'request_failed');
    commandFeedback.textContent='RESTART QUEUED · WAITING FOR SERVER AGENT';
    setTimeout(refreshMinecraft,1200);
  }catch(error){
    commandFeedback.className='command-feedback error';
    commandFeedback.textContent=error.message==='agent_offline'
      ?'SERVER AGENT IS OFFLINE'
      :'RESTART REQUEST FAILED';
    restartButton.disabled=false;
  }
});

document.getElementById('sign-out').addEventListener('click',async()=>{
  try{
    await fetch('/control/api/auth/logout',{
      method:'POST',
      credentials:'same-origin',
      headers:{'x-csrf-token':csrfToken}
    });
  }finally{
    location.replace('/control/login');
  }
});

async function initialiseControl(){
  const session=await loadSession();
  if(!session){
    location.replace('/control/login');
    return;
  }
  applyAccess(session);
  showView(location.hash.slice(1)||'overview',false);
  if(hasCapability('minecraft:read')){
    await refreshMinecraft();
    setInterval(refreshMinecraft,10000);
  }
  if(hasCapability('thermal:read'))await loadThermalLab();
}

initialiseControl();
