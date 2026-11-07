import { describe, expect, it, vi } from 'vitest'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import type * as Os from 'node:os'
import { join } from 'node:path'
import '../../../agent-hooks/installer-utils'
import { wrapPosixHookCommand } from '../../../agent-hooks/posix-hook-command'
import { setupCodexHookHomes } from '../installation/hook-service-test-harness'

const { getPathMock, homedirMock } = vi.hoisted(() => ({
  getPathMock: vi.fn<(name: string) => string>(),
  homedirMock: vi.fn<() => string>()
}))

vi.mock('electron', () => ({
  app: {
    getPath: getPathMock
  }
}))

vi.mock('os', async (importOriginal) => {
  const actual = await importOriginal<typeof Os>()
  return {
    ...actual,
    homedir: homedirMock
  }
})

import '../installation/hook-service'
import { CodexHookService } from '../installation/codex-hook-service-implementation'

const homes = setupCodexHookHomes(homedirMock, getPathMock)
const OFFICIAL_COMMAND = '/bin/sh "/home/official/.orca/agent-hooks/codex-hook.sh"'

function orcaEntryCommand(): string {
  const scriptPath = join(
    homes.tmpHome,
    '.maestro',
    'agent-hooks',
    process.platform === 'win32' ? 'maestro-codex-hook.cmd' : 'maestro-codex-hook.sh'
  )
  return process.platform === 'win32' ? scriptPath : wrapPosixHookCommand(scriptPath)
}

function seedRealHomeHooks(): string {
  const systemCodexHome = join(homes.tmpHome, '.codex')
  const systemHooksPath = join(systemCodexHome, 'hooks.json')
  mkdirSync(systemCodexHome, { recursive: true })
  writeFileSync(
    systemHooksPath,
    `${JSON.stringify({
      hooks: {
        Stop: [
          { hooks: [{ type: 'command', command: 'user-hook' }] },
          { hooks: [{ type: 'command', command: orcaEntryCommand() }] },
          { hooks: [{ type: 'command', command: OFFICIAL_COMMAND }] }
        ]
      }
    })}\n`,
    'utf-8'
  )
  return systemHooksPath
}

function realHomeStopHooks(systemHooksPath: string): unknown {
  return JSON.parse(readFileSync(systemHooksPath, 'utf-8')).hooks.Stop
}

describe('Codex turned off per agent', () => {
  it('removes Maestro hooks while preserving official Orca and user hooks', async () => {
    const systemHooksPath = seedRealHomeHooks()

    await new CodexHookService().remove()

    expect(realHomeStopHooks(systemHooksPath)).toEqual([
      { hooks: [{ type: 'command', command: 'user-hook' }] },
      { hooks: [{ type: 'command', command: OFFICIAL_COMMAND }] }
    ])
  })
})

vi.mock('../../../../shared/branding', async () => ({
  branding: (await import('../../../../shared/branding.json')).default
}))
