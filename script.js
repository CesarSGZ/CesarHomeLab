const $=(s,c=document)=>c.querySelector(s),$$=(s,c=document)=>[...c.querySelectorAll(s)];

// Ambient starfield reacts subtly to the pointer.
const canvas=$('#stars'),ctx=canvas.getContext('2d');let stars=[],mx=0,my=0;
function resize(){canvas.width=innerWidth*devicePixelRatio;canvas.height=innerHeight*devicePixelRatio;ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);stars=Array.from({length:Math.min(170,Math.floor(innerWidth/7))},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:Math.random()*1.2+.2,a:Math.random()*.65+.15,s:Math.random()*.09+.015}))}
function draw(){ctx.clearRect(0,0,innerWidth,innerHeight);for(const s of stars){s.y+=s.s;if(s.y>innerHeight)s.y=0;ctx.beginPath();ctx.arc(s.x+mx*.008,s.y+my*.008,s.r,0,Math.PI*2);ctx.fillStyle=`rgba(220,245,245,${s.a})`;ctx.fill()}requestAnimationFrame(draw)}
addEventListener('resize',resize);addEventListener('pointermove',e=>{mx=e.clientX-innerWidth/2;my=e.clientY-innerHeight/2});resize();draw();

const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible','in-view')}),{threshold:.18});$$('.reveal,.skill-card').forEach(el=>observer.observe(el));

function updateTrajectoryState(){
  const max=document.documentElement.scrollHeight-innerHeight;
  $('.progress span').style.width=(scrollY/max*100)+'%';
  const log=$('.flight-log'),line=$('.timeline-line span'),entries=$$('.log-entry');
  if(!log)return;
  const r=log.getBoundingClientRect(),focus=innerHeight*.44,p=Math.max(0,Math.min(1,(focus-r.top)/r.height));
  const timeline=$('.timeline-line'),deloitte=$('.company-deloitte'),ey=$('.company-ey'),timelineHeight=timeline?.offsetHeight||r.height;
  if(timeline&&timelineHeight&&deloitte&&ey){
    const deloitteStop=Math.max(0,Math.min(100,deloitte.offsetTop/timelineHeight*100));
    const eyStop=Math.max(deloitteStop,Math.min(100,ey.offsetTop/timelineHeight*100));
    line.style.background=`linear-gradient(to bottom,#0066b3 0 ${deloitteStop}%,#477d13 ${deloitteStop}% ${eyStop}%,#8a6900 ${eyStop}% 100%)`;
    line.style.backgroundSize=`100% ${timelineHeight}px`;
  }
  line.style.height=(p*100)+'%';
  let nearest=null,distance=Infinity;
  entries.forEach(entry=>{const box=entry.getBoundingClientRect(),d=Math.abs(box.top+Math.min(box.height*.38,180)-focus);if(d<distance){distance=d;nearest=entry}});
  if(nearest&&r.top<innerHeight*.82&&r.bottom>innerHeight*.18)entries.forEach(entry=>entry.classList.toggle('active',entry===nearest));
}
addEventListener('scroll',updateTrajectoryState,{passive:true});
addEventListener('resize',updateTrajectoryState);

// The capability map behaves like a navigable star chart rather than a card grid.
const skillMap=$('#skill-constellation');
const skillField=$('.node-field',skillMap);
const skillCanvas=$('#constellation-lines');
const skillContext=skillCanvas?.getContext('2d');
const skillNodes=$$('.cap-node',skillMap);
const skillColors={programme:'#c9ff3d',engineering:'#52d9ff',data:'#ba8cff'};
let constellationFilter='all';

function placeSkillNode(node,x,y,index){
  // Keep the central mission core readable by pushing nearby stars to its orbit.
  const dx=x-.5,dy=y-.41,coreDistance=Math.sqrt((dx/.145)**2+(dy/.175)**2);
  if(coreDistance<1){
    const scale=1.12/Math.max(coreDistance,.12);
    x=.5+dx*scale;
    y=.41+dy*scale;
  }
  node.style.setProperty('--star-x',`${Math.max(.035,Math.min(.965,x))*100}%`);
  node.style.setProperty('--star-y',`${Math.max(.055,Math.min(.92,y))*100}%`);
  node.style.setProperty('--star-size',`${10+(index%7===0?6:index%3===0?3:0)}px`);
  node.style.setProperty('--star-z',`${-24+(index*29)%78}px`);
  node.style.setProperty('--depth-scale',`${.9+((index*17)%28)/100}`);
  node.classList.toggle('major',index%5===0);
  node.classList.remove('label-east','label-west','label-north','label-south');
  const labelDirection=x<.16?'label-east':x>.84?'label-west':index%2?'label-north':'label-south';
  node.classList.add(labelDirection);
  node.dataset.constellationIndex=index;
}

