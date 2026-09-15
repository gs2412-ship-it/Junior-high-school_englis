const $=s=>document.querySelector(s);
let current=0, flipped=false, reviewOnly=false, quizIndex=0, quizAnswered=false, round={ok:0,total:0};
const state=JSON.parse(localStorage.getItem('jhEnglishV2')||'{}');
function filtered(){const g=$('#grade').value,p=$('#pos').value,q=$('#search').value.trim().toLowerCase();return WORDS.filter(x=>(g==='all'||x.grade===g)&&(p==='all'||x.pos===p)&&(!reviewOnly||!state[x.id])&&(!q||[x.word,x.meaning_zh,x.meaning_ja].join(' ').toLowerCase().includes(q)));}
function posZh(p){return {verb:'动词',noun:'名词',adjective:'形容词',adverb:'副词',pronoun:'代词',preposition:'介词',conjunction:'连词'}[p]||p}
function render(){
 const list=filtered();if(current>=list.length)current=0;
 $('#total').textContent=WORDS.length;$('#learned').textContent=Object.values(state).filter(Boolean).length;$('#remaining').textContent=WORDS.length-Object.values(state).filter(Boolean).length;$('#accuracy').textContent=round.total?Math.round(round.ok/round.total*100)+'%':'—';$('#counter').textContent=list.length?`${current+1} / ${list.length}`:'0 / 0';
 if(!list.length){$('#word').textContent='没有符合条件的单词';$('#backWord').textContent='';return}
 const x=list[current];flipped=false;$('#card').classList.remove('flipped');$('#badge').textContent=`${x.grade} · ${posZh(x.pos)}`;$('#word').textContent=x.word;$('#backWord').textContent=x.word;$('#meaning').textContent=x.meaning_zh;$('#ja').textContent=x.meaning_ja;$('#exEn').textContent=x.example_en;$('#exJa').textContent=x.example_ja;
}
function flip(){flipped=!flipped;$('#card').classList.toggle('flipped',flipped)}
$('#card').onclick=e=>{if(e.target!==$('#soundBtn'))flip()};
function speak(word){let u=new SpeechSynthesisUtterance(word);u.lang='en-US';u.rate=.82;speechSynthesis.cancel();speechSynthesis.speak(u)}
$('#soundBtn').onclick=e=>{e.stopPropagation();speak($('#word').textContent)};
$('#knowBtn').onclick=()=>{let l=filtered();if(!l.length)return;state[l[current].id]=true;localStorage.setItem('jhEnglishV2',JSON.stringify(state));round.ok++;round.total++;next()};
$('#wrongBtn').onclick=()=>{let l=filtered();if(!l.length)return;state[l[current].id]=false;localStorage.setItem('jhEnglishV2',JSON.stringify(state));round.total++;next()};
function next(){let l=filtered();current=(current+1)%Math.max(l.length,1);render()}function prev(){let l=filtered();current=(current-1+l.length)%Math.max(l.length,1);render()}
$('#nextBtn').onclick=next;$('#prevBtn').onclick=prev;$('#shuffleBtn').onclick=()=>{let l=filtered();current=l.length?Math.floor(Math.random()*l.length):0;render()};
$('#reviewBtn').onclick=()=>{reviewOnly=!reviewOnly;$('#reviewBtn').textContent=reviewOnly?'⭐ 复习模式':'⭐ 未掌握';current=0;render()};
['grade','pos','search'].forEach(id=>$('#'+id).addEventListener('input',()=>{current=0;render()}));
$('#resetBtn').onclick=()=>{if(confirm('确定清除所有学习记录吗？')){localStorage.removeItem('jhEnglishV2');location.reload()}};
$('#themeBtn').onclick=()=>{document.body.classList.toggle('dark');localStorage.setItem('jhDarkV2',document.body.classList.contains('dark'))};
if(localStorage.getItem('jhDarkV2')==='true')document.body.classList.add('dark');
document.addEventListener('keydown',e=>{if(e.code==='Space'&&document.querySelector('#cards').classList.contains('active')){e.preventDefault();flip()}if(e.code==='ArrowRight')next();if(e.code==='ArrowLeft')prev()});

document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));document.querySelectorAll('.panel').forEach(x=>x.classList.remove('active'));b.classList.add('active');$('#'+b.dataset.tab).classList.add('active');if(b.dataset.tab==='quiz')newQuiz();if(b.dataset.tab==='verbs')renderVerbs()});

function newQuiz(){quizAnswered=false;const x=WORDS[Math.floor(Math.random()*WORDS.length)];quizIndex=x.id;$('#quizWord').textContent=x.word;$('#quizBadge').textContent=`${x.grade} · ${posZh(x.pos)}`;$('#quizResult').textContent='';$('#nextQuiz').style.display='none';$('#quizSound').onclick=()=>speak(x.word);let others=[];while(others.length<3){let y=WORDS[Math.floor(Math.random()*WORDS.length)];if(y.id!==x.id&&!others.some(z=>z.id===y.id))others.push(y)}let arr=[x,...others].sort(()=>Math.random()-.5);$('#choices').innerHTML='';arr.forEach(y=>{let b=document.createElement('button');b.textContent=y.meaning_ja;b.onclick=()=>answerQuiz(b,y.id===x.id,x);$('#choices').appendChild(b)})}
function answerQuiz(btn,ok,x){if(quizAnswered)return;quizAnswered=true;round.total++;document.querySelectorAll('#choices button').forEach(b=>b.disabled=true);if(ok){btn.classList.add('correct');round.ok++;$('#quizResult').textContent='✓ 正解！';state[x.id]=true;localStorage.setItem('jhEnglishV2',JSON.stringify(state))}else{btn.classList.add('incorrect');$('#quizResult').textContent=`✕ 不正解。正解：${x.meaning_ja}`;state[x.id]=false;localStorage.setItem('jhEnglishV2',JSON.stringify(state));[...document.querySelectorAll('#choices button')].find(b=>b.textContent===x.meaning_ja)?.classList.add('correct')}$('#nextQuiz').style.display='inline-block'}
$('#nextQuiz').onclick=newQuiz;
function renderVerbs(){let q=$('#verbSearch').value.trim().toLowerCase();$('#verbBody').innerHTML=IRREGULAR.filter(x=>x.word.includes(q)).map(x=>`<tr><td><b>${x.word}</b></td><td>${x.past}</td><td>${x.pp}</td><td>${x.meaning_zh}</td><td>${x.meaning_ja}</td></tr>`).join('')}
$('#verbSearch').oninput=renderVerbs;render();renderVerbs();
