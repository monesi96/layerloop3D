<?php
/**
 * Client Gemini per la generazione delle immagini "fil di ferro" (Nano Banana).
 *
 * @package LayerLoop_Landing
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Chiamate a generativelanguage.googleapis.com.
 */
class LL_Studio_Gemini {

	const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent';

	/**
	 * Preset di prompt disponibili nello Studio.
	 *
	 * @return array<string,array{label:string,prompt:string}>
	 */
	public static function presets() {
		return array(
			'wireframe' => array(
				'label'  => 'Fil di ferro tecnico',
				'prompt' => 'Redraw the component as a precise industrial technical wireframe: thin turquoise and teal mesh lines over the real geometry, slightly stronger outer contours, high detail contrast, no solid fills.',
			),
			'render'    => array(
				'label'  => 'Render pulito del pezzo',
				'prompt' => 'Render the component as a clean neutral studio product shot: soft even lighting, realistic material, no props, no hands, no background scenery.',
			),
			'blueprint' => array(
				'label'  => 'Disegno tecnico',
				'prompt' => 'Redraw the component as a clean technical blueprint line drawing: uniform dark outlines, hidden edges as dashed lines, no shading, no colour fills.',
			),
		);
	}

	/**
	 * Istruzioni complete inviate al modello.
	 *
	 * @param string $preset    Preset scelto.
	 * @param string $direction Indicazione libera dell'utente.
	 * @return string
	 */
	public static function build_prompt( $preset, $direction ) {
		$presets = self::presets();
		$style   = isset( $presets[ $preset ] ) ? $presets[ $preset ]['prompt'] : $presets['wireframe']['prompt'];

		$lines = array(
			'Isolate only the physical manufactured component shown in the supplied photograph.',
			$style,
			'Preserve the real geometry, proportions, openings, edges and perspective unless the user explicitly asks for a different orientation or proportion.',
			'Remove hands, people, machines, furniture, floors, shadows, reflections, text, logos and every environmental element.',
			'Place the subject on a perfectly flat, uniform pure white background (#FFFFFF): no gradient, no vignette, no glow, no checkerboard, no frame, no caption, no dimension line.',
			'Do not add any annotation, watermark or measurement unless explicitly requested.',
		);

		$direction = trim( (string) $direction );
		$lines[]   = '' !== $direction
			? 'User direction: ' . $direction
			: 'User direction: isolate the main manufactured component and keep its current orientation.';

		return implode( ' ', $lines );
	}

	/**
	 * Genera l'immagine a partire da una fotografia.
	 *
	 * @param string $mime      Mime dell'immagine sorgente.
	 * @param string $base64    Immagine sorgente codificata.
	 * @param string $preset    Preset di stile.
	 * @param string $direction Indicazione libera.
	 * @param string $ratio     Proporzione richiesta.
	 * @return array{mime:string,base64:string}|WP_Error
	 */
	public static function generate( $mime, $base64, $preset, $direction, $ratio = 'auto' ) {
		$key = LL_Studio_Settings::gemini_key();
		if ( '' === $key ) {
			return new WP_Error(
				'AI_NOT_CONFIGURED',
				'La chiave Gemini non è ancora configurata: chiedi a un amministratore di inserirla in Whitepaper → Impostazioni Studio.',
				array( 'status' => 503 )
			);
		}

		$model = LL_Studio_Settings::get( 'gemini_model', 'gemini-2.5-flash-image' );
		$body  = array(
			'contents'         => array(
				array(
					'role'  => 'user',
					'parts' => array(
						array( 'text' => self::build_prompt( $preset, $direction ) ),
						array(
							'inline_data' => array(
								'mime_type' => $mime,
								'data'      => $base64,
							),
						),
					),
				),
			),
			'generationConfig' => array(
				'responseModalities' => array( 'IMAGE' ),
			),
		);

		$ratios = array( '1:1', '3:2', '2:3', '4:3', '3:4', '16:9', '9:16', '5:4', '4:5', '21:9' );
		if ( in_array( $ratio, $ratios, true ) ) {
			$body['generationConfig']['imageConfig'] = array( 'aspectRatio' => $ratio );
		}

		$result = self::request( $model, $key, $body );

		// Alcune revisioni dell'API rifiutano la sola modalità IMAGE.
		if ( is_wp_error( $result ) && 'AI_MODALITY' === $result->get_error_code() ) {
			$body['generationConfig']['responseModalities'] = array( 'TEXT', 'IMAGE' );
			$result = self::request( $model, $key, $body );
		}

		return $result;
	}

