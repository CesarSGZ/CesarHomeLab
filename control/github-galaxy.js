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
  let galaxy=null;
  let selectedRepo=null;
  let commitIndex=0;
  let playbackTimer=null;
  let frame={nodes:[],edges:[],highlighted:new Set(),author:null};

  const extensionColours={js:'#f4df64',mjs:'#f4df64',ts:'#4f9cff',html:'#ff765f',css:'#a98be0',py:'#52d9ff',ps1:'#388ccf',java:'#ff9b63',rs:'#f09a72',md:'#eef3ec',json:'#c9ff3d',sql:'#ffb86b',png:'#ff83d1',jpg:'#ff83d1',svg:'#ff83d1'};
  const make=(tag,className,text)=>{const element=document.createElement(tag);if(className)element.className=className;if(text!==undefined)element.textContent=text;return element};
  const hash=(value)=>{let result=2166136261;for(const character of String(value)){result^=character.charCodeAt(0);result=Math.imul(result,16777619)}return result>>>0};
  const fileColour=(path)=>extensionColours[String(path).split('.').pop().toLowerCase()]||'#52d9ff';
  const formatDate=(value)=>value?new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(value)).toUpperCase():'NO DATE';

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
    for(const [parent,node] of frame.edges){context.strokeStyle=node.type==='file'?'rgba(82,217,255,.18)':'rgba(169,139,224,.28)';context.lineWidth=node.type==='file'?.7:1.2;context.beginPath();context.moveTo(parent.x,parent.y);context.lineTo(node.x,node.y);context.stroke()}
    const pulse=.75+Math.sin(Date.now()/170)*.25;
    for(const node of frame.nodes){
      const active=frame.highlighted.has(node.path);const colour=node.type==='file'?fileColour(node.path):node.type==='root'?'#eef3ec':'#a98be0';const radius=node.type==='root'?10:node.type==='directory'?3.4:active?3.5:1.8;
      if(active){context.shadowBlur=18*pulse;context.shadowColor=colour}else{context.shadowBlur=node.type==='file'?5:8;context.shadowColor=colour}
      context.fillStyle=colour;context.beginPath();context.arc(node.x,node.y,radius,0,Math.PI*2);context.fill();context.shadowBlur=0;
      if(node.type==='directory'||node.type==='root'||active){context.fillStyle=active?'#eef3ec':'rgba(238,243,236,.68)';context.font=`${active?'500':'400'} ${node.type==='root'?9:7}px "DM Mono"`;context.textAlign='center';context.fillText(node.name,node.x,node.y+(node.type==='root'?21:13))}
    }
    if(frame.author&&frame.highlighted.size){
      const changed=frame.nodes.filter(node=>frame.highlighted.has(node.path));if(changed.length){const authorSeed=hash(frame.author);const anchor=changed[0];const ax=Math.max(70,Math.min(box.width-70,anchor.x+((authorSeed%2)?70:-70)));const ay=Math.max(35,Math.min(box.height-80,anchor.y-55));context.strokeStyle='rgba(238,243,236,.42)';context.lineWidth=.8;changed.slice(0,12).forEach(node=>{context.beginPath();context.moveTo(ax,ay);context.lineTo(node.x,node.y);context.stroke()});context.fillStyle='#eef3ec';context.beginPath();context.arc(ax,ay,5,0,Math.PI*2);context.fill();context.font='500 8px "DM Mono"';context.textAlign='center';context.fillText(frame.author.toUpperCase(),ax,ay-11)}
    }
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
    selectedRepo=repo;stopPlayback();commitIndex=Math.max(0,repo.commits.length-1);timeline.max=String(Math.max(0,repo.commits.length-1));timeline.value=String(commitIndex);renderDetail(repo);rebuildFrame();
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
  playButton.addEventListener('click',()=>playbackTimer?stopPlayback():startPlayback());timeline.addEventListener('input',()=>{stopPlayback();commitIndex=Number(timeline.value);rebuildFrame()});refreshButton.addEventListener('click',()=>load(true));addEventListener('resize',rebuildFrame);
  const animate=()=>{const githubView=document.getElementById('github');if((!githubView||githubView.classList.contains('active'))&&frame.highlighted.size)drawFrame();requestAnimationFrame(animate)};requestAnimationFrame(animate);
  window.GitHubGalaxy={initialise:()=>{load();setInterval(()=>load(true),180000)}};
})();
