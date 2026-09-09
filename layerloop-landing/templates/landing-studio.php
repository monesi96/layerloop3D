<?php
/**
 * Landing whitepaper pubblicata dallo Studio: cinque blocchi con il testo
 * del case study preso per intero, intestazioni e paragrafi centrati, tutto
 * impaginato a schede con gli angoli arrotondati.
 *
 *   LA SFIDA · IL LIMITE DELLE TECNOLOGIE TRADIZIONALI · LA SOLUZIONE ·
 *   I MATERIALI · PERCHÉ SCEGLIERE LAYERLOOP · chiusura con i bottoni.
 *
 * Viene incluso da landing.php, che ha già calcolato tutte le variabili:
 * qui si decide solo come stamparle. Le landing storiche compilate a mano
 * restano sul layout di landing.php.
 *
 * @package LayerLoop_Landing
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/*
 * Intestazione di sezione, identica in tutti i blocchi: filetto, occhiello
 * facoltativo, titolo centrato. Niente numerazione.
 */
$ll_head = function ( $eyebrow, $title ) {
	if ( '' === $eyebrow && '' === $title ) {
		return;
	}
	?>
	<div class="sec-head sec-head--center">
		<?php if ( $eyebrow ) : ?><span class="eyebrow"><?php echo esc_html( $eyebrow ); ?></span><?php else : ?><span class="sec-rule"></span><?php endif; ?>
		<?php if ( $title ) : ?><h2 class="sec-title"><?php echo esc_html( $title ); ?></h2><?php endif; ?>
	</div>
	<?php
};

/*
 * Un testo scritto a blocchi (paragrafi separati da una riga vuota) diventa
 * una sequenza di paragrafi; le righe che iniziano con un trattino o un punto
 * elenco diventano tessere affiancate, come l'elenco dei requisiti nel PDF.
 */
$ll_blocks = function ( $text ) {
	$blocks = array();
	foreach ( preg_split( '/(\r\n|\r|\n){2,}/', trim( (string) $text ) ) as $chunk ) {
		$paragraph = array();
		$items     = array();
		foreach ( preg_split( '/\r\n|\r|\n/', $chunk ) as $line ) {
			$line = trim( $line );
			if ( '' === $line ) {
				continue;
			}
			if ( preg_match( '/^[-•*–]\s*(.+)$/u', $line, $m ) ) {
				$items[] = trim( $m[1] );
			} else {
				$paragraph[] = $line;
			}
		}
		if ( $paragraph ) {
			$blocks[] = array( 'type' => 'p', 'text' => implode( ' ', $paragraph ) );
		}
		if ( $items ) {
			$blocks[] = array( 'type' => 'list', 'items' => $items );
		}
	}
	return $blocks;
};

$ll_ticks = function () {
	echo '<i class="tick tick--tl"></i><i class="tick tick--tr"></i><i class="tick tick--bl"></i><i class="tick tick--br"></i>';
};

$mat_first = isset( $materials[0] ) ? $materials[0] : array( 'name' => '', 'sub' => '', 'image' => '' );
$mat_image = ! empty( $mat_first['image'] ) ? $mat_first['image'] : '';
?>

