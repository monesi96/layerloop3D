// Generatori di markup (stessa struttura HTML/CSS delle pagine statiche approvate), alimentati dai dati Sanity.
import {PICTO} from './picto'
import {WF} from './wireframes'

export const esc = (s: any) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
export const nl2br = (s: string) => esc(s).replace(/\n/g, '<br>')
export const cdn = (u?: string, w?: number) => (u ? `${u}?auto=format${w ? `&w=${w}` : ''}` : '')
const attr = (o: any) => esc(JSON.stringify(o))

const ARROW = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M7 17L17 7M8 7h9v9"/></svg>'
const ICONS: Record<string, string> = {
  angle: '<path d="M4 20h16M4 20L16 8M9 20a5 5 0 0 0-1.5-3.6"/>', layers: '<path d="M12 4l8 4-8 4-8-4 8-4zM4 12l8 4 8-4M4 16l8 4 8-4"/>',
  infinity: '<path d="M7.5 8.5c-2.2 0-4 1.6-4 3.5s1.8 3.5 4 3.5c3.5 0 5-7 9-7 2.2 0 4 1.6 4 3.5s-1.8 3.5-4 3.5c-4 0-5.5-7-9-7z" transform="translate(0 0.5)"/>',
  clock: '<circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 2"/>', heat: '<path d="M10 4v10.2a3.5 3.5 0 1 0 4 0V4a2 2 0 0 0-4 0z"/><path d="M12 9v6"/>',
  ruler: '<path d="M3 15l12-12 6 6-12 12-6-6zM8 10l2 2M11 7l2 2M5 13l2 2"/>', box: '<path d="M4 8l8-4 8 4v8l-8 4-8-4V8zM4 8l8 4 8-4M12 12v8"/>',
  nozzle: '<path d="M7 4h10v5l-3 3v3l-2 5-2-5v-3L7 9V4z"/>', carbon: '<path d="M4 7h16M4 12h16M4 17h16M8 4v16M14 4v16"/>',
}
export const iconFor = (t: string) => {
  if (t.includes('30°')) return 'angle'
  if (/upport/.test(t)) return 'layers'
  if (t.includes('∞')) return 'infinity'
  if (t.includes('24')) return 'clock'
  if (t.includes('°C')) return 'heat'
  if (t.includes('+') && /mm/i.test(t)) return 'ruler'
  if (t.includes('Desktop')) return 'box'
  if (t.includes('·')) return 'nozzle'
  return 'carbon'
}
export const sectorHref = (s: any) => (s.published ? s.legacyUrl || `/settori/${s.slug}` : '')

// ---------------- header + megamenu
export function headerHtml(settings: any, printers: any[], sectors: any[], materials: any[], cases: any[], opts: {home?: boolean; active?: string} = {}) {
  const links = settings?.headerLinks || []
  const mm = (k: string, t: string) => `<button class="ddt" type="button" data-mm="${k}" aria-expanded="false" aria-controls="hmega">${esc(t)}</button>`
  const nav = links.map((l: any) => {
    const m = /^mega-(\w+)$/.exec(l.kind || '')
    if (m) return mm({printers: 'stampanti', sectors: 'settori', materials: 'materiali', cases: 'case'}[m[1] as 'printers'] || m[1], l.label)
    return `<a href="${esc(l.href)}"${l.external ? ' target="_blank" rel="noopener"' : ''}>${esc(l.label)}</a>`
  }).join('')
  const cta = settings?.headerCta
  const pr = printers.map((p) => `<a class="mm-card" href="/stampanti/${p.slug}"${opts.active === p.slug ? ' aria-current="page"' : ''}><b>Layerloop ${esc(p.name)}</b><small>${esc(p.tagline)}</small><u>→</u></a>`).join('')
  const se = sectors.map((s) => { const h = sectorHref(s) || '/#settori'; return `<a class="mm-row" href="${esc(h)}"${h.startsWith('http') ? ' target="_blank" rel="noopener"' : ''}><b>${esc(s.name)}</b><small>${esc(s.summary)}</small><u>→</u></a>` }).join('')
  const ma = materials.map((m) => `<a class="mm-chip" href="/materiali#${m.id}">${esc(m.n)}</a>`).join('')
  const ca = cases.slice(0, 3).map((c) => `<a class="mm-row" href="/case-study/${c.slug}"><b>${esc(c.title)}</b><u>→</u></a>`).join('')
  const mega = `<div class="hmega" id="hmega" aria-hidden="true">
<div class="mp-p" data-p="stampanti"><div class="mm-cards">${pr}</div></div>
<div class="mp-p" data-p="settori"><div class="mm-rows">${se}</div></div>
<div class="mp-p" data-p="materiali"><div class="mm-chips">${ma}</div><a class="mm-all" href="/materiali">Scopri i materiali →</a></div>
<div class="mp-p" data-p="case"><div class="mm-rows one">${ca}</div><a class="mm-all" href="/case-study">Scopri tutti i case study →</a></div></div>`
  return `<header class="sitehdr${opts.home ? ' nologo' : ''}" id="sitehdr"><div class="hbar"><a class="logo" href="/" aria-label="Layerloop, home">${PICTO}</a>
<nav id="shn" aria-label="Principale">${nav}</nav>
${cta ? `<a class="btn" href="${esc(cta.href)}">${esc(cta.label)}</a>` : ''}<button class="mnu" type="button" aria-expanded="false" aria-controls="shn">Menu</button></div>${mega}</header>`
}

