# Layerloop su Sanity — guida operativa

Il sito layerloop3d.com viene ricostruito su **Sanity** (contenuti) + **Next.js su Vercel** (sito).

```
sanity/            Studio (schema dei contenuti, strutture, anteprima)
web/               Sito Next.js: legge da Sanity, stile approvato della nuova home
scripts/migrate/   Importatori WordPress → Sanity (rilanciabili)
scripts/web/       Estrae da landing/site i frammenti HTML/CSS/JS usati dal sito
layerloop-blog/    Agente settimanale: ora pubblica su Sanity (publish_sanity.py)
landing/site/      Prototipo statico approvato (resta come riferimento visivo)
```

## Dove stanno i dati
- Progetto Sanity **Astrolancer** (`ip459cev`), dataset dedicato **`layerloop`** (pubblico in lettura).
  Il dataset `production` è dell'agenzia e non viene toccato.

## Modelli (schema)
| Tipo | A cosa serve |
|---|---|
| `siteSettings` | Menu, pulsante demo, footer, contatti |
| `page` | Pagine libere a **blocchi** (hero, testo, immagine+testo, punti chiave, card, galleria, video, FAQ, CTA, modulo, rivenditori, Academy) |
| `printer` | Extend / Next / XE: dati, scheda tecnica, tour, modello 3D, sezioni |
| `material` | I 13 materiali (filtri, colori, stampanti compatibili) |
| `sector` | Settori; `published` decide se compare il pulsante verso la pagina |
| `caseStudy` | Case study (copertina, PDF, testo) |
| `post`, `category`, `author` | Blog |

## Percorsi del sito
`/` · `/stampanti/[extend|next|xe]` · `/materiali` · `/settori/[slug]` · `/case-study[/slug]` · `/blog[/slug]` · `/[slug]` (pagine libere: `rivenditori`, `medical-division`, `layerloop-academy`…).
I vecchi URL WordPress sono rediretti in `web/next.config.ts`.

## Avvio in locale
```bash
cd sanity && npm install && npm run dev      # Studio su http://localhost:3333
cd web    && npm install && npm run dev      # Sito su http://localhost:3000
```
Su alcuni ambienti Node non usa il proxy di sistema: `NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=<bundle>`.

## Pubblicare lo Studio
`cd sanity && npx sanity login && npx sanity deploy` (host scelto: `layerloop.sanity.studio`).
Aggiungi `https://layerloop.sanity.studio` e il dominio del sito tra le origini CORS del progetto (sanity.io/manage → API → CORS).

## Vercel
- Root directory: `web`
- Variabili: `NEXT_PUBLIC_SANITY_PROJECT_ID=ip459cev`, `NEXT_PUBLIC_SANITY_DATASET=layerloop`, `NEXT_PUBLIC_SITE_URL=https://www.layerloop3d.com`
- Le pagine si rigenerano ogni 60 s (ISR). Per aggiornamento immediato: webhook Sanity → `/api/revalidate` (da aggiungere con il segreto scelto).

## Blog automatico
Il workflow `pubblica-blog-layerloop.yml` ora esegue `layerloop-blog/scripts/publish_sanity.py`. Serve il secret GitHub **`SANITY_TOKEN`** (ruolo Editor) e, facoltativo, la variabile `SITE_URL`.
Gli articoli con data futura vengono scritti con `publishedAt` futuro e compaiono sul sito da quel momento.

## Re-importare da WordPress
```bash
cd scripts/migrate
python3 01_catalog.py     # materiali, stampanti, settori, case study, impostazioni
python3 02_blog.py        # 28 articoli (gli ultimi 4 dal Markdown dell'agente)
python3 03_pages.py       # rivenditori, medical division, academy, settori (Elementor → blocchi)
```
Gli script usano `createOrReplace` con ID fissi: rilanciarli **sovrascrive le modifiche fatte nello Studio** ai documenti importati.

## Da rivedere a mano (conversione automatica)
Le pagine Elementor sono state convertite in blocchi ma vanno curate nello Studio: `rivenditori`, `medical-division` (+ EN), `layerloop-academy`, e le pagine dei quattro settori. Restano da importare le altre pagine WordPress (eventi/open house/webinar, garanzia, assistenza, servizi…).
