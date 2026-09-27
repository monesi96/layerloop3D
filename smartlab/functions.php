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



/* ============================================================
   APPLICATION PORTFOLIO — Settori + shortcode Case Study
   ------------------------------------------------------------
   I case study sono normali articoli nella categoria
   "case-studies". Qui aggiungiamo la tassonomia "Settore" e uno
   shortcode da incollare nelle pagine settore fatte in Elementor:

       [case_study settore="nautica"]
       [case_study settore="nautica" layout="carosello" numero="8"]

   Se per quel settore non c'e' ancora nessun case study, lo
   shortcode non stampa niente: il blocco sparisce dalla pagina.
   ============================================================ */

// --- Tassonomia "Settore" ------------------------------------

function smartlab_registra_settore() {

	register_taxonomy(
		'settore',
		array( 'post' ),
		array(
			'labels'            => array(
				'name'          => 'Settori',
				'singular_name' => 'Settore',
				'all_items'     => 'Tutti i settori',
				'edit_item'     => 'Modifica settore',
				'update_item'   => 'Aggiorna settore',
				'add_new_item'  => 'Aggiungi nuovo settore',
				'new_item_name' => 'Nome del nuovo settore',
				'search_items'  => 'Cerca settori',
				'menu_name'     => 'Settori',
			),
			// Gerarchica = caselle da spuntare come le categorie,
			// non tag liberi: evita doppioni tipo "nautica"/"Nautico".
			'hierarchical'      => true,
			'public'            => true,
			'show_admin_column' => true,
			'show_in_rest'      => true,
			'rewrite'           => array( 'slug' => 'settore' ),
		)
	);
}
add_action( 'init', 'smartlab_registra_settore' );

// --- Stili: lo shortcode si porta dietro il design del blog ---

function smartlab_registra_stili_blog() {

	wp_register_style(
		'smartlab-blog-fonts',
		'https://fonts.googleapis.com/css2?family=Familjen+Grotesk:wght@400..700&family=Fragment+Mono&display=swap',
		array(),
		null
	);

	wp_register_style(
		'smartlab-blog',
		get_template_directory_uri() . '/css/blog.css',
		array( 'smartlab-blog-fonts' ),
		'1.1'
	);
}
add_action( 'wp_enqueue_scripts', 'smartlab_registra_stili_blog', 5 );

// Carica il CSS gia' nell'head quando la pagina contiene lo
// shortcode. Elementor tiene il proprio layout in un meta, quindi
// controlliamo anche quello.
function smartlab_stili_per_shortcode() {

	if ( ! is_singular() ) {
		return;
	}

	$post = get_post();
	if ( ! $post ) {
		return;
	}

	$contenuto = $post->post_content . (string) get_post_meta( $post->ID, '_elementor_data', true );

	if ( false !== strpos( $contenuto, '[case_study' ) ) {
		wp_enqueue_style( 'smartlab-blog' );
	}
}
add_action( 'wp_enqueue_scripts', 'smartlab_stili_per_shortcode', 20 );

// --- Lo shortcode --------------------------------------------

