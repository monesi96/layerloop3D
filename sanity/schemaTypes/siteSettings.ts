import {defineType, defineField, defineArrayMember} from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings', title: 'Impostazioni sito', type: 'document',
  fields: [
    defineField({name: 'title', title: 'Nome sito', type: 'string', initialValue: 'Layerloop'}),
    defineField({name: 'demoEmail', title: 'Email richieste demo', type: 'string', initialValue: 'info@layerloop3d.com'}),
    defineField({name: 'headerLinks', title: 'Menu: voci', type: 'array', of: [defineArrayMember({
      type: 'object', name: 'navItem',
      fields: [
        defineField({name: 'label', title: 'Voce', type: 'string'}),
        defineField({name: 'kind', title: 'Comportamento', type: 'string', options: {list: [{title: 'Megamenu: stampanti', value: 'mega-printers'}, {title: 'Megamenu: settori', value: 'mega-sectors'}, {title: 'Megamenu: materiali', value: 'mega-materials'}, {title: 'Megamenu: case study', value: 'mega-cases'}, {title: 'Link semplice', value: 'link'}]}, initialValue: 'link'}),
        defineField({name: 'href', title: 'URL (solo link semplice)', type: 'string'}),
        defineField({name: 'external', title: 'Nuova scheda', type: 'boolean', initialValue: false}),
      ],
      preview: {select: {title: 'label', subtitle: 'kind'}},
    })]}),
    defineField({name: 'headerCta', title: 'Pulsante in alto a destra', type: 'link'}),
    defineField({name: 'footerClaim', title: 'Frase footer', type: 'text', rows: 2}),
    defineField({name: 'address', title: 'Indirizzo', type: 'text', rows: 3}),
    defineField({name: 'phone', title: 'Telefono', type: 'string'}),
    defineField({name: 'email', title: 'Email', type: 'string'}),
    defineField({name: 'footerColumns', title: 'Footer: colonne di link', type: 'array', of: [defineArrayMember({
      type: 'object', name: 'footerColumn',
      fields: [defineField({name: 'title', type: 'string', title: 'Titolo colonna'}), defineField({name: 'links', type: 'array', title: 'Link', of: [defineArrayMember({type: 'link'})]})],
      preview: {select: {title: 'title'}},
    })]}),
    defineField({name: 'legal', title: 'Riga legale', type: 'string'}),
    defineField({name: 'legalSeat', title: 'Sede legale', type: 'text', rows: 3}),
    defineField({name: 'companyNotes', title: 'Note societarie (una per riga)', type: 'array', of: [defineArrayMember({type: 'string'})]}),
    defineField({name: 'affiliateOffices', title: 'Sedi affiliate', type: 'string'}),
    defineField({name: 'vat', title: 'Partita IVA', type: 'string'}),
    defineField({name: 'credits', title: 'Credits (testo)', type: 'string'}),
    defineField({name: 'pressTitle', title: 'Sezione stampa: titolo', type: 'string', initialValue: 'Siamo presenti su:'}),
    defineField({name: 'pressLogos', title: 'Sezione stampa: loghi (chiari, su trasparente)', type: 'array', of: [defineArrayMember({
      type: 'object', name: 'pressLogo',
      fields: [defineField({name: 'name', type: 'string', title: 'Testata'}), defineField({name: 'image', type: 'mediaImage', title: 'Logo'}), defineField({name: 'url', type: 'url', title: 'Articolo / sito'})],
      preview: {select: {title: 'name', media: 'image'}},
    })]}),
    defineField({name: 'seo', title: 'SEO di default', type: 'seo'}),
  ],
  preview: {prepare: () => ({title: 'Impostazioni sito'})},
})
