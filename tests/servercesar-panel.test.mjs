import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const source = readFileSync(new URL('../control/servercesar.js', import.meta.url), 'utf8');
const now = 1_800_000_000_000;

// Exercise the shipped script through its public initialise/refresh path, without power requests.
async function panel(overrides = {}) {
  const elements = new Map(), listeners = new Map();
  function element(selector) {
    if (!elements.has(selector)) elements.set(selector, {
      hidden: false, disabled: false, dataset: {}, textContent: '',
      classList: {toggle() {}, contains() { return true; }},
      addEventListener() {}, querySelector: element, querySelectorAll: () => [],
    });
    return elements.get(selector);
  }
  const data = {
    canWake: true, shutdownEnabled: true, power: {state: 'online', via: 'agent'},
    agent: {fresh: true, receivedAt: now - 60e3, bootTime: now - 3600e3,
      wolPath: {ok: true, at: now - 60e3}}, ...overrides,
  };
  const window = {};
  runInNewContext(source, {
    window, Intl, Date: class extends Date {static now() {return now;}},
    document: {querySelector: element, getElementById: element, addEventListener() {}, hidden: false},
    addEventListener(name, fn) {listeners.set(name, fn);},
    setTimeout() {return 1;}, clearTimeout() {},
    fetch: async () => ({ok: true, json: async () => data}),
  });
  window.ServerCesar.initialise('test-csrf', data.canWake);
  await new Promise(setImmediate);
  return {get: element};
}

test('wake remains visible and usable while a cached heartbeat still says online', async () => {
  for (const lastPower of [null,
    {action: 'shutdown', status: 'queued', at: now - 10e3},
    {action: 'shutdown', status: 'claimed', at: now - 60e3, claimedAt: now - 5e3},
    {action: 'shutdown', status: 'succeeded', at: now - 90e3, completedAt: now - 10e3},
  ]) {
    const p = await panel({lastPower});
    assert.equal(p.get('#sc-wake').hidden, false);
    assert.equal(p.get('#sc-wake').disabled, false);
  }
});

test('accepted shutdown stops saying shutting down before the five-minute report expiry', async () => {
  const p = await panel({lastPower: {action: 'shutdown', status: 'succeeded',
    at: now - 150e3, completedAt: now - 90e3}});
  assert.equal(p.get('[data-sc-state]').textContent, 'APAGADO SIN CONFIRMAR');
  assert.equal(p.get('#sc-wake').disabled, false);
  // owner's choice: reboot/shutdown stay available, only the cooldown disables them
  assert.equal(p.get('#sc-shutdown').disabled, false);
});

test('new boot clears the shutdown phase and shows the PC online again', async () => {
  const p = await panel({lastPower: {action: 'shutdown', status: 'succeeded', at: now - 150e3},
    agent: {fresh: true, receivedAt: now, bootTime: now - 30e3}});
  assert.equal(p.get('[data-sc-state]').textContent, 'ENCENDIDO');
  assert.match(p.get('#sc-feedback').textContent, /volvió a encender/);
});

test('wake still enforces permissions, configuration and packet cooldown', async () => {
  assert.equal((await panel({canWake: false})).get('#sc-wake').hidden, true);
  assert.equal((await panel({power: {state: 'unconfigured'}})).get('#sc-wake').disabled, true);
  assert.equal((await panel({cooldownUntil: now + 30e3})).get('#sc-wake').disabled, true);
});