function layoutConstellation(filter=constellationFilter){
  if(!skillMap)return;
  const visible=skillNodes.filter(node=>filter==='all'||node.dataset.category===filter);
  const allPositions={
    programme:[[.07,.14],[.20,.08],[.34,.13],[.13,.27],[.29,.25],[.41,.30],[.06,.42],[.20,.42],[.36,.44],[.10,.59],[.25,.57],[.41,.60],[.08,.76],[.23,.73],[.38,.78]],
    engineering:[[.58,.10],[.70,.07],[.83,.10],[.94,.15],[.62,.23],[.75,.21],[.87,.25],[.96,.31],[.57,.39],[.70,.38],[.83,.41],[.94,.46],[.65,.52],[.82,.53]],
    data:[[.56,.64],[.69,.60],[.82,.63],[.94,.59],[.61,.76],[.74,.74],[.87,.77],[.96,.72],[.67,.87],[.82,.87],[.93,.86]]
  };
  if(skillMap.clientWidth<900){
    const compactNodes=filter==='all'
      ? ['programme','engineering','data'].flatMap(category=>skillNodes.filter(node=>node.dataset.category===category))
      : visible;
    const rows=Math.ceil(compactNodes.length/2);
    compactNodes.forEach((node,index)=>{
      const column=index%2,row=Math.floor(index/2);
      placeSkillNode(node,column?.86:.14,.055+row*(.86/Math.max(rows-1,1)),index);
    });
  }else if(filter==='all'){
    Object.entries(allPositions).forEach(([category,positions])=>{
      skillNodes.filter(node=>node.dataset.category===category).forEach((node,index)=>placeSkillNode(node,...positions[index],index));
    });
  }else{
    visible.forEach((node,index)=>{
      const columns=Math.min(5,Math.ceil(Math.sqrt(visible.length*1.5)));
      const row=Math.floor(index/columns),column=index%columns;
      const rows=Math.ceil(visible.length/columns);
      const x=.09+column*(.82/Math.max(columns-1,1))+(row%2?.025:-.015);
      const y=.12+row*(.72/Math.max(rows-1,1));
      placeSkillNode(node,x,y,index);
    });
  }
  const animationStarted=performance.now();
  function redrawWhileMoving(now){
    drawConstellation();
    if(now-animationStarted<820)requestAnimationFrame(redrawWhileMoving);
  }
  requestAnimationFrame(redrawWhileMoving);
}

function skillPoint(node,canvasRect){
  const box=node.getBoundingClientRect();
  return {x:box.left+box.width/2-canvasRect.left,y:box.top+box.height/2-canvasRect.top};
}

function strokeConnection(a,b,color,alpha=.18,width=.8){
  skillContext.beginPath();
  skillContext.moveTo(a.x,a.y);
  skillContext.lineTo(b.x,b.y);
  skillContext.strokeStyle=color;
  skillContext.globalAlpha=alpha;
  skillContext.lineWidth=width;
  skillContext.stroke();
}

