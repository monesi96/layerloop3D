# ATTENZIONE (SOURCE OF TRUTH): dal 5/11 il sito vive in web/ (content/*.html, app/css/design.css). Non rilanciare questo script: sovrascrive le modifiche.
#!/usr/bin/env python3
"""Estrae dalle pagine statiche (landing/site/*.html) i frammenti usati dall'app Next.js:
- web/content/<pagina>.html : markup del <main> con segnaposto <!--@...--> per le parti alimentate da Sanity
- web/public/js/<pagina>.js : script specifici della pagina
- web/public/js/site.js     : script condivisi (header/megamenu, Lenis, selettore settori, lista materiali, cursore)
- web/app/css/<pagina>.css  : stile della pagina
"""
import re, os
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
S = f'{R}/landing/site/'
W = f'{R}/web/'
os.makedirs(f'{W}content', exist_ok=True); os.makedirs(f'{W}public/js', exist_ok=True); os.makedirs(f'{W}app/css', exist_ok=True)

def rd(f): return open(S + f).read()

def section(h, pat):
    """ritorna (start, end) della <section> che inizia con pat, gestendo l'annidamento"""
    m = re.search(pat, h)
    if not m: return None
    i = m.start(); depth = 0
    for t in re.finditer(r'<(/?)section\b', h[i:]):
        depth += -1 if t.group(1) else 1
        if depth == 0:
            j = h.index('>', i + t.start()) + 1
            return i, j
    return None

def replace_section(h, pat, marker):
    r = section(h, pat)
    if not r: print('  !! non trovata', pat); return h
    return h[:r[0]] + marker + h[r[1]:]

def scripts(h):
    out = []
    for m in re.finditer(r'<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>', h, re.S):
        out.append(m.group(1))
    return out

def make(page, extra=None, home=False):
    h = rd(page + '.html')
    css = ''.join(m.group(1) for m in re.finditer(r'<style[^>]*>(.*?)</style>', h, re.S))
    css = re.sub(r'url\((["\']?)(fonts|media|img)/', r'url(\1/\2/', css)
    css += '}' * max(0, css.count('{') - css.count('}'))
    if page not in ('extend', 'xe'):
        open(f'{W}app/css/{"home" if page == "index" else page}.css', 'w').write(css)
    sc = scripts(h)
    # script condivisi: header, lenis+sec+mx, cursore
    shared, own = [], []
    for s in sc:
        if "getElementById('sitehdr')" in s or "Lenis" in s and "secpick" in s or "createElement('div');c.className='cur'" in s:
            shared.append(s)
        elif s.lstrip().startswith('var MATS='):
            i = s.find('var MATS=['); j = s.find('\n', i)
            own.append(s[:i] + 'var MATS=[];' + s[j:])
        else:
            own.append(s)
    body = h[h.find('<body'):]
    body = re.sub(r'^<body[^>]*>', '', body)
    body = body[:body.rfind('</body>')]
    body = re.sub(r'<script(?![^>]*\bsrc=)[^>]*>.*?</script>', '', body, flags=re.S)
    body = re.sub(r'<script[^>]*\bsrc=[^>]*></script>', '', body)
    body = re.sub(r'<header class="sitehdr.*?</header>', '<!--@header-->', body, flags=re.S, count=1)
    body = re.sub(r'<footer class="footer".*?</footer>', '<!--@footer-->', body, flags=re.S, count=1)
    body = re.sub(r'<div class="bg" aria-hidden="true">.*?</div>', '', body, count=1, flags=re.S)
    if extra: body = extra(body)
    return body, shared, own

def home_extra(b):
    b = replace_section(b, r'<section class="wrap printers"', '<!--@printers-->')
    b = re.sub(r'<div class="secpick".*?<div class="sec-detail"[^>]*></div></div>', '<!--@sectors-->', b, flags=re.S, count=1)
    b = replace_section(b, r'<section class="cx sl" id="case"', '<!--@cases-->')
    b = re.sub(r'<div class="mp" data-machine=.*?<div class="mp-rail" role="list"></div></div></div>', '<!--@materials-->', b, flags=re.S, count=1)
    return b

def printer_extra(b):
    b = re.sub(r'<div class="secpick".*?<div class="sec-detail"[^>]*></div></div>', '<!--@sectors-->', b, flags=re.S, count=1)
    b = replace_section(b, r'<section class="cx sl" id="case"', '<!--@cases-->')
    b = re.sub(r'<div class="mp" data-machine=.*?<div class="mp-rail" role="list"></div></div></div>', '<!--@materials-->', b, flags=re.S, count=1)
    return b

LINKS = [('index.html#', '/#'), ('index.html', '/'), ('materiali.html#', '/materiali#'), ('materiali.html', '/materiali'),
         ('next.html', '/stampanti/next'), ('extend.html', '/stampanti/extend'), ('xe.html', '/stampanti/xe')]
def relink(t):
    for a, b in LINKS:
        t = t.replace('href="' + a, 'href="' + b).replace("'" + a, "'" + b).replace('"' + a + '"', '"' + b + '"')
    return t

pages = {'index': home_extra, 'next': printer_extra, 'extend': printer_extra, 'xe': printer_extra, 'materiali': None}
shared_all = None
for p, fx in pages.items():
    print(p)
    body, shared, own = make(p, fx)
    name = {'index': 'home'}.get(p, p)
    js = relink('\n;\n'.join(own))
    if p == 'materiali':
        i = js.find('var M=['); k = js.find('\n  ];', i) + len('\n  ];')
        assert i > 0 and k > i
        js = js[:i] + 'var M=window.__MATERIALS__||[];' + js[k:]
        import base64
        mm = re.search(r'<img class="mega-img" alt="" src="data:image/(\w+);base64,([^"]+)"', body)
        if mm:
            open(f'{W}public/media/materiali-hero.{mm.group(1)}', 'wb').write(base64.b64decode(mm.group(2)))
            body = body.replace(mm.group(0), f'<img class="mega-img" alt="" src="/media/materiali-hero.{mm.group(1)}"')
    if p == 'next':
        js = js.replace("'media/next/'+steps[ai][2]", "(steps[ai][2].indexOf('http')===0?steps[ai][2]:'/media/next/'+steps[ai][2])")
    if p in ('extend', 'xe'):
        body = ''
    open(f'{W}content/{name}.html', 'w').write(relink(body))
    open(f'{W}public/js/{name}.js', 'w').write(js)
    if p == 'index': shared_all = shared
    print('  frammento', len(body), 'B · script propri', len(own), '· condivisi', len(shared))
sj = relink('\n;\n'.join(shared_all))
sj = sj.replace("<img src=\"media/mat/'+m[0]+'.webp\"", "<img src=\"'+(m[2]||'media/mat/'+m[0]+'.webp')+'\"")
sj = sj.replace("(m[2]||'media/mat/'+m[0]+'.webp')", "(m[2]||'/media/mat/'+m[0]+'.webp')")
sj = sj.replace('<img src="media/mat/\'+m.id+\'.webp" alt=""', '<img src="\'+(m.img||\'/media/mat/\'+m.id+\'.webp\')+\'" alt=""')
open(f'{W}public/js/site.js', 'w').write(sj)
print('site.js', sum(map(len, shared_all)))
