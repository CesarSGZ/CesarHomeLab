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

let ebayState=null;
const money=value=>new Intl.NumberFormat('en-IE',{style:'currency',currency:'EUR'}).format((Number(value)||0)/100);
const ebayFeedback=document.getElementById('ebay-feedback');

function ebayText(id,value){const element=document.getElementById(id);if(element)element.textContent=value}
function shortDate(value){return value?new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}).format(new Date(Number(value))):'Not yet'}
function ebayBadge(text){const badge=makeElement('span',`ebay-badge ${String(text).replace(/[^a-z]+/gi,'-').toLowerCase()}`,String(text).replaceAll('_',' '));return badge}
function actionButton(label,action,id,disabled=false){const button=makeElement('button','ebay-action',label);button.type='button';button.dataset.ebayAction=action;button.dataset.id=id;button.disabled=disabled;return button}

function renderEbayOpportunities(rows){
  const container=document.getElementById('ebay-opportunity-list');
  container.replaceChildren();
  const pending=rows.filter(row=>row.status==='pending');
  ebayText('ebay-opportunities-count',String(pending.length));
  if(!pending.length){container.append(makeElement('p','panel-loading','No verified product opportunities yet. Import a real supplier product to begin.'));return}
  pending.forEach(row=>{
    const card=makeElement('article','opportunity-card');
    const headline=makeElement('div','opportunity-headline');
    const title=makeElement('div');
    const source=String(row.data_source||'manual').replaceAll('_',' ').toUpperCase();
    title.append(makeElement('small',null,`${row.provider_name} · ${source} · ${row.category||'Uncategorised'}`),makeElement('strong',null,row.title));
    headline.append(title,ebayBadge(`${row.match_confidence}% input confidence`));
    const metrics=makeElement('div','opportunity-metrics');
    [['TARGET SALE',money(row.estimated_sale_cents)],['LANDED COST',money(Number(row.supplier_cost_cents)+Number(row.shipping_cost_cents))],['EST. PROFIT',money(row.estimated_profit_cents)],['EST. ROI',`${(Number(row.roi_basis_points)/100).toFixed(1)}%`],['SOURCE STOCK',String(row.stock_quantity??'—')]].forEach(([label,value])=>{const metric=makeElement('span');metric.append(makeElement('small',null,label),makeElement('b',null,value));metrics.append(metric)});
    const actions=makeElement('div','opportunity-actions');
    actions.append(actionButton('Approve','approve',row.id),actionButton('Reject','reject',row.id));
    card.append(headline,metrics,actions);container.append(card);
  });
}

function makeTable(headers,rows){
  const table=document.createElement('table');
  const head=document.createElement('thead');const headRow=document.createElement('tr');
  headers.forEach(header=>headRow.append(makeElement('th',null,header)));head.append(headRow);table.append(head);
  const body=document.createElement('tbody');rows.forEach(cells=>{const row=document.createElement('tr');cells.forEach(cell=>{const td=document.createElement('td');if(cell instanceof Node)td.append(cell);else td.textContent=cell;row.append(td)});body.append(row)});table.append(body);return table;
}

function renderEbayListings(rows){
  const container=document.getElementById('ebay-listings');container.replaceChildren();
  const approved=ebayState.opportunities.filter(row=>row.status==='approved');
  if(approved.length){
    const generator=makeElement('div','draft-generator');
    generator.append(makeElement('strong',null,'Approved products ready for a local draft'));
    const choices=makeElement('div');
    approved.forEach(row=>{const option=makeElement('div','draft-option');option.append(makeElement('span',null,row.title),actionButton('Generate draft','generate',row.id));choices.append(option)});
    generator.append(choices);container.append(generator);
  }
  if(!rows.length){container.append(makeElement('p','panel-loading','No eBay listings yet. Listings will appear only after a real product is reviewed and a local draft is generated.'));return}
  const tableRows=rows.map(row=>{
    const product=makeElement('div','table-product');product.append(makeElement('strong',null,row.title),makeElement('small',null,`${row.sku} · ${row.provider_name}`));
    const status=ebayBadge(row.listing_status);
    const actions=makeElement('div','table-actions');
    if(row.listing_status==='ready_to_publish')actions.append(actionButton('Publish to eBay','publish',row.id,!ebayState.connection.publishingEnabled));
    else actions.append(makeElement('small','table-muted',row.listing_status==='active'?'Monitoring enabled':'No action'));
    return [product,money(row.price_cents),String(row.quantity),status,shortDate(row.monitored_at),actions];
  });
  container.append(makeTable(['PRODUCT','PRICE','STOCK','STATUS','LAST CHECK','ACTION'],tableRows));
}

