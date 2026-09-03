<?php
/**
 * Plugin Name: LayerLoop Landing Settore + Studio
 * Description: Landing "settore" standardizzata (hero render→wireframe, confronto, case study, materiali, stampanti, CTA) e Studio pubblico per generare il PDF del case study, le immagini fil di ferro con Gemini e la landing page collegata, senza mai entrare in bacheca. Shortcode: [ll_landing] per la landing, [layerloop_studio] per lo Studio.
 * Version:     2.1.0
 * Author:      LayerLoop 3D
 * Text Domain: layerloop-landing
 *
 * REQUISITI: Advanced Custom Fields (versione GRATUITA sufficiente — nessun campo Pro).
 *            Ninja Forms per la raccolta contatti e la consegna del whitepaper (facoltativo).
 *
 * USO:
 *  1. Attiva il plugin.
 *  2. Metti lo shortcode [layerloop_studio] nella pagina /pdf-generator/.
 *  3. Da quella pagina si fa tutto: case study, PDF IT/EN, fil di ferro AI, landing page.
 *  4. La landing resta modificabile anche da backend via ACF, ma non è necessario.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'LL_LANDING_VERSION', '2.1.0' );
define( 'LL_LANDING_PATH', plugin_dir_path( __FILE__ ) );
define( 'LL_LANDING_URL', plugin_dir_url( __FILE__ ) );

/**
 * Versione di un file statico, comprensiva della data di modifica.
 *
 * Serve a invalidare la cache del browser anche quando si aggiornano i file via FTP
 * senza toccare il numero di versione del plugin: senza, il browser continua a servire
 * il vecchio JavaScript e le novità sembrano non esserci.
 *
 * @param string $relative Percorso relativo alla cartella del plugin.
 * @return string
 */
function ll_landing_asset_version( $relative ) {
	$path = LL_LANDING_PATH . ltrim( $relative, '/' );
	$time = file_exists( $path ) ? filemtime( $path ) : 0;
	return $time ? LL_LANDING_VERSION . '.' . $time : LL_LANDING_VERSION;
}

/** Tipo di contenuto delle landing whitepaper. */
define( 'LL_LANDING_CPT', 'whitepaper' );

// Registrazione campi ACF (via codice: niente da configurare a mano).
require_once LL_LANDING_PATH . 'includes/fields.php';
// Download "gated" del PDF (dopo invio form Ninja Forms).
require_once LL_LANDING_PATH . 'includes/download.php';
// Studio pubblico: impostazioni, accessi, AI, REST, editor.
require_once LL_LANDING_PATH . 'includes/settings.php';
require_once LL_LANDING_PATH . 'includes/roles.php';
require_once LL_LANDING_PATH . 'includes/gemini.php';
require_once LL_LANDING_PATH . 'includes/mapper.php';
require_once LL_LANDING_PATH . 'includes/leads.php';
require_once LL_LANDING_PATH . 'includes/rest.php';
require_once LL_LANDING_PATH . 'includes/studio.php';
require_once LL_LANDING_PATH . 'includes/case-studies.php';

/**
 * Custom Post Type "Whitepaper": una voce di menu dedicata in bacheca.
 * Ogni whitepaper = una landing. URL: /whitepaper/nome-whitepaper/
 *
 * Dalla 2.0 usa capability dedicate, così gli utenti dello Studio possono
 * pubblicare le landing senza ricevere alcun permesso sugli articoli del blog.
 */
add_action( 'init', function () {
	register_post_type( LL_LANDING_CPT, array(
		'labels' => array(
			'name'          => 'Whitepaper',
			'singular_name' => 'Whitepaper',
			'add_new_item'  => 'Aggiungi Whitepaper',
			'edit_item'     => 'Modifica Whitepaper',
		),
		'public'          => true,
		'menu_icon'       => 'dashicons-media-document',
		'has_archive'     => false,
		'rewrite'         => array( 'slug' => 'whitepaper' ),
		'supports'        => array( 'title', 'excerpt', 'thumbnail', 'author' ),
		'show_in_rest'    => true,
		'capability_type' => array( 'll_whitepaper', 'll_whitepapers' ),
		'map_meta_cap'    => true,
	) );
} );

// Ricorda di salvare Impostazioni > Permalink dopo l'attivazione (rigenera i rewrite).
register_activation_hook( __FILE__, 'll_landing_activate' );

