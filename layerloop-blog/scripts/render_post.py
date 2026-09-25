"""Impaginazione degli articoli con lo stile del sito Layerloop.

L'articolo va in WordPress come un unico blocco HTML (come la pagina Medical Division),
con template "Elementor Pieno Schermo": hero con immagine, testo, box "In sintesi",
invito all'azione, form Ninja Forms generale (id 9, quello della homepage) e footer.
"""
import html
import re

import markdown

TEAL = "#1E9C94"
FORM_ID = 9  # Ninja Forms "Richiedi maggiori info" della homepage

PRODOTTI = {
    "Layerloop Next": "https://www.layerloop3d.com/layerloop-next-stampante-3d-industriale/",
    "Layerloop XE": "https://www.layerloop3d.com/layerloop-xe/",
    "Layerloop Extend": "https://www.layerloop3d.com/layerloop-extend/",
    "Medical Division": "https://www.layerloop3d.com/medical_division/",
}
MESI = "gennaio febbraio marzo aprile maggio giugno luglio agosto settembre ottobre novembre dicembre".split()

CSS = """
@font-face{font-family:'MONUMET';font-weight:normal;src:url('https://www.layerloop3d.com/wp-content/uploads/2021/09/MonumentExtended-Regular.ttf') format('truetype')}
@font-face{font-family:'MONUMET';font-weight:bold;src:url('https://www.layerloop3d.com/wp-content/uploads/2021/09/MonumentExtended-Ultrabold.ttf') format('truetype')}
@font-face{font-family:'DIN';font-weight:300;src:url('https://www.layerloop3d.com/wp-content/uploads/2021/06/DIN-Light.ttf') format('truetype')}
@font-face{font-family:'DIN';font-weight:normal;src:url('https://www.layerloop3d.com/wp-content/uploads/2021/06/D-DIN.ttf') format('truetype')}
@font-face{font-family:'DIN';font-weight:bold;src:url('https://www.layerloop3d.com/wp-content/uploads/2021/06/DIN-Bold.ttf') format('truetype')}
.llb{--teal:#1E9C94;--ink:#0c0c0c;--muted:#5b6166;--soft:#F6F6F6;font-family:'DIN',Roboto,Arial,sans-serif;color:var(--ink);font-size:18px;line-height:1.65;overflow-x:hidden}
.llb *{box-sizing:border-box}
.llb-bleed{width:100vw;margin-left:calc(50% - 50vw)}
.llb-wrap{max-width:1200px;margin:0 auto;padding:0 24px}
.llb-hero{position:relative;min-height:600px;display:flex;align-items:flex-end;background:#050505 center/cover no-repeat;color:#fff}
.llb-hero:before{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(5,5,5,.92) 0%,rgba(5,5,5,.7) 45%,rgba(5,5,5,.15) 100%),linear-gradient(0deg,rgba(5,5,5,.6),rgba(5,5,5,0) 50%)}
.llb-hero .llb-wrap{position:relative;width:100%;padding-top:150px;padding-bottom:70px}
.llb-kicker{display:inline-block;font-family:'MONUMET',sans-serif;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#fff;border:1px solid var(--teal);background:rgba(30,156,148,.18);padding:8px 14px;margin-bottom:22px}
.llb-hero h1{font-family:'MONUMET',sans-serif;font-weight:normal;text-transform:uppercase;font-size:clamp(26px,3.6vw,46px);line-height:1.15;color:#fff;margin:0 0 20px;max-width:900px}
.llb-hero p{font-size:clamp(17px,1.6vw,21px);font-weight:300;color:#e9eeee;max-width:720px;margin:0 0 26px}
.llb-meta{font-size:14px;letter-spacing:.06em;text-transform:uppercase;color:#b9c4c3}
.llb-meta b{color:var(--teal);font-weight:bold}
.llb-body{max-width:820px;margin:0 auto;padding:70px 24px 30px}
.llb-lead{font-size:clamp(19px,1.9vw,23px);line-height:1.55;font-weight:300;border-left:4px solid var(--teal);padding-left:24px;margin:0 0 50px}
.llb-body h2{font-family:'MONUMET',sans-serif;font-weight:normal;text-transform:uppercase;font-size:clamp(19px,2vw,24px);line-height:1.3;margin:60px 0 18px;color:var(--ink)}
.llb-body h2:before{content:"";display:block;width:48px;height:4px;background:var(--teal);margin-bottom:18px}
.llb-body h3{font-size:21px;margin:34px 0 10px}
.llb-body p{margin:0 0 20px}
.llb-body a{color:var(--teal);font-weight:bold;text-decoration:none;border-bottom:1px solid currentColor}
.llb-body strong{color:#000}
.llb-body ul,.llb-body ol{margin:0 0 26px;padding-left:0;list-style:none;counter-reset:n}
.llb-body li{position:relative;padding-left:34px;margin-bottom:12px}
.llb-body ul>li:before{content:"";position:absolute;left:4px;top:.62em;width:10px;height:10px;background:var(--teal)}
.llb-body ol>li{counter-increment:n}
.llb-body ol>li:before{content:counter(n);position:absolute;left:0;top:.1em;width:24px;height:24px;background:var(--ink);color:#fff;font-size:13px;font-weight:bold;line-height:24px;text-align:center}
.llb-table{overflow-x:auto;margin:30px 0 34px}
.llb-body table{width:100%;border-collapse:collapse;font-size:16px;line-height:1.45;background:#fff}
.llb-body th{background:var(--ink);color:#fff;text-align:left;font-weight:bold;padding:14px 16px}
.llb-body th:last-child{background:var(--teal)}
.llb-body td{padding:14px 16px;border-bottom:1px solid #e3e6e6;vertical-align:top}
.llb-body tr:nth-child(even) td{background:var(--soft)}
.llb-body td:last-child{font-weight:bold}
.llb-sum{background:var(--soft);border-top:4px solid var(--teal);padding:36px 40px 18px;margin:60px 0 0}
.llb-sum h2{margin-top:0}
.llb-sum h2:before{display:none}
.llb-cta{background:#050505;color:#fff;margin-top:70px}
.llb-cta .llb-wrap{display:flex;gap:40px;align-items:center;justify-content:space-between;flex-wrap:wrap;padding-top:60px;padding-bottom:60px}
.llb-cta h2{font-family:'MONUMET',sans-serif;font-weight:normal;text-transform:uppercase;font-size:clamp(20px,2.4vw,30px);line-height:1.25;margin:0 0 10px;color:#fff;max-width:640px}
.llb-cta p{margin:0;color:#c9d2d1;max-width:640px}
.llb-btns{display:flex;gap:14px;flex-wrap:wrap}
.llb-btn{display:inline-block;font-family:Roboto,Arial,sans-serif;font-weight:500;font-size:15px;padding:15px 24px;text-decoration:none!important;border:1px solid var(--teal);background:var(--teal);color:#fff!important;transition:.2s}
.llb-btn:hover{background:transparent;color:var(--teal)!important}
.llb-btn.ghost{background:transparent;border-color:#F6F6F6;color:#F6F6F6!important}
.llb-btn.ghost:hover{color:var(--teal)!important;border-color:var(--teal)}
.llb-form{background:#000;color:#fff;border-top:1px solid #fff;padding:80px 0 50px}
.llb-form .llb-wrap{display:grid;grid-template-columns:1fr 1fr;gap:50px;align-items:center}
.llb-form h2{font-family:'MONUMET',sans-serif;font-weight:600;text-transform:uppercase;font-size:26px;line-height:1.2;color:#fff;margin:0 0 20px}
.llb-form p{color:#fff;font-size:16px}
.llb-form .nf-form-title h3,.llb-form .nf-field-label label,.llb-form .nf-form-fields-required,.llb-form .nf-field-element label{color:#fff!important}
.llb-form .nf-field input[type=text],.llb-form .nf-field input[type=email],.llb-form .nf-field input[type=tel],.llb-form .nf-field textarea,.llb-form .nf-field select{background:#fff!important;color:#000!important;border:0!important;border-radius:0!important}
.llb-form .submit-container input[type=button],.llb-form .submit-container input[type=submit]{width:130px;background:var(--teal)!important;color:#FFFCFC!important;border:0!important;border-radius:0!important;padding:12px!important}
.llb-foot{background:#050505;color:#fff;padding:40px 0 20px;font-size:15px;line-height:1.4}
.llb-foot .llb-wrap{display:grid;grid-template-columns:1.3fr 1fr 1fr}
.llb-foot .col{padding:40px}
.llb-foot .col+.col{padding-left:80px}
.llb-foot h4{font-family:'MONUMET',sans-serif;font-weight:normal;font-size:21px;color:#fff;margin:0 0 10px}
.llb-foot h5{font-family:'DIN',sans-serif;font-weight:normal;font-size:15px;line-height:1.4;color:#fff;margin:0 0 16px}
.llb-foot p{margin:0 0 14px}
.llb-foot a{color:var(--teal);text-decoration:none}
.llb-foot a:hover{color:#fff}
.llb-foot .links a{display:block;padding:8px 0 12px;border-bottom:1px solid #fff;width:max-content;min-width:120px;margin-bottom:12px}
.llb-copy{background:#1C968D;color:#fff;text-align:center;font-size:14px;padding:14px 24px}
@media(max-width:1024px){.llb-foot .col,.llb-foot .col+.col{padding:40px}}
@media(max-width:900px){.llb-form .llb-wrap,.llb-foot .llb-wrap{grid-template-columns:1fr}.llb-hero{min-height:520px}}
@media(max-width:600px){.llb{font-size:17px}.llb-hero .llb-wrap{padding-top:120px;padding-bottom:44px}.llb-sum{padding:28px 22px 10px}.llb-foot .col,.llb-foot .col+.col{padding:24px 0}}
"""

