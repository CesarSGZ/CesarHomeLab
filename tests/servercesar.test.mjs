import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, readdir} from 'node:fs/promises';
import {checkConfig, sendMagicPacket, probe, powerStatus, sanitiseReport, appHealth, requireServerAgent, queuePowerCommand, agentExchange, agentPublicIp, wakeTargets} from '../functions/_lib/servercesar.js';
import {userCan, constantTimeEqual} from '../functions/_lib/auth.js';

// Minimal D1 stand-in for the power command queue: answers the handful of statements servercesar.js issues.
function fakeDb({reportAt = null, wolPath = {ok: true, at: reportAt}} = {}) {
  const commands = [];
  const run = (sql, args) => {
    if (sql.startsWith('SELECT report')) return reportAt == null ? null : {report: JSON.stringify({apps: {}, wolPath}), received_at: reportAt};
    if (sql.startsWith('SELECT id, type, status')) return [...commands].sort((a, b) => b.requested_at - a.requested_at)[0] || null;
    if (sql.startsWith('INSERT INTO servercesar_commands')) { commands.push({id: args[0], type: args[1], status: 'queued', requested_by: args[2], requested_at: args[3]}); return {meta: {changes: 1}}; }
    if (sql.startsWith("UPDATE servercesar_commands SET status = 'expired'")) { commands.filter(c => c.status === 'queued' && c.requested_at < args[0]).forEach(c => { c.status = 'expired'; }); return {meta: {}}; }
    if (sql.startsWith('SELECT id, type')) return commands.filter(c => c.status === 'queued').sort((a, b) => a.requested_at - b.requested_at)[0] || null;
    if (sql.startsWith("UPDATE servercesar_commands SET status = 'claimed'")) { const c = commands.find(c => c.id === args[1] && c.status === 'queued'); if (c) { c.status = 'claimed'; c.claimed_at = args[0]; } return {meta: {changes: c ? 1 : 0}}; }
    if (sql.startsWith('UPDATE servercesar_commands SET status = ?')) { const c = commands.find(c => c.id === args[3] && c.status === 'claimed'); if (c) { c.status = args[0]; c.result = args[2]; } return {meta: {changes: c ? 1 : 0}}; }
    throw new Error('unexpected SQL ' + sql);
  };
  const prepare = sql => { let args = []; const s = {bind: (...a) => { args = a; return s; }, first: async () => run(sql, args), run: async () => run(sql, args)}; return s; };
  return {prepare, commands};
}

test('agent report keeps only known apps and fields', () => {
  const r = sanitiseReport({cpu: 12.345, ram: 140, bootTime: 1, apps: {claude: {running: true, signedIn: true, remoteControl: true, version: '2.1', evil: '<script>'}, minecraft: {running: true}}});
  assert.deepEqual(Object.keys(r.apps), ['claude']);
  assert.equal(r.apps.claude.evil, undefined);
  assert.equal(r.cpu, 12.3);
  assert.equal(r.ram, null);
  assert.equal(appHealth(r.apps.claude), 'ok');
  assert.equal(appHealth({running: true, signedIn: false}), 'warn');
  assert.equal(appHealth({running: false, signedIn: true}), 'down');
  assert.equal(appHealth({running: true, signedIn: true, service: 'stopped'}), 'down');
  assert.equal(appHealth(undefined), 'down');
});

test('Claude with Remote Control off is a warning, not a green light', () => {
  assert.equal(appHealth({running: true, signedIn: true, remoteControl: false}), 'warn');
  assert.equal(appHealth({running: true, signedIn: true, remoteControl: null}), 'ok');
});

test('Wake-on-LAN also targets the public IP the agent last reported from', () => {
  const req = ip => new Request('https://x', {headers: ip ? {'cf-connecting-ip': ip} : {}});
  assert.equal(agentPublicIp(req('83.35.44.250')), '83.35.44.250');
  assert.equal(agentPublicIp(req('2a0c:5a80::1')), null);
  assert.equal(agentPublicIp(req('')), null);
  assert.deepEqual(wakeTargets({host: 'home.example.org'}, {publicIp: '83.35.44.250'}), ['home.example.org', '83.35.44.250']);
  assert.deepEqual(wakeTargets({host: 'home.example.org'}, null), ['home.example.org']);
  assert.deepEqual(wakeTargets({host: '83.35.44.250'}, {publicIp: '83.35.44.250'}), ['83.35.44.250']);
});

