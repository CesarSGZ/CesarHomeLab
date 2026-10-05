const finite=x=>typeof x==='number'&&Number.isFinite(x);
const pending=new Set(['pending','queued','running','blocked','pendiente','asignada']);
const financialKinds=new Set(['research','analysis','risk','execution']);
const fingerprint=(event,plan)=>JSON.stringify([event.id,plan.preparedAt??null,plan.expiresAt,plan.entryMin,plan.entryMax,plan.stop,plan.target,plan.adaptationId??null]);

// Housekeeping only: there is no model call, replacement thesis, new price, or accounting mutation.
export function expireUnfilledPlans(s,now=Date.now()){
 if(!finite(now)||!Array.isArray(s.real?.events)||!Array.isArray(s.real.book?.positions)||!Array.isArray(s.real.book?.orders))return [];
 const expired=[],book=s.real.book;
 for(const event of s.real.events){
  const plan=event.plan;
  if(!plan||!finite(plan.expiresAt)||plan.expiresAt>now||event.status==='abierto')continue;
  if(book.positions.some(p=>p.eventId===event.id||p.symbol===event.symbol)||book.orders.some(o=>o.side==='buy'&&o.eventId===event.id))continue;
  const reason='Plan vencido sin entrada; archivado sin compra, aprobación nueva ni reevaluación automática',key=fingerprint(event,plan),history=event.planLifecycleHistory??=[];
  const archivedWorkIds=[];
  for(const work of s.company?.agency?.workQueue||[]){
   if(work.eventId!==event.id||!financialKinds.has(work.kind)||!pending.has(work.status))continue;
   work.status='archived';work.finishedAt=now;work.result=reason;work.planExpiryArchivedAt=now;archivedWorkIds.push(work.id);
  }
  const previousStatus=event.status,previousReasons=structuredClone(event.reasons||[]),oldReview=structuredClone(event.review||null);
  if(!history.some(h=>h.fingerprint===key)){
   history.push({at:now,kind:'expired_without_entry',fingerprint:key,expiredAt:plan.expiresAt,previousStatus,previousReasons,plan:structuredClone(plan),review:oldReview,reason,archivedWorkIds});event.planLifecycleHistory=history.slice(-8);
   expired.push({at:now,eventId:event.id,symbol:event.symbol,kind:'expired_without_entry',expiredAt:plan.expiresAt,preparedAt:plan.preparedAt??null,adaptationId:plan.adaptationId??null,strategyVersion:plan.strategyVersion??null,reviewApproved:oldReview?.approve===true,previousStatus,lastBlockers:previousReasons.slice(0,3).map(x=>String(x).slice(0,240)),entryMin:finite(plan.entryMin)?plan.entryMin:null,entryMax:finite(plan.entryMax)?plan.entryMax:null,lastReference:finite(s.real.quotes?.[event.symbol]?.price)&&finite(s.real.quotes[event.symbol].time)?{price:s.real.quotes[event.symbol].price,time:s.real.quotes[event.symbol].time,source:s.real.quotes[event.symbol].source}:null,reason,archivedWorkIds});
  }
  event.status='caducado';event.reasons=[reason];event.planExpiredAt=plan.expiresAt;event.planArchivedAt=now;delete event.plan;delete event.review;
 }
 if(expired.length){
  s.company??={};s.company.planningOutcomes=[...expired,...(s.company.planningOutcomes||[])].slice(0,80);
  const prior=s.company.planLifecycle?.expiredWithoutEntryTotal||0;
  s.company.planLifecycle={...(s.company.planLifecycle||{}),expiredWithoutEntryTotal:prior+expired.length,lastArchivedAt:now,lastBatch:expired.map(e=>e.eventId)};
 }
 return expired;
}
