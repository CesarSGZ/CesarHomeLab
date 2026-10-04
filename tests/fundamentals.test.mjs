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
 assert.equal(missing.seriesDiagnostic.initial.value,100);assert.equal(missing.seriesDiagnostic.last.value,55);assert.equal(missing.seriesDiagnostic.adjustments.complete,false);assert.equal(missing.seriesDiagnostic.adjustments.availableBars,5);
});

const weekendNow=Date.parse('2026-10-04T08:00:00Z');
function weekdayDates(start,end){const result=[];for(let d=Date.parse(start+'T12:00:00Z');d<=Date.parse(end+'T12:00:00Z');d+=864e5){const date=new Date(d);if(![0,6].includes(date.getUTCDay()))result.push(date.toISOString().slice(0,10));}return result;}

test('annual return compares initial and last values rather than the drawdown from an intervening maximum',()=>{
 const days=weekdayDates('2025-10-02',friday),prices=days.map(()=>100);prices[Math.floor(prices.length/2)]=200;prices[prices.length-1]=120;
 const p=priceFeatures(chart(prices,prices,days),null,weekendNow);
 assert.ok(Math.abs(p.return1y-.2)<1e-12);assert.equal(p.drawdown1y,-.4);assert.equal(p.drawdownObserved,-.4);assert.equal(p.seriesDiagnostic.oneYear.calendarDays,365);assert.equal(p.seriesDiagnostic.oneYear.initial.date,'2025-10-02');assert.equal(p.seriesDiagnostic.maximum.value,200);assert.equal(p.seriesDiagnostic.maximum.date,days[Math.floor(days.length/2)]);assert.equal(p.seriesDiagnostic.last.date,friday);assert.match(p.definitions.drawdown1y,/NO retorno anual/);
});

test('a short history reports exact coverage and no invented annual return',()=>{
 const p=priceFeatures(chart([10,20,30,25,20,15]),null,weekendNow);
 assert.equal(p.return1y,null);assert.equal(p.drawdown1y,-.5);assert.equal(p.seriesDiagnostic.calendarDays,7);assert.equal(p.seriesDiagnostic.bars,6);assert.equal(p.seriesDiagnostic.oneYear.sufficientCoverage,false);assert.match(p.limitations,/Cobertura insuficiente para retorno anual/);assert.equal(p.seriesDiagnostic.corporateActions.reporting,'not_provided');assert.match(p.seriesDiagnostic.corporateActions.limitation,/ausencia no demuestra/);
});

test('annual coverage requires both 340 calendar days and 200 unique completed sessions',()=>{
 const end='2026-10-02',start=new Date(Date.parse(end)-340*864e5).toISOString().slice(0,10),all=weekdayDates(start,end),days=[all[0],...all.slice(-199)],prices=days.map((_,i)=>100+i/10);
 assert.equal((Date.parse(days.at(-1))-Date.parse(days[0]))/864e5,340);assert.equal(days.length,200);
 assert.ok(priceFeatures(chart(prices,prices,days),null,weekendNow).return1y>0);
 const tooFewDays=[days[0],...days.slice(2)],tooFewPrices=tooFewDays.map(()=>100);assert.equal(priceFeatures(chart(tooFewPrices,tooFewPrices,tooFewDays),null,weekendNow).return1y,null);
 const shortDays=['2025-10-28',...days.slice(1)],shortPrices=shortDays.map(()=>100);assert.equal(priceFeatures(chart(shortPrices,shortPrices,shortDays),null,weekendNow).seriesDiagnostic.oneYear.calendarDays,339);assert.equal(priceFeatures(chart(shortPrices,shortPrices,shortDays),null,weekendNow).return1y,null);
 const duplicateDays=tooFewDays.flatMap(d=>[d,d]),duplicatePrices=duplicateDays.map(()=>100),duplicate=priceFeatures(chart(duplicatePrices,duplicatePrices,duplicateDays),null,weekendNow);assert.equal(duplicate.seriesDiagnostic.bars,199);assert.equal(duplicate.return1y,null);
});

test('the yearly interval excludes an older maximum while the observed-series drawdown keeps it',()=>{
 const days=['2024-09-02',...weekdayDates('2025-10-02',friday)],prices=days.map((_,i)=>i===0?1000:100);prices[prices.length-1]=120;
 const p=priceFeatures(chart(prices,prices,days),null,weekendNow);assert.ok(Math.abs(p.return1y-.2)<1e-12);assert.equal(p.drawdown1y,0);assert.equal(p.drawdownObserved,-.88);assert.equal(p.seriesDiagnostic.maximum.date,'2024-09-02');assert.equal(p.seriesDiagnostic.oneYear.maximum.date,friday);assert.equal(p.seriesDiagnostic.oneYear.initial.date,'2025-10-02');
 const withoutOld=priceFeatures(chart(prices.slice(1),prices.slice(1),days.slice(1)),null,weekendNow);assert.ok(Math.abs(p.sharpe1yZeroRiskFree-withoutOld.sharpe1yZeroRiskFree)<1e-12);
});

