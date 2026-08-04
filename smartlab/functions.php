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

//Crea una funzione con una definizione chiara e indicativa
function login_wp_nascosto(){

//nella variabile passerai come valore il nuovo url (sostituisci con quello che vuoi)
    $new_login=  'adm_2ld';
    if(strpos($_SERVER['REQUEST_URI'], $new_login) === false){

//al logout saremo indirizzati alla home del sito
        wp_safe_redirect( home_url(), 302 );
        exit();
    }
}

//con il solito hook invochiamo la nostra funzione
add_action( 'login_head', 'login_wp_nascosto');

//adesso reindirizziamo alla pagina di login sul nuovo percorso
function login_attuale(){

    $new_login =  'adm_2ld';
    if(parse_url($_SERVER['REQUEST_URI'],PHP_URL_QUERY) == $new_login&& ($_GET['redirect'] !== false)){
        wp_safe_redirect(home_url("wp-login.php?$new_login&redirect=false"));
        exit();

    }
}
add_action( 'init', 'login_attuale');







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
