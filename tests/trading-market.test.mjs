import test from 'node:test';import assert from 'node:assert/strict';import {parseChart,refreshMarket,referenceSource,regularSession} from '../trading-worker/market-data.js';import {freshQuote,newBook,buy,monitor,defaults,assess} from '../trading-worker/core.js';
const now=Date.parse('2026-10-02T15:00:00Z');
const fixture=()=>({chart:{result:[{meta:{symbol:'SMALL',currency:'USD',instrumentType:'EQUITY',exchangeName:'NMS',regularMarketPrice:10,regularMarketTime:(now-15*60e3)/1000},timestamp:Array.from({length:20},(_,i)=>(now-(21-i)*864e5)/1000),indicators:{quote:[{close:Array(20).fill(10),volume:Array(20).fill(500000)}]}}],error:null}});
test('Reference parser preserves original price time and rejects wrong instruments',()=>{const q=parseChart(fixture(),'SMALL',now);assert.equal(q.time,now-15*60e3);assert.equal(q.realtime,false);assert.equal(q.dollarVolume,5e6);assert.ok(!('bid' in q));assert.ok(!('ask' in q));const j=fixture();j.chart.result[0].meta.currency='EUR';assert.throws(()=>parseChart(j,'SMALL',now));});
test('Reference simulation uses observed prices and rejects stale or outside-session data',()=>{const q=parseChart(fixture(),'SMALL',now);assert.ok(freshQuote(q,now));for(const bad of [{...q,time:now-36*60e3},{...q,fetchedAt:now-21*60e3},{...q,time:now+10000},{...q,source:'invented'}])assert.equal(freshQuote(bad,now),false);assert.equal(regularSession(Date.parse('2026-10-03T15:00:00Z')),false);const asset={symbol:'SMALL',name:'Small Common Stock',exchange:'NASDAQ',marketCap:300e6,price:10,dataVerified:true};const ev={id:'real-evidence',confirmed:true,source:'https://issuer.example/news',summary:'Evidence',date:new Date(now+864e5).toISOString()};const plan={entryMin:9.8,entryMax:10.2,stop:9.5,target:12,expiresAt:now+864e5};const b=newBook(now);const r=buy(b,asset,ev,plan,q,defaults,now);assert.ok(r.ok);assert.ok(Math.abs(r.price-10.025)<1e-9);assert.equal(b.orders[0].quoteTime,q.time);const trades=monitor(b,{SMALL:{...q,price:8}},defaults,now);assert.equal(trades.length,1);assert.ok(Math.abs(trades[0].exit-7.98)<1e-9);});
test('Provider failure cannot fabricate prices or validate an instrument',async()=>{const s={mode:'real',real:{book:newBook(now),assets:[{symbol:'SMALL'}],events:[{symbol:'SMALL',confirmed:true,status:'nuevo',date:new Date(now+864e5).toISOString()}],quotes:{}}};let calls=0;await refreshMarket(s,{now,fetcher:async()=>{calls++;return new Response('',{status:429});}});assert.equal(calls,1);assert.deepEqual(s.real.quotes,{});assert.ok(!s.real.assets[0].dataVerified);assert.match(s.real.marketError,/429/);await refreshMarket(s,{now:now+5*60e3,fetcher:async()=>{throw Error('Cache failed');}});assert.equal(calls,1);});

test('Radar checks provider before a confirmed opportunity without placing an order',async()=>{const s={mode:'real',real:{book:newBook(now),assets:[{symbol:'SMALL'}],events:[{symbol:'SMALL',confirmed:false,status:'verificar',preScore:{eligible:true,score:60}}],quotes:{}}};let calls=0;await refreshMarket(s,{now,fetcher:async()=>{calls++;return Response.json(fixture());}});assert.equal(calls,1);assert.equal(s.real.quotes.SMALL.price,10);assert.equal(s.real.assets[0].dataVerified,true);assert.equal(s.real.book.orders.length,0);assert.equal(s.real.events[0].confirmed,false);assert.match(s.real.marketPurpose,/no autoriza compras/);});

test('A recent primary announcement may support an entry without fabricating a future catalyst date',()=>{
 const q=parseChart(fixture(),'SMALL',now),asset={symbol:'SMALL',name:'Small Common Stock',exchange:'NASDAQ',marketCap:300e6,price:10,dataVerified:true},source='https://issuer.example/news';
 const ev={id:'announced',confirmed:true,timing:'announced',source,sources:[{url:source,claim:'Contrato anunciado ayer por el emisor'}],summary:'Anuncio primario contrastado; la reacción posterior sigue siendo una hipótesis.',date:new Date(now-864e5).toISOString()},plan={entryMin:9.8,entryMax:10.2,stop:9.5,target:12,expiresAt:now+5*864e5};
 assert.equal(assess(newBook(now),asset,ev,plan,q,defaults,now).ok,true);
 for(const bad of [{...ev,date:new Date(now-8*864e5).toISOString()},{...ev,date:new Date(now+864e5).toISOString()},{...ev,sources:[]},{...ev,timing:'scheduled'}])assert.equal(assess(newBook(now),asset,bad,plan,q,defaults,now).ok,false);
 const weekend=Date.parse('2026-10-03T15:00:00Z');assert.equal(assess(newBook(weekend),asset,ev,plan,{...q,fetchedAt:weekend},defaults,weekend).ok,false);
 assert.equal(ev.date,new Date(now-864e5).toISOString());
});

