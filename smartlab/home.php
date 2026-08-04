<?php
/**
 * Blog / News — lista articoli (pagina "articoli del blog").
 * Brand landing 2026.
 */
get_header( 'blog' ); ?>

<section class="bhero" aria-label="Blog Smart Lab Industries">
  <div class="bhero-media" aria-hidden="true">
    <div class="base"></div>
    <div class="blob b1"></div>
    <div class="blob b2"></div>
    <div class="mesh"></div>
  </div>
  <div class="wrap bhero-inner">
    <p class="eyebrow" style="color:rgba(255,255,255,.6)"><span class="idx" style="color:#fff">( Blog &amp; News )</span></p>
    <h1>
      <span class="ln"><span style="--l:0">Storie di prodotti,</span></span>
      <span class="ln"><span style="--l:1">processi e tecnologia</span></span>
    </h1>
    <p class="lead">Dietro le quinte della produzione conto terzi: industrializzazione, supply chain, stampa 3D e i progetti che seguiamo ogni giorno.</p>
    <?php
    $slb_cats = get_categories( array( 'hide_empty' => true, 'number' => 8 ) );
    if ( ! empty( $slb_cats ) ) : ?>
    <ul class="cats" aria-label="Filtra per categoria">
      <?php foreach ( $slb_cats as $slb_c ) : ?>
        <li><a href="<?php echo esc_url( get_category_link( $slb_c ) ); ?>"><?php echo esc_html( $slb_c->name ); ?></a></li>
      <?php endforeach; ?>
    </ul>
    <?php endif; ?>
  </div>
</section>

<?php if ( have_posts() ) : ?>

  <?php
  $slb_first = ! is_paged();
  $slb_i     = 0;
  ?>

  <?php if ( $slb_first ) : the_post(); ?>
  <section class="featured wrap" aria-label="In evidenza">
    <a class="fcard rv" href="<?php the_permalink(); ?>">
      <span class="pimg">
        <?php if ( has_post_thumbnail() ) : the_post_thumbnail( 'large' ); else : ?>
          <svg class="ph" viewBox="0 0 86 86" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M43 6 75 24v36L43 78 11 60V24Z"/><path d="M43 20 60 30v20L43 56 26 46V30Z"/></svg>
        <?php endif; ?>
      </span>
      <span class="tx">
        <span class="pmeta">
          <span class="cat">In evidenza</span>
          <span class="dot" aria-hidden="true"></span>
          <span class="date"><?php echo esc_html( get_the_date( 'j M Y' ) ); ?></span>
          <span class="dot" aria-hidden="true"></span>
          <span class="rt"><?php echo esc_html( smartlab_reading_time() ); ?></span>
        </span>
        <h2><?php the_title(); ?></h2>
        <span class="exc"><?php echo esc_html( wp_trim_words( get_the_excerpt(), 32, '…' ) ); ?></span>
        <span class="more">Leggi l'articolo
          <svg width="14" height="14" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11h14M12 5l6 6-6 6"/></svg>
        </span>
      </span>
    </a>
  </section>
  <?php endif; ?>

  <section class="wrap" aria-label="Tutti gli articoli">
    <div class="postgrid">
      <?php while ( have_posts() ) : the_post(); ?>
        <?php get_template_part( 'template-parts/card', 'post', array( 'i' => $slb_i++ ) ); ?>
      <?php endwhile; ?>
    </div>
    <div class="pagination-wrap">
      <?php
      the_posts_pagination( array(
        'prev_text' => '←',
        'next_text' => '→',
        'mid_size'  => 2,
      ) );
      ?>
    </div>
  </section>

<?php else : ?>

  <section class="wrap noposts">
    <h2 class="h2 grad">Ancora nessun articolo</h2>
    <p>Stiamo preparando i primi contenuti: torna a trovarci presto.</p>
  </section>

<?php endif; ?>

<?php get_footer( 'blog' ); ?>
