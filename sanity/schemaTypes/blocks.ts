import {defineType, defineField, defineArrayMember} from 'sanity'

const block = (name: string, title: string, fields: any[], previewTitle = 'title') =>
  defineType({name, title, type: 'object', fields, preview: {select: {title: previewTitle}, prepare: ({title: t}: any) => ({title: t || title, subtitle: title})}})

const ctas = defineField({name: 'ctas', title: 'Pulsanti', type: 'array', of: [defineArrayMember({type: 'link'})]})

export const blocks = [
  block('heroBlock', 'Hero', [
    defineField({name: 'eyebrow', title: 'Sopratitolo', type: 'string'}),
    defineField({name: 'title', title: 'Titolo (H1)', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'lead', title: 'Testo', type: 'text', rows: 3}),
    defineField({name: 'image', title: 'Immagine', type: 'mediaImage'}),
    defineField({name: 'videoUrl', title: 'Video (YouTube/Vimeo/MP4)', type: 'url'}),
    ctas,
  ]),
  block('richTextBlock', 'Testo', [
    defineField({name: 'title', title: 'Titolo', type: 'string'}),
    defineField({name: 'body', title: 'Contenuto', type: 'portableText'}),
  ]),
  block('imageTextBlock', 'Immagine + testo', [
    defineField({name: 'title', title: 'Titolo', type: 'string'}),
    defineField({name: 'body', title: 'Contenuto', type: 'portableText'}),
    defineField({name: 'image', title: 'Immagine', type: 'mediaImage'}),
    defineField({name: 'imageRight', title: 'Immagine a destra', type: 'boolean', initialValue: true}),
    ctas,
  ]),
  block('featureGridBlock', 'Punti chiave', [
    defineField({name: 'title', title: 'Titolo', type: 'string'}),
    defineField({name: 'items', title: 'Punti', type: 'array', of: [defineArrayMember({
      type: 'object', name: 'feature',
      fields: [
        defineField({name: 'icon', title: 'Icona', type: 'string', options: {list: ['angle', 'layers', 'infinity', 'clock', 'heat', 'ruler', 'box', 'nozzle', 'carbon', 'medical', 'shield', 'euro', 'globe', 'tools']}}),
        defineField({name: 'title', title: 'Titolo', type: 'string'}),
        defineField({name: 'text', title: 'Testo', type: 'text', rows: 3}),
      ],
      preview: {select: {title: 'title', subtitle: 'text'}},
    })]}),
  ]),
  block('galleryBlock', 'Galleria', [
    defineField({name: 'title', title: 'Titolo', type: 'string'}),
    defineField({name: 'images', title: 'Immagini', type: 'array', of: [defineArrayMember({type: 'mediaImage'})]}),
  ]),
  block('videoBlock', 'Video', [
    defineField({name: 'title', title: 'Titolo', type: 'string'}),
    defineField({name: 'url', title: 'URL', type: 'url'}),
    defineField({name: 'poster', title: 'Copertina', type: 'mediaImage'}),
  ]),
  block('cardsBlock', 'Card / elenco', [
    defineField({name: 'title', title: 'Titolo', type: 'string'}),
    defineField({name: 'intro', title: 'Introduzione', type: 'text', rows: 2}),
    defineField({name: 'cards', title: 'Card', type: 'array', of: [defineArrayMember({
      type: 'object', name: 'card',
      fields: [
        defineField({name: 'title', title: 'Titolo', type: 'string'}),
        defineField({name: 'text', title: 'Testo', type: 'text', rows: 3}),
        defineField({name: 'image', title: 'Immagine', type: 'mediaImage'}),
        defineField({name: 'link', title: 'Link', type: 'link'}),
      ],
      preview: {select: {title: 'title', subtitle: 'text', media: 'image'}},
    })]}),
  ]),
  block('refListBlock', 'Elenco da contenuti', [
    defineField({name: 'title', title: 'Titolo', type: 'string'}),
    defineField({name: 'kind', title: 'Tipo', type: 'string', options: {list: [{title: 'Stampanti', value: 'printer'}, {title: 'Settori', value: 'sector'}, {title: 'Case study', value: 'caseStudy'}, {title: 'Articoli', value: 'post'}, {title: 'Materiali', value: 'material'}]}}),
    defineField({name: 'limit', title: 'Quanti mostrarne', type: 'number', initialValue: 6}),
  ]),
  block('logoWallBlock', 'Logo / partner', [
    defineField({name: 'title', title: 'Titolo', type: 'string'}),
    defineField({name: 'logos', title: 'Logo', type: 'array', of: [defineArrayMember({
      type: 'object', name: 'logo',
      fields: [defineField({name: 'name', type: 'string', title: 'Nome'}), defineField({name: 'image', type: 'mediaImage', title: 'Logo'}), defineField({name: 'url', type: 'url', title: 'Sito'}), defineField({name: 'location', type: 'string', title: 'Zona / paese'})],
      preview: {select: {title: 'name', subtitle: 'location', media: 'image'}},
    })]}),
  ]),
  block('dealerMapBlock', 'Rivenditori (elenco per paese)', [
    defineField({name: 'title', title: 'Titolo', type: 'string'}),
    defineField({name: 'dealers', title: 'Rivenditori', type: 'array', of: [defineArrayMember({
      type: 'object', name: 'dealer',
      fields: [defineField({name: 'name', type: 'string', title: 'Nome'}), defineField({name: 'country', type: 'string', title: 'Paese'}), defineField({name: 'city', type: 'string', title: 'Città'}), defineField({name: 'url', type: 'url', title: 'Sito'}), defineField({name: 'email', type: 'string', title: 'Email'}), defineField({name: 'phone', type: 'string', title: 'Telefono'})],
      preview: {select: {title: 'name', subtitle: 'country'}},
    })]}),
  ]),
  block('faqBlock', 'FAQ', [
    defineField({name: 'title', title: 'Titolo', type: 'string'}),
    defineField({name: 'items', title: 'Domande', type: 'array', of: [defineArrayMember({
      type: 'object', name: 'faq',
      fields: [defineField({name: 'q', type: 'string', title: 'Domanda'}), defineField({name: 'a', type: 'portableText', title: 'Risposta'})],
      preview: {select: {title: 'q'}},
    })]}),
  ]),
  block('ctaBlock', 'Invito all\'azione', [
    defineField({name: 'title', title: 'Titolo', type: 'string'}),
    defineField({name: 'text', title: 'Testo', type: 'text', rows: 2}),
    ctas,
  ]),
  block('formBlock', 'Modulo contatto', [
    defineField({name: 'title', title: 'Titolo', type: 'string'}),
    defineField({name: 'intro', title: 'Testo', type: 'text', rows: 2}),
    defineField({name: 'formType', title: 'Tipo', type: 'string', options: {list: [{title: 'Richiesta demo', value: 'demo'}, {title: 'Diventa rivenditore', value: 'dealer'}, {title: 'Contatto generico', value: 'contact'}, {title: 'Invia il tuo file (preventivo)', value: 'quote'}]}, initialValue: 'demo'}),
  ]),
  block('academyBlock', 'Layerloop Academy (corsi/risorse)', [
    defineField({name: 'title', title: 'Titolo', type: 'string'}),
    defineField({name: 'items', title: 'Risorse', type: 'array', of: [defineArrayMember({
      type: 'object', name: 'resource',
      fields: [
        defineField({name: 'kind', title: 'Tipo', type: 'string', options: {list: ['Webinar', 'Corso', 'Whitepaper', 'Video', 'Guida', 'Evento']}}),
        defineField({name: 'title', title: 'Titolo', type: 'string'}),
        defineField({name: 'text', title: 'Descrizione', type: 'text', rows: 3}),
        defineField({name: 'image', title: 'Immagine', type: 'mediaImage'}),
        defineField({name: 'date', title: 'Data', type: 'datetime'}),
        defineField({name: 'link', title: 'Link', type: 'link'}),
      ],
      preview: {select: {title: 'title', subtitle: 'kind', media: 'image'}},
    })]}),
  ]),
]
