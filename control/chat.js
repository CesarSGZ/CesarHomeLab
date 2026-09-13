window.RemoteChat=(()=>{
 const el=id=>document.getElementById(id),canvas=el("remote-screen"),context=canvas.getContext("2d");
 let socket,wanted=false,retries=0,ready=false,initialised=false,resizeTimer,lastSize="";
 function state(text,hint,online=false){
  el("remote-state").textContent=text;el("remote-dot").classList.toggle("online",online);
  if(hint){el("remote-hint").textContent=hint;el("remote-overlay").hidden=false}
  ready=online;for(const id of ["remote-home","remote-insert","remote-enter"])el(id).disabled=!online;
 }
 function send(data){if(ready&&socket?.readyState===1)socket.send(JSON.stringify(data))}
 function size(){
  const w=Math.max(360,Math.min(1600,Math.round(el("remote-stage").clientWidth)));
  const h=Math.max(500,Math.min(1000,Math.round(innerHeight*.75)));
  if(socket?.readyState===1&&lastSize!==w+"x"+h){lastSize=w+"x"+h;socket.send(JSON.stringify({type:"resize",width:w,height:h}))}
 }
 function disconnect(){
  wanted=false;socket?.close(1000,"View closed");socket=null;ready=false;
  canvas.width=canvas.width;el("remote-overlay").hidden=false;el("remote-connect").textContent="Connect";
  state("Disconnected","Connect to use the dedicated browser on CesarPC.");
 }
 function connect(){
  wanted=true;socket?.close();lastSize="";state("Connecting…","Establishing your private connection to CesarPC.");
  el("remote-connect").textContent="Disconnect";
  const ws=new WebSocket(location.origin.replace(/^http/,"ws")+"/control/api/remote/connect","remote-v1");socket=ws;ws.binaryType="blob";
  ws.addEventListener("message",async event=>{
   if(socket!==ws)return;
   if(event.data instanceof Blob){
    if(!wanted)return;
    const url=URL.createObjectURL(event.data),image=new Image();
    image.onload=()=>{if(socket===ws&&wanted){if(canvas.width!==image.width||canvas.height!==image.height){canvas.width=image.width;canvas.height=image.height}context.drawImage(image,0,0);el("remote-overlay").hidden=true;state("Connected to CesarPC",null,true);retries=0}URL.revokeObjectURL(url)};
    image.src=url;return;
   }
   let data;try{data=JSON.parse(event.data)}catch{return}
   if(data.type==="connected"){if(!data.hostOnline)state("CesarPC offline","Start the Remote Browser host on CesarPC and keep the computer awake.");size()}
   if(data.type==="offline"){canvas.width=canvas.width;state("CesarPC offline","The host disconnected. The view will resume when CesarPC reconnects.")}
   if(data.type==="status"){
    if(data.paused){canvas.width=canvas.width;state("Sharing paused","Resume sharing from the local Remote Browser control on CesarPC.")}
    else if(!data.ready){canvas.width=canvas.width;state("Local login needed","Open the dedicated ChatGPT browser on CesarPC and complete sign-in there.")}
    else{ready=true;lastSize=data.width+"x"+data.height;size();state("Connected to CesarPC",null,true)}
   }
  });
  ws.addEventListener("close",event=>{
   if(socket!==ws||!wanted)return;
   canvas.width=canvas.width;
   if(event.code===4002){wanted=false;state("Opened elsewhere","Another window is now using this private browser. Press Connect to take over.");el("remote-connect").textContent="Connect";return}
   if(event.code===4001){state("Renewing access…","Refreshing your HomeLab session.");setTimeout(()=>{if(wanted)connect()},500);return}
   if(retries++<3){state("Reconnecting…","Checking the connection to CesarPC.");setTimeout(()=>{if(wanted)connect()},3000)}
   else{wanted=false;el("remote-connect").textContent="Connect";state("Unable to connect","Check that CesarPC is awake and its Remote Browser host is running. Reload HomeLab if your login has expired.")}
  });
  ws.addEventListener("error",()=>{});
 }
 function coordinates(event){const rect=canvas.getBoundingClientRect();return {x:Math.max(0,Math.min(canvas.width,(event.clientX-rect.left)*canvas.width/rect.width)),y:Math.max(0,Math.min(canvas.height,(event.clientY-rect.top)*canvas.height/rect.height))}}
 let lastMove=0;
 canvas.addEventListener("pointerdown",event=>{if(event.button!==0)return;event.preventDefault();canvas.focus();canvas.setPointerCapture(event.pointerId);send({type:"pointer",action:"down",...coordinates(event)})});
 canvas.addEventListener("pointerup",event=>{event.preventDefault();send({type:"pointer",action:"up",...coordinates(event)})});
 canvas.addEventListener("pointermove",event=>{if(Date.now()-lastMove<50)return;lastMove=Date.now();send({type:"pointer",action:"move",...coordinates(event)})});
 canvas.addEventListener("pointercancel",event=>send({type:"pointer",action:"up",...coordinates(event)}));
 canvas.addEventListener("wheel",event=>{event.preventDefault();send({type:"wheel",dx:Math.max(-1200,Math.min(1200,event.deltaX)),dy:Math.max(-1200,Math.min(1200,event.deltaY))})},{passive:false});
 canvas.addEventListener("keydown",event=>{
  if(event.ctrlKey||event.metaKey||event.altKey||event.isComposing)return;
  if(event.key.length===1){event.preventDefault();send({type:"text",text:event.key})}
  else if(["Enter","Backspace","Delete","Tab","Escape","ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Home","End","PageUp","PageDown"].includes(event.key)){if(event.key==="Tab"&&event.shiftKey)return;event.preventDefault();send({type:"key",key:event.key,shift:event.shiftKey})}
 });
 canvas.addEventListener("paste",event=>{event.preventDefault();const text=event.clipboardData.getData("text/plain");if(text.length<=12000)send({type:"text",text})});
 canvas.addEventListener("contextmenu",event=>event.preventDefault());
 el("remote-connect").addEventListener("click",()=>{if(wanted)disconnect();else{retries=0;connect()}});
 el("remote-home").addEventListener("click",()=>send({type:"home"}));
 el("remote-insert").addEventListener("click",()=>{const text=el("remote-text").value;if(text&&ready){send({type:"text",text});el("remote-text").value=""}});
 el("remote-enter").addEventListener("click",()=>send({type:"key",key:"Enter"}));
 el("remote-fullscreen").addEventListener("click",()=>el("remote-stage").requestFullscreen().catch(()=>{}));
 addEventListener("resize",()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(size,300)});
 addEventListener("pagehide",disconnect);
 addEventListener("homelab:view",event=>{if(!initialised)return;if(event.detail==="chat"){if(!wanted)connect()}else if(wanted)disconnect()});
 return {initialise(){initialised=true;if(el("chat").classList.contains("active"))connect()}};
})();
