<?php
/**
 * Scrittura delle landing page dallo Studio: campi ACF, immagini e PDF.
 *
 * @package LayerLoop_Landing
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Trasforma il documento dello Studio in una landing whitepaper completa.
 */
class LL_Studio_Mapper {

	const META_PAYLOAD = '_ll_studio_payload';
	const META_PDF_IT  = '_ll_studio_pdf_it';
	const META_PDF_EN  = '_ll_studio_pdf_en';
	const META_FORM    = '_ll_studio_form_id';
	const META_LEADS   = '_ll_studio_leads';

	const PROTECTED_DIR = 'layerloop-whitepapers';

	const MAX_PDF_BYTES   = 26214400; // 25 MB.
	const MAX_IMAGE_BYTES = 8388608;  // 8 MB.

	/**
	 * Campi testuali della landing: nome ACF => lunghezza massima.
	 *
	 * @return array<string,int>
	 */
	public static function text_fields() {
		return array(
			'll_hero_eyebrow' => 90,
			'll_hero_title'   => 160,
			'll_hero_lead'    => 320,
			'll_hero_hint'    => 60,
			'll_hero_stats'   => 400,
			'll_meta'         => 160,
			'll_hero_cta1'    => 60,
			'll_hero_cta2'    => 60,

			'll_prob_index'   => 20,
			'll_prob_eyebrow' => 60,
			'll_prob_title'   => 140,
			'll_prob_lead'    => 480,
			'll_cmp_old_title' => 60,
			'll_cmp_old'      => 600,
			'll_cmp_new_title' => 60,
			'll_cmp_new'      => 600,

			'll_sol_index'    => 20,
			'll_sol_eyebrow'  => 60,

			'll_case_index'   => 20,
			'll_case_eyebrow' => 60,
			'll_case_title'   => 140,
			'll_case_specs'   => 400,
			'll_case_lead'    => 600,
			'll_case_cta'     => 60,

			'll_why_eyebrow'  => 60,
			'll_why_title'    => 160,

			'll_mat_index'    => 20,
			'll_mat_eyebrow'  => 60,
			'll_mat_title'    => 140,
			'll_mat1_name'    => 60,
			'll_mat1_sub'     => 80,
			'll_mat1_points'  => 600,
			'll_mat2_name'    => 60,
			'll_mat2_sub'     => 80,
			'll_mat2_points'  => 600,
			'll_mat3_name'    => 60,
			'll_mat3_sub'     => 80,
			'll_mat3_points'  => 600,

			'll_pr_index'     => 20,
			'll_pr_eyebrow'   => 60,
			'll_pr_title'     => 140,
			'll_pr1_name'     => 60,
			'll_pr1_specs'    => 500,
			'll_pr1_cta'      => 60,
			'll_pr2_name'     => 60,
			'll_pr2_specs'    => 500,
			'll_pr2_cta'      => 60,

			'll_final_eyebrow' => 60,
			'll_final_title'  => 140,
			'll_final_text'   => 480,
			'll_final_cta1'   => 60,
			'll_final_cta2'   => 60,

			'll_closing_lines' => 600,
			'll_anchor'        => 200,
		);
	}

	/**
	 * Campi in HTML semplice (editor WYSIWYG di ACF).
	 *
	 * @return array<string,int>
	 */
	public static function html_fields() {
		return array(
			'll_sol_text' => 2400,
			'll_why_text' => 1200,
		);
	}

	/**
	 * Campi immagine.
	 *
	 * @return array<int,string>
	 */
	public static function image_fields() {
		return array(
			'll_hero_img_render',
			'll_hero_img_wire',
			'll_case_photo',
			'll_mat1_img',
			'll_mat2_img',
			'll_mat3_img',
			'll_pr1_img',
			'll_pr2_img',
		);
	}

	/**
	 * Campi liberi che restano ai valori predefiniti se non inviati.
	 *
	 * @return array<int,string>
	 */
	public static function passthrough_fields() {
		return array( 'll_pr1_link', 'll_pr2_link', 'll_pr1_style', 'll_pr2_style' );
	}

