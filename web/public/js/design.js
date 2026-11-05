/* Interazioni del design system: sfondo che sale con le sezioni nere, card 3D che seguono il mouse */
(function(){
  var bg=document.querySelector('.bg');
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  // 1) quando la sezione diventa nera (#111) le palle salgono insieme e liberano lo sfondo
  var solids=[].slice.call(document.querySelectorAll('.sv,.duo,.footer'));
  if(bg&&!reduce){
    var vh=innerHeight;addEventListener('resize',function(){vh=innerHeight});
    var cur=0,prevT=0,dir=0;
    (function tick(){
      var target=0;
      solids.forEach(function(el){
        var r=el.getBoundingClientRect();
        var enter=Math.min(1,Math.max(0,(vh-r.top)/(vh*.7)));
        var leave=Math.min(1,Math.max(0,r.bottom/(vh*.7)));
        target=Math.max(target,Math.min(enter,leave));
      });
      target=Math.max(target,window.__bgLift||0);
      // uscita: salgono fuori da sopra; rientro: ricompaiono da sotto (salto invisibile da +1 a -1)
      if(target<prevT-.002&&cur>.55){cur=-1}
      prevT=target;
      cur+=(target-cur)*.075;
      bg.style.setProperty('--lift',cur.toFixed(4));
      bg.style.setProperty('--al',Math.abs(cur).toFixed(4));
      requestAnimationFrame(tick);
    })();
  }
  // 2) la macchina 3D nelle card ruota seguendo il mouse
  [].forEach.call(document.querySelectorAll('.pc'),function(card){
    var mv=card.querySelector('model-viewer');if(!mv)return;
    card.addEventListener('mousemove',function(e){
      var r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
      mv.removeAttribute('auto-rotate');
      mv.cameraOrbit=(-35+x*140)+'deg '+(62+y*22)+'deg auto';
    });
    card.addEventListener('mouseleave',function(){mv.setAttribute('auto-rotate','')});
  });
})();
