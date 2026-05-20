import {defineType, defineField} from 'sanity'

export const video = defineType({
  name: 'video',
  title: 'Video (YouTube/Vimeo URL)',
  type: 'object',
  fields: [
    defineField({
      name: 'url',
      type: 'url',
      validation: (R) => R.required().uri({scheme: ['http', 'https']}),
    }),
    defineField({name: 'caption', type: 'string'}),
  ],
  preview: {
    select: {url: 'url', caption: 'caption'},
    prepare: ({url, caption}) => ({title: caption || `Video: ${url ?? ''}`}),
  },
})
