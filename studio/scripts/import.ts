/**
 * Migrate Kirby content into Sanity.
 *
 * Run with:
 *   npx sanity exec scripts/import.ts --with-user-token
 *
 * Idempotent: documents use deterministic _ids so re-running updates instead
 * of duplicating. Images are deduped by sha-1 of file contents (Sanity does
 * this server-side via `client.assets.upload` when the same asset is uploaded
 * twice; we just store the returned asset _id keyed by source UUID).
 */
// @ts-ignore — provided by `sanity exec` runtime
import {getCliClient} from 'sanity/cli'
import {readFileSync, readdirSync, existsSync, statSync, createReadStream} from 'node:fs'
import {join, resolve, basename, extname} from 'node:path'

const KIRBY_ROOT = '/Users/woutervanuden/Documents/PaulMeis'
const CONTENT = join(KIRBY_ROOT, 'content')

const client = getCliClient({apiVersion: '2025-01-01'})

// ───────────────────────────────────────── Kirby UUID → page-doc id
const PAGE_UUID_TO_DOC_ID: Record<string, {type: string; id: string; slug?: string}> = {
  wljMYhm0m3e9QOwC: {type: 'home', id: 'home'},
  D1yCxHPlHzgzBJI5: {type: 'page', id: 'pageOver', slug: 'over'},
  XxqOVz2Mx6xMYAFY: {type: 'page', id: 'pageAanbod', slug: 'aanbod'},
  Td6HufR4WDQalDpp: {type: 'contactPage', id: 'contactPage'},
}

const KIRBY_BLOCK_TO_SANITY: Record<string, string> = {
  cover: 'cover',
  heading: 'heading',
  text: 'textBlock',
  image: 'imageBlock',
  gallery: 'gallery',
  video: 'video',
  button: 'buttonBlock',
  contactForm: 'contactFormBlock',
  '1-image-story': 'oneImageStory',
  '2-image-story': 'twoImageStory',
  '3-image-story': 'threeImageStory',
  'multi-image-story': 'multiImageStory',
}

// ───────────────────────────────────────── parse Kirby .txt format
function parseKirbyTxt(raw: string): Record<string, string> {
  const sections = raw.split(/\r?\n----\r?\n/)
  const result: Record<string, string> = {}
  for (const section of sections) {
    const trimmed = section.trim()
    if (!trimmed) continue
    const m = trimmed.match(/^([A-Za-z][A-Za-z0-9_-]*):\s*([\s\S]*)$/)
    if (!m) continue
    const key = m[1].toLowerCase()
    const value = m[2].trim()
    result[key] = value
  }
  return result
}

function parseYamlList(raw: string): string[] {
  if (!raw) return []
  // matches `- 'file://UUID'` or `- "file://UUID"` or `- file://UUID`
  return Array.from(raw.matchAll(/^\s*-\s*['"]?([^'"\n\r]+?)['"]?\s*$/gm)).map((m) => m[1].trim())
}