test('the ServerCesar agent token is separate and must be long', () => {
  const req = token => new Request('https://x/api/agent/servercesar', {headers: {authorization: 'Bearer ' + token}});
  const token = 'a'.repeat(40);
  assert.equal(requireServerAgent(req(token), {SERVERCESAR_AGENT_TOKEN: token}, constantTimeEqual), true);
  assert.equal(requireServerAgent(req(token), {MINECRAFT_AGENT_TOKEN: token}, constantTimeEqual), false);
  assert.equal(requireServerAgent(req('short'), {SERVERCESAR_AGENT_TOKEN: 'short'}, constantTimeEqual), false);
});

test('reboot: needs a live agent, is handed out once, has a cooldown and records the result', async () => {
  const now = 1_000_000_000;
  assert.equal((await queuePowerCommand(fakeDb(), 'reboot', 'CesarVapor', now)).error, 'agent_offline');
  assert.equal((await queuePowerCommand(fakeDb({reportAt: now - 120_000}), 'reboot', 'CesarVapor', now)).error, 'agent_offline');
  const db = fakeDb({reportAt: now - 10_000});
  const queued = await queuePowerCommand(db, 'reboot', 'CesarVapor', now);
  assert.equal(queued.ok, true);
  assert.equal((await queuePowerCommand(db, 'shutdown', 'CesarVapor', now + 1000)).error, 'cooldown');
  const command = await agentExchange(db, null, now + 5000);
  assert.deepEqual(command, {id: queued.id, type: 'reboot'});
  assert.equal(await agentExchange(db, null, now + 6000), null);
  await agentExchange(db, {id: queued.id, ok: true, detail: 'shutdown /r programado'}, now + 7000);
  assert.equal(db.commands[0].status, 'succeeded');
});

test('shutdown is queued like a reboot and nothing else can be', async () => {
  const now = 1_000_000_000;
  const db = fakeDb({reportAt: now});
  assert.equal((await queuePowerCommand(db, 'format-c', 'CesarVapor', now)).error, 'invalid_action');
  const queued = await queuePowerCommand(db, 'shutdown', 'CesarVapor', now);
  assert.deepEqual(await agentExchange(db, null, now + 1000), {id: queued.id, type: 'shutdown'});
});

test('"Apagar" is refused unless the Internet power-on route was verified in the last 12 hours', async () => {
  const now = 1_000_000_000;
  assert.equal((await queuePowerCommand(fakeDb({reportAt: now, wolPath: null}), 'shutdown', 'CesarVapor', now)).error, 'wol_route_unverified');
  assert.equal((await queuePowerCommand(fakeDb({reportAt: now, wolPath: {ok: false, at: now}}), 'shutdown', 'CesarVapor', now)).error, 'wol_route_unverified');
  assert.equal((await queuePowerCommand(fakeDb({reportAt: now, wolPath: {ok: true, at: now - 13 * 3600_000}}), 'shutdown', 'CesarVapor', now)).error, 'wol_route_unverified');
  assert.equal((await queuePowerCommand(fakeDb({reportAt: now, wolPath: {ok: true, at: now - 3600_000}}), 'shutdown', 'CesarVapor', now)).ok, true);
  // a reboot comes back on its own, so it does not need the route
  assert.equal((await queuePowerCommand(fakeDb({reportAt: now, wolPath: null}), 'reboot', 'CesarVapor', now)).ok, true);
});

test('a forgotten queued reboot expires instead of firing hours later', async () => {
  const now = 1_000_000_000;
  const db = fakeDb({reportAt: now});
  await queuePowerCommand(db, 'reboot', 'CesarVapor', now);
  assert.equal(await agentExchange(db, null, now + 16 * 60_000), null);
  assert.equal(db.commands[0].status, 'expired');
});

test('a fresh agent report alone marks ServerCesar as online, even without a Wake-on-LAN config', async () => {
  const db = {prepare: () => ({first: async () => null})};
  const now = Date.now();
  assert.deepEqual(await powerStatus(db, null, null, now, now - 5000), {state: 'online', via: 'agent', agentLastSeen: now - 5000, probed: []});
  assert.equal((await powerStatus(db, null, null, now, now - 200_000)).state, 'unconfigured');
});

test('configuration is validated and normalised', () => {
  const ok = checkConfig({mac: 'aa:bb:cc:dd:ee:ff', host: 'Example.DuckDNS.org', wolPort: '9', probePorts: '3389, 25565 3389'});
  assert.deepEqual(ok, {ok: true, config: {mac: 'AA-BB-CC-DD-EE-FF', host: 'example.duckdns.org', wolPort: 9, probePorts: [3389, 25565]}});
  assert.equal(checkConfig({mac: 'nope', host: 'a.org', wolPort: 9}).error, 'invalid_mac');
  assert.equal(checkConfig({mac: 'AA-BB-CC-DD-EE-FF', host: 'bad host', wolPort: 9}).error, 'invalid_host');
  assert.equal(checkConfig({mac: 'AA-BB-CC-DD-EE-FF', host: 'a.org', wolPort: 70000}).error, 'invalid_wol_port');
  assert.equal(checkConfig({mac: 'AA-BB-CC-DD-EE-FF', host: 'a.org', wolPort: 9, probePorts: '25'}).error, 'invalid_probe_ports');
});

