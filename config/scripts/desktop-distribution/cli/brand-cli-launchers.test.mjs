import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createRequire } from 'node:module'
import { test } from 'vitest'
import assert from 'node:assert/strict'

const maestro = createRequire(import.meta.url)('../../../../src/shared/branding.json')
const { brandCliLaunchers } = createRequire(import.meta.url)('./brand-cli-launchers.cjs')

test('Windows PATH directory exposes only Maestro CLI launchers and its shim invokes Maestro', () => {
  const bin = mkdtempSync(join(tmpdir(), 'maestro-cli-package-'))
  try {
    writeFileSync(join(bin, 'orca.exe'), 'native launcher')
    writeFileSync(join(bin, 'orca.cmd'), readFileSync('resources/win32/bin/orca.cmd'))
    brandCliLaunchers(bin, 'win32', maestro)
    assert.deepEqual(readdirSync(bin).sort(), ['maestro.cmd', 'maestro.exe'])
    const shim = readFileSync(join(bin, 'maestro.cmd'), 'utf8')
    assert.ok(shim.includes('%SCRIPT_DIR%maestro.exe'))
    assert.ok(!shim.includes('orca.exe'))
    assert.equal(readFileSync(join(bin, 'maestro.exe'), 'utf8'), 'native launcher')
  } finally {
    rmSync(bin, { recursive: true, force: true })
  }
})

for (const [platform, original] of [
  ['darwin', 'orca'],
  ['linux', 'orca-ide']
]) {
  test(`${platform} PATH directory contains only the branded launcher`, () => {
    const bin = mkdtempSync(join(tmpdir(), 'maestro-posix-package-'))
    try {
      writeFileSync(join(bin, original), '#!/bin/sh\nexit 0\n', { mode: 0o755 })
      brandCliLaunchers(bin, platform, maestro)
      assert.deepEqual(readdirSync(bin), ['maestro'])
      assert.ok(
        readFileSync(join(bin, 'maestro'), 'utf8').startsWith(
          '#!/bin/sh\n# dev.rocco.maestro CLI launcher\n'
        )
      )
    } finally {
      rmSync(bin, { recursive: true, force: true })
    }
  })
}