function smartlab_shortcode_case_study( $atts ) {

	$a = shortcode_atts(
		array(
			'settore'      => '',
			'numero'       => 6,
			'layout'       => 'griglia',   // griglia | carosello
			'titolo'       => '',
			'intestazione' => 'si',
			'categoria'    => 'case-studies',
		),
		$atts,
		'case_study'
	);

	$settore = sanitize_title( $a['settore'] );

	// Senza attributo, prova a dedurre il settore dall'archivio.
	if ( '' === $settore && is_tax( 'settore' ) ) {
		$termine_corrente = get_queried_object();
		if ( $termine_corrente instanceof WP_Term ) {
			$settore = $termine_corrente->slug;
		}
	}

	$args = array(
		'post_type'           => 'post',
		'post_status'         => 'publish',
		'posts_per_page'      => max( 1, (int) $a['numero'] ),
		'ignore_sticky_posts' => true,
		'no_found_rows'       => true,
	);

	if ( '' !== $a['categoria'] ) {
		$args['category_name'] = sanitize_title( $a['categoria'] );
	}

	if ( '' !== $settore ) {
		$args['tax_query'] = array(
			array(
				'taxonomy' => 'settore',
				'field'    => 'slug',
				'terms'    => $settore,
			),
		);
	}

	$query = new WP_Query( $args );

	// Nessun case study per questo settore: niente blocco.
	if ( ! $query->have_posts() ) {
		wp_reset_postdata();
		return '';
	}

	wp_enqueue_style( 'smartlab-blog' );

	$carosello = ( 'carosello' === $a['layout'] );

	// Titolo: quello passato, altrimenti "Case study — Nautica".
	$titolo = trim( (string) $a['titolo'] );
	if ( '' === $titolo ) {
		$titolo = 'Case study';
		if ( '' !== $settore ) {
			$termine = get_term_by( 'slug', $settore, 'settore' );
			if ( $termine instanceof WP_Term ) {
				$titolo .= ' — ' . $termine->name;
			}
		}
	}

	$mostra_intestazione = ( 'no' !== strtolower( (string) $a['intestazione'] ) );

	ob_start();
	?>
	<section class="cs-block"<?php echo $carosello ? ' data-carousel' : ''; ?>>

		<?php if ( $mostra_intestazione ) : ?>
			<header class="cs-head">
				<div>
					<p class="cs-kicker">Application Portfolio</p>
					<h2><?php echo esc_html( $titolo ); ?></h2>
				</div>
				<?php if ( $carosello ) : ?>
					<div class="cs-nav">
						<button type="button" data-cs-prev aria-label="Case study precedenti">
							<svg width="16" height="16" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 11H4M10 5 4 11l6 6"/></svg>
						</button>
						<button type="button" data-cs-next aria-label="Case study successivi">
							<svg width="16" height="16" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11h14M12 5l6 6-6 6"/></svg>
						</button>
					</div>
				<?php endif; ?>
			</header>
		<?php endif; ?>

		<div class="<?php echo $carosello ? 'cs-carousel' : 'postgrid'; ?>">
			<?php
			$i = 0;
			while ( $query->have_posts() ) {
				$query->the_post();
				get_template_part( 'template-parts/card-post', null, array( 'i' => $i ) );
				$i++;
			}
			?>
		</div>
	</section>
	<?php
	wp_reset_postdata();

	if ( $carosello ) {
		// Le frecce si agganciano nel footer: una volta sola,
		// a markup gia' presente nella pagina.
		add_action( 'wp_footer', 'smartlab_script_carosello' );
	}

	return ob_get_clean();
}
add_shortcode( 'case_study', 'smartlab_shortcode_case_study' );

// Frecce del carosello. Agganciata a wp_footer con add_action:
// WordPress deduplica da solo, quindi anche con piu' caroselli
// nella stessa pagina lo script esce una volta sola.
function smartlab_script_carosello() {
	?>
	<script>
	(function(){
		function avvia(){
			document.querySelectorAll('.cs-block[data-carousel]').forEach(function(blocco){
				var pista = blocco.querySelector('.cs-carousel'),
				    giu   = blocco.querySelector('[data-cs-prev]'),
				    su    = blocco.querySelector('[data-cs-next]');
				if(!pista || !giu || !su){ return; }

				function passo(){
					var prima = pista.firstElementChild;
					return prima ? prima.getBoundingClientRect().width + 16 : pista.clientWidth;
				}
				function aggiorna(){
					giu.disabled = pista.scrollLeft <= 4;
					su.disabled  = pista.scrollLeft + pista.clientWidth >= pista.scrollWidth - 4;
				}
				giu.addEventListener('click', function(){ pista.scrollBy({left:-passo(), behavior:'smooth'}); });
				su.addEventListener('click',  function(){ pista.scrollBy({left: passo(), behavior:'smooth'}); });
				pista.addEventListener('scroll', aggiorna, {passive:true});
				window.addEventListener('resize', aggiorna);
				aggiorna();
			});
		}
		if(document.readyState === 'loading'){
			document.addEventListener('DOMContentLoaded', avvia);
		} else {
			avvia();
		}
	})();
	</script>
	<?php
}


/* ============================================================
   FOTO E VIDEO DELLA STAMPA — blocchi del case study
   Due riquadri nell'editor dell'articolo: un carosello di foto
   e un video. Se un campo resta vuoto il blocco corrispondente
   non viene proprio stampato: niente titolo, niente contenitore.
   ============================================================ */

