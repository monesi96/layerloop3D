"""Utility condivise per importare contenuti in Sanity (dataset layerloop)."""
import hashlib, json, mimetypes, os, re, urllib.parse, urllib.request, urllib.error
from bs4 import BeautifulSoup, NavigableString, Tag

PROJECT = os.environ.get('SANITY_PROJECT', '5033nuuu')
DATASET = os.environ.get('SANITY_DATASET', 'production')
TOKEN = os.environ.get('SANITY_API_KEY') or os.environ.get('SANITY_TOKEN') or ''
API = f'https://{PROJECT}.api.sanity.io/v2021-06-07'
UA = {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124 Safari/537.36'}
_asset_cache = {}


def _req(url, data=None, headers=None, method=None):
    h = dict(headers or {})
    if TOKEN:
        h['Authorization'] = 'Bearer ' + TOKEN
    r = urllib.request.Request(url, data=data, headers=h, method=method)
    try:
        with urllib.request.urlopen(r, timeout=120) as resp:
            return json.loads(resp.read() or b'{}')
    except urllib.error.HTTPError as e:
        raise RuntimeError(f'{e.code} {url}: {e.read()[:400]!r}')


def mutate(mutations):
    return _req(f'{API}/data/mutate/{DATASET}?returnIds=true', json.dumps({'mutations': mutations}).encode(), {'Content-Type': 'application/json'})


def query(groq, **params):
    q = urllib.parse.urlencode({'query': groq, **{f'${k}': json.dumps(v) for k, v in params.items()}})
    return _req(f'{API}/data/query/{DATASET}?{q}')['result']


def upsert(docs, chunk=None):
    chunk = chunk or len(docs)
    for i in range(0, len(docs), chunk):
        mutate([{'createOrReplace': d} for d in docs[i:i + chunk]])


def key(seed):
    return hashlib.md5(str(seed).encode()).hexdigest()[:12]


def fetch_bytes(url):
    r = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(r, timeout=120) as resp:
        return resp.read(), resp.headers.get('Content-Type', '')


def upload_asset(kind, data, filename, ctype=None):
    """kind: 'image' | 'file'. Ritorna l'_id dell'asset (deduplicato da Sanity per hash)."""
    sha = hashlib.sha1(data).hexdigest()
    if sha in _asset_cache:
        return _asset_cache[sha]
    ctype = ctype or mimetypes.guess_type(filename)[0] or 'application/octet-stream'
    url = f'{API}/assets/{kind}s/{DATASET}?filename={urllib.parse.quote(filename)}'
    res = _req(url, data, {'Content-Type': ctype})
    _asset_cache[sha] = res['document']['_id']
    return _asset_cache[sha]


def upload_url(url, kind='image'):
    data, ctype = fetch_bytes(url)
    name = os.path.basename(urllib.parse.urlparse(url).path) or 'file'
    return upload_asset(kind, data, name, ctype.split(';')[0] or None)


def upload_path(path, kind='image'):
    with open(path, 'rb') as f:
        return upload_asset(kind, f.read(), os.path.basename(path))


def image_ref(asset_id, alt=None, caption=None, k=None):
    o = {'_type': 'mediaImage', 'asset': {'_type': 'reference', '_ref': asset_id}}
    if alt: o['alt'] = alt
    if caption: o['caption'] = caption
    if k: o['_key'] = k
    return o


def file_ref(asset_id):
    return {'_type': 'file', 'asset': {'_type': 'reference', '_ref': asset_id}}


def ref(doc_id, k=None):
    o = {'_type': 'reference', '_ref': doc_id}
    if k: o['_key'] = k
    return o


# ---------------- Portable Text ----------------
def _span(text, marks, n):
    return {'_type': 'span', '_key': key(f'{n}{text[:20]}{len(marks)}'), 'text': text, 'marks': list(marks)}


def _inline(node, marks, defs, spans, n):
    if isinstance(node, NavigableString):
        t = re.sub(r'\s+', ' ', str(node))
        if t:
            spans.append(_span(t, marks, n + len(spans)))
        return
    if not isinstance(node, Tag):
        return
    name = node.name
    m = list(marks)
    if name in ('strong', 'b'):
        m.append('strong')
    elif name in ('em', 'i'):
        m.append('em')
    elif name == 'a' and node.get('href'):
        kk = key('lnk' + node['href'] + str(n + len(defs)))
        defs.append({'_type': 'link', '_key': kk, 'href': node['href']})
        m.append(kk)
    elif name == 'br':
        spans.append(_span('\n', marks, n + len(spans)))
        return
    for c in node.children:
        _inline(c, m, defs, spans, n)


def _block(node, style, n, list_item=None, level=1):
    spans, defs = [], []
    _inline(node, [], defs, spans, n)
    # normalizza spazi ai bordi
    if spans:
        spans[0]['text'] = spans[0]['text'].lstrip()
        spans[-1]['text'] = spans[-1]['text'].rstrip()
    spans = [s for s in spans if s['text']]
    if not spans or not ''.join(s['text'] for s in spans).strip():
        return None
    b = {'_type': 'block', '_key': key(f'b{n}'), 'style': style, 'children': spans, 'markDefs': defs}
    if list_item:
        b['listItem'] = list_item
        b['level'] = level
    return b


def _hires(src):
    return re.sub(r'-\d+x\d+(\.\w+)$', r'\1', src)


def _youtube(src):
    m = re.search(r'(?:youtube(?:-nocookie)?\.com/embed/|youtu\.be/)([\w-]{11})', src or '')
    return f'https://www.youtube.com/watch?v={m.group(1)}' if m else None


def html_to_pt(html, base='https://www.layerloop3d.com', upload=True, skip_first_image=False):
    soup = BeautifulSoup(html, 'html.parser')
    for t in soup(['style', 'script', 'noscript', 'form', 'button', 'svg', 'nav']):
        t.decompose()
    out, seen_img, n = [], set(), 0

    def add_list(lst, level=1):
        nonlocal n
        kind = 'number' if lst.name == 'ol' else 'bullet'
        for li in lst.find_all('li', recursive=False):
            n += 1
            holder = BeautifulSoup('<x></x>', 'html.parser').x
            for c in list(li.children):
                if isinstance(c, Tag) and c.name in ('ul', 'ol'):
                    continue
                holder.append(c.extract() if hasattr(c, 'extract') else c)
            b = _block(holder, 'normal', n, kind, level)
            if b: out.append(b)
            for sub in li.find_all(['ul', 'ol'], recursive=False):
                add_list(sub, level + 1)

    def img_block(img):
        nonlocal n
        src = img.get('data-src') or img.get('src') or ''
        if not src or src.startswith('data:'):
            return
        src = urllib.parse.urljoin(base, _hires(src))
        if src in seen_img:
            return
        seen_img.add(src)
        n += 1
        alt = (img.get('alt') or '').strip() or None
        if upload:
            try:
                aid = upload_url(src)
            except Exception as e:
                print('   img KO', src, str(e)[:80]); return
            out.append(image_ref(aid, alt, k=key(f'i{n}')))

    def walk(el):
        nonlocal n
        for c in el.children:
            if not isinstance(c, Tag):
                continue
            nm = c.name
            if nm in ('h1', 'h2', 'h3', 'h4', 'h5', 'h6'):
                n += 1
                st = {'h1': 'h2', 'h2': 'h2', 'h3': 'h3', 'h4': 'h4', 'h5': 'h4', 'h6': 'h4'}[nm]
                b = _block(c, st, n)
                if b: out.append(b)
            elif nm == 'p':
                imgs = c.find_all('img')
                for im in imgs:
                    img_block(im)
                n += 1
                b = _block(c, 'normal', n)
                if b: out.append(b)
            elif nm in ('ul', 'ol'):
                add_list(c)
            elif nm == 'blockquote':
                n += 1
                b = _block(c, 'blockquote', n)
                if b: out.append(b)
            elif nm == 'img':
                img_block(c)
            elif nm == 'figure':
                for im in c.find_all('img'):
                    img_block(im)
                cap = c.find('figcaption')
                if cap and out and out[-1].get('_type') == 'mediaImage':
                    out[-1]['caption'] = cap.get_text(' ', strip=True)
            elif nm == 'iframe':
                u = _youtube(c.get('src') or c.get('data-src'))
                if u:
                    n += 1
                    out.append({'_type': 'videoEmbed', '_key': key(f'v{n}'), 'url': u})
            elif nm == 'table':
                for tr in c.find_all('tr'):
                    cells = [td.get_text(' ', strip=True) for td in tr.find_all(['td', 'th'])]
                    if any(cells):
                        n += 1
                        b = _block(BeautifulSoup('<p>' + ' — '.join(cells) + '</p>', 'html.parser').p, 'normal', n)
                        if b: out.append(b)
            else:
                walk(c)

    walk(soup)
    # rimuove duplicati consecutivi
    res = []
    for b in out:
        if res and b.get('_type') == 'block' and res[-1].get('_type') == 'block' and \
           ''.join(s['text'] for s in b['children']) == ''.join(s['text'] for s in res[-1]['children']):
            continue
        res.append(b)
    return res


def md_to_pt(md, image_resolver=None):
    """Markdown semplice (titoli, paragrafi, liste, **grassetto**, *corsivo*, [link](url), immagini)."""
    out, n = [], 0
    lines = md.split('\n')
    i = 0

    def inline(text):
        spans, defs = [], []
        pos = 0
        pat = re.compile(r'\*\*(.+?)\*\*|\*(.+?)\*|\[(.+?)\]\((.+?)\)')
        for m in pat.finditer(text):
            if m.start() > pos:
                spans.append(_span(text[pos:m.start()], [], n + len(spans)))
            if m.group(1):
                spans.append(_span(m.group(1), ['strong'], n + len(spans)))
            elif m.group(2):
                spans.append(_span(m.group(2), ['em'], n + len(spans)))
            else:
                kk = key('l' + m.group(4) + str(n + len(defs)))
                defs.append({'_type': 'link', '_key': kk, 'href': m.group(4)})
                spans.append(_span(m.group(3), [kk], n + len(spans)))
            pos = m.end()
        if pos < len(text):
            spans.append(_span(text[pos:], [], n + len(spans)))
        return spans, defs

    def block(text, style='normal', li=None):
        nonlocal n
        n += 1
        spans, defs = inline(text.strip())
        if not spans: return
        b = {'_type': 'block', '_key': key(f'm{n}'), 'style': style, 'children': spans, 'markDefs': defs}
        if li: b['listItem'] = li; b['level'] = 1
        out.append(b)

    para = []
    def flush():
        if para:
            block(' '.join(p.strip() for p in para)); para.clear()

    while i < len(lines):
        ln = lines[i]
        s = ln.strip()
        if not s:
            flush()
        elif s.startswith('#'):
            flush()
            lvl = len(s) - len(s.lstrip('#'))
            block(s.lstrip('#').strip(), {1: 'h2', 2: 'h2', 3: 'h3'}.get(lvl, 'h4'))
        elif re.match(r'^[-*] ', s):
            flush(); item = s[2:]
            while i + 1 < len(lines) and lines[i + 1].startswith((' ', '\t')) and lines[i + 1].strip() and not re.match(r'^\s*([-*]|\d+\.) ', lines[i + 1]):
                i += 1; item += ' ' + lines[i].strip()
            block(item, li='bullet')
        elif re.match(r'^\d+\. ', s):
            flush(); item = re.sub(r'^\d+\. ', '', s)
            while i + 1 < len(lines) and lines[i + 1].startswith((' ', '\t')) and lines[i + 1].strip() and not re.match(r'^\s*([-*]|\d+\.) ', lines[i + 1]):
                i += 1; item += ' ' + lines[i].strip()
            block(item, li='number')
        elif s.startswith('>'):
            flush(); block(s.lstrip('> '), 'blockquote')
        elif re.match(r'^!\[(.*?)\]\((.+?)\)$', s) and image_resolver:
            flush(); m = re.match(r'^!\[(.*?)\]\((.+?)\)$', s); aid = image_resolver(m.group(2))
            if aid: n += 1; out.append(image_ref(aid, m.group(1) or None, k=key(f'mi{n}')))
        else:
            para.append(s)
        i += 1
    flush()
    return out


def slug(s):
    s = s.lower()
    s = re.sub(r'[àáâä]', 'a', s); s = re.sub(r'[èéêë]', 'e', s); s = re.sub(r'[ìíîï]', 'i', s)
    s = re.sub(r'[òóôö]', 'o', s); s = re.sub(r'[ùúûü]', 'u', s)
    return re.sub(r'[^a-z0-9]+', '-', s).strip('-')[:96]
