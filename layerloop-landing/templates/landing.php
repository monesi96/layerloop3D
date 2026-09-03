<?php
/**
 * Template della Landing Settore (solo ACF gratuito: nessun ripetitore).
 * Le liste arrivano da aree di testo "una voce per riga".
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/* ---------- helper ---------- */
$ll = function ( $name, $default = '' ) {
	$v = get_field( $name );
	return ( $v !== null && $v !== '' && $v !== false ) ? $v : $default;
};
$ll_br = function ( $text ) {
	return implode( '<br>', array_map( 'esc_html', explode( '|', $text ) ) );
};
// "una voce per riga" -> array di righe non vuote
$ll_lines = function ( $text ) {
	$out = array();
	foreach ( preg_split( '/\r\n|\r|\n/', (string) $text ) as $l ) {
		$l = trim( $l );
		if ( $l !== '' ) {
			$out[] = $l;
		}
	}
	return $out;
};
// "a | b" -> array( 'a', 'b' )
$ll_pair = function ( $line ) {
	if ( strpos( $line, '|' ) !== false ) {
		$p = array_map( 'trim', explode( '|', $line, 2 ) );
		return array( $p[0], isset( $p[1] ) ? $p[1] : '' );
	}
	return array( trim( $line ), '' );
};

$def_imgs = function_exists( 'll_landing_default_images' ) ? ll_landing_default_images() : array( 'materials' => array(), 'printers' => array() );
$anchor   = esc_url( $ll( 'll_anchor', '#contatti' ) );

/* ---------- HERO ---------- */
$hero_eyebrow = $ll( 'll_hero_eyebrow', 'Raccordi & soffietti flessibili' );
$hero_title   = $ll( 'll_hero_title', 'Soffietti flessibili,|on-demand.' );
$hero_lead    = $ll( 'll_hero_lead', 'In Layflex e Foam, direttamente in stampa 3D. Senza stampi, senza quantitativi minimi. Da 1 pezzo.' );
$hero_hint    = $ll( 'll_hero_hint', 'Passa il mouse →' );
$hero_cta1    = $ll( 'll_hero_cta1', 'Richiedi una demo live' );
$hero_cta2    = $ll( 'll_hero_cta2', 'Scarica il whitepaper' );
/*
 * Le landing create dallo Studio non ereditano le immagini di esempio: mostrerebbero
 * il prodotto di un'altra scheda. Le pagine precedenti mantengono il ripiego storico.
 */
$ll_from_studio = (bool) get_post_meta( get_the_ID(), '_ll_studio_payload', true );
$img_render     = $ll( 'll_hero_img_render', $ll_from_studio ? '' : 'https://www.layerloop3d.com/wp-content/uploads/2026/07/raccordo.png' );
$img_wire       = $ll( 'll_hero_img_wire', $ll_from_studio ? '' : 'https://www.layerloop3d.com/wp-content/uploads/2026/07/wireframe_raccordo.png' );

/*
 * L'effetto render → wireframe richiede due immagini scontornate con la stessa
 * inquadratura. Con una sola immagine si mostra quella, senza maschera: sovrapporre
 * un wireframe con il fondo pieno coprirebbe il render invece di rivelarlo.
 */
$hero_base    = $img_render ? $img_render : $img_wire;
$hero_overlay = ( $img_render && $img_wire ) ? $img_wire : '';
if ( ! $hero_overlay ) {
	$hero_hint = '';
}
$meta_parts   = explode( '|', $ll( 'll_meta', 'LayerLoop 3D|Whitepaper 01 / 2026|Manifattura & Automazione' ) );

$hero_stats = array();
foreach ( $ll_lines( $ll( 'll_hero_stats', "~1h15 | tempo di stampa\n~50 g | peso pezzo\n€3,30 | al pezzo" ) ) as $line ) {
	list( $v, $l ) = $ll_pair( $line );
	$hero_stats[] = array( 'value' => $v, 'label' => $l );
}

