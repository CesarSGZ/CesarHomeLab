// Conservative, dated SEC XBRL extraction. Missing values stay null; ratios are annual, not TTM.
export const fundamentalsVersion=3;
const tags={revenue:['RevenueFromContractWithCustomerExcludingAssessedTax','Revenues','SalesRevenueNet'],income:['NetIncomeLoss','ProfitLoss'],operating:['OperatingIncomeLoss'],cfo:['NetCashProvidedByUsedInOperatingActivities'],capex:['PaymentsToAcquirePropertyPlantAndEquipment'],da:['DepreciationDepletionAndAmortization','DepreciationAndAmortization'],equity:['StockholdersEquity','StockholdersEquityIncludingPortionAttributableToNoncontrollingInterest'],cash:['CashAndCashEquivalentsAtCarryingValue'],debtCurrent:['LongTermDebtCurrent'],debtLong:['LongTermDebtNoncurrent'],debtTotal:['LongTermDebtAndFinanceLeaseObligationsCurrent','LongTermDebtAndCapitalLeaseObligations'],shares:['WeightedAverageNumberOfDilutedSharesOutstanding','WeightedAverageNumberOfSharesOutstandingBasic']};
const annual=f=>f.start&&Date.parse(f.end)-Date.parse(f.start)>=330*864e5&&Date.parse(f.end)-Date.parse(f.start)<=400*864e5;
function series(j,key,unit,now){return (tags[key]||[]).flatMap((tag,tagOrder)=>(j.facts?.['us-gaap']?.[tag]?.units?.[unit]||[]).filter(f=>['10-K','10-K/A','10-Q','10-Q/A'].includes(f.form)&&Number.isFinite(f.val)&&Date.parse(f.filed)<=now&&Date.parse(f.end)<=now+864e5).map(f=>({...f,tag,tagOrder})));}
function uniqueAnnual(rows){const byEnd=new Map();for(const f of rows.filter(annual).sort((a,b)=>Date.parse(a.filed)-Date.parse(b.filed)||b.tagOrder-a.tagOrder))byEnd.set(f.end,f);return [...byEnd.values()].sort((a,b)=>Date.parse(b.end)-Date.parse(a.end));}
const value=f=>f?.val??null;
const div=(a,b)=>Number.isFinite(a)&&Number.isFinite(b)&&b>0?a/b:null;
export function extractFundamentals(j,asset,now){
 const all=Object.fromEntries(Object.keys(tags).map(k=>[k,series(j,k,k==='shares'?'shares':'USD',now)]));
 const revenue=uniqueAnnual(all.revenue),anchor=revenue[0]?.end;
 const duration=k=>all[k].filter(f=>annual(f)&&f.end===anchor).sort((a,b)=>Date.parse(b.filed)-Date.parse(a.filed)||a.tagOrder-b.tagOrder)[0];
 const instant=(k,end)=>all[k].filter(f=>!f.start&&(!end||f.end===end)).sort((a,b)=>Date.parse(b.end)-Date.parse(a.end)||Date.parse(b.filed)-Date.parse(a.filed)||a.tagOrder-b.tagOrder)[0];
 const rows={revenue:revenue[0],income:duration('income'),operating:duration('operating'),cfo:duration('cfo'),capex:duration('capex'),da:duration('da'),equity:instant('equity',anchor),cash:instant('cash',anchor),debtCurrent:instant('debtCurrent',anchor),debtLong:instant('debtLong',anchor),shares:duration('shares')};
 const n=Object.fromEntries(Object.entries(rows).map(([k,v])=>[k,value(v)]));
 const fcf=Number.isFinite(n.cfo)&&Number.isFinite(n.capex)?n.cfo-n.capex:null;
 const prevRevenue=revenue.find(f=>Date.parse(anchor)-Date.parse(f.end)>=330*864e5&&Date.parse(anchor)-Date.parse(f.end)<=400*864e5);
 const olderRevenue=revenue.find(f=>Date.parse(anchor)-Date.parse(f.end)>=1000*864e5&&Date.parse(anchor)-Date.parse(f.end)<=1200*864e5);
 const prevCashflows=uniqueAnnual(all.cfo).find(f=>f.end===prevRevenue?.end),prevCapex=uniqueAnnual(all.capex).find(f=>f.end===prevRevenue?.end);
 const prevFcf=prevCashflows&&prevCapex?prevCashflows.val-prevCapex.val:null;
 const prevEquity=prevRevenue?instant('equity',prevRevenue.end):null,prevShares=uniqueAnnual(all.shares).find(f=>f.end===prevRevenue?.end);
 const debt=Number.isFinite(n.debtCurrent)&&Number.isFinite(n.debtLong)?n.debtCurrent+n.debtLong:null;
 const ebitda=Number.isFinite(n.operating)&&Number.isFinite(n.da)?n.operating+n.da:null;
 const enterprise=Number.isFinite(debt)&&Number.isFinite(n.cash)?asset.marketCap+debt-n.cash:null;
 const latestCash=instant('cash'),latestEquity=instant('equity');
 const m={annualEnd:anchor||null,annualAgeDays:anchor?(now-Date.parse(anchor))/864e5:null,marketCap:asset.marketCap,marketCapAt:asset.fetchedAt||null,revenue:n.revenue,netIncome:n.income,fcf,previousFcf:prevFcf,fcfChange:Number.isFinite(fcf)&&Number.isFinite(prevFcf)?fcf-prevFcf:null,netMargin:div(n.income,n.revenue),roe:div(n.income,n.equity>0&&prevEquity?.val>0?(n.equity+prevEquity.val)/2:null),revenueYoY:div(n.revenue,prevRevenue?.val)===null?null:n.revenue/prevRevenue.val-1,revenueCagr3y:div(n.revenue,olderRevenue?.val)===null?null:Math.pow(n.revenue/olderRevenue.val,1/3)-1,pe:div(asset.marketCap,n.income),pb:div(asset.marketCap,n.equity),ebitdaApprox:ebitda,debtToEbitda:div(debt,ebitda),evToEbitda:div(enterprise,ebitda),cashLatest:value(latestCash),cashDate:latestCash?.end||null,equityLatest:value(latestEquity),equityDate:latestEquity?.end||null,shareGrowth:div(n.shares,prevShares?.val)===null?null:n.shares/prevShares.val-1,insiderOwnership:null};
 const evidence=Object.entries(rows).filter(([,f])=>f).map(([metric,f])=>({metric,tag:f.tag,value:f.val,start:f.start||null,end:f.end,filed:f.filed,accession:f.accn}));
 const explicitQuarter=f=>f.start&&['10-Q','10-Q/A'].includes(f.form)&&Date.parse(f.end)-Date.parse(f.start)>=60*864e5&&Date.parse(f.end)-Date.parse(f.start)<=110*864e5;
 const quarterRevenue=all.revenue.filter(f=>explicitQuarter(f)&&(!anchor||Date.parse(f.end)>Date.parse(anchor))).sort((a,b)=>Date.parse(b.end)-Date.parse(a.end)||Date.parse(b.filed)-Date.parse(a.filed)||a.tagOrder-b.tagOrder)[0];
 let latestQuarter=null;
 if(quarterRevenue){
  const samePeriod=k=>all[k].filter(f=>f.start===quarterRevenue.start&&f.end===quarterRevenue.end).sort((a,b)=>Date.parse(b.filed)-Date.parse(a.filed)||a.tagOrder-b.tagOrder)[0];
  const income=samePeriod('income'),operating=samePeriod('operating'),previous=all.revenue.filter(f=>explicitQuarter(f)&&Date.parse(quarterRevenue.end)-Date.parse(f.end)>=330*864e5&&Date.parse(quarterRevenue.end)-Date.parse(f.end)<=400*864e5&&Math.abs((Date.parse(quarterRevenue.end)-Date.parse(quarterRevenue.start))-(Date.parse(f.end)-Date.parse(f.start)))<=10*864e5).sort((a,b)=>Date.parse(b.end)-Date.parse(a.end)||Date.parse(b.filed)-Date.parse(a.filed)||a.tagOrder-b.tagOrder)[0];
  latestQuarter={start:quarterRevenue.start,end:quarterRevenue.end,filed:quarterRevenue.filed,metrics:{revenue:quarterRevenue.val,netIncome:value(income),operatingIncome:value(operating),netMargin:div(value(income),quarterRevenue.val),revenueYoY:div(quarterRevenue.val,previous?.val)===null?null:quarterRevenue.val/previous.val-1},comparisonPeriod:previous?{start:previous.start,end:previous.end,filed:previous.filed}:null,evidence:Object.entries({revenue:quarterRevenue,income,operating,previousRevenue:previous}).filter(([,f])=>f).map(([metric,f])=>({metric,tag:f.tag,value:f.val,start:f.start,end:f.end,filed:f.filed,accession:f.accn})),limitations:'Trimestre explícito de 60-110 días; no se infieren flujos de caja trimestrales restando acumulados ni se calculan ratios TTM.'};
 }
 return {extractorVersion:fundamentalsVersion,metrics:m,evidence,latestQuarter,source:'https://data.sec.gov/api/xbrl/companyfacts/CIK'+String(j.cik).padStart(10,'0')+'.json',checkedAt:now,limitations:['Ratios anuales, no TTM; capitalización de catálogo con su fecha','EBITDA aproximado = resultado operativo + D&A; no EBITDA ajustado','Datos ausentes no equivalen a cero; bancos/aseguradoras no se puntúan por FCF o deuda/EBITDA','Insider ownership no disponible en esta fuente']};
}
const nyDate=new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'});
const nyClock=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null;
function completedBars(chart,now){
 const r=chart?.chart?.result?.[0];if(!r||!Number.isFinite(now))return {bars:[],adjusted:false};
 const today=nyDate.format(new Date(now)),clock=Object.fromEntries(nyClock.formatToParts(new Date(now)).map(x=>[x.type,x.value]));
 const officialEnd=Number(r.meta?.currentTradingPeriod?.regular?.end)*1000;
 const currentComplete=Number.isFinite(officialEnd)&&nyDate.format(new Date(officialEnd))===today?now>=officialEnd:Number(clock.hour)*60+Number(clock.minute)>=960;
 const q=r.indicators?.quote?.[0],adjusted=r.indicators?.adjclose?.[0]?.adjclose;
 const datedBars=(r.timestamp||[]).map((t,i)=>{const time=t*1000,date=Number.isFinite(time)?nyDate.format(new Date(time)):null;return {date,time,rawClose:q?.close?.[i],adjustedClose:adjusted?.[i],volume:q?.volume?.[i]};}).filter(b=>b.rawClose>0&&Number.isFinite(b.rawClose)&&b.time<=now&&(b.date<today||b.date===today&&currentComplete)).sort((a,b)=>a.time-b.time);
 // A duplicated provider row is not another trading session.
 const bars=[...new Map(datedBars.map(b=>[b.date,b])).values()];
 // Never mix raw and adjusted closes within one return series.
 const hasAdjusted=bars.length>0&&bars.every(b=>Number.isFinite(b.adjustedClose)&&b.adjustedClose>0);
 return {bars:bars.map(b=>({...b,close:hasAdjusted?b.adjustedClose:b.rawClose})),adjusted:hasAdjusted};
}
const calendarDays=(first,last)=>(Date.parse(last)-Date.parse(first))/864e5;
const adjustmentFactor=b=>Number.isFinite(b.adjustedClose)&&b.adjustedClose>0?b.adjustedClose/b.rawClose:null;
const pricePoint=b=>b?{date:b.date,value:b.close,rawClose:b.rawClose,adjustedClose:Number.isFinite(b.adjustedClose)&&b.adjustedClose>0?b.adjustedClose:null,adjustmentFactor:adjustmentFactor(b)}:null;
const peakBar=bars=>bars.reduce((peak,b)=>!peak||b.close>peak.close?b:peak,null);
function corporateActions(chart,first,last,now){
 const result=chart?.chart?.result?.[0],events=result?.events,provided=!!events&&typeof events==='object'&&!Array.isArray(events);
 const rows=kind=>Object.entries(events?.[kind]||{}).map(([key,event])=>{const time=Number(event?.date??key)*1000;return {event,time,date:Number.isFinite(time)?nyDate.format(new Date(time)):null};}).filter(x=>x.date>=first.date&&x.date<=last.date&&x.time<=now).sort((a,b)=>a.time-b.time);
 const splits=rows('splits').map(({event,date})=>({date,numerator:Number.isFinite(event.numerator)&&event.numerator>0?event.numerator:null,denominator:Number.isFinite(event.denominator)&&event.denominator>0?event.denominator:null,ratio:typeof event.splitRatio==='string'?event.splitRatio.slice(0,40):null}));
 const dividends=rows('dividends').filter(({event})=>Number.isFinite(event.amount)).map(({event,date})=>({date,amount:event.amount}));
 return {reporting:provided?'provider_events_field':'not_provided',splitCount:splits.length,dividendCount:dividends.length,splits:splits.slice(-6),dividends:dividends.slice(-6),limitation:'Eventos reportados por el proveedor dentro del intervalo observado; su ausencia no demuestra que no existan acciones corporativas ni explica los movimientos del precio.'};
}
export function priceFeatures(chart,benchmark,now){
 const series=completedBars(chart,now),bars=series.bars,last=bars.at(-1);if(!last)return null;
 const change=n=>bars.length>n?last.close/bars.at(-1-n).close-1:null,vols=bars.slice(-21,-1).map(b=>b.volume).filter(v=>Number.isFinite(v)&&v>0);
 const first=bars[0],windowStart=Date.parse(last.date)-370*864e5,yearBars=bars.filter(b=>Date.parse(b.date)>=windowStart),yearFirst=yearBars[0],yearPeak=peakBar(yearBars),observedPeak=peakBar(bars),yearDays=calendarDays(yearFirst.date,last.date),fullYear=yearDays>=340&&yearBars.length>=200;
 const factors=bars.map(adjustmentFactor).filter(Number.isFinite),factorChanges=bars.slice(1).filter((b,i)=>{const before=adjustmentFactor(bars[i]),after=adjustmentFactor(b);return before!==null&&after!==null&&Math.abs(after/before-1)>1e-6;}).length;
 const seriesDiagnostic={bars:bars.length,calendarDays:calendarDays(first.date,last.date),initial:pricePoint(first),maximum:pricePoint(observedPeak),last:pricePoint(last),oneYear:{initial:pricePoint(yearFirst),maximum:pricePoint(yearPeak),lastDate:last.date,bars:yearBars.length,calendarDays:yearDays,sufficientCoverage:fullYear,minimumCalendarDays:340,minimumSessions:200,maximumWindowDays:370},adjustments:{basis:series.adjusted?'provider_adjusted_close':'raw_close',complete:series.adjusted,availableBars:factors.length,firstFactor:adjustmentFactor(first),lastFactor:adjustmentFactor(last),minimumFactor:factors.length?Math.min(...factors):null,maximumFactor:factors.length?Math.max(...factors):null,observedFactorChanges:factorChanges,causalInterpretation:'Los factores son cierre ajustado / cierre original; sus cambios no identifican por sí solos una causa o acción corporativa.'},corporateActions:corporateActions(chart,first,last,now)};
 let beta=null,sharpe=null;const returns=yearBars.slice(1).map((b,i)=>({date:b.date,r:b.close/yearBars[i].close-1}));
 const benchmarkSeries=completedBars(benchmark,now);
 if(returns.length>=120){
  const x=returns.map(x=>x.r),mx=mean(x),sd=Math.sqrt(mean(x.map(v=>(v-mx)**2)));if(sd>0)sharpe=mx/sd*Math.sqrt(252);
  const benchmarkBars=benchmarkSeries.bars.filter(b=>Date.parse(b.date)>=windowStart&&b.date<=last.date),byDate=new Map(benchmarkBars.slice(1).map((b,i)=>[b.date,b.close/benchmarkBars[i].close-1]));
  const pairs=returns.map(x=>[x.r,byDate.get(x.date)]).filter(x=>Number.isFinite(x[1]));
  if(pairs.length>=120){const a=pairs.map(x=>x[0]),b=pairs.map(x=>x[1]),ma=mean(a),mb=mean(b),variance=mean(b.map(v=>(v-mb)**2));if(variance>0)beta=mean(pairs.map(([x,y])=>(x-ma)*(y-mb)))/variance;}
 }
 return {extractorVersion:fundamentalsVersion,asOf:new Date(last.time).toISOString(),checkedAt:now,return5d:change(5),return21d:change(21),return63d:change(63),return1y:fullYear?last.close/yearFirst.close-1:null,drawdown1y:last.close/yearPeak.close-1,drawdownObserved:last.close/observedPeak.close-1,definitions:{shortReturns:'Último cierre / cierre de hace 5, 21 o 63 sesiones completas únicas − 1; no son días calendario.',return1y:'Último / inicial − 1, sin anualizar, en el intervalo exacto de seriesDiagnostic.oneYear. Sólo se informa con 340-370 días calendario y al menos 200 sesiones únicas; una historia corta da null.',drawdown1y:'Último / máximo observado dentro de los últimos 370 días − 1. Es caída desde máximo, NO retorno anual; una ventana parcial no acredita un año completo.',drawdownObserved:'Último / máximo de toda la serie recibida − 1. No es pérdida desde el inicio ni retorno anual.',betaAndSharpe:'Estimaciones con los retornos por sesión del intervalo oneYear observado, que puede ser parcial. Requieren al menos 120 retornos; beta además requiere 120 pares de fechas con el benchmark.',priceBasis:'Todos los retornos, máximos, beta y Sharpe usan cierre ajustado sólo si la serie completa está disponible; en otro caso usan únicamente cierres originales, con fiabilidad limitada.'},seriesDiagnostic,relativeVolume:vols.length>=5&&last.volume>0?last.volume/mean(vols):null,averageDollarVolume:mean(bars.slice(-20).filter(b=>Number.isFinite(b.volume)&&b.volume>0).map(b=>b.volume*b.rawClose)),beta1y:beta,sharpe1yZeroRiskFree:sharpe,adjustedCloseAvailable:series.adjusted,benchmarkAdjustedCloseAvailable:benchmarkSeries.adjusted,returnBasis:series.adjusted?'Cierre ajustado por el proveedor':'Cierre sin ajustar',liquidityBasis:'Volumen multiplicado por cierre original; sesiones completas',source:'Yahoo Finance · cierres diarios',limitations:(series.adjusted?'Ajustes de splits/dividendos según el proveedor; se deben contrastar eventos corporativos. ':'Sin serie ajustada completa; splits/dividendos pueden distorsionar retornos y drawdown. ')+(!fullYear?'Cobertura insuficiente para retorno anual; ver intervalo exacto. ':'')+(benchmarkSeries.bars.length&&!benchmarkSeries.adjusted?'Benchmark sin ajuste completo. ':'')+'Drawdown desde máximo no es retorno anual ni demuestra una causa financiera. Sharpe histórico con tasa libre de riesgo cero, no predicción. Sesión actual excluida hasta cierre regular de Nueva York.'};
}
