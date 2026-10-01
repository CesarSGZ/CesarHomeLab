(() => {
  const root = document.documentElement;
  const key = 'csg-colour-mode';
  let mode = 'day';
  try { mode = localStorage.getItem(key) === 'night' ? 'night' : 'day'; } catch {}
  root.dataset.theme = mode;
  function paint() {
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      const night = root.dataset.theme === 'night';
      button.setAttribute('aria-label', night ? 'Switch to day mode' : 'Switch to night mode');
      button.setAttribute('title', night ? 'Modo día' : 'Modo noche');
      button.setAttribute('aria-pressed', String(night));
      button.innerHTML = night
        ? '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></svg>'
        : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.7 13.7A9 9 0 0 1 10.3 3.3a9 9 0 1 0 10.4 10.4Z"/></svg>';
    });
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = root.dataset.theme === 'night' ? '#15191c' : '#eaf0f5';
  }
  document.addEventListener('DOMContentLoaded', () => {
    paint();
    document.querySelectorAll('[data-theme-toggle]').forEach(button => button.addEventListener('click', () => {
      root.dataset.theme = root.dataset.theme === 'night' ? 'day' : 'night';
      try { localStorage.setItem(key, root.dataset.theme); } catch {}
      paint();
      dispatchEvent(new CustomEvent('csg:theme', { detail: root.dataset.theme }));
    }));
  });
  addEventListener('storage', event => {
    if (event.key !== key) return;
    root.dataset.theme = event.newValue === 'night' ? 'night' : 'day';
    paint();
    dispatchEvent(new CustomEvent('csg:theme', { detail: root.dataset.theme }));
  });
})();