// --- Riquadro nell'editor ------------------------------------

function smartlab_media_riquadro() {
	add_meta_box(
		'smartlab-media-stampa',
		'Foto e video della stampa',
		'smartlab_media_riquadro_html',
		'post',
		'normal',
		'high'
	);
}
add_action( 'add_meta_boxes', 'smartlab_media_riquadro' );

// La libreria media serve per i pulsanti di scelta.
function smartlab_media_admin( $hook ) {

	if ( 'post.php' !== $hook && 'post-new.php' !== $hook ) {
		return;
	}

	$schermata = get_current_screen();
	if ( $schermata && 'post' !== $schermata->post_type ) {
		return;
	}

	wp_enqueue_media();
}
add_action( 'admin_enqueue_scripts', 'smartlab_media_admin' );

// Miniatura di anteprima dentro il riquadro.
function smartlab_media_miniatura( $id ) {

	$src = wp_get_attachment_image_url( (int) $id, 'thumbnail' );
	if ( ! $src ) {
		return '';
	}

	return sprintf(
		'<span class="slb-mb-thumb" data-id="%1$d"><img src="%2$s" alt="" /><button type="button" class="slb-mb-x" aria-label="Togli questa foto">&times;</button></span>',
		(int) $id,
		esc_url( $src )
	);
}

