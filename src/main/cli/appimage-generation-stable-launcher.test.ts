import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, it } from 'vitest'
import { ensureAppImageStableLauncher } from './appimage-stable-launcher'
import { resolveGenerationStableLauncherPath } from './appimage-generation-stable-launcher'

it('finds the persistent Orca launcher from an extracted Linux generation', async () => {
  const cache = await mkdtemp(join(tmpdir(), 'orca-generation-launcher-'))
  try {
    ensureAppImageStableLauncher(cache)
    const resources = join(cache, 'a'.repeat(24), 'b'.repeat(24), 'resources')
    expect(resolveGenerationStableLauncherPath(resources)).toBe(join(cache, 'launcher', 'orca-ide'))
  } finally {
    await rm(cache, { recursive: true, force: true })
  }
})
