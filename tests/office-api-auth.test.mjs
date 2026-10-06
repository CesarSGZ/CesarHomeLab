import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
test('daily cycles, audits and development cannot rotate the personal OAuth session',()=>{
 for(const name of ['office-cloud-cycle','office-audit','office-development']){
  const workflow=readFileSync(new URL('../.github/workflows/'+name+'.yml',import.meta.url),'utf8');
  assert.doesNotMatch(workflow,/OFFICE_WRANGLER_AUTH|OFFICE_FORCE_REFRESH|office-development\.mjs (?:auth|save-auth)/);
  assert.match(workflow,/OFFICE_DEV_TOKEN/);
 }
 const controller=readFileSync(new URL('../scripts/office-development.mjs',import.meta.url),'utf8');
 assert.doesNotMatch(controller,/oauth2\/token|refresh_token|deployment-auth|\.wrangler\/config/);
});
