import {execFileSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {activeFiles,REPOSITORY,BRANCH} from '../control/galaxy-model.js';

const root=process.cwd();
const git=args=>execFileSync('git',args,{cwd:root,encoding:'utf8',maxBuffer:16*1024*1024}).trim();
const files=activeFiles(git(['ls-tree','-r','--name-only','HEAD']).split(/\r?\n/));
const commits=git(['log','-6','--format=%H%x1f%aI%x1f%aN%x1f%s']).split(/\r?\n/).map(line=>{
  const [sha,date,author,message]=line.split('\x1f');return {sha,date,author,message};
});
const snapshot={ok:true,schema:2,source:'deployment-snapshot',repo:REPOSITORY,branch:BRANCH,
  sha:git(['rev-parse','HEAD']),checkedAt:new Date().toISOString(),files,commits,deployment:null};
mkdirSync(join(root,'control/data'),{recursive:true});
writeFileSync(join(root,'control/data/github-galaxy.json'),JSON.stringify(snapshot)+'\n');
console.log('Built current-branch Galaxy snapshot: '+files.length+' active source files. Historical trees are not replayed.');
