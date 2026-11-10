import { it as test } from 'vitest'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import vm from 'node:vm'
import { build } from 'esbuild'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)

function load(brand) {
  const before = process.env.ORCA_BRAND
  process.env.ORCA_BRAND = brand
  for (const file of ['../../../branding.cjs', '../../../product-copy-build.cjs']) {
    delete require.cache[require.resolve(file)]
  }
  const { productCopyBuild } = require('../../../product-copy-build.cjs')
  if (before === undefined) {
    delete process.env.ORCA_BRAND
  } else {
    process.env.ORCA_BRAND = before
  }
  for (const file of ['../../../branding.cjs', '../../../product-copy-build.cjs']) {
    delete require.cache[require.resolve(file)]
  }
  return productCopyBuild
}

test('Maestro compiles owned copy before user values and preserves machine identities', () => {
  const transform = load('maestro')
  const source = [
    "const path = '/tmp/My Orca Project/file.ts';",
    "const url = 'https://example.invalid/?project=Orca';",
    "const identity = { name: 'Orca', protocol: 'orca', path, url };",
    'const error = new Error(`Orca could not open ${path}: ${url}`);',
    "const transport = new RuntimeClientError('orca_internal', `Restart Orca for ${path}`);",
    "const copy = { title: 'Orca Mobile', description: 'Update Orca to continue' };",
    '({ identity, error: error.message, transport: transport.message, copy })'
  ].join('\n')
  const result = transform(source, '/repo/src/messages.ts')
  assert.ok(result.map)
  assert.equal(result.changes.length, 4)
  const actual = vm.runInNewContext(result.code, {
    RuntimeClientError: class extends Error {
      constructor(_code, message) {
        super(message)
      }
    }
  })
  assert.equal(
    actual.error,
    'Maestro could not open /tmp/My Orca Project/file.ts: https://example.invalid/?project=Orca'
  )
  assert.equal(actual.transport, 'Restart Maestro for /tmp/My Orca Project/file.ts')
  assert.equal(actual.identity.name, 'Orca')
  assert.equal(actual.identity.protocol, 'orca')
  assert.equal(actual.copy.title, 'Maestro Mobile')
  assert.equal(actual.copy.description, 'Update Maestro to continue')
})

test('Orca compilation is unchanged', () => {
  assert.equal(load('orca')("throw new Error('Restart Orca')", '/repo/src/messages.ts'), null)
})

test('static JSX accessibility copy and declared error subclasses use the selected product', () => {
  const result = load('maestro')(
    "class Unavailable extends Error { constructor() { super('Restart Orca') } }\nconst view = <img alt={'Orca logo'} title=\"Orca\" />;",
    '/repo/src/notice.tsx'
  )
  assert.ok(result.code.includes("super('Restart Maestro')"))
  assert.ok(result.code.includes("alt={'Maestro logo'}"))
  assert.ok(result.code.includes('title="Maestro"'))
})

test('emitted CLI errors retain dynamic paths and recognize imported error constructors', () => {
  const transform = load('maestro')
  const source = [
    "const runtime_client_1 = require('../runtime-client');",
    "const external = require('./external');",
    'new runtime_client_1.RuntimeClientError("runtime_unavailable", `Restart Orca for ${path}`);',
    'new external.RuntimeClientError("external", "Orca external data");'
  ].join('\n')
  const result = transform(source, '/repo/out/cli/runtime/metadata.js')
  assert.ok(result.code.includes('`Restart Maestro for ${path}`'))
  assert.ok(result.code.includes('"Orca external data"'))
})

test('emitted CLI errors resolve runtime/types from each caller directory', () => {
  const transform = load('maestro')
  for (const [file, module] of [
    ['/repo/out/cli/caller.js', './runtime/types'],
    ['/repo/out/cli/plugin-authoring/cli-output.js', '../runtime/types']
  ]) {
    const result = transform(
      `const types_1 = require('${module}');\nnew types_1.RuntimeClientError('invalid_environment', 'Run this on the Orca host.');`,
      file
    )
    assert.ok(result.code.includes('Run this on the Maestro host.'))
  }
})

test('remote bundles brand real metadata failures before inserting a user path', async () => {
  const modules = [
    '../../../branding.cjs',
    '../../../product-copy-build.cjs',
    '../../../build-plugins/product-copy-esbuild.cjs'
  ]
  const previous = process.env.ORCA_BRAND
  let plugin
  let defines
  try {
    process.env.ORCA_BRAND = 'maestro'
    for (const file of modules) {
      delete require.cache[require.resolve(file)]
    }
    plugin = require('../../../build-plugins/product-copy-esbuild.cjs').productCopyEsbuild()
    defines = require('../../../branding.cjs').brandingDefines
  } finally {
    if (previous === undefined) {
      delete process.env.ORCA_BRAND
    } else {
      process.env.ORCA_BRAND = previous
    }
    for (const file of modules) {
      delete require.cache[require.resolve(file)]
    }
  }
  const result = await build({
    entryPoints: [
      fileURLToPath(new URL('../../../../src/cli/runtime/metadata.ts', import.meta.url))
    ],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    write: false,
    plugins: [plugin],
    define: defines
  })
  const module = { exports: {} }
  vm.runInNewContext(result.outputFiles[0].text, {
    module,
    exports: module.exports,
    require,
    process
  })
  const userPath = process.platform === 'win32' ? 'C:\\My Orca Project' : '/tmp/My Orca Project'
  assert.throws(
    () => module.exports.readMetadata(userPath),
    (error) =>
      error.message.startsWith('Could not read Maestro runtime metadata at ') &&
      error.message.includes(userPath)
  )
})
