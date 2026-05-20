import {defineType, defineField} from 'sanity'
import {blockRefs} from '../index'

export const home = defineType({
  name: 'home',
  title: 'Home',
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
      description: 'Interne titel (verschijnt niet zichtbaar — gebruik SEO-tab voor browsertitel).',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'banner',
      title: 'Header (banner)',
      type: 'object',
      group: 'content',
      fields: [
        defineField({
          name: 'images',
          title: 'Beelden (carousel achter de header)',
          type: 'array',
          of: [
            {
              type: 'image',
              options: {hotspot: true},
              fields: [{name: 'alt', type: 'string', title: 'Alt-tekst'}],
            },
          ],
          validation: (R) => R.min(4).max(12),
        }),
        defineField({name: 'title', type: 'text', rows: 3}),
        defineField({name: 'button1', title: 'Knop 1', type: 'cta'}),
        defineField({name: 'button2', title: 'Knop 2', type: 'cta'}),
      ],
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
    prepare: () => ({title: 'Home'}),
  },
})
