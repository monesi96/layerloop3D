import {defineType, defineField, defineArrayMember} from 'sanity'
import {pageBlocks} from './page'

export const printer = defineType({
  name: 'printer', title: 'Stampante', type: 'document',
  fields: [
    defineField({name: 'name', title: 'Nome', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'slug', title: 'Slug', type: 'slug', options: {source: 'name'}, validation: (r) => r.required()}),
    defineField({name: 'order', title: 'Ordine nei menu', type: 'number'}),
    defineField({name: 'headline', title: 'Titolo (H1)', type: 'string'}),
    defineField({name: 'tagline', title: 'Sottotitolo breve', type: 'string', description: 'Usato nelle card e nel megamenu'}),
    defineField({name: 'lead', title: 'Descrizione hero', type: 'text', rows: 3}),
    defineField({name: 'chips', title: 'Dati chiave (chip)', type: 'array', of: [defineArrayMember({type: 'string'})]}),
    defineField({name: 'cardImage', title: 'Immagine card (PNG/WebP con trasparenza)', type: 'mediaImage'}),
    defineField({name: 'heroImage', title: 'Immagine hero', type: 'mediaImage'}),
    defineField({name: 'heroVideo', title: 'Video hero', type: 'file', options: {accept: 'video/*'}}),
    defineField({name: 'model3d', title: 'Modello 3D (GLB)', type: 'file', options: {accept: '.glb,model/gltf-binary'}, description: 'Modello ottimizzato per il web. Il file CAD originale (STEP) va in "Sorgente CAD".'}),
    defineField({name: 'cadSource', title: 'Sorgente CAD (STEP, riservato)', type: 'file'}),
    defineField({name: 'highlights', title: 'Tre numeri chiave (sotto la hero)', type: 'array', of: [defineArrayMember({
      type: 'object', name: 'highlight',
      fields: [defineField({name: 'icon', type: 'string', title: 'Icona'}), defineField({name: 'value', type: 'string', title: 'Valore'}), defineField({name: 'text', type: 'text', rows: 2, title: 'Testo'})],
      preview: {select: {title: 'value', subtitle: 'text'}},
    })]}),
    defineField({name: 'tourSteps', title: 'Tour della macchina', type: 'array', of: [defineArrayMember({
      type: 'object', name: 'tourStep',
      fields: [defineField({name: 'title', type: 'string', title: 'Titolo'}), defineField({name: 'text', type: 'text', rows: 2, title: 'Testo'}), defineField({name: 'image', type: 'mediaImage', title: 'Dettaglio'}), defineField({name: 'hotspot', type: 'string', title: 'Hotspot sul 3D (nome nodo)'})],
      preview: {select: {title: 'title', subtitle: 'text', media: 'image'}},
    })]}),
    defineField({name: 'specs', title: 'Scheda tecnica', type: 'array', of: [defineArrayMember({
      type: 'object', name: 'spec',
      fields: [defineField({name: 'label', type: 'string', title: 'Voce'}), defineField({name: 'value', type: 'string', title: 'Valore'})],
      preview: {select: {title: 'label', subtitle: 'value'}},
    })]}),
    defineField({name: 'datasheet', title: 'Scheda tecnica (PDF)', type: 'file', options: {accept: 'application/pdf'}}),
    defineField({name: 'materials', title: 'Materiali compatibili', type: 'array', of: [defineArrayMember({type: 'reference', to: [{type: 'material'}]})]}),
    defineField({name: 'sectors', title: 'Settori', type: 'array', of: [defineArrayMember({type: 'reference', to: [{type: 'sector'}]})]}),
    defineField({name: 'blocks', title: 'Sezioni aggiuntive', type: 'array', of: pageBlocks}),
    defineField({name: 'seo', title: 'SEO', type: 'seo'}),
  ],
  preview: {select: {title: 'name', subtitle: 'tagline', media: 'cardImage'}},
})