	/**
	 * Scrive un campo ACF senza dipendere dal caricamento di ACF.
	 *
	 * ACF memorizza il valore in `nome` e la chiave del campo in `_nome`:
	 * replicandolo qui il valore è leggibile sia da get_field() sia da get_post_meta().
	 *
	 * @param int    $post_id Post.
	 * @param string $name    Nome del campo.
	 * @param mixed  $value   Valore.
	 */
	public static function set_field( $post_id, $name, $value ) {
		update_post_meta( $post_id, $name, $value );
		update_post_meta( $post_id, '_' . $name, 'f_' . $name );
	}

	/**
	 * Testo ripulito, con i ritorni a capo conservati.
	 *
	 * @param mixed $value  Valore.
	 * @param int   $length Lunghezza massima.
	 * @return string
	 */
	public static function clean_text( $value, $length ) {
		if ( ! is_scalar( $value ) ) {
			return '';
		}
		$value = wp_strip_all_tags( (string) $value );
		$value = str_replace( "\r\n", "\n", $value );
		$value = function_exists( 'mb_substr' ) ? mb_substr( $value, 0, $length ) : substr( $value, 0, $length );
		return trim( $value );
	}

	/**
	 * HTML minimo consentito nei campi WYSIWYG.
	 *
	 * @param mixed $value  Valore.
	 * @param int   $length Lunghezza massima.
	 * @return string
	 */
	public static function clean_html( $value, $length ) {
		if ( ! is_scalar( $value ) ) {
			return '';
		}
		$allowed = array(
			'p'      => array(),
			'br'     => array(),
			'b'      => array(),
			'strong' => array(),
			'i'      => array(),
			'em'     => array(),
			'ul'     => array(),
			'ol'     => array(),
			'li'     => array(),
		);
		$value = wp_kses( (string) $value, $allowed );
		return function_exists( 'mb_substr' ) ? mb_substr( $value, 0, $length ) : substr( $value, 0, $length );
	}