test('the magic packet is relayed through depicus with the same form the website uses', async () => {
  let seen;
  const fetchImpl = async (url, init) => { seen = {url, init}; return new Response(JSON.stringify({line0: 'Magic packet sent to example.org:9'})); };
  const r = await sendMagicPacket({mac: 'AA-BB-CC-DD-EE-FF', host: 'example.org', wolPort: 9}, fetchImpl);
  assert.equal(seen.url, 'https://www.depicus.com/wake-on-lan/woli-ajax.php');
  assert.equal(seen.init.method, 'POST');
  const form = new URLSearchParams(String(seen.init.body));
  assert.deepEqual(Object.fromEntries(form), {macaddress: 'AA-BB-CC-DD-EE-FF', ip: 'example.org', subnet: '255.255.255.255', port: '9', secureon: ''});
  assert.deepEqual(r, {ok: true, message: 'Magic packet sent to example.org:9'});
  const bad = await sendMagicPacket({mac: 'AA-BB-CC-DD-EE-FF', host: 'example.org', wolPort: 9}, async () => new Response('down', {status: 503}));
  assert.equal(bad.ok, false);
});

test('status: an open probe port or a fresh agent heartbeat means the PC is on', async () => {
  const connect = ({port}) => ({opened: port === 3389 ? Promise.resolve() : Promise.reject(new Error('refused')), close() {}});
  assert.equal(await probe('example.org', [25565, 3389], connect), 3389);
  assert.equal(await probe('example.org', [25565], connect), null);
  const db = lastSeen => ({prepare: () => ({first: async () => ({last_seen: lastSeen})})});
  const cfg = {host: 'example.org', probePorts: [3389]};
  assert.deepEqual(await powerStatus(db(0), cfg, connect), {state: 'online', via: 'port 3389', agentLastSeen: null, probed: [3389]});
  assert.equal((await powerStatus(db(Date.now() - 5000), {...cfg, probePorts: []}, connect)).via, 'agent');
  assert.equal((await powerStatus(db(0), {...cfg, probePorts: [80]}, connect)).state, 'no-response');
  assert.equal((await powerStatus(db(0), null, connect)).state, 'unconfigured');
});

test('only the owner can wake ServerCesar and the home address never lands in the repository', async () => {
  assert.equal(userCan({username: 'CesarVapor'}, 'servercesar:wake'), true);
  assert.equal(userCan({username: 'SuperSanti86'}, 'servercesar:wake'), false);
  const files = ['functions/_lib/servercesar.js', 'control/servercesar.js', 'control/index.html', ...(await readdir(new URL('../functions/control/api/servercesar/', import.meta.url))).map(f => 'functions/control/api/servercesar/' + f)];
  for (const f of files) {
    const text = await readFile(new URL('../' + f, import.meta.url), 'utf8');
    assert.doesNotMatch(text, /B4-2E-99|cesarvapor\.duckdns/i, f + ' must not contain the home MAC or host');
  }
});

test('mission control sidebar scrolls when the module list is long', async () => {
  const css = await readFile(new URL('../control/flight-control.css', import.meta.url), 'utf8');
  assert.match(css, /\.sidebar nav\{flex:1 1 auto;min-height:0;overflow-y:auto/);
});

test('defaults come from encrypted deployment secrets and a saved override wins', async () => {
  const {readConfig, envConfig} = await import('../functions/_lib/servercesar.js');
  const env = {SERVERCESAR_MAC: 'aa:bb:cc:dd:ee:ff', SERVERCESAR_HOST: 'home.example.org', SERVERCESAR_WOL_PORT: '9', SERVERCESAR_PROBE_PORTS: '3389'};
  assert.deepEqual(envConfig(env), {mac: 'AA-BB-CC-DD-EE-FF', host: 'home.example.org', wolPort: 9, probePorts: [3389], source: 'secrets'});
  assert.equal(envConfig({}), null);
  const db = row => ({prepare: () => ({first: async () => row})});
  assert.equal((await readConfig(db(null), env)).source, 'secrets');
  const saved = await readConfig(db({mac: 'AA-AA-AA-AA-AA-AA', host: 'other.example.org', wol_port: 7, probe_ports: '', updated_at: 1}), env);
  assert.equal(saved.host, 'other.example.org'); assert.equal(saved.source, 'mission-control');
});
