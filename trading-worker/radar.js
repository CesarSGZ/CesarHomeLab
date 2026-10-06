// Agent Office · radar sin IA: catálogo de acciones de EEUU, calendario de resultados
// y señales (SEC 8-K, PR Newswire) puntuadas por código. Solo datos públicos.
import {eligible,id,num} from './core.js';
import {discover} from './discovery.js';
import {log} from './store.js';

async function nasdaq(url){const r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0','Accept':'application/json'},signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error('Catálogo Nasdaq no disponible');const j=await r.json();if(j.status?.rCode&&j.status.rCode!==200)throw Error('Consulta de catálogo rechazada');return j;}
async function refreshCatalog(s){
  const j=await nasdaq('https://api.nasdaq.com/api/screener/stocks?tableonly=true&limit=10000&download=true');const rows=j.data?.rows||j.data?.table?.rows;if(!Array.isArray(rows)||rows.length<100)throw Error('Catálogo incompleto');
  const bySymbol=new Map(rows.map(r=>[r.symbol,r]));
  // Se mantiene el mercado de la descarga inicial; nuevos listados requieren refrescar las tres bolsas.
  const next=[];const counts={};
  for(const exchange of ['NASDAQ','NYSE','AMEX']){const list=await nasdaq(`https://api.nasdaq.com/api/screener/stocks?tableonly=true&limit=10000&exchange=${exchange.toLowerCase()}`);const erows=list.data?.rows||list.data?.table?.rows;if(!Array.isArray(erows)||!erows.length)throw Error('Respuesta de bolsa incompleta');counts[exchange]=erows.length;for(const r of erows){const d=bySymbol.get(r.symbol)||r;const old=s.real.assets.find(a=>a.symbol===r.symbol);next.push({symbol:r.symbol,name:r.name,exchange,marketCap:num(r.marketCap),price:num(r.lastsale),volume:num(d.volume),sector:d.sector||'Sin sector',source:`https://www.nasdaq.com${r.url}`,fetchedAt:Date.now(),dataVerified:!!old?.dataVerified});}}
  s.real.assets=[...new Map(next.map(a=>[a.symbol,a])).values()];s.real.total=s.real.assets.length;s.real.counts=counts;s.real.catalogAt=Date.now();
}
export async function scout(s){
  if(Date.now()-s.real.catalogAt>864e5){try{await refreshCatalog(s);}catch(e){log(s,'scout',e.message+'; se conserva el último catálogo','warning');}}
  const assets=new Set(s.real.assets.filter(a=>!eligible(a,s.config)).map(a=>a.symbol));let found=0,errors=0;
  const today=new Date();today.setUTCHours(12,0,0,0);
  // 4 fechas por ciclo hasta cubrir toda la ventana.
  for(let i=0;i<4;i++){
    const offset=(s.real.calendarCursor++ % s.config.horizonDays)+1,date=new Date(today.getTime()+offset*864e5).toISOString().slice(0,10);
    try{const j=await nasdaq(`https://api.nasdaq.com/api/calendar/earnings?date=${date}`);if(!j.data)throw Error('Calendario sin cobertura');s.real.calendarCoverage[date]=Date.now();
      for(const r of j.data.rows||[]){if(!assets.has(r.symbol))continue;const eventId=id(r.symbol,date,'Resultados');if(s.real.events.some(e=>e.id===eventId))continue;s.real.events.push({id:eventId,symbol:r.symbol,date:date+'T20:00:00Z',kind:'Resultados',title:'Resultados · fecha estimada',summary:`Nasdaq incluye resultados de ${r.name} el ${date}.`,source:`https://www.nasdaq.com/market-activity/earnings?date=${date}`,createdAt:Date.now()});found++;}
    }catch{errors++;}
  }
  s.real.calendarCoverage=Object.fromEntries(Object.entries(s.real.calendarCoverage).filter(([d])=>Date.parse(d+'T23:59:59Z')>Date.now()));
  await discover(s,log);
  s.real.events=s.real.events.filter(e=>Date.parse(e.date)>Date.now()-7*864e5||(e.signal&&Date.now()-e.signal.publishedAt<7*864e5)).sort((a,b)=>(b.preScore?.score||0)-(a.preScore?.score||0)).slice(0,600);s.real.lastScan=Date.now();
  log(s,'scout',`Barrido: ${found} fechas de resultados nuevas${errors?' · '+errors+' consultas sin respuesta':''}`);
}
