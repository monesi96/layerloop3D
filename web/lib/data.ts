import {q} from './sanity'

const IMG = (f: string) => `"${f}": ${f}.asset->url`

export type Settings = any

export const getSettings = () => q(`*[_id=="siteSettings"][0]{..., headerCta, footerColumns[]{title, links[]{label, href, external}}, headerLinks[]{label, kind, href, external}}`)

export const getPrinters = () => q(`*[_type=="printer"]|order(order asc){
  _id, name, "slug": slug.current, tagline, headline, lead, chips, cardTitle, cardText, cardChips,
  ${IMG('cardImage')}, ${IMG('heroImage')}, ${IMG('cardPoster')}, "cardVideo": cardVideo.asset->url,
  highlights[]{value, text}, specs[]{label, value}, tourSteps[]{title, text, "image": image.asset->url, "alt": image.alt},
  sectionTitle, sectionText, ${IMG('sectionImage')}, points[]{title, text}, gallery[]{"src": asset->url, caption, alt},
  revealTitle, revealText, ${IMG('revealImage')}, optionTitle, optionText, ${IMG('optionImage')},
  specIntro, materialsIntro, materialFamilies[]{title, text}, "sectorHighlights": sectorHighlights[]->name,
  "materials": materials[]->{"id": slug.current},
  seo
}`)

export const getSectors = () => q(`*[_type=="sector"]|order(order asc){
  _id, name, "slug": slug.current, summary, published, legacyUrl, headline, ${IMG('heroImage')},
  "printers": printers[]->{name, "slug": slug.current},
  "materials": materials[]->{"id": slug.current, name, "img": image.asset->url},
  "cases": caseStudies[]->{title, "slug": slug.current}
}`)

export const getMaterials = () => q(`*[_type=="material"]|order(order asc){
  "id": slug.current, "n": name, "a": alias, description, tags, categories, keyTrait, colors,
  "img": image.asset->url, "m": printers[]->name
}`)

export const getCases = () => q(`*[_type=="caseStudy"]|order(date desc){
  title, "slug": slug.current, summary, date, "cover": cover.asset->url, "coverAlt": cover.alt,
  "sectors": sectors[]->name, "printer": printer->name
}`)

export const getSeo = (type: string, slug: string) => q(`*[_type==$t && slug.current==$s][0]{title, name, seo}`, {t: type, s: slug})
