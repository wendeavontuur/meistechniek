// @ts-check
import {defineConfig} from 'astro/config'

const SITE = process.env.PUBLIC_SITE_URL ?? 'https://meistechniek.nl'

// Sitemap integration is added once content exists in Sanity (see README).
export default defineConfig({
  site: SITE,
  output: 'static',
  trailingSlash: 'never',
  build: {
    inlineStylesheets: 'auto',
  },
})
