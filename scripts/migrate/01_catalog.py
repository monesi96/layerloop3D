#!/usr/bin/env python3
"""Importa in Sanity il catalogo: materiali, stampanti, settori, case study, impostazioni sito."""
import json, os, re, sys, html
sys.path.insert(0, os.path.dirname(__file__))
from sanity_lib import *

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SITE = os.path.join(ROOT, 'landing', 'site')
D = os.path.join(os.path.dirname(__file__), 'data')
mats = json.load(open(f'{D}/mats.json'))
pr = json.load(open(f'{D}/printers.json'))
img = lambda rel: upload_path(os.path.join(SITE, rel))
docs = []
fam_of = {'std': 'Standard', 'fib': 'Rinforzati con fibra', 'ind': 'Industriali', 'met': 'Metallo e ceramica', 'bio': 'Standard'}

# ---------- stampanti (id fissi per i riferimenti)
PID = {'extend': 'printer-extend', 'next': 'printer-next', 'xe': 'printer-xe'}

# ---------- materiali
for i, m in enumerate(mats):
    fam = 'Standard'
    f = m.get('f') or []
    if 'fib' in f or 'carbon' in f: fam = 'Rinforzati con fibra'
    if 'ind' in f: fam = 'Industriali'
    props = [{'_key': key(f'p{m["id"]}{j}'), '_type': 'prop', 'label': k, 'value': v} for j, (k, v) in enumerate((m.get('props') or {}).items())] if isinstance(m.get('props'), dict) else []
    docs.append({
        '_id': f'material-{m["id"]}', '_type': 'material', 'name': m['n'], 'slug': {'_type': 'slug', 'current': m['id']},
        'alias': m['a'], 'family': fam, 'order': i, 'categories': m.get('f') or [], 'keyTrait': m.get('key'), 'colors': m.get('c') or [], 'description': m['d'], 'tags': m['t'],
        'image': image_ref(img(f'media/mat/{m["id"]}.webp'), alt=f'Pezzo stampato in {m["n"]}'),
        'printers': [ref(PID[x.lower()], key(f'mp{m["id"]}{x}')) for x in m['m'] if x.lower() in PID],
        'properties': props,
    })

# ---------- stampanti
def specs(lst, pfx):
    return [{'_key': key(f'{pfx}s{i}'), '_type': 'spec', 'label': a, 'value': b} for i, (a, b) in enumerate(lst)]

def printer_doc(k, name, headline, tagline, lead, chips, card, hero, highlights, specs_l, order, steps=None, mat_ids=None, sector_names=None):
    d = {
        '_id': PID[k], '_type': 'printer', 'name': name, 'slug': {'_type': 'slug', 'current': k}, 'order': order,
        'headline': headline, 'tagline': tagline, 'lead': lead, 'chips': chips,
        'cardImage': image_ref(img(card), alt=f'Layerloop {name}'), 'heroImage': image_ref(img(hero), alt=f'Layerloop {name}'),
        'highlights': [{'_key': key(f'{k}h{i}'), '_type': 'highlight', 'value': a, 'text': b} for i, (a, b) in enumerate(highlights)],
        'specs': specs(specs_l, k),
        'materials': [ref(f'material-{x}', key(f'{k}m{x}')) for x in (mat_ids or [])],
        'seo': {'_type': 'seo', 'title': f'Layerloop {name}', 'description': lead[:160]},
        'legacyUrl': f'https://www.layerloop3d.com/layerloop-{k}/',
    }
    P = pr.get({'extend': 'EXT', 'xe': 'XE'}.get(k, ''), None)
    if P:
        d.update({
            'sectionTitle': P['prodh'], 'sectionText': P['prodp'], 'sectionImage': image_ref(img(P['pk']), alt=f'Layerloop {name}'),
            'points': [{'_key': key(f'{k}pt{i}'), '_type': 'point', 'title': a, 'text': b} for i, (a, b) in enumerate(P['points'])],
            'gallery': [image_ref(img(a), alt=b, caption=b, k=key(f'{k}g{i}')) for i, (a, b) in enumerate(P['two'])],
            'optionTitle': P['opt'][0], 'optionText': P['opt'][1], 'optionImage': image_ref(img(P['opt_img']), alt=P['opt'][0]),
            'specIntro': P['specp'], 'materialsIntro': P['matp'],
            'materialFamilies': [{'_key': key(f'{k}f{i}'), '_type': 'family', 'title': a, 'text': b} for i, (a, b) in enumerate(P['fam'])],
            'sectorHighlights': [ref('sector-' + slug(html.unescape(n_)), key(f'{k}sh{n_}')) for n_ in P['on']],
        })
        mm = re.search(r'<h2>(.*?)</h2><p>(.*?)</p></div></section><div class="reveal-media" data-reveal[^>]*><img src="([^"]+)"', P.get('reveal','').replace('<br>', ' '))
        if mm:
            d.update({'revealTitle': mm.group(1), 'revealText': mm.group(2), 'revealImage': image_ref(img(mm.group(3)), alt=mm.group(1))})
    if steps:
        d['tourSteps'] = [{'_key': key(f'{k}t{i}'), '_type': 'tourStep', 'title': s[0], 'text': s[1], 'image': image_ref(img(f'media/next/{s[2]}'), alt=s[3])} for i, s in enumerate(steps)]
    return d

