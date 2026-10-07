import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, stat} from 'node:fs/promises';

const file = path => new URL(`../${path}`, import.meta.url);

test('portfolio loads the flight-deck layer after every earlier stylesheet and script', async () => {
  const page = await readFile(file('index.html'), 'utf8');
  assert.ok(page.indexOf('flight-deck.css') > page.indexOf('/theme.css'), 'flight-deck.css must load last');
  for (const vendor of ['gsap', 'ScrollTrigger', 'SplitText', 'ScrambleTextPlugin']) {
    assert.match(page, new RegExp(`assets/vendor/gsap/${vendor}\\.min\\.js`));
    await stat(file(`assets/vendor/gsap/${vendor}.min.js`));
  }
  assert.ok(page.indexOf('ScrambleTextPlugin.min.js') < page.indexOf('flight-deck.js'), 'plugins load before flight-deck.js');
});

test('every public section declares a flight phase for the HUD', async () => {
  const page = await readFile(file('index.html'), 'utf8');
  const phases = [...page.matchAll(/<section[^>]*data-phase="([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(phases, ['Pre-flight', 'Take-off', 'Climb', 'Cruise', 'Descent', 'Approach', 'Landing']);
});

test('mission brief player ships a web-sized video and poster', async () => {
  const page = await readFile(file('index.html'), 'utf8');
  assert.match(page, /<dialog class="fd-brief" id="mission-brief"/);
  assert.ok((page.match(/data-brief-open/g) || []).length >= 2, 'brief can be opened from hero and finale');
  const video = await stat(file('assets/brief/mission-brief.mp4'));
  assert.ok(video.size > 500_000 && video.size < 15_000_000, `video size ${video.size} stays web-friendly`);
  await stat(file('assets/brief/mission-brief-poster.jpg'));
});

test('video sources stay in the repository but out of the Pages deployment', async () => {
  const ignore = await readFile(file('.assetsignore'), 'utf8');
  assert.match(ignore, /^video$/m);
});

test('private sign-in keeps its form intact under the flight layer', async () => {
  const login = await readFile(file('control/login.html'), 'utf8');
  assert.match(login, /flight-login\.css/);
  assert.match(login, /<form id="login-form">/);
  assert.match(login, /autocomplete="current-password"/);
});

test('sign-in styles stay reachable before authentication', async () => {
  const middleware = await readFile(file('functions/control/_middleware.js'), 'utf8');
  const login = await readFile(file('control/login.html'), 'utf8');
  for (const sheet of login.matchAll(/href="([\w-]+\.css)\?/g)) {
    assert.match(middleware, new RegExp(`"/control/${sheet[1].replace('.', '\.')}"`), `${sheet[1]} must be a public path`);
  }
});

test('mission control loads the flight layer last and hides the standard welcome card for owners', async () => {
  const page = await readFile(file('control/index.html'), 'utf8');
  assert.ok(page.indexOf('flight-control.css') > page.indexOf('/theme.css'));
  assert.match(page, /flight-control\.js/);
  assert.match(page, /standard-welcome" data-accent="cyan" data-standard-only/);
});
