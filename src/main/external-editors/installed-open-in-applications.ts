import { access } from 'node:fs/promises'
import { join } from 'node:path'
import { homedir } from 'node:os'
import { resolveCliCommandAsync } from '../../shared/node-cli-command-async-resolution'
import type { OpenInApplication } from '../../shared/ui-chrome-types'
import { BUILT_IN_EDITOR_COMMANDS } from '../../shared/open-in-applications'

const MAC_EDITORS = [
  { id: 'vscode', label: 'VS Code', app: 'Visual Studio Code.app', cli: 'Resources/app/bin/code' },
  { id: 'cursor', label: 'Cursor', app: 'Cursor.app', cli: 'Resources/app/bin/cursor' },
  { id: 'zed', label: 'Zed', app: 'Zed.app', cli: 'MacOS/cli' }
] as const

async function exists(path: string): Promise<boolean> {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

export async function listInstalledOpenInApplications(): Promise<OpenInApplication[]> {
  const applications: OpenInApplication[] = []
  for (const [id, command] of Object.entries(BUILT_IN_EDITOR_COMMANDS)) {
    const resolved = await resolveCliCommandAsync(command)
    if (resolved !== command && (await exists(resolved))) {
      applications.push({
        id,
        command,
        label: MAC_EDITORS.find((entry) => entry.id === id)?.label ?? id
      })
    }
  }
  if (process.platform === 'darwin') {
    for (const editor of MAC_EDITORS) {
      if (applications.some((entry) => entry.id === editor.id)) {
        continue
      }
      for (const base of ['/Applications', join(homedir(), 'Applications')]) {
        const cli = join(base, editor.app, 'Contents', editor.cli)
        if (await exists(cli)) {
          applications.push({ id: editor.id, label: editor.label, command: `"${cli}"` })
          break
        }
      }
    }
    applications.push({ id: 'terminal', label: 'Terminal', command: '/usr/bin/open -a Terminal' })
  } else {
    const command = process.platform === 'win32' ? 'wt' : 'gnome-terminal'
    const resolved = await resolveCliCommandAsync(command)
    if (resolved !== command && (await exists(resolved))) {
      applications.push({
        id: 'terminal',
        label: 'Terminal',
        command: process.platform === 'win32' ? 'wt -d' : 'gnome-terminal --working-directory'
      })
    }
  }
  return applications
}
