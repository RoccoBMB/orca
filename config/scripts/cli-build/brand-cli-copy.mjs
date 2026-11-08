import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { branding } = require('../../branding.cjs')
const { productCopyBuild } = require('../../product-copy-build.cjs')

export function brandCliCopy(root) {
  if (branding.productName === 'Orca') {
    return
  }
  const changes = []
  function visit(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const filename = join(directory, entry.name)
      if (entry.isDirectory()) {
        visit(filename)
      } else if (entry.name.endsWith('.js')) {
        const result = productCopyBuild(readFileSync(filename, 'utf8'), filename)
        if (result) {
          writeFileSync(filename, result.code)
          changes.push(...result.changes)
        }
      }
    }
  }
  visit(join(root, 'cli'))
  visit(join(root, 'shared'))
  writeFileSync(join(root, 'cli/product-copy-manifest.json'), JSON.stringify(changes, null, 2))
}
