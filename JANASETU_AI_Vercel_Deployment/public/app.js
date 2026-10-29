const API="/api";
const $=s=>document.querySelector(s);let allServices=[];let adminToken="";
function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2800)}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
async function request(path,opts={}){const r=await fetch(API+path,{headers:{"Content-Type":"application/json"},...opts});const data=await r.json().catch(()=>({error:"Unexpected server response."}));if(!r.ok)throw new Error(data.error||"Request failed");return data}
function renderServices(){const q=$("#serviceSearch").value.toLowerCase();const cat=$("#categoryFilter").value;const rows=allServices.filter(s=>(!cat||s.category===cat)&&(!q||[s.title,s.category,s.description,s.documents].join(" ").toLowerCase().includes(q)));$("#serviceGrid").innerHTML=rows.length?rows.map(s=>'<article class="servicecard"><div class="serviceicon">'+esc(s.icon||"◎")+'</div><span class="category">'+esc(s.category)+'</span><h3>'+esc(s.title)+'</h3><p>'+esc(s.description)+'</p><a href="'+(s.official_url?esc(s.official_url):"#assistant")+'" target="'+(s.official_url?"_blank":"_self")+'" rel="noopener">'+(s.official_url?"Open official resource ↗":"Ask Janasetu ↗")+'</a><small style="margin-top:10px;color:#85918a;font-size:9px">Reviewed: '+esc(s.reviewed_on||"Not recorded")+'</small></article>').join(""):'<div class="loading">No matching services. Try a broader search or ask the assistant.</div>'}
async function loadServices(){try{const d=await request("/services");allServices=d.services||[];const cats=[...new Set(allServices.map(s=>s.category))].sort();$("#categoryFilter").innerHTML='<option value="">All categories</option>'+cats.map(c=>'<option>'+esc(c)+'</option>').join("");renderServices()}catch(e){$("#serviceGrid").innerHTML='<div class="loading">Service directory could not load. Check database setup and refresh.</div>'}}
$("#serviceSearch").addEventListener("input",renderServices);$("#categoryFilter").addEventListener("change",renderServices);
function addBubble(text,who="bot",sources=[]){const d=document.createElement("div");d.className="bubble "+who;d.textContent=text;$("#chatlog").appendChild(d);if(sources.length){const s=document.createElement("div");s.className="bubble bot";s.innerHTML="<b>Sources to check</b><br>"+sources.map(x=>x.url?'<a target="_blank" rel="noopener" href="'+esc(x.url)+'">'+esc(x.title)+' ↗</a>':'<span>'+esc(x.title)+'</span>').join("<br>")+"<br><small>Verify current requirements on the official site.</small>";$("#chatlog").appendChild(s)}$("#chatlog").scrollTop=$("#chatlog").scrollHeight}
$("#chatForm").addEventListener("submit",async e=>{e.preventDefault();const input=$("#chatInput"),message=input.value.trim();if(!message)return;input.value="";addBubble(message,"user");const loading=document.createElement("div");loading.className="bubble bot";loading.textContent="Checking the service directory…";$("#chatlog").appendChild(loading);try{const d=await request("/assistant",{method:"POST",body:JSON.stringify({message})});loading.remove();addBubble(d.answer||"I couldn't verify that answer.","bot",d.sources||[])}catch(err){loading.remove();addBubble(err.message+" Browse the service directory or prepare a demo grievance below.")}});
document.querySelectorAll("[data-prompt]").forEach(b=>b.addEventListener("click",()=>{$("#chatInput").value=b.dataset.prompt;$("#chatInput").focus()}));

