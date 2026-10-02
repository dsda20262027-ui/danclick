const KEY="danclick-v3",OLD="danclick-v2";
const old=JSON.parse(localStorage.getItem(OLD)||"null")||{};
let data=JSON.parse(localStorage.getItem(KEY)||"null")||{
 coins:old.coins||Number(localStorage.getItem("danclick-score"))||0,clicks:old.clicks||Number(localStorage.getItem("danclick-clicks"))||0,best:old.best||0,
 power:old.power||0,auto:old.auto||0,multi:old.multi||0,crit:0,prestige:0,crystals:0,combo:0,lastClick:0,
 skin:"classic",sound:true,lastBonus:"",dailyStreak:0
};
const $=s=>document.querySelector(s), costs={power:25,auto:100,multi:500,crit:750};
const skins=[
 {id:"classic",name:"Classic",cost:0,bg:"#42e695",shadow:"#15945b"},
 {id:"neon",name:"Neon",cost:10,bg:"#d94cff",shadow:"#7b16a3"},
 {id:"fire",name:"Fire",cost:25,bg:"#ff7a3d",shadow:"#a93413"},
 {id:"ice",name:"Ice",cost:50,bg:"#62d8ff",shadow:"#1888ad"}
];
const achievements=[
 ["first","Первый клик","clicks",1],["hundred","Сотня","clicks",100],["thousand","Тысячник","clicks",1000],
 ["rich","Богач","coins",1000],["power","Сила","power",5],["robot","Робот","auto",5],["critical","Крит","crit",3],
 ["prestige","Перерождение","prestige",1],["legend","Легенда","clicks",10000]
];
const save=()=>localStorage.setItem(KEY,JSON.stringify(data));
const level=()=>Math.floor(data.clicks/100)+1;
const mult=()=>2**data.multi*(1+data.prestige*.1);
const value=()=> (1+data.power)*mult();
const cost=t=>Math.floor(costs[t]*1.7**data[t]);
function beep(freq=500,duration=.05){if(!data.sound)return;try{const a=new AudioContext(),o=a.createOscillator(),g=a.createGain();o.frequency.value=freq;o.connect(g);g.connect(a.destination);g.gain.value=.035;o.start();o.stop(a.currentTime+duration)}catch{}}
function render(){
 const x=data.clicks%100;
 $("#score").textContent=Math.floor(data.coins);$("#coins").textContent=Math.floor(data.coins);$("#crystals").textContent=data.crystals;
 $("#clicks").textContent=data.clicks;$("#best").textContent=data.best;$("#prestige").textContent=data.prestige;
 $("#level").textContent=level();$("#levelProgress").textContent=x+" / 100 XP";$("#xpBar").style.width=x+"%";$("#power").textContent=Math.floor(value());
 for(const t of ["power","auto","multi","crit"]){$("#"+t+"Level").textContent=data[t];$("#"+t+"Cost").textContent=cost(t);document.querySelector('[data-upgrade="'+t+'"]').disabled=data.coins<cost(t)}
 const today=new Date().toISOString().slice(0,10),claimed=data.lastBonus===today;
 $("#dailyText").textContent=claimed?"🎉 Сегодняшний бонус уже получен! Возвращайся завтра.":"Забери ежедневный бонус: "+(100+data.dailyStreak*50)+" 💰 и "+(1+Math.floor(data.dailyStreak/7))+" 💎";
 $("#dailyButton").disabled=claimed;
 $("#prestigeButton").disabled=data.coins<100000;
 $("#soundButton").textContent=data.sound?"🔊 Звук: ВКЛ":"🔇 Звук: ВЫКЛ";
 document.body.className="skin-"+data.skin;
 const skinBox=$("#skins");skinBox.innerHTML="";
 skins.forEach(s=>{const owned=data.crystals>=s.cost||s.id===data.skin||s.cost===0,e=document.createElement("div");e.className="skin "+(s.id===data.skin?"active ":"")+(owned?"":"locked");e.innerHTML='<div class="skin-preview" style="background:'+s.bg+';box-shadow:0 6px 0 '+s.shadow+'"></div><b>'+s.name+'</b><small>'+(s.cost? s.cost+" 💎":"Бесплатно")+'</small>';e.onclick=()=>buySkin(s);skinBox.appendChild(e)});
 const list=$("#achievementsList");list.innerHTML="";achievements.forEach(([id,title,key,val])=>{const done=data[key]>=val,e=document.createElement("span");e.className="achievement"+(done?" done":"");e.textContent=(done?"🏆 ":"🔒 ")+title;list.appendChild(e)});
 const scores=JSON.parse(localStorage.getItem("danclick-leaderboard")||"[]");$("#leaderboard").innerHTML=scores.length?scores.map((n,i)=>'<li>#'+(i+1)+" — "+n.toLocaleString()+" кликов</li>").join(""):"<li>Пока нет рекордов</li>";
 const skin=skins.find(s=>s.id===data.skin)||skins[0];$("#clickButton").style.background=skin.bg;$("#clickButton").style.boxShadow="0 12px 0 "+skin.shadow+",0 20px 35px rgba(0,0,0,.3)";
}
function buySkin(s){
 if(s.id===data.skin)return;
 if(data.crystals<s.cost){alert("Не хватает кристаллов 💎");return}
 data.crystals-=s.cost;data.skin=s.id;beep(800,.1);save();render();
}
function pop(x,y,n,crit=false){const e=document.createElement("div");e.className="coin";e.textContent=(crit?"💥 ":"+")+n;e.style.left=x+"px";e.style.top=y+"px";document.body.appendChild(e);setTimeout(()=>e.remove(),800)}
$("#clickButton").onclick=e=>{
 const now=Date.now();data.combo=now-data.lastClick<1200?data.combo+1:1;data.lastClick=now;
 let n=value(),crit=false;if(data.crit&&Math.random()<Math.min(.5,data.crit*.05)){n*=5;crit=true}
 data.coins+=n;data.clicks++;data.best=Math.max(data.best,data.clicks);
 $("#combo").textContent=crit?"💥 КРИТИЧЕСКИЙ КЛИК!":data.combo>1?"🔥 Комбо x"+data.combo:"";
 pop(e.clientX,e.clientY,Math.floor(n),crit);beep(crit?900:500,.04);save();render();
};
document.querySelectorAll("[data-upgrade]").forEach(b=>b.onclick=()=>{const t=b.dataset.upgrade,c=cost(t);if(data.coins>=c){data.coins-=c;data[t]++;beep(650,.07);save();render()}});
$("#dailyButton").onclick=()=>{
 const today=new Date().toISOString().slice(0,10);if(data.lastBonus===today)return;
 data.coins+=100+data.dailyStreak*50;data.crystals+=1+Math.floor(data.dailyStreak/7);data.dailyStreak++;data.lastBonus=today;beep(1000,.12);save();render();
};
$("#prestigeButton").onclick=()=>{
 if(data.coins<100000)return;
 const gain=Math.max(1,Math.floor(Math.sqrt(data.coins/100000)));if(!confirm("Сделать престиж и получить "+gain+" 💎?"))return;
 data.crystals+=gain;data.prestige++;data.coins=0;data.power=0;data.auto=0;data.multi=0;data.crit=0;data.clicks=0;data.combo=0;data.lastClick=0;beep(300,.2);save();render();
};
$("#soundButton").onclick=()=>{data.sound=!data.sound;save();render()};
$("#resetButton").onclick=()=>{
 if(confirm("Сохранить текущий результат в локальный рейтинг и удалить весь прогресс?")){
  const scores=JSON.parse(localStorage.getItem("danclick-leaderboard")||"[]");scores.push(data.best);scores.sort((a,b)=>b-a);localStorage.setItem("danclick-leaderboard",JSON.stringify(scores.slice(0,10)));localStorage.removeItem(KEY);localStorage.removeItem(OLD);location.reload();
 }
};
setInterval(()=>{if(data.auto){data.coins+=data.auto*mult();save();render()}},1000);
render();\n
const browserFrame=$("#browserFrame"),browserUrl=$("#browserUrl");
let browserHistory=["https://example.com"],browserPos=0;
function normalizeUrl(raw){
  raw=raw.trim();
  if(!raw)return "https://example.com";
  if(/^https?:\\/\\//i.test(raw))return raw;
  if(raw.includes(" ")||(!raw.includes(".")&&!raw.includes("/")))return "https://www.google.com/search?q="+encodeURIComponent(raw);
  return "https://"+raw;
}
function browserGo(raw,addHistory=true){
  const url=normalizeUrl(raw);
  browserUrl.value=url;
  browserFrame.src=url;
  if(addHistory){
    browserHistory=browserHistory.slice(0,browserPos+1);
    browserHistory.push(url);browserPos=browserHistory.length-1;
  }
}
$("#browserGo").onclick=()=>browserGo(browserUrl.value);
browserUrl.addEventListener("keydown",e=>{if(e.key==="Enter")browserGo(browserUrl.value)});
$("#browserReload").onclick=()=>{browserFrame.src=browserFrame.src};
$("#browserBack").onclick=()=>{
  if(browserPos>0){browserPos--;browserGo(browserHistory[browserPos],false)}
};
$("#browserForward").onclick=()=>{
  if(browserPos<browserHistory.length-1){browserPos++;browserGo(browserHistory[browserPos],false)}
};
$("#browserExternal").onclick=()=>window.open(browserUrl.value,"_blank","noopener,noreferrer");
document.querySelectorAll(".browser-quick").forEach(b=>b.onclick=()=>browserGo(b.dataset.url));
browserFrame.addEventListener("load",()=>{try{browserUrl.value=browserFrame.contentWindow.location.href}catch{}});
