"""Genera web/lib/wireframes.ts dai wireframe generati con lo studio (PNG -> vettori).
Uso: per ogni settore python3 scripts/web/wf_vectorize.py in.png out.json 2000 45 100 16 ; poi python3 scripts/web/genwf2.py <cartella con v_*.json>"""
import json, sys, os
src = sys.argv[1]
MAP = {'automotive': 'car', 'nautical': 'nautical', 'medical': 'medical', 'manufacturing': 'manufacturing', 'r-d': 'rd', 'custom-production': 'custom'}
VW, VH = 2000, 1000
out = {}
for slug, f in MAP.items():
    d = json.load(open(os.path.join(src, f'v_{f}.json')))
    ps = d['paths']
    xs = [x for p in ps for x, y in p['p']]; ys = [y for p in ps for x, y in p['p']]
    x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
    s = min(VW * .92 / (x1 - x0), VH * .92 / (y1 - y0))
    ox = (VW - (x1 - x0) * s) / 2 - x0 * s; oy = (VH - (y1 - y0) * s) / 2 - y0 * s
    def T(p): return [(round(x * s + ox), round(y * s + oy)) for x, y in p['p']]
    items = []
    for p in ps:
        q = T(p)
        cx = sum(a for a, b in q) / len(q); cy = sum(b for a, b in q) / len(q)
        items.append((cx + cy * .15, q, p['l'] * s))
    items.sort(key=lambda t: -t[2]); items = items[:420]  # solo i tratti piu' lunghi: leggerezza
    items.sort(key=lambda t: t[0])  # il disegno si forma da sinistra a destra
    N = len(items); html = []
    for i, (_, q, L) in enumerate(items):
        d_ = 'M%d %d' % q[0]
        px, py = q[0]
        for x, y in q[1:]:
            d_ += 'l%d %d' % (x - px, y - py); px, py = x, y
        t0 = round(i / N * 1500); dur = int(max(260, min(900, L * 1.1)))
        html.append(f'<path pathLength="1" style="--i:{t0};--d:{dur}" d="{d_}"/>')
    out[slug] = ''.join(html)
    print(slug, N, len(out[slug]) // 1024, 'KB')
open(os.path.join(os.path.dirname(__file__), '../../web/lib/wireframes.ts'), 'w').write(
    '// Wireframe dei settori: generati con lo studio e vettorializzati (scripts/web/genwf2.py). Non modificare a mano.\nexport const WF: Record<string, string> = ' + json.dumps(out) + '\n')
