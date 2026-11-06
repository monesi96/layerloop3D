/* Scena 3D a scorrimento: la camera entra nella macchina seguendo lo scroll (zoom, orbita, puntamento) */
(function(){
  var sec=document.getElementById('tour3d');if(!sec)return;
  var mv=document.getElementById('m3v'),poses=JSON.parse(sec.dataset.poses),n=poses.length;
  var panes=[].slice.call(sec.querySelectorAll('.m3-pane')),dots=[].slice.call(sec.querySelectorAll('.m3-dot'));
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cur=poses[0].slice(),tgt=poses[0].slice(),act=-1,raf=0,ready=false;
  function ease(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2}
  function pose(p){ // p in [0,1] -> posa interpolata fra i fotogrammi chiave (con soste su ciascun passo)
    var f=p*(n-1),i=Math.min(n-2,Math.floor(f)),t=f-i;
    // sosta: i primi 28% restano fermi sul passo, poi transizione morbida
    t=Math.min(1,Math.max(0,(t-.28)/.62));t=ease(t);
    var a=poses[i],b=poses[i+1],o=[];
    for(var k=0;k<8;k++){var x=a[k],y=b[k];
      if(k===0){ // orbita piu' breve
        var d=((y-x+540)%360)-180;y=x+d}
      o.push(x+(y-x)*t)}
    return o}
  function apply(c){
    mv.cameraOrbit=c[0].toFixed(2)+'deg '+c[1].toFixed(2)+'deg '+c[2].toFixed(3)+'m';
    mv.cameraTarget=c[3].toFixed(3)+'m '+c[4].toFixed(3)+'m '+c[5].toFixed(3)+'m';
    mv.fieldOfView=c[6].toFixed(2)+'deg';
    shell(c[7]);
    if(mv.jumpCameraToGoal)mv.jumpCameraToGoal()}
  var shMat=null,smMat=null,shA=-1;
  function shell(a){ // carrozzeria trasparente quando la camera entra nella macchina
    if(!ready)return;if(!shMat){var ms=mv.model&&mv.model.materials||[];for(var i=0;i<ms.length;i++){if(ms[i].name==='outer')shMat=ms[i];if(ms[i].name==='smoke')smMat=ms[i]}}
    if(!shMat||Math.abs(a-shA)<.01)return;shA=a;
    shMat.setAlphaMode(a>.985?'OPAQUE':'BLEND');
    shMat.pbrMetallicRoughness.setBaseColorFactor([.56,.545,.50,a]);
    if(smMat){smMat.setAlphaMode('BLEND');smMat.pbrMetallicRoughness.setBaseColorFactor([.55,.58,.60,.47*a])}}
  function progress(){var r=sec.getBoundingClientRect(),total=sec.offsetHeight-innerHeight;return total>0?Math.min(1,Math.max(0,-r.top/total)):0}
  function setActive(p){
    var i=Math.min(n-1,Math.round(p*(n-1)));
    if(i===act)return;act=i;
    panes.forEach(function(e,k){e.classList.toggle('on',k===i)});dots.forEach(function(e,k){e.classList.toggle('on',k===i)})}
  function frame(){
    raf=0;var p=progress();tgt=pose(p);setActive(p);
    var k=reduce?1:.14,moving=false;
    for(var j=0;j<8;j++){var d=tgt[j]-cur[j];if(Math.abs(d)>.001){moving=true}cur[j]+=d*k}
    apply(cur);if(moving)raf=requestAnimationFrame(frame)}
  function req(){if(!raf)raf=requestAnimationFrame(frame)}
  addEventListener('scroll',req,{passive:true});addEventListener('resize',req);
  mv.addEventListener('load',function(){ready=true;sec.classList.add('ready');cur=pose(progress());apply(cur);req()});
  // rotazione lenta della panoramica quando la scena e' ferma all'inizio
  dots.forEach(function(b){b.addEventListener('click',function(){
    var i=+b.dataset.i,top=sec.getBoundingClientRect().top+scrollY,total=sec.offsetHeight-innerHeight;
    var y=top+i/(n-1)*total;window.__lenis?window.__lenis.scrollTo(y):scrollTo({top:y,behavior:'smooth'})})});
  req();
})();