E_, X_ = pr['EXT'], pr['XE']
mats_for = lambda key_: [m['id'] for m in mats if key_.upper() in m['m']]
nxt = open(f'{SITE}/next.html').read()
steps = json.loads(html.unescape(re.search(r"data-steps='(\[.*?\])'", nxt, re.S).group(1)))
next_specs = re.findall(r'<tr><th>(.*?)</th><td>(.*?)</td>', nxt)
CARD = {
    'extend': ('Feel the warm side of 3D printing.', 'Con la camera calda della nuova Layerloop Extend stampi materiali tecnici con estrema precisione, anche nei dettagli più piccoli.', ['500 × 300 × ∞ mm', 'Estrusore 450 °C', 'Camera 90 °C']),
    'next': ('What if the power of 3D was infinity.', 'Layerloop Next è una stampante a camera aperta con asse di stampa a 30°, pensata per la produzione continua senza limiti di lunghezza.', ['200 / 300 / 400 mm', '∞ profondità', 'Produzione 24/7']),
    'xe': ('When proficiency meets design.', 'Consigliata nel medicale e in podologia, Layerloop XE lavora bene con i materiali flessibili come la gomma, in formato desktop.', ['Desktop', '200 × 180 × ∞ mm', 'Fino a 250 °C']),
}
docs += [
    printer_doc('extend', 'Extend', E_['h1'], 'Camera chiusa · materiali tecnici', E_['lead'], E_['chips'], 'media/extend/machine.webp', 'media/extend/machine.webp', E_['feat'], E_['specs'], 0, mat_ids=mats_for('extend')),
    printer_doc('next', 'Next', 'What if the power of 3D was infinity.', 'Produzione in serie 24/7', 'Layerloop Next è la stampante 3D a camera aperta con asse a 30° e rullo di stampa integrato. Produce pezzi di lunghezza infinita, giorno e notte, senza operatore.',
                ['200 / 300 / 400 mm', '∞ profondità', 'Produzione 24/7', 'Estrusore 300 °C'], 'media/home/next-card.webp', 'media/home/next-card.webp',
                [('30°', "L'inclinazione dell'asse di stampa permette di produrre pezzi finiti senza alcun supporto."), ('24 / 7', 'Il nastro produce 24 ore su 24, 7 giorni su 7, per la produzione in massa dei tuoi componenti senza operatore.'), ('∞', 'Il rullo di stampa integrato porta il pezzo fuori dall\'area di stampa: la lunghezza non ha limite.')],
                next_specs, 1, steps=steps, mat_ids=mats_for('next')),
    printer_doc('xe', 'XE', X_['h1'], 'Desktop · medicale e materiali flessibili', X_['lead'], X_['chips'], 'media/xe/machine.webp', 'media/xe/machine.webp', X_['feat'], X_['specs'], 2, mat_ids=mats_for('xe')),
]

