// Generatori di markup (stessa struttura HTML/CSS delle pagine statiche approvate), alimentati dai dati Sanity.
import {PICTO} from './picto'

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
  const pr = printers.map((p) => `<a class="mm-card" href="/stampanti/${p.slug}"${opts.active === p.slug ? ' aria-current="page"' : ''}><span class="im"><img src="${cdn(p.cardImage || p.heroImage, 500)}" alt="" loading="lazy"></span><b>${esc(p.name)}</b><small>${esc(p.tagline)}</small></a>`).join('')
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

export function footerHtml(s: any) {
  const cols = (s?.footerColumns || []).map((c: any) => `<div><h4>${esc(c.title)}</h4><ul>${(c.links || []).map((l: any) => `<li><a href="${esc(l.href)}">${esc(l.label)}</a></li>`).join('')}</ul></div>`).join('')
  const mail = s?.email || 'info@layerloop3d.com'
  return `<footer class="footer" id="contatti"><div class="wrap">
 <div class="fcta"><div><h2>Bring production<br>in house.</h2></div><div class="bt"><a class="btn dark" href="mailto:${esc(s?.demoEmail || mail)}?subject=Richiesta%20demo">Richiedi una demo →</a><a class="btn outline" href="mailto:${esc(s?.demoEmail || mail)}?subject=Parlo%20con%20un%20esperto">Parla con un esperto →</a></div></div>
 <div class="foot-grid"><div><p>${esc(s?.footerClaim)}</p></div><div><h4>Contatti</h4><ul>${(s?.address || '').split('\n').map((l: string) => `<li>${esc(l)}</li>`).join('')}<li><a href="mailto:${esc(mail)}">${esc(mail)}</a></li>${s?.phone ? `<li><a href="tel:${esc(String(s.phone).replace(/\s/g, ''))}">${esc(s.phone)}</a></li>` : ''}</ul></div>${cols}</div>
 <p class="foot-bottom">© ${new Date().getFullYear()} ${esc(s?.legal || 'Layerloop S.r.l.')} Tutti i diritti riservati.</p></div></footer>`
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
    return `<a class="pc" href="/stampanti/${p.slug}">${head}<h2>${esc(p.cardTitle)}</h2><p>${esc(p.cardText)}</p><ul class="specs">${chips}</ul>
      <div class="shot"><img src="${cdn(p.cardImage, 1100)}" alt="Layerloop ${esc(p.name)}" loading="lazy"></div></a>`
  }).join('\n')
  return `<section class="wrap printers" id="stampanti" aria-label="Le stampanti Layerloop">${cards}</section>`
}

// ---------------- settori (selettore con dettaglio)
export function sectorsHtml(sectors: any[], on: string[] = [], machine = '') {
  const items = sectors.map((s, i) => `<button type="button" class="sec-item${on.includes(s.name) ? ' on' : ''}" data-i="${i}" aria-pressed="false"><b>${esc(s.name)}</b><span class="sd">${esc(s.summary)}</span>${on.includes(s.name) && machine ? `<em>Con Layerloop ${esc(machine)}</em>` : ''}</button>`).join('')
  const data = sectors.map((s) => ({
    n: s.name, d: s.summary, mc: (s.printers || []).map((p: any) => [p.name, `/stampanti/${p.slug}`]),
    ml: (s.materials || []).map((m: any) => [m.id, m.name, cdn(m.img, 80)]), c: s.cases?.[0] ? [s.cases[0].title, `/case-study/${s.cases[0].slug}`] : ['', ''],
    u: sectorHref(s),
  }))
  const first = Math.max(0, sectors.findIndex((s) => on.includes(s.name)))
  return `<div class="secpick" data-first="${first}" data-sec="${attr(data)}"><div class="sec-grid" role="group" aria-label="Settori">${items}</div><div class="sec-detail" aria-live="polite"></div></div>`
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

export const featHtml = (items: any[]) => `<div class="feat">${(items || []).map((h) => `<div><span class="ic" aria-hidden="true"><svg viewBox="0 0 24 24">${ICONS[iconFor(h.value)]}</svg></span><b>${esc(h.value)}</b><p>${esc(h.text)}</p></div>`).join('')}</div>`

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
