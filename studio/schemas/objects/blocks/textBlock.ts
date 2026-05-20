import {defineType, defineField} from 'sanity'

export const textBlock = defineType({
  name: 'textBlock',
  title: 'Tekst',
  type: 'object',
  fields: [
    defineField({
      name: 'text',
      title: 'Inhoud',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'H2', value: 'h2'},
            {title: 'H3', value: 'h3'},
            {title: 'H4', value: 'h4'},
          ],
          marks: {
            decorators: [
              {title: 'Bold', value: 'strong'},
              {title: 'Italic', value: 'em'},
            ],
            annotations: [{name: 'link', type: 'link'}],
          },
        },
      ],
      validation: (R) => R.required(),
    }),
  ],
  preview: {
    select: {blocks: 'text'},
    prepare: ({blocks}) => {
      const block = (blocks ?? []).find((b: any) => b._type === 'block')
      const text = block?.children?.map((c: any) => c.text).join('') ?? ''
      return {title: text ? `Tekst: ${text.slice(0, 60)}` : 'Tekst (leeg)'}
    },
  },
})
