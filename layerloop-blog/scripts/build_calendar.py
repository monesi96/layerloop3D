"""Genera calendario-editoriale.json e CALENDARIO.md dalla lista sotto."""
import json, pathlib, re, unicodedata

STYLE = ("Photorealistic editorial industrial photography, modern clean Italian manufacturing workshop, "
         "soft natural daylight, neutral palette with subtle teal accents, shallow depth of field, "
         "high detail, no text, no logos, no watermarks, 16:9")

# (data, pilastro, titolo, keyword, target, prodotto, scaletta, soggetto immagine)
A = [
 ("2026-10-06","Produzione in serie","Stampa 3D a nastro: come produrre centinaia di pezzi senza un operatore","stampante 3D a nastro produzione in serie","Responsabili produzione PMI","Layerloop Next",
  ["Il limite della stampa 3D tradizionale: un piano, un lotto, un operatore","Come funziona la belt: il pezzo esce e la stampa successiva parte da sola","Quanti pezzi in un turno notturno: un esempio di calcolo","Quali pezzi si prestano (e quali no)","Da dove iniziare"],
  "rows of identical small black technical plastic parts moving on a continuous conveyor belt coming out of a compact 3D printer, close-up on the parts, printer only partially visible and out of focus"),
 ("2026-10-13","Produzione in serie","Stampa 3D o stampaggio a iniezione? Quando conviene sotto i 5.000 pezzi","stampa 3D vs stampaggio a iniezione","Imprenditori e product manager","Layerloop Next",
  ["Il costo nascosto dello stampo","Il punto di pareggio: come calcolarlo","Tempi: settimane contro giorni","Modifiche di progetto senza buttare lo stampo","Tabella decisionale"],
  "side by side on a workbench: a heavy steel injection mould on the left and a neat batch of 3D printed plastic parts on the right, engineer's hands with a caliper"),
 ("2026-10-20","Produzione in serie","Asse inclinato a 30°: stampare senza supporti e tagliare il post-processing","stampa 3D senza supporti","Tecnici e uffici tecnici","Layerloop Next",
  ["Perché i supporti costano tempo e materiale","La geometria a 30°: cosa cambia nella stampa","Sbalzi, ponti e pezzi lunghi","Post-processing: prima e dopo","Linee guida di progettazione"],
  "long elongated 3D printed plastic profile part without any support structures, lying diagonally on a clean surface, dramatic side light showing fine layer lines"),
 ("2026-10-27","Produzione in serie","Magazzino digitale: produrre on demand e ridurre le scorte con la stampa 3D","magazzino digitale ricambi stampa 3D","Responsabili logistica e acquisti","Layerloop Next",
  ["Il costo del magazzino fermo","Cos'è un magazzino digitale","Ricambi fuori produzione e code lunghe","Organizzare file, versioni e materiali","Just-in-time in pratica"],
  "industrial warehouse shelf with mostly empty bins and a tablet showing a 3D CAD model library, in the foreground a few freshly 3D printed spare parts in a small bin"),
 ("2026-11-03","Materiali","Come scegliere il materiale giusto per produrre in serie con la stampa 3D","materiali stampa 3D industriale","Uffici tecnici","Materiali Layerloop",
  ["Le domande da farsi: carico, temperatura, ambiente, estetica","Dal PLA ai tecnopolimeri: la mappa","LAYECO, LAYRBON, LAYFLEX: quando usarli","Errori frequenti","Richiedere un campione"],
  "neat arrangement of 3D printer filament spools in different colours and several sample parts printed in different materials on a light grey table, overhead view"),
 ("2026-11-10","Materiali","Carbonio + nylon: quando un pezzo stampato può sostituire l'alluminio","nylon carbonio stampa 3D","Progettisti meccanici","LAYRBON",
  ["Perché il nylon caricato carbonio","Rigidezza, peso, resistenza: numeri a confronto","Staffe, supporti e attrezzature","Limiti da conoscere","Caso tipo: staffa riprogettata"],
  "matte black carbon fiber reinforced nylon 3D printed mechanical bracket next to a machined aluminium bracket of the same shape, macro detail of surface texture"),
 ("2026-11-17","Materiali","TPU e materiali flessibili: guarnizioni, protezioni e parti morbide in serie","stampa 3D TPU flessibile","Uffici tecnici e produzione","LAYFLEX / Layerloop XE",
  ["Cosa rende difficile stampare il flessibile","Durezza Shore e applicazioni","Guarnizioni, paracolpi, grip","Stampa in serie di parti flessibili","Consigli di progetto"],
  "a hand bending a flexible translucent TPU 3D printed part, several flexible gaskets and bumpers on a workbench in the background"),
 ("2026-11-24","Materiali","Camera riscaldata: perché conta per tecnopolimeri e precisione dimensionale","stampante 3D camera riscaldata","Tecnici di produzione","Layerloop Extend",
  ["Ritiro, warping e delaminazione","Cosa fa la camera riscaldata","Materiali che la richiedono","Tolleranze ripetibili sul lotto","Checklist di scelta"],
  "inside view of a warm heated 3D printer chamber with a subtle orange glow, a technical polymer part being printed, shallow depth of field"),
 ("2026-12-01","Tracciabilità e 4.0","Tag RFID e NFC integrati nel pezzo: la tracciabilità nasce in stampa","RFID NFC integrati stampa 3D","Direttori operations e qualità","Testina RFID/NFC Layerloop",
  ["Il problema delle etichette applicate dopo","Il tag annegato nel pezzo: come funziona","Applicazioni: asset, ricambi, attrezzi","Lettura, scrittura e gestionale","Da dove partire"],
  "a smartphone held near a small 3D printed plastic component, a cutaway of the part revealing an embedded NFC tag inside, clean studio light"),
 ("2026-12-09","Tracciabilità e 4.0","Ricambi originali e anti-contraffazione: il valore di un NFC stampato dentro","anticontraffazione ricambi NFC","Brand manager e aftersales","Testina RFID/NFC Layerloop",
  ["Il costo della contraffazione nei ricambi","Autenticare un pezzo con lo smartphone","Garanzia, manutenzione, storico","Integrare il tag senza rallentare la produzione","Esempi di applicazione"],
  "technician in a workshop scanning a 3D printed spare part with a smartphone, screen showing a green verified check icon, industrial machinery softly blurred"),
 ("2026-12-15","Tracciabilità e 4.0","Incentivi e stampa 3D industriale: come valutare Transizione 5.0 e agevolazioni","incentivi stampante 3D industria 4.0","Imprenditori e CFO","Tutta la gamma",
  ["Perché una stampante 3D può rientrare negli investimenti 4.0","Requisiti tipici: interconnessione e integrazione","Documentazione da preparare","Con chi confrontarsi (commercialista, perizia)","Nota: verificare sempre la normativa vigente"],
  "business owner and consultant reviewing documents and a laptop at a desk in a modern factory office, a compact industrial 3D printer visible through the glass wall"),
 ("2026-12-22","Tracciabilità e 4.0","5 tendenze della produzione additiva da tenere d'occhio nel 2027","tendenze stampa 3D 2027","Imprenditori e manager","Tutta la gamma",
  ["Produzione continua e automatizzata","Materiali tecnici più accessibili","Pezzi intelligenti con elettronica integrata","Reshoring e filiere corte","Competenze interne"],
  "wide shot of a bright modern small factory floor at dusk with several compact 3D printers running in a row, warm interior light, cinematic"),
 ("2026-12-29","Produzione in serie","Quanto costa davvero un pezzo stampato in 3D: guida al costo per pezzo","costo stampa 3D per pezzo","Acquisti e controllo di gestione","Layerloop Next",
  ["Le voci di costo: materiale, macchina, energia, manodopera","Il peso della presidiatura","Ammortamento della stampante","Foglio di calcolo di esempio","Come ridurre il costo per pezzo"],
  "close-up of a calculator, printed spreadsheet and a small 3D printed part with a digital scale showing weight, on a wooden desk, soft light"),
 ("2027-01-05","Settori","Podologia e plantari su misura: produrre ortesi personalizzate in serie","plantari stampa 3D","Podologi e laboratori ortopedici","Medical Division / Layerloop XE",
  ["Dal calco al file: il flusso digitale","Materiali flessibili per il comfort","Più plantari in una notte","Qualità e ripetibilità","Formazione e avvio"],
  "several custom 3D printed orthotic insoles in soft materials on a clean clinic table, a foot scan visible on a tablet screen in the background"),
 ("2027-01-12","Settori","Automotive: dime, attrezzature e ricambi fuori produzione stampati in 3D","stampa 3D automotive","Officine, carrozzerie, fornitori automotive","Layerloop Next / LAYRBON",
  ["Attrezzature di linea in pochi giorni","Ricambi per auto d'epoca e fuori catalogo","Materiali per l'abitacolo e il vano motore","Piccole serie per allestitori","Esempi concreti"],
  "automotive workshop, mechanic fitting a black 3D printed replacement part into a classic car dashboard, detailed hands, soft garage lighting"),
 ("2027-01-19","Settori","Serramenti: accessori e componenti su misura per chi produce infissi","stampa 3D serramenti","Produttori di serramenti","Layerloop Next",
  ["Tappi, terminali, distanziali: i pezzi che mancano sempre","Profili lunghi grazie all'asse inclinato","Colori e resistenza UV","Serie brevi per commesse speciali","Come iniziare"],
  "window frame manufacturing workshop, close-up of aluminium window profile corner with small grey 3D printed end caps and spacers, sawdust-free clean bench"),
 ("2027-01-26","Settori","Nautica: componenti stampati in 3D che resistono a salsedine e UV","stampa 3D nautica","Cantieri e accessoristi nautici","Materiali tecnici Layerloop",
  ["Ambiente marino: nemico dei materiali","Quali polimeri scegliere","Supporti, clip, passacavi, ricambi di bordo","Ricambi introvabili per barche datate","Test e verifiche"],
  "white 3D printed marine fittings and cable clips mounted on a sailboat deck, sea and sunlight in the background, water droplets on the parts"),
 ("2027-02-02","Processo e qualità","Design for Additive Manufacturing: 7 regole per pezzi da produrre in serie","design for additive manufacturing","Progettisti","Layerloop Academy",
  ["Pensare al processo, non solo al pezzo","Spessori, raccordi, tolleranze","Orientamento e asse inclinato","Consolidare assiemi in un solo pezzo","Checklist finale"],
  "engineer at a CAD workstation designing a lattice-optimized mechanical part, the physical 3D printed version of the same part on the desk next to the monitor"),
 ("2027-02-09","Processo e qualità","Controllo qualità nella produzione additiva: ripetibilità dal primo all'ultimo pezzo","controllo qualità stampa 3D","Responsabili qualità","Tutta la gamma",
  ["Cosa può variare nel lotto","Parametri e profili bloccati","Misure a campione e SPC","Materiale: umidità e stoccaggio","Documentare la qualità"],
  "quality inspector measuring a 3D printed part with a digital caliper, a batch of identical parts lined up on a granite inspection plate"),
 ("2027-02-16","Processo e qualità","Dime, maschere e calibri stampati in 3D: il ROI si misura in settimane","attrezzature produzione stampa 3D","Responsabili di stabilimento","Layerloop Next / LAYRBON",
  ["Perché le attrezzature sono il caso d'uso numero uno","Esempi: dime di foratura, maschere di montaggio, go/no-go","Costi e tempi a confronto con il fresato","Ergonomia e peso","Calcolo del ROI"],
  "assembly line worker using a bright teal 3D printed assembly jig to position components, factory environment, focus on the jig"),
 ("2027-02-23","Processo e qualità","Internalizzare la stampa 3D o affidarsi al conto terzi? Guida alla scelta","stampa 3D in azienda o conto terzi","Imprenditori","Tutta la gamma",
  ["Quando conviene il service","Quando conviene internalizzare","Volumi, riservatezza, tempi","Il modello ibrido","Domande da farsi prima di decidere"],
  "two people shaking hands in a small modern manufacturing company, a compact 3D printer and parts on a workbench between them"),
 ("2027-03-02","Business e crescita","Formare il personale sulla stampa 3D: come accelerare l'adozione in azienda","corso stampa 3D aziende","HR e responsabili produzione","Layerloop Academy",
  ["Perché la tecnologia da sola non basta","Le competenze che servono","Percorso tipo: dal primo pezzo alla serie","Chi coinvolgere","Misurare i risultati"],
  "small group of technicians in a training room gathered around a 3D printer while an instructor explains, bright and friendly atmosphere"),
 ("2027-03-09","Business e crescita","Farm di stampanti o stampante a nastro? Come scalare la capacità produttiva","scalare produzione stampa 3D","Responsabili produzione","Layerloop Next",
  ["Il modello farm: pro e contro","Il modello continuo a nastro","Spazio, energia, persone","Uno scenario a confronto","Come scegliere"],
  "compact industrial 3D printer in the foreground with a batch of finished parts in a tray, and in the blurred background a large room full of many small desktop 3D printers"),
 ("2027-03-16","Business e crescita","Produzione locale e sostenibile: meno scarti e trasporti con la stampa 3D","stampa 3D sostenibilità reshoring","Imprenditori e ESG manager","LAYECO",
  ["Additivo vs sottrattivo: lo scarto","Filiera corta e reshoring","Materiali di origine vegetale","Produrre solo ciò che serve","Comunicare la sostenibilità"],
  "natural-coloured PLA 3D printed parts on a wooden table next to green plant leaves, soft daylight, calm sustainable mood"),
 ("2027-03-23","Business e crescita","Personalizzazione di massa: produrre in serie pezzi tutti diversi","personalizzazione di massa stampa 3D","Marketing e prodotto","Layerloop Next",
  ["Dalla serie uguale alla serie personalizzata","Nomi, codici, varianti in automatico","Esempi: gadget, targhette, ausili","Flusso file automatizzato","Nuovi modelli di business"],
  "a row of 3D printed product tags and small objects each with a different personalised shape and engraving, arranged neatly in a line, overhead studio shot"),
 ("2027-03-30","Business e crescita","Dal prototipo alla pre-serie: validare un prodotto prima di investire nello stampo","pre-serie stampa 3D","Startup e product manager","Tutta la gamma",
  ["Prototipo, pre-serie, serie: le differenze","Test di mercato con 100 pezzi veri","Iterare il design in giorni","Quando passare allo stampo","Riepilogo del percorso"],
  "product development table with an evolution of 3D printed prototypes from rough to finished, arranged left to right, final boxed product at the end"),
]