# ---------- settori
SECTORS = [
    ('Automotive', 'Componenti di grandi dimensioni, personalizzazione, retrofit.', ['next', 'extend'], ['abs', 'asa', 'pa12cf'], 'applicazione-carter-per-macchinari-industriali', 'https://www.layerloop3d.com/settore-automotive/'),
    ('Medical', 'Plantari, suole e dispositivi personalizzati.', ['xe', 'next'], ['tpu', 'gpro', 'gcarb'], 'protesi-medicali-su-misura-il-potenziale-della-stampa-fff-inclinata-a-30', 'https://www.layerloop3d.com/settore-medico-podologia/'),
    ('Nautical', 'Grandi componenti prodotti in un unico pezzo.', ['extend', 'next'], ['asa', 'pa12cf', 'abs'], 'stampa-3d-di-grande-formato-per-il-settore-nautico-2', 'https://www.layerloop3d.com/settore-nautico/'),
    ('Manufacturing', 'Produzione in serie e componenti funzionali.', ['next', 'extend'], ['petg', 'abs', 'pa12cf'], 'applicazione-carter-per-macchinari-industriali', 'https://www.layerloop3d.com/manufacturing-sector-automation/'),
    ('R&D', 'Prototipi funzionali e iterazione rapida.', ['xe', 'next'], ['pla', 'petg', 'tpu'], 'unala-da-110-metri-in-un-unico-pezzo-la-stampa-3d-large-format-per-laerospace', None),
    ('Custom production', 'Piccole serie e produzione on-demand.', ['xe', 'next'], ['pla', 'petg', 'tpu'], 'dal-file-alla-scarpa-stampata-in-foam-in-12-ore', None),
]
for i, (n, d, ms, mt, cs, url) in enumerate(SECTORS):
    docs.append({
        '_id': f'sector-{slug(n)}', '_type': 'sector', 'name': n, 'slug': {'_type': 'slug', 'current': slug(n)}, 'order': i,
        'published': bool(url), 'summary': d,
        'printers': [ref(PID[x], key(f's{n}{x}')) for x in ms], 'materials': [ref(f'material-{x}', key(f's{n}{x}')) for x in mt],
        'caseStudies': [ref(f'caseStudy-{cs}', key(f's{n}{cs}'))], 'legacyUrl': url or '',
    })

# ---------- case study
cover_idx = {c: i + 1 for i, c in enumerate(['applicazione-carter-per-macchinari-industriali', 'una-nuova-dimensione-del-comfort-il-cuscino-ortopedico-stampato-in-3d', 'unala-da-110-metri-in-un-unico-pezzo-la-stampa-3d-large-format-per-laerospace', 'protesi-medicali-su-misura-il-potenziale-della-stampa-fff-inclinata-a-30', 'stampa-3d-di-grande-formato-per-il-settore-nautico-2', 'dal-file-alla-scarpa-stampata-in-foam-in-12-ore'])}
sector_of = {'applicazione-carter-per-macchinari-industriali': ['manufacturing', 'automotive'], 'una-nuova-dimensione-del-comfort-il-cuscino-ortopedico-stampato-in-3d': ['medical'], 'unala-da-110-metri-in-un-unico-pezzo-la-stampa-3d-large-format-per-laerospace': ['r-d'], 'protesi-medicali-su-misura-il-potenziale-della-stampa-fff-inclinata-a-30': ['medical'], 'stampa-3d-di-grande-formato-per-il-settore-nautico-2': ['nautical'], 'dal-file-alla-scarpa-stampata-in-foam-in-12-ore': ['custom-production']}
printer_of = {'applicazione-carter-per-macchinari-industriali': 'next', 'una-nuova-dimensione-del-comfort-il-cuscino-ortopedico-stampato-in-3d': 'extend', 'unala-da-110-metri-in-un-unico-pezzo-la-stampa-3d-large-format-per-laerospace': 'extend', 'protesi-medicali-su-misura-il-potenziale-della-stampa-fff-inclinata-a-30': 'xe', 'stampa-3d-di-grande-formato-per-il-settore-nautico-2': 'extend', 'dal-file-alla-scarpa-stampata-in-foam-in-12-ore': 'xe'}
for w in json.load(open(f'{D}/wp_whitepapers.json')):
    sl = w['slug']
    title = html.unescape(re.sub('<[^>]+>', '', w['title']['rendered'])).replace(' :', ':').strip()
    excerpt = html.unescape(re.sub('<[^>]+>', '', w.get('excerpt', {}).get('rendered', ''))).strip()
    docs.append({
        '_id': f'caseStudy-{sl}', '_type': 'caseStudy', 'title': title, 'slug': {'_type': 'slug', 'current': sl},
        'date': w['date'][:10], 'summary': excerpt, 'cover': image_ref(img(f'media/cases/cover-{cover_idx[sl]}.webp'), alt=title),
        'sectors': [ref(f'sector-{s}', key(f'c{sl}{s}')) for s in sector_of[sl]], 'printer': ref(PID[printer_of[sl]]),
        'legacyUrl': w['link'],
    })

