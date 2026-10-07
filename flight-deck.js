// Flight Deck: HUD altimeter, attitude indicator, intro choreography, scroll reveals and the mission-brief player.
// Progressive enhancement only: without GSAP or with reduced motion the page stays fully readable.
(() => {
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(pointer: fine)').matches;
  const hasGsap = typeof window.gsap !== 'undefined';
  const PAPER = ['manifest', 'trajectory', 'credentials'];

  /* ---------- Sections, phase index and anchors ---------- */
  const sections = $$('main > section[data-phase]');
  const ids = { hero: 'top', manifest: 'profile', finale: 'contact' };
  sections.forEach(section => {
    const key = Object.keys(ids).find(k => section.classList.contains(k));
    if (!section.id && key && key !== 'hero') section.id = ids[key];
  });
  const phaseList = $('.fd-phases');
  const phaseLinks = sections.map(section => {
    const li = document.createElement('li'), a = document.createElement('a');
    a.href = section.classList.contains('hero') ? '#top' : `#${section.id}`;
    a.innerHTML = `<span>${section.dataset.phase}</span>`;
    a.setAttribute('aria-label', `${section.dataset.phase}: go to section`);
    li.append(a); phaseList?.append(li);
    return a;
  });

  /* ---------- Altimeter tape ---------- */
  const tape = $('.fd-alt-tape'), altValue = $('.fd-alt-value'), vsValue = $('.fd-alt-vs b'), hud = $('.fd-hud');
  const PX_PER_KFT = 42;
  if (tape) {
    const frag = document.createDocumentFragment();
    for (let v = 0; v <= 42000; v += 500) {
      const tick = document.createElement('i');
      tick.style.top = `${-(v / 1000) * PX_PER_KFT}px`;
      if (v % 2000 === 0) { tick.className = 'major'; tick.dataset.v = String(v / 100).padStart(3, '0'); }
      frag.append(tick);
    }
    tape.append(frag);
  }
  // Departure, climb, cruise, descent and touchdown mapped onto the page sections.
  const profile = { hero: 0, manifest: 0, trajectory: 9000, systems: 33000, credentials: 39000, languages: 17000, finale: 4000 };
  let stops = [];
  function measure() {
    const end = root.scrollHeight - innerHeight * .5;
    stops = sections.map(section => {
      const key = Object.keys(profile).find(k => section.classList.contains(k));
      return { y: section.getBoundingClientRect().top + scrollY, alt: profile[key] ?? 0 };
    });
    stops.push({ y: Math.max(end, (stops.at(-1)?.y ?? 0) + 1), alt: 0 });
  }
  function altitudeAt(ref) {
    if (!stops.length) return 0;
    if (ref <= stops[0].y) return stops[0].alt;
    for (let i = 1; i < stops.length; i++) {
      if (ref <= stops[i].y) {
        const a = stops[i - 1], b = stops[i], t = (ref - a.y) / (b.y - a.y);
        const eased = t * t * (3 - 2 * t);
        return a.alt + (b.alt - a.alt) * eased;
      }
    }
    return stops.at(-1).alt;
  }
  let lastAlt = 0, lastTime = performance.now(), vs = 0, ticking = false;
  function updateHud() {
    ticking = false;
    const ref = scrollY + innerHeight * .5, alt = altitudeAt(ref), now = performance.now();
    const dt = Math.max(16, now - lastTime);
    vs = vs * .82 + ((alt - lastAlt) / dt * 60000) * .18;
    lastAlt = alt; lastTime = now;
    if (tape) tape.style.transform = `translateY(${(alt / 1000) * PX_PER_KFT}px)`;
    if (altValue) altValue.textContent = String(Math.round(alt / 10) * 10).padStart(5, '0');
    if (vsValue) { const v = Math.round(vs / 100) * 100; vsValue.textContent = `${v > 0 ? '+' : ''}${Math.abs(v) < 100 ? 0 : v}`; }
    let current = 0;
    sections.forEach((section, i) => { const box = section.getBoundingClientRect(); if (box.top <= innerHeight * .5) current = i; });
    phaseLinks.forEach((a, i) => i === current ? a.setAttribute('aria-current', 'step') : a.removeAttribute('aria-current'));
    hud?.classList.toggle('on-paper', PAPER.some(name => sections[current]?.classList.contains(name)));
    if (Math.abs(vs) > 50) requestTick();
  }
  function requestTick() { if (!ticking) { ticking = true; requestAnimationFrame(updateHud); } }
  addEventListener('scroll', requestTick, { passive: true });
  addEventListener('resize', () => { measure(); requestTick(); });
  addEventListener('load', () => { measure(); requestTick(); });
  addEventListener('csg:theme', requestTick);
  measure(); updateHud();

  /* ---------- Attitude indicator (hero) ---------- */
  const ladder = $('.fd-ladder');
  let pitchGroup = null;
  if (ladder) {
    const NS = 'http://www.w3.org/2000/svg', PX = 15;
    const el = (tag, attrs) => { const n = document.createElementNS(NS, tag); Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v)); return n; };
    pitchGroup = el('g', { class: 'fd-pitch' });
    pitchGroup.append(el('line', { x1: -900, x2: 900, y1: 0, y2: 0, class: 'fd-horizon-line' }));
    for (let deg = -40; deg <= 40; deg += 5) {
      if (!deg) continue;
      const y = -deg * PX, major = deg % 10 === 0, w = major ? 170 : 115, gap = 62, dir = deg > 0 ? 9 : -9;
      const cls = deg < 0 ? 'fd-neg' : '';
      pitchGroup.append(el('path', { d: `M${-w} ${y + dir}V${y}H${-gap}M${gap} ${y}H${w}V${y + dir}`, class: cls }));
      if (major) {
        const label = String(Math.abs(deg));
        const t1 = el('text', { x: -w - 30, y: y + 4, 'text-anchor': 'middle' }); t1.textContent = label;
        const t2 = el('text', { x: w + 30, y: y + 4, 'text-anchor': 'middle' }); t2.textContent = label;
        pitchGroup.append(t1, t2);
      }
    }
    ladder.append(pitchGroup);
  }

  /* ---------- Mission brief dialog ---------- */
  const dialog = $('#mission-brief'), video = dialog?.querySelector('video');
  let opener = null;
  $$('[data-brief-open]').forEach(button => button.addEventListener('click', () => {
    if (!dialog) return;
    opener = button;
    dialog.showModal();
    video?.play?.().catch(() => {});
  }));
  dialog?.addEventListener('close', () => { video?.pause(); opener?.focus(); });
  $$('[data-brief-close]').forEach(button => button.addEventListener('click', () => dialog?.close()));
  dialog?.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });

  /* ---------- Pointer-lit surfaces ---------- */
  const spotTargets = $$('.pillars article, .log-content, .credential, .language-channel');
  spotTargets.forEach(card => {
    card.classList.add('fd-spot');
    card.addEventListener('pointermove', event => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${event.clientX - r.left}px`);
      card.style.setProperty('--my', `${event.clientY - r.top}px`);
    });
  });

  if (!hasGsap) return;
  const { gsap } = window;
  if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  if (window.SplitText) gsap.registerPlugin(SplitText);
  if (window.ScrambleTextPlugin) gsap.registerPlugin(ScrambleTextPlugin);

  if (reduce) { root.classList.add('fd-ready'); return; }

  /* ---------- Hero intro ---------- */
  const heroCopy = $('.hero-copy'), identity = $('.identity');
  const intro = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } });
  [heroCopy, identity].forEach(node => { if (node) { gsap.set(node, { opacity: 1, y: 0 }); node.classList.remove('reveal'); } });
  gsap.set(['.hero .eyebrow', '.hero-lead', '.hero-actions > *', '.fd-brief-link', '.id-card > *', '.coordinate', '.scroll-hint'], { autoAlpha: 0 });
  gsap.set('.portrait-shell', { clipPath: 'inset(100% 0% 0% 0% round 110px 110px 12px 12px)' });
  gsap.set('.hero h1', { autoAlpha: 0 });
  if (pitchGroup) gsap.set(pitchGroup, { scaleX: 0, svgOrigin: '0 0', opacity: 0 });

  function buildIntro() {
    const h1 = $('.hero h1');
    let lines = [h1];
    if (window.SplitText && h1) lines = SplitText.create(h1, { type: 'lines', mask: 'lines', linesClass: 'fd-split-line' }).lines;
    gsap.set(h1, { autoAlpha: 1 });
    intro
      .from(lines, { yPercent: 115, duration: 1.15, stagger: .11 }, .15)
      .fromTo('.hero h1 em', { '--fd-fill': '100%' }, { '--fd-fill': '0%', duration: 1.3, ease: 'power2.inOut' }, .75)
      .to('.hero .eyebrow', { autoAlpha: 1, duration: .4 }, .05)
      .from('.hero .eyebrow', { x: -12, duration: .9 }, .05)
      .to('.portrait-shell', { clipPath: 'inset(0% 0% 0% 0% round 110px 110px 12px 12px)', duration: 1.4, ease: 'expo.inOut' }, .25)
      .from('.portrait-shell img', { scale: 1.25, duration: 1.8 }, .25)
      .to('.hero-lead', { autoAlpha: 1, duration: .8 }, .7).from('.hero-lead', { y: 18, duration: .8 }, .7)
      .to('.hero-actions > *', { autoAlpha: 1, duration: .6, stagger: .08 }, .85).from('.hero-actions > *', { y: 16, duration: .8, stagger: .08 }, .85)
      .to('.fd-brief-link', { autoAlpha: 1, duration: .6 }, 1.05)
      .to('.id-card > *', { autoAlpha: 1, duration: .5, stagger: .07 }, 1.0).from('.id-card > *', { x: 14, duration: .7, stagger: .07 }, 1.0)
      .to('.coordinate', { autoAlpha: 1, duration: .3, stagger: .1 }, 1.25)
      .to('.coordinate', { duration: 1, scrambleText: { text: '{original}', chars: '0123456789.°', speed: .5 }, stagger: .1 }, 1.25)
      .to('.scroll-hint', { autoAlpha: 1, duration: .6 }, 1.5);
    if (pitchGroup) intro.to(pitchGroup, { scaleX: 1, opacity: 1, duration: 1.6, ease: 'expo.inOut' }, 0);
    intro.call(() => root.classList.add('fd-ready'), null, .4);
    intro.play();
    // Safety net: if frames are throttled (background tab, embedded view), never leave the hero hidden.
    setTimeout(() => { if (intro.progress() < 1) intro.progress(1); }, 4000);
  }
  const fontsReady = document.fonts?.ready ?? Promise.resolve();
  Promise.race([fontsReady, new Promise(r => setTimeout(r, 1200))]).then(() => { buildIntro(); setupScroll(); ScrollTrigger?.refresh(); measure(); });

  /* ---------- Attitude indicator motion ---------- */
  if (pitchGroup) {
    gsap.set(ladder, { svgOrigin: '0 0' });
    const roll = gsap.quickTo(ladder, 'rotation', { duration: 1.1, ease: 'power3.out' });
    const pitch = gsap.quickTo(pitchGroup, 'y', { duration: 1.1, ease: 'power3.out' });
    let pointerPitch = 0, scrollPitch = 0, pointerActive = false;
    const hero = $('.hero');
    hero?.addEventListener('pointermove', event => {
      if (event.pointerType !== 'mouse') return;
      pointerActive = true;
      const x = event.clientX / innerWidth - .5, y = event.clientY / innerHeight - .5;
      roll(-x * 9);
      pointerPitch = y * 70;
      pitch(pointerPitch + scrollPitch);
    });
    hero?.addEventListener('pointerleave', () => { pointerActive = false; roll(0); pointerPitch = 0; pitch(scrollPitch); });
    ScrollTrigger.create({
      trigger: '.hero', start: 'top top', end: 'bottom top',
      onUpdate: self => { scrollPitch = self.progress * 260; pitch(pointerPitch + scrollPitch); }
    });
    // Light turbulence so the horizon breathes on touch devices and when the pointer rests.
    gsap.ticker.add(time => {
      if (pointerActive || !ladder.isConnected) return;
      roll(Math.sin(time * .45) * 1.6);
    });
  }

  /* ---------- Scroll choreography ---------- */
  function setupScroll() {
    const scramble = (target, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/·') => ({ duration: 1, scrambleText: { text: '{original}', chars, speed: .55 } });

    $$('main > section:not(.hero) .eyebrow').forEach(eyebrow => {
      gsap.to(eyebrow, { ...scramble(eyebrow), scrollTrigger: { trigger: eyebrow, start: 'top 88%', once: true } });
    });

    $$('.manifest-grid h2, .section-head h2, .languages h2, .finale h2').forEach(heading => {
      if (window.SplitText) {
        SplitText.create(heading, {
          type: 'lines', mask: 'lines', linesClass: 'fd-split-line', autoSplit: true,
          onSplit: self => gsap.from(self.lines, { yPercent: 110, duration: 1.05, ease: 'expo.out', stagger: .1, scrollTrigger: { trigger: heading, start: 'top 85%', once: true } })
        });
      }
      const accent = heading.querySelector('em, span');
      if (accent) gsap.fromTo(accent, { '--fd-fill': '100%' }, { '--fd-fill': '0%', ease: 'none', scrollTrigger: { trigger: heading, start: 'top 80%', end: 'top 35%', scrub: .6 } });
    });

    gsap.fromTo('.pillars article', { y: 70, opacity: 0, rotateX: -8, transformOrigin: '50% 100%', transition: 'none' }, { y: 0, opacity: 1, rotateX: 0, duration: 1.1, ease: 'expo.out', stagger: .12, clearProps: 'transform,transition,opacity', onComplete: () => enableTilt($$('.pillars article')), scrollTrigger: { trigger: '.pillars', start: 'top 82%', once: true } });

    $$('.tenure-overview strong').forEach(strong => gsap.to(strong, { ...scramble(strong, '0123456789'), duration: 1.3, scrollTrigger: { trigger: strong, start: 'top 88%', once: true } }));
    $$('.log-entry').forEach(entry => {
      const meta = entry.querySelector('.log-meta > span');
      if (meta) gsap.to(meta, { ...scramble(meta, '0123456789'), scrollTrigger: { trigger: entry, start: 'top 78%', once: true } });
      const chips = entry.querySelectorAll('.log-content li');
      gsap.fromTo(chips, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: .5, stagger: .025, ease: 'power2.out', scrollTrigger: { trigger: entry, start: 'top 72%', once: true } });
    });

    const credentials = $$('.credential');
    credentials.forEach(card => card.classList.remove('reveal'));
    gsap.fromTo(credentials, { y: 60, opacity: 0, rotateX: 14, rotateZ: i => (i % 2 ? 1.4 : -1.4), transformPerspective: 900, transition: 'none' }, { y: 0, opacity: 1, rotateX: 0, rotateZ: 0, duration: 1.1, ease: 'expo.out', stagger: .1, clearProps: 'transform,transition,opacity', onComplete: () => enableTilt(credentials), scrollTrigger: { trigger: '.credential-grid', start: 'top 85%', once: true } });

    gsap.from('.fd-runway-plane', { yPercent: -30, opacity: 0, duration: 1.6, ease: 'power3.out', scrollTrigger: { trigger: '.finale', start: 'top 75%', once: true } });

    measure();
  }

  // Subtle 3D tilt via CSS variables (no tweens), enabled once a card has finished its entrance.
  function enableTilt(cards) {
    if (!finePointer) return;
    cards.forEach(card => {
      if (card.classList.contains('fd-tilt')) return;
      card.classList.add('fd-tilt');
      card.addEventListener('pointermove', event => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--rx', `${((event.clientY - r.top) / r.height - .5) * -5}deg`);
        card.style.setProperty('--ry', `${((event.clientX - r.left) / r.width - .5) * 6}deg`);
      });
      card.addEventListener('pointerleave', () => { card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg'); });
    });
  }
})();
