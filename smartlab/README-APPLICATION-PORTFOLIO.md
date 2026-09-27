# Application Portfolio — Settori e shortcode Case Study

I case study restano **normali articoli** nella categoria `case-studies`.
Sopra ci abbiamo messo una tassonomia **Settore** e uno shortcode da
incollare nelle pagine settore costruite in Elementor.

## Dopo aver caricato il tema: un passaggio obbligatorio

Vai su **Impostazioni → Permalink** e premi *Salva* (senza cambiare nulla).
Serve a registrare gli indirizzi `/settore/nautica/`. Va fatto **una volta sola**.

## Assegnare un settore a un case study

Nell'editor dell'articolo compare il riquadro **Settori**, accanto a Categorie.
È a caselle da spuntare (non tag liberi) proprio per evitare doppioni tipo
"nautica" / "Nautico" / "nautical". Il primo settore lo crei da lì, o da
**Articoli → Settori**.

Un case study può stare in più settori.

## Lo shortcode

Nella pagina Elementor del settore, inserisci un widget **Shortcode**:

```
[case_study settore="nautica"]
```

### Attributi

| Attributo | Default | A cosa serve |
|---|---|---|
| `settore` | — | Slug del settore. Se lo ometti su `/settore/nautica/` viene dedotto da solo; su una pagina normale mostra gli ultimi case study di tutti i settori. |
| `numero` | `6` | Quanti case study mostrare. |
| `layout` | `griglia` | `griglia` oppure `carosello` (con le frecce). |
| `titolo` | automatico | Sovrascrive il titolo. Senza, scrive "Case study — Nautica". |
| `intestazione` | `si` | `no` toglie del tutto titolo e frecce. |
| `categoria` | `case-studies` | Da cambiare solo se un giorno spostiamo i case study altrove. |

### Esempi

```
[case_study settore="nautica" layout="carosello" numero="8"]
[case_study settore="podologia" titolo="Applicazioni in podologia e ortopedia"]
[case_study settore="nautica" intestazione="no" numero="3"]
```

## Il blocco sparisce se non c'è niente

Se per quel settore non esiste ancora nessun case study pubblicato, lo
shortcode **non stampa nulla**: niente titolo, niente riquadro vuoto, niente
spazio bianco. Puoi quindi mettere lo shortcode in tutte le pagine settore fin
da subito e i blocchi si accendono da soli man mano che pubblichiamo.

## Grafica

Lo shortcode si porta dietro da solo font, colori e card del blog, quindi le
card sono identiche a quelle del blog anche dentro una pagina Elementor. Non
serve configurare niente in Elementor.

Il carosello è a scorrimento con aggancio (scroll-snap): funziona con swipe da
telefono e con le frecce da desktop, e non dipende da nessuna libreria esterna.
Su mobile le frecce spariscono e resta lo swipe.

---

# Foto e video della stampa nel case study

Nell'editor dell'articolo, sotto il testo, c'è il riquadro **Foto e video della
stampa**. Sono due blocchi indipendenti che compaiono in fondo al case study,
prima degli articoli correlati.

**Se lasci un campo vuoto, quel blocco non compare proprio**: niente titolo,
niente riquadro vuoto, niente spazio bianco. Vale per la galleria e per il video,
separatamente: puoi mettere solo le foto, solo il video, tutti e due o niente.

## Carosello foto

Premi **Scegli le foto** e selezionane quante vuoi dalla libreria media
(tieni premuto per sceglierne più di una). L'ordine è quello in cui le vedi
nel riquadro; la × su ogni miniatura ne toglie una.

- Con **più foto** esce un carosello con le frecce, uguale a quello dei case study.
- Con **una foto sola** esce l'immagine a larghezza piena, senza frecce.
- Cliccando una foto si apre a schermo intero, con le frecce e i tasti ← → della
  tastiera; si chiude con Esc o cliccando fuori.
- La **didascalia** che scrivi nella libreria media compare sotto la foto.
- Il campo **Titolo del blocco** è facoltativo: senza, scrive "Le nostre stampe".

## Video della stampa

Due modi:

1. **Incolla il link** di YouTube o Vimeo nel campo.
2. **Carica un video** (mp4) con il pulsante: il campo si riempie da solo.

Per i video caricati puoi scegliere un'**immagine di copertina** — è quella che
si vede prima di premere play. Per YouTube e Vimeo non serve: la copertina la
mettono loro.

Se il link non è riproducibile (un indirizzo qualsiasi, un video cancellato), il
blocco sparisce invece di lasciare un rettangolo nero.

Anche qui il **Titolo del blocco** è facoltativo: senza, scrive
"Il video della stampa".

## Nota sul peso della pagina

Le foto sono caricate a scorrimento (`loading="lazy"`), quindi metterne otto non
rallenta l'apertura del case study. Per i video caricati sul sito conviene
comunque restare sotto i ~20 MB: sopra, meglio YouTube.
