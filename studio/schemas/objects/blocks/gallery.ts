import {defineType, defineField} from 'sanity'

export const gallery = defineType({
  name: 'gallery',
  title: 'Galerij (grid met lightbox)',
  type: 'object',
  fields: [
    defineField({
      name: 'images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {hotspot: true},
          fields: [
            {name: 'alt', type: 'string', title: 'Alt-tekst'},
          ],
        },
      ],
      validation: (R) => R.min(1),
    }),
    defineField({name: 'ratio', type: 'string', initialValue: 'auto'}),
    defineField({name: 'crop', type: 'boolean', initialValue: true}),
    defineField({name: 'caption', type: 'string'}),
  ],
  preview: {
    select: {images: 'images', caption: 'caption'},
    prepare: ({images, caption}) => ({
      title: caption || `Galerij (${images?.length ?? 0} foto's)`,
      media: images?.[0],
    }),
  },
})
