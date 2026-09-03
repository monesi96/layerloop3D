<?php
/**
 * Shortcode [layerloop_studio]: l'intero flusso di lavoro in pagina pubblica.
 *
 * @package LayerLoop_Landing
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Login, asset e contenitore dell'applicazione.
 */
class LL_Studio_Shortcode {

	/**
	 * Hook.
	 */
	public function register() {
		add_shortcode( 'layerloop_studio', array( $this, 'render' ) );
		add_shortcode( 'll_studio', array( $this, 'render' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'register_assets' ) );
	}

	/**
	 * Registra gli asset dello Studio.
	 */
	public function register_assets() {
		wp_register_style(
			'll-studio-font',
			'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap',
			array(),
			null
		);
		wp_register_style( 'll-studio', LL_LANDING_URL . 'assets/studio.css', array( 'll-studio-font' ), LL_LANDING_VERSION );
		wp_register_script( 'll-jspdf', LL_LANDING_URL . 'vendor/jspdf.umd.min.js', array(), '2.5.2', true );
		wp_register_script( 'll-html2canvas', LL_LANDING_URL . 'vendor/html2canvas.min.js', array(), '1.4.1', true );
		wp_register_script( 'll-pdfjs', LL_LANDING_URL . 'vendor/pdf.min.js', array(), '3.11.174', true );
		wp_register_script( 'll-pdf-import', LL_LANDING_URL . 'assets/pdf-import.js', array( 'll-pdfjs' ), LL_LANDING_VERSION, true );
		wp_register_script( 'll-studio', LL_LANDING_URL . 'assets/studio.js', array( 'll-jspdf', 'll-html2canvas', 'll-pdf-import' ), LL_LANDING_VERSION, true );
	}

	/**
	 * Indirizzo corrente, usato per tornare qui dopo il login.
	 *
	 * @return string
	 */
	protected function current_url() {
		$post_id = get_queried_object_id();
		if ( $post_id ) {
			$permalink = get_permalink( $post_id );
			if ( $permalink ) {
				return $permalink;
			}
		}
		return LL_Studio_Settings::studio_url();
	}

	/**
	 * Contenuto dello shortcode.
	 *
	 * @return string
	 */
	public function render() {
		if ( ! is_user_logged_in() ) {
			return $this->login_screen();
		}
		if ( ! LL_Studio_Roles::user_can_studio() ) {
			return $this->no_access_screen();
		}
		return $this->app();
	}

	/**
	 * Schermata di accesso con l'account WordPress del sito.
	 *
	 * @return string
	 */
	protected function login_screen() {
		wp_enqueue_style( 'll-studio' );

		$form = wp_login_form(
			array(
				'echo'           => false,
				'redirect'       => $this->current_url(),
				'label_username' => 'Nome utente o email',
				'label_password' => 'Password',
				'label_log_in'   => 'Entra nello Studio',
				'remember'       => true,
				'value_remember' => true,
			)
		);

		ob_start();
		?>
		<div class="ll-studio-gate">
			<div class="ll-studio-gate-card">
				<div class="ll-studio-gate-brand">LAYERL∞P</div>
				<h2>Studio case study</h2>
				<p>Accedi con il tuo account Layerloop per creare il case study, generare il PDF e pubblicare la landing page del whitepaper.</p>
				<?php echo $form; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped — markup generato da wp_login_form(). ?>
				<p class="ll-studio-gate-help">
					Password dimenticata?
					<a href="<?php echo esc_url( wp_lostpassword_url( $this->current_url() ) ); ?>">Reimpostala qui</a>.
				</p>
			</div>
		</div>
		<?php
		return (string) ob_get_clean();
	}

	/**
	 * Utente autenticato ma senza permessi.
	 *
	 * @return string
	 */
	protected function no_access_screen() {
		wp_enqueue_style( 'll-studio' );
		$user = wp_get_current_user();

		ob_start();
		?>
		<div class="ll-studio-gate">
			<div class="ll-studio-gate-card">
				<div class="ll-studio-gate-brand">LAYERL∞P</div>
				<h2>Accesso non abilitato</h2>
				<p>Ciao <?php echo esc_html( $user->display_name ); ?>, il tuo account non ha ancora il permesso di usare lo Studio. Chiedi a un amministratore di assegnarti il ruolo <strong>Layerloop Studio</strong>.</p>
				<p><a class="ll-studio-gate-link" href="<?php echo esc_url( wp_logout_url( $this->current_url() ) ); ?>">Esci e cambia account</a></p>
			</div>
		</div>
		<?php
		return (string) ob_get_clean();
	}

	/**
	 * Contenitore dell'applicazione con la configurazione per il browser.
	 *
	 * @return string
	 */
	protected function app() {
		wp_enqueue_style( 'll-studio' );
		wp_enqueue_script( 'll-studio' );

		$user  = wp_get_current_user();
		$forms = array();
		foreach ( LL_Studio_Leads::available_forms() as $id => $title ) {
			$forms[] = array(
				'id'    => (int) $id,
				'title' => $title,
			);
		}

		$presets = array();
		foreach ( LL_Studio_Gemini::presets() as $key => $preset ) {
			$presets[] = array(
				'id'    => $key,
				'label' => $preset['label'],
			);
		}

		// wp_localize_script converte tutto in stringhe: qui servono booleani e interi veri.
		$config = array(
			'restUrl'     => esc_url_raw( rest_url( LL_Studio_Rest::NS ) ),
			'nonce'       => wp_create_nonce( 'wp_rest' ),
			'user'        => $user->display_name,
			'logoutUrl'   => wp_logout_url( $this->current_url() ),
			'homeUrl'     => home_url( '/' ),
			'pdfWorker'   => LL_LANDING_URL . 'vendor/pdf.worker.min.js',
			'closingBlock' => (string) LL_Studio_Settings::get( 'closing_block', '' ),
			'canPublish'  => current_user_can( 'publish_ll_whitepapers' ),
			'hasGemini'   => '' !== LL_Studio_Settings::gemini_key(),
			'hasForms'    => LL_Studio_Leads::is_active(),
			'defaultForm' => (int) LL_Studio_Settings::get( 'ninja_form_id', 0 ),
			'forms'       => $forms,
			'presets'     => $presets,
		);
		wp_add_inline_script( 'll-studio', 'window.LLStudioConfig = ' . wp_json_encode( $config ) . ';', 'before' );

		return '<div id="ll-studio" class="ll-studio" data-state="loading"><div class="ll-studio-boot">Caricamento dello Studio…</div></div>';
	}
}
