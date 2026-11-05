import {PortableText, type PortableTextComponents} from '@portabletext/react'
import {cdn} from './templates'

export const ytEmbed = (u?: string) => {
  const m = (u || '').match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/)
  if (m) return `https://www.youtube-nocookie.com/embed/${m[1]}`
  const v = (u || '').match(/vimeo\.com\/(\d+)/)
  return v ? `https://player.vimeo.com/video/${v[1]}` : ''
}

export const ptComponents: PortableTextComponents = {
  types: {
    mediaImage: ({value}: any) => (value?.url ? <figure><img src={cdn(value.url, 1400)} alt={value.alt || ''} loading="lazy" />{value.caption && <figcaption>{value.caption}</figcaption>}</figure> : null),
    videoEmbed: ({value}: any) => (ytEmbed(value?.url) ? <div className="video"><iframe src={ytEmbed(value.url)} title={value.caption || 'Video'} allow="encrypted-media; picture-in-picture" allowFullScreen loading="lazy" /></div> : null),
    callout: ({value}: any) => <div className="callout">{value.title && <b>{value.title}</b>}<p>{value.text}</p></div>,
  },
  marks: {link: ({children, value}: any) => <a href={value?.href} {...(/^https?:/.test(value?.href || '') ? {target: '_blank', rel: 'noopener'} : {})}>{children}</a>},
}

export const Prose = ({value}: {value?: any[]}) => (value?.length ? <div className="prose"><PortableText value={value} components={ptComponents} /></div> : null)

export const GROQ_PT = `body[]{..., _type=="mediaImage" => {..., "url": asset->url}}`
export const GROQ_BLOCKS = `blocks[]{
  ..., 
  image{..., "url": asset->url},
  poster{..., "url": asset->url},
  body[]{..., _type=="mediaImage" => {..., "url": asset->url}},
  images[]{..., "url": asset->url},
  cards[]{..., image{..., "url": asset->url}},
  logos[]{..., image{..., "url": asset->url}},
  items[]{..., image{..., "url": asset->url}, a[]{...}}
}`

const Ctas = ({ctas}: {ctas?: any[]}) => (ctas?.length ? <div className="row">{ctas.map((c, i) => <a key={c._key || i} className={'btn' + (i ? ' ghost' : '')} href={c.href} {...(c.external ? {target: '_blank', rel: 'noopener'} : {})}>{c.label}</a>)}</div> : null)

