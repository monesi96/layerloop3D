
(function(){
 var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,root=document.documentElement;
 var clamp=function(v,a,b){return Math.min(b,Math.max(a,v))},ease=function(t){return 1-Math.pow(1-t,3)};
 var meds=[].slice.call(document.querySelectorAll('[data-reveal]'));
 function frame(){var vh=innerHeight,vw=innerWidth,side=Math.max(16,(vw-Math.min(1180,vw-48))/2);
  meds.forEach(function(m){var r=m.getBoundingClientRect(),p=reduce?1:ease(clamp((vh-r.top)/(vh*.75),0,1));
   var cs=(1-p)*side,ct=(1-p)*12,cb=(1-p)*12;m.style.setProperty('--cs',cs+'px');m.style.setProperty('--ct',ct+'%');m.style.setProperty('--cb',cb+'%');m.style.setProperty('--cr',(1-p)*24+'px')});
  requestAnimationFrame(frame)}
 frame();
 var an=document.getElementById('anat'),dg=document.getElementById('degimg');
 [an,dg].forEach(function(el){if(!el)return;if('IntersectionObserver' in window){new IntersectionObserver(function(es,o){es.forEach(function(e){if(e.isIntersecting){el.classList.add('in');o.disconnect()}})},{threshold:.3}).observe(el)}else{el.classList.add('in')}});
 var lis=[].slice.call(document.querySelectorAll('.hot li')),pins=[].slice.call(document.querySelectorAll('.pin'));
 lis.forEach(function(li,i){li.addEventListener('mouseenter',function(){lis.forEach(function(x){x.classList.remove('act')});li.classList.add('act');pins.forEach(function(p,j){p.style.transform=j===i?'scale(1.35)':''})})});
 var data={"200":["200 × 200 × ∞ mm","550 × 450 × 750 mm","25%"],"300":["300 × 200 × ∞ mm","550 × 550 × 750 mm","75%"],"400":["400 × 200 × ∞ mm","550 × 650 × 750 mm","100%"]};
 var bw={"200":"50%","300":"75%","400":"100%"};
 [].slice.call(document.querySelectorAll('.tabs2 button')).forEach(function(b){b.addEventListener('click',function(){
  document.querySelectorAll('.tabs2 button').forEach(function(x){x.setAttribute('aria-selected',x===b?'true':'false')});
  var k=b.dataset.w;document.getElementById('volbig').textContent=data[k][0];document.getElementById('barw').style.setProperty('--w',bw[k]);
  document.getElementById('voltxt').textContent='Dimensioni '+data[k][1]+'. Peso 60–70 kg.'})});
(function(){
 var sec=document.getElementById('tour');if(!sec)return;
 var frame=document.getElementById('tframe'),cv=document.getElementById('cv'),tl=document.getElementById('tl'),list=document.getElementById('tlist'),bar=document.getElementById('tbar'),det=document.getElementById('tdet'),dimg=document.getElementById('tdimg'),dlab=document.getElementById('tdlab');
 var steps=JSON.parse(sec.getAttribute('data-steps')),lis=[].slice.call(list.children),caps=[].slice.call(document.querySelectorAll('#tcap .tci'));
 var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 // punti nella vista 3/4 (px della foto 715x1500) -> frazioni della tela 1100x2200
 var MW=1049,ML=(1100-MW)/2,MH=2200;
 function fx(x){return (ML+x/715*MW)/1100} function fy(y){return y/1500}
 var pts=[[472,60],[558,210],[522,172],[550,322],[505,272],[143,180],[357,930]];
 var pins=[[800,60],[800,150],[800,240],[800,330],[800,420],[-85,190],[-85,930]];
 var tgt=[[470,70,3.4],[550,200,2.5],[525,178,3.8],[550,322,3.4],[505,275,3.4],[200,150,2.1],[357,900,2.0]];
 var NS='http://www.w3.org/2000/svg',html='';
 pts.forEach(function(p,i){var q=pins[i];var X=fx(p[0])*1100,Y=fy(p[1])*2200,PX=fx(q[0])*1100,PY=fy(q[1])*2200;
  html+='<path pathLength="1" style="--dl:'+(.1*i)+'s" d="M'+X+' '+Y+' L'+PX+' '+PY+'"/><circle style="--dl:'+(.1*i)+'s" cx="'+X+'" cy="'+Y+'" r="9"/>'});
 tl.innerHTML=html;
 var pinEls=pins.map(function(q,i){var s=document.createElement('span');s.className='pin';s.textContent=i+1;s.style.left=(fx(q[0])*100)+'%';s.style.top=(fy(q[1])*100)+'%';s.style.setProperty('--dl',(.1*i)+'s');s.addEventListener('click',function(e){e.stopPropagation();go(i)});cv.appendChild(s);return s});
 lis.forEach(function(li,i){li.addEventListener('click',function(){go(i)})});
 // keyframes: p, v (0 fronte,1 3/4,2 lato), zoom s, punto px,py
 var rest={s:1,px:.5,py:.5},K=[{p:0,v:0},{p:.07,v:1}];
 tgt.forEach(function(t,i){K.push({p:.13+i*.098,v:1,s:t[2],px:fx(t[0]),py:fy(t[1]),i:i})});
 K.push({p:.83,v:1},{p:.94,v:2},{p:1,v:2});
 K.forEach(function(k){if(k.s==null){k.s=1;k.px=.5;k.py=.5}});
 var L,T,cw,ch,fw,fh;
 function size(){fw=frame.clientWidth;fh=frame.clientHeight;ch=fh*.9;cw=ch/2;if(cw>fw*.8){cw=fw*.8;ch=cw*2}L=(fw-cw)/2;T=(fh-ch)/2;cv.style.left=L+'px';cv.style.top=T+'px';cv.style.width=cw+'px';cv.style.height=ch+'px'}
 function sm(t){return t*t*(3-2*t)}
 function at(p){var a=K[0],b=K[K.length-1];for(var i=0;i<K.length-1;i++){if(p>=K[i].p&&p<=K[i+1].p){a=K[i];b=K[i+1];var t=sm((p-a.p)/(b.p-a.p));return{v:a.v+(b.v-a.v)*t,s:a.s+(b.s-a.s)*t,px:a.px+(b.px-a.px)*t,py:a.py+(b.py-a.py)*t}}}return{v:b.v,s:b.s,px:b.px,py:b.py}}
 var cur=-1;
 function render(p){var st=at(p),s=st.s;
  var kk=Math.min(1,Math.max(0,(s-1)/1.5)),cxo=fw>900?.12:0,tx=fw*(.5+cxo*kk)-L-st.px*cw*s,ty=fh*.46-T-st.py*ch*s; if(s===1){tx=0;ty=0}
  // tra i rest e gli zoom: sposta il punto verso il centro solo quanto serve
  tx*=kk;ty*=kk;
  cv.style.transform='translate('+tx+'px,'+ty+'px) scale('+s+')';cv.style.setProperty('--iz',1/s);
  var imgs=cv.querySelectorAll('img');[].forEach.call(imgs,function(im){var w=Math.max(0,1-Math.abs(st.v-(+im.dataset.v)));im.style.opacity=im.classList.contains('ph')?'':w;if(im.classList.contains('ph')){var bl=Math.min(1,Math.max(0,(s-1.15)/1.4));im.style.setProperty('--o',w*bl*.95);im.style.setProperty('--ow',w*.95);im.style.setProperty('--mx',st.px*cw+'px');im.style.setProperty('--my',st.py*ch+'px');im.style.setProperty('--mr',(fw*.15/s)+'px')}});
  var w1=Math.max(0,1-Math.abs(st.v-1));cv.classList.toggle('lin',w1>.9&&p>.05);tl.style.opacity=w1;pinEls.forEach(function(e){e.style.visibility=w1>.5?'visible':'hidden'});
  var ai=-1;K.forEach(function(kk){if(kk.i!=null&&Math.abs(p-kk.p)<.047)ai=kk.i});
  if(ai!==cur){cur=ai;lis.forEach(function(li,i){li.classList.toggle('act',i===ai)});caps.forEach(function(c,i){c.classList.toggle('act',i===ai+1)});caps.forEach(function(c,i){c.classList.toggle('act',i===ai+1)});pinEls.forEach(function(e,i){e.classList.toggle('act',i===ai)});
   if(ai>=0){dimg.src=(steps[ai][2].indexOf('http')===0?steps[ai][2]:'/media/next/'+steps[ai][2]);dlab.textContent=steps[ai][3];det.classList.add('on')}else det.classList.remove('on')}
  bar.style.width=(p*100)+'%';[].forEach.call(tl.querySelectorAll('circle'),function(c){c.setAttribute('r',9/s*2)});var sw=1.6/(s*cw/1100);[].forEach.call(tl.querySelectorAll('path'),function(q){q.style.strokeWidth=sw})}
 function prog(){var r=sec.getBoundingClientRect(),tot=sec.offsetHeight-innerHeight;return Math.min(1,Math.max(0,-r.top/tot))}
 function tick(){render(prog());requestAnimationFrame(tick)}
 function go(i){var tot=sec.offsetHeight-innerHeight,p=K.filter(function(k){return k.i===i})[0].p,y=sec.getBoundingClientRect().top+scrollY+p*tot;window.scrollTo({top:y,behavior:reduce?'auto':'smooth'})}
 document.getElementById('bdraw').addEventListener('click',function(){frame.classList.remove('photo');this.setAttribute('aria-pressed','true');document.getElementById('bphoto').setAttribute('aria-pressed','false')});
 document.getElementById('bphoto').addEventListener('click',function(){frame.classList.add('photo');this.setAttribute('aria-pressed','true');document.getElementById('bdraw').setAttribute('aria-pressed','false')});
 size();addEventListener('resize',size);tick();
})();

(function(){
 var sec=document.getElementById('sscene');if(!sec)return;
 var sv=document.getElementById('sv'),cnt=document.getElementById('scnt'),bar=document.getElementById('sbar'),caps=[].slice.call(document.querySelectorAll('#scap .tci'));
 var NS='http://www.w3.org/2000/svg';
 function el(n,a,p){var e=document.createElementNS(NS,n);for(var k in a)e.setAttribute(k,a[k]);(p||sv).appendChild(e);return e}
 var BY=540,XH=520,XB=1360,W=300,H=80,LEAN=H*0.577,NP=6,PERIOD=1.15;
 // macchina (profilo con copertura a 30°)
 el('path',{class:'m',d:'M150 '+(BY+40)+' V330 L450 157 H650 V'+(BY+40)+' Z'});
 el('line',{class:'rail',x1:190,y1:372,x2:470,y2:200});
 el('rect',{class:'hd',x:XH-8,y:BY-H-48,width:18,height:30,transform:'rotate(-30 '+XH+' '+(BY-H-48)+')'});
 el('text',{x:150,y:BY+80},sv).textContent='Layerloop Next';
 // rullo
 var rolls=[];for(var i=0;i<40;i++){rolls.push(el('circle',{class:'rl',cx:0,cy:BY+12,r:11}))}
 el('line',{x1:150,y1:BY,x2:1520,y2:BY,stroke:'rgba(255,255,255,.55)','stroke-width':2});
 el('line',{x1:150,y1:BY+24,x2:1520,y2:BY+24,stroke:'rgba(255,255,255,.25)','stroke-width':2});
 // cestello
 el('path',{class:'bk',d:'M'+(XB+60)+' '+(BY-20)+' V'+(BY+110)+' H1560 V'+(BY-20)});
 el('text',{x:XB+60,y:BY+140},sv).textContent='Cestello di scarico';
 var parts=[];for(var k=0;k<NP;k++){parts.push(el('path',{class:'pt'}))}
 var sens=el('text',{x:700,y:90,fill:'#f0b45c',style:'fill:#f0b45c;opacity:0'},sv);sens.textContent='Sensore fine filamento: pausa automatica';
 var T=0,VB=420; // px per unità di tempo
 function draw(p){T=p*(NP+2.2);var inb=0;
  var off=(T*VB)%36;rolls.forEach(function(r,i){r.setAttribute('cx',150+i*36+off-36*0)});
  parts.forEach(function(el_,k){var t=T-k*PERIOD;if(t<0){el_.setAttribute('d','');return}
   var front=XH+t*VB,w=Math.min(W,t*VB),rear=front-w;var drop=0,op=1;
   if(front>XB+40){var q=Math.min(1,(front-(XB+40))/160);drop=q*q*150;op=1-q*.2;if(q>=1)inb++}
   var x0=rear,x1=front,y0=BY-drop,y1=BY-H-drop;
   el_.setAttribute('d','M'+x0+' '+y0+' L'+x1+' '+y0+' L'+(x1+LEAN)+' '+y1+' L'+(x0+LEAN)+' '+y1+' Z');
   el_.style.opacity=(front>XB+60+W)?0:op});
  cnt.textContent=(inb<10?'0':'')+inb;
  var ai=p<.18?0:p<.40?1:p<.58?2:p<.80?3:4;caps.forEach(function(c,i){c.classList.toggle('act',i===ai)});
  sens.style.opacity=(p>.86&&Math.floor(p*40)%2===0)?1:(p>.86?.4:0);
  bar.style.width=(p*100)+'%'}
 function prog(){var r=sec.getBoundingClientRect(),tot=sec.offsetHeight-innerHeight;return Math.min(1,Math.max(0,-r.top/tot))}
 function tick(){draw(prog());requestAnimationFrame(tick)}tick();
})();

})();

