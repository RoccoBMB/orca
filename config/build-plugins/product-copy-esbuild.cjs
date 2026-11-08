const { readFileSync } = require('node:fs')
const { resolve, relative, isAbsolute, extname, dirname } = require('node:path')
const { productCopyBuild } = require('../product-copy-build.cjs')

const sourceRoot = resolve(__dirname, '../../src')

function productCopyEsbuild({ sourceRoots = [sourceRoot] } = {}) {
  return {
    name: 'product-copy-literals',
    setup(build) {
      build.onLoad({ filter: /\.[cm]?[jt]sx?$/ }, ({ path }) => {
        if (
          !sourceRoots.some((root) => {
            const sourcePath = relative(root, path)
            return !sourcePath.startsWith('..') && !isAbsolute(sourcePath)
          })
        )
          return null
        const result = productCopyBuild(readFileSync(path, 'utf8'), path)
        if (!result) return null
        const extension = extname(path)
        return {
          contents: `${result.code}\n//# sourceMappingURL=${result.map.toUrl()}`,
          resolveDir: dirname(path),
          loader:
            extension === '.tsx'
              ? 'tsx'
              : extension === '.ts'
                ? 'ts'
                : extension === '.jsx'
                  ? 'jsx'
                  : 'js'
        }
      })
    }
  }
}

module.exports = { productCopyEsbuild }