/* ---------- PROBLEMA ---------- */
$prob_index    = $ll( 'll_prob_index', '01 / 05' );
$prob_eyebrow  = $ll( 'll_prob_eyebrow', 'Il problema' );
$prob_title    = $ll( 'll_prob_title', 'Lo stampo non regge le piccole serie' );
$prob_lead     = $ll( 'll_prob_lead', 'I soffietti flessibili su misura richiedono stampi a iniezione dedicati e MOQ elevati. Con LayerLoop NEXT il pezzo esce direttamente dalla stampante.' );
$cmp_old_title = $ll( 'll_cmp_old_title', 'Stampo a iniezione' );
$cmp_new_title = $ll( 'll_cmp_new_title', 'LayerLoop NEXT' );
$cmp_old       = $ll_lines( $ll( 'll_cmp_old', "Stampo dedicato costoso\nMOQ (quantità minima) elevato\nSettimane di attesa per l'attrezzatura\nOgni modifica = nuovo stampo" ) );
$cmp_new       = $ll_lines( $ll( 'll_cmp_new', "Nessuno stampo\nProduzione da 1 pezzo\n~1h15 a pezzo, produzione 24/7\nIteri il file CAD e ristampi subito" ) );

/* ---------- SOLUZIONE ---------- */
$sol_index   = $ll( 'll_sol_index', '02 / 05' );
$sol_eyebrow = $ll( 'll_sol_eyebrow', 'La soluzione' );
$sol_text    = $ll( 'll_sol_text', '<p>Con <b>Layerloop NEXT</b> il soffietto si stampa direttamente nella sua forma flessibile, senza stampo e senza minimi d\'ordine: in <b>Layflex</b> (TPU similgomma) per un comportamento elastico controllato, oppure in <b>Foam</b> quando serve maggiore deformabilità e smorzamento. L\'asse di stampa inclinato a <b>30°</b> produce il pezzo finito senza supporti, anche sulle geometrie a fisarmonica, e la produzione gira <b>h24 senza operatore</b>.</p>' );

/* ---------- RISULTATO ---------- */
$case_index   = $ll( 'll_case_index', '03 / 05' );
$case_eyebrow = $ll( 'll_case_eyebrow', 'Il risultato' );
$case_title   = $ll( 'll_case_title', 'Dal file al pezzo, stampato' );
$case_photo   = $ll( 'll_case_photo', $ll_from_studio ? '' : 'https://www.layerloop3d.com/wp-content/uploads/2026/07/case_raccordo.jpg' );
$case_lead    = $ll( 'll_case_lead', 'Un soffietto reale, prodotto senza stampo: stessa geometria a fisarmonica del file CAD, pronto all\'uso appena finita la stampa. Ogni misura parte da un nuovo file, non da un nuovo stampo.' );
$case_cta     = $ll( 'll_case_cta', 'Richiedi un campione' );
$case_specs   = array();
foreach ( $ll_lines( $ll( 'll_case_specs', "37×37×90 | mm\n~1h15 | stampa\n~50 g | materiale\n€3,30–3,50 | al pezzo" ) ) as $line ) {
	list( $v, $l ) = $ll_pair( $line );
	$case_specs[] = array( 'value' => $v, 'label' => $l );
}

/* ---------- PERCHÉ CONVIENE ---------- */
$why_eyebrow = $ll( 'll_why_eyebrow', 'Perché conviene' );
$why_title   = $ll( 'll_why_title', 'Zero stampo, zero MOQ,|produzione on-demand.' );
$why_text    = $ll( 'll_why_text', '<p>Durezza, passo del soffietto e diametri variano da file a file senza costi di attrezzaggio: <b>ogni misura è un nuovo file, non un nuovo stampo.</b></p>' );

/* ---------- MATERIALI ---------- */
$mat_index   = $ll( 'll_mat_index', '04 / 05' );
$mat_eyebrow = $ll( 'll_mat_eyebrow', 'Materiali' );
$mat_title   = $ll( 'll_mat_title', 'Due materiali, un processo' );
$mat_def_img = isset( $def_imgs['materials'] ) ? $def_imgs['materials'] : array();

