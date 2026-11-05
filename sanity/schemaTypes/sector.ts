import {defineType, defineField, defineArrayMember} from 'sanity'
import {pageBlocks} from './page'

export const sector = defineType({
  name: 'sector', title: 'Settore', type: 'document',
  fields: [
    defineField({name: 'name', title: 'Nome', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'slug', title: 'Slug', type: 'slug', options: {source: 'name'}, validation: (r) => r.required()}),
    defineField({name: 'order', title: 'Ordine', type: 'number'}),
    defineField({name: 'published', title: 'Ha una pagina pubblica', type: 'boolean', initialValue: false, description: 'Se spento, nelle liste compare il nome senza pulsante di accesso.'}),
    defineField({name: 'summary', title: 'Descrizione breve', type: 'text', rows: 2}),
    defineField({name: 'heroImage', title: 'Immagine hero', type: 'mediaImage'}),
    defineField({name: 'headline', title: 'Titolo (H1)', type: 'string'}),
    defineField({name: 'printers', title: 'Macchine consigliate', type: 'array', of: [defineArrayMember({type: 'reference', to: [{type: 'printer'}]})]}),
    defineField({name: 'materials', title: 'Materiali consigliati', type: 'array', of: [defineArrayMember({type: 'reference', to: [{type: 'material'}]})]}),
    defineField({name: 'caseStudies', title: 'Case study', type: 'array', of: [defineArrayMember({type: 'reference', to: [{type: 'caseStudy'}]})]}),
    defineField({name: 'blocks', title: 'Contenuto pagina', type: 'array', of: pageBlocks}),
    defineField({name: 'seo', title: 'SEO', type: 'seo'}),
    defineField({name: 'legacyUrl', title: 'URL sul vecchio sito', type: 'string'}),
  ],
  preview: {select: {title: 'name', subtitle: 'summary', media: 'heroImage'}},
})