<!-- ============ HERO ============ -->
<header class="hero">
  <div class="wrap">
    <?php if ( ! empty( $meta_parts ) ) : ?>
    <div class="hero__meta reveal in">
      <?php foreach ( $meta_parts as $mp ) : ?><span><?php echo esc_html( trim( $mp ) ); ?></span><?php endforeach; ?>
    </div>
    <?php endif; ?>
    <div class="hero__intro">
      <?php if ( $hero_eyebrow ) : ?><span class="eyebrow reveal in"><?php echo esc_html( $hero_eyebrow ); ?></span><?php endif; ?>
      <?php if ( $hero_title ) : ?><h1 class="reveal in" style="--d:.05s"><?php echo $ll_br( $hero_title ); ?></h1><?php endif; ?>
      <?php if ( $hero_lead ) : ?><p class="lead reveal in" style="--d:.12s"><?php echo esc_html( $hero_lead ); ?></p><?php endif; ?>
      <?php if ( ! empty( $hero_tags ) ) : ?>
      <div class="pills reveal in" style="--d:.15s">
        <?php foreach ( $hero_tags as $tag ) : ?><span><?php echo esc_html( $tag ); ?></span><?php endforeach; ?>
      </div>
      <?php endif; ?>
      <div class="cta-row reveal in" style="--d:.18s">
        <?php if ( $hero_cta1 ) : ?><a class="btn btn--solid btn--arrow" href="<?php echo $anchor; ?>"><?php echo esc_html( $hero_cta1 ); ?></a><?php endif; ?>
        <?php if ( $hero_cta2 ) : ?><a class="btn btn--ghost" href="<?php echo $anchor; ?>"><?php echo esc_html( $hero_cta2 ); ?></a><?php endif; ?>
      </div>
    </div>

    <?php if ( $hero_base ) : ?>
    <div class="viewport reveal in" style="--d:.22s">
      <?php $ll_ticks(); ?>
      <div class="stage" id="stage">
        <div class="ll-reveal" id="llReveal">
          <?php if ( $hero_hint ) : ?><span class="ll-tag-live"><?php echo esc_html( $hero_hint ); ?></span><?php endif; ?>
          <?php if ( $hero_overlay ) : ?><div class="stage__cursor" id="cursorGlow"></div><?php endif; ?>
          <svg class="ll-svg" id="llSvg" viewBox="0 0 1280 680" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
            <defs>
              <filter id="liquidFilter" x="-50%" y="-50%" width="200%" height="200%">
                <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="2" seed="3" result="noise">
                  <animate attributeName="baseFrequency" values="0.014;0.018;0.015;0.020;0.014" dur="7s" repeatCount="indefinite"/>
                </feTurbulence>
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="22"/>
              </filter>
              <mask id="liquidMask">
                <rect width="100%" height="100%" fill="black"/>
                <?php if ( $hero_overlay ) : ?><circle id="blob" cx="50%" cy="50%" r="0" fill="white" filter="url(#liquidFilter)"/><?php endif; ?>
              </mask>
            </defs>
            <image href="<?php echo esc_url( $hero_base ); ?>" xlink:href="<?php echo esc_url( $hero_base ); ?>"
                   x="0" y="0" width="1280" height="680" preserveAspectRatio="xMidYMid meet"/>
            <?php if ( $hero_overlay ) : ?>
              <image href="<?php echo esc_url( $hero_overlay ); ?>" xlink:href="<?php echo esc_url( $hero_overlay ); ?>"
                     x="0" y="0" width="1280" height="680" preserveAspectRatio="xMidYMid meet" mask="url(#liquidMask)"/>
            <?php endif; ?>
          </svg>
        </div>
      </div>
    </div>
    <?php endif; ?>

    <?php if ( ! empty( $hero_stats ) ) : ?>
    <div class="hero-stats reveal in" style="--d:.28s">
      <?php foreach ( $hero_stats as $s ) : ?>
      <div><b><?php echo esc_html( $s['value'] ); ?></b><span><?php echo esc_html( $s['label'] ); ?></span></div>
      <?php endforeach; ?>
    </div>
    <?php endif; ?>
  </div>
</header>

<!-- ============ LA SFIDA ============ -->
<?php if ( $prob_title || $prob_lead ) : ?>
<section>
  <div class="wrap reveal">
    <?php
    // Tutti i paragrafi in un unico blocco di testo, così restano distanziati
    // fra loro; le righe puntate diventano tessere.
    $prob_paragraphs = array();
    $prob_items      = array();
    foreach ( $ll_blocks( $prob_lead ) as $block ) {
      if ( 'list' === $block['type'] ) {
        $prob_items = array_merge( $prob_items, $block['items'] );
      } else {
        $prob_paragraphs[] = $block['text'];
      }
    }
    $ll_head( $prob_eyebrow, $prob_title );
    ?>
    <?php if ( $prob_paragraphs ) : ?>
    <div class="body-text">
      <?php foreach ( $prob_paragraphs as $paragraph ) : ?><p><?php echo esc_html( $paragraph ); ?></p><?php endforeach; ?>
    </div>
    <?php endif; ?>
    <?php if ( $prob_items ) : ?>
    <ul class="reqs">
      <?php foreach ( $prob_items as $item ) : ?><li><?php echo esc_html( $item ); ?></li><?php endforeach; ?>
    </ul>
    <?php endif; ?>
  </div>
</section>
<?php endif; ?>

<!-- ============ IL LIMITE DELLE TECNOLOGIE TRADIZIONALI ============ -->
<?php if ( $limit_title || $limit_text ) : ?>
<section class="alt">
  <div class="wrap reveal">
    <?php $ll_head( $limit_eyebrow, $limit_title ); ?>
    <?php
    $limit_paragraphs = array();
    foreach ( $ll_blocks( $limit_text ) as $block ) {
      $limit_paragraphs[] = 'list' === $block['type'] ? implode( ' ', $block['items'] ) : $block['text'];
    }
    if ( count( $limit_paragraphs ) >= 2 ) : ?>
    <div class="limits">
      <?php foreach ( $limit_paragraphs as $p ) : ?><div><?php echo esc_html( $p ); ?></div><?php endforeach; ?>
    </div>
    <?php elseif ( $limit_paragraphs ) : ?>
    <div class="body-text"><p><?php echo esc_html( $limit_paragraphs[0] ); ?></p></div>
    <?php endif; ?>
  </div>
