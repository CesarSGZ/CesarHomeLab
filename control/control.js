const navItems=[...document.querySelectorAll('.nav-item')];
const views=[...document.querySelectorAll('.view')];
const sidebar=document.querySelector('.sidebar');
const menu=document.querySelector('.menu-toggle');

function showView(id,push=true){
  const next=document.getElementById(id)||document.getElementById('overview');
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
showView(location.hash.slice(1)||'overview',false);

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
    if(response.status===401){location.replace('/control/login.html');return}
    if(!response.ok)return;
    const data=await response.json();
    if(!data.ok)return;
    csrfToken=data.csrfToken||'';
    document.getElementById('session-name').textContent=`${data.user.username}.`;
    document.getElementById('session-role').textContent=data.user.role.toUpperCase();
    document.getElementById('session-avatar').textContent=data.user.username.toLowerCase()==='supersanti86'?'S8':'CV';
  }catch{}
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

restartButton.addEventListener('click',async()=>{
  if(!minecraftState?.agent?.connected)return;
  const approved=window.confirm('Restart the Minecraft server now? Connected players may be disconnected.');
  if(!approved)return;

  restartButton.disabled=true;
  commandFeedback.className='command-feedback';
  commandFeedback.textContent='QUEUEING SIGNED RESTART REQUEST…';

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
    location.replace('/control/login.html');
  }
});

loadSession();
refreshMinecraft();
setInterval(refreshMinecraft,10000);
