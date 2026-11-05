
var MATS=[];
(function(){
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches, body=document.body, root=document.documentElement;
  var lenis=null;
  if(window.Lenis&&!reduce){lenis=new Lenis({lerp:.08,smoothWheel:true});lenis.stop();}
  window.scrollTo(0,0);

  // sequenza di apertura: logo al centro -> sale -> titolo e pulsante -> si apre la maschera del video
  var openT0=null, OPEN_MS=1400;
  function seq(){
    setTimeout(function(){body.classList.add('s1')},reduce?0:2900);
    setTimeout(function(){body.classList.add('s2')},reduce?0:3700);
    setTimeout(function(){openT0=performance.now();body.classList.remove('lock');if(lenis)lenis.start();},reduce?0:4100);
  }
  seq();

  // youtube in cover
  var hero=document.getElementById('heroMedia'), yt=hero.querySelector('.yt');
  function fitYT(){var w=hero.clientWidth,h=hero.clientHeight;if(w/h>16/9){yt.style.width=w+'px';yt.style.height=(w*9/16)+'px'}else{yt.style.height=h+'px';yt.style.width=(h*16/9)+'px'}}
  fitYT();addEventListener('resize',fitYT);

  // maschere: dal box nel contenitore al pieno schermo con lo scroll
  var medias=[].slice.call(document.querySelectorAll('.reveal-media'));
  var ease=function(t){return 1-Math.pow(1-t,3)}, clamp=function(v,a,b){return Math.min(b,Math.max(a,v))};
  var mega=document.querySelector('.mega');
  function frame(now){
    var vw=innerWidth, vh=innerHeight, side=Math.max(16,(vw-Math.min(1180,vw-48))/2);
    root.style.setProperty('--sy',scrollY);
    medias.forEach(function(m){
      var r=m.getBoundingClientRect(), base, p;
      // p = 0 box nel contenitore, 1 pieno schermo
      p=clamp((vh*.85-r.top)/(vh*.75),0,1);
      if(m.hasAttribute('data-intro')){
        p=clamp(scrollY/(vh*.6),0,1);
        var o=openT0?ease(clamp((now-openT0)/OPEN_MS,0,1)):0;
        var cs=side*(1-p)+ (vw/2-side)*(1-o)*(1-p);
        var cv=(r.height/2)*(1-o);
        m.style.setProperty('--cs',cs+'px');m.style.setProperty('--ct',cv+'px');m.style.setProperty('--cb',cv+'px');
        m.style.setProperty('--cr',(24*(1-p))+'px');
        return;
      }
      p=ease(p);
      m.style.setProperty('--cs',(side*(1-p))+'px');m.style.setProperty('--ct','0px');m.style.setProperty('--cb','0px');
      m.style.setProperty('--cr',(24*(1-p))+'px');
    });
    if(mega){var mr=mega.getBoundingClientRect();mega.style.setProperty('--mp',clamp((vh-mr.top)/mr.height,0,1));}
    requestAnimationFrame(frame);
  }
  function raf(t){if(lenis)lenis.raf(t);requestAnimationFrame(raf)}
  requestAnimationFrame(raf);requestAnimationFrame(frame);

  // ancore
  document.querySelectorAll('[data-scroll]').forEach(function(a){a.addEventListener('click',function(e){var t=document.querySelector(a.getAttribute('href'));if(!t)return;e.preventDefault();lenis?lenis.scrollTo(t,{offset:-80}):t.scrollIntoView({behavior:'smooth'})})});
  document.querySelector('.brand').addEventListener('click',function(e){e.preventDefault();lenis?lenis.scrollTo(0):scrollTo({top:0,behavior:'smooth'})});

  // video Extend: parte con l'hover (su touch quando entra in vista)
  document.querySelectorAll('[data-hover-video]').forEach(function(c){var v=c.querySelector('video,canvas');
    c.addEventListener('mouseenter',function(){llFwd(v)});c.addEventListener('mouseleave',function(){llRev(v)});
    if(matchMedia('(hover:none)').matches){new IntersectionObserver(function(es){es.forEach(function(e){e.isIntersecting?llFwd(v):llRev(v)})},{threshold:.4}).observe(c)}
  });

  // case study
  var tr=document.getElementById('csTrack');
  document.querySelectorAll('[data-cs]').forEach(function(b){b.addEventListener('click',function(){tr.scrollBy({left:+b.dataset.cs*(tr.querySelector('.csc').offsetWidth+18),behavior:'smooth'})})});

  // shorts: anteprima, al click parte il player
  document.querySelectorAll('.sh[data-yt]').forEach(function(b){b.addEventListener('click',function(){if(b.querySelector('iframe'))return;var f=document.createElement('iframe');f.allow='autoplay; encrypted-media; picture-in-picture';f.allowFullscreen=true;f.src='https://www.youtube-nocookie.com/embed/'+b.dataset.yt+'?autoplay=1&playsinline=1&rel=0';b.appendChild(f)})});

  // materiali
  document.getElementById('mstrip').innerHTML=MATS.map(function(m){return '<a class="mi" href="/materiali#'+m.id+'"><div class="pic"><img src="'+m.img+'" alt="Pezzo stampato in '+m.n+'" loading="lazy"></div><b>'+m.n+'</b><span>'+m.a+'</span></a>'}).join('');
})();

