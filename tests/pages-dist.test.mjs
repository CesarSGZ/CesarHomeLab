import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {join} from 'node:path';
import {buildPagesDist} from '../scripts/build-pages-dist.mjs';

test('Pages output contains the website and nothing else from the repository', () => {
  const dist = buildPagesDist();
  for (const path of ['index.html', 'privacy.html', 'theme.js', '_headers', '_routes.json', 'assets/brief', 'control/index.html', 'control/login.html', 'control/backtest-model.js']) {
    assert.ok(existsSync(join(dist, path)), `${path} is published`);
  }
  for (const path of ['.git', '.github', '.gitignore', '.claude', 'functions', 'server-agent', 'migrations', 'backtest-lab', 'video', 'hf-test', 'docs', 'tests', 'scripts', 'wrangler.jsonc', 'README.md', 'dist']) {
    assert.ok(!existsSync(join(dist, path)), `${path} stays out of Pages`);
  }
});