$materials = array();
for ( $i = 1; $i <= 3; $i++ ) {
	$name = $ll( "ll_mat{$i}_name", '' );
	if ( $name === '' ) {
		continue;
	}
	$img = $ll( "ll_mat{$i}_img", '' );
	if ( $img === '' && isset( $mat_def_img[ $i - 1 ] ) ) {
		$img = $mat_def_img[ $i - 1 ];
	}
	$materials[] = array(
		'name'   => $name,
		'sub'    => $ll( "ll_mat{$i}_sub", '' ),
		'image'  => $img,
		'points' => $ll_lines( $ll( "ll_mat{$i}_points", '' ) ),
	);
}
// dati per il JS dei tab
$materials_js = array();
foreach ( $materials as $i => $m ) {
	$materials_js[ 'mat-' . $i ] = array(
		'img'    => $m['image'],
		'sub'    => $m['sub'],
		'name'   => $m['name'],
		'points' => $m['points'],
	);
}

/* ---------- STAMPANTI ---------- */
$pr_index   = $ll( 'll_pr_index', '05 / 05' );
$pr_eyebrow = $ll( 'll_pr_eyebrow', 'Le stampanti' );
$pr_title   = $ll( 'll_pr_title', 'Scegli la piattaforma' );
$pr_def_img = isset( $def_imgs['printers'] ) ? $def_imgs['printers'] : array();

$printers = array();
for ( $i = 1; $i <= 2; $i++ ) {
	$name = $ll( "ll_pr{$i}_name", '' );
	if ( $name === '' ) {
		continue;
	}
	$img = $ll( "ll_pr{$i}_img", '' );
	if ( $img === '' && isset( $pr_def_img[ $i - 1 ] ) ) {
		$img = $pr_def_img[ $i - 1 ];
	}
	$specs = array();
	foreach ( $ll_lines( $ll( "ll_pr{$i}_specs", '' ) ) as $line ) {
		list( $l, $v ) = $ll_pair( $line );
		$specs[] = array( 'label' => $l, 'value' => $v );
	}
	$printers[] = array(
		'name'      => $name,
		'image'     => $img,
		'specs'     => $specs,
		'cta_label' => $ll( "ll_pr{$i}_cta", '' ),
		'cta_link'  => $ll( "ll_pr{$i}_link", '' ),
		'cta_style' => $ll( "ll_pr{$i}_style", 'solid' ),
	);
}

/* ---------- CTA FINALE ---------- */
$final_eyebrow = $ll( 'll_final_eyebrow', 'Inizia qui' );
$final_title   = $ll( 'll_final_title', 'Parliamo del tuo progetto' );
$final_text    = $ll( 'll_final_text', 'Portaci un componente flessibile e ti mostriamo come automatizzarne la produzione, senza stampi.' );
$final_cta1    = $ll( 'll_final_cta1', 'Richiedi una demo live' );
$final_cta2    = $ll( 'll_final_cta2', 'Scarica il whitepaper' );
?>
<div class="ll-landing">

