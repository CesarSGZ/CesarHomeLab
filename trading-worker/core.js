// Agent Office · contabilidad base de la cartera ficticia y utilidades de fechas.
import {sessionFor,referenceSource} from './market-data.js';
import {isSpanish} from './spain.js';
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
  if(q?.referenceOnly===true)return q.source===referenceSource&&q.currency===(isSpanish(q.symbol)?'EUR':'USD')&&Number.isFinite(q.price)&&q.price>0&&Number.isFinite(q.time)&&q.time<=t+5000&&t-q.time<=35*60e3&&Number.isFinite(q.fetchedAt)&&q.fetchedAt<=t+5000&&t-q.fetchedAt<=20*60e3&&sessionFor(q.symbol,t)&&sessionFor(q.symbol,q.time);
  return !!q && q.realtime===true && Number.isFinite(q.bid) && Number.isFinite(q.ask) && q.bid>0 && q.ask>=q.bid && q.time<=t+5000 && t-q.time<=c.maxQuoteAge*1000;
}
export const referencePrice=q=>q?.referenceOnly?q.price:q?.bid;
export const equity = book => book.cash + book.positions.reduce((s,p)=>s+p.qty*(p.mark??p.entry)/(p.markFx||p.entryFx||1),0);
export const fxValid = (book,t) => book.currency!=='EUR'||(book.fx?.rate>0&&book.fx.time<=t+5000&&t-book.fx.time<7*864e5);
export function rollover(book,t){
  if(book.sessionDay!==day(t)){book.sessionDay=day(t);book.entriesToday=0;book.dayStartEquity=equity(book);}
}
export function sell(book,p,q,c,t,reason='manual'){
  if(!book.positions.some(x=>x.id===p.id)) return null;
  if(!freshQuote(q,t,c)) return null;
  if(!fxValid(book,t))return null;
  const fx=isSpanish(p.symbol)?1:book.currency==='EUR'?book.fx.rate:1; // lo que cotiza en EUR no se convierte
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
    if(isSpanish(p.symbol))p.markFx=1;else if(book.currency==='EUR'&&fxValid(book,t))p.markFx=book.fx.rate;
    const reason=referencePrice(q)<=p.stop?'stop':referencePrice(q)>=p.target?'objetivo':t>=p.expiresAt?'tiempo':null;
    if(reason){const trade=sell(book,p,q,c,t,reason);if(trade) trades.push(trade);}
  }
  rollover(book,t);
  return trades;
}
export function newBook(t=Date.now(),currency='USD'){return {currency,fx:null,cash:10000,initial:10000,sessionDay:day(t),entriesToday:0,dayStartEquity:10000,positions:[],orders:[],closed:[],curve:[{time:t,value:10000}],peak:10000,maxDrawdown:0};}
export function sample(book,t){const value=equity(book);book.peak=Math.max(book.peak,value);book.maxDrawdown=Math.max(book.maxDrawdown,(book.peak-value)/book.peak*100);book.curve.push({time:t,value});book.curve=book.curve.slice(-500);}
