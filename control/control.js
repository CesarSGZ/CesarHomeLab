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
let portfolioState=null;
let portfolioLoading=false;

const moneyFormatter=new Intl.NumberFormat('en-GB',{
  style:'currency',
  currency:'EUR',
  minimumFractionDigits:0,
  maximumFractionDigits:0
});
const preciseMoneyFormatter=new Intl.NumberFormat('en-GB',{
  style:'currency',
  currency:'EUR',
  minimumFractionDigits:2,
  maximumFractionDigits:2
});
const numberFormatter=new Intl.NumberFormat('en-GB',{maximumFractionDigits:4});

function money(value,{precise=false}={}){
  if(!Number.isFinite(value))return '€ —';
  return (precise?preciseMoneyFormatter:moneyFormatter).format(value);
}

function signedMoney(value){
  if(!Number.isFinite(value))return '€ —';
  return `${value>=0?'+':'−'}${money(Math.abs(value))}`;
}

function signedPercent(value){
  if(!Number.isFinite(value))return '—%';
  return `${value>=0?'+':'−'}${Math.abs(value).toFixed(2)}%`;
}

function dateLabel(timestamp){
  if(!timestamp)return 'UNKNOWN';
  return new Intl.DateTimeFormat('en-GB',{
    day:'2-digit',
    month:'short',
    year:'numeric',
    timeZone:'Europe/Madrid'
  }).format(new Date(timestamp)).toUpperCase();
}

function escapeHtml(value){
  return String(value??'').replace(/[&<>"']/g,character=>({
    '&':'&amp;',
    '<':'&lt;',
    '>':'&gt;',
    '"':'&quot;',
    "'":'&#039;'
  })[character]);
}

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
    overviewIntro.textContent='Your complete private operating system. Every personal module is available and ready to be connected to real data.';
    accessSummary.textContent='FULL ACCESS · 7 MODULES';
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

function valueTone(element,value){
  element.classList.toggle('positive',Number(value)>0);
  element.classList.toggle('negative',Number(value)<0);
}

