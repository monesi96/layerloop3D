#!/usr/bin/env python3
"""Genera il calendario editoriale in PDF da girare al cliente (con le immagini).

Uso:
    python build_pdf.py [cartella_asset]

cartella_asset (opzionale) contiene logo.png e i font del sito (MonumentExtended-Regular.ttf,
D-DIN.ttf, DIN-Bold.ttf, DIN-Light.ttf); se manca si usano gli URL di layerloop3d.com.
Scrive layerloop-blog/calendario-editoriale.html e, con Playwright (Node), il PDF A4.
"""
import base64
import datetime as dt
import html
import io
import json
import pathlib
import subprocess
import sys

from PIL import Image

BASE = pathlib.Path(__file__).resolve().parent.parent
SITE = "https://www.layerloop3d.com/wp-content/uploads/"
ASSETS = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else None
MESI = "gennaio febbraio marzo aprile maggio giugno luglio agosto settembre ottobre novembre dicembre".split()
GG = "lunedì martedì mercoledì giovedì venerdì sabato domenica".split()
COL = {"Produzione in serie": "#1E9C94", "Medical Division": "#2557ff", "Grandi componenti (Extend)": "#e0672b",
       "Materiali": "#8a5cf6", "Settori": "#c79a1b", "Processo e strategia": "#0c0c0c"}
e = html.escape


def asset(name, remote):
    if ASSETS and (ASSETS / name).exists():
        return (ASSETS / name).resolve().as_uri()
    return SITE + remote


def img_data(path, width=1100):
    im = Image.open(path).convert("RGB")
    im.thumbnail((width, width))
    buf = io.BytesIO()
    im.save(buf, "JPEG", quality=80, optimize=True)
    return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()


def logo(white=False):
    src = ASSETS / "logo.png" if ASSETS else None
    if not src or not src.exists():
        return SITE + "2021/06/logo-layerloop-vector.png"
    im = Image.open(src).convert("RGBA")
    if white:
        px = [(255, 255, 255, a) for (_, _, _, a) in im.getdata()]
        im.putdata(px)
    buf = io.BytesIO()
    im.save(buf, "PNG")
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()


cal = json.loads((BASE / "calendario-editoriale.json").read_text(encoding="utf-8"))
d0, d1 = dt.date.fromisoformat(cal[0]["data"]), dt.date.fromisoformat(cal[-1]["data"])
conteggio = {}
for a in cal:
    conteggio[a["pilastro"]] = conteggio.get(a["pilastro"], 0) + 1


def stato(a):
    return {"approvato": "Pubblicato", "pubblicato": "Pubblicato", "bozza": "In revisione"}.get(a["stato"], "Pianificato")


def data_it(d):
    return f"{GG[d.weekday()]} {d.day} {MESI[d.month - 1]} {d.year}"


righe = "".join(
    f'<tr><td class="n">{a["n"]:02d}</td><td class="dt">{dt.date.fromisoformat(a["data"]).strftime("%d/%m/%y")}</td>'
    f'<td class="pl"><i style="background:{COL[a["pilastro"]]}"></i>{e(a["pilastro"].replace(" (Extend)", ""))}</td><td class="t">{e(a["titolo"])}</td>'
    f'<td class="st">{stato(a)}</td></tr>'
    for a in cal
)
mosaico = "".join(
    f'<div class="mo"><img src="{img_data(BASE / a["immagine"]["file"], 360)}" alt=""><span>{a["n"]:02d}</span></div>' for a in cal
)
legenda = "".join(
    f'<div class="lg"><i style="background:{COL[p]}"></i><b>{e(p)}</b><span>{n} articoli</span></div>'
    for p, n in conteggio.items()
)

