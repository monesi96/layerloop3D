#!/usr/bin/env python3
"""Converte le pagine Elementor (rivenditori, medical division, academy, settori) in blocchi Sanity.
Ogni sezione Elementor diventa un blocco: hero, punti chiave (contatori), card (icon/image box), testo, immagine+testo, galleria, modulo."""
import json, os, re, sys, html
from bs4 import BeautifulSoup, Tag
sys.path.insert(0, os.path.dirname(__file__))
from sanity_lib import *

D = os.path.join(os.path.dirname(__file__), 'data')
PAGES = {x['slug']: x for x in json.load(open(f'{D}/wp_pages.json'))}
BASE = 'https://www.layerloop3d.com'
T = lambda e: re.sub(r'\s+', ' ', e.get_text(' ', strip=True)) if e else ''
_k = 0
def K():
    global _k; _k += 1; return key(f'k{_k}')

def ctas_of(sec):
    out, seen = [], set()
    for a in sec.select('a.elementor-button, a.btn, a.button'):
        href = a.get('href') or ''
        label = T(a)
        if not label or href in ('', '#') or (label, href) in seen: continue
        seen.add((label, href))
        href = href.replace(BASE, '') or '/'
        out.append({'_type': 'link', '_key': K(), 'label': label, 'href': href, 'external': href.startswith('http')})
    return out

def imgs_of(sec, limit=None):
    res = []
    for im in sec.find_all('img'):
        src = im.get('data-src') or im.get('src') or ''
        if not src or src.startswith('data:') or 'logo' in src.lower() and False: continue
        res.append((urllib.parse.urljoin(BASE, re.sub(r'-\d+x\d+(\.\w+)$', r'\1', src)), (im.get('alt') or '').strip()))
    return res[:limit] if limit else res

def up(src, alt=''):
    try: return image_ref(upload_url(src), alt or None, k=K())
    except Exception as e: print('   img KO', src[-60:], str(e)[:60]); return None

def dims(img):
    try:
        d = query('*[_id==$i][0].metadata.dimensions', i=img['asset']['_ref'])
        return (d or {}).get('width', 9999)
    except Exception:
        return 9999

def gallery_or_logos(title, imgs):
    if len(imgs) >= 4 and all(dims(i) <= 520 for i in imgs):
        return {'_type': 'logoWallBlock', '_key': K(), 'title': title, 'logos': [{'_type': 'logo', '_key': K(), 'name': i.get('alt') or '', 'image': i} for i in imgs]}
    return {'_type': 'galleryBlock', '_key': K(), 'title': title, 'images': imgs}

def block_of(sec, first):
    text = T(sec)
    if 'Sede Legale' in text or 'Iscritta nel registro' in text: return None
    heads = [T(h) for h in sec.find_all(['h1', 'h2', 'h3', 'h4'])]
    title = heads[0] if heads else ''
    if 'JavaScript è obbligatorio' in text or sec.find('form') or sec.find('iframe', src=re.compile('hsforms|typeform|jotform|tally', re.I)):
        return {'_type': 'formBlock', '_key': K(), 'title': title or 'Contattaci', 'formType': 'dealer'}
    counters = sec.select('.elementor-counter')
    if len(counters) >= 2:
        items = []
        for c in counters:
            num = T(c.select_one('.elementor-counter-number-wrapper')) or ''
            ttl = T(c.select_one('.elementor-counter-title'))
            items.append({'_type': 'feature', '_key': K(), 'title': num.strip(), 'text': ttl})
        return {'_type': 'featureGridBlock', '_key': K(), 'title': '', 'items': items}
    boxes = sec.select('.elementor-image-box-wrapper, .elementor-icon-box-wrapper')
    if len(boxes) >= 2:
        cards = []
        for b in boxes:
            c = {'_type': 'card', '_key': K(), 'title': T(b.select_one('[class*="-title"]')), 'text': T(b.select_one('[class*="-description"]'))}
            a = b.find('a', href=True)
            if a and a['href'] not in ('#', ''): c['link'] = {'_type': 'link', '_key': K(), 'label': 'Scopri', 'href': a['href'].replace(BASE, '') or '/', 'external': a['href'].startswith('http') and BASE not in a['href']}
            im = imgs_of(b, 1)
            if im:
                r = up(*im[0]);
                if r: c['image'] = r
            cards.append(c)
        return {'_type': 'cardsBlock', '_key': K(), 'title': title, 'cards': cards}
    body = html_to_pt(str(sec), upload=False)
    texts = [b for b in body if b.get('_type') == 'block']
    ims = imgs_of(sec)
    # elimina eventuale primo titolo dal corpo
    if texts and title and ''.join(s['text'] for s in texts[0]['children']).strip() == title.strip():
        texts = texts[1:]; body = [b for b in body if b is not texts]  # titolo gestito a parte
        body = [b for b in body if b.get('_type') != 'block' or ''.join(s['text'] for s in b['children']).strip() != title.strip()]
    body = [b for b in body if b.get('_type') == 'block']
    if first:
        lead = ' '.join(''.join(s['text'] for s in b['children']) for b in body if b['style'] == 'normal')[:400]
        t0 = title or T(sec)[:80]
        m0 = re.match(r'^(.{12,80}?[a-z]{3}\.)\s+([A-Z].+)$', t0)
        if m0: t0, lead = m0.group(1), (m0.group(2) + ' ' + lead).strip()
        hero = {'_type': 'heroBlock', '_key': K(), 'title': t0, 'lead': lead, 'ctas': ctas_of(sec)}
        if ims:
            r = up(*ims[0]);
            if r: hero['image'] = r
        return hero
    if not body and ims:
        imgs = [r for r in (up(s, a) for s, a in ims[:12]) if r]
        return gallery_or_logos(title, imgs) if len(imgs) > 1 else (
            {'_type': 'imageTextBlock', '_key': K(), 'title': title, 'image': imgs[0], 'body': []} if imgs else None)
    if not body and not title: return None
    if len(ims) == 1 and body:
        r = up(*ims[0])
        return {'_type': 'imageTextBlock', '_key': K(), 'title': title, 'body': body, 'image': r, 'imageRight': True, 'ctas': ctas_of(sec)} if r else {'_type': 'richTextBlock', '_key': K(), 'title': title, 'body': body}
    out = {'_type': 'richTextBlock', '_key': K(), 'title': title, 'body': body}
    return out

