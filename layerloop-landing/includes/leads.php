<?php
/**
 * Contatti Ninja Forms: associazione al whitepaper e consegna del PDF.
 *
 * @package LayerLoop_Landing
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Collega ogni contatto alla landing da cui arriva e gli consegna il file.
 */
class LL_Studio_Leads {

	/** Chiave del campo nascosto facoltativo di Ninja Forms. */
	const FIELD_KEY = 'layerloop_whitepaper';

	/**
	 * Ninja Forms è attivo?
	 *
	 * @return bool
	 */
	public static function is_active() {
		return function_exists( 'Ninja_Forms' );
	}

	/**
	 * Moduli disponibili.
	 *
	 * @return array<int,string>
	 */
	public static function available_forms() {
		if ( ! self::is_active() ) {
			return array();
		}
		$forms = array();
		foreach ( (array) Ninja_Forms()->form()->get_forms() as $model ) {
			if ( ! is_object( $model ) || ! method_exists( $model, 'get_id' ) ) {
				continue;
			}
			$title = method_exists( $model, 'get_setting' ) ? $model->get_setting( 'title' ) : '';
			$forms[ (int) $model->get_id() ] = $title ? $title : 'Modulo ' . $model->get_id();
		}
		return $forms;
	}

	/**
	 * Modulo da mostrare su una landing.
	 *
	 * @param int $post_id Whitepaper.
	 * @return int
	 */
	public static function form_for( $post_id ) {
		$form_id = (int) get_post_meta( $post_id, LL_Studio_Mapper::META_FORM, true );
		if ( ! $form_id ) {
			$form_id = (int) LL_Studio_Settings::get( 'ninja_form_id', 0 );
		}
		return $form_id;
	}

	/**
	 * Allegati PDF disponibili, con ripiego sull'altra lingua.
	 *
	 * @param int    $post_id Whitepaper.
	 * @param string $lang    Lingua richiesta.
	 * @return array{id:int,lang:string}|null
	 */
	public static function resolve_pdf( $post_id, $lang = 'it' ) {
		$map   = array(
			'it' => LL_Studio_Mapper::META_PDF_IT,
			'en' => LL_Studio_Mapper::META_PDF_EN,
		);
		$order = isset( $map[ $lang ] ) ? array( $lang ) : array();
		foreach ( array_keys( $map ) as $candidate ) {
			if ( ! in_array( $candidate, $order, true ) ) {
				$order[] = $candidate;
			}
		}
		foreach ( $order as $candidate ) {
			$attachment = (int) get_post_meta( $post_id, $map[ $candidate ], true );
			if ( $attachment && get_post( $attachment ) ) {
				return array(
					'id'   => $attachment,
					'lang' => $candidate,
				);
			}
		}

		// Landing create prima dello Studio: PDF nel campo ACF ll_pdf.
		$legacy = get_post_meta( $post_id, 'll_pdf', true );
		if ( is_numeric( $legacy ) && get_post( (int) $legacy ) ) {
			return array(
				'id'   => (int) $legacy,
				'lang' => 'it',
			);
		}

		return null;
	}

	/**
	 * Firma di un link di download.
	 *
	 * @param int    $post_id  Whitepaper.
	 * @param string $lang     Lingua.
	 * @param int    $expires  Scadenza.
	 * @param string $audience Impronta del destinatario.
	 * @return string
	 */
	protected static function signature( $post_id, $lang, $expires, $audience ) {
		return hash_hmac( 'sha256', $post_id . '|' . $lang . '|' . $expires . '|' . $audience, wp_salt( 'auth' ) );
	}

	/**
	 * Link temporaneo e firmato.
	 *
	 * @param int      $post_id   Whitepaper.
	 * @param string   $lang      Lingua.
	 * @param string   $email     Destinatario.
	 * @param int|null $ttl_hours Durata in ore.
	 * @return string
	 */
	public static function signed_url( $post_id, $lang = 'it', $email = '', $ttl_hours = null ) {
		$post_id   = (int) $post_id;
		$lang      = in_array( $lang, array( 'it', 'en' ), true ) ? $lang : 'it';
		$ttl_hours = null === $ttl_hours ? (int) LL_Studio_Settings::get( 'link_ttl_hours', 168 ) : (int) $ttl_hours;
		$expires   = time() + max( 1, $ttl_hours ) * HOUR_IN_SECONDS;
		$audience  = $email ? md5( strtolower( trim( $email ) ) ) : '';

		return add_query_arg(
			array(
				'll_wp'   => $post_id,
				'll_lang' => $lang,
				'll_exp'  => $expires,
				'll_a'    => $audience,
				'll_sig'  => self::signature( $post_id, $lang, $expires, $audience ),
			),
			home_url( '/' )
		);
	}

