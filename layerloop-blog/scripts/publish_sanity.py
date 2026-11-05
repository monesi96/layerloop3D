#!/usr/bin/env python3
"""Pubblica su Sanity (dataset layerloop) gli articoli approvati (layerloop-blog/articoli/*.md).

Uso:
    python publish_sanity.py articoli/2026-10-06-stampa-3d-a-nastro.md [altri.md ...]

Variabili d'ambiente:
    SANITY_PROJECT   (default 5033nuuu)
    SANITY_DATASET   (default production)
    SANITY_TOKEN     token con permesso di scrittura (Editor)
    SITE_URL         (default https://www.layerloop3d.com) per il link nella newsletter
    NEWSLETTER       "no" per non creare la campagna Mailchimp

Pubblica solo i file con `stato: approvato`. Se la data è nel futuro l'articolo viene scritto con
`publishedAt` futuro: il sito lo mostra solo da quel momento (le liste filtrano publishedAt <= now()).
Se esiste già un articolo con lo stesso slug viene aggiornato, non duplicato.
"""
import datetime as dt
import json
import os
import pathlib
import sys

import yaml

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[2] / 'scripts' / 'migrate'))
import sanity_lib as S  # noqa: E402
from newsletter import crea_campagna  # noqa: E402

BASE = pathlib.Path(__file__).resolve().parent.parent
SITE = os.environ.get('SITE_URL', 'https://www.layerloop3d.com').rstrip('/')
CATEGORY = os.environ.get('BLOG_CATEGORY', 'produzione-industriale')


def parse(path):
    _, fm, body = path.read_text(encoding='utf-8').split('---', 2)
    return yaml.safe_load(fm), body.strip()


def publish(path):
    meta, body = parse(path)
    if meta.get('stato') != 'approvato':
        print(f"salto {path.name}: stato={meta.get('stato')}")
        return
    cover = None
    img = BASE / meta['immagine'] if meta.get('immagine') else None
    if img and img.exists():
        cover = S.image_ref(S.upload_path(str(img)), alt=meta.get('immagine_alt') or meta['titolo'])
    when = dt.datetime.fromisoformat(f'{meta["data"]}T{meta.get("ora", "09:00")}:00')
    # fuso Europe/Rome: la data nel frontmatter è l'ora locale dell'articolo
    published = when.replace(tzinfo=dt.timezone(dt.timedelta(hours=1))).astimezone(dt.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
    cat_id = f'category-{CATEGORY}'
    S.mutate([{'createIfNotExists': {'_id': cat_id, '_type': 'category', 'title': CATEGORY.replace('-', ' ').capitalize(), 'slug': {'_type': 'slug', 'current': CATEGORY}}}])
    existing = S.query('*[_type=="post" && slug.current==$s][0]._id', s=meta['slug'])
    doc = {
        '_id': existing or f'post-{meta["slug"][:80]}', '_type': 'post', 'title': meta['titolo'], 'slug': {'_type': 'slug', 'current': meta['slug']},
        'publishedAt': published, 'excerpt': (meta.get('estratto') or '')[:300], 'language': 'it', 'keyword': meta.get('keyword'),
        'body': S.md_to_pt(body), 'categories': [S.ref(cat_id, 'cat1')],
    }
    if cover:
        doc['cover'] = cover
    S.upsert([doc])
    print(('aggiornato ' if existing else 'creato ') + doc['_id'] + ' · pubblicazione ' + published)
    if os.environ.get('NEWSLETTER', 'si').lower() not in ('no', 'false', '0'):
        info = next((a for a in json.loads((BASE / 'calendario-editoriale.json').read_text(encoding='utf-8')) if a['slug'] == meta['slug']), {})
        crea_campagna(meta, info, f'{SITE}/blog/{meta["slug"]}', None)


if __name__ == '__main__':
    for arg in sys.argv[1:]:
        publish(pathlib.Path(arg).resolve())
