// GROQ projections + queries. Kept terse but explicit so block-renderer always
// receives all the fields it needs without overfetching.

const linkProjection = `
  type,
  href,
  anchor,
  "internal": internal->{_id, _type, "slug": slug.current}
`

const ctaProjection = `
  label,
  link{${linkProjection}}
`

// Portable Text passes through verbatim — we only need to ensure annotation refs
// expand the same way as inline links.
const portableTextProjection = `
  ...,
  markDefs[]{
    ...,
    _type == "link" => {${linkProjection}}
  }
`

export const blocksProjection = `
  blocks[]{
    _key,
    _type,
    _type == "cover" => { image, size },
    _type == "heading" => { text },
    _type == "textBlock" => { text[]{${portableTextProjection}} },
    _type == "imageBlock" => {
      image, alt, caption, ratio, crop, lightbox,
      link{${linkProjection}}
    },
    _type == "gallery" => { images[]{..., alt}, ratio, crop, caption },
    _type == "video" => { url, caption },
    _type == "buttonBlock" => { text, link{${linkProjection}} },
    _type in ["oneImageStory","twoImageStory","threeImageStory","multiImageStory"] => {
      subtitle, title,
      text[]{${portableTextProjection}},
      cta[]{${ctaProjection}},
      radio, hashurl,
      image{..., alt},
      images[]{..., alt}
    },
    _type == "contactFormBlock" => { subtitle, title, text, hashurl }
  }
`

const seoProjection = `
  seo{title, description, canonical, ogTitle, ogDescription, ogImage, noindex}
`

export const homeQuery = `
  *[_type == "home"][0]{
    title,
    banner{
      images[]{..., alt},
      title,
      button1{${ctaProjection}},
      button2{${ctaProjection}}
    },
    ${blocksProjection},
    ${seoProjection}
  }
`

export const pageBySlugQuery = `
  *[_type == "page" && slug.current == $slug][0]{
    _id, title, "slug": slug.current,
    ${blocksProjection},
    ${seoProjection}
  }
`

export const allPageSlugsQuery = `
  *[_type == "page" && defined(slug.current)]{ "slug": slug.current, title }
`

export const contactQuery = `
  *[_type == "contactPage"][0]{
    title,
    ${blocksProjection},
    ${seoProjection}
  }
`

export const siteSettingsQuery = `
  *[_type == "siteSettings"][0]{
    siteTitle, organizationName,
    menu[]{label, link{${linkProjection}}},
    footerText,
    socials[]{platform, url},
    defaultMetaDescription, defaultOgImage,
    projectTags
  }
`

export const projectImagesQuery = `
  *[_type == "projectImage"] | order(order asc, _createdAt asc)[0...30]{
    _id, image, alt, tags
  }
`
