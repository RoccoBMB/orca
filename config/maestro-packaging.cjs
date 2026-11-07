const { mkdirSync, readFileSync, writeFileSync } = require('node:fs')
const { join, resolve } = require('node:path')

function maestroPackaging(branding) {
  const output = resolve(__dirname, '../.cache/maestro-packaging')
  mkdirSync(output, { recursive: true })
  for (const name of ['after-install.sh', 'after-remove.sh']) {
    const source = readFileSync(resolve(__dirname, '../resources/linux/packaging', name), 'utf8')
    writeFileSync(
      join(output, name),
      source
        .replaceAll('orca-ide', branding.cliCommand)
        .replaceAll('Orca', branding.productName)
        .replaceAll('/opt/orca', `/opt/${branding.cliCommand}`),
      { mode: 0o755 }
    )
  }
  const executableNamePath = join(output, 'app-executable-name')
  writeFileSync(
    executableNamePath,
    process.platform === 'linux' ? branding.cliCommand : branding.productName
  )
  return { directory: output, executableNamePath }
}

module.exports = { maestroPackaging }
