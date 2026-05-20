import {defineType, defineField} from 'sanity'

export const contactFormBlock = defineType({
  name: 'contactFormBlock',
  title: 'Contactformulier',
  type: 'object',
  description: 'Formspree endpoint staat hardcoded in de site-config.',
  fields: [
    defineField({name: 'subtitle', type: 'string'}),
    defineField({name: 'title', type: 'string'}),
    defineField({name: 'text', type: 'text', rows: 3}),
    defineField({name: 'hashurl', title: 'Anker-ID (optioneel)', type: 'string'}),
  ],
  preview: {
    select: {title: 'title'},
    prepare: ({title}) => ({title: `Contactformulier: ${title ?? ''}`}),
  },
})
