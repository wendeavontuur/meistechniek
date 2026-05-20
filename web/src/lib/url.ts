import type {LinkValue} from './types'

export function resolveLink(link?: LinkValue): string {
  if (!link) return '#'
  if (link.type === 'external' && link.href) return link.href
  if (link.type === 'anchor' && link.anchor) return `#${link.anchor.replace(/^#/, '')}`
  if (link.type === 'internal' && link.internal) {
    const {_type, slug} = link.internal
    if (_type === 'home') return '/'
    if (_type === 'contactPage') return '/contact'
    if (_type === 'page' && slug) return `/${slug}`
  }
  return '#'
}
