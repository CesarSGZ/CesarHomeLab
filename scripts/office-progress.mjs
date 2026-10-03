// One progress write at a time. The terminal snapshot is always written last.
export function startOfficeProgress(publish,{intervalMs=20000,setIntervalFn=setInterval,clearIntervalFn=clearInterval,onError=()=>{}}={}){
 if(typeof publish!=='function'||!Number.isFinite(intervalMs)||intervalMs<1)throw Error('Invalid progress publisher');
 let inFlight=null,stopped=false,terminal=null;
 const tick=()=>{
  if(stopped)return Promise.resolve();
  if(inFlight)return inFlight;
  inFlight=Promise.resolve().then(publish).catch(error=>{try{onError(error);}catch{/* A progress notification must not interrupt the trading cycle. */}}).finally(()=>{inFlight=null;});
  return inFlight;
 };
 const timer=setIntervalFn(tick,intervalMs);
 const finish=()=>{
  if(terminal)return terminal;
  stopped=true;clearIntervalFn(timer);
  terminal=(async()=>{if(inFlight)await inFlight;return publish();})();
  return terminal;
 };
 return {tick,finish};
}
