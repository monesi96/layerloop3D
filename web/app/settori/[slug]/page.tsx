import {notFound} from 'next/navigation'
import type {Metadata} from 'next'
import {q} from '@/lib/sanity'
import {Blocks, GROQ_BLOCKS} from '@/lib/blocks'
import {PageShell} from '@/lib/page-shell'
import {cdn, esc} from '@/lib/templates'

export const revalidate = 60
const QUERY = `*[_type=="sector" && slug.current==$slug][0]{
  name, headline, summary, seo, "hero": heroImage.asset->url,
  "printers": printers[]->{name, "slug": slug.current}, "materials": materials[]->{name, "slug": slug.current},
  "cases": caseStudies[]->{title, "slug": slug.current, "cover": cover.asset->url, summary}, ${GROQ_BLOCKS}}`

export async function generateStaticParams() {
  const slugs: string[] = await q(`*[_type=="sector" && published==true].slug.current`)
  return slugs.map((slug) => ({slug}))
}
export async function generateMetadata({params}: {params: Promise<{slug: string}>}): Promise<Metadata> {
  const {slug} = await params
  const s = await q(QUERY, {slug})
  return s ? {title: s.seo?.title || `Stampa 3D per ${s.name}`, description: s.seo?.description || s.summary} : {}
}

export default async function SectorPage({params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params
  const s = await q(QUERY, {slug})
  if (!s) notFound()
  return (
    <PageShell>
      <section className="pg-hero"><div className="wrap">
        <span className="eyebrow">Settori</span>
        <h1>{s.headline || s.name}</h1>
        {s.summary && <p className="lead">{s.summary}</p>}
        <div className="chips2">
          {(s.printers || []).map((p: any) => <a key={p.slug} href={`/stampanti/${p.slug}`}>Layerloop {p.name}</a>)}
          {(s.materials || []).map((m: any) => <a key={m.slug} href={`/materiali#${m.slug}`}>{m.name}</a>)}
        </div>
        {s.hero && <div className="media"><img src={cdn(s.hero, 1800)} alt={s.name} /></div>}
      </div></section>
      <Blocks blocks={s.blocks} />
      {s.cases?.length > 0 && (
        <section className="blk"><div className="wrap"><h2>Case study</h2>
          <div className="listgrid">{s.cases.map((c: any) => <a key={c.slug} className="lcard" href={`/case-study/${c.slug}`}><div className="im"><img src={cdn(c.cover, 700)} alt="" loading="lazy" /></div><h3>{c.title}</h3></a>)}</div>
        </div></section>
      )}
    </PageShell>
  )
}
