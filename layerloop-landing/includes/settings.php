<?php
/**
 * Impostazioni dello Studio (chiave Gemini, consegna whitepaper, accessi).
 *
 * @package LayerLoop_Landing
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Opzioni e pagina di configurazione.
 */
class LL_Studio_Settings {

	const OPTION = 'll_studio_settings';

	/**
	 * Valori predefiniti.
	 *
	 * @return array
	 */
	public static function defaults() {
		return array(
			'gemini_api_key' => '',
			'gemini_model'   => 'gemini-2.5-flash-image',
			'ninja_form_id'  => 0,
			'studio_page_id' => 0,
			'delivery_mode'  => 'both',
			'attach_pdf'     => 0,
			'link_ttl_hours' => 168,
			'email_subject'  => 'Il tuo whitepaper Layerloop: {whitepaper_title}',
			'email_body'     => "Ciao {nome},\n\ngrazie per l'interesse. Qui trovi il whitepaper richiesto:\n\n{download_url}\n\nIl link resta valido {ttl_ore} ore.\n\nUn saluto,\nIl team Layerloop",
			'lock_backend'   => 1,
		);
	}

	/**
	 * Tutte le opzioni con i default applicati.
	 *
	 * @return array
	 */
	public static function all() {
		$stored = get_option( self::OPTION, array() );
		if ( ! is_array( $stored ) ) {
			$stored = array();
		}
		return wp_parse_args( $stored, self::defaults() );
	}

	/**
	 * Singola opzione.
	 *
	 * @param string $key     Chiave.
	 * @param mixed  $default Ripiego.
	 * @return mixed
	 */
	public static function get( $key, $default = null ) {
		$all = self::all();
		return array_key_exists( $key, $all ) ? $all[ $key ] : $default;
	}

	/**
	 * Chiave Gemini: la costante di wp-config.php ha la precedenza.
	 *
	 * @return string
	 */
	public static function gemini_key() {
		if ( defined( 'LL_GEMINI_API_KEY' ) && LL_GEMINI_API_KEY ) {
			return (string) LL_GEMINI_API_KEY;
		}
		return (string) self::get( 'gemini_api_key', '' );
	}

	/**
	 * Indirizzo della pagina che ospita lo Studio.
	 *
	 * @return string
	 */
	public static function studio_url() {
		$page_id = (int) self::get( 'studio_page_id', 0 );
		if ( $page_id && get_post( $page_id ) ) {
			return get_permalink( $page_id );
		}
		$guess = get_page_by_path( 'pdf-generator' );
		if ( $guess ) {
			return get_permalink( $guess );
		}
		return home_url( '/' );
	}

	/**
	 * Hook amministrativi.
	 */
	public function register() {
		add_action( 'admin_menu', array( $this, 'add_menu' ) );
		add_action( 'admin_init', array( $this, 'register_settings' ) );
	}

	/**
	 * Sottovoce del menu Whitepaper.
	 */
	public function add_menu() {
		add_submenu_page(
			'edit.php?post_type=' . LL_LANDING_CPT,
			'Layerloop Studio',
			'Impostazioni Studio',
			'manage_options',
			'll-studio',
			array( $this, 'render_page' )
		);
	}

	/**
	 * Registra l'opzione unica.
	 */
	public function register_settings() {
		register_setting(
			'll_studio',
			self::OPTION,
			array(
				'type'              => 'array',
				'sanitize_callback' => array( $this, 'sanitize' ),
				'default'           => self::defaults(),
			)
		);
	}

