#!/usr/bin/env python3
"""Newsletter Mailchimp per gli articoli del blog Layerloop.

Dopo la pubblicazione su WordPress, publish_wp.py chiama crea_campagna(): viene creata una
campagna Mailchimp con la grafica Layerloop (immagine, titolo, estratto, pulsante).

Modalità (variabile MAILCHIMP_MODE):
    bozza      (default) la campagna resta in bozza su Mailchimp: l'invio lo fai tu con un clic;
    programma  la campagna viene programmata per il giorno di uscita, un'ora dopo il post.

Variabili d'ambiente:
    MAILCHIMP_API_KEY   chiave API (es. xxxxxxxx-us21), obbligatoria: senza, la newsletter è saltata
    MAILCHIMP_LIST_ID   id del pubblico (Audience); se manca e c'è un solo pubblico, usa quello
    MAILCHIMP_TAG       opzionale: invia solo ai contatti con questo tag
    MAILCHIMP_MODE      bozza | programma
    MAILCHIMP_REPLY_TO  opzionale: email mittente/risposta (default: quella del pubblico)

Anteprima locale della mail:
    python newsletter.py ../articoli/<file>.md anteprima.html
"""
import base64
import datetime as dt
import html
import json
import os
import pathlib
import sys
import urllib.error
import urllib.request
from zoneinfo import ZoneInfo

from render_post import PRODOTTI, _data_it

LOGO = "https://www.layerloop3d.com/wp-content/uploads/2021/06/logo-layerloop-vector.png"
ROMA = ZoneInfo("Europe/Rome")


def email_html(meta, info, post_url, image_url):
    e = html.escape
    prodotto = info.get("prodotto_collegato") or ""
    nome_prod = next((k for k in PRODOTTI if k in prodotto), "Layerloop Next")
    link_prod = PRODOTTI[nome_prod]
    font = "Arial,Helvetica,sans-serif"
    img = (f'<tr><td><a href="{post_url}"><img src="{e(image_url)}" width="600" alt="{e(meta.get("immagine_alt", ""))}" '
           f'style="display:block;width:100%;max-width:600px;height:auto;border:0"></a></td></tr>') if image_url else ""
    return f"""<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{e(meta['titolo'])}</title></head>
<body style="margin:0;padding:0;background:#F6F6F6">
<div style="display:none;max-height:0;overflow:hidden">{e(meta.get('estratto', ''))}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F6F6F6"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff">
<tr><td style="padding:24px 32px;border-bottom:3px solid #1E9C94"><a href="https://www.layerloop3d.com/"><img src="{LOGO}" width="160" alt="Layerloop" style="display:block;border:0;width:160px;height:auto"></a></td></tr>
{img}
<tr><td style="padding:32px 32px 8px;font-family:{font}">
<div style="display:inline-block;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#ffffff;background:#1E9C94;padding:6px 10px">Blog · {e(info.get('pilastro', 'Produzione industriale'))}</div>
<h1 style="margin:18px 0 12px;font-size:26px;line-height:1.25;color:#0c0c0c;text-transform:uppercase;letter-spacing:.5px">{e(meta['titolo'])}</h1>
<p style="margin:0 0 8px;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#5b6166">{_data_it(meta['data'])}</p>
<p style="margin:0 0 26px;font-size:17px;line-height:1.6;color:#333333">{e(meta.get('estratto', ''))}</p>
<table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background:#1E9C94">
<a href="{post_url}" style="display:inline-block;padding:15px 28px;font-family:{font};font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none">Leggi l'articolo &rarr;</a></td></tr></table>
</td></tr>
<tr><td style="padding:32px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#050505"><tr><td style="padding:26px 28px;font-family:{font};color:#ffffff">
<p style="margin:0 0 6px;font-size:16px;font-weight:bold;text-transform:uppercase;letter-spacing:.5px">Vuoi capire se i tuoi pezzi si possono produrre con Layerloop?</p>
<p style="margin:0 0 16px;font-size:14px;line-height:1.5;color:#c9d2d1">Richiedi informazioni o una prova di stampa gratuita.</p>
<a href="{post_url}#contatti" style="font-size:14px;font-weight:bold;color:#1E9C94;text-decoration:none">Richiedi una prova gratuita &rarr;</a>
&nbsp;&nbsp;&nbsp;<a href="{link_prod}" style="font-size:14px;color:#ffffff;text-decoration:underline">Scopri {e(nome_prod)}</a>
</td></tr></table></td></tr>
<tr><td style="background:#050505;padding:26px 32px;font-family:{font};font-size:12px;line-height:1.6;color:#b9c4c3">
<strong style="color:#ffffff">LAYERLOOP</strong> · Smart Lab Industrie 3D Finlogic S.p.A.<br>Via Calabria 12 – Z.I., 70021 Acquaviva delle Fonti (BA) · Tel. 080 8890568<br>
<a href="https://www.layerloop3d.com/" style="color:#1E9C94;text-decoration:none">www.layerloop3d.com</a><br><br>
Ricevi questa email perché sei iscritto alla newsletter Layerloop. <a href="*|UNSUB|*" style="color:#ffffff">Annulla l'iscrizione</a> · <a href="*|UPDATE_PROFILE|*" style="color:#ffffff">Aggiorna preferenze</a>
</td></tr>
<tr><td style="background:#1C968D;padding:10px;text-align:center;font-family:{font};font-size:11px;color:#ffffff">Layerloop – P.Iva 07732690727</td></tr>
</table></td></tr></table></body></html>"""


