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
  const views=buttons.map((button,i)=>{
    const scene=new T.Scene();
    scene.add(new T.AmbientLight(0xd3e6ff,.65));
    const key=new T.DirectionalLight(0xf6fbff,3.5);key.position.set(-3,4,5);scene.add(key);
    const rim=new T.DirectionalLight(colours[i],4);rim.position.set(3,-1,-2);scene.add(rim);
    const fill=new T.PointLight(0xffffff,9);fill.position.set(0,-3,3);scene.add(fill);
    const camera=new T.PerspectiveCamera(34,1,.1,30);camera.position.set(0,0,7.3);
    const root=new T.Group();scene.add(root);
    return {scene,camera,root,button,art:button.querySelector('.world-art'),pointer:{x:0,y:0},energy:0,target:0,phase:0};
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
      v.energy+=(v.target-v.energy)*.075;
      const motion=reduce.matches?0:elapsed;
      v.root.rotation.y=(i===2?.2:-.25)+Math.sin(motion*.16+i)*.22+v.pointer.x*.13;
      v.root.rotation.x=(i===2?.75:.2)+Math.sin(motion*.19+i)*.1-v.pointer.y*.1;
      if(i===0)v.root.rotation.z=-.2+motion*.035;
      if(i===1)v.rotor.rotation.z=.1+motion*.055+v.energy*.13;
      if(i===2)v.root.rotation.z=-.4-motion*.035;
      const scale=(i===2?1.18:1)*(1+v.energy*.075);v.root.scale.setScalar(scale);
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
    button.addEventListener('click',()=>{views.forEach((v,j)=>v.target=i===j?1:0);draw(0);});
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
