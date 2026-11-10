/* GitHub Galaxy: a plain map of everything that is set up. Read-only; authentication stays in Pages middleware. */
(() => {
  let initialisation;
  window.GitHubGalaxy = { initialise: () => initialisation ||= start() };
  async function start() {
    const { ZONES, NODES, KINDS, PROCESSES, neighboursOf, activeFiles, REPOSITORY, BRANCH } = await import('./galaxy-model.js?v=20261110mapa');
    const byId = id => document.getElementById(id), view = byId('github');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)'), compact = matchMedia('(max-width: 900px)');
    const E = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
    const node = id => NODES.find(n => n.id === id), zone = id => ZONES.find(z => z.id === id);
    let data = null, selected = 'pages', process = null, busy = false, lastAttempt = 0;

    // GitHub cron is UTC: show it in Madrid time for today, so summer and winter are both right.
    const madrid = hhmm => { const [h, m] = hhmm.split(':').map(Number), d = new Date(); return new Intl.DateTimeFormat('es-ES', { timeZone: 'Europe/Madrid', hour: '2-digit', minute: '2-digit' }).format(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), h, m)); };
    const when = n => (typeof n.when === 'string' ? n.when : n.when.text.replace(/\{(\d\d:\d\d)\}/g, (_, t) => madrid(t)));
    const date = value => (value ? new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value)) : '—');
    const workflows = n => (n.workflow ? [].concat(n.workflow) : []);
    const runOf = file => data?.workflows?.[file] || null;
    function runBadge(n) {
      const runs = workflows(n).map(runOf).filter(Boolean).sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
      if (!workflows(n).length) return '';
      if (!runs.length) return `<span class="gx-run unknown">${data ? 'Sin ejecuciones recientes' : 'Sin comprobar'}</span>`;
      const r = runs[0], state = r.status !== 'completed' ? 'running' : r.conclusion === 'success' ? 'ok' : r.conclusion === 'skipped' ? 'unknown' : 'bad';
      const label = state === 'running' ? 'En marcha ahora' : state === 'ok' ? 'Bien' : state === 'bad' ? 'Falló' : 'Saltada';
      return `<a class="gx-run ${state}" href="${E(r.url)}" target="_blank" rel="noreferrer">${label} · ${date(r.updatedAt)}</a>`;
    }

    // ---------- What runs by itself ----------
    function paintAuto() {
      const rows = NODES.filter(n => n.kind === 'agente' || n.kind === 'tarea');
      byId('galaxy-auto').innerHTML = `<table><thead><tr><th>Qué</th><th>Dónde</th><th>Cuándo</th><th>Última vez</th></tr></thead><tbody>${rows.map(n => `<tr>
        <td><button type="button" data-gx="${n.id}">${E(n.name)}</button><small>${E(n.what)}</small></td><td>${E(zone(n.zone).name.replace(/^En /, ''))}</td><td>${E(when(n))}</td>
        <td>${n.workflow ? runBadge(n) : n.id === 'servercesar' ? '<span class="gx-run unknown">Míralo en Infraestructura</span>' : '<span class="gx-run unknown">—</span>'}</td></tr>`).join('')}</tbody></table>`;
    }

    // ---------- The map ----------
    function paintMap() {
      const near = new Set([selected, ...neighboursOf(selected)]), steps = process ? new Set(process.steps.map(s => s[0])) : null;
      byId('galaxy-lanes').innerHTML = ZONES.map(z => `<section class="gx-lane" style="--zone:${z.colour}"><header><h4>${E(z.name)}</h4><small>${E(z.note)}</small></header>
        ${NODES.filter(n => n.zone === z.id).map(n => {
          const count = data ? data.files.filter(n.matches).length : null;
          const state = n.id === selected ? 'selected' : (steps ? steps.has(n.id) : near.has(n.id)) ? 'near' : 'far';
          return `<button type="button" class="gx-node ${state}" data-gx="${n.id}" aria-pressed="${n.id === selected}"><span class="gx-kind">${E(KINDS[n.kind])}</span><strong>${E(n.name)}</strong><span class="gx-what">${E(n.what)}</span>
            <span class="gx-when">${E(when(n))}</span>${n.workflow ? runBadge(n).replace(/<a /, '<span ').replace(/<\/a>/, '</span>').replace(/ href="[^"]*" target="_blank" rel="noreferrer"/, '') : ''}${count ? `<span class="gx-files">${count} ${count === 1 ? 'fichero' : 'ficheros'}</span>` : ''}</button>`;
        }).join('')}</section>`).join('');
    }
    function paintInspector() {
      const n = node(selected), z = zone(n.zone);
      const files = data ? data.files.filter(n.matches) : [];
      byId('galaxy-inspector').style.setProperty('--zone', z.colour);
      byId('galaxy-inspector').innerHTML = `<p class="gx-tag">${E(KINDS[n.kind])} · ${E(z.name)}</p><h3>${E(n.name)}</h3><p class="gx-lead">${E(n.what)}</p><p>${E(n.detail)}</p>
        <dl><dt>Dónde vive</dt><dd>${n.where.map(w => `<code>${E(w)}</code>`).join('')}</dd><dt>Cuándo se ejecuta</dt><dd>${E(when(n))}${n.workflow ? ` ${runBadge(n)}` : ''}</dd>
        <dt>Habla con</dt><dd class="gx-chips">${neighboursOf(n.id).map(id => `<button type="button" data-gx="${id}">${E(node(id).name)}</button>`).join('')}</dd></dl>
        ${files.length ? `<details><summary>${files.length} ${files.length === 1 ? 'fichero' : 'ficheros'} en el repo</summary><div class="gx-files-list">${files.map(path => `<a href="https://github.com/${REPOSITORY}/blob/${data.sha}/${path.split('/').map(encodeURIComponent).join('/')}" target="_blank" rel="noreferrer">${E(path)}</a>`).join('')}</div></details>` : ''}`;
    }
    function select(id, scroll = false) {
      selected = id; paintMap(); paintInspector();
      if (scroll && compact.matches) byId('galaxy-inspector').scrollIntoView({ behavior: reduced.matches ? 'instant' : 'smooth', block: 'start' });
    }

    // ---------- Processes ----------
    function paintProcesses() {
      byId('galaxy-processes').innerHTML = `<div class="gx-chips" role="group" aria-label="Elegir proceso">${PROCESSES.map(p => `<button type="button" data-process="${p.id}" aria-pressed="${process?.id === p.id}">${E(p.name)}</button>`).join('')}</div>
        ${process ? `<ol class="gx-steps">${process.steps.map(([id, title, text]) => `<li><button type="button" data-gx="${id}"><span>${E(node(id).name)}</span><strong>${E(title)}</strong><small>${E(text)}</small></button></li>`).join('')}</ol>` : '<p class="gx-note">Elige uno y verás por qué piezas pasa, en orden. Las piezas implicadas se marcan también en el mapa.</p>'}`;
    }

    view.addEventListener('click', event => {
      const b = event.target.closest('button');
      if (!b || !view.contains(b)) return;
      if (b.dataset.gx) { select(b.dataset.gx, true); return; }
      if (b.dataset.process) { process = process?.id === b.dataset.process ? null : PROCESSES.find(p => p.id === b.dataset.process); paintProcesses(); paintMap(); }
    });

    // ---------- Source data ----------
    function feedback(text, error = false) { byId('github-feedback').textContent = text; byId('github-feedback').classList.toggle('error', error); }
    function renderData(next) {
      if (next.schema !== 2 || !Array.isArray(next.files) || !Array.isArray(next.commits) || !/^[0-9a-f]{40}$/.test(next.sha)) throw new Error('invalid_snapshot');
      data = { ...next, files: activeFiles(next.files) };
      byId('github-account-label').textContent = REPOSITORY + ' / ' + BRANCH;
      byId('github-sync-label').textContent = (data.source === 'github' ? 'Comprobado en GitHub · ' : 'Copia guardada · ') + date(data.checkedAt);
      byId('galaxy-signal').className = 'galaxy-signal ' + (data.source === 'github' ? 'fresh' : 'saved');
      byId('galaxy-file-count').textContent = data.files.length;
      byId('galaxy-commit').textContent = data.sha.slice(0, 7) + ' ↗'; byId('galaxy-commit').href = 'https://github.com/' + REPOSITORY + '/commit/' + data.sha;
      byId('galaxy-activity-list').innerHTML = data.commits.slice(0, 6).map(c => `<article><a href="https://github.com/${REPOSITORY}/commit/${c.sha}" target="_blank" rel="noreferrer">${E(c.message)}</a><small>${date(c.date)} · ${c.sha.slice(0, 7)}</small></article>`).join('');
      paintAuto(); paintMap(); paintInspector();
    }
    async function load(force = false) {
      if (busy || (!force && (document.hidden || !view.classList.contains('active')))) return;
      busy = true; lastAttempt = Date.now();
      const refresh = byId('github-refresh'); refresh.disabled = true;
      feedback('Consultando GitHub…');
      try {
        const response = await fetch('/control/api/github/status', { credentials: 'same-origin', cache: 'no-store', headers: { accept: 'application/json' } });
        if (response.status === 401) { feedback('La sesión ha caducado. Vuelve a entrar para actualizar.', true); return; }
        if (response.status === 403) { feedback('Esta cuenta no tiene acceso a Galaxy.', true); return; }
        if (!response.ok) throw new Error('github_unavailable');
        renderData(await response.json());
        feedback('Datos de GitHub de ' + date(data.checkedAt) + '. Se actualiza cada 5 minutos mientras la tienes abierta.');
      } catch {
        if (data) { feedback('GitHub no responde. Sigues viendo lo de ' + date(data.checkedAt) + '.', true); byId('galaxy-signal').className = 'galaxy-signal saved'; }
        else try {
          const response = await fetch('/control/data/github-galaxy.json', { credentials: 'same-origin', cache: 'no-store' });
          if (!response.ok) throw new Error('snapshot_unavailable');
          renderData({ ...await response.json(), source: 'deployment-snapshot' });
          feedback('GitHub no responde. Enseño la copia de la última publicación (' + date(data.checkedAt) + '), sin el estado de las tareas.', true);
        } catch { feedback('No hay datos de GitHub ahora mismo. El mapa sigue explicando todo; faltan los ficheros y el estado de las tareas.', true); }
      } finally { busy = false; refresh.disabled = false; }
    }
    byId('github-refresh').addEventListener('click', () => load(true));
    addEventListener('homelab:view', event => { if (event.detail === 'github' && (!data || Date.now() - lastAttempt > 300000)) load(true); });
    document.addEventListener('visibilitychange', () => { if (!document.hidden && view.classList.contains('active') && Date.now() - lastAttempt > 300000) load(); });
    setInterval(() => load(), 300000);
    paintAuto(); paintProcesses(); select(selected);
    await load(true);
  }
})();
