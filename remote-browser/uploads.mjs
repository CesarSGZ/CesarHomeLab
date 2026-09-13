// One bounded, short-lived in-memory transfer. Never writes a user file to disk.
export class UploadReceiver {
 constructor(attach){this.attach=attach;this.current=null;}
 clear(){if(this.current){for(const b of this.current.chunks)b.fill(0);clearTimeout(this.current.timer)}this.current=null;}
 async receive(input){
  const reply={type:"upload-result",id:input.id,ok:true};
  try{
   if(input.action==="cancel"){this.clear();return reply}
   if(input.action==="start"){
    this.clear();this.current={id:input.id,name:input.name,size:input.size,received:0,chunks:[],timer:setTimeout(()=>this.clear(),120000)};return reply;
   }
   const u=this.current;if(!u||u.id!==input.id)throw Error("Transfer expired. Please select the file again.");
   if(input.action==="chunk"){
    const chunk=Buffer.from(input.data,"base64");
    if(u.received+chunk.length>u.size)throw Error("File size mismatch.");
    u.chunks.push(chunk);u.received+=chunk.length;return reply;
   }
   if(u.received!==u.size)throw Error("Incomplete transfer. Please try again.");
   const buffer=Buffer.concat(u.chunks);
   const ext=u.name.split('.').pop().toLowerCase();
   const mime={pdf:'application/pdf',txt:'text/plain',csv:'text/csv',json:'application/json',md:'text/markdown',png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',webp:'image/webp',docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',xlsx:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',pptx:'application/vnd.openxmlformats-officedocument.presentationml.presentation'}[ext];
   try{await this.attach({name:u.name,mimeType:mime||"application/octet-stream",buffer})}finally{buffer.fill(0);this.clear()}
   return {...reply,complete:true};
  }catch(error){this.clear();return {...reply,ok:false,message:error.message}}
 }
}
