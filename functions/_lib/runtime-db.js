// Puente SQL de los ejecutores en la nube (Backtest Lab y robot de IBKR paper, desde GitHub
// Actions): lista cerrada de sentencias con parámetros validados. El SQL se compara literalmente.
export const runtimeDbLimits=Object.freeze({bodyBytes:16*1024*1024,batchSize:10,payloadBytes:12*1024*1024});
const oneOf=(...values)=>x=>values.includes(x);
const jsonPayload=x=>{if(typeof x!=='string'||new TextEncoder().encode(x).length>runtimeDbLimits.payloadBytes)return false;try{const p=JSON.parse(x);return !!p&&typeof p==='object'&&!Array.isArray(p);}catch{return false;}};
const isoString=x=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}T[\d:.]+Z$/.test(x);
const isoNowish=(x,now)=>isoString(x)&&Math.abs(Date.parse(x)-now)<=5*60e3;
// Resultados (<1,5 MB, cabe en una fila de D1) y estado de la petición lanzada desde la web.
const backtestPayload=x=>jsonPayload(x)&&new TextEncoder().encode(x).length<=1_500_000;
const backtestRequest=x=>jsonPayload(x)&&x.length<=20000;
const spec=(sql,params=[],check=()=>true)=>[sql,{params,check}];
const specs=new Map([
 spec("SELECT payload,updated_at FROM personal_datasets WHERE name='backtest-lab-request'"),
 spec("UPDATE personal_datasets SET payload=?,updated_at=? WHERE name='backtest-lab-request' AND json_extract(payload,'$.status')=? RETURNING payload",[backtestRequest,isoString,oneOf('queued','running')],(p,n)=>isoNowish(p[1],n)),
 spec("INSERT INTO personal_datasets(name,payload,updated_at) VALUES('backtest-lab',?,?) ON CONFLICT(name) DO UPDATE SET payload=excluded.payload,updated_at=excluded.updated_at",[backtestPayload,isoString],(p,n)=>isoNowish(p[1],n)),
 spec("SELECT payload,updated_at FROM personal_datasets WHERE name='ibkr-paper'"),
 spec("SELECT payload,updated_at FROM personal_datasets WHERE name='ibkr-paper-libro'"),
 spec("INSERT INTO personal_datasets(name,payload,updated_at) VALUES('ibkr-paper-libro',?,?) ON CONFLICT(name) DO UPDATE SET payload=excluded.payload,updated_at=excluded.updated_at",[backtestPayload,isoString],(p,n)=>isoNowish(p[1],n)),
 spec("INSERT INTO personal_datasets(name,payload,updated_at) VALUES('ibkr-paper',?,?) ON CONFLICT(name) DO UPDATE SET payload=excluded.payload,updated_at=excluded.updated_at",[backtestPayload,isoString],(p,n)=>isoNowish(p[1],n))
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
