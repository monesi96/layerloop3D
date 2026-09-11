<?php

include('bs4navwalker.php');
//include('breadcrumb.php');

/*
function maintenace_mode() {
  if ( !current_user_can( 'administrator' ) ) {
    wp_die('Sito in manutenzione.');
  }
}
add_action('get_header', 'maintenace_mode');
*/
if ( ! function_exists( 'smartlab_setup' ) ) :
/**
 * @since Twenty Sixteen 1.0
 */
function smartlab_setup() {

	load_theme_textdomain( 'smartlab' );

	// Add default posts and comments RSS feed links to head.
	add_theme_support( 'automatic-feed-links' );

	add_theme_support( 'post-thumbnails' );
	//set_post_thumbnail_size( 640, 640, array( 'center', 'center')  );
	add_image_size('post_prd_thm1', 640, 480, array('center', 'center'));

	//add_filter ( 'show_admin_bar', '__return_false');

	add_theme_support( 'yoast-seo-breadcrumbs' );

	/* WooCommerce */

	function mytheme_add_woocommerce_support() {
		add_theme_support( 'woocommerce' );
	}
	add_action( 'after_setup_theme', 'mytheme_add_woocommerce_support' );

	remove_action( 'woocommerce_after_shop_loop_item', 'woocommerce_template_loop_add_to_cart' );
	remove_action( 'woocommerce_single_product_summary', 'woocommerce_template_single_add_to_cart', 30 );

	//add_filter('woocommerce_empty_price_html', 'newbutton_form_woocommerce');

	function newbutton_form_woocommerce() {
	    //$html = '<a href="#tab-preventivo" class="btn-link-prd azdPrv">Richiedi informazioni</a>';
	    //$html .=  '<div id="product_inq" style="display:none">';
	    //$html .= do_shortcode('[Shortcode del vostro Contact Form]');
	    //$html .=  '</div>';
	    return $html;
	}

	// remove default sorting dropdown
	remove_action( 'woocommerce_before_shop_loop', 'woocommerce_catalog_ordering', 30 );

	// Remove the result count from WooCommerce
	remove_action( 'woocommerce_before_shop_loop' , 'woocommerce_result_count', 20 );

	//Creiamo il tab personalizzato
	function wpspecial_product_tab( $tabs ) {
		$tabs['preventivo'] = array(
			'title' 	=> __( 'Richiedi informazioni', 'woocommerce' ),
			'priority' 	=> 50,
			'callback' 	=> 'wpspecial_product_tab_content'
		);
		return $tabs;
	}
	add_filter( 'woocommerce_product_tabs', 'wpspecial_product_tab' );

	//Inseriamo il contenuto del tab
	function wpspecial_product_tab_content() {
		echo '<div class="contPrv" id="#preventivo">';
		echo do_shortcode('[ninja_form id=9]');
		echo '</div>';
	}

	add_filter('woocommerce_after_shop_loop', 'desc_cat_agg');

	function desc_cat_agg() {

		$term = get_queried_object();
		$slug_category = $term->slug;
		$cat_id = $term->term_id;

		$slug_category_page = $slug_category.'__';
		//echo $slug_category_page;

		$pageID = get_page_by_path($slug_category_page);
		//echo $pageID->ID;

		if(!empty($pageID)) {
			$p = get_post($pageID);
			if($p) {
				$content = apply_filters('the_content', $p->post_content);
				echo $content;
			}
		}

		//var_dump($page);

	}

	/* Fine Woocommerce */

	// This theme uses wp_nav_menu() in two locations.
	register_nav_menus( array(
		'primary' => __( 'Top Menu', 'smartlab' ),
		'footer'  => __( 'Footer', 'smartlab' ),
		'privacy'  => __( 'Privacy', 'smartlab' ),
	) );
}
endif; // smartlab_setup

add_action( 'after_setup_theme', 'smartlab_setup' );

