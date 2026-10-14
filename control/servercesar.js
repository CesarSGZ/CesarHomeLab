// ServerCesar panel (Servers view): power status, app health from its agent, Wake-on-LAN and reboot buttons, owner configuration.
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  let csrf = '', canWake = false, timer = 0, fastUntil = 0, cooldownUntil = 0, started = false;
  const card = () => document.getElementById('servercesar');
  const fmt = t => t ? new Intl.DateTimeFormat('es-ES', {timeZone: 'Europe/Madrid', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'}).format(new Date(t)) : 'NUNCA';
  const ago = t => { if (!t) return '—'; const s = Math.round((Date.now() - t) / 1000); return s < 60 ? 'hace ' + s + ' s' : s < 3600 ? 'hace ' + Math.round(s / 60) + ' min' : fmt(t); };
  const set = (sel, text) => { const el = $(sel, card()); if (el) el.textContent = text; };
  const feedback = (text, kind = '') => { const el = $('#sc-feedback'); el.className = 'command-feedback' + (kind ? ' ' + kind : ''); el.textContent = text; };
  const pct = v => v == null ? '—' : Math.round(v) + ' %';

  function appDetail(name, a, fresh) {
    if (!fresh) return 'Sin datos del agente';
    if (!a) return 'El agente no la ha comprobado';
    if (a.service === 'stopped') return 'Servicio detenido';
    if (a.running === false) return 'Cerrada · el guardián la está abriendo';
    const parts = [];
    if (name === 'tailscale') parts.push(a.online === false ? 'Sin conexión a la red' : a.signedIn ? 'Conectado' : 'Sesión cerrada');
    else parts.push(a.signedIn === true ? 'Sesión iniciada' : a.signedIn === false ? 'SESIÓN CERRADA' : 'Abierta');
    if (a.responding === false) parts.push('no responde');
    if (name === 'claude' && a.remoteControl != null) parts.push('control remoto ' + (a.remoteControl ? 'ON' : 'OFF'));
    if (a.version) parts.push('v' + a.version);
    return parts.join(' · ');
  }

  function renderApps(data) {
    const agent = data.agent, fresh = Boolean(agent?.fresh);
    const sys = $('[data-sc-system]', card()); sys.hidden = !agent;
    if (agent) {
      set('[data-sc-boot]', agent.bootTime ? fmt(agent.bootTime) : '—');
      set('[data-sc-cpu]', fresh ? pct(agent.cpu) : '—');
      set('[data-sc-ram]', fresh ? pct(agent.ram) : '—');
      set('[data-sc-disk]', fresh && agent.diskFreeGb != null ? Math.round(agent.diskFreeGb) + ' GB' : '—');
      set('[data-sc-session]', !fresh ? '—' : agent.userSession ? 'INICIADA' : 'SIN SESIÓN');
    }
    card().querySelectorAll('[data-app]').forEach(li => {
      const a = data.apps?.[li.dataset.app];
      li.dataset.health = fresh && a ? a.health : 'unknown';
      $('[data-app-detail]', li).textContent = appDetail(li.dataset.app, a, fresh);
    });
  }

  // Reboot lifecycle: queued → claimed by the agent → PC back with a newer boot time.
  function rebootPhase(data) {
    const r = data.lastReboot; if (!r) return null;
    if (r.status === 'queued') return {busy: true, text: 'Orden de reinicio en cola. El agente la recoge en menos de 30 s…'};
    if (r.status === 'failed') return {busy: false, text: 'El reinicio falló: ' + (r.result || 'sin detalle'), kind: 'error', recent: Date.now() - r.at < 15 * 60e3};
    if (r.status === 'expired') return null;
    const back = data.agent?.bootTime && data.agent.bootTime > r.at && data.agent.fresh;
    if (back) return Date.now() - r.at < 15 * 60e3 ? {busy: false, text: 'ServerCesar se reinició y ya está de vuelta (' + fmt(data.agent.bootTime) + ').', kind: 'success', recent: true} : null;
    return Date.now() - r.at < 15 * 60e3 ? {busy: true, text: 'Reiniciando ServerCesar… vuelve en uno o dos minutos.'} : null;
  }

  function render(data) {
    const p = data.power || {}, online = p.state === 'online', pill = $('[data-sc-pill]', card());
    const phase = rebootPhase(data);
    pill.textContent = phase?.busy ? 'REINICIANDO' : online ? 'ENCENDIDO' : p.state === 'unconfigured' ? 'SIN CONFIGURAR' : 'SIN RESPUESTA';
    pill.classList.toggle('online', online && !phase?.busy);
    card().dataset.state = p.state || 'unknown';
    set('[data-sc-state]', phase?.busy ? 'REINICIANDO' : online ? 'ENCENDIDO' : p.state === 'unconfigured' ? 'SIN CONFIGURAR' : 'APAGADO O SIN RESPUESTA');
    set('[data-sc-via]', p.via === 'agent' ? 'AGENTE DE SERVERCESAR' : p.via ? p.via.toUpperCase().replace('PORT', 'PUERTO') : p.probed?.length ? 'PUERTOS ' + p.probed.join(', ') + ' CERRADOS' : 'SIN PUERTOS DE PRUEBA');
    set('[data-sc-last]', data.lastWake ? fmt(data.lastWake.at) + (data.lastWake.ok ? '' : ' · FALLÓ') : 'NUNCA');
    set('[data-sc-checked]', ago(Date.now()));
    renderApps(data);
    cooldownUntil = data.cooldownUntil || 0;
    const button = $('#sc-wake');
    button.hidden = !data.canWake;
    button.disabled = !data.canWake || p.state === 'unconfigured' || online || Date.now() < cooldownUntil;
    const rebootRow = $('#sc-reboot-row'), reboot = $('#sc-reboot');
    rebootRow.hidden = !data.canWake;
    reboot.disabled = !data.canWake || !data.agent?.fresh || Boolean(phase?.busy) || Date.now() < (data.rebootCooldownUntil || 0);
    if (phase && (phase.busy || phase.recent)) { feedback(phase.text, phase.kind); if (phase.busy) fastUntil = Math.max(fastUntil, Date.now() + 60e3); }
    else if (p.state === 'unconfigured' && !online) feedback(data.canWake ? 'Abre «Configuración» y guarda la MAC, el host y el puerto para poder encenderlo.' : 'El propietario aún no ha configurado ServerCesar.');
    else if (online) {
      const bad = Object.entries(data.apps || {}).filter(([, a]) => a.health !== 'ok').map(([n]) => ({claude: 'Claude', chatgpt: 'ChatGPT', parsec: 'Parsec', tailscale: 'Tailscale'})[n]);
      if (!data.agent?.fresh) feedback('ServerCesar está encendido, pero su agente no da señal: no se puede ver el estado de las aplicaciones ni reiniciarlo.', 'error');
      else if (bad.length) feedback('ServerCesar está encendido. Revisa: ' + bad.join(', ') + '.', 'error');
      else feedback('ServerCesar está encendido y todas sus aplicaciones funcionan con la sesión iniciada.', 'success');
    }
    else if (Date.now() < fastUntil) feedback('Paquete enviado. Esperando a que arranque…');
    else if (!p.probed?.length && p.via == null && !data.agent) feedback('No se puede saber si está encendido: añade un puerto para comprobar el estado en la configuración, o instala el agente de ServerCesar en ese PC.');
    else feedback('Listo para encender.');
    const cfg = $('#sc-config'); cfg.hidden = !data.canWake;
    if (data.config && !cfg.dataset.filled) { const f = $('#sc-config-form'); f.mac.value = data.config.mac; f.host.value = data.config.host; f.wolPort.value = data.config.wolPort; f.probePorts.value = data.config.probePorts.join(', '); cfg.dataset.filled = '1'; }
    if (p.state === 'unconfigured' && data.canWake && !online) cfg.open = true;
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

  async function reboot() {
    if (!confirm('¿Reiniciar ServerCesar ahora? Se cerrará todo lo que esté abierto (Minecraft incluido) y volverá a arrancar solo.')) return;
    const button = $('#sc-reboot'); button.disabled = true; feedback('Enviando orden de reinicio…');
    try {
      const response = await fetch('/control/api/servercesar/reboot', {method: 'POST', credentials: 'same-origin', headers: {'content-type': 'application/json', 'x-csrf-token': csrf}, body: '{}'});
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.ok) { fastUntil = Date.now() + 4 * 60e3; feedback('Orden enviada. El agente la recoge en menos de 30 s…', 'success'); }
      else if (data.error === 'cooldown') feedback('Ya se pidió un reinicio hace menos de 3 minutos. Espera un momento.', 'error');
      else if (data.error === 'agent_offline') feedback('El agente de ServerCesar no da señal, así que no puede recibir la orden.', 'error');
      else feedback('No se pudo pedir el reinicio: ' + (data.error || response.status), 'error');
    } catch { feedback('No se pudo enviar la orden. Inténtalo de nuevo.', 'error'); }
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
      $('#sc-reboot').addEventListener('click', reboot);
      $('#sc-config-form').addEventListener('submit', save);
      addEventListener('homelab:view', event => { if (event.detail === 'infrastructure') refresh(); });
      document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
      refresh();
    }
  };
  if (window.ServerCesarPending) window.ServerCesar.initialise(window.ServerCesarPending.csrf, window.ServerCesarPending.canWake);
})();
