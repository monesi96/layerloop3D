import {defineType, defineField, defineArrayMember} from 'sanity'

export const pageBlocks = ['heroBlock', 'richTextBlock', 'imageTextBlock', 'featureGridBlock', 'galleryBlock', 'videoBlock', 'cardsBlock', 'refListBlock', 'logoWallBlock', 'dealerMapBlock', 'faqBlock', 'ctaBlock', 'formBlock', 'academyBlock'].map((t) => defineArrayMember({type: t}))

export const page = defineType({
  name: 'page', title: 'Pagina', type: 'document',
  fields: [
    defineField({name: 'title', title: 'Titolo', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'slug', title: 'Slug (percorso)', type: 'slug', options: {source: 'title', maxLength: 96}, validation: (r) => r.required()}),
    defineField({name: 'template', title: 'Modello', type: 'string', options: {list: [{title: 'Standard', value: 'default'}, {title: 'Home', value: 'home'}, {title: 'Evento / webinar', value: 'event'}]}, initialValue: 'default'}),
    defineField({name: 'language', title: 'Lingua', type: 'string', options: {list: ['it', 'en']}, initialValue: 'it'}),
    defineField({name: 'blocks', title: 'Contenuto', type: 'array', of: pageBlocks}),
    defineField({name: 'seo', title: 'SEO', type: 'seo'}),
    defineField({name: 'legacyUrl', title: 'URL sul vecchio sito (per i redirect)', type: 'string'}),
  ],
  preview: {select: {title: 'title', subtitle: 'slug.current'}},
})
