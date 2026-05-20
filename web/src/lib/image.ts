import imageUrlBuilder from '@sanity/image-url'
import type {SanityImageSource} from '@sanity/image-url/lib/types/types'
import {sanity} from './sanity'

const builder = imageUrlBuilder(sanity)

export function urlFor(source: SanityImageSource) {
  return builder.image(source).auto('format').fit('max')
}

export function thumb(source: SanityImageSource, width: number, height?: number, crop = true) {
  let b = builder.image(source).width(width).auto('format').quality(85)
  if (height !== undefined) b = b.height(height)
  if (crop) b = b.fit('crop').crop('focalpoint')
  return b.url()
}