function smartlab_widgets_init() {

	register_sidebar(
		array(
			'name'          => __( 'rightMenu', 'smartlab' ),
			'id'            => 'rightMenu',
			'description'   => __( '', 'smartlab' ),
			'before_widget' => '<section id="%1$s" class="widget-right %2$s">',
			'after_widget'  => '</section>',
			'before_title'  => '<h2 class="widget-title-right">',
			'after_title'   => '</h2>',
		)
	);

	register_sidebar(
		array(
			'name'          => __( 'langTop', 'smartlab' ),
			'id'            => 'langTop',
			'description'   => __( '', 'smartlab' ),
			'before_widget' => '<section id="%1$s" class="widget %2$s">',
			'after_widget'  => '</section>',
			'before_title'  => '<h2 class="widget-title">',
			'after_title'   => '</h2>',
		)
	);

	register_sidebar(
		array(
			'name'          => __( 'btmQt1', 'smartlab' ),
			'id'            => 'btmQt1',
			'description'   => __( '', 'smartlab' ),
			'before_widget' => '<section id="%1$s" class="widget %2$s">',
			'after_widget'  => '</section>',
			'before_title'  => '<span class="titleW">',
			'after_title'   => '</span><br />',
		)
	);

	register_sidebar(
		array(
			'name'          => __( 'btmQt2', 'smartlab' ),
			'id'            => 'btmQt2',
			'description'   => __( '', 'smartlab' ),
			'before_widget' => '<section id="%1$s" class="widget %2$s">',
			'after_widget'  => '</section>',
			'before_title'  => '<h2 class="titleW">',
			'after_title'   => '</h2>',
		)
	);

	register_sidebar(
		array(
			'name'          => __( 'btmQt3', 'smartlab' ),
			'id'            => 'btmQt3',
			'description'   => __( '', 'smartlab' ),
			'before_widget' => '<section id="%1$s" class="widget %2$s">',
			'after_widget'  => '</section>',
			'before_title'  => '<h2 class="titleW">',
			'after_title'   => '</h2>',
		)
	);

	register_sidebar(
		array(
			'name'          => __( 'btmQt4', 'smartlab' ),
			'id'            => 'btmQt4',
			'description'   => __( '', 'smartlab' ),
			'before_widget' => '<section id="%1$s" class="widget %2$s">',
			'after_widget'  => '</section>',
			'before_title'  => '<h2 class="titleW">',
			'after_title'   => '</h2>',
		)
	);

	register_sidebar(
		array(
			'name'          => __( 'sidebarDX', 'smartlab' ),
			'id'            => 'sidebarDX',
			'description'   => __( '', 'smartlab' ),
			'before_widget' => '<section id="%1$s" class="widget %2$s">',
			'after_widget'  => '</section>',
			'before_title'  => '<span class="titleW">',
			'after_title'   => '</span><br />',
		)
	);

}
add_action( 'widgets_init', 'smartlab_widgets_init' );

// load css and js into the website's front-end

