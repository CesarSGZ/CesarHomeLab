import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const luminance=hex=>hex.match(/[\da-f]{2}/gi).map(c=>parseInt(c,16)/255).map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4).reduce((sum,c,i)=>sum+c*[.2126,.7152,.0722][i],0);
const contrast=(a,b)=>(Math.max(luminance(a),luminance(b))+.05)/(Math.min(luminance(a),luminance(b))+.05);
test('night uses distinct neutral and raised surfaces with readable text and company colours',async()=>{
  const css=await readFile(new URL('../theme.css',import.meta.url),'utf8');
  assert.match(css,/html\[data-theme=night\]\{--night:#15191c/);
  assert.match(css,/\.log-content h3\{color:var\(--company-color\)\}/);
  assert.match(css,/\.log-content li\{color:#d5e2ea/);
  assert.notEqual('#15191c','#28323a');
  for(const background of ['#15191c','#28323a','#303c45','#323e47']){
    for(const foreground of ['#edf0f2','#c0cdd6','#91c4ea','#ccdfa1','#ead6a0'])assert.ok(contrast(foreground,background)>=4.5,`${foreground} on ${background}`);
  }
});