	/**
	 * Cartella protetta per i PDF, creata al volo.
	 *
	 * @return array{path:string}|WP_Error
	 */
	public static function protected_dir() {
		$uploads = wp_upload_dir();
		if ( ! empty( $uploads['error'] ) ) {
			return new WP_Error( 'll_uploads', $uploads['error'] );
		}
		$path = trailingslashit( $uploads['basedir'] ) . self::PROTECTED_DIR;
		if ( ! file_exists( $path ) && ! wp_mkdir_p( $path ) ) {
			return new WP_Error( 'll_uploads', 'Impossibile creare la cartella dei whitepaper.' );
		}

		$htaccess = trailingslashit( $path ) . '.htaccess';
		if ( ! file_exists( $htaccess ) ) {
			$rules = "# Generato da LayerLoop Studio: i PDF passano solo dall'endpoint di download.\n"
				. "<IfModule mod_authz_core.c>\n\tRequire all denied\n</IfModule>\n"
				. "<IfModule !mod_authz_core.c>\n\tOrder allow,deny\n\tDeny from all\n</IfModule>\n";
			file_put_contents( $htaccess, $rules ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
		}
		$index = trailingslashit( $path ) . 'index.html';
		if ( ! file_exists( $index ) ) {
			file_put_contents( $index, '' ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
		}

		return array( 'path' => trailingslashit( $path ) );
	}

	/**
	 * Data URL immagine valida?
	 *
	 * @param mixed $value Valore.
	 * @return bool
	 */
	public static function is_image_data_url( $value ) {
		return is_string( $value ) && (bool) preg_match( '#^data:image/(png|jpeg|jpg|webp);base64,[A-Za-z0-9+/=\s]+$#', $value );
	}

	/**
	 * Estrae mime e binario da una data URL.
	 *
	 * @param string $value Data URL.
	 * @return array{mime:string,extension:string,binary:string}|null
	 */
	public static function decode_image( $value ) {
		if ( ! self::is_image_data_url( $value ) ) {
			return null;
		}
		list( $header, $payload ) = explode( ',', $value, 2 );
		if ( ! preg_match( '#^data:(image/[a-z]+);base64$#', $header, $matches ) ) {
			return null;
		}
		$binary = base64_decode( preg_replace( '/\s+/', '', $payload ), true );
		if ( false === $binary || '' === $binary ) {
			return null;
		}
		$extensions = array(
			'image/png'  => 'png',
			'image/jpeg' => 'jpg',
			'image/jpg'  => 'jpg',
			'image/webp' => 'webp',
		);
		if ( ! isset( $extensions[ $matches[1] ] ) ) {
			return null;
		}
		return array(
			'mime'      => $matches[1],
			'extension' => $extensions[ $matches[1] ],
			'binary'    => $binary,
		);
	}

	/**
	 * Carica un'immagine in libreria media.
	 *
	 * @param string $data_url Data URL.
	 * @param string $filename Nome senza estensione.
	 * @param int    $post_id  Post di riferimento.
	 * @return int|WP_Error
	 */
	public static function store_image( $data_url, $filename, $post_id ) {
		$decoded = self::decode_image( $data_url );
		if ( ! $decoded ) {
			return new WP_Error( 'll_image', 'Immagine non valida.' );
		}
		if ( strlen( $decoded['binary'] ) > self::MAX_IMAGE_BYTES ) {
			return new WP_Error( 'll_image', 'Immagine troppo pesante: riducila prima di pubblicare.' );
		}

		$upload = wp_upload_bits( sanitize_file_name( $filename . '.' . $decoded['extension'] ), null, $decoded['binary'] );
		if ( ! empty( $upload['error'] ) ) {
			return new WP_Error( 'll_image', $upload['error'] );
		}

		$attachment_id = wp_insert_attachment(
			array(
				'post_mime_type' => $decoded['mime'],
				'post_title'     => sanitize_text_field( $filename ),
				'post_status'    => 'inherit',
			),
			$upload['file'],
			$post_id
		);
		if ( is_wp_error( $attachment_id ) || ! $attachment_id ) {
			return new WP_Error( 'll_image', 'Impossibile registrare l’immagine in libreria.' );
		}

		require_once ABSPATH . 'wp-admin/includes/image.php';
		wp_update_attachment_metadata( $attachment_id, wp_generate_attachment_metadata( $attachment_id, $upload['file'] ) );

		return (int) $attachment_id;
	}

	/**
	 * Salva il PDF nella cartella protetta.
	 *
	 * @param string $base64   Contenuto.
	 * @param string $filename Nome senza estensione.
	 * @param int    $post_id  Post.
	 * @return int|WP_Error
	 */
	public static function store_pdf( $base64, $filename, $post_id ) {
		if ( ! is_string( $base64 ) || '' === $base64 ) {
			return new WP_Error( 'll_pdf', 'PDF assente.' );
		}
		if ( 0 === strpos( $base64, 'data:' ) ) {
			$parts  = explode( ',', $base64, 2 );
			$base64 = isset( $parts[1] ) ? $parts[1] : '';
		}
		$binary = base64_decode( preg_replace( '/\s+/', '', $base64 ), true );
		if ( false === $binary || strlen( $binary ) < 100 || 0 !== strpos( $binary, '%PDF' ) ) {
			return new WP_Error( 'll_pdf', 'Il file inviato non è un PDF leggibile.' );
		}
		if ( strlen( $binary ) > self::MAX_PDF_BYTES ) {
			return new WP_Error( 'll_pdf', 'Il PDF supera 25 MB.' );
		}

		$dir = self::protected_dir();
		if ( is_wp_error( $dir ) ) {
			return $dir;
		}

		$file = $dir['path'] . sanitize_file_name( $filename . '-' . wp_generate_password( 8, false, false ) . '.pdf' );
		if ( false === file_put_contents( $file, $binary ) ) { // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
			return new WP_Error( 'll_pdf', 'Impossibile scrivere il PDF sul server.' );
		}

		$attachment_id = wp_insert_attachment(
			array(
				'post_mime_type' => 'application/pdf',
				'post_title'     => sanitize_text_field( $filename ),
				'post_status'    => 'inherit',
			),
			$file,
			$post_id
		);
		if ( is_wp_error( $attachment_id ) || ! $attachment_id ) {
			return new WP_Error( 'll_pdf', 'Impossibile registrare il PDF in libreria.' );
		}
		update_post_meta( $attachment_id, '_ll_protected', 1 );

		return (int) $attachment_id;
	}

	/**
	 * Risolve un campo immagine inviato dallo Studio.
	 *
	 * @param mixed  $value    Valore ({id, dataUrl}).
	 * @param string $filename Nome file.
	 * @param int    $post_id  Post.
	 * @param array  $warnings Avvisi, per riferimento.
	 * @return int Identificativo allegato, 0 per "campo vuoto".
	 */
	protected static function resolve_image( $value, $filename, $post_id, &$warnings, $case_map = array() ) {
		if ( ! is_array( $value ) ) {
			return 0;
		}
		$data_url = isset( $value['dataUrl'] ) ? $value['dataUrl'] : '';
		if ( self::is_image_data_url( $data_url ) ) {
			$attachment = self::store_image( $data_url, $filename, $post_id );
			if ( is_wp_error( $attachment ) ) {
				$warnings[] = $attachment->get_error_message();
				return 0;
			}
			return $attachment;
		}

		$existing = isset( $value['id'] ) ? absint( $value['id'] ) : 0;
		if ( $existing && get_post( $existing ) ) {
			return $existing;
		}

		// Riuso di un'immagine già caricata con il case study: nessun doppione in libreria.
		$from_case = isset( $value['fromCase'] ) ? (string) $value['fromCase'] : '';
		if ( $from_case && ! empty( $case_map[ $from_case ] ) ) {
			return (int) $case_map[ $from_case ];
		}

		return 0;
	}

	/**
	 * Carica in libreria le immagini del case study e restituisce la mappa
	 * campo => identificativo allegato, riutilizzata dalla landing.
	 *
	 * @param array $payload  Documento, per riferimento.
	 * @param int   $post_id  Post.
	 * @param array $warnings Avvisi, per riferimento.
	 * @return array<string,int>
	 */
	protected static function persist_case_images( &$payload, $post_id, &$warnings ) {
		$map = array();
		if ( ! isset( $payload['caseStudy'] ) || ! is_array( $payload['caseStudy'] ) ) {
			return $map;
		}

		$targets = array(
			'coverImage' => array( 'coverImage' ),
			'pieceImage' => array( 'pieceImage' ),
			'logoImage'  => array( 'logoImage' ),
			'benchmarkClassic.leftImage'  => array( 'benchmarkClassic', 'leftImage' ),
			'benchmarkClassic.rightImage' => array( 'benchmarkClassic', 'rightImage' ),
			'benchmarkFdm.leftImage'      => array( 'benchmarkFdm', 'leftImage' ),
			'benchmarkFdm.rightImage'     => array( 'benchmarkFdm', 'rightImage' ),
		);

		foreach ( $targets as $name => $path ) {
			$node = $payload['caseStudy'];
			foreach ( $path as $segment ) {
				if ( ! is_array( $node ) || ! isset( $node[ $segment ] ) ) {
					$node = null;
					break;
				}
				$node = $node[ $segment ];
			}
			if ( ! self::is_image_data_url( $node ) ) {
				continue;
			}

			$attachment = self::store_image( $node, $post_id . '-case-' . sanitize_title( str_replace( '.', '-', $name ) ), $post_id );
			if ( is_wp_error( $attachment ) ) {
				$warnings[] = $attachment->get_error_message();
				$url = '';
			} else {
				$map[ $name ] = (int) $attachment;
				$url          = (string) wp_get_attachment_url( $attachment );
			}

			if ( 1 === count( $path ) ) {
				$payload['caseStudy'][ $path[0] ] = $url;
			} else {
				$payload['caseStudy'][ $path[0] ][ $path[1] ] = $url;
			}
		}

		return $map;
	}

	/**
	 * Crea o aggiorna una landing whitepaper.
	 *
	 * @param array $payload Dati inviati dallo Studio.
	 * @return array|WP_Error
	 */
	public static function save( $payload ) {
		$payload = is_array( $payload ) ? $payload : array();
		$post_id = isset( $payload['postId'] ) ? absint( $payload['postId'] ) : 0;
		$status  = isset( $payload['status'] ) && 'draft' === $payload['status'] ? 'draft' : 'publish';

		$title = self::clean_text( isset( $payload['title'] ) ? $payload['title'] : '', 140 );
		if ( '' === $title ) {
			$title = self::clean_text( str_replace( '|', ' ', self::field( $payload, 'll_hero_title' ) ), 140 );
		}
		if ( '' === $title ) {
			return new WP_Error( 'll_title', 'Serve un titolo per pubblicare la landing page.', array( 'status' => 400 ) );
		}

		$excerpt = self::clean_text( isset( $payload['metaDescription'] ) ? $payload['metaDescription'] : self::field( $payload, 'll_hero_lead' ), 300 );

		$postarr = array(
			'post_type'    => LL_LANDING_CPT,
			'post_title'   => $title,
			'post_status'  => $status,
			'post_excerpt' => $excerpt,
		);

		if ( $post_id ) {
			$existing = get_post( $post_id );
			if ( ! $existing || LL_LANDING_CPT !== $existing->post_type ) {
				return new WP_Error( 'll_missing', 'La landing page indicata non esiste più.', array( 'status' => 404 ) );
			}
			if ( ! current_user_can( 'edit_post', $post_id ) ) {
				return new WP_Error( 'll_forbidden', 'Non puoi modificare questa landing page.', array( 'status' => 403 ) );
			}
			$postarr['ID'] = $post_id;
			$saved         = wp_update_post( $postarr, true );
		} else {
			$slug                 = sanitize_title( $title );
			$postarr['post_name'] = wp_unique_post_slug( $slug ? $slug : 'whitepaper', 0, $status, LL_LANDING_CPT, 0 );
			$saved                = wp_insert_post( $postarr, true );
		}

		if ( is_wp_error( $saved ) ) {
			return $saved;
		}
		$post_id  = (int) $saved;
		$warnings = array();

		// Prima le immagini del case study: la landing ne riusa gli allegati.
		$case_map = self::persist_case_images( $payload, $post_id, $warnings );

		foreach ( self::text_fields() as $name => $length ) {
			if ( self::has_field( $payload, $name ) ) {
				self::set_field( $post_id, $name, self::clean_text( self::field( $payload, $name ), $length ) );
			}
		}
		foreach ( self::html_fields() as $name => $length ) {
			if ( self::has_field( $payload, $name ) ) {
				self::set_field( $post_id, $name, self::clean_html( self::field( $payload, $name ), $length ) );
			}
		}
		foreach ( self::passthrough_fields() as $name ) {
			if ( self::has_field( $payload, $name ) ) {
				self::set_field( $post_id, $name, self::clean_text( self::field( $payload, $name ), 200 ) );
			}
		}

		$hero_wire = 0;
		foreach ( self::image_fields() as $name ) {
			if ( ! self::has_field( $payload, $name ) ) {
				continue;
			}
			$attachment = self::resolve_image( self::field( $payload, $name ), $post_id . '-' . str_replace( '_', '-', $name ), $post_id, $warnings, $case_map );
			self::set_field( $post_id, $name, $attachment ? $attachment : '' );
			if ( 'll_hero_img_wire' === $name && $attachment ) {
				$hero_wire = $attachment;
			}
			if ( 'll_hero_img_render' === $name && $attachment && ! has_post_thumbnail( $post_id ) ) {
				set_post_thumbnail( $post_id, $attachment );
			}
		}
		if ( $hero_wire && ! has_post_thumbnail( $post_id ) ) {
			set_post_thumbnail( $post_id, $hero_wire );
		}

		// PDF italiano e inglese.
		foreach ( array(
			'pdfIT' => self::META_PDF_IT,
			'pdfEN' => self::META_PDF_EN,
		) as $key => $meta_key ) {
			if ( empty( $payload[ $key ] ) ) {
				continue;
			}
			$attachment = self::store_pdf( $payload[ $key ], sanitize_title( $title ) . '-' . strtolower( substr( $key, 3 ) ), $post_id );
			if ( is_wp_error( $attachment ) ) {
				$warnings[] = $attachment->get_error_message();
				continue;
			}
			$previous = (int) get_post_meta( $post_id, $meta_key, true );
			if ( $previous && $previous !== $attachment ) {
				wp_delete_attachment( $previous, true );
			}
			update_post_meta( $post_id, $meta_key, $attachment );

			// Il campo ACF ll_pdf resta la sorgente del download gated già esistente.
			if ( self::META_PDF_IT === $meta_key ) {
				self::set_field( $post_id, 'll_pdf', $attachment );
			}
		}

		// Se esiste solo la versione inglese, è quella a servire il download.
		if ( ! get_post_meta( $post_id, self::META_PDF_IT, true ) ) {
			$english = (int) get_post_meta( $post_id, self::META_PDF_EN, true );
			if ( $english ) {
				self::set_field( $post_id, 'll_pdf', $english );
			}
		}

		$form_id = isset( $payload['formId'] ) ? absint( $payload['formId'] ) : 0;
		if ( $form_id ) {
			update_post_meta( $post_id, self::META_FORM, $form_id );
		} else {
			delete_post_meta( $post_id, self::META_FORM );
		}

		// Il modulo di contatto viaggia sui "blocchi di chiusura" già previsti dal
		// template: così la landing mostra il form senza toccare Elementor.
		$closing = (string) get_post_meta( $post_id, 'll_closing_lines', true );
		if ( $form_id && ! preg_match( '/\[ninja_form\b/i', $closing ) ) {
			$line    = '[ninja_form id=' . $form_id . '] | contatti';
			$closing = '' === trim( $closing ) ? $line : $line . "\n" . $closing;
			self::set_field( $post_id, 'll_closing_lines', $closing );
		} elseif ( ! $form_id && preg_match( '/^\[ninja_form\b[^\]]*\]\s*\|\s*contatti\s*$/im', $closing ) ) {
			$cleaned = trim( preg_replace( '/^\[ninja_form\b[^\]]*\]\s*\|\s*contatti\s*$/im', '', $closing ) );
			self::set_field( $post_id, 'll_closing_lines', $cleaned );
		}

		// Documento completo per riaprire il progetto dallo Studio.
		$stored = $payload;
		unset( $stored['pdfIT'], $stored['pdfEN'] );
		$stored = self::strip_data_urls( $stored, $post_id );
		update_post_meta( $post_id, self::META_PAYLOAD, wp_json_encode( $stored ) );

		return array(
			'post'     => self::summary( get_post( $post_id ) ),
			'warnings' => $warnings,
		);
	}

	/**
	 * Sostituisce le data URL già caricate con i riferimenti agli allegati,
	 * così il documento salvato resta leggero.
	 *
	 * @param array $payload Documento.
	 * @param int   $post_id Post.
	 * @return array
	 */
	protected static function strip_data_urls( $payload, $post_id ) {
		$fields = isset( $payload['fields'] ) && is_array( $payload['fields'] ) ? $payload['fields'] : array();
		foreach ( self::image_fields() as $name ) {
			$attachment = get_post_meta( $post_id, $name, true );
			$fields[ $name ] = array(
				'id'  => $attachment ? (int) $attachment : 0,
				'url' => $attachment ? (string) wp_get_attachment_url( (int) $attachment ) : '',
			);
		}
		$payload['fields'] = $fields;

		return $payload;
	}

	/**
	 * Il documento contiene questo campo?
	 *
	 * @param array  $payload Documento.
	 * @param string $name    Nome campo.
	 * @return bool
	 */
	protected static function has_field( $payload, $name ) {
		return isset( $payload['fields'] ) && is_array( $payload['fields'] ) && array_key_exists( $name, $payload['fields'] );
	}

	/**
	 * Valore di un campo del documento.
	 *
	 * @param array  $payload Documento.
	 * @param string $name    Nome campo.
	 * @return mixed
	 */
	protected static function field( $payload, $name ) {
		return self::has_field( $payload, $name ) ? $payload['fields'][ $name ] : '';
	}

	/**
	 * Documento salvato, pronto per essere riaperto nello Studio.
	 *
	 * @param int $post_id Post.
	 * @return array
	 */
	public static function load( $post_id ) {
		$raw     = get_post_meta( $post_id, self::META_PAYLOAD, true );
		$payload = is_string( $raw ) && '' !== $raw ? json_decode( $raw, true ) : array();
		if ( ! is_array( $payload ) ) {
			$payload = array();
		}

		$fields = isset( $payload['fields'] ) && is_array( $payload['fields'] ) ? $payload['fields'] : array();

		// I valori sul post restano la fonte di verità: coprono anche le landing
		// create prima dello Studio o modificate da backend con ACF.
		foreach ( array_keys( self::text_fields() ) as $name ) {
			$value = get_post_meta( $post_id, $name, true );
			if ( '' !== $value && null !== $value ) {
				$fields[ $name ] = (string) $value;
			}
		}
		foreach ( array_keys( self::html_fields() ) as $name ) {
			$value = get_post_meta( $post_id, $name, true );
			if ( '' !== $value && null !== $value ) {
				$fields[ $name ] = (string) $value;
			}
		}
		foreach ( self::passthrough_fields() as $name ) {
			$value = get_post_meta( $post_id, $name, true );
			if ( '' !== $value && null !== $value ) {
				$fields[ $name ] = (string) $value;
			}
		}
		foreach ( self::image_fields() as $name ) {
			$attachment      = (int) get_post_meta( $post_id, $name, true );
			$fields[ $name ] = array(
				'id'  => $attachment,
				'url' => $attachment ? (string) wp_get_attachment_url( $attachment ) : '',
			);
		}

		$payload['fields']  = $fields;
		$payload['postId']  = (int) $post_id;
		$payload['title']   = get_the_title( $post_id );
		$payload['status']  = get_post_status( $post_id );
		$payload['formId']  = (int) get_post_meta( $post_id, self::META_FORM, true );
		$post               = get_post( $post_id );
		$payload['metaDescription'] = $post ? $post->post_excerpt : '';

		return $payload;
	}

	/**
	 * Riepilogo per l'elenco dello Studio.
	 *
	 * @param WP_Post $post Post.
	 * @return array
	 */
	public static function summary( $post ) {
		$pdf_it = (int) get_post_meta( $post->ID, self::META_PDF_IT, true );
		$pdf_en = (int) get_post_meta( $post->ID, self::META_PDF_EN, true );

		return array(
			'id'       => (int) $post->ID,
			'title'    => get_the_title( $post ),
			'status'   => $post->post_status,
			'url'      => get_permalink( $post ),
			'edited'   => get_post_modified_time( 'd/m/Y H:i', false, $post ),
			'leads'    => (int) get_post_meta( $post->ID, self::META_LEADS, true ),
			'hasPdfIt' => $pdf_it > 0,
			'hasPdfEn' => $pdf_en > 0,
			'pdfItUrl' => $pdf_it ? LL_Studio_Leads::signed_url( $post->ID, 'it', '', 24 ) : '',
			'pdfEnUrl' => $pdf_en ? LL_Studio_Leads::signed_url( $post->ID, 'en', '', 24 ) : '',
		);
	}
}
