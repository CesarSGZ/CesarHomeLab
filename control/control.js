const navItems=[...document.querySelectorAll('.nav-item')];
const views=[...document.querySelectorAll('.view')];
const sidebar=document.querySelector('.sidebar');
const menu=document.querySelector('.menu-toggle');
const backdrop=document.querySelector('.nav-backdrop');
function setMenuOpen(open){
  sidebar.classList.toggle('open',open);
  menu.setAttribute('aria-expanded',String(open));
  backdrop.hidden=!open;
  document.body.classList.toggle('navigation-open',open);
  sidebar.inert=innerWidth<=900&&!open;
  if(open)sidebar.querySelector('.nav-item:not([hidden])')?.focus();
}
backdrop.addEventListener('click',()=>{setMenuOpen(false);menu.focus()});
document.querySelector('.nav-close').addEventListener('click',()=>{setMenuOpen(false);menu.focus()});
document.addEventListener('keydown',event=>{
  if(!sidebar.classList.contains('open'))return;
  if(event.key==='Escape'){setMenuOpen(false);menu.focus()}
  if(event.key==='Tab'){
    const focusable=[...sidebar.querySelectorAll('a,button:not([hidden])')].filter(el=>el.offsetParent!==null);
    const first=focusable[0],last=focusable.at(-1);
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()}
  }
});
addEventListener('resize',()=>{if(innerWidth>900)setMenuOpen(false);else sidebar.inert=!sidebar.classList.contains('open')});
sidebar.inert=innerWidth<=900;
let allowedViews=new Set(['overview']);
let capabilities=new Set();
let accessProfile='standard';

function showView(id,push=true){
  const requested=allowedViews.has(id)?id:'overview';
  const next=document.getElementById(requested)||document.getElementById('overview');
  views.forEach(view=>view.classList.toggle('active',view===next));
  navItems.forEach(item=>item.classList.toggle('active',item.dataset.view===next.id));
  document.getElementById('view-code').textContent=`${next.dataset.title.toUpperCase()} · ${next.dataset.code}`;
  window.dispatchEvent(new CustomEvent('homelab:view',{detail:next.id}));
  if(push)history.replaceState(null,'',`#${next.id}`);
  const menuWasOpen=sidebar.classList.contains('open');
  setMenuOpen(false);
  navItems.forEach(item=>{if(item.classList.contains('active'))item.setAttribute('aria-current','page');else item.removeAttribute('aria-current')});
  if(push){window.scrollTo({top:0,behavior:'instant'});if(menuWasOpen){next.tabIndex=-1;next.focus({preventScroll:true})}}
}

navItems.forEach(item=>item.addEventListener('click',()=>showView(item.dataset.view)));
document.querySelectorAll('[data-open]').forEach(button=>button.addEventListener('click',()=>showView(button.dataset.open)));
menu.addEventListener('click',()=>setMenuOpen(!sidebar.classList.contains('open')));

const clock=document.getElementById('system-time');
function tick(){clock.textContent=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Madrid',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(new Date())+' CET'}
tick();setInterval(tick,1000);

const canvas=document.getElementById('control-grid'),ctx=canvas.getContext('2d');
function drawGrid(){const d=devicePixelRatio||1;canvas.width=innerWidth*d;canvas.height=innerHeight*d;ctx.setTransform(d,0,0,d,0,0);ctx.clearRect(0,0,innerWidth,innerHeight);ctx.strokeStyle='rgba(82,217,255,.12)';ctx.lineWidth=.5;for(let x=0;x<innerWidth;x+=48){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,innerHeight);ctx.stroke()}for(let y=0;y<innerHeight;y+=48){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(innerWidth,y);ctx.stroke()}}
addEventListener('resize',drawGrid);drawGrid();

let csrfToken='';

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
    overviewIntro.textContent='One private entry point for services, experiments and operational tools running across Cesar HomeLab.';
    accessSummary.textContent=`OWNER ACCESS · ${allowedViews.size-1} MODULES`;
  }else{
    overviewIntro.textContent='A simple, focused home. Shared tools will appear here when they are assigned to your account.';
    accessSummary.textContent='STANDARD ACCESS';
  }

  document.body.classList.remove('access-pending');
}

function formatTemperature(value){return `${Number(value).toFixed(1)} °C`}
function formatPower(value){return `${Number(value).toFixed(0)} W`}

function makeElement(tag,className,text){
  const element=document.createElement(tag);
  if(className)element.className=className;
  if(text!==undefined)element.textContent=text;
  return element;
}