	/**
	 * Pulizia dei valori inviati.
	 *
	 * @param mixed $input Valori grezzi.
	 * @return array
	 */
	public function sanitize( $input ) {
		$current = self::all();
		$input   = is_array( $input ) ? $input : array();
		$clean   = array();

		$clean['gemini_api_key'] = isset( $input['gemini_api_key'] ) ? trim( sanitize_text_field( $input['gemini_api_key'] ) ) : '';
		$clean['gemini_model']   = ! empty( $input['gemini_model'] ) ? sanitize_text_field( $input['gemini_model'] ) : 'gemini-2.5-flash-image';
		$clean['ninja_form_id']  = isset( $input['ninja_form_id'] ) ? absint( $input['ninja_form_id'] ) : 0;
		$clean['studio_page_id'] = isset( $input['studio_page_id'] ) ? absint( $input['studio_page_id'] ) : 0;

		$mode                   = isset( $input['delivery_mode'] ) ? sanitize_key( $input['delivery_mode'] ) : 'both';
		$clean['delivery_mode'] = in_array( $mode, array( 'email', 'download', 'both' ), true ) ? $mode : 'both';

		$clean['attach_pdf']     = empty( $input['attach_pdf'] ) ? 0 : 1;
		$clean['lock_backend']   = empty( $input['lock_backend'] ) ? 0 : 1;
		$clean['link_ttl_hours'] = isset( $input['link_ttl_hours'] ) ? max( 1, min( 8760, absint( $input['link_ttl_hours'] ) ) ) : 168;
		$clean['email_subject']  = isset( $input['email_subject'] ) ? sanitize_text_field( $input['email_subject'] ) : $current['email_subject'];
		$clean['email_body']     = isset( $input['email_body'] ) ? wp_strip_all_tags( (string) $input['email_body'] ) : $current['email_body'];

		return $clean;
	}

