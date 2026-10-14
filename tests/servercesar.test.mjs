import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, readdir} from 'node:fs/promises';
import {checkConfig, sendMagicPacket, probe, powerStatus} from '../functions/_lib/servercesar.js';
import {userCan} from '../functions/_lib/auth.js';

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
