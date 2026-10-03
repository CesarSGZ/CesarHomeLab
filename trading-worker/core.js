import {regularSession,referenceSource} from './market-data.js';
import {catalystReady} from './strategy.js';
export const defaults = { minCap:100e6, primaryCap:2e9, maxCap:5e9, minPrice:2, minDollarVolume:1e6, maxSpread:1, maxEntries:2, maxPositions:20, riskPct:0.35, maxPositionPct:5, maxExposurePct:100, dailyLossPct:2, dailyBudget:3, maxAnalyses:2, slippageBps:25, commission:1, maxQuoteAge:120, minRR:2, horizonDays:45 };
export const day = (t=Date.now()) => new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(t));
export const id = (...parts) => {let hash=14695981039346656037n;for(const char of parts.join('|')){hash^=BigInt(char.codePointAt(0));hash=BigInt.asUintN(64,hash*1099511628211n);}return hash.toString(16);};
export const num = x => Number(String(x??'').replace(/[^0-9.\-]/g,'')) || 0;
export function eligible(a,c=defaults){
  if(!['NASDAQ','NYSE','AMEX'].includes(a.exchange)) return 'Mercado excluido';
  if(!/^[A-Z][A-Z0-9.\-]{0,7}$/.test(a.symbol)) return 'Símbolo especial';
  if(!/common stock|ordinary shares|capital stock|common shares/i.test(a.name) || /preferred|warrant|depositary|etf|exchange.traded|\bunits\b|\bfund\b/i.test(a.name)) return 'Tipo de instrumento excluido';
  if(a.marketCap<c.minCap || a.marketCap>c.maxCap) return 'Capitalización fuera del rango';
  if(a.price<c.minPrice) return 'Precio inferior al mínimo';
  return null;
}
export function freshQuote(q,t,c=defaults){
  if(q?.referenceOnly===true)return q.source===referenceSource&&q.currency==='USD'&&Number.isFinite(q.price)&&q.price>0&&Number.isFinite(q.time)&&q.time<=t+5000&&t-q.time<=35*60e3&&Number.isFinite(q.fetchedAt)&&q.fetchedAt<=t+5000&&t-q.fetchedAt<=20*60e3&&regularSession(t)&&regularSession(q.time);
  return !!q && q.realtime===true && Number.isFinite(q.bid) && Number.isFinite(q.ask) && q.bid>0 && q.ask>=q.bid && q.time<=t+5000 && t-q.time<=c.maxQuoteAge*1000;
}
export const referencePrice=q=>q?.referenceOnly?q.price:q?.bid;
const entryPrice=q=>q?.referenceOnly?q.price:q?.ask;
export const equity = book => book.cash + book.positions.reduce((s,p)=>s+p.qty*(p.mark??p.entry)/(p.markFx||p.entryFx||1),0);
export const allocation = book => Math.max(500,Math.floor(equity(book)/5000)*250);
export const fxValid = (book,t) => book.currency!=='EUR'||(book.fx?.rate>0&&book.fx.time<=t+5000&&t-book.fx.time<7*864e5);
export function assess(book,asset,event,plan,quote,config,t){
  const fail=[]; const eq=equity(book);
  if(!fxValid(book,t))fail.push('Cambio EUR/USD de referencia pendiente o caducado');
  const fx=book.currency==='EUR'?book.fx?.rate:1;
  if(eligible(asset,config)) fail.push(eligible(asset,config));
  if(!(quote?.referenceOnly?asset.dataVerified:asset.contractVerified)) fail.push('Identidad del instrumento pendiente');
  if(!event.confirmed || (!event.source&&!event.synthetic) || !event.summary) fail.push('Catalizador sin confirmar');
  const timing=event.timing??event.research?.timing??'scheduled',until=Date.parse(event.date)-t;
  if(timing==='announced'){
    if(!catalystReady(event,t))fail.push('Anuncio sin evidencia primaria fechada en los últimos siete días');
  }else if(timing!=='scheduled'||!Number.isFinite(until)||until<0||until>config.horizonDays*864e5)fail.push('Catalizador fuera de ventana');
  if(!freshQuote(quote,t,config)) fail.push('Cotización ausente, retrasada o caducada');
  if(!quote || !Number.isFinite(quote.dollarVolume)||quote.dollarVolume<config.minDollarVolume) fail.push('Liquidez insuficiente o desconocida');
  if(quote&&!quote.referenceOnly && (quote.ask-quote.bid)/((quote.ask+quote.bid)/2)*100>config.maxSpread) fail.push('Spread excesivo');
  if(!plan || ![plan.entryMin,plan.entryMax,plan.stop,plan.target,plan.expiresAt].every(Number.isFinite) || !(plan.stop>0 && plan.entryMin>plan.stop && plan.entryMax>=plan.entryMin && plan.target>plan.entryMax && plan.expiresAt>t)) fail.push('Plan inválido o caducado');
  if(plan && Number.isFinite(plan.entryMax) && (plan.target-plan.entryMax)/(plan.entryMax-plan.stop)<config.minRR) fail.push('Beneficio/riesgo insuficiente');
  if(book.positions.some(p=>p.symbol===asset.symbol)) fail.push('Ya existe posición');
  if(book.positions.length>=Math.min(20,config.maxPositions)) fail.push('Límite de posiciones');
  if(book.entriesToday>=Math.min(2,config.maxEntries)) fail.push('Límite de entradas de la sesión');
  if(eq<=book.dayStartEquity*(1-config.dailyLossPct/100)) fail.push('Límite de pérdida diaria');
  const price=entryPrice(quote)*(1+config.slippageBps/1e4);
  if(!Number.isFinite(price) || price<plan?.entryMin || price>plan?.entryMax) fail.push('Precio fuera de la zona de entrada');
  let qty=0;
  if(!fail.length){
    qty=Math.floor(Math.min(allocation(book)*fx-config.commission,book.cash*fx-config.commission)/price);
    if(qty<1) fail.push('Sin capacidad de compra');
    if(qty*(price-plan.stop)/fx>eq*config.riskPct/100)fail.push('El lote excede el riesgo permitido; plan rechazado');
  }
  return {ok:!fail.length,reasons:fail,qty,price};
}
export function rollover(book,t){
  if(book.sessionDay!==day(t)){book.sessionDay=day(t);book.entriesToday=0;book.dayStartEquity=equity(book);}
}
export function buy(book,asset,event,plan,q,c,t){
  rollover(book,t);
  if(book.orders.some(o=>o.eventId===event.id && o.side==='buy')) return {ok:false,reasons:['Evento ya operado']};
  const result=assess(book,asset,event,plan,q,c,t);
  if(!result.ok) return result;
  const {qty,price}=result;
  const fx=book.currency==='EUR'?book.fx.rate:1;
  book.cash-=(qty*price+c.commission)/fx;book.entriesToday++;
  const order={id:id(event.id,'buy'),eventId:event.id,symbol:asset.symbol,side:'buy',qty,price,fee:c.commission,time:t,pricing: q.referenceOnly?'Referencia pública + deslizamiento estimado':'Snapshot',source:q.source||null,quoteTime:q.time};
  book.orders.push(order);
  book.positions.push({id:order.id,eventId:event.id,symbol:asset.symbol,sector:asset.sector,qty,entry:price,entryFx:fx,mark:referencePrice(q),markFx:fx,allocation:allocation(book),stop:plan.stop,target:plan.target,expiresAt:plan.expiresAt,entryFee:c.commission,openedAt:t,thesis:plan.thesis,pricing:order.pricing,quoteTime:q.time});
  return {...result,order};
}
export function sell(book,p,q,c,t,reason='manual'){
  if(!book.positions.some(x=>x.id===p.id)) return null;
  if(!freshQuote(q,t,c)) return null;
  if(!fxValid(book,t))return null;
  const fx=book.currency==='EUR'?book.fx.rate:1;
  const price=referencePrice(q)*(1-c.slippageBps/1e4);
  const trade={...p,exit:price,exitFx:fx,exitFee:c.commission,closedAt:t,reason,pnl:(price*p.qty-c.commission)/fx-(p.entry*p.qty+p.entryFee)/(p.entryFx||1)};
  book.cash+=(price*p.qty-c.commission)/fx;
  book.closed.push(trade);
  book.orders.push({id:id(p.id,'sell'),eventId:p.eventId,symbol:p.symbol,side:'sell',qty:p.qty,price,fee:c.commission,time:t,reason,pricing:q.referenceOnly?'Referencia pública + deslizamiento estimado':'Snapshot',source:q.source||null,quoteTime:q.time});
  book.positions=book.positions.filter(x=>x.id!==p.id);
  return trade;
}
export function monitor(book,quotes,c,t){
  const trades=[];
  for(const p of [...book.positions]){
    const q=quotes[p.symbol]; if(!freshQuote(q,t,c)) continue;
    p.mark=referencePrice(q);p.quoteTime=q.time;
    if(book.currency==='EUR'&&fxValid(book,t))p.markFx=book.fx.rate;
    const reason=referencePrice(q)<=p.stop?'stop':referencePrice(q)>=p.target?'objetivo':t>=p.expiresAt?'tiempo':null;
    if(reason){const trade=sell(book,p,q,c,t,reason);if(trade) trades.push(trade);}
  }
  rollover(book,t);
  return trades;
}
export function newBook(t=Date.now(),currency='USD'){return {currency,fx:null,cash:10000,initial:10000,sessionDay:day(t),entriesToday:0,dayStartEquity:10000,positions:[],orders:[],closed:[],curve:[{time:t,value:10000}],peak:10000,maxDrawdown:0};}
export function sample(book,t){const value=equity(book);book.peak=Math.max(book.peak,value);book.maxDrawdown=Math.max(book.maxDrawdown,(book.peak-value)/book.peak*100);book.curve.push({time:t,value});book.curve=book.curve.slice(-500);}