	/**
	 * Pagina impostazioni.
	 */
	public function render_page() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}
		$options = self::all();
		$forms   = LL_Studio_Leads::available_forms();
		$name    = self::OPTION;
		?>
		<div class="wrap">
			<h1>Layerloop Studio</h1>
			<p>Metti lo shortcode <code>[layerloop_studio]</code> nella pagina pubblica del generatore (es. <code>/pdf-generator/</code>). Da lì si crea il case study, si genera il PDF, si producono le immagini fil di ferro e si pubblica la landing page: la bacheca non serve mai.</p>

			<?php if ( '' === self::gemini_key() ) : ?>
				<div class="notice notice-warning inline"><p>Senza chiave Gemini il pulsante “Genera fil di ferro” resta disattivato. Tutto il resto funziona.</p></div>
			<?php endif; ?>
			<?php if ( ! LL_Studio_Leads::is_active() ) : ?>
				<div class="notice notice-warning inline"><p>Ninja Forms non risulta attivo: le landing vengono pubblicate senza modulo di contatto.</p></div>
			<?php endif; ?>
			<?php if ( ! function_exists( 'get_field' ) ) : ?>
				<div class="notice notice-error inline"><p>Advanced Custom Fields non è attivo: le landing non possono essere renderizzate.</p></div>
			<?php endif; ?>

			<form method="post" action="options.php">
				<?php settings_fields( 'll_studio' ); ?>

				<h2 class="title">Immagini AI (Gemini · Nano Banana)</h2>
				<table class="form-table" role="presentation">
					<tr>
						<th scope="row"><label for="ll-gemini-key">Chiave API Gemini</label></th>
						<td>
							<?php if ( defined( 'LL_GEMINI_API_KEY' ) && LL_GEMINI_API_KEY ) : ?>
								<p><em>Definita nella costante <code>LL_GEMINI_API_KEY</code> di wp-config.php: questo campo viene ignorato.</em></p>
							<?php endif; ?>
							<input type="password" class="regular-text" id="ll-gemini-key" name="<?php echo esc_attr( $name ); ?>[gemini_api_key]" value="<?php echo esc_attr( $options['gemini_api_key'] ); ?>" autocomplete="off" />
							<p class="description">Chiave di Google AI Studio. Resta sul server: il browser non la vede mai.</p>
						</td>
					</tr>
					<tr>
						<th scope="row"><label for="ll-gemini-model">Modello</label></th>
						<td>
							<input type="text" class="regular-text" id="ll-gemini-model" name="<?php echo esc_attr( $name ); ?>[gemini_model]" value="<?php echo esc_attr( $options['gemini_model'] ); ?>" />
							<p class="description">Predefinito: <code>gemini-2.5-flash-image</code>.</p>
						</td>
					</tr>
				</table>

				<h2 class="title">Studio e accessi</h2>
				<table class="form-table" role="presentation">
					<tr>
						<th scope="row"><label for="ll-page">Pagina dello Studio</label></th>
						<td>
							<?php
							wp_dropdown_pages(
								array(
									'name'              => $name . '[studio_page_id]',
									'id'                => 'll-page',
									'selected'          => $options['studio_page_id'],
									'show_option_none'  => '— rileva automaticamente /pdf-generator/ —',
									'option_none_value' => 0,
								)
							);
							?>
							<p class="description">Serve per il login e per riportare fuori dalla bacheca gli utenti dello Studio.</p>
						</td>
					</tr>
					<tr>
						<th scope="row">Bacheca</th>
						<td>
							<label><input type="checkbox" name="<?php echo esc_attr( $name ); ?>[lock_backend]" value="1" <?php checked( $options['lock_backend'], 1 ); ?> /> Gli utenti con ruolo “Layerloop Studio” non entrano in bacheca: vengono riportati alla pagina dello Studio.</label>
							<p class="description">Gli amministratori e i redattori non vengono mai reindirizzati.</p>
						</td>
					</tr>
				</table>

				<h2 class="title">Consegna del whitepaper (Ninja Forms)</h2>
				<table class="form-table" role="presentation">
					<tr>
						<th scope="row"><label for="ll-form">Modulo predefinito</label></th>
						<td>
							<select id="ll-form" name="<?php echo esc_attr( $name ); ?>[ninja_form_id]">
								<option value="0">— nessuno —</option>
								<?php foreach ( $forms as $form_id => $form_title ) : ?>
									<option value="<?php echo esc_attr( $form_id ); ?>" <?php selected( (int) $options['ninja_form_id'], (int) $form_id ); ?>><?php echo esc_html( $form_title . ' (#' . $form_id . ')' ); ?></option>
								<?php endforeach; ?>
							</select>
							<p class="description">Ogni landing può usarne uno diverso, scelto dallo Studio.</p>
						</td>
					</tr>
					<tr>
						<th scope="row">Come consegnare il PDF</th>
						<td>
							<fieldset>
								<label><input type="radio" name="<?php echo esc_attr( $name ); ?>[delivery_mode]" value="both" <?php checked( $options['delivery_mode'], 'both' ); ?> /> Download immediato in pagina ed email con link protetto</label><br />
								<label><input type="radio" name="<?php echo esc_attr( $name ); ?>[delivery_mode]" value="download" <?php checked( $options['delivery_mode'], 'download' ); ?> /> Solo download immediato in pagina</label><br />
								<label><input type="radio" name="<?php echo esc_attr( $name ); ?>[delivery_mode]" value="email" <?php checked( $options['delivery_mode'], 'email' ); ?> /> Solo email (il file non parte subito dal browser)</label>
							</fieldset>
							<p class="description">Il download immediato parte da solo al termine dell’invio, come già faceva la landing. L’email contiene un link firmato che scade.</p>
							<p><label><input type="checkbox" name="<?php echo esc_attr( $name ); ?>[attach_pdf]" value="1" <?php checked( $options['attach_pdf'], 1 ); ?> /> Allega anche il file all’email (sconsigliato sopra i 5 MB)</label></p>
						</td>
					</tr>
					<tr>
						<th scope="row"><label for="ll-ttl">Durata del link</label></th>
						<td><input type="number" min="1" max="8760" id="ll-ttl" name="<?php echo esc_attr( $name ); ?>[link_ttl_hours]" value="<?php echo esc_attr( $options['link_ttl_hours'] ); ?>" /> ore</td>
					</tr>
					<tr>
						<th scope="row"><label for="ll-subject">Oggetto email</label></th>
						<td><input type="text" class="large-text" id="ll-subject" name="<?php echo esc_attr( $name ); ?>[email_subject]" value="<?php echo esc_attr( $options['email_subject'] ); ?>" /></td>
					</tr>
					<tr>
						<th scope="row"><label for="ll-body">Testo email</label></th>
						<td>
							<textarea class="large-text" rows="8" id="ll-body" name="<?php echo esc_attr( $name ); ?>[email_body]"><?php echo esc_textarea( $options['email_body'] ); ?></textarea>
							<p class="description">Segnaposto: <code>{nome}</code> <code>{email}</code> <code>{whitepaper_title}</code> <code>{whitepaper_url}</code> <code>{download_url}</code> <code>{ttl_ore}</code></p>
						</td>
					</tr>
				</table>

				<?php submit_button(); ?>
			</form>
		</div>
		<?php
	}
}
