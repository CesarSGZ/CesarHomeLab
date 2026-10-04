import test from 'node:test';
import assert from 'node:assert/strict';
import {priceFeatures,extractFundamentals,fundamentalsVersion} from '../trading-worker/fundamentals.js';

const friday='2026-10-02',dates=['2026-09-25','2026-09-28','2026-09-29','2026-09-30','2026-10-01',friday];
function chart(closes,adjusted,days=dates){return {chart:{result:[{meta:{regularMarketTime:Date.parse(friday+'T20:00:00Z')/1000,currentTradingPeriod:{regular:{end:Date.parse(friday+'T20:00:00Z')/1000}}},timestamp:days.map(d=>Date.parse(d+'T13:30:00Z')/1000),indicators:{quote:[{close:closes,volume:closes.map(()=>1000)}],...(adjusted?{adjclose:[{adjclose:adjusted}]}:{})}}]}};}

test('the weekend profile includes Friday complete closing data rather than stopping on Thursday',()=>{
 const p=priceFeatures(chart([10,11,12,13,14,15]),null,Date.parse('2026-10-04T08:00:00Z'));
 assert.equal(p.asOf,'2026-10-02T13:30:00.000Z');assert.equal(p.return5d,.5);assert.equal(p.extractorVersion,fundamentalsVersion);assert.equal(p.averageDollarVolume,12500);
});

test('current New York session bars are excluded until the actual regular close',()=>{
 const c=chart([10,11,12,13,14,999]);const before=priceFeatures(c,null,Date.parse('2026-10-02T19:59:59Z')),after=priceFeatures(c,null,Date.parse('2026-10-02T20:00:00Z'));
 assert.equal(before.asOf,'2026-10-01T13:30:00.000Z');assert.equal(before.return5d,null);assert.equal(after.asOf,'2026-10-02T13:30:00.000Z');
});

test('daily bar completion follows New York dates and provider early-close metadata',()=>{
 const c=chart([10,11,12,13,14,15]);c.chart.result[0].meta.currentTradingPeriod.regular.end=Date.parse('2026-10-02T17:00:00Z')/1000;
 assert.equal(priceFeatures(c,null,Date.parse('2026-10-02T16:59:59Z')).asOf,'2026-10-01T13:30:00.000Z');
 assert.equal(priceFeatures(c,null,Date.parse('2026-10-02T17:00:00Z')).asOf,'2026-10-02T13:30:00.000Z');
 // 00:30 UTC is still Thursday in New York; the Friday bar is in the future.
 assert.equal(priceFeatures(c,null,Date.parse('2026-10-02T00:30:00Z')).asOf,'2026-10-01T13:30:00.000Z');
});

test('split-adjusted returns and drawdown use adjusted closes while dollar liquidity remains raw',()=>{
 const raw=[100,102,104,106,108,55],adjusted=[50,51,52,53,54,55],p=priceFeatures(chart(raw,adjusted),null,Date.parse('2026-10-04T08:00:00Z'));
 assert.ok(Math.abs(p.return5d-.1)<1e-12);assert.equal(p.drawdown1y,0);assert.equal(p.adjustedCloseAvailable,true);assert.ok(Math.abs(p.averageDollarVolume-raw.reduce((n,x)=>n+x,0)/6*1000)<1e-8);
 const missing=priceFeatures(chart(raw,[50,51,null,53,54,55]),null,Date.parse('2026-10-04T08:00:00Z'));
 assert.equal(missing.adjustedCloseAvailable,false);assert.ok(Math.abs(missing.return5d+.45)<1e-12);assert.match(missing.limitations,/Sin serie ajustada completa/);
});

