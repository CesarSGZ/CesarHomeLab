/* Read-only architecture explorer. Authentication stays in Pages middleware. */
(() => {
  let initialisation;
  window.GitHubGalaxy={initialise:()=>initialisation ||= start()};
  async function start(){
    const {SYSTEMS,CONNECTIONS,JOURNEYS,activeFiles,REPOSITORY,BRANCH}=await import('./galaxy-model.js?v=20260928atlas');
    const byId=id=>document.getElementById(id),view=byId('github'),map=byId('galaxy-map'),svg=byId('galaxy-links');
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    const compact=matchMedia('(max-width: 700px)');
    const make=(tag,className,text)=>{const e=document.createElement(tag);if(className)e.className=className;if(text!==undefined)e.textContent=text;return e;};
    const byNode=new Map(SYSTEMS.map(n=>[n.id,n])),buttons=new Map();
    let data=null,selected='edge',tour=null,step=0,busy=false,lastAttempt=0,motionPaused=reduced.matches,resizeFrame;
    const icons={
      git:'M7 4v11a4 4 0 0 0 4 4h5M7 8h6a4 4 0 0 0 4-4M4 4a3 3 0 1 0 6 0a3 3 0 1 0-6 0M14 19a3 3 0 1 0 6 0a3 3 0 1 0-6 0M14 4a3 3 0 1 0 6 0a3 3 0 1 0-6 0',
      rocket:'M8 16l-3 3m3-10l-4 1-2 5 6-1m7-5l-1-6 5-1-1 5M8 14c0-6 6-11 13-11 0 7-5 13-11 13zM12 18l-1 4-4 1 1-6M15 7h.01',
      cloud:'M6 18h12a4 4 0 0 0 0-8h-1a6 6 0 0 0-11-2 5 5 0 0 0 0 10',
      person:'M12 3a4 4 0 1 0 0 8a4 4 0 1 0 0-8M4 22v-3a8 8 0 0 1 16 0v3',
      dashboard:'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
      code:'M7 6l-6 6 6 6M17 6l6 6-6 6M14 3l-4 18',
      database:'M3 6c0-5 18-5 18 0s-18 5-18 0v12c0 5 18 5 18 0V6M3 12c0 5 18 5 18 0',
      server:'M3 3h18v7H3zM3 14h18v7H3zM6 6.5h.01M6 17.5h.01M12 6.5h6M12 17.5h6'
    };
    SYSTEMS.forEach(n=>{
      const button=make('button','galaxy-node');button.type='button';button.dataset.node=n.id;
      button.style.setProperty('--x',n.x+'%');button.style.setProperty('--y',n.y+'%');button.style.setProperty('--node',n.colour);
      const icon=document.createElementNS('http://www.w3.org/2000/svg','svg');icon.setAttribute('viewBox','0 0 24 24');icon.setAttribute('aria-hidden','true');
      const path=document.createElementNS(icon.namespaceURI,'path');path.setAttribute('d',icons[n.icon]);icon.append(path);
      const art=make('span','galaxy-node-art');art.setAttribute('aria-hidden','true');art.append(icon);
      button.append(art,make('strong','',n.name),make('small','galaxy-node-count','SOURCE NOT CHECKED'));
      button.title=n.summary;button.setAttribute('aria-controls','galaxy-inspector');button.setAttribute('aria-pressed','false');
      button.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')highlight(n.id);});
      button.addEventListener('pointerleave',()=>highlight(selected));
      button.addEventListener('focus',()=>highlight(n.id));
      button.addEventListener('blur',()=>highlight(selected));
      button.addEventListener('click',()=>{closeTour();select(n.id,true);if(compact.matches)byId('galaxy-inspector').scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'start'});});
      buttons.set(n.id,button);byId('galaxy-map-nodes').append(button);
    });
    const wires=CONNECTIONS.map(edge=>{
      const path=document.createElementNS(svg.namespaceURI,'path');path.setAttribute('class','galaxy-wire');
      const flow=document.createElementNS(svg.namespaceURI,'path');flow.setAttribute('class','galaxy-flow');flow.style.setProperty('--wire-colour',byNode.get(edge.to).colour);
      byId('galaxy-paths').append(path,flow);return {...edge,path,flow};
    });
    function drawLinks(){
      const box=map.getBoundingClientRect();if(!box.width||!box.height)return;
      svg.setAttribute('viewBox','0 0 '+box.width+' '+box.height);
      wires.forEach(edge=>{
        const a=buttons.get(edge.from).querySelector('.galaxy-node-art').getBoundingClientRect(),b=buttons.get(edge.to).querySelector('.galaxy-node-art').getBoundingClientRect();
        const ax=a.left+a.width/2-box.left,ay=a.top+a.height/2-box.top,bx=b.left+b.width/2-box.left,by=b.top+b.height/2-box.top;
        const horizontal=Math.abs(bx-ax)>Math.abs(by-ay);
        const sx=ax+(horizontal?Math.sign(bx-ax)*a.width/2:0),sy=ay+(!horizontal?Math.sign(by-ay)*a.height/2:0);
        const tx=bx-(horizontal?Math.sign(bx-ax)*b.width/2:0),ty=by-(!horizontal?Math.sign(by-ay)*b.height/2:0);
        const mx=(sx+tx)/2,my=(sy+ty)/2;
        const d=horizontal?'M '+sx+' '+sy+' C '+mx+' '+sy+', '+mx+' '+ty+', '+tx+' '+ty:'M '+sx+' '+sy+' C '+sx+' '+my+', '+tx+' '+my+', '+tx+' '+ty;
        edge.path.setAttribute('d',d);edge.flow.setAttribute('d',d);
      });
    }
    function highlight(id){
      const connected=new Set([id]);CONNECTIONS.filter(e=>e.from===id||e.to===id).forEach(e=>{connected.add(e.from);connected.add(e.to);});
      buttons.forEach((button,key)=>{button.classList.toggle('connected',key!==id&&connected.has(key));button.classList.toggle('dimmed',!connected.has(key));});
      view.dispatchEvent(new CustomEvent('galaxy:highlight',{detail:id}));
      wires.forEach(e=>{const active=e.from===id||e.to===id;e.path.classList.toggle('connected',active);e.flow.classList.toggle('connected',active);e.path.style.setProperty('--wire-colour',byNode.get(id).colour);});
    }
    function select(id,announce=false){
      selected=id;const n=byNode.get(id);
      const inspector=byId('galaxy-inspector');inspector.style.setProperty('--galaxy-accent',n.colour);inspector.style.setProperty('--galaxy-soft',n.colour+'12');
      [['galaxy-node-title',n.name],['galaxy-node-tag',n.tag],['galaxy-node-number',n.number],['galaxy-node-summary',n.summary],['galaxy-node-explanation',n.explanation],['galaxy-node-input',n.input],['galaxy-node-output',n.output]].forEach(([key,value])=>byId(key).textContent=value);
      buttons.forEach((button,key)=>{button.classList.toggle('selected',key===id);button.setAttribute('aria-pressed',String(key===id));});
      const neighbours=byId('galaxy-neighbours');neighbours.replaceChildren();
      CONNECTIONS.filter(e=>e.from===id||e.to===id).forEach(edge=>{
        const other=byNode.get(edge.from===id?edge.to:edge.from),b=make('button','',other.name+' ↗');b.type='button';b.title=edge.label;
        b.addEventListener('click',()=>{closeTour();select(other.id,true);});neighbours.append(b);
      });
      highlight(id);renderFiles();
      if(announce)feedback(n.name+'. '+n.summary);
      if(!reduced.matches)inspector.animate([{opacity:.55,transform:'translateY(4px)'},{opacity:1,transform:'translateY(0)'}],{duration:200});
    }
    const guide=byId('galaxy-guide');view.querySelector('.galaxy-workspace').before(guide);
    JOURNEYS.forEach(j=>{
      const b=make('button');b.type='button';b.dataset.journey=j.id;b.setAttribute('aria-pressed','false');b.append(make('strong','',j.label),make('span','','↗'));b.title=j.description;
      b.addEventListener('click',()=>{tour=j;step=0;renderStep();});byId('galaxy-journeys').append(b);
    });
    function renderStep(){
      if(!tour)return;guide.hidden=false;const current=tour.steps[step];
      byId('galaxy-guide-kicker').textContent=tour.label.toUpperCase()+' / '+(step+1)+' OF '+tour.steps.length;
      byId('galaxy-guide-title').textContent=current[1];byId('galaxy-guide-copy').textContent=current[2];
      byId('galaxy-guide-progress').style.setProperty('--step',(step+1)/tour.steps.length*100+'%');
      byId('galaxy-previous').disabled=step===0;byId('galaxy-next').textContent=step===tour.steps.length-1?'Finish tour ✓':'Next step →';
      byId('galaxy-journeys').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.journey===tour.id)));
      select(current[0]);feedback('Step '+(step+1)+': '+current[1]+'. '+current[2]);requestAnimationFrame(drawLinks);
    }
    function closeTour(){tour=null;guide.hidden=true;byId('galaxy-journeys').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed','false'));requestAnimationFrame(drawLinks);}
    byId('galaxy-next').addEventListener('click',()=>{if(!tour)return;if(step===tour.steps.length-1){closeTour();return;}step++;renderStep();});
    byId('galaxy-previous').addEventListener('click',()=>{if(tour&&step>0){step--;renderStep();}});
    byId('galaxy-close').addEventListener('click',closeTour);
    byId('galaxy-reset').addEventListener('click',()=>{closeTour();select('edge');});
    function setMotion(){view.classList.toggle('galaxy-paused',motionPaused||document.hidden);byId('galaxy-motion').textContent=motionPaused?'Resume motion ▷':'Pause motion Ⅱ';byId('galaxy-motion').setAttribute('aria-pressed',String(motionPaused));view.dispatchEvent(new Event('galaxy:motion'));}
    byId('galaxy-motion').addEventListener('click',()=>{motionPaused=!motionPaused;setMotion();});
    reduced.addEventListener('change',()=>{motionPaused=reduced.matches;setMotion();});setMotion();
    const date=value=>value?new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}).format(new Date(value)):'Unknown';
    function feedback(text,error=false){byId('github-feedback').textContent=text;byId('github-feedback').classList.toggle('error',error);}
    function renderFiles(){
      const list=byId('galaxy-file-list');list.replaceChildren();
      const n=byNode.get(selected),query=byId('galaxy-file-search').value.toLowerCase().trim();
      const files=(data?.files||[]).filter(n.matches).filter(path=>!query||path.toLowerCase().includes(query));
      byId('galaxy-files-title').textContent=n.name+' / source';byId('galaxy-file-total').textContent=String(files.length);
      if(!files.length){list.append(make('p','',data?'No matching source files in this component.':'Load source data to inspect the current files.'));return;}
      files.forEach(path=>{
        const link=make('a');link.href='https://github.com/'+REPOSITORY+'/blob/'+data.sha+'/'+path.split('/').map(encodeURIComponent).join('/');link.target='_blank';link.rel='noreferrer';
        link.append(make('span','',path),make('small','','↗'));list.append(link);
      });
    }
    byId('galaxy-file-search').addEventListener('input',renderFiles);
    byId('galaxy-show-files').addEventListener('click',()=>{byId('galaxy-files').scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'start'});});
    function renderData(next){
      if(next.schema!==2||!Array.isArray(next.files)||!Array.isArray(next.commits)||!/^[0-9a-f]{40}$/.test(next.sha))throw new Error('invalid_snapshot');
      data={...next,files:activeFiles(next.files)};
      byId('github-account-label').textContent=REPOSITORY+' / '+BRANCH;
      byId('github-sync-label').textContent=(data.source==='github'?'SOURCE CHECKED · ':'SAVED SNAPSHOT · ')+date(data.checkedAt)+(data.cacheAgeSeconds?' · cached '+data.cacheAgeSeconds+'s':'');
      byId('galaxy-signal').className='galaxy-signal '+(data.source==='github'?'fresh':'saved');
      byId('galaxy-branch').textContent=BRANCH;byId('galaxy-file-count').textContent=data.files.length;
      byId('galaxy-commit').textContent=data.sha.slice(0,7)+' ↗';byId('galaxy-commit').href='https://github.com/'+REPOSITORY+'/commit/'+data.sha;
      const deploy=byId('galaxy-deploy'),run=data.deployment;
      if(run){deploy.textContent=(run.status==='completed'?(run.conclusion==='success'?'Succeeded':run.conclusion||'Finished'):'In progress')+' · '+run.sha.slice(0,7);deploy.href=run.url;deploy.title='GitHub workflow status. This is not a runtime health check.';}
      else{deploy.textContent='Not available';deploy.removeAttribute('href');}
      SYSTEMS.forEach(n=>{const count=data.files.filter(n.matches).length;buttons.get(n.id).querySelector('.galaxy-node-count').textContent=count+' SOURCE FILE'+(count===1?'':'S');});
      const activity=byId('galaxy-activity-list');activity.replaceChildren();
      data.commits.slice(0,5).forEach(commit=>{
        const article=make('article'),link=make('a','',commit.message);link.href='https://github.com/'+REPOSITORY+'/commit/'+commit.sha;link.target='_blank';link.rel='noreferrer';
        article.append(link,make('small','',date(commit.date)+' · '+commit.sha.slice(0,7)));activity.append(article);
      });
      renderFiles();requestAnimationFrame(drawLinks);
    }
    async function load(force=false){
      if(busy)return;
      if(!force&&(document.hidden||!view.classList.contains('active')))return;
      busy=true;lastAttempt=Date.now();const refresh=byId('github-refresh');refresh.disabled=true;refresh.setAttribute('aria-busy','true');feedback('Checking the current main branch on GitHub…');
      try{
        const response=await fetch('/control/api/github/status',{credentials:'same-origin',cache:'no-store',headers:{accept:'application/json'}});
        if(response.status===401){feedback('Your session has expired. Sign in again to refresh Galaxy.',true);return;}
        if(response.status===403){feedback('This account does not have access to GitHub Galaxy.',true);return;}
        if(!response.ok)throw new Error('github_unavailable');
        renderData(await response.json());feedback('Current main, checked '+date(data.checkedAt)+'. Automatic checks every 5 minutes while this view is open; a 90-second cache protects the GitHub rate limit. This is not a streaming health monitor.');
      }catch{
        if(data){feedback('GitHub could not be reached. Keeping the last successful source check from '+date(data.checkedAt)+'. No new live data has been received.',true);byId('galaxy-signal').className='galaxy-signal saved';}
        else try{
          const response=await fetch('/control/data/github-galaxy.json',{credentials:'same-origin',cache:'no-store'});
          if(!response.ok)throw new Error('snapshot_unavailable');renderData({...await response.json(),source:'deployment-snapshot'});
          feedback('GitHub is temporarily unavailable. Showing the deployment snapshot from '+date(data.checkedAt)+'. Use Refresh to try again; this copy is not live.',true);
        }catch{feedback('Source data is unavailable. The architecture explanation still works; file counts and deployment status are not being claimed.',true);}
      }finally{busy=false;refresh.disabled=false;refresh.setAttribute('aria-busy','false');}
    }
    byId('github-refresh').addEventListener('click',()=>load(true));
    new ResizeObserver(()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(drawLinks);}).observe(map);
    addEventListener('homelab:view',event=>{if(event.detail==='github'){requestAnimationFrame(drawLinks);if(!data||Date.now()-lastAttempt>300000)load(true);}});
    document.addEventListener('visibilitychange',()=>{setMotion();if(!document.hidden&&view.classList.contains('active')&&Date.now()-lastAttempt>300000)load();});
    setInterval(()=>load(),300000);
    select('edge');drawLinks();
    let graphicsLoaded=false;
    const graphicsObserver=new IntersectionObserver(entries=>{if(graphicsLoaded||!entries.some(e=>e.isIntersecting))return;graphicsLoaded=true;graphicsObserver.disconnect();import('./galaxy-sculpture.js?v=20260928atlas').then(m=>m.mountSculptures(view,SYSTEMS)).catch(()=>{});},{rootMargin:'200px'});
    graphicsObserver.observe(map);
    await load(true);
  }
})();
