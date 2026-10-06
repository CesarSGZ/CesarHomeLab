import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
test('office workflows run with the scoped runner token only and never deploy or touch Cloudflare credentials',()=>{
 for(const name of ['office-cloud-cycle','office-watchdog']){
  const workflow=readFileSync(new URL('../.github/workflows/'+name+'.yml',import.meta.url),'utf8');
  assert.doesNotMatch(workflow,/CLOUDFLARE_|wrangler|contents: write|git push/);
  assert.match(workflow,/OFFICE_DEV_TOKEN/);assert.match(workflow,/office-cloud-controller/);
 }
 for(const file of readdirSync(new URL('../scripts/',import.meta.url)).filter(f=>f.startsWith('office-')))assert.doesNotMatch(readFileSync(new URL('../scripts/'+file,import.meta.url),'utf8'),/oauth2\/token|refresh_token|execFileSync|git /);
});