export function Blocks({blocks}: {blocks?: any[]}) {
  return (
    <>
      {(blocks || []).map((b, i) => {
        const k = b._key || i
        switch (b._type) {
          case 'heroBlock':
            return (
              <section key={k} className="pg-hero"><div className="wrap">
                {b.eyebrow && <span className="eyebrow">{b.eyebrow}</span>}
                <h1>{b.title}</h1>{b.lead && <p className="lead">{b.lead}</p>}<Ctas ctas={b.ctas} />
                {b.image?.url && <div className="media"><img src={cdn(b.image.url, 1800)} alt={b.image.alt || ''} /></div>}
              </div></section>
            )
          case 'richTextBlock':
            return <section key={k} className="blk"><div className="wrap">{b.title && <h2>{b.title}</h2>}<Prose value={b.body} /></div></section>
          case 'imageTextBlock':
            return (
              <section key={k} className={'blk imgtxt' + (b.imageRight === false ? ' left' : '')}><div className="wrap">
                <div>{b.title && <h2>{b.title}</h2>}<Prose value={b.body} /><Ctas ctas={b.ctas} /></div>
                {b.image?.url && <div className="im"><img src={cdn(b.image.url, 1200)} alt={b.image.alt || ''} loading="lazy" /></div>}
              </div></section>
            )
          case 'featureGridBlock':
            return <section key={k} className="blk feat-grid"><div className="wrap">{b.title && <h2>{b.title}</h2>}<div className="grid">{(b.items || []).map((f: any) => <div key={f._key}><b>{f.title}</b><p>{f.text}</p></div>)}</div></div></section>
          case 'cardsBlock':
            return (
              <section key={k} className="blk cards"><div className="wrap">{b.title && <h2>{b.title}</h2>}{b.intro && <p className="lead" style={{marginBottom: 28}}>{b.intro}</p>}
                <div className="grid">{(b.cards || []).map((c: any) => {
                  const inner = <>{c.image?.url && <img src={cdn(c.image.url, 800)} alt={c.image.alt || ''} loading="lazy" />}<h3>{c.title}</h3>{c.text && <p>{c.text}</p>}</>
                  return c.link?.href ? <a key={c._key} className="card" href={c.link.href}>{inner}</a> : <div key={c._key} className="card">{inner}</div>
                })}</div></div></section>
            )
          case 'galleryBlock':
            return <section key={k} className="blk gallery"><div className="wrap">{b.title && <h2>{b.title}</h2>}<div className="grid">{(b.images || []).map((im: any) => <img key={im._key} src={cdn(im.url, 900)} alt={im.alt || ''} loading="lazy" />)}</div></div></section>
          case 'videoBlock':
            return ytEmbed(b.url) ? <section key={k} className="blk video"><div className="wrap">{b.title && <h2>{b.title}</h2>}<div className="frame"><iframe src={ytEmbed(b.url)} title={b.title || 'Video'} allow="encrypted-media; picture-in-picture" allowFullScreen loading="lazy" /></div></div></section> : null
          case 'logoWallBlock':
            return <section key={k} className="blk logos"><div className="wrap">{b.title && <h2>{b.title}</h2>}<div className="grid">{(b.logos || []).map((l: any) => l.image?.url && <img key={l._key} src={cdn(l.image.url, 300)} alt={l.name || ''} loading="lazy" />)}</div></div></section>
          case 'dealerMapBlock':
            return <section key={k} className="blk dealers"><div className="wrap">{b.title && <h2>{b.title}</h2>}<div className="grid">{(b.dealers || []).map((d: any) => <div key={d._key} className="d"><b>{d.name}</b><small>{[d.city, d.country].filter(Boolean).join(' · ')}</small></div>)}</div></div></section>
          case 'faqBlock':
            return <section key={k} className="blk faq"><div className="wrap">{b.title && <h2>{b.title}</h2>}{(b.items || []).map((f: any) => <details key={f._key}><summary>{f.q}</summary><Prose value={f.a} /></details>)}</div></section>
          case 'ctaBlock':
            return <section key={k} className="blk cta"><div className="wrap"><h2>{b.title}</h2>{b.text && <p className="lead" style={{margin: '0 auto', maxWidth: '56ch'}}>{b.text}</p>}<Ctas ctas={b.ctas} /></div></section>
          case 'academyBlock':
            return <section key={k} className="blk academy"><div className="wrap">{b.title && <h2>{b.title}</h2>}<div className="grid">{(b.items || []).map((r: any) => (
              <a key={r._key} className="res" href={r.link?.href || '#'}>{r.image?.url && <img src={cdn(r.image.url, 800)} alt="" loading="lazy" />}{r.kind && <span className="k">{r.kind}</span>}<h3>{r.title}</h3>{r.text && <p style={{color: 'var(--muted)'}}>{r.text}</p>}</a>
            ))}</div></div></section>
          case 'refListBlock':
            return null // popolato dalle pagine che lo supportano
          case 'formBlock':
            return (
              <section key={k} className="blk form" id="contatti-form"><div className="wrap"><div className="box">
                <h2>{b.title || 'Contattaci'}</h2>{b.intro && <p className="lead">{b.intro}</p>}
                <form action="mailto:info@layerloop3d.com" method="post" encType="text/plain">
                  <label>Nome e azienda<input name="nome" required /></label><label>Email<input type="email" name="email" required /></label>
                  <label>Messaggio<textarea name="messaggio" rows={4} /></label><button className="btn" type="submit">Invia richiesta →</button>
                </form></div></div></section>
            )
          default:
            return null
        }
      })}
    </>
  )
}
