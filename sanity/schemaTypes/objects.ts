import {defineType, defineField, defineArrayMember} from 'sanity'

export const seo = defineType({
  name: 'seo', title: 'SEO', type: 'object',
  fields: [
    defineField({name: 'title', title: 'Titolo SEO', type: 'string', validation: (r) => r.max(70)}),
    defineField({name: 'description', title: 'Meta description', type: 'text', rows: 3, validation: (r) => r.max(170)}),
    defineField({name: 'image', title: 'Immagine social', type: 'image'}),
    defineField({name: 'noindex', title: 'Nascondi ai motori di ricerca', type: 'boolean', initialValue: false}),
  ],
})

export const link = defineType({
  name: 'link', title: 'Link', type: 'object',
  fields: [
    defineField({name: 'label', title: 'Testo', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'href', title: 'URL o percorso', type: 'string', description: 'Es. /stampanti/next oppure https://…', validation: (r) => r.required()}),
    defineField({name: 'external', title: 'Apri in nuova scheda', type: 'boolean', initialValue: false}),
  ],
  preview: {select: {title: 'label', subtitle: 'href'}},
})

export const mediaImage = defineType({
  name: 'mediaImage', title: 'Immagine', type: 'image', options: {hotspot: true},
  fields: [
    defineField({name: 'alt', title: 'Testo alternativo', type: 'string'}),
    defineField({name: 'caption', title: 'Didascalia', type: 'string'}),
  ],
})

export const portableText = defineType({
  name: 'portableText', title: 'Testo', type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        {title: 'Paragrafo', value: 'normal'},
        {title: 'Titolo 2', value: 'h2'},
        {title: 'Titolo 3', value: 'h3'},
        {title: 'Titolo 4', value: 'h4'},
        {title: 'Citazione', value: 'blockquote'},
      ],
      lists: [{title: 'Elenco', value: 'bullet'}, {title: 'Numerato', value: 'number'}],
      marks: {
        decorators: [{title: 'Grassetto', value: 'strong'}, {title: 'Corsivo', value: 'em'}],
        annotations: [{
          name: 'link', type: 'object', title: 'Link',
          fields: [defineField({name: 'href', type: 'url', title: 'URL', validation: (r) => r.uri({allowRelative: true, scheme: ['http', 'https', 'mailto', 'tel']})})],
        }],
      },
    }),
    defineArrayMember({type: 'mediaImage'}),
    defineArrayMember({
      name: 'videoEmbed', type: 'object', title: 'Video',
      fields: [defineField({name: 'url', type: 'url', title: 'URL YouTube/Vimeo'}), defineField({name: 'caption', type: 'string', title: 'Didascalia'})],
      preview: {select: {title: 'url'}},
    }),
    defineArrayMember({
      name: 'callout', type: 'object', title: 'Riquadro evidenziato',
      fields: [defineField({name: 'title', type: 'string', title: 'Titolo'}), defineField({name: 'text', type: 'text', title: 'Testo'})],
      preview: {select: {title: 'title', subtitle: 'text'}},
    }),
  ],
})
