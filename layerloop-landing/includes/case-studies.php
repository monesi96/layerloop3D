<?php
/**
 * Shortcode [ll_case_studies]: carosello dei case study pubblicati.
 *
 * @package LayerLoop_Landing
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Elenco a scorrimento orizzontale delle landing whitepaper.
 */
class LL_Studio_Case_Studies {

	/**
	 * Hook.
	 */
	public function register() {
		add_shortcode( 'll_case_studies', array( $this, 'render' ) );
		add_shortcode( 'll_whitepapers', array( $this, 'render' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'register_assets' ) );
	}

	/**
	 * Asset del carosello.
	 */
	public function register_assets() {
		wp_register_style( 'll-case-studies', LL_LANDING_URL . 'assets/case-studies.css', array( 'll-landing-font' ), ll_landing_asset_version( 'assets/case-studies.css' ) );
		wp_register_script( 'll-case-studies', LL_LANDING_URL . 'assets/case-studies.js', array(), ll_landing_asset_version( 'assets/case-studies.js' ), true );
	}

	/**
	 * Testo di un campo ACF della landing, senza dipendere da ACF.
	 *
	 * @param int    $post_id Post.
	 * @param string $name    Nome del campo.
	 * @return string
	 */
	protected function field( $post_id, $name ) {
		$value = get_post_meta( $post_id, $name, true );
		return is_string( $value ) ? trim( $value ) : '';
	}

	/**
	 * Contenuto dello shortcode.
	 *
	 * @param array $atts Attributi.
	 * @return string
	 */
	public function render( $atts ) {
		$atts = shortcode_atts(
			array(
				'label'   => 'Case study',
				'limit'   => 12,
				'cta'     => 'Leggi il case study completo',
				'ids'     => '',
				'orderby' => 'date',
			),
			$atts,
			'll_case_studies'
		);

		$query_args = array(
			'post_type'      => LL_LANDING_CPT,
			'post_status'    => 'publish',
			'posts_per_page' => max( 1, min( 40, (int) $atts['limit'] ) ),
			'orderby'        => 'menu_order' === $atts['orderby'] ? 'menu_order' : 'date',
			'order'          => 'menu_order' === $atts['orderby'] ? 'ASC' : 'DESC',
			'no_found_rows'  => true,
		);

		$ids = array_filter( array_map( 'absint', explode( ',', (string) $atts['ids'] ) ) );
		if ( $ids ) {
			$query_args['post__in'] = $ids;
			$query_args['orderby']  = 'post__in';
			unset( $query_args['order'] );
		}

		$query = new WP_Query( $query_args );
		if ( ! $query->have_posts() ) {
			return '';
		}

		wp_enqueue_style( 'll-case-studies' );
		wp_enqueue_script( 'll-case-studies' );

		$cards = array();
		foreach ( $query->posts as $post ) {
			$title = $this->field( $post->ID, 'll_hero_title' );
			$title = $title ? str_replace( '|', ' ', $title ) : get_the_title( $post );
			$lead  = $this->field( $post->ID, 'll_hero_lead' );
			if ( '' === $lead ) {
				$lead = $post->post_excerpt;
			}

			$cards[] = array(
				'title' => trim( preg_replace( '/\s+/', ' ', $title ) ),
				'lead'  => $lead,
				'url'   => get_permalink( $post ),
				'image' => get_the_post_thumbnail( $post->ID, 'medium_large', array( 'loading' => 'lazy', 'alt' => '' ) ),
			);
		}
		wp_reset_postdata();

		ob_start();
		?>
		<section class="ll-cs" data-ll-carousel>
			<?php if ( '' !== trim( (string) $atts['label'] ) ) : ?>
				<header class="ll-cs-head">
					<span class="ll-cs-label"><?php echo esc_html( $atts['label'] ); ?></span>
					<span class="ll-cs-rule" aria-hidden="true"></span>
					<?php if ( count( $cards ) > 1 ) : ?>
						<div class="ll-cs-nav">
							<button type="button" class="ll-cs-prev" aria-label="Case study precedente">←</button>
							<button type="button" class="ll-cs-next" aria-label="Case study successivo">→</button>
						</div>
					<?php endif; ?>
				</header>
			<?php endif; ?>

			<div class="ll-cs-track" data-ll-track tabindex="0" role="list">
				<?php foreach ( $cards as $card ) : ?>
					<article class="ll-cs-card" role="listitem">
						<a class="ll-cs-cover" href="<?php echo esc_url( $card['url'] ); ?>">
							<?php if ( $card['image'] ) : ?>
								<?php echo $card['image']; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped — markup generato da get_the_post_thumbnail(). ?>
							<?php else : ?>
								<span class="ll-cs-cover-empty" aria-hidden="true">Whitepaper</span>
							<?php endif; ?>
						</a>
						<h3 class="ll-cs-title">
							<a href="<?php echo esc_url( $card['url'] ); ?>"><?php echo esc_html( $card['title'] ); ?></a>
						</h3>
						<?php if ( $card['lead'] ) : ?>
							<p class="ll-cs-lead"><?php echo esc_html( wp_trim_words( $card['lead'], 28, '…' ) ); ?></p>
						<?php endif; ?>
						<a class="ll-cs-cta" href="<?php echo esc_url( $card['url'] ); ?>"><?php echo esc_html( $atts['cta'] ); ?></a>
					</article>
				<?php endforeach; ?>
			</div>
		</section>
		<?php
		return (string) ob_get_clean();
	}
}
