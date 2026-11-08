import { createRequire } from 'node:module'
import type { Plugin } from 'vite'
import { fileURLToPath } from 'node:url'
import { isAbsolute, relative } from 'node:path'

const { productCopyBuild } = createRequire(import.meta.url)('../product-copy-build.cjs')
const sourceRoot = fileURLToPath(new URL('../../src/', import.meta.url))

export function productCopyLiterals(): Plugin {
  const changes: unknown[] = []
  return {
    name: 'product-copy-literals',
    enforce: 'pre',
    transform(source, id) {
      const filename = id.split('?')[0]
      const sourcePath = relative(sourceRoot, filename)
      if (
        !/\.[cm]?[jt]sx?$/.test(filename) ||
        sourcePath.startsWith('..') ||
        isAbsolute(sourcePath)
      ) {
        return null
      }
      const result = productCopyBuild(source, filename)
      if (result) {
        changes.push(...result.changes)
        return { code: result.code, map: result.map }
      }
      return null
    },
    generateBundle() {
      if (changes.length) {
        this.emitFile({
          type: 'asset',
          fileName: 'product-copy-manifest.json',
          source: JSON.stringify(changes, null, 2)
        })
      }
    }
  }
}
