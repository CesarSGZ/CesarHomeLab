// Builds dist/: the only directory Cloudflare Pages serves as static assets.
// Allowlist on purpose: anything not listed here (workers, migrations, Python
// engines, video sources, docs, tests, config) stays in the repository only.
// Pages Functions are still bundled from ./functions at the project root, so
// their imports from trading-worker/ and control/ keep working at build time.
import {cpSync,existsSync,mkdirSync,readdirSync,rmSync,statSync} from 'node:fs';
import {dirname,extname,join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=join(dirname(fileURLToPath(import.meta.url)),'..');
const out=join(root,'dist');

export const PUBLIC_DIRECTORIES=['assets','control'];
export const PUBLIC_ROOT_FILES=['_headers','_routes.json'];
export const PUBLIC_ROOT_EXTENSIONS=['.html','.css','.js'];

export function publicRootFiles(directory=root){
  return readdirSync(directory).filter(name=>{
    if(name.startsWith('.')||!statSync(join(directory,name)).isFile())return false;
    return PUBLIC_ROOT_FILES.includes(name)||PUBLIC_ROOT_EXTENSIONS.includes(extname(name));
  }).sort();
}

export function buildPagesDist(){
  rmSync(out,{recursive:true,force:true});
  mkdirSync(out);
  for(const name of publicRootFiles())cpSync(join(root,name),join(out,name));
  for(const name of PUBLIC_DIRECTORIES){
    if(!existsSync(join(root,name)))throw new Error(`missing public directory ${name}`);
    cpSync(join(root,name),join(out,name),{recursive:true});
  }
  return out;
}

if(process.argv[1]===fileURLToPath(import.meta.url)){
  buildPagesDist();
  console.log(`Pages output ready in dist/: ${[...publicRootFiles(),...PUBLIC_DIRECTORIES.map(d=>d+'/')].join(', ')}`);
}
