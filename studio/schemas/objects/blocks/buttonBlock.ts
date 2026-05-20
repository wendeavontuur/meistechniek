import {defineType, defineField} from 'sanity'

export const buttonBlock = defineType({
  name: 'buttonBlock',
  title: 'Knop',
  type: 'object',
  fields: [
    defineField({name: 'text', type: 'string', validation: (R) => R.required()}),
    defineField({name: 'link', type: 'link'}),
  ],
  preview: {
    select: {title: 'text'},
    prepare: ({title}) => ({title: `Knop: ${title ?? ''}`}),
  },
})