test('diagnostics expose raw and adjusted factors and only corporate actions inside completed history',()=>{
 const c=chart([100,102,104,106,108,55],[50,51,52,53,54,55]);c.chart.result[0].events={splits:{old:{date:Date.parse('2026-09-24T13:30:00Z')/1000,numerator:3,denominator:1,splitRatio:'3:1'},actual:{date:Date.parse(friday+'T13:30:00Z')/1000,numerator:2,denominator:1,splitRatio:'2:1'},future:{date:Date.parse('2026-10-05T13:30:00Z')/1000,numerator:10,denominator:1,splitRatio:'10:1'}},dividends:{actual:{date:Date.parse('2026-09-28T13:30:00Z')/1000,amount:.25}}};
 const p=priceFeatures(c,null,weekendNow),d=p.seriesDiagnostic;
 assert.deepEqual(d.initial,{date:'2026-09-25',value:50,rawClose:100,adjustedClose:50,adjustmentFactor:.5});assert.equal(d.last.value,55);assert.equal(d.last.adjustmentFactor,1);assert.equal(d.adjustments.observedFactorChanges,1);assert.equal(d.corporateActions.splitCount,1);assert.deepEqual(d.corporateActions.splits,[{date:friday,numerator:2,denominator:1,ratio:'2:1'}]);assert.equal(d.corporateActions.dividendCount,1);assert.equal(d.corporateActions.dividends[0].amount,.25);assert.match(d.adjustments.causalInterpretation,/no identifican por sí solos/);
 const open=priceFeatures(c,null,Date.parse(friday+'T18:00:00Z'));assert.equal(open.seriesDiagnostic.last.date,'2026-10-01');assert.equal(open.seriesDiagnostic.corporateActions.splitCount,0);
 const empty=chart([10,11,12,13,14,15]);empty.chart.result[0].events={};assert.equal(priceFeatures(empty,null,weekendNow).seriesDiagnostic.corporateActions.reporting,'provider_events_field');assert.equal(priceFeatures(empty,null,weekendNow).seriesDiagnostic.corporateActions.splitCount,0);
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
 const p=extractFundamentals(j,asset,Date.parse('2026-10-04T08:00:00Z'));assert.equal(p.metrics.annualEnd,'2025-12-31');assert.equal(p.metrics.revenue,120);assert.ok(Math.abs(p.metrics.revenueYoY-.2)<1e-12);assert.equal(p.evidence.find(e=>e.metric==='revenue').tag,'Revenues');assert.equal(p.evidence.find(e=>e.metric==='revenue').filed,'2026-03-01');assert.equal(p.extractorVersion,fundamentalsVersion);assert.equal(p.metrics.debtToEbitda,null);
});

test('latest explicit quarterly results preserve aligned dates and never invent quarterly cash flow',()=>{
 const q=(val,end,start,filed)=>fact(val,end,start,filed,'10-Q'),j={cik:123,facts:{'us-gaap':{Revenues:tag([fact(400,'2025-12-31','2025-01-01'),q(100,'2025-06-30','2025-04-01','2025-08-01'),q(130,'2026-06-30','2026-04-01','2026-08-01')]),NetIncomeLoss:tag([fact(40,'2025-12-31','2025-01-01'),q(13,'2026-06-30','2026-04-01','2026-08-01')]),NetCashProvidedByUsedInOperatingActivities:tag([q(60,'2026-06-30','2026-01-01','2026-08-01')])}}};
 const p=extractFundamentals(j,asset,Date.parse('2026-10-04T08:00:00Z'));assert.equal(p.metrics.revenue,400);assert.equal(p.latestQuarter.end,'2026-06-30');assert.equal(p.latestQuarter.filed,'2026-08-01');assert.equal(p.latestQuarter.metrics.revenue,130);assert.ok(Math.abs(p.latestQuarter.metrics.revenueYoY-.3)<1e-12);assert.equal(p.latestQuarter.metrics.netMargin,.1);assert.equal(p.latestQuarter.metrics.fcf,undefined);assert.equal(p.metrics.fcf,null);assert.equal(p.latestQuarter.evidence.find(e=>e.metric==='income').start,'2026-04-01');assert.equal(p.latestQuarter.evidence.find(e=>e.metric==='previousRevenue').value,100);assert.equal(p.latestQuarter.comparisonPeriod.end,'2025-06-30');
 // A three-month value inside an annual filing is not inferred as a new Q4 report.
 j.facts['us-gaap'].Revenues.units.USD.push(fact(200,'2026-09-30','2026-07-01','2026-10-01','10-K'));
 assert.equal(extractFundamentals(j,asset,Date.parse('2026-10-04T08:00:00Z')).latestQuarter.end,'2026-06-30');
});
