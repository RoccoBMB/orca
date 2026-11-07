import { cp, mkdir, rename, rm, access } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { homedir, arch } from 'node:os'
import { join, resolve } from 'node:path'
import { createRequire } from 'node:module'

const branding = createRequire(import.meta.url)('../src/shared/branding.json')
if (process.platform !== 'darwin') {
  throw new Error('Use the platform installer produced by build:win or build:linux on this OS.')
}
const source = resolve(
  'dist',
  arch() === 'arm64' ? 'mac-arm64' : 'mac',
  `${branding.productName}.app`
)
const id = execFileSync(
  '/usr/libexec/PlistBuddy',
  ['-c', 'Print :CFBundleIdentifier', join(source, 'Contents/Info.plist')],
  { encoding: 'utf8' }
).trim()
if (id !== branding.appId) {
  throw new Error('Refusing to install a bundle with another app identity.')
}
const directory = join(homedir(), 'Applications')
const target = join(directory, `${branding.productName}.app`)
const staging = join(directory, `.Maestro-install-${process.pid}.app`)
const previous = join(directory, `.Maestro-previous-${process.pid}.app`)
await mkdir(directory, { recursive: true })
await cp(source, staging, {
  recursive: true,
  errorOnExist: true,
  force: false,
  verbatimSymlinks: true
})
let hadPrevious = false
try {
  await access(target)
  hadPrevious = true
} catch {}
if (hadPrevious) {
  await rename(target, previous)
}
try {
  await rename(staging, target)
} catch (error) {
  if (hadPrevious) {
    await rename(previous, target)
  }
  throw error
} finally {
  await rm(staging, { recursive: true, force: true })
}
if (hadPrevious) {
  await rm(previous, { recursive: true, force: true })
}
console.log(`Installed ${target}. Launch it manually when ready.`)