const SOCIAL: Record<string, string> = {
  LinkedIn: '<path d="M5 9h3.2v10H5zM6.6 4.6a1.9 1.9 0 1 1 0 3.8 1.9 1.9 0 0 1 0-3.8zM10.4 9h3v1.4h.1c.5-.9 1.6-1.7 3.2-1.7 3.2 0 3.8 2.1 3.8 4.9V19h-3.2v-4.8c0-1.2 0-2.6-1.6-2.6s-1.8 1.2-1.8 2.5V19h-3.2z"/>',
  Instagram: '<rect x="4.5" y="4.5" width="15" height="15" rx="4.2" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="12" r="3.6" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="16.6" cy="7.4" r="1.1"/>',
  Facebook: '<path d="M13.4 20v-7h2.4l.4-2.8h-2.8V8.6c0-.8.3-1.4 1.4-1.4h1.5V4.7c-.3 0-1.1-.1-2.1-.1-2.1 0-3.5 1.3-3.5 3.6v2h-2.4V13h2.4v7z"/>',
  YouTube: '<path d="M20.2 8.3c-.2-.8-.8-1.4-1.6-1.6C17.2 6.3 12 6.3 12 6.3s-5.2 0-6.6.4c-.8.2-1.4.8-1.6 1.6-.4 1.4-.4 3.7-.4 3.7s0 2.3.4 3.7c.2.8.8 1.4 1.6 1.6 1.4.4 6.6.4 6.6.4s5.2 0 6.6-.4c.8-.2 1.4-.8 1.6-1.6.4-1.4.4-3.7.4-3.7s0-2.3-.4-3.7zM10.3 14.6V9.4l4.5 2.6z"/>',
  TikTok: '<path d="M14.2 4.5c.3 1.9 1.4 3 3.3 3.2v2.5c-1.2.1-2.3-.3-3.3-1v5.6c0 3-2.4 4.7-4.9 4.2-2-.4-3.4-2.3-3.1-4.4.3-2.3 2.4-3.8 4.7-3.4v2.6c-1-.3-2 .3-2.1 1.3-.1 1.1.9 2 2 1.7.7-.2 1.1-.8 1.1-1.5V4.5z"/>',
  X: '<path d="M5 5h3.6l3.7 5 4.3-5h1.9l-5.3 6.2L19 19h-3.6l-4-5.4L6.800 19H4.900l5.600-6.500z"/>',
}
export function footerHtml(s: any) {
  const mail = s?.email || 'info@layerloop3d.com'
  const cols = (s?.footerColumns || []).map((c: any) => `<div><h4>${esc(c.title)}</h4><ul>${(c.links || []).map((l: any) => `<li><a href="${esc(l.href)}">${esc(l.label)}</a></li>`).join('')}</ul></div>`).join('')
  const seat = (s?.legalSeat || s?.address || '').split('\n').map((l: string) => esc(l)).join('<br>')
  const social = (s?.socials || []).filter((x: any) => x?.url && SOCIAL[x.platform]).length ? `<ul class="fsoc" aria-label="Social">${(s.socials || []).filter((x: any) => x?.url && SOCIAL[x.platform]).map((x: any) => `<li><a href="${esc(x.url)}" target="_blank" rel="noopener" aria-label="${esc(x.platform)}"><svg viewBox="0 0 24 24" fill="currentColor">${SOCIAL[x.platform]}</svg></a></li>`).join('')}</ul>` : ''
  const notes = (s?.companyNotes || []).map((n: string) => `<li>${esc(n)}</li>`).join('')
  return `<footer class="footer" id="contatti"><div class="wrap">
 <div class="fcta"><div><span class="eyebrow">Layerloop</span><h2>Bring production<br>in house.</h2></div><div class="bt"><a class="btn" href="mailto:${esc(s?.demoEmail || mail)}?subject=Richiesta%20demo">Richiedi una demo</a><a class="btn ghost" href="mailto:${esc(s?.demoEmail || mail)}?subject=Parlo%20con%20un%20esperto">Parla con un esperto</a></div></div>
 <div class="foot-grid">
  <div class="fb"><a class="flogo" href="/" aria-label="Layerloop">${PICTO}</a><p>${esc(s?.footerClaim)}</p>${social}</div>
  <div><h4>Sede legale</h4><address>${seat}</address><ul class="fnotes">${notes}</ul>${s?.affiliateOffices ? `<h4 style="margin-top:22px">Sedi affiliate</h4><p>${esc(s.affiliateOffices)}</p>` : ''}</div>
  <div><h4>Contatti</h4><ul><li><a href="mailto:${esc(mail)}">${esc(mail)}</a></li>${s?.phone ? `<li><a href="tel:${esc(String(s.phone).replace(/\s/g, ''))}">${esc(s.phone)}</a></li>` : ''}</ul></div>
  ${cols}
 </div>
 <p class="foot-bottom"><span>${esc(s?.legal || 'Layerloop S.r.l.')}${s?.vat ? ` – P.IVA ${esc(s.vat)}` : ''}</span><span>${esc(s?.credits)}</span></p></div></footer>`
}