FORM_HTML = f"""
<section class="llb-form llb-bleed" id="contatti"><div class="llb-wrap">
<div><h2>Richiedi maggiori info</h2>
<p>Con <strong>Layerloop</strong> dì addio a stampanti di grandi dimensioni per la produzione di pezzi in 3D a livello industriale.</p>
<p>Se desideri tenerti aggiornato sul mondo delle stampanti 3D o vuoi richiederci una consulenza gratuita per il tuo caso specifico, compila il form e ti risponderemo al più presto.</p>
<p><strong>SmartLab Industrie 3D</strong>, assieme alla consociata Finlogic S.p.A., fornisce assistenza e supporto a 360°: dalla scelta del prodotto alla consulenza post vendita e ai corsi di formazione.</p></div>
<div class="eael-ninja-form">[ninja_form id={FORM_ID}]</div>
</div></section>"""

FOOTER_HTML = """
<footer class="llb-foot llb-bleed"><div class="llb-wrap">
<div class="col"><h4>LAYERLOOP</h4><h5>è stata realizzata da Smart lab Industrie 3D Finlogic S.p.A</h5>
<p><strong>Sede Legale:</strong><br>Bari, Via Calabria 12 – Z.I.<br>70021 Acquaviva delle fonti (Bari)</p>
<p>Iscritta nel registro delle <strong>start up innovative</strong><br>Consociata del <strong>Gruppo Finlogic SpA</strong><br>Sedi Affiliate: Bari, Teramo, Molfetta, Reggio Calabria</p>
<p><strong>Mail:</strong> <a href="mailto:info@smab3D.it">info@smab3D.it</a><br><strong>Tel:</strong> 080 8890568</p></div>
<div class="col links"><h4>SERVIZI</h4>
<a href="https://www.smartlab3d.com/stampanti-3d/">Stampanti 3D</a><a href="https://www.smartlab3d.com/stampanti-uv/">Plotter UV</a><a href="https://www.smartlab3d.com/stampanti-3d/consumabili-stampanti-3d/">Consumabili stampanti 3D</a><a href="https://www.smartlab3d.com/franchising-stampanti-3d/">Franchising Stampanti 3D</a><a href="https://www.smartlab3d.com/pantografi-cnc/">Pantografi CNC / LASER</a></div>
<div class="col links"><h4>INFO</h4>
<a href="https://www.smartlab3d.com/chi-siamo/">Inside Smart Lab 3D</a><a href="https://www.smartlab3d.com/contatti/">Contatti</a><a href="https://www.smartlab3d.com/category/news/">News</a><a href="https://www.smartlab3d.com/category/case-studies/">Case Studies</a><a href="https://www.smartlab3d.com/en/?page_id=730">Shop</a></div>
</div></footer>
<div class="llb-copy llb-bleed">Layerloop – P.Iva 07732690727 – Spazio web creato da Astrolancer – Creativi Associati dallo Spazio</div>"""