// Plain-language reading of each model; the numbers come from the dataset.
const thermalModelNotes={
  'MDL-GPU-PHY-02':{title:'GPU model',verdict:'Trusted for ranking ideas',tone:'ok',why:'Predicted a GPU test it had never seen, about 3 °C off on average. Good enough to compare airflow ideas, not yet to promise exact temperatures.'},
  'MDL-CPU-PHY-02':{title:'CPU model',verdict:'Not trusted yet',tone:'no',why:'Matches CPU-only load, but runs too hot when the GPU also heats the shared air. Nothing measures that air yet.'},
  'MDL-SYS-MIMO-02':{title:'CPU + GPU together',verdict:'Diagnostic only',tone:'no',why:'CPU and GPU load rose together in the tests, so it cannot tell which one caused what. It shows exactly which tests are missing.'},
  'MDL-GPU-EMP-02':{title:'First GPU model',verdict:'Replaced',tone:'old',why:'A pure curve fit with no physics inside. It worked, but the physical model beat it on every score.'}
};

function thermalBar(label,value,max,text){
  const row=makeElement('div','tl-bar');
  const track=makeElement('i');
  track.style.setProperty('--w',`${Math.max(0,Math.min(100,value/max*100))}%`);
  row.append(makeElement('span',null,label),track,makeElement('b',null,text));
  return row;
}

function renderThermalLoads(headline,board){
  const loads=document.getElementById('tl-loads');
  const chipRow=(label,peak)=>thermalBar(label,peak-20,80,formatTemperature(peak));
  const cards=[
    ['CPU ONLY',headline.cpu_only.mean_power_W,[chipRow('CPU peak',headline.cpu_only.peak_temperature_C)],`Average under load ${formatTemperature(headline.cpu_only.mean_temperature_C)}`],
    ['GPU ONLY',headline.gpu_only.mean_power_W,[chipRow('GPU peak',headline.gpu_only.peak_temperature_C)],`Average under load ${formatTemperature(headline.gpu_only.mean_temperature_C)}`],
    ['BOTH AT ONCE · 15 S',headline.full_combined.mean_chip_power_W,[chipRow('CPU peak',headline.full_combined.cpu_peak_temperature_C),chipRow('GPU peak',headline.full_combined.gpu_peak_temperature_C)],`Board power stage peaked at ${formatTemperature(board.full_combined.vrm_load_peak_C)}`]
  ];
  loads.replaceChildren(...cards.map(([label,power,rows,note])=>{
    const card=makeElement('article','tl-load');
    const head=makeElement('header');
    head.append(makeElement('small',null,label),makeElement('strong',null,formatPower(power)));
    card.append(head,...rows,makeElement('p',null,note));
    return card;
  }));
}

function renderThermalScores(models){
  const scores=document.getElementById('tl-scores');
  const order=['MDL-GPU-PHY-02','MDL-CPU-PHY-02','MDL-SYS-MIMO-02','MDL-GPU-EMP-02'];
  const sorted=[...models].sort((a,b)=>order.indexOf(a.id)-order.indexOf(b.id));
  scores.replaceChildren(...sorted.map(model=>{
    const note=thermalModelNotes[model.id]||{title:model.name,verdict:model.decision,tone:'old',why:model.authority};
    const card=makeElement('article',`tl-score ${note.tone}`);
    const head=makeElement('header');
    head.append(makeElement('strong',null,note.title),makeElement('b',null,note.verdict));
    card.append(head);
    const fits=[].concat(model.validation_fit_pct);
    const errors=[].concat(model.validation_rmse_C);
    fits.forEach((fit,index)=>{
      const prefix=fits.length>1?`${index?'GPU':'CPU'} · `:'';
      card.append(
        thermalBar(`${prefix}shape match`,fit,100,`${fit.toFixed(0)}%`),
        thermalBar(`${prefix}typical error`,errors[index],10,`${errors[index].toFixed(1)} °C`)
      );
    });
    card.append(makeElement('p',null,note.why));
    if(model.validation_plot&&model.id!=='MDL-GPU-PHY-02'){
      const more=makeElement('details','tl-curves');
      const image=makeElement('img');
      image.src=model.validation_plot;
      image.alt=`Measured temperature against the ${note.title} prediction`;
      image.loading='lazy';
      more.append(makeElement('summary',null,'See the curves'),image);
      card.append(more);
    }
    return card;
  }));
}

