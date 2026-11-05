/* Design system: sfondo (palle che salgono prima della scena 30°) e card 3D che seguono il mouse */
(function(){
  var bg=document.querySelector('.bg'),axes=document.getElementById('axes');
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(bg&&axes&&!reduce){
    var vh=innerHeight,top=0,raf=0;
    function measure(){vh=innerHeight;top=axes.getBoundingClientRect().top+scrollY}
    function ease(t){return t*t*(3-2*t)}
    function update(){raf=0;
      // da quando la scena entra in basso (1.15vh) a quando arriva in cima (0.1vh): una sola salita, legata allo scroll
      var d=top-scrollY;
      var p=Math.min(1,Math.max(0,(vh*1.15-d)/(vh*1.05)));
      bg.style.setProperty('--lift',ease(p).toFixed(4));
    }
    function req(){if(!raf)raf=requestAnimationFrame(update)}
    measure();update();
    addEventListener('scroll',req,{passive:true});
    addEventListener('resize',function(){measure();req()});
    addEventListener('load',function(){measure();req()});
  }
  // icone al tratto: si disegnano quando entrano in vista
  var feat=document.querySelector('.feat');
  if(feat&&'IntersectionObserver' in window&&!reduce){
    feat.classList.add('pre');
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){feat.classList.remove('pre');e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.35});
    [].forEach.call(feat.children,function(c){io.observe(c)});
  }
  // settori: selezione, disegno al tratto e stampante consigliata
  [].forEach.call(document.querySelectorAll('.sx'),function(w){
    var items=[].slice.call(w.querySelectorAll('.sx-item')),gs=[].slice.call(w.querySelectorAll('.wf')),recs=[].slice.call(w.querySelectorAll('.sx-rec'));
    function pick(k){items.forEach(function(b){var on=b.dataset.k===k;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on)});
      gs.forEach(function(g){g.classList.toggle('on',g.dataset.k===k)});recs.forEach(function(r){r.classList.toggle('on',r.dataset.k===k)})}
    items.forEach(function(b){b.addEventListener('click',function(e){if(e.target.closest('a'))return;pick(b.dataset.k)});
      b.addEventListener('mouseenter',function(){if(matchMedia('(hover:hover)').matches)pick(b.dataset.k)})});
  });
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
