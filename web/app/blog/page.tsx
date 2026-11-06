import type {Metadata} from 'next'
import {q} from '@/lib/sanity'
import {PageShell} from '@/lib/page-shell'
import {cdn} from '@/lib/templates'

export const revalidate = 60
export const metadata: Metadata = {title: 'Blog', description: 'Stampa 3D industriale a nastro: guide, applicazioni, novità e storie dal mondo Layerloop.'}

const fmt = (d: string) => new Date(d).toLocaleDateString('it-IT', {day: 'numeric', month: 'long', year: 'numeric'})

export default async function Blog() {
  const posts = await q(`*[_type=="post" && publishedAt <= now()]|order(publishedAt desc){title, "slug": slug.current, excerpt, publishedAt, "cover": cover.asset->url, "cats": categories[]->title}`)
  return (
    <PageShell>
      <section className="pg-hero"><div className="wrap"><span className="eyebrow">Blog</span><h1>Production, explained.</h1><p className="lead">Guide, applicazioni e novità sulla stampa 3D industriale a nastro.</p></div></section>
      <section className="blk"><div className="wrap"><div className="listgrid">
        {posts.map((p: any) => (
          <a key={p.slug} className="lcard" href={`/blog/${p.slug}`}>
            <div className="im">{p.cover && <img src={cdn(p.cover, 700)} alt="" loading="lazy" />}</div>
            <span className="d">{fmt(p.publishedAt)}{p.cats?.length ? ' · ' + p.cats.join(', ') : ''}</span><h2>{p.title}</h2>{p.excerpt && <p>{p.excerpt}</p>}
          </a>
        ))}
      </div></div></section>
    </PageShell>
  )
}
