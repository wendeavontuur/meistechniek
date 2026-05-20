import type {PortableTextBlock} from '@portabletext/types'

export type SanityImage = {
  asset?: {_ref: string; _type: string}
  hotspot?: {x: number; y: number; height: number; width: number}
  crop?: {top: number; bottom: number; left: number; right: number}
  alt?: string
  _type?: string
  _key?: string
}

export type LinkValue = {
  type?: 'internal' | 'external' | 'anchor'
  href?: string
  anchor?: string
  internal?: {_id: string; _type: string; slug?: string}
}

export type CtaValue = {label?: string; link?: LinkValue}

export type SeoValue = {
  title?: string
  description?: string
  canonical?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: SanityImage
  noindex?: boolean
}

export type Block =
  | {_type: 'cover'; _key: string; image: SanityImage; size?: string}
  | {_type: 'heading'; _key: string; text: string}
  | {_type: 'textBlock'; _key: string; text: PortableTextBlock[]}
  | {
      _type: 'imageBlock'
      _key: string
      image: SanityImage
      alt?: string
      caption?: string
      ratio?: string
      crop?: boolean
      lightbox?: boolean
      link?: LinkValue
    }
  | {
      _type: 'gallery'
      _key: string
      images: SanityImage[]
      ratio?: string
      crop?: boolean
      caption?: string
    }
  | {_type: 'video'; _key: string; url: string; caption?: string}
  | {_type: 'buttonBlock'; _key: string; text: string; link?: LinkValue}
  | {
      _type: 'oneImageStory' | 'twoImageStory' | 'threeImageStory' | 'multiImageStory'
      _key: string
      subtitle?: string
      title?: string
      text?: PortableTextBlock[]
      cta?: CtaValue[]
      radio?: 'img-left' | 'img-right'
      hashurl?: string
      image?: SanityImage
      images?: SanityImage[]
    }
  | {
      _type: 'contactFormBlock'
      _key: string
      subtitle?: string
      title?: string
      text?: string
      hashurl?: string
    }

export type SiteSettings = {
  siteTitle: string
  organizationName?: string
  menu?: Array<{label: string; link?: LinkValue}>
  footerText?: PortableTextBlock[]
  socials?: Array<{platform: string; url: string}>
  defaultMetaDescription?: string
  defaultOgImage?: SanityImage
  projectTags?: string[]
}
