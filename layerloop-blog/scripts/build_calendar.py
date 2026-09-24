"""Genera calendario-editoriale.json e CALENDARIO.md dalla lista sotto."""
import json, pathlib, re, unicodedata

STYLE = ("Photorealistic editorial industrial photography, modern clean Italian manufacturing workshop, "
         "soft natural daylight, neutral palette with subtle teal accents, shallow depth of field, "
         "high detail, no text, no logos, no watermarks, 16:9")
NO_PRINTER = "No 3D printers anywhere in the frame, not even in the background."
REF = {  # foto ufficiali Layerloop caricate su Higgsfield come riferimento
    "Next": ("ef4e9dc2-c7c0-492d-a300-a115a3cad251", "https://www.layerloop3d.com/wp-content/uploads/2024/03/Next_gamma-1024x704.jpg"),
    "XE": ("2917e5be-31b3-479c-b066-a3a7f5d8a280", "https://www.layerloop3d.com/wp-content/uploads/2024/02/xE-fronte-lato-2-1024x673.png"),
    "Extend": ("764b3a3a-6a79-479c-aef3-07504d8bc01c", "https://www.layerloop3d.com/wp-content/uploads/2025/10/Layer_extend2-2048x1365.png"),
}

# Regola immagini: se compare una stampante 3D deve essere una Layerloop (foto di riferimento),
# altrimenti nessuna stampante nell'inquadratura.
# (data, pilastro, titolo, keyword, target, prodotto, scaletta, soggetto immagine, stampante in foto)
A = [
 ("2026-10-06","Produzione in serie","Stampa 3D a nastro: come produrre centinaia di pezzi senza un operatore","stampante 3D a nastro produzione in serie","Responsabili produzione PMI","Layerloop Next",
  ["Il limite della stampa 3D tradizionale: un piano, un lotto, un operatore","Come funziona la belt: il pezzo esce e la stampa successiva parte da sola","Quanti pezzi in un turno notturno: un esempio di calcolo","Quali pezzi si prestano (e quali no)","Da dove iniziare"],
  "two Layerloop Next 3D printers side by side in a bright production workshop, in the foreground a grey crate filling with many identical small black technical plastic parts produced overnight","Next"),
 ("2026-10-13","Medical Division","Plantari su misura con la stampa 3D: il flusso digitale dello studio podologico","plantari stampa 3D podologo","Podologi e studi podologici","Medical Division / Layerloop XE",
  ["Dal calco in gesso alla scansione 3D","Progettazione CAD del plantare: software e parametri","Stampa: materiali e tempi","Rifinitura e consegna al paziente","Cosa serve per partire"],
  "podiatrist in a bright modern podiatry clinic scanning a patient's bare foot with a handheld 3D scanner, a tablet on the desk shows a colourful plantar pressure map and a 3D insole model", None),
 ("2026-10-20","Grandi componenti (Extend)","Layerloop Extend: stampare componenti di grandi dimensioni per l'industria","stampante 3D grande formato industriale","Uffici tecnici e manutenzione di aziende manifatturiere","Layerloop Extend",
  ["Quando il pezzo non entra in una stampante da banco","Camera riscaldata e moduli plug-in: come funziona Extend","Materiali per componenti grandi: ABS, nylon, compositi","Esempi: carter, supporti, condotti, attrezzature","Pezzo unico o assemblato? Come decidere"],
  "a Layerloop Extend industrial 3D printer and its plug-in module standing in a large factory hall next to heavy industrial machinery, a large black 3D printed machine housing part on a pallet in the foreground","Extend"),
 ("2026-10-27","Produzione in serie","Stampa 3D o stampaggio a iniezione? Quando conviene sotto i 5.000 pezzi","stampa 3D vs stampaggio a iniezione","Imprenditori e product manager","Layerloop Next",
  ["Il costo nascosto dello stampo","Il punto di pareggio: come calcolarlo","Tempi: settimane contro giorni","Modifiche di progetto senza buttare lo stampo","Tabella decisionale"],
  "RIUSA:02", None),
 ("2026-11-03","Materiali","Come scegliere il materiale giusto per produrre in serie con la stampa 3D","materiali stampa 3D industriale","Uffici tecnici","Materiali Layerloop",
  ["Le domande da farsi: carico, temperatura, ambiente, estetica","Dal PLA ai tecnopolimeri: la mappa","LAYECO, LAYRBON, LAYFLEX: quando usarli","Errori frequenti","Richiedere un campione"],
  "RIUSA:05", None),
 ("2026-11-10","Medical Division","Suole industriali in serie: produzione controllata per calzature ortopediche","suole stampa 3D produzione in serie","Laboratori ortopedici e calzaturifici","Medical Division / Layerloop XE",
  ["Dal plantare singolo alla serie di suole","Produzione continua 24/7 e magazzino digitale","Materiali: durabilità e stabilità dimensionale","Ripetibilità tra un lotto e l'altro","Per chi ha senso"],
  "orthopedic footwear workshop, many 3D printed shoe soles in dark grey and teal flexible material neatly stacked in crates and lined up on a workbench, a craftsman holding one sole", None),
 ("2026-11-17","Grandi componenti (Extend)","Carter, coperture e protezioni per macchinari industriali stampati in 3D","carter macchine stampa 3D","Costruttori di macchine e manutenzione","Layerloop Extend",
  ["Perché i carter sono ideali per la stampa 3D","Serie brevi e personalizzazioni senza stampi","Resistenza, temperatura e finitura","Montaggio e fissaggi","Dal file al pezzo in pochi giorni"],
  "large industrial CNC machine in a factory with newly fitted black 3D printed protective guards, covers and housing panels, technician tightening a screw on a cover", None),
 ("2026-11-24","Produzione in serie","Asse inclinato a 30°: stampare senza supporti e tagliare il post-processing","stampa 3D senza supporti","Tecnici e uffici tecnici","Layerloop Next",
  ["Perché i supporti costano tempo e materiale","La geometria a 30°: cosa cambia nella stampa","Sbalzi, ponti e pezzi lunghi","Post-processing: prima e dopo","Linee guida di progettazione"],
  "long elongated black 3D printed plastic profile part with clean overhangs and no support structures, lying diagonally on a light grey table, dramatic side light showing fine layer lines", None),
 ("2026-12-01","Materiali","Carbonio + nylon: quando un pezzo stampato può sostituire l'alluminio","nylon carbonio stampa 3D","Progettisti meccanici","LAYRBON",
  ["Perché il nylon caricato carbonio","Rigidezza, peso, resistenza: numeri a confronto","Staffe, supporti e attrezzature","Limiti da conoscere","Caso tipo: staffa riprogettata"],
  "RIUSA:06", None),
 ("2026-12-09","Medical Division","Produrre i plantari in studio: quanto conviene al podologo rispetto al laboratorio esterno","produzione plantari in studio","Podologi titolari di studio","Layerloop XE",
  ["Costi e tempi del laboratorio esterno","Costo per plantare prodotto in-house: un esempio","Tempi di consegna e soddisfazione del paziente","Controllo sul risultato e modifiche rapide","Quando il conto torna"],
  "a Layerloop XE 3D printer on a counter in a modern podiatry clinic, a smiling podiatrist holding a freshly printed custom insole next to it","XE"),
 ("2026-12-15","Grandi componenti (Extend)","Camera riscaldata: perché conta per tecnopolimeri e pezzi di grandi dimensioni","stampante 3D camera riscaldata","Tecnici di produzione","Layerloop Extend",
  ["Ritiro, warping e delaminazione","Cosa fa la camera riscaldata","Materiali che la richiedono: ABS, nylon, compositi","Tolleranze ripetibili su pezzi grandi","Checklist di scelta"],
  "close-up of a Layerloop Extend industrial 3D printer, warm orange light glowing through its front window where a large technical polymer part is being printed, factory softly blurred behind","Extend"),
 ("2026-12-22","Processo e strategia","5 tendenze della produzione additiva da tenere d'occhio nel 2027","tendenze stampa 3D 2027","Imprenditori e manager","Tutta la gamma",
  ["Produzione continua e automatizzata","Componenti grandi stampati in casa","Dispositivi medicali su misura prodotti in studio","Reshoring e filiere corte","Competenze interne"],
  "a row of Layerloop Next 3D printers running in a bright modern small factory at dusk, warm interior light, cinematic wide shot","Next"),
 ("2026-12-29","Produzione in serie","Quanto costa davvero un pezzo stampato in 3D: guida al costo per pezzo","costo stampa 3D per pezzo","Acquisti e controllo di gestione","Layerloop Next",
  ["Le voci di costo: materiale, macchina, energia, manodopera","Il peso della presidiatura","Ammortamento della stampante","Foglio di calcolo di esempio","Come ridurre il costo per pezzo"],
  "RIUSA:13", None),
 ("2027-01-05","Medical Division","Materiali per plantari e suole: rigidità, comfort e durata","materiali plantari stampa 3D","Podologi e tecnici ortopedici","Layinsole, LAYFLEX, LayRigidCF",
  ["Cosa chiede un plantare a un materiale","Layinsole, LAYFLEX, LayRigidCF: caratteristiche e usi","Zone rigide e zone morbide nello stesso plantare","Certificazioni e schede tecniche","Come scegliere caso per caso"],
  "several custom 3D printed orthotic insoles in different soft and rigid materials and colours arranged on a clean white clinic table, a tablet showing a foot scan in the background", None),
 ("2027-01-12","Settori","Automotive: dime, attrezzature e ricambi fuori produzione stampati in 3D","stampa 3D automotive","Officine, carrozzerie, fornitori automotive","Layerloop Next / LAYRBON",
  ["Attrezzature di linea in pochi giorni","Ricambi per auto d'epoca e fuori catalogo","Materiali per l'abitacolo e il vano motore","Piccole serie per allestitori","Esempi concreti"],
  "RIUSA:15", None),
 ("2027-01-19","Grandi componenti (Extend)","Ricambi per grandi macchinari: ridurre il fermo macchina con la stampa 3D","ricambi macchinari stampa 3D","Responsabili manutenzione","Layerloop Extend",
  ["Quanto costa un'ora di fermo","Ricambi introvabili o con tempi lunghi","Magazzino digitale: il file al posto dello scaffale","Materiali per ricambi funzionali","Come organizzare il servizio"],
  "maintenance technician fitting a large black 3D printed replacement part into a big industrial packaging machine on a factory floor, open machine panel, work gloves", None),
 ("2027-01-26","Materiali","TPU e materiali flessibili: guarnizioni, protezioni e parti morbide in serie","stampa 3D TPU flessibile","Uffici tecnici e produzione","LAYFLEX / Layerloop XE",
  ["Cosa rende difficile stampare il flessibile","Durezza Shore e applicazioni","Guarnizioni, paracolpi, grip","Stampa in serie di parti flessibili","Consigli di progetto"],
  "a hand bending a flexible translucent TPU 3D printed part over a workbench scattered with flexible gaskets, O-rings and bumpers in black and teal", None),
 ("2027-02-02","Settori","Serramenti: accessori e componenti su misura per chi produce infissi","stampa 3D serramenti","Produttori di serramenti","Layerloop Next",
  ["Tappi, terminali, distanziali: i pezzi che mancano sempre","Profili lunghi grazie all'asse inclinato","Colori e resistenza UV","Serie brevi per commesse speciali","Come iniziare"],
  "RIUSA:16", None),
 ("2027-02-09","Medical Division","Processo controllato: ripetibilità e qualità nei dispositivi podologici su misura","processo controllato plantari 3D","Podologi, cliniche, ortopedie","Medical Division",
  ["Perché la ripetibilità conta anche nel su misura","Parametri di stampa validati","Monitoraggio dei lavori e riduzione degli errori","Documentare il processo","Checklist per lo studio"],
  "podiatric lab technician in a white coat checking the thickness of a 3D printed insole with a digital caliper, a batch of identical insoles lined up on the table and a printed checklist", None),
 ("2027-02-16","Processo e strategia","Dime, maschere e calibri stampati in 3D: il ROI si misura in settimane","attrezzature produzione stampa 3D","Responsabili di stabilimento","Layerloop Next / LAYRBON",
  ["Perché le attrezzature sono il caso d'uso numero uno","Esempi: dime di foratura, maschere di montaggio, go/no-go","Costi e tempi a confronto con il fresato","Ergonomia e peso","Calcolo del ROI"],
  "RIUSA:20", None),
 ("2027-02-23","Grandi componenti (Extend)","Condotti, canalizzazioni e guide per linee di produzione stampati in 3D","condotti aria stampa 3D","Ingegneria di produzione","Layerloop Extend",
  ["Geometrie complesse senza saldature","Condotti d'aria, aspirazioni, guide e scivoli","Materiali: temperatura e resistenza chimica","Modifiche di linea senza fermo lungo","Esempio di progetto"],
  "production line with large black 3D printed curved air ducts, suction hoods and product guide rails mounted on conveyor machinery in a clean factory", None),
 ("2027-03-02","Processo e strategia","Design for Additive Manufacturing: 7 regole per pezzi da produrre in serie","design for additive manufacturing","Progettisti","Layerloop Academy",
  ["Pensare al processo, non solo al pezzo","Spessori, raccordi, tolleranze","Orientamento e asse inclinato","Consolidare assiemi in un solo pezzo","Checklist finale"],
  "engineer at a CAD workstation designing a lattice-optimized mechanical part on screen, the physical grey 3D printed version of the same part on the desk next to the monitor, office with plants", None),
 ("2027-03-09","Settori","Nautica: componenti stampati in 3D che resistono a salsedine e UV","stampa 3D nautica","Cantieri e accessoristi nautici","Materiali tecnici Layerloop",
  ["Ambiente marino: nemico dei materiali","Quali polimeri scegliere","Supporti, clip, passacavi, ricambi di bordo","Ricambi introvabili per barche datate","Test e verifiche"],
  "white 3D printed marine fittings, fairleads and cable clips mounted on a sailboat deck, open sea and sunlight in the background, water droplets on the parts", None),
 ("2027-03-16","Medical Division","Podologi e stampa 3D: formazione e avvio con la Medical Division","corso stampa 3D podologi","Podologi","Layerloop XE / Layerloop Academy",
  ["Le competenze che servono in studio","Il percorso: scansione, CAD, stampa, rifinitura","Assistenza e sedi sul territorio","I primi 30 giorni","Domande frequenti"],
  "small group of podiatrists in a bright training room gathered around a Layerloop XE 3D printer while an instructor shows a printed insole","XE"),
 ("2027-03-23","Processo e strategia","Controllo qualità nella produzione additiva: ripetibilità dal primo all'ultimo pezzo","controllo qualità stampa 3D","Responsabili qualità","Tutta la gamma",
  ["Cosa può variare nel lotto","Parametri e profili bloccati","Misure a campione e SPC","Materiale: umidità e stoccaggio","Documentare la qualità"],
  "RIUSA:19", None),
 ("2027-03-30","Processo e strategia","Internalizzare la stampa 3D o affidarsi al conto terzi? Guida alla scelta","stampa 3D in azienda o conto terzi","Imprenditori","Tutta la gamma",
  ["Quando conviene il service","Quando conviene internalizzare","Volumi, riservatezza, tempi","Il modello ibrido","Domande da farsi prima di decidere"],
  "two business people shaking hands in a small modern manufacturing company next to a Layerloop Next 3D printer, finished parts on a workbench","Next"),
]

