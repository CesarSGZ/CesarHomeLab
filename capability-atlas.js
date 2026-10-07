/* Content remains in semantic HTML; WebGL is a progressive enhancement. */
(() => {
  'use strict';
  const atlas = document.getElementById('capability-atlas');
  if (!atlas) return;
  const byId = id => document.getElementById(id);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 680px)');
  const colours = {programme:'#d5e99a',engineering:'#83d7ed',data:'#bba8f1'};
  const rgb = {programme:'213,233,154',engineering:'131,215,237',data:'187,168,241'};
  const names = {programme:'Management',engineering:'Engineering',data:'Data'};
  const experiences = {
    mrtt: { label: 'A330 MRTT', company: 'AIRBUS DEFENCE & SPACE', title: 'MRTT & strategic R&D programmes', core: 'MRTT &\nstrategic R&D.', eyebrow: 'AIRBUS / PROGRAMMES', anchor: 'role-mrtt' },
    eurodrone: { label: 'Eurodrone', company: 'AIRBUS DEFENCE & SPACE', title: 'Powerplant systems · V&V and testing', core: 'Eurodrone\npowerplant.', eyebrow: 'AIRBUS / EURODRONE', anchor: 'role-eurodrone' },
    analytics: { label: 'Airbus analytics', company: 'AIRBUS · PROCUREMENT & SUPPLY CHAIN', title: 'BI, SAP BW & HANA technical work', core: 'Data into\ndecisions.', eyebrow: 'AIRBUS / ANALYTICS', anchor: 'role-analytics' },
    salesforce: { label: 'Salesforce', company: 'DELOITTE · STELLANTIS', title: 'C1ST sales platform · Salesforce Analyst', core: 'Business meets\ntechnology.', eyebrow: 'DELOITTE / C1ST', anchor: 'role-salesforce' },
    rd: { label: 'R&D consulting', company: 'EY · RESEARCH & DEVELOPMENT', title: 'Technical assessment & project documentation', core: 'Innovation,\nmade clear.', eyebrow: 'EY / R&D', anchor: 'role-rd' },
    studies: { label: 'Study & projects', company: 'ACADEMIC & PERSONAL PROJECTS', title: 'Aerospace degrees · modelling & programming', core: 'Engineering\nin practice.', eyebrow: 'EDUCATION / PROJECTS', anchor: 'credentials' }
  };
  // These links describe complementary work, grounded in the portfolio's roles.
  // They are deliberately curated; distance is not a proficiency ranking.
  const context = {
    'PM.01': { at: ['mrtt'], with: ['PM.09', 'PM.03', 'PM.14', 'DT.07'] },
    'PM.02': { at: ['mrtt'], with: ['PM.03', 'SE.03', 'PM.06'] },
    'PM.03': { at: ['mrtt'], with: ['PM.13', 'PM.11', 'PM.02'] },
    'PM.04': { at: ['mrtt', 'salesforce'], with: ['PM.11', 'DT.04', 'PM.05'] },
    'PM.05': { at: ['mrtt'], with: ['PM.10', 'SE.10', 'PM.01'] },
    'PM.06': { at: ['mrtt', 'rd'], with: ['DT.01', 'DT.07', 'PM.08'] },
    'PM.07': { at: ['mrtt', 'eurodrone'], with: ['SE.02', 'SE.04', 'PM.12'] },
    'PM.08': { at: ['mrtt'], with: ['PM.14', 'PM.06', 'PM.02'] },
    'PM.09': { at: ['mrtt'], with: ['PM.01', 'PM.13', 'PM.03'] },
    'PM.10': { at: ['mrtt'], with: ['PM.05', 'PM.12', 'PM.04'] },
    'PM.11': { at: ['mrtt', 'eurodrone', 'salesforce'], with: ['PM.04', 'SE.09', 'DT.04'] },
    'PM.12': { at: ['mrtt'], with: ['PM.07', 'PM.10', 'SE.10'] },
    'PM.13': { at: ['mrtt'], with: ['PM.03', 'PM.09', 'PM.14'] },
    'PM.14': { at: ['mrtt'], with: ['PM.03', 'PM.08', 'PM.06'] },
    'PM.15': { at: ['mrtt', 'salesforce'], with: ['PM.03', 'SE.02', 'DT.06'] },
    'SE.01': { at: ['eurodrone'], with: ['SE.10', 'SE.03', 'SE.06', 'DT.04'] },
    'SE.02': { at: ['eurodrone'], with: ['SE.05', 'SE.06', 'SE.08'] },
    'SE.03': { at: ['eurodrone'], with: ['SE.04', 'SE.08', 'SE.11'] },
    'SE.04': { at: ['eurodrone'], with: ['SE.03', 'SE.06', 'SE.05'] },
    'SE.05': { at: ['eurodrone'], with: ['SE.01', 'SE.02', 'SE.03'] },
    'SE.06': { at: ['eurodrone', 'rd'], with: ['SE.01', 'SE.04', 'PM.06'] },
    'SE.07': { at: ['eurodrone', 'mrtt'], with: ['SE.11', 'PM.14', 'PM.07'] },
    'SE.08': { at: ['eurodrone'], with: ['SE.03', 'SE.02', 'SE.09'] },
    'SE.09': { at: ['eurodrone'], with: ['SE.11', 'SE.01', 'PM.11'] },
    'SE.10': { at: ['eurodrone', 'mrtt'], with: ['SE.01', 'PM.12', 'DT.04'] },
    'SE.11': { at: ['eurodrone'], with: ['SE.09', 'SE.03', 'DT.09'] },
    'DT.01': { at: ['analytics'], with: ['DT.07', 'DT.03', 'PM.06'] },
    'DT.02': { at: ['analytics', 'studies'], with: ['DT.03', 'DT.08', 'DT.05'] },
    'DT.03': { at: ['analytics'], with: ['DT.05', 'DT.01', 'DT.02'] },
    'DT.04': { at: ['analytics', 'salesforce'], with: ['PM.04', 'DT.06', 'SE.10'] },
    'DT.05': { at: ['analytics'], with: ['DT.03', 'DT.07', 'DT.01'] },
    'DT.06': { at: ['salesforce'], with: ['DT.04', 'PM.15', 'PM.04'] },
    'DT.07': { at: ['analytics'], with: ['DT.01', 'DT.05', 'PM.06'] },
    'DT.08': { at: ['studies'], with: ['DT.02', 'DT.09', 'DT.05'] },
    'DT.09': { at: ['studies'], with: ['DT.08', 'SE.11', 'SE.09'] }
  };

  const skills = [...atlas.querySelectorAll('.atlas-index-skill')].map(source => ({
    code: source.dataset.code, category: source.dataset.category,
    name: source.querySelector('strong').textContent.trim(), description: source.dataset.detail,
    source, ...context[source.dataset.code]
  }));
  const byCode = new Map(skills.map(s => [s.code,s]));
  const worlds = [...atlas.querySelectorAll('[data-world]')];
  const roleIds = ['role-mrtt','role-eurodrone','role-analytics','role-salesforce','role-rd'];
  document.querySelectorAll('.log-entry').forEach((entry,i) => {if(roleIds[i]) entry.id=roleIds[i];});
  const node = (tag, value) => {const e=document.createElement(tag);if(value)e.textContent=value;return e;};
  let category='programme', pinned='PM.01', shown='', previewTimer;
  const remembered = {programme:'PM.01',engineering:'SE.01',data:'DT.01'};
  const updateHint=()=>{atlas.querySelector('.library-head span:last-child').textContent=mobile.matches?'TAP A SKILL TO EXPLORE':'HOVER TO EXPLORE · CLICK TO HOLD';};
  updateHint();mobile.addEventListener('change',updateHint);
  byId('atlas-back').addEventListener('click',()=>{byId('atlas-stage').scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'start'});});
  function show(code, announce=false) {
    const skill=byCode.get(code);
    if(!skill) return;
    atlas.style.setProperty('--signal',colours[skill.category]);
    atlas.style.setProperty('--signal-rgb',rgb[skill.category]);
    skills.forEach(s=>{
      s.source.classList.toggle('is-selected',s.code===code);
      s.source.classList.toggle('is-connected',skill.with.includes(s.code));
      s.source.setAttribute('aria-pressed',String(s.code===pinned));
    });
    if(shown===code) return;
    shown=code;
    byId('atlas-detail-category').textContent=names[skill.category].toUpperCase();
    byId('atlas-detail-code').textContent=code;
    byId('atlas-detail-title').textContent=skill.name;
    byId('atlas-detail-description').textContent=skill.description;
    atlas.querySelector('.story-watermark').textContent=code.split('.')[1];
    const evidence=byId('atlas-evidence-list'); evidence.replaceChildren();
    skill.at.forEach(id=>{
      const info=experiences[id], a=node('a');a.href='#'+info.anchor;
      a.append(node('small',info.company),node('strong',info.title));evidence.append(a);
    });
    const links=byId('atlas-related-list');links.replaceChildren();
    skill.with.forEach(id=>{
      const related=byCode.get(id),b=node('button',related.name);b.type='button';
      b.style.setProperty('--related-color',colours[related.category]);
      b.addEventListener('click',()=>select(id,true));links.append(b);
    });
    if(!reduced.matches)byId('atlas-detail-content').animate([{opacity:.35,transform:'translateY(7px)'},{opacity:1,transform:'translateY(0)'}],{duration:240,easing:'ease-out'});
    atlas.dispatchEvent(new CustomEvent('signalchange',{detail:{category:skill.category,index:skills.filter(s=>s.category===skill.category).indexOf(skill)}}));
    if(announce)byId('atlas-announcement').textContent=skill.name+'. '+skill.description;
  }
  function changeCategory(next) {
    category=next;
    worlds.forEach(b=>{const active=b.dataset.world===category;b.classList.toggle('is-active',active);b.setAttribute('aria-pressed',String(active));});
    skills.forEach(s=>{s.source.hidden=s.category!==category;});
    byId('atlas-library-label').textContent=names[category].toUpperCase()+' / '+skills.filter(s=>s.category===category).length;
    byId('atlas-index').setAttribute('aria-label',names[category]+' skills');
  }
  function select(code,announce=false) {
    clearTimeout(previewTimer);
    const skill=byCode.get(code);if(!skill)return;
    pinned=code;remembered[skill.category]=code;
    if(category!==skill.category)changeCategory(skill.category);
    show(code,announce);
  }
  worlds.forEach((button,i)=>{
    button.addEventListener('click',()=>{select(remembered[button.dataset.world]);});
    button.addEventListener('keydown',e=>{
      if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
      e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?2:(i+(e.key==='ArrowRight'?1:2))%3;
      worlds[next].focus();select(remembered[worlds[next].dataset.world]);
    });
  });
  skills.forEach(s=>{
    s.source.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'){clearTimeout(previewTimer);previewTimer=setTimeout(()=>show(s.code),75);}});
    s.source.addEventListener('focus',()=>show(s.code));
    s.source.addEventListener('click',()=>{select(s.code,true);if(mobile.matches)atlas.querySelector('.skill-story').scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'start'});});
    s.source.setAttribute('aria-controls','atlas-detail-content');
  });
  byId('atlas-index').addEventListener('pointerleave',()=>{clearTimeout(previewTimer);show(pinned);});
  byId('atlas-index').addEventListener('focusout',e=>{if(!byId('atlas-index').contains(e.relatedTarget))show(pinned);});
  changeCategory(category);show(pinned);

  // Load the local rendering module only when the gallery approaches the viewport.
  let started=false;
  const loader=new IntersectionObserver(entries=>{
    if(!entries.some(e=>e.isIntersecting)||started)return;started=true;loader.disconnect();
    import('./capability-worlds.js?v=20261007alive').then(module=>module.mountWorlds(atlas)).catch(()=>{
      // CSS sculptures and all skill controls remain available without WebGL.
      atlas.classList.add('worlds-fallback');
    });
  },{rootMargin:'350px'});
  loader.observe(atlas);
})();