function drawConstellation(){
  if(!skillCanvas||!skillContext)return;
  const rect=skillCanvas.getBoundingClientRect();
  if(!rect.width||!rect.height)return;
  const ratio=Math.min(devicePixelRatio||1,2);
  skillCanvas.width=Math.round(rect.width*ratio);
  skillCanvas.height=Math.round(rect.height*ratio);
  skillContext.setTransform(ratio,0,0,ratio,0,0);
  skillContext.clearRect(0,0,rect.width,rect.height);
  skillContext.lineCap='round';

  Object.keys(skillColors).forEach(category=>{
    const nodes=skillNodes.filter(node=>!node.classList.contains('hide')&&node.dataset.category===category);
    const points=nodes.map(node=>({node,...skillPoint(node,rect)}));
    const edges=new Set();
    points.forEach((point,index)=>{
      points
        .map((other,otherIndex)=>({other,otherIndex,distance:Math.hypot(point.x-other.x,point.y-other.y)}))
        .filter(item=>item.otherIndex!==index)
        .sort((a,b)=>a.distance-b.distance)
        .slice(0,2)
        .forEach(({other,otherIndex})=>{
          const key=[index,otherIndex].sort((a,b)=>a-b).join(':');
          if(!edges.has(key)){
            edges.add(key);
            strokeConnection(point,other,skillColors[category],.17,.75);
          }
        });
    });
  });

  const selected=skillNodes.find(node=>node.classList.contains('selected')&&!node.classList.contains('hide'));
  if(selected){
    const origin=skillPoint(selected,rect);
    skillNodes
      .filter(node=>node!==selected&&!node.classList.contains('hide'))
      .map(node=>({point:skillPoint(node,rect)}))
      .sort((a,b)=>Math.hypot(origin.x-a.point.x,origin.y-a.point.y)-Math.hypot(origin.x-b.point.x,origin.y-b.point.y))
      .slice(0,5)
      .forEach(({point})=>strokeConnection(origin,point,skillColors[selected.dataset.category],.62,1.15));
  }
  skillContext.globalAlpha=1;
}

function setConstellationFilter(filter){
  constellationFilter=filter;
  $$('.filter').forEach(button=>{
    const active=button.dataset.filter===filter;
    button.classList.toggle('active',active);
    button.setAttribute('aria-pressed',active);
  });
  skillNodes.forEach(node=>{
    const hidden=filter!=='all'&&node.dataset.category!==filter;
    node.classList.toggle('hide',hidden);
    node.setAttribute('aria-hidden',hidden);
    node.tabIndex=hidden?-1:0;
    if(hidden){
      node.classList.remove('selected');
      node.setAttribute('aria-pressed','false');
    }
  });
  $$('.constellation-label',skillMap).forEach(label=>{
    const category=label.classList.contains('label-programme')?'programme':label.classList.contains('label-engineering')?'engineering':'data';
    label.classList.toggle('dim',filter!=='all'&&filter!==category);
  });
  skillMap.dataset.activeConstellation=filter;
  skillMap.style.setProperty('--readout-color',filter==='all'?'var(--acid)':skillColors[filter]);
  $('#node-code').textContent=filter==='all'?'SYSTEM MAP':`${filter.toUpperCase()} / CONSTELLATION`;
  $('#node-title').textContent=filter==='all'?`${skillNodes.length} connected capabilities`:`${skillNodes.filter(node=>node.dataset.category===filter).length} ${filter} capabilities`;
  $('#node-detail').textContent='Select any visible star to inspect where this capability has been applied.';
  layoutConstellation(filter);
}

$$('.filter').forEach(btn=>btn.addEventListener('click',()=>setConstellationFilter(btn.dataset.filter)));

skillNodes.forEach(node=>{
  node.setAttribute('aria-pressed','false');
  node.addEventListener('click',()=>{
    skillNodes.forEach(item=>{item.classList.remove('selected');item.setAttribute('aria-pressed','false')});
    node.classList.add('selected');
    node.setAttribute('aria-pressed','true');
    skillMap.style.setProperty('--readout-color',skillColors[node.dataset.category]);
    $('#node-code').textContent=`${node.dataset.code} / ${node.dataset.category.toUpperCase()}`;
    $('#node-title').textContent=node.querySelector('strong').textContent;
    $('#node-detail').textContent=node.dataset.detail;
    requestAnimationFrame(drawConstellation);
  });
});

