import * as T from '../assets/vendor/three.module.min.js';

export function mountSculptures(view,systems){
  const map=view.querySelector('#galaxy-map');
  const host=document.createElement('div');host.className='galaxy-sculptures';host.setAttribute('aria-hidden','true');map.prepend(host);
  const renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.setClearColor(0,0);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;host.append(renderer.domElement);
  const scenes=systems.map((system,index)=>{
    const scene=new T.Scene(),root=new T.Group();scene.add(root);
    scene.add(new T.AmbientLight(0xdbeafa,.8));
    const light=new T.DirectionalLight(0xf6fbff,3.8);light.position.set(-2,3,4);scene.add(light);
    const rim=new T.DirectionalLight(system.colour,5);rim.position.set(3,-1,-2);scene.add(rim);
    const camera=new T.PerspectiveCamera(35,1,.1,20);camera.position.z=5.2;
    const metal=new T.MeshStandardMaterial({color:system.colour,metalness:.38,roughness:.28,emissive:system.colour,emissiveIntensity:.06});
    const line=new T.MeshBasicMaterial({color:system.colour});
    const wire=new T.LineBasicMaterial({color:system.colour,transparent:true,opacity:.65});
    const mesh=(geo,material=metal)=>{const m=new T.Mesh(geo,material);root.add(m);return m;};
    const ring=(r=.8,t=.025)=>mesh(new T.TorusGeometry(r,t,8,80),line);
    if(system.id==='source'){
      mesh(new T.IcosahedronGeometry(.6,0));root.add(new T.LineSegments(new T.EdgesGeometry(new T.IcosahedronGeometry(.88,0)),wire));ring(1.04,.009).rotation.x=.9;
    }else if(system.id==='deploy'){
      mesh(new T.TorusKnotGeometry(.52,.13,80,10,2,3));ring(1,.007).rotation.y=.7;
    }else if(system.id==='edge'){
      mesh(new T.IcosahedronGeometry(.72,2),new T.MeshStandardMaterial({color:0x16364e,metalness:.5,roughness:.25}));
      root.add(new T.LineSegments(new T.EdgesGeometry(new T.IcosahedronGeometry(.74,2)),new T.LineBasicMaterial({color:system.colour,transparent:true,opacity:.5})));
      for(let i=0;i<3;i++){const r=ring(1+i*.09,.012);r.rotation.set(i*.7,.4+i*.6,i*.3);}
      for(let i=0;i<8;i++){const a=i*Math.PI/4,s=mesh(new T.SphereGeometry(.025,8,8),line);s.position.set(Math.cos(a)*1.1,Math.sin(a)*1.1,0);}
    }else if(system.id==='portfolio'){
      mesh(new T.OctahedronGeometry(.6,0));for(let i=0;i<2;i++){const r=ring(.9+i*.13,.025);r.rotation.set(.5+i*.7,.4+i,.2);}
    }else if(system.id==='portal'){
      root.add(new T.LineSegments(new T.EdgesGeometry(new T.DodecahedronGeometry(.95)),wire));mesh(new T.DodecahedronGeometry(.46));
    }else if(system.id==='api'){
      for(let i=0;i<3;i++){const r=ring(.55+i*.17,.05);r.rotation.y=i*.62;r.rotation.x=i*.4;}mesh(new T.SphereGeometry(.18,16,16),line);
    }else if(system.id==='database'){
      for(let i=0;i<3;i++){const c=mesh(new T.CylinderGeometry(.65,.65,.14,40));c.position.y=(i-1)*.4;const r=ring(.65,.013);r.rotation.x=Math.PI/2;r.position.y=(i-1)*.4+.08;}
    }else{
      for(let i=0;i<3;i++){const cube=mesh(new T.BoxGeometry(1.12,.24,.65));cube.position.y=(i-1)*.38;const dot=mesh(new T.SphereGeometry(.035,8,8),line);dot.position.set(-.39,cube.position.y,.35);}
    }
    root.rotation.set(.25,.4,-.12);
    return {scene,root,camera,id:system.id,art:view.querySelector('[data-node="'+system.id+'"] .galaxy-node-art'),index};
  });
  let visible=false,frame=0,last=0,time=0,width=0,height=0,selected='edge',lost=false;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const moving=()=>visible&&!document.hidden&&view.classList.contains('active')&&!view.classList.contains('galaxy-paused')&&!reduce.matches&&!lost;
  function draw(){
    if(!width||lost)return;
    renderer.setScissorTest(false);renderer.clear();renderer.setScissorTest(true);const base=map.getBoundingClientRect();
    scenes.forEach(s=>{
      const r=s.art.getBoundingClientRect();if(!r.width)return;
      const padding=14,x=r.left-base.left-padding,y=height-(r.bottom-base.top)-padding,w=r.width+padding*2,h=r.height+padding*2;
      renderer.setViewport(x,y,w,h);renderer.setScissor(Math.max(0,x),Math.max(0,y),w,h);s.camera.aspect=w/h;s.camera.updateProjectionMatrix();
      s.root.rotation.y=.4+time*(s.id==='edge'?.11:.16)+s.index*.3;s.root.rotation.x=.3+Math.sin(time*.4+s.index)*.13;
      s.root.scale.setScalar(s.id===selected?1.12:1);renderer.render(s.scene,s.camera);
    });
  }
  function tick(now){frame=0;if(!moving())return;frame=requestAnimationFrame(tick);if(now-last<40)return;time+=Math.min((now-last)/1000,.05);last=now;draw();}
  function start(){if(moving()&&!frame)frame=requestAnimationFrame(tick);else draw();}
  function resize(){const r=map.getBoundingClientRect();width=r.width;height=r.height;if(width&&height)renderer.setSize(width,height,false);draw();start();}
  new ResizeObserver(resize).observe(map);new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;start();}).observe(map);
  view.addEventListener('galaxy:highlight',event=>{selected=event.detail;draw();});view.addEventListener('galaxy:motion',start);
  addEventListener('homelab:view',()=>{resize();start();});document.addEventListener('visibilitychange',start);reduce.addEventListener('change',start);
  renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();lost=true;cancelAnimationFrame(frame);view.classList.remove('galaxy-webgl');});
  resize();view.classList.add('galaxy-webgl');start();
}
