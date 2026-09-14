/*
 * Importazione di un case study da un whitepaper Layerloop già impaginato.
 *
 * Il PDF viene letto con pdf.js: ogni frammento di testo porta con sé posizione e corpo
 * del carattere, e da questi tre dati si ricostruiscono righe, colonne e blocchi. I campi
 * si assegnano per struttura (colonna, ordine verticale, corpo relativo al testo corrente)
 * e non per parole chiave, così l'importazione regge anche impaginazioni leggermente diverse.
 *
 * Le immagini si recuperano dagli oggetti incorporati; se non sono leggibili si ritaglia la
 * pagina renderizzata nel punto esatto in cui il PDF le disegna.
 *
 * L'esito è per natura parziale: l'interfaccia lo dichiara e invita a ricontrollare i campi.
 */
( function () {
	'use strict';

	var COLUMN_SPLIT_PT = 297; // Metà di una pagina A4 in punti.

	/* --------------------------------------------------------------- testo */

	/**
	 * Ricompone il testo di una riga inserendo gli spazi che il PDF non contiene.
	 *
	 * Nei titoli spaziati ogni parola è un frammento separato, senza carattere di spazio:
	 * l'unico indizio è la distanza dal frammento successivo. Misurata sui whitepaper
	 * Layerloop, la distanza fra due parole vale 0,6–0,8 volte il corpo del carattere,
	 * mentre dentro una parola resta sotto 0,3. Una distanza molto più larga separa due voci
	 * distinte sulla stessa riga — per esempio due tag di copertina — e diventa doppio spazio.
	 *
	 * @param {Array}  items Frammenti ordinati per ascissa.
	 * @param {number} size  Corpo del carattere della riga.
	 * @return {string} Testo della riga.
	 */
	function joinLineItems( items, size ) {
		var WORD_GAP = 0.45;
		var ENTRY_GAP = 2.5;
		var text = '';
		var previous = null;

		items.forEach( function ( item ) {
			if ( previous ) {
				var gap = ( item.x - ( previous.x + previous.width ) ) / ( size || 1 );
				if ( gap >= ENTRY_GAP ) {
					text += '  ';
				} else if ( gap >= WORD_GAP && ! /\s$/.test( text ) && ! /^\s/.test( item.str ) ) {
					text += ' ';
				}
			}
			text += item.str;
			previous = item;
		} );

		return text.replace( /[ \t]{3,}/g, '  ' ).replace( /^\s+|\s+$/g, '' );
	}

	/**
	 * Corpo del carattere di un frammento.
	 *
	 * @param {Object} item Elemento restituito da pdf.js.
	 * @return {number} Dimensione in punti.
	 */
	function itemSize( item ) {
		var transform = item.transform || [ 1, 0, 0, 1, 0, 0 ];
		return Math.hypot( transform[ 1 ], transform[ 3 ] ) || item.height || 0;
	}

	/**
	 * Raggruppa i frammenti in righe (stessa ordinata, stesso corpo, stessa colonna)
	 * e le righe in blocchi omogenei.
	 *
	 * Il raggruppamento per colonna è indispensabile: senza, due colonne affiancate
	 * finiscono nella stessa riga e i testi si fondono.
	 *
	 * @param {Object} textContent Contenuto testuale della pagina.
	 * @param {number} pageHeight  Altezza della pagina in punti.
	 * @return {Array} Blocchi ordinati dall'alto verso il basso.
	 */
	function buildBlocks( textContent, pageHeight ) {
		var lines = [];

		textContent.items.forEach( function ( item ) {
			if ( ! item.str || ! item.str.trim() ) {
				return;
			}
			var transform = item.transform;
			var x = transform[ 4 ];
			var y = pageHeight - transform[ 5 ];
			var size = itemSize( item );
			var column = x < COLUMN_SPLIT_PT ? 0 : 1;

			var line = null;
			for ( var i = lines.length - 1; i >= 0 && i > lines.length - 8; i-- ) {
				if ( lines[ i ].column === column &&
					Math.abs( lines[ i ].y - y ) <= 2.2 &&
					Math.abs( lines[ i ].size - size ) <= 0.8 ) {
					line = lines[ i ];
					break;
				}
			}
			if ( ! line ) {
				line = { y: y, size: size, column: column, left: x, items: [] };
				lines.push( line );
			}
			line.items.push( { x: x, width: item.width || 0, str: item.str } );
			line.left = Math.min( line.left, x );
		} );

		lines.forEach( function ( line ) {
			line.items.sort( function ( a, b ) {
				return a.x - b.x;
			} );
			line.text = joinLineItems( line.items, line.size );
		} );

		// Ordine per colonna e poi per ordinata: le righe di due colonne affiancate si
		// alternano lungo la pagina e, senza questo raggruppamento, i paragrafi di una
		// colonna non risulterebbero mai consecutivi e non si unirebbero in blocchi.
		lines = lines.filter( function ( line ) {
			return '' !== line.text;
		} ).sort( function ( a, b ) {
			return a.column !== b.column ? a.column - b.column : a.y - b.y;
		} );

		// Righe consecutive con stessa colonna, stesso corpo, stesso margine sinistro
		// e distanza verticale contenuta appartengono allo stesso blocco.
		var blocks = [];
		lines.forEach( function ( line ) {
			var previous = blocks[ blocks.length - 1 ];
			var joinable = previous &&
				previous.column === line.column &&
				Math.abs( previous.size - line.size ) <= 0.6 &&
				Math.abs( previous.left - line.left ) <= 4 &&
				( line.y - previous.bottom ) <= line.size * 1.9;

			if ( joinable ) {
				previous.lines.push( line.text );
				previous.bottom = line.y;
				return;
			}

			blocks.push( {
				size: line.size,
				column: line.column,
				top: line.y,
				bottom: line.y,
				left: line.left,
				lines: [ line.text ]
			} );
		} );

		blocks.forEach( function ( block ) {
			block.text = block.lines.join( '\n' );
		} );

		return blocks;
	}

	/**
	 * Corpo del carattere del testo corrente: il più usato nella pagina, pesato sulla
	 * quantità di testo. Tutto ciò che è sensibilmente più piccolo è un titoletto.
	 *
	 * @param {Array} blocks Blocchi della pagina.
	 * @return {number} Corpo del testo corrente.
	 */
	function bodySizeOf( blocks ) {
		var weights = {};
		var best = 0;
		var bestWeight = -1;

		blocks.forEach( function ( block ) {
			var key = block.size.toFixed( 1 );
			weights[ key ] = ( weights[ key ] || 0 ) + block.text.length;
		} );
		Object.keys( weights ).forEach( function ( key ) {
			if ( weights[ key ] > bestWeight ) {
				bestWeight = weights[ key ];
				best = parseFloat( key );
			}
		} );

		return best;
	}

	/* ------------------------------------------------------------ immagini */

	/**
	 * Converte un oggetto immagine di pdf.js in data URL.
	 *
	 * @param {Object} image Oggetto {width, height, data}.
	 * @return {string} Data URL, stringa vuota se il formato non è gestito.
	 */
	function imageObjectToDataUrl( image ) {
		if ( ! image || ! image.width || ! image.height || ! image.data ) {
			return '';
		}
		var width = image.width;
		var height = image.height;
		var source = image.data;
		var canvas = document.createElement( 'canvas' );
		canvas.width = width;
		canvas.height = height;
		var context = canvas.getContext( '2d' );
		if ( ! context ) {
			return '';
		}
		var target = context.createImageData( width, height );
		var out = target.data;
		var pixels = width * height;
		var i;

		if ( source.length >= pixels * 4 ) {
			out.set( source.subarray( 0, pixels * 4 ) );
		} else if ( source.length >= pixels * 3 ) {
			for ( i = 0; i < pixels; i++ ) {
				out[ i * 4 ] = source[ i * 3 ];
				out[ i * 4 + 1 ] = source[ i * 3 + 1 ];
				out[ i * 4 + 2 ] = source[ i * 3 + 2 ];
				out[ i * 4 + 3 ] = 255;
			}
		} else if ( source.length >= pixels ) {
			for ( i = 0; i < pixels; i++ ) {
				out[ i * 4 ] = source[ i ];
				out[ i * 4 + 1 ] = source[ i ];
				out[ i * 4 + 2 ] = source[ i ];
				out[ i * 4 + 3 ] = 255;
			}
		} else {
			return '';
		}

		context.putImageData( target, 0, 0 );
		return canvas.toDataURL( 'image/webp', 0.9 );
	}

	/**
	 * Moltiplicazione di due matrici di trasformazione PDF.
	 *
	 * @param {Array} a Prima matrice.
	 * @param {Array} b Seconda matrice.
	 * @return {Array} Matrice risultante.
	 */
	function multiply( a, b ) {
		return [
			a[ 0 ] * b[ 0 ] + a[ 1 ] * b[ 2 ],
			a[ 0 ] * b[ 1 ] + a[ 1 ] * b[ 3 ],
			a[ 2 ] * b[ 0 ] + a[ 3 ] * b[ 2 ],
			a[ 2 ] * b[ 1 ] + a[ 3 ] * b[ 3 ],
			a[ 4 ] * b[ 0 ] + a[ 5 ] * b[ 2 ] + b[ 4 ],
			a[ 4 ] * b[ 1 ] + a[ 5 ] * b[ 3 ] + b[ 5 ]
		];
	}

	/**
	 * Individua le immagini disegnate nella pagina e la loro area sul foglio.
	 *
	 * @param {Object} page Pagina pdf.js.
	 * @return {Promise<Array>} Elenco {name, rect, area}, dalla più grande.
	 */
	function findImagePlacements( page ) {
		var lib = window.pdfjsLib;
		return page.getOperatorList().then( function ( ops ) {
			var current = [ 1, 0, 0, 1, 0, 0 ];
			var stack = [];
			var found = [];
			var i;

			for ( i = 0; i < ops.fnArray.length; i++ ) {
				var fn = ops.fnArray[ i ];
				var args = ops.argsArray[ i ];

				if ( fn === lib.OPS.save ) {
					stack.push( current.slice() );
				} else if ( fn === lib.OPS.restore ) {
					current = stack.length ? stack.pop() : [ 1, 0, 0, 1, 0, 0 ];
				} else if ( fn === lib.OPS.transform ) {
					current = multiply( args.slice( 0, 6 ), current );
				} else if ( fn === lib.OPS.paintImageXObject || fn === lib.OPS.paintJpegXObject ) {
					var width = Math.abs( current[ 0 ] );
					var height = Math.abs( current[ 3 ] );
					if ( width < 24 || height < 24 ) {
						continue;
					}
					found.push( {
						name: args[ 0 ],
						rect: { x: current[ 4 ], y: current[ 5 ], width: width, height: height },
						area: width * height
					} );
				}
			}

			return found.sort( function ( a, b ) {
				return b.area - a.area;
			} );
		} );
	}

	/**
	 * Recupera l'oggetto immagine, con attesa limitata.
	 *
	 * @param {Object} page Pagina.
	 * @param {string} name Nome dell'oggetto.
	 * @return {Promise<Object|null>} Oggetto immagine.
	 */
	function resolveImageObject( page, name ) {
		return new Promise( function ( resolve ) {
			var settled = false;
			var finish = function ( value ) {
				if ( settled ) {
					return;
				}
				settled = true;
				resolve( value || null );
			};
			setTimeout( function () {
				finish( null );
			}, 5000 );
			try {
				page.objs.get( name, finish );
			} catch ( error ) {
				finish( null );
			}
		} );
	}

	/**
	 * Renderizza la pagina e ne ritaglia l'area indicata.
	 *
	 * @param {Object} page Pagina.
	 * @param {Object} rect Area in punti PDF, origine in basso a sinistra.
	 * @return {Promise<string>} Data URL del ritaglio.
	 */
	function cropFromRenderedPage( page, rect ) {
		var scale = 2.4;
		var viewport = page.getViewport( { scale: scale } );
		var canvas = document.createElement( 'canvas' );
		canvas.width = Math.ceil( viewport.width );
		canvas.height = Math.ceil( viewport.height );
		var context = canvas.getContext( '2d' );
		if ( ! context ) {
			return Promise.resolve( '' );
		}

		return page.render( { canvasContext: context, viewport: viewport } ).promise.then( function () {
			var width = Math.round( rect.width * scale );
			var height = Math.round( rect.height * scale );
			if ( width < 24 || height < 24 ) {
				return '';
			}
			var crop = document.createElement( 'canvas' );
			crop.width = width;
			crop.height = height;
			crop.getContext( '2d' ).drawImage(
				canvas,
				Math.round( rect.x * scale ),
				Math.round( canvas.height - ( rect.y + rect.height ) * scale ),
				width,
				height,
				0, 0, width, height
			);
			return crop.toDataURL( 'image/webp', 0.9 );
		} );
	}

	/**
	 * Immagine principale di una pagina.
	 *
	 * @param {Object} page Pagina.
	 * @return {Promise<string>} Data URL, stringa vuota se non recuperabile.
	 */
	function largestImage( page ) {
		return findImagePlacements( page ).then( function ( placements ) {
			if ( ! placements.length ) {
				return '';
			}
			var best = placements[ 0 ];
			return resolveImageObject( page, best.name ).then( function ( object ) {
				var direct = '';
				try {
					direct = imageObjectToDataUrl( object );
				} catch ( error ) {
					direct = '';
				}
				if ( direct ) {
					return direct;
				}
				return cropFromRenderedPage( page, best.rect );
			} );
		} ).catch( function () {
			return '';
		} );
	}

	/* --------------------------------------------------- lettura dei campi */

	function flat( text ) {
		return String( text || '' ).replace( /\s*\n\s*/g, ' ' ).trim();
	}

	/**
	 * Copertina: intestazione, titolo, sottotitolo, tag.
	 *
	 * @param {Array}  blocks Blocchi della pagina.
	 * @param {Object} data   Case study da riempire.
	 * @param {Array}  notes  Avvisi.
	 */
	function readCover( blocks, data, notes ) {
		if ( ! blocks.length ) {
			notes.push( 'La copertina non conteneva testo leggibile.' );
			return;
		}

		var header = blocks.filter( function ( block ) {
			return block.top < 80;
		} );
		var brand = header.filter( function ( block ) {
			return 0 === block.column;
		} )[ 0 ];
		var document = header.filter( function ( block ) {
			return 1 === block.column;
		} )[ 0 ];

		if ( brand ) {
			data.brand = flat( brand.text );
		}
		if ( document ) {
			data.document = flat( document.text );
		} else if ( brand ) {
			// Intestazione su una sola colonna: si separa sulla dicitura del documento.
			var split = data.brand.search( /\b(White\s*Paper|Whitepaper|Case\s*Study)\b/i );
			if ( split > 0 ) {
				data.document = data.brand.slice( split ).trim();
				data.brand = data.brand.slice( 0, split ).trim();
			}
		}

		var body = blocks.filter( function ( block ) {
			return block.top >= 80;
		} );

		var title = body.slice().sort( function ( a, b ) {
			return b.size - a.size;
		} )[ 0 ];
		if ( title && title.size >= 18 ) {
			data.title = title.text;
		} else {
			title = null;
			notes.push( 'Titolo non riconosciuto: compilalo a mano.' );
		}

		var subtitle = body.filter( function ( block ) {
			return block !== title && block.size >= 11 && ( ! title || block.top > title.bottom );
		} )[ 0 ];
		if ( subtitle ) {
			data.subtitle = flat( subtitle.text );
		}

		var tagBlock = body.filter( function ( block ) {
			return block !== title && block !== subtitle && block.size < 11 &&
				( ! subtitle || block.top > subtitle.bottom );
		} )[ 0 ];
		if ( tagBlock ) {
			var tags = [];
			tagBlock.lines.forEach( function ( line ) {
				line.split( /\s{2,}/ ).forEach( function ( tag ) {
					tag = tag.trim();
					if ( tag && tags.length < 4 ) {
						tags.push( tag );
					}
				} );
			} );
			if ( tags.length ) {
				data.tags = tags.join( ', ' );
			}
		}
	}

	/**
	 * Pagina tecnica: colonna sinistra (sfida, limiti, box soluzione) e
	 * colonna destra (specifiche e "perché conviene").
	 *
	 * @param {Array}  blocks Blocchi della pagina.
	 * @param {Object} data   Case study da riempire.
	 * @param {Array}  notes  Avvisi.
	 */
	function readTechnical( blocks, data, notes ) {
		var content = blocks.filter( function ( block ) {
			return block.top >= 80;
		} );
		if ( ! content.length ) {
			notes.push( 'La pagina tecnica non conteneva testo leggibile.' );
			return;
		}

		var body = bodySizeOf( content );
		var isHeading = function ( block ) {
			return block.size <= body - 0.8;
		};

		var left = content.filter( function ( block ) {
			return 0 === block.column;
		} );
		var right = content.filter( function ( block ) {
			return 1 === block.column;
		} );

		// Il box della soluzione è rientrato rispetto al corpo della colonna.
		var margin = left.reduce( function ( min, block ) {
			return Math.min( min, block.left );
		}, Infinity );
		var flow = left.filter( function ( block ) {
			return block.left <= margin + 8;
		} );
		var box = left.filter( function ( block ) {
			return block.left > margin + 8;
		} );

		// Un titoletto apre una sezione; i paragrafi che seguono, essendo blocchi
		// distinti, si accumulano nella sezione aperta invece di aprirne una nuova.
		var pairs = [ [ 'section1Title', 'section1Text' ], [ 'section2Title', 'section2Text' ] ];
		var sections = [];
		var current = null;

		flow.forEach( function ( block ) {
			if ( isHeading( block ) ) {
				current = { title: flat( block.text ), paragraphs: [] };
				sections.push( current );
				return;
			}
			if ( ! current ) {
				current = { title: '', paragraphs: [] };
				sections.push( current );
			}
			current.paragraphs.push( block.text );
		} );

		sections.slice( 0, pairs.length ).forEach( function ( section, index ) {
			if ( section.title ) {
				data[ pairs[ index ][ 0 ] ] = section.title;
			}
			if ( section.paragraphs.length ) {
				data[ pairs[ index ][ 1 ] ] = section.paragraphs.join( '\n\n' );
			}
		} );

		if ( ! sections.length ) {
			notes.push( 'I testi della colonna sinistra non sono stati riconosciuti.' );
		}

		var boxTexts = [];
		box.forEach( function ( block ) {
			if ( isHeading( block ) && ! data.boxTitle ) {
				data.boxTitle = flat( block.text );
				return;
			}
			boxTexts.push( block.text );
		} );
		if ( boxTexts.length ) {
			data.boxText = boxTexts.join( '\n\n' );
		}

		// Colonna destra: etichetta piccola seguita da un valore breve = specifica.
		// Una etichetta seguita da un testo lungo è invece il blocco "perché conviene".
		var specs = [];
		var label = null;

		right.forEach( function ( block ) {
			if ( isHeading( block ) ) {
				label = block;
				return;
			}
			if ( ! label ) {
				return;
			}
			var value = flat( block.text );
			if ( value.length <= 48 && block.lines.length <= 2 ) {
				specs.push( {
					id: 'spec-' + specs.length,
					label: flat( label.text ),
					value: value
				} );
			} else if ( ! data.whyText ) {
				data.whyTitle = flat( label.text );
				data.whyText = block.text;
			}
			label = null;
		} );

		if ( specs.length ) {
			data.specs = specs.slice( 0, 6 );
		}
	}

	/**
	 * Pagina di confronto: sovratitolo, titolo, introduzione.
	 *
	 * @param {Array}  blocks Blocchi della pagina.
	 * @param {Object} target Pagina benchmark da riempire.
	 */
	function readComparison( blocks, target ) {
		var content = blocks.filter( function ( block ) {
			return block.top >= 80;
		} );
		if ( ! content.length ) {
			return;
		}

		var title = content.slice().sort( function ( a, b ) {
			return b.size - a.size;
		} )[ 0 ];
		if ( ! title || title.size < 18 ) {
			return;
		}
		target.title = flat( title.text );

		var eyebrow = content.filter( function ( block ) {
			return block.bottom <= title.top;
		} ).pop();
		if ( eyebrow ) {
			target.eyebrow = flat( eyebrow.text );
		}

		var intro = content.filter( function ( block ) {
			return block.top > title.bottom;
		} )[ 0 ];
		if ( intro ) {
			target.intro = intro.text;
		}
	}

	/* ---------------------------------------------------------- interfaccia */

	/**
	 * Legge un whitepaper Layerloop e ne ricava un case study parziale.
	 *
	 * @param {File}     file     File PDF.
	 * @param {Function} progress Callback di avanzamento.
	 * @return {Promise<Object>} {data, images, notes}
	 */
	function parse( file, progress ) {
		var lib = window.pdfjsLib;
		if ( ! lib ) {
			return Promise.reject( new Error( 'Il lettore PDF non è stato caricato: ricarica la pagina.' ) );
		}
		if ( window.LLStudioConfig && window.LLStudioConfig.pdfWorker ) {
			lib.GlobalWorkerOptions.workerSrc = window.LLStudioConfig.pdfWorker;
		}

		var notes = [];
		var data = {};
		var images = { cover: '', piece: '' };

		function report( message ) {
			if ( progress ) {
				progress( message );
			}
		}

		return file.arrayBuffer().then( function ( buffer ) {
			report( 'Apertura del PDF…' );
			return lib.getDocument( { data: new Uint8Array( buffer ) } ).promise;
		} ).then( function ( pdf ) {
			var total = Math.min( pdf.numPages, 4 );
			var chain = Promise.resolve();

			for ( var number = 1; number <= total; number++ ) {
				( function ( index ) {
					chain = chain.then( function () {
						report( 'Lettura della pagina ' + index + ' di ' + total + '…' );
						return pdf.getPage( index );
					} ).then( function ( page ) {
						var viewport = page.getViewport( { scale: 1 } );
						return page.getTextContent().then( function ( textContent ) {
							var blocks = buildBlocks( textContent, viewport.height );

							if ( 1 === index ) {
								readCover( blocks, data, notes );
							} else if ( 2 === index ) {
								readTechnical( blocks, data, notes );
							} else if ( 3 === index ) {
								data.benchmarkEnabled = true;
								data.benchmarkClassic = data.benchmarkClassic || {};
								readComparison( blocks, data.benchmarkClassic );
							} else {
								data.benchmarkFdm = data.benchmarkFdm || {};
								readComparison( blocks, data.benchmarkFdm );
							}

							if ( index > 2 ) {
								return null;
							}
							report( 'Estrazione delle immagini dalla pagina ' + index + '…' );
							return largestImage( page ).then( function ( dataUrl ) {
								if ( ! dataUrl ) {
									return;
								}
								if ( 1 === index ) {
									images.cover = dataUrl;
								} else {
									images.piece = dataUrl;
								}
							} );
						} );
					} );
				} )( number );
			}

			return chain.then( function () {
				if ( ! images.cover && ! images.piece ) {
					notes.push( 'Nessuna immagine estratta: caricale a mano.' );
				}
				return { data: data, images: images, notes: notes };
			} );
		} );
	}

	/**
	 * Renderizza la prima pagina di un PDF: è la copertina usata nelle schede
	 * dell'elenco dei case study.
	 *
	 * @param {File}   file  File PDF.
	 * @param {number} width Larghezza desiderata in pixel.
	 * @return {Promise<string>} Data URL, stringa vuota in caso di errore.
	 */
	function firstPageImage( file, width ) {
		var lib = window.pdfjsLib;
		if ( ! lib ) {
			return Promise.resolve( '' );
		}
		if ( window.LLStudioConfig && window.LLStudioConfig.pdfWorker ) {
			lib.GlobalWorkerOptions.workerSrc = window.LLStudioConfig.pdfWorker;
		}

		return file.arrayBuffer().then( function ( buffer ) {
			return lib.getDocument( { data: new Uint8Array( buffer ) } ).promise;
		} ).then( function ( pdf ) {
			return pdf.getPage( 1 );
		} ).then( function ( page ) {
			var base = page.getViewport( { scale: 1 } );
			var viewport = page.getViewport( { scale: ( width || 900 ) / base.width } );
			var canvas = document.createElement( 'canvas' );
			canvas.width = Math.ceil( viewport.width );
			canvas.height = Math.ceil( viewport.height );
			var context = canvas.getContext( '2d' );
			if ( ! context ) {
				return '';
			}
			context.fillStyle = '#ffffff';
			context.fillRect( 0, 0, canvas.width, canvas.height );
			return page.render( { canvasContext: context, viewport: viewport } ).promise.then( function () {
				return canvas.toDataURL( 'image/webp', 0.88 );
			} );
		} ).catch( function () {
			return '';
		} );
	}

	window.LLPdfImport = { parse: parse, firstPageImage: firstPageImage };
} )();
