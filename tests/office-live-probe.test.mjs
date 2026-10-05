import test from 'node:test';
import assert from 'node:assert/strict';
import {recentProbeQuotes,probeReceivedNewQuotes} from '../trading-worker/live-audit.js';
test('a read-only live probe reports newly downloaded references even when the original first entries are stale',()=>{
 const quotes=Object.fromEntries(Array.from({length:7},(_,i)=>['OLD'+i,{symbol:'OLD'+i,price:10,time:1000,fetchedAt:1000}]));
 for(let i=0;i<4;i++)quotes['NEW'+i]={symbol:'NEW'+i,price:20,time:2000,fetchedAt:10000};
 const before=JSON.stringify(quotes),sample=recentProbeQuotes(quotes);
 assert.equal(sample.length,6);assert.equal(sample.filter(q=>q.fetchedAt===10000).length,4);
 assert.equal(sample[0].symbol,'NEW0');assert.equal(JSON.stringify(quotes),before);
 assert.deepEqual(recentProbeQuotes({}),[]);
});

test('a slow probe accepts references downloaded during its own request window',()=>{
 const startedAt=100000,completedAt=startedAt+125000;
 assert.equal(probeReceivedNewQuotes({startedAt,completedAt,quotes:[{fetchedAt:startedAt}]}),true);
 assert.equal(probeReceivedNewQuotes({startedAt,completedAt,quotes:[{fetchedAt:completedAt}]}),true);
});
test('a probe cannot pass using cached references, future timestamps or missing evidence',()=>{
 const startedAt=100000,completedAt=225000;
 for(const quotes of [[],[{fetchedAt:startedAt-1}],[{fetchedAt:completedAt+1}],[{fetchedAt:NaN}],[{}]])assert.equal(probeReceivedNewQuotes({startedAt,completedAt,quotes}),false);
 for(const probe of [{},{startedAt,quotes:[]},{startedAt,completedAt:startedAt-1,quotes:[{fetchedAt:startedAt}]}])assert.equal(probeReceivedNewQuotes(probe),false);
});
