import test from 'node:test';
import assert from 'node:assert/strict';
import {validateInput} from '../remote-browser/protocol.mjs';
import {UploadReceiver} from '../remote-browser/uploads.mjs';
test('uploads restrict size, names, formats and chunks',()=>{
 const start={type:'upload',action:'start',id:'test',name:'notes.pdf',size:4};
 assert.ok(validateInput(start));
 for(const change of [{size:11*1024*1024},{name:'../notes.pdf'},{name:'run.exe'},{size:-1}])assert.equal(validateInput({...start,...change}),null);
 assert.equal(validateInput({type:'upload',action:'chunk',id:'test',data:'!!!!'}),null);
});
test('transfer attaches only complete data and clears memory',async()=>{
 let received;
 const receiver=new UploadReceiver(async f=>{received=Buffer.from(f.buffer).toString()});
 await receiver.receive({action:'start',id:'a',name:'notes.txt',size:4});
 await receiver.receive({action:'chunk',id:'a',data:Buffer.from('test').toString('base64')});
 assert.equal((await receiver.receive({action:'finish',id:'a'})).complete,true);
 assert.equal(received,'test');assert.equal(receiver.current,null);
 await receiver.receive({action:'start',id:'a',name:'notes.txt',size:2});
 assert.equal((await receiver.receive({action:'chunk',id:'a',data:'dGVzdA=='})).ok,false);
 assert.equal(receiver.current,null);
});