</section>
<?php endif; ?>

<!-- ============ LA SOLUZIONE ============ -->
<?php if ( trim( wp_strip_all_tags( (string) $sol_text ) ) !== '' || $sol_title ) : ?>
<section>
  <div class="wrap reveal">
    <?php $ll_head( $sol_eyebrow, $sol_title ); ?>
    <?php if ( trim( wp_strip_all_tags( (string) $sol_text ) ) !== '' ) : ?>
    <div class="solution"><?php echo wp_kses_post( $sol_text ); ?></div>
    <?php endif; ?>
  </div>
</section>
<?php endif; ?>

<!-- ============ I MATERIALI ============ -->
<?php if ( $mat_first['name'] || $mat_first['sub'] || ! empty( $mat_bars ) ) : ?>
<section class="alt">
  <div class="wrap reveal">
    <?php $ll_head( $mat_eyebrow, $mat_title ); ?>
    <div class="material<?php echo $mat_image ? '' : ' material--text'; ?>">
      <?php if ( $mat_image ) : ?>
      <figure class="material__figure">
        <?php $ll_ticks(); ?>
        <img src="<?php echo esc_url( $mat_image ); ?>" alt="<?php echo esc_attr( $mat_first['name'] ); ?>">
      </figure>
      <?php endif; ?>
      <div class="material__body">
        <span class="material__kicker">Materiale</span>
        <?php if ( $mat_first['name'] ) : ?><h3 class="material__name"><?php echo esc_html( $mat_first['name'] ); ?></h3><?php endif; ?>
        <?php if ( $mat_first['sub'] ) : ?><p class="material__sub"><?php echo esc_html( $mat_first['sub'] ); ?></p><?php endif; ?>
        <?php if ( ! empty( $mat_bars ) ) : ?>
        <div class="bars">
          <?php foreach ( $mat_bars as $bar ) : ?>
          <div class="bar">
            <div class="bar__head">
              <span><?php echo esc_html( $bar['label'] ); ?></span>
              <b><?php echo (int) $bar['value']; ?>/10</b>
            </div>
            <div class="bar__track"><i style="width:<?php echo (int) $bar['value'] * 10; ?>%"></i></div>
          </div>
          <?php endforeach; ?>
        </div>
        <?php endif; ?>
      </div>
    </div>
  </div>
</section>
<?php endif; ?>

<!-- ============ PERCHÉ SCEGLIERE LAYERLOOP ============ -->
<?php if ( $why_title || '' !== trim( wp_strip_all_tags( (string) $why_text ) ) ) : ?>
<section>
  <div class="wrap reveal">
    <div class="why-card" data-aura>
      <span class="aura"></span>
      <div class="why-card__inner">
        <div class="sec-head sec-head--center">
          <?php if ( $why_eyebrow ) : ?><span class="eyebrow"><?php echo esc_html( $why_eyebrow ); ?></span><?php else : ?><span class="sec-rule"></span><?php endif; ?>
          <?php if ( $why_title ) : ?><h2 class="sec-title"><?php echo $ll_br( $why_title ); ?></h2><?php endif; ?>
        </div>
        <div class="body-text"><?php echo wp_kses_post( $why_text ); ?></div>
      </div>
    </div>
  </div>
</section>
<?php endif; ?>

<!-- ============ CHIUSURA ============ -->
<?php if ( $final_title || $final_text || $final_cta1 || $final_cta2 ) : ?>
<section class="alt">
  <div class="wrap reveal">
    <div class="closing">
      <?php if ( $final_eyebrow ) : ?><span class="eyebrow"><?php echo esc_html( $final_eyebrow ); ?></span><?php endif; ?>
      <?php if ( $final_title ) : ?><h2><?php echo esc_html( $final_title ); ?></h2><?php endif; ?>
      <?php if ( $final_text ) : ?><p><?php echo esc_html( $final_text ); ?></p><?php endif; ?>
      <div class="cta-row">
        <?php if ( $final_cta1 ) : ?><a class="btn btn--solid btn--arrow" href="<?php echo $anchor; ?>"><?php echo esc_html( $final_cta1 ); ?></a><?php endif; ?>
        <?php if ( $final_cta2 ) : ?><a class="btn btn--ghost" href="<?php echo $anchor; ?>"><?php echo esc_html( $final_cta2 ); ?></a><?php endif; ?>
      </div>
    </div>
  </div>
</section>
<?php endif; ?>
