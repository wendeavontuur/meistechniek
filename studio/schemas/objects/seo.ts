import {defineType, defineField} from 'sanity'

export const seo = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      description: 'Overschrijft de paginatitel in de browsertab (max 60 tekens).',
      validation: (R) => R.max(60),
    }),
    defineField({
      name: 'description',
      type: 'text',
      rows: 3,
      description: 'Meta description (max 160 tekens).',
      validation: (R) => R.max(160),
    }),
    defineField({name: 'canonical', type: 'url'}),
    defineField({name: 'ogTitle', title: 'OG / Twitter title', type: 'string'}),
    defineField({name: 'ogDescription', title: 'OG / Twitter description', type: 'text', rows: 3}),
    defineField({
      name: 'ogImage',
      title: 'OG / Twitter image',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({name: 'noindex', type: 'boolean', initialValue: false}),
  ],
})
