import {createClient} from 'next-sanity'
import imageUrlBuilder from '@sanity/image-url'

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '5033nuuu'
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

export const client = createClient({
  projectId, dataset, apiVersion: '2025-01-01', useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN || undefined,
})

const builder = imageUrlBuilder({projectId, dataset})
export const img = (src: any, w?: number) => {
  if (!src?.asset) return ''
  let b = builder.image(src).auto('format')
  if (w) b = b.width(w)
  return b.url()
}
export const fileUrl = (f: any): string => {
  const ref: string | undefined = f?.asset?._ref
  if (!ref) return ''
  const m = ref.match(/^file-([a-f0-9]+)-(\w+)$/)
  return m ? `https://cdn.sanity.io/files/${projectId}/${dataset}/${m[1]}.${m[2]}` : ''
}

export async function q<T = any>(query: string, params: Record<string, any> = {}): Promise<T> {
  return client.fetch<T>(query, params, {next: {revalidate: 60}})
}

/** Indirizzo dei file del CMS servito dal nostro dominio (vedi rewrites in next.config.ts) */
export const localFile = (u: string) => (u || '').replace(/^https:\/\/cdn\.sanity\.io\/files\/[^/]+\/[^/]+\//, '/cms-files/')
