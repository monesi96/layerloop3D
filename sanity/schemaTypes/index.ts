import {siteSettings} from './siteSettings'
import {page} from './page'
import {printer} from './printer'
import {material} from './material'
import {sector} from './sector'
import {caseStudy} from './caseStudy'
import {post, category, author} from './blog'
import {seo, link, portableText, mediaImage} from './objects'
import {blocks} from './blocks'

export const schemaTypes = [
  siteSettings, page, printer, material, sector, caseStudy, post, category, author,
  seo, link, portableText, mediaImage, ...blocks,
]