def slug(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii","ignore").decode().lower()
    s = re.sub(r"[^a-z0-9]+","-",s).strip("-")
    return s[:70].rstrip("-")

out = []
for i,(d,p,t,k,tg,pr,sc,img) in enumerate(A,1):
    out.append(dict(n=i,data=d,pilastro=p,titolo=t,slug=slug(t),keyword=k,target=tg,prodotto_collegato=pr,
        scaletta=sc,cta="Richiedi informazioni / prova di stampa gratuita",
        immagine=dict(serve=True,prompt=f"{img}. {STYLE}",file=f"immagini/{i:02d}-{slug(t)[:40]}.jpg",job_id=None),
        stato="pianificato"))
base = pathlib.Path(__file__).resolve().parent.parent
(base/"calendario-editoriale.json").write_text(json.dumps(out,ensure_ascii=False,indent=2)+"\n")

md = ["# Calendario editoriale Layerloop 3D — ottobre 2026 / marzo 2027","",
      "Un articolo a settimana, il martedì (9 dicembre di mercoledì per la festa dell'Immacolata). Stato: `pianificato` → `bozza` → `approvato` → `pubblicato`.",""]
cur=None
for a in out:
    if a["pilastro"]!=cur and False: pass
    md.append(f"## {a['n']:02d} · {a['data']} — {a['titolo']}")
    md.append(f"- **Pilastro:** {a['pilastro']} · **Keyword:** {a['keyword']} · **Target:** {a['target']}")
    md.append(f"- **Prodotto collegato:** {a['prodotto_collegato']} · **CTA:** {a['cta']}")
    md.append("- **Scaletta:** " + " / ".join(a["scaletta"]))
    md.append(f"- **Immagine:** `{a['immagine']['file']}`")
    md.append("")
(base/"CALENDARIO.md").write_text("\n".join(md))
print(len(out))
