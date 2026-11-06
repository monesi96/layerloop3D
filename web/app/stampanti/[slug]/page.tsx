import './../../css/next.css'
import './../../css/design.css'
import {notFound} from 'next/navigation'
import {q, localFile} from '@/lib/sanity'
import type {Metadata} from 'next'
import './../../css/model.css'
import {Shell, Raw, fragment, loadShared} from '@/lib/shell'
import {scene3dHtml} from '@/lib/scene3d'
import {modelSectionHtml, headerHtml, footerHtml, sectorsHtml, materialsHtml, casesHtml, printerPageHtml, featHtml, specsHtml, heroHtml} from '@/lib/templates'

export const revalidate = 60

export async function generateStaticParams() {
  const {printers} = await loadShared()
  return printers.map((p: any) => ({slug: p.slug}))
}

export async function generateMetadata({params}: {params: Promise<{slug: string}>}): Promise<Metadata> {
  const {slug} = await params
  const {printers} = await loadShared()
  const p = printers.find((x: any) => x.slug === slug)
  return p ? {title: p.seo?.title || `Layerloop ${p.name}`, description: p.seo?.description || p.lead} : {}
}

export default async function PrinterPage({params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params
  const {settings, printers, sectors, materials, cases} = await loadShared()
  const p = printers.find((x: any) => x.slug === slug)
  if (!p) notFound()
  const on = (p.sectorHighlights || []) as string[]
  const sec = sectorsHtml(sectors, on, p.name)
  const mat = materialsHtml(materials, p.name)
  const cs = casesHtml(cases)
  let main: string
  if (slug === 'next') {
    // pagina Next: scene interattive (tour, rullo) conservate; testi e dati dal CMS
    const steps = JSON.stringify((p.tourSteps || []).map((s: any) => [s.title, s.text, s.image ? `${s.image}?auto=format&w=1400` : '', s.alt || s.title]))
    const base = fragment('next')
    main = base
      .replace('<!--@header-->', '').replace('<!--@footer-->', '')
      .replace('<!--@sectors-->', sec).replace('<!--@materials-->', mat).replace('<!--@cases-->', cs)
      .replace(/data-steps='[^']*'/, `data-steps='${steps.replace(/'/g, '&#39;')}'`)
      .replace(/<table class="sp">.*?<\/table>/s, specsHtml(p.specs))
  } else {
    main = printerPageHtml(p, {sectors: sec, materials: mat, cases: cs})
  }
  const modelCms: string = localFile(await q(`*[_type=="printer" && slug.current==$s][0].model3d.asset->url`, {s: slug}))
  // il modello di Next è anche nel sito (public/models): stesso dominio, nessun CORS, nessuna dipendenza esterna
  const model: string = modelCms && slug === 'next' ? '/models/next-200.glb' : modelCms
  if (slug === 'next' && model) main = replaceSection(main, '<section class="tour"', scene3dHtml(model, `${p.cardImage}?auto=format&w=900`, (p.tourSteps || []).map((x: any) => ({title: x.title, text: x.text}))))
  const scripts = slug === 'next' ? ['/js/next.js', ...(model ? ['/js/m3d.js'] : [])] : ['/js/extend.js']
  return (
    <Shell header={headerHtml(settings, printers, sectors, materials, cases, {active: slug})} footer={footerHtml(settings)} scripts={scripts}>
      <Raw html={model && slug !== 'next' ? withModel(main, model, p.name) : main} />
    </Shell>
  )
}

/** Inserisce il visualizzatore 3D prima del tour della macchina (Next) o dopo la hero (altre pagine). */
function withModel(main: string, model: string, name: string) {
  const block = modelSectionHtml(model, name)
  const marker = main.includes('<section class="tour"') ? '<section class="tour"' : '<section class="wrap sec-t"'
  const i = main.indexOf(marker)
  return i > 0 ? main.slice(0, i) + block + main.slice(i) : main + block
}

function replaceSection(html: string, open: string, repl: string) {
  const i = html.indexOf(open)
  if (i < 0) return html
  let depth = 0
  const re = /<(\/?)section\b/g
  re.lastIndex = i
  let m: RegExpExecArray | null
  while ((m = re.exec(html))) {
    depth += m[1] ? -1 : 1
    if (depth === 0) {
      const j = html.indexOf('>', m.index) + 1
      return html.slice(0, i) + repl + html.slice(j)
    }
  }
  return html
}
