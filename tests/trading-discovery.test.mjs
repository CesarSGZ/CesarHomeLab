import test from 'node:test';import assert from 'node:assert/strict';
import {parseFeed,matchIssuer,rankCandidate,signalKind,discover,feedNoiseReason,selectEnrichmentSymbols} from '../trading-worker/discovery.js';
import {extractFundamentals,fundamentalsVersion} from '../trading-worker/fundamentals.js';
import {initialState,upgradeState} from '../trading-worker/store.js';
const now=Date.parse('2026-10-02T15:00:00Z');
const asset={symbol:'SMALL',name:'Small Science Inc. Common Stock',exchange:'NASDAQ',sector:'Technology',marketCap:300e6,price:10};
test('Feeds preserve publication dates, identify issuer and reject unsafe links',()=>{const xml='<rss><item><title>Small Science raises guidance</title><description>NASDAQ: SMALL</description><link>https://issuer.example/news</link><pubDate>Fri, 02 Oct 2026 12:00:00 GMT</pubDate></item><item><title>Unsafe</title><link>javascript:alert(1)</link><pubDate>Fri, 02 Oct 2026 12:00:00 GMT</pubDate></item></rss>';const items=parseFeed(xml);assert.equal(items.length,1);assert.equal(items[0].publishedAt,now-3*3600e3);assert.equal(matchIssuer(items[0],[asset])[0].symbol,'SMALL');assert.equal(signalKind({title:'Private placement agreement',summary:''}).risk,true);assert.deepEqual(matchIssuer({cik:123,title:'Any'},[asset],{SMALL:124}),[]);});
test('A falling price alone cannot qualify and negative news cannot be rescued by valuation',()=>{const profile={fundamentals:{metrics:{annualAgeDays:100,netMargin:.1,revenueYoY:.1,fcf:1e6,debtToEbitda:2,shareGrowth:.01}},market:{checkedAt:now,return21d:-.3,averageDollarVolume:2e6}};const e={date:null};assert.equal(rankCandidate(e,asset,profile,{},now).eligible,false);const positive={...e,signal:{kind:'Previsiones',strength:27,publishedAt:now}};assert.equal(rankCandidate(positive,asset,profile,{},now).eligible,true);const bad={...positive,signal:{kind:'Estrés / insolvencia',strength:0,risk:true,publishedAt:now}};assert.equal(rankCandidate(bad,asset,profile,{},now).blocked,true);});
test('Annual SEC ratios align periods and missing debt or prior equity remain unknown',()=>{const f=(val,end='2025-12-31',start='2025-01-01')=>({val,end,...(start?{start}:{}),filed:'2026-02-20',form:'10-K',accn:'test'});const tag=(facts,unit='USD')=>({units:{[unit]:facts}});const j={cik:123,facts:{'us-gaap':{Revenues:tag([f(100)]),NetIncomeLoss:tag([f(-10)]),NetCashProvidedByUsedInOperatingActivities:tag([f(20)]),PaymentsToAcquirePropertyPlantAndEquipment:tag([f(5)]),StockholdersEquity:tag([f(50,'2025-12-31',null)])}}};const p=extractFundamentals(j,asset,now);assert.equal(p.metrics.fcf,15);assert.equal(p.metrics.pe,null);assert.equal(p.metrics.roe,null);assert.equal(p.metrics.debtToEbitda,null);assert.equal(p.metrics.revenueYoY,null);assert.equal(p.metrics.insiderOwnership,null);assert.equal(p.evidence[0].filed,'2026-02-20');});
test('News discovery deduplicates documents and never invents catalyst dates',async()=>{const s=upgradeState(initialState());s.real.assets=[asset];s.real.events=[];s.real.ciks={SMALL:123};s.real.cikAt=now;s.real.profiles={SMALL:{checkedAt:now}};const feed='<rss><item><title>Small Science raises outlook</title><description>NASDAQ: SMALL</description><link>https://issuer.example/news</link><pubDate>Fri, 02 Oct 2026 12:00:00 GMT</pubDate></item></rss>';const fetcher=async()=>new Response(feed);await discover(s,()=>{},{fetcher,now});await discover(s,()=>{},{fetcher,now});assert.equal(s.real.events.length,1);assert.equal(s.real.events[0].date,null);assert.equal(s.real.events[0].signal.kind,'Previsiones / guidance');assert.equal(s.real.discovery.universe,1);});
test('legal lead-plaintiff solicitations are filtered without hiding material company litigation',()=>{
 assert.ok(feedNoiseReason({title:'SMALL investor alert: lead plaintiff deadline approaching',summary:'NASDAQ: SMALL law firm reminds shareholders of securities fraud class action'}));
 assert.ok(feedNoiseReason({title:'SHAREHOLDER ALERT: SMALL class action lawsuit',summary:'Contact our law firm to recover investment losses'}));
 assert.ok(feedNoiseReason({title:'SMALL securities fraud deadline reminder',summary:''}));
 assert.equal(feedNoiseReason({title:'Small Science resolves securities class action litigation',summary:'Settlement removes uncertainty; company announces next results on October 12'}),null);
 assert.equal(feedNoiseReason({title:'Small Science wins contract after injunction lifted',summary:'NYSE: SMALL announced a five-year contract'}),null);
 const e={date:null,signal:{kind:'Documento corporativo',strength:50,publishedAt:now,headline:'SMALL lead plaintiff deadline alert'}};
 assert.equal(rankCandidate(e,asset,{fundamentals:{metrics:{annualAgeDays:100,fcf:20e6,netMargin:.2,revenueYoY:.4}}},{minScore:30},now).eligible,false);
});

