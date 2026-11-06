import {notFound} from 'next/navigation'
import type {Metadata} from 'next'
import {q} from '@/lib/sanity'
import {Prose, GROQ_PT} from '@/lib/blocks'
import {PageShell} from '@/lib/page-shell'
import {cdn} from '@/lib/templates'

export const revalidate = 60
const QUERY = `*[_type=="caseStudy" && slug.current==$slug][0]{title, summary, date, seo, "cover": cover.asset->url, "coverAlt": cover.alt, "pdf": pdf.asset->url,
  "sectors": sectors[]->{name, "slug": slug.current, published}, "printer": printer->{name, "slug": slug.current}, "material": material->{name, "slug": slug.current}, ${GROQ_PT}}`

export async function generateStaticParams() {
  const slugs: string[] = await q(`*[_type=="caseStudy"].slug.current`)
  return slugs.map((slug) => ({slug}))
}
export async function generateMetadata({params}: {params: Promise<{slug: string}>}): Promise<Metadata> {
  const {slug} = await params
  const c = await q(QUERY, {slug})
  return c ? {title: c.seo?.title || c.title, description: c.seo?.description || c.summary} : {}
}

export default async function CaseStudy({params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params
  const c = await q(QUERY, {slug})
  if (!c) notFound()
  return (
    <PageShell>
      <section className="pg-hero"><div className="wrap"><span className="eyebrow">Case study</span><h1>{c.title}</h1>{c.summary && <p className="lead">{c.summary}</p>}
        <div className="chips2">
          {c.printer && <a href={`/stampanti/${c.printer.slug}`}>Layerloop {c.printer.name}</a>}
          {c.material && <a href={`/materiali#${c.material.slug}`}>{c.material.name}</a>}
          {(c.sectors || []).map((s: any) => <span key={s.slug}>{s.name}</span>)}
        </div>
        {c.pdf && <div className="row"><a className="btn" href={c.pdf} target="_blank" rel="noopener">Scarica il whitepaper (PDF) →</a></div>}
      </div></section>
      {c.cover && <div className="cover"><img src={cdn(c.cover, 1800)} alt={c.coverAlt || c.title} /></div>}
      {c.body?.length > 0 && <section className="blk article"><Prose value={c.body} /></section>}
    </PageShell>
  )
}
