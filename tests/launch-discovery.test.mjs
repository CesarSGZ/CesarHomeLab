import test from 'node:test';
import assert from 'node:assert/strict';
import {rankCandidate,discover} from '../trading-worker/discovery.js';
import {initialState,upgradeState} from '../trading-worker/engine.js';
import {fundamentalsVersion} from '../trading-worker/fundamentals.js';
const now=Date.parse('2026-10-05T10:00:00Z');
const asset={symbol:'SMALL',name:'Small Company Common Stock',exchange:'NASDAQ',sector:'Industrial',marketCap:300e6,price:10};
const material=()=>({signal:{kind:'Resultados / convocatoria',strength:20,publishedAt:now-12*3600e3,headline:'Quarterly financial results announced'}});
const calendar=()=>({date:new Date(now+3*864e5).toISOString()});
const healthy=()=>({fundamentals:{metrics:{annualAgeDays:100,netMargin:.05,revenueYoY:-.02,fcf:10e6,debtToEbitda:2}},market:{averageDollarVolume:2e6}});

test('Launch exploration admits a material signal with unknown financial coverage without inflating its score or claiming approval',()=>{
 const normal=rankCandidate(material(),asset,null,{},now),launch=rankCandidate(material(),asset,null,{launchMode:true},now);
 assert.equal(normal.eligible,false);assert.equal(normal.score,24);assert.equal(launch.score,normal.score);assert.equal(launch.eligible,true);
 assert.equal(launch.qualification.lane,'exploratory');assert.equal(launch.qualification.researchOnly,true);assert.equal(launch.qualification.financialCoverage,0);
 assert.deepEqual(launch.qualification.hardReasons,[]);assert.ok(launch.qualification.softReasons.includes('limited_financial_coverage'));
 assert.match(launch.label,/no probabilidad/);assert.equal(launch.plan,undefined);assert.equal(launch.approve,undefined);
});

test('Launch exploration expands healthy near calendars without requiring both positive cash flow and growing revenue',()=>{
 const p=healthy(),normal=rankCandidate(calendar(),asset,p,{},now),launch=rankCandidate(calendar(),asset,p,{launchMode:true},now);
 assert.equal(normal.score,51);assert.equal(normal.eligible,false);assert.equal(normal.qualification.hasTrigger,false);
 assert.equal(launch.eligible,true);assert.equal(launch.score,51);assert.equal(launch.qualification.lane,'exploratory');assert.equal(launch.qualification.calendarExploration,true);
});

test('Unknown liquidity, unknown or stale finances and remote dates cannot qualify a bare calendar through exploration',()=>{
 for(const profile of [null,{...healthy(),market:{}},{...healthy(),fundamentals:{metrics:{}}},{...healthy(),fundamentals:{metrics:{annualAgeDays:600,fcf:10e6}}}]){
  const r=rankCandidate(calendar(),asset,profile,{launchMode:true},now);assert.equal(r.eligible,false);assert.equal(r.qualification.calendarExploration,false);
 }
 const remote={date:new Date(now+18*864e5).toISOString()};assert.equal(rankCandidate(remote,asset,healthy(),{launchMode:true},now).eligible,false);
});

test('Generic filings and financing alerts are not treated as material exploration opportunities',()=>{
 const generic={signal:{kind:'Documento corporativo',strength:8,publishedAt:now}},financing={signal:{kind:'Financiación / cotización',strength:28,risk:true,publishedAt:now}};
 for(const event of [generic,financing,{signal:{kind:'Arbitrary invented category',strength:28,publishedAt:now}}]){
  const r=rankCandidate(event,asset,null,{launchMode:true},now);assert.equal(r.eligible,false);assert.equal(r.qualification.materialSignalFresh,false);
 }
 const old=material();old.signal.publishedAt=now-4*864e5;assert.equal(rankCandidate(old,asset,null,{launchMode:true},now).eligible,false);
});

