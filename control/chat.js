/* Private same-origin chat: no provider credentials or rendered HTML are retained client-side. */
window.MissionChat=(()=>{
  let csrf="",ready=false,busy=false,current=null,records=[],loadSequence=0;
  const el=id=>document.getElementById(id);
  function node(tag,className,text){const n=document.createElement(tag);if(className)n.className=className;if(text)n.textContent=text;return n}
  function feedback(text,error=false){el("chat-feedback").textContent=text;el("chat-feedback").classList.toggle("error",error)}
  function setBusy(value){
    busy=value;el("chat-send").disabled=busy||!ready;el("chat-send").textContent=busy?"Thinking…":"Send ↗";
    el("chat-input").readOnly=busy;el("chat-new").disabled=busy;el("chat-delete").disabled=busy;
    el("chat-messages").setAttribute("aria-busy",String(busy));
    el("chat-conversations").querySelectorAll("button").forEach(button=>button.disabled=busy);
  }
  async function api(path,method="GET",body){
    const response=await fetch("/control/api/chat/"+path,{method,credentials:"same-origin",cache:"no-store",
      headers:{accept:"application/json",...(method!=="GET"?{"content-type":"application/json","x-csrf-token":csrf}:{})},
      ...(body!==undefined?{body:JSON.stringify(body)}:{})});
    let data;try{data=await response.json()}catch{throw Error("The service is temporarily unavailable. Please reload this page.")}
    if(!response.ok||!data.ok)throw Error(data.error||"Request could not be completed.");
    return data;
  }
  function empty(){
    const box=node("div","chat-empty");box.append(node("span","chat-empty-star","✦"),node("h3","","A little space for your next idea."),node("p","",ready?"Start with a question, a draft or a problem. Your conversations are saved privately to your account.":"Connect an OpenAI API key above to start. No separate OpenAI login is needed on this device."));
    el("chat-messages").replaceChildren(box);
  }
  function renderMessages(messages){
    if(!messages.length){empty();return}
    el("chat-messages").replaceChildren();
    messages.forEach(item=>{
      const article=node("article","chat-message "+item.role);
      article.append(node("span","chat-speaker",item.role==="user"?"YOU":"OPENAI"));
      article.append(node("div","chat-message-text",item.content));
      if(item.role==="assistant"){
        const copy=node("button","chat-copy","Copy");copy.type="button";
        copy.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(item.content);copy.textContent="Copied";setTimeout(()=>copy.textContent="Copy",1800)}catch{feedback("Select the response text and copy it manually.",true)}});
        article.append(copy);
      }
      el("chat-messages").append(article);
    });
    el("chat-messages").scrollTop=el("chat-messages").scrollHeight;
  }
  async function list(){
    const data=await api("conversations");el("chat-conversations").replaceChildren();
    if(!data.conversations.length)el("chat-conversations").append(node("p","chat-history-empty","Your conversations will appear here."));
    data.conversations.forEach(item=>{
      const button=node("button","chat-history-item",item.title);button.type="button";button.disabled=busy;
      button.classList.toggle("active",item.id===current);button.setAttribute("aria-current",item.id===current?"true":"false");
      button.addEventListener("click",()=>open(item.id).catch(error=>feedback(error.message,true)));
      el("chat-conversations").append(button);
    });
    return data.conversations;
  }
  async function open(id){
    if(busy)return;
    const sequence=++loadSequence;
    const data=await api("conversations?id="+encodeURIComponent(id));
    if(sequence!==loadSequence)return;
    current=id;records=data.messages;el("chat-title").textContent=data.conversation.title;
    el("chat-delete").hidden=false;el("chat-input").value="";feedback("");renderMessages(records);await list();
  }
  async function configure(){
    const state=await api("config");ready=state.ready;setBusy(busy);
    el("chat-connection-state").textContent=ready?"Connected · GPT-5 mini":"API key required";
    el("chat-settings").open=!ready;
    el("chat-api-key").disabled=!state.canConfigure;
    el("chat-config-form").querySelector('[type="submit"]').disabled=!state.canConfigure;
    el("chat-disconnect").disabled=!ready||state.environmentKey;
    if(!state.canConfigure&&!ready)feedback("The server encryption secret needs configuring before you can connect a key.",true);
    if(state.environmentKey)el("chat-connection-state").textContent="Connected · server-managed key";
    if(!records.length)empty();
  }
  el("chat-config-form").addEventListener("submit",async event=>{
    event.preventDefault();const button=event.currentTarget.querySelector('[type="submit"]');button.disabled=true;
    try{
      feedback("Validating your connection…");
      await api("config","POST",{apiKey:el("chat-api-key").value});
      el("chat-api-key").value="";await configure();feedback("Connected. API usage is billed to your OpenAI project.");
    }catch(error){feedback(error.message,true)}finally{button.disabled=false}
  });
  el("chat-disconnect").addEventListener("click",async()=>{
    if(busy){feedback("Wait for the current reply before disconnecting.",true);return}
    if(!confirm("Remove the saved OpenAI API key? Your conversation history will remain."))return;
    try{await api("config","DELETE",{});await configure();feedback("Saved connection removed.")}catch(error){feedback(error.message,true)}
  });
  el("chat-new").addEventListener("click",async()=>{
    if(busy)return;++loadSequence;current=null;records=[];el("chat-title").textContent="New conversation";
    el("chat-input").value="";el("chat-delete").hidden=true;feedback("");empty();
    try{await list()}catch(error){feedback(error.message,true)}el("chat-input").focus();
  });
  el("chat-delete").addEventListener("click",async()=>{
    if(!current||busy||!confirm("Permanently delete this conversation from HomeLab?"))return;
    try{await api("conversations","DELETE",{id:current});el("chat-new").click()}catch(error){feedback(error.message,true)}
  });
  el("chat-input").addEventListener("keydown",event=>{
    if(event.key==="Enter"&&!event.shiftKey&&!event.isComposing&&innerWidth>700){event.preventDefault();el("chat-send-form").requestSubmit()}
  });
  el("chat-send-form").addEventListener("submit",async event=>{
    event.preventDefault();const message=el("chat-input").value.trim();if(!ready||busy||!message)return;
    ++loadSequence;setBusy(true);feedback("Thinking…");
    try{
      if(!current){const data=await api("conversations","POST",{});current=data.conversation.id;el("chat-delete").hidden=false}
      renderMessages([...records,{role:"user",content:message}]);
      const data=await api("message","POST",{conversationId:current,message,requestId:crypto.randomUUID()});
      records.push({role:"user",content:message},{role:"assistant",content:data.answer});
      el("chat-input").value="";renderMessages(records);el("chat-title").textContent=records[0].content.slice(0,70);feedback("");
      try{await list()}catch{feedback("Reply saved. The conversation list will refresh next time you open it.")}
    }catch(error){renderMessages(records);feedback(error.message,true)}
    finally{setBusy(false)}
  });
  return {async initialise(options){
    csrf=options.csrfToken;
    try{await configure();const rows=await list();if(rows.length)await open(rows[0].id);else empty()}catch(error){feedback(error.message,true)}
  }};
})();