if(skillMap&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
  skillMap.addEventListener('pointermove',event=>{
    const rect=skillMap.getBoundingClientRect();
    skillField.style.setProperty('--parallax-x',`${((event.clientX-rect.left)/rect.width-.5)*-7}px`);
    skillField.style.setProperty('--parallax-y',`${((event.clientY-rect.top)/rect.height-.5)*-5}px`);
    skillField.style.setProperty('--tilt-x',`${((event.clientY-rect.top)/rect.height-.5)*-3.2}deg`);
    skillField.style.setProperty('--tilt-y',`${((event.clientX-rect.left)/rect.width-.5)*4.2}deg`);
    requestAnimationFrame(drawConstellation);
  });
  skillMap.addEventListener('pointerleave',()=>{
    skillField.style.setProperty('--parallax-x','0px');
    skillField.style.setProperty('--parallax-y','0px');
    skillField.style.setProperty('--tilt-x','0deg');
    skillField.style.setProperty('--tilt-y','0deg');
    requestAnimationFrame(drawConstellation);
  });
}
let constellationWidth=skillMap.clientWidth;
new ResizeObserver(()=>{
  const nextWidth=skillMap.clientWidth;
  if(Math.abs(nextWidth-constellationWidth)>2){
    constellationWidth=nextWidth;
    layoutConstellation();
  }else requestAnimationFrame(drawConstellation);
}).observe(skillMap);
setConstellationFilter('all');

// Keep company tenure and role progression readable without inventing hidden LinkedIn dates.
const tenureLabels=[
  ['APR 2024 — PRESENT · 2 YRS 4 MOS','AIRBUS · GETAFE · MRTT'],
  ['MAY 2023 — APR 2024 · 1 YR','AIRBUS · GETAFE · EURODRONE'],
  ['OCT 2022 — MAY 2023 · 8 MOS','AIRBUS · GETAFE · PROCUREMENT & SUPPLY CHAIN'],
  ['MAY 2022 — OCT 2022 · 6 MOS','DELOITTE · MADRID · STELLANTIS C1ST'],
  ['NOV 2021 — APR 2022 · 6 MOS','EY · MADRID · MULTI-INDUSTRY R&D']
];
$$('.log-entry').forEach((entry,index)=>{
  const meta=entry.querySelector('.log-meta');
  if(meta&&tenureLabels[index]) meta.innerHTML=`<span>${tenureLabels[index][0]}</span><small>${tenureLabels[index][1]}</small>`;
});

const experienceContent=[
  {title:'Programme Management Office – Military Aircraft Strategic Programmes',company:'AIRBUS · TANKER, TRANSPORT & MISSION AIRCRAFT',description:'Programme and Project Management across MRTT and derivative-aircraft campaigns, offers and strategic programmes. PMO Manager for the UAE MRTT fleet; responsible for business development, internal developments, product policy, R&D portfolio management, Integrated Product Roadmap and Integrated Business Planning activities.'},
  {title:'Systems Engineer (V&V and Testing) – Eurodrone Powerplant',company:'AIRBUS · EURODRONE POWERPLANT',description:'Designed testing plans and processes for the Eurodrone powerplant, coordinated suppliers for test benches and nacelle equipment, supported SRR and PDR development phases, managed V&V documentation and aircraft requirements for nacelle, engine, control and monitoring, performance and certification.'},
  {title:'BI, SAP BW & HANA Technical Expert',company:'AIRBUS · PROCUREMENT & SUPPLY CHAIN',description:'Designed Business Intelligence solutions with SAP Analytics Cloud and Analysis for Office, modelled data structures in SAP BW and HANA Studio, and delivered supply-chain and procurement analytics in close collaboration with internal clients.'},
  {title:'Salesforce Analyst',company:'DELOITTE · STELLANTIS C1ST',description:'Certified Salesforce CRM administrator and functional developer for Stellantis’ C1ST sales platform, translating commercial processes and user needs into reliable platform configuration.'},
  {title:'Research and Development Consultant',company:'EY · R&D AND TECHNOLOGICAL INNOVATION',description:'Certified deductions, bonuses and public-aid eligibility for R&D and technological-innovation projects across defence, AI, manufacturing, energy and chemistry.'}
];
$$('.log-entry').forEach((entry,index)=>{
  const item=experienceContent[index]; if(!item)return;
  entry.querySelector('h3').textContent=item.title;
  entry.querySelector('.role-description').textContent=item.description;
});

// Build a seamless full-width index from every capability and role skill already on the page.
const marqueeSkills=[...new Set([
  ...$$('.cap-node strong').map(node=>node.textContent.trim()),
  ...$$('.log-content li').map(item=>item.textContent.trim())
])];
const marqueeText=marqueeSkills.join('  ·  ')+'  ·  ';
const marqueeTrack=$('.tool-marquee-track');
if(marqueeTrack){
  const first=document.createElement('span'),second=document.createElement('span');
  first.textContent=marqueeText;
  second.textContent=marqueeText;
  second.setAttribute('aria-hidden','true');
  marqueeTrack.append(first,second);
}
updateTrajectoryState();