function renderPortfolio(data){
  portfolioState=data;
  const {summary,positions,categories,recentTransactions,freshness}=data;
  const total=document.getElementById('portfolio-total');
  const dayChange=document.getElementById('portfolio-day-change');
  const totalResult=document.getElementById('portfolio-total-result');
  const unrealised=document.getElementById('portfolio-unrealised');

  total.textContent=money(summary.totalValue,{precise:true});
  dayChange.textContent=`${signedMoney(summary.dayChange)} · ${signedPercent(summary.dayChangePercent)} today`;
  totalResult.textContent=`${signedMoney(summary.totalResult)} · ${signedPercent(summary.totalResultPercent)} all time`;
  valueTone(dayChange,summary.dayChange);
  valueTone(totalResult,summary.totalResult);

  document.getElementById('portfolio-invested').textContent=money(summary.investedValue);
  document.getElementById('portfolio-cash').textContent=money(summary.cash);
  document.getElementById('portfolio-count').textContent=`${summary.positionCount} current positions`;
  unrealised.textContent=signedMoney(summary.unrealisedGain);
  valueTone(unrealised,summary.unrealisedGain);
  const unrealisedPercent=document.getElementById('portfolio-unrealised-percent');
  unrealisedPercent.textContent=signedPercent(summary.unrealisedGainPercent);
  valueTone(unrealisedPercent,summary.unrealisedGainPercent);
  document.getElementById('portfolio-contributions').textContent=money(summary.netContributions);

  document.querySelectorAll('[data-overview-total]').forEach(element=>{element.textContent=money(summary.totalValue,{precise:true})});
  document.querySelectorAll('[data-overview-positions]').forEach(element=>{element.textContent=String(summary.positionCount)});
  document.querySelectorAll('[data-overview-invested]').forEach(element=>{element.textContent=money(summary.investedValue)});
  document.querySelectorAll('[data-overview-cash]').forEach(element=>{element.textContent=money(summary.cash)});
  const overviewChange=document.querySelector('[data-overview-change]');
  overviewChange.textContent=`${signedMoney(summary.dayChange)} today · ${signedPercent(summary.totalResultPercent)} since net contributions`;
  valueTone(overviewChange,summary.dayChange);

  const liveLabel=`${freshness.liveQuotes}/${summary.positionCount} LIVE QUOTES`;
  document.getElementById('portfolio-source-state').textContent=liveLabel;
  document.querySelector('[data-overview-portfolio-source]').textContent=`GOOGLE DRIVE · ${liveLabel}`;
  document.getElementById('portfolio-freshness').textContent=`MARKET DATA · ${dateLabel(freshness.latestQuoteAt)}`;
  document.getElementById('source-market-state').textContent=liveLabel;
  document.getElementById('source-ledger-state').textContent=`LAST MOVEMENT · ${dateLabel(freshness.latestTransactionAt)}`;
  document.getElementById('source-drive-state').textContent=`READ ${dateLabel(freshness.downloadedAt)}`;
  document.querySelectorAll('[data-portfolio-pulse]').forEach(element=>element.classList.toggle('active',freshness.liveQuotes>0));
  if(freshness.storedQuotes>0){
    document.getElementById('source-disclaimer').textContent=`${freshness.storedQuotes} position${freshness.storedQuotes===1?' is':'s are'} using the latest stored Portfolio Performance price. Values are read-only.`;
  }

  document.getElementById('allocation-count').textContent=`${positions.length} ASSETS`;
  document.getElementById('allocation-total').textContent=money(summary.investedValue);
  let cumulative=0;
  const stops=positions.map(position=>{
    const start=cumulative;
    cumulative+=position.weight;
    return `${position.color} ${start}% ${cumulative}%`;
  });
  document.getElementById('allocation-donut').style.background=`conic-gradient(${stops.join(',')})`;
  document.getElementById('allocation-legend').innerHTML=positions.map(position=>`
    <div>
      <i style="--position-color:${escapeHtml(position.color)}"></i>
      <span><strong>${escapeHtml(position.name)}</strong><small>${escapeHtml(position.symbol)} · ${position.weight.toFixed(1)}%</small></span>
      <b>${money(position.value)}</b>
    </div>
  `).join('');
  document.getElementById('category-strip').innerHTML=categories.map(category=>`
    <div><span><i style="--position-color:${escapeHtml(category.color)}"></i>${escapeHtml(category.name)}</span><b>${category.weight.toFixed(1)}%</b></div>
  `).join('');

  document.getElementById('positions-list').innerHTML=positions.map(position=>`
    <div class="position-row">
      <span class="position-name"><i style="--position-color:${escapeHtml(position.color)}"></i><b>${escapeHtml(position.name)}</b><small>${escapeHtml(position.symbol)} · ${numberFormatter.format(position.shares)} units · ${position.weight.toFixed(1)}%</small></span>
      <span><b>${new Intl.NumberFormat('en-GB',{style:'currency',currency:position.currency,maximumFractionDigits:4}).format(position.price)}</b><small>${escapeHtml(position.currency)} · ${position.quoteSource==='live'?'LIVE':'STORED'}</small></span>
      <span class="${position.gain>0?'positive':position.gain<0?'negative':''}"><b>${signedMoney(position.gain)}</b><small>${signedPercent(position.gainPercent)}</small></span>
      <span><b>${money(position.value)}</b><small>${signedMoney(position.dayChange)} today</small></span>
    </div>
  `).join('');

  const activityLabels={
    PURCHASE:'Purchase',
    SALE:'Sale',
    DEPOSIT:'Deposit',
    REMOVAL:'Withdrawal',
    DIVIDEND:'Dividend',
    INTEREST:'Interest'
  };
  document.getElementById('portfolio-activity').innerHTML=recentTransactions.map(transaction=>`
    <div class="activity-row">
      <span class="activity-type ${transaction.type.toLowerCase()}">${escapeHtml((activityLabels[transaction.type]||transaction.type).slice(0,2).toUpperCase())}</span>
      <span><strong>${escapeHtml(transaction.security)}</strong><small>${escapeHtml(activityLabels[transaction.type]||transaction.type)} · ${dateLabel(transaction.date)}</small></span>
      <b>${transaction.type==='PURCHASE'||transaction.type==='REMOVAL'?'−':'+'}${new Intl.NumberFormat('en-GB',{style:'currency',currency:transaction.currency,maximumFractionDigits:2}).format(transaction.amount)}</b>
    </div>
  `).join('');

  document.getElementById('portfolio-loading').hidden=true;
  document.getElementById('portfolio-error').hidden=true;
  document.getElementById('portfolio-content').hidden=false;
}

async function loadPortfolio(forceRefresh=false){
  if(portfolioLoading)return;
  portfolioLoading=true;
  const refreshButton=document.getElementById('portfolio-refresh');
  refreshButton.disabled=true;
  refreshButton.classList.add('loading');
  document.getElementById('portfolio-error').hidden=true;
  if(!portfolioState){
    document.getElementById('portfolio-loading').hidden=false;
    document.getElementById('portfolio-content').hidden=true;
  }
  try{
    const response=await fetch(`/control/api/portfolio/summary${forceRefresh?'?refresh=1':''}`,{
      credentials:'same-origin',
      headers:{accept:'application/json'}
    });
    const data=await response.json();
    if(!response.ok||!data.ok)throw new Error(data.error||'portfolio_unavailable');
    renderPortfolio(data);
  }catch(error){
    document.getElementById('portfolio-loading').hidden=true;
    document.getElementById('portfolio-error').hidden=false;
    document.getElementById('portfolio-error-copy').textContent=error.message==='portfolio_source_not_configured'
      ?'The private Drive source has not been configured yet.'
      :'The Drive file or live market data could not be read. Your source file has not been changed.';
  }finally{
    portfolioLoading=false;
    refreshButton.disabled=false;
    refreshButton.classList.remove('loading');
  }
}

document.getElementById('portfolio-refresh').addEventListener('click',()=>loadPortfolio(true));
document.querySelectorAll('[data-portfolio-retry]').forEach(button=>button.addEventListener('click',()=>loadPortfolio(true)));

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
  if(hasCapability('portfolio:read')){
    loadPortfolio();
  }
}

initialiseControl();