<!-- ============ HERO ============ -->
<header class="hero">
  <div class="wrap">
    <div class="hero__meta reveal in">
      <?php foreach ( $meta_parts as $mp ) : ?><span><?php echo esc_html( trim( $mp ) ); ?></span><?php endforeach; ?>
    </div>
    <div class="hero__intro">
      <span class="eyebrow reveal in"><?php echo esc_html( $hero_eyebrow ); ?></span>
      <h1 class="reveal in" style="--d:.05s"><?php echo $ll_br( $hero_title ); ?></h1>
      <p class="lead reveal in" style="--d:.12s"><?php echo esc_html( $hero_lead ); ?></p>
      <div class="cta-row reveal in" style="--d:.18s">
        <?php if ( $hero_cta1 ) : ?><a class="btn btn--solid btn--arrow" href="<?php echo $anchor; ?>"><?php echo esc_html( $hero_cta1 ); ?></a><?php endif; ?>
        <?php if ( $hero_cta2 ) : ?><a class="btn btn--ghost" href="<?php echo $anchor; ?>"><?php echo esc_html( $hero_cta2 ); ?></a><?php endif; ?>
      </div>
    </div>

    <div class="reveal in" style="--d:.22s">
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
            <?php if ( $hero_base ) : ?>
              <image href="<?php echo esc_url( $hero_base ); ?>" xlink:href="<?php echo esc_url( $hero_base ); ?>"
                     x="0" y="0" width="1280" height="680" preserveAspectRatio="xMidYMid meet"/>
            <?php endif; ?>
            <?php if ( $hero_overlay ) : ?>
              <image href="<?php echo esc_url( $hero_overlay ); ?>" xlink:href="<?php echo esc_url( $hero_overlay ); ?>"
                     x="0" y="0" width="1280" height="680" preserveAspectRatio="xMidYMid meet" mask="url(#liquidMask)"/>
            <?php endif; ?>
          </svg>
        </div>
      </div>
    </div>

    <?php if ( ! empty( $hero_stats ) ) : ?>
    <div class="hero-stats reveal in" style="--d:.28s">
      <?php foreach ( $hero_stats as $s ) : ?>
      <div><b><?php echo esc_html( $s['value'] ); ?></b><span><?php echo esc_html( $s['label'] ); ?></span></div>
      <?php endforeach; ?>
    </div>
    <?php endif; ?>
  </div>
</header>

<!-- ============ 01 · PROBLEMA ============ -->
<section>
  <div class="wrap reveal">
    <div class="sec-head">
      <div><span class="eyebrow"><?php echo esc_html( $prob_eyebrow ); ?></span><h2 class="sec-title"><?php echo esc_html( $prob_title ); ?></h2></div>
      <span class="sec-index"><?php echo esc_html( $prob_index ); ?></span>
    </div>
    <p class="sec-lead"><?php echo esc_html( $prob_lead ); ?></p>
    <div class="compare">
      <div class="col col--old">
        <div class="col-head"><?php echo esc_html( $cmp_old_title ); ?></div>
        <ul>
          <?php foreach ( $cmp_old as $t ) : ?><li><span class="ic">✕</span> <?php echo esc_html( $t ); ?></li><?php endforeach; ?>
        </ul>
      </div>
      <div class="col col--new">
        <div class="col-head"><?php echo esc_html( $cmp_new_title ); ?></div>
        <ul>
          <?php foreach ( $cmp_new as $t ) : ?><li><span class="ic">✓</span> <?php echo esc_html( $t ); ?></li><?php endforeach; ?>
        </ul>
      </div>
    </div>
  </div>
</section>

<!-- ============ 02 · SOLUZIONE ============ -->
<section style="background:var(--panel)">
  <div class="wrap reveal">
    <div class="sec-head">
      <span class="eyebrow"><?php echo esc_html( $sol_eyebrow ); ?></span>
      <span class="sec-index"><?php echo esc_html( $sol_index ); ?></span>
    </div>
    <div class="sol-card"><?php echo wp_kses_post( $sol_text ); ?></div>
  </div>
</section>

<!-- ============ 03 · RISULTATO ============ -->
<section style="background:#fff">
  <div class="wrap reveal">
    <div class="sec-head">
      <div><span class="eyebrow"><?php echo esc_html( $case_eyebrow ); ?></span><h2 class="sec-title"><?php echo esc_html( $case_title ); ?></h2></div>
      <span class="sec-index"><?php echo esc_html( $case_index ); ?></span>
    </div>
    <div class="case-grid">
      <div class="case-figure">
        <?php if ( $case_photo ) : ?>
        <div class="case-photo">
          <img src="<?php echo esc_url( $case_photo ); ?>" alt="<?php echo esc_attr( $case_title ); ?>">
        </div>
        <?php endif; ?>
        <?php if ( ! empty( $case_specs ) ) : ?>
        <div class="case-glass">
          <?php foreach ( $case_specs as $s ) : ?>
          <div class="g"><b><?php echo esc_html( $s['value'] ); ?></b><span><?php echo esc_html( $s['label'] ); ?></span></div>
          <?php endforeach; ?>
        </div>
        <?php endif; ?>
      </div>
      <div class="case-text">
        <p class="sec-lead"><?php echo esc_html( $case_lead ); ?></p>
        <?php if ( $case_cta ) : ?><a class="btn btn--solid btn--arrow" href="<?php echo $anchor; ?>"><?php echo esc_html( $case_cta ); ?></a><?php endif; ?>
      </div>
    </div>
  </div>