/* English/Telugu interface toggle for the grievance form. */
let interfaceLanguage="en";
const grievanceCopy={
 en:{eyebrow:"03 / PREPARE A GRIEVANCE",heading:'Turn a concern into a <em>clear request.</em>',intro:"Complete the form to create a demo record with a unique tracking reference. Do not enter Aadhaar numbers, passwords, bank details or other sensitive personal information.",noteTitle:"Demo transparency",note:"Submitting here creates a record in this prototype only. It does not send a complaint to a government department.",subject:"Subject",subjectPlaceholder:"Briefly describe the issue",description:"What happened?",descriptionPlaceholder:"Include what happened and when. Avoid sensitive personal details.",category:"Category",chooseCategory:"Choose category",location:"District / locality",locationPlaceholder:"Optional",department:"Suggested department",departmentPlaceholder:"Optional — can be reviewed by staff",submit:"Create demo grievance ↗",toggle:"తెలుగు / EN"},
 te:{eyebrow:"03 / ఫిర్యాదును సిద్ధం చేయండి",heading:'మీ సమస్యను <em>స్పష్టమైన అభ్యర్థనగా</em> మార్చండి.',intro:"ప్రత్యేక ట్రాకింగ్ నంబర్‌తో డెమో రికార్డును సృష్టించడానికి ఫారమ్‌ను పూరించండి. ఆధార్ నంబర్లు, పాస్‌వర్డ్‌లు, బ్యాంక్ వివరాలు లేదా ఇతర సున్నితమైన వ్యక్తిగత సమాచారాన్ని నమోదు చేయవద్దు.",noteTitle:"డెమో గురించి",note:"ఇక్కడ సమర్పించిన వివరాలు ఈ నమూనా వ్యవస్థలో మాత్రమే నమోదు అవుతాయి. ప్రభుత్వ శాఖకు ఫిర్యాదు పంపబడదు.",subject:"విషయం",subjectPlaceholder:"సమస్యను సంక్షిప్తంగా వివరించండి",description:"ఏం జరిగింది?",descriptionPlaceholder:"ఏం జరిగింది, ఎప్పుడు జరిగిందో వివరించండి. సున్నితమైన వ్యక్తిగత వివరాలను ఇవ్వవద్దు.",category:"వర్గం",chooseCategory:"వర్గాన్ని ఎంచుకోండి",location:"జిల్లా / ప్రాంతం",locationPlaceholder:"ఐచ్ఛికం",department:"సూచించిన శాఖ",departmentPlaceholder:"ఐచ్ఛికం — సిబ్బంది పరిశీలించవచ్చు",submit:"డెమో ఫిర్యాదును నమోదు చేయండి ↗",toggle:"EN / తెలుగు"}
};
function setInterfaceLanguage(language){
 interfaceLanguage=language;
 const c=grievanceCopy[language];
 const section=$("#submit");
 if(!section)return;
 section.querySelector(".eyebrow").textContent=c.eyebrow;
 section.querySelector("h2").innerHTML=c.heading;
 section.querySelector(".muted").textContent=c.intro;
 section.querySelector(".note b").textContent=c.noteTitle;
 section.querySelector(".note p").textContent=c.note;
 const labels=section.querySelectorAll(".formcard > label");
 labels[0].childNodes[0].textContent=c.subject;
 labels[0].querySelector("input").placeholder=c.subjectPlaceholder;
 labels[1].childNodes[0].textContent=c.description;
 labels[1].querySelector("textarea").placeholder=c.descriptionPlaceholder;
 const row=section.querySelector(".formrow");
 row.querySelectorAll("label")[0].childNodes[0].textContent=c.category;
 row.querySelector("select option[value='']").textContent=c.chooseCategory;
 row.querySelectorAll("label")[1].childNodes[0].textContent=c.location;
 row.querySelectorAll("input")[0].placeholder=c.locationPlaceholder;
 labels[2].childNodes[0].textContent=c.department;
 labels[2].querySelector("input").placeholder=c.departmentPlaceholder;
 section.querySelector("button[type='submit']").textContent=c.submit;
 $("#langBtn").textContent=c.toggle;
 document.documentElement.lang=language==="te"?"te":"en";
}
$("#langBtn").addEventListener("click",()=>setInterfaceLanguage(interfaceLanguage==="en"?"te":"en"));

