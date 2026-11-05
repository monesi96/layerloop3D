import type {Metadata} from 'next'
import {q} from '@/lib/sanity'
import {PageShell} from '@/lib/page-shell'
import {cdn} from '@/lib/templates'

export const revalidate = 60
export const metadata: Metadata = {title: 'Case study', description: 'Applicazioni reali della stampa 3D a nastro Layerloop: industria, medicale, nautica, aerospace.'}

export default async function CaseStudies() {
  const cases = await q(`*[_type=="caseStudy"]|order(date desc){title, "slug": slug.current, summary, date, "cover": cover.asset->url, "sectors": sectors[]->name}`)
  return (
    <PageShell>
      <section className="pg-hero"><div className="wrap"><span className="eyebrow">Layerloop Academy</span><h1>Case study</h1><p className="lead">Pezzi veri, prodotti in azienda: i casi in cui la stampa 3D a nastro ha cambiato il modo di produrre.</p></div></section>
      <section className="blk"><div className="wrap"><div className="listgrid">
        {cases.map((c: any) => (
          <a key={c.slug} className="lcard" href={`/case-study/${c.slug}`}>
            <div className="im"><img src={cdn(c.cover, 700)} alt="" loading="lazy" /></div>
            <span className="d">{(c.sectors || []).join(' · ')}</span><h2>{c.title}</h2>{c.summary && <p>{c.summary}</p>}
          </a>
        ))}
      </div></div></section>
    </PageShell>
  )
}