test('beta and Sharpe use consistently adjusted stock and benchmark histories',()=>{
 const days=[];for(let d=Date.parse('2026-02-02T12:00:00Z');days.length<140;d+=864e5){const x=new Date(d);if(![0,6].includes(x.getUTCDay()))days.push(x.toISOString().slice(0,10));}
 const market=[100],stock=[40];for(let i=1;i<days.length;i++){const r=[.01,-.006,.003,-.002,.008][i%5];market.push(market.at(-1)*(1+r));stock.push(stock.at(-1)*(1+2*r));}
 const stockRaw=stock.map((p,i)=>i<70?p*2:p),marketRaw=market.map((p,i)=>i<90?p*3:p),now=Date.parse('2026-10-04T08:00:00Z');
 const adjusted=priceFeatures(chart(stockRaw,stock,days),chart(marketRaw,market,days),now),noSplit=priceFeatures(chart(stock,stock,days),chart(market,market,days),now);
 assert.ok(Math.abs(adjusted.beta1y-2)<1e-10);assert.ok(Math.abs(adjusted.sharpe1yZeroRiskFree-noSplit.sharpe1yZeroRiskFree)<1e-10);assert.equal(adjusted.benchmarkAdjustedCloseAvailable,true);
});

const fact=(val,end,start,filed='2026-03-01',form='10-K',accn='accession')=>({val,end,...(start?{start}:{}),filed,form,accn});
const tag=rows=>({units:{USD:rows}});
const asset={marketCap:1000,fetchedAt:Date.parse('2026-10-01T12:00:00Z')};
test('a historic preferred XBRL tag does not hide a newer annual period in another standard tag',()=>{
 const j={cik:123,facts:{'us-gaap':{RevenueFromContractWithCustomerExcludingAssessedTax:tag([fact(60,'2022-12-31','2022-01-01','2023-03-01')]),Revenues:tag([fact(100,'2024-12-31','2024-01-01','2025-03-01'),fact(120,'2025-12-31','2025-01-01')]),NetIncomeLoss:tag([fact(12,'2025-12-31','2025-01-01')])}}};
 const p=extractFundamentals(j,asset,Date.parse('2026-10-04T08:00:00Z'));assert.equal(p.metrics.annualEnd,'2025-12-31');assert.equal(p.metrics.revenue,120);assert.ok(Math.abs(p.metrics.revenueYoY-.2)<1e-12);assert.equal(p.evidence.find(e=>e.metric==='revenue').tag,'Revenues');assert.equal(p.evidence.find(e=>e.metric==='revenue').filed,'2026-03-01');assert.equal(p.extractorVersion,2);assert.equal(p.metrics.debtToEbitda,null);
});

test('latest explicit quarterly results preserve aligned dates and never invent quarterly cash flow',()=>{
 const q=(val,end,start,filed)=>fact(val,end,start,filed,'10-Q'),j={cik:123,facts:{'us-gaap':{Revenues:tag([fact(400,'2025-12-31','2025-01-01'),q(100,'2025-06-30','2025-04-01','2025-08-01'),q(130,'2026-06-30','2026-04-01','2026-08-01')]),NetIncomeLoss:tag([fact(40,'2025-12-31','2025-01-01'),q(13,'2026-06-30','2026-04-01','2026-08-01')]),NetCashProvidedByUsedInOperatingActivities:tag([q(60,'2026-06-30','2026-01-01','2026-08-01')])}}};
 const p=extractFundamentals(j,asset,Date.parse('2026-10-04T08:00:00Z'));assert.equal(p.metrics.revenue,400);assert.equal(p.latestQuarter.end,'2026-06-30');assert.equal(p.latestQuarter.filed,'2026-08-01');assert.equal(p.latestQuarter.metrics.revenue,130);assert.ok(Math.abs(p.latestQuarter.metrics.revenueYoY-.3)<1e-12);assert.equal(p.latestQuarter.metrics.netMargin,.1);assert.equal(p.latestQuarter.metrics.fcf,undefined);assert.equal(p.metrics.fcf,null);assert.equal(p.latestQuarter.evidence.find(e=>e.metric==='income').start,'2026-04-01');assert.equal(p.latestQuarter.evidence.find(e=>e.metric==='previousRevenue').value,100);assert.equal(p.latestQuarter.comparisonPeriod.end,'2025-06-30');
 // A three-month value inside an annual filing is not inferred as a new Q4 report.
 j.facts['us-gaap'].Revenues.units.USD.push(fact(200,'2026-09-30','2026-07-01','2026-10-01','10-K'));
 assert.equal(extractFundamentals(j,asset,Date.parse('2026-10-04T08:00:00Z')).latestQuarter.end,'2026-06-30');
});
