import {defineType, defineField, defineArrayMember} from 'sanity'

export const caseStudy = defineType({
  name: 'caseStudy', title: 'Case study', type: 'document',
  fields: [
    defineField({name: 'title', title: 'Titolo', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'slug', title: 'Slug', type: 'slug', options: {source: 'title', maxLength: 96}, validation: (r) => r.required()}),
    defineField({name: 'date', title: 'Data', type: 'date'}),
    defineField({name: 'cover', title: 'Copertina', type: 'mediaImage'}),
    defineField({name: 'summary', title: 'Sintesi', type: 'text', rows: 3}),
    defineField({name: 'sectors', title: 'Settori', type: 'array', of: [defineArrayMember({type: 'reference', to: [{type: 'sector'}]})]}),
    defineField({name: 'printer', title: 'Macchina', type: 'reference', to: [{type: 'printer'}]}),
    defineField({name: 'material', title: 'Materiale', type: 'reference', to: [{type: 'material'}]}),
    defineField({name: 'pdf', title: 'Whitepaper (PDF)', type: 'file', options: {accept: 'application/pdf'}}),
    defineField({name: 'body', title: 'Contenuto', type: 'portableText'}),
    defineField({name: 'seo', title: 'SEO', type: 'seo'}),
    defineField({name: 'legacyUrl', title: 'URL sul vecchio sito', type: 'string'}),
  ],
  orderings: [{title: 'Più recenti', name: 'dateDesc', by: [{field: 'date', direction: 'desc'}]}],
  preview: {select: {title: 'title', subtitle: 'summary', media: 'cover'}},
})
