import {day,equity} from './core.js';
export const objectives={scout:['Encontrar señales contrastables sin búsquedas aleatorias','Curioso y escéptico'],analyst:['Aceptar solo tesis con ventaja y escenarios justificables','Paciente y exigente'],risk:['Proteger el capital y cuestionar supuestos','Prudente e independiente'],operator:['Ejecutar el plan ficticio con datos válidos','Disciplinada'],auditor:['Mejorar el resultado descontando IA, sin sobreajustar','Crítico y metódico'],designer:['Hacer visible la evidencia, costes y cambios solo en Agent Office','Claro y creativo']};
export function initialiseGovernance(s){s.real.stats??={startedAt:Date.now(),researched:s.real.events.filter(e=>e.research).length,rejected:s.real.events.filter(e=>e.research&&e.status==='descartado').length};s.policy??={version:1,minScore:45,researchIntervalMinutes:30,researchDailyLimit:12};s.governance??={reviews:[],changes:[],messages:[],lastDay:null};for(const a of s.agents){[a.objective,a.personality]=objectives[a.id]||['Esperar tareas',''];}return s;}
export function message(s,from,to,text,now=Date.now()){s.governance.messages.unshift({id:crypto.randomUUID(),from,to,text:String(text).slice(0,1000),time:now});s.governance.messages=s.governance.messages.slice(0,80);}
export function metrics(s,usage={confirmed:0,reserved:0},now=Date.now()){
 const b=s.real.book,closed=b.closed,wins=closed.filter(t=>t.pnl>0),losses=closed.filter(t=>t.pnl<0),profit=wins.reduce((n,t)=>n+t.pnl,0),loss=-losses.reduce((n,t)=>n+t.pnl,0),gross=equity(b)-b.initial;
 const rate=b.fx?.rate,aiEur=rate>0?(usage.confirmed||0)/rate:null,reservedEur=rate>0?(usage.reserved||0)/rate:null;
 const researched=s.real.stats?.researched??s.real.events.filter(e=>e.research).length,rejected=s.real.stats?.rejected??s.real.events.filter(e=>e.status==='descartado'&&e.research).length;
 return {at:now,grossPnl:gross,closedPnl:profit-loss,closed:closed.length,winRate:closed.length?wins.length/closed.length:null,profitFactor:loss>0?profit/loss:null,maxDrawdown:b.maxDrawdown||0,aiUsd:usage.confirmed||0,aiEur,reservedEur,netAfterAi:aiEur===null?null:gross-aiEur,efficiencyEquivalent:gross/1000,efficiencyNet:aiEur===null?null:gross/1000-aiEur,scale:1000,statsSince:s.real.stats?.startedAt||null,researched,rejected,conversion:researched?(researched-rejected)/researched:null,qualified:s.real.events.filter(e=>e.preScore?.eligible).length,limitations:'P/L ficticio; IA real. EUR de IA aproximado con cambio BCE actual. Equivalencia 1.000 € ficticios = 1 €; Investigaciones acumuladas desde activación del radar; alojamiento/datos y ajustes corporativos no incluidos.'};
}
export function chooseChange(s,k){
 if(s.governance.changes.some(c=>c.status==='aplicado'&&Date.now()-c.time<7*864e5))return {action:'hold',reason:'Periodo de observación de siete días'};
 if(k.closed>=10&&k.closedPnl<0&&k.winRate<.4&&s.config.riskPct>.1)return {action:'reduceRisk',reason:'Diez o más cierres, pérdida acumulada y menos del 40% de aciertos'};
 if(k.researched>=20&&k.rejected/k.researched>=.8&&s.policy.minScore<70)return {action:'tighten',reason:'Al menos veinte investigaciones y 80% descartadas; reducir búsquedas improductivas'};
 if(k.researched>=12&&k.efficiencyNet<0&&s.policy.researchDailyLimit>6)return {action:'throttle',reason:'Doce investigaciones y equivalencia neta negativa; reducir gasto mientras se reúne evidencia'};
 return {action:'hold',reason:'Muestra insuficiente o sin evidencia para cambiar reglas'};
}
export function applyChange(s,decision,k,now=Date.now()){
 if(!['hold','reduceRisk','tighten','throttle'].includes(decision.action))throw Error('Cambio no permitido');
 if(decision.action==='hold')return null;
 const allowed=chooseChange(s,k);if(allowed.action!==decision.action)throw Error('El cambio no cumple la evidencia requerida');
 const before={policy:{...s.policy},riskPct:s.config.riskPct};
 if(decision.action==='reduceRisk')s.config.riskPct=Math.max(.1,Number((s.config.riskPct-.05).toFixed(2)));
 if(decision.action==='tighten')s.policy.minScore=Math.min(70,s.policy.minScore+5);
 if(decision.action==='throttle'){s.policy.researchDailyLimit=6;s.policy.researchIntervalMinutes=60;}
 s.policy.version++;const change={id:crypto.randomUUID(),time:now,action:decision.action,reason:decision.reason,before,after:{policy:{...s.policy},riskPct:s.config.riskPct},baseline:k,status:'aplicado',scope:'trading-rules'};s.governance.changes.unshift(change);s.governance.changes=s.governance.changes.slice(0,40);return change;
}
export function rollback(s,k,now=Date.now()){
 const c=s.governance.changes.find(c=>c.status==='aplicado');if(!c||k.closed-c.baseline.closed<10||k.grossPnl-c.baseline.grossPnl>-s.real.book.initial*.02)return null;
 // Rollback only fields still owned by the change; preserve intervening owner settings.
 for(const key of ['minScore','researchDailyLimit','researchIntervalMinutes'])if(s.policy[key]===c.after.policy[key])s.policy[key]=c.before.policy[key];
 if(s.config.riskPct===c.after.riskPct)s.config.riskPct=c.before.riskPct;s.policy.version++;c.status='revertido';c.rollbackAt=now;c.rollbackReason='Diez cierres nuevos y deterioro de P/L superior al 2% del capital inicial; no implica causalidad';return c;
}
export function visualManifest(k,review,version=1,now=Date.now()){
 const focus=k.maxDrawdown>=2?'risk':k.efficiencyNet<0?'economics':'pipeline';
 return {scope:'agent-office',version,updatedAt:now,focus,panels:['efficiency','radar','rules','communications'],summary:String(review?.summary||'KPIs sincronizados con datos reales; sin operaciones inventadas').slice(0,500),checks:['scope','allowlist','finite-data'],theme:focus==='risk'?'amber':focus==='economics'?'violet':'mint'};
}
export function validManifest(v){return v?.scope==='agent-office'&&['risk','economics','pipeline'].includes(v.focus)&&['amber','violet','mint'].includes(v.theme)&&Array.isArray(v.panels)&&v.panels.every(p=>['efficiency','radar','rules','communications'].includes(p))&&typeof v.summary==='string'&&v.summary.length<=500;}
export function dailyReview(s,k,now=Date.now()){
 initialiseGovernance(s);const today=day(now);if(s.governance.lastDay===today)return null;
 const reverted=rollback(s,k,now),decision=reverted?{action:'hold',reason:'Regla revertida; observar resultados'}:chooseChange(s,k),change=applyChange(s,decision,k,now);
 const review={time:now,day:today,kpis:k,decision,summary:change?'Cambio automático: '+decision.reason:decision.reason};s.governance.reviews.unshift(review);s.governance.reviews=s.governance.reviews.slice(0,60);s.governance.lastDay=today;
 message(s,'auditor','scout',review.summary,now);message(s,'auditor','risk','Riesgo por posición: '+s.config.riskPct+'%. Revisa hechos y mantén límites.',now);message(s,'auditor','designer','Refleja KPIs, evidencia y versión '+s.policy.version+' exclusivamente en Agent Office.',now);return review;
}
