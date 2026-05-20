import {defineType, defineField} from 'sanity'
import {blockRefs} from '../blockRefs'

export const contactPage = defineType({
  name: 'contactPage',
  title: 'Contact',
  type: 'document',
  groups: [
    {name: 'content', title: 'Inhoud', default: true},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({name: 'title', type: 'string', group: 'content', validation: (R) => R.required()}),
    defineField({name: 'blocks', title: 'Content-blocks', type: 'array', group: 'content', of: blockRefs}),
    defineField({name: 'seo', type: 'seo', group: 'seo'}),
  ],
  preview: {
    prepare: () => ({title: 'Contact'}),
  },
})
