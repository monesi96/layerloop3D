<?php
/**
 * Endpoint REST usati dallo Studio nel browser.
 *
 * @package LayerLoop_Landing
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Rotte /wp-json/layerloop/v1/…
 */
class LL_Studio_Rest {

	const NS = 'layerloop/v1';

	/**
	 * Hook.
	 */
	public function register() {
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	/**
	 * Solo gli utenti abilitati allo Studio.
	 *
	 * @return true|WP_Error
	 */
	public function permission() {
		if ( LL_Studio_Roles::user_can_studio() ) {
			return true;
		}
		return new WP_Error(
			'll_forbidden',
			'Accedi con il tuo account Layerloop per usare questa funzione.',
			array( 'status' => is_user_logged_in() ? 403 : 401 )
		);
	}

	/**
	 * Definizione delle rotte.
	 */
	public function register_routes() {
		register_rest_route(
			self::NS,
			'/image',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'image' ),
				'permission_callback' => array( $this, 'permission' ),
			)
		);

		register_rest_route(
			self::NS,
			'/forms',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'forms' ),
				'permission_callback' => array( $this, 'permission' ),
			)
		);

		register_rest_route(
			self::NS,
			'/whitepapers',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'index' ),
					'permission_callback' => array( $this, 'permission' ),
				),
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'save' ),
					'permission_callback' => array( $this, 'permission' ),
				),
			)
		);

		register_rest_route(
			self::NS,
			'/whitepapers/(?P<id>\d+)',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'read' ),
					'permission_callback' => array( $this, 'permission' ),
				),
				array(
					'methods'             => WP_REST_Server::DELETABLE,
					'callback'            => array( $this, 'remove' ),
					'permission_callback' => array( $this, 'permission' ),
				),
			)
		);
	}

	/**
	 * Generazione immagine con Gemini.
	 *
	 * @param WP_REST_Request $request Richiesta.
	 * @return WP_REST_Response|WP_Error
	 */
	public function image( WP_REST_Request $request ) {
		$image = $request->get_param( 'image' );
		if ( ! LL_Studio_Mapper::is_image_data_url( $image ) ) {
			return new WP_Error( 'll_image', 'Carica prima una fotografia valida (PNG, JPG o WebP).', array( 'status' => 400 ) );
		}
		$decoded = LL_Studio_Mapper::decode_image( $image );
		if ( ! $decoded ) {
			return new WP_Error( 'll_image', 'La fotografia non è leggibile.', array( 'status' => 400 ) );
		}
		if ( strlen( $decoded['binary'] ) > 12 * MB_IN_BYTES ) {
			return new WP_Error( 'll_image', 'La fotografia supera 12 MB.', array( 'status' => 413 ) );
		}

		$preset = sanitize_key( (string) $request->get_param( 'preset' ) );
		$prompt = LL_Studio_Mapper::clean_text( $request->get_param( 'prompt' ), 600 );
		$ratio  = sanitize_text_field( (string) $request->get_param( 'ratio' ) );

		$result = LL_Studio_Gemini::generate( $decoded['mime'], base64_encode( $decoded['binary'] ), $preset, $prompt, $ratio );
		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return rest_ensure_response( array( 'image' => 'data:' . $result['mime'] . ';base64,' . $result['base64'] ) );
	}

	/**
	 * Elenco dei moduli Ninja Forms.
	 *
	 * @return WP_REST_Response
	 */
	public function forms() {
		$items = array();
		foreach ( LL_Studio_Leads::available_forms() as $id => $title ) {
			$items[] = array(
				'id'    => (int) $id,
				'title' => $title,
			);
		}
		return rest_ensure_response( array( 'items' => $items ) );
	}

	/**
	 * Elenco delle landing page.
	 *
	 * @return WP_REST_Response
	 */
	public function index() {
		$query = new WP_Query(
			array(
				'post_type'      => LL_LANDING_CPT,
				'post_status'    => array( 'publish', 'draft', 'pending', 'private' ),
				'posts_per_page' => 100,
				'orderby'        => 'modified',
				'order'          => 'DESC',
				'no_found_rows'  => true,
			)
		);

		$items = array();
		foreach ( $query->posts as $post ) {
			if ( ! current_user_can( 'edit_post', $post->ID ) ) {
				continue;
			}
			$items[] = LL_Studio_Mapper::summary( $post );
		}

		return rest_ensure_response( array( 'items' => $items ) );
	}

	/**
	 * Apre una landing page nello Studio.
	 *
	 * @param WP_REST_Request $request Richiesta.
	 * @return WP_REST_Response|WP_Error
	 */
	public function read( WP_REST_Request $request ) {
		$post = get_post( (int) $request['id'] );
		if ( ! $post || LL_LANDING_CPT !== $post->post_type ) {
			return new WP_Error( 'll_missing', 'Landing page non trovata.', array( 'status' => 404 ) );
		}
		if ( ! current_user_can( 'edit_post', $post->ID ) ) {
			return new WP_Error( 'll_forbidden', 'Non puoi aprire questa landing page.', array( 'status' => 403 ) );
		}

		return rest_ensure_response(
			array(
				'post'    => LL_Studio_Mapper::summary( $post ),
				'payload' => LL_Studio_Mapper::load( $post->ID ),
			)
		);
	}

	/**
	 * Crea o aggiorna una landing page.
	 *
	 * @param WP_REST_Request $request Richiesta.
	 * @return WP_REST_Response|WP_Error
	 */
	public function save( WP_REST_Request $request ) {
		if ( ! current_user_can( 'publish_ll_whitepapers' ) ) {
			return new WP_Error( 'll_forbidden', 'Il tuo account non può pubblicare landing page.', array( 'status' => 403 ) );
		}

		$payload = $request->get_json_params();
		if ( ! is_array( $payload ) ) {
			$payload = $request->get_params();
		}

		$result = LL_Studio_Mapper::save( $payload );
		if ( is_wp_error( $result ) ) {
			return $result;
		}
		return rest_ensure_response( $result );
	}

	/**
	 * Cestina una landing page.
	 *
	 * @param WP_REST_Request $request Richiesta.
	 * @return WP_REST_Response|WP_Error
	 */
	public function remove( WP_REST_Request $request ) {
		$post_id = (int) $request['id'];
		$post    = get_post( $post_id );
		if ( ! $post || LL_LANDING_CPT !== $post->post_type ) {
			return new WP_Error( 'll_missing', 'Landing page non trovata.', array( 'status' => 404 ) );
		}
		if ( ! current_user_can( 'delete_post', $post_id ) ) {
			return new WP_Error( 'll_forbidden', 'Non puoi eliminare questa landing page.', array( 'status' => 403 ) );
		}
		wp_trash_post( $post_id );
		return rest_ensure_response( array( 'deleted' => $post_id ) );
	}
}
