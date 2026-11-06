(function(){var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,clamp=function(v,a,b){return Math.min(b,Math.max(a,v))},ease=function(t){return 1-Math.pow(1-t,3)},meds=[].slice.call(document.querySelectorAll('[data-reveal]'));
function frame(){var vh=innerHeight,vw=innerWidth,side=Math.max(16,(vw-Math.min(1180,vw-48))/2);meds.forEach(function(m){var r=m.getBoundingClientRect(),p=reduce?1:ease(clamp((vh-r.top)/(vh*.75),0,1));m.style.setProperty('--cs',(1-p)*side+'px');m.style.setProperty('--ct',(1-p)*12+'%');m.style.setProperty('--cb',(1-p)*12+'%');m.style.setProperty('--cr',(1-p)*24+'px')});requestAnimationFrame(frame)}frame()})();
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