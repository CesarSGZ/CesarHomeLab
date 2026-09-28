import {userCan} from '../../../_lib/auth.js';
import {json,methodNotAllowed} from '../../../_lib/http.js';
import {activeFiles,REPOSITORY,BRANCH} from '../../../../control/galaxy-model.js';

// Read-only and fixed to this public repository. No user-supplied upstream URL.
export async function onRequest(context) {
  if(context.request.method!=='GET')return methodNotAllowed(['GET']);
  const session=context.data.session;
  if(!session)return json({ok:false,error:'not_authenticated'},{status:401});
  if(!userCan(session.user,'github:read'))return json({ok:false,error:'github_not_authorized'},{status:403});
  const cache=globalThis.caches?.default;
  const key=new Request(new URL('/__internal/galaxy-current-v2',context.request.url));
  const cached=await cache?.match(key);
  if(cached)return json({...await cached.json(),cacheAgeSeconds:Math.max(0,Math.round((Date.now()-Date.parse(cached.headers.get('x-checked-at')))/1000))});
  async function github(path){
    const headers={accept:'application/vnd.github+json','user-agent':'CesarHomeLab-Galaxy','x-github-api-version':'2026-03-10'};
    if(context.env.GITHUB_READ_TOKEN)headers.authorization='Bearer '+context.env.GITHUB_READ_TOKEN;
    const response=await fetch('https://api.github.com/repos/'+REPOSITORY+path,{headers,signal:AbortSignal.timeout(10000)});
    if(!response.ok)throw new Error(response.status===403||response.status===429?'github_rate_limited':'github_unavailable');
    return response.json();
  }
  try{
    const commits=await github('/commits?sha='+BRANCH+'&per_page=6');
    if(!commits.length)throw new Error('empty_repository');
    const sha=commits[0].sha;
    const [tree,runs]=await Promise.all([
      github('/git/trees/'+sha+'?recursive=1'),
      github('/actions/workflows/deploy.yml/runs?branch='+BRANCH+'&per_page=1').catch(()=>null)
    ]);
    if(tree.truncated)throw new Error('incomplete_tree');
    const run=runs?.workflow_runs?.[0];
    const data={ok:true,schema:2,source:'github',repo:REPOSITORY,branch:BRANCH,sha,checkedAt:new Date().toISOString(),
      files:activeFiles(tree.tree.filter(file=>file.type==='blob')),
      commits:commits.map(commit=>({sha:commit.sha,date:commit.commit.author.date,message:commit.commit.message.split('\n')[0],author:commit.commit.author.name})),
      deployment:run?{status:run.status,conclusion:run.conclusion,sha:run.head_sha,url:run.html_url,updatedAt:run.updated_at}:null};
    if(cache){const response=new Response(JSON.stringify(data),{headers:{'content-type':'application/json','cache-control':'public,max-age=90','x-checked-at':data.checkedAt}});context.waitUntil(cache.put(key,response));}
    return json(data);
  }catch(error){return json({ok:false,error:error.message==='github_rate_limited'?error.message:'github_unavailable'},{status:503});}
}
