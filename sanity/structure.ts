import type {StructureResolver} from 'sanity/structure'

const singleton = (S: any, id: string, title: string, type = id) =>
  S.listItem().title(title).id(id).child(S.document().schemaType(type).documentId(id))

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Layerloop')
    .items([
      singleton(S, 'siteSettings', 'Impostazioni sito (menu, footer)'),
      S.divider(),
      S.documentTypeListItem('page').title('Pagine'),
      S.documentTypeListItem('printer').title('Stampanti'),
      S.documentTypeListItem('material').title('Materiali'),
      S.documentTypeListItem('sector').title('Settori'),
      S.documentTypeListItem('caseStudy').title('Case study'),
      S.divider(),
      S.documentTypeListItem('post').title('Articoli blog'),
      S.documentTypeListItem('category').title('Categorie blog'),
      S.documentTypeListItem('author').title('Autori'),
    ])