def slug(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii","ignore").decode().lower()
    s = re.sub(r"[^a-z0-9]+","-",s).strip("-")
    return s[:70].rstrip("-")

out = []
for i,(d,p,t,k,tg,pr,sc,img,printer) in enumerate(A,1):
    f = f"immagini/{i:02d}-{slug(t)[:40]}.jpg"
    if img.startswith("RIUSA:"):
        im = dict(serve=True, prompt=None, riusa=img[6:], file=f, job_id=None)
    elif printer:
        im = dict(serve=True, file=f, job_id=None, riferimento=REF[printer][1], media_id_riferimento=REF[printer][0],
                  prompt=f"{img}. The 3D printer must look exactly like the Layerloop {printer} in the reference image "
                         f"(same shape, colours, proportions and details, with its LAYERLOOP logo as in the reference); no other 3D printers in the scene. "
                         f"{STYLE.replace('no text, no logos', 'no other text or logos')}")
    else:
        im = dict(serve=True, file=f, job_id=None, prompt=f"{img}. {NO_PRINTER} {STYLE}")
    out.append(dict(n=i,data=d,pilastro=p,titolo=t,slug=slug(t),keyword=k,target=tg,prodotto_collegato=pr,
        scaletta=sc,cta="Richiedi informazioni / prova di stampa gratuita",immagine=im,stato="pianificato"))
base = pathlib.Path(__file__).resolve().parent.parent
# conserva job Higgsfield e stato degli articoli già presenti (stesso file immagine / stesso slug)
prev_path = base/"calendario-editoriale.json"
prev = json.loads(prev_path.read_text()) if prev_path.exists() else []
by_file = {p["immagine"]["file"]: p["immagine"] for p in prev}
by_slug = {p["slug"]: p for p in prev}
for a in out:
    old = by_file.get(a["immagine"]["file"])
    if old:
        for k in ("job_id", "url_higgsfield"):
            if old.get(k): a["immagine"][k] = old[k]
    if a["slug"] in by_slug: a["stato"] = by_slug[a["slug"]]["stato"]
(base/"calendario-editoriale.json").write_text(json.dumps(out,ensure_ascii=False,indent=2)+"\n")

md = ["# Calendario editoriale Layerloop 3D — ottobre 2026 / marzo 2027","",
      "Un articolo a settimana, il martedì (9 dicembre di mercoledì per la festa dell'Immacolata). Stato: `pianificato` → `bozza` → `approvato` → `pubblicato`.",""]
for a in out:
    md.append(f"## {a['n']:02d} · {a['data']} — {a['titolo']}")
    md.append(f"- **Pilastro:** {a['pilastro']} · **Keyword:** {a['keyword']} · **Target:** {a['target']}")
    md.append(f"- **Prodotto collegato:** {a['prodotto_collegato']} · **CTA:** {a['cta']}")
    md.append("- **Scaletta:** " + " / ".join(a["scaletta"]))
    md.append(f"- **Immagine:** `{a['immagine']['file']}`")
    md.append("")
(base/"CALENDARIO.md").write_text("\n".join(md))
print(len(out))
