import {readFileSync} from 'node:fs';
import {homedir} from 'node:os';
export function cloudDatabase({config,fetcher=fetch}={}){
 config??=readFileSync(homedir()+'/.config/.wrangler/config/default.toml','utf8');
 const token=config.match(/oauth_token\s*=\s*"([^"]+)"/)?.[1];if(!token)throw Error('Falta autenticación del controlador');
 const endpoint='https://api.cloudflare.com/client/v4/accounts/dc66931243377cb773c0a9aa355cad15/d1/database/799a8dfb-7cea-47a9-9e47-79b767013be4/query';
 const query=async body=>{const r=await fetcher(endpoint,{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(45000)});const j=await r.json();if(!r.ok||!j.success||j.result?.some(x=>!x.success))throw Error('D1 remoto HTTP '+r.status+' '+String(j.errors?.[0]?.message||'consulta rechazada').slice(0,100));return j.result;};
 const prepare=(sql,params=[])=>({sql,params,bind(...p){return prepare(sql,p);},async first(column){const row=(await query({sql,params}))[0].results?.[0]||null;return column?row?.[column]??null:row;},async all(){return (await query({sql,params}))[0];},async run(){return (await query({sql,params}))[0];}});
 return {prepare,batch:statements=>query({batch:statements.map(({sql,params})=>({sql,params}))})};
}
