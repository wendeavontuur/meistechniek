import {defineType, defineField} from 'sanity'
import {storyTextFields} from './_storyFields'

export const twoImageStory = defineType({
  name: 'twoImageStory',
  title: 'Story — 2 beelden',
  type: 'object',
  fields: [
    ...storyTextFields,
    defineField({
      name: 'images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {hotspot: true},
          fields: [{name: 'alt', type: 'string', title: 'Alt-tekst'}],
        },
      ],
      validation: (R) => R.length(2).error('Exact 2 beelden vereist.'),
    }),
  ],
  preview: {
    select: {title: 'title', images: 'images'},
    prepare: ({title, images}) => ({title: `Story-2: ${title ?? ''}`, media: images?.[0]}),
  },
})
