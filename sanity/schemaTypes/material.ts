import {defineType, defineField, defineArrayMember} from 'sanity'

export const material = defineType({
  name: 'material', title: 'Materiale', type: 'document',
  fields: [
    defineField({name: 'name', title: 'Nome commerciale', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'slug', title: 'Slug', type: 'slug', options: {source: 'name'}, validation: (r) => r.required()}),
    defineField({name: 'alias', title: 'Nome tecnico (es. PLA, PETG)', type: 'string'}),
    defineField({name: 'family', title: 'Famiglia', type: 'string', options: {list: ['Standard', 'Rinforzati con fibra', 'Industriali', 'Metallo e ceramica']}}),
    defineField({name: 'order', title: 'Ordine', type: 'number'}),
    defineField({name: 'description', title: 'Descrizione', type: 'text', rows: 4}),
    defineField({name: 'tags', title: 'Caratteristiche (chip)', type: 'array', of: [defineArrayMember({type: 'string'})]}),
    defineField({name: 'image', title: 'Pezzo stampato', type: 'mediaImage'}),
    defineField({name: 'printers', title: 'Stampabile su', type: 'array', of: [defineArrayMember({type: 'reference', to: [{type: 'printer'}]})]}),
    defineField({name: 'properties', title: 'Proprietà tecniche', type: 'array', of: [defineArrayMember({
      type: 'object', name: 'prop',
      fields: [defineField({name: 'label', type: 'string', title: 'Voce'}), defineField({name: 'value', type: 'string', title: 'Valore'})],
      preview: {select: {title: 'label', subtitle: 'value'}},
    })]}),
    defineField({name: 'datasheet', title: 'Scheda tecnica (PDF)', type: 'file', options: {accept: 'application/pdf'}}),
  ],
  preview: {select: {title: 'name', subtitle: 'alias', media: 'image'}},
})
