<?php
/**
 * Campi ACF della Landing Settore — SOLO versione GRATUITA di ACF.
 * Nessun ripetitore/gruppo (funzioni Pro): le liste si gestiscono con aree di testo
 * "una voce per riga". Registrati via codice: appaiono nel box "Landing Settore".
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Immagini di default dei materiali/stampanti (usate quando il campo immagine è vuoto).
 */
function ll_landing_default_images() {
	return array(
		'materials' => array(
			'https://www.layerloop3d.com/wp-content/uploads/2026/07/tpu.png',
			'https://www.layerloop3d.com/wp-content/uploads/2026/07/foam.png',
			'',
		),
		'printers' => array(
			'https://www.layerloop3d.com/wp-content/uploads/2025/10/Next.png',
			'https://www.layerloop3d.com/wp-content/uploads/2025/10/Extend.png',
		),
	);
}

/* helper per definire velocemente i campi */
function ll_f( $key, $name, $label, $type = 'text', $default = '', $extra = array() ) {
	return array_merge( array(
		'key' => $key, 'name' => $name, 'label' => $label, 'type' => $type, 'default_value' => $default,
	), $extra );
}
function ll_ta( $key, $name, $label, $default = '', $rows = 4, $instructions = '' ) {
	return array(
		'key' => $key, 'name' => $name, 'label' => $label, 'type' => 'textarea',
		'rows' => $rows, 'new_lines' => '', 'default_value' => $default, 'instructions' => $instructions,
	);
}
function ll_img( $key, $name, $label, $instructions = '' ) {
	return array(
		'key' => $key, 'name' => $name, 'label' => $label, 'type' => 'image',
		'return_format' => 'url', 'preview_size' => 'medium', 'instructions' => $instructions,
	);
}
function ll_msg( $key, $text ) {
	return array( 'key' => $key, 'label' => '', 'type' => 'message', 'message' => $text, 'esc_html' => 0 );
}