</section>

<!-- ============ PERCHÉ CONVIENE (full-width) ============ -->
<section class="why-full" data-aura>
  <span class="aura"></span>
  <div class="wrap reveal">
    <div class="grid">
      <div>
        <span class="eyebrow"><?php echo esc_html( $why_eyebrow ); ?></span>
        <h2><?php echo $ll_br( $why_title ); ?></h2>
      </div>
      <?php echo wp_kses_post( $why_text ); ?>
    </div>
  </div>
</section>

<!-- ============ 04 · MATERIALI ============ -->
<?php if ( ! empty( $materials ) ) : ?>
<section style="background:#fff">
  <div class="wrap reveal">
    <div class="sec-head">
      <div><span class="eyebrow"><?php echo esc_html( $mat_eyebrow ); ?></span><h2 class="sec-title"><?php echo esc_html( $mat_title ); ?></h2></div>
      <span class="sec-index"><?php echo esc_html( $mat_index ); ?></span>
    </div>
    <div class="mat-tabs" id="matTabs" role="tablist">
      <?php foreach ( $materials as $i => $m ) : ?>
      <button class="mat-tab" role="tab" aria-selected="<?php echo $i === 0 ? 'true' : 'false'; ?>" data-mat="mat-<?php echo (int) $i; ?>">
        <span class="dot" data-dot="mat-<?php echo (int) $i; ?>"></span><?php echo esc_html( $m['name'] ); ?>
      </button>
      <?php endforeach; ?>
    </div>
    <div class="mat-panel">
      <div class="mat-swatch"><div class="img" id="matImg"></div></div>
      <div class="mat-info" id="matInfo"></div>
    </div>
  </div>
</section>
<?php endif; ?>

<!-- ============ 05 · STAMPANTI ============ -->
<?php if ( ! empty( $printers ) ) : ?>
<section style="background:var(--panel)">
  <div class="wrap reveal">
    <div class="sec-head">
      <div><span class="eyebrow"><?php echo esc_html( $pr_eyebrow ); ?></span><h2 class="sec-title"><?php echo esc_html( $pr_title ); ?></h2></div>
      <span class="sec-index"><?php echo esc_html( $pr_index ); ?></span>
    </div>
    <div class="printers">
      <?php foreach ( $printers as $p ) :
        $btn_class = ( 'ghost' === $p['cta_style'] ) ? 'btn--ghost' : 'btn--solid btn--arrow';
        $btn_link  = ! empty( $p['cta_link'] ) ? esc_url( $p['cta_link'] ) : $anchor;
      ?>
      <div class="printer">
        <div class="ph"><?php if ( $p['image'] ) : ?><img src="<?php echo esc_url( $p['image'] ); ?>" alt="<?php echo esc_attr( $p['name'] ); ?>"><?php endif; ?></div>
        <div class="body">
          <h3><?php echo esc_html( $p['name'] ); ?></h3>
          <?php if ( ! empty( $p['specs'] ) ) : ?>
          <ul class="spec">
            <?php foreach ( $p['specs'] as $s ) : ?>
            <li><span><?php echo esc_html( $s['label'] ); ?></span><span><?php echo esc_html( $s['value'] ); ?></span></li>
            <?php endforeach; ?>
          </ul>
          <?php endif; ?>
          <?php if ( ! empty( $p['cta_label'] ) ) : ?><a class="btn <?php echo $btn_class; ?>" href="<?php echo $btn_link; ?>"><?php echo esc_html( $p['cta_label'] ); ?></a><?php endif; ?>
        </div>
      </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>
