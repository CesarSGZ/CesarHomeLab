import test from 'node:test';
import assert from 'node:assert/strict';
import {planRiskArithmetic,planExpiry} from '../trading-worker/planning-math.js';
import {newBook,defaults} from '../trading-worker/core.js';

const now=Date.parse('2026-10-05T06:00:00Z');
function eurBook(){const b=newBook(now,'EUR');b.fx={rate:1.1227,time:now};return b;}
function config(extra={}){return {...defaults,minRR:1.3,...extra};}

test('ANGO stop loss is compared in EUR rather than mistaking its larger USD amount for the EUR limit',()=>{
 const b=eurBook(),p={entryMin:14.9,entryMax:15.11,stop:14.05,target:16.5},c=config(),before=JSON.stringify({b,p,c}),r=planRiskArithmetic(b,p,c);
 assert.equal(r.known,true);assert.equal(r.fxUSDPerEUR,1.1227);assert.equal(r.atMaximum.wholeShares,37);assert.ok(37*(15.11-14.05)>35);assert.ok(r.atMaximum.grossStopLossEur<35);assert.equal(r.withinGrossRiskLimit,true);assert.equal(r.atMaximum.entryPriceUSD,15.11);assert.ok(r.atMaximum.estimatedLossWithRoundTripFeesEur>35);assert.equal(r.maximumGrossStopLossEur,35);assert.match(r.basis,/brechas/);assert.equal(JSON.stringify({b,p,c}),before);
});

test('ODC risk is measured at the allowed entry maximum, not merely the lower reference price',()=>{
 const r=planRiskArithmetic(eurBook(),{entryMin:89.66,entryMax:90.995652,stop:83.3,target:101},config());
 assert.equal(r.known,true);assert.equal(r.atMinimum.wholeShares,6);assert.ok(r.atMinimum.grossStopLossEur<35);assert.ok(r.atMaximum.grossStopLossEur>41);assert.equal(r.withinGrossRiskLimit,false);assert.ok(r.minimumStopUSDForRange>84.44);
 const corrected=planRiskArithmetic(eurBook(),{entryMin:89.66,entryMax:89.849083,stop:83.3,target:101},config());assert.equal(corrected.withinGrossRiskLimit,true);
});

test('An interior whole-share boundary can have more risk than either end of the range',()=>{
 const b=eurBook();b.fx.rate=1;b.cash=100;b.positions=[{qty:1,entry:9900,mark:9900,entryFx:1}];const p={entryMin:9.6,entryMax:10.1,stop:8,target:13};const r=planRiskArithmetic(b,p,config({commission:0,riskPct:.195}));
 assert.equal(r.atMinimum.wholeShares,10);assert.equal(r.atMaximum.wholeShares,9);assert.equal(r.quantityBoundary.entryPriceUSD,10);assert.equal(r.quantityBoundary.wholeShares,10);assert.equal(r.worstGrossStopLossEur,20);assert.ok(r.atMinimum.grossStopLossEur<r.maximumGrossStopLossEur);assert.ok(r.atMaximum.grossStopLossEur<r.maximumGrossStopLossEur);assert.equal(r.withinGrossRiskLimit,false);assert.ok(r.minimumStopUSDForRange>=8.05&&r.minimumStopUSDForRange<=8.050001);assert.equal(planRiskArithmetic(b,{...p,stop:r.minimumStopUSDForRange},config({commission:0,riskPct:.195})).withinGrossRiskLimit,true);
});

test('The exact quantity-boundary calculation handles huge quantities without truncating or looping over all possible share counts',()=>{
 const b=eurBook();b.fx.rate=1;b.cash=1e12;const r=planRiskArithmetic(b,{entryMin:2,entryMax:4,stop:1,target:6},config({commission:0}));
 assert.equal(r.known,true);assert.ok(r.atMinimum.wholeShares>1e6);assert.ok(Number.isFinite(r.worstGrossStopLossEur));assert.equal(r.worstGrossStopLossEur,Math.max(r.atMinimum.grossStopLossEur,r.atMaximum.grossStopLossEur,r.quantityBoundary?.grossStopLossEur||0));
 b.cash=1e22;assert.equal(planRiskArithmetic(b,{entryMin:2,entryMax:4,stop:1,target:6},config({commission:0})).known,false);
});

