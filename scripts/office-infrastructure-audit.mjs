import {writeFileSync} from 'node:fs';
const account='dc66931243377cb773c0a9aa355cad15';
const database='799a8dfb-7cea-47a9-9e47-79b767013be4';
const cfHeaders={Authorization:'Bearer '+process.env.CLOUDFLARE_API_TOKEN,'Content-Type':'application/json'};
for(const [name,path,body] of [
 ['d1-read',`accounts/${account}/d1/database/${database}/query`,{sql:'SELECT 1 AS connection_ok'}],
 ['workers-read',`accounts/${account}/workers/scripts`,null]
]){
 const response=await fetch('https://api.cloudflare.com/client/v4/'+path,{method:body?'POST':'GET',headers:cfHeaders,...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(30000)});
 const result=await response.json();
 console.log(JSON.stringify({check:name,status:response.status,success:result.success,errors:result.errors?.map(e=>({code:e.code,message:String(e.message).slice(0,200)}))}));
}
const response=await fetch('https://cesar-solla.pages.dev/api/trading/development',{method:'POST',headers:{Authorization:'Bearer '+process.env.OFFICE_DEV_TOKEN,'Content-Type':'application/json'},body:JSON.stringify({action:'audit'}),signal:AbortSignal.timeout(90000)});
if(!response.ok)throw Error('Office diagnostics HTTP '+response.status);
const report=await response.json();
writeFileSync('/tmp/office-live-audit.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({check:'office-state',at:report.at,scheduler:report.scheduler,paperBook:report.paperBook,budget:report.budget}));
for(const [name,sql,writeSql] of [
 ['state','SELECT * FROM trading_state WHERE id=1','UPDATE trading_state SET payload=?,updated_at=?,lock_until=? WHERE id=1 AND lease_token=?'],
 ['status','SELECT payload FROM trading_status_cache WHERE id=1','INSERT INTO trading_status_cache(id,payload,updated_at) VALUES(1,?,?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload,updated_at=excluded.updated_at']
]){
 const check=await fetch('https://cesar-solla.pages.dev/api/trading/development',{method:'POST',headers:{Authorization:'Bearer '+process.env.OFFICE_DEV_TOKEN,'Content-Type':'application/json'},body:JSON.stringify({action:'runtime-db',sql,params:[]}),signal:AbortSignal.timeout(30000)});
 const data=await check.json();if(!check.ok||!data.success)throw Error('Scoped runtime diagnosis HTTP '+check.status);
 const payload=data.result?.[0]?.results?.[0]?.payload||'{}',now=Date.now();
 const encoded=JSON.stringify({action:'runtime-db',sql:writeSql,params:name==='state'?[payload,now,now+900000,'00000000-0000-0000-0000-000000000000']:[payload,now]});
 const payloadBytes=Buffer.byteLength(payload),envelopeBytes=Buffer.byteLength(encoded);
 console.log(JSON.stringify({check:'runtime-payload-size',name,payloadBytes,envelopeBytes,withinLimit:payloadBytes<=1950000&&envelopeBytes<=2*1024*1024}));
}