<?php endif; ?>

<!-- ============ CTA FINALE ============ -->
<section style="background:#fff">
  <div class="wrap reveal">
    <div class="finalcta" data-aura>
      <span class="aura"></span>
      <span class="eyebrow"><?php echo esc_html( $final_eyebrow ); ?></span>
      <h2><?php echo esc_html( $final_title ); ?></h2>
      <p><?php echo esc_html( $final_text ); ?></p>
      <div class="cta-row">
        <?php if ( $final_cta1 ) : ?><a class="btn btn--solid btn--arrow" href="<?php echo $anchor; ?>"><?php echo esc_html( $final_cta1 ); ?></a><?php endif; ?>
        <?php if ( $final_cta2 ) : ?><a class="btn btn--ghost" href="<?php echo $anchor; ?>"><?php echo esc_html( $final_cta2 ); ?></a><?php endif; ?>
      </div>
    </div>
  </div>
</section>

<?php
/* ---------- BLOCCHI DI CHIUSURA (uno per riga: ID template o shortcode) ---------- */
$closing_lines = $ll_lines( $ll( 'll_closing_lines', '' ) );
if ( empty( $closing_lines ) ) {
	// migrazione dal vecchio campo singolo
	$legacy = trim( (string) get_field( 'll_contact_template' ) );
	if ( $legacy !== '' ) {
		$closing_lines = array( $legacy . ' | contatti' );
	}
}
if ( ! empty( $closing_lines ) ) {
	// il primo blocco riceve #contatti se nessuno lo rivendica
	$has_contatti = false;
	foreach ( $closing_lines as $line ) {
		if ( preg_match( '/\|\s*#?contatti\s*$/i', $line ) ) { $has_contatti = true; break; }
	}
	foreach ( $closing_lines as $line ) {
		$aid = '';
		if ( strpos( $line, '|' ) !== false ) {
			list( $content, $a ) = $ll_pair( $line );
			$aid = ltrim( $a, '#' );
		} else {
			$content = trim( $line );
		}
		if ( $content === '' ) { continue; }
		if ( $aid === '' && ! $has_contatti ) { $aid = 'contatti'; $has_contatti = true; }
		$out    = ctype_digit( $content ) ? do_shortcode( '[elementor-template id="' . esc_attr( $content ) . '"]' ) : do_shortcode( $content );
		$idattr = $aid !== '' ? ' id="' . esc_attr( $aid ) . '"' : '';
		echo '<section' . $idattr . ' class="ll-closing">' . $out . '</section>';
	}
}
?>

</div><!-- /.ll-landing -->

<?php
/* Dati materiali per il JS dei tab: agganciati allo script (ordine garantito anche con
   plugin di cache/ottimizzazione JS). Fallback: tag inline. */
$ll_boot = 'window.LL_MATERIALS = ' . wp_json_encode( $materials_js ) . ';';

// Download PDF gated: passa l'URL dell'endpoint solo se è stato caricato un PDF e se
// la consegna prevede il download immediato (Whitepaper → Impostazioni Studio).
$ll_delivery = class_exists( 'LL_Studio_Settings' ) ? LL_Studio_Settings::get( 'delivery_mode', 'both' ) : 'both';
if ( get_field( 'll_pdf' ) && in_array( $ll_delivery, array( 'download', 'both' ), true ) ) {
	$ll_dl   = home_url( '/?ll_wp_pdf=' . (int) get_the_ID() );
	$ll_boot .= 'window.LL_WP_DOWNLOAD = ' . wp_json_encode( esc_url_raw( $ll_dl ) ) . ';';
}

if ( wp_script_is( 'll-landing', 'enqueued' ) || wp_script_is( 'll-landing', 'registered' ) ) {
	wp_add_inline_script( 'll-landing', $ll_boot, 'before' );
} else {
	echo '<script>' . $ll_boot . '</script>';
}
?>
