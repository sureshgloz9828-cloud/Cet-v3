// app.js - सिर्फ लॉजिक: पेज बदलना, क्विज चलाना
let state={view:'home', subject:null, chapter:null, topic:null, qIndex:0, score:0, answered:false};
const viewEl=document.getElementById('view'), titleEl=document.getElementById('pageTitle'), subEl=document.getElementById('pageSubtitle'), searchEl=document.getElementById('search'), emptyEl=document.getElementById('empty'), crumbEl=document.getElementById('breadcrumb');
function setCrumb(){
  if(state.view==='home'){crumbEl.innerHTML=''; return;}
  let h='<b onclick="goHome()">Home</b> > <b onclick="openSubject(\''+state.subject+'\')">'+state.subject+'</b>';
  if(state.chapter) h+=' > <b onclick="openChapter(\''+state.chapter+'\')">'+state.chapter+'</b>';
  if(state.topic) h+=' > '+state.topic;
  crumbEl.innerHTML=h;
}
function goHome(){state={view:'home',subject:null,chapter:null,topic:null,qIndex:0,score:0,answered:false}; render();}
function openSubject(name){state.view='subject'; state.subject=name; state.chapter=null; state.topic=null; render();}
function openChapter(ch){state.view='chapter'; state.chapter=ch; state.topic=null; render();}
function openTopic(tp){state.view='quiz'; state.topic=tp; state.qIndex=0; state.score=0; state.answered=false; renderQuiz();}
function backToChapters(){state.view='subject'; state.chapter=null; state.topic=null; render();}
function backToTopics(){state.view='chapter'; state.topic=null; render();}
function render(){
  setCrumb();
  searchEl.style.display = state.view==='home' ? 'block' : 'none';
  emptyEl.style.display='none';
  viewEl.innerHTML='';
  if(state.view==='home'){
    titleEl.textContent='Choose Your Subject'; subEl.textContent='अपना विषय चुनें, फिर क्विज़ शुरू करें'; subEl.style.display='block';
    const q=(searchEl.value||'').toLowerCase(); let vis=0;
    Object.keys(DATA).forEach(name=>{
      const d=DATA[name]; if(q && !name.toLowerCase().includes(q)) return; vis++;
      const chCount=Object.keys(d.chapters).length;
      viewEl.innerHTML+='<button class="card" style="--c:'+d.color+';--cbg:'+d.bg+'" onclick="openSubject(\''+name+'\')"><span class="symbol">'+d.icon+'</span><span><span class="name">'+name+'</span><div class="small">'+chCount+' चैप्टर • क्विज उपलब्ध</div></span><span class="arrow">›</span></button>';
    });
    emptyEl.style.display = vis?'none':'block';
    return;
  }
  if(state.view==='subject'){
    const d=DATA[state.subject]; titleEl.textContent=state.subject; subEl.textContent='चैप्टर चुनें'; subEl.style.display='block';
    viewEl.innerHTML='<button class="back back-top" onclick="goHome()">← सभी विषय</button>';
    Object.keys(d.chapters).forEach(ch=>{
      const tCount=Object.keys(d.chapters[ch]).length;
      viewEl.innerHTML+='<button class="card" style="--c:'+d.color+';--cbg:'+d.bg+'" onclick="openChapter(\''+ch+'\')"><span class="symbol">📚</span><span><span class="name">'+ch+'</span><div class="small">'+tCount+' टॉपिक • क्विज</div></span><span class="arrow">›</span></button>';
    });
    return;
  }
  if(state.view==='chapter'){
    const d=DATA[state.subject]; titleEl.textContent=state.chapter; subEl.textContent='टॉपिक चुनें और क्विज दें'; subEl.style.display='block';
    viewEl.innerHTML='<button class="back back-top" onclick="backToChapters()">← चैप्टर</button>';
    Object.keys(d.chapters[state.chapter]).forEach(tp=>{
      viewEl.innerHTML+='<button class="card" style="--c:'+d.color+';--cbg:'+d.bg+'" onclick="openTopic(\''+tp+'\')"><span class="symbol">📝</span><span><span class="name">'+tp+'</span><div class="small">5 सवाल • क्विज</div></span><span class="arrow">›</span></button>';
    });
    return;
  }
}
function renderQuiz(){
  setCrumb(); searchEl.style.display='none'; emptyEl.style.display='none';
  const qs=DATA[state.subject].chapters[state.chapter][state.topic];
  titleEl.textContent=state.topic; subEl.textContent=state.subject+' • '+state.chapter; subEl.style.display='block';
  if(state.qIndex>=qs.length){
    viewEl.innerHTML='<div class="quiz-box" style="text-align:center"><h2>🎉 क्विज पूरा!</h2><p style="font-size:32px;font-weight:800">'+state.score+' / '+qs.length+'</p><p>'+Math.round(state.score/qs.length*100)+'% सही</p><p style="color:var(--muted)">बहुत बढ़िया! अगला टॉपिक ट्राई करो।</p><br><button class="back" onclick="openTopic(\''+state.topic+'\')">फिर से प्रयास करें</button> <button class="back" onclick="backToTopics()" style="background:#fff;color:var(--purple);border:1px solid #ddd">← टॉपिक पर वापस</button></div>';
    return;
  }
  const cur=qs[state.qIndex];
  viewEl.innerHTML='<button class="back back-top" onclick="backToTopics()">← टॉपिक</button><div class="quiz-box"><div style="display:flex;justify-content:space-between"><span>सवाल '+(state.qIndex+1)+' / '+qs.length+'</span><span>स्कोर: '+state.score+'</span></div><div class="progress"><i style="width:'+(state.qIndex/qs.length*100)+'%"></i></div><h3 style="line-height:1.5">'+cur.q+'</h3>'+cur.opts.map((o,i)=>'<button class="opt" id="opt'+i+'" onclick="checkAns('+i+')">'+o+'</button>').join('')+'<div class="explain" id="explain"></div><button class="back" id="nextBtn" style="display:none;margin-top:14px" onclick="nextQ()">अगला सवाल →</button></div>';
}
function checkAns(i){
  if(state.answered) return; state.answered=true;
  const qs=DATA[state.subject].chapters[state.chapter][state.topic]; const cur=qs[state.qIndex];
  if(i===cur.ans){state.score++; document.getElementById('opt'+i).classList.add('correct');}
  else {document.getElementById('opt'+i).classList.add('wrong'); document.getElementById('opt'+cur.ans).classList.add('correct');}
  document.getElementById('explain').textContent='💡 '+cur.exp;
  document.getElementById('nextBtn').style.display='block';
}
function nextQ(){state.qIndex++; state.answered=false; renderQuiz();}
searchEl.addEventListener('input',()=>{if(state.view==='home') render();});
document.getElementById('menuBtn').addEventListener('click',()=>document.getElementById('drawer').classList.add('open'));
document.getElementById('closeBtn').addEventListener('click',()=>document.getElementById('drawer').classList.remove('open'));
document.getElementById('drawer').addEventListener('click',e=>{if(e.target.id==='drawer') e.target.classList.remove('open');});
document.querySelectorAll('.drawer-link').forEach(a=>a.addEventListener('click',()=>{document.getElementById('drawer').classList.remove('open'); goHome();}));
document.getElementById('themeBtn').addEventListener('click',()=>{document.body.classList.toggle('dark'); document.getElementById('themeIcon').textContent=document.body.classList.contains('dark')?'☀':'☾';});
render();
