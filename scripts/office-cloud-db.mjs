import {readFileSync} from 'node:fs';
import {homedir} from 'node:os';
export function cloudDatabase({config,fetcher=fetch,sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms))}={}){
 config??=readFileSync(homedir()+'/.config/.wrangler/config/default.toml','utf8');
 const token=config.match(/oauth_token\s*=\s*"([^"]+)"/)?.[1];if(!token)throw Error('Falta autenticación del controlador');
 const endpoint='https://api.cloudflare.com/client/v4/accounts/dc66931243377cb773c0a9aa355cad15/d1/database/799a8dfb-7cea-47a9-9e47-79b767013be4/query';
 const query=async body=>{const statements=body.batch||[body],readOnly=statements.every(({sql})=>/^\s*SELECT\b/i.test(sql)&&!sql.trim().replace(/;$/,'').includes(';'));
 for(let attempt=0;attempt<4;attempt++){let r,j;
  try{r=await fetcher(endpoint,{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(45000)});j=await r.json();}
  catch(error){
   const transient=['TimeoutError','AbortError'].includes(error.name)||error instanceof TypeError||r?.status>=500;
   if(!readOnly||!transient||attempt===3)throw error;
   await sleep(2000*2**attempt);continue;
  }
  // A newly renewed OAuth token can briefly be rejected by the D1 authorization
  // edge. Retry only explicit authorization rejection, never uncertain writes.
  if(r.status===403&&attempt<3){await sleep(2000*2**attempt);continue;}
  // Reads can be safely repeated after a timeout or server rejection. Mutations
  // must retain uncertain outcomes, including lease acquisition and book writes.
  if(readOnly&&(r.status===429||r.status>=500)&&attempt<3){await sleep(2000*2**attempt);continue;}
  if(!r.ok||!j.success||j.result?.some(x=>!x.success))throw Error('D1 remoto HTTP '+r.status+' '+String(j.errors?.[0]?.message||'consulta rechazada').slice(0,100));return j.result;
 }};
 const prepare=(sql,params=[])=>({sql,params,bind(...p){return prepare(sql,p);},async first(column){const row=(await query({sql,params}))[0].results?.[0]||null;return column?row?.[column]??null:row;},async all(){return (await query({sql,params}))[0];},async run(){return (await query({sql,params}))[0];}});
 return {prepare,batch:statements=>query({batch:statements.map(({sql,params})=>({sql,params}))})};
}
