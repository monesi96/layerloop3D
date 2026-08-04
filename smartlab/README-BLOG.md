# Smart Lab Industries — Blog con il brand della homepage 2026

Il tema `smartlab` ora include una sezione **Blog/News completamente ridisegnata**
con lo stesso stile della landing in homepage: font Familjen Grotesk + Fragment Mono,
accento teal, bande arrotondate, nav "a pillola", dark mode automatica, animazioni
al scroll. **Niente WP Bakery: tutto è nel tema.**

## File nuovi / modificati

| File | Cosa fa |
|---|---|
| `home.php` | Lista articoli del blog (hero scuro, articolo in evidenza, griglia card, paginazione) |
| `single.php` | Articolo singolo (hero con titolo, immagine in evidenza, tipografia curata, condivisione, correlati) |
| `archive.php` | Archivi per categoria/tag/data — **il vecchio è salvato come `2026-08-04_archive.php`** |
| `search.php` | Risultati di ricerca con lo stesso stile |
| `header-blog.php` / `footer-blog.php` | Nav e footer identici alla landing (usati solo dalle pagine blog) |
| `template-parts/card-post.php` | La card articolo riutilizzata ovunque |
| `css/blog.css` | Tutto il design system del blog (colori/font della landing) |
| `functions.php` | Aggiunti in fondo: tempo di lettura + lunghezza estratti |

Le altre pagine del sito (WooCommerce, pagine WP Bakery, ecc.) **non sono toccate**:
i nuovi header/footer e il CSS si caricano solo sui template del blog.

## Installazione

1. Fai un **backup** del tema attuale (scarica la cartella `wp-content/themes/smartlab`).
2. Carica via FTP la nuova cartella `smartlab` sovrascrivendo quella esistente
   (oppure carica solo i file elencati sopra — sono additivi tranne `archive.php` e `functions.php`).
3. Vai su **Impostazioni → Lettura** e verifica che ci sia una "Pagina articoli"
   impostata (es. una pagina vuota chiamata "Blog"). La homepage statica resta la tua landing.
4. Svuota la cache (plugin di cache e browser).

## Scrivere articoli SENZA il builder

Non serve installare nulla: usa l'**editor a blocchi di WordPress (Gutenberg)**, già incluso.

1. Vai su **WPBakery Page Builder → Impostazioni → Role Manager**
   e alla voce *Post types* togli la spunta a `post` (lascialo solo per `page`).
   Da quel momento gli articoli si aprono con l'editor normale di WordPress.
2. Scrivi l'articolo con titoli (H2/H3), paragrafi, immagini, citazioni, elenchi:
   il template `single.php` li impagina già con lo stile della homepage.
3. Imposta sempre **immagine in evidenza** e **categoria**: la card in lista e
   l'hero dell'articolo le usano.
4. Se vuoi incollare HTML puro, usa il blocco **"HTML personalizzato"** di Gutenberg.

> In alternativa, se preferisci un editor ancora più semplice (solo testo, come Word),
> puoi installare il plugin gratuito **Classic Editor** — ma Gutenberg è la scelta consigliata.

## Personalizzazione rapida

- **Testi dell'hero del blog** → `home.php` (titolo "Storie di prodotti…" e sottotitolo).
- **CTA in fondo alle pagine blog** → `footer-blog.php` (sezione `blogcta`).
- **Colori / font** → variabili in cima a `css/blog.css` (`--teal`, `--bg`, ecc.).
- **Logo della nav** → URL dell'immagine in `header-blog.php` e `footer-blog.php`.
- Il tempo di lettura si calcola da solo (200 parole/minuto).
