import { describe, expect, it, vi } from 'vitest'

vi.mock('../../shared/branding', async () => ({
  branding: (await import('../../shared/branding.json')).default
}))

const actions = vi.hoisted(() => ({
  setupAutoUpdater: vi.fn(),
  checkForUpdates: vi.fn(),
  checkForUpdatesFromMenu: vi.fn(),
  downloadUpdate: vi.fn(),
  quitAndInstall: vi.fn(),
  listAvailableReleaseBuilds: vi.fn()
}))
vi.mock('./lifecycle/updater-setup', () => ({
  UpdaterSetup: class {
    constructor() {
      Object.assign(this, actions)
    }
  }
}))

import {
  checkForUpdates,
  checkForUpdatesFromMenu,
  downloadUpdate,
  listAvailableReleaseBuilds,
  quitAndInstall,
  setupAutoUpdater
} from './updater-service'

describe('Maestro desktop update policy', () => {
  it('leaves automatic and manual update entry points disabled', async () => {
    setupAutoUpdater(null)
    checkForUpdates()
    checkForUpdatesFromMenu()
    downloadUpdate()
    quitAndInstall()
    expect(await listAvailableReleaseBuilds('stable')).toEqual([])
    for (const action of Object.values(actions)) {
      expect(action).not.toHaveBeenCalled()
    }
  })
})