;

(function(){
 var sec=document.getElementById('axes');if(!sec)return;
 var sv=document.getElementById('axsv'),NS='http://www.w3.org/2000/svg',bg=document.querySelector('.bg'),blobs=bg?[].slice.call(bg.querySelectorAll('.blob')):[];
 var SPIN=[240,-280,200,-220,320];
 function aim(){blobs.forEach(function(b,i){var cxp=b.offsetLeft+b.offsetWidth/2,cyp=b.offsetTop+b.offsetHeight/2;var tx=bg.clientWidth/2-cxp,ty=bg.clientHeight/2-cyp,sg=(i%2?-1:1)*.42;b.style.setProperty('--tx',tx+'px');b.style.setProperty('--ty',ty+'px');b.style.setProperty('--ax',(-ty*sg)+'px');b.style.setProperty('--ay',(tx*sg)+'px');b.style.setProperty('--spin',SPIN[i%SPIN.length]+'deg')})}
 aim();addEventListener('resize',aim);
 var L=180,K=1.45,CX=650,CY=420,C=.866*K,S=.5*K,TAN=Math.tan(Math.PI/6),PL=62,PH=40,PW=70;
 function P(x,y,z){return[CX+(x-y)*C,CY+(x+y)*S-z*K]}
 function pts(a){return a.map(function(p){var q=P(p[0],p[1],p[2]);return q[0].toFixed(1)+','+q[1].toFixed(1)}).join(' ')}
 var root=null;function el(n,a){var e=document.createElementNS(NS,n);for(var k in a)e.setAttribute(k,a[k]);(root||sv).appendChild(e);return e}
 function cl01(v,a,b){return Math.min(b,Math.max(a,v))}function sm(t){t=cl01(t,0,1);return t*t*(3-2*t)}
 sv.innerHTML='<defs>'
 +'<linearGradient id="gr" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb3a8" stop-opacity=".85"/><stop offset=".35" stop-color="#e0645a" stop-opacity=".72"/><stop offset="1" stop-color="#4a1210" stop-opacity=".85"/></linearGradient>'
 +'<linearGradient id="gwl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8a2f2a" stop-opacity=".4"/><stop offset="1" stop-color="#2a0c0b" stop-opacity=".55"/></linearGradient>'
 +'<linearGradient id="gwr" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff9a8f" stop-opacity=".5"/><stop offset="1" stop-color="#5a1a18" stop-opacity=".5"/></linearGradient>'
 +'<linearGradient id="gsd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c8554c" stop-opacity=".6"/><stop offset="1" stop-color="#3a1210" stop-opacity=".7"/></linearGradient>'
 +'<linearGradient id="gtop" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#e6fffb" stop-opacity=".5"/><stop offset=".5" stop-color="#9ff0e4" stop-opacity=".32"/><stop offset="1" stop-color="#3fb2a8" stop-opacity=".28"/></linearGradient>'
 +'<linearGradient id="gside" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6fd8cb" stop-opacity=".46"/><stop offset="1" stop-color="#0f5a62" stop-opacity=".62"/></linearGradient>'
 +'<linearGradient id="gin" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1b7f86" stop-opacity=".55"/><stop offset="1" stop-color="#062a30" stop-opacity=".8"/></linearGradient>'
 +'<linearGradient id="gfl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2a9aa0" stop-opacity=".6"/><stop offset="1" stop-color="#06262b" stop-opacity=".85"/></linearGradient>'
 +'<linearGradient id="gcap" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2b8f96" stop-opacity=".38"/><stop offset="1" stop-color="#0a3a40" stop-opacity=".5"/></linearGradient>'
 +'<linearGradient id="gsh" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".42"/><stop offset=".45" stop-color="#fff" stop-opacity=".06"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>'
 +'</defs>';
 root=el('g',{});
 // ---- nastro (dietro): pavimento alla quota della base del piano, tetto alla punta del piano
 var tFloor=el('polygon',{fill:'url(#gfl)'}),tLeft=el('polygon',{fill:'url(#gin)'});
 var NP=7,parts=[];for(var k=0;k<NP;k++){parts.push([el('polygon',{fill:'rgba(255,255,255,.62)',stroke:'rgba(255,255,255,.95)','stroke-width':1.1}),el('polygon',{fill:'rgba(190,240,232,.3)',stroke:'rgba(255,255,255,.9)','stroke-width':1.1}),el('polygon',{fill:'rgba(90,190,180,.34)',stroke:'rgba(255,255,255,.9)','stroke-width':1.1})])}
 var tRight=el('polygon',{fill:'url(#gside)',stroke:'rgba(255,255,255,.55)','stroke-width':1.1}),tTop=el('polygon',{fill:'url(#gtop)',stroke:'rgba(255,255,255,.8)','stroke-width':1.3}),tEnd=el('polygon',{fill:'url(#gcap)',stroke:'rgba(255,255,255,.7)','stroke-width':1.1}),tRightS=el('polygon',{fill:'url(#gsh)'}),tTopS=el('polygon',{fill:'url(#gsh)'});
 // ---- cubo che si trasforma nel cuneo inclinato
 var wallL=el('polygon',{fill:'url(#gwl)'}),wallR=el('polygon',{fill:'url(#gwr)'}),floor=el('polygon',{fill:'url(#gr)',stroke:'rgba(255,255,255,.95)','stroke-width':1.5}),floorS=el('polygon',{fill:'url(#gsh)'}),sideR=el('polygon',{fill:'url(#gsd)'});
 var cx=[[0,0],[L,0],[L,L],[0,L]],edges=[];for(var i=0;i<12;i++)edges.push(el('line',{class:'edge'}));
 var partA=[el('polygon',{fill:'rgba(77,182,169,.35)',stroke:'#7fe0d2','stroke-width':1.2}),el('polygon',{fill:'rgba(77,182,169,.5)',stroke:'#7fe0d2','stroke-width':1.2}),el('polygon',{fill:'rgba(77,182,169,.65)',stroke:'#7fe0d2','stroke-width':1.2})];
 var srail=el('line',{class:'railo'}),srail2=el('line',{class:'rail'});
 var railO=el('line',{class:'railo'}),rail=el('line',{class:'rail'}),head=el('polygon',{class:'hd'}),headT=el('polygon',{class:'hd'}),headF=el('polygon',{class:'hd'});
 var ang=el('text',{class:'ang'});ang.textContent='30°';
 var ls=document.getElementById('axls'),axs=ls.parentNode,labs=[];
 function lab(t,sub,n,lx,ly,side,anch){var l=el('line',{class:'lead'}),d=el('circle',{class:'dot',r:4.5});var p=document.createElement('div');p.className='axl';p.innerHTML='<span class="nb">'+n+'</span><span><b>'+t+'</b><small>'+sub+'</small></span>';ls.appendChild(p);labs.push({l:l,d:d,p:p,lx:lx,ly:ly,side:side,anch:anch})}
 lab('Testa di stampa','Si muove in X · Y · Z','01',830,70,'l',function(s){return[s.hx,s.hy]});lab('Volume di stampa','Fisso: il pezzo non esce','02',440,300,'r',function(){return P(L*.62,L*.62,0)});lab('Portale cartesiano','Binario e carrello','03',1000,590,'l',function(s){return P(L,L*.2,s.zr)});
 lab('Testa sul piano','Binario + traversa a 30°','01',70,150,'l',function(s){return[s.hx,s.hy]});lab('Piano inclinato','30° rispetto alla base','02',380,390,'r',function(){return P(L*.5,L*.55,L*TAN*.45)});lab('Nastro','Lunghezza infinita','03',900,640,'l',function(s){return P(L,-s.e*.8,s.Z*.5)});lab('Pezzi in serie','Uno dopo l\'altro','04',860,70,'l',function(s){return P(L*.5,-s.e*.3,PH*.6)});
 var hm=document.getElementById('hm'),hv=document.getElementById('hv'),hp=document.getElementById('hp');
 function box(g,x0,x1,y0,y1,z0,z1){g[0].setAttribute('points',pts([[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]]));g[1].setAttribute('points',pts([[x1,y0,z0],[x1,y1,z0],[x1,y1,z1],[x1,y0,z1]]));g[2].setAttribute('points',pts([[x0,y1,z0],[x1,y1,z0],[x1,y1,z1],[x0,y1,z1]]))}
 function seg(e,a,b){var A=P(a[0],a[1],a[2]),B=P(b[0],b[1],b[2]);e.setAttribute('x1',A[0]);e.setAttribute('y1',A[1]);e.setAttribute('x2',B[0]);e.setAttribute('y2',B[1])}
 var capA=document.getElementById('axa'),capB=document.getElementById('axb'),b1=document.getElementById('axb1'),b2=document.getElementById('axb2'),bar=document.getElementById('axp');
 function draw(p){
  var eio=function(t){t=cl01(t,0,1);return .5-.5*Math.cos(Math.PI*t)},c=eio(p/.15),ex=eio((p-.92)/.08);
  if(bg){var cc=c*(1-ex),cf=eio((p-.05)/.12)*(1-ex);window.__bgLift=cc;bg.style.setProperty('--c','0');bg.style.setProperty('--cf','0')}
  sv.style.opacity=sm((p-.03)/.1)*(1-ex);
  var tt=sm((p-.46)/.17),Z=L*TAN*tt,Eb=520*sm((p-.52)/.16);
  K=1.45-.5*tt;CX=650-214*tt;CY=420+20*tt;C=.866*K;S=.5*K;
  var u=p*34,ta=sm((p-.1)/.34),fa=1-sm((p-.46)/.1);
  var hw=L*(1-tt)+Z*tt,hl=L*(1-tt);        // altezza dei bordi: y=0 -> punta del piano, y=L -> base
  // nastro
  var tv=tt>.02?tt:0;
  tFloor.setAttribute('points',pts([[0,0,0],[L,0,0],[L,-Eb,0],[0,-Eb,0]]));
  tLeft.setAttribute('points',pts([[0,0,0],[0,-Eb,0],[0,-Eb,Z],[0,0,Z]]));
  tRight.setAttribute('points',pts([[L,0,0],[L,-Eb,0],[L,-Eb,Z],[L,0,Z]]));tTop.setAttribute('points',pts([[0,0,Z],[L,0,Z],[L,-Eb,Z],[0,-Eb,Z]]));tEnd.setAttribute('points',pts([[0,-Eb,0],[L,-Eb,0],[L,-Eb,Z],[0,-Eb,Z]]));
  [tFloor,tLeft,tRight,tTop,tEnd,tRightS,tTopS].forEach(function(e){e.style.opacity=tv});
  tRightS.setAttribute('points',tRight.getAttribute('points'));tTopS.setAttribute('points',tTop.getAttribute('points'));
  // pezzi in serie sul pavimento del nastro, sotto la punta del piano
  var T=Math.max(0,(p-.6)/.31)*(NP-.4),n=0;
  parts.forEach(function(g,k){var age=T-k,vis=tt>.95&&age>0;if(!vis){g.forEach(function(q){q.style.opacity=0});return}
   var d=age*120,l=Math.min(PL,d),front=-8-d,rear=front+l;if(age>1)n=Math.max(n,k+1);
   box(g,L/2-PW/2,L/2+PW/2,Math.max(front,-Eb),Math.max(rear,-Eb),1,PH);var op=front<-Eb+10?0:1;g.forEach(function(q){q.style.opacity=op})});
  // cubo -> cuneo: pareti, piano, bordi
  wallR.setAttribute('points',pts([[0,0,0],[L,0,0],[L,0,hw],[0,0,hw]]));wallL.setAttribute('points',pts([[0,0,0],[0,L,0],[0,L,hl],[0,0,hw]]));
  sideR.setAttribute('points',pts([[L,L,0],[L,0,0],[L,0,hw],[L,L,hl]]));sideR.style.opacity=tt*.9;
  floor.setAttribute('points',pts([[0,L,0],[L,L,0],[L,0,Z],[0,0,Z]]));floorS.setAttribute('points',floor.getAttribute('points'));floorS.style.opacity=.35+.65*tt;
  var top=[[0,0,hw],[L,0,hw],[L,L,hl],[0,L,hl]],bot=[[0,0,0],[L,0,0],[L,L,0],[0,L,0]],k2=0;
  for(var q=0;q<4;q++){seg(edges[k2++],bot[q],bot[(q+1)%4])}
  for(var q=0;q<4;q++){seg(edges[k2++],top[q],top[(q+1)%4])}
  for(var q=0;q<4;q++){seg(edges[k2++],bot[q],top[q])}
  edges.forEach(function(e,i){e.style.opacity=(i<4)?1:(i<8?(i==4?1:1):1)});
  // pezzo del volume cartesiano
  var hA=Math.min(L*.82,L*.82*ta*1.15)*fa;box(partA,L/2-26,L/2+26,L/2-26,L/2+26,0,Math.max(.01,hA));partA.forEach(function(q){q.style.opacity=fa});
  // testina: in A su un portale cartesiano (x,y e z), in B SEMPRE sul piano a 30° (binario lungo la pendenza + traversa)
  function zp(y){return Z*(L-y)/L}
  var xhA=L/2+(L/2-24)*Math.sin(u*1.7),yhA=L/2+(L/2-24)*Math.sin(u*1.1+1),zrA=hA+34;
  var xhB=L/2+(L/2-26)*Math.sin(u*2.1),yhB=L/2+(L/2-26)*Math.sin(u*.9+.4),zrB=zp(yhB)+11;
  var xh=xhA+(xhB-xhA)*tt,yh=yhA+(yhB-yhA)*tt,zr=zrA+(zrB-zrA)*tt;
  var r1=P(8,yh,zr),r2=P(L-8,yh,zr);[railO,rail].forEach(function(r){r.setAttribute('x1',r1[0]);r.setAttribute('y1',r1[1]);r.setAttribute('x2',r2[0]);r.setAttribute('y2',r2[1])});
  // binario lungo la pendenza (solo B)
  var sx=10,zr0=zp(L-8)+7,zr1=zp(8)+7;seg(srail,[sx,L-8,zr0],[sx,8,zr1]);seg(srail2,[sx,L-8,zr0],[sx,8,zr1]);srail.style.opacity=tt;srail2.style.opacity=tt;
  var hs=14+7*tt;head.setAttribute('points',pts([[xh-hs,yh-hs,zr+hs],[xh+hs,yh-hs,zr+hs],[xh+hs,yh+hs,zr+hs],[xh-hs,yh+hs,zr+hs]]));
  headT.setAttribute('points',pts([[xh+hs,yh-hs,zr-hs],[xh+hs,yh+hs,zr-hs],[xh+hs,yh+hs,zr+hs],[xh+hs,yh-hs,zr+hs]]));headF.setAttribute('points',pts([[xh-hs,yh+hs,zr-hs],[xh+hs,yh+hs,zr-hs],[xh+hs,yh+hs,zr+hs],[xh-hs,yh+hs,zr+hs]]));
  var hc=P(xh,yh,zr);
  var a30=P(L+14,L-54,12);ang.setAttribute('x',a30[0]);ang.setAttribute('y',a30[1]);ang.style.opacity=tt>.9?1:0;
  hp.textContent=tt>.5?n:1;hm.textContent=tt>.5?'Asse a 30°':'Asse cartesiano';hv.textContent=tt>.5?'Infinito':'Fisso';
  var s={hx:hc[0],hy:hc[1],zr:zr,Z:Z,e:Eb};
  var sr=sv.getBoundingClientRect(),ar=axs.getBoundingClientRect(),sc=Math.min(sr.width/1300,sr.height/720),ox=sr.left-ar.left+(sr.width-1300*sc)/2,oy=sr.top-ar.top+(sr.height-720*sc)/2;
  labs.forEach(function(lb,i){var isA=i<3,vis=(isA?fa:tt)*(sv.style.opacity===''?1:+sv.style.opacity);var a=lb.anch(s);lb.l.setAttribute('x1',a[0]);lb.l.setAttribute('y1',a[1]);lb.l.setAttribute('x2',lb.lx);lb.l.setAttribute('y2',lb.ly);lb.d.setAttribute('cx',a[0]);lb.d.setAttribute('cy',a[1]);
   var on=vis>.5?1:0;lb.l.style.opacity=on?vis:0;lb.d.style.opacity=on?vis:0;lb.p.style.opacity=on?Math.min(1,vis*1.4):0;
   lb.p.style.left=(ox+lb.lx*sc)+'px';lb.p.style.top=(oy+lb.ly*sc)+'px';lb.p.style.transform=lb.side=='l'?'translate(0,-50%)':'translate(-100%,-50%)'});
  var phB=p>.5;capA.classList.toggle('on',!phB&&p>.06);capB.classList.toggle('on',phB&&p<.95);b1.classList.toggle('on',!phB);b2.classList.toggle('on',phB);bar.style.width=(p*100)+'%';
 }
 function prog(){var r=sec.getBoundingClientRect(),tot=sec.offsetHeight-innerHeight;return cl01(-r.top/tot,0,1)}
 function go(p){var tot=sec.offsetHeight-innerHeight,y=sec.getBoundingClientRect().top+scrollY+p*tot;scrollTo({top:y,behavior:'smooth'})}
 b1.addEventListener('click',function(){go(.3)});b2.addEventListener('click',function(){go(.78)});
 (function tick(){draw(prog());requestAnimationFrame(tick)})();
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