// ---------------- "Siamo presenti su" (loghi chiari su trasparente)
export function pressHtml(s: any) {
  const logos = (s?.pressLogos || []).filter((l: any) => l.url_img)
  if (!logos.length) return ''
  return `<section class="press" aria-label="${esc(s?.pressTitle)}"><div class="wrap"><p class="press-t">${esc(s?.pressTitle || 'Siamo presenti su:')}</p><ul class="press-l">${logos.map((l: any) => `<li>${l.url ? `<a href="${esc(l.url)}" target="_blank" rel="noopener">` : ''}<img src="${cdn(l.url_img, 360)}" alt="${esc(l.name)}" loading="lazy">${l.url ? '</a>' : ''}</li>`).join('')}</ul></div></section>`
}

// ---------------- card stampanti (home)
export function printersHtml(printers: any[]) {
  const cards = printers.map((p, i) => {
    const chips = (p.cardChips || p.chips || []).map((c: string) => `<li>${esc(c)}</li>`).join('')
    const head = `<span class="go" aria-hidden="true">${ARROW}</span>`
    if (i === 0 && p.cardVideo) {
      return `<a class="pc wide" href="/stampanti/${p.slug}" data-hover-video>${head}
      <div class="tx"><h2>${esc(p.cardTitle)}</h2><p>${esc(p.cardText)}</p><ul class="specs">${chips}</ul></div>
      <div class="vid"><video muted playsinline preload="auto" poster="${cdn(p.cardPoster)}" aria-label="Layerloop ${esc(p.name)} in funzione"><source src="${p.cardVideo}" type="video/mp4"></video></div></a>`
    }
    const shot = p.model3d
      ? `<div class="shot mv"><model-viewer src="${esc(p.model3d)}" poster="${cdn(p.cardImage, 900)}" alt="Layerloop ${esc(p.name)} in 3D" auto-rotate rotation-per-second="10deg" interaction-prompt="none" disable-zoom disable-pan shadow-intensity="1" shadow-softness="1" exposure=".9" camera-orbit="30deg 72deg auto" field-of-view="26deg" loading="lazy" reveal="auto"></model-viewer><span class="mv-tag">3D · muovi il mouse</span></div>`
      : `<div class="shot"><img src="${cdn(p.cardImage, 1100)}" alt="Layerloop ${esc(p.name)}" loading="lazy"></div>`
    return `<a class="pc" href="/stampanti/${p.slug}">${head}<h2>${esc(p.cardTitle)}</h2><p>${esc(p.cardText)}</p><ul class="specs">${chips}</ul>${shot}</a>`
  }).join('\n')
  const mvScript = printers.some((p) => p.model3d) ? `<script type="module">import {ModelViewerElement} from "https://cdn.jsdelivr.net/npm/@google/model-viewer@3.5.0/dist/model-viewer.min.js";ModelViewerElement.meshoptDecoderLocation="https://cdn.jsdelivr.net/npm/meshoptimizer@0.20.0/meshopt_decoder.js";</script>` : ''
  return `<section class="wrap printers" id="stampanti" aria-label="Le stampanti Layerloop">${cards}${mvScript}</section>`
}

