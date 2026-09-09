/*
 * Layerloop Studio — editor pubblico del case study, del PDF e della landing whitepaper.
 *
 * Non richiede build: JavaScript nativo, nessuna dipendenza oltre a jsPDF e html2canvas
 * caricati dal plugin. Lo stato vive in un unico oggetto; il pannello si costruisce da
 * schemi dichiarativi e l'anteprima A4 viene ridisegnata a ogni modifica.
 */
( function () {
	'use strict';

	var CFG = window.LLStudioConfig || {};
	var STORAGE_KEY = 'll-studio-project-v1';
	var LEGACY_KEYS = [ 'layerloop-case-study-generator-v2', 'layerloop-case-study-generator-v1' ];

	/* ------------------------------------------------------------------ dati */

	function uid( prefix ) {
		return prefix + '-' + Math.random().toString( 36 ).slice( 2, 9 );
	}

	function caseStudyDefaults() {
		return {
			brand: 'LAYERLOOP NEXT',
			document: 'Case Study  –  #1',
			title: 'Stampa 3D di grande formato\nper il settore nautico',
			subtitle: 'Plancia nautica lunga 1,60 metri prodotta in un unico pezzo, senza stampi, suddivisioni o giunzioni.',
			tags: 'Stampa 3D grande formato, Componenti nautici, Produzione digitale',
			section1Title: 'LA SFIDA',
			section1Text: 'Produzione di una plancia nautica con lunghezza di 1,60 metri, geometrie e alloggiamenti funzionali integrati. Il componente doveva essere realizzato in un unico elemento, garantendo continuità geometrica, precisione dimensionale e assenza di assemblaggio tra più sezioni.',
			section2Title: 'IL LIMITE DELLE TECNOLOGIE TRADIZIONALI',
			section2Text: 'Stampi e lavorazioni CNC richiedono attrezzature dedicate, tempi di preparazione e maggiori costi per prototipi e piccole serie.\n\nLa stampa FDM tradizionale è limitata dal volume di costruzione. I componenti fuori formato devono essere suddivisi, stampati separatamente e assemblati, introducendo giunzioni, lavorazioni aggiuntive e possibili discontinuità.',
			boxTitle: 'LA SOLUZIONE LAYERLOOP',
			boxText: 'Layerloop combina un piano di stampa a nastro con un asse di deposizione inclinato a 30°, consentendo la produzione di componenti più lunghi dell’area occupata dalla macchina.\n\nLa plancia è stata stampata direttamente dal modello 3D come un unico componente lungo 1,60 metri, senza stampi e senza giunzioni. Il processo digitale integra aperture e dettagli funzionali nel file e consente rapide personalizzazioni.',
			boxQuestion: 'Devi produrre componenti nautici di grande formato?',
			boxButton: 'Richiedi una consulenza',
			whyTitle: 'PERCHÉ CONVIENE',
			whyText: 'La produzione in un unico pezzo elimina incollaggi, allineamenti e finiture sulle giunzioni. L’assenza di stampi riduce tempi e costi di avviamento, rendendo il processo adatto a prototipi, ricambi personalizzati e piccole serie nautiche.',
			coverImage: '',
			pieceImage: '',
			logoImage: '',
			// Dove finisce il logo nel piè di pagina delle pagine interne:
			// left | right | center | none.
			logoPlacement: 'left',
			specs: [
				{ id: 'length', label: 'LUNGHEZZA', value: '1,60 m' },
				{ id: 'time', label: 'TEMPO DI STAMPA', value: 'Da inserire' },
				{ id: 'weight', label: 'MATERIALE IMPIEGATO', value: 'Da inserire' },
				{ id: 'resolution', label: 'RISOLUZIONE', value: 'Da inserire' },
				{ id: 'cost', label: 'COSTO MATERIALE INDICATIVO', value: 'Da inserire' }
			],
			materialTitle: 'MATERIALE',
			materialName: 'NOME MATERIALE',
			materialDescription: 'Descrizione tecnica sintetica del materiale impiegato.',
			performances: [
				{ id: 'difficulty', label: 'DIFFICOLTÀ DI STAMPA', value: 5 },
				{ id: 'elongation', label: 'ALLUNGAMENTO A ROTTURA', value: 6 },
				{ id: 'heat', label: 'RESISTENZA AL CALORE', value: 8 },
				{ id: 'impact', label: 'RESISTENZA AGLI URTI', value: 8 },
				{ id: 'layers', label: 'ADESIONE DEGLI STRATI', value: 9 },
				{ id: 'stress', label: 'MASSIMA SOLLECITAZIONE', value: 7 },
				{ id: 'visual', label: 'QUALITÀ VISIVA', value: 9 }
			],
			parameterTitle: 'PARAMETRO',
			benchmarkEnabled: false,
			benchmarkClassic: {
				eyebrow: 'BENCHMARK PRODUTTIVO',
				title: 'Produzione tradizionale vs Layerloop',
				intro: 'Confronto tecnico tra un processo convenzionale e la produzione additiva digitale dello stesso componente.',
				leftTitle: 'PRODUZIONE TRADIZIONALE',
				leftText: 'Processo basato su stampi, attrezzature dedicate o lavorazioni sottrattive, con costi e tempi di avviamento.',
				leftImage: '',
				rightTitle: 'LAYERLOOP',
				rightText: 'Produzione diretta dal file 3D, senza stampi e con possibilità di modificare rapidamente geometria e quantità.',
				rightImage: '',
				metrics: [
					{ id: 'lead', label: 'TEMPO DI AVVIAMENTO', left: 'Da inserire', right: 'Da inserire' },
					{ id: 'tooling', label: 'ATTREZZATURE', left: 'Stampi / utensili', right: 'Non richieste' },
					{ id: 'waste', label: 'SCARTO DI MATERIALE', left: 'Da inserire', right: 'Da inserire' },
					{ id: 'quantity', label: 'LOTTO PRODUTTIVO', left: 'Medie / grandi serie', right: 'Da 1 pezzo' },
					{ id: 'changes', label: 'MODIFICHE DI PROGETTO', left: 'Nuova attrezzatura', right: 'Aggiornamento file 3D' }
				],
				conclusionTitle: 'RISULTATO DEL CONFRONTO',
				conclusionText: 'Layerloop riduce le attività preliminari e abilita una produzione flessibile per prototipi, ricambi e piccole serie personalizzate.'
			},
			benchmarkFdm: {
				eyebrow: 'BENCHMARK TECNOLOGICO',
				title: 'FDM cartesiana vs Belt 3D Printing',
				intro: 'Analisi delle differenze di processo tra un volume di stampa chiuso e la deposizione inclinata su nastro trasportatore.',
				leftTitle: 'FDM CARTESIANA',
				leftText: 'Il componente è vincolato alle dimensioni del piano e richiede la rimozione manuale prima del ciclo successivo.',
				leftImage: '',
				rightTitle: 'BELT 3D PRINTING LAYERLOOP',
				rightText: 'Il nastro estende virtualmente l’asse di produzione e scarica automaticamente il componente a fine processo.',
				rightImage: '',
				metrics: [
					{ id: 'length', label: 'LUNGHEZZA MASSIMA', left: 'Limitata dal volume', right: 'Potenzialmente continua' },
					{ id: 'release', label: 'RIMOZIONE DEL PEZZO', left: 'Manuale', right: 'Automatica' },
					{ id: 'queue', label: 'CODA DI PRODUZIONE', left: 'Un piano per ciclo', right: 'Componenti in sequenza' },
					{ id: 'supports', label: 'GESTIONE SUPPORTI', left: 'Orientamento verticale', right: 'Deposizione inclinata 30°' },
					{ id: 'scaling', label: 'SCALABILITÀ', left: 'Vincolata al piano', right: 'Produzione continua' }
				],
				conclusionTitle: 'VANTAGGIO TECNOLOGICO',
				conclusionText: 'L’architettura a nastro supera il limite longitudinale del volume di stampa e automatizza la successione dei job.'
			}
		};
	}

	/**
	 * Documento vuoto: mantiene la struttura del case study — titoletti fissi,
	 * righe delle specifiche e degli indicatori — ma nessun contenuto. È il punto
	 * di partenza di ogni nuovo whitepaper, così un documento non eredita mai
	 * niente da quello precedente.
	 *
	 * @return {Object} Case study vuoto.
	 */
	function blankCaseStudy() {
		var data = caseStudyDefaults();

		[ 'document', 'title', 'subtitle', 'tags', 'section1Text', 'section2Text',
			'boxText', 'boxQuestion', 'whyText', 'materialName', 'materialDescription',
			'coverImage', 'pieceImage', 'logoImage' ].forEach( function ( key ) {
			data[ key ] = '';
		} );

		data.specs = data.specs.map( function ( spec ) {
			return { id: spec.id, label: spec.label, value: '' };
		} );
		data.benchmarkEnabled = false;

		return data;
	}

	function safeImage( value ) {
		return typeof value === 'string' ? value : '';
	}

	function normalizeCaseStudy( value ) {
		var base = caseStudyDefaults();
		var out = {};
		var key;
		value = value && typeof value === 'object' ? value : {};

		for ( key in base ) {
			if ( Object.prototype.hasOwnProperty.call( base, key ) ) {
				out[ key ] = Object.prototype.hasOwnProperty.call( value, key ) ? value[ key ] : base[ key ];
			}
		}

		out.coverImage = safeImage( out.coverImage );
		out.pieceImage = safeImage( out.pieceImage );
		out.logoImage = safeImage( out.logoImage );
		if ( -1 === [ 'left', 'right', 'center', 'none' ].indexOf( out.logoPlacement ) ) {
			out.logoPlacement = 'left';
		}
		out.benchmarkEnabled = !! out.benchmarkEnabled;
		out.specs = Array.isArray( out.specs ) ? out.specs : base.specs;
		out.performances = Array.isArray( out.performances ) ? out.performances : base.performances;

		[ 'benchmarkClassic', 'benchmarkFdm' ].forEach( function ( pageKey ) {
			var page = {};
			var source = value[ pageKey ] && typeof value[ pageKey ] === 'object' ? value[ pageKey ] : {};
			var field;
			for ( field in base[ pageKey ] ) {
				if ( Object.prototype.hasOwnProperty.call( base[ pageKey ], field ) ) {
					page[ field ] = Object.prototype.hasOwnProperty.call( source, field ) ? source[ field ] : base[ pageKey ][ field ];
				}
			}
			page.leftImage = safeImage( page.leftImage );
			page.rightImage = safeImage( page.rightImage );
			page.metrics = Array.isArray( page.metrics ) ? page.metrics : base[ pageKey ].metrics;
			out[ pageKey ] = page;
		} );

		return out;
	}

	/* ------------------------------------------------- schema della landing */

	function lines( items ) {
		return items.filter( Boolean ).join( '\n' );
	}

	/**
	 * I valori segnaposto del modello ("Da inserire") vanno bene nel PDF, dove
	 * ricordano cosa manca, ma sulla landing sarebbero testo pubblicato: qui si
	 * riconoscono per scartarli.
	 *
	 * @param {string} value Valore da valutare.
	 * @return {boolean} true se non va pubblicato.
	 */
	function isPlaceholder( value ) {
		var text = String( value || '' ).trim();
		if ( '' === text ) {
			return true;
		}
		return /^(da\s+inserire|da\s+definire|da\s+compilare|n\/?d|tbd|[-–—.]+)$/i.test( text );
	}

	/**
	 * Coppie "valore | etichetta" per le righe di numeri della landing,
	 * saltando quelle ancora da compilare.
	 *
	 * @param {Array} items Specifiche del case study.
	 * @param {number} max  Quante tenerne.
	 * @return {string} Righe pronte per il campo ACF.
	 */
	function tagList( cs ) {
		return String( cs.tags || '' ).split( ',' ).map( function ( tag ) {
			return tag.trim();
		} ).filter( function ( tag ) {
			return tag && ! isPlaceholder( tag );
		} );
	}

	function statLines( items, max ) {
		return lines( ( items || [] ).filter( function ( item ) {
			return ! isPlaceholder( item.value ) && ! isPlaceholder( item.label );
		} ).slice( 0, max ).map( function ( item ) {
			return item.value + ' | ' + String( item.label || '' ).toLowerCase();
		} ) );
	}

	function firstTag( cs ) {
		var tags = tagList( cs );
		return tags.length ? tags[ 0 ] : cs.document;
	}

	function paragraphsToHtml( text ) {
		return String( text || '' )
			.split( /\n{2,}/ )
			.map( function ( block ) {
				return block.trim();
			} )
			.filter( Boolean )
			.map( function ( block ) {
				return '<p>' + block.replace( /&/g, '&amp;' ).replace( /</g, '&lt;' ).replace( />/g, '&gt;' ).replace( /\n/g, '<br>' ) + '</p>';
			} )
			.join( '' );
	}

	function firstParagraph( text ) {
		return String( text || '' ).split( /\n{2,}/ )[ 0 ].trim();
	}

	/*
	 * Struttura della landing: cinque blocchi, con il testo del case study preso
	 * per intero e senza riscritture. L'ordine è quello del whitepaper — la sfida,
	 * il limite, la soluzione, i materiali, perché scegliere Layerloop — più l'hero
	 * in apertura e la chiamata all'azione in chiusura.
	 */
	var LANDING_SCHEMA = [
		{
			legend: 'Hero',
			help: 'Si compila da solo con quello che scrivi nel case study. Quando cambi un campo qui, quel campo smette di seguire il case study: il pulsante “Riporta tutta la landing al case study” lo rimette in riga.',
			fields: [
				{ name: 'll_hero_title', label: 'Titolo (usa | per andare a capo)', max: 160, from: function ( cs ) { return String( cs.title || '' ).replace( /\n+/g, '|' ); } },
				{ name: 'll_hero_lead', label: 'Sottotitolo', type: 'textarea', rows: 3, max: 320, from: function ( cs ) { return cs.subtitle; } },
				{ name: 'll_meta', label: 'Riga meta in alto (voci separate da |)', max: 160, from: function ( cs ) { return [ cs.brand, cs.document ].filter( Boolean ).join( '|' ); } },
				{ name: 'll_hero_tags', label: 'Etichette sotto il sottotitolo (i tag del PDF, separati da virgola)', max: 160, from: function ( cs ) { return tagList( cs ).join( ', ' ); } },
				{ name: 'll_hero_stats', label: 'Numeri chiave — VALORE | ETICHETTA, uno per riga', type: 'textarea', rows: 6, max: 700, from: function ( cs ) {
					// Tutte le specifiche compilate del case study, non solo le prime:
					// nell'hero servono i dati del pezzo, ed erano il primo dato a perdersi.
					return statLines( cs.specs, 6 );
				} },
				{ name: 'll_hero_eyebrow', label: 'Occhiello (facoltativo: i tag sono già sotto il titolo)', max: 90, from: function () { return ''; } },
				{ name: 'll_hero_img_render', label: 'Immagine dell’hero (predefinita: copertina del PDF)', type: 'image', maxDimension: 2000, fromImage: 'coverImage' },
				{ name: 'll_hero_img_wire', label: 'Immagine WIREFRAME — facoltativa, attiva l’effetto al passaggio del mouse', type: 'image', maxDimension: 2000 },
				{ name: 'll_hero_cta1', label: 'Bottone 1', max: 60, from: function ( cs ) { return cs.boxButton; } },
				{ name: 'll_hero_cta2', label: 'Bottone 2 (vuoto = nascosto)', max: 60, from: function () { return 'Scarica il whitepaper'; } }
			]
		},
		{
			legend: 'La sfida',
			fields: [
				{ name: 'll_prob_title', label: 'Titolo del blocco', max: 140, from: function ( cs ) { return cs.section1Title; } },
				{ name: 'll_prob_lead', label: 'Testo', type: 'textarea', rows: 8, max: 1500, from: function ( cs ) { return cs.section1Text; } },
				{ name: 'll_prob_eyebrow', label: 'Occhiello (facoltativo)', max: 60, from: function () { return ''; } }
			]
		},
		{
			legend: 'Il limite delle tecnologie tradizionali',
			fields: [
				{ name: 'll_limit_title', label: 'Titolo del blocco', max: 140, from: function ( cs ) { return cs.section2Title; } },
				{ name: 'll_limit_text', label: 'Testo', type: 'textarea', rows: 9, max: 1600, from: function ( cs ) { return cs.section2Text; } },
				{ name: 'll_limit_eyebrow', label: 'Occhiello (facoltativo)', max: 60, from: function () { return ''; } }
			]
		},
		{
			legend: 'La soluzione',
			fields: [
				{ name: 'll_sol_title', label: 'Titolo del blocco', max: 140, from: function ( cs ) { return cs.boxTitle; } },
				{ name: 'll_sol_text', label: 'Testo (accetta <b> e <p>)', type: 'textarea', rows: 9, max: 3000, html: true, from: function ( cs ) { return paragraphsToHtml( cs.boxText ); } },
				{ name: 'll_sol_eyebrow', label: 'Occhiello (facoltativo)', max: 60, from: function () { return ''; } }
			]
		},
		{
			legend: 'I materiali',
			fields: [
				{ name: 'll_mat_title', label: 'Titolo del blocco', max: 140, from: function () { return 'I materiali'; } },
				{ name: 'll_mat1_name', label: 'Nome del materiale', max: 60, from: function ( cs ) {
					return isPlaceholder( cs.materialName ) || /^nome materiale$/i.test( String( cs.materialName ).trim() ) ? '' : cs.materialName;
				} },
				{ name: 'll_mat1_sub', label: 'Descrizione', type: 'textarea', rows: 3, max: 300, from: function ( cs ) {
					return isPlaceholder( cs.materialDescription ) ? '' : cs.materialDescription;
				} },
				{ name: 'll_mat_bars', label: 'Indicatori — ETICHETTA | VALORE, uno per riga', type: 'textarea', rows: 8, max: 600, from: function ( cs ) {
					return lines( ( cs.performances || [] ).filter( function ( item ) {
						return ! isPlaceholder( item.label );
					} ).map( function ( item ) {
						return item.label + ' | ' + item.value;
					} ) );
				} },
				{ name: 'll_mat1_img', label: 'Foto nella scheda materiale (predefinita: foto del pezzo)', type: 'image', maxDimension: 1400, fromImage: 'pieceImage' },
				{ name: 'll_mat_eyebrow', label: 'Occhiello (facoltativo)', max: 60, from: function () { return ''; } }
			]
		},
		{
			legend: 'Perché scegliere Layerloop',
			fields: [
				{ name: 'll_why_title', label: 'Titolo del blocco (usa | per andare a capo)', max: 160, from: function () { return 'Perché scegliere Layerloop'; } },
				{ name: 'll_why_text', label: 'Testo (accetta <b> e <p>)', type: 'textarea', rows: 6, max: 1600, html: true, from: function ( cs ) { return paragraphsToHtml( cs.whyText ); } },
				{ name: 'll_why_eyebrow', label: 'Occhiello (facoltativo)', max: 60, from: function () { return ''; } }
			]
		},
		{
			legend: 'Chiusura e contatti',
			fields: [
				{ name: 'll_final_title', label: 'Titolo', max: 140, from: function ( cs ) { return cs.boxQuestion; } },
				{ name: 'll_final_text', label: 'Testo (facoltativo)', type: 'textarea', rows: 3, max: 700, from: function () { return ''; } },
				{ name: 'll_final_cta1', label: 'Bottone 1', max: 60, from: function ( cs ) { return cs.boxButton; } },
				{ name: 'll_final_cta2', label: 'Bottone 2 (vuoto = nascosto)', max: 60, from: function () { return 'Scarica il whitepaper'; } },
				{ name: 'll_final_eyebrow', label: 'Occhiello (facoltativo)', max: 60, from: function () { return ''; } },
				{ name: 'll_anchor', label: 'Ancora dei bottoni', max: 200, from: function () { return '#contatti'; } },
				{
					name: 'll_closing_lines',
					label: 'Blocco di chiusura — modulo contatti e piè di pagina',
					type: 'textarea',
					rows: 2,
					max: 600,
					from: function () {
						var block = ( window.LLStudioConfig && window.LLStudioConfig.closingBlock ) || '';
						return block ? block + ' | contatti' : '';
					}
				}
			]
		}
	];

	function landingDefaults( caseStudy ) {
		var fields = {};
		LANDING_SCHEMA.forEach( function ( section ) {
			section.fields.forEach( function ( def ) {
				if ( 'image' === def.type ) {
					fields[ def.name ] = { id: 0, url: '', dataUrl: '' };
					return;
				}
				fields[ def.name ] = def.from ? String( def.from( caseStudy ) || '' ) : '';
			} );
		} );
		return fields;
	}

	/**
	 * Allinea i testi della landing al case study.
	 *
	 * I campi della landing nascono dal case study, ma restavano fermi al valore
	 * calcolato quando lo Studio si era aperto: chi compilava prima il PDF e poi
	 * passava alla landing la trovava vuota, perché i testi erano stati letti da un
	 * documento ancora bianco. Qui si ricalcolano a ogni modifica, saltando i campi
	 * che sono stati riscritti a mano — quelli restano dell'utente.
	 */
	function syncLandingFromCase() {
		var defaults = landingDefaults( state.data );
		LANDING_SCHEMA.forEach( function ( section ) {
			section.fields.forEach( function ( def ) {
				if ( 'image' === def.type || ! def.from || state.fieldsTouched[ def.name ] ) {
					return;
				}
				state.fields[ def.name ] = defaults[ def.name ];
			} );
		} );
	}

	/**
	 * Segna un campo della landing come scritto a mano: da quel momento non segue
	 * più il case study.
	 *
	 * @param {string} name Nome del campo.
	 */
	function markTouched( name ) {
		state.fieldsTouched[ name ] = true;
	}

	/**
	 * Ricostruisce l'elenco dei campi scritti a mano confrontando i valori salvati
	 * con quelli che il case study produrrebbe: serve riaprendo una landing, dove
	 * non si sa più quali testi fossero stati personalizzati.
	 *
	 * @param {Object} fields Campi salvati.
	 * @return {Object} Mappa dei campi da non toccare più.
	 */
	function touchedFromFields( fields ) {
		var defaults = landingDefaults( state.data );
		// Valori che una landing pubblicata prima di questa versione poteva avere
		// per il difetto di allineamento: erano stati letti da un case study ancora
		// vuoto, quindi non sono scelte da rispettare.
		var stale = landingDefaults( blankCaseStudy() );
		var touched = {};
		Object.keys( fields || {} ).forEach( function ( name ) {
			var value = fields[ name ];
			if ( value && typeof value === 'object' ) {
				return;
			}
			// Un campo vuoto non è una scelta: è un testo che non è mai arrivato.
			// Torna a seguire il case study, così le landing pubblicate a metà si
			// completano riaprendole e ripubblicandole.
			if ( '' === String( value || '' ).trim() ) {
				return;
			}
			if ( String( value ) === String( stale[ name ] || '' ) ) {
				return;
			}
			if ( String( value ) !== String( defaults[ name ] || '' ) ) {
				touched[ name ] = true;
			}
		} );
		return touched;
	}

	/* -------------------------------------------------------------- stato */

	var state = {
		data: blankCaseStudy(),
		fields: {},
		postId: 0,
		title: '',
		status: 'publish',
		metaDescription: '',
		formId: CFG.defaultForm || 0,
		tab: 'case',
		language: 'it',
		displayData: null,
		whitepapers: [],
		ai: { preset: 'wireframe', prompt: '', ratio: 'auto', cutout: true, target: 'coverImage' },
		// Campi della landing riscritti a mano: non seguono più il case study.
		fieldsTouched: {},
		// PDF già impaginati caricati dall'utente: restano in memoria, non in localStorage.
		fieldsBackup: null,
		pdfSource: 'generate',
		pdfFiles: { it: '', en: '', itName: '', enName: '', itFile: null },
		// PDF già allegato alla landing aperta dall'Archivio.
		pdfAttached: { it: '', en: '' },
		// Logo Layerloop del sito, già pronto per il piè di pagina di ogni PDF.
		defaultLogo: ''
	};
	state.fields = landingDefaults( state.data );

	var refs = {};
	var previewFrame = null;

	/* ----------------------------------------------------------- utilità DOM */

	function el( tag, attrs, children ) {
		var node = document.createElement( tag );
		var key;
		if ( attrs ) {
			for ( key in attrs ) {
				if ( ! Object.prototype.hasOwnProperty.call( attrs, key ) ) {
					continue;
				}
				if ( 'class' === key ) {
					node.className = attrs[ key ];
				} else if ( 'text' === key ) {
					node.textContent = attrs[ key ];
				} else if ( 'html' === key ) {
					node.innerHTML = attrs[ key ];
				} else if ( 0 === key.indexOf( 'on' ) && typeof attrs[ key ] === 'function' ) {
					node.addEventListener( key.slice( 2 ), attrs[ key ] );
				} else if ( false === attrs[ key ] || null === attrs[ key ] || undefined === attrs[ key ] ) {
					continue;
				} else if ( true === attrs[ key ] ) {
					node.setAttribute( key, key );
				} else {
					node.setAttribute( key, attrs[ key ] );
				}
			}
		}
		( children || [] ).forEach( function ( child ) {
			if ( null === child || undefined === child || false === child ) {
				return;
			}
			node.appendChild( typeof child === 'string' ? document.createTextNode( child ) : child );
		} );
		return node;
	}

	function clear( node ) {
		while ( node.firstChild ) {
			node.removeChild( node.firstChild );
		}
		return node;
	}

	/* ------------------------------------------------------------ immagini */

	function optimizeImage( file, maxDimension ) {
		return new Promise( function ( resolve, reject ) {
			if ( ! file.type || 0 !== file.type.indexOf( 'image/' ) ) {
				reject( new Error( 'Seleziona un file immagine valido.' ) );
				return;
			}
			if ( file.size > 25 * 1024 * 1024 ) {
				reject( new Error( 'L’immagine supera 25 MB. Riducila prima di caricarla.' ) );
				return;
			}
			var objectUrl = URL.createObjectURL( file );
			var image = new Image();
			image.onload = function () {
				try {
					resolve( resizeToDataUrl( image, maxDimension ) );
				} catch ( error ) {
					reject( error );
				} finally {
					URL.revokeObjectURL( objectUrl );
				}
			};
			image.onerror = function () {
				URL.revokeObjectURL( objectUrl );
				reject( new Error( 'Formato immagine non supportato. Usa PNG, JPG o WebP.' ) );
			};
			image.src = objectUrl;
		} );
	}

	function resizeToDataUrl( image, maxDimension ) {
		var scale = Math.min( 1, maxDimension / Math.max( image.naturalWidth, image.naturalHeight ) );
		var canvas = document.createElement( 'canvas' );
		canvas.width = Math.max( 1, Math.round( image.naturalWidth * scale ) );
		canvas.height = Math.max( 1, Math.round( image.naturalHeight * scale ) );
		var context = canvas.getContext( '2d', { alpha: true } );
		if ( ! context ) {
			throw new Error( 'Il browser non può elaborare questa immagine.' );
		}
		context.clearRect( 0, 0, canvas.width, canvas.height );
		context.drawImage( image, 0, 0, canvas.width, canvas.height );
		return canvas.toDataURL( 'image/webp', 0.86 );
	}

	function loadImage( src ) {
		return new Promise( function ( resolve, reject ) {
			var image = new Image();
			image.crossOrigin = 'anonymous';
			image.onload = function () {
				resolve( image );
			};
			image.onerror = function () {
				reject( new Error( 'Immagine non caricabile.' ) );
			};
			image.src = src;
		} );
	}

	/**
	 * Logo del sito per i PDF, rasterizzato una volta sola in PNG.
	 *
	 * Il piè di pagina va composto da html2canvas: un PNG in data URL si disegna
	 * sempre, mentre un SVG o un file su un altro dominio potrebbero restare bianchi.
	 * Se la conversione non riesce si usa l'indirizzo così com'è.
	 */
	function loadDefaultLogo() {
		if ( ! CFG.logoUrl ) {
			return Promise.resolve( '' );
		}
		return loadImage( CFG.logoUrl ).then( function ( image ) {
			var width = image.naturalWidth || image.width || 400;
			var height = image.naturalHeight || image.height || 86;
			var scale = Math.min( 3, 1200 / width );
			var canvas = document.createElement( 'canvas' );
			canvas.width = Math.round( width * scale );
			canvas.height = Math.round( height * scale );
			canvas.getContext( '2d' ).drawImage( image, 0, 0, canvas.width, canvas.height );
			try {
				return canvas.toDataURL( 'image/png' );
			} catch ( error ) {
				return CFG.logoUrl;
			}
		} ).catch( function () {
			return CFG.logoUrl;
		} );
	}

	/**
	 * Logo da stampare sul PDF: quello caricato nel case study, altrimenti quello del sito.
	 */
	function logoSource( data ) {
		return data.logoImage || state.defaultLogo || '';
	}

	/**
	 * Rende trasparente lo sfondo uniforme prodotto da Gemini.
	 * Riempimento a partire dai bordi: si eliminano solo i pixel collegati
	 * al contorno, così le zone chiare interne al pezzo restano intatte.
	 */
	function removeFlatBackground( dataUrl, tolerance ) {
		return loadImage( dataUrl ).then( function ( image ) {
			var canvas = document.createElement( 'canvas' );
			canvas.width = image.naturalWidth;
			canvas.height = image.naturalHeight;
			var context = canvas.getContext( '2d' );
			context.drawImage( image, 0, 0 );

			var width = canvas.width;
			var height = canvas.height;
			var total = width * height;
			var pixels = context.getImageData( 0, 0, width, height );
			var data = pixels.data;
			var seen = new Uint8Array( total );
			var queue = new Int32Array( total );
			var head = 0;
			var tail = 0;
			var i;

			// Colore di riferimento: media dei quattro angoli, dove sta sempre lo sfondo.
			var corners = [ 0, width - 1, ( height - 1 ) * width, total - 1 ];
			var refR = 0;
			var refG = 0;
			var refB = 0;
			corners.forEach( function ( index ) {
				refR += data[ index * 4 ];
				refG += data[ index * 4 + 1 ];
				refB += data[ index * 4 + 2 ];
			} );
			refR /= corners.length;
			refG /= corners.length;
			refB /= corners.length;

			function matches( index ) {
				var r = data[ index * 4 ] - refR;
				var g = data[ index * 4 + 1 ] - refG;
				var b = data[ index * 4 + 2 ] - refB;
				return Math.sqrt( r * r + g * g + b * b ) <= tolerance;
			}

			function enqueue( index ) {
				if ( seen[ index ] ) {
					return;
				}
				seen[ index ] = 1;
				queue[ tail++ ] = index;
			}

			for ( i = 0; i < width; i++ ) {
				enqueue( i );
				enqueue( ( height - 1 ) * width + i );
			}
			for ( i = 0; i < height; i++ ) {
				enqueue( i * width );
				enqueue( i * width + width - 1 );
			}

			while ( head < tail ) {
				var index = queue[ head++ ];
				if ( ! matches( index ) ) {
					continue;
				}
				data[ index * 4 + 3 ] = 0;

				var x = index % width;
				var y = ( index - x ) / width;
				if ( x > 0 ) {
					enqueue( index - 1 );
				}
				if ( x < width - 1 ) {
					enqueue( index + 1 );
				}
				if ( y > 0 ) {
					enqueue( index - width );
				}
				if ( y < height - 1 ) {
					enqueue( index + width );
				}
			}

			context.putImageData( pixels, 0, 0 );
			return canvas.toDataURL( 'image/webp', 0.9 );
		} );
	}

	/* --------------------------------------------------------- file PDF */

	function fileToBase64( file ) {
		return new Promise( function ( resolve, reject ) {
			var reader = new FileReader();
			reader.onload = function () {
				var value = String( reader.result || '' );
				resolve( value.slice( value.indexOf( ',' ) + 1 ) );
			};
			reader.onerror = function () {
				reject( new Error( 'Lettura del file non riuscita.' ) );
			};
			reader.readAsDataURL( file );
		} );
	}

	/**
	 * Legge un PDF impaginato con il generatore e ne ricava il case study,
	 * tenendo da parte il file stesso come allegato pronto per la landing.
	 */
	function importFromPdf( file ) {
		if ( ! window.LLPdfImport ) {
			status( 'Il lettore PDF non è stato caricato: ricarica la pagina.', 'error' );
			return;
		}

		status( 'Apertura del PDF…' );
		var keepFile = fileToBase64( file ).catch( function () {
			return '';
		} );

		window.LLPdfImport.parse( file, function ( message ) {
			status( message );
		} ).then( function ( result ) {
			state.data = normalizeCaseStudy( Object.assign( {}, state.data, result.data ) );

			// Le immagini estratte dal PDF portano con sé il fondo bianco della pagina:
			// senza scontorno la landing mostrerebbe un rettangolo bianco dietro al pezzo.
			status( 'Scontorno delle immagini estratte…' );
			return Promise.all( [
				result.images.cover ? removeFlatBackground( result.images.cover, 46 ).catch( function () {
					return result.images.cover;
				} ) : Promise.resolve( '' ),
				result.images.piece ? removeFlatBackground( result.images.piece, 46 ).catch( function () {
					return result.images.piece;
				} ) : Promise.resolve( '' )
			] ).then( function ( images ) {
				if ( images[ 0 ] ) {
					state.data.coverImage = images[ 0 ];
				}
				if ( images[ 1 ] ) {
					state.data.pieceImage = images[ 1 ];
				}
				return result;
			} );
		} ).then( function ( result ) {
			state.fields = landingDefaults( state.data );
			state.fieldsTouched = {};
			state.postId = 0;
			state.title = String( state.data.title || '' ).replace( /\n+/g, ' ' ).trim();
			state.metaDescription = state.data.subtitle;

			return keepFile.then( function ( base64 ) {
				if ( base64 ) {
					state.pdfFiles.it = base64;
					state.pdfFiles.itName = file.name;
					state.pdfFiles.itFile = file;
					state.pdfSource = 'upload';
				}
				buildPanel();
				onChange();

				var message = 'Case study importato dal PDF.';
				if ( base64 ) {
					message += ' Il file caricato verrà allegato alla landing così com’è.';
				}
				if ( result.notes.length ) {
					message += ' ' + result.notes.join( ' ' );
				}
				status( message + ' Ricontrolla i campi prima di pubblicare.' );
			} );
		} ).catch( function ( error ) {
			status( error.message || 'Importazione dal PDF non riuscita.', 'error' );
		} );
	}

	/* ------------------------------------------------------- persistenza */

	function saveLocal() {
		var payload = {
			data: state.data,
			fields: state.fields,
			fieldsTouched: state.fieldsTouched,
			postId: state.postId,
			title: state.title,
			status: state.status,
			metaDescription: state.metaDescription,
			formId: state.formId
		};
		try {
			localStorage.setItem( STORAGE_KEY, JSON.stringify( payload ) );
		} catch ( error ) {
			try {
				var light = JSON.parse( JSON.stringify( payload ) );
				light.data.coverImage = '';
				light.data.pieceImage = '';
				light.data.logoImage = '';
				light.data.benchmarkClassic.leftImage = '';
				light.data.benchmarkClassic.rightImage = '';
				light.data.benchmarkFdm.leftImage = '';
				light.data.benchmarkFdm.rightImage = '';
				Object.keys( light.fields ).forEach( function ( key ) {
					if ( light.fields[ key ] && typeof light.fields[ key ] === 'object' ) {
						light.fields[ key ].dataUrl = '';
					}
				} );
				localStorage.setItem( STORAGE_KEY, JSON.stringify( light ) );
			} catch ( ignored ) {
				/* Il documento resta utilizzabile anche se il browser non può salvarlo. */
			}
		}
	}

	function restoreLocal() {
		var raw = null;
		try {
			raw = localStorage.getItem( STORAGE_KEY );
			if ( ! raw ) {
				for ( var i = 0; i < LEGACY_KEYS.length && ! raw; i++ ) {
					raw = localStorage.getItem( LEGACY_KEYS[ i ] );
					if ( raw ) {
						raw = JSON.stringify( { data: JSON.parse( raw ) } );
					}
				}
			}
		} catch ( error ) {
			raw = null;
		}
		if ( ! raw ) {
			return;
		}
		try {
			var stored = JSON.parse( raw );
			state.data = normalizeCaseStudy( stored.data );
			state.fields = Object.assign( landingDefaults( state.data ), stored.fields || {} );
			state.fieldsTouched = stored.fieldsTouched && typeof stored.fieldsTouched === 'object'
				? stored.fieldsTouched
				: touchedFromFields( stored.fields );
			state.postId = parseInt( stored.postId, 10 ) || 0;
			state.title = stored.title || '';
			state.status = 'draft' === stored.status ? 'draft' : 'publish';
			state.metaDescription = stored.metaDescription || '';
			state.formId = parseInt( stored.formId, 10 ) || CFG.defaultForm || 0;
		} catch ( error ) {
			/* Documento locale illeggibile: si riparte dai valori predefiniti. */
		}
	}

	/* ------------------------------------------------------------- rete */

	function api( path, options ) {
		options = options || {};
		var init = {
			method: options.method || 'GET',
			credentials: 'same-origin',
			headers: { 'X-WP-Nonce': CFG.nonce }
		};
		if ( options.body ) {
			init.headers[ 'Content-Type' ] = 'application/json';
			init.body = JSON.stringify( options.body );
		}
		return fetch( CFG.restUrl + path, init ).then( function ( response ) {
			return response.text().then( function ( body ) {
				var payload = null;
				try {
					payload = JSON.parse( body );
				} catch ( ignored ) {
					payload = null;
				}

				if ( response.ok && payload ) {
					return payload;
				}

				var message = payload && payload.message ? payload.message : '';
				if ( ! message ) {
					if ( 413 === response.status || 0 === response.status ) {
						message = 'Il server ha rifiutato l’invio perché troppo pesante. Riduci le immagini o disattiva le pagine benchmark, poi riprova.';
					} else if ( 401 === response.status || 403 === response.status ) {
						message = 'Sessione scaduta: ricarica la pagina e accedi di nuovo.';
					} else if ( ! payload ) {
						message = 'Il server ha risposto in modo inatteso (codice ' + response.status + '). Se succede pubblicando, di solito il file è troppo grande per la configurazione PHP del sito.';
					} else {
						message = 'Richiesta non riuscita (codice ' + response.status + ').';
					}
				}

				var error = new Error( message );
				error.code = payload && payload.code ? payload.code : 'error';
				throw error;
			} );
		} );
	}

	/* ----------------------------------------------------- costruttori UI */

	function status( message, tone, link ) {
		if ( ! refs.status ) {
			return;
		}
		refs.status.textContent = message || '';
		refs.status.style.display = message ? 'block' : 'none';
		refs.status.setAttribute( 'data-tone', tone || 'info' );
		if ( link ) {
			refs.status.appendChild( document.createElement( 'br' ) );
			refs.status.appendChild( el( 'a', {
				href: link,
				target: '_blank',
				rel: 'noopener',
				text: 'Apri la landing appena pubblicata →'
			} ) );
		}
	}

	function textField( config ) {
		var counter = el( 'small', {} );
		var control = config.multiline
			? el( 'textarea', { rows: config.rows || 3, maxlength: config.max } )
			: el( 'input', { type: 'text', maxlength: config.max } );

		control.value = String( config.get() || '' );
		function sync() {
			counter.textContent = control.value.length + '/' + config.max;
			counter.className = control.value.length >= config.max ? 'll-limit' : '';
		}
		sync();

		var accepted = control.value;
		control.addEventListener( 'input', function () {
			if ( config.guard ) {
				accepted = commitGuarded( control, accepted, config.set );
			} else {
				config.set( control.value );
				onChange();
			}
			sync();
		} );

		return el( 'label', { class: 'll-field' }, [
			el( 'span', { class: 'll-field-label' }, [ el( 'span', { text: config.label } ), counter ] ),
			control
		] );
	}

	/**
	 * Menu a tendina legato a un campo del documento.
	 */
	function selectField( config ) {
		var control = el( 'select' );
		config.options.forEach( function ( option ) {
			control.appendChild( el( 'option', { value: option.id, text: option.label } ) );
		} );
		control.value = String( config.get() || config.options[ 0 ].id );
		control.addEventListener( 'change', function () {
			config.set( control.value );
			onChange();
		} );

		return el( 'label', { class: 'll-field' }, [
			el( 'span', { class: 'll-field-label' }, [ el( 'span', { text: config.label } ) ] ),
			control
		] );
	}

	function imageField( config ) {
		var input = el( 'input', { type: 'file', accept: 'image/png,image/jpeg,image/webp', hidden: true } );
		var error = el( 'small', { class: 'll-image-error' } );
		var preview = el( 'div', { class: 'll-image-preview' } );
		var pick = el( 'button', { type: 'button' } );
		var remove = el( 'button', { type: 'button', class: 'll-clear', text: 'Rimuovi' } );

		function refresh() {
			var value = String( config.get() || '' );
			clear( preview );
			if ( value ) {
				preview.appendChild( el( 'img', { src: value, alt: '' } ) );
				preview.style.display = 'grid';
			} else {
				preview.style.display = 'none';
			}
			pick.textContent = value ? 'Sostituisci immagine' : 'Carica immagine';
			remove.style.display = value ? 'inline-block' : 'none';
		}

		pick.addEventListener( 'click', function () {
			input.click();
		} );
		remove.addEventListener( 'click', function () {
			config.set( '' );
			refresh();
			onChange();
		} );
		input.addEventListener( 'change', function () {
			var file = input.files && input.files[ 0 ];
			input.value = '';
			if ( ! file ) {
				return;
			}
			error.textContent = '';
			pick.textContent = 'Ottimizzazione…';
			pick.disabled = true;
			optimizeImage( file, config.maxDimension || 1800 ).then( function ( dataUrl ) {
				config.set( dataUrl );
				refresh();
				onChange();
			} ).catch( function ( reason ) {
				error.textContent = reason.message || 'Caricamento non riuscito.';
				refresh();
			} ).then( function () {
				pick.disabled = false;
			} );
		} );

		var actions = [ pick ];
		if ( config.cutout ) {
			var cut = el( 'button', { type: 'button', text: '✂ Scontorna' } );
			cut.addEventListener( 'click', function () {
				var value = String( config.get() || '' );
				if ( ! value ) {
					return;
				}
				error.textContent = '';
				cut.disabled = true;
				cut.textContent = 'Scontorno…';
				removeFlatBackground( value, 46 ).then( function ( output ) {
					config.set( output );
					refresh();
					onChange();
				} ).catch( function () {
					error.textContent = 'Scontorno non riuscito su questa immagine.';
				} ).then( function () {
					cut.disabled = false;
					cut.textContent = '✂ Scontorna';
				} );
			} );
			actions.push( cut );
		}
		actions.push( remove );

		var wrapper = el( 'div', { class: 'll-image-field' }, [
			el( 'span', { text: config.label } ),
			el( 'div', { class: 'll-image-actions' }, actions ),
			preview,
			el( 'small', { class: 'll-image-note', text: 'Ridimensionamento automatico; la trasparenza viene preservata.' } ),
			error,
			input
		] );
		refresh();
		return wrapper;
	}

	function fieldset( legend, children, help ) {
		var nodes = [ el( 'legend', { text: legend } ) ];
		if ( help ) {
			nodes.push( el( 'p', { class: 'll-help', text: help } ) );
		}
		return el( 'fieldset', { class: 'll-fieldset' }, nodes.concat( children ) );
	}

	/* ------------------------------------------------- pannello: case study */

	function caseStudyPanel() {
		var data = state.data;
		var nodes = [];

		function set( key ) {
			return function ( value ) {
				state.language = 'it';
				data[ key ] = value;
			};
		}
		function get( key ) {
			return function () {
				return data[ key ];
			};
		}
		function text( label, key, max, multiline, rows ) {
			return textField( { label: label, max: max, multiline: multiline, rows: rows, guard: true, get: get( key ), set: set( key ) } );
		}

		nodes.push( fieldset( 'Intestazione (tutte le pagine)', [
			text( 'Brand (sinistra)', 'brand', 32 ),
			text( 'Documento (destra)', 'document', 32 )
		] ) );

		nodes.push( fieldset( 'Pagina 1 — Copertina', [
			text( 'Titolo (invio = a capo)', 'title', 140, true, 3 ),
			text( 'Sottotitolo', 'subtitle', 300, true, 3 ),
			text( 'Tag (max 4, separati da virgola)', 'tags', 100 ),
			imageField( {
				label: 'Foto sorgente / immagine copertina',
				maxDimension: 2200,
				cutout: true,
				get: get( 'coverImage' ),
				set: set( 'coverImage' )
			} ),
			aiPanel(),
			imageField( {
				label: 'Logo (vuoto = logo Layerloop del sito, già applicato)',
				maxDimension: 900,
				get: get( 'logoImage' ),
				set: set( 'logoImage' )
			} ),
			selectField( {
				label: 'Logo a piè di pagina (pagine interne)',
				options: [
					{ id: 'left', label: 'In basso a sinistra' },
					{ id: 'right', label: 'In basso a destra' },
					{ id: 'center', label: 'In basso al centro' },
					{ id: 'none', label: 'Non mostrarlo' }
				],
				get: get( 'logoPlacement' ),
				set: set( 'logoPlacement' )
			} )
		] ) );

		nodes.push( fieldset( 'Pagina 2 — Colonna sinistra', [
			text( 'Sezione 1 — titoletto', 'section1Title', 70 ),
			text( 'Sezione 1 — testo', 'section1Text', 1200, true, 8 ),
			text( 'Sezione 2 — titoletto', 'section2Title', 90 ),
			text( 'Sezione 2 — testo', 'section2Text', 1400, true, 9 ),
			text( 'Box — titoletto', 'boxTitle', 70 ),
			text( 'Box — testo', 'boxText', 1400, true, 10 ),
			text( 'Box — domanda finale', 'boxQuestion', 200, true, 3 ),
			text( 'Box — etichetta bottone', 'boxButton', 36 )
		] ) );

		var specList = el( 'div', { class: 'll-list' } );
		var addSpec = el( 'button', { class: 'll-add', type: 'button', text: '+ Aggiungi specifica' } );

		function renderSpecs() {
			clear( specList );
			data.specs.forEach( function ( spec ) {
				var label = el( 'input', { type: 'text', maxlength: 34, 'aria-label': 'Etichetta' } );
				var value = el( 'input', { type: 'text', maxlength: 44, 'aria-label': 'Valore' } );
				label.value = spec.label;
				value.value = spec.value;
				var acceptedLabel = label.value;
				var acceptedValue = value.value;
				label.addEventListener( 'input', function () {
					acceptedLabel = commitGuarded( label, acceptedLabel, function ( next ) {
						spec.label = next;
					} );
				} );
				value.addEventListener( 'input', function () {
					acceptedValue = commitGuarded( value, acceptedValue, function ( next ) {
						spec.value = next;
					} );
				} );
				specList.appendChild( el( 'div', { class: 'll-row' }, [
					label,
					value,
					el( 'button', {
						type: 'button',
						'aria-label': 'Rimuovi specifica',
						text: '×',
						onclick: function () {
							data.specs = data.specs.filter( function ( item ) {
								return item !== spec;
							} );
							renderSpecs();
							onChange();
						}
					} )
				] ) );
			} );
			addSpec.disabled = data.specs.length >= 6;
		}
		addSpec.addEventListener( 'click', function () {
			data.specs.push( { id: uid( 'spec' ), label: 'ETICHETTA', value: 'Valore' } );
			if ( ! applyChangeNow() ) {
				data.specs.pop();
				applyChangeNow();
				status( 'La colonna è piena: per aggiungere una specifica accorcia i testi o togline un’altra.', 'error' );
			}
			renderSpecs();
		} );
		renderSpecs();

		nodes.push( fieldset( 'Pagina 2 — Colonna destra', [
			imageField( { label: 'Foto del pezzo', maxDimension: 1800, cutout: true, get: get( 'pieceImage' ), set: set( 'pieceImage' ) } ),
			el( 'div', { class: 'll-field-label' }, [ el( 'span', { text: 'Specifiche (etichetta + valore)' } ) ] ),
			specList,
			addSpec,
			text( 'Perché conviene — titoletto', 'whyTitle', 70 ),
			text( 'Perché conviene — testo', 'whyText', 700, true, 7 )
		] ) );

		var perfList = el( 'div', { class: 'll-list' } );
		data.performances.forEach( function ( item ) {
			var label = el( 'input', { type: 'text', maxlength: 34 } );
			var range = el( 'input', { type: 'range', min: '1', max: '10', 'aria-label': 'Cursore' } );
			var number = el( 'input', { type: 'number', min: '1', max: '10', 'aria-label': 'Valore' } );
			label.value = item.label;
			range.value = item.value;
			number.value = item.value;
			var acceptedLabel = label.value;
			label.addEventListener( 'input', function () {
				acceptedLabel = commitGuarded( label, acceptedLabel, function ( next ) {
					item.label = next;
				} );
			} );
			range.addEventListener( 'input', function () {
				item.value = Number( range.value );
				number.value = range.value;
				onChange();
			} );
			number.addEventListener( 'input', function () {
				item.value = Math.min( 10, Math.max( 1, Number( number.value ) || 1 ) );
				range.value = item.value;
				onChange();
			} );
			perfList.appendChild( el( 'div', { class: 'll-perf' }, [
				label,
				el( 'div', { class: 'll-perf-controls' }, [ range, number ] )
			] ) );
		} );

		nodes.push( fieldset( 'Pagina 2 — Materiale', [
			text( 'Titolo sezione materiale', 'materialTitle', 28 ),
			text( 'Nome materiale', 'materialName', 40 ),
			text( 'Descrizione tecnica', 'materialDescription', 300, true, 4 ),
			perfList
		] ) );

		var benchmarkToggle = el( 'input', { type: 'checkbox' } );
		benchmarkToggle.checked = data.benchmarkEnabled;
		var benchmarkHolder = el( 'div' );

		function renderBenchmark() {
			clear( benchmarkHolder );
			if ( ! data.benchmarkEnabled ) {
				return;
			}
			benchmarkHolder.appendChild( comparisonEditor( 'Pagina 3 — Produzione tradizionale vs Layerloop', 'benchmarkClassic' ) );
			benchmarkHolder.appendChild( comparisonEditor( 'Pagina 4 — FDM cartesiana vs Belt', 'benchmarkFdm' ) );
		}
		benchmarkToggle.addEventListener( 'change', function () {
			data.benchmarkEnabled = benchmarkToggle.checked;
			renderBenchmark();
			onChange();
		} );
		renderBenchmark();

		nodes.push( fieldset( 'Pagine 3–4 — Benchmark opzionale', [
			el( 'label', { class: 'll-check' }, [ benchmarkToggle, el( 'span', { text: 'Includi entrambe le pagine comparative' } ) ] ),
			el( 'p', { class: 'll-help', text: 'Il PDF ha sempre un numero pari di pagine: 2 senza benchmark, 4 con benchmark.' } )
		] ) );
		nodes.push( benchmarkHolder );

		return nodes;
	}

	function comparisonEditor( legend, pageKey ) {
		var page = state.data[ pageKey ];

		function text( label, key, max, multiline, rows ) {
			return textField( {
				label: label,
				max: max,
				multiline: multiline,
				rows: rows,
				guard: true,
				get: function () {
					return page[ key ];
				},
				set: function ( value ) {
					page[ key ] = value;
				}
			} );
		}

		var metricList = el( 'div', { class: 'll-list' } );
		page.metrics.forEach( function ( metric ) {
			var label = el( 'input', { type: 'text', maxlength: 38, 'aria-label': 'Parametro' } );
			var left = el( 'input', { type: 'text', maxlength: 64, 'aria-label': 'Valore sinistra' } );
			var right = el( 'input', { type: 'text', maxlength: 64, 'aria-label': 'Valore destra' } );
			label.value = metric.label;
			left.value = metric.left;
			right.value = metric.right;
			[ [ label, 'label' ], [ left, 'left' ], [ right, 'right' ] ].forEach( function ( pair ) {
				var accepted = pair[ 0 ].value;
				pair[ 0 ].addEventListener( 'input', function () {
					accepted = commitGuarded( pair[ 0 ], accepted, function ( next ) {
						metric[ pair[ 1 ] ] = next;
					} );
				} );
			} );
			metricList.appendChild( el( 'div', { class: 'll-metric-row' }, [ label, left, right ] ) );
		} );

		return fieldset( legend, [
			text( 'Sovratitolo', 'eyebrow', 42 ),
			text( 'Titolo', 'title', 84, true, 2 ),
			text( 'Introduzione', 'intro', 400, true, 4 ),
			text( 'Tecnologia sinistra — titolo', 'leftTitle', 44 ),
			imageField( {
				label: 'Tecnologia sinistra — immagine facoltativa',
				maxDimension: 1200,
				get: function () {
					return page.leftImage;
				},
				set: function ( value ) {
					page.leftImage = value;
				}
			} ),
			text( 'Tecnologia sinistra — descrizione', 'leftText', 480, true, 5 ),
			text( 'Tecnologia destra — titolo', 'rightTitle', 44 ),
			imageField( {
				label: 'Tecnologia destra — immagine facoltativa',
				maxDimension: 1200,
				get: function () {
					return page.rightImage;
				},
				set: function ( value ) {
					page.rightImage = value;
				}
			} ),
			text( 'Tecnologia destra — descrizione', 'rightText', 480, true, 5 ),
			el( 'div', { class: 'll-field-label' }, [ el( 'span', { text: 'Righe di confronto' } ) ] ),
			metricList,
			text( 'Conclusione — titolo', 'conclusionTitle', 44 ),
			text( 'Conclusione — testo', 'conclusionText', 460, true, 5 )
		] );
	}

	/* ------------------------------------------------------- pannello: AI */

	function aiPanel() {
		var statusNode = el( 'div', { class: 'll-ai-status' } );
		statusNode.style.display = 'none';

		var presetSelect = el( 'select' );
		( CFG.presets || [ { id: 'wireframe', label: 'Fil di ferro tecnico' } ] ).forEach( function ( preset ) {
			presetSelect.appendChild( el( 'option', { value: preset.id, text: preset.label } ) );
		} );
		presetSelect.value = state.ai.preset;
		presetSelect.addEventListener( 'change', function () {
			state.ai.preset = presetSelect.value;
		} );

		var targetSelect = el( 'select' );
		[
			{ id: 'coverImage', label: 'Immagine di copertina' },
			{ id: 'pieceImage', label: 'Foto del pezzo' }
		].forEach( function ( option ) {
			targetSelect.appendChild( el( 'option', { value: option.id, text: option.label } ) );
		} );
		targetSelect.value = state.ai.target;
		targetSelect.addEventListener( 'change', function () {
			state.ai.target = targetSelect.value;
		} );

		var ratioSelect = el( 'select' );
		[ 'auto', '1:1', '4:3', '3:2', '16:9', '3:4' ].forEach( function ( ratio ) {
			ratioSelect.appendChild( el( 'option', { value: ratio, text: 'auto' === ratio ? 'Proporzione originale' : ratio } ) );
		} );
		ratioSelect.value = state.ai.ratio;
		ratioSelect.addEventListener( 'change', function () {
			state.ai.ratio = ratioSelect.value;
		} );

		var cutout = el( 'input', { type: 'checkbox' } );
		cutout.checked = state.ai.cutout;
		cutout.addEventListener( 'change', function () {
			state.ai.cutout = cutout.checked;
		} );

		var button = el( 'button', { type: 'button', class: 'll-ai-button', text: '✦ Genera immagine con Gemini' } );
		if ( ! CFG.hasGemini ) {
			button.disabled = true;
			statusNode.style.display = 'block';
			statusNode.textContent = 'Chiave Gemini non configurata: chiedi a un amministratore di inserirla nelle impostazioni dello Studio.';
		}

		button.addEventListener( 'click', function () {
			var source = state.data[ state.ai.target ];
			if ( ! source ) {
				statusNode.style.display = 'block';
				statusNode.textContent = 'Carica prima la fotografia da trasformare.';
				return;
			}
			if ( 0 !== source.indexOf( 'data:' ) ) {
				statusNode.style.display = 'block';
				statusNode.textContent = 'Ricarica la fotografia dal tuo computer: questa immagine è già pubblicata sul sito.';
				return;
			}

			button.disabled = true;
			button.textContent = 'Generazione in corso…';
			statusNode.style.display = 'block';
			statusNode.textContent = 'Gemini sta elaborando l’immagine, servono alcuni secondi…';

			api( '/image', {
				method: 'POST',
				body: {
					image: source,
					preset: state.ai.preset,
					prompt: state.ai.prompt,
					ratio: state.ai.ratio
				}
			} ).then( function ( payload ) {
				if ( ! payload.image ) {
					throw new Error( 'Nessuna immagine restituita.' );
				}
				if ( ! state.ai.cutout ) {
					return payload.image;
				}
				statusNode.textContent = 'Scontorno dello sfondo in corso…';
				return removeFlatBackground( payload.image, 42 ).catch( function () {
					return payload.image;
				} );
			} ).then( function ( image ) {
				state.data[ state.ai.target ] = image;
				buildPanel();
				onChange();
				status( 'Immagine generata e applicata all’anteprima.' );
			} ).catch( function ( error ) {
				statusNode.textContent = error.message || 'Generazione non riuscita.';
			} ).then( function () {
				button.disabled = false;
				button.textContent = '✦ Genera immagine con Gemini';
			} );
		} );

		return el( 'div', { class: 'll-ai' }, [
			el( 'div', { class: 'll-ai-grid' }, [
				el( 'label', { class: 'll-field' }, [ el( 'span', { class: 'll-field-label' }, [ el( 'span', { text: 'Stile' } ) ] ), presetSelect ] ),
				el( 'label', { class: 'll-field' }, [ el( 'span', { class: 'll-field-label' }, [ el( 'span', { text: 'Immagine da usare' } ) ] ), targetSelect ] )
			] ),
			el( 'label', { class: 'll-field' }, [ el( 'span', { class: 'll-field-label' }, [ el( 'span', { text: 'Proporzione' } ) ] ), ratioSelect ] ),
			textField( {
				label: 'Cosa isolare o modificare (facoltativo)',
				max: 400,
				multiline: true,
				rows: 3,
				get: function () {
					return state.ai.prompt;
				},
				set: function ( value ) {
					state.ai.prompt = value;
				}
			} ),
			el( 'label', { class: 'll-check' }, [ cutout, el( 'span', { text: 'Rendi trasparente lo sfondo bianco' } ) ] ),
			button,
			el( 'small', { text: 'Il risultato sostituisce l’immagine scelta. Gemini restituisce sempre uno sfondo pieno: lo scontorno viene fatto qui nel browser, partendo dai bordi.' } ),
			statusNode
		] );
	}

	/* --------------------------------------------------- pannello: landing */

	function landingPanel() {
		var nodes = [];

		var titleField = textField( {
			label: 'Titolo della landing (compare nell’indirizzo)',
			max: 140,
			get: function () {
				return state.title || String( state.data.title || '' ).replace( /\n+/g, ' ' );
			},
			set: function ( value ) {
				state.title = value;
			}
		} );

		var metaField = textField( {
			label: 'Descrizione per Google (meta description)',
			max: 300,
			multiline: true,
			rows: 3,
			get: function () {
				return state.metaDescription || state.data.subtitle;
			},
			set: function ( value ) {
				state.metaDescription = value;
			}
		} );

		var formSelect = el( 'select' );
		formSelect.appendChild( el( 'option', { value: '0', text: '— nessun modulo —' } ) );
		( CFG.forms || [] ).forEach( function ( form ) {
			formSelect.appendChild( el( 'option', { value: String( form.id ), text: form.title + ' (#' + form.id + ')' } ) );
		} );
		formSelect.value = String( state.formId || 0 );
		formSelect.addEventListener( 'change', function () {
			state.formId = parseInt( formSelect.value, 10 ) || 0;
			saveLocal();
		} );

		var statusSelect = el( 'select' );
		[ { id: 'publish', label: 'Pubblicata' }, { id: 'draft', label: 'Bozza (non visibile)' } ].forEach( function ( option ) {
			statusSelect.appendChild( el( 'option', { value: option.id, text: option.label } ) );
		} );
		statusSelect.value = state.status;
		statusSelect.addEventListener( 'change', function () {
			state.status = statusSelect.value;
			saveLocal();
		} );

		nodes.push( fieldset( 'Pubblicazione', [
			titleField,
			metaField,
			el( 'label', { class: 'll-field' }, [ el( 'span', { class: 'll-field-label' }, [ el( 'span', { text: 'Modulo contatti (Ninja Forms)' } ) ] ), formSelect ] ),
			el( 'label', { class: 'll-field' }, [ el( 'span', { class: 'll-field-label' }, [ el( 'span', { text: 'Stato' } ) ] ), statusSelect ] ),
			el( 'p', { class: 'll-help', text: CFG.hasForms ? 'Il modulo viene inserito automaticamente in fondo alla landing, con l’ancora #contatti. Chi lo compila riceve il PDF.' : 'Ninja Forms non è attivo: la landing viene pubblicata senza modulo.' } ),
			el( 'button', {
				type: 'button',
				class: 'll-add',
				text: state.fieldsBackup ? '↶ Annulla il ripristino' : '↺ Riporta tutta la landing al case study',
				onclick: function () {
					if ( state.fieldsBackup ) {
						state.fields = state.fieldsBackup.fields;
						state.fieldsTouched = state.fieldsBackup.touched;
						state.fieldsBackup = null;
						buildPanel();
						onChange();
						status( 'Ripristino annullato: i testi e le immagini di prima sono tornati.' );
						return;
					}
					if ( ! window.confirm( 'Rifare la landing partendo dal case study?\n\nTesti e immagini tornano ai valori predefiniti. Se cambi idea potrai annullare, finché non ricarichi la pagina.' ) ) {
						return;
					}
					// Anche le immagini, non solo i testi: su una landing già pubblicata è
					// l'unico modo per far valere i valori predefiniti attuali al posto di
					// quelli salvati a suo tempo. La copia di sicurezza permette di tornare
					// indietro senza aver ripubblicato.
					state.fieldsBackup = {
						fields: JSON.parse( JSON.stringify( state.fields ) ),
						touched: JSON.parse( JSON.stringify( state.fieldsTouched ) )
					};
					state.fields = landingDefaults( state.data );
					state.fieldsTouched = {};
					buildPanel();
					onChange();
					status( 'Landing riportata ai contenuti del case study. Se non va bene, premi “Annulla il ripristino”.' );
				}
			} ) ] ) );

		LANDING_SCHEMA.forEach( function ( section ) {
			var children = section.fields.map( function ( def ) {
				if ( 'image' === def.type ) {
					return imageField( {
						label: def.label,
						maxDimension: def.maxDimension || 1600,
						cutout: true,
						get: function () {
							var value = state.fields[ def.name ] || {};
							if ( value.dataUrl || value.url ) {
								return value.dataUrl || value.url;
							}
							if ( value.cleared ) {
								return '';
							}
							return def.fromImage ? state.data[ def.fromImage ] : '';
						},
						set: function ( value ) {
							state.fields[ def.name ] = { id: 0, url: '', dataUrl: value, cleared: ! value };
							markTouched( def.name );
						}
					} );
				}
				return textField( {
					label: def.label,
					max: def.max || 200,
					multiline: 'textarea' === def.type,
					rows: def.rows || 3,
					get: function () {
						return state.fields[ def.name ] || '';
					},
					set: function ( value ) {
						state.fields[ def.name ] = value;
						markTouched( def.name );
					}
				} );
			} );
			nodes.push( fieldset( section.legend, children, section.help ) );
		} );

		return nodes;
	}

	/* -------------------------------------------------- pannello: archivio */

	function archivePanel() {
		var list = el( 'div', { class: 'll-cards' } );
		var nodes = [
			el( 'p', { class: 'll-panel-intro', text: 'Le landing già pubblicate. Aprendone una, testi e immagini tornano nell’editor: le modifiche successive aggiornano la stessa pagina.' } ),
			list
		];

		function render() {
			clear( list );
			if ( ! state.whitepapers.length ) {
				list.appendChild( el( 'div', { class: 'll-empty', text: 'Nessuna landing pubblicata finora.' } ) );
				return;
			}
			state.whitepapers.forEach( function ( item ) {
				var badge = el( 'span', { class: 'll-card-badge', text: 'publish' === item.status ? 'online' : 'bozza' } );
				badge.setAttribute( 'data-tone', 'publish' === item.status ? 'live' : 'draft' );

				var actions = [
					el( 'button', {
						type: 'button',
						text: state.postId === item.id ? 'In modifica' : 'Apri',
						disabled: state.postId === item.id,
						onclick: function () {
							openWhitepaper( item.id );
						}
					} ),
					el( 'a', { href: item.url, target: '_blank', rel: 'noopener', text: 'Vedi la pagina' } )
				];
				if ( item.pdfItUrl ) {
					actions.push( el( 'a', { href: item.pdfItUrl, target: '_blank', rel: 'noopener', text: 'PDF IT' } ) );
				}
				if ( item.pdfEnUrl ) {
					actions.push( el( 'a', { href: item.pdfEnUrl, target: '_blank', rel: 'noopener', text: 'PDF EN' } ) );
				}
				actions.push( el( 'button', {
					type: 'button',
					class: 'll-danger',
					text: 'Elimina',
					onclick: function () {
						if ( ! window.confirm( 'Spostare “' + item.title + '” nel cestino?' ) ) {
							return;
						}
						api( '/whitepapers/' + item.id, { method: 'DELETE' } ).then( function () {
							if ( state.postId === item.id ) {
								state.postId = 0;
							}
							return refreshArchive();
						} ).catch( function ( error ) {
							status( error.message, 'error' );
						} );
					}
				} ) );

				list.appendChild( el( 'div', { class: 'll-card' }, [
					el( 'div', { class: 'll-card-title' }, [ el( 'span', { text: item.title } ), badge ] ),
					el( 'div', { class: 'll-card-meta', text: 'Aggiornata il ' + item.edited + ' · ' + item.leads + ' contatti raccolti' } ),
					el( 'div', { class: 'll-card-actions' }, actions )
				] ) );
			} );
		}

		refs.renderArchive = render;
		render();
		return nodes;
	}

	function refreshArchive() {
		return api( '/whitepapers' ).then( function ( payload ) {
			state.whitepapers = payload.items || [];
			if ( refs.renderArchive ) {
				refs.renderArchive();
			}
		} ).catch( function () {
			/* L'archivio non è indispensabile al funzionamento dell'editor. */
		} );
	}

	function openWhitepaper( id ) {
		status( 'Apertura della landing in corso…' );
		api( '/whitepapers/' + id ).then( function ( payload ) {
			var loaded = payload.payload || {};
			state.postId = id;
			state.title = loaded.title || '';
			state.status = 'draft' === loaded.status ? 'draft' : 'publish';
			state.metaDescription = loaded.metaDescription || '';
			state.formId = parseInt( loaded.formId, 10 ) || 0;
			if ( loaded.caseStudy ) {
				state.data = normalizeCaseStudy( loaded.caseStudy );
			}
			state.fields = Object.assign( landingDefaults( state.data ), loaded.fields || {} );
			// I testi che erano stati riscritti a mano restano tali; gli altri
			// tornano a seguire il case study, così le correzioni al PDF arrivano
			// anche sulla landing già pubblicata.
			state.fieldsTouched = touchedFromFields( loaded.fields );

			// Il PDF già allegato resta allegato: prima ogni ripubblicazione lo
			// sostituiva con quello ricomposto dall'anteprima, e un file caricato
			// a mano andava perso.
			var pdf = loaded.pdf && typeof loaded.pdf === 'object' ? loaded.pdf : {};
			state.pdfAttached = {
				it: pdf.it ? String( pdf.it.name || 'PDF italiano' ) : '',
				en: pdf.en ? String( pdf.en.name || 'PDF inglese' ) : ''
			};
			state.pdfFiles = { it: '', en: '', itName: '', enName: '', itFile: null };
			state.pdfSource = state.pdfAttached.it ? 'keep' : 'generate';

			state.tab = 'landing';
			buildPanel();
			onChange();
			var opened = 'Landing “' + ( payload.post ? payload.post.title : '' ) + '” aperta: le modifiche aggiorneranno questa pagina.';
			if ( state.pdfAttached.it ) {
				opened += ' Il PDF allegato (' + state.pdfAttached.it + ') resta quello attuale: per rifarlo scegli “Ricomponi il PDF dall’anteprima” nella scheda Landing.';
			}
			status( opened );
		} ).catch( function ( error ) {
			status( error.message, 'error' );
		} );
	}

	/* ------------------------------------------------------------- PDF */

	function sheetsInDom() {
		return Array.prototype.slice.call( refs.preview.querySelectorAll( '.ll-sheet' ) );
	}

	function renderSheet( sheet ) {
		var holder = el( 'div', { class: 'll-studio-capture ll-studio' } );
		holder.style.cssText = 'position:fixed;left:0;top:0;width:794px;height:1123px;overflow:hidden;opacity:0.004;pointer-events:none;z-index:-1;background:#fff;display:block;';
		var clone = sheet.cloneNode( true );
		holder.appendChild( clone );
		document.body.appendChild( holder );

		return window.html2canvas( clone, {
			scale: 2,
			backgroundColor: '#ffffff',
			useCORS: true,
			logging: false,
			width: 794,
			height: 1123,
			windowWidth: 794,
			windowHeight: 1123,
			scrollX: 0,
			scrollY: 0
		} ).then( function ( canvas ) {
			document.body.removeChild( holder );
			return canvas;
		} ).catch( function ( error ) {
			if ( holder.parentNode ) {
				document.body.removeChild( holder );
			}
			throw error;
		} );
	}

	function buildPdf( onProgress ) {
		var sheets = sheetsInDom();
		var jsPDFCtor = window.jspdf && window.jspdf.jsPDF;
		if ( ! jsPDFCtor ) {
			return Promise.reject( new Error( 'Il generatore PDF non è stato caricato: ricarica la pagina.' ) );
		}
		var pdf = new jsPDFCtor( { orientation: 'portrait', unit: 'mm', format: 'a4', compress: true } );

		return sheets.reduce( function ( chain, sheet, index ) {
			return chain.then( function () {
				if ( onProgress ) {
					onProgress( index + 1, sheets.length );
				}
				return renderSheet( sheet ).then( function ( canvas ) {
					if ( index > 0 ) {
						pdf.addPage();
					}
					pdf.addImage( canvas.toDataURL( 'image/jpeg', 0.92 ), 'JPEG', 0, 0, 210, 297, undefined, 'FAST' );
				} );
			} );
		}, Promise.resolve() ).then( function () {
			return pdf;
		} );
	}

	/**
	 * Immagine di copertina per le schede dell'elenco: la prima pagina del PDF
	 * allegato quando esiste, altrimenti la prima pagina dell'anteprima.
	 *
	 * @return {Promise<string>} Data URL, stringa vuota se non ottenibile.
	 */
	function coverPreviewImage() {
		if ( state.pdfFiles.itFile && window.LLPdfImport && window.LLPdfImport.firstPageImage ) {
			return window.LLPdfImport.firstPageImage( state.pdfFiles.itFile, 900 ).then( function ( image ) {
				return image || '';
			} );
		}
		var sheet = sheetsInDom()[ 0 ];
		if ( ! sheet ) {
			return Promise.resolve( '' );
		}
		return renderSheet( sheet ).then( function ( canvas ) {
			return canvas.toDataURL( 'image/webp', 0.88 );
		} ).catch( function () {
			return '';
		} );
	}

	function pdfFileName( language ) {
		var base = ( state.title || String( state.data.title || 'case-study' ).replace( /\n+/g, ' ' ) )
			.toLowerCase()
			.replace( /[^a-z0-9]+/g, '-' )
			.replace( /^-+|-+$/g, '' );
		return ( base || 'case-study' ) + '-' + language + '.pdf';
	}

	function downloadPdf( language ) {
		status( 'Preparazione del PDF…' );
		return buildPdf( function ( current, total ) {
			status( 'Composizione pagina ' + current + ' di ' + total + '…' );
		} ).then( function ( pdf ) {
			pdf.save( pdfFileName( language ) );
			status( 'PDF ' + language.toUpperCase() + ' scaricato.' );
		} ).catch( function ( error ) {
			status( error.message || 'Generazione PDF non riuscita.', 'error' );
		} );
	}

	function pdfAsBase64() {
		return buildPdf( function ( current, total ) {
			status( 'Composizione PDF: pagina ' + current + ' di ' + total + '…' );
		} ).then( function ( pdf ) {
			var uri = pdf.output( 'datauristring' );
			return uri.slice( uri.indexOf( ',' ) + 1 );
		} );
	}

	/* -------------------------------------------------------- traduzione */

	function browserTranslator() {
		var translator = window.Translator;
		if ( ! translator || ! translator.create ) {
			return Promise.reject( new Error( 'La traduzione automatica richiede una versione aggiornata di Google Chrome.' ) );
		}
		var options = { sourceLanguage: 'it', targetLanguage: 'en' };
		var availability = translator.availability ? translator.availability( options ) : Promise.resolve( 'available' );
		return Promise.resolve( availability ).then( function ( value ) {
			if ( 'unavailable' === value || 'no' === value ) {
				throw new Error( 'Il pacchetto italiano-inglese non è disponibile su questo dispositivo.' );
			}
			return translator.create( options );
		} );
	}

	function cleanDashes( value ) {
		return String( value || '' ).replace( /\s*[–—]\s*/g, ', ' ).replace( /,\s*,/g, ',' );
	}

	function translateCaseStudy( source, translate ) {
		var result = JSON.parse( JSON.stringify( source ) );
		var jobs = [];

		function field( object, key ) {
			var value = object[ key ];
			if ( ! value || typeof value !== 'string' || ! value.trim() ) {
				return;
			}
			jobs.push( translate( value ).then( function ( translated ) {
				object[ key ] = cleanDashes( translated );
			} ) );
		}

		[ 'document', 'title', 'subtitle', 'tags', 'section1Title', 'section1Text', 'section2Title', 'section2Text',
			'boxTitle', 'boxText', 'boxQuestion', 'boxButton', 'whyTitle', 'whyText',
			'materialTitle', 'materialName', 'materialDescription', 'parameterTitle' ].forEach( function ( key ) {
			field( result, key );
		} );

		result.specs.forEach( function ( spec ) {
			field( spec, 'label' );
			field( spec, 'value' );
		} );
		result.performances.forEach( function ( item ) {
			field( item, 'label' );
		} );
		[ 'benchmarkClassic', 'benchmarkFdm' ].forEach( function ( pageKey ) {
			var page = result[ pageKey ];
			[ 'eyebrow', 'title', 'intro', 'leftTitle', 'leftText', 'rightTitle', 'rightText', 'conclusionTitle', 'conclusionText' ].forEach( function ( key ) {
				field( page, key );
			} );
			page.metrics.forEach( function ( metric ) {
				field( metric, 'label' );
				field( metric, 'left' );
				field( metric, 'right' );
			} );
		} );

		return Promise.all( jobs ).then( function () {
			return result;
		} );
	}

	function showEnglish() {
		status( 'Traduzione inglese in preparazione…' );
		return browserTranslator().then( function ( translator ) {
			return translateCaseStudy( state.data, function ( text ) {
				return translator.translate( text );
			} );
		} ).then( function ( translated ) {
			state.displayData = translated;
			state.language = 'en';
			renderPreview();
			status( 'Anteprima inglese pronta.' );
			return translated;
		} ).catch( function ( error ) {
			status( error.message || 'Traduzione non disponibile.', 'error' );
			throw error;
		} );
	}

	/* ---------------------------------------------------- pubblicazione */

	function publish() {
		if ( ! CFG.canPublish ) {
			status( 'Il tuo account non può pubblicare landing page.', 'error' );
			return;
		}
		var title = state.title || String( state.data.title || '' ).replace( /\n+/g, ' ' ).trim();
		if ( ! title ) {
			status( 'Scrivi un titolo prima di pubblicare.', 'error' );
			return;
		}

		refs.publishButton.disabled = true;
		var payload = {
			postId: state.postId,
			status: state.status,
			title: title,
			metaDescription: state.metaDescription || state.data.subtitle,
			formId: state.formId,
			fields: preparedFields(),
			caseStudy: state.data
		};

		var italianPdf;
		if ( 'keep' === state.pdfSource && state.pdfAttached.it ) {
			// Nessun PDF nel documento inviato: il server tiene quello già allegato.
			status( 'Il PDF già allegato resta invariato: ' + state.pdfAttached.it );
			italianPdf = Promise.resolve( '' );
		} else if ( 'upload' === state.pdfSource && state.pdfFiles.it ) {
			status( 'Uso il PDF caricato: ' + state.pdfFiles.itName );
			italianPdf = Promise.resolve( state.pdfFiles.it );
		} else {
			// Il PDF composto e allegato alla landing è sempre la versione italiana.
			state.language = 'it';
			state.displayData = null;
			renderPreview();
			status( 'Generazione del PDF italiano…' );
			italianPdf = pdfAsBase64();
		}

		italianPdf.then( function ( italian ) {
			if ( italian ) {
				payload.pdfIT = italian;
			}
			if ( state.pdfFiles.en ) {
				payload.pdfEN = state.pdfFiles.en;
			}
			if ( ! italian && 'keep' === state.pdfSource ) {
				// PDF invariato: anche la copertina dell'archivio resta quella di prima.
				return '';
			}
			status( 'Preparazione della copertina…' );
			return coverPreviewImage();
		} ).then( function ( cover ) {
			if ( cover ) {
				payload.coverPreview = cover;
			}
			status( 'Pubblicazione della landing page…' );
			return api( '/whitepapers', { method: 'POST', body: payload } );
		} ).then( function ( response ) {
			var url = response.post.url;
			var warnings = ( response.warnings || [] ).join( ' ' );
			return refreshArchive().then( function () {
				// Documento chiuso: lo Studio torna vuoto, così il prossimo whitepaper
				// non eredita niente da questo. Per correggerlo si riapre dall'Archivio.
				resetStudio();
				var message = 'Landing pubblicata. Lo Studio è pronto per un nuovo case study: questo si riapre dall’Archivio.';
				if ( warnings ) {
					message += ' Attenzione: ' + warnings;
				}
				status( message, 'info', url );
			} );
		} ).catch( function ( error ) {
			status( error.message || 'Pubblicazione non riuscita.', 'error' );
		} ).then( function () {
			refs.publishButton.disabled = false;
		} );
	}

	function preparedFields() {
		var out = {};
		Object.keys( state.fields ).forEach( function ( name ) {
			var value = state.fields[ name ];
			if ( value && typeof value === 'object' ) {
				out[ name ] = { id: value.id || 0, dataUrl: value.dataUrl || '' };
				return;
			}
			out[ name ] = value;
		} );

		// Le immagini della landing non ancora scelte ereditano quelle del case study.
		// Si invia solo il riferimento: il server riusa l'allegato appena caricato,
		// così gli stessi byte non viaggiano due volte e la libreria non si riempie di doppioni.
		// L'hero della landing mostra una sola foto: il wireframe si aggiunge a mano
		// solo quando esiste una coppia con la stessa inquadratura.
		// L'ordine segue quello dei campi nel pannello: nell'hero la copertina,
		// nella scheda materiale la foto del pezzo.
		[
			[ 'll_hero_img_render', [ 'coverImage', 'pieceImage' ] ],
			[ 'll_mat1_img', [ 'pieceImage', 'coverImage' ] ],
			[ 'll_case_photo', [ 'pieceImage', 'coverImage' ] ]
		].forEach( function ( pair ) {
			var stored = state.fields[ pair[ 0 ] ] || {};
			var current = out[ pair[ 0 ] ];
			if ( stored.cleared || ! current || current.id || current.dataUrl ) {
				return;
			}
			for ( var i = 0; i < pair[ 1 ].length; i++ ) {
				var source = state.data[ pair[ 1 ][ i ] ];
				if ( ! source ) {
					continue;
				}
				if ( 0 === source.indexOf( 'data:' ) ) {
					// Immagine ancora nel browser: il server la carica e ne riusa l'allegato.
					out[ pair[ 0 ] ] = { id: 0, dataUrl: '', fromCase: pair[ 1 ][ i ] };
					return;
				}
				if ( 0 === source.indexOf( 'http' ) ) {
					// Progetto riaperto: l'immagine è già in libreria, si passa l'indirizzo
					// e il server risale all'allegato senza ricaricare nulla.
					out[ pair[ 0 ] ] = { id: 0, dataUrl: '', fromCaseUrl: source };
					return;
				}
			}
		} );

		return out;
	}

	/* --------------------------------------------------------- anteprima */

	function paragraph( text, className ) {
		return el( 'p', { class: className, text: text } );
	}

	function pageHeader( data ) {
		return [
			el( 'div', { class: 'll-page-header' }, [ el( 'span', { text: data.brand } ), el( 'span', { text: data.document } ) ] ),
			el( 'div', { class: 'll-page-rule' } )
		];
	}

	function logoMark( data, className ) {
		var src = logoSource( data );
		return el( 'div', { class: className }, [
			src ? el( 'img', { src: src, alt: 'Layerloop' } ) : el( 'span', { text: 'LAYERL∞P' } )
		] );
	}

	/**
	 * Piè di pagina delle pagine interne: logo Layerloop a sinistra, numero a destra.
	 * È già applicato a ogni PDF, senza che chi scrive debba caricare nulla.
	 */
	function pageFooter( data, number ) {
		var placement = data.logoPlacement || 'left';
		var children = [ el( 'span', { class: 'll-page-number', text: number } ) ];
		if ( 'none' !== placement ) {
			children.unshift( logoMark( data, 'll-page-footer-logo' ) );
		}
		return el( 'div', { class: 'll-page-footer ll-page-footer--' + placement }, children );
	}

	function contentSection( title, text ) {
		return el( 'div', { class: 'll-content-section' }, [
			el( 'div', { class: 'll-section-title', text: title } ),
			paragraph( text, 'll-section-text' )
		] );
	}

	function coverSheet( data ) {
		var tags = String( data.tags || '' ).split( ',' ).map( function ( tag ) {
			return tag.trim();
		} ).filter( Boolean ).slice( 0, 4 );

		return el( 'section', { class: 'll-sheet ll-sheet-p1' }, pageHeader( data ).concat( [
			el( 'h2', { class: 'll-cover-title', text: data.title } ),
			paragraph( data.subtitle, 'll-cover-subtitle' ),
			el( 'div', { class: 'll-cover-tags' }, tags.map( function ( tag ) {
				return el( 'span', { text: tag } );
			} ) ),
			el( 'div', { class: 'll-cover-image' }, [
				data.coverImage ? el( 'img', { src: data.coverImage, alt: '' } ) : el( 'span', { text: '[ immagine copertina ]' } )
			] ),
			logoMark( data, 'll-cover-logo' )
		] ) );
	}

	function technicalSheet( data ) {
		var left = el( 'div', { class: 'll-two-left' }, [
			contentSection( data.section1Title, data.section1Text ),
			contentSection( data.section2Title, data.section2Text ),
			el( 'div', { class: 'll-solution-box' }, [
				contentSection( data.boxTitle, data.boxText ),
				paragraph( data.boxQuestion, 'll-solution-question' ),
				el( 'span', { class: 'll-solution-button', text: data.boxButton + ' ↘' } )
			] )
		] );

		var specs = el( 'div', { class: 'll-spec-list' }, data.specs.map( function ( spec ) {
			return el( 'div', { class: 'll-spec-item' }, [
				el( 'div', { text: spec.label } ),
				el( 'strong', { text: spec.value } )
			] );
		} ) );

		var material = el( 'div', { class: 'll-material' }, [
			el( 'div', { class: 'll-material-kicker', text: data.materialTitle } ),
			el( 'strong', { class: 'll-material-name', text: data.materialName } ),
			el( 'p', { text: data.materialDescription } ),
			el( 'div', { class: 'll-perf-list' }, data.performances.map( function ( item ) {
				var bar = el( 'i' );
				bar.style.width = ( item.value * 10 ) + '%';
				return el( 'div', { class: 'll-perf-item' }, [
					el( 'div', {}, [ el( 'span', { text: item.label } ), el( 'strong', { text: item.value + '/10' } ) ] ),
					el( 'div', { class: 'll-perf-track' }, [ bar ] )
				] );
			} ) )
		] );

		var right = el( 'div', { class: 'll-two-right' }, [
			el( 'div', { class: 'll-piece-image' }, [
				data.pieceImage ? el( 'img', { src: data.pieceImage, alt: '' } ) : el( 'span', { text: '[ foto del pezzo ]' } )
			] ),
			el( 'div', { class: 'll-right-grid' }, [ specs, material ] ),
			el( 'div', { class: 'll-why' }, [
				el( 'div', { text: data.whyTitle } ),
				el( 'p', { text: data.whyText } )
			] )
		] );

		return el( 'section', { class: 'll-sheet ll-sheet-p2' }, pageHeader( data ).concat( [
			el( 'div', { class: 'll-two-columns' }, [ left, right ] ),
			pageFooter( data, '02' )
		] ) );
	}

	function comparisonSheet( data, page, accent ) {
		function card( title, text, image, highlight, number ) {
			var children = [ el( 'span', { text: number } ) ];
			if ( image ) {
				children.push( el( 'div', { class: 'll-card-image' }, [ el( 'img', { src: image, alt: title } ) ] ) );
			}
			children.push( el( 'div', { class: 'll-card-copy' }, [
				el( 'h3', { text: title } ),
				el( 'p', { text: text } )
			] ) );
			var className = highlight ? 'll-tech-highlight' : '';
			if ( image ) {
				className += ' ll-card-with-image';
			}
			return el( 'article', { class: className.trim() }, children );
		}

		var rows = page.metrics.map( function ( metric ) {
			return el( 'div', { class: 'll-comparison-row' }, [
				el( 'strong', { text: metric.label } ),
				el( 'span', { text: metric.left } ),
				el( 'span', { text: metric.right } )
			] );
		} );

		return el( 'section', { class: 'll-sheet ll-comparison-sheet ll-comparison-' + accent }, pageHeader( data ).concat( [
			el( 'div', { class: 'll-comparison-content' }, [
				el( 'div', { class: 'll-comparison-eyebrow', text: page.eyebrow } ),
				el( 'h2', { text: page.title } ),
				paragraph( page.intro, 'll-comparison-intro' ),
				el( 'div', { class: 'll-tech-cards' }, [
					card( page.leftTitle, page.leftText, page.leftImage, false, '01' ),
					card( page.rightTitle, page.rightText, page.rightImage, true, '02' )
				] ),
				el( 'div', { class: 'll-comparison-table' }, [
					el( 'div', { class: 'll-comparison-head' }, [
						el( 'span', { text: data.parameterTitle } ),
						el( 'span', { text: page.leftTitle } ),
						el( 'span', { text: page.rightTitle } )
					] )
				].concat( rows ) ),
				el( 'div', { class: 'll-comparison-conclusion' }, [
					el( 'span', { text: page.conclusionTitle } ),
					el( 'p', { text: page.conclusionText } )
				] )
			] ),
			pageFooter( data, 'classic' === accent ? '03' : '04' )
		] ) );
	}

	function renderPreview() {
		var data = 'en' === state.language && state.displayData ? state.displayData : state.data;
		clear( refs.preview );
		refs.preview.appendChild( coverSheet( data ) );
		refs.preview.appendChild( technicalSheet( data ) );
		if ( data.benchmarkEnabled ) {
			refs.preview.appendChild( comparisonSheet( data, data.benchmarkClassic, 'classic' ) );
			refs.preview.appendChild( comparisonSheet( data, data.benchmarkFdm, 'belt' ) );
		}
		refs.preview.appendChild( el( 'div', {
			class: 'll-preview-note',
			text: 'Anteprima in scala 1:1 del PDF A4. Le pagine 3 e 4 compaiono solo con il benchmark attivo.'
		} ) );

		return fitSheets();
	}

	/*
	 * Adattamento automatico del corpo del testo.
	 *
	 * Le pagine A4 hanno altezza fissa e tagliano ciò che eccede. Invece di troncare
	 * i testi si riduce il corpo del carattere del blocco che sborda, finché rientra:
	 * nel CSS i figli sono espressi in em, quindi cambiare il corpo del contenitore
	 * rimpicciolisce titoletti, testi e valori nella stessa proporzione, mantenendo
	 * intatte le gerarchie tipografiche.
	 *
	 * Il limite inferiore evita testi illeggibili: oltre quello si torna a segnalare
	 * lo sbordo, perché a quel punto il problema è la quantità di testo.
	 */
	var FIT_BASE = 16;
	// Fascia in fondo al foglio riservata al piè di pagina: 42px occupati dal
	// logo più un margine d'aria, così il testo non ci arriva sotto.
	var FOOTER_RESERVE = 58;
	var FIT_TARGETS = [
		{ selector: '.ll-two-left', min: 0.68 },
		{ selector: '.ll-two-right', min: 0.74 },
		{ selector: '.ll-comparison-content', min: 0.72 }
	];

	/**
	 * Spazio verticale disponibile dal bordo superiore del blocco alla fine del foglio.
	 */
	function availableHeight( sheet, node ) {
		// Il piè di pagina (logo e numero) occupa l'ultima fascia del foglio: il
		// testo deve fermarsi prima, altrimenti il logo finisce sopra le parole.
		var reserve = sheet.querySelector( '.ll-page-footer' ) ? FOOTER_RESERVE : 0;
		if ( node === sheet ) {
			return sheet.clientHeight - reserve;
		}
		return sheet.getBoundingClientRect().bottom - node.getBoundingClientRect().top - reserve;
	}

	/**
	 * Il blocco rientra nello spazio che ha sul foglio?
	 */
	function fitsInSheet( sheet, node ) {
		return node.scrollHeight <= availableHeight( sheet, node ) + 1;
	}

	/**
	 * Riduce il corpo del testo del blocco finché rientra nel foglio, cercando per
	 * bisezione il valore più grande che ci sta: nove letture di layout invece di
	 * quaranta, così il controllo può girare a ogni tasto premuto.
	 *
	 * @return {boolean} true se il blocco rientra, false se non ci sta nemmeno al minimo.
	 */
	function shrinkToFit( sheet, node, min ) {
		node.style.fontSize = FIT_BASE + 'px';
		if ( fitsInSheet( sheet, node ) ) {
			return true;
		}

		node.style.fontSize = ( FIT_BASE * min ).toFixed( 2 ) + 'px';
		if ( ! fitsInSheet( sheet, node ) ) {
			return false;
		}

		var low = min;
		var high = 1;
		for ( var step = 0; step < 7; step++ ) {
			var mid = ( low + high ) / 2;
			node.style.fontSize = ( FIT_BASE * mid ).toFixed( 2 ) + 'px';
			if ( fitsInSheet( sheet, node ) ) {
				low = mid;
			} else {
				high = mid;
			}
		}
		node.style.fontSize = ( FIT_BASE * low ).toFixed( 2 ) + 'px';
		return true;
	}

	/**
	 * Adatta tutte le pagine e segnala quelle che, anche al corpo minimo, sbordano.
	 */
	function fitSheets() {
		var everythingFits = true;

		sheetsInDom().forEach( function ( sheet, index ) {
			var fitted = true;

			if ( sheet.classList.contains( 'll-sheet-p1' ) ) {
				fitted = shrinkToFit( sheet, sheet, 0.74 );
			} else {
				FIT_TARGETS.forEach( function ( target ) {
					var node = sheet.querySelector( target.selector );
					if ( node && ! shrinkToFit( sheet, node, target.min ) ) {
						fitted = false;
					}
				} );
			}

			// Ultimo controllo, in larghezza: il foglio A4 non deve mai allargarsi.
			// Il CSS manda a capo anche le sequenze senza spazi, quindi qui non si
			// dovrebbe arrivare: se succede lo stesso, la battuta viene rifiutata
			// invece di sfondare la pagina.
			if ( sheet.scrollWidth > sheet.clientWidth + 1 ) {
				fitted = false;
			}

			if ( fitted ) {
				return;
			}
			everythingFits = false;

			// L'avviso vive accanto al foglio, mai dentro: il PDF si compone clonando
			// il foglio e si porterebbe dietro anche il badge.
			var badge = el( 'div', {
				class: 'll-overflow',
				text: 'Pagina ' + ( index + 1 ) + ': troppo testo anche al corpo minimo. Accorcialo un po’.'
			} );
			sheet.parentNode.insertBefore( badge, sheet.nextSibling );
		} );

		return everythingFits;
	}

	/**
	 * Applica subito una modifica e ridisegna: serve alla guardia, che deve sapere
	 * nello stesso istante se il testo appena scritto sta ancora nella pagina.
	 *
	 * @return {boolean} true se tutte le pagine rientrano.
	 */
	function applyChangeNow() {
		syncLandingFromCase();
		if ( 'en' === state.language ) {
			state.language = 'it';
			state.displayData = null;
		}
		var fits = renderPreview();
		saveLocal();
		return fits;
	}

	/**
	 * Segnala che il campo ha raggiunto il limite fisico della pagina.
	 */
	function flashLimit( control ) {
		status( 'Questa pagina è piena: il testo è già al corpo minimo e non ci sta altro. Accorcia qualcosa per continuare a scrivere.', 'error' );
		control.classList.add( 'll-blocked' );
		setTimeout( function () {
			control.classList.remove( 'll-blocked' );
		}, 1200 );
	}

	/**
	 * Accetta il nuovo valore di un campo solo se la pagina regge.
	 *
	 * Le pagine A4 hanno dimensioni fisse: prima si riduce il corpo del carattere,
	 * e quando non basta più il testo in eccesso viene rifiutato invece di finire
	 * oltre il bordo. Le cancellazioni passano sempre, perché liberano spazio.
	 *
	 * @param {HTMLElement} control  Campo in modifica.
	 * @param {string}      previous Ultimo valore accettato.
	 * @param {Function}    write    Scrive il valore nello stato.
	 * @return {string} Il valore effettivamente accettato.
	 */
	function commitGuarded( control, previous, write ) {
		var value = control.value;
		write( value );

		if ( value.length <= previous.length ) {
			onChange();
			return value;
		}

		var caret = control.selectionStart;
		if ( applyChangeNow() ) {
			return value;
		}

		write( previous );
		control.value = previous;
		var back = Math.max( 0, caret - ( value.length - previous.length ) );
		try {
			control.setSelectionRange( back, back );
		} catch ( error ) {
			/* Alcuni campi non espongono la selezione: il valore è comunque ripristinato. */
		}
		applyChangeNow();
		flashLimit( control );
		return previous;
	}

	/**
	 * Riporta lo Studio a un documento vuoto, chiudendo quello in corso.
	 */
	function resetStudio() {
		state.data = blankCaseStudy();
		state.fields = landingDefaults( state.data );
		state.fieldsTouched = {};
		state.fieldsBackup = null;
		state.pdfAttached = { it: '', en: '' };
		state.postId = 0;
		state.title = '';
		state.metaDescription = '';
		state.status = 'publish';
		state.formId = CFG.defaultForm || 0;
		state.language = 'it';
		state.displayData = null;
		state.pdfSource = 'generate';
		state.pdfFiles = { it: '', en: '', itName: '', enName: '', itFile: null };
		state.tab = 'case';
		buildPanel();
		renderPreview();
		saveLocal();
	}

	function onChange() {
		// Prima di ridisegnare: i testi della landing seguono il case study.
		syncLandingFromCase();
		if ( previewFrame ) {
			cancelAnimationFrame( previewFrame );
		}
		previewFrame = requestAnimationFrame( function () {
			previewFrame = null;
			if ( 'en' === state.language ) {
				state.language = 'it';
				state.displayData = null;
			}
			renderPreview();
			saveLocal();
		} );
	}

	/* ------------------------------------------------------- costruzione */

	function toolbar() {
		var bar = el( 'div', { class: 'll-toolbar' } );

		bar.appendChild( el( 'button', {
			type: 'button',
			class: 'll-primary ll-wide',
			text: '↓ Scarica il PDF italiano',
			onclick: function () {
				state.language = 'it';
				state.displayData = null;
				renderPreview();
				downloadPdf( 'it' );
			}
		} ) );

		bar.appendChild( el( 'button', {
			type: 'button',
			text: 'PDF inglese',
			onclick: function () {
				showEnglish().then( function () {
					return downloadPdf( 'en' );
				} ).catch( function () {
					/* Il messaggio di errore è già a schermo. */
				} );
			}
		} ) );

		bar.appendChild( el( 'button', {
			type: 'button',
			text: 'Stampa (PDF vettoriale)',
			onclick: function () {
				window.print();
			}
		} ) );

		var pdfInput = el( 'input', { type: 'file', accept: 'application/pdf,.pdf', hidden: true } );
		pdfInput.addEventListener( 'change', function () {
			var file = pdfInput.files && pdfInput.files[ 0 ];
			pdfInput.value = '';
			if ( file ) {
				importFromPdf( file );
			}
		} );

		bar.appendChild( el( 'button', {
			type: 'button',
			class: 'll-wide',
			text: '⇪ Importa da un PDF già impaginato',
			onclick: function () {
				pdfInput.click();
			}
		} ) );
		bar.appendChild( pdfInput );

		bar.appendChild( el( 'button', {
			type: 'button',
			text: 'Esporta JSON',
			onclick: function () {
				var blob = new Blob( [ JSON.stringify( { data: state.data, fields: state.fields }, null, 2 ) ], { type: 'application/json' } );
				var url = URL.createObjectURL( blob );
				var anchor = el( 'a', { href: url, download: 'layerloop-case-study.json' } );
				document.body.appendChild( anchor );
				anchor.click();
				document.body.removeChild( anchor );
				URL.revokeObjectURL( url );
			}
		} ) );

		var importInput = el( 'input', { type: 'file', accept: '.json,application/json', hidden: true } );
		importInput.addEventListener( 'change', function () {
			var file = importInput.files && importInput.files[ 0 ];
			importInput.value = '';
			if ( ! file ) {
				return;
			}
			var reader = new FileReader();
			reader.onload = function () {
				try {
					var parsed = JSON.parse( String( reader.result || '{}' ) );
					state.data = normalizeCaseStudy( parsed.data || parsed );
					state.fields = Object.assign( landingDefaults( state.data ), parsed.fields || {} );
					state.fieldsTouched = touchedFromFields( parsed.fields );
					buildPanel();
					onChange();
					status( 'Documento importato.' );
				} catch ( error ) {
					status( 'Il file JSON non è valido.', 'error' );
				}
			};
			reader.readAsText( file );
		} );

		bar.appendChild( el( 'button', {
			type: 'button',
			text: 'Importa JSON',
			onclick: function () {
				importInput.click();
			}
		} ) );
		bar.appendChild( importInput );

		bar.appendChild( el( 'button', {
			type: 'button',
			class: 'll-wide',
			text: '＋ Nuovo case study',
			onclick: function () {
				if ( ! window.confirm( 'Ripartire da zero? Il documento aperto viene chiuso senza modificare le landing già pubblicate.' ) ) {
					return;
				}
				resetStudio();
				status( 'Documento vuoto, pronto per un nuovo whitepaper.' );
			}
		} ) );

		return bar;
	}

	/**
	 * Scelta del PDF da allegare alla landing: composto dall'anteprima
	 * oppure un file già impaginato caricato dall'utente.
	 */
	function pdfSourceFieldset() {
		var info = el( 'p', { class: 'll-help' } );

		function refresh() {
			var parts = [];
			if ( state.pdfFiles.itName ) {
				parts.push( 'IT: ' + state.pdfFiles.itName );
			}
			if ( state.pdfFiles.enName ) {
				parts.push( 'EN: ' + state.pdfFiles.enName );
			}
			if ( parts.length ) {
				info.textContent = 'File caricati — ' + parts.join( ' · ' );
			} else if ( 'keep' === state.pdfSource && state.pdfAttached.it ) {
				info.textContent = 'Resta allegato il PDF già online: ' + state.pdfAttached.it + '. Cambia questa scelta solo se vuoi rifarlo.';
			} else {
				info.textContent = 'Nessun file caricato: verrà composto il PDF dall’anteprima.';
			}
		}

		var options = [];
		if ( state.pdfAttached.it ) {
			options.push( { id: 'keep', label: 'Mantieni il PDF già allegato (' + state.pdfAttached.it + ')' } );
		}
		options.push( { id: 'generate', label: 'Ricomponi il PDF dall’anteprima' } );
		options.push( { id: 'upload', label: 'Allega un PDF già pronto' } );

		var select = el( 'select' );
		options.forEach( function ( option ) {
			select.appendChild( el( 'option', { value: option.id, text: option.label } ) );
		} );
		select.value = state.pdfSource;
		select.addEventListener( 'change', function () {
			state.pdfSource = select.value;
			refresh();
		} );

		function uploader( language, label ) {
			var input = el( 'input', { type: 'file', accept: 'application/pdf,.pdf', hidden: true } );
			var button = el( 'button', { type: 'button', class: 'll-add', text: label } );
			input.addEventListener( 'change', function () {
				var file = input.files && input.files[ 0 ];
				input.value = '';
				if ( ! file ) {
					return;
				}
				if ( file.size > 24 * 1024 * 1024 ) {
					status( 'Il PDF supera 24 MB: comprimilo prima di caricarlo.', 'error' );
					return;
				}
				button.disabled = true;
				fileToBase64( file ).then( function ( base64 ) {
					state.pdfFiles[ language ] = base64;
					state.pdfFiles[ language + 'Name' ] = file.name;
					if ( 'it' === language ) {
						state.pdfFiles.itFile = file;
					}
					state.pdfSource = 'upload';
					select.value = 'upload';
					refresh();
					status( 'PDF “' + file.name + '” pronto per essere allegato alla landing.' );
				} ).catch( function ( error ) {
					status( error.message, 'error' );
				} ).then( function () {
					button.disabled = false;
				} );
			} );
			button.addEventListener( 'click', function () {
				input.click();
			} );
			return el( 'div', {}, [ button, input ] );
		}

		refresh();

		return fieldset( 'PDF da allegare', [
			el( 'label', { class: 'll-field' }, [ el( 'span', { class: 'll-field-label' }, [ el( 'span', { text: 'Come ottenerlo' } ) ] ), select ] ),
			uploader( 'it', '⇪ Carica il PDF italiano' ),
			uploader( 'en', '⇪ Carica il PDF inglese (facoltativo)' ),
			info
		], 'Se il PDF è già stato impaginato altrove, caricalo qui: viene allegato così com’è, senza ricomporlo. Riaprendo una landing dall’Archivio il suo PDF resta al suo posto finché non chiedi di rifarlo.' );
	}

	function publishBar() {
		refs.publishButton = el( 'button', {
			type: 'button',
			class: 'll-publish-button',
			text: 'Genera PDF e pubblica la landing',
			onclick: publish
		} );
		if ( ! CFG.canPublish ) {
			refs.publishButton.disabled = true;
		}
		refs.publishedLink = el( 'div', { class: 'll-help' } );

		return el( 'div', { class: 'll-publish' }, [
			refs.publishButton,
			el( 'p', { class: 'll-help', text: state.postId ? 'Stai aggiornando una landing esistente (#' + state.postId + ').' : 'Verrà creata una nuova pagina in /whitepaper/.' } ),
			refs.publishedLink
		] );
	}

	function buildPanel() {
		var panel = clear( refs.panel );

		panel.appendChild( el( 'div', { class: 'll-topbar' }, [
			el( 'div', { class: 'll-topbar-user' }, [
				el( 'strong', { text: CFG.user || '' } ),
				el( 'span', { text: 'Layerloop Studio' } )
			] ),
			el( 'a', { href: CFG.logoutUrl, text: 'Esci' } )
		] ) );

		var tabs = el( 'div', { class: 'll-tabs' } );
		[ { id: 'case', label: 'Case study' }, { id: 'landing', label: 'Landing' }, { id: 'archive', label: 'Archivio' } ].forEach( function ( tab ) {
			tabs.appendChild( el( 'button', {
				type: 'button',
				class: state.tab === tab.id ? 'is-active' : '',
				text: tab.label,
				onclick: function () {
					state.tab = tab.id;
					buildPanel();
					if ( 'archive' === tab.id ) {
						refreshArchive();
					}
				}
			} ) );
		} );
		panel.appendChild( tabs );

		refs.status = el( 'div', { class: 'll-status' } );
		refs.status.style.display = 'none';
		panel.appendChild( refs.status );

		if ( 'case' === state.tab ) {
			panel.appendChild( el( 'h1', { text: 'Generatore case study' } ) );
			panel.appendChild( el( 'p', {
				class: 'll-panel-intro',
				text: 'Compila in italiano: l’anteprima a destra è il PDF A4 che verrà scaricato e allegato alla landing.'
			} ) );
			panel.appendChild( toolbar() );
			panel.appendChild( el( 'div', { class: 'll-print-note' }, [
				el( 'strong', { text: 'Due modi per ottenere il PDF' } ),
				el( 'span', { text: 'Scarica il PDF italiano: file pronto, un clic.' } ),
				el( 'span', { text: 'Stampa: qualità vettoriale, scegli “Salva come PDF”, margini nessuno, grafica di sfondo attiva.' } )
			] ) );
			caseStudyPanel().forEach( function ( node ) {
				panel.appendChild( node );
			} );
		} else if ( 'landing' === state.tab ) {
			panel.appendChild( el( 'h1', { text: 'Landing page del whitepaper' } ) );
			panel.appendChild( el( 'p', {
				class: 'll-panel-intro',
				text: 'I testi arrivano dal case study e restano modificabili. Alla pubblicazione il PDF viene generato, caricato e collegato al modulo contatti.'
			} ) );
			landingPanel().forEach( function ( node ) {
				panel.appendChild( node );
			} );
			panel.appendChild( pdfSourceFieldset() );
			panel.appendChild( publishBar() );
		} else {
			panel.appendChild( el( 'h1', { text: 'Landing pubblicate' } ) );
			archivePanel().forEach( function ( node ) {
				panel.appendChild( node );
			} );
		}
	}

	/* ------------------------------------------------------------- avvio */

	function boot() {
		var root = document.getElementById( 'll-studio' );
		if ( ! root || ! CFG.restUrl ) {
			return;
		}

		restoreLocal();
		clear( root );
		root.removeAttribute( 'data-state' );
		document.documentElement.classList.add( 'll-studio-open' );

		refs.panel = el( 'aside', { class: 'll-panel' } );
		refs.preview = el( 'main', { class: 'll-preview', 'aria-label': 'Anteprima del case study' } );
		root.appendChild( refs.panel );
		root.appendChild( refs.preview );

		buildPanel();
		renderPreview();
		refreshArchive();

		loadDefaultLogo().then( function ( logo ) {
			if ( logo && logo !== state.defaultLogo ) {
				state.defaultLogo = logo;
				renderPreview();
			}
		} );
	}

	if ( 'loading' === document.readyState ) {
		document.addEventListener( 'DOMContentLoaded', boot );
	} else {
		boot();
	}
} )();