class Mailchimp:
    def __init__(self, key):
        self.base = f"https://{key.rsplit('-', 1)[-1]}.api.mailchimp.com/3.0/"
        self.auth = "Basic " + base64.b64encode(f"layerloop:{key}".encode()).decode()

    def __call__(self, method, path, data=None):
        req = urllib.request.Request(self.base + path, method=method,
                                     data=json.dumps(data).encode() if data is not None else None,
                                     headers={"Authorization": self.auth, "Content-Type": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                body = r.read()
                return json.loads(body) if body else {}
        except urllib.error.HTTPError as err:
            sys.exit(f"Mailchimp {method} {path} -> {err.code}: {err.read().decode()[:500]}")


def orario_invio(meta):
    """Il giorno di uscita, un'ora dopo il post, arrotondato al quarto d'ora (vincolo Mailchimp)."""
    h, m = map(int, str(meta.get("ora", "09:00")).split(":"))
    t = dt.datetime.combine(meta["data"], dt.time(h, m), ROMA) + dt.timedelta(hours=1)
    adesso = dt.datetime.now(ROMA) + dt.timedelta(minutes=20)
    if t < adesso:
        t = adesso
    t += dt.timedelta(minutes=(15 - t.minute % 15) % 15, seconds=-t.second, microseconds=-t.microsecond)
    return t.astimezone(dt.timezone.utc)


def crea_campagna(meta, info, post_url, image_url):
    key = os.environ.get("MAILCHIMP_API_KEY")
    if not key:
        print("newsletter saltata: MAILCHIMP_API_KEY non impostata")
        return
    mc = Mailchimp(key)
    modo = (os.environ.get("MAILCHIMP_MODE") or "bozza").strip().lower()
    list_id = os.environ.get("MAILCHIMP_LIST_ID")
    if not list_id:
        liste = mc("GET", "lists?count=10&fields=lists.id,lists.name")["lists"]
        if len(liste) != 1:
            sys.exit("newsletter: più pubblici su Mailchimp, imposta MAILCHIMP_LIST_ID: "
                     + ", ".join(f'{l["name"]}={l["id"]}' for l in liste))
        list_id = liste[0]["id"]
    lista = mc("GET", f"lists/{list_id}?fields=name,campaign_defaults")
    recipients = {"list_id": list_id}
    tag = os.environ.get("MAILCHIMP_TAG")
    if tag:
        segs = mc("GET", f"lists/{list_id}/segments?type=static&count=1000&fields=segments.id,segments.name")["segments"]
        seg = next((s for s in segs if s["name"].lower() == tag.lower()), None)
        if not seg:
            sys.exit(f"newsletter: tag '{tag}' non trovato nel pubblico {lista['name']}")
        recipients["segment_opts"] = {"saved_segment_id": seg["id"]}

    titolo = f"Blog · {meta['slug']}"
    esistenti = mc("GET", "campaigns?count=200&sort_field=create_time&sort_dir=DESC"
                          "&fields=campaigns.id,campaigns.status,campaigns.settings.title")["campaigns"]
    camp = next((c for c in esistenti if c["settings"]["title"] == titolo), None)
    if camp and camp["status"] in ("sent", "sending"):
        print(f"newsletter già inviata ({camp['id']}): non la rifaccio")
        return
    if camp and camp["status"] == "schedule":
        mc("POST", f"campaigns/{camp['id']}/actions/unschedule")

    d = lista["campaign_defaults"]
    settings = {
        "title": titolo,
        "subject_line": meta.get("newsletter_oggetto") or meta["titolo"],
        "preview_text": meta.get("newsletter_anteprima") or meta.get("estratto", ""),
        "from_name": d.get("from_name") or "Layerloop",
        "reply_to": os.environ.get("MAILCHIMP_REPLY_TO") or d.get("from_email"),
    }
    if camp:
        mc("PATCH", f"campaigns/{camp['id']}", {"recipients": recipients, "settings": settings})
        cid = camp["id"]
    else:
        cid = mc("POST", "campaigns", {"type": "regular", "recipients": recipients, "settings": settings})["id"]
    mc("PUT", f"campaigns/{cid}/content", {"html": email_html(meta, info, post_url, image_url)})

    if modo == "programma":
        quando = orario_invio(meta)
        mc("POST", f"campaigns/{cid}/actions/schedule", {"schedule_time": quando.strftime("%Y-%m-%dT%H:%M:%S+00:00")})
        print(f"newsletter programmata {cid} per {quando.astimezone(ROMA):%d/%m %H:%M} (pubblico {lista['name']})")
    else:
        print(f"newsletter in bozza su Mailchimp: {cid} '{settings['subject_line']}' (pubblico {lista['name']})")


if __name__ == "__main__":
    import yaml
    src, out = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
    _, fm, _ = src.read_text(encoding="utf-8").split("---", 2)
    meta = yaml.safe_load(fm)
    cal = json.loads((pathlib.Path(__file__).resolve().parent.parent / "calendario-editoriale.json").read_text())
    info = next((a for a in cal if a["slug"] == meta["slug"]), {})
    url = f"https://www.layerloop3d.com/{meta['slug']}/"
    img = f"https://www.layerloop3d.com/wp-content/uploads/{meta['data']:%Y/%m}/{pathlib.Path(meta['immagine']).name}"
    out.write_text(email_html(meta, info, url, img), encoding="utf-8")
    print(out)