// ---------------- settori: scena a scorrimento (disegno al tratto che si trasforma, info a destra)
export function sectorsHtml(sectors: any[], on: string[] = [], machine = '') {
  const n = sectors.length
  const groups = sectors.map((s, i) => `<g class="wf${i === 0 ? ' on' : ''}" data-k="${esc(s.slug)}">${WF[s.slug] || ''}</g>`).join('')
  const panes = sectors.map((s, i) => {
    const p = s.printers?.[0]
    const href = sectorHref(s)
    return `<div class="sx-pane${i === 0 ? ' on' : ''}" data-k="${esc(s.slug)}"><span class="sx-i">A${String(i + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}</span><h3>${esc(s.name)}</h3><p>${esc(s.summary)}</p>${on.includes(s.name) && machine ? `<em>Con Layerloop ${esc(machine)}</em>` : ''}${p ? `<a class="sx-rec" href="/stampanti/${p.slug}"><small>Stampante consigliata</small><b>Layerloop ${esc(p.name)}</b><u>→</u></a>` : ''}${href ? `<a class="sx-go" href="${esc(href)}"${href.startsWith('http') ? ' target="_blank" rel="noopener"' : ''}>Scopri il settore →</a>` : ''}</div>`
  }).join('')
  const ticks = sectors.map((s, i) => `<li><button type="button" class="sx-tick${i === 0 ? ' on' : ''}" data-k="${esc(s.slug)}" data-i="${i}" aria-pressed="${i === 0}"><span>A${String(i + 1).padStart(2, '0')}</span>${esc(s.name)}</button></li>`).join('')
  return `<div class="sxp" data-n="${n}"><div class="sxp-in"><div class="sx-stage" aria-hidden="true"><svg viewBox="0 0 2000 1000" preserveAspectRatio="xMidYMid meet" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"><g class="sx-float">${groups}</g></svg></div><div class="sx-info" aria-live="polite">${panes}</div><ol class="sx-ticks" role="group" aria-label="Settori">${ticks}</ol></div></div>`
}

// ---------------- materiali (lista verticale)
export function materialsHtml(materials: any[], machine = '') {
  const list = materials.filter((m) => !machine || (m.m || []).map((x: string) => x.toUpperCase()).includes(machine.toUpperCase()))
  const data = list.map((m) => ({id: m.id, n: m.n, a: m.a, m: m.m, k: m.keyTrait, d: (m.description || '').slice(0, 160), t: (m.tags || []).slice(0, 4), img: cdn(m.img, 300)}))
  return `<div class="mp" data-machine="${esc(machine)}" data-mats="${attr(data)}"><div class="mp-side"><div class="mp-nav"><button type="button" class="mp-prev" aria-label="Precedente">←</button><button type="button" class="mp-next" aria-label="Successivo">→</button></div><div class="mp-rail" role="list"></div></div></div>`
}

