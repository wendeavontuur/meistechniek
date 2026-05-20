import {defineType, defineField} from 'sanity'
import {blockRefs} from '../index'

export const page = defineType({
  name: 'page',
  title: 'Pagina',
  type: 'document',
  groups: [
    {name: 'content', title: 'Inhoud', default: true},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      group: 'content',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      group: 'content',
      options: {source: 'title', maxLength: 96},
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'blocks',
      title: 'Content-blocks',
      type: 'array',
      group: 'content',
      of: blockRefs,
    }),
    defineField({name: 'seo', type: 'seo', group: 'seo'}),
  ],
  preview: {
    select: {title: 'title', slug: 'slug.current'},
    prepare: ({title, slug}) => ({title, subtitle: slug ? `/${slug}` : ''}),
  },
})
