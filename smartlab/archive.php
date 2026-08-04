<?php
/**
 * Archivi (categorie, tag, date, autori) — brand landing 2026.
 * Il vecchio template è conservato in 2026-08-04_archive.php.
 */
get_header( 'blog' ); ?>

<section class="bhero" aria-label="Archivio articoli">
  <div class="bhero-media" aria-hidden="true">
    <div class="base"></div>
    <div class="blob b1"></div>
    <div class="blob b2"></div>
    <div class="mesh"></div>
  </div>
  <div class="wrap bhero-inner">
    <p class="eyebrow" style="color:rgba(255,255,255,.6)"><span class="idx" style="color:#fff">( Blog &amp; News )</span></p>
    <h1><span class="ln"><span style="--l:0"><?php echo wp_kses_post( get_the_archive_title() ); ?></span></span></h1>
    <?php $slb_desc = get_the_archive_description(); if ( $slb_desc ) : ?>
      <p class="lead"><?php echo wp_kses_post( wp_strip_all_tags( $slb_desc ) ); ?></p>
    <?php endif; ?>
    <?php
    $slb_cats = get_categories( array( 'hide_empty' => true, 'number' => 8 ) );
    if ( ! empty( $slb_cats ) ) : ?>
    <ul class="cats" aria-label="Filtra per categoria">
      <?php foreach ( $slb_cats as $slb_c ) : ?>
        <li><a <?php if ( is_category( $slb_c->term_id ) ) echo 'class="on" '; ?>href="<?php echo esc_url( get_category_link( $slb_c ) ); ?>"><?php echo esc_html( $slb_c->name ); ?></a></li>
      <?php endforeach; ?>
    </ul>
    <?php endif; ?>
  </div>
</section>

<?php if ( have_posts() ) : ?>

  <section class="wrap" aria-label="Articoli">
    <div class="postgrid">
      <?php $slb_i = 0; while ( have_posts() ) : the_post(); ?>
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
    <h2 class="h2 grad">Nessun articolo qui</h2>
    <p>In questa sezione non ci sono ancora contenuti. Dai un'occhiata agli altri articoli del blog.</p>
    <a class="btn-teal" style="color:#fff !important" href="<?php echo esc_url( get_permalink( get_option('page_for_posts') ) ?: home_url('/') ); ?>">Vai al blog</a>
  </section>

<?php endif; ?>

<?php get_footer( 'blog' ); ?>
