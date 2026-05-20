import {defineType, defineField} from 'sanity'

export const projectImage = defineType({
  name: 'projectImage',
  title: 'Projectfoto',
  type: 'document',
  fields: [
    defineField({
      name: 'image',
      type: 'image',
      options: {hotspot: true},
      validation: (R) => R.required(),
    }),
    defineField({name: 'alt', type: 'string', description: 'Korte beschrijving voor alt-tekst.'}),
    defineField({
      name: 'tags',
      type: 'array',
      of: [{type: 'string'}],
      options: {layout: 'tags'},
      description: 'Categorieën voor filter (overeenkomstig de tags in Site Settings).',
    }),
    defineField({
      name: 'order',
      type: 'number',
      description: 'Lager nummer = eerder in de carousel.',
      initialValue: 0,
    }),
  ],
  orderings: [
    {
      title: 'Volgorde (handmatig)',
      name: 'orderAsc',
      by: [{field: 'order', direction: 'asc'}],
    },
  ],
  preview: {
    select: {media: 'image', title: 'alt', tags: 'tags'},
    prepare: ({media, title, tags}) => ({
      title: title || 'Projectfoto',
      subtitle: (tags ?? []).join(', '),
      media,
    }),
  },
})
