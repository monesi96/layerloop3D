import type {MetadataRoute} from 'next'
import {q} from '@/lib/sanity'

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.layerloop3d.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const rows: {_type: string; slug: string; date?: string}[] = await q(`*[defined(slug.current) && _type in ["page","printer","sector","caseStudy","post"] && (_type!="sector" || published==true) && (_type!="post" || publishedAt <= now())]{_type, "slug": slug.current, "date": coalesce(publishedAt, date, _updatedAt)}`)
  const path = (r: {_type: string; slug: string}) =>
    ({page: `/${r.slug}`, printer: `/stampanti/${r.slug}`, sector: `/settori/${r.slug}`, caseStudy: `/case-study/${r.slug}`, post: `/blog/${r.slug}`} as Record<string, string>)[r._type]
  return [
    ...['', '/materiali', '/blog', '/case-study'].map((p) => ({url: BASE + p, changeFrequency: 'weekly' as const})),
    ...rows.map((r) => ({url: BASE + path(r), lastModified: r.date})),
  ]
}
