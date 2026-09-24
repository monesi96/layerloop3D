"""Genera calendario.html (pagina visuale del calendario) da calendario-editoriale.json."""
import json, pathlib, html, datetime as dt
base = pathlib.Path(__file__).resolve().parent.parent
cal = json.loads((base/"calendario-editoriale.json").read_text())
MESI = "gennaio febbraio marzo aprile maggio giugno luglio agosto settembre ottobre novembre dicembre".split()
GG = "lun mar mer gio ven sab dom".split()
PIL = {"Produzione in serie":"p1","Materiali":"p2","Tracciabilità e 4.0":"p3","Settori":"p4","Processo e qualità":"p5","Business e crescita":"p6"}
e = html.escape
months = {}
for a in cal:
    d = dt.date.fromisoformat(a["data"]); months.setdefault((d.year, d.month), []).append((d, a))
secs = []
for (y, m), items in months.items():
    cards = []
    for d, a in items:
        sc = "".join(f"<li>{e(s)}</li>" for s in a["scaletta"])
        cards.append(f'''<article class="card" data-p="{PIL[a['pilastro']]}">
  <img src="{e(a['immagine']['file'])}" alt="{e(a['titolo'])}" loading="lazy" width="1344" height="752">
  <div class="body">
    <div class="meta"><span class="date">{GG[d.weekday()]} {d.day:02d}.{d.month:02d}</span><span class="n">#{a['n']:02d}</span><span class="pill {PIL[a['pilastro']]}">{e(a['pilastro'])}</span></div>
    <h3>{e(a['titolo'])}</h3>
    <dl><dt>Keyword</dt><dd class="kw">{e(a['keyword'])}</dd><dt>Target</dt><dd>{e(a['target'])}</dd><dt>Prodotto</dt><dd>{e(a['prodotto_collegato'])}</dd></dl>
    <details><summary>Scaletta</summary><ol>{sc}</ol></details>
  </div>
</article>''')
    secs.append(f'<section class="month"><h2>{MESI[m-1]} <span>{y}</span></h2><div class="grid">{"".join(cards)}</div></section>')
