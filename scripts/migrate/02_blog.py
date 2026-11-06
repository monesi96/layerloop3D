#!/usr/bin/env python3
"""Importa in Sanity gli articoli del blog (WordPress -> Sanity).
Gli articoli scritti dall'agente (layerloop-blog/articoli/*.md) vengono importati dal Markdown originale (più pulito del HTML pubblicato)."""
import glob, html, json, os, re, sys
import yaml
sys.path.insert(0, os.path.dirname(__file__))
from sanity_lib import *

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
D = os.path.join(os.path.dirname(__file__), 'data')
posts = json.load(open(f'{D}/wp_posts.json'))
txt = lambda h: html.unescape(re.sub(r'\s+', ' ', re.sub('<[^>]+>', ' ', h or ''))).strip()

# markdown dell'agente, per slug (WP tronca gli slug: confronto sul prefisso)
mds = {}
for f in glob.glob(f'{ROOT}/layerloop-blog/articoli/*.md'):
    raw = open(f).read()
    m = re.match(r'^---\n(.*?)\n---\n(.*)$', raw, re.S)
    if m:
        fm = yaml.safe_load(m.group(1)); fm['_body'] = m.group(2); fm['_dir'] = os.path.dirname(os.path.dirname(f))
        mds[fm['slug']] = fm

def md_for(slug_wp):
    for s, fm in mds.items():
        if s.startswith(slug_wp[:60]) or slug_wp.startswith(s[:60]):
            return fm

authors, cats, docs = {}, {}, []
for p in posts:
    emb = p.get('_embedded', {})
    for a in emb.get('author', []):
        authors[a['id']] = a
    for grp in emb.get('wp:term', []):
        for t in grp:
            if t['taxonomy'] == 'category':
                cats[t['id']] = t
for aid, a in authors.items():
    docs.append({'_id': f'author-{aid}', '_type': 'author', 'name': a['name'], 'role': 'Team Layerloop'})
for cid, c in cats.items():
    docs.append({'_id': f'category-{c["slug"]}', '_type': 'category', 'title': html.unescape(c['name']), 'slug': {'_type': 'slug', 'current': c['slug']}})
upsert(docs)

only = set(sys.argv[1:])
n = 0
for p in sorted(posts, key=lambda x: x['date']):
    sl = p['slug']
    if only and sl not in only:
        continue
    title = txt(p['title']['rendered'])
    md = md_for(sl)
    print('->', sl[:70], '(md)' if md else '(wp)', flush=True)
    cover = None
    media = (p.get('_embedded', {}).get('wp:featuredmedia') or [{}])[0]
    try:
        if md and md.get('immagine') and os.path.exists(os.path.join(md['_dir'], md['immagine'])):
            cover = image_ref(upload_path(os.path.join(md['_dir'], md['immagine'])), alt=md.get('immagine_alt') or title)
        elif media.get('source_url'):
            cover = image_ref(upload_url(media['source_url']), alt=(media.get('alt_text') or title))
    except Exception as e:
        print('   cover KO', str(e)[:100])
    if md:
        body = md_to_pt(md['_body'])
        excerpt = md.get('estratto') or txt(p['excerpt']['rendered'])
    else:
        body = html_to_pt(p['content']['rendered'])
        excerpt = txt(p['excerpt']['rendered'])
        # la copertina è spesso la prima immagine del corpo: la tolgo se identica
    cat_ids = [c for c in p.get('categories', []) if c in cats]
    en = bool(re.search(r'\b(the|with|new|an interview|joins?)\b', title.lower())) and not re.search(r'[àèìòù]', title.lower())
    d = {
        '_id': f'post-{p["id"]}', '_type': 'post', 'title': title, 'slug': {'_type': 'slug', 'current': sl},
        'publishedAt': p['date_gmt'] + 'Z' if not p['date_gmt'].endswith('Z') else p['date_gmt'],
        'excerpt': excerpt[:300], 'body': body, 'language': 'en' if en else 'it',
        'categories': [ref(f'category-{cats[c]["slug"]}', key(f'pc{p["id"]}{c}')) for c in cat_ids],
        'legacyUrl': p['link'],
    }
    if md and md.get('keyword'): d['keyword'] = md['keyword']
    if cover: d['cover'] = cover
    if p.get('author') in authors: d['author'] = ref(f'author-{p["author"]}')
    upsert([d]); n += 1
print('post importati:', n)
