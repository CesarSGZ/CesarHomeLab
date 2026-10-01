const $=(s,c=document)=>c.querySelector(s),$$=(s,c=document)=>[...c.querySelectorAll(s)];

const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');

const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible','in-view')}),{threshold:.18});$$('.reveal,.skill-card').forEach(el=>observer.observe(el));

function updateTrajectoryState(){
  const max=document.documentElement.scrollHeight-innerHeight;
  $('.progress span').style.width=(scrollY/max*100)+'%';
  $$('.nav-wrap nav a').forEach(link=>{const section=$(link.getAttribute('href')),box=section.getBoundingClientRect();if(box.top<=innerHeight*.4&&box.bottom>innerHeight*.4)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current')});
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


const experienceContent=[
  {title:'Project Management Office – A330 MRTT & Strategic R&D Programmes',company:'AIRBUS · TANKER, TRANSPORT & MISSION AIRCRAFT',description:'Supporting programme execution for A330 MRTT and strategic R&D initiatives, coordinating engineering, operations, business development, finance, procurement and senior stakeholders. Consolidating actions, risks, budgets, schedules and deliverables into clear follow-up and decision-ready reporting.'},
  {title:'Eurodrone Powerplant Systems Engineer – V&V and Testing',company:'AIRBUS · EURODRONE POWERPLANT',description:'Worked on requirements, V&V and test preparation for the Eurodrone powerplant, covering engine, nacelle, propeller, control, electrical and avionics interfaces. Prepared verification logic, Means of Compliance, lifecycle-review evidence and supplier work packages for bird-strike, icing and engine-integration facilities.'},
  {title:'BI, SAP BW & HANA Technical Expert',company:'AIRBUS · PROCUREMENT & SUPPLY CHAIN',description:'Delivered SAP BW/HANA analytics, reporting and data-process flows for procurement and supply-chain teams, translating business needs into structured models, automated processes and decision-ready information.'},
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
  ...$$('.atlas-index-skill strong').map(node=>node.textContent.trim()),
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

// Magnetic call-to-action movement, intentionally restrained.
$$('.button').forEach(b=>{b.addEventListener('pointermove',e=>{if(reducedMotion.matches||e.pointerType!=='mouse')return;const r=b.getBoundingClientRect();b.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.04}px,${(e.clientY-r.top-r.height/2)*.06}px)`});b.addEventListener('pointerleave',()=>b.style.transform='')});