chips = "".join(f'<button type="button" class="chip {c}" data-f="{c}" aria-pressed="false">{e(p)}</button>' for p, c in PIL.items())
page = f'''<title>Calendario blog Layerloop</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@75..125,500..800&family=Source+Sans+3:wght@400;600&family=JetBrains+Mono:wght@500&display=swap">
<style>
:root{{--bg:#f3f5f5;--surface:#ffffff;--ink:#16201f;--muted:#5b6a69;--line:#d9e0df;--accent:#0e7c7b;--accent-ink:#ffffff;
--p1:#0e7c7b;--p2:#8a5a12;--p3:#3d5fa8;--p4:#9b3d52;--p5:#4e7a2c;--p6:#6a4f9c;
--display:"Archivo","Arial Narrow",system-ui,sans-serif;--sans:"Source Sans 3",system-ui,sans-serif;--mono:"JetBrains Mono",ui-monospace,monospace}}
@media (prefers-color-scheme:dark){{:root:not([data-theme="light"]){{color-scheme:dark;--bg:#0f1515;--surface:#172020;--ink:#e6eeed;--muted:#94a4a3;--line:#2a3636;--accent:#3fb8b4;--accent-ink:#062020;
--p1:#3fb8b4;--p2:#d9a452;--p3:#86a4e6;--p4:#e28a9e;--p5:#94c46e;--p6:#b39be0}}}}
:root[data-theme="dark"]{{color-scheme:dark;--bg:#0f1515;--surface:#172020;--ink:#e6eeed;--muted:#94a4a3;--line:#2a3636;--accent:#3fb8b4;--accent-ink:#062020;
--p1:#3fb8b4;--p2:#d9a452;--p3:#86a4e6;--p4:#e28a9e;--p5:#94c46e;--p6:#b39be0}}
body{{background:var(--bg);color:var(--ink);font:16px/1.55 var(--sans);padding-inline:16px;padding-block:32px 64px}}
.wrap{{max-width:1180px;margin:0 auto;display:grid;gap:40px}}
header{{display:grid;gap:14px;max-width:760px}}
.eyebrow{{font:500 12px var(--mono);letter-spacing:.08em;text-transform:uppercase;color:var(--accent)}}
h1{{font-family:var(--display);font-stretch:112%;font-weight:800;font-size:clamp(30px,5vw,50px);line-height:1.02;margin:0;text-wrap:balance}}
header p{{margin:0;color:var(--muted);max-width:65ch}}
.flow{{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:1px;background:var(--line);border:1px solid var(--line);border-radius:6px;overflow:hidden;counter-reset:s}}
.flow div{{background:var(--surface);padding:14px 16px;font-size:14px;counter-increment:s}}
.flow div::before{{content:counter(s,decimal-leading-zero);display:block;font:500 12px var(--mono);color:var(--accent);margin-bottom:4px}}
.flow b{{display:block;font-family:var(--display);font-stretch:105%;font-size:15px}}
.flow .gate{{background:var(--accent);color:var(--accent-ink)}} .flow .gate::before{{color:inherit}}
.filters{{display:flex;flex-wrap:wrap;gap:8px;align-items:center}}
.filters span{{font:500 12px var(--mono);color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-right:4px}}
.chip{{font:600 13px var(--sans);border:1px solid var(--line);background:var(--surface);color:var(--ink);border-radius:999px;padding:5px 12px;cursor:pointer}}
.chip::before{{content:"";display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--c);margin-right:7px}}
.chip[aria-pressed="true"]{{border-color:var(--c);box-shadow:inset 0 0 0 1px var(--c)}}
.chip:focus-visible,summary:focus-visible{{outline:2px solid var(--accent);outline-offset:2px}}
.p1{{--c:var(--p1)}}.p2{{--c:var(--p2)}}.p3{{--c:var(--p3)}}.p4{{--c:var(--p4)}}.p5{{--c:var(--p5)}}.p6{{--c:var(--p6)}}
.month{{display:grid;gap:16px}}
.month h2{{font-family:var(--display);font-stretch:118%;font-weight:700;font-size:26px;margin:0;text-transform:capitalize;border-bottom:2px solid var(--ink);padding-bottom:6px}}
.month h2 span{{font:500 14px var(--mono);color:var(--muted);vertical-align:middle}}
.grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:18px}}
.card{{background:var(--surface);border:1px solid var(--line);border-radius:6px;overflow:hidden;display:flex;flex-direction:column}}
.card img{{display:block;width:100%;height:auto;aspect-ratio:16/9;object-fit:cover}}
.body{{padding:14px 16px 16px;display:grid;gap:10px;align-content:start}}
.meta{{display:flex;flex-wrap:wrap;gap:8px;align-items:center;font:500 12px var(--mono);font-variant-numeric:tabular-nums}}
.date{{color:var(--ink)}} .n{{color:var(--muted)}}
.pill{{margin-left:auto;font:600 11px var(--sans);letter-spacing:.04em;text-transform:uppercase;color:var(--c)}}
.card h3{{font-family:var(--display);font-stretch:100%;font-weight:700;font-size:17px;line-height:1.22;margin:0;text-wrap:balance}}
dl{{display:grid;grid-template-columns:auto 1fr;gap:3px 10px;margin:0;font-size:13.5px}}
dt{{color:var(--muted);font:500 11px/1.9 var(--mono);text-transform:uppercase;letter-spacing:.05em}} dd{{margin:0}}
.kw{{font-style:italic}}
details{{font-size:14px;border-top:1px solid var(--line);padding-top:8px}}
summary{{cursor:pointer;font-weight:600;color:var(--accent)}}
ol{{margin:8px 0 0;padding-left:20px;display:grid;gap:3px}}
.card[hidden]{{display:none}} .month.empty{{display:none}}
footer{{color:var(--muted);font-size:14px;max-width:70ch}}
</style>
<div class="wrap">
<header>
  <div class="eyebrow">Layerloop 3D · Blog · ott 2026 – mar 2027</div>
  <h1>26 articoli sulla produzione industriale con la stampa 3D</h1>
  <p>Un articolo ogni martedì alle 9:00. L'agente scrive la bozza il giovedì prima e apre una richiesta di approvazione: niente va online senza il tuo ok. Ogni articolo ha già la sua immagine generata con Higgsfield.</p>
</header>
<div class="flow">
  <div><b>Calendario</b>Tema, keyword e scaletta della settimana</div>
  <div><b>Bozza</b>Ogni giovedì Claude scrive l'articolo e prepara l'immagine</div>
  <div class="gate"><b>La tua approvazione</b>Pull Request su GitHub: chiedi modifiche o approvi</div>
  <div><b>Merge</b>Parte la GitHub Action di pubblicazione</div>
  <div><b>WordPress</b>Post programmato sul sito per il martedì</div>
</div>
<div class="filters" role="group" aria-label="Filtra per pilastro"><span>Pilastri</span>{chips}</div>
{"".join(secs)}
<footer>Immagini generate con AI: mostrano pezzi e ambienti di lavoro, non la stampante Layerloop reale. L'articolo sugli incentivi (15 dicembre) va verificato sulla normativa in vigore al momento dell'uscita.</footer>
</div>
<script>
const chips=[...document.querySelectorAll('.chip')];
chips.forEach(c=>c.addEventListener('click',()=>{{
  const on=c.getAttribute('aria-pressed')!=='true';
  chips.forEach(x=>x.setAttribute('aria-pressed','false'));
  if(on)c.setAttribute('aria-pressed','true');
  const f=on?c.dataset.f:null;
  document.querySelectorAll('.card').forEach(k=>k.hidden=!!f&&k.dataset.p!==f);
  document.querySelectorAll('.month').forEach(m=>m.classList.toggle('empty',![...m.querySelectorAll('.card')].some(k=>!k.hidden)));
}}));
</script>
'''
(base/"calendario.html").write_text(page)
