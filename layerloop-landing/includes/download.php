<?php
/**
 * Download "gated" del PDF del whitepaper.
 * Il PDF si scarica SOLO dopo l'invio del form (Ninja Forms) sulla pagina del whitepaper.
 *
 * Flusso:
 *  1) il visitatore invia il form Ninja Forms nella pagina del whitepaper;
 *  2) l'hook ninja_forms_after_submission imposta un cookie firmato (token HMAC) per quel whitepaper;
 *  3) il JS, al successo del form, apre l'endpoint di download;
 *  4) l'endpoint verifica il token e serve il PDF forzandone il download.
 *
 * Senza inviare il form non esiste un token valido → nessun download.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** Token firmato per il whitepaper (non falsificabile senza le chiavi del sito). */
function ll_wp_token( $pid ) {
	return hash_hmac( 'sha256', 'll_wp_' . (int) $pid, wp_salt( 'auth' ) );
}

/**
 * Sblocco lato server: quando un form Ninja Forms viene inviato da una pagina whitepaper,
 * imposta il cookie firmato per quel whitepaper (valido 2 ore).
 */
add_action( 'ninja_forms_after_submission', function ( $form_data ) {
	$ref = function_exists( 'wp_get_referer' ) ? wp_get_referer() : '';
	if ( ! $ref && ! empty( $_SERVER['HTTP_REFERER'] ) ) {
		$ref = esc_url_raw( wp_unslash( $_SERVER['HTTP_REFERER'] ) );
	}
	$pid = $ref ? url_to_postid( $ref ) : 0;

	if ( $pid && get_post_type( $pid ) === 'whitepaper' ) {
		$path = ( defined( 'COOKIEPATH' ) && COOKIEPATH ) ? COOKIEPATH : '/';
		$dom  = defined( 'COOKIE_DOMAIN' ) ? COOKIE_DOMAIN : '';
		@setcookie( 'll_wp_' . $pid, ll_wp_token( $pid ), time() + 2 * HOUR_IN_SECONDS, $path, $dom, is_ssl(), true );
	}
} );

/**
 * Endpoint di download: /?ll_wp_pdf=<ID>
 */
add_action( 'init', function () {
	if ( empty( $_GET['ll_wp_pdf'] ) ) {
		return;
	}
	$pid = absint( $_GET['ll_wp_pdf'] );
	if ( ! $pid || get_post_type( $pid ) !== 'whitepaper' ) {
		status_header( 404 );
		exit;
	}

	// verifica token (impostato solo dopo l'invio del form)
	$token = isset( $_COOKIE[ 'll_wp_' . $pid ] ) ? (string) $_COOKIE[ 'll_wp_' . $pid ] : '';
	if ( ! hash_equals( ll_wp_token( $pid ), $token ) ) {
		wp_safe_redirect( get_permalink( $pid ) . '#contatti' );
		exit;
	}

	// risolvi il percorso del PDF (campo ACF ll_pdf, return_format = id)
	$pdf  = get_field( 'll_pdf', $pid );
	$file = '';
	if ( is_numeric( $pdf ) ) {
		$file = get_attached_file( (int) $pdf );
	} elseif ( is_array( $pdf ) && ! empty( $pdf['id'] ) ) {
		$file = get_attached_file( (int) $pdf['id'] );
	} elseif ( is_string( $pdf ) && $pdf ) {
		$up   = wp_upload_dir();
		$file = str_replace( $up['baseurl'], $up['basedir'], $pdf );
	}

	if ( ! $file || ! file_exists( $file ) ) {
		status_header( 404 );
		exit;
	}

	// nome file "parlante": titolo-whitepaper.pdf
	$nice = sanitize_title( get_the_title( $pid ) );
	$name = ( $nice ? $nice : 'whitepaper' ) . '.pdf';

	nocache_headers();
	header( 'Content-Type: application/pdf' );
	header( 'Content-Disposition: attachment; filename="' . $name . '"' );
	header( 'Content-Length: ' . filesize( $file ) );
	readfile( $file );
	exit;
} );