function renderThermalRanking(screening){
  const rank=document.getElementById('tl-rank');
  const baseline=screening.find(item=>item.configuration_id==='CFG-000');
  const baselinePeak=baseline?baseline.gpu_peak_model_low_C:80.31;
  const ideas=screening
    .filter(item=>item.configuration_id!=='CFG-000')
    .map(item=>({...item,mid:(item.gpu_peak_model_low_C+item.gpu_peak_model_high_C)/2}))
    .sort((a,b)=>a.mid-b.mid);
  const lo=Math.floor(Math.min(...ideas.map(item=>item.gpu_peak_model_low_C)))-.5;
  const hi=Math.ceil(Math.max(baselinePeak,...ideas.map(item=>item.gpu_peak_model_high_C)))+.5;
  const at=value=>`${(value-lo)/(hi-lo)*100}%`;

  const axis=makeElement('div','tl-rank-axis');
  const scale=makeElement('div','tl-rank-scale');
  for(let tick=Math.ceil(lo);tick<=hi;tick++){
    const label=makeElement('span',null,`${tick}°`);
    label.style.left=at(tick);
    scale.append(label);
  }
  const today=makeElement('em',null,`Today ${baselinePeak.toFixed(1)} °C`);
  today.style.left=at(baselinePeak);
  scale.append(today);
  axis.append(makeElement('span'),scale,makeElement('span'));

  const rows=ideas.map((idea,index)=>{
    const row=makeElement('details',`tl-rank-row conf-${idea.evidence_confidence.split(/[ ;]/)[0]}`);
    const summary=makeElement('summary');
    const name=makeElement('div','tl-rank-name');
    name.append(makeElement('strong',null,idea.physical_change),makeElement('small',null,`${idea.configuration_id}${index===0?' · TOP PICK':''}`));
    const track=makeElement('div','tl-rank-track');
    const range=makeElement('i');
    range.style.left=at(idea.gpu_peak_model_low_C);
    range.style.width=`calc(${at(idea.gpu_peak_model_high_C)} - ${at(idea.gpu_peak_model_low_C)})`;
    const marker=makeElement('b');
    marker.style.left=at(baselinePeak);
    track.append(marker,range);
    const value=makeElement('div','tl-rank-value');
    value.append(
      makeElement('strong',null,`${idea.gpu_peak_model_low_C.toFixed(1)}–${idea.gpu_peak_model_high_C.toFixed(1)} °C`),
      makeElement('small',null,`≈ −${Math.max(0,baselinePeak-idea.mid).toFixed(1)} °C`)
    );
    summary.append(name,track,value);
    const more=makeElement('div','tl-rank-more');
    [['Idea',idea.hypothesis],['Risk',idea.main_risk],['Confidence',idea.evidence_confidence]].forEach(([label,text])=>{
      const line=makeElement('p');
      line.append(makeElement('b',null,`${label} · `),document.createTextNode(text));
      more.append(line);
    });
    row.append(summary,more);
    return row;
  });
  rank.replaceChildren(axis,...rows);
}

function renderThermalLedger(experiments){
  const body=document.querySelector('#tl-ledger tbody');
  body.replaceChildren(...experiments.map((experiment,index)=>{
    const row=makeElement('tr');
    const stamp=experiment.id.match(/^EXP-\d{8}-(\d{2})(\d{2})\d{2}-/);
    const test=makeElement('td');
    test.append(
      makeElement('strong',null,experiment.id.replace(/^EXP-(\d{8}-\d{6}-)?/,'').replace(/-/g,' ')),
      makeElement('small',null,stamp?`4 Aug · ${stamp[1]}:${stamp[2]}`:'4 Aug')
    );
    row.append(makeElement('td',null,String(index+1)),test,makeElement('td',null,experiment.profile),makeElement('td',null,experiment.role),makeElement('td',null,experiment.key_result));
    return row;
  }));
}

function renderThermalLab(data){
  const ambient=data.project.ambient_C.toFixed(1);
  const models=data.model_lineage||[];
  document.getElementById('tl-test-count').textContent=String((data.experimental_campaign||[]).length);
  document.getElementById('tl-model-count').textContent=String(models.length);
  document.getElementById('tl-valid-count').textContent=String(models.filter(model=>model.decision.startsWith('ACCEPTED')).length);
  document.getElementById('tl-config').textContent=`${data.project.configuration_id} baseline · ${ambient} °C room`;
  document.getElementById('tl-ambient').textContent=`${ambient} °C, held fixed`;
  renderThermalLoads(data.headline_metrics,data.motherboard_telemetry);
  renderThermalScores(models);
  renderThermalRanking(data.configuration_screening||[]);
  renderThermalLedger(data.experimental_campaign||[]);
}

async function loadThermalLab(){
  try{
    const response=await fetch('/control/data/terra-thermal-summary.json?v=20260805o',{credentials:'same-origin',headers:{accept:'application/json'}});
    if(!response.ok)throw new Error('thermal_data_unavailable');
    renderThermalLab(await response.json());
  }catch{
    document.querySelectorAll('#thermal .tl-loading').forEach(element=>{element.textContent='Thermal dataset unavailable.'});
  }
}

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
  if(hasCapability('doors:play'))window.DoorsGame?.initialise(csrfToken,session.user);
  showView(location.hash.slice(1)||'overview',false);
  if(hasCapability('github:read'))window.GitHubGalaxy?.initialise();
  if(hasCapability('training:read'))window.TrainingLab?.initialise(csrfToken);
  if(hasCapability('servercesar:read')){window.ServerCesarPending={csrf:csrfToken,canWake:hasCapability('servercesar:wake')};window.ServerCesar?.initialise(csrfToken,hasCapability('servercesar:wake'))}
  if(hasCapability('backtest:read')){window.BacktestLabPending=csrfToken;window.BacktestLab?.initialise(csrfToken)}
  if(hasCapability('thermal:read'))await loadThermalLab();
}

initialiseControl();
