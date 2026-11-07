const { readFileSync, renameSync, writeFileSync } = require('node:fs')
const { join } = require('node:path')
const branding = require('../../../../src/shared/branding.json')

function brandCliLaunchers(cliDirectory, platform) {
  if (platform === 'win32') {
    const command = branding.cliCommand
    if (command === 'orca') {
      return
    }
    const shim = readFileSync(join(cliDirectory, 'orca.cmd'), 'utf8')
      .replaceAll('orca.exe', `${command}.exe`)
      .replaceAll('orca.cmd', `${command}.cmd`)
    writeFileSync(join(cliDirectory, `${command}.cmd`), shim)
    renameSync(join(cliDirectory, 'orca.exe'), join(cliDirectory, `${command}.exe`))
    require('node:fs').unlinkSync(join(cliDirectory, 'orca.cmd'))
    return
  }
  const original = platform === 'linux' ? 'orca-ide' : 'orca'
  const target = join(cliDirectory, branding.cliCommand)
  if (original !== branding.cliCommand) {
    renameSync(join(cliDirectory, original), target)
  }
  const script = readFileSync(target, 'utf8')
  const marker = `# ${branding.appId} CLI launcher`
  writeFileSync(target, script.replace(/^(#![^\n]*\n)/, `$1${marker}\n`))
}

module.exports = { brandCliLaunchers }
