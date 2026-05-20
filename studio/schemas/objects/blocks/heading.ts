import {defineType, defineField} from 'sanity'

export const heading = defineType({
  name: 'heading',
  title: 'Paginatitel (H1)',
  type: 'object',
  fields: [
    defineField({name: 'text', type: 'string', validation: (R) => R.required()}),
  ],
  preview: {
    select: {title: 'text'},
    prepare: ({title}) => ({title: `H1: ${title ?? ''}`}),
  },
})
