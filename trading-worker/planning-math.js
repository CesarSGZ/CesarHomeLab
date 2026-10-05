import {equity,allocation} from './core.js';

const DAY=864e5;
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const riskBasis='Aritmética condicional con los precios de ejecución del rango: ya incluyen deslizamiento, que no se aplica otra vez. El límite del motor usa pérdida bruta al stop en la moneda de la cartera; las dos comisiones USD se muestran aparte. Un stop no garantiza precio de salida: brechas, cambios de FX y deslizamiento de venta pueden aumentar la pérdida.';

export function planRiskArithmetic(book,plan,c){
 const unavailable=reason=>({known:false,reason,basis:riskBasis,entryRangeUSD:null,atMinimum:null,atMaximum:null,worstGrossStopLossEur:null,minimumStopUSDForRange:null,maximumGrossStopLossEur:null,withinGrossRiskLimit:false});
 if(!book||!Array.isArray(book.positions)||!finite(book.cash)||book.cash<0||!plan||!c)return unavailable('Cartera, rango o configuración ausentes');
 const fx=book.currency==='EUR'?book.fx?.rate:1;
 if(!finite(fx)||fx<=0)return unavailable('Cambio USD por EUR ausente o inválido');
 const eq=equity(book),lot=allocation(book),lo=plan.entryMin,hi=plan.entryMax,stop=plan.stop,commission=c.commission,maximum=eq*c.riskPct/100;
 if(![eq,lot,lo,hi,stop,commission,maximum].every(finite)||eq<=0||lot<=0||lo<=0||hi<lo||stop<=0||stop>=lo||commission<0||maximum<=0)return unavailable('Rango, stop, comisión o límite de riesgo inválidos');
 const budgetUSD=Math.min(lot,book.cash)*fx-commission;
 if(!finite(budgetUSD)||budgetUSD<=0||Math.floor(budgetUSD/hi)<1)return unavailable('El rango no tiene capacidad suficiente para una acción entera');
 if(!Number.isSafeInteger(Math.floor(budgetUSD/lo)))return unavailable('La cantidad de acciones excede la precisión entera disponible');
 const point=(entry,wholeShares=Math.floor(budgetUSD/entry))=>({entryPriceUSD:entry,wholeShares,grossStopLossEur:wholeShares*(entry-stop)/fx,estimatedLossWithRoundTripFeesEur:(wholeShares*(entry-stop)+2*commission)/fx,rewardRisk:finite(plan.target)?(plan.target-entry)/(entry-stop):null});
 const atMinimum=point(lo),atMaximum=point(hi),points=[atMinimum,atMaximum];
 // On each quantity interval risk increases with entry price. At B/n its upper limit is (B-n*stop)/FX;
 // because stop is positive, the last such boundary in the range dominates all earlier boundaries.
 const n=atMaximum.wholeShares+1,boundary=budgetUSD/n;
 let quantityBoundary=null;
 if(boundary>=lo&&boundary<=hi){quantityBoundary={...point(boundary,n),quantityBoundary:true,basis:'Límite superior inmediatamente antes de que el lote pierda una acción; no es una cotización ni una orden'};points.push(quantityBoundary);}
 const worst=points.reduce((a,b)=>b.grossStopLossEur>a.grossStopLossEur?b:a),minimumStop=Math.max(0,...points.map(p=>p.entryPriceUSD-maximum*fx/p.wholeShares));
 // Round a suggested lower stop bound upward, so a copied six-decimal threshold never fails through rounding down.
 const minimumStopUSDForRange=Math.ceil(minimumStop*1e6)/1e6;
 return {known:true,accountCurrency:book.currency||'USD',fxUSDPerEUR:fx,fxReferenceAt:book.fx?.time??null,equityEur:eq,lotBudgetEur:lot,commissionUSD:commission,budgetUSD,entryRangeUSD:{minimum:lo,maximum:hi},atMinimum,atMaximum,quantityBoundary,worstEntry:worst,worstGrossStopLossEur:worst.grossStopLossEur,minimumStopUSDForRange,maximumGrossStopLossEur:maximum,withinGrossRiskLimit:worst.grossStopLossEur<=maximum,basis:riskBasis};
}

function previousWeekday(isoDay){
 let day=new Date(isoDay+'T12:00:00Z');
 do{day=new Date(day.getTime()-DAY);}while([0,6].includes(day.getUTCDay()));
 return day.toISOString().slice(0,10);
}
function newYorkTime(isoDay,hour,minute){
 const [year,month,date]=isoDay.split('-').map(Number),target=Date.UTC(year,month-1,date,hour,minute);let guess=target+5*3600e3;
 const clock=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
 for(let i=0;i<2;i++){const p=Object.fromEntries(clock.formatToParts(new Date(guess)).map(p=>[p.type,p.value])),local=Date.UTC(Number(p.year),Number(p.month)-1,Number(p.day),Number(p.hour),Number(p.minute),Number(p.second));guess+=target-local;}
 return guess;
}
export function planExpiry(answer,event,now=Date.now()){
 const exitBeforeCatalyst=answer?.exitBeforeCatalyst===true,holding=answer?.holdingDays;
 const basis='Duración en días naturales desde la preparación. Si se evita el catalizador, corte a las 15:45 de Nueva York del día de lunes a viernes anterior; calendario semanal sin festivos ni sesiones reducidas. El corte es una política de salida, no una hora atribuida al evento ni una cotización; la salida exige una referencia real válida.';
 const invalid=reason=>({known:false,reason,expiresAt:null,cutoffAt:null,exitBeforeCatalyst,basis});
 if(!finite(now)||!finite(holding)||holding<1||holding>30)return invalid('Duración o fecha de preparación inválidas');
 const date=Date.parse(event?.date),timing=event?.timing??event?.research?.timing??'scheduled';
 let expiresAt=now+holding*DAY,cutoffAt=null;
 if(!exitBeforeCatalyst){if(timing==='scheduled'&&finite(date))expiresAt=Math.min(expiresAt,date+2*DAY);return {known:expiresAt>now,reason:expiresAt>now?null:'Vigencia calculada ya pasada',expiresAt,cutoffAt,exitBeforeCatalyst,basis};}
 if(!finite(date)||timing!=='scheduled')return invalid('Para evitar el catalizador hace falta una fecha primaria futura programada');
 const literal=String(event.date).slice(0,10),dayPrecision=event.datePrecision==='day'||/^\d{4}-\d{2}-\d{2}$/.test(String(event.date));
 const eventDay=dayPrecision?literal:new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(date));
 cutoffAt=newYorkTime(previousWeekday(eventDay),15,45);expiresAt=Math.min(expiresAt,cutoffAt);
 return {known:expiresAt>now,reason:expiresAt>now?null:'El corte previo al catalizador ya pasó; debe replantearse la tesis',expiresAt,cutoffAt,cutoffSessionDate:previousWeekday(eventDay),eventDay,exitBeforeCatalyst,basis};
}