function renderEbayOrders(rows){
  const container=document.getElementById('ebay-orders');container.replaceChildren();
  const toolbar=makeElement('div','data-toolbar');toolbar.append(makeElement('span',null,'eBay Fulfillment + Finances APIs'),actionButton('Sync orders & earnings','sync-orders','orders',!ebayState.connection.ebayConnected));container.append(toolbar);
  if(!rows.length){container.append(makeElement('p','panel-loading','No eBay orders yet. Orders will appear only after the seller connection is approved and a real checkout is synced.'));return}
  container.append(makeTable(['ORDER','LISTING','STATUS','SALE','EBAY FINANCE','ACTUAL COSTS','REALISED NET','ORDERED','ACTION'],rows.map(row=>{
    const finance=row.financial_status==='reconciled'?ebayBadge('reconciled'):ebayBadge('pending finances');
    const costs=row.costs_confirmed_at?money(Number(row.product_cost_cents)+Number(row.shipping_cost_cents)):ebayBadge('pending costs');
    const realised=row.financial_status==='reconciled'&&row.costs_confirmed_at?money(Number(row.ebay_earnings_cents)-Number(row.product_cost_cents)-Number(row.shipping_cost_cents)):'—';
    const action=actionButton(row.costs_confirmed_at?'Update costs':'Record actual costs','record-costs',row.id);
    return [`…${String(row.id).slice(-12)}`,row.title||'Listing unavailable',ebayBadge(row.order_status),money(row.sale_cents),finance,costs,realised,shortDate(row.ordered_at),action];
  })));
}

function renderEbayPnl(rows){
  const container=document.getElementById('ebay-pnl');container.replaceChildren();
  const realised=rows.filter(row=>row.financial_status==='reconciled'&&row.costs_confirmed_at);
  const totals=realised.reduce((total,row)=>{total.sales+=Number(row.sale_cents);total.ebayEarnings+=Number(row.ebay_earnings_cents);total.costs+=Number(row.product_cost_cents)+Number(row.shipping_cost_cents);return total},{sales:0,ebayEarnings:0,costs:0});
  const deductions=totals.sales-totals.ebayEarnings;
  const net=totals.ebayEarnings-totals.costs;
  [['SYNCED GROSS SALES',money(totals.sales),'Gross amount returned by eBay Finances'],['EBAY DEDUCTIONS',money(deductions),'Fees, refunds and other eBay expenses'],['CONFIRMED SUPPLIER COSTS',money(totals.costs),'Manually confirmed product and delivery cost'],['REALISED NET',money(net),realised.length?`${realised.length} fully reconciled order${realised.length===1?'':'s'} · before tax`:'No fully reconciled sales yet']].forEach(([label,value,copy])=>{const card=makeElement('article','pnl-card');card.append(makeElement('small',null,label),makeElement('strong',null,value),makeElement('p',null,copy));container.append(card)});
}

function renderEbayMonitoring(listings,providers){
  const container=document.getElementById('ebay-monitoring');container.replaceChildren();
  const monitored=listings.filter(item=>item.listing_status==='active');
  const stockRisks=monitored.filter(item=>Number(item.quantity)<5);
  const cards=[['LISTINGS WATCHED',String(monitored.length),'Active listings are checked against their source quantity and expected price.'],['STOCK RISKS',String(stockRisks.length),stockRisks.length?'Pause or replenish before the next sale.':'No active listing is below the safety threshold.'],['CATALOGUE FEEDS',`${providers.filter(item=>item.connection_status==='connected').length}/${providers.length}`,'A connected source is required before stock and cost monitoring can run live.']];
  cards.forEach(([label,value,copy])=>{const card=makeElement('article','monitor-card');card.append(makeElement('small',null,label),makeElement('strong',null,value),makeElement('p',null,copy));container.append(card)});
  const note=makeElement('p','monitor-note',monitored.length?(ebayState.connection.ebayConnected?'Active listings are ready for real stock and price checks.':'Active local records exist, but live eBay monitoring requires seller OAuth.'):'No active eBay listings to monitor. Nothing simulated is shown.');container.append(note);
}