	/**
	 * Esegue la chiamata ed estrae l'immagine.
	 *
	 * @param string $model Modello.
	 * @param string $key   Chiave API.
	 * @param array  $body  Corpo della richiesta.
	 * @return array{mime:string,base64:string}|WP_Error
	 */
	protected static function request( $model, $key, $body ) {
		$response = wp_remote_post(
			sprintf( self::ENDPOINT, rawurlencode( $model ) ),
			array(
				'timeout' => 120,
				'headers' => array(
					'Content-Type'   => 'application/json',
					'x-goog-api-key' => $key,
				),
				'body'    => wp_json_encode( $body ),
			)
		);

		if ( is_wp_error( $response ) ) {
			return new WP_Error( 'AI_NETWORK', 'Il server non è riuscito a contattare Gemini: ' . $response->get_error_message(), array( 'status' => 502 ) );
		}

		$code    = (int) wp_remote_retrieve_response_code( $response );
		$payload = json_decode( wp_remote_retrieve_body( $response ), true );

		if ( 200 !== $code ) {
			$message = isset( $payload['error']['message'] ) ? (string) $payload['error']['message'] : 'Generazione non riuscita.';
			if ( 400 === $code && false !== stripos( $message, 'modal' ) ) {
				return new WP_Error( 'AI_MODALITY', $message, array( 'status' => 400 ) );
			}
			if ( 401 === $code || 403 === $code ) {
				return new WP_Error( 'AI_AUTH', 'La chiave Gemini è stata rifiutata da Google.', array( 'status' => 502 ) );
			}
			if ( 429 === $code ) {
				return new WP_Error( 'AI_QUOTA', 'Quota Gemini esaurita per il momento: riprova fra qualche minuto.', array( 'status' => 429 ) );
			}
			return new WP_Error( 'AI_UPSTREAM', $message, array( 'status' => 502 ) );
		}

		$parts = isset( $payload['candidates'][0]['content']['parts'] ) ? $payload['candidates'][0]['content']['parts'] : array();
		foreach ( (array) $parts as $part ) {
			$inline = null;
			if ( isset( $part['inlineData'] ) ) {
				$inline = $part['inlineData'];
			} elseif ( isset( $part['inline_data'] ) ) {
				$inline = $part['inline_data'];
			}
			if ( ! is_array( $inline ) || empty( $inline['data'] ) ) {
				continue;
			}
			$mime = 'image/png';
			if ( ! empty( $inline['mimeType'] ) ) {
				$mime = (string) $inline['mimeType'];
			} elseif ( ! empty( $inline['mime_type'] ) ) {
				$mime = (string) $inline['mime_type'];
			}
			return array(
				'mime'   => $mime,
				'base64' => (string) $inline['data'],
			);
		}

		$reason = isset( $payload['candidates'][0]['finishReason'] ) ? (string) $payload['candidates'][0]['finishReason'] : '';
		if ( $reason && 'STOP' !== $reason ) {
			return new WP_Error( 'AI_BLOCKED', 'Gemini non ha prodotto un’immagine (motivo: ' . $reason . '). Prova a riformulare la richiesta.', array( 'status' => 502 ) );
		}

		return new WP_Error( 'AI_EMPTY', 'Gemini non ha restituito nessuna immagine.', array( 'status' => 502 ) );
	}
}
