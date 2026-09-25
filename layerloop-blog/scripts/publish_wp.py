#!/usr/bin/env python3
"""Pubblica su WordPress gli articoli approvati (layerloop-blog/articoli/*.md).

Uso:
    python publish_wp.py articoli/2026-10-06-stampa-3d-a-nastro.md [altri.md ...]

Variabili d'ambiente richieste:
    WP_URL           es. https://www.layerloop3d.com
    WP_USER          utente WordPress con ruolo Editor
    WP_APP_PASSWORD  Password applicazione (Utenti > Profilo > Password applicazione)
    WP_CATEGORY      slug della categoria del blog (default: produzione-industriale)

Pubblica solo i file con `stato: approvato` nel frontmatter. Se la data è nel
futuro il post viene programmato (status "future"), altrimenti pubblicato.
Se esiste già un post con lo stesso slug viene aggiornato, non duplicato.
"""
import base64
import datetime as dt
import json
import mimetypes
import os
import pathlib
import sys
import urllib.error
import urllib.parse
import urllib.request

import yaml

from newsletter import crea_campagna
from render_post import render

BASE = pathlib.Path(__file__).resolve().parent.parent
WP_URL = os.environ["WP_URL"].rstrip("/")
AUTH = base64.b64encode(f'{os.environ["WP_USER"]}:{os.environ["WP_APP_PASSWORD"]}'.encode()).decode()
CATEGORY = os.environ.get("WP_CATEGORY") or "produzione-industriale"


def api(method, path, data=None, headers=None, raw=None):
    url = f"{WP_URL}/wp-json/wp/v2/{path}"
    body = raw if raw is not None else (json.dumps(data).encode() if data is not None else None)
    h = {"Authorization": f"Basic {AUTH}", "User-Agent": "layerloop-blog-agent"}
    if raw is None and data is not None:
        h["Content-Type"] = "application/json"
    h.update(headers or {})
    req = urllib.request.Request(url, data=body, headers=h, method=method)
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        sys.exit(f"{method} {path} -> {e.code}: {e.read().decode()[:500]}")


def parse(path):
    text = path.read_text(encoding="utf-8")
    _, fm, body = text.split("---", 2)
    return yaml.safe_load(fm), body.strip()


def category_id(slug):
    found = api("GET", f"categories?slug={urllib.parse.quote(slug)}")
    if found:
        return found[0]["id"]
    return api("POST", "categories", {"name": slug.replace("-", " ").capitalize(), "slug": slug})["id"]


def calendar_info(slug):
    cal = json.loads((BASE / "calendario-editoriale.json").read_text(encoding="utf-8"))
    return next((a for a in cal if a["slug"] == slug), {})


def upload_image(meta):
    """Carica l'immagine, o riusa quella già caricata con lo stesso nome file."""
    img = BASE / meta["immagine"]
    for m in api("GET", f"media?search={urllib.parse.quote(img.stem)}&per_page=20"):
        if img.stem in m.get("source_url", ""):
            return m
    raw = img.read_bytes()
    media = api("POST", "media", raw=raw, headers={
        "Content-Type": mimetypes.guess_type(img.name)[0] or "image/jpeg",
        "Content-Disposition": f'attachment; filename="{img.name}"',
    })
    api("POST", f'media/{media["id"]}', {"alt_text": meta.get("immagine_alt", meta["titolo"])})
    return media


def publish(path):
    meta, body = parse(path)
    if meta.get("stato") != "approvato":
        print(f"salto {path.name}: stato={meta.get('stato')}")
        return
    info = calendar_info(meta["slug"])
    media = upload_image(meta) if meta.get("immagine") else None
    when = dt.datetime.fromisoformat(f'{meta["data"]}T{meta.get("ora", "09:00")}:00')
    post = {
        "title": meta["titolo"],
        "slug": meta["slug"],
        "excerpt": meta.get("estratto", ""),
        "content": render(meta, body, media and media["source_url"], info),
        "template": "elementor_header_footer",
        "comment_status": "closed",
        "ping_status": "closed",
        "categories": [category_id(CATEGORY)],
        "date": when.isoformat(),
        "status": "future" if when > dt.datetime.now() else "publish",
    }
    if media:
        post["featured_media"] = media["id"]
    existing = api("GET", f'posts?slug={meta["slug"]}&status=any&context=edit')
    if existing:
        res = api("POST", f'posts/{existing[0]["id"]}', post)
        print(f'aggiornato #{res["id"]} {res["status"]} {res["link"]}')
    else:
        res = api("POST", "posts", post)
        print(f'creato #{res["id"]} {res["status"]} {res["link"]}')
    if os.environ.get("NEWSLETTER", "si").lower() not in ("no", "false", "0"):
        crea_campagna(meta, info, f'{WP_URL}/{meta["slug"]}/', media and media["source_url"])


if __name__ == "__main__":
    for arg in sys.argv[1:]:
        publish(pathlib.Path(arg).resolve())