// ---------------- slider case study
export function casesHtml(cases: any[], title = 'More than<br>3D printing.') {
  const nav = '<div class="sl-nav"><button type="button" class="sl-prev" aria-label="Precedente">←</button><button type="button" class="sl-next" aria-label="Successivo">→</button></div>'
  const cards = cases.map((c) => `<article class="cx-card"><a class="cx-cover" href="/case-study/${c.slug}"><img src="${cdn(c.cover, 700)}" alt="${esc(c.coverAlt || c.title)}" loading="lazy"></a><h3 class="cx-title"><a href="/case-study/${c.slug}">${esc(c.title)}</a></h3></article>`).join('')
  return `<section class="cx sl" id="case" aria-labelledby="cxt"><div class="sl-in"><header class="sl-head"><h2 id="cxt">${title}</h2>${nav}</header></div><div class="sl-track" tabindex="0" role="list" data-gap="34">${cards}</div><div class="cx-all"><a class="cx-cta" href="/case-study">Scopri tutti i case study →</a></div></section>`
}

// ---------------- pagina stampante (Extend / XE) generata dai dati
const CMP = `<div class="cmp"><svg viewBox="0 0 320 200" role="img" aria-label="Asse normale: sbalzo con supporti"><text x="10" y="18">ASSE 90°</text><line class="ln" x1="14" y1="170" x2="306" y2="170"/><path class="part" d="M70 170V110H170V170Z"/><path class="part" d="M110 110H250V90H110Z"/><path class="sup" d="M170 110V170M190 110V170M210 110V170M230 110V170M250 90V170"/><rect class="hd" x="100" y="46" width="22" height="26"/><text class="sm" x="14" y="190">sbalzo: supporti da rimuovere</text></svg><svg viewBox="0 0 320 200" role="img" aria-label="Asse a 30 gradi: nessun supporto"><text x="10" y="18">ASSE 30°</text><g transform="rotate(-30 160 150)"><line class="ln" x1="0" y1="150" x2="330" y2="150"/><rect class="part" x="40" y="118" width="210" height="32"/><rect class="part" x="50" y="86" width="150" height="32"/><rect class="hd" x="70" y="34" width="22" height="30"/></g><text class="sm" x="14" y="190">nessun supporto, il pezzo esce → ∞</text></svg></div><p style="margin-top:12px;color:var(--muted);font-size:13px">Schema concettuale.</p>`

export const heroHtml = (p: any) => `<section class="hero2"><div class="wrap">
 <div class="crumb"><a href="/#stampanti">Stampanti</a> / <b>${esc(p.name)}</b></div>
 <h1>${esc(p.headline)}</h1><p class="lead">${esc(p.lead)}</p>
 <ul class="specs">${(p.chips || []).map((c: string) => `<li>${esc(c)}</li>`).join('')}</ul>
 <div class="row"><a class="btn" href="#contatti">Richiedi una demo →</a><a class="btn ghost" href="#specifiche">Scheda tecnica</a></div>
 <div class="hero-card"><img src="${cdn(p.heroImage, 1600)}" alt="Layerloop ${esc(p.name)}"><span class="cap">Layerloop ${esc(p.name)}</span></div>
</div></section>`

export const featHtml = (items: any[]) => `<div class="feat">${(items || []).map((h) => `<div><span class="ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round">${ICONS[iconFor(h.value)].replace(/<(path|circle)/g, '<$1 pathLength="1"')}</svg></span><b>${esc(h.value)}</b><p>${esc(h.text)}</p></div>`).join('')}</div>`

export const specsHtml = (rows: any[]) => `<table class="sp"><tbody>${(rows || []).map((r) => `<tr><th>${esc(r.label)}</th><td>${esc(r.value)}</td></tr>`).join('')}</tbody></table>`

