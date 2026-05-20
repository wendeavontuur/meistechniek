import {home} from './documents/home'
import {page} from './documents/page'
import {contactPage} from './documents/contactPage'
import {siteSettings} from './documents/siteSettings'
import {projectImage} from './documents/projectImage'

import {seo} from './objects/seo'
import {link} from './objects/link'
import {cta} from './objects/cta'

import {cover} from './objects/blocks/cover'
import {heading} from './objects/blocks/heading'
import {textBlock} from './objects/blocks/textBlock'
import {imageBlock} from './objects/blocks/imageBlock'
import {gallery} from './objects/blocks/gallery'
import {video} from './objects/blocks/video'
import {oneImageStory} from './objects/blocks/oneImageStory'
import {twoImageStory} from './objects/blocks/twoImageStory'
import {threeImageStory} from './objects/blocks/threeImageStory'
import {multiImageStory} from './objects/blocks/multiImageStory'
import {buttonBlock} from './objects/blocks/buttonBlock'
import {contactFormBlock} from './objects/blocks/contactFormBlock'

export const schemaTypes = [
  // Documents
  home,
  page,
  contactPage,
  siteSettings,
  projectImage,
  // Shared objects
  seo,
  link,
  cta,
  // Blocks
  cover,
  heading,
  textBlock,
  imageBlock,
  gallery,
  video,
  oneImageStory,
  twoImageStory,
  threeImageStory,
  multiImageStory,
  buttonBlock,
  contactFormBlock,
]

export {blockRefs} from './blockRefs'