function renderEbaySettings(providers,credentials){
  const container=document.getElementById('ebay-settings');container.replaceChildren();
  const requirements=[
    ['eBay seller connection','ebay_sell_api','Developer account approval, production Client ID/Secret, RuName redirect URL, seller OAuth consent and a verified payout bank account.'],
    ['Supplier catalogue','supplier_catalogue','One approved supplier account plus API key or CSV/XML/JSON feed URL.'],
    ['Order fulfilment','order_fulfilment','Supplier ordering API credentials, or a documented manual-order process for the MVP.']
  ];
  requirements.forEach(([title,service,copy])=>{
    const credential=credentials.find(item=>item.service===service);const card=makeElement('article','setting-card');const status=credential?.connection_status||'not_connected';
    card.append(makeElement('small',null,'REQUIRED CONNECTION'),makeElement('strong',null,title),ebayBadge(status),makeElement('p',null,copy));
    if(service==='ebay_sell_api'){
      const button=actionButton(ebayState.connection.ebayConnected?'Reconnect seller':'Connect seller OAuth','connect-ebay','ebay',!ebayState.connection.ebayAppConfigured);
      card.append(button);
      if(!ebayState.connection.ebayAppConfigured)card.append(makeElement('small','setting-hint','Add EBAY_CLIENT_ID, EBAY_CLIENT_SECRET, EBAY_RUNAME and TOKEN_ENCRYPTION_SECRET.'));
    }
    if(service==='supplier_catalogue'){
      const button=actionButton(ebayState.connection.bigbuyApiConfigured?'Scan BigBuy catalogue':'Use free import','sync-bigbuy','bigbuy',false);
      card.append(button);
      if(!ebayState.connection.bigbuyApiConfigured)card.append(makeElement('small','setting-hint','Free-account mode is active: enter products below. No subscription or API pack is required.'));
    }
    container.append(card)
  });
  if(!ebayState.connection.bigbuyApiConfigured){
    const starter=makeElement('article','provider-panel starter-import');
    starter.id='ebay-bigbuy-starter';
    starter.append(makeElement('small',null,'BIGBUY · FREE ACCOUNT'),makeElement('strong',null,'Import one catalogue product'));
    starter.append(makeElement('p','starter-copy','Copy the SKU, EAN, distributor price and recommended price from a BigBuy product page. Mission Control calculates the estimated eBay fee, profit and ROI; nothing is ordered or published.'));
    const form=document.createElement('form');form.id='ebay-bigbuy-import-form';form.className='starter-form';
    const fields=[
      ['sku','BigBuy SKU','text','V0710251',true],['ean','EAN / GTIN','text','8715946670362',false],['title','Product title','text','Product name',true],
      ['brand','Brand','text','Optional',false],['category','Category','text','Computing',false],['cost','Distributor cost (€)','number','97.53',true],
      ['salePrice','Expected eBay price (€)','number','149.99',true],['shipping','Estimated delivery (€)','number','4.95',false],['stock','Available units','number','1',false]
    ];
    const grid=makeElement('div','starter-fields');
    fields.forEach(([name,label,type,placeholder,required])=>{const wrapper=makeElement('label');wrapper.append(makeElement('span',null,label));const input=document.createElement('input');input.name=name;input.type=type;input.placeholder=placeholder;if(required)input.required=true;if(type==='number'){input.min='0';input.step=name==='stock'?'1':'0.01'}wrapper.append(input);grid.append(wrapper)});
    const submit=actionButton('Calculate & add to queue','manual-import','bigbuy');submit.type='submit';
    form.append(grid,submit);starter.append(form);container.append(starter);
  }
  const providerPanel=makeElement('article','provider-panel');providerPanel.append(makeElement('small',null,'PROVIDERS'),makeElement('strong',null,'Supplier workspace'));
  providers.forEach(provider=>{const row=makeElement('div','provider-row');row.append(makeElement('span',null,provider.name),ebayBadge(provider.connection_status));providerPanel.append(row)});container.append(providerPanel);
}

