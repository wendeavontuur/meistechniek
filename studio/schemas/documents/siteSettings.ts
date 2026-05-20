import {defineType, defineField} from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  groups: [
    {name: 'general', title: 'Algemeen', default: true},
    {name: 'nav', title: 'Navigatie & Footer'},
    {name: 'seo', title: 'Default SEO'},
    {name: 'carousel', title: 'Carousel'},
  ],
  fields: [
    defineField({
      name: 'siteTitle',
      type: 'string',
      group: 'general',
      validation: (R) => R.required(),
    }),
    defineField({name: 'organizationName', type: 'string', group: 'general'}),
    defineField({
      name: 'menu',
      title: 'Hoofdmenu',
      type: 'array',
      group: 'nav',
      of: [
        {
          type: 'object',
          name: 'menuItem',
          fields: [
            {name: 'label', type: 'string', validation: (R) => R.required()},
            {name: 'link', type: 'link'},
          ],
          preview: {select: {title: 'label'}},
        },
      ],
    }),
    defineField({
      name: 'footerText',
      title: 'Footer-tekst',
      type: 'array',
      group: 'nav',
      of: [{type: 'block'}],
    }),
    defineField({
      name: 'socials',
      title: 'Social-links',
      type: 'array',
      group: 'nav',
      of: [
        {
          type: 'object',
          name: 'social',
          fields: [
            {name: 'platform', type: 'string'},
            {name: 'url', type: 'url'},
          ],
          preview: {select: {title: 'platform', subtitle: 'url'}},
        },
      ],
    }),
    defineField({
      name: 'defaultMetaDescription',
      type: 'text',
      rows: 3,
      group: 'seo',
      validation: (R) => R.max(160),
    }),
    defineField({
      name: 'defaultOgImage',
      type: 'image',
      options: {hotspot: true},
      group: 'seo',
    }),
    defineField({
      name: 'projectTags',
      title: 'Tags voor projectfoto-carousel',
      type: 'array',
      group: 'carousel',
      of: [{type: 'string'}],
      options: {layout: 'tags'},
    }),
  ],
  preview: {
    prepare: () => ({title: 'Site Settings'}),
  },
})
