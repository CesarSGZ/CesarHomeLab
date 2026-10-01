import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('public portfolio no longer loads the aircraft background or its pause control',async()=>{
  const page=await readFile(new URL('../index.html',import.meta.url),'utf8');
  assert.doesNotMatch(page,/aerospace-network|aerospace\.css|ambient-toggle/);
  assert.match(page,/theme\.css\?v=20261001contrast/);
  assert.match(page,/data-theme-toggle/);
  assert.match(page,/capability-atlas/);
});
