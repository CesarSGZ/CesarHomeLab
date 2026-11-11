import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {sessionCookie, isRemembered, REMEMBER_TTL_MS, createSession} from '../functions/_lib/auth.js';

test('a remembered device keeps its cookie for 400 days; a normal sign-in lasts 12 hours', () => {
  assert.match(sessionCookie('t', true), /Max-Age=34560000;/);
  assert.match(sessionCookie('t'), /Max-Age=43200;/);
  assert.match(sessionCookie('t', true), /HttpOnly; Secure; SameSite=Strict/);
});

test('a remembered session is created for 90 days and recognised as such', async () => {
  const runs = [];
  const env = {CONTROL_DB: {prepare: sql => ({bind: (...args) => ({run: async () => runs.push({sql, args})})})}};
  const before = Date.now();
  const s = await createSession(env, 7, true);
  assert.ok(s.expiresAt - before >= REMEMBER_TTL_MS - 1000);
  const [, , , created, expires] = runs[0].args;
  assert.ok(isRemembered(created, expires));
  const short = await createSession(env, 7);
  assert.ok(!isRemembered(runs[1].args[3], runs[1].args[4]));
  assert.ok(short.expiresAt - before < 13 * 3600e3);
});

test('signing in keeps the other devices and the home-screen files are public', () => {
  const login = readFileSync(new URL('../functions/control/api/auth/login.js', import.meta.url), 'utf8');
  assert.ok(!/DELETE FROM sessions WHERE user_id = \? OR/.test(login), 'no longer deletes every session of the user');
  assert.match(readFileSync(new URL('../functions/control/_middleware.js', import.meta.url), 'utf8'), /\/control\/manifest\.webmanifest/);
  const manifest = JSON.parse(readFileSync(new URL('../control/manifest.webmanifest', import.meta.url), 'utf8'));
  assert.equal(manifest.start_url, '/control/');
  assert.equal(manifest.display, 'standalone');
});
