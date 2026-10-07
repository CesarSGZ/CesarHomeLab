import * as T from './assets/vendor/three.module.min.js';

// One lazy-loaded canvas, three scissored views, no textures or external requests.
export function mountWorlds(atlas) {
  const host=atlas.querySelector('#world-canvas');
  const gallery=atlas.querySelector('.worlds');
  const buttons=[...gallery.querySelectorAll('.world')];
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));
  renderer.setClearColor(0x000000,0);
  renderer.outputColorSpace=T.SRGBColorSpace;
  renderer.toneMapping=T.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.1;
  host.append(renderer.domElement);
  const colours=[0xd5e99a,0x83d7ed,0xbba8f1];
  const metal=colour=>new T.MeshStandardMaterial({color:colour,metalness:.48,roughness:.3,emissive:colour,emissiveIntensity:.065});
  const luminous=colour=>new T.MeshBasicMaterial({color:colour});
  const tube=(curve,radius,material,segments=160)=>new T.Mesh(new T.TubeGeometry(curve,segments,radius,6,false),material);
  // Soft additive glow generated on a canvas (still no external textures).
  const haloTexture=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');const grd=g.createRadialGradient(64,64,0,64,64,64);grd.addColorStop(0,'rgba(255,255,255,1)');grd.addColorStop(.25,'rgba(255,255,255,.35)');grd.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=grd;g.fillRect(0,0,128,128);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t;})();
  const halo=(colour,size)=>{const s=new T.Sprite(new T.SpriteMaterial({map:haloTexture,color:colour,transparent:true,opacity:.35,blending:T.AdditiveBlending,depthWrite:false}));s.scale.setScalar(size);return s;};
  const dotsMaterial=(colour,size,opacity=.85)=>new T.PointsMaterial({color:colour,size,transparent:true,opacity,blending:T.AdditiveBlending,depthWrite:false,map:haloTexture,alphaTest:.01});
  const views=buttons.map((button,i)=>{
    const scene=new T.Scene();
    scene.add(new T.AmbientLight(0xd3e6ff,.65));
    const key=new T.DirectionalLight(0xf6fbff,3.5);key.position.set(-3,4,5);scene.add(key);
    const rim=new T.DirectionalLight(colours[i],4);rim.position.set(3,-1,-2);scene.add(rim);
    const fill=new T.PointLight(0xffffff,9);fill.position.set(0,-3,3);scene.add(fill);
    const camera=new T.PerspectiveCamera(34,1,.1,30);camera.position.set(0,0,7.3);
    const root=new T.Group();scene.add(root);
    const glow=halo(colours[i],3.2);glow.position.z=-.6;scene.add(glow);
    return {scene,camera,root,glow,button,art:button.querySelector('.world-art'),pointer:{x:0,y:0},smooth:{x:0,y:0},energy:0,target:0,kick:0,clock:0,update:null};
  });

  // Management: an orbital assembly. Independent paths around one shared centre.
  {
    const root=views[0].root,mat=metal(0xb8ce7d),light=luminous(0xe6fac0);
    const centre=new T.Mesh(new T.IcosahedronGeometry(.42,2),metal(0xe5f0cd));root.add(centre);
    const shell=new T.Mesh(new T.IcosahedronGeometry(.55,1),new T.MeshBasicMaterial({color:0xd5e99a,wireframe:true,transparent:true,opacity:.22}));root.add(shell);
    for(let i=0;i<4;i++){
      const orbit=new T.Group();orbit.rotation.set(.45+i*.55,.25+i*.8,i*.5);
      const ring=new T.Mesh(new T.TorusGeometry(.86+i*.13,.034+(i%2)*.013,10,160),mat);orbit.add(ring);
      const thin=new T.Mesh(new T.TorusGeometry(.96+i*.13,.005,5,160),light);orbit.add(thin);
      for(let j=0;j<3;j++){
        const a=j*Math.PI*2/3+i*.8;
        const point=new T.Mesh(new T.SphereGeometry(j===0?.075:.035,12,12),j===0?light:mat);
        point.position.set(Math.cos(a)*(.86+i*.13),Math.sin(a)*(.86+i*.13),0);orbit.add(point);
      }
      root.add(orbit);
    }
    root.rotation.set(.2,-.25,-.2);
    // Satellites travel each orbit; they speed up as the discipline gains energy.
    const satellites=[];
    root.children.filter(child=>child.isGroup).forEach((orbit,i)=>{
      for(let j=0;j<2;j++){
        const sat=new T.Mesh(new T.SphereGeometry(.045,12,12),luminous(0xf3ffd6));
        sat.add(halo(0xd5e99a,.42));orbit.add(sat);
        satellites.push({sat,r:.86+i*.13,a:j*Math.PI+i,s:(i%2?-1:1)*(.55+i*.18)});
      }
    });
    const starPos=[];for(let k=0;k<160;k++){const u=Math.random()*2-1,a=Math.random()*Math.PI*2,rad=1.7+Math.random()*1.1,s=Math.sqrt(1-u*u);starPos.push(rad*s*Math.cos(a),rad*s*Math.sin(a),rad*u);}
    const starGeo=new T.BufferGeometry();starGeo.setAttribute('position',new T.Float32BufferAttribute(starPos,3));
    const stars=new T.Points(starGeo,dotsMaterial(0xe6fac0,.06,.55));root.add(stars);
    views[0].update=(t,v)=>{satellites.forEach(o=>{const a=o.a+t*o.s;o.sat.position.set(Math.cos(a)*o.r,Math.sin(a)*o.r,0);});stars.material.opacity=.35+.25*Math.sin(t*1.7)+v.energy*.3;centre.rotation.y=t*.4;shell.rotation.x=t*.25;shell.material.opacity=.18+v.energy*.25;};
  }

  // Engineering: precision-built turbine blades, hub, and concentric tolerance rings.
  {
    const root=views[1].root,bladeMat=metal(0x5dbbda),edgeMat=metal(0xcee9ef);
    const body=new T.Group();body.rotation.set(.38,-.42,.1);root.add(body);
    const shape=new T.Shape();shape.moveTo(.28,-.045);shape.bezierCurveTo(.52,-.1,.79,-.21,1.12,-.07);shape.lineTo(1.16,.09);shape.bezierCurveTo(.77,-.035,.52,.08,.3,.09);shape.closePath();
    const geo=new T.ExtrudeGeometry(shape,{depth:.07,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.014,bevelThickness:.014,curveSegments:12});
    for(let i=0;i<22;i++){
      const blade=new T.Mesh(geo,bladeMat);blade.rotation.z=i*Math.PI*2/22;blade.rotation.x=.25;body.add(blade);
    }
    const hub=new T.Mesh(new T.ConeGeometry(.29,.65,48),edgeMat);hub.rotation.x=Math.PI/2;hub.position.z=.27;body.add(hub);
    [1.21,1.28].forEach((r,i)=>body.add(new T.Mesh(new T.TorusGeometry(r,i?.009:.036,8,160),i?luminous(0x83d7ed):edgeMat)));
    for(let i=0;i<44;i++){
      const a=i*Math.PI*2/44;
      const tick=new T.Mesh(new T.BoxGeometry(.035,.006,.006),luminous(0x83d7ed));tick.position.set(Math.cos(a)*1.38,Math.sin(a)*1.38,0);tick.rotation.z=a;body.add(tick);
    }
    const rear=new T.Mesh(new T.TorusGeometry(.62,.011,6,100),luminous(0x83d7ed));rear.position.z=-.3;root.add(rear);
    views[1].rotor=body;
    // Airflow: a spiral stream pulled through the fan; it spools up on hover.
    const flowCount=420,flow=new Float32Array(flowCount*3),seeds=[];
    for(let k=0;k<flowCount;k++){seeds.push({rad:.25+Math.random()*1.05,a:Math.random()*Math.PI*2,z:Math.random()*5-2.5,sp:.6+Math.random()*.8});}
    const flowGeo=new T.BufferGeometry();flowGeo.setAttribute('position',new T.BufferAttribute(flow,3));
    const air=new T.Points(flowGeo,dotsMaterial(0xbdf0ff,.085,.85));air.rotation.copy(body.rotation);root.add(air);
    views[1].update=(t,v,dt)=>{
      const speed=1+v.energy*5+v.kick*6;
      seeds.forEach((s,k)=>{s.z+=dt*s.sp*speed;if(s.z>2.5)s.z-=5;s.a+=dt*(.6+v.energy*3)*(1.6-s.rad*.6);
        const pinch=1-Math.max(0,.45-Math.abs(s.z))*.5;flow[k*3]=Math.cos(s.a)*s.rad*pinch;flow[k*3+1]=Math.sin(s.a)*s.rad*pinch;flow[k*3+2]=s.z;});
      flowGeo.attributes.position.needsUpdate=true;air.material.opacity=.5+v.energy*.45;
    };
  }

  // Data: a continuous field of flowing filaments; structure emerging from signals.
  {
    const root=views[2].root;
    const positions=[];
    for(let j=0;j<42;j++){
      const phase=j/42*Math.PI*2;
      const points=[];
      for(let k=0;k<=110;k++){
        const t=k/110*Math.PI*2;
        const r=.8+.25*Math.cos(t*3+phase);
        const x=r*Math.cos(t), y=r*Math.sin(t), z=.25*Math.sin(t*3+phase)+.36*Math.sin(phase);
        points.push(new T.Vector3(x,y,z));
        if(k%5===0&&j%3===0)positions.push(x,y,z);
      }
      const curve=new T.CatmullRomCurve3(points);
      const color=new T.Color().setHSL(.71+j/420,.5,.48+j/180);
      root.add(tube(curve,j%7===0?.009:.0035,new T.MeshBasicMaterial({color,transparent:true,opacity:j%7===0?.95:.65}),110));
    }
    const particles=new T.BufferGeometry();particles.setAttribute('position',new T.Float32BufferAttribute(positions,3));
    root.add(new T.Points(particles,new T.PointsMaterial({color:0xeadfff,size:.024,transparent:true,opacity:.8})));
    root.scale.setScalar(1.18);root.rotation.set(.75,.2,-.4);
    // Signal pulses running along a subset of filaments.
    const pulses=[];
    for(let j=0;j<42;j+=3){
      const phase=j/42*Math.PI*2,points=[];
      for(let k=0;k<=110;k++){const t=k/110*Math.PI*2,r=.8+.25*Math.cos(t*3+phase);points.push(new T.Vector3(r*Math.cos(t),r*Math.sin(t),.25*Math.sin(t*3+phase)+.36*Math.sin(phase)));}
      const curve=new T.CatmullRomCurve3(points,true);
      const dot=new T.Mesh(new T.SphereGeometry(.03,10,10),luminous(0xf4ecff));dot.add(halo(0xbba8f1,.35));root.add(dot);
      pulses.push({dot,curve,o:j/42,s:.05+((j*7)%5)*.012});
    }
    views[2].update=(t,v)=>{pulses.forEach(p=>{p.dot.position.copy(p.curve.getPointAt((p.o+t*p.s*(1+v.energy*3))%1));p.dot.scale.setScalar(1+v.energy*.8);});};
  }

  let visible=false,frame=0,last=0,elapsed=0,disposed=false;
  const size={w:0,h:0};
  function resize(){
    const r=gallery.getBoundingClientRect();size.w=r.width;size.h=r.height;
    renderer.setSize(size.w,size.h,false);draw(0);
  }
  function draw(delta){
    if(disposed||!size.w)return;
    renderer.setScissorTest(false);renderer.clear();renderer.setScissorTest(true);
    const bounds=gallery.getBoundingClientRect();
    views.forEach((v,i)=>{
      const rect=v.art.getBoundingClientRect();
      const x=rect.left-bounds.left,y=size.h-(rect.bottom-bounds.top),w=rect.width,h=rect.height;
      renderer.setViewport(x,y,w,h);renderer.setScissor(Math.max(0,x),Math.max(0,y),w,h);
      v.camera.aspect=w/h;v.camera.position.z=w<160?8.7:5.8;v.camera.updateProjectionMatrix();
      v.energy+=(v.target-v.energy)*.075;v.kick*=.9;
      v.smooth.x+=(v.pointer.x-v.smooth.x)*.08;v.smooth.y+=(v.pointer.y-v.smooth.y)*.08;
      if(!reduce.matches)v.clock+=(delta||0)*(1+v.energy*1.8+v.kick*3);
      const motion=reduce.matches?0:v.clock;
      v.update?.(motion,v,reduce.matches?0:(delta||0));
      v.glow.material.opacity=.18+v.energy*.42+v.kick*.4;v.glow.scale.setScalar(3+v.energy*.8+v.kick*1.2);
      v.root.rotation.y=(i===2?.2:-.25)+Math.sin(motion*.16+i)*.22+v.smooth.x*.38;
      v.root.rotation.x=(i===2?.75:.2)+Math.sin(motion*.19+i)*.1-v.smooth.y*.3;
      if(i===0)v.root.rotation.z=-.2+motion*.035;
      if(i===1)v.rotor.rotation.z=.1+motion*.055+v.energy*.13;
      if(i===2)v.root.rotation.z=-.4-motion*.035;
      const scale=(i===2?1.18:1)*(1+v.energy*.09+v.kick*.14);v.root.scale.setScalar(scale);
      v.root.position.y=Math.sin(motion*.6+i)*.025;
      renderer.render(v.scene,v.camera);
    });
  }
  function tick(now){
    if(!visible||document.hidden||disposed){frame=0;return;}
    frame=requestAnimationFrame(tick);
    if(now-last<33)return;
    const delta=Math.min((now-last)/1000,.06);last=now;
    if(!reduce.matches)elapsed+=delta;
    draw(delta);
  }
  function start(){if(!frame&&visible&&!document.hidden&&!reduce.matches)frame=requestAnimationFrame(tick);else draw(0);}
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;start();},{rootMargin:'100px'});observer.observe(gallery);
  const resizer=new ResizeObserver(resize);resizer.observe(gallery);
  buttons.forEach((button,i)=>{
    button.addEventListener('pointermove',e=>{if(reduce.matches)return;const r=button.getBoundingClientRect();views[i].pointer={x:(e.clientX-r.left)/r.width*2-1,y:(e.clientY-r.top)/r.height*2-1};views[i].target=1;});
    button.addEventListener('pointerleave',()=>{views[i].pointer={x:0,y:0};views[i].target=0;});
    button.addEventListener('click',()=>{views.forEach((v,j)=>v.target=i===j?1:0);views[i].kick=1;draw(0);});
  });
  atlas.addEventListener('signalchange',event=>{
    const index=['programme','engineering','data'].indexOf(event.detail.category);
    views.forEach((v,i)=>{v.target=i===index?.8:0;});draw(0);
  });
  document.addEventListener('visibilitychange',start);
  reduce.addEventListener('change',()=>{if(reduce.matches){cancelAnimationFrame(frame);frame=0;}start();});
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();disposed=true;cancelAnimationFrame(frame);atlas.classList.remove('has-webgl');});
  resize();atlas.classList.add('has-webgl');start();
}
