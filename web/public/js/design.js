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
  // settori: scena a scorrimento (il disegno si trasforma, le info compaiono a destra)
  [].forEach.call(document.querySelectorAll('.sxp'),function(sec){
    var ticks=[].slice.call(sec.querySelectorAll('.sx-tick')),gs=[].slice.call(sec.querySelectorAll('.wf')),panes=[].slice.call(sec.querySelectorAll('.sx-pane')),n=ticks.length,cur=-1;
    function pick(i){if(i===cur)return;cur=i;var k=ticks[i].dataset.k;
      ticks.forEach(function(b){var on=b.dataset.k===k;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on)});
      gs.forEach(function(g){g.classList.toggle('on',g.dataset.k===k)});panes.forEach(function(p){p.classList.toggle('on',p.dataset.k===k)})}
    function upd(){var r=sec.getBoundingClientRect(),total=sec.offsetHeight-innerHeight;if(total<=0)return;
      var p=Math.min(.9999,Math.max(0,-r.top/total));pick(Math.floor(p*n))}
    addEventListener('scroll',upd,{passive:true});addEventListener('resize',upd);upd();
    ticks.forEach(function(b){b.addEventListener('click',function(){
      var i=+b.dataset.i,top=sec.getBoundingClientRect().top+scrollY,total=sec.offsetHeight-innerHeight;
      if(matchMedia('(max-width:900px)').matches){pick(i);return}
      var y=top+(i+.5)/n*total;window.__lenis?window.__lenis.scrollTo(y):scrollTo({top:y,behavior:'smooth'})})});
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
