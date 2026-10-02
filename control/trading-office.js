export function office(canvas,getState,onSelect){
  const ctx=canvas.getContext('2d');canvas.width=460;canvas.height=300;
  const desks=[[1.8,2.1],[4.5,1.6],[7,2.6],[5.6,5.2],[2.3,5.5]];
  const iso=(x,y,z=0)=>[245+(x-y)*22,47+(x+y)*11-z*22];
  function poly(points,color){ctx.fillStyle=color;ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();ctx.fill();}
  function cube(x,y,w,d,h,color,side='#53616c',front='#394854'){
    poly([iso(x,y,h),iso(x+w,y,h),iso(x+w,y+d,h),iso(x,y+d,h)],color);
    poly([iso(x,y+d,h),iso(x+w,y+d,h),iso(x+w,y+d),iso(x,y+d)],side);
    poly([iso(x+w,y,h),iso(x+w,y+d,h),iso(x+w,y+d),iso(x+w,y)],front);
  }
  function plant(x,y){cube(x,y,.45,.45,.45,'#b99379','#9e7761','#795a49');const [px,py]=iso(x+.2,y+.2,.5);for(const [dx,dy,c] of [[-4,-12,'#629473'],[2,-19,'#80ad87'],[-8,-23,'#97c393'],[5,-28,'#6da381']]){ctx.fillStyle=c;ctx.fillRect(Math.round(px+dx),Math.round(py+dy),7,14);}}
  let last=0,frame=0;let hit=[];
  function draw(time){frame=requestAnimationFrame(draw);if(time-last<90||!canvas.closest('.view')?.classList.contains('active')||document.hidden)return;last=time;
    const state=getState();if(!state)return;ctx.clearRect(0,0,460,300);ctx.imageSmoothingEnabled=false;
    poly([iso(-.3,-.3),iso(9.4,-.3),iso(9.4,7.7),iso(-.3,7.7)],'#0c131b');
    cube(0,0,9,7,.22,'#53616e','#35414d','#293541');
    for(let x=0;x<9;x++)for(let y=0;y<7;y++)poly([iso(x,y,.23),iso(x+1,y,.23),iso(x+1,y+1,.23),iso(x,y+1,.23)],(x+y)%2?'#64727c':'#6a7881');
    poly([iso(0,0),iso(9,0),iso(9,0,3),iso(0,0,3)],'#7b8897');
    poly([iso(0,0),iso(0,7),iso(0,7,3),iso(0,0,3)],'#667487');
    for(let x=1;x<7;x+=2){poly([iso(x,.01,1),iso(x+1.5,.01,1),iso(x+1.5,.01,2.6),iso(x,.01,2.6)],'#26394e');poly([iso(x+.1,.02,1.2),iso(x+1.4,.02,1.2),iso(x+1.4,.02,2.4),iso(x+.1,.02,2.4)],'#77a4bf');poly([iso(x+.75,.03,1.2),iso(x+.82,.03,1.2),iso(x+.82,.03,2.4),iso(x+.75,.03,2.4)],'#a4bdcb');}
    poly([iso(.01,2,1),iso(.01,4.5,1),iso(.01,4.5,2.5),iso(.01,2,2.5)],'#283946');
    const [bx,by]=iso(.02,2.3,1.5);ctx.fillStyle='#a7caa5';ctx.fillRect(Math.round(bx)-40,Math.round(by)-18,20,3);ctx.fillRect(Math.round(bx)-35,Math.round(by)-25,3,8);ctx.fillRect(Math.round(bx)-31,Math.round(by)-32,3,10);
    cube(.3,.5,.5,1.2,1.3,'#d1b59a','#927e73','#655c5a');for(let i=0;i<4;i++){const [x,y]=iso(.5,.65+i*.25,1.1);ctx.fillStyle=['#a6bc91','#aaa0cb','#8bb8c5','#dbc3a3'][i];ctx.fillRect(Math.round(x),Math.round(y)-8,5,10);}
    poly([iso(2,3.2,.24),iso(6,3.2,.24),iso(6,5.7,.24),iso(2,5.7,.24)],'#897e9a');
    plant(.6,6.3);plant(8,.5);plant(8,6.3);
    hit=[];desks.forEach(([x,y],i)=>{
      const a=state.agents[i];const working=a?.status==='trabajando'&&!a.paused;
      cube(x,y,1.7,.9,.95,'#d4bc9e','#a8937e','#867362');
      cube(x+.35,y+.12,.8,.12,1.65,'#1c2e39','#2e414d','#1b2a36');
      const [sx,sy]=iso(x+.7,y+.2,1.5);ctx.fillStyle=a?.paused?'#72808a':a?.color||'#b6a4e8';ctx.fillRect(Math.round(sx)-7,Math.round(sy)-2,10,2);ctx.fillRect(Math.round(sx)-7,Math.round(sy)+2,working?6+Math.floor(time/400)%4:6,2);
      const [kx,ky]=iso(x+.8,y+.65,1);ctx.fillStyle='#6c7680';ctx.fillRect(Math.round(kx)-8,Math.round(ky)-1,15,3);
      cube(x+1.35,y+.35,.15,.15,1.1,'#e1dbcc','#aca797','#aaa596');
      const [px,py]=iso(x+.75,y+1.15,.3);ctx.fillStyle='#354758';ctx.fillRect(Math.round(px)-8,Math.round(py)-12,16,17);
      const bob=working&&!matchMedia('(prefers-reduced-motion: reduce)').matches?Math.floor(time/500)%2:0;
      ctx.fillStyle=a?.color||'#b6a4e8';ctx.fillRect(Math.round(px)-6,Math.round(py)-19+bob,12,12);ctx.fillStyle='#e9bc9f';ctx.fillRect(Math.round(px)-5,Math.round(py)-28+bob,10,9);ctx.fillStyle=['#493f44','#4d4240','#50374d','#343a44','#714f49'][i];ctx.fillRect(Math.round(px)-5,Math.round(py)-31+bob,10,4);ctx.fillRect(Math.round(px)-6,Math.round(py)-27+bob,3,6);ctx.fillStyle='#26313c';ctx.fillRect(Math.round(px)+1,Math.round(py)-24+bob,2,2);
      ctx.fillStyle='#243443';ctx.fillRect(Math.round(px)-5,Math.round(py)-7,4,6);ctx.fillRect(Math.round(px)+2,Math.round(py)-7,4,6);
      if(working){ctx.fillStyle='#e6d4ff';for(let k=0;k<3;k++)ctx.fillRect(Math.round(px)-5+k*5,Math.round(py)-40,2,2);}
      if(a?.paused){ctx.fillStyle='#dbbf97';ctx.fillRect(Math.round(px)-4,Math.round(py)-40,2,5);ctx.fillRect(Math.round(px)+1,Math.round(py)-40,2,5);}
      hit.push({x:px,y:py-14,id:a?.id});
      ctx.fillStyle='#1e2c3beb';ctx.fillRect(Math.round(px)-22,Math.round(py)+11,44,12);ctx.font='7px monospace';ctx.textAlign='center';ctx.fillStyle=a?.color||'#eee';ctx.fillText(a?.name||'',Math.round(px),Math.round(py)+19);
    });
    cube(7.6,5,1,.8,.55,'#8e9baa','#647385','#526171');cube(7.7,5.1,.8,.6,1,'#bfc8d2','#8e9bac','#6c7b8b');
    ctx.textAlign='left';ctx.font='7px monospace';ctx.fillStyle='#9eacbb';ctx.fillText(state.mode==='demo'?'SIMULATION OFFICE / NO API COST':'RESEARCH OFFICE / LOCAL PAPER LEDGER',15,280);ctx.fillStyle='#c4b0f2';ctx.fillRect(15,290,4,4);ctx.fillStyle='#9eacbb';ctx.fillText('VERA > NICO > ADA > LEO > IRIS',25,294);
  }
  canvas.addEventListener('click',event=>{const r=canvas.getBoundingClientRect(),x=(event.clientX-r.left)*460/r.width,y=(event.clientY-r.top)*300/r.height;const nearest=hit.map(p=>({...p,d:Math.hypot(p.x-x,p.y-y)})).sort((a,b)=>a.d-b.d)[0];if(nearest?.d<30)onSelect(nearest.id);});
  frame=requestAnimationFrame(draw);return ()=>cancelAnimationFrame(frame);
}
