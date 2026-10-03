import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {inflateSync} from 'node:zlib';
import {atlasFrames,spritePlacement,walkingLegs} from '../control/trading-office.js';

// Decode the shipped PNGs using built-in Node modules, so these raster checks
// also run in the cloud without installing an image library.
function png(name){
 const b=readFileSync(new URL('../control/assets/'+name,import.meta.url));let at=8,width,height,channels,raw=[];
 while(at<b.length){const length=b.readUInt32BE(at),kind=b.toString('ascii',at+4,at+8),data=b.subarray(at+8,at+8+length);if(kind==='IHDR'){width=data.readUInt32BE(0);height=data.readUInt32BE(4);assert.equal(data[8],8);assert.equal(data[9],6);channels=4;}if(kind==='IDAT')raw.push(data);at+=length+12;}
 const packed=inflateSync(Buffer.concat(raw)),stride=width*channels,pixels=new Uint8Array(height*stride);let p=0;
 const paeth=(a,b,c)=>{const v=a+b-c,pa=Math.abs(v-a),pb=Math.abs(v-b),pc=Math.abs(v-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c;};
 for(let y=0;y<height;y++){const filter=packed[p++];for(let x=0;x<stride;x++){const i=y*stride+x,a=x>=channels?pixels[i-channels]:0,up=y?pixels[i-stride]:0,c=y&&x>=channels?pixels[i-stride-channels]:0;pixels[i]=(packed[p++]+(filter===0?0:filter===1?a:filter===2?up:filter===3?Math.floor((a+up)/2):paeth(a,up,c)))&255;}}
 return {width,height,pixels};
}
function rowComponents(image,y0,y1){
 const {width:w,pixels}=image,h=y1-y0,mask=new Uint8Array(w*h),queue=new Int32Array(w*h),out=[];
 for(let y=0;y<h;y++)for(let x=0;x<w;x++)mask[y*w+x]=pixels[((y+y0)*w+x)*4+3]>180?1:0;
 for(let n=0;n<mask.length;n++){if(!mask[n])continue;let head=0,tail=1,count=0,minX=w,minY=y1,maxX=0,maxY=y0;queue[0]=n;mask[n]=0;while(head<tail){const k=queue[head++],x=k%w,y=Math.floor(k/w);count++;minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y+y0);maxY=Math.max(maxY,y+y0);for(const next of [x?k-1:-1,x<w-1?k+1:-1,y?k-w:-1,y<h-1?k+w:-1])if(next>=0&&mask[next]){mask[next]=0;queue[tail++]=next;}}if(count>10000)out.push({minX,minY,maxX,maxY,count});}
 return out.sort((a,b)=>(a.minX+a.maxX)-(b.minX+b.maxX));
}
const sheets=[['base','office-staff-v2.png',[0,299,573,948],7],['motion','office-motion-v3.png',[0,338,648,948],7],['actions','office-actions-v3.png',[0,335,627,948],7],['maria','office-maria-v4.png',[0,450,855,1287],3]];

test('every shipped sprite crop contains the complete opaque character including hair, arms and shoes',()=>{
 for(const [name,file,rows,columns] of sheets){const image=png(file),frames=atlasFrames(name);for(let row=0;row<3;row++){const components=rowComponents(image,rows[row],rows[row+1]);assert.equal(components.length,columns,name+' row '+row);for(let col=0;col<columns;col++){const f=frames[row*columns+col],c=components[col],label=name+' '+row+':'+col;assert.ok(f.x>=0&&f.y>=0&&f.x+f.w<=image.width&&f.y+f.h<=image.height,label+' bounds');assert.ok(c.minX>=f.x&&c.maxX<f.x+f.w&&c.minY>=f.y&&c.maxY<f.y+f.h,label+' full silhouette');assert.equal(f.y+f.anchorY,c.maxY+1,label+' shoe anchor');if(row<2)assert.ok(f.y+f.h<=rows[row+1]+2,label+' does not capture next head');}}}
});

test('gesture arms do not shift the actor and directional steps keep a shoe on the floor',()=>{
 const [socialSanti]=atlasFrames('actions').slice(14);assert.ok(socialSanti.anchorX<socialSanti.w/2-15,'anchor is under the body, not the extended arm');
 for(const [name] of sheets)for(const f of atlasFrames(name)){const placement=spritePlacement(f);assert.equal(placement.y+f.anchorY*placement.scale,0);for(const gait of [-2.1,0,2.1]){const legs=walkingLegs(f,placement,gait);assert.ok(legs.strips.every(s=>s.y+s.height<=2*placement.scale+.0001));assert.ok(legs.strips.some(s=>Math.abs(s.y+s.height-(f.h-f.anchorY)*placement.scale)<.0001),'one shoe is grounded');assert.ok(legs.strips.every(s=>Math.abs(s.y-(placement.y+legs.upper))<.0001),'no gap at the waist');}}
});
