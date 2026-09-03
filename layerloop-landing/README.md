# LayerLoop Landing + Studio — Plugin WordPress

Due cose in un plugin solo:

1. **Landing "whitepaper/settore"** standardizzata: hero con effetto render→wireframe, confronto
   problema/soluzione, case study con box in vetro, banda "perché conviene", materiali con tab
   interattivi, stampanti e CTA finale. *(invariata rispetto alla 1.3)*
2. **Studio pubblico** (novità 2.0): dalla pagina `/pdf-generator/` si crea il case study, si
   genera il PDF A4, si producono le immagini "fil di ferro" con Gemini e si **pubblica la landing
   page collegata**, con il PDF che parte in automatico a chi lascia i dati nel modulo Ninja Forms.

**Chi usa lo Studio non entra mai in bacheca.** Accede con il proprio account WordPress
direttamente dalla pagina pubblica e lavora lì dentro.

---

## Requisiti

- WordPress 6.x
- **Advanced Custom Fields** (basta la versione GRATUITA — nessun campo Pro)
- **Ninja Forms** (facoltativo, serve per raccogliere i contatti e consegnare il whitepaper)
- Una **chiave API Gemini** di Google AI Studio (facoltativa, serve solo per le immagini AI)

---

## Installazione

1. Comprimi la cartella `layerloop-landing` in **layerloop-landing.zip**.
2. Bacheca → **Plugin → Aggiungi nuovo → Carica plugin** → scegli lo zip → **Installa** → **Attiva**.
   Se stai aggiornando dalla 1.3, sovrascrivi la cartella e riattiva: i whitepaper esistenti
   restano dove sono.
3. Vai in **Impostazioni → Permalink** e clicca **Salva modifiche** (registra gli URL `/whitepaper/...`).
4. Crea (o apri) la pagina **PDF Generator** e incolla lo shortcode:

   ```
   [layerloop_studio]
   ```

   Se usi Elementor, mettilo in un widget **Shortcode**. La pagina va lasciata a larghezza piena:
   lo Studio occupa tutta la finestra.
5. Vai in **Whitepaper → Impostazioni Studio** e configura chiave Gemini, modulo Ninja Forms e
   modalità di consegna del PDF.

### Aggiornando dalla 1.3

I whitepaper esistenti, i loro campi ACF e il download gated `?ll_wp_pdf=ID` continuano a
funzionare senza toccare nulla. Cambia una cosa sola: il tipo di contenuto **whitepaper** ora usa
permessi dedicati (`ll_whitepaper`), assegnati automaticamente ad **amministratori** e **redattori**
al primo caricamento della 2.0. Se avevi dato accesso ai whitepaper ad autori o collaboratori con
ruoli personalizzati, riassegnali al ruolo **Layerloop Studio** oppure aggiungi le capability
`edit_ll_whitepapers`, `publish_ll_whitepapers`, `edit_others_ll_whitepapers` al loro ruolo.

### Chiave Gemini in wp-config.php (consigliato)

Invece del campo nelle impostazioni puoi metterla in `wp-config.php`, così non finisce nel database:

```php
define( 'LL_GEMINI_API_KEY', 'la-tua-chiave' );
```

La costante ha la precedenza sul campo.

---

## Dare accesso a un collaboratore

1. **Utenti → Aggiungi nuovo**, ruolo **Layerloop Studio**.
2. Gli mandi il link della pagina `/pdf-generator/`: trova il modulo di accesso, entra con le sue
   credenziali e lavora.
3. Se prova a entrare in bacheca viene riportato allo Studio (si disattiva dalle impostazioni).

Il ruolo **Layerloop Studio** può soltanto: usare lo Studio, caricare immagini, creare e modificare
i whitepaper. Non tocca articoli, pagine, temi, plugin o utenti.

---

## Shortcode disponibili

| Shortcode | Dove va |
|---|---|
| `[layerloop_studio]` | La pagina del generatore, es. `/pdf-generator/` |
| `[ll_landing]` | Dentro una pagina Elementor, per la landing (sui whitepaper è automatico) |
| `[ll_case_studies]` | Una pagina qualsiasi: carosello dei case study pubblicati |

Il carosello accetta `label` (etichetta della sezione, default `Case study`), `cta` (testo del
pulsante), `limit` (quanti mostrarne, default 12), `ids` (elenco di ID per sceglierli e ordinarli
a mano) e `orderby` (`date` o `menu_order`). Per esempio:

```
[ll_case_studies label="Case study" limit="8"]
```

La copertina di ogni scheda è la prima pagina del PDF, generata automaticamente alla pubblicazione.

---

## Come funziona il flusso completo

```
/pdf-generator/  →  case study  →  PDF A4  →  landing /whitepaper/nome/  →  Ninja Forms  →  PDF al contatto
```

0. **Se il whitepaper esiste già in PDF** — «Importa da un PDF già impaginato» lo legge con pdf.js
   e compila brand, documento, titolo, sottotitolo, tag, le sezioni della colonna sinistra, il box
   della soluzione, «perché conviene» e le specifiche, recuperando anche copertina e foto del pezzo.
   Il file importato resta agganciato e viene allegato alla landing così com'è.
1. **Tab "Case study"** — si compilano i testi, si caricano le foto, si regolano gli indicatori
   del materiale, si attivano le due pagine benchmark. L'anteprima a destra è il PDF 1:1.
2. **"Genera immagine con Gemini"** — dalla foto del pezzo si ottiene il fil di ferro industriale.
   Gemini restituisce sempre uno sfondo pieno: lo scontorno viene fatto nel browser partendo dai
   bordi, così le zone chiare interne al pezzo restano intatte.