;
window.llFwd=function(v){v.__rev=false;v.playbackRate=1;var p=v.play();if(p&&p.catch)p.catch(function(){})};
window.llRev=function(v){v.pause();v.__rev=true;var last=performance.now();(function step(now){if(!v.__rev)return;var dt=(now-last)/1000;last=now;var t=v.currentTime-dt;if(t<=0){v.currentTime=0;v.__rev=false;return}v.currentTime=t;requestAnimationFrame(step)})(last)};

window.llSeq=function(cv){var n=+cv.dataset.n,imgs=[],ctx=cv.getContext('2d'),cur=0,dir=0,last=0,fps=30,acc=0,raf=0;
for(var i=1;i<=n;i++){var im=new Image();im.src=cv.dataset.src.replace('{n}',('00'+i).slice(-3));imgs.push(im)}
function draw(k){var im=imgs[k];if(im&&im.complete&&im.naturalWidth){ctx.clearRect(0,0,cv.width,cv.height);ctx.drawImage(im,0,0,cv.width,cv.height)}}
imgs[0].onload=function(){draw(0)};
function tick(now){if(!dir){raf=0;return}acc+=(now-last)/1000;last=now;var st=Math.floor(acc*fps);if(st>0){acc-=st/fps;cur+=dir*st;if(cur>=n-1){cur=n-1;dir=0}if(cur<=0){cur=0;dir=0}draw(cur)}raf=requestAnimationFrame(tick)}
function go(d){dir=d;last=performance.now();acc=0;if(!raf)raf=requestAnimationFrame(tick)}
cv.__fwd=function(){go(1)};cv.__rev=function(){go(-1)}};
var _f=window.llFwd,_r=window.llRev;
window.llFwd=function(v){if(v.__fwd)return v.__fwd();_f(v)};window.llRev=function(v){if(v.__rev&&typeof v.__rev==='function')return v.__rev();_r(v)};
[].forEach.call(document.querySelectorAll('canvas[data-n]'),llSeq);
(function(){[].forEach.call(document.querySelectorAll('.sl'),function(sec){var t=sec.querySelector('.sl-track'),pv=sec.querySelector('.sl-prev'),nx=sec.querySelector('.sl-next');if(!t)return;var gap=+t.dataset.gap||24;t.style.setProperty('--gap',gap+'px');
function step(){var c=t.firstElementChild;return c?c.getBoundingClientRect().width+gap:300}function upd(){pv.disabled=t.scrollLeft<4;nx.disabled=t.scrollLeft+t.clientWidth>=t.scrollWidth-4}
pv.addEventListener('click',function(){t.scrollBy({left:-step(),behavior:'smooth'})});nx.addEventListener('click',function(){t.scrollBy({left:step(),behavior:'smooth'})});t.addEventListener('scroll',upd,{passive:true});addEventListener('resize',upd);upd();t.addEventListener('keydown',function(e){if(e.key==='ArrowRight')nx.click();if(e.key==='ArrowLeft')pv.click()})});
[].forEach.call(document.querySelectorAll('.sv-play'),function(b){b.addEventListener('click',function(){var v=document.createElement('video');v.src=b.dataset.src;v.poster=b.querySelector('img').src;v.controls=true;v.autoplay=true;v.playsInline=true;b.parentNode.replaceChild(v,b);v.play&&v.play()})});
(function(){var d=document.querySelector('.duo');if(!d)return;function chk(){var any=false;[].forEach.call(d.querySelectorAll('img'),function(i){if(i.complete&&i.naturalWidth===0)i.parentNode.style.display='none';else any=true});if(!any)d.style.display='none'}addEventListener('load',function(){setTimeout(chk,300)})})();
var h=document.getElementById('heroMedia');if(h){var p=h.querySelector('.poster'),f=h.querySelector('iframe');if(p&&f){function go(){if(f.dataset.src&&!f.src)f.src=f.dataset.src}addEventListener('load',function(){setTimeout(go,2600)});setTimeout(go,6000);function hide(){p.style.opacity=0}
addEventListener('message',function(e){var d=e.data;try{if(typeof d==='string')d=JSON.parse(d)}catch(x){return}
if(d&&d.event==='onStateChange'&&d.info===1)hide();if(d&&d.event==='infoDelivery'&&d.info&&d.info.playerState===1)hide()});
f.addEventListener('load',function(){try{f.contentWindow.postMessage(JSON.stringify({event:'listening',id:1}),'*');f.contentWindow.postMessage(JSON.stringify({event:'command',func:'addEventListener',args:['onStateChange']}),'*')}catch(x){}})}}})();