test('historical bought events cannot displace approved pending plans and open positions refresh first',async()=>{
 const historical=Array.from({length:12},(_,i)=>({id:'old-'+i,symbol:'OLD'+i,status:'abierto',confirmed:true,date:new Date(now-10*864e5+i*1000).toISOString(),preScore:{eligible:true,score:100}}));
 const pending=['NEXT1','NEXT2'].map((symbol,i)=>({id:'new-'+i,symbol,status:'espera',confirmed:true,date:new Date(now+(i+1)*864e5).toISOString(),preScore:{eligible:true,score:60},plan:{expiresAt:now+3*864e5},review:{approve:true}}));
 const booked={id:'booked-stale',symbol:'BOOKED',status:'espera',confirmed:true,date:new Date(now-864e5).toISOString(),preScore:{eligible:true,score:100}};
 const book=newBook(now);book.positions=[{id:'position',eventId:historical[0].id,symbol:historical[0].symbol}];book.orders=[...historical,booked].map(e=>({id:'buy-'+e.id,side:'buy',eventId:e.id,symbol:e.symbol}));
 const s={mode:'real',real:{book,events:[...historical,booked,...pending],assets:[...historical,booked,...pending].map(e=>({symbol:e.symbol})),quotes:{}}},before=JSON.stringify(book),called=[];
 await refreshMarket(s,{now,fetcher:async url=>{const symbol=decodeURIComponent(new URL(url).pathname.split('/').at(-1));called.push(symbol);const data=fixture();data.chart.result[0].meta.symbol=symbol;return Response.json(data);}});
 assert.deepEqual(called,['OLD0','NEXT1','NEXT2']);assert.equal(called[0],book.positions[0].symbol);
 for(const e of pending){assert.equal(s.real.quotes[e.symbol].source,referenceSource);assert.equal(s.real.assets.find(a=>a.symbol===e.symbol).dataVerified,true);}
 assert.equal(s.real.quotes.OLD0.price,10);assert.equal(s.real.quotes.BOOKED,undefined);assert.equal(JSON.stringify(book),before,'Refreshing prices never creates or changes a paper order');
});

test('a bought event excludes only its old thesis and does not suppress a new event for the same stock',async()=>{
 const book=newBook(now);book.orders=[{eventId:'old-thesis',symbol:'SMALL',side:'buy'}];
 const s={mode:'real',real:{book,events:[{id:'old-thesis',symbol:'SMALL',status:'espera',confirmed:true,date:new Date(now-864e5).toISOString()},{id:'new-thesis',symbol:'SMALL',status:'nuevo',confirmed:true,date:new Date(now+864e5).toISOString()}],assets:[{symbol:'SMALL'}],quotes:{}}};let calls=0;
 await refreshMarket(s,{now,fetcher:async()=>{calls++;return Response.json(fixture());}});
 assert.equal(calls,1);assert.equal(s.real.quotes.SMALL.price,10);assert.equal(book.orders.length,1);assert.equal(book.positions.length,0);
});

test('valid pending plans retain priority over earlier confirmed signals within the quote shortlist',async()=>{
 const signals=Array.from({length:10},(_,i)=>({id:'signal-'+i,symbol:'SIGNAL'+i,status:'nuevo',confirmed:true,date:new Date(now+(i+1)*1000).toISOString()}));
 const plans=['PLAN1','PLAN2'].map((symbol,i)=>({id:'plan-'+i,symbol,status:'espera',confirmed:true,date:new Date(now+864e5).toISOString(),plan:{expiresAt:now+2*864e5},review:{approve:true}}));
 const s={mode:'real',real:{book:newBook(now),events:[...signals,...plans],assets:[],quotes:{}}},called=[];
 await refreshMarket(s,{now,fetcher:async url=>{const symbol=decodeURIComponent(new URL(url).pathname.split('/').at(-1));called.push(symbol);const data=fixture();data.chart.result[0].meta.symbol=symbol;return Response.json(data);}});
 assert.deepEqual(called.slice(0,2),['PLAN1','PLAN2']);assert.equal(called.length,8);assert.ok(s.real.quotes.PLAN1&&s.real.quotes.PLAN2);assert.equal(s.real.book.orders.length,0);
});