test('noise is dropped before enrichment and cached legal promotions cannot enter research',async()=>{
 const s=upgradeState(initialState());s.real.assets=[asset];s.real.ciks={SMALL:123};s.real.cikAt=now;s.real.events=[{id:'old-alert',symbol:'SMALL',status:'verificar',confirmed:false,signal:{headline:'SMALL lead plaintiff deadline reminder',excerpt:'Law firm class action reminder',publishedAt:now,strength:28},preScore:{eligible:true,score:70}}];
 const xml='<rss><item><title>SMALL investor lead plaintiff deadline</title><description>NASDAQ: SMALL securities fraud law firm class action</description><link>https://law.example/alert</link><pubDate>Fri, 02 Oct 2026 12:00:00 GMT</pubDate></item></rss>';const fetched=[];
 await discover(s,()=>{},{now,fetcher:async url=>{fetched.push(url);return new Response(xml);}});
 assert.equal(s.real.events.length,1);assert.equal(s.real.events[0].signal.noise,true);assert.equal(s.real.events[0].preScore.blocked,true);assert.equal(s.real.events[0].preScore.eligible,false);assert.ok(Object.values(s.real.discovery.sources).every(x=>x.filteredNoise===1));assert.ok(fetched.every(url=>url.includes('browse-edgar')||url.includes('prnewswire')));assert.equal(s.real.discovery.queued,0);
});

test('legacy financial extractors refresh gradually and failed downloads wait before retrying',()=>{
 const s=upgradeState(initialState());s.real.profiles={OLD:{checkedAt:now,fundamentals:{},market:{}},RETRY:{checkedAt:now,refreshFailedAt:now-1000,fundamentals:{},market:{}}};
 const row=symbol=>({a:{...asset,symbol},e:{id:symbol,symbol,confirmed:true,signal:{strength:30}}});
 assert.deepEqual(selectEnrichmentSymbols(s,[row('RETRY'),row('OLD')],now),['OLD']);
 assert.deepEqual(selectEnrichmentSymbols(s,[row('RETRY')],now),[]);
 assert.deepEqual(selectEnrichmentSymbols(s,[row('RETRY')],now+3600e3),['RETRY']);
 s.real.assets=[{...asset,symbol:'IDEA'}];s.v2={ideas:[{symbol:'IDEA',status:'plan'}]};
 assert.deepEqual(selectEnrichmentSymbols(s,[row('OLD')],now),['IDEA','OLD'],'las ideas que el equipo tiene en curso se documentan primero');
});
