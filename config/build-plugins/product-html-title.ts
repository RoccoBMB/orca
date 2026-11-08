import type { Plugin } from 'vite'
import { createRequire } from 'node:module'

const { branding } = createRequire(import.meta.url)('../branding.cjs')

export function productHtmlTitle(): Plugin {
  return {
    name: 'product-html-title',
    transformIndexHtml: (html) =>
      html.replace(/<title>Orca([^<]*)<\/title>/g, `<title>${branding.productName}$1</title>`)
  }
}
