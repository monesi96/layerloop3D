# Agente blog Layerloop 3D

Un articolo a settimana sulla produzione industriale con la stampa 3D, secondo un calendario
semestrale, **con la tua approvazione prima di ogni pubblicazione**. È la stessa idea del blog
Smart Lab (categoria *Produzione conto terzi*), applicata a www.layerloop3d.com.

## Come funziona

```
calendario-editoriale.json      (26 articoli, ott 2026 – mar 2027, immagini già pronte)
        │
        ▼  ogni giovedì: la Routine di Claude Code esegue agente/prompt-settimanale.md
Claude scrive l'articolo della settimana dopo + immagine (Higgsfield se manca)
        │
        ▼  apre una Pull Request in bozza su GitHub  ◄── QUI CHIEDE LA TUA APPROVAZIONE
Tu leggi l'anteprima: chiedi modifiche nei commenti, oppure approvi
        │
        ▼  merge della PR (con stato: approvato)
GitHub Action "Pubblica blog Layerloop" → scripts/publish_wp.py
        │
        ▼  WordPress REST API: carica l'immagine, crea il post
Post programmato per il martedì previsto dal calendario, alle 09:00
        │
        ▼  scripts/newsletter.py (se c'è MAILCHIMP_API_KEY)
Campagna Mailchimp con la grafica Layerloop: in bozza (default) o programmata alle 10:00
```

Senza merge non viene pubblicato niente: la PR è la richiesta di approvazione.

## Contenuto della cartella

| File | Cosa è |
|---|---|
| `CALENDARIO.md` | Il calendario leggibile (titoli, keyword, target, scaletta) |
| `calendario-editoriale.json` | Lo stesso calendario per l'agente, con lo stato di ogni articolo |
| `immagini/` | 26 immagini hero 16:9 generate con Higgsfield (una per articolo); le stampanti mostrate sono solo Layerloop |
| `agente/prompt-settimanale.md` | Le istruzioni che l'agente segue ogni settimana |
| `agente/modello-articolo.md` | Il modello di un articolo (frontmatter + struttura) |
| `articoli/` | Gli articoli scritti dall'agente (uno per PR) |
| `scripts/publish_wp.py` | Pubblica su WordPress gli articoli approvati |
| `scripts/render_post.py` | Impaginazione con lo stile Layerloop: hero con immagine, font MONUMET/DIN, box "In sintesi", CTA, form Ninja Forms generale (id 9) e footer |
| `scripts/newsletter.py` | Crea la campagna Mailchimp dell'articolo (anteprima: `anteprime/newsletter-esempio.png`) |
| `scripts/build_calendar.py` | Rigenera calendario JSON/MD dopo modifiche ai temi (poi `fetch_images.py` per le immagini) |
| `scripts/build_page.py` | Rigenera la pagina visuale `calendario.html` |

## Configurazione (una sola volta)

1. **WordPress (layerloop3d.com)**
   - Crea un utente con ruolo *Editor*, per esempio `blog-agent`.
   - Da *Utenti → Profilo → Password applicazione* genera una password dedicata.
   - Verifica che l'API REST sia raggiungibile (`https://www.layerloop3d.com/wp-json/`): alcuni
     plugin di sicurezza (Wordfence, iThemes…) la bloccano o bloccano gli IP dei datacenter.
     Da questo ambiente cloud, per esempio, la connessione è stata rifiutata: va autorizzata.
   - Decidi la categoria del blog (default `produzione-industriale`, creata in automatico).
2. **GitHub → Settings → Secrets and variables → Actions**
   - Secret: `WP_URL` (`https://www.layerloop3d.com`), `WP_USER`, `WP_APP_PASSWORD`.
   - Variable (opzionale): `WP_CATEGORY` con lo slug della categoria.
3. **Newsletter Mailchimp** (facoltativa)
   - Secret: `MAILCHIMP_API_KEY` (Mailchimp → Profilo → Extras → API keys).
   - Variables: `MAILCHIMP_LIST_ID` (id del pubblico, serve se ce n'è più di uno), `MAILCHIMP_TAG`
     (invia solo a un tag), `MAILCHIMP_MODE` (`bozza` di default, oppure `programma`),
     `MAILCHIMP_REPLY_TO` (email mittente, se diversa da quella del pubblico).
   - Con `bozza` la campagna resta su Mailchimp da inviare con un clic; con `programma` parte da sola
     il giorno di uscita, un'ora dopo il post. Se l'articolo viene ripubblicato la campagna viene
     aggiornata, mai duplicata, e una campagna già inviata non viene toccata.
4. **Routine settimanale su Claude Code** (claude.ai/code → Routines, oppure chiedila a Claude):
   - repository `monesi96/layerloop3d`, ogni giovedì alle 9:00;
   - prompt: *«Esegui le istruzioni di layerloop-blog/agente/prompt-settimanale.md»*;
   - connettori: GitHub e Higgsfield (serve solo se manca un'immagine).
   - Il giovedì c'è tempo fino al martedì successivo per rivedere e approvare.

## Approvare un articolo

1. Arriva la notifica della PR `Blog: <titolo>` → apri *Files changed* e leggi il `.md`.
2. Vuoi modifiche? Scrivile nei commenti della PR: l'agente le applica.
3. Va bene? Nel file porta `stato: bozza` a `stato: approvato` (o chiedilo a Claude), segna la PR
   *Ready for review* e fai **Merge**. L'Action programma il post.
4. Per ripubblicare o correggere un articolo già uscito: *Actions → Pubblica blog Layerloop →
   Run workflow* indicando il file (il post con lo stesso slug viene aggiornato).

## Da verificare prima di partire

- La CTA punta a `https://www.layerloop3d.com/form/` ("Richiedi maggiori info"). Tutti i link restano su layerloop3d.com.
- Le immagini sono generate con AI. Dove compare una stampante è sempre una Layerloop, generata a
  partire dalle foto ufficiali di Next, XE ed Extend; in tutte le altre non compaiono stampanti.
  Controlla comunque i dettagli del prodotto (scritte, pannello, proporzioni) prima dell'approvazione.
- Articoli su Extend: il sito non riporta volume di stampa e temperature; vanno confermati i dati
  tecnici prima della pubblicazione.