def split_blocks(sec, first):
    """Sezione con un unico widget HTML (es. Medical Division): spezzo il contenuto ai titoli H2."""
    body = html_to_pt(str(sec), upload=False)
    groups, cur = [], {'title': '', 'body': []}
    for b in body:
        if b.get('_type') == 'block' and b['style'] == 'h2':
            if cur['title'] or cur['body']: groups.append(cur)
            cur = {'title': ' '.join(''.join(c['text'] for c in b['children']).split()), 'body': []}
        else:
            cur['body'].append(b)
    groups.append(cur)
    out = []
    for i, g in enumerate(groups):
        pt = [b for b in g['body'] if b.get('_type') == 'block']
        if not g['title'] and not pt: continue
        if i == 0 and first:
            out.append({'_type': 'heroBlock', '_key': K(), 'title': g['title'] or 'Layerloop', 'lead': ' '.join(''.join(c['text'] for c in b['children']) for b in pt[:1])})
        else:
            out.append({'_type': 'richTextBlock', '_key': K(), 'title': g['title'], 'body': pt})
    ims = imgs_of(sec)
    imgs = [r for r in (up(a, b) for a, b in ims[:10]) if r]
    if len(imgs) > 1: out.append(gallery_or_logos('', imgs))
    return out

def convert(slug):
    p = PAGES[slug]
    s = BeautifulSoup(p['content']['rendered'], 'html.parser')
    for t in s(['style', 'script']): t.decompose()
    tops = s.select('.elementor-top-section') or s.select('section')
    blocks, first = [], True
    for sec in tops:
        if len(str(sec)) > 12000 and len(sec.select('.elementor-widget-html')) == 1 and len(sec.find_all('h2')) >= 3:
            for b in split_blocks(sec, first):
                blocks.append(b); first = False if b['_type'] == 'heroBlock' else first
            first = False
            continue
        b = block_of(sec, first)
        if b:
            blocks.append(b)
            if b['_type'] == 'heroBlock': first = False
        if first and b is None: continue
        if b is not None: first = False
    return blocks

PAGE_MAP = {  # slug WP -> (id Sanity, slug nuovo, titolo, lingua)
    'rivenditori-copy': ('page-rivenditori', 'rivenditori', 'Rivenditori', 'it'),
    'medical_division': ('page-medical-division', 'medical-division', 'Medical Division', 'it'),
    'medical-division-en': ('page-medical-division-en', 'medical-division-en', 'Medical Division', 'en'),
    'layerloop-academy': ('page-layerloop-academy', 'layerloop-academy', 'Layerloop Academy', 'it'),
}
SECTOR_MAP = {'settore-nautico': 'sector-nautical', 'settore-automotive': 'sector-automotive', 'settore-medico-podologia': 'sector-medical', 'manufacturing-sector-automation': 'sector-manufacturing'}

if __name__ == '__main__':
    only = set(sys.argv[1:])
    docs = []
    for wp, (sid, new, title, lang) in PAGE_MAP.items():
        if only and wp not in only: continue
        print('page', wp, flush=True)
        bl = convert(wp)
        docs.append({'_id': sid, '_type': 'page', 'title': title, 'slug': {'_type': 'slug', 'current': new}, 'language': lang, 'blocks': bl, 'legacyUrl': PAGES[wp]['link'], 'seo': {'_type': 'seo', 'title': html.unescape(PAGES[wp]['title']['rendered'])}})
        print('   ->', [b['_type'].replace('Block', '') for b in bl])
    upsert(docs)
    for wp, sid in SECTOR_MAP.items():
        if only and wp not in only: continue
        print('sector', wp, flush=True)
        bl = convert(wp)
        hero = next((b for b in bl if b['_type'] == 'heroBlock'), None)
        patch = {'blocks': [b for b in bl if b['_type'] != 'heroBlock']}
        if hero:
            patch['headline'] = hero['title']
            if hero.get('image'): patch['heroImage'] = hero['image']
            if hero.get('lead'): patch['summary'] = hero['lead'][:300]
        mutate([{'patch': {'id': sid, 'set': patch}}])
        print('   ->', [b['_type'].replace('Block', '') for b in bl])
