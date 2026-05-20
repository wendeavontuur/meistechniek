import type {StructureBuilder} from 'sanity/structure'

export const structure = (S: StructureBuilder) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Site Settings')
        .id('siteSettings')
        .child(
          S.document().schemaType('siteSettings').documentId('siteSettings').title('Site Settings'),
        ),
      S.divider(),
      S.listItem()
        .title('Home')
        .id('home')
        .child(S.document().schemaType('home').documentId('home').title('Home')),
      S.documentTypeListItem('page').title('Pagina’s'),
      S.listItem()
        .title('Contact')
        .id('contactPage')
        .child(
          S.document().schemaType('contactPage').documentId('contactPage').title('Contact'),
        ),
      S.divider(),
      S.documentTypeListItem('projectImage').title('Projectfoto’s (carousel)'),
    ])