$("#grievanceForm").addEventListener("submit",async e=>{e.preventDefault();const form=e.currentTarget;const payload=Object.fromEntries(new FormData(form).entries());const msg=$("#formMessage");msg.textContent="Creating your demo record…";try{const d=await request("/grievances",{method:"POST",body:JSON.stringify(payload)});msg.innerHTML='Created successfully. Your demo reference is <b>'+esc(d.grievance.reference)+'</b>. Save this reference. To recover it later, use the same mobile number and your private 8-digit lookup PIN. <button type="button" id="trackNow" class="ghost">Track now</button><br><small>DEMO ONLY — no government department was contacted. Your PIN is not displayed or recoverable.</small>';$("#trackNow").addEventListener("click",()=>{$("#trackRef").value=d.grievance.reference;$("#trackForm").requestSubmit();$("#track").scrollIntoView({behavior:"smooth"})});form.reset();toast("Demo grievance saved")}catch(err){msg.textContent=err.message}});
async function track(){const ref=$("#trackRef").value.trim().toUpperCase();const out=$("#trackResult");out.innerHTML="";try{const d=await request("/grievance/"+encodeURIComponent(ref));const g=d.grievance;out.innerHTML='<div class="trackcard"><div class="tracktop"><div><small style="color:#718278">REFERENCE</small><h3>'+esc(g.reference)+'</h3><b>'+esc(g.subject)+'</b></div><span class="status">'+esc(g.status)+'</span></div><p style="font-size:11px;color:#687b76">'+esc(g.category)+' · '+esc(g.location||"Location not supplied")+'</p><p style="font-size:10px;color:#9a683f">DEMO RECORD — not submitted to a government department.</p><div class="timeline">'+(d.history||[]).map(h=>'<div class="event"><b>'+esc(h.status)+'</b><small>'+esc(h.note)+' · '+new Date(h.created_at).toLocaleString()+'</small></div>').join("")+'</div></div>'}catch(err){out.innerHTML='<div class="trackcard">'+esc(err.message)+'</div>'}}
$("#trackForm").addEventListener("submit",e=>{e.preventDefault();track()});
$("#lookupForm").addEventListener("submit",async e=>{e.preventDefault();const out=$("#lookupResult");const button=e.currentTarget.querySelector("button[type='submit']");button.disabled=true;out.textContent="Searching your demo records…";try{const d=await request("/grievance-lookup",{method:"POST",body:JSON.stringify({phone:$("#lookupPhone").value.trim(),pin:$("#lookupPin").value})});out.innerHTML='<p>'+esc(d.message)+'</p><div class="adminlist">'+d.grievances.map(g=>'<div class="adminitem"><div><b>'+esc(g.reference)+'</b><p>'+esc(g.subject)+' · '+esc(g.status)+' · '+new Date(g.created_at).toLocaleDateString()+'</p></div><button type="button" class="ghost" data-reference="'+esc(g.reference)+'">Track</button></div>').join("")+'</div>';out.querySelectorAll("[data-reference]").forEach(b=>b.addEventListener("click",()=>{$("#trackRef").value=b.dataset.reference;$("#trackForm").requestSubmit();$("#trackResult").scrollIntoView({behavior:"smooth",block:"nearest"})}));$("#lookupPin").value=""}catch(err){out.textContent=err.message;$("#lookupPin").value=""}finally{button.disabled=false}});
$("#adminBtn").addEventListener("click",async()=>{
 if(!adminToken){const entered=window.prompt("Admin token (configured by the project owner in Vercel):");if(!entered)return;adminToken=entered}
 const panel=$("#adminPanel");panel.hidden=false;panel.innerHTML='<div class="loading">Loading demo records…</div>';
 try{
  const d=await request("/grievances",{headers:{"x-admin-token":adminToken}});
  panel.innerHTML='<div class="adminlist">'+(d.grievances||[]).map(g=>'<div class="adminitem"><div><b>'+esc(g.subject)+'</b><p>'+esc(g.reference)+' · '+esc(g.category)+' · '+esc(g.status)+'</p></div><div><select data-ref="'+esc(g.reference)+'">'+["Submitted","Under Review","In Progress","Action Required","Resolved","Closed"].map(s=>'<option '+(s===g.status?"selected":"")+'>'+s+'</option>').join("")+'</select><button class="ghost saveStatus" data-ref="'+esc(g.reference)+'">Save</button></div></div>').join("")||"No demo grievances yet."+'</div><p style="font-size:10px;color:#9a683f">Authenticated demonstration admin workspace. Do not use with real or sensitive citizen data.</p>';
  panel.querySelectorAll(".saveStatus").forEach(b=>b.addEventListener("click",async()=>{
   const ref=b.dataset.ref,status=panel.querySelector('select[data-ref="'+ref+'"]').value;
   try{await request("/grievance/"+encodeURIComponent(ref),{method:"PATCH",headers:{"x-admin-token":adminToken},body:JSON.stringify({status,note:"Status updated in demo admin workspace."})});toast("Demo status updated");$("#trackRef").value=ref;await track();b.textContent="Saved"}
   catch(err){toast(err.message);if(err.message.includes("Admin authentication"))adminToken=""}
  }));
 }catch(err){panel.innerHTML='<div class="trackcard">'+esc(err.message)+'</div>';if(err.message.includes("Admin authentication"))adminToken=""}
});

/* Optional browser speech recognition: only recognized text is sent to the assistant. */
function setupVoiceInput(buttonId, locale, languageLabel) {
 const button=document.getElementById(buttonId);if(!button)return;
 button.addEventListener("click",()=>{
  const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;
  const status=document.getElementById("micStatus"),input=document.getElementById("chatInput");
  if(!SpeechRecognition){status.textContent="Voice input is not supported in this browser. Try the latest Chrome browser or type your question.";return}
  const recognition=new SpeechRecognition();recognition.lang=locale;recognition.continuous=false;recognition.interimResults=false;recognition.maxAlternatives=1;
  button.classList.add("listening");button.disabled=true;status.textContent="Listening in "+languageLabel+"… Please speak now.";
  recognition.onresult=event=>{const transcript=event.results?.[0]?.[0]?.transcript||"";if(transcript){input.value=input.value.trim()?input.value.trim()+" "+transcript:transcript;input.focus();status.textContent="Voice captured. Review your question, then press Get guidance."}else status.textContent="I couldn't hear that clearly. Please try again."};
  recognition.onerror=event=>{const messages={"not-allowed":"Microphone permission was denied. Allow microphone access in your browser settings.","no-speech":"No speech detected. Please try speaking a little louder.","network":"Speech recognition needs an internet connection in this browser. You can type your question instead."};status.textContent=messages[event.error]||"Voice input failed. Please try again or type your question."};
  recognition.onend=()=>{button.classList.remove("listening");button.disabled=false};
  try{recognition.start()}catch(_){button.classList.remove("listening");button.disabled=false;status.textContent="Couldn't start the microphone. Please try again."}
 });
}
setupVoiceInput("micTelugu","te-IN","Telugu");
setupVoiceInput("micEnglish","en-IN","English");
