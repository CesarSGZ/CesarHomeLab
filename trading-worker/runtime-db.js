// Privileged infrastructure RPC. Autonomous role code cannot import this module.
// SQL is matched literally, including predicates and immutable budget checks.
export const runtimeDbLimits=Object.freeze({bodyBytes:16*1024*1024,batchSize:10,payloadBytes:12*1024*1024});
const integer=x=>Number.isSafeInteger(x)&&x>=0;
const amount=x=>typeof x==='number'&&Number.isFinite(x)&&x>=0&&x<=1e6;
const reserve=x=>amount(x)&&x<=10;
const fx=x=>typeof x==='number'&&Number.isFinite(x)&&x>0&&x<=1e6;
const str=max=>x=>typeof x==='string'&&x.length>0&&x.length<=max;
const identity=str(120),day=x=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x),month=x=>typeof x==='string'&&/^\d{4}-\d{2}$/.test(x),monthLike=x=>typeof x==='string'&&/^\d{4}-\d{2}%$/.test(x);
const model=x=>['gpt-6-luna','gpt-6.1-sol'].includes(x),agent=x=>['scout','analyst','risk','operator','auditor','designer'].includes(x);
const oneOf=(...values)=>x=>values.includes(x);
const jsonPayload=x=>{if(typeof x!=='string'||new TextEncoder().encode(x).length>runtimeDbLimits.payloadBytes)return false;try{const p=JSON.parse(x);return !!p&&typeof p==='object'&&!Array.isArray(p);}catch{return false;}};
const resultKey=x=>{if(typeof x!=='string'||x.length>260)return false;try{const p=JSON.parse(x);return Array.isArray(p)&&p.length===2&&p.every(identity);}catch{return false;}};
const errorText=x=>typeof x==='string'&&x.length<=1500;
const nowish=(x,now)=>integer(x)&&Math.abs(x-now)<=5*60e3;
const leaseWindow=(start,end,now)=>nowish(start,now)&&integer(end)&&end>start&&end-start<=900000+1000;
const spec=(sql,params=[],check=()=>true)=>[sql,{params,check}];
const specs=new Map([
 spec('SELECT * FROM trading_state WHERE id=1'),
 spec('SELECT id FROM trading_state WHERE id=1'),
 spec('SELECT lock_until FROM trading_state WHERE id=1'),
 spec('INSERT OR IGNORE INTO trading_state (id,payload,updated_at) VALUES (1,?,?)',[jsonPayload,integer],(p,n)=>nowish(p[1],n)),
 spec('UPDATE trading_state SET lease_token=?,lock_until=? WHERE id=1 AND lock_until<? RETURNING payload',[identity,integer,integer],(p,n)=>leaseWindow(p[2],p[1],n)),
 spec('UPDATE trading_state SET payload=?,updated_at=?,lock_until=? WHERE id=1 AND lease_token=?',[jsonPayload,integer,integer,identity],(p,n)=>leaseWindow(p[1],p[2],n)),
 spec('UPDATE trading_state SET lock_until=0,lease_token=NULL WHERE id=1 AND lease_token=?',[identity]),
 spec('SELECT COALESCE(SUM(actual),0) AS confirmed, COALESCE(SUM(CASE WHEN actual IS NULL THEN reserved ELSE 0 END),0) AS reserved FROM trading_calls'),
 spec('SELECT * FROM trading_budget WHERE day=?',[day]),
 spec('SELECT COALESCE(SUM(actual),0) AS confirmed, COALESCE(SUM(CASE WHEN actual IS NULL THEN reserved ELSE 0 END),0) AS reserved FROM trading_calls WHERE day=?',[day]),
 spec('SELECT * FROM trading_operating_budget WHERE month=?',[month]),
 spec('SELECT COALESCE(SUM(COALESCE(actual,reserved)),0) AS usd, COALESCE(SUM(CASE WHEN day=? THEN COALESCE(actual,reserved) ELSE 0 END),0) AS todayUsd FROM trading_calls WHERE day LIKE ?',[day,monthLike],p=>p[0].startsWith(p[1].slice(0,-1))),
 spec('SELECT COUNT(*) AS n FROM trading_calls WHERE day=? AND model=?',[day,model]),
 spec('INSERT OR IGNORE INTO trading_budget(day) VALUES (?)',[day]),
 spec('UPDATE trading_budget SET spent=spent+?,calls=calls+1 WHERE day=? AND spent+?<=? RETURNING spent',[reserve,day,reserve,reserve],p=>p[0]===p[2]),
 spec('INSERT OR IGNORE INTO trading_operating_budget(month,spent_eur,updated_at) SELECT ?,COALESCE(SUM(COALESCE(actual,reserved)),0)/?,? FROM trading_calls WHERE day LIKE ?',[month,fx,integer,monthLike],(p,n)=>p[3]===p[0]+'%'&&nowish(p[2],n)),
 spec('UPDATE trading_operating_budget SET spent_eur=spent_eur+?,updated_at=? WHERE month=? AND spent_eur+?<=allowance_eur RETURNING spent_eur',[reserve,integer,month,reserve],(p,n)=>p[0]===p[3]&&nowish(p[1],n)),
 spec('UPDATE trading_budget SET spent=MAX(0,spent-?),calls=MAX(0,calls-1) WHERE day=?',[reserve,day]),
 spec('INSERT INTO trading_calls(id,day,model,reserved,status,created_at,eur_reserved,fx_rate,agent) VALUES (?,?,?,?,?,?,?,?,?)',[identity,day,model,reserve,oneOf('reserved'),integer,reserve,fx,agent],(p,n)=>nowish(p[5],n)),
 spec('UPDATE trading_budget SET spent=MAX(0,spent-?+?),input_tokens=input_tokens+?,output_tokens=output_tokens+? WHERE day=?',[reserve,amount,integer,integer,day]),
 spec('UPDATE trading_calls SET actual=?,eur_actual=?,status=? WHERE id=?',[amount,amount,oneOf('complete'),identity]),
 spec('UPDATE trading_operating_budget SET spent_eur=MAX(0,spent_eur-?+?),updated_at=? WHERE month=?',[reserve,amount,integer,month],(p,n)=>nowish(p[2],n)),
 spec('UPDATE trading_calls SET status=? WHERE id=?',[oneOf('uncertain-cost-retained'),identity]),
 spec("SELECT name FROM trading_secrets WHERE name='openai'"),
 spec('SELECT name FROM trading_secrets'),
 spec('SELECT payload FROM trading_status_cache WHERE id=1'),
 spec('SELECT payload,updated_at FROM trading_status_cache WHERE id=1'),
 spec('SELECT id,path,status,completed_at,result FROM trading_command_queue ORDER BY created_at DESC LIMIT 10'),
 spec('INSERT INTO trading_status_cache(id,payload,updated_at) VALUES(1,?,?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload,updated_at=excluded.updated_at',[jsonPayload,integer],(p,n)=>nowish(p[1],n)),
 spec("SELECT * FROM trading_command_queue WHERE status='queued' ORDER BY created_at LIMIT 10"),
 spec("UPDATE trading_command_queue SET status='running' WHERE id=? AND status='queued' RETURNING id",[identity]),
 spec("UPDATE trading_command_queue SET status='queued' WHERE id=? AND status='running'",[identity]),
 spec('UPDATE trading_command_queue SET status=?,completed_at=?,result=? WHERE id=?',[oneOf('complete','failed'),integer,jsonPayload,identity],(p,n)=>nowish(p[1],n)),
 spec("CREATE TABLE IF NOT EXISTS trading_development_results (id TEXT PRIMARY KEY, job_id TEXT NOT NULL, lease_token TEXT NOT NULL, payload TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending', created_at INTEGER NOT NULL, finished_at INTEGER, error TEXT)"),
 spec('INSERT OR IGNORE INTO trading_development_results (id,job_id,lease_token,payload,created_at) VALUES (?,?,?,?,?)',[resultKey,identity,identity,jsonPayload,integer],(p,n)=>p[0]===JSON.stringify([p[1],p[2]])&&nowish(p[4],n)),
 spec('SELECT * FROM trading_development_results WHERE id=?',[resultKey]),
 spec("SELECT * FROM trading_development_results WHERE status='pending' ORDER BY created_at LIMIT ?",[x=>Number.isInteger(x)&&x>=1&&x<=5]),
 spec("UPDATE trading_development_results SET status='complete',finished_at=?,error=NULL WHERE id=? AND status='pending'",[integer,resultKey],(p,n)=>nowish(p[0],n)),
 spec("UPDATE trading_development_results SET status='failed',finished_at=?,error=? WHERE id=? AND status='pending'",[integer,errorText,resultKey],(p,n)=>nowish(p[0],n)),
 spec("SELECT COUNT(*) AS n FROM trading_development_results WHERE status='pending'")
]);
export const runtimeSqlStatements=Object.freeze([...specs.keys()]);
function invalid(message,status=400){const e=Error(message);e.status=status;return e;}
function keysExactly(value,allowed){return !!value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).every(k=>allowed.includes(k));}
export function validateRuntimeDbRequest(body,now=Date.now()){
 const batch=Array.isArray(body?.batch);
 if(!keysExactly(body,batch?['action','batch']:['action','sql','params'])||body.action!=='runtime-db')throw invalid('Formato de RPC fuera de ámbito');
 const rows=batch?body.batch:[body];
 if(!rows.length||rows.length>runtimeDbLimits.batchSize)throw invalid('Lote de RPC fuera de límites');
 return rows.map(row=>{
  if(!keysExactly(row,batch?['sql','params']:['action','sql','params'])||typeof row.sql!=='string')throw invalid('Consulta de RPC inválida');
  const definition=specs.get(row.sql),params=row.params??[];
  if(!definition)throw invalid('Consulta de RPC fuera de la lista permitida');
  if(!Array.isArray(params)||params.length!==definition.params.length||params.some((p,i)=>!definition.params[i](p))||!definition.check(params,now))throw invalid('Parámetros de RPC fuera de límites');
  return {sql:row.sql,params};
 });
}
export async function runtimeDatabase(env,body,{now=Date.now()}={}){
 const rows=validateRuntimeDbRequest(body,now); // Validate the whole batch before executing anything.
 const statements=rows.map(({sql,params})=>env.CONTROL_DB.prepare(sql).bind(...params));
 const result=await env.CONTROL_DB.batch(statements);
 return {ok:true,success:true,result};
}
export async function readRuntimeBody(request,maxBytes=runtimeDbLimits.bodyBytes){
 const length=Number(request.headers.get('content-length')||0);if(length>maxBytes)throw invalid('Petición de RPC demasiado grande',413);
 const reader=request.body?.getReader(),chunks=[];let size=0;
 if(reader)try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>maxBytes){await reader.cancel();throw invalid('Petición de RPC demasiado grande',413);}chunks.push(value);}}finally{reader.releaseLock();}
 const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
 try{return {body:JSON.parse(new TextDecoder().decode(bytes)||'{}'),bytes:size};}catch{throw invalid('JSON de RPC inválido');}
}