test('Unknown FX and insufficient whole-share capacity are reported as unknown, never as a passing risk check',()=>{
 const b=eurBook();delete b.fx;const p={entryMin:10,entryMax:11,stop:9,target:14};assert.equal(planRiskArithmetic(b,p,config()).known,false);assert.equal(planRiskArithmetic(b,p,config()).withinGrossRiskLimit,false);
 const tiny=eurBook();tiny.cash=5;assert.equal(planRiskArithmetic(tiny,p,config()).known,false);
});

test('The upward-rounded suggested stop is sufficient across the full range when copied exactly',()=>{
 const b=eurBook(),p={entryMin:89.66,entryMax:90.995652,stop:83.3,target:101},r=planRiskArithmetic(b,p,config()),copied=planRiskArithmetic(b,{...p,stop:r.minimumStopUSDForRange},config());
 assert.equal(copied.withinGrossRiskLimit,true);assert.equal(Math.round(r.minimumStopUSDForRange*1e6),r.minimumStopUSDForRange*1e6);
});

test('Avoiding Thursday earnings creates a prior weekday afternoon cutoff that does not cross the event',()=>{
 const answer={holdingDays:5,exitBeforeCatalyst:true},event={timing:'scheduled',date:'2026-10-08T23:59:59Z'},before=JSON.stringify({answer,event});const r=planExpiry(answer,event,now);
 assert.equal(r.known,true);assert.equal(r.cutoffSessionDate,'2026-10-07');assert.equal(new Date(r.expiresAt).toISOString(),'2026-10-07T19:45:00.000Z');assert.equal(JSON.stringify({answer,event}),before);assert.match(r.basis,/sin festivos/);
});

test('A Monday event uses the previous Friday, and New York daylight saving rules apply to the cutoff day',()=>{
 const r=planExpiry({holdingDays:10,exitBeforeCatalyst:true},{timing:'scheduled',date:'2026-11-02T12:00:00Z'},Date.parse('2026-10-29T12:00:00Z'));
 assert.equal(r.known,true);assert.equal(r.cutoffSessionDate,'2026-10-30');assert.equal(new Date(r.cutoffAt).toISOString(),'2026-10-30T19:45:00.000Z');
 const winter=planExpiry({holdingDays:10,exitBeforeCatalyst:true},{timing:'scheduled',date:'2026-11-06T12:00:00Z'},Date.parse('2026-11-04T12:00:00Z'));assert.equal(new Date(winter.cutoffAt).toISOString(),'2026-11-05T20:45:00.000Z');
});

test('Day precision retains the issuer date rather than shifting UTC midnight to the prior New York day',()=>{
 const r=planExpiry({holdingDays:10,exitBeforeCatalyst:true},{timing:'scheduled',datePrecision:'day',date:'2026-10-08T00:00:00Z'},now);
 assert.equal(r.eventDay,'2026-10-08');assert.equal(r.cutoffSessionDate,'2026-10-07');
});

test('A shorter natural-day duration wins, while passed cutoffs and invalid timing do not invent a usable expiry',()=>{
 const shorter=planExpiry({holdingDays:1,exitBeforeCatalyst:true},{timing:'scheduled',date:'2026-10-08T12:00:00Z'},now);assert.equal(shorter.expiresAt,now+864e5);
 const passed=planExpiry({holdingDays:5,exitBeforeCatalyst:true},{timing:'scheduled',date:'2026-10-05T12:00:00Z'},now);assert.equal(passed.known,false);assert.ok(passed.expiresAt<now);
 assert.equal(planExpiry({holdingDays:5,exitBeforeCatalyst:true},{timing:'announced',date:'2026-10-02T12:00:00Z'},now).known,false);
 const ordinary=planExpiry({holdingDays:5},{timing:'scheduled',date:'2026-10-08T12:00:00Z'},now);assert.equal(ordinary.expiresAt,now+5*864e5);assert.equal(ordinary.exitBeforeCatalyst,false);
});