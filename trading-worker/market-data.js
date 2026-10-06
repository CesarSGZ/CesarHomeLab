// Public reference data only. No broker orders, keys, local service or Python runtime.
export const referenceSource='Yahoo Finance · referencia pública';
export function regularSession(t){const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',weekday:'short',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date(t));const p=Object.fromEntries(parts.map(x=>[x.type,x.value]));const m=Number(p.hour)*60+Number(p.minute);return !['Sat','Sun'].includes(p.weekday)&&m>=572&&m<960;}
export function parseChart(json,symbol,now){
 const r=json?.chart?.result?.[0],m=r?.meta;
 if(json?.chart?.error||!m||m.symbol!==symbol.replaceAll('.','-')||m.currency!=='USD'||m.instrumentType!=='EQUITY'||!['NMS','NGM','NCM','NYQ','ASE'].includes(m.exchangeName))throw Error('Identidad, moneda o bolsa no válidas');
 const price=Number(m.regularMarketPrice),time=Number(m.regularMarketTime)*1000;
 if(!(price>0)||!Number.isFinite(time)||time>now+5000)throw Error('Precio o fecha no válidos');
 const bars=r.indicators?.quote?.[0],timestamps=r.timestamp||[];const volumes=[];
 for(let i=0;i<timestamps.length;i++){if(timestamps[i]*1000>=time-864e5)continue;const v=bars?.volume?.[i],c=bars?.close?.[i];if(v>0&&c>0)volumes.push(v*c);}
 const avg=volumes.slice(-20);if(avg.length<5)throw Error('Historial de liquidez insuficiente');
 return {price,time,fetchedAt:now,referenceOnly:true,realtime:false,source:referenceSource,dollarVolume:avg.reduce((a,b)=>a+b,0)/avg.length,liquidityBasis:'Promedio histórico de hasta 20 sesiones',currency:'USD',symbol};
}
