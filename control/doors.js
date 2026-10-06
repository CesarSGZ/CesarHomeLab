(() => {
  let catalog, root, csrf, user, room = null, rooms = [], busy = false, online = true, error = '', lastPhase = '', lastUpdate = 0;
  let rulesOpen = false, listBusy = false, pollBusy = false;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const name = id => room?.players.find(p => p.id === id)?.name || 'Jugador';
  const initials = label => label.replace(/[^\p{L}\p{N}]/gu, '').slice(0, 2).toUpperCase();
  const btn = (label, action, cls = '', attrs = '') => `<button type="button" class="dg-button ${cls}" data-act="${action}" ${attrs}>${label}</button>`;
  const living = () => room.players.filter(p => p.lives > 0);
  const mine = () => room.players.find(p => p.id === user.id);
  const available = card => card.acquired < room.round && (catalog.CARDS[card.type].window === room.phase || catalog.CARDS[card.type].extraWindow === room.phase);
  async function api(path = '', body) {
    const response = await fetch(`/control/api/doors${path}`, {
      method: body ? 'POST' : 'GET', credentials: 'same-origin', cache: 'no-store',
      headers: body ? { 'content-type': 'application/json', 'x-csrf-token': csrf } : {},
      body: body ? JSON.stringify(body) : undefined,
    });
    const result = await response.json();
    if (response.status === 401) { location.assign('/control/login'); throw new Error('Tu sesión ha caducado.'); }
    if (!response.ok) { const failure = new Error(result.error || 'No se pudo conectar.'); failure.status = response.status; throw failure; }
    online = true; lastUpdate = Date.now(); return result;
  }
  function remember() {
    try {
      if (room) localStorage.setItem(`doors-room:${user.id}`, room.code);
      else localStorage.removeItem(`doors-room:${user.id}`);
    } catch {}
  }
  async function refreshList(render = true) {
    if (listBusy) return;
    listBusy = true;
    try { rooms = (await api()).rooms; if (render && !room) paint(); }
    catch (e) { online = false; error = e.message; if (render) paint(); }
    finally { listBusy = false; }
  }
  async function refreshRoom() {
    if (!room || pollBusy || busy) return;
    pollBusy = true;
    try {
      const response = await api(`/${room.code}`);
      if (response.room.version !== room.version || !online) { room = response.room; paint(); }
      else updateSignal();
      if (room.pending && room.pending.deadline <= Date.now()) {
        const result = await api(`/${room.code}`, { action: 'tick', version: room.version });
        room = result.room; paint();
      }
    } catch (e) {
      if (e.status === 403 || e.status === 404) { room = null; remember(); error = e.message; await refreshList(); }
      else if (e.status !== 409) { online = false; error = e.message; updateSignal(); }
    } finally { pollBusy = false; }
  }
  async function act(input) {
    if (busy) return;
    busy = true; error = ''; root.querySelectorAll('button[type="submit"], [data-act]').forEach(b => { b.disabled = true; });
    try {
      const result = await api(room ? `/${room.code}` : '', { ...input, ...(room ? { version: room.version } : {}) });
      if (result.left) { room = null; remember(); await refreshList(false); }
      else if (result.room) { room = result.room; remember(); }
    } catch (e) {
      error = e.message;
      if (e.status === 409 && room) {
        try { room = (await api(`/${room.code}`)).room; } catch {}
      }
    } finally { busy = false; paint(); }
  }
  async function enter(code, member = false) {
    if (busy) return;
    busy = true; error = '';
    try {
      code = String(code).trim().toUpperCase();
      if (!/^[A-Z2-9]{6}$/.test(code)) throw new Error('Introduce el código de seis caracteres.');
      if (member) room = (await api(`/${code}`)).room;
      else {
        // A code is enough to join; the server checks membership and capacity atomically.
        const response = await fetch(`/control/api/doors/${code}`, { credentials: 'same-origin', cache: 'no-store' });
        const result = await response.json();
        if (response.ok) room = result.room;
        else if (response.status === 403) {
          await refreshList(false);
          const lobby = rooms.find(r => r.code === code);
          if (!lobby) throw new Error('No hay una sala abierta con ese código.');
          // The lightweight lobby listing exposes its revision, never its secrets.
          room = (await api(`/${code}`, { action: 'join', version: lobby.version })).room;
        } else throw new Error(result.error || 'No existe esa sala.');
      }
      remember();
    } catch (e) { error = e.message; }
    finally { busy = false; paint(); }
  }
  const portal = (i, small = false) => `<div class="dg-portal ${small ? 'small' : ''}" aria-hidden="true" style="--portal-hue:${[38, 185, 267, 340][i % 4]}"><span class="dg-portal-aura"></span><span class="dg-portal-arch"><i></i><b>✦</b></span><span class="dg-portal-floor"></span></div>`;
  function header() {
    return `<header class="dg-header"><div><p class="dg-kicker">PARTY GAME / MULTIJUGADOR</p><h2>Juego de las <em>Puertas.</em></h2><p>Inventa lo imposible. Elige tu destino. Convéncelos de que puedes sobrevivir.</p></div><div class="dg-header-actions"><span class="dg-signal" data-dg-signal>${online ? '● CONECTADO' : '○ RECONECTANDO'}</span>${btn(rulesOpen ? 'Cerrar reglas' : 'Cómo se juega', 'rules', 'quiet')}${room ? btn('Mis salas', 'back', 'quiet') : ''}</div></header>`;
  }
  function rules() {
    if (!rulesOpen) return '';
    return `<section class="dg-rules"><h3>Astucia, imaginación y un poco de traición.</h3><div class="dg-rule-grid">
      <article><b>01</b><h4>Tres vidas, un rol secreto</h4><p>De 3 a 12 jugadores. Tu rol te pide inventar una puerta victoriosa, mortal o libre. Siempre hay al menos un rol mortal. Respeta esa intención al inventar el enemigo: la sala juzga la coherencia, no una IA.</p></article>
      <article><b>02</b><h4>Escenario + arma</h4><p>Por turnos, cada uno inventa una puerta. Un dado decide cuáles tienen recompensa: las tiradas más altas ganan; el desempate es aleatorio. Puedes usar el generador como inspiración y editarlo todo.</p></article>
      <article><b>03</b><h4>Elige y juega tus cartas</h4><p>Varias personas pueden elegir la misma puerta, incluso su creador. Después se cambian las armas; el creador asigna un enemigo secreto a cada visitante. Hay una ventana para Espía y Cebo antes de revelar, y otra para las habilidades de enemigo.</p></article>
      <article><b>04</b><h4>Convence al grupo</h4><p>Todos los jugadores vivos, incluido el combatiente, votan si puede vencer con ese escenario y arma. Los votos son secretos hasta resolver. Una mayoría de «no» resta una vida; un empate permite sobrevivir. Con duplicador debes superar dos pruebas, pero solo arriesgas una vida.</p></article>
      <article><b>05</b><h4>Recompensas, no resurrecciones</h4><p>Las habilidades se entregan al cerrar la ronda, solo a quienes siguen vivos. Vida Extra actúa entonces; las otras cartas se guardan para futuras rondas. Reflejo caduca al cerrar su primera ronda de uso. Los eliminados pueden mirar y usar el chat.</p></article>
      <article><b>06</b><h4>Los dos últimos ganan</h4><p>En cuanto quedan dos jugadores vivos, ambos ganan y no se necesitan más combates. El primer turno rota cada ronda. Las salas se guardan automáticamente; puedes volver con tu cuenta desde otro ordenador.</p></article>
    </div><details><summary>Ajustes digitales y reparto escalable</summary><p>La conversación original dejaba sin concretar cantidades, empates y ventanas de reacción. Aquí cada ronda reparte ⌊N/4⌋ roles mortales (mínimo uno), ⌊N/3⌋ victoriosos (mínimo uno) y el resto libres. Hay ⌊N/3⌋ puertas con recompensa (mínimo una). Con 3 jugadores hay cartas de armas, Espía, Mutación, Cebo y reacciones; desde 4 se añaden cambios de enemigo y reasignación; desde 6, Duplicador y Vida Extra. Esto evita que las cartas de vidas alarguen el tramo final.</p><p>Las acciones tienen 15 segundos para reflejar o interrumpir, o se resuelven antes si todos pasan. Un reflejo por acción; Interrupción puede cancelarlo antes de su resolución. Si reflejas un intercambio hacia un objetivo que ya figura en él, el intercambio se anula. Mutación necesita más «sí» que «no»; el empate la rechaza. No hay reparto inicial de habilidades, porque se ganan en las puertas.</p></details><details><summary>Las 12 habilidades</summary><div class="dg-card-guide">${Object.values(catalog.CARDS).map(c => `<article><span>${c.icon}</span><div><h4>${esc(c.name)}</h4><p>${esc(c.description)}</p></div></article>`).join('')}</div></details></section>`;
  }
  function lobbyBrowser() {
    return `<div class="dg-lobby-hero"><div><span class="dg-badge">3–12 JUGADORES · 3 VIDAS · 2 GANADORES</span><h3>La próxima puerta<br>la abres <em>tú.</em></h3><p>Una sala compartida para inventar escenarios absurdos, negociar tu supervivencia y jugar las cartas cuando nadie se lo espera.</p><form data-dg-form="create" data-key="create"><label>Nombre de la partida<input name="title" maxlength="70" required placeholder="La noche de las malas decisiones" value="Las puertas del destino"></label><button class="dg-button primary" type="submit">Crear partida <span>↗</span></button></form></div><div class="dg-hero-art">${portal(0)}<span class="dg-orbit-label">EL ENEMIGO ES UNA SORPRESA</span></div></div>
      <div class="dg-lobby-toolbar"><div><p class="dg-kicker">SALAS COMPARTIDAS</p><h3>Encuentra a tu grupo.</h3></div><form data-dg-form="join" data-key="join"><label class="sr-only" for="dg-code">Código de sala</label><input id="dg-code" name="code" maxlength="6" pattern="[A-Za-z2-9]{6}" placeholder="CÓDIGO" required autocomplete="off"><button type="submit" class="dg-button">Unirme</button></form>${btn('↻ Actualizar', 'refresh', 'quiet')}</div>
      <div class="dg-rooms">${rooms.length ? rooms.map(r => `<article class="dg-room-card"><div class="dg-room-symbol">${r.phase === 'lobby' ? '◇' : r.phase === 'finished' ? '♔' : '⚔'}</div><p class="dg-kicker">${esc(r.code)} / ${esc(catalog.PHASES[r.phase])}</p><h4>${esc(r.title)}</h4><p>${esc(r.players.join(' · '))}</p><footer><span>${r.count}/12 jugadores${r.round ? ` · Ronda ${r.round}` : ''}</span>${btn(r.member ? 'Volver a la sala →' : 'Unirme →', 'enter', 'quiet', `data-code="${r.code}" data-member="${r.member}" ${r.phase !== 'lobby' && !r.member ? 'disabled' : ''}`)}</footer></article>`).join('') : `<div class="dg-empty"><span>◇</span><h4>Aún no hay salas.</h4><p>Crea la primera y comparte el código con tus amigos. Todos necesitan su propia cuenta de Mission Control.</p></div>`}</div>`;
  }
  function players() {
    return `<section class="dg-players" aria-label="Jugadores">${room.players.map((p, i) => `<article class="dg-player ${p.id === user.id ? 'is-me' : ''} ${p.lives === 0 ? 'eliminated' : ''} ${p.id === room.turn ? 'is-turn' : ''}"><span class="dg-avatar" style="--player-hue:${(i * 47 + 190) % 360}">${esc(initials(p.name))}</span><div><strong>${esc(p.name)} ${p.id === room.host ? '<small>♔</small>' : ''}</strong><span class="dg-lives" aria-label="${p.lives} vidas">${p.lives ? '♥'.repeat(Math.min(p.lives, 6)) + (p.lives > 6 ? ` +${p.lives - 6}` : '') : 'ESPECTADOR'}</span></div><small>${room.phase === 'lobby' ? p.ready ? 'LISTO' : 'ESPERANDO' : p.ready ? '✓ LISTO' : p.id === room.turn && ['crafting', 'choosing'].includes(room.phase) ? 'SU TURNO' : `${p.cardCount} CARTAS`}</small>${room.phase === 'lobby' && room.host === user.id && p.id !== user.id ? btn('×', 'kick', 'icon', `data-target="${p.id}" aria-label="Expulsar a ${esc(p.name)}"`) : ''}</article>`).join('')}</section>`;
  }
  function stageLabel() {
    const messages = {
      lobby: 'Marca «Estoy listo»; el anfitrión empezará cuando el grupo esté preparado.',
      crafting: room.turn === user.id ? 'Es tu turno. Inventa el escenario y el arma de tu puerta.' : `${name(room.turn)} está inventando una puerta.`,
      choosing: room.turn === user.id ? 'Te toca elegir. La recompensa solo será tuya si sigues vivo.' : `${name(room.turn)} está eligiendo su destino.`,
      preparation: 'Usa cartas para preparar las armas o confirma que has terminado.',
      assigning: 'Cada creador debe sellar un enemigo para cada visitante de su puerta.',
      sealed: 'Los enemigos están sellados. Espía y Cebo pueden adelantarse a la revelación.',
      revealed: 'Ya conocéis los enemigos. Última oportunidad para cambiar el combate.',
      combat: 'Debatid en el chat y votad: ¿puede vencer con lo que tiene?',
      results: 'Revisa los veredictos. Cuando todos estén listos comienza otra ronda.',
      finished: 'Dos supervivientes. Una victoria compartida.', cancelled: 'El anfitrión ha cerrado la sala.',
    };
    return messages[room.phase];
  }
  function stage() {
    const p = mine();
    const blocked = Boolean(room.pending || room.vote || room.request);
    const readiness = living().filter(p => p.ready).length;
    let content = '';
    if (room.phase === 'lobby') {
      content = `<div class="dg-waiting">${portal(1, true)}<div><h3>Reúne a los supervivientes.</h3><p>Necesitáis al menos tres cuentas diferentes. Quien entre en esta sala tendrá un rol y una mano privados. No se muestran los apartados personales del propietario.</p><p><b>${room.players.length} de 12 plazas</b> · ${readiness} listos</p><div class="dg-actions">${btn(p.ready ? 'Ya estoy listo ✓' : 'Estoy listo', 'ready', 'primary')}${room.host === user.id ? btn('Empezar partida →', 'start', '', `${room.players.length < 3 || readiness !== room.players.length ? 'disabled' : ''}`) : ''}${btn('Salir de esta sala', 'leave', 'quiet')}</div></div></div>`;
    } else if (room.phase === 'crafting' && room.turn === user.id) {
      content = `<form class="dg-craft" data-dg-form="craft" data-key="craft:${room.round}"><div class="dg-form-head"><h3>Diseña tu puerta.</h3>${btn('⚄ Sorpréndeme', 'generate-door', 'quiet')}</div><label>¿Dónde ocurre?<textarea name="scenario" rows="3" maxlength="500" required placeholder="Un escenario con sus propias reglas…"></textarea></label><label>¿Con qué arma?<input name="weapon" maxlength="320" required placeholder="Algo útil. O algo terriblemente poco útil."></label><button type="submit" class="dg-button primary">Sellar puerta →</button><small>El generador es una fuente de ideas local. Puedes cambiar todo antes de enviarlo.</small></form>`;
    } else if (room.phase === 'assigning') {
      const assignments = living().filter(p => !p.enemyAssigned && room.doors.find(d => d.id === p.choice)?.creator === user.id);
      content = assignments.length ? `<div class="dg-assignments"><h3>Tú conoces lo que hay detrás.</h3>${assignments.map(t => `<form data-dg-form="assign" data-key="assign:${room.round}:${t.id}"><input type="hidden" name="target" value="${t.id}"><label>Enemigo para ${esc(t.name)}<input name="enemy" maxlength="320" required placeholder="Inventa el enemigo secreto…"></label>${btn('⚄ Idea', 'generate-enemy', 'quiet')}<button class="dg-button primary" type="submit">Sellar enemigo</button></form>`).join('')}</div>` : `<div class="dg-wait-note"><span>◈</span><h3>Los enemigos se están preparando.</h3><p>${living().filter(p => !p.enemyAssigned).length} asignaciones pendientes. No se revelarán hasta que todos estén listos.</p></div>`;
    } else if (room.request) {
      content = room.request.author === user.id ? `<form data-dg-form="reassign" data-key="reassign:${room.request.target}"><h3>El azar te ha elegido.</h3><label>Nuevo enemigo para ${esc(name(room.request.target))}<input name="enemy" maxlength="320" required></label>${btn('⚄ Idea', 'generate-enemy', 'quiet')}<button type="submit" class="dg-button primary">Asignar enemigo</button></form>` : `<div class="dg-wait-note"><h3>${esc(name(room.request.author))} inventa otro enemigo.</h3><p>La carta de Reasignación ha cambiado el destino de ${esc(name(room.request.target))}.</p></div>`;
    } else if (room.vote) {
      const t = room.players.find(p => p.id === room.vote.target);
      const door = room.doors.find(d => d.id === t.choice);
      content = `<div class="dg-verdict"><p class="dg-kicker">${room.vote.kind === 'mutation' ? 'VOTACIÓN / MUTACIÓN' : `COMBATE / PRUEBA ${room.vote.attempt}${t.double ? ' DE 2' : ''}`}</p><h3>${room.vote.kind === 'mutation' ? '¿Aceptáis esta mutación?' : `¿Puede vencer ${esc(t.name)}?`}</h3><div class="dg-matchup"><div><small>ESCENARIO</small><p>${esc(door?.scenario)}</p></div><div><small>${room.vote.kind === 'mutation' ? 'ARMA PROPUESTA' : 'ARMA ACTUAL'}</small><p>${esc(room.vote.weapon || t.weapon)}</p></div><div><small>${room.vote.kind === 'mutation' ? 'JUSTIFICACIÓN' : 'ENEMIGO'}</small><p>${esc(room.vote.reason || t.enemy)}</p></div></div><div class="dg-vote-count"><span>${room.vote.count}/${room.vote.total} votos</span><progress max="${room.vote.total}" value="${room.vote.count}"></progress></div>${room.vote.canVote ? `<div class="dg-actions">${btn(room.vote.kind === 'mutation' ? 'Sí, tiene sentido' : 'Sí, puede vencer', 'vote-yes', 'primary')}${btn(room.vote.kind === 'mutation' ? 'No, no es válida' : 'No, no puede', 'vote-no', 'danger')}</div>` : `<p class="dg-voted">${room.vote.mine !== null ? `Tu voto: ${room.vote.mine ? 'SÍ' : 'NO'}. ` : ''}Esperando al resto. Los votos no se muestran hasta resolver.</p>`}</div>`;
    } else if (['preparation', 'sealed', 'revealed', 'results'].includes(room.phase) && p.lives > 0) {
      content = `<div class="dg-advance"><div><h3>${room.phase === 'results' ? 'La siguiente ronda empieza contigo.' : '¿Has terminado tus movimientos?'}</h3><p>${readiness}/${living().length} jugadores preparados. ${room.phase === 'results' ? 'Nuevas puertas, nuevos roles, mismas cuentas pendientes.' : 'Jugar una carta vuelve a abrir la confirmación para todo el grupo.'}</p></div>${btn(p.ready ? 'Listo ✓ · volver a esperar' : room.phase === 'results' ? 'Listo para otra ronda →' : 'He terminado →', 'ready', 'primary', blocked ? 'disabled' : '')}</div>`;
    } else if (room.phase === 'finished') {
      content = `<div class="dg-victory"><span>♔</span><p class="dg-kicker">LOS ÚLTIMOS EN PIE</p><h3>${room.winners.map(id => esc(name(id))).join('<em> & </em>') || 'Sin supervivientes'}</h3><p>Sobrevivir juntos también es ganar.</p>${btn('Buscar otra partida →', 'back', 'primary')}</div>`;
    } else if (room.phase === 'cancelled') content = `<div class="dg-empty"><h3>Esta puerta ya está cerrada.</h3>${btn('Volver a las salas', 'back', 'primary')}</div>`;
    if (!content && p.lives === 0) content = '<div class="dg-wait-note"><h3>Estás como espectador.</h3><p>Puedes seguir la partida y conversar. Las decisiones pertenecen a quienes siguen vivos.</p></div>';
    return content ? `<section class="dg-stage">${content}</section>` : '';
  }
  function doorGrid() {
    if (!room.doors.length) return '';
    return `<section class="dg-door-gallery"><div class="dg-section-title"><h3>${room.phase === 'crafting' ? 'Las puertas toman forma.' : 'Elige con cuidado.'}</h3><span>${room.doors.length} PUERTAS${room.rewardCount ? ` / ${room.rewardCount} CON RECOMPENSA` : ''}</span></div><div class="dg-door-grid">${room.doors.map((d, i) => {
      const visitors = room.players.filter(p => p.choice === d.id);
      return `<article class="dg-door ${mine().choice === d.id ? 'chosen' : ''}" style="--door-color:${['#e8ba70', '#81d8e4', '#bfa2f6', '#efa0be'][i % 4]}"><div class="dg-door-top"><span>PUERTA ${String(i + 1).padStart(2, '0')}</span><small>${d.roll ? `⚄ ${d.roll}` : 'SELLANDO'}</small></div>${portal(i, true)}<p class="dg-door-author">${esc(name(d.creator))}</p><h4>${esc(d.scenario)}</h4><div class="dg-weapon"><small>ARMA ORIGINAL</small><p>${esc(d.weapon)}</p></div><div class="dg-reward ${d.reward ? 'has-reward' : ''}">${d.reward ? `<b>${catalog.CARDS[d.reward].icon}</b><div><strong>${esc(catalog.CARDS[d.reward].name)}</strong><small>Solo si sigues vivo al cerrar la ronda</small></div>` : '<span>Sin recompensa asociada</span>'}</div><div class="dg-door-visitors">${visitors.length ? visitors.map(p => `<span>${esc(p.name)}</span>`).join('') : '<small>Nadie ha entrado todavía</small>'}</div>${room.phase === 'choosing' && room.turn === user.id ? btn('Elegir esta puerta →', 'choose', 'primary', `data-door="${d.id}"`) : mine().choice === d.id ? '<span class="dg-your-door">✓ TU PUERTA</span>' : ''}</article>`;
    }).join('')}</div></section>`;
  }
  function options(selected = '', exclude = '') { return living().filter(p => p.id !== exclude).map(p => `<option value="${p.id}" ${p.id === selected ? 'selected' : ''}>${esc(p.name)}</option>`).join(''); }
  function hand() {
    if (room.phase === 'lobby' || room.phase === 'cancelled') return '';
    const blocked = room.pending || room.vote || room.request || mine().lives === 0;
    return `<section class="dg-hand"><div class="dg-section-title"><h3>Tu mano.</h3><span>PRIVADA / ${room.hand.length} CARTAS</span></div>${room.hand.length ? `<div class="dg-hand-grid">${room.hand.map(c => {
      const d = catalog.CARDS[c.type];
      const playable = available(c) && !blocked;
      return `<details class="dg-hand-card ${playable ? 'playable' : ''}" data-card-details="${c.id}"><summary><span>${d.icon}</span><div><small>${playable ? 'PUEDES JUGARLA' : d.window === 'reaction' ? 'REACCIÓN' : 'GUARDADA'}</small><strong>${esc(d.name)}</strong></div><b>+</b></summary><p>${esc(d.description)}</p>${c.expires ? `<small>Caduca al terminar la ronda ${c.expires}</small>` : ''}${playable ? cardForm(c) : `<small>${c.acquired === room.round ? 'Disponible a partir de la próxima ronda.' : d.window === 'reaction' ? 'Aparecerá en la ventana de reacción.' : `Ventana: ${esc(catalog.PHASES[d.window])}.`}</small>`}</details>`;
    }).join('')}</div>` : '<p class="dg-muted">Todavía no tienes cartas. Las ganas al sobrevivir a una puerta con recompensa.</p>'}</section>`;
  }
  function cardForm(card) {
    const type = card.type;
    const own = ['ownSwap', 'mutate'].includes(type);
    const other = ['enemy', 'double', 'bait'].includes(type);
    return `<form data-dg-form="card" data-key="card:${card.id}"><input type="hidden" name="card" value="${card.id}">${own ? `<input type="hidden" name="target" value="${user.id}">` : `<label>Objetivo<select name="target">${options(user.id, other ? user.id : '')}</select></label>`}${['swap', 'ownSwap'].includes(type) ? `<label>${own ? 'Intercambiar contigo' : 'Segundo jugador'}<select name="target2">${options('', own ? user.id : '')}</select></label>` : ''}${['weapon', 'enemy', 'mutate'].includes(type) ? `<label>${type === 'enemy' ? 'Nuevo enemigo' : 'Nueva arma'}<input name="value" maxlength="320" required></label>` : ''}${type === 'mutate' ? '<label>Justificación<textarea name="reason" maxlength="500" rows="2" required></textarea></label>' : ''}${type === 'spy' ? `<label>Información<select name="field"><option value="role">Rol secreto</option><option value="weapon">Arma</option>${room.phase === 'sealed' ? '<option value="enemy">Enemigo secreto</option>' : ''}</select></label>` : ''}<button type="submit" class="dg-button">Jugar carta →</button></form>`;
  }
  function reactions() {
    const p = room.pending;
    if (!p) return '';
    const interrupt = room.hand.find(c => c.type === 'interrupt' && c.acquired < room.round);
    const reflect = room.hand.find(c => c.type === 'reflect' && c.acquired < room.round);
    return `<section class="dg-reaction" role="status"><div><p class="dg-kicker">VENTANA DE REACCIÓN / <span data-dg-countdown>${Math.max(0, Math.ceil((p.deadline - Date.now()) / 1000))}</span>s</p><h3>${esc(name(p.actor))} juega ${esc(catalog.CARDS[p.type].name)}.</h3><p>Objetivo: ${p.targets.map(id => esc(name(id))).join(' y ')}${p.value ? ` · ${esc(p.value)}` : ''}</p></div><div class="dg-actions">${mine().lives > 0 && !p.passed.includes(user.id) ? btn('No reacciono', 'pass', 'quiet') : '<small>Esperando reacciones…</small>'}${interrupt && p.actor !== user.id && mine().lives > 0 ? btn('⊘ Interrumpir', 'react-interrupt', 'danger', `data-card="${interrupt.id}"`) : ''}</div>${reflect && p.targets.includes(user.id) && p.actor !== user.id && !p.reflected && mine().lives > 0 ? `<form data-dg-form="reaction" data-key="reflect:${p.id}"><input type="hidden" name="card" value="${reflect.id}"><label>Redirigir hacia<select name="target">${options(p.actor, user.id)}</select></label><button type="submit" class="dg-button">◇ Reflejar</button></form>` : ''}</section>`;
  }
  function sidePanel() {
    const p = mine();
    const role = catalog.ROLES[p.role];
    return `<aside class="dg-side">${role ? `<details class="dg-private-role" data-role-details><summary><span>◉ SOLO TÚ / TU ROL</span><b>Ver carta</b></summary><div><i>${role.icon}</i><h4>${esc(role.name)}</h4><p>${esc(role.description)}</p></div></details>` : ''}${p.choice ? `<section class="dg-loadout"><h4>Tu situación</h4><small>ARMA ACTUAL</small><p>${esc(p.weapon)}</p><small>ENEMIGO</small><p>${p.enemy ? esc(p.enemy) : 'Sellado. Lo conocerás al revelar.'}</p>${p.double ? '<span class="dg-badge">DOS COMBATES</span>' : ''}</section>` : ''}${room.intel.length ? `<details class="dg-intel" data-intel-details><summary>◉ Información espiada (${room.intel.length})</summary>${room.intel.map(i => `<p><strong>${esc(i.name)} / ${esc(i.field === 'role' ? 'rol' : i.field === 'enemy' ? 'enemigo' : 'arma')}</strong><br>${esc(i.field === 'role' ? catalog.ROLES[i.value]?.name : i.value)}</p>`).join('')}</details>` : ''}<section class="dg-chat"><header><h4>La mesa habla.</h4><small>CHAT DE LA SALA</small></header><div class="dg-chat-scroll">${room.chat.length ? room.chat.map(c => `<article><strong>${esc(c.name)}</strong><time>${new Date(c.at).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}</time><p>${esc(c.message)}</p></article>`).join('') : '<p class="dg-muted">Defiende tu arma, propone alianzas o pregunta quién se acaba de inventar ese monstruo.</p>'}</div><form data-dg-form="chat" data-key="chat:${room.code}"><label class="sr-only" for="dg-message">Mensaje a la sala</label><textarea id="dg-message" name="message" rows="2" maxlength="500" required placeholder="Escribe a la mesa…"></textarea><button class="dg-button" type="submit">Enviar ↗</button></form></section><details class="dg-log"><summary>Bitácora de la partida</summary><ol>${room.events.slice().reverse().map(e => `<li>${esc(e.message)}</li>`).join('')}</ol></details></aside>`;
  }
  function results() {
    if (!['results', 'finished'].includes(room.phase)) return '';
    return `<section class="dg-round-results"><div class="dg-section-title"><h3>Veredictos de la ronda ${room.round}.</h3></div>${room.outcomes.filter(o => o.round === room.round).map(o => `<article><strong>${esc(o.name)}</strong><span>Prueba ${o.attempt}</span><span>${o.yes} sí / ${o.no} no</span><b class="${o.survived ? 'saved' : 'lost'}">${o.survived ? 'SOBREVIVE' : '−1 VIDA'}</b></article>`).join('')}</section>`;
  }
  function battleBoard() {
    if (!['preparation', 'assigning', 'sealed', 'revealed', 'combat', 'results'].includes(room.phase)) return '';
    return `<section class="dg-battle-board"><div class="dg-section-title"><h3>La situación de la mesa.</h3><span>ARMAS ACTUALES / INFORMACIÓN DISPONIBLE</span></div>${living().map(p => `<article><div><strong>${esc(p.name)}</strong><small>Puerta ${room.doors.findIndex(d => d.id === p.choice) + 1}${p.double ? ' · Doble combate' : ''}</small></div><div><small>ARMA</small><p>${esc(p.weapon)}</p></div><div><small>ENEMIGO${p.enemy && !['revealed', 'combat', 'results'].includes(room.phase) ? ' · VISIBLE PARA TI' : ''}</small><p>${p.enemy ? esc(p.enemy) : p.enemyAssigned ? '◈ Sellado' : 'Por asignar'}</p></div></article>`).join('')}</section>`;
  }
  function roomView() {
    const steps = ['crafting', 'choosing', 'preparation', 'assigning', 'sealed', 'revealed', 'combat', 'results'];
    return `<section class="dg-room-bar"><div><p class="dg-kicker">${room.round ? `RONDA ${String(room.round).padStart(2, '0')}` : 'SALA ABIERTA'} / ${esc(catalog.PHASES[room.phase])}</p><h3>${esc(room.title)}</h3></div><div><button type="button" class="dg-invite" data-act="invite" aria-label="Copiar invitación">${esc(room.code)} <span>⧉ INVITAR</span></button>${room.host === user.id && !['cancelled', 'finished'].includes(room.phase) ? btn('Cerrar sala', 'cancel', 'quiet') : ''}</div></section>${room.round ? `<ol class="dg-steps" aria-label="Fases de la ronda">${steps.map((s, i) => `<li class="${s === room.phase ? 'current' : steps.indexOf(room.phase) > i ? 'done' : ''}"><b>${String(i + 1).padStart(2, '0')}</b><span>${esc(catalog.PHASES[s])}</span></li>`).join('')}</ol>` : ''}${players()}<div class="dg-instruction"><span>✦</span><p>${esc(stageLabel())}</p>${btn('↻', 'refresh', 'icon', 'aria-label="Actualizar sala"')}</div><div class="dg-table"><div class="dg-table-main">${reactions()}${stage()}${results()}${battleBoard()}${doorGrid()}${hand()}</div>${sidePanel()}</div>`;
  }
  function paint() {
    if (!root || !catalog) return;
    const preserve = room?.phase === lastPhase;
    const drafts = new Map();
    const expanded = new Set([...root.querySelectorAll('details[open]')].map(d => d.dataset.cardDetails || d.dataset.roleDetails !== undefined && 'role' || d.dataset.intelDetails !== undefined && 'intel' || d.className));
    let focus;
    if (preserve) root.querySelectorAll('form[data-key]').forEach(form => {
      drafts.set(form.dataset.key, Object.fromEntries(new FormData(form)));
      if (form.contains(document.activeElement)) focus = { key: form.dataset.key, name: document.activeElement.name, start: document.activeElement.selectionStart, end: document.activeElement.selectionEnd };
    });
    root.innerHTML = `${header()}${error ? `<div class="dg-error" role="alert">${esc(error)}</div>` : ''}${rules()}${room ? roomView() : lobbyBrowser()}<div class="dg-toast" role="status" aria-live="polite"></div>`;
    if (preserve) root.querySelectorAll('form[data-key]').forEach(form => {
      const draft = drafts.get(form.dataset.key);
      if (draft) for (const [key, value] of Object.entries(draft)) {
        const input = form.elements.namedItem(key);
        if (input && input.type !== 'hidden' && (input.tagName !== 'SELECT' || [...input.options].some(o => o.value === value))) input.value = value;
      }
      if (focus?.key === form.dataset.key) {
        const input = form.elements.namedItem(focus.name);
        if (input) { input.focus({ preventScroll: true }); try { input.setSelectionRange(focus.start, focus.end); } catch {} }
      }
    });
    root.querySelectorAll('details').forEach(d => {
      const key = d.dataset.cardDetails || d.dataset.roleDetails !== undefined && 'role' || d.dataset.intelDetails !== undefined && 'intel' || d.className;
      if (expanded.has(key)) d.open = true;
    });
    lastPhase = room?.phase || '';
    const chat = root.querySelector('.dg-chat-scroll');
    if (chat) chat.scrollTop = chat.scrollHeight;
    updateSignal();
  }
  function updateSignal() {
    const signal = root?.querySelector('[data-dg-signal]');
    if (signal) { signal.textContent = online ? `● CONECTADO · ${lastUpdate ? 'ACTUALIZADO' : 'SINCRONIZANDO'}` : '○ SIN CONEXIÓN · REINTENTANDO'; signal.classList.toggle('offline', !online); }
    const timer = root?.querySelector('[data-dg-countdown]');
    if (timer && room?.pending) timer.textContent = Math.max(0, Math.ceil((room.pending.deadline - Date.now()) / 1000));
  }
  function toast(message) {
    const box = root.querySelector('.dg-toast'); if (!box) return;
    box.textContent = message; box.classList.add('visible'); setTimeout(() => box.classList.remove('visible'), 4000);
  }
  async function onClick(event) {
    const b = event.target.closest('[data-act]'); if (!b || busy) return;
    const action = b.dataset.act;
    if (action === 'rules') { rulesOpen = !rulesOpen; paint(); }
    else if (action === 'back') { room = null; error = ''; remember(); paint(); await refreshList(); }
    else if (action === 'refresh') { error = ''; if (room) await refreshRoom(); else await refreshList(); }
    else if (action === 'enter') await enter(b.dataset.code, b.dataset.member === 'true');
    else if (action === 'invite') {
      const link = `${location.origin}/control/?room=${room.code}#doors`;
      try { await navigator.clipboard.writeText(`Juego de las Puertas · ${room.title}\n${link}\nCódigo: ${room.code}\nNecesitas tu cuenta de Mission Control.`); toast('Invitación copiada. Compártela con tu grupo.'); }
      catch { toast(`Código de sala: ${room.code}. Copia el código y compártelo.`); }
    } else if (action === 'generate-door') {
      const form = b.closest('form'), idea = catalog.suggestion('door');
      form.elements.scenario.value = idea.scenario; form.elements.weapon.value = idea.weapon;
    } else if (action === 'generate-enemy') b.closest('form').elements.enemy.value = catalog.suggestion('enemy');
    else if (action === 'cancel') { if (confirm('¿Cerrar esta partida para todos? No se podrá continuar.')) await act({ action }); }
    else if (action === 'kick') { if (confirm(`¿Sacar a ${name(b.dataset.target)} de la sala?`)) await act({ action, target: b.dataset.target }); }
    else if (action === 'choose') await act({ action, door: b.dataset.door });
    else if (action === 'vote-yes' || action === 'vote-no') await act({ action: 'vote', yes: action === 'vote-yes' });
    else if (action === 'react-interrupt') await act({ action: 'reaction', card: b.dataset.card });
    else await act({ action });
  }
  async function onSubmit(event) {
    const form = event.target.closest('[data-dg-form]'); if (!form) return;
    event.preventDefault();
    const input = Object.fromEntries(new FormData(form)); input.action = form.dataset.dgForm;
    if (input.action === 'join') { await enter(input.code); return; }
    if (input.action === 'card') { input.targets = [input.target, input.target2].filter(Boolean); delete input.target; delete input.target2; }
    await act(input);
    if (!error && input.action === 'chat') { const field = root.querySelector('#dg-message'); if (field) field.value = ''; }
  }
  window.DoorsGame = { async initialise(token, account) {
    if (root) return;
    csrf = token; user = account; root = document.getElementById('doors-app');
    try {
      catalog = await import('./doors-catalog.js?v=20261006a');
      root.addEventListener('click', onClick); root.addEventListener('submit', onSubmit);
      paint(); await refreshList();
      const invitation = new URL(location.href).searchParams.get('room');
      let remembered; try { remembered = localStorage.getItem(`doors-room:${user.id}`); } catch {}
      if (invitation) await enter(invitation);
      else if (remembered && rooms.some(r => r.code === remembered && r.member)) await enter(remembered, true);
      setInterval(() => { if (!document.hidden && document.querySelector('#doors.active')) { if (room) refreshRoom(); else refreshList(); } }, 3000);
      setInterval(updateSignal, 500);
      window.addEventListener('homelab:view', event => { if (event.detail === 'doors' || event.detail?.id === 'doors') { if (room) refreshRoom(); else refreshList(); } });
      document.addEventListener('visibilitychange', () => { if (!document.hidden && document.querySelector('#doors.active')) { if (room) refreshRoom(); else refreshList(); } });
    } catch (e) { root.innerHTML = `<div class="dg-error" role="alert">No se pudo abrir el juego: ${esc(e.message)}. Recarga la página.</div>`; }
  } };
})();
