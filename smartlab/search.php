<?php
/**
 * Risultati di ricerca — brand landing 2026.
 */
get_header( 'blog' ); ?>

<section class="bhero" aria-label="Ricerca">
  <div class="bhero-media" aria-hidden="true">
    <div class="base"></div>
    <div class="blob b1"></div>
    <div class="blob b2"></div>
    <div class="mesh"></div>
  </div>
  <div class="wrap bhero-inner">
    <p class="eyebrow" style="color:rgba(255,255,255,.6)"><span class="idx" style="color:#fff">( Ricerca )</span></p>
    <h1><span class="ln"><span style="--l:0">Risultati per "<?php echo esc_html( get_search_query() ); ?>"</span></span></h1>
    <p class="lead"><?php echo (int) $wp_query->found_posts; ?> risultat<?php echo 1 === (int) $wp_query->found_posts ? 'o' : 'i'; ?> trovat<?php echo 1 === (int) $wp_query->found_posts ? 'o' : 'i'; ?>.</p>
    <form class="bsearch" role="search" method="get" action="<?php echo esc_url( home_url( '/' ) ); ?>">
      <input type="search" name="s" value="<?php echo esc_attr( get_search_query() ); ?>" placeholder="Cerca nel sito…" aria-label="Cerca">
      <button class="btn-teal" type="submit" style="color:#fff !important">Cerca</button>
    </form>
  </div>
</section>

<?php if ( have_posts() ) : ?>

  <section class="wrap" aria-label="Risultati">
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
    <h2 class="h2 grad">Nessun risultato</h2>
    <p>Prova con un'altra parola chiave, oppure torna al blog per sfogliare tutti gli articoli.</p>
    <a class="btn-teal" style="color:#fff !important" href="<?php echo esc_url( get_permalink( get_option('page_for_posts') ) ?: home_url('/') ); ?>">Vai al blog</a>
  </section>

<?php endif; ?>

<?php get_footer( 'blog' ); ?>
