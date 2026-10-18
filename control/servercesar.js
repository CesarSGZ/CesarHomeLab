// ServerCesar panel (Servers view): power status, app health from its agent, power on / reboot / shut down buttons, owner configuration.
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
    // remoteControl is the live state of the sessions, checked by the keeper task; null = not checked recently.
    if (name === 'claude') parts.push(a.remoteControl === true ? 'control remoto ON' : a.remoteControl === false ? 'CONTROL REMOTO OFF' : 'control remoto sin comprobar');
    if (name === 'claude' && a.detail) parts.push(a.detail);
    if (a.version) parts.push('v' + a.version);
    return parts.join(' · ');
  }

  function renderApps(data) {
    const agent = data.agent, fresh = Boolean(agent?.fresh);
    const sys = $('[data-sc-system]', card()); sys.hidden = !agent;
    if (agent) {
      // On since the later of the last boot and the last wake from sleep; nothing while it is off.
      const upSince = Math.max(agent.bootTime || 0, agent.resumeTime || 0);
      set('[data-sc-boot]', fresh && upSince ? fmt(upSince) : '—');
      const resume = data.lastResume;
      const causes = {network: 'RED', timer: 'TEMPORIZADOR', other: 'OTRO DISPOSITIVO', unknown: 'SIN IDENTIFICAR'};
      set('[data-sc-resume]', resume?.at ? fmt(resume.at) + ' · ' + (causes[resume.kind] || 'SIN IDENTIFICAR') + (resume.from ? ' · desde ' + resume.from : '') : 'SIN DATOS');
      const w = agent.wolPath, wEl = $('[data-sc-wolpath]', card());
      wEl.textContent = !w ? 'SIN COMPROBAR' : (w.ok ? 'PAQUETE RECIBIDO' : 'PAQUETE NO RECIBIDO') + ' · ' + ago(w.at);
      wEl.title = (w?.detail || '') + ' Recibir un paquete con el PC encendido no demuestra que pueda despertarlo.';
      wEl.dataset.ok = w ? String(Boolean(w.ok)) : '';
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

  // Reboot/"shutdown" lifecycle: queued → claimed by the agent → PC back with a newer boot time (reboot)
  // or the agent goes silent (shutdown = full power-off) until a Wake-on-LAN wakes it (newer resume time).
  function powerPhase(data) {
    const r = data.lastPower; if (!r || r.status === 'expired') return null;
    const off = r.action === 'shutdown', recent = Date.now() - r.at < 15 * 60e3;
    const upSince = Math.max(data.agent?.bootTime || 0, data.agent?.resumeTime || 0);
    const back = data.agent?.fresh && upSince > r.at;
    if (r.status === 'queued') return {busy: true, label: off ? 'APAGANDO' : 'REINICIANDO', text: 'Orden de ' + (off ? 'apagado' : 'reinicio') + ' en cola. El agente la recoge en unos 2 minutos…'};
    if (r.status === 'failed') return recent ? {text: (off ? 'El apagado' : 'El reinicio') + ' falló: ' + (r.result || 'sin detalle'), kind: 'error'} : null;
    if (back) return recent ? {text: 'ServerCesar ' + (off ? 'se volvió a encender' : 'se reinició y ya está de vuelta') + ' (' + fmt(upSince) + ').', kind: 'success'} : null;
    if (off) return data.agent?.fresh ? (Date.now() - r.at < 5 * 60e3 ? {busy: true, label: 'APAGANDO', text: 'Apagando ServerCesar…'} : null) : {label: 'SIN RESPUESTA', text: 'Orden de apagado enviada el ' + fmt(r.at) + '. El agente no responde; no se puede confirmar si está suspendido, apagado o desconectado.'};
    return recent ? {busy: true, label: 'REINICIANDO', text: 'Reiniciando ServerCesar… vuelve en uno o dos minutos.'} : null;
  }

  // The last magic packet and what it achieved: sending it is not the same as the PC turning on.
  function wakeOutcome(data) {
    const w = data.lastWake; if (!w) return 'NUNCA';
    const labels = {
      send_failed: 'NO SE PUDO ENVIAR',
      timer: 'DESPERTÓ POR TEMPORIZADOR',
      network: 'REACTIVACIÓN POR RED',
      returned_unconfirmed: 'VOLVIÓ · CAUSA NO CONFIRMADA',
      no_confirmation: 'SIN CONFIRMACIÓN DE ENCENDIDO',
      pending: 'ESPERANDO…',
    };
    return fmt(w.at) + ' · ' + (labels[w.outcome] || 'RESULTADO SIN VERIFICAR');
  }

  function render(data) {
    const p = data.power || {}, online = p.state === 'online', pill = $('[data-sc-pill]', card());
    const phase = powerPhase(data), label = phase?.label && (phase.busy || !online) ? phase.label : null;
    pill.textContent = label || (online ? 'ENCENDIDO' : p.state === 'unconfigured' ? 'SIN CONFIGURAR' : 'SIN RESPUESTA');
    pill.classList.toggle('online', online && !label);
    card().dataset.state = p.state || 'unknown';
    set('[data-sc-state]', label || (online ? 'ENCENDIDO' : p.state === 'unconfigured' ? 'SIN CONFIGURAR' : 'APAGADO O SIN RESPUESTA'));
    set('[data-sc-via]', p.via === 'agent' ? 'AGENTE DE SERVERCESAR' : p.via ? p.via.toUpperCase().replace('PORT', 'PUERTO') : p.probed?.length ? 'PUERTOS ' + p.probed.join(', ') + ' CERRADOS' : 'SIN PUERTOS DE PRUEBA');
    set('[data-sc-last]', wakeOutcome(data));
    set('[data-sc-checked]', ago(Date.now()));
    renderApps(data);
    cooldownUntil = data.cooldownUntil || 0;
    const button = $('#sc-wake');
    button.hidden = !data.canWake;
    button.disabled = !data.canWake || p.state === 'unconfigured' || online || Date.now() < cooldownUntil;
    $('#sc-power-row').hidden = !data.canWake;
    const powerBlocked = !data.canWake || !data.agent?.fresh || Boolean(phase?.busy) || Date.now() < (data.powerCooldownUntil || 0);
    // Never offer "Apagar" unless the agent has just proved a magic packet from the Internet reaches the PC.
    $('#sc-reboot').disabled = powerBlocked;
    // S5 recovery verified; still require a fresh agent and recent packet-delivery check.
    $('#sc-shutdown').disabled = powerBlocked || !data.shutdownEnabled || !data.agent?.wolPath?.ok || Date.now() - (data.agent.wolPath.at || 0) >= 12 * 3600e3;
    $('#sc-shutdown').title = 'Apagado completo; requiere agente conectado y comprobación reciente de la ruta WOL';
    if (phase && !(online && phase.label === 'APAGADO')) { feedback(phase.text, phase.kind); if (phase.busy) fastUntil = Math.max(fastUntil, Date.now() + 60e3); }
    else if (p.state === 'unconfigured' && !online) feedback(data.canWake ? 'Abre «Configuración» y guarda la MAC, el host y el puerto para poder encenderlo.' : 'El propietario aún no ha configurado ServerCesar.');
    else if (online) {
      const bad = Object.entries(data.apps || {}).filter(([, a]) => a.health !== 'ok').map(([n]) => ({claude: 'Claude', chatgpt: 'ChatGPT', parsec: 'Parsec', tailscale: 'Tailscale'})[n]);
      if (!data.agent?.fresh) feedback('ServerCesar está encendido, pero su agente no da señal: no se puede ver el estado de las aplicaciones ni reiniciarlo.', 'error');
      else if (data.agent.wolPath && !data.agent.wolPath.ok) feedback('ServerCesar está encendido, pero el paquete de encendido no llega desde Internet: «Apagar» está bloqueado hasta que se arregle el reenvío del router.', 'error');
      else if (bad.length) feedback('ServerCesar está encendido. Revisa: ' + bad.join(', ') + '.', 'error');
      else feedback('ServerCesar está encendido. Aplicaciones abiertas; las sesiones guardadas no garantizan que su acceso siga siendo válido.', 'success');
    }
    else if (Date.now() < fastUntil) feedback('Paquete enviado. Esperando a que arranque…');
    else if (!p.probed?.length && p.via == null && !data.agent) feedback('No se puede saber si está encendido: añade un puerto para comprobar el estado en la configuración, o instala el agente de ServerCesar en ese PC.');
    else feedback('Puedes enviar el paquete de encendido. La web confirmará cuando el agente vuelva a responder.');
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
    // Poll gently: the agent only reports every 120 s, and a tab left open must not drain the D1 free tier.
    timer = setTimeout(refresh, Date.now() < fastUntil ? 8000 : visible ? 60000 : 300000);
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

  async function power(action) {
    const off = action === 'shutdown';
    const question = off
      ? '¿Apagar ServerCesar por completo? Se cerrarán Minecraft y las aplicaciones. Podrás volver a encenderlo con «Encender ServerCesar». Guarda antes cualquier trabajo pendiente.'
      : '¿Reiniciar ServerCesar ahora? Se cerrará todo lo que esté abierto (Minecraft incluido) y volverá a arrancar solo.';
    if (!confirm(question)) return;
    $('#sc-reboot').disabled = true; $('#sc-shutdown').disabled = true;
    feedback('Enviando orden de ' + (off ? 'apagado' : 'reinicio') + '…');
    try {
      const response = await fetch('/control/api/servercesar/power', {method: 'POST', credentials: 'same-origin', headers: {'content-type': 'application/json', 'x-csrf-token': csrf}, body: JSON.stringify({action})});
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.ok) { fastUntil = Date.now() + 4 * 60e3; feedback('Orden enviada. El agente la recoge en unos 2 minutos…', 'success'); }
      else if (data.error === 'cooldown') feedback('Ya se pidió un reinicio o apagado hace menos de 3 minutos. Espera un momento.', 'error');
      else if (data.error === 'agent_offline') feedback('El agente de ServerCesar no da señal, así que no puede recibir la orden.', 'error');
      else if (data.error === 'shutdown_disabled') feedback('«Apagar» está desactivado hasta que el encendido remoto esté comprobado.', 'error');
      else if (data.error === 'wol_route_unverified') feedback('No se apaga: el paquete de encendido no está comprobado desde Internet y luego no podrías encenderlo.', 'error');
      else feedback('No se pudo enviar la orden: ' + (data.error || response.status), 'error');
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
      $('#sc-reboot').addEventListener('click', () => power('reboot'));
      $('#sc-shutdown').addEventListener('click', () => power('shutdown'));
      $('#sc-config-form').addEventListener('submit', save);
      addEventListener('homelab:view', event => { if (event.detail === 'infrastructure') refresh(); });
      document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
      refresh();
    }
  };
  if (window.ServerCesarPending) window.ServerCesar.initialise(window.ServerCesarPending.csrf, window.ServerCesarPending.canWake);
})();
