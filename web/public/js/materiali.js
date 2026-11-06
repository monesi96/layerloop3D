
(function(){
  var root=document.documentElement, reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var lenis=(window.Lenis&&!reduce)?new Lenis({lerp:.075,smoothWheel:true,wheelMultiplier:.9}):null;
  var clamp=function(v,a,b){return Math.min(b,Math.max(a,v))};
  var esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
  /* ---------- Dati materiali ---------- */
  var FAM={std:'Standard',tech:'Tecnici',comp:'Compositi',flex:'Flessibili',bio:'Bio',ht:'Alte temperature'};
  var M=window.__MATERIALS__||[];
  var IMG={pla:'img/pla.webp',plat:'img/plat.webp',petg:'img/petg.webp',nylon:'img/nylon.webp',pa12cf:'img/pa12cf.webp',asa:'img/asa.webp',gcarb:'img/gcarb.webp',ppscf:'img/ppscf.webp',abs:'img/abs.webp',tpu:'img/tpu.webp',gpro:'img/gpro.webp',pp:'img/pp.webp',pps:'img/pps.webp'};
  M.forEach(function(m){m.img=IMG[m.id]||null});
  var byId={}; M.forEach(function(m,i){m.i=i;byId[m.id]=m});
  var vars=function(m){return '--c1:'+m.c[0]+';--c2:'+m.c[1]+(m.ln!=null?';--ln:'+m.ln:'')+(m.tex?';--tex:'+m.tex:'')};


  /* ---------- Libreria ---------- */
  var names=document.getElementById('names'), thumbs=document.getElementById('thumbs'), spec=document.getElementById('spec');
  function specHTML(m){
    return (m.img?'<div class="sample"><img src="'+m.img+'" alt="Pezzo stampato in '+esc(m.n)+'" loading="lazy"></div>':'<div class="sample nofoto" style="'+vars(m)+'"><i></i></div>')+
      '<div><h3>'+esc(m.n)+'</h3><div class="alias">'+esc(m.a)+' · '+m.f.map(function(k){return FAM[k]}).join(', ')+'</div></div>'+
      '<div class="spec-body"><p class="spec-desc">'+esc(m.d)+'</p>'+
      '<ul class="chips">'+m.t.map(function(t){return '<li>'+esc(t)+'</li>'}).join('')+'</ul>'+
      '<div class="on-mach">Stampabile su '+m.m.map(function(x){return '<span>'+x+'</span>'}).join('')+'</div>'+
      '<div class="spec-ctas"><a class="btn dark" href="#find" data-mat="'+m.id+'">Trova la macchina per '+esc(m.n)+' →</a></div></div>';
  }
  names.innerHTML=M.map(function(m){
    return '<li class="row" data-id="'+m.id+'"><button type="button" aria-controls="spec"><span class="dot"></span><span class="nm">'+esc(m.n)+'<small>'+esc(m.a)+'</small></span></button><span class="go">→</span><div class="row-inline"><div class="spec">'+specHTML(m)+'</div></div></li>';
  }).join('');
  thumbs.innerHTML=M.map(function(m){return '<div class="thumb" data-id="'+m.id+'">'+(m.img?'<img src="'+m.img+'" alt="" loading="lazy">':'<span class="mini" style="'+vars(m)+'"></span>')+'</div>'}).join('');
  var rows=[].slice.call(names.children), ths=[].slice.call(thumbs.children), cur=null;
  function select(id){
    if(cur===id) return; cur=id;
    rows.forEach(function(r){var on=r.dataset.id===id;r.classList.toggle('on',on);r.querySelector('button').setAttribute('aria-pressed',on)});
    ths.forEach(function(t){t.classList.toggle('on',t.dataset.id===id)});
    spec.innerHTML=specHTML(byId[id]); bindScroll(spec);
  }
  var hoverable=matchMedia('(hover:hover) and (pointer:fine)').matches;
  rows.forEach(function(r){
    r.querySelector('button').addEventListener('click',function(){select(r.dataset.id)});
    if(hoverable) r.addEventListener('mouseenter',function(){if(!r.classList.contains('dim'))select(r.dataset.id)});
  });
  ths.forEach(function(t){t.addEventListener('mouseenter',function(){if(!t.classList.contains('dim'))select(t.dataset.id)})});

  /* barra famiglie orizzontale con conteggi */
  var fbox=document.getElementById('filters');
  var count=function(k){return k==='all'?M.length:M.filter(function(m){return m.f.indexOf(k)>-1}).length};
  fbox.innerHTML=[['all','Tutti']].concat(Object.keys(FAM).map(function(k){return [k,FAM[k]]})).map(function(p,i){return '<button type="button" class="fam-tab" aria-pressed="'+(i===0)+'" data-f="'+p[0]+'">'+p[1]+'<sup>'+count(p[0])+'</sup></button>'}).join('');
  var fbtns=[].slice.call(fbox.children);
  fbtns.forEach(function(b){b.addEventListener('click',function(){
    var f=b.dataset.f; fbtns.forEach(function(x){x.setAttribute('aria-pressed',x===b)});
    var first=null;
    M.forEach(function(m,i){var ok=f==='all'||m.f.indexOf(f)>-1;rows[i].classList.toggle('dim',!ok);ths[i].classList.toggle('dim',!ok);if(ok&&!first)first=m.id});
    if(first&&f!=='all'&&byId[cur].f.indexOf(f)<0){select(first)}
  })});

  /* matrice */
  document.getElementById('mx').innerHTML=M.map(function(m){
    return '<tr data-id="'+m.id+'"><td><b>'+esc(m.n)+'</b> <span class="key">'+esc(m.a)+'</span></td><td class="key">'+m.f.map(function(k){return FAM[k]}).join(', ')+'</td><td class="key">'+esc(m.key)+'</td>'+
      ['XE','NEXT','EXTEND'].map(function(x){var ok=m.m.indexOf(x)>-1;return '<td class="m"><i class="'+(ok?'':'no')+'" role="img" aria-label="'+x+(ok?' sì':' no')+'"></i></td>'}).join('')+'</tr>';
  }).join('');
  [].slice.call(document.getElementById('mx').children).forEach(function(tr){tr.addEventListener('click',function(){select(tr.dataset.id);go('#libreria')})});

  /* ---------- Configuratore ---------- */
  var NEED={easy:['pla','petg','gpro'],impact:['plat','petg','abs'],flex:['tpu'],stiff:['pa12cf','gcarb','ppscf'],heat:['ppscf','pps','gcarb'],uv:['asa','gcarb'],wear:['nylon','pp','plat'],green:['gpro','pla','gcarb']};
  var MACH={
    XE:{t:'Compatta, da banco: la Layerloop per pezzi su misura e applicazioni specifiche, anche medicali.',w:['Ingombro ridotto, si installa in laboratorio o in studio','Asse a 30° e nastro: il pezzo resta piatto, meno supporti']},
    NEXT:{t:'La Layerloop per la produzione continua: il nastro scarica i pezzi e la macchina riparte da sola, 24/7.',w:['Produzione in serie senza operatore','Pezzi più lunghi dell’ingombro della macchina']},
    EXTEND:{t:'Large format con camera calda: la Layerloop per materiali tecnici, compositi e grandi componenti.',w:['Camera calda per nylon, ABS e polimeri tecnici','Componenti lunghi in un unico pezzo, senza giunzioni']}
  };
  var PREF={custom:['XE','NEXT','EXTEND'],proto:['NEXT','XE','EXTEND'],series:['NEXT','EXTEND','XE'],large:['EXTEND','NEXT','XE'],tooling:['NEXT','EXTEND','XE'],outdoor:['NEXT','EXTEND','XE']};
  var SEL={use:'custom',need:'easy',size:'m'};
  var rn=document.getElementById('r-names'), rt=document.getElementById('r-text'), rw=document.getElementById('r-why'), ra=document.getElementById('r-alt'), rm=document.getElementById('r-mats');
  function recompute(){
    var mats=NEED[SEL.need].map(function(id){return byId[id]});
    if(SEL.use==='outdoor'&&SEL.need!=='uv'){mats=mats.concat([byId.asa]).filter(function(m,i,a){return a.indexOf(m)===i}).slice(0,3)}
    var order=PREF[SEL.use].slice();
    if(SEL.size==='l'){order=['EXTEND','NEXT','XE']}
    if(SEL.size==='s'&&SEL.use!=='series'){order=['XE'].concat(order.filter(function(x){return x!=='XE'}))}
    var top=mats[0], pick=null;
    for(var i=0;i<order.length;i++){if(top.m.indexOf(order[i])>-1){pick=order[i];break}}
    var alt=null;
    for(var j=0;j<order.length;j++){var x=order[j];if(x!==pick&&mats.some(function(m){return m.m.indexOf(x)>-1})){alt=x;break}}
    rn.innerHTML='Layerloop <em>'+pick+'</em>';
    rt.textContent=MACH[pick].t;
    var why=MACH[pick].w.slice();
    why.push(top.n+' è stampabile su '+top.m.join(', ')+': '+top.key.toLowerCase()+'.');
    rw.innerHTML=why.map(function(w){return '<li>'+esc(w)+'</li>'}).join('');
    ra.textContent=alt?('In alternativa: Layerloop '+alt+(alt==='EXTEND'?', se ti servono anche materiali tecnici e camera calda.':alt==='NEXT'?', se vuoi produrre in continuo senza operatore.':', se ti basta una macchina compatta da banco.')):'';
    rm.innerHTML=mats.map(function(m){var ok=m.m.indexOf(pick)>-1;return '<button type="button" class="r-mat" data-id="'+m.id+'">'+(m.img?'<img src="'+m.img+'" alt="">':'<span class="mini" style="'+vars(m)+'"></span>')+'<span><b>'+esc(m.n)+'</b><span>'+esc(m.key)+(ok?'':' · su '+m.m.join('/'))+'</span></span></button>'}).join('');
    [].slice.call(rm.children).forEach(function(b){b.addEventListener('click',function(){select(b.dataset.id);go('#libreria')})});
    document.getElementById('r-demo').textContent='Richiedi una demo su '+pick;
  }
  [].slice.call(document.querySelectorAll('.opts')).forEach(function(g){
    var key=g.dataset.g, bs=[].slice.call(g.children);
    function mark(){bs.forEach(function(b){b.setAttribute('aria-checked',b.dataset.k===SEL[key])})}
    bs.forEach(function(b){b.addEventListener('click',function(){SEL[key]=b.dataset.k;mark();recompute()})});
    g.addEventListener('keydown',function(e){var i=bs.findIndex(function(b){return b.dataset.k===SEL[key]});if(/Arrow(Right|Down)/.test(e.key)){i=(i+1)%bs.length}else if(/Arrow(Left|Up)/.test(e.key)){i=(i-1+bs.length)%bs.length}else return;e.preventDefault();bs[i].click();bs[i].focus()});
    mark();
  });
  var MAT2NEED={pla:'easy',plat:'impact',petg:'easy',nylon:'wear',pa12cf:'stiff',asa:'uv',abs:'impact',tpu:'flex',gpro:'green',gcarb:'stiff',pp:'wear',pps:'heat',ppscf:'heat'};
  document.addEventListener('click',function(e){var a=e.target.closest('[data-mat]');if(!a)return;e.preventDefault();SEL.need=MAT2NEED[a.dataset.mat];document.querySelector('[data-g=need] [data-k='+SEL.need+']').click();go('#find')});
  recompute();
  select('pla');

  /* ---------- scroll ---------- */
  function go(sel){var el=document.querySelector(sel);if(!el)return;if(lenis)lenis.scrollTo(el,{duration:1.2,offset:0});else el.scrollIntoView({behavior:reduce?'auto':'smooth'})}
  function bindScroll(scope){[].slice.call(scope.querySelectorAll('[data-scroll]')).forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();go(a.getAttribute('href'))})})}
  bindScroll(document);
  var mega=document.querySelector('.mega');
  function update(){
    var sy=window.scrollY||0; root.style.setProperty('--sy',sy.toFixed(1));
    if(mega){var mr=mega.getBoundingClientRect();mega.style.setProperty('--mp',clamp((innerHeight-mr.top)/(innerHeight+mr.height),0,1).toFixed(4))}
  }
  function frame(t){if(lenis)lenis.raf(t);update();requestAnimationFrame(frame)}
  requestAnimationFrame(frame);
  (function(){var hh=location.hash.slice(1);if(hh&&byId[hh]){select(hh);var e=document.getElementById('libreria');if(e)setTimeout(function(){e.scrollIntoView()},60)}})();
})();
