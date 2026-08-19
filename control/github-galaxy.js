(()=>{
  const canvas=document.getElementById('github-galaxy-canvas');
  const context=canvas.getContext('2d');
  const detail=document.getElementById('github-repo-detail');
  const repoList=document.getElementById('github-repo-list');
  const feedback=document.getElementById('github-feedback');
  const refreshButton=document.getElementById('github-refresh');
  const playButton=document.getElementById('github-play');
  const timeline=document.getElementById('github-timeline');
  const timelineCount=document.getElementById('github-timeline-count');
  const timelineDate=document.getElementById('github-timeline-date');
  const shell=canvas.closest('.github-canvas-shell');
  const zoomOutButton=document.getElementById('github-zoom-out');
  const zoomInButton=document.getElementById('github-zoom-in');
  const zoomLevel=document.getElementById('github-zoom-level');
  const resetViewButton=document.getElementById('github-reset-view');
  const expandButton=document.getElementById('github-expand');
  const tooltip=document.getElementById('github-node-tooltip');
  const inspector=document.getElementById('github-node-inspector');
  let galaxy=null;
  let selectedRepo=null;
  let commitIndex=0;
  let playbackTimer=null;
  let frame={nodes:[],edges:[],highlighted:new Set(),author:null};
  let viewport={zoom:1.5,panX:0,panY:0};
  let pointer=null;
  let hoveredNode=null;

  const extensionColours={js:'#f4df64',mjs:'#f4df64',ts:'#4f9cff',html:'#ff765f',css:'#a98be0',py:'#52d9ff',ps1:'#388ccf',java:'#ff9b63',rs:'#f09a72',md:'#eef3ec',json:'#c9ff3d',sql:'#ffb86b',png:'#ff83d1',jpg:'#ff83d1',svg:'#ff83d1'};
  const make=(tag,className,text)=>{const element=document.createElement(tag);if(className)element.className=className;if(text!==undefined)element.textContent=text;return element};
  const hash=(value)=>{let result=2166136261;for(const character of String(value)){result^=character.charCodeAt(0);result=Math.imul(result,16777619)}return result>>>0};
  const fileColour=(path)=>extensionColours[String(path).split('.').pop().toLowerCase()]||'#52d9ff';
  const formatDate=(value)=>value?new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(value)).toUpperCase():'NO DATE';
  const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
  const nodeRadius=(node,active=false)=>node.type==='root'?10:node.type==='directory'?3.4:active?3.5:1.8;

  function setZoom(nextZoom,screenX=null,screenY=null){
    const box=canvas.getBoundingClientRect();if(!box.width||!box.height)return;
    const oldZoom=viewport.zoom;const zoom=clamp(nextZoom,.45,6);const centreX=box.width/2;const centreY=box.height/2;
    const anchorX=screenX??centreX;const anchorY=screenY??centreY;
    const worldX=(anchorX-centreX-viewport.panX)/oldZoom+centreX;const worldY=(anchorY-centreY-viewport.panY)/oldZoom+centreY;
    viewport.zoom=zoom;viewport.panX=anchorX-centreX-(worldX-centreX)*zoom;viewport.panY=anchorY-centreY-(worldY-centreY)*zoom;
    zoomLevel.textContent=`${Math.round(zoom*100)}%`;drawFrame();
  }

  function resetView(){viewport={zoom:1.5,panX:0,panY:0};zoomLevel.textContent='150%';drawFrame()}
  function screenPosition(node,box){const centreX=box.width/2;const centreY=box.height/2;return{x:(node.x-centreX)*viewport.zoom+centreX+viewport.panX,y:(node.y-centreY)*viewport.zoom+centreY+viewport.panY}}
  function nodeAt(clientX,clientY){
    const box=canvas.getBoundingClientRect();const x=clientX-box.left;const y=clientY-box.top;let closest=null;let closestDistance=Infinity;
    for(const node of frame.nodes){const point=screenPosition(node,box);const distance=Math.hypot(point.x-x,point.y-y);const hitRadius=Math.max(8,nodeRadius(node,frame.highlighted.has(node.path))*viewport.zoom+5);if(distance<=hitRadius&&distance<closestDistance){closest=node;closestDistance=distance}}
    return closest;
  }

  function latestChange(node){
    if(!selectedRepo)return null;
    for(let index=Math.min(commitIndex,selectedRepo.commits.length-1);index>=0;index-=1){const commit=selectedRepo.commits[index];for(const change of commit.changes||[]){const paths=[change.path,change.oldPath].filter(Boolean);const matches=node.type==='file'?paths.includes(node.path):node.type==='root'||paths.some(path=>path===node.path||path.startsWith(`${node.path}/`));if(matches)return{commit,change}}}
    return null;
  }

  function inspectNode(node){
    if(!node){inspector.replaceChildren(make('small',null,'NODE INSPECTOR'),make('strong',null,'Choose a point in the map'),make('span',null,'Files, folders and their latest contribution details will appear here.'));return}
    const kind=node.type==='root'?'REPOSITORY':node.type==='directory'?'DIRECTORY':'FILE';const touched=latestChange(node);
    const label=make('small',null,kind);const title=make('strong',null,node.path||selectedRepo.name);const summary=make('span',null,node.type==='file'?`EXTENSION · ${(node.path.split('.').pop()||'none').toUpperCase()}`:`${node.leaves} DESCENDANT FILE${node.leaves===1?'':'S'}`);
    const children=[label,title,summary];
    if(touched){const status={A:'ADDED',M:'MODIFIED',D:'DELETED',R:'RENAMED'}[touched.change.status]||touched.change.status;children.push(make('span','node-change',`${status} · ${touched.commit.message}\n${touched.commit.author.toUpperCase()} · ${formatDate(touched.commit.date)}`))}
    inspector.replaceChildren(...children);
  }

  function showTooltip(node,event){
    hoveredNode=node;if(!node){tooltip.hidden=true;drawFrame();return}
    tooltip.textContent=`${node.type.toUpperCase()} · ${node.path||selectedRepo.name}`;tooltip.style.left=`${event.clientX-canvas.getBoundingClientRect().left}px`;tooltip.style.top=`${event.clientY-canvas.getBoundingClientRect().top}px`;tooltip.hidden=false;drawFrame();
  }

  function visibleFiles(repo,index){
    if(index>=repo.commits.length-1)return new Set(repo.files);
    const files=new Set();
    for(let current=0;current<=index;current+=1){
      for(const change of repo.commits[current]?.changes||[]){
        if(change.oldPath)files.delete(change.oldPath);
        if(change.status==='D')files.delete(change.path);else if(change.path)files.add(change.path);
      }
    }
    return files;
  }

  function treeFromFiles(files){
    const root={path:'',name:selectedRepo?.name||'repository',type:'root',children:new Map(),leaves:0,depth:0};
    for(const path of files){
      const parts=path.split('/').filter(Boolean);let parent=root;
      parts.forEach((part,index)=>{
        const currentPath=parts.slice(0,index+1).join('/');
        if(!parent.children.has(part))parent.children.set(part,{path:currentPath,name:part,type:index===parts.length-1?'file':'directory',children:new Map(),leaves:0,depth:index+1});
        parent=parent.children.get(part);
      });
    }
    const count=(node)=>{if(!node.children.size){node.leaves=1;return 1}node.leaves=[...node.children.values()].reduce((sum,child)=>sum+count(child),0);return node.leaves};
    count(root);return root;
  }

  function layoutTree(root,width,height){
    const nodes=[],edges=[];const centreX=width/2,centreY=height/2-10;let maximumDepth=1;
    const inspect=(node)=>{maximumDepth=Math.max(maximumDepth,node.depth);node.children.forEach(inspect)};inspect(root);
    const radialStep=Math.min(width,height-90)/(2*(maximumDepth+1));
    const place=(node,start,end,parent=null)=>{
      const angle=(start+end)/2;const radius=node.depth*radialStep;
      node.x=centreX+Math.cos(angle)*radius;node.y=centreY+Math.sin(angle)*radius*.78;
      nodes.push(node);if(parent)edges.push([parent,node]);
      let cursor=start;const total=Math.max(1,node.leaves);
      [...node.children.values()].sort((a,b)=>a.path.localeCompare(b.path)).forEach(child=>{const span=(end-start)*(child.leaves/total);place(child,cursor,cursor+span,node);cursor+=span});
    };
    place(root,-Math.PI*.96,Math.PI*1.04);return{nodes,edges};
  }

  function rebuildFrame(){
    if(!selectedRepo)return;
    const box=canvas.getBoundingClientRect();if(!box.width||!box.height)return;
    const files=visibleFiles(selectedRepo,commitIndex);const tree=treeFromFiles(files);const layout=layoutTree(tree,box.width,box.height);
    const commit=selectedRepo.commits[commitIndex]||null;
    frame={...layout,highlighted:new Set((commit?.changes||[]).flatMap(change=>[change.path,change.oldPath].filter(Boolean))),author:commit?.author||null};
    timeline.value=String(commitIndex);timelineCount.textContent=`${selectedRepo.commits.length?commitIndex+1:0} / ${selectedRepo.commits.length}`;
    timelineDate.textContent=commit?`${formatDate(commit.date)} · ${commit.author.toUpperCase()}`:'CURRENT TREE';
    drawFrame();
  }

  function drawFrame(){
    if(!selectedRepo)return;
    const box=canvas.getBoundingClientRect();if(!box.width||!box.height)return;
    const scale=devicePixelRatio||1;canvas.width=Math.round(box.width*scale);canvas.height=Math.round(box.height*scale);context.setTransform(scale,0,0,scale,0,0);context.clearRect(0,0,box.width,box.height);
    for(let index=0;index<75;index+=1){const seed=hash(`gource-star-${index}`);context.fillStyle=`rgba(238,243,236,${.12+(seed%35)/100})`;context.beginPath();context.arc((seed%10000)/10000*box.width,((seed>>>8)%10000)/10000*box.height,.4+(seed%10)/15,0,Math.PI*2);context.fill()}
    const centreX=box.width/2;const centreY=box.height/2;context.save();context.translate(centreX+viewport.panX,centreY+viewport.panY);context.scale(viewport.zoom,viewport.zoom);context.translate(-centreX,-centreY);
    for(const [parent,node] of frame.edges){context.strokeStyle=node.type==='file'?'rgba(82,217,255,.18)':'rgba(169,139,224,.28)';context.lineWidth=(node.type==='file'?.7:1.2)/Math.sqrt(viewport.zoom);context.beginPath();context.moveTo(parent.x,parent.y);context.lineTo(node.x,node.y);context.stroke()}
    const pulse=.75+Math.sin(Date.now()/170)*.25;
    for(const node of frame.nodes){
      const active=frame.highlighted.has(node.path);const hovered=node===hoveredNode;const colour=node.type==='file'?fileColour(node.path):node.type==='root'?'#eef3ec':'#a98be0';const radius=nodeRadius(node,active)+(hovered?2.5/viewport.zoom:0);
      if(active||hovered){context.shadowBlur=(hovered?26:18)*pulse;context.shadowColor=colour}else{context.shadowBlur=node.type==='file'?5:8;context.shadowColor=colour}
      context.fillStyle=colour;context.beginPath();context.arc(node.x,node.y,radius,0,Math.PI*2);context.fill();context.shadowBlur=0;
      if(node.type==='directory'||node.type==='root'||active||hovered){context.fillStyle=active||hovered?'#eef3ec':'rgba(238,243,236,.68)';context.font=`${active||hovered?'500':'400'} ${node.type==='root'?9:7}px "DM Mono"`;context.textAlign='center';context.fillText(node.name,node.x,node.y+(node.type==='root'?21:13))}
    }
    if(frame.author&&frame.highlighted.size){
      const changed=frame.nodes.filter(node=>frame.highlighted.has(node.path));if(changed.length){const authorSeed=hash(frame.author);const anchor=changed[0];const ax=Math.max(70,Math.min(box.width-70,anchor.x+((authorSeed%2)?70:-70)));const ay=Math.max(35,Math.min(box.height-80,anchor.y-55));context.strokeStyle='rgba(238,243,236,.42)';context.lineWidth=.8;changed.slice(0,12).forEach(node=>{context.beginPath();context.moveTo(ax,ay);context.lineTo(node.x,node.y);context.stroke()});context.fillStyle='#eef3ec';context.beginPath();context.arc(ax,ay,5,0,Math.PI*2);context.fill();context.font='500 8px "DM Mono"';context.textAlign='center';context.fillText(frame.author.toUpperCase(),ax,ay-11)}
    }
    context.restore();
  }

  function renderDetail(repo){
    const recent=repo.commits.slice(-4).reverse();const label=make('small',null,repo.fullName.toUpperCase());const title=make('h3',null,repo.name);const description=make('p',null,repo.description);const meta=make('div','github-detail-meta');
    [['LANGUAGE',repo.language],['FILES',repo.files.length],['COMMITS',repo.commits.length],['BRANCHES',repo.branches.length]].forEach(([key,value])=>{const cell=make('div');cell.append(make('small',null,key),make('strong',null,String(value)));meta.append(cell)});
    const branches=make('div','github-branch-list');repo.branches.slice(0,12).forEach(branch=>branches.append(make('span',null,branch)));
    const activity=make('div','github-activity');activity.append(make('small',null,'LATEST CONTRIBUTIONS'));recent.forEach(commit=>{const row=make('article');row.append(make('strong',null,commit.message),make('span',null,`${commit.author} · ${formatDate(commit.date)}`));activity.append(row)});
    const link=make('a','github-detail-link','OPEN ON GITHUB ↗');link.href=repo.url;link.target='_blank';link.rel='noreferrer';detail.replaceChildren(label,title,description,meta,branches,activity,link);
    document.querySelectorAll('.github-repo-card').forEach(button=>button.classList.toggle('active',button.dataset.repoId===String(repo.id)));
  }

  function selectRepo(repo){
    selectedRepo=repo;hoveredNode=null;tooltip.hidden=true;stopPlayback();commitIndex=Math.max(0,repo.commits.length-1);timeline.max=String(Math.max(0,repo.commits.length-1));timeline.value=String(commitIndex);renderDetail(repo);inspectNode(null);resetView();rebuildFrame();
  }

  function renderGalaxy(data){
    galaxy=data;document.querySelectorAll('[data-github-repo-count]').forEach(element=>{element.textContent=data.repos.length});document.getElementById('github-account-label').textContent=`${data.profile.login.toUpperCase()} · ${data.repos.length} REPOSITORIES`;document.getElementById('github-sync-label').textContent=`GENERATED · ${formatDate(data.generatedAt)}`;repoList.replaceChildren();
    data.repos.forEach(repo=>{const button=make('button','github-repo-card');button.type='button';button.dataset.repoId=repo.id;button.append(make('small',null,`${repo.language.toUpperCase()} · ${repo.branches.length} BRANCH${repo.branches.length===1?'':'ES'}`),make('strong',null,repo.name),make('span',null,`${repo.commits.length} COMMITS · ${repo.files.length} FILES`));button.addEventListener('click',()=>selectRepo(repo));repoList.append(button)});
    selectRepo(data.repos.find(repo=>repo.id===selectedRepo?.id)||data.repos[0]);feedback.className='github-feedback';feedback.textContent='REAL GIT HISTORY · REBUILT ON EVERY HOMELAB PUSH AND EVERY 15 MINUTES';
  }

  async function load(force=false){
    refreshButton.disabled=true;feedback.className='github-feedback';feedback.textContent='LOADING VERSION-CONTROL HISTORY…';
    try{const response=await fetch(`/control/data/github-galaxy.json${force?`?v=${Date.now()}`:''}`,{credentials:'same-origin',cache:force?'no-store':'default'});if(!response.ok)throw new Error('history_unavailable');renderGalaxy(await response.json())}catch{feedback.className='github-feedback error';feedback.textContent='GITHUB HISTORY IS NOT AVAILABLE YET';refreshButton.disabled=false;return}
    refreshButton.disabled=false;
  }

  function stopPlayback(){if(playbackTimer)clearInterval(playbackTimer);playbackTimer=null;playButton.textContent='▶ PLAY HISTORY'}
  function startPlayback(){if(!selectedRepo?.commits.length)return;if(commitIndex>=selectedRepo.commits.length-1)commitIndex=0;playButton.textContent='Ⅱ PAUSE';playbackTimer=setInterval(()=>{rebuildFrame();if(commitIndex>=selectedRepo.commits.length-1){stopPlayback();return}commitIndex+=1},650);rebuildFrame()}
  function toggleExpanded(){const expanded=shell.classList.toggle('expanded');document.body.classList.toggle('galaxy-expanded',expanded);expandButton.textContent=expanded?'CLOSE ×':'EXPAND ↗';expandButton.setAttribute('aria-pressed',String(expanded));requestAnimationFrame(rebuildFrame)}

  canvas.addEventListener('wheel',(event)=>{event.preventDefault();const box=canvas.getBoundingClientRect();setZoom(viewport.zoom*(event.deltaY<0?1.14:.88),event.clientX-box.left,event.clientY-box.top)},{passive:false});
  canvas.addEventListener('pointerdown',(event)=>{if(event.button!==0)return;canvas.setPointerCapture(event.pointerId);pointer={id:event.pointerId,startX:event.clientX,startY:event.clientY,lastX:event.clientX,lastY:event.clientY,moved:false};canvas.style.cursor='grabbing';tooltip.hidden=true});
  canvas.addEventListener('pointermove',(event)=>{if(pointer?.id===event.pointerId){const deltaX=event.clientX-pointer.lastX;const deltaY=event.clientY-pointer.lastY;viewport.panX+=deltaX;viewport.panY+=deltaY;pointer.lastX=event.clientX;pointer.lastY=event.clientY;pointer.moved=pointer.moved||Math.hypot(event.clientX-pointer.startX,event.clientY-pointer.startY)>5;drawFrame();return}showTooltip(nodeAt(event.clientX,event.clientY),event)});
  canvas.addEventListener('pointerup',(event)=>{if(pointer?.id!==event.pointerId)return;const wasMoved=pointer.moved;pointer=null;canvas.style.cursor='grab';canvas.releasePointerCapture(event.pointerId);if(!wasMoved){const node=nodeAt(event.clientX,event.clientY);if(node)inspectNode(node)}});
  canvas.addEventListener('pointercancel',()=>{pointer=null;canvas.style.cursor='grab'});canvas.addEventListener('pointerleave',()=>{if(!pointer)showTooltip(null)});
  canvas.addEventListener('keydown',(event)=>{if(event.key==='+'||event.key==='='){event.preventDefault();setZoom(viewport.zoom*1.2)}else if(event.key==='-'){event.preventDefault();setZoom(viewport.zoom/1.2)}else if(event.key==='0'){event.preventDefault();resetView()}});
  zoomOutButton.addEventListener('click',()=>setZoom(viewport.zoom/1.2));zoomInButton.addEventListener('click',()=>setZoom(viewport.zoom*1.2));resetViewButton.addEventListener('click',resetView);expandButton.addEventListener('click',toggleExpanded);
  document.addEventListener('keydown',(event)=>{if(event.key==='Escape'&&shell.classList.contains('expanded'))toggleExpanded()});
  playButton.addEventListener('click',()=>playbackTimer?stopPlayback():startPlayback());timeline.addEventListener('input',()=>{stopPlayback();commitIndex=Number(timeline.value);hoveredNode=null;tooltip.hidden=true;inspectNode(null);rebuildFrame()});refreshButton.addEventListener('click',()=>load(true));addEventListener('resize',rebuildFrame);
  const animate=()=>{const githubView=document.getElementById('github');if((!githubView||githubView.classList.contains('active'))&&frame.highlighted.size)drawFrame();requestAnimationFrame(animate)};requestAnimationFrame(animate);
  window.GitHubGalaxy={initialise:()=>{load();setInterval(()=>load(true),180000)}};
})();