function extractUuids(raw: string): string[] {
  if (!raw) return []
  return parseYamlList(raw)
    .map((s) => s.replace(/^file:\/\//, '').trim())
    .filter((s) => s && !s.startsWith('http'))
}

// ───────────────────────────────────────── HTML → Portable Text
function htmlToPortableText(html: string | undefined): any[] {
  if (!html) return []
  // Replace &nbsp;, <br> tags
  let text = html.replace(/&nbsp;/g, ' ').replace(/<br\s*\/?>/gi, '\n')

  // Strip outer whitespace
  text = text.trim()
  if (!text) return []

  // Split into paragraphs by <p>...</p>; everything outside <p> becomes one paragraph
  const paragraphs: string[] = []
  const paraRe = /<p[^>]*>([\s\S]*?)<\/p>/gi
  let lastIdx = 0
  let match: RegExpExecArray | null
  while ((match = paraRe.exec(text)) !== null) {
    const before = text.slice(lastIdx, match.index).replace(/<[^>]+>/g, '').trim()
    if (before) paragraphs.push(before)
    paragraphs.push(match[1])
    lastIdx = paraRe.lastIndex
  }
  const tail = text.slice(lastIdx).replace(/<[^>]+>/g, '').trim()
  if (tail) paragraphs.push(tail)
  if (paragraphs.length === 0) paragraphs.push(text)

  const blocks: any[] = []
  for (const para of paragraphs) {
    if (!para.trim()) continue
    const children = parseInlineHtml(para)
    if (children.length === 0) continue
    blocks.push({
      _type: 'block',
      _key: randKey(),
      style: 'normal',
      markDefs: children.markDefs,
      children: children.spans,
    } as any)
  }
  return blocks
}

function parseInlineHtml(html: string): {spans: any[]; markDefs: any[]} {
  const spans: any[] = []
  const markDefs: any[] = []
  // tokenize: alternating text + tags. Supports <a>, <strong>, <em>.
  const re = /<(\/?)(a|strong|em|b|i)(?:\s+[^>]*)?>/gi
  let i = 0
  let m: RegExpExecArray | null
  const stack: Array<{tag: string; markKey?: string; href?: string}> = []
  // Pre-extract href values per opening <a>
  const openARe = /<a\s+([^>]*)>/gi
  const aHrefs: string[] = []
  let am: RegExpExecArray | null
  while ((am = openARe.exec(html)) !== null) {
    const attrs = am[1]
    const hrefMatch = attrs.match(/href\s*=\s*["']([^"']+)["']/i)
    aHrefs.push(hrefMatch ? hrefMatch[1] : '#')
  }
  let aIdx = 0

  const emit = (text: string) => {
    if (!text) return
    const marks: string[] = []
    for (const f of stack) {
      if (f.tag === 'strong' || f.tag === 'b') marks.push('strong')
      else if (f.tag === 'em' || f.tag === 'i') marks.push('em')
      else if (f.tag === 'a' && f.markKey) marks.push(f.markKey)
    }
    spans.push({_type: 'span', _key: randKey(), text, marks})
  }

  while ((m = re.exec(html)) !== null) {
    const before = html.slice(i, m.index)
    if (before) emit(decodeEntities(before))
    const isClose = m[1] === '/'
    const tag = m[2].toLowerCase()
    if (isClose) {
      const idx = [...stack].reverse().findIndex((f) => f.tag === tag)
      if (idx >= 0) stack.splice(stack.length - 1 - idx, 1)
    } else {
      const frame: {tag: string; markKey?: string; href?: string} = {tag}
      if (tag === 'a') {
        const href = aHrefs[aIdx++] ?? '#'
        const link = resolveKirbyHref(href)
        const markKey = `link-${randKey()}`
        markDefs.push({_type: 'link', _key: markKey, ...link})
        frame.markKey = markKey
      }
      stack.push(frame)
    }
    i = re.lastIndex
  }
  if (i < html.length) emit(decodeEntities(html.slice(i)))

  return {spans, markDefs}
}

function resolveKirbyHref(href: string): {
  type: 'internal' | 'external' | 'anchor'
  href?: string
  internal?: {_type: 'reference'; _ref: string; _weak?: boolean}
  anchor?: string
} {
  // Kirby uses /@/page/UUID for internal links, or page://UUID, or plain /path
  const uuidMatch =
    href.match(/^page:\/\/(.+)$/) ||
    href.match(/^\/@\/page\/(.+)$/) ||
    href.match(/^\/@\/file\/(.+)$/)
  if (uuidMatch) {
    const uuid = uuidMatch[1]
    const dest = PAGE_UUID_TO_DOC_ID[uuid]
    if (dest) {
      return {type: 'internal', internal: {_type: 'reference', _ref: dest.id, _weak: true}}
    }
  }
  if (href.startsWith('#')) {
    return {type: 'anchor', anchor: href.slice(1)}
  }
  if (href.startsWith('/')) {
    return {type: 'external', href} // relative URL — store as-is
  }
  return {type: 'external', href}
}

function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

// ───────────────────────────────────────── image upload + dedup
type ImageMap = Record<string, string> // kirby UUID → sanity asset _id

async function uploadImage(filePath: string): Promise<string> {
  const filename = basename(filePath)
  const stream = createReadStream(filePath)
  const asset = await client.assets.upload('image', stream, {
    filename,
    contentType: mimeFor(filename),
  })
  return asset._id
}

function mimeFor(filename: string): string {
  const ext = extname(filename).toLowerCase()
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg'
  if (ext === '.png') return 'image/png'
  if (ext === '.webp') return 'image/webp'
  if (ext === '.svg') return 'image/svg+xml'
  return 'application/octet-stream'
}

function buildUuidToFile(): Record<string, {file: string; sidecar: Record<string, string>}> {
  const map: Record<string, {file: string; sidecar: Record<string, string>}> = {}
  // Scan content/ root for *.txt sidecars
  for (const entry of readdirSync(CONTENT)) {
    const full = join(CONTENT, entry)
    if (!statSync(full).isFile()) continue
    if (!entry.endsWith('.txt')) continue
    // file is e.g. paulmeis.jpg.txt
    const imgFile = entry.replace(/\.txt$/, '')
    const imgPath = join(CONTENT, imgFile)
    if (!existsSync(imgPath)) continue
    const sidecar = parseKirbyTxt(readFileSync(full, 'utf8'))
    const uuid = sidecar['uuid']
    if (!uuid) continue
    map[uuid] = {file: imgPath, sidecar}
  }
  return map
}

// ───────────────────────────────────────── helpers
function randKey() {
  return Math.random().toString(36).slice(2, 12)
}

function imageRef(assetId: string): any {
  return {_type: 'image', _key: randKey(), asset: {_type: 'reference', _ref: assetId}}
}

function focusToHotspot(focus?: string): any | undefined {
  if (!focus) return undefined
  const m = focus.match(/([\d.]+)%?\s+([\d.]+)%?/)
  if (!m) return undefined
  return {x: parseFloat(m[1]) / 100, y: parseFloat(m[2]) / 100, height: 1, width: 1}
}

// ───────────────────────────────────────── transform Kirby block → Sanity block
function transformBlock(
  kBlock: any,
  imgMap: ImageMap,
  uuidFile: Record<string, {file: string; sidecar: Record<string, string>}>,
): any | null {
  const type = kBlock.type
  const content = kBlock.content ?? {}
  const sanityType = KIRBY_BLOCK_TO_SANITY[type]
  if (!sanityType) {
    console.warn(`  ⚠ Skipping unknown block type: ${type}`)
    return null
  }

  const resolveImage = (uuid: string) => {
    const assetId = imgMap[uuid]
    if (!assetId) return null
    const sidecar = uuidFile[uuid]?.sidecar
    const hotspot = focusToHotspot(sidecar?.['focus'])
    const alt = sidecar?.['alt'] ?? undefined
    const img: any = imageRef(assetId)
    if (hotspot) img.hotspot = hotspot
    if (alt) img.alt = alt
    return img
  }

  const resolveImages = (arr: any): any[] =>
    (Array.isArray(arr) ? arr : [])
      .map((v: string) => (typeof v === 'string' ? v.replace(/^file:\/\//, '') : null))
      .filter((u): u is string => !!u)
      .map(resolveImage)
      .filter((x): x is any => !!x)

  const portable = (html: string | undefined) => htmlToPortableText(html)
  const ctaArr = (raw: any[] | undefined): any[] =>
    (raw ?? []).map((c: any) => ({
      _key: randKey(),
      _type: 'cta',
      label: c.label,
      link: resolveKirbyHref(c.link ?? ''),
    }))

  const base = {_key: kBlock.id ?? randKey(), _type: sanityType}

  switch (sanityType) {
    case 'cover': {
      const img = resolveImages(content.image)[0]
      if (!img) return null
      return {...base, image: img, size: content.size ?? 'medium'}
    }
    case 'heading':
      return {...base, text: content.text ?? ''}
    case 'textBlock':
      return {...base, text: portable(content.text)}
    case 'imageBlock': {
      const img = resolveImages(content.image)[0]
      if (!img) return null
      return {
        ...base,
        image: img,
        alt: content.alt,
        caption: content.caption,
        ratio: content.ratio ?? 'auto',
        crop: !content.contain,
        lightbox: !content.link,
        link: content.link ? resolveKirbyHref(content.link) : undefined,
      }
    }
    case 'gallery':
      return {
        ...base,
        images: resolveImages(content.images),
        ratio: content.ratio ?? 'auto',
        crop: content.crop !== false,
        caption: content.caption,
      }
    case 'video':
      return {...base, url: content.url, caption: content.caption}
    case 'buttonBlock':
      return {...base, text: content.text, link: resolveKirbyHref(content.link ?? '')}
    case 'contactFormBlock':
      return {
        ...base,
        subtitle: content.subtitle,
        title: content.title,
        text: stripHtml(content.text),
        hashurl: content.hashurl,
      }
    case 'oneImageStory': {
      const img = resolveImages(content.image)[0]
      if (!img) return null
      return {
        ...base,
        subtitle: content.subtitle,
        title: content.title,
        text: portable(content.text),
        cta: ctaArr(content.cta),
        radio: content.radio ?? 'img-left',
        hashurl: content.hashurl,
        image: img,
      }
    }
    case 'twoImageStory':
    case 'threeImageStory':
    case 'multiImageStory': {
      return {
        ...base,
        subtitle: content.subtitle,
        title: content.title,
        text: portable(content.text),
        cta: ctaArr(content.cta),
        radio: content.radio ?? 'img-left',
        hashurl: content.hashurl,
        images: resolveImages(content.images),
      }
    }
  }
  return null
}

function stripHtml(html?: string): string {
  return (html ?? '').replace(/<[^>]+>/g, '').trim()
}

// ───────────────────────────────────────── doc builders
async function buildHomeDoc(
  imgMap: ImageMap,
  uuidFile: Record<string, {file: string; sidecar: Record<string, string>}>,
) {
  const txt = parseKirbyTxt(readFileSync(join(CONTENT, 'home/home.txt'), 'utf8'))
  const blocks = JSON.parse(txt['blocks'] ?? '[]')
    .map((b: any) => transformBlock(b, imgMap, uuidFile))
    .filter(Boolean)
  const bannerImgs = extractUuids(txt['banner-images']).map((uuid) => {
    const assetId = imgMap[uuid]
    if (!assetId) return null
    const sidecar = uuidFile[uuid]?.sidecar
    return {
      ...imageRef(assetId),
      ...(focusToHotspot(sidecar?.['focus']) ? {hotspot: focusToHotspot(sidecar?.['focus'])} : {}),
    }
  }).filter(Boolean)

  return {
    _id: 'home',
    _type: 'home',
    title: txt['title'] ?? 'Home',
    banner: {
      _type: 'object',
      images: bannerImgs,
      title: txt['banner-title'] ?? '',
      button1: {
        _type: 'cta',
        label: txt['banner-button-1'],
        link: resolveKirbyHref(txt['banner-button-1-link'] ?? ''),
      },
      button2: {
        _type: 'cta',
        label: txt['banner-button-2'],
        link: resolveKirbyHref(txt['banner-button-2-link'] ?? ''),
      },
    },
    blocks,
    seo: buildSeo(txt, imgMap),
  }
}

function buildSeo(txt: Record<string, string>, imgMap: ImageMap) {
  const ogUuids = extractUuids(txt['og-image'])
  const ogAsset = ogUuids[0] ? imgMap[ogUuids[0]] : undefined
  return {
    _type: 'seo',
    title: txt['seo-title'] || undefined,
    description: txt['meta-description'] || undefined,
    canonical: txt['canonical-url'] || undefined,
    ogTitle: txt['og-title'] || undefined,
    ogDescription: txt['og-description'] || undefined,
    ogImage: ogAsset ? imageRef(ogAsset) : undefined,
    noindex: txt['noindex'] === 'true',
  }
}

async function buildPageDoc(
  txtPath: string,
  meta: {id: string; slug: string},
  imgMap: ImageMap,
  uuidFile: Record<string, {file: string; sidecar: Record<string, string>}>,
) {
  const txt = parseKirbyTxt(readFileSync(txtPath, 'utf8'))
  const blocks = JSON.parse(txt['blocks'] ?? '[]')
    .map((b: any) => transformBlock(b, imgMap, uuidFile))
    .filter(Boolean)
  return {
    _id: meta.id,
    _type: 'page',
    title: txt['title'] ?? meta.slug,
    slug: {_type: 'slug', current: meta.slug},
    blocks,
    seo: buildSeo(txt, imgMap),
  }
}

async function buildContactDoc(
  imgMap: ImageMap,
  uuidFile: Record<string, {file: string; sidecar: Record<string, string>}>,
) {
  const txt = parseKirbyTxt(readFileSync(join(CONTENT, 'contact/contact.txt'), 'utf8'))
  const blocks = JSON.parse(txt['blocks'] ?? '[]')
    .map((b: any) => transformBlock(b, imgMap, uuidFile))
    .filter(Boolean)
  return {
    _id: 'contactPage',
    _type: 'contactPage',
    title: txt['title'] ?? 'Contact',
    blocks,
    seo: buildSeo(txt, imgMap),
  }
}

async function buildSiteSettings(
  imgMap: ImageMap,
  uuidFile: Record<string, {file: string; sidecar: Record<string, string>}>,
) {
  const txt = parseKirbyTxt(readFileSync(join(CONTENT, 'site.txt'), 'utf8'))
  const tags = (txt['projecttags'] ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const ogUuids = extractUuids(txt['og-image'])
  const ogAsset = ogUuids[0] ? imgMap[ogUuids[0]] : undefined
  const contactLink = {type: 'internal', internal: {_type: 'reference', _ref: 'contactPage', _weak: true}}
  const aanbodLink = {type: 'internal', internal: {_type: 'reference', _ref: 'pageAanbod', _weak: true}}
  const overLink = {type: 'internal', internal: {_type: 'reference', _ref: 'pageOver', _weak: true}}

  return {
    _id: 'siteSettings',
    _type: 'siteSettings',
    siteTitle: 'Meistechniek',
    organizationName: txt['organization-name'] ?? 'MEIS Techniek',
    primaryCta: {_type: 'cta', label: 'Offerte aanvragen', link: contactLink},
    menu: [
      {_key: randKey(), _type: 'menuItem', label: 'Home', link: {type: 'external', href: '/'}},
      {_key: randKey(), _type: 'menuItem', label: 'Over MEIS', link: overLink},
      {_key: randKey(), _type: 'menuItem', label: 'Aanbod', link: aanbodLink},
    ],
    footerColumns: [
      {
        _key: randKey(),
        _type: 'footerColumn',
        heading: 'LET’S CONNECT',
        links: [
          {_key: randKey(), _type: 'footerLink', label: 'Over Meis', link: overLink},
          {_key: randKey(), _type: 'footerLink', label: 'Contact', link: contactLink},
          {_key: randKey(), _type: 'footerLink', label: 'Offerte aanvragen', link: contactLink},
        ],
      },
    ],
    defaultMetaDescription: txt['meta-description'] ?? undefined,
    defaultOgImage: ogAsset ? imageRef(ogAsset) : undefined,
    projectTags: tags,
    carouselSubtitle: 'Impressie',
    carouselTitle: 'Intussen schakelt MEIS gewoon door',
    carouselCta: {_type: 'cta', label: 'Bekijk het aanbod', link: aanbodLink},
    formspreeEndpoint: 'https://formspree.io/f/xkgzaazv',
  }
}

async function buildProjectImages(
  imgMap: ImageMap,
  uuidFile: Record<string, {file: string; sidecar: Record<string, string>}>,
): Promise<any[]> {
  const txt = parseKirbyTxt(readFileSync(join(CONTENT, 'site.txt'), 'utf8'))
  const uuids = extractUuids(txt['gallery'])
  return uuids.map((uuid, i) => {
    const assetId = imgMap[uuid]
    if (!assetId) return null
    const sidecar = uuidFile[uuid]?.sidecar
    return {
      _id: `projectImage-${uuid}`,
      _type: 'projectImage',
      image: imageRef(assetId),
      alt: sidecar?.['alt'] ?? undefined,
      tags: (sidecar?.['projecttags'] ?? '').split(',').map((s) => s.trim()).filter(Boolean),
      order: i,
    }
  }).filter(Boolean)
}

// ───────────────────────────────────────── main
async function main() {
  console.log('▸ Building UUID → file map…')
  const uuidFile = buildUuidToFile()
  console.log(`  ${Object.keys(uuidFile).length} images discovered`)

  console.log('▸ Uploading images to Sanity…')
  const imgMap: ImageMap = {}
  for (const [uuid, {file}] of Object.entries(uuidFile)) {
    process.stdout.write(`  ${basename(file)}… `)
    const id = await uploadImage(file)
    imgMap[uuid] = id
    console.log(`✓ ${id}`)
  }

  console.log('▸ Building documents…')
  const docs: any[] = []
  docs.push(await buildSiteSettings(imgMap, uuidFile))
  docs.push(await buildHomeDoc(imgMap, uuidFile))
  docs.push(
    await buildPageDoc(
      join(CONTENT, '1_over/over.txt'),
      {id: 'pageOver', slug: 'over'},
      imgMap,
      uuidFile,
    ),
  )
  docs.push(
    await buildPageDoc(
      join(CONTENT, '2_aanbod/aanbod.txt'),
      {id: 'pageAanbod', slug: 'aanbod'},
      imgMap,
      uuidFile,
    ),
  )
  docs.push(await buildContactDoc(imgMap, uuidFile))
  for (const pi of await buildProjectImages(imgMap, uuidFile)) docs.push(pi)

  console.log(`▸ Upserting ${docs.length} documents via transaction…`)
  const tx = client.transaction()
  for (const doc of docs) tx.createOrReplace(doc as any)
  const result = await tx.commit()
  console.log(`✓ Done. ${result.results.length} documents written.`)
  console.log('')
  console.log('Open the Studio: http://127.0.0.1:3333')
}

main().catch((err) => {
  console.error('Import failed:', err)
  process.exit(1)
})
