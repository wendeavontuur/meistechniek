import {defineType, defineField} from 'sanity'

export const cta = defineType({
  name: 'cta',
  title: 'Call to action',
  type: 'object',
  fields: [
    defineField({name: 'label', type: 'string', validation: (R) => R.required()}),
    defineField({name: 'link', type: 'link'}),
  ],
  preview: {
    select: {title: 'label'},
  },
})
