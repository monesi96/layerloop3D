# Architettura tecnica — LayerLoop Landing + Studio 2.0

Nota per chi mette le mani nel codice.

---

## Quadro d'insieme

```
                     browser (pagina /pdf-generator/)
  ┌──────────────────────────────────────────────────────────────┐
  │ studio.js                                                    │
  │  · stato unico: { data (case study), fields (landing), … }   │
  │  · anteprima A4 ricostruita a ogni modifica                  │
  │  · html2canvas + jsPDF  → PDF base64                         │
  │  · localStorage: salvataggio automatico                      │
  └────────────┬─────────────────────────────────────────────────┘
               │ fetch + nonce wp_rest
  ┌────────────▼─────────────────────────────────────────────────┐
  │ /wp-json/layerloop/v1/                                       │
  │   POST /image        → gemini.php  → Google Generative AI     │
  │   GET  /whitepapers  → elenco                                 │
  │   POST /whitepapers  → mapper.php → CPT + ACF + media + PDF   │
  │   GET  /whitepapers/{id}, DELETE /whitepapers/{id}            │
  └────────────┬─────────────────────────────────────────────────┘
               │
  ┌────────────▼─────────────────────────────────────────────────┐
  │ CPT whitepaper  ─ ACF ─→ templates/landing.php               │
  │       │                                                      │
  │       └─ Ninja Forms → leads.php → link firmato + email      │
  └──────────────────────────────────────────────────────────────┘
```

---

## Modello dati

Lo Studio invia al server un **documento** unico:

```jsonc
{
  "postId": 0,                 // 0 = nuova landing, >0 = aggiornamento
  "status": "publish",         // publish | draft
  "title": "…",                // titolo del post e slug
  "metaDescription": "…",      // post_excerpt
  "formId": 12,                // modulo Ninja Forms
  "fields": {                  // campi ACF della landing, per nome
    "ll_hero_title": "Soffietti flessibili,|on-demand.",
    "ll_hero_img_wire": { "id": 0, "dataUrl": "", "fromCase": "coverImage" },
    "…": "…"
  },
  "caseStudy": { … },          // modello v6 del generatore PDF
  "pdfIT": "JVBERi0…"          // PDF base64, senza prefisso data:
}
```

### Campi immagine

Un campo immagine è sempre un oggetto con tre modi di risolversi, valutati in quest'ordine da
`LL_Studio_Mapper::resolve_image()`:

| Forma | Significato |
|---|---|
| `{ "dataUrl": "data:image/webp;base64,…" }` | nuova immagine da caricare in libreria |
| `{ "id": 123 }` | allegato già esistente, si riusa |
| `{ "fromCase": "pieceImage" }` | riusa l'allegato caricato con il case study |
| tutto vuoto | campo azzerato → il template usa il suo valore di esempio |

`fromCase` evita che gli stessi byte viaggino due volte (una nel case study, una nella landing) e
che la libreria media si riempia di doppioni: `persist_case_images()` gira **prima** del ciclo sui
campi e restituisce la mappa `nome → attachment_id`.

### Scrittura dei campi ACF

`LL_Studio_Mapper::set_field()` scrive direttamente le due righe che ACF si aspetta:

```php
update_post_meta( $post_id, 'll_hero_title', $value );
update_post_meta( $post_id, '_ll_hero_title', 'f_ll_hero_title' );
```

Funziona perché in `fields.php` la chiave di ogni campo è sempre `f_` + nome. Il vantaggio è che
non serve che ACF sia caricato al momento della scrittura e che `get_field()` continua a
funzionare identico.

### Rilettura

`LL_Studio_Mapper::load()` parte dal documento salvato in `_ll_studio_payload` ma **i valori sul
post hanno la precedenza**: così una landing modificata a mano da backend con ACF non perde le
modifiche quando viene riaperta nello Studio, e funzionano anche le landing create prima della 2.0.

---

## PDF

`studio.js` clona ogni `.ll-sheet` in un contenitore fuori flusso di 794 × 1123 px (A4 a 96 dpi),
lo passa a html2canvas a `scale: 2` e monta le pagine in un jsPDF A4 come JPEG qualità 0.92.

Il clone serve perché html2canvas sbaglia le coordinate quando l'elemento sta dentro un contenitore
con scroll — che è esattamente il caso dell'anteprima.

