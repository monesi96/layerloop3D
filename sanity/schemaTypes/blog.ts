import {defineType, defineField, defineArrayMember} from 'sanity'

export const category = defineType({
  name: 'category', title: 'Categoria blog', type: 'document',
  fields: [defineField({name: 'title', type: 'string', title: 'Nome', validation: (r) => r.required()}), defineField({name: 'slug', type: 'slug', title: 'Slug', options: {source: 'title'}, validation: (r) => r.required()})],
  preview: {select: {title: 'title'}},
})

export const author = defineType({
  name: 'author', title: 'Autore', type: 'document',
  fields: [
    defineField({name: 'name', type: 'string', title: 'Nome', validation: (r) => r.required()}),
    defineField({name: 'role', type: 'string', title: 'Ruolo'}),
    defineField({name: 'photo', type: 'mediaImage', title: 'Foto'}),
  ],
  preview: {select: {title: 'name', subtitle: 'role', media: 'photo'}},
})

export const post = defineType({
  name: 'post', title: 'Articolo', type: 'document',
  fields: [
    defineField({name: 'title', title: 'Titolo', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'slug', title: 'Slug', type: 'slug', options: {source: 'title', maxLength: 96}, validation: (r) => r.required()}),
    defineField({name: 'publishedAt', title: 'Data di pubblicazione', type: 'datetime', validation: (r) => r.required()}),
    defineField({name: 'excerpt', title: 'Anteprima', type: 'text', rows: 3, validation: (r) => r.max(300)}),
    defineField({name: 'cover', title: 'Immagine di copertina', type: 'mediaImage'}),
    defineField({name: 'categories', title: 'Categorie', type: 'array', of: [defineArrayMember({type: 'reference', to: [{type: 'category'}]})]}),
    defineField({name: 'author', title: 'Autore', type: 'reference', to: [{type: 'author'}]}),
    defineField({name: 'language', title: 'Lingua', type: 'string', options: {list: ['it', 'en']}, initialValue: 'it'}),
    defineField({name: 'body', title: 'Contenuto', type: 'portableText'}),
    defineField({name: 'keyword', title: 'Keyword principale (SEO)', type: 'string'}),
    defineField({name: 'seo', title: 'SEO', type: 'seo'}),
    defineField({name: 'legacyUrl', title: 'URL sul vecchio sito', type: 'string'}),
  ],
  orderings: [{title: 'Più recenti', name: 'dateDesc', by: [{field: 'publishedAt', direction: 'desc'}]}],
  preview: {select: {title: 'title', subtitle: 'publishedAt', media: 'cover'}},
})
