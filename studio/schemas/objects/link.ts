import {defineType, defineField} from 'sanity'

export const link = defineType({
  name: 'link',
  title: 'Link',
  type: 'object',
  fields: [
    defineField({
      name: 'type',
      type: 'string',
      options: {
        list: [
          {title: 'Interne pagina', value: 'internal'},
          {title: 'Externe URL', value: 'external'},
          {title: 'Anker op deze pagina', value: 'anchor'},
        ],
        layout: 'radio',
      },
      initialValue: 'internal',
    }),
    defineField({
      name: 'internal',
      title: 'Interne pagina',
      type: 'reference',
      to: [{type: 'home'}, {type: 'page'}, {type: 'contactPage'}],
      hidden: ({parent}) => parent?.type !== 'internal',
    }),
    defineField({
      name: 'href',
      title: 'URL',
      type: 'url',
      validation: (R) =>
        R.uri({scheme: ['http', 'https', 'mailto', 'tel']}),
      hidden: ({parent}) => parent?.type !== 'external',
    }),
    defineField({
      name: 'anchor',
      title: 'Anker (zonder #)',
      type: 'string',
      hidden: ({parent}) => parent?.type !== 'anchor',
    }),
  ],
})
