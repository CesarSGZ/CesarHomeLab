import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
const root=new URL('../',import.meta.url);
const html=readFileSync(new URL('index.html',root),'utf8');
const section=html.split('id="languages"')[1].split('</section>')[0];
const cards=[...section.matchAll(/<article\b[^>]*>([\s\S]*?)<\/article>/g)].map(m=>m[1]);

test('language redesign preserves all five reported proficiency levels',()=>{
  assert.equal(cards.length,5);
  const actual=cards.map(card=>[card.match(/<h3>(.*?)<\/h3>/)[1],card.match(/language-grade"><strong>(.*?)<\/strong>/)[1]]);
  assert.deepEqual(actual,[['Spanish','Native'],['Galician','Native'],['English','C1'],['French','B1'],['Portuguese','A2']]);
});
test('native languages are separate; CEFR rulers use consistent six-step levels',()=>{
  cards.slice(0,2).forEach(card=>{assert.match(card,/language-native/);assert.doesNotMatch(card,/language-scale/);});
  cards.slice(2).forEach((card,index)=>{
    assert.equal([...card.matchAll(/class="reached/g)].length,[5,3,2][index]);
    for(const level of ['A1','A2','B1','B2','C1','C2'])assert.ok(card.includes('>'+level+'</span>'));
  });
});
test('each language has a local flag and only its proficiency is shown',()=>{
  cards.forEach(card=>{
    const path=card.match(/src="(assets\/flags\/[^"]+)"/)[1];
    assert.ok(statSync(new URL(path,root)).size>0);
    assert.doesNotMatch(card,/About this level|language-description|<summary>/);assert.match(card,/alt="[^"]+ flag"/);
  });
});
