import {defineType, defineField} from 'sanity'
import {storyTextFields} from './_storyFields'

export const multiImageStory = defineType({
  name: 'multiImageStory',
  title: 'Story — meerdere beelden (slider)',
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
      validation: (R) => R.min(2),
    }),
  ],
  preview: {
    select: {title: 'title', images: 'images'},
    prepare: ({title, images}) => ({
      title: `Story-multi: ${title ?? ''} (${images?.length ?? 0})`,
      media: images?.[0],
    }),
  },
})
