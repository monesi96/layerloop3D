import {notFound} from 'next/navigation'
import type {Metadata} from 'next'
import {q} from '@/lib/sanity'
import {Prose, GROQ_PT} from '@/lib/blocks'
import {PageShell} from '@/lib/page-shell'
import {cdn} from '@/lib/templates'

export const revalidate = 60
const QUERY = `*[_type=="post" && slug.current==$slug][0]{title, excerpt, publishedAt, seo, language, "cover": cover.asset->url, "coverAlt": cover.alt, "author": author->name, "cats": categories[]->title, ${GROQ_PT}}`
const fmt = (d: string) => new Date(d).toLocaleDateString('it-IT', {day: 'numeric', month: 'long', year: 'numeric'})

export async function generateStaticParams() {
  const slugs: string[] = await q(`*[_type=="post"].slug.current`)
  return slugs.map((slug) => ({slug}))
}
export async function generateMetadata({params}: {params: Promise<{slug: string}>}): Promise<Metadata> {
  const {slug} = await params
  const p = await q(QUERY, {slug})
  return p ? {title: p.seo?.title || p.title, description: p.seo?.description || p.excerpt, openGraph: p.cover ? {images: [cdn(p.cover, 1200)]} : undefined} : {}
}

export default async function Post({params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params
  const p = await q(QUERY, {slug})
  if (!p) notFound()
  return (
    <PageShell>
      <section className="pg-hero"><div className="wrap"><span className="eyebrow">{(p.cats || []).join(' · ') || 'Blog'}</span><h1 style={{maxWidth: '22ch'}}>{p.title}</h1>
        <div className="meta"><span>{fmt(p.publishedAt)}</span>{p.author && <span>{p.author}</span>}</div></div></section>
      {p.cover && <div className="cover"><img src={cdn(p.cover, 1800)} alt={p.coverAlt || p.title} /></div>}
      <section className="blk article"><Prose value={p.body} /></section>
      <section className="blk"><div className="wrap" style={{textAlign: 'center'}}><a className="btn" href="/blog">← Tutti gli articoli</a></div></section>
    </PageShell>
  )
}