# ---------- impostazioni sito
L = lambda label, href, ext=False, k=None: {'_type': 'link', '_key': key(f'l{label}{href}'), 'label': label, 'href': href, 'external': ext}
docs.append({
    '_id': 'siteSettings', '_type': 'siteSettings', 'title': 'Layerloop', 'demoEmail': 'info@layerloop3d.com',
    'headerLinks': [
        {'_key': 'n1', '_type': 'navItem', 'label': 'Stampanti', 'kind': 'mega-printers'},
        {'_key': 'n2', '_type': 'navItem', 'label': 'Settori', 'kind': 'mega-sectors'},
        {'_key': 'n3', '_type': 'navItem', 'label': 'Materiali', 'kind': 'mega-materials'},
        {'_key': 'n4', '_type': 'navItem', 'label': 'Case Study', 'kind': 'mega-cases'},
        {'_key': 'n5', '_type': 'navItem', 'label': 'Layerloop Academy', 'kind': 'link', 'href': '/layerloop-academy', 'external': False},
        {'_key': 'n6', '_type': 'navItem', 'label': 'Medical Division', 'kind': 'link', 'href': '/medical-division', 'external': False},
        {'_key': 'n7', '_type': 'navItem', 'label': 'Rivenditori', 'kind': 'link', 'href': '/rivenditori', 'external': False},
    ],
    'headerCta': L('Richiedi una demo', 'mailto:info@layerloop3d.com?subject=Richiesta%20demo'),
    'footerClaim': 'Sistemi di stampa 3D a nastro per la produzione industriale. Progettati e costruiti in Italia.',
    'address': 'Via Calabria 12 – Z.I.\n70021 Acquaviva delle Fonti (BA)', 'phone': '080 8890568', 'email': 'info@layerloop3d.com',
    'footerColumns': [
        {'_key': 'f1', '_type': 'footerColumn', 'title': 'Stampanti', 'links': [L('Extend', '/stampanti/extend'), L('Next', '/stampanti/next'), L('XE', '/stampanti/xe'), L('Materiali', '/materiali')]},
        {'_key': 'f2', '_type': 'footerColumn', 'title': 'Azienda', 'links': [L('Blog', '/blog'), L('Case study', '/case-study'), L('Layerloop Academy', '/layerloop-academy'), L('Medical Division', '/medical-division'), L('Rivenditori', '/rivenditori')]},
        {'_key': 'f3', '_type': 'footerColumn', 'title': 'Note legali', 'links': [L('Privacy Policy', '/privacy-policy'), L('Cookie Policy', '/cookie-policy')]},
    ],
    'legal': 'Layerloop S.r.l. · Consociata Gruppo Finlogic SpA',
})

for d in docs:
    if d['_type'] == 'printer':
        t, x, c = CARD[d['slug']['current']]
        d.update({'cardTitle': t, 'cardText': x, 'cardChips': c})
        if d['slug']['current'] == 'extend':
            d['cardVideo'] = file_ref(upload_path(os.path.join(SITE, 'media/home/extend.mp4'), 'file'))
            d['cardPoster'] = image_ref(upload_path(os.path.join(ROOT, 'web/public/media/home/extend-poster.jpg')), alt='Layerloop Extend')
if query('count(*[_id=="siteSettings"])'):
    docs = [d for d in docs if d['_id'] != 'siteSettings']  # non sovrascrivo menu/footer già curati nello Studio
upsert(docs)
print('importati', len(docs), 'documenti:', {t: sum(1 for d in docs if d['_type'] == t) for t in sorted({d['_type'] for d in docs})})
