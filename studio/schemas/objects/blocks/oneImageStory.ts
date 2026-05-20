import {defineType, defineField} from 'sanity'
import {storyTextFields} from './_storyFields'

export const oneImageStory = defineType({
  name: 'oneImageStory',
  title: 'Story — 1 beeld',
  type: 'object',
  fields: [
    ...storyTextFields,
    defineField({
      name: 'image',
      type: 'image',
      options: {hotspot: true},
      fields: [{name: 'alt', type: 'string', title: 'Alt-tekst'}],
      validation: (R) => R.required(),
    }),
  ],
  preview: {
    select: {title: 'title', media: 'image'},
    prepare: ({title, media}) => ({title: `Story-1: ${title ?? ''}`, media}),
  },
})
