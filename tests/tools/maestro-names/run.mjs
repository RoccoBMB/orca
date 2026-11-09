import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve, dirname } from 'node:path'
import { spawnSync } from 'node:child_process'
import { _electron as electron } from '@playwright/test'

const root = resolve(import.meta.dirname, '../../..')
const executable =
  process.env.MAESTRO_TEST_EXECUTABLE ??
  join(
    root,
    'dist',
    process.platform === 'darwin'
      ? `mac${process.arch === 'arm64' ? '-arm64' : ''}/Maestro.app/Contents/MacOS/Maestro`
      : process.platform === 'win32'
        ? 'win-unpacked/Maestro.exe'
        : 'linux-unpacked/maestro'
  )
const resources =
  process.platform === 'darwin'
    ? resolve(dirname(executable), '../Resources')
    : join(dirname(executable), 'resources')
const evidence = join(root, 'docs/maestro/qa')
const temporary = await mkdtemp(join(tmpdir(), 'maestro-names-'))
const home = join(temporary, 'home')
const userData = join(temporary, 'data')
const plugin = join(temporary, 'names-plugin')
await Promise.all(
  [home, userData, plugin, evidence].map((path) => mkdir(path, { recursive: true }))
)
await writeFile(
  join(plugin, 'orca-plugin.json'),
  JSON.stringify({
    manifestVersion: 2,
    id: 'names-proof',
    name: 'Names proof',
    version: '1.0.0',
    execution: 'trusted-worker',
    engines: { orca: '>=1.4.246' },
    pluginApi: 1,
    main: 'main.mjs',
    capabilities: []
  })
)
await writeFile(join(plugin, 'main.mjs'), 'export default function activate() {}\n')
const env = {
  ...process.env,
  HOME: home,
  USERPROFILE: home,
  APPDATA: join(home, 'AppData', 'Roaming'),
  LOCALAPPDATA: join(home, 'AppData', 'Local'),
  XDG_CONFIG_HOME: join(home, '.config'),
  XDG_DATA_HOME: join(home, '.local', 'share'),
  XDG_CACHE_HOME: join(home, '.cache'),
  ORCA_BACKGROUND_LAUNCH: '1',
  ORCA_USER_DATA_PATH: userData,
  ORCA_ENVIRONMENT: '',
  ORCA_PAIRING_CODE: '',
  ORCA_CLI_CWD: '',
  ORCA_E2E_HEADLESS: '1',
  ORCA_E2E_HOME_DIR: home,
  ORCA_E2E_USER_DATA_DIR: userData,
  GIT_CONFIG_GLOBAL: join(home, '.gitconfig'),
  GIT_CONFIG_NOSYSTEM: '1',
  SSH_AUTH_SOCK: '',
  ORCA_BRAND: 'orca'
}
const report = { viewport: { width: 1280, height: 800 }, errors: [], surfaces: {}, executable }
let app
let page
try {
  app = await electron.launch({
    executablePath: executable,
    args: [`--user-data-dir=${userData}`, '--password-store=basic', '--use-mock-keychain'],
    env,
    timeout: 90_000
  })
  page = await app.firstWindow({ timeout: 90_000 })
  page.setDefaultTimeout(20_000)
  page.on('pageerror', (error) => report.errors.push(error.message))
  await page.setViewportSize(report.viewport)
  await page.waitForFunction(() => Boolean(window.api?.onboarding))
  await page.evaluate(async (home) => {
    await window.api.onboarding.update({
      closedAt: Date.now(),
      outcome: 'dismissed',
      checklist: { dismissed: true }
    })
    await window.api.ui.setWithAck({
      featureTipsSeenIds: [
        'chat-ui-here',
        'voice-dictation',
        'orca-cli',
        'cmd-j-palette',
        'agent-session-search'
      ]
    })
    const repos = await window.api.repos.list()
    for (const repo of repos) {
      if (repo.path !== home) {
        throw new Error(`Unexpected initial project: ${repo.path}`)
      }
      await window.api.repos.removeForHost({ repoId: repo.id, hostId: 'local' })
    }
  }, home)
  await page.reload()
  await page.getByRole('heading', { name: 'MAESTRO', exact: true }).waitFor({ timeout: 60_000 })

  async function capture(name, locator = page.locator('body'), attribution = false) {
    const text = await locator.innerText()
    const copy = attribution
      ? text
          .replace('Built on Orca · MIT License', '')
          .replace(
            'Maestro — built on Orca. Copyright (c) 2026 Lovecast Inc. Licensed under the MIT License.',
            ''
          )
      : text
    assert.doesNotMatch(copy, /\bOrca\b/, `${name} has upstream product copy`)
    report.surfaces[name] = text
    await page.evaluate(() =>
      Promise.all(
        document
          .getAnimations()
          .filter((animation) => animation.effect?.getTiming().iterations !== Infinity)
          .map((animation) => animation.finished.catch(() => {}))
      )
    )
    await page.screenshot({ path: join(evidence, `names-${name}.png`), animations: 'disabled' })
    console.log(`Captured ${name}`)
  }

  await capture('empty-state')
  assert.ok(await page.getByText('Maestro Mobile', { exact: true }).count())
  await capture('sidebar')
  await page.getByRole('button', { name: 'Settings', exact: true }).click()
  await page.getByRole('button', { name: 'About Maestro', exact: true }).waitFor()
  await capture('settings')
  await page.getByRole('button', { name: 'About Maestro', exact: true }).click()
  const about = page.getByRole('dialog')
  await about.getByText('MIT License', { exact: false }).first().waitFor()
  await capture('about', about, true)
  await about.getByRole('button', { name: 'Close', exact: true }).click()

  await page.getByRole('button', { name: 'Plugins', exact: true }).click()
  await page.getByRole('button', { name: 'Add plugin', exact: true }).click()
  await page.getByRole('menuitem', { name: 'From a folder…', exact: true }).click()
  await page.locator('#plugin-local-path').fill(plugin)
  await page.getByRole('dialog').getByRole('button', { name: 'Install', exact: true }).click()
  const approval = page.locator('[data-plugin-install-trust]')
  await approval.waitFor()
  await capture('plugin-approval', approval)
  await approval.getByRole('button', { name: 'Cancel', exact: true }).click()

  report.launch = await app.evaluate(({ app, BrowserWindow, Menu }) => {
    const labels = (items) =>
      items.flatMap((item) => [item.label, ...labels(item.submenu?.items ?? [])])
    return {
      name: app.getName(),
      home: app.getPath('home'),
      userData: app.getPath('userData'),
      windows: BrowserWindow.getAllWindows().map((window) => ({
        visible: window.isVisible(),
        focused: window.isFocused(),
        title: window.getTitle()
      })),
      menu: labels(Menu.getApplicationMenu()?.items ?? [])
    }
  })
  assert.equal(report.launch.name, 'Maestro')
  assert.equal(report.launch.home, home)
  assert.equal(report.launch.userData, userData)
  assert.ok(
    report.launch.windows.every(
      (window) => !window.visible && !window.focused && !window.title.includes('Orca')
    )
  )
  assert.doesNotMatch(report.launch.menu.join('\n'), /\bOrca\b/)

  const cliEntry = join(resources, 'app.asar/out/cli/index.js')
  report.cli = []
  for (const args of [
    ['--help'],
    ['plugin', '--help'],
    ['plugin', 'install', '--help'],
    ['plugin', 'test', '--help'],
    ['serve', 'service', 'install', '--help']
  ]) {
    const result = spawnSync(executable, [cliEntry, ...args], {
      env: { ...env, ELECTRON_RUN_AS_NODE: '1' },
      encoding: 'utf8',
      timeout: 30_000
    })
    assert.equal(result.status, 0, result.stderr)
    const commandCopy = result.stdout.replace('`orca` and `orca/testing`', '')
    if (args.join(' ') === 'plugin test --help') {
      assert.ok(result.stdout.includes('`orca` and `orca/testing`'))
    }
    assert.doesNotMatch(
      commandCopy,
      /\bOrca\b|(?<![A-Za-z0-9_./@:\\-])orca(?:-ide|-dev)?(?=\s|`|$)/
    )
    report.cli.push({ args, output: result.stdout })
  }
  const pathHome = join(temporary, 'My Orca Project')
  await mkdir(pathHome)
  const unavailable = spawnSync(executable, [cliEntry, 'plugin', 'list', '--json'], {
    env: {
      ...env,
      HOME: pathHome,
      USERPROFILE: pathHome,
      APPDATA: join(pathHome, 'AppData', 'Roaming'),
      XDG_CONFIG_HOME: join(pathHome, '.config'),
      ORCA_USER_DATA_PATH: join(pathHome, 'data'),
      ELECTRON_RUN_AS_NODE: '1'
    },
    encoding: 'utf8',
    timeout: 30_000
  })
  assert.equal(unavailable.status, 1)
  const message = JSON.parse(unavailable.stdout).error.message
  assert.ok(message.includes('Maestro runtime metadata'))
  assert.ok(message.includes(pathHome))
  report.cliError = message
  const bridged = spawnSync(executable, [cliEntry, 'plugin', 'validate', plugin, '--json'], {
    env: { ...env, ELECTRON_RUN_AS_NODE: '1', ORCA_CLI_CWD: pathHome },
    encoding: 'utf8',
    timeout: 30_000
  })
  assert.equal(bridged.status, 1)
  const bridgedMessage = JSON.parse(bridged.stdout).error.message
  assert.ok(bridgedMessage.includes('this shell forwards maestro to the Maestro host'))
  report.bridgedCliError = bridgedMessage
  assert.deepEqual(report.errors, [])
  await rm(join(evidence, 'names-failure.png'), { force: true })
  report.passed = true
} catch (error) {
  report.failure = String(error)
  if (page) {
    await page.screenshot({ path: join(evidence, 'names-failure.png') }).catch(() => {})
    report.failureText = await page
      .locator('body')
      .innerText()
      .catch(() => '')
  }
  throw error
} finally {
  if (page && !page.isClosed()) {
    await page.evaluate(() => window.api.ui.quitAfterStoppingAllSessions()).catch(() => {})
  }
  await app?.close()
  await writeFile(join(evidence, 'names-rendered.json'), `${JSON.stringify(report, null, 2)}\n`)
  await rm(temporary, { recursive: true, force: true })
}
console.log('Maestro names: rendered surfaces, CLI help, menus and hidden launch passed.')