add_action( 'acf/init', function () {

	if ( ! function_exists( 'acf_add_local_field_group' ) ) {
		return;
	}

	$LINE = ' — una voce per riga.';

	acf_add_local_field_group( array(
		'key'      => 'group_ll_landing',
		'title'    => 'Landing Settore',
		'location' => array(
			array( array( 'param' => 'post_type', 'operator' => '==', 'value' => 'whitepaper' ) ),
			array( array( 'param' => 'post_type', 'operator' => '==', 'value' => 'page' ) ),
		),
		'position'              => 'normal',
		'style'                 => 'default',
		'label_placement'       => 'top',
		'instruction_placement' => 'label',
		'fields'   => array(

			/* ---------------- HERO ---------------- */
			array( 'key' => 'f_ll_tab_hero', 'label' => 'Hero', 'type' => 'tab' ),
			ll_f( 'f_ll_hero_eyebrow', 'll_hero_eyebrow', 'Occhiello', 'text', 'Raccordi & soffietti flessibili' ),
			ll_f( 'f_ll_hero_title', 'll_hero_title', 'Titolo', 'text', 'Soffietti flessibili, on-demand.', array( 'instructions' => 'Usa | per andare a capo. Es: "Soffietti flessibili,|on-demand."' ) ),
			ll_ta( 'f_ll_hero_lead', 'll_hero_lead', 'Sottotitolo', 'In Layflex e Foam, direttamente in stampa 3D. Senza stampi, senza quantitativi minimi. Da 1 pezzo.', 2 ),
			ll_f( 'f_ll_hero_hint', 'll_hero_hint', 'Scritta sopra l\'immagine (hint mouse)', 'text', 'Passa il mouse →', array( 'instructions' => 'Piccolo suggerimento che scompare al passaggio del mouse. Vuoto = nascosto.' ) ),
			ll_img( 'f_ll_hero_img_render', 'll_hero_img_render', 'Immagine RENDER (PNG trasparente)', 'PNG trasparente ~2000×1100 px. Stessa inquadratura del wireframe.' ),
			ll_img( 'f_ll_hero_img_wire', 'll_hero_img_wire', 'Immagine WIREFRAME (PNG trasparente)', 'PNG trasparente, STESSA inquadratura del render: le due si sovrappongono.' ),
			ll_ta( 'f_ll_hero_stats', 'll_hero_stats', 'Numeri chiave (max 4)', "~1h15 | tempo di stampa\n~50 g | peso pezzo\n€3,30 | al pezzo", 4, 'Una riga per numero, formato: VALORE | ETICHETTA' . '  (es. ~1h15 | tempo di stampa)' ),
			ll_f( 'f_ll_meta', 'll_meta', 'Riga meta in alto (3 voci separate da |)', 'text', 'LayerLoop 3D|Whitepaper 01 / 2026|Manifattura & Automazione' ),
			ll_f( 'f_ll_hero_cta1', 'll_hero_cta1', 'Bottone 1', 'text', 'Richiedi una demo live' ),
			ll_f( 'f_ll_hero_cta2', 'll_hero_cta2', 'Bottone 2 (vuoto = nascosto)', 'text', 'Scarica il whitepaper' ),

			/* ---------------- 01 PROBLEMA ---------------- */
			array( 'key' => 'f_ll_tab_prob', 'label' => '01 · Problema', 'type' => 'tab' ),
			ll_f( 'f_ll_prob_index', 'll_prob_index', 'Numerazione sezione', 'text', '01 / 05' ),
			ll_f( 'f_ll_prob_eyebrow', 'll_prob_eyebrow', 'Occhiello', 'text', 'Il problema' ),
			ll_f( 'f_ll_prob_title', 'll_prob_title', 'Titolo', 'text', 'Lo stampo non regge le piccole serie' ),
			ll_ta( 'f_ll_prob_lead', 'll_prob_lead', 'Testo introduttivo', 'I soffietti flessibili su misura richiedono stampi a iniezione dedicati e MOQ elevati. Con LayerLoop NEXT il pezzo esce direttamente dalla stampante.', 2 ),
			ll_f( 'f_ll_cmp_old_title', 'll_cmp_old_title', 'Colonna sinistra — intestazione', 'text', 'Stampo a iniezione' ),
			ll_ta( 'f_ll_cmp_old', 'll_cmp_old', 'Colonna sinistra — voci (✕)', "Stampo dedicato costoso\nMOQ (quantità minima) elevato\nSettimane di attesa per l'attrezzatura\nOgni modifica = nuovo stampo", 5, 'Una voce per riga.' ),
			ll_f( 'f_ll_cmp_new_title', 'll_cmp_new_title', 'Colonna destra — intestazione', 'text', 'LayerLoop NEXT' ),
			ll_ta( 'f_ll_cmp_new', 'll_cmp_new', 'Colonna destra — voci (✓)', "Nessuno stampo\nProduzione da 1 pezzo\n~1h15 a pezzo, produzione 24/7\nIteri il file CAD e ristampi subito", 5, 'Una voce per riga.' ),

			/* ---------------- 02 SOLUZIONE ---------------- */
			array( 'key' => 'f_ll_tab_sol', 'label' => '02 · Soluzione', 'type' => 'tab' ),
			ll_f( 'f_ll_sol_index', 'll_sol_index', 'Numerazione sezione', 'text', '02 / 05' ),
			ll_f( 'f_ll_sol_eyebrow', 'll_sol_eyebrow', 'Occhiello', 'text', 'La soluzione' ),
			array(
				'key' => 'f_ll_sol_text', 'name' => 'll_sol_text', 'label' => 'Testo centrale', 'type' => 'wysiwyg',
				'toolbar' => 'basic', 'media_upload' => 0, 'tabs' => 'visual',
				'default_value' => '<p>Con <b>Layerloop NEXT</b> il soffietto si stampa direttamente nella sua forma flessibile, senza stampo e senza minimi d\'ordine: in <b>Layflex</b> (TPU similgomma) per un comportamento elastico controllato, oppure in <b>Foam</b> quando serve maggiore deformabilità e smorzamento. L\'asse di stampa inclinato a <b>30°</b> produce il pezzo finito senza supporti, anche sulle geometrie a fisarmonica, e la produzione gira <b>h24 senza operatore</b>.</p>',
			),

			/* ---------------- 03 RISULTATO ---------------- */
			array( 'key' => 'f_ll_tab_case', 'label' => '03 · Risultato', 'type' => 'tab' ),
			ll_f( 'f_ll_case_index', 'll_case_index', 'Numerazione sezione', 'text', '03 / 05' ),
			ll_f( 'f_ll_case_eyebrow', 'll_case_eyebrow', 'Occhiello', 'text', 'Il risultato' ),
			ll_f( 'f_ll_case_title', 'll_case_title', 'Titolo', 'text', 'Dal file al pezzo, stampato' ),
			ll_img( 'f_ll_case_photo', 'll_case_photo', 'Foto del pezzo stampato', 'Foto su fondo chiaro (si fonde con lo sfondo) o PNG trasparente.' ),
			ll_ta( 'f_ll_case_specs', 'll_case_specs', 'Specifiche del pezzo (max 4)', "37×37×90 | mm\n~1h15 | stampa\n~50 g | materiale\n€3,30–3,50 | al pezzo", 4, 'Una riga per specifica, formato: VALORE | ETICHETTA' ),
			ll_ta( 'f_ll_case_lead', 'll_case_lead', 'Testo a destra', 'Un soffietto reale, prodotto senza stampo: stessa geometria a fisarmonica del file CAD, pronto all\'uso appena finita la stampa. Ogni misura parte da un nuovo file, non da un nuovo stampo.', 3 ),
			ll_f( 'f_ll_case_cta', 'll_case_cta', 'Etichetta bottone', 'text', 'Richiedi un campione' ),

			/* ---------------- PERCHÉ CONVIENE ---------------- */
			array( 'key' => 'f_ll_tab_why', 'label' => 'Perché conviene', 'type' => 'tab' ),
			ll_f( 'f_ll_why_eyebrow', 'll_why_eyebrow', 'Occhiello', 'text', 'Perché conviene' ),
			ll_f( 'f_ll_why_title', 'll_why_title', 'Titolo (usa | per andare a capo)', 'text', 'Zero stampo, zero MOQ,|produzione on-demand.' ),
			array(
				'key' => 'f_ll_why_text', 'name' => 'll_why_text', 'label' => 'Testo', 'type' => 'wysiwyg',
				'toolbar' => 'basic', 'media_upload' => 0, 'tabs' => 'visual',
				'default_value' => '<p>Durezza, passo del soffietto e diametri variano da file a file senza costi di attrezzaggio: <b>ogni misura è un nuovo file, non un nuovo stampo.</b></p>',
			),

			/* ---------------- 04 MATERIALI ---------------- */
			array( 'key' => 'f_ll_tab_mat', 'label' => '04 · Materiali', 'type' => 'tab' ),
			ll_f( 'f_ll_mat_index', 'll_mat_index', 'Numerazione sezione', 'text', '04 / 05' ),
			ll_f( 'f_ll_mat_eyebrow', 'll_mat_eyebrow', 'Occhiello', 'text', 'Materiali' ),
			ll_f( 'f_ll_mat_title', 'll_mat_title', 'Titolo', 'text', 'Due materiali, un processo' ),

			ll_msg( 'f_ll_mat1_msg', '<strong>Materiale 1</strong> — lascia il Nome vuoto per non mostrare questo materiale.' ),
			ll_f( 'f_ll_mat1_name', 'll_mat1_name', 'Materiale 1 — Nome', 'text', 'Layflex (TPU 95A)' ),
			ll_f( 'f_ll_mat1_sub', 'll_mat1_sub', 'Materiale 1 — Sottotitolo', 'text', 'TPU 95A · elastomero' ),
			ll_img( 'f_ll_mat1_img', 'll_mat1_img', 'Materiale 1 — Immagine tonda', 'Vuota = usa il campione standard.' ),
			ll_ta( 'f_ll_mat1_points', 'll_mat1_points', 'Materiale 1 — Caratteristiche', "Elastomero flessibile ad alta resistenza\nOttimo ritorno elastico e tenuta\nIdeale per soffietti e guarnizioni dinamiche", 4, 'Una caratteristica per riga.' ),

			ll_msg( 'f_ll_mat2_msg', '<strong>Materiale 2</strong>' ),
			ll_f( 'f_ll_mat2_name', 'll_mat2_name', 'Materiale 2 — Nome', 'text', 'Foam' ),
			ll_f( 'f_ll_mat2_sub', 'll_mat2_sub', 'Materiale 2 — Sottotitolo', 'text', 'Schiuma tecnica · smorzante' ),
			ll_img( 'f_ll_mat2_img', 'll_mat2_img', 'Materiale 2 — Immagine tonda', 'Vuota = usa il campione standard.' ),
			ll_ta( 'f_ll_mat2_points', 'll_mat2_points', 'Materiale 2 — Caratteristiche', "Struttura leggera e smorzante\nAssorbe vibrazioni e urti\nPerfetto per protezioni e imbottiture tecniche", 4, 'Una caratteristica per riga.' ),

			ll_msg( 'f_ll_mat3_msg', '<strong>Materiale 3</strong> — opzionale.' ),
			ll_f( 'f_ll_mat3_name', 'll_mat3_name', 'Materiale 3 — Nome', 'text', '' ),
			ll_f( 'f_ll_mat3_sub', 'll_mat3_sub', 'Materiale 3 — Sottotitolo', 'text', '' ),
			ll_img( 'f_ll_mat3_img', 'll_mat3_img', 'Materiale 3 — Immagine tonda' ),
			ll_ta( 'f_ll_mat3_points', 'll_mat3_points', 'Materiale 3 — Caratteristiche', '', 4, 'Una caratteristica per riga.' ),

			/* ---------------- 05 STAMPANTI ---------------- */
			array( 'key' => 'f_ll_tab_pr', 'label' => '05 · Stampanti', 'type' => 'tab' ),
			ll_f( 'f_ll_pr_index', 'll_pr_index', 'Numerazione sezione', 'text', '05 / 05' ),
			ll_f( 'f_ll_pr_eyebrow', 'll_pr_eyebrow', 'Occhiello', 'text', 'Le stampanti' ),
			ll_f( 'f_ll_pr_title', 'll_pr_title', 'Titolo', 'text', 'Scegli la piattaforma' ),

			ll_msg( 'f_ll_pr1_msg', '<strong>Stampante 1</strong> — lascia il Nome vuoto per non mostrarla.' ),
			ll_f( 'f_ll_pr1_name', 'll_pr1_name', 'Stampante 1 — Nome', 'text', 'LayerLoop NEXT' ),
			ll_img( 'f_ll_pr1_img', 'll_pr1_img', 'Stampante 1 — Immagine', 'Vuota = usa l\'immagine standard NEXT.' ),
			ll_ta( 'f_ll_pr1_specs', 'll_pr1_specs', 'Stampante 1 — Specifiche', "Asse di stampa inclinato | 30°\nStampa senza supporti | Sì\nFunzionamento | 24/7", 4, 'Una riga per specifica, formato: ETICHETTA | VALORE' ),
			ll_f( 'f_ll_pr1_cta', 'll_pr1_cta', 'Stampante 1 — Etichetta bottone', 'text', 'Scopri NEXT' ),
			ll_f( 'f_ll_pr1_link', 'll_pr1_link', 'Stampante 1 — Link bottone (vuoto = contatti)', 'url' ),
			array( 'key' => 'f_ll_pr1_style', 'name' => 'll_pr1_style', 'label' => 'Stampante 1 — Stile bottone', 'type' => 'select', 'choices' => array( 'solid' => 'Pieno (nero)', 'ghost' => 'Bordo' ), 'default_value' => 'solid' ),

			ll_msg( 'f_ll_pr2_msg', '<strong>Stampante 2</strong>' ),
			ll_f( 'f_ll_pr2_name', 'll_pr2_name', 'Stampante 2 — Nome', 'text', 'LayerLoop EXTEND' ),
			ll_img( 'f_ll_pr2_img', 'll_pr2_img', 'Stampante 2 — Immagine', 'Vuota = usa l\'immagine standard EXTEND.' ),
			ll_ta( 'f_ll_pr2_specs', 'll_pr2_specs', 'Stampante 2 — Specifiche', "Volume di stampa | Esteso\nPezzi di grande formato | Sì\nFunzionamento | 24/7", 4, 'Una riga per specifica, formato: ETICHETTA | VALORE' ),
			ll_f( 'f_ll_pr2_cta', 'll_pr2_cta', 'Stampante 2 — Etichetta bottone', 'text', 'Scopri EXTEND' ),
			ll_f( 'f_ll_pr2_link', 'll_pr2_link', 'Stampante 2 — Link bottone (vuoto = contatti)', 'url' ),
			array( 'key' => 'f_ll_pr2_style', 'name' => 'll_pr2_style', 'label' => 'Stampante 2 — Stile bottone', 'type' => 'select', 'choices' => array( 'solid' => 'Pieno (nero)', 'ghost' => 'Bordo' ), 'default_value' => 'ghost' ),

			/* ---------------- CTA FINALE ---------------- */
			array( 'key' => 'f_ll_tab_cta', 'label' => 'CTA finale', 'type' => 'tab' ),
			ll_f( 'f_ll_final_eyebrow', 'll_final_eyebrow', 'Occhiello', 'text', 'Inizia qui' ),
			ll_f( 'f_ll_final_title', 'll_final_title', 'Titolo', 'text', 'Parliamo del tuo progetto' ),
			ll_ta( 'f_ll_final_text', 'll_final_text', 'Testo', 'Portaci un componente flessibile e ti mostriamo come automatizzarne la produzione, senza stampi.', 2 ),
			ll_f( 'f_ll_final_cta1', 'll_final_cta1', 'Bottone 1', 'text', 'Richiedi una demo live' ),
			ll_f( 'f_ll_final_cta2', 'll_final_cta2', 'Bottone 2 (vuoto = nascosto)', 'text', 'Scarica il whitepaper' ),

			/* ---------------- CHIUSURA / ELEMENTOR ---------------- */
			array( 'key' => 'f_ll_tab_close', 'label' => 'Chiusura (Elementor)', 'type' => 'tab' ),
			ll_ta( 'f_ll_closing_lines', 'll_closing_lines', 'Blocchi Elementor dopo la landing — uno per riga', '', 5,
				'Scrivi UN BLOCCO PER RIGA. Ogni riga può essere: l\'ID di un template Elementor (solo il numero, es. 5921 → Modelli → Modelli salvati) OPPURE uno shortcode completo (es. [contact-form-7 id="12"]). Facoltativo: aggiungi " | contatti" a fine riga per dare un\'ancora HTML. Il primo blocco riceve #contatti in automatico.' ),

			/* ---------------- PDF / DOWNLOAD ---------------- */
			array( 'key' => 'f_ll_tab_pdf', 'label' => 'PDF / Download', 'type' => 'tab' ),
			array(
				'key' => 'f_ll_pdf', 'name' => 'll_pdf', 'label' => 'PDF del whitepaper (download dopo il form)',
				'type' => 'file', 'return_format' => 'id', 'mime_types' => 'pdf', 'library' => 'all',
				'instructions' => 'Carica qui il PDF. Verrà scaricato AUTOMATICAMENTE solo dopo che il visitatore ha inviato il form (Ninja Forms) in questa pagina. Lascia vuoto per non attivare il download.',
			),

			/* ---------------- IMPOSTAZIONI ---------------- */
			array( 'key' => 'f_ll_tab_set', 'label' => 'Impostazioni', 'type' => 'tab' ),
			ll_f( 'f_ll_anchor', 'll_anchor', 'Ancora / link dei bottoni', 'text', '#contatti', array( 'instructions' => 'Dove puntano tutti i bottoni: un\'ancora (#contatti) o un URL completo.' ) ),
		),
	) );
} );
