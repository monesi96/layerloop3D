<?php
/**
 * Footer per la sezione Blog/News — brand landing 2026.
 * Caricato con get_footer('blog').
 */
$slb_home = home_url('/');
?>
</main>

<section class="band band-dark blogcta">
  <div class="wrap band-pad inner">
    <p class="eyebrow c rv"><span class="idx">( Parliamone )</span></p>
    <h2 class="grad-fade rv" style="--i:1">Hai un progetto da industrializzare?</h2>
    <p class="copy rv" style="--i:2">Raccontaci cosa vuoi realizzare: un nostro tecnico analizzerà il progetto e ti contatterà per una prima consulenza gratuita.</p>
    <a class="btn-teal rv" style="--i:3; color:#fff !important" href="<?php echo esc_url( $slb_home ); ?>#contatti">Prenota una consulenza
      <svg width="17" height="17" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11h14M12 5l6 6-6 6"/></svg>
    </a>
  </div>
</section>

<footer class="site">
  <div class="wrap">
    <div class="foot-top">
      <div class="foot-brand">
        <a class="logo" href="<?php echo esc_url( $slb_home ); ?>" aria-label="Torna alla home">
          <img src="https://www.smartlab3d.com/wp-content/uploads/2026/07/logosmartlab.png" alt="Smart Lab Industries" class="logo-img">
        </a>
        <p>Smart Lab Industrie 3D srl - P.Iva 07732690727<br>
           Iscritta nel registro delle start up innovative
           Conosociata del Gruppo Finlogic SpA
           Sedi Affiliate: Bari, Teramo, Molfetta, Reggio Calabria</p>
        <div class="poli">
          <span class="seal"><img src="https://www.smartlab3d.com/wp-content/uploads/2026/07/poliba.gif" alt="Politecnico di Bari"></span>
          <span class="t"><small>Partner scientifico</small>Politecnico di Bari</span>
        </div>
      </div>
      <div class="fc">
        <h4>Link utili</h4>
        <ul>
          <li><a href="<?php echo esc_url( $slb_home ); ?>#chi-siamo">Chi siamo</a></li>
          <li><a href="<?php echo esc_url( $slb_home ); ?>#competenze">Competenze</a></li>
          <li><a href="<?php echo esc_url( $slb_home ); ?>#processo">Processo</a></li>
          <li><a href="<?php echo esc_url( $slb_home ); ?>#prodotti">Case history</a></li>
          <li><a href="<?php echo esc_url( $slb_home ); ?>#contatti">Contatti</a></li>
        </ul>
      </div>
      <div class="fc">
        <h4>Contatti</h4>
        <ul>
          <li><a href="mailto:info@smab3D.it">info@smab3D.it</a></li>
          <li><a href="tel:+39080889056">+39 080 8890568</a></li>
          <li class="adr">Sede Legale Bari, via Calabria 12 – Z.I. 70021 Acquaviva delle fonti (BA)</li>
        </ul>
      </div>
      <div class="fc">
        <h4>Seguici</h4>
        <ul>
          <li><a href="https://www.linkedin.com/company/smart-lab-industrie-3d-s.r.l./" rel="noopener" target="_blank">LinkedIn ↗</a></li>
        </ul>
      </div>
    </div>
    <div class="foot-bottom">
      <span>© Smart Lab Industries S.r.l. — P.IVA 07732690727 — Tutti i diritti riservati</span>
    </div>
  </div>
</footer>

<script>
(function(){
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* topbar: cambia colore dopo lo scroll (come in homepage) */
  var topbar = document.getElementById('topbar');
  if (topbar && topbar.parentElement !== document.body) {
    document.body.insertBefore(topbar, document.body.firstChild);
  }
  var ticking = false;
  function onScroll(){
    topbar.classList.toggle('scrolled', scrollY > 24);
    ticking = false;
  }
  addEventListener('scroll', function(){
    if(!ticking){ ticking = true; requestAnimationFrame(onScroll); }
  }, {passive:true});
  onScroll();

  /* menu mobile */
  var burger = document.getElementById('burger'), root = document.documentElement;
  if (burger) {
    burger.addEventListener('click', function(){
      var open = root.classList.toggle('menu-open');
      burger.setAttribute('aria-expanded', open);
      burger.textContent = open ? 'Chiudi' : 'Menu';
    });
    document.querySelectorAll('.sheet a').forEach(function(a){
      a.addEventListener('click', function(){
        root.classList.remove('menu-open');
        burger.setAttribute('aria-expanded', 'false');
        burger.textContent = 'Menu';
      });
    });
  }

  /* reveal on scroll */
  var io = new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, {threshold:.14, rootMargin:'0px 0px -5% 0px'});
  document.querySelectorAll('.rv').forEach(function(el){ io.observe(el); });

  /* copia link articolo */
  var copyBtn = document.getElementById('copylink');
  if (copyBtn) {
    copyBtn.addEventListener('click', function(){
      navigator.clipboard.writeText(location.href).then(function(){
        copyBtn.classList.add('ok');
        setTimeout(function(){ copyBtn.classList.remove('ok'); }, 1400);
      });
    });
  }
})();
</script>

<?php wp_footer(); ?>
</body>
</html>
