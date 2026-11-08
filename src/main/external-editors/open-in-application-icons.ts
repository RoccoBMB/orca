import { app, nativeImage } from 'electron'
import { access, readFile } from 'node:fs/promises'
import { basename, join } from 'node:path'
import { homedir } from 'node:os'
import { runProcess } from '@orca/process-host'
import { resolveCliCommandAsync } from '../../shared/node-cli-command-async-resolution'
import { BUILT_IN_EDITOR_COMMANDS } from '../../shared/open-in-applications'

type MacEditor = { id: string; app: string }
let cache: Promise<Record<string, string>> | undefined

export function listOpenInApplicationIcons(
  editors: readonly MacEditor[]
): Promise<Record<string, string>> {
  return (cache ??= loadIcons(editors))
}

async function macBundleIcon(bundle: string) {
  const result = await runProcess({
    program: '/usr/bin/plutil',
    args: [
      '-extract',
      'CFBundleIconFile',
      'raw',
      '-o',
      '-',
      join(bundle, 'Contents', 'Info.plist')
    ],
    stdio: 'pipe',
    timeoutMs: 2000
  })
  if (result.code === 0) {
    const name = basename(String(result.stdout).trim())
    const path = join(
      bundle,
      'Contents',
      'Resources',
      name.endsWith('.icns') ? name : `${name}.icns`
    )
    const bytes = await readFile(path)
    let image = nativeImage.createEmpty()
    if (bytes.toString('ascii', 0, 4) === 'icns') {
      for (let offset = 8; offset + 8 <= bytes.length;) {
        const length = bytes.readUInt32BE(offset + 4)
        if (length < 8 || offset + length > bytes.length) {
          break
        }
        const payload = bytes.subarray(offset + 8, offset + length)
        if (payload.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
          image = nativeImage.createFromBuffer(payload)
          if (!image.isEmpty()) {
            break
          }
        }
        offset += length
      }
    }
    if (!image.isEmpty()) {
      return image.resize({ width: 32, height: 32 })
    }
  }
  return app.getFileIcon(bundle, { size: 'small' })
}

async function loadIcons(editors: readonly MacEditor[]): Promise<Record<string, string>> {
  const paths = new Map<string, string>()
  if (process.platform === 'darwin') {
    paths.set('file-manager', '/System/Library/CoreServices/Finder.app')
    paths.set('terminal', '/System/Applications/Utilities/Terminal.app')
    for (const editor of editors) {
      for (const base of ['/Applications', join(homedir(), 'Applications')]) {
        const path = join(base, editor.app)
        try {
          await access(path)
          paths.set(editor.id, path)
          break
        } catch {
          continue
        }
      }
    }
  } else {
    const commands = {
      ...BUILT_IN_EDITOR_COMMANDS,
      'file-manager': process.platform === 'win32' ? 'explorer.exe' : 'nautilus',
      terminal: process.platform === 'win32' ? 'wt.exe' : 'gnome-terminal'
    }
    for (const [id, command] of Object.entries(commands)) {
      const path = await resolveCliCommandAsync(command)
      if (path !== command) {
        paths.set(id, path)
      }
    }
  }
  const icons: Record<string, string> = {}
  await Promise.all(
    [...paths].map(async ([id, path]) => {
      try {
        const icon =
          process.platform === 'darwin'
            ? await macBundleIcon(path)
            : await app.getFileIcon(path, { size: 'small' })
        if (!icon.isEmpty()) {
          icons[id] = icon.toDataURL()
        }
      } catch {
        // Missing app icons keep their renderer fallback.
      }
    })
  )
  return icons
}
