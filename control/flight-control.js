// Flight Deck layer for Mission Control: command palette (Ctrl/⌘+K), pointer-lit modules and KPI count-ups.
// Works only through public DOM hooks (nav items, views, the homelab:view event); it never touches auth or data.
(() => {
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Pointer-lit modules ---------- */
  function lightUp(root = document) {
    $$('.module, .server-card, .security-card, .chart-card, .thermal-panel, .galaxy-inspector', root).forEach(card => {
      if (card.classList.contains('fc-spot')) return;
      card.classList.add('fc-spot');
      card.addEventListener('pointermove', event => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${event.clientX - r.left}px`);
        card.style.setProperty('--my', `${event.clientY - r.top}px`);
      });
    });
  }

  /* ---------- KPI count-ups when a module opens ---------- */
  const counted = new WeakSet();
  function countUp(view) {
    if (reduce || !view) return;
    $$('.training-kpis strong, .thermal-metrics strong', view).forEach(node => {
      if (counted.has(node)) return;
      const match = node.textContent.trim().match(/^(-?[\d.,]+)(.*)$/s);
      if (!match) return;
      const raw = match[1], decimals = (raw.split(/[.,]/)[1] || '').length, target = Number(raw.replace(/,/g, ''));
      if (!Number.isFinite(target) || target === 0) return;
      counted.add(node);
      const suffix = match[2], start = performance.now(), duration = 900;
      const frame = now => {
        const p = Math.min(1, (now - start) / duration), eased = 1 - (1 - p) ** 3;
        node.textContent = (target * eased).toFixed(decimals) + suffix;
        if (p < 1) requestAnimationFrame(frame); else node.textContent = raw + suffix;
      };
      requestAnimationFrame(frame);
    });
  }

  addEventListener('homelab:view', event => {
    const view = document.getElementById(event.detail);
    // Modules render asynchronously; give them a beat before decorating.
    setTimeout(() => { lightUp(view); countUp(view); }, 350);
  });

  /* ---------- Command palette ---------- */
  const palette = document.createElement('dialog');
  palette.className = 'fc-palette';
  palette.setAttribute('aria-label', 'Jump to a module');
  palette.innerHTML = '<input type="search" placeholder="Jump to…" aria-label="Search modules" autocomplete="off"><ul role="listbox"></ul><footer>↑ ↓ to move · Enter to open · Esc to close</footer>';
  document.body.append(palette);
  const input = $('input', palette), list = $('ul', palette);
  let selected = 0;

  function entries() {
    return $$('.nav-item[data-view]').filter(item => !item.hidden).map(item => {
      const code = item.querySelector('span')?.textContent.trim() || '';
      return { view: item.dataset.view, code, label: item.textContent.trim().slice(code.length).trim() };
    });
  }
  function render() {
    const q = input.value.trim().toLowerCase();
    const items = entries().filter(e => !q || `${e.label} ${e.view}`.toLowerCase().includes(q));
    selected = Math.min(selected, Math.max(0, items.length - 1));
    list.innerHTML = '';
    items.forEach((e, i) => {
      const li = document.createElement('li'), b = document.createElement('button');
      b.type = 'button'; b.setAttribute('role', 'option'); b.setAttribute('aria-selected', String(i === selected));
      b.innerHTML = `<span></span><b></b><small>OPEN</small>`;
      b.querySelector('span').textContent = e.code; b.querySelector('b').textContent = e.label;
      b.addEventListener('click', () => go(e.view));
      li.append(b); list.append(li);
    });
    return items;
  }
  function go(view) {
    palette.close();
    $(`.nav-item[data-view="${CSS.escape(view)}"]`)?.click();
  }
  function open() { input.value = ''; selected = 0; render(); palette.showModal(); input.focus(); }
  input.addEventListener('input', () => { selected = 0; render(); });
  input.addEventListener('keydown', event => {
    const items = render();
    if (event.key === 'ArrowDown') { selected = (selected + 1) % Math.max(1, items.length); render(); event.preventDefault(); }
    if (event.key === 'ArrowUp') { selected = (selected - 1 + items.length) % Math.max(1, items.length); render(); event.preventDefault(); }
    if (event.key === 'Enter' && items[selected]) { go(items[selected].view); event.preventDefault(); }
  });
  palette.addEventListener('click', event => { if (event.target === palette) palette.close(); });
  addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); palette.open ? palette.close() : open(); }
  });

  const topbarActions = $('.topbar .session');
  if (topbarActions) {
    const jump = document.createElement('button');
    jump.type = 'button'; jump.className = 'fc-jump';
    jump.innerHTML = 'Jump <kbd>Ctrl K</kbd>';
    jump.addEventListener('click', open);
    topbarActions.prepend(jump);
  }

  lightUp();
})();