function renderEbay(data){
  ebayState=data;
  const connected=data.connection.ebayConnected;
  document.querySelectorAll('[data-ebay-connection-dot]').forEach(dot=>dot.classList.toggle('online',connected));
  document.querySelectorAll('[data-ebay-connection-label]').forEach(label=>label.textContent=connected?'EBAY CONNECTED':'SETUP · NO LIVE SYNC');
  ebayText('ebay-mode',data.mode.toUpperCase());ebayText('ebay-last-sync',`LAST SYNC · ${shortDate(data.connection.lastSync)}`);
  ebayText('ebay-kpi-opportunities',String(data.summary.pendingOpportunities));ebayText('ebay-kpi-listings',String(data.summary.activeListings));ebayText('ebay-kpi-orders',String(data.summary.openOrders));ebayText('ebay-kpi-profit',money(data.summary.netProfitCents));
  document.querySelectorAll('[data-ebay-pending-count]').forEach(element=>element.textContent=data.summary.pendingOpportunities);
  document.querySelectorAll('[data-ebay-active-count]').forEach(element=>element.textContent=data.summary.activeListings);
  document.querySelectorAll('[data-ebay-today-profit]').forEach(element=>element.textContent=money(data.summary.netProfitCents));
  ebayText('ebay-connection-title',connected?'eBay publishing is connected.':'Connections still required.');
  ebayText('ebay-connection-copy',connected?'Publishing remains gated until the production switch is deliberately enabled.':'Developer approval and production OAuth are still pending. No listing, order or payment request can be sent.');
  renderEbayOpportunities(data.opportunities);renderEbayListings(data.listings);renderEbayOrders(data.orders);renderEbayPnl(data.orders);renderEbayMonitoring(data.listings,data.providers);renderEbaySettings(data.providers,data.credentials);
}

async function loadEbay(){
  try{
    const response=await fetch('/control/api/ebay/status',{credentials:'same-origin',headers:{accept:'application/json'}});if(!response.ok)throw new Error('status_unavailable');renderEbay(await response.json());
    const result=new URLSearchParams(location.search).get('ebay_connection');
    if(result){ebayFeedback.textContent=result==='connected'?'eBay seller connection completed.':'eBay connection did not complete: '+result.replaceAll('-',' ');ebayFeedback.className=result==='connected'?'ebay-feedback success':'ebay-feedback error'}
  }catch{ebayFeedback.textContent='eBay data is unavailable. Apply the marketplace database migration and refresh.';ebayFeedback.className='ebay-feedback error'}
}

