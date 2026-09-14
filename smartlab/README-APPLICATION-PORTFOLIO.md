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
