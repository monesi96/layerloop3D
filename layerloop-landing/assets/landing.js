/* download whitepaper: parte da solo quando il form Ninja Forms viene inviato con successo */
(function(){
  if(!window.LL_WP_DOWNLOAD)return;
  var done=false;
  function go(){ if(done)return; done=true; setTimeout(function(){ window.location.href=window.LL_WP_DOWNLOAD; }, 700); }
  if(window.jQuery){ window.jQuery(document).on('nfFormSubmitResponse', go); }
})();

/* reveal on scroll */
const io=new IntersectionObserver((es)=>{es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}})},{threshold:.12});
document.querySelectorAll('.reveal:not(.in)').forEach(el=>io.observe(el));

/* alone teal che segue il cursore */
document.querySelectorAll('[data-aura]').forEach(box=>{
  const aura=box.querySelector('.aura'); if(!aura)return;
  box.addEventListener('pointermove',e=>{const b=box.getBoundingClientRect();
    aura.style.left=(e.clientX-b.left)+'px';aura.style.top=(e.clientY-b.top)+'px';});
});

/* MATERIALI — i dati arrivano dai campi ACF via window.LL_MATERIALS (stampato dal template PHP) */
(function(){
  const MATERIALS=window.LL_MATERIALS||{};
  const keys=Object.keys(MATERIALS);
  const tabs=document.getElementById('matTabs'),img=document.getElementById('matImg'),info=document.getElementById('matInfo');
  if(!tabs||!keys.length)return;
  const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  document.querySelectorAll('.mat-tab .dot').forEach(d=>{
    const m=MATERIALS[d.dataset.dot]; if(m) d.style.backgroundImage=`url("${m.img}")`;
  });
  function render(key){const m=MATERIALS[key]; if(!m)return;
    img.style.backgroundImage=`url("${m.img}")`;
    info.innerHTML=`<span class="sub">${esc(m.sub)}</span><h3>${esc(m.name)}</h3><ul>${m.points.map(p=>`<li>${esc(p)}</li>`).join('')}</ul>`;
    [img,info].forEach(el=>{el.classList.remove('mat-fade');void el.offsetWidth;el.classList.add('mat-fade');});}
  tabs.addEventListener('click',e=>{const btn=e.target.closest('.mat-tab');if(!btn)return;
    tabs.querySelectorAll('.mat-tab').forEach(t=>t.setAttribute('aria-selected',t===btn));render(btn.dataset.mat);});
  render(keys[0]);
})();

/* render → wireframe: blob + parallasse + glow */
(function(){
  const reveal=document.getElementById('llReveal'),svg=document.getElementById('llSvg'),blob=document.getElementById('blob'),glow=document.getElementById('cursorGlow');
  if(!reveal||!blob)return;
  const R_MAX=140,EASE=.13,R_EASE=.18,PAR=.06;
  let mx=50,my=50,x=50,y=50,tr=0,r=0,px=0,py=0,tpx=0,tpy=0;
  reveal.addEventListener('pointermove',e=>{const b=reveal.getBoundingClientRect();
    const rx=(e.clientX-b.left)/b.width,ry=(e.clientY-b.top)/b.height;mx=rx*100;my=ry*100;
    tpx=(rx-.5)*b.width*PAR;tpy=(ry-.5)*b.height*PAR;glow.style.left=(e.clientX-b.left)+'px';glow.style.top=(e.clientY-b.top)+'px';});
  reveal.addEventListener('pointerenter',()=>tr=R_MAX);
  reveal.addEventListener('pointerleave',()=>{tr=0;tpx=0;tpy=0;});
  (function loop(){x+=(mx-x)*EASE;y+=(my-y)*EASE;r+=(tr-r)*R_EASE;px+=(tpx-px)*EASE;py+=(tpy-py)*EASE;
    blob.setAttribute('cx',x.toFixed(2)+'%');blob.setAttribute('cy',y.toFixed(2)+'%');blob.setAttribute('r',r.toFixed(2));
    svg.style.transform=`translate(${px.toFixed(1)}px,${py.toFixed(1)}px) scale(1.04)`;requestAnimationFrame(loop);})();
})();

/* scale in parallasse sullo scroll */
(function(){
  const stage=document.getElementById('stage');if(!stage)return;let ticking=false;
  function onScroll(){if(ticking)return;ticking=true;requestAnimationFrame(()=>{
    const b=stage.getBoundingClientRect(),vh=window.innerHeight;
    const p=Math.min(Math.max((vh-b.top)/(vh+b.height),0),1);
    stage.style.transform=`translateY(${((p-0.5)*30).toFixed(1)}px) scale(${(1+p*0.10).toFixed(3)})`;ticking=false;});}
  window.addEventListener('scroll',onScroll,{passive:true});onScroll();
})();
