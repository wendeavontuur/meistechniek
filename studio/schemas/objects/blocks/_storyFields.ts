import {defineField} from 'sanity'

export const storyTextFields = [
  defineField({name: 'subtitle', type: 'string', title: 'Subtitel (label)'}),
  defineField({name: 'title', type: 'string'}),
  defineField({
    name: 'text',
    type: 'array',
    title: 'Tekst',
    of: [
      {
        type: 'block',
        styles: [{title: 'Normal', value: 'normal'}],
        marks: {
          decorators: [
            {title: 'Bold', value: 'strong'},
            {title: 'Italic', value: 'em'},
          ],
          annotations: [{name: 'link', type: 'link'}],
        },
      },
    ],
  }),
  defineField({
    name: 'cta',
    title: 'Knoppen',
    type: 'array',
    of: [{type: 'cta'}],
    validation: (R) => R.max(3),
  }),
  defineField({
    name: 'radio',
    title: 'Beeldpositie',
    type: 'string',
    options: {
      list: [
        {title: 'Beeld links', value: 'img-left'},
        {title: 'Beeld rechts', value: 'img-right'},
      ],
      layout: 'radio',
    },
    initialValue: 'img-left',
  }),
  defineField({
    name: 'hashurl',
    title: 'Anker-ID (optioneel, voor menu-links)',
    type: 'string',
  }),
]