schede = []
for i in range(0, len(cal), 2):
    cards = []
    for a in cal[i:i + 2]:
        d = dt.date.fromisoformat(a["data"])
        sc = "".join(f"<li>{e(s)}</li>" for s in a["scaletta"])
        cards.append(f'''<article class="card">
  <div class="ph"><img src="{img_data(BASE / a["immagine"]["file"])}" alt=""><span class="num">{a["n"]:02d}</span></div>
  <div class="bd">
    <div class="meta"><span class="pill" style="background:{COL[a["pilastro"]]}">{e(a["pilastro"])}</span>
      <span class="date">{data_it(d)}</span><span class="st st-{stato(a)[:4].lower()}">{stato(a)}</span></div>
    <h3>{e(a["titolo"])}</h3>
    <div class="cols">
      <dl><dt>Keyword SEO</dt><dd>{e(a["keyword"])}</dd><dt>Target</dt><dd>{e(a["target"])}</dd>
      <dt>Prodotto collegato</dt><dd>{e(a["prodotto_collegato"])}</dd></dl>
      <div class="sc"><div class="lbl">Scaletta</div><ol>{sc}</ol></div>
    </div>
  </div>
</article>''')
    schede.append(f'<section class="page cards"><header class="run"><img src="{logo()}" alt="Layerloop"><span>Calendario editoriale blog · {i + 1}–{min(i + 2, len(cal))} di {len(cal)}</span></header>{"".join(cards)}</section>')

