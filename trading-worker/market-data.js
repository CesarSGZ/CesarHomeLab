// Public reference data only. No broker orders, keys, local service or Python runtime.
import {isSpanish,spanishSession} from './spain.js';
export const referenceSource='Yahoo Finance · referencia pública';
// Sesión del mercado donde cotiza el símbolo (.MC = Bolsa de Madrid, en EUR).
export const sessionFor=(symbol,t)=>isSpanish(symbol)?spanishSession(t):regularSession(t);
export const yahooSymbol=symbol=>isSpanish(symbol)?symbol:symbol.replaceAll('.','-');
const pctMove=(a,b)=>a>0&&b>0?a/b-1:null;
export function regularSession(t){const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',weekday:'short',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date(t));const p=Object.fromEntries(parts.map(x=>[x.type,x.value]));const m=Number(p.hour)*60+Number(p.minute);return !['Sat','Sun'].includes(p.weekday)&&m>=572&&m<960;}
export function parseChart(json,symbol,now){
 const r=json?.chart?.result?.[0],m=r?.meta;
 const es=isSpanish(symbol);
 if(json?.chart?.error||!m||m.symbol!==yahooSymbol(symbol)||m.currency!==(es?'EUR':'USD')||m.instrumentType!=='EQUITY'||!(es?['MCE']:['NMS','NGM','NCM','NYQ','ASE']).includes(m.exchangeName))throw Error('Identidad, moneda o bolsa no válidas');
 const price=Number(m.regularMarketPrice),time=Number(m.regularMarketTime)*1000;
 if(!(price>0)||!Number.isFinite(time)||time>now+5000)throw Error('Precio o fecha no válidos');
 const bars=r.indicators?.quote?.[0],timestamps=r.timestamp||[];const volumes=[];
 for(let i=0;i<timestamps.length;i++){if(timestamps[i]*1000>=time-864e5)continue;const v=bars?.volume?.[i],c=bars?.close?.[i];if(v>0&&c>0)volumes.push(v*c);}
 const avg=volumes.slice(-20);if(avg.length<5)throw Error('Historial de liquidez insuficiente');
 const closes=(bars?.close||[]).filter(c=>c>0);
 return {price,time,fetchedAt:now,referenceOnly:true,realtime:false,source:referenceSource,dollarVolume:avg.reduce((a,b)=>a+b,0)/avg.length,liquidityBasis:'Promedio histórico de hasta 20 sesiones',currency:es?'EUR':'USD',symbol,r5d:pctMove(price,closes.at(-6)),r21d:pctMove(price,closes[0])};
}