def _data_it(d):
    return f"{d.day} {MESI[d.month - 1]} {d.year}"


def render(meta, body_md, image_url, info):
    """meta: frontmatter; info: voce del calendario (pilastro, prodotto_collegato)."""
    esc = html.escape
    # Toglie la CTA testuale finale: la sostituisce il blocco CTA + form.
    body_md = re.sub(r"\n\*\*Vuoi[\s\S]*$", "", body_md.strip())
    words = len(re.findall(r"\w+", body_md))
    minuti = max(3, round(words / 200))
    h = markdown.markdown(body_md, extensions=["tables", "sane_lists"])
    h = h.replace("<table>", '<div class="llb-table"><table>').replace("</table>", "</table></div>")
    # Primo paragrafo = lead
    h = re.sub(r"^<p>", '<p class="llb-lead">', h, count=1)
    # Box "In sintesi"
    h = re.sub(r"(<h2>In sintesi</h2>[\s\S]*)$", r'<div class="llb-sum">\1</div>', h)

    prodotto = info.get("prodotto_collegato") or "Layerloop"
    link_prodotto = next((u for k, u in PRODOTTI.items() if k in prodotto), PRODOTTI["Layerloop Next"])
    nome_prodotto = next((k for k in PRODOTTI if k in prodotto), "Layerloop Next")
    hero_bg = f' style="background-image:url(\'{esc(image_url)}\')"' if image_url else ""

    return f"""<!-- wp:html -->
<div class="llb"><style>{CSS}</style>
<section class="llb-hero llb-bleed"{hero_bg} role="img" aria-label="{esc(meta.get('immagine_alt', ''))}"><div class="llb-wrap">
<span class="llb-kicker">Blog · {esc(info.get('pilastro', 'Produzione industriale'))}</span>
<h1>{esc(meta['titolo'])}</h1>
<p>{esc(meta.get('estratto', ''))}</p>
<div class="llb-meta"><b>Layerloop</b> &nbsp;·&nbsp; {_data_it(meta['data'])} &nbsp;·&nbsp; {minuti} min di lettura</div>
</div></section>
<article class="llb-body">{h}</article>
<section class="llb-cta llb-bleed"><div class="llb-wrap">
<div><h2>Vuoi capire se i tuoi pezzi si possono produrre con Layerloop?</h2>
<p>Richiedi informazioni o una prova di stampa gratuita: analizziamo il tuo pezzo e ti diamo tempi e costi reali.</p></div>
<div class="llb-btns"><a class="llb-btn" href="#contatti">Richiedi una prova gratuita</a><a class="llb-btn ghost" href="{link_prodotto}">Scopri {esc(nome_prodotto)}</a></div>
</div></section>
{FORM_HTML}
{FOOTER_HTML}
</div>
<!-- /wp:html -->"""