page = f'''<!doctype html><html lang="it"><head><meta charset="utf-8"><title>Calendario editoriale blog Layerloop</title>
<style>
@font-face{{font-family:MONUMET;src:url('{asset("MonumentExtended-Regular.ttf", "2021/09/MonumentExtended-Regular.ttf")}')}}
@font-face{{font-family:DIN;font-weight:300;src:url('{asset("DIN-Light.ttf", "2021/06/DIN-Light.ttf")}')}}
@font-face{{font-family:DIN;font-weight:400;src:url('{asset("D-DIN.ttf", "2021/06/D-DIN.ttf")}')}}
@font-face{{font-family:DIN;font-weight:700;src:url('{asset("DIN-Bold.ttf", "2021/06/DIN-Bold.ttf")}')}}
@page{{size:A4;margin:0}}
*{{box-sizing:border-box}}
body{{margin:0;font-family:DIN,Arial,sans-serif;color:#0c0c0c;font-size:10.5pt;-webkit-print-color-adjust:exact;print-color-adjust:exact}}
.page{{width:210mm;height:297mm;padding:14mm 15mm;position:relative;overflow:hidden;page-break-after:always}}
.page:last-child{{page-break-after:auto}}
h1,h2,h3{{font-family:MONUMET,Arial Black,sans-serif;font-weight:normal;text-transform:uppercase;margin:0}}
.cover{{background:#050505 url('{img_data(BASE / cal[0]["immagine"]["file"], 1600)}') center/cover;color:#fff;padding:0}}
.cover .ov{{position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,5,5,.55),rgba(5,5,5,.93) 62%)}}
.cover .in{{position:absolute;inset:0;padding:20mm 18mm;display:flex;flex-direction:column}}
.cover .lg0{{width:62mm}}
.cover .k{{margin-top:auto;display:inline-block;align-self:flex-start;font-family:MONUMET;font-size:8pt;letter-spacing:.14em;border:1px solid #1E9C94;background:rgba(30,156,148,.2);padding:2.5mm 4mm;margin-bottom:8mm}}
.cover h1{{font-size:30pt;line-height:1.12;margin-bottom:7mm}}
.cover p{{font-size:13pt;font-weight:300;color:#dfe6e5;max-width:150mm;line-height:1.5;margin:0 0 10mm}}
.cover .facts{{display:flex;gap:10mm;border-top:1px solid rgba(255,255,255,.35);padding-top:6mm}}
.cover .facts div{{font-size:9pt;color:#b9c4c3;text-transform:uppercase;letter-spacing:.08em}}
.cover .facts b{{display:block;font-family:MONUMET;font-weight:normal;font-size:17pt;color:#fff;letter-spacing:0;margin-bottom:1mm}}
.run{{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #1E9C94;padding-bottom:3mm;margin-bottom:6mm}}
.run img{{height:7mm}}
.run span{{font-size:8.5pt;text-transform:uppercase;letter-spacing:.1em;color:#5b6166}}
h2{{font-size:15pt;margin-bottom:3mm}}
.intro p{{margin:0 0 3.2mm;line-height:1.5;font-size:10.5pt}}
.how{{display:grid;grid-template-columns:repeat(4,1fr);gap:3mm;margin:6mm 0 7mm}}
.how div{{background:#F6F6F6;border-top:3px solid #1E9C94;padding:4mm;font-size:9pt;line-height:1.4}}
.how b{{display:block;font-family:MONUMET;font-weight:normal;font-size:8.5pt;margin-bottom:1.5mm;text-transform:uppercase}}
.legend{{display:grid;grid-template-columns:repeat(3,1fr);gap:2.5mm 6mm;margin-top:3mm}}
.lg{{display:flex;align-items:center;gap:2.5mm;font-size:9.5pt}}
.lg span{{color:#5b6166;margin-left:auto}}
i{{display:inline-block;width:3mm;height:3mm;flex:none}}
table{{width:100%;border-collapse:collapse;font-size:8pt;line-height:1.25}}
th{{background:#0c0c0c;color:#fff;text-align:left;font-weight:700;padding:2.2mm 2.5mm}}
td{{padding:1.3mm 2.2mm;border-bottom:1px solid #e3e6e6;vertical-align:middle}}
tr:nth-child(even) td{{background:#F6F6F6}}
td i{{margin-right:2mm;vertical-align:-.3mm}}
td.n{{font-weight:700;color:#1E9C94}} td.dt{{white-space:nowrap}} td.t{{font-weight:700}} td.st{{white-space:nowrap;color:#5b6166}} td.pl{{white-space:nowrap}}
.cards .card{{height:128mm;display:flex;flex-direction:column;margin-bottom:6mm;border:1px solid #e3e6e6}}
.ph{{height:62mm;position:relative;overflow:hidden;background:#111}}
.ph img{{width:100%;height:100%;object-fit:cover;display:block}}
.num{{position:absolute;left:0;bottom:0;background:#050505;color:#fff;font-family:MONUMET;font-size:14pt;padding:2.5mm 4mm}}
.bd{{padding:4.5mm 5mm;flex:1;display:flex;flex-direction:column}}
.meta{{display:flex;align-items:center;gap:3mm;margin-bottom:3mm;font-size:8.5pt}}
.pill{{color:#fff;padding:1mm 2.5mm;text-transform:uppercase;letter-spacing:.06em;font-size:7.5pt}}
.date{{text-transform:capitalize;font-weight:700}}
.st{{margin-left:auto;text-transform:uppercase;letter-spacing:.06em;font-size:7.5pt;color:#5b6166}}
.st-pubb{{color:#1E9C94;font-weight:700}}
.card h3{{font-size:11.5pt;line-height:1.3;margin-bottom:3.5mm}}
.cols{{display:grid;grid-template-columns:62mm 1fr;gap:6mm;font-size:9pt;line-height:1.4}}
dl{{margin:0}} dt,.lbl{{font-size:7.5pt;text-transform:uppercase;letter-spacing:.08em;color:#1E9C94;font-weight:700;margin-bottom:.6mm}}
dd{{margin:0 0 2.5mm}}
ol{{margin:0;padding-left:4.5mm}} li{{margin-bottom:.9mm}}

.mosaic{{display:grid;grid-template-columns:repeat(6,1fr);gap:1.6mm;margin-top:8mm}}
.mo{{position:relative;aspect-ratio:16/9;overflow:hidden;background:#111}}
.mo img{{width:100%;height:100%;object-fit:cover;display:block}}
.mo span{{position:absolute;left:0;bottom:0;background:#050505;color:#fff;font-family:MONUMET;font-size:6.5pt;padding:.8mm 1.4mm}}
.end{{background:#050505;color:#fff}}
.end h2{{font-size:22pt;line-height:1.2;margin:30mm 0 8mm}}
.end p{{font-size:12pt;font-weight:300;line-height:1.6;color:#dfe6e5;max-width:150mm}}
.end .foot{{position:absolute;left:15mm;right:15mm;bottom:14mm;border-top:1px solid rgba(255,255,255,.3);padding-top:5mm;font-size:9pt;color:#b9c4c3;line-height:1.6}}
.end .foot b{{color:#fff}}
</style></head><body>

<section class="page cover"><div class="ov"></div><div class="in">
<img class="lg0" src="{logo(white=True)}" alt="Layerloop">
<span class="k">Blog · Piano editoriale</span>
<h1>Calendario editoriale<br>blog Layerloop</h1>
<p>Un articolo a settimana sulla produzione industriale con la stampa 3D: produzione in serie, Medical Division, grandi componenti con Layerloop Extend, materiali e casi applicativi.</p>
<div class="facts"><div><b>{len(cal)}</b>articoli</div><div><b>6</b>mesi</div><div><b>{len(conteggio)}</b>temi</div>
<div><b>{MESI[d0.month - 1][:3]} {d0.year % 100} – {MESI[d1.month - 1][:3]} {d1.year % 100}</b>periodo</div></div>
</div></section>

<section class="page"><header class="run"><img src="{logo()}" alt="Layerloop"><span>Calendario editoriale blog</span></header>
<div class="intro"><h2>Il piano in breve</h2>
<p>Il blog pubblica un articolo ogni martedì per sei mesi. Ogni articolo risponde a una domanda concreta di un pubblico preciso (responsabili di produzione, uffici tecnici, podologi e ortopedie, costruttori di macchinari) e porta alla richiesta di informazioni o a una prova di stampa gratuita.</p>
<p>Gli articoli sono ottimizzati per una parola chiave, hanno un'immagine dedicata e chiudono con il form contatti del sito.</p></div>
<div class="how">
<div><b>1 · Scrittura</b>Ogni giovedì viene preparato l'articolo della settimana successiva.</div>
<div><b>2 · Revisione</b>La bozza viene inviata per approvazione, con eventuali modifiche.</div>
<div><b>3 · Approvazione</b>Nulla va online senza l'ok esplicito.</div>
<div><b>4 · Pubblicazione</b>Il post esce il martedì alle 9:00 su layerloop3d.com.</div>
</div>
<h2>I temi</h2>
<div class="legend">{legenda}</div>
<div class="mosaic">{mosaico}</div>
</section>

<section class="page"><header class="run"><img src="{logo()}" alt="Layerloop"><span>Panoramica</span></header>
<h2>Tutti gli articoli</h2>
<table><thead><tr><th>#</th><th>Uscita</th><th>Tema</th><th>Titolo</th><th>Stato</th></tr></thead><tbody>{righe}</tbody></table>
</section>

{"".join(schede)}

<section class="page end"><img class="lg0" style="width:55mm" src="{logo(white=True)}" alt="Layerloop">
<h2>Dalla prima idea<br>al pezzo in serie.</h2>
<p>Il calendario è una base di lavoro: temi, date e priorità si possono aggiornare in qualsiasi momento, per esempio per seguire fiere, lanci di prodotto o casi cliente.</p>
<div class="foot"><b>Layerloop</b> · Smart Lab Industrie 3D Finlogic S.p.A.<br>www.layerloop3d.com</div>
</section>
</body></html>'''

out_html = BASE / "calendario-editoriale.html"
out_html.write_text(page, encoding="utf-8")
out_pdf = BASE / "calendario-editoriale.pdf"
js = f"""const {{ chromium }} = require('playwright');
(async()=>{{const b=await chromium.launch();const p=await b.newPage();
await p.goto({json.dumps(out_html.as_uri())},{{waitUntil:'load'}});await p.evaluate(()=>document.fonts.ready);
await p.pdf({{path:{json.dumps(str(out_pdf))},format:'A4',printBackground:true,preferCSSPageSize:true}});await b.close();}})();"""
subprocess.run(["node", "-e", js], check=True)
print(out_pdf)
