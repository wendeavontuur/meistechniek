import {defineType, defineField} from 'sanity'

export const cover = defineType({
  name: 'cover',
  title: 'Cover (volledige breedte beeld)',
  type: 'object',
  fields: [
    defineField({
      name: 'image',
      type: 'image',
      options: {hotspot: true},
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'size',
      type: 'string',
      options: {
        list: [
          {title: 'Klein', value: 'small'},
          {title: 'Medium', value: 'medium'},
          {title: 'Groot', value: 'large'},
        ],
        layout: 'radio',
      },
      initialValue: 'medium',
    }),
  ],
  preview: {
    select: {media: 'image', size: 'size'},
    prepare: ({media, size}) => ({title: `Cover (${size ?? 'medium'})`, media}),
  },
})
