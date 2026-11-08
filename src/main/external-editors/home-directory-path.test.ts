import { mkdtemp, mkdir, rm, symlink } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, it } from 'vitest'
import { isHomeDirectoryPath } from './home-directory-path'

it('recognizes a home-directory alias without treating a sibling folder as home', async () => {
  const root = await mkdtemp(join(tmpdir(), 'maestro-home-path-'))
  try {
    const home = join(root, 'home')
    const alias = join(root, 'alias')
    const sibling = join(root, 'project')
    await mkdir(home)
    await mkdir(sibling)
    await symlink(home, alias, process.platform === 'win32' ? 'junction' : 'dir')
    expect(await isHomeDirectoryPath(alias, home)).toBe(true)
    expect(await isHomeDirectoryPath(sibling, home)).toBe(false)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