async function ebayRequest(url,body){
  const response=await fetch(url,{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json','x-csrf-token':csrfToken},body:JSON.stringify(body||{})});
  const data=await response.json();if(!response.ok)throw new Error(data.detail||data.error||'request_failed');return data;
}

document.getElementById('ebay-refresh').addEventListener('click',loadEbay);
document.getElementById('ebay-opportunity-list').addEventListener('click',async event=>{
  const button=event.target.closest('[data-ebay-action]');if(!button)return;button.disabled=true;
  try{if(button.dataset.ebayAction==='approve'||button.dataset.ebayAction==='reject'){await ebayRequest(`/control/api/ebay/opportunities/${encodeURIComponent(button.dataset.id)}`,{action:button.dataset.ebayAction});ebayFeedback.textContent=`Opportunity ${button.dataset.ebayAction}d. ${button.dataset.ebayAction==='approve'?'Generate a listing draft from Listings when ready.':''}`;ebayFeedback.className='ebay-feedback success';await loadEbay()}}catch(error){ebayFeedback.textContent=error.message;ebayFeedback.className='ebay-feedback error';button.disabled=false}
});
document.getElementById('ebay-listings').addEventListener('click',async event=>{
  const button=event.target.closest('[data-ebay-action]');if(!button)return;button.disabled=true;
  try{
    if(button.dataset.ebayAction==='generate'){
      const result=await ebayRequest('/control/api/ebay/listings/generate',{opportunityId:button.dataset.id});
      ebayFeedback.textContent=result.duplicate?'A draft for this product already exists.':'Draft created locally. No eBay listing has been published.';ebayFeedback.className='ebay-feedback success';
    }else await ebayRequest(`/control/api/ebay/listings/${encodeURIComponent(button.dataset.id)}/publish`);
    await loadEbay()
  }catch(error){ebayFeedback.textContent=error.message;ebayFeedback.className='ebay-feedback error';button.disabled=false}
});
document.getElementById('ebay-settings').addEventListener('click',async event=>{
  const button=event.target.closest('[data-ebay-action]');if(!button)return;button.disabled=true;
  if(button.dataset.ebayAction==='manual-import'){button.disabled=false;return}
  try{
    if(button.dataset.ebayAction==='connect-ebay'){
      const result=await ebayRequest('/control/api/ebay/oauth/start');
      location.assign(result.authorizeUrl);return;
    }
    if(button.dataset.ebayAction==='sync-bigbuy'){
      if(!ebayState.connection.bigbuyApiConfigured){document.getElementById('ebay-bigbuy-starter')?.scrollIntoView({behavior:'smooth',block:'center'});document.querySelector('#ebay-bigbuy-import-form input')?.focus();button.disabled=false;return}
      ebayFeedback.textContent='Scanning the first BigBuy catalogue page and comparing eligible GTINs…';ebayFeedback.className='ebay-feedback';
      const result=await ebayRequest('/control/api/ebay/bigbuy/sync');
      ebayFeedback.textContent=`BigBuy scan complete: ${result.scannedCount} products checked, ${result.opportunityCount} opportunities retained.`;ebayFeedback.className='ebay-feedback success';
      await loadEbay();
    }
  }catch(error){ebayFeedback.textContent=error.message;ebayFeedback.className='ebay-feedback error';button.disabled=false}
});
document.getElementById('ebay-settings').addEventListener('submit',async event=>{
  if(event.target.id!=='ebay-bigbuy-import-form')return;
  event.preventDefault();
  const form=event.target;const button=form.querySelector('[data-ebay-action="manual-import"]');button.disabled=true;
  const product=Object.fromEntries(new FormData(form).entries());
  try{
    const result=await ebayRequest('/control/api/ebay/bigbuy/import',{products:[product]});
    ebayFeedback.textContent=`BigBuy product added: ${result.imported} opportunity ready for review. No order or listing was sent.`;ebayFeedback.className='ebay-feedback success';
    form.reset();await loadEbay();
  }catch(error){ebayFeedback.textContent=error.message;ebayFeedback.className='ebay-feedback error';button.disabled=false}
});
document.getElementById('ebay-orders').addEventListener('click',async event=>{
  const button=event.target.closest('[data-ebay-action]');if(!button)return;button.disabled=true;
  try{
    if(button.dataset.ebayAction==='sync-orders'){
      const result=await ebayRequest('/control/api/ebay/orders/sync');
      ebayFeedback.textContent=`Order sync complete: ${result.imported} refreshed, ${result.reconciled} financially reconciled.`;
    }else if(button.dataset.ebayAction==='record-costs'){
      const row=ebayState.orders.find(item=>item.id===button.dataset.id);
      const productCost=window.prompt('Actual supplier product cost (€)',(Number(row?.product_cost_cents||0)/100).toFixed(2));
      if(productCost===null){button.disabled=false;return}
      const shippingCost=window.prompt('Actual supplier delivery cost (€)',(Number(row?.shipping_cost_cents||0)/100).toFixed(2));
      if(shippingCost===null){button.disabled=false;return}
      await ebayRequest(`/control/api/ebay/orders/${encodeURIComponent(button.dataset.id)}/costs`,{productCost,shippingCost});
      ebayFeedback.textContent='Actual supplier costs recorded. The order will enter realised P&L once eBay finances are reconciled.';
    }
    ebayFeedback.className='ebay-feedback success';await loadEbay();
  }catch(error){ebayFeedback.textContent=error.message;ebayFeedback.className='ebay-feedback error';button.disabled=false}
});
document.querySelectorAll('[data-ebay-tab]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-ebay-tab]').forEach(item=>{const active=item===button;item.classList.toggle('active',active);item.setAttribute('aria-selected',String(active))});document.querySelectorAll('[data-ebay-panel]').forEach(panel=>panel.classList.toggle('active',panel.dataset.ebayPanel===button.dataset.ebayTab))}));

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
  if(hasCapability('ebay:read'))await loadEbay();
}

initialiseControl();
