import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { runProcess } from '@orca/process-host'
import { expect, it, vi } from 'vitest'
import { ORCAD_CLI_ENTRY_FILENAME } from '../../shared/orcad-artifacts'
import { getOrcadCliLauncherPath, prepareOrcadCliLauncher } from './orcad-cli-launcher'

const roots = vi.hoisted(() => ({ install: '', profile: '' }))
vi.mock('./orcad-app-paths', () => ({
  resolveOrcadInstallRoot: () => roots.install,
  resolveUserDataPath: () => roots.profile
}))

it.skipIf(process.platform === 'win32')(
  'both default Linux CLI names reach the owning profile',
  async () => {
    const root = await mkdtemp(join(tmpdir(), 'orca-default-launcher-'))
    const platform = Object.getOwnPropertyDescriptor(process, 'platform')!
    try {
      roots.install = join(root, 'slot')
      roots.profile = join(root, 'profile')
      const entry = join(roots.install, ...ORCAD_CLI_ENTRY_FILENAME.split('/'))
      await mkdir(dirname(entry), { recursive: true })
      await writeFile(
        entry,
        'console.log(JSON.stringify({ profile: process.env.ORCA_USER_DATA_PATH, args: process.argv.slice(2) }))'
      )
      Object.defineProperty(process, 'platform', { value: 'linux' })
      await prepareOrcadCliLauncher()
      expect(getOrcadCliLauncherPath()).toBe(join(roots.profile, 'cli', 'bin', 'orca'))
      for (const command of ['orca', 'orca-ide']) {
        const result = await runProcess({
          program: join(roots.profile, 'cli', 'bin', command),
          args: ['status'],
          env: { ...process.env, ORCA_USER_DATA_PATH: '/other/profile' }
        })
        expect(result.code, result.stderr).toBe(0)
        expect(JSON.parse(result.stdout)).toEqual({ profile: roots.profile, args: ['status'] })
      }
    } finally {
      Object.defineProperty(process, 'platform', platform)
      await rm(root, { recursive: true, force: true })
    }
  }
)
