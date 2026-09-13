// Shared validation at both relay and host. Never accept arbitrary browser/OS commands.
export function validateInput(value) {
  if (!value || typeof value !== "object") return null;
  const number = (n,min,max) => Number.isFinite(n) && n>=min && n<=max;
  if (value.type==="pointer" && ["move","down","up"].includes(value.action) && number(value.x,0,1600) && number(value.y,0,1200))
    return {type:"pointer",action:value.action,x:value.x,y:value.y};
  if (value.type==="wheel" && number(value.dx,-1200,1200) && number(value.dy,-1200,1200))
    return {type:"wheel",dx:value.dx,dy:value.dy};
  if (value.type==="text" && typeof value.text==="string" && value.text.length>0 && value.text.length<=12000)
    return {type:"text",text:value.text};
  if (value.type==="key" && ["Enter","Backspace","Delete","Tab","Escape","ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Home","End","PageUp","PageDown"].includes(value.key))
    return {type:"key",key:value.key,shift:value.shift===true};
  if(value.type==="resize" && number(value.width,360,1600) && number(value.height,400,1200))
    return {type:"resize",width:Math.round(value.width),height:Math.round(value.height)};
  if(value.type==="home")return {type:"home"};
  return null;
}
export function shareable(url) {
  try {const u=new URL(url);return u.origin==="https://chatgpt.com"&&!/^\/(auth|login|logout)(\/|$)/.test(u.pathname)}catch{return false}
}
export function allowedNavigation(url,remoteActive=false){
  if(shareable(url))return true;
  if(remoteActive)return false;
  try {const u=new URL(url);return u.protocol==="https:"&&["chatgpt.com","auth.openai.com","auth.chatgpt.com","accounts.google.com","login.microsoftonline.com","login.live.com","appleid.apple.com","account.apple.com"].includes(u.hostname)}catch{return false}
}
export function equalSecret(a,b){
  if(typeof a!=="string"||typeof b!=="string"||a.length!==b.length||a.length<32)return false;
  let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0;
}
