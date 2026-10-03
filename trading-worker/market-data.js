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
// A dated public price is sufficient for research, never for an executable entry.
export function planningReference(q,now){return q?.referenceOnly===true&&q.source===referenceSource&&q.currency==='USD'&&q.price>0&&Number.isFinite(q.price)&&Number.isFinite(q.time)&&q.time<=now+5000&&now-q.time<=7*864e5&&Number.isFinite(q.fetchedAt)&&q.fetchedAt<=now+5000&&now-q.fetchedAt<=7*864e5;}
export async function refreshMarket(s,{force=false,fetcher=fetch,now=Date.now()}={}){
 if(s.mode!=='real')return;
 const d=s.real;if(!force&&now-(d.marketCheckedAt||0)<15*60e3)return;
 const finalists=[...new Set(d.events.filter(e=>e.confirmed&&['nuevo','espera','abierto'].includes(e.status)).sort((a,b)=>Date.parse(a.date)-Date.parse(b.date)).map(e=>e.symbol))].slice(0,8);
 const requested=new Set((s.company?.agency?.workQueue||[]).filter(w=>['pending','blocked','running'].includes(w.status)&&['analysis','risk','research'].includes(w.kind)&&w.notBefore<=now).map(w=>w.eventId));
 const watchlist=[...new Set(d.events.filter(e=>e.preScore?.eligible&&!['descartado','caducado'].includes(e.status)).sort((a,b)=>Number(requested.has(b.id))-Number(requested.has(a.id))||(b.preScore?.score||0)-(a.preScore?.score||0)).map(e=>e.symbol))].slice(0,4);
 const ordered=[...d.book.positions.map(p=>p.symbol),...finalists,...watchlist];
 const symbols=[...new Set(ordered)].slice(0,28);d.marketCheckedAt=now;d.marketError=null;
 if(!symbols.length){d.marketStatus='Esperando candidatos con evidencia';return;}
 if(!force&&!regularSession(now)&&now-(d.marketProviderAt||0)<6*3600e3&&symbols.every(symbol=>planningReference(d.quotes[symbol],now))){d.marketStatus='Mercado cerrado; referencias conservadas con su fecha';return;}
 d.marketPurpose=d.book.positions.length?'Vigilancia de posiciones':finalists.length?'Precios para candidatas confirmadas':'Comprobación del proveedor con acciones del radar; no autoriza compras';
 let updated=0;const errors=[];
 for(let i=0;i<symbols.length;i+=4){const batch=await Promise.allSettled(symbols.slice(i,i+4).map(async symbol=>{const r=await fetcher('https://query1.finance.yahoo.com/v8/finance/chart/'+encodeURIComponent(symbol.replaceAll('.','-'))+'?interval=1d&range=1mo&includePrePost=false',{headers:{'User-Agent':'Mozilla/5.0','Accept':'application/json'},signal:AbortSignal.timeout(12000)});if(!r.ok)throw Error('Proveedor HTTP '+r.status);return {symbol,q:parseChart(await r.json(),symbol,now)};}));
  for(let j=0;j<batch.length;j++){const result=batch[j];if(result.status==='fulfilled'){const {symbol,q}=result.value;d.quotes[symbol]=q;const a=d.assets.find(a=>a.symbol===symbol);if(a)a.dataVerified=true;updated++;}else errors.push(symbols[i+j]+': '+String(result.reason.message).slice(0,90));}
  if(errors.some(e=>e.includes('429')))break;
 }
 if(updated){d.marketAt=now;d.marketProviderAt=now;}d.marketError=errors.length?errors.slice(0,4).join('; '):null;d.marketStatus=(regularSession(now)?'':'Mercado cerrado · ')+updated+' referencias actualizadas de '+symbols.length+(errors.length?' · '+errors.length+' pendientes':'')+(finalists.length||d.book.positions.length?'':' · radar, sin autorización de compra');
}
