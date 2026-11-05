import {notFound} from 'next/navigation'
import type {Metadata} from 'next'
import {q} from '@/lib/sanity'
import {Blocks, GROQ_BLOCKS} from '@/lib/blocks'
import {PageShell} from '@/lib/page-shell'

export const revalidate = 60
const QUERY = `*[_type=="page" && slug.current==$slug][0]{title, seo, language, ${GROQ_BLOCKS}}`

export async function generateStaticParams() {
  const slugs: string[] = await q(`*[_type=="page" && defined(slug.current)].slug.current`)
  return slugs.map((slug) => ({slug}))
}

export async function generateMetadata({params}: {params: Promise<{slug: string}>}): Promise<Metadata> {
  const {slug} = await params
  const p = await q(QUERY, {slug})
  return p ? {title: p.seo?.title || p.title, description: p.seo?.description, robots: p.seo?.noindex ? {index: false} : undefined} : {}
}

export default async function GenericPage({params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params
  const p = await q(QUERY, {slug})
  if (!p) notFound()
  return (
    <PageShell active={slug}>
      <Blocks blocks={p.blocks} />
    </PageShell>
  )
}
