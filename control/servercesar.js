// ServerCesar panel (Servers view): power status, Wake-on-LAN button and owner configuration.
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  let csrf = '', canWake = false, timer = 0, fastUntil = 0, cooldownUntil = 0, started = false;
  const card = () => document.getElementById('servercesar');
  const fmt = t => t ? new Intl.DateTimeFormat('es-ES', {timeZone: 'Europe/Madrid', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'}).format(new Date(t)) : 'NUNCA';
  const ago = t => { if (!t) return '—'; const s = Math.round((Date.now() - t) / 1000); return s < 60 ? 'hace ' + s + ' s' : s < 3600 ? 'hace ' + Math.round(s / 60) + ' min' : fmt(t); };
  const set = (sel, text) => { const el = $(sel, card()); if (el) el.textContent = text; };
  const feedback = (text, kind = '') => { const el = $('#sc-feedback'); el.className = 'command-feedback' + (kind ? ' ' + kind : ''); el.textContent = text; };

  function render(data) {
    const p = data.power || {}, online = p.state === 'online', pill = $('[data-sc-pill]', card());
    pill.textContent = online ? 'ENCENDIDO' : p.state === 'unconfigured' ? 'SIN CONFIGURAR' : 'SIN RESPUESTA';
    pill.classList.toggle('online', online);
    card().dataset.state = p.state || 'unknown';
    set('[data-sc-state]', online ? 'ENCENDIDO' : p.state === 'unconfigured' ? 'SIN CONFIGURAR' : 'APAGADO O SIN RESPUESTA');
    set('[data-sc-via]', p.via === 'agent' ? 'AGENTE DE MISSION CONTROL' : p.via ? p.via.toUpperCase().replace('PORT', 'PUERTO') : p.probed?.length ? 'PUERTOS ' + p.probed.join(', ') + ' CERRADOS' : 'SIN PUERTOS DE PRUEBA');
    set('[data-sc-last]', data.lastWake ? fmt(data.lastWake.at) + (data.lastWake.ok ? '' : ' · FALLÓ') : 'NUNCA');
    set('[data-sc-checked]', ago(Date.now()));
    cooldownUntil = data.cooldownUntil || 0;
    const button = $('#sc-wake');
    button.hidden = !data.canWake;
    button.disabled = !data.canWake || p.state === 'unconfigured' || online || Date.now() < cooldownUntil;
    if (p.state === 'unconfigured') feedback(data.canWake ? 'Abre «Configuración» y guarda la MAC, el host y el puerto para poder encenderlo.' : 'El propietario aún no ha configurado ServerCesar.');
    else if (online) feedback('ServerCesar está encendido.', 'success');
    else if (Date.now() < fastUntil) feedback('Paquete enviado. Esperando a que arranque…');
    else if (!p.probed?.length && p.via == null) feedback('No se puede saber si está encendido: añade un puerto para comprobar el estado en la configuración, o instala el agente de Mission Control en ese PC.');
    else feedback('Listo para encender.');
    const cfg = $('#sc-config'); cfg.hidden = !data.canWake;
    if (data.config && !cfg.dataset.filled) { const f = $('#sc-config-form'); f.mac.value = data.config.mac; f.host.value = data.config.host; f.wolPort.value = data.config.wolPort; f.probePorts.value = data.config.probePorts.join(', '); cfg.dataset.filled = '1'; }
    if (p.state === 'unconfigured' && data.canWake) cfg.open = true;
  }

  async function refresh() {
    clearTimeout(timer);
    try {
      const response = await fetch('/control/api/servercesar/status', {credentials: 'same-origin', headers: {accept: 'application/json'}});
      if (!response.ok) throw new Error('status ' + response.status);
      render(await response.json());
    } catch { feedback('No se pudo consultar el estado ahora mismo.', 'error'); }
    const visible = document.getElementById('infrastructure')?.classList.contains('active') && !document.hidden;
    timer = setTimeout(refresh, Date.now() < fastUntil ? 8000 : visible ? 30000 : 120000);
  }

  async function wake() {
    const button = $('#sc-wake'); button.disabled = true; feedback('Enviando paquete de encendido…');
    try {
      const response = await fetch('/control/api/servercesar/wake', {method: 'POST', credentials: 'same-origin', headers: {'content-type': 'application/json', 'x-csrf-token': csrf}, body: '{}'});
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.ok) { fastUntil = Date.now() + 3 * 60e3; feedback('Paquete enviado (' + (data.message || 'ok') + '). Esperando a que arranque…', 'success'); }
      else if (data.error === 'cooldown') feedback('Ya se envió hace menos de un minuto. Espera un momento.', 'error');
      else feedback('No se pudo enviar: ' + (data.message || data.error || response.status), 'error');
    } catch { feedback('No se pudo enviar el paquete. Inténtalo de nuevo.', 'error'); }
    setTimeout(refresh, 1500);
  }

  async function save(event) {
    event.preventDefault();
    const f = event.currentTarget, body = {mac: f.mac.value, host: f.host.value, wolPort: Number(f.wolPort.value), probePorts: f.probePorts.value};
    const messages = {invalid_mac: 'La MAC no es válida (formato AA-BB-CC-DD-EE-FF).', invalid_host: 'El host no es válido.', invalid_wol_port: 'El puerto de Wake-on-LAN no es válido.', invalid_probe_ports: 'Los puertos de comprobación no son válidos (máximo 4).'};
    try {
      const response = await fetch('/control/api/servercesar/config', {method: 'POST', credentials: 'same-origin', headers: {'content-type': 'application/json', 'x-csrf-token': csrf}, body: JSON.stringify(body)});
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.ok) { feedback('Configuración guardada.', 'success'); $('#sc-config').open = false; refresh(); }
      else feedback(messages[data.error] || 'No se pudo guardar: ' + (data.error || response.status), 'error');
    } catch { feedback('No se pudo guardar la configuración.', 'error'); }
  }

  window.ServerCesar = {
    initialise(token, wakeAllowed) {
      csrf = token || ''; canWake = Boolean(wakeAllowed);
      if (started || !card()) return; started = true;
      $('#sc-wake').addEventListener('click', wake);
      $('#sc-config-form').addEventListener('submit', save);
      addEventListener('homelab:view', event => { if (event.detail === 'infrastructure') refresh(); });
      document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
      refresh();
    }
  };
  if (window.ServerCesarPending) window.ServerCesar.initialise(window.ServerCesarPending.csrf, window.ServerCesarPending.canWake);
})();