export function printerPageHtml(p: any, ctx: {sectors: string; materials: string; cases: string}) {
  const n = esc(p.name)
  return `<main id="top">
${heroHtml(p)}
<section class="wrap sec-t">${featHtml(p.highlights)}</section>
<section class="wrap sec-t"><div class="head"><h2>${esc(p.sectionTitle)}</h2><p>${esc(p.sectionText)}</p></div>
 <div class="prod"><div class="pk"><img src="${cdn(p.sectionImage, 1200)}" alt="Layerloop ${n}" loading="lazy"></div><div class="tx">${(p.points || []).map((x: any) => `<div><b>${esc(x.title)}</b>${esc(x.text)}</div>`).join('')}</div></div>
 <div class="two" style="margin-top:14px">${(p.gallery || []).map((g: any) => `<figure><img src="${cdn(g.src, 1000)}" alt="${esc(g.alt || g.caption)}" loading="lazy"><figcaption>${esc(g.caption)}</figcaption></figure>`).join('')}</div>
</section>
${p.revealImage ? `<section class="wrap sec-t" style="padding-bottom:0"><div class="head"><h2>${esc(p.revealTitle)}</h2><p>${esc(p.revealText)}</p></div></section><div class="reveal-media" data-reveal style="height:clamp(320px,80vh,860px)"><img src="${cdn(p.revealImage, 2000)}" alt="${esc(p.revealTitle)}" loading="lazy"><span class="cap">Layerloop ${n}</span></div>` : ''}
<section class="wrap sec-t"><div class="head"><h2>Perché<br>30° e non 90°.</h2><p>Con l'asse normale ogni sbalzo chiede supporti. Con l'asse a 30° il materiale si deposita in modo diverso e il pezzo esce dal nastro.</p></div>
 <div class="deg" style="grid-template-columns:1fr 1fr"><div><ul style="margin:0;padding:0;list-style:none;display:grid;gap:12px"><li style="border-top:1px solid rgba(255,255,255,.18);padding-top:12px;color:var(--muted)"><b style="color:#fff;font:700 .95rem var(--display);text-transform:uppercase;display:block;margin-bottom:4px">Meno supporti</b>La geometria inclinata permette di realizzare pezzi finiti riducendo o eliminando i supporti.</li><li style="border-top:1px solid rgba(255,255,255,.18);padding-top:12px;color:var(--muted)"><b style="color:#fff;font:700 .95rem var(--display);text-transform:uppercase;display:block;margin-bottom:4px">Il pezzo esce dal nastro</b>L'asse inclinato e il tavolo a rulli consentono la stampa continua sull'asse X: lunghezza infinita.</li></ul></div><div>${CMP}</div></div>
</section>
${p.optionTitle ? `<section class="wrap sec-t"><div class="opt"><div class="im2"><img src="${cdn(p.optionImage, 1000)}" alt="${esc(p.optionTitle)}" loading="lazy"></div><div><h2 style="font-size:var(--t-h3)">${esc(p.optionTitle)}</h2><p style="margin-top:16px;color:var(--muted)">${esc(p.optionText)}</p></div></div></section>` : ''}
<section class="wrap sec-t" id="specifiche"><div class="head"><h2>Scheda<br>tecnica.</h2><p>${esc(p.specIntro)}</p></div>${specsHtml(p.specs)}</section>
<section class="sect" id="settori"><div class="wrap sect-box"><h2>Print what<br>industry needs.</h2>${ctx.sectors}</div></section>
${ctx.cases}
<section class="mats mxs" id="materiali"><div class="wrap top"><h2>From polymers to advanced materials.</h2><p class="lead">${esc(p.materialsIntro)}</p></div>${ctx.materials}
 <div class="fam">${(p.materialFamilies || []).map((f: any) => `<div><b>${esc(f.title)}</b>${esc(f.text)}</div>`).join('')}</div><div class="cta"><a class="btn dark" href="/materiali">Scopri i materiali →</a></div></section>
<div class="fade" aria-hidden="true"></div>
</main>`
}

// ---------------- visualizzatore 3D (web component <model-viewer>)
export const modelSectionHtml = (src: string, name: string) => `<section class="wrap mv-sec" id="modello-3d">
<div class="head"><h2>Esplora<br>la macchina.</h2><p>Il modello 3D di Layerloop ${esc(name)}: trascina per ruotarla, avvicina con la rotella o con due dita.</p></div>
<div class="mv-stage"><div class="mv-wrap"><model-viewer src="${esc(src)}" alt="Modello 3D di Layerloop ${esc(name)}" camera-controls auto-rotate auto-rotate-delay="2500" rotation-per-second="14deg" interaction-prompt="none" shadow-intensity="1.1" shadow-softness="1" exposure="1.05" tone-mapping="aces" camera-orbit="35deg 74deg auto" loading="lazy" style="width:100%;height:100%"></model-viewer></div><span class="mv-hint">Trascina per ruotare</span></div>
<script type="module">import {ModelViewerElement} from "https://cdn.jsdelivr.net/npm/@google/model-viewer@3.5.0/dist/model-viewer.min.js";ModelViewerElement.meshoptDecoderLocation="https://cdn.jsdelivr.net/npm/meshoptimizer@0.20.0/meshopt_decoder.js";</script></section>`
