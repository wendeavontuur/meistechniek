import {defineType, defineField} from 'sanity'

export const imageBlock = defineType({
  name: 'imageBlock',
  title: 'Afbeelding',
  type: 'object',
  fields: [
    defineField({
      name: 'image',
      type: 'image',
      options: {hotspot: true},
      validation: (R) => R.required(),
    }),
    defineField({name: 'alt', type: 'string', description: 'Alt-tekst voor toegankelijkheid.'}),
    defineField({name: 'caption', type: 'string'}),
    defineField({
      name: 'ratio',
      type: 'string',
      description: 'Bijv. "16/9", "4/3", "1/1" of "auto".',
      initialValue: 'auto',
    }),
    defineField({
      name: 'crop',
      title: 'Bijsnijden naar ratio',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({name: 'lightbox', type: 'boolean', initialValue: true}),
    defineField({name: 'link', type: 'link'}),
  ],
  preview: {
    select: {media: 'image', alt: 'alt', caption: 'caption'},
    prepare: ({media, alt, caption}) => ({title: alt || caption || 'Afbeelding', media}),
  },
})