/**
 * Attivazione: ruoli, capability, permalink.
 */
function ll_landing_activate() {
	LL_Studio_Roles::install();
	flush_rewrite_rules();
	update_option( 'll_landing_installed', LL_LANDING_VERSION );
}

/**
 * Rigenera permalink e capability una volta per versione del plugin:
 * risolve i 404 su /whitepaper/... e allinea i ruoli anche dopo un semplice
 * aggiornamento dei file via FTP, quando l'hook di attivazione non scatta.
 */
add_action( 'init', function () {
	if ( get_option( 'll_landing_flushed' ) !== LL_LANDING_VERSION ) {
		LL_Studio_Roles::install();
		flush_rewrite_rules();
		update_option( 'll_landing_flushed', LL_LANDING_VERSION );
	}
}, 99 );

/**
 * Sui singoli Whitepaper la landing si renderizza da sola come contenuto:
 * il cliente compila i campi e pubblica — nessuno shortcode necessario.
 */
add_filter( 'the_content', function ( $content ) {
	if ( is_singular( LL_LANDING_CPT ) && in_the_loop() && is_main_query() ) {
		return do_shortcode( '[ll_landing]' );
	}
	return $content;
} );

/**
 * Sulle landing il titolo del post non va mostrato: l'hero ha già il proprio titolo,
 * e il tema stamperebbe una seconda intestazione sopra la pagina.
 *
 * Si interviene solo sul titolo stampato dentro il loop principale della singola
 * landing: menu, breadcrumb, titolo del browser e bacheca restano intatti.
 */
add_filter( 'the_title', function ( $title, $post_id = 0 ) {
	if ( is_admin() || ! is_singular( LL_LANDING_CPT ) ) {
		return $title;
	}
	if ( ! in_the_loop() || ! is_main_query() ) {
		return $title;
	}
	if ( (int) $post_id !== (int) get_queried_object_id() ) {
		return $title;
	}
	if ( ! LL_Studio_Settings::get( 'hide_title', 1 ) ) {
		return $title;
	}
	return '';
}, 10, 2 );

/**
 * Alcuni temi stampano il titolo fuori dal loop: qui lo si nasconde anche via CSS,
 * limitando la regola alla singola landing.
 */
add_action( 'wp_head', function () {
	if ( ! is_singular( LL_LANDING_CPT ) || ! LL_Studio_Settings::get( 'hide_title', 1 ) ) {
		return;
	}
	echo '<style id="ll-hide-title">body.single-' . esc_attr( LL_LANDING_CPT ) . ' .entry-title,'
		. 'body.single-' . esc_attr( LL_LANDING_CPT ) . ' .page-title,'
		. 'body.single-' . esc_attr( LL_LANDING_CPT ) . ' .post-title{display:none!important}</style>';
}, 99 );

/**
 * Registra gli asset. Vengono accodati solo quando lo shortcode è in pagina.
 */
add_action( 'wp_enqueue_scripts', function () {
	wp_register_style(
		'll-landing-font',
		'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
		array(),
		null
	);
	wp_register_style(
		'll-landing',
		LL_LANDING_URL . 'assets/landing.css',
		array( 'll-landing-font' ),
		ll_landing_asset_version( 'assets/landing.css' )
	);
	wp_register_script(
		'll-landing',
		LL_LANDING_URL . 'assets/landing.js',
		array(),
		ll_landing_asset_version( 'assets/landing.js' ),
		true // footer
	);
} );

/**
 * Shortcode [ll_landing]
 */
add_shortcode( 'll_landing', function () {
	if ( ! function_exists( 'get_field' ) ) {
		return '<p><strong>LayerLoop Landing:</strong> richiede il plugin Advanced Custom Fields (anche la versione gratuita va bene).</p>';
	}

	wp_enqueue_style( 'll-landing' );
	wp_enqueue_script( 'll-landing' );

	ob_start();
	include LL_LANDING_PATH . 'templates/landing.php';
	return ob_get_clean();
} );

/**
 * Avvio dei moduli dello Studio.
 */
add_action( 'plugins_loaded', function () {
	( new LL_Studio_Settings() )->register();
	( new LL_Studio_Roles() )->register();
	( new LL_Studio_Rest() )->register();
	( new LL_Studio_Leads() )->register();
	( new LL_Studio_Shortcode() )->register();
	( new LL_Studio_Case_Studies() )->register();
} );