3. **Tab "Landing"** — i testi della landing arrivano già compilati dal case study e restano
   modificabili campo per campo. Si sceglie il modulo contatti e lo stato (pubblicata o bozza).
4. **"Genera PDF e pubblica la landing"** — il PDF viene composto nel browser, caricato in una
   cartella protetta, associato alla landing e la pagina va online su `/whitepaper/nome/`.
5. **Chi compila il modulo** sulla landing riceve il PDF: download immediato, email con link
   firmato a scadenza, o entrambi. Il contatto resta associato al whitepaper nelle submission
   di Ninja Forms.
6. **Tab "Archivio"** — l'elenco delle landing pubblicate, con il numero di contatti raccolti.
   Aprendone una, testi e immagini tornano nell'editor e la successiva pubblicazione aggiorna
   la stessa pagina.

---

## Ninja Forms: cosa serve

Basta un modulo con un campo **email**. Il plugin riconosce da solo la landing di provenienza
(dal referer della richiesta) e associa il contatto.

Per un'associazione blindata anche quando il browser non manda il referer, aggiungi al modulo un
campo **Nascosto** con:

- **Chiave del campo**: `layerloop_whitepaper`
- **Valore predefinito**: `{post:id}`

Il modulo viene inserito automaticamente in fondo alla landing con l'ancora `#contatti`, la stessa
a cui puntano tutti i pulsanti.

---

## Dove finiscono i PDF

In `wp-content/uploads/layerloop-whitepapers/`, con un `.htaccess` che blocca l'accesso diretto.
Si scaricano solo attraverso il link firmato (HMAC + scadenza) generato all'invio del modulo.

> **Nota per server nginx:** `.htaccess` non viene letto. Aggiungi al server block:
>
> ```nginx
> location ^~ /wp-content/uploads/layerloop-whitepapers/ { deny all; }
> ```
>
> Senza questa regola i PDF restano scaricabili da chi indovina l'URL del file.

---

## Struttura del codice

```
layerloop-landing/
├── layerloop-landing.php     ← bootstrap: CPT whitepaper, shortcode, asset, avvio moduli
├── includes/
│   ├── fields.php            ← campi ACF della landing (invariato)
│   ├── download.php          ← download gated storico (?ll_wp_pdf=ID, cookie dopo il form)
│   ├── settings.php          ← opzioni e pagina "Impostazioni Studio"
│   ├── roles.php             ← ruolo Layerloop Studio, capability, blocco bacheca
│   ├── gemini.php            ← client Gemini per le immagini
│   ├── case-studies.php      ← shortcode [ll_case_studies]
│   ├── mapper.php            ← da documento dello Studio a campi ACF, immagini e PDF
│   ├── leads.php             ← Ninja Forms, link firmati, consegna del whitepaper
│   ├── rest.php              ← /wp-json/layerloop/v1/…
│   └── studio.php            ← shortcode [layerloop_studio], login, asset
├── templates/landing.php     ← markup della landing (invariato)
├── assets/
│   ├── landing.css|js        ← grafica e animazioni della landing (invariati)
│   ├── studio.css|js         ← editor, anteprima A4, generazione PDF
│   ├── pdf-import.js         ← lettura di un whitepaper PDF già impaginato
│   └── case-studies.css|js   ← carosello [ll_case_studies]
└── vendor/                   ← jsPDF, html2canvas e pdf.js (licenze MIT/Apache, incluse)
```

- **Colori del design system della landing**: variabili CSS in cima a `landing.css`.
- **Impaginazione A4 del PDF**: `studio.css`, sezione "fogli A4" — misure in px a 96 dpi
  (794 × 1123), le stesse del generatore v6.
- **Nuovi campi della landing**: aggiungili in `fields.php`, nel markup di `landing.php`, nella
  tabella `LL_Studio_Mapper::text_fields()` e nello schema `LANDING_SCHEMA` di `studio.js`.

---

## Limiti noti

- Il PDF generato con un clic è **raster** (le pagine diventano immagini ad alta risoluzione):
  il testo non è selezionabile e il file pesa di più. Per un PDF vettoriale usa il pulsante
  **Stampa** e scegli "Salva come PDF", margini nessuno, grafica di sfondo attiva.
- La pubblicazione invia PDF e immagini in una sola richiesta: su hosting con
  `post_max_size` basso può fallire. Servono almeno **32M** di `post_max_size` e `upload_max_filesize`.
- La traduzione inglese usa il traduttore integrato di Chrome: su altri browser non è disponibile.
- Il salvataggio automatico locale usa `localStorage`: con molte immagini il browser può rifiutare
  di salvarle, i testi restano comunque al sicuro. La copia definitiva è quella pubblicata.

---

## FAQ

**I bottoni della landing dove puntano?** All'ancora del campo "Ancora dei bottoni"
(default `#contatti`), che è dove viene inserito il modulo.

**Posso ancora modificare una landing dalla bacheca con ACF?** Sì, i campi sono gli stessi.
Riaprendo il progetto nello Studio i valori del post hanno la precedenza, quindi le modifiche
fatte da backend non si perdono.

**Il tema sovrascrive qualche stile?** Lo Studio vive in un contenitore a schermo intero con
classi prefissate `ll-`; la landing è scopata sotto `.ll-landing`.

**Un campo lasciato vuoto?** Usa il contenuto di esempio della landing dei raccordi: nulla si rompe,
ma controlla le immagini hero prima di pubblicare.
