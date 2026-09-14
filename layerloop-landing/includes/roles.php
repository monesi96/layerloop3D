<?php
/**
 * Ruolo "Layerloop Studio", capability delle landing e blocco della bacheca.
 *
 * @package LayerLoop_Landing
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Accessi allo Studio pubblico.
 */
class LL_Studio_Roles {

	const ROLE = 'layerloop_studio';
	const CAP  = 'use_layerloop_studio';

	/**
	 * Capability generate dal custom post type whitepaper.
	 *
	 * @return array
	 */
	public static function whitepaper_caps() {
		return array(
			'edit_ll_whitepaper',
			'read_ll_whitepaper',
			'delete_ll_whitepaper',
			'edit_ll_whitepapers',
			'edit_others_ll_whitepapers',
			'publish_ll_whitepapers',
			'read_private_ll_whitepapers',
			'delete_ll_whitepapers',
			'delete_private_ll_whitepapers',
			'delete_published_ll_whitepapers',
			'delete_others_ll_whitepapers',
			'edit_private_ll_whitepapers',
			'edit_published_ll_whitepapers',
		);
	}

	/**
	 * Tutte le capability necessarie allo Studio.
	 *
	 * @return array
	 */
	public static function studio_caps() {
		$caps = array(
			'read'         => true,
			'upload_files' => true,
			self::CAP      => true,
		);
		foreach ( self::whitepaper_caps() as $cap ) {
			$caps[ $cap ] = true;
		}
		return $caps;
	}

	/**
	 * Crea il ruolo e allinea amministratori e redattori.
	 */
	public static function install() {
		$caps = self::studio_caps();

		$role = get_role( self::ROLE );
		if ( ! $role ) {
			add_role( self::ROLE, 'Layerloop Studio', $caps );
		} else {
			foreach ( array_keys( $caps ) as $cap ) {
				$role->add_cap( $cap );
			}
		}

		foreach ( array( 'administrator', 'editor' ) as $role_name ) {
			$existing = get_role( $role_name );
			if ( ! $existing ) {
				continue;
			}
			foreach ( array_keys( $caps ) as $cap ) {
				$existing->add_cap( $cap );
			}
		}
	}

	/**
	 * L'utente può usare lo Studio?
	 *
	 * @return bool
	 */
	public static function user_can_studio() {
		return is_user_logged_in() && current_user_can( self::CAP );
	}

	/**
	 * Hook runtime.
	 */
	public function register() {
		add_action( 'admin_init', array( $this, 'block_backend' ) );
		add_action( 'after_setup_theme', array( $this, 'hide_admin_bar' ) );
		add_filter( 'login_redirect', array( $this, 'login_redirect' ), 10, 3 );
	}

	/**
	 * Utente che deve restare fuori dalla bacheca?
	 *
	 * @param WP_User|null $user Utente.
	 * @return bool
	 */
	protected function is_studio_only( $user = null ) {
		$user = $user ? $user : wp_get_current_user();
		if ( ! $user || ! $user->exists() ) {
			return false;
		}
		if ( user_can( $user, 'manage_options' ) || user_can( $user, 'edit_posts' ) ) {
			return false;
		}
		return user_can( $user, self::CAP );
	}

	/**
	 * Riporta gli utenti dello Studio sulla pagina pubblica.
	 */
	public function block_backend() {
		if ( ! LL_Studio_Settings::get( 'lock_backend' ) ) {
			return;
		}
		if ( wp_doing_ajax() || ! $this->is_studio_only() ) {
			return;
		}
		wp_safe_redirect( LL_Studio_Settings::studio_url() );
		exit;
	}

	/**
	 * Niente barra di amministrazione per chi non entra in bacheca.
	 */
	public function hide_admin_bar() {
		if ( LL_Studio_Settings::get( 'lock_backend' ) && $this->is_studio_only() ) {
			show_admin_bar( false );
		}
	}

	/**
	 * Dopo il login porta gli utenti dello Studio alla pagina del generatore.
	 *
	 * @param string           $redirect_to Destinazione.
	 * @param string           $requested   Destinazione richiesta.
	 * @param WP_User|WP_Error $user        Utente.
	 * @return string
	 */
	public function login_redirect( $redirect_to, $requested, $user ) {
		if ( is_wp_error( $user ) || ! ( $user instanceof WP_User ) ) {
			return $redirect_to;
		}
		if ( $this->is_studio_only( $user ) ) {
			return LL_Studio_Settings::studio_url();
		}
		return $redirect_to;
	}
}
