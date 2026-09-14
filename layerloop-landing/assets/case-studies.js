/*
 * Carosello dei case study: scorrimento con le frecce, stato dei pulsanti
 * allineato alla posizione reale della barra di scorrimento.
 */
( function () {
	'use strict';

	function setup( root ) {
		var track = root.querySelector( '[data-ll-track]' );
		var previous = root.querySelector( '.ll-cs-prev' );
		var next = root.querySelector( '.ll-cs-next' );
		if ( ! track || ! previous || ! next ) {
			return;
		}

		function step() {
			var card = track.querySelector( '.ll-cs-card' );
			if ( ! card ) {
				return track.clientWidth;
			}
			var styles = window.getComputedStyle( track );
			var gap = parseFloat( styles.columnGap || styles.gap || '0' ) || 0;
			return card.getBoundingClientRect().width + gap;
		}

		function sync() {
			var max = track.scrollWidth - track.clientWidth - 2;
			previous.disabled = track.scrollLeft <= 2;
			next.disabled = track.scrollLeft >= max;
		}

		previous.addEventListener( 'click', function () {
			track.scrollBy( { left: -step(), behavior: 'smooth' } );
		} );
		next.addEventListener( 'click', function () {
			track.scrollBy( { left: step(), behavior: 'smooth' } );
		} );

		track.addEventListener( 'scroll', function () {
			window.requestAnimationFrame( sync );
		}, { passive: true } );
		window.addEventListener( 'resize', sync );

		sync();
	}

	function boot() {
		var nodes = document.querySelectorAll( '[data-ll-carousel]' );
		Array.prototype.forEach.call( nodes, setup );
	}

	if ( 'loading' === document.readyState ) {
		document.addEventListener( 'DOMContentLoaded', boot );
	} else {
		boot();
	}
} )();
