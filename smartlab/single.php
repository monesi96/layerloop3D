<?php
/**
 * Articolo singolo — brand landing 2026.
 */
get_header( 'blog' ); ?>

<?php while ( have_posts() ) : the_post(); ?>

<article <?php post_class(); ?>>

  <section class="ahero">
    <div class="bhero-media" aria-hidden="true">
      <div class="base"></div>
      <div class="blob b1"></div>
      <div class="blob b2"></div>
      <div class="mesh"></div>
    </div>
    <div class="wrap ahero-inner">
      <p class="pmeta">
        <?php $slb_cat = get_the_category(); if ( ! empty( $slb_cat ) ) : ?>
          <a class="cat" href="<?php echo esc_url( get_category_link( $slb_cat[0] ) ); ?>"><?php echo esc_html( $slb_cat[0]->name ); ?></a>
          <span class="dot" aria-hidden="true"></span>
        <?php endif; ?>
        <span class="date"><?php echo esc_html( get_the_date( 'j F Y' ) ); ?></span>
        <span class="dot" aria-hidden="true"></span>
        <span class="rt"><?php echo esc_html( smartlab_reading_time() ); ?></span>
      </p>
      <h1 class="grad-fade"><?php the_title(); ?></h1>
    </div>
  </section>

  <?php if ( has_post_thumbnail() ) : ?>
  <div class="art-cover">
    <figure><?php the_post_thumbnail( 'large' ); ?></figure>
  </div>
  <?php endif; ?>

  <div class="art-body">
    <?php the_content(); ?>

    <?php the_tags( '<div class="art-tags">', '', '</div>' ); ?>

    <div class="art-share">
      <span class="lbl">Condividi</span>
      <a href="https://www.linkedin.com/sharing/share-offsite/?url=<?php echo rawurlencode( get_permalink() ); ?>" target="_blank" rel="noopener" aria-label="Condividi su LinkedIn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45Z"/></svg>
      </a>
      <a href="mailto:?subject=<?php echo rawurlencode( get_the_title() ); ?>&body=<?php echo rawurlencode( get_permalink() ); ?>" aria-label="Condividi via email">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m4 7 8 6 8-6"/></svg>
      </a>
      <button type="button" id="copylink" aria-label="Copia il link dell'articolo">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07L11.4 4.53"/><path d="M14 11a5 5 0 0 0-7.07 0L4.1 13.83a5 5 0 0 0 7.07 7.07l1.42-1.42"/></svg>
      </button>
    </div>
  </div>

  <?php
  $slb_prev = get_previous_post();
  $slb_next = get_next_post();
  if ( $slb_prev || $slb_next ) : ?>
  <nav class="prevnext" aria-label="Altri articoli">
    <?php if ( $slb_prev ) : ?>
    <a class="pn rv" href="<?php echo esc_url( get_permalink( $slb_prev ) ); ?>">
      <span class="dir">← Articolo precedente</span>
      <h4><?php echo esc_html( get_the_title( $slb_prev ) ); ?></h4>
    </a>
    <?php else : ?><span></span><?php endif; ?>
    <?php if ( $slb_next ) : ?>
    <a class="pn next rv" href="<?php echo esc_url( get_permalink( $slb_next ) ); ?>">
      <span class="dir">Articolo successivo →</span>
      <h4><?php echo esc_html( get_the_title( $slb_next ) ); ?></h4>
    </a>
    <?php endif; ?>
  </nav>
  <?php endif; ?>

  <?php
  // Articoli correlati: stessa categoria, escluso quello corrente.
  $slb_rel_args = array(
    'posts_per_page'      => 3,
    'post__not_in'        => array( get_the_ID() ),
    'ignore_sticky_posts' => 1,
  );
  if ( ! empty( $slb_cat ) ) {
    $slb_rel_args['cat'] = $slb_cat[0]->term_id;
  }
  $slb_rel = new WP_Query( $slb_rel_args );
  if ( $slb_rel->have_posts() ) : ?>
  <section class="related wrap" aria-label="Articoli correlati">
    <div class="head">
      <p class="eyebrow rv"><span class="idx">( Continua a leggere )</span></p>
      <h2 class="h2 grad rv" style="--i:1">Articoli correlati</h2>
    </div>
    <div class="postgrid" style="padding-block:0 1rem">
      <?php $slb_i = 0; while ( $slb_rel->have_posts() ) : $slb_rel->the_post(); ?>
        <?php get_template_part( 'template-parts/card', 'post', array( 'i' => $slb_i++ ) ); ?>
      <?php endwhile; wp_reset_postdata(); ?>
    </div>
  </section>
  <?php endif; ?>

</article>

<?php endwhile; ?>

<?php get_footer( 'blog' ); ?>