	/**
	 * Hook.
	 */
	public function register() {
		add_action( 'init', array( $this, 'maybe_serve_download' ), 1 );
		add_action( 'ninja_forms_after_submission', array( $this, 'complete_submission' ), 20 );
	}

	/**
	 * Serve il PDF quando il link firmato è valido.
	 */
	public function maybe_serve_download() {
		if ( empty( $_GET['ll_wp'] ) || empty( $_GET['ll_sig'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			return;
		}

		// phpcs:disable WordPress.Security.NonceVerification.Recommended
		$post_id  = absint( wp_unslash( $_GET['ll_wp'] ) );
		$lang     = isset( $_GET['ll_lang'] ) ? sanitize_key( wp_unslash( $_GET['ll_lang'] ) ) : 'it';
		$expires  = isset( $_GET['ll_exp'] ) ? absint( wp_unslash( $_GET['ll_exp'] ) ) : 0;
		$audience = isset( $_GET['ll_a'] ) ? preg_replace( '/[^a-f0-9]/', '', wp_unslash( $_GET['ll_a'] ) ) : '';
		$sig      = isset( $_GET['ll_sig'] ) ? preg_replace( '/[^a-f0-9]/', '', wp_unslash( $_GET['ll_sig'] ) ) : '';
		// phpcs:enable WordPress.Security.NonceVerification.Recommended

		if ( ! $post_id || ! $expires || ! $sig ) {
			$this->fail( 'Link non valido.', 400 );
		}
		if ( ! hash_equals( self::signature( $post_id, $lang, $expires, $audience ), $sig ) ) {
			$this->fail( 'Link non valido.', 403 );
		}
		if ( $expires < time() ) {
			$this->fail( 'Il link per scaricare il whitepaper è scaduto: richiedilo di nuovo dalla pagina del whitepaper.', 410 );
		}

		$post = get_post( $post_id );
		if ( ! $post || LL_LANDING_CPT !== $post->post_type ) {
			$this->fail( 'Whitepaper non disponibile.', 404 );
		}

		$pdf = self::resolve_pdf( $post_id, $lang );
		if ( ! $pdf ) {
			$this->fail( 'Il PDF di questo whitepaper non è ancora stato caricato.', 404 );
		}

		$file = get_attached_file( $pdf['id'] );
		if ( ! $file || ! file_exists( $file ) ) {
			$this->fail( 'Il file del whitepaper non è più disponibile sul server.', 404 );
		}

		update_post_meta( $post_id, '_ll_studio_downloads', 1 + (int) get_post_meta( $post_id, '_ll_studio_downloads', true ) );

		$slug = sanitize_title( get_the_title( $post ) );
		$name = ( $slug ? $slug : 'whitepaper' ) . '-' . $pdf['lang'] . '.pdf';

		nocache_headers();
		header( 'X-Robots-Tag: noindex, nofollow', true );
		header( 'Content-Type: application/pdf' );
		header( 'Content-Disposition: attachment; filename="' . $name . '"' );
		header( 'Content-Length: ' . filesize( $file ) );

		while ( ob_get_level() > 0 ) {
			ob_end_clean();
		}
		readfile( $file ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_readfile
		exit;
	}

	/**
	 * Interrompe con un messaggio leggibile.
	 *
	 * @param string $message Messaggio.
	 * @param int    $status  Codice HTTP.
	 */
	protected function fail( $message, $status ) {
		wp_die( esc_html( $message ), 'Whitepaper', array( 'response' => $status, 'back_link' => true ) );
	}

	/**
	 * Associa il contatto al whitepaper della landing e, se previsto, invia l'email.
	 *
	 * Il download immediato in pagina resta gestito dal meccanismo storico
	 * (cookie firmato in download.php + `window.LL_WP_DOWNLOAD` in landing.js):
	 * aggiungere qui un redirect farebbe partire il file due volte.
	 *
	 * @param array $data Dati dell'invio.
	 */
	public function complete_submission( $data ) {
		$fields  = isset( $data['fields'] ) && is_array( $data['fields'] ) ? $data['fields'] : array();
		$post_id = $this->resolve_whitepaper( $fields );
		if ( ! $post_id ) {
			return;
		}

		$contact = $this->resolve_contact( $fields );
		$pending = array(
			'email' => $contact['email'],
			'name'  => $contact['name'],
			'link'  => self::signed_url( $post_id, 'it', $contact['email'] ),
		);

		$sub_id = isset( $data['actions']['save']['sub_id'] ) ? (int) $data['actions']['save']['sub_id'] : 0;
		if ( $sub_id ) {
			update_post_meta( $sub_id, '_ll_whitepaper_id', $post_id );
			update_post_meta( $sub_id, '_ll_whitepaper_title', get_the_title( $post_id ) );
			update_post_meta( $sub_id, '_ll_whitepaper_url', get_permalink( $post_id ) );
		}

		update_post_meta( $post_id, LL_Studio_Mapper::META_LEADS, 1 + (int) get_post_meta( $post_id, LL_Studio_Mapper::META_LEADS, true ) );

		$mode = LL_Studio_Settings::get( 'delivery_mode', 'both' );
		if ( ! in_array( $mode, array( 'email', 'both' ), true ) || ! is_email( $pending['email'] ) ) {
			return;
		}
		if ( ! self::resolve_pdf( $post_id, 'it' ) ) {
			return;
		}

		$options      = LL_Studio_Settings::all();
		$replacements = array(
			'{nome}'             => $pending['name'] ? $pending['name'] : 'ciao',
			'{email}'            => $pending['email'],
			'{whitepaper_title}' => get_the_title( $post_id ),
			'{whitepaper_url}'   => get_permalink( $post_id ),
			'{download_url}'     => $pending['link'],
			'{ttl_ore}'          => (string) (int) $options['link_ttl_hours'],
		);

		$attachments = array();
		if ( ! empty( $options['attach_pdf'] ) ) {
			$pdf  = self::resolve_pdf( $post_id, 'it' );
			$file = $pdf ? get_attached_file( $pdf['id'] ) : '';
			if ( $file && file_exists( $file ) ) {
				$attachments[] = $file;
			}
		}

		wp_mail(
			$pending['email'],
			strtr( $options['email_subject'], $replacements ),
			strtr( $options['email_body'], $replacements ),
			array( 'Content-Type: text/plain; charset=UTF-8' ),
			$attachments
		);
	}

	/**
	 * Trova il whitepaper collegato all'invio.
	 *
	 * @param array $fields Campi.
	 * @return int
	 */
	protected function resolve_whitepaper( $fields ) {
		foreach ( (array) $fields as $field ) {
			if ( ! is_array( $field ) || empty( $field['key'] ) ) {
				continue;
			}
			if ( false === strpos( (string) $field['key'], self::FIELD_KEY ) ) {
				continue;
			}
			$value = isset( $field['value'] ) ? absint( $field['value'] ) : 0;
			if ( $value && LL_LANDING_CPT === get_post_type( $value ) ) {
				return $value;
			}
		}

		$referer = wp_get_referer();
		if ( ! $referer && ! empty( $_SERVER['HTTP_REFERER'] ) ) {
			$referer = esc_url_raw( wp_unslash( $_SERVER['HTTP_REFERER'] ) );
		}
		if ( $referer ) {
			$candidate = url_to_postid( $referer );
			if ( $candidate && LL_LANDING_CPT === get_post_type( $candidate ) ) {
				return (int) $candidate;
			}
		}

		return 0;
	}

	/**
	 * Estrae nome ed email dai campi inviati.
	 *
	 * @param array $fields Campi.
	 * @return array{email:string,name:string}
	 */
	protected function resolve_contact( $fields ) {
		$email = '';
		$name  = '';

		foreach ( (array) $fields as $field ) {
			if ( ! is_array( $field ) ) {
				continue;
			}
			$type  = isset( $field['type'] ) ? strtolower( (string) $field['type'] ) : '';
			$key   = isset( $field['key'] ) ? strtolower( (string) $field['key'] ) : '';
			$value = isset( $field['value'] ) ? $field['value'] : '';
			if ( ! is_scalar( $value ) ) {
				continue;
			}
			$value = trim( (string) $value );
			if ( '' === $value ) {
				continue;
			}

			if ( '' === $email && ( 'email' === $type || false !== strpos( $key, 'email' ) ) && is_email( $value ) ) {
				$email = sanitize_email( $value );
				continue;
			}
			if ( '' === $name && ( 'firstname' === $type || false !== strpos( $key, 'nome' ) || false !== strpos( $key, 'name' ) ) ) {
				$name = sanitize_text_field( $value );
			}
		}

		return array(
			'email' => $email,
			'name'  => $name,
		);
	}
}