test('Launch exploration preserves hard exclusions for instrument, promotion, insolvency, negative equity and known low liquidity',()=>{
 const noise=material();noise.signal.headline='SMALL lead plaintiff deadline investor alert';
 const bankrupt=material();bankrupt.signal.kind='Estrés / insolvencia';bankrupt.signal.risk=true;
 const old=material();old.signal.publishedAt=now-8*864e5;
 for(const [event,a,profile,code] of [
  [material(),{...asset,name:'Small Fund ETF'},healthy(),'outside_universe'],
  [noise,asset,healthy(),'promotional_noise'],
  [bankrupt,asset,healthy(),'insolvency'],
  [old,asset,healthy(),'stale_signal'],
  [material(),asset,{...healthy(),fundamentals:{metrics:{annualAgeDays:100,fcf:10e6,equityLatest:0,equityDate:'2026-10-01'}}},'negative_recent_equity'],
  [material(),asset,{...healthy(),market:{averageDollarVolume:500000}},'low_known_liquidity']
 ]){
  const r=rankCandidate(event,a,profile,{launchMode:true,minScore:30},now);assert.equal(r.blocked,true);assert.equal(r.eligible,false);
  assert.equal(r.qualification.lane,'blocked');assert.ok(r.qualification.hardReasons.includes(code));
 }
});

test('A standard qualified candidate retains its lane and the launch switch is explicitly opt-in',()=>{
 const normal=rankCandidate(material(),asset,healthy(),{},now),launch=rankCandidate(material(),asset,healthy(),{launchMode:true},now);
 assert.equal(normal.eligible,true);assert.equal(normal.qualification.lane,'standard');assert.equal(launch.qualification.lane,'standard');assert.equal(launch.score,normal.score);
 assert.equal(rankCandidate(material(),asset,null,{launchMode:'true'},now).eligible,false);
});

test('Discovery reports qualification frictions by lane while preserving paper capital and budget',async()=>{
 const s=upgradeState(initialState());s.company.launch={active:true};s.real.assets=['EARN','CAL','BLOCK'].map(symbol=>({...asset,symbol}));
 s.real.ciks={EARN:1,CAL:2,BLOCK:3};s.real.cikAt=now;
 const profile=m=>({checkedAt:now,fundamentals:{extractorVersion:fundamentalsVersion,checkedAt:now,metrics:m},market:{extractorVersion:fundamentalsVersion,checkedAt:now}});
 s.real.profiles={EARN:profile({}),CAL:{...profile(healthy().fundamentals.metrics),market:{extractorVersion:fundamentalsVersion,checkedAt:now,averageDollarVolume:2e6}},BLOCK:{...profile(healthy().fundamentals.metrics),market:{extractorVersion:fundamentalsVersion,checkedAt:now,averageDollarVolume:500000}}};
 s.real.events=[{id:'earn',symbol:'EARN',status:'verificar',...material()},{id:'cal',symbol:'CAL',status:'verificar',...calendar()},{id:'block',symbol:'BLOCK',status:'verificar',...material()}];
 s.operating={remainingEur:9.8,spentEur:.2,allowanceEur:10};const before=JSON.stringify({book:s.real.book,operating:s.operating,config:s.config});
 const fetcher=async()=>new Response('<rss></rss>');await discover(s,()=>{},{fetcher,now});
 assert.equal(s.real.discovery.qualification.launchMode,true);assert.equal(s.real.discovery.qualification.evaluated,3);
 assert.equal(s.real.discovery.qualification.exploratory,2);assert.equal(s.real.discovery.qualification.blocked,1);
 assert.equal(s.real.discovery.qualification.hardReasons.low_known_liquidity,1);assert.equal(s.real.discovery.qualification.frictions.limitedFinancialCoverage,1);
 assert.equal(JSON.stringify({book:s.real.book,operating:s.operating,config:s.config}),before);
});