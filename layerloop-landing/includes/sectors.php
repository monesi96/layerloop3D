<?php
/**
 * Settori dei case study.
 *
 * Ogni whitepaper appartiene a un settore (nautica, automotive, podologia…).
 * Il settore si sceglie dallo Studio, non dalla bacheca, e serve a due cose:
 * mostrare i case study giusti nelle pagine settore costruite con Elementor
 * (shortcode `[ll_case_studies settore="nautica"]`) e tenere in ordine l'archivio.
 *
 * @package LayerLoop_Landing
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Tassonomia "Settore" e utilità collegate.
 */
class LL_Studio_Sectors {

	const TAX = 'll_settore';

	/**
	 * Settori proposti alla prima installazione: sono solo un punto di partenza,
	 * dallo Studio se ne aggiungono altri scrivendone il nome.
	 *
	 * @return array<int,string>
	 */
	public static function seeds() {
		return array(
			'Nautica',
			'Automotive',
			'Aerospaziale',
			'Podologia e ortopedia',
			'Arredamento e design',
			'Industria e automazione',
			'Packaging',
			'Edilizia',
			'Medicale',
		);
	}

	/**
	 * Hook.
	 */
	public function register() {
		add_action( 'init', array( $this, 'register_taxonomy' ), 5 );
	}

	/**
	 * Registrazione della tassonomia.
	 */
	public function register_taxonomy() {
		register_taxonomy(
			self::TAX,
			LL_LANDING_CPT,
			array(
				'labels'            => array(
					'name'          => 'Settori',
					'singular_name' => 'Settore',
					'add_new_item'  => 'Aggiungi settore',
					'edit_item'     => 'Modifica settore',
					'search_items'  => 'Cerca settore',
					'not_found'     => 'Nessun settore.',
				),
				'public'            => true,
				'hierarchical'      => false,
				'show_admin_column' => true,
				'show_in_rest'      => true,
				'rewrite'           => array( 'slug' => 'settore' ),
				'capabilities'      => array(
					'manage_terms' => 'manage_categories',
					'edit_terms'   => 'manage_categories',
					'delete_terms' => 'manage_categories',
					'assign_terms' => 'edit_ll_whitepapers',
				),
			)
		);
	}

	/**
	 * Crea i settori proposti, una volta sola.
	 */
	public static function install() {
		if ( ! taxonomy_exists( self::TAX ) ) {
			( new self() )->register_taxonomy();
		}
		foreach ( self::seeds() as $name ) {
			if ( ! term_exists( $name, self::TAX ) ) {
				wp_insert_term( $name, self::TAX );
			}
		}
	}

	/**
	 * Tutti i settori, con quanti case study contengono.
	 *
	 * @return array<int,array{slug:string,name:string,count:int}>
	 */
	public static function all() {
		$terms = get_terms(
			array(
				'taxonomy'   => self::TAX,
				'hide_empty' => false,
				'orderby'    => 'name',
			)
		);
		if ( is_wp_error( $terms ) ) {
			return array();
		}

		$items = array();
		foreach ( $terms as $term ) {
			$items[] = array(
				'slug'  => $term->slug,
				'name'  => $term->name,
				'count' => (int) $term->count,
			);
		}
		return $items;
	}

	/**
	 * Settore di un whitepaper.
	 *
	 * @param int $post_id Post.
	 * @return string Slug, stringa vuota se non assegnato.
	 */
	public static function of( $post_id ) {
		$terms = wp_get_object_terms( $post_id, self::TAX, array( 'fields' => 'slugs' ) );
		if ( is_wp_error( $terms ) || empty( $terms ) ) {
			return '';
		}
		return (string) $terms[0];
	}

	/**
	 * Assegna il settore a un whitepaper, creandolo se è nuovo.
	 *
	 * Accetta indifferentemente lo slug di un settore esistente o il nome di uno
	 * nuovo: chi lavora dallo Studio scrive un nome, non uno slug.
	 *
	 * @param int    $post_id Post.
	 * @param string $value   Slug o nome; vuoto per togliere il settore.
	 * @return string Slug assegnato.
	 */
	public static function assign( $post_id, $value ) {
		$value = trim( wp_strip_all_tags( (string) $value ) );
		if ( '' === $value ) {
			wp_set_object_terms( $post_id, array(), self::TAX, false );
			return '';
		}

		$term = get_term_by( 'slug', sanitize_title( $value ), self::TAX );
		if ( ! $term ) {
			$term = get_term_by( 'name', $value, self::TAX );
		}
		if ( ! $term ) {
			$created = wp_insert_term( mb_substr( $value, 0, 60 ), self::TAX );
			if ( is_wp_error( $created ) ) {
				return '';
			}
			$term = get_term( (int) $created['term_id'], self::TAX );
		}
		if ( ! $term || is_wp_error( $term ) ) {
			return '';
		}

		wp_set_object_terms( $post_id, array( (int) $term->term_id ), self::TAX, false );
		return (string) $term->slug;
	}

	/**
	 * Nome leggibile di un settore.
	 *
	 * @param string $slug Slug.
	 * @return string
	 */
	public static function name( $slug ) {
		$term = get_term_by( 'slug', sanitize_title( (string) $slug ), self::TAX );
		return $term && ! is_wp_error( $term ) ? (string) $term->name : '';
	}
}