const contactEmail='cesarsollagonzalez@gmail.com';
const contactToast=$('#contact-toast');
let contactToastTimer;
function legacyCopyEmail(){
  const fallback=document.createElement('textarea');
  fallback.value=contactEmail;
  fallback.setAttribute('readonly','');
  fallback.style.position='fixed';
  fallback.style.opacity='0';
  document.body.append(fallback);
  fallback.select();
  document.execCommand('copy');
  fallback.remove();
}
function copyContactEmail(event){
  event.preventDefault();
  if(navigator.clipboard?.writeText)navigator.clipboard.writeText(contactEmail).catch(legacyCopyEmail);
  else legacyCopyEmail();
  contactToast.classList.add('visible');
  clearTimeout(contactToastTimer);
  contactToastTimer=setTimeout(()=>contactToast.classList.remove('visible'),2600);
}
$$('[data-copy-email]').forEach(link=>link.addEventListener('click',copyContactEmail));

const capabilityContext={
  'PM.01':'Budgeting, cost control and business-case development used in Airbus aerospace projects to connect scope, resources and financial impact.',
  'PM.02':'Risk identification, assessment, mitigation and senior communication applied across R&D, testing, obsolescence and strategic Airbus initiatives.',
  'PM.03':'Integrated planning from offer phase through execution, using Microsoft Project, BigPicture and comparable planning environments.',
  'PM.04':'Stakeholder management and negotiation with clients, suppliers, cross-functional engineering teams and senior management in defence programmes.',
  'PM.05':'RFI, RFP and PTS analysis plus bidding and contract support, developed in programme-management and consulting environments.',
  'PM.06':'Technical and executive reporting used to turn complex programme status, plans and risks into clear management decisions.',
  'PM.07':'Lifecycle thinking from concept and certification to market introduction, applied across aerospace systems and product strategy work.',
  'SE.01':'Requirements definition, traceability and management with Excel, DOORS and CAMEO during Airbus powerplant systems engineering.',
  'SE.02':'Validation and Verification of Eurodrone certification requirements, ensuring every requirement connects to defensible evidence.',
  'SE.03':'ARP4754A and ISO 15288 systems-engineering principles applied to complex aerospace development, reviews and verification activity.',
  'SE.04':'Certification compliance involving CS-23, DO-160, safety, fire protection, electrical, avionics and structural domains.',
  'SE.05':'Definition and execution of nacelle integration, bird-strike, icing and equipment test plans for Eurodrone propulsion systems.',
  'SE.06':'Participation in SRR, PDR and CDR design reviews, together with quality and programme maturity gates at Airbus.',
  'SE.07':'Technical selection and coordination of equipment and test-bench suppliers, bridging engineering requirements and external delivery.',
  'DT.01':'SAP BW modelling with transformations, ADSOs, DataSources, DTPs and process chains for Airbus procurement and supply-chain reporting.',
  'DT.02':'KPI storytelling with SAP Analytics Cloud, Analysis for Office, Tableau and Qlik Sense for operational and executive audiences.',
  'DT.03':'Python, C, VBA and Google Apps Script used to process data, automate repetitive work and improve reporting efficiency.',
  'DT.04':'Salesforce administration and functional development on Stellantis’ C1ST platform at Deloitte, translating user needs into configuration.',
  'DT.05':'Agile delivery with JIRA and Scrum at Deloitte, combined with structured Waterfall governance in complex aerospace programmes.',
  'DT.06':'Advanced Microsoft Office and Google Workspace usage for analysis, plans, reporting, collaboration and automation across roles.'
};
$$('.cap-node').forEach(node=>{
  if(capabilityContext[node.dataset.code])node.dataset.detail=capabilityContext[node.dataset.code];
  node.setAttribute('aria-label',`${node.querySelector('strong').textContent}. ${node.dataset.detail}`);
});

// Magnetic call-to-action movement, intentionally restrained.
$$('.button').forEach(b=>{b.addEventListener('pointermove',e=>{const r=b.getBoundingClientRect();b.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.08}px,${(e.clientY-r.top-r.height/2)*.12}px)`});b.addEventListener('pointerleave',()=>b.style.transform='')});