Il PDF risultante è raster. Il pulsante **Stampa** resta come alternativa vettoriale: le regole
`@media print` in `studio.css` nascondono il tema con `visibility` (non `display`) per non
dipendere dalla struttura del tema.

---

## Sicurezza

- **Autenticazione**: cookie WordPress + nonce `wp_rest` su ogni chiamata. Nessun endpoint pubblico.
- **Autorizzazione**: capability `use_layerloop_studio` per usare lo Studio,
  `publish_ll_whitepapers` per pubblicare, `edit_post`/`delete_post` per post specifici.
- **Il CPT usa capability dedicate** (`ll_whitepaper`/`ll_whitepapers`): il ruolo Layerloop Studio
  può pubblicare whitepaper senza ricevere alcun permesso sugli articoli del blog.
- **Chiave Gemini**: solo lato server, mai serializzata verso il browser. `LL_GEMINI_API_KEY` in
  `wp-config.php` ha la precedenza sull'opzione.
- **Immagini in ingresso**: si accettano solo data URL `image/png|jpeg|webp`, si verifica il
  base64 e il limite di dimensione prima di scrivere su disco.
- **PDF in ingresso**: si verifica che i primi quattro byte siano `%PDF` e il limite di 25 MB.
- **PDF in uscita**: cartella `uploads/layerloop-whitepapers/` con `.htaccess` di blocco; il file
  passa solo dall'endpoint firmato.
- **Link di download**: `hash_hmac('sha256', "id|lang|scadenza|md5(email)", wp_salt('auth'))`,
  confrontato con `hash_equals`. Scadenza configurabile, default 168 ore.
- **Testi**: `wp_strip_all_tags` + limite di lunghezza sui campi testo, `wp_kses` con whitelist
  minima (`p b strong i em ul ol li br`) sui due campi WYSIWYG.

Il vecchio endpoint `?ll_wp_pdf=<ID>` con cookie resta attivo per non rompere le landing esistenti.

---

## Ninja Forms

Due agganci in `leads.php`:

1. `ninja_forms_submit_data` (filtro, priorità 20) — individua il whitepaper, calcola il link
   firmato e, se la modalità lo prevede, imposta `$data['actions']['redirect']` per il download
   immediato. Gira **prima** delle azioni del modulo.
2. `ninja_forms_after_submission` (azione, priorità 20) — scrive `_ll_whitepaper_id` sulla
   submission, incrementa il contatore sul whitepaper e invia l'email.

Il whitepaper si individua in due modi, nell'ordine: campo con chiave che contiene
`layerloop_whitepaper` (valore = ID del post, tipicamente `{post:id}`), altrimenti
`url_to_postid()` sul referer della richiesta AJAX.

Il modulo finisce sulla landing attraverso il campo `ll_closing_lines` già previsto dal template:
`mapper.php` ci scrive `[ninja_form id=X] | contatti` se non c'è già uno shortcode Ninja Forms.

---

## Gemini

`POST https://generativelanguage.googleapis.com/v1beta/models/{modello}:generateContent`
con header `x-goog-api-key`, corpo `contents[0].parts = [ {text}, {inline_data} ]` e
`generationConfig.responseModalities = ["IMAGE"]`.

Se l'API risponde 400 lamentandosi delle modalità, si ritenta con `["TEXT","IMAGE"]`.
La risposta arriva in camelCase (`inlineData`) ma il parser accetta entrambe le forme.

Gemini **non produce alpha**: il prompt impone uno sfondo bianco piatto e lo scontorno avviene nel
browser (`removeFlatBackground` in `studio.js`) con un riempimento a partire dai quattro bordi.
Solo i pixel collegati al contorno diventano trasparenti, quindi le zone chiare interne al pezzo
restano opache.

---

## Estendere

**Nuovo campo nella landing** — quattro punti da toccare:

1. `includes/fields.php` — definizione ACF, chiave `f_` + nome
2. `templates/landing.php` — lettura e markup
3. `includes/mapper.php` — riga in `text_fields()` / `html_fields()` / `image_fields()`
4. `assets/studio.js` — voce in `LANDING_SCHEMA`, con `from(caseStudy)` per il precompilato

**Nuovo preset immagine** — `LL_Studio_Gemini::presets()`: arriva da solo nel menu a tendina
dello Studio.

**Nuovo campo del case study** — `caseStudyDefaults()` e il render dell'anteprima in `studio.js`,
più il limite corrispondente lato server se deve finire nella landing.
