/* The existing HTML descriptions remain the source of truth for every skill. */
(() => {
  'use strict';
  const atlas = document.getElementById('capability-atlas');
  if (!atlas) return;
  const byId = id => document.getElementById(id);
  const stage = byId('atlas-stage');
  const svg = byId('atlas-connections');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const touchLayout = matchMedia('(max-width: 680px)');
  const colours = { programme: '#d5e99a', engineering: '#83d7ed', data: '#bba8f1' };
  const categoryNames = { programme: 'Programme', engineering: 'Engineering', data: 'Data, modelling & tools' };
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
    code: source.dataset.code,
    category: source.dataset.category,
    name: source.querySelector('strong').textContent.trim(),
    description: source.dataset.detail,
    source,
    ...context[source.dataset.code]
  }));
  const byCode = new Map(skills.map(skill => [skill.code, skill]));
  const overview = ['PM.01', 'PM.02', 'PM.03', 'PM.04', 'PM.12', 'PM.14', 'SE.01', 'SE.03', 'SE.04', 'SE.09', 'SE.11', 'DT.01', 'DT.03', 'DT.05', 'DT.06'];
  let filter = 'all', experience = null, pinned = 'SE.01', preview = null;
  let rendered = [], shownCode = '', hoverTimer = 0, restoreTimer = 0, drawFrame = 0, tourTimer = 0;
  const filterButtons = [...document.querySelectorAll('.systems .filter')];
  const roleIds = ['role-mrtt', 'role-eurodrone', 'role-analytics', 'role-salesforce', 'role-rd'];
  document.querySelectorAll('.log-entry').forEach((entry, index) => { if (roleIds[index]) entry.id = roleIds[index]; });
  const text = (id, value) => { byId(id).textContent = value; };
  const el = (tag, className, value) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value !== undefined) node.textContent = value;
    return node;
  };
  const activeCode = () => preview || pinned;
  const viewSkills = () => skills.filter(skill => experience ? skill.at.includes(experience) : filter === 'all' ? overview.includes(skill.code) : skill.category === filter);
  const relatedTo = code => new Set(byCode.get(code).with);

  function stopTour() {
    clearTimeout(tourTimer);
    tourTimer = 0;
    byId('atlas-tour').setAttribute('aria-pressed', 'false');
    byId('atlas-tour').innerHTML = '<span aria-hidden="true">▷</span> Take a tour';
  }
  function updateControls() {
    filterButtons.forEach(button => {
      const active = !experience && filter === button.dataset.filter;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    atlas.querySelectorAll('[data-experience]').forEach(button => button.setAttribute('aria-pressed', String(experience === button.dataset.experience)));
    const label = experience ? experiences[experience].label.toUpperCase() : filter === 'all' ? 'ALL SYSTEMS' : categoryNames[filter].toUpperCase();
    text('atlas-view-label', `${experience ? '02 / EXPERIENCE' : '01 / DISCIPLINE'} · ${label}`);
    text('atlas-interaction-hint', touchLayout.matches ? 'Tap a connection to explore' : 'Hover to trace · Click to pin');
  }

  function renderInspector(code) {
    const skill = byCode.get(code);
    if (!skill) return;
    atlas.style.setProperty('--signal', colours[skill.category]);
    text('atlas-selection-state', preview ? 'PREVIEW · CLICK TO PIN' : tourTimer ? 'GUIDED TOUR' : 'PINNED SIGNAL');
    if (shownCode === code) return;
    shownCode = code;
    text('atlas-detail-category', categoryNames[skill.category].toUpperCase());
    text('atlas-detail-code', skill.code);
    text('atlas-detail-title', skill.name);
    text('atlas-detail-description', skill.description);
    const evidence = byId('atlas-evidence-list');
    evidence.replaceChildren();
    const relevantExperience = experience && skill.at.includes(experience) ? [experience, ...skill.at.filter(id => id !== experience)] : skill.at;
    relevantExperience.slice(0, 2).forEach(id => {
      const item = experiences[id], link = el('a');
      link.href = `#${item.anchor}`;
      link.append(el('small', '', item.company), el('strong', '', item.title));
      evidence.append(link);
    });
    const related = byId('atlas-related-list');
    related.replaceChildren();
    skill.with.forEach(id => {
      const item = byCode.get(id), button = el('button', '', item.name);
      button.type = 'button';
      button.style.setProperty('--related-color', colours[item.category]);
      button.addEventListener('click', () => pin(id));
      related.append(button);
    });
    if (!reduced.matches) byId('atlas-detail-content').animate([{ opacity: .35, transform: 'translateY(5px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 220, easing: 'ease-out' });
  }

  function renderCore(code) {
    const skill = byCode.get(code);
    const role = experiences[experience && skill.at.includes(experience) ? experience : skill.at[0]];
    text('atlas-core-eyebrow', touchLayout.matches ? `${skill.code} / ${categoryNames[skill.category].split(',')[0].toUpperCase()}` : role.eyebrow);
    text('atlas-core-title', touchLayout.matches ? skill.name : role.core);
    byId('atlas-core-title').style.setProperty('--core-title-size', skill.name.length > 32 ? '14px' : skill.name.length > 22 ? '16px' : '18px');
    text('atlas-core-caption', touchLayout.matches ? 'SELECTED CAPABILITY' : 'CONNECTED EXPERIENCE');
  }

  function highlight() {
    const code = activeCode(), related = relatedTo(code);
    for (const skill of skills) {
      skill.node.classList.toggle('is-active', skill.code === code);
      skill.node.classList.toggle('is-related', related.has(skill.code));
      skill.node.classList.toggle('is-dimmed', skill.code !== code && !related.has(skill.code));
      skill.node.setAttribute('aria-pressed', String(skill.code === pinned));
    }
    byId('atlas-skill-rail').querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.code === pinned)));
    renderCore(code);
    renderInspector(code);
    drawLinks();
  }

  function pathBetween(start, end) {
    const middleX = start.x + (end.x - start.x) * .56;
    return `M ${start.x.toFixed(1)} ${start.y.toFixed(1)} C ${middleX.toFixed(1)} ${start.y.toFixed(1)}, ${middleX.toFixed(1)} ${end.y.toFixed(1)}, ${end.x.toFixed(1)} ${end.y.toFixed(1)}`;
  }
  function makePath(d, className, colour) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    path.setAttribute('class', className);
    if (colour) path.setAttribute('stroke', colour);
    return path;
  }
  function drawLinks() {
    const bounds = stage.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    svg.setAttribute('viewBox', `0 0 ${bounds.width} ${bounds.height}`);
    const core = byId('atlas-core').getBoundingClientRect();
    const center = { x: core.left + core.width / 2 - bounds.left, y: core.top + core.height / 2 - bounds.top };
    const radius = core.width / 2 + 2;
    const base = document.createDocumentFragment(), active = document.createDocumentFragment();
    const related = relatedTo(activeCode());
    const points = new Map();
    for (const skill of rendered) {
      const dot = skill.node.querySelector('.atlas-node-dot').getBoundingClientRect();
      const origin = { x: dot.left + dot.width / 2 - bounds.left, y: dot.top + dot.height / 2 - bounds.top };
      points.set(skill.code, origin);
      const dx = origin.x - center.x, dy = origin.y - center.y, distance = Math.hypot(dx, dy) || 1;
      const end = { x: center.x + dx / distance * radius, y: center.y + dy / distance * radius };
      const isSelected = skill.code === activeCode();
      const isRelated = related.has(skill.code);
      const d = pathBetween(origin, end);
      const state = isSelected ? 'is-selected' : isRelated ? 'is-related' : 'is-muted';
      base.append(makePath(d, `atlas-link ${state}`, colours[skill.category]));
      if (isSelected || isRelated) active.append(makePath(d, 'atlas-flow'));
    }
    const origin = points.get(activeCode());
    if (origin && !touchLayout.matches) {
      for (const id of related) {
        const target = points.get(id);
        if (target) base.append(makePath(`M ${origin.x} ${origin.y} Q ${center.x} ${center.y} ${target.x} ${target.y}`, 'atlas-relation'));
      }
    }
    byId('atlas-base-links').replaceChildren(base);
    byId('atlas-active-links').replaceChildren(active);
  }
  function redrawTransition() {
    cancelAnimationFrame(drawFrame);
    if (reduced.matches) { drawLinks(); return; }
    const started = performance.now();
    function frame(now) {
      drawLinks();
      if (now - started < 680) drawFrame = requestAnimationFrame(frame);
    }
    drawFrame = requestAnimationFrame(frame);
  }

  function layout() {
    const visible = viewSkills();
    if (touchLayout.matches) {
      const selected = byCode.get(activeCode());
      const ids = [...new Set(selected.with)].filter(id => id !== selected.code).slice(0, 4);
      rendered = ids.map(id => byCode.get(id));
      const positions = rendered.length === 3 ? [[25, 21], [75, 21], [50, 77]] : [[25, 21], [75, 21], [25, 77], [75, 77]];
      rendered.forEach((skill, index) => {
        skill.node.style.setProperty('--x', `${positions[index][0]}%`);
        skill.node.style.setProperty('--y', `${positions[index][1]}%`);
        skill.node.dataset.side = 'mobile';
      });
    } else {
      rendered = visible;
      const midpoint = Math.ceil(visible.length / 2);
      visible.forEach((skill, index) => {
        const left = index < midpoint;
        const row = left ? index : index - midpoint;
        const count = left ? midpoint : visible.length - midpoint;
        const height = stage.clientHeight;
        const y = count === 1 ? height / 2 : 85 + row * ((height - 170) / (count - 1));
        skill.node.style.setProperty('--x', left ? '2%' : '66%');
        skill.node.style.setProperty('--y', `${y}px`);
        skill.node.dataset.side = left ? 'left' : 'right';
      });
    }
    const shown = new Set(rendered.map(skill => skill.code));
    skills.forEach(skill => { skill.node.hidden = !shown.has(skill.code); });
    const countText = touchLayout.matches ? `${rendered.length} RELATED SIGNALS` : filter === 'all' && !experience ? `${visible.length} / ${skills.length} · OVERVIEW` : `${visible.length} CONNECTED SKILLS`;
    text('atlas-node-count', countText);
    updateControls();
    highlight();
    redrawTransition();
  }

  function renderRail() {
    const rail = byId('atlas-skill-rail');
    rail.replaceChildren();
    // On mobile the complete view is available through a thumb-friendly rail.
    const visible = experience ? viewSkills() : filter === 'all' ? skills : viewSkills();
    visible.forEach(skill => {
      const button = el('button', '', skill.name);
      button.type = 'button';
      button.dataset.code = skill.code;
      button.style.setProperty('--node-color', colours[skill.category]);
      button.setAttribute('aria-pressed', String(skill.code === pinned));
      button.addEventListener('click', () => pin(skill.code));
      rail.append(button);
    });
  }
  function changeView(category, role = null) {
    stopTour();
    clearTimeout(hoverTimer); clearTimeout(restoreTimer);
    preview = null; filter = category; experience = role;
    const visible = viewSkills();
    if (!visible.some(skill => skill.code === pinned)) pinned = visible[0].code;
    shownCode = '';
    renderRail(); layout();
    text('atlas-announcement', `${role ? experiences[role].label : category === 'all' ? 'All systems' : categoryNames[category]}. ${visible.length} skills. Selected ${byCode.get(pinned).name}.`);
  }
  function pin(code, userAction = true) {
    if (!byCode.has(code)) return;
    if (userAction) stopTour();
    clearTimeout(hoverTimer); clearTimeout(restoreTimer);
    preview = null; pinned = code;
    if (!viewSkills().some(skill => skill.code === code) && !touchLayout.matches) {
      filter = byCode.get(code).category; experience = null;
      renderRail();
    } else if (experience && !byCode.get(code).at.includes(experience)) {
      filter = byCode.get(code).category; experience = null;
      renderRail();
    } else if (filter !== 'all' && byCode.get(code).category !== filter) {
      filter = byCode.get(code).category; experience = null;
      renderRail();
    }
    shownCode = '';
    layout();
    text('atlas-announcement', `${byCode.get(code).name}. ${byCode.get(code).description}`);
  }
  function previewSkill(code) {
    if (touchLayout.matches) return;
    stopTour();
    clearTimeout(hoverTimer); clearTimeout(restoreTimer);
    hoverTimer = setTimeout(() => { preview = code; highlight(); }, 65);
  }
  function restorePinned() {
    clearTimeout(hoverTimer); clearTimeout(restoreTimer);
    restoreTimer = setTimeout(() => { preview = null; highlight(); }, 130);
  }

  for (const skill of skills) {
    skill.source.style.setProperty('--node-color', colours[skill.category]);
    skill.source.addEventListener('click', () => {
      pin(skill.code);
      byId('atlas-directory').open = false;
      atlas.scrollIntoView({ behavior: reduced.matches ? 'instant' : 'smooth', block: 'start' });
      skill.node.hidden ? byId('atlas-reset').focus({ preventScroll: true }) : skill.node.focus({ preventScroll: true });
    });
    const button = el('button', 'atlas-node');
    button.type = 'button'; button.dataset.code = skill.code;
    button.style.setProperty('--node-color', colours[skill.category]);
    button.setAttribute('aria-controls', 'atlas-inspector');
    button.setAttribute('aria-label', `${skill.name}, ${categoryNames[skill.category]}`);
    const dot = el('i', 'atlas-node-dot'); dot.setAttribute('aria-hidden', 'true');
    const copy = el('span', 'atlas-node-copy');
    copy.append(el('small', '', skill.code), el('strong', '', skill.name));
    button.append(dot, copy);
    button.addEventListener('click', () => pin(skill.code));
    button.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') previewSkill(skill.code); });
    button.addEventListener('pointerleave', restorePinned);
    button.addEventListener('focus', () => { if (button.matches(':focus-visible')) previewSkill(skill.code); });
    button.addEventListener('blur', restorePinned);
    skill.node = button;
    byId('atlas-nodes').append(button);
  }
  for (const [id, item] of Object.entries(experiences)) {
    const button = el('button'); button.type = 'button'; button.dataset.experience = id;
    button.append(el('span', '', item.label), el('small', '', String(skills.filter(skill => skill.at.includes(id)).length).padStart(2, '0')));
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => changeView('all', experience === id ? null : id));
    byId('atlas-experience-filters').append(button);
  }
  filterButtons.forEach(button => button.addEventListener('click', () => changeView(button.dataset.filter)));
  byId('atlas-reset').addEventListener('click', () => { pinned = 'SE.01'; changeView('all'); });
  byId('atlas-open-index').addEventListener('click', () => {
    byId('atlas-directory').open = true;
    byId('atlas-directory').scrollIntoView({ behavior: reduced.matches ? 'instant' : 'smooth', block: 'center' });
    byId('atlas-search').focus({ preventScroll: true });
  });
  const normalise = value => value.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  byId('atlas-search').addEventListener('input', event => {
    const query = normalise(event.target.value.trim());
    let count = 0;
    skills.forEach(skill => {
      const matches = normalise(`${skill.name} ${skill.code} ${categoryNames[skill.category]} ${skill.description}`).includes(query);
      skill.source.hidden = !matches;
      if (matches) count++;
    });
    text('atlas-search-count', `${count} ${count === 1 ? 'skill' : 'skills'}`);
    byId('atlas-no-results').hidden = count !== 0;
  });
  byId('atlas-tour').addEventListener('click', () => {
    if (tourTimer) { stopTour(); highlight(); return; }
    filter = 'all'; experience = null; preview = null;
    const route = ['SE.01', 'SE.03', 'PM.14', 'DT.03', 'DT.06'];
    let step = 0;
    const advance = () => {
      if (step >= route.length) { stopTour(); highlight(); return; }
      tourTimer = setTimeout(advance, 5200);
      byId('atlas-tour').setAttribute('aria-pressed', 'true');
      byId('atlas-tour').innerHTML = '<span aria-hidden="true">Ⅱ</span> Pause tour';
      pin(route[step++], false);
    };
    renderRail(); advance();
  });
  stage.addEventListener('pointermove', event => {
    if (reduced.matches || event.pointerType !== 'mouse') return;
    const bounds = stage.getBoundingClientRect();
    stage.style.setProperty('--pointer-x', `${event.clientX - bounds.left}px`);
    stage.style.setProperty('--pointer-y', `${event.clientY - bounds.top}px`);
  }, { passive: true });
  atlas.addEventListener('keydown', event => { if (event.key === 'Escape') { stopTour(); preview = null; highlight(); } });
  new IntersectionObserver(entries => entries.forEach(entry => {
    atlas.classList.toggle('is-in-view', entry.isIntersecting);
    if (!entry.isIntersecting) stopTour();
  }), { threshold: .05 }).observe(atlas);
  let lastWidth = 0;
  new ResizeObserver(entries => {
    const width = entries[0].contentRect.width;
    if (Math.abs(width - lastWidth) > 1) { lastWidth = width; preview = null; renderRail(); layout(); }
  }).observe(stage);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopTour(); });
  reduced.addEventListener('change', () => { stopTour(); layout(); });
  byId('atlas-core-title').style.whiteSpace = 'pre-line';
  atlas.style.scrollMarginTop = '125px';
  renderRail(); layout();
})();