function smartlab_media_riquadro_html( $post ) {

	wp_nonce_field( 'smartlab_media_stampa', 'smartlab_media_nonce' );

	$galleria        = (string) get_post_meta( $post->ID, '_smartlab_galleria', true );
	$galleria_titolo = (string) get_post_meta( $post->ID, '_smartlab_galleria_titolo', true );
	$video           = (string) get_post_meta( $post->ID, '_smartlab_video', true );
	$video_titolo    = (string) get_post_meta( $post->ID, '_smartlab_video_titolo', true );
	$video_poster    = (int) get_post_meta( $post->ID, '_smartlab_video_poster', true );

	$anteprime = '';
	foreach ( smartlab_galleria_ids( $post->ID ) as $id ) {
		$anteprime .= smartlab_media_miniatura( $id );
	}
	?>
	<div class="slb-mb">

		<p class="slb-mb-nota">Quello che lasci vuoto non compare nell'articolo: il blocco sparisce del tutto, titolo compreso.</p>

		<div class="slb-mb-sezione">
			<h4>Carosello foto</h4>
			<input type="hidden" name="smartlab_galleria" id="smartlab_galleria" value="<?php echo esc_attr( $galleria ); ?>" />
			<div class="slb-mb-thumbs" id="smartlab-galleria-anteprima"><?php echo $anteprime; // phpcs:ignore WordPress.Security.EscapeOutput ?></div>
			<p>
				<button type="button" class="button" id="smartlab-galleria-scegli">Scegli le foto</button>
				<button type="button" class="button-link slb-mb-svuota" id="smartlab-galleria-svuota">Togli tutte</button>
			</p>
			<p>
				<label for="smartlab_galleria_titolo">Titolo del blocco</label><br />
				<input type="text" class="widefat" id="smartlab_galleria_titolo" name="smartlab_galleria_titolo"
					value="<?php echo esc_attr( $galleria_titolo ); ?>" placeholder="Le nostre stampe" />
			</p>
		</div>

		<div class="slb-mb-sezione">
			<h4>Video della stampa</h4>
			<p>
				<input type="text" class="widefat" id="smartlab_video" name="smartlab_video"
					value="<?php echo esc_attr( $video ); ?>"
					placeholder="Link YouTube o Vimeo, oppure un file caricato" />
			</p>
			<p>
				<button type="button" class="button" id="smartlab-video-scegli">Carica un video</button>
				<button type="button" class="button-link slb-mb-svuota" id="smartlab-video-svuota">Togli il video</button>
			</p>
			<p>
				<label for="smartlab_video_titolo">Titolo del blocco</label><br />
				<input type="text" class="widefat" id="smartlab_video_titolo" name="smartlab_video_titolo"
					value="<?php echo esc_attr( $video_titolo ); ?>" placeholder="Il video della stampa" />
			</p>
			<p class="slb-mb-poster">
				<span>Immagine di copertina <em>(solo per i video caricati, non per YouTube)</em></span><br />
				<input type="hidden" name="smartlab_video_poster" id="smartlab_video_poster" value="<?php echo esc_attr( $video_poster ); ?>" />
				<span class="slb-mb-thumbs" id="smartlab-poster-anteprima"><?php echo $video_poster ? smartlab_media_miniatura( $video_poster ) : ''; // phpcs:ignore WordPress.Security.EscapeOutput ?></span>
				<button type="button" class="button" id="smartlab-poster-scegli">Scegli la copertina</button>
			</p>
		</div>
	</div>

	<style>
		.slb-mb-nota{color:#646970;margin:0 0 14px}
		.slb-mb-sezione{border-top:1px solid #e0e0e0;padding-top:14px;margin-top:14px}
		.slb-mb-sezione:first-of-type{border-top:0;padding-top:0;margin-top:0}
		.slb-mb-sezione h4{margin:0 0 10px;font-size:13px;text-transform:uppercase;letter-spacing:.06em;color:#1d2327}
		.slb-mb-thumbs{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px}
		.slb-mb-thumb{position:relative;display:block;width:88px;height:88px;border-radius:6px;overflow:hidden;background:#f0f0f1}
		.slb-mb-thumb img{width:100%;height:100%;object-fit:cover;display:block}
		.slb-mb-x{position:absolute;top:2px;right:2px;width:22px;height:22px;line-height:1;border:0;border-radius:50%;
			background:rgba(0,0,0,.65);color:#fff;font-size:15px;cursor:pointer}
		.slb-mb-svuota{color:#b32d2e;margin-left:10px}
		.slb-mb-poster em{color:#646970;font-style:italic}
		.slb-mb-poster .slb-mb-thumbs{display:inline-flex;vertical-align:middle;margin:6px 10px 6px 0}
	</style>

	<script>
	(function(){
		var campo = document.getElementById('smartlab_galleria'),
		    box   = document.getElementById('smartlab-galleria-anteprima');

		function elenco(){
			return campo.value ? campo.value.split(',').filter(Boolean) : [];
		}
		function miniatura(att){
			var s = att.get('sizes'),
			    u = (s && s.thumbnail) ? s.thumbnail.url : att.get('url');
			return '<span class="slb-mb-thumb" data-id="' + att.id + '"><img src="' + u +
			       '" alt="" /><button type="button" class="slb-mb-x" aria-label="Togli questa foto">&times;</button></span>';
		}

		var telaio = null;
		document.getElementById('smartlab-galleria-scegli').addEventListener('click', function(e){
			e.preventDefault();
			if ( ! telaio ) {
				telaio = wp.media({
					title: 'Foto della stampa',
					library: { type: 'image' },
					button: { text: 'Usa queste foto' },
					multiple: true
				});
				telaio.on('open', function(){
					// Riapre con le foto gia' scelte selezionate.
					var sel = telaio.state().get('selection');
					sel.reset();
					elenco().forEach(function(id){
						var att = wp.media.attachment(id);
						att.fetch();
						sel.add(att);
					});
				});
				telaio.on('select', function(){
					var ids = [], html = '';
					telaio.state().get('selection').each(function(att){
						ids.push(att.id);
						html += miniatura(att);
					});
					campo.value = ids.join(',');
					box.innerHTML = html;
				});
			}
			telaio.open();
		});

		box.addEventListener('click', function(e){
			var x = e.target.closest ? e.target.closest('.slb-mb-x') : null;
			if ( ! x ) { return; }
			e.preventDefault();
			var thumb = x.parentNode,
			    id    = String(thumb.getAttribute('data-id'));
			campo.value = elenco().filter(function(v){ return String(v) !== id; }).join(',');
			thumb.parentNode.removeChild(thumb);
		});

		document.getElementById('smartlab-galleria-svuota').addEventListener('click', function(e){
			e.preventDefault();
			campo.value = '';
			box.innerHTML = '';
		});

		// --- Video ---
		var campoVideo = document.getElementById('smartlab_video'), telaioVideo = null;
		document.getElementById('smartlab-video-scegli').addEventListener('click', function(e){
			e.preventDefault();
			if ( ! telaioVideo ) {
				telaioVideo = wp.media({
					title: 'Video della stampa',
					library: { type: 'video' },
					button: { text: 'Usa questo video' },
					multiple: false
				});
				telaioVideo.on('select', function(){
					var att = telaioVideo.state().get('selection').first();
					if ( att ) { campoVideo.value = att.get('url'); }
				});
			}
			telaioVideo.open();
		});
		document.getElementById('smartlab-video-svuota').addEventListener('click', function(e){
			e.preventDefault();
			campoVideo.value = '';
		});

		// --- Copertina del video ---
		var campoPoster = document.getElementById('smartlab_video_poster'),
		    boxPoster   = document.getElementById('smartlab-poster-anteprima'),
		    telaioPost  = null;
		document.getElementById('smartlab-poster-scegli').addEventListener('click', function(e){
			e.preventDefault();
			if ( ! telaioPost ) {
				telaioPost = wp.media({
					title: 'Copertina del video',
					library: { type: 'image' },
					button: { text: 'Usa questa immagine' },
					multiple: false
				});
				telaioPost.on('select', function(){
					var att = telaioPost.state().get('selection').first();
					if ( ! att ) { return; }
					campoPoster.value = att.id;
					boxPoster.innerHTML = miniatura(att);
				});
			}
			telaioPost.open();
		});
		boxPoster.addEventListener('click', function(e){
			var x = e.target.closest ? e.target.closest('.slb-mb-x') : null;
			if ( ! x ) { return; }
			e.preventDefault();
			campoPoster.value = '';
			boxPoster.innerHTML = '';
		});
	})();
	</script>
	<?php
}

// --- Salvataggio ---------------------------------------------

function smartlab_media_salva( $post_id ) {

	if ( ! isset( $_POST['smartlab_media_nonce'] ) ) {
		return;
	}
	if ( ! wp_verify_nonce( sanitize_key( wp_unslash( $_POST['smartlab_media_nonce'] ) ), 'smartlab_media_stampa' ) ) {
		return;
	}
	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return;
	}
	if ( ! current_user_can( 'edit_post', $post_id ) ) {
		return;
	}

	// Galleria: lista di ID separati da virgola.
	$ids = array();
	if ( isset( $_POST['smartlab_galleria'] ) ) {
		$grezzo = sanitize_text_field( wp_unslash( $_POST['smartlab_galleria'] ) );
		$ids    = array_values( array_unique( array_filter( array_map( 'absint', explode( ',', $grezzo ) ) ) ) );
	}
	smartlab_media_aggiorna( $post_id, '_smartlab_galleria', implode( ',', $ids ) );

	smartlab_media_aggiorna(
		$post_id,
		'_smartlab_galleria_titolo',
		isset( $_POST['smartlab_galleria_titolo'] ) ? sanitize_text_field( wp_unslash( $_POST['smartlab_galleria_titolo'] ) ) : ''
	);

	// Video: un indirizzo, oppure l'ID di un file in libreria.
	$video = isset( $_POST['smartlab_video'] ) ? trim( sanitize_text_field( wp_unslash( $_POST['smartlab_video'] ) ) ) : '';
	if ( '' !== $video && ! ctype_digit( $video ) ) {
		$video = esc_url_raw( $video );
	}
	smartlab_media_aggiorna( $post_id, '_smartlab_video', $video );

	smartlab_media_aggiorna(
		$post_id,
		'_smartlab_video_titolo',
		isset( $_POST['smartlab_video_titolo'] ) ? sanitize_text_field( wp_unslash( $_POST['smartlab_video_titolo'] ) ) : ''
	);

	$poster = isset( $_POST['smartlab_video_poster'] ) ? absint( $_POST['smartlab_video_poster'] ) : 0;
	smartlab_media_aggiorna( $post_id, '_smartlab_video_poster', $poster ? (string) $poster : '' );
}
add_action( 'save_post_post', 'smartlab_media_salva' );

// Vuoto vuol dire "campo non impostato": cancelliamo il meta
// invece di salvare una stringa vuota, cosi' i controlli a
// valle restano semplici.
function smartlab_media_aggiorna( $post_id, $chiave, $valore ) {

	if ( '' === $valore ) {
		delete_post_meta( $post_id, $chiave );
		return;
	}

	update_post_meta( $post_id, $chiave, $valore );
}

// --- Lettura --------------------------------------------------

// ID delle foto ancora esistenti in libreria, nell'ordine scelto.
function smartlab_galleria_ids( $post_id = 0 ) {

	$post_id = $post_id ? (int) $post_id : (int) get_the_ID();
	if ( ! $post_id ) {
		return array();
	}

	$grezzo = trim( (string) get_post_meta( $post_id, '_smartlab_galleria', true ) );
	if ( '' === $grezzo ) {
		return array();
	}

	$ids = array_values( array_unique( array_filter( array_map( 'absint', explode( ',', $grezzo ) ) ) ) );

	return array_values( array_filter( $ids, 'wp_attachment_is_image' ) );
}

// --- Il carosello di foto -------------------------------------

function smartlab_blocco_galleria() {

	$ids = smartlab_galleria_ids();

	// Nessuna foto: niente blocco.
	if ( empty( $ids ) ) {
		return;
	}

	$titolo = trim( (string) get_post_meta( get_the_ID(), '_smartlab_galleria_titolo', true ) );
	if ( '' === $titolo ) {
		$titolo = 'Le nostre stampe';
	}

	// Con una foto sola il carosello non ha senso.
	$carosello = ( count( $ids ) > 1 );
	?>
	<section class="cs-block slb-media" aria-label="<?php echo esc_attr( $titolo ); ?>"<?php echo $carosello ? ' data-carousel' : ''; ?> data-lightbox>
		<header class="cs-head">
			<div>
				<p class="cs-kicker">Galleria</p>
				<h2><?php echo esc_html( $titolo ); ?></h2>
			</div>
			<?php if ( $carosello ) : ?>
				<div class="cs-nav">
					<button type="button" data-cs-prev aria-label="Foto precedenti">
						<svg width="16" height="16" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 11H4M10 5 4 11l6 6"/></svg>
					</button>
					<button type="button" data-cs-next aria-label="Foto successive">
						<svg width="16" height="16" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11h14M12 5l6 6-6 6"/></svg>
					</button>
				</div>
			<?php endif; ?>
		</header>

		<div class="<?php echo $carosello ? 'cs-carousel cs-foto' : 'slb-foto-sola'; ?>">
			<?php foreach ( $ids as $id ) : ?>
				<?php
				$pieno    = wp_get_attachment_image_url( $id, 'full' );
				$didascalia = wp_get_attachment_caption( $id );
				?>
				<figure class="slb-foto">
					<button type="button" class="slb-zoom" data-pieno="<?php echo esc_url( $pieno ); ?>"
						aria-label="Ingrandisci la foto">
						<?php
						echo wp_get_attachment_image(
							$id,
							'large',
							false,
							array( 'loading' => 'lazy' )
						);
						?>
					</button>
					<?php if ( $didascalia ) : ?>
						<figcaption><?php echo esc_html( $didascalia ); ?></figcaption>
					<?php endif; ?>
				</figure>
			<?php endforeach; ?>
		</div>
	</section>
	<?php

	if ( $carosello ) {
		add_action( 'wp_footer', 'smartlab_script_carosello' );
	}
	add_action( 'wp_footer', 'smartlab_script_lightbox' );
}

// --- Il video -------------------------------------------------

// Restituisce il markup del player, stringa vuota se non si
// riesce a ricavare niente di riproducibile.
function smartlab_video_player( $video, $poster_id = 0 ) {

	$video = trim( (string) $video );
	if ( '' === $video ) {
		return '';
	}

	// Un file scelto dalla libreria puo' arrivare come ID.
	if ( ctype_digit( $video ) ) {
		$url = wp_get_attachment_url( (int) $video );
		if ( ! $url ) {
			return '';
		}
		$video = $url;
	}

	$percorso  = (string) wp_parse_url( $video, PHP_URL_PATH );
	$estensione = strtolower( (string) pathinfo( $percorso, PATHINFO_EXTENSION ) );

	// File caricato sul sito: player nativo.
	if ( in_array( $estensione, array( 'mp4', 'm4v', 'webm', 'ogv', 'mov' ), true ) ) {

		$poster = $poster_id ? wp_get_attachment_image_url( (int) $poster_id, 'large' ) : '';

		return sprintf(
			'<video controls playsinline preload="metadata"%1$s><source src="%2$s" /></video>',
			$poster ? ' poster="' . esc_url( $poster ) . '"' : '',
			esc_url( $video )
		);
	}

	// YouTube, Vimeo e compagnia.
	$incorporato = wp_oembed_get( $video, array( 'width' => 1120 ) );
	if ( $incorporato ) {
		return '<div class="slb-embed">' . $incorporato . '</div>';
	}

	return '';
}

function smartlab_blocco_video() {

	$video = trim( (string) get_post_meta( get_the_ID(), '_smartlab_video', true ) );

	// Nessun video: niente blocco.
	if ( '' === $video ) {
		return;
	}

	$player = smartlab_video_player( $video, (int) get_post_meta( get_the_ID(), '_smartlab_video_poster', true ) );

	// Indirizzo che non sappiamo riprodurre: meglio niente che
	// un riquadro vuoto.
	if ( '' === $player ) {
		return;
	}

	$titolo = trim( (string) get_post_meta( get_the_ID(), '_smartlab_video_titolo', true ) );
	if ( '' === $titolo ) {
		$titolo = 'Il video della stampa';
	}
	?>
	<section class="cs-block slb-media" aria-label="<?php echo esc_attr( $titolo ); ?>">
		<header class="cs-head">
			<div>
				<p class="cs-kicker">Video</p>
				<h2><?php echo esc_html( $titolo ); ?></h2>
			</div>
		</header>
		<div class="slb-video"><?php echo $player; // phpcs:ignore WordPress.Security.EscapeOutput ?></div>
	</section>
	<?php
}

// --- Ingrandimento delle foto ---------------------------------

// Come per il carosello: agganciata a wp_footer, WordPress
// deduplica per nome funzione.
function smartlab_script_lightbox() {
	?>
	<script>
	(function(){
		var blocchi = document.querySelectorAll('[data-lightbox]');
		if ( ! blocchi.length ) { return; }

		var foto = [], indice = 0, velo = null, immagine = null;

		blocchi.forEach(function(blocco){
			blocco.querySelectorAll('.slb-zoom').forEach(function(bottone){
				var posizione = foto.length;
				foto.push(bottone.getAttribute('data-pieno'));
				bottone.addEventListener('click', function(){ apri(posizione); });
			});
		});
		if ( ! foto.length ) { return; }

		function costruisci(){
			velo = document.createElement('div');
			velo.className = 'slb-lb';
			velo.innerHTML =
				'<button type="button" class="slb-lb-x" aria-label="Chiudi">&times;</button>' +
				'<button type="button" class="slb-lb-prev" aria-label="Foto precedente">&#8592;</button>' +
				'<img alt="" />' +
				'<button type="button" class="slb-lb-next" aria-label="Foto successiva">&#8594;</button>';
			document.body.appendChild(velo);
			immagine = velo.querySelector('img');

			velo.querySelector('.slb-lb-x').addEventListener('click', chiudi);
			velo.querySelector('.slb-lb-prev').addEventListener('click', function(){ scorri(-1); });
			velo.querySelector('.slb-lb-next').addEventListener('click', function(){ scorri(1); });
			velo.addEventListener('click', function(e){ if ( e.target === velo ) { chiudi(); } });
		}

		function apri(i){
			if ( ! velo ) { costruisci(); }
			indice = i;
			immagine.src = foto[indice];
			velo.classList.add('aperto');
			document.body.style.overflow = 'hidden';
		}
		function chiudi(){
			velo.classList.remove('aperto');
			document.body.style.overflow = '';
		}
		function scorri(passo){
			indice = (indice + passo + foto.length) % foto.length;
			immagine.src = foto[indice];
		}

		document.addEventListener('keydown', function(e){
			if ( ! velo || ! velo.classList.contains('aperto') ) { return; }
			if ( 'Escape' === e.key )     { chiudi(); }
			if ( 'ArrowLeft' === e.key )  { scorri(-1); }
			if ( 'ArrowRight' === e.key ) { scorri(1); }
		});
	})();
	</script>
	<?php
}

?>
