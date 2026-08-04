<?php
/**
 * Card articolo — usata in home.php, archive.php, search.php, single.php (correlati).
 */
$slb_cat = get_the_category();
?>
<article class="postcard rv" style="--i:<?php echo (int) ( $args['i'] ?? 0 ) % 3; ?>">
  <a href="<?php the_permalink(); ?>" class="pimg" aria-hidden="true" tabindex="-1">
    <?php if ( has_post_thumbnail() ) : ?>
      <?php the_post_thumbnail( 'large' ); ?>
    <?php else : ?>
      <svg class="ph" viewBox="0 0 86 86" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M43 6 75 24v36L43 78 11 60V24Z"/><path d="M43 20 60 30v20L43 56 26 46V30Z"/></svg>
    <?php endif; ?>
  </a>
  <div class="tx">
    <p class="pmeta">
      <?php if ( ! empty( $slb_cat ) ) : ?>
        <span class="cat"><?php echo esc_html( $slb_cat[0]->name ); ?></span>
        <span class="dot" aria-hidden="true"></span>
      <?php endif; ?>
      <span class="date"><?php echo esc_html( get_the_date( 'j M Y' ) ); ?></span>
      <span class="dot" aria-hidden="true"></span>
      <span class="rt"><?php echo esc_html( smartlab_reading_time() ); ?></span>
    </p>
    <h3><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
    <p class="exc"><?php echo esc_html( wp_trim_words( get_the_excerpt(), 20, '…' ) ); ?></p>
    <a class="more" href="<?php the_permalink(); ?>">Leggi l'articolo
      <svg width="14" height="14" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11h14M12 5l6 6-6 6"/></svg>
    </a>
  </div>
</article>
