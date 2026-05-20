import {defineType, defineField} from 'sanity'
import {storyTextFields} from './_storyFields'

export const threeImageStory = defineType({
  name: 'threeImageStory',
  title: 'Story — 3 beelden',
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
      validation: (R) => R.length(3).error('Exact 3 beelden vereist.'),
    }),
  ],
  preview: {
    select: {title: 'title', images: 'images'},
    prepare: ({title, images}) => ({title: `Story-3: ${title ?? ''}`, media: images?.[0]}),
  },
})