function smartlab_enqueue_style() {
	wp_enqueue_style('Bootstrap_css', 'https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css?display=swap');
    wp_enqueue_style('StyleLayout', get_template_directory_uri().'/css/style.css');
	wp_enqueue_style('StyleCarousel', get_template_directory_uri().'/css/owl.carousel.min.css');
	wp_enqueue_style('StyleLayoutFnt', get_template_directory_uri().'/fontasweone/css/all.css?display=swap');

	wp_enqueue_script('JQuery3', 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min.js?display=swap');
	wp_enqueue_script('BootstrapJs', 'https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js?display=swap');
	wp_enqueue_script('CarouselJs', get_template_directory_uri().'/js/owl.carousel.min.js');

}
add_action('wp_enqueue_scripts', 'smartlab_enqueue_style', 30);

/* ============================================================
   LOGIN NASCOSTO — wp-login.php raggiungibile solo con la chiave
   ------------------------------------------------------------
   Un solo meccanismo, volutamente: il "gate" su login_init.
   Le vecchie login_wp_nascosto() (hook login_head) e login_attuale()
   (hook init) sono state rimosse perche' si sovrapponevano a questo
   e causavano il redirect in fase di login.

   VIA DI FUGA: se resti chiuso fuori, in wp-config.php aggiungi
       define( 'SMARTLAB_LOGIN_GATE_OFF', true );
   e wp-login.php torna raggiungibile senza chiave.
   ============================================================ */

if ( ! defined( 'SMARTLAB_LOGIN_KEY' ) ) {
	define( 'SMARTLAB_LOGIN_KEY', 'adm_2ld' );
}

// Valore non vuoto: "adm_2ld=1" sopravvive a cache, proxy e esc_url(),
// mentre "adm_2ld=" (valore vuoto) viene a volte scartato.
if ( ! defined( 'SMARTLAB_LOGIN_VALUE' ) ) {
	define( 'SMARTLAB_LOGIN_VALUE', '1' );
}

function smartlab_login_gate_is_active() {
	return ! ( defined( 'SMARTLAB_LOGIN_GATE_OFF' ) && SMARTLAB_LOGIN_GATE_OFF );
}

// La chiave vale sia in GET sia in POST (vedi campo nascosto piu' sotto):
// cosi' l'invio del form passa anche se la query string dell'action viene
// perduta da un plugin, da un proxy o da una regola di rewrite.
function smartlab_login_key_present() {
	return isset( $_REQUEST[ SMARTLAB_LOGIN_KEY ] );
}

function smartlab_login_current_action() {
	return isset( $_REQUEST['action'] ) ? sanitize_key( $_REQUEST['action'] ) : 'login';
}

// Richieste che devono passare SEMPRE: se le blocchi rompi WordPress
// (logout, password dei contenuti protetti, link di reset via email...).
function smartlab_login_action_is_exempt() {

	$esenti = array(
		'logout',
		'postpass',
		'rp',
		'resetpass',
		'resetpassword',
		'confirmaction',
		'confirm_admin_email',
		'entered_recovery_mode',
	);

	if ( in_array( smartlab_login_current_action(), $esenti, true ) ) {
		return true;
	}

	// Login "interstiziale": il modale che l'admin mostra a sessione scaduta.
	if ( isset( $_REQUEST['interim-login'] ) ) {
		return true;
	}

	return false;
}

function smartlab_login_gate() {

	if ( ! smartlab_login_gate_is_active() ) {
		return;
	}

	if ( smartlab_login_key_present() ) {
		return;
	}

	if ( smartlab_login_action_is_exempt() ) {
		return;
	}

	// Chi e' gia' autenticato non va buttato fuori.
	if ( is_user_logged_in() ) {
		return;
	}

	// Niente redirect su POST: un 302 trasforma il POST in GET e perde le
	// credenziali, ed e' esattamente cio' che sembra un "redirect loop".
	if ( 'POST' === strtoupper( $_SERVER['REQUEST_METHOD'] ) ) {
		status_header( 403 );
		nocache_headers();
		wp_die( __( 'Accesso non consentito.', 'smartlab' ), '', array( 'response' => 403 ) );
	}

	wp_safe_redirect( home_url( '/' ), 302 );
	exit;
}
add_action( 'login_init', 'smartlab_login_gate', 1 );

// Se sei gia' dentro, wp-login.php ti porta all'admin invece di
// rimostrarti il form (tranne quando WP chiede esplicitamente reauth).
function smartlab_login_skip_when_logged_in() {

	if ( 'login' !== smartlab_login_current_action() ) {
		return;
	}

	if ( ! empty( $_REQUEST['reauth'] ) || isset( $_REQUEST['interim-login'] ) ) {
		return;
	}

	if ( 'GET' !== strtoupper( $_SERVER['REQUEST_METHOD'] ) ) {
		return;
	}

	if ( ! is_user_logged_in() ) {
		return;
	}

	wp_safe_redirect( admin_url() );
	exit;
}
add_action( 'login_init', 'smartlab_login_skip_when_logged_in', 2 );

// La chiave viaggia anche come campo nascosto dentro i form di wp-login.php.
function smartlab_login_key_field() {
	printf(
		'<input type="hidden" name="%s" value="%s" />' . "\n",
		esc_attr( SMARTLAB_LOGIN_KEY ),
		esc_attr( SMARTLAB_LOGIN_VALUE )
	);
}
add_action( 'login_form',        'smartlab_login_key_field' );
add_action( 'lostpassword_form', 'smartlab_login_key_field' );
add_action( 'resetpass_form',    'smartlab_login_key_field' );
add_action( 'register_form',     'smartlab_login_key_field' );

// Propaga la chiave su tutti gli URL di login generati da WordPress.
function smartlab_add_login_key( $url ) {
	return add_query_arg( SMARTLAB_LOGIN_KEY, SMARTLAB_LOGIN_VALUE, $url );
}
add_filter( 'login_url',        'smartlab_add_login_key' );
add_filter( 'lostpassword_url', 'smartlab_add_login_key' );
add_filter( 'logout_url',       'smartlab_add_login_key' );
add_filter( 'register_url',     'smartlab_add_login_key' );

// Copre l'action del form (scheme login_post) e gli altri URL di wp-login.php.
function smartlab_login_post_url( $url, $path, $scheme ) {

	if ( 'login_post' !== $scheme && 'login' !== $scheme ) {
		return $url;
	}

	return add_query_arg( SMARTLAB_LOGIN_KEY, SMARTLAB_LOGIN_VALUE, $url );
}
add_filter( 'site_url',         'smartlab_login_post_url', 10, 3 );
add_filter( 'network_site_url', 'smartlab_login_post_url', 10, 3 );







/* ============================================================
   BLOG 2026 — helper per i nuovi template (home.php, single.php,
   archive.php, search.php) con il brand della homepage.
   ============================================================ */

if ( ! function_exists( 'smartlab_reading_time' ) ) {
	function smartlab_reading_time( $post_id = null ) {
		$post_id = $post_id ? $post_id : get_the_ID();
		$testo   = wp_strip_all_tags( strip_shortcodes( get_post_field( 'post_content', $post_id ) ) );
		$parole  = str_word_count( $testo );
		$minuti  = max( 1, (int) ceil( $parole / 200 ) );
		return $minuti . ' min di lettura';
	}
}

add_filter( 'excerpt_length', function () { return 36; }, 99 );
add_filter( 'excerpt_more', function () { return '…'; }, 99 );


?>
