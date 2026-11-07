import { build } from 'esbuild'
import { createRequire } from 'node:module'
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { runProcess } from '@orca/process-host'
import { afterEach, expect, it, vi } from 'vitest'

const require = createRequire(import.meta.url)
const configPath = require.resolve('../../branding.cjs')
afterEach(() => {
  vi.unstubAllEnvs()
  delete require.cache[configPath]
})

it.each([
  {
    brand: undefined,
    home: '.orca',
    script: 'claude-hook.sh',
    foreign: '.maestro',
    foreignScript: 'maestro-claude-hook.sh'
  },
  {
    brand: 'maestro',
    home: '.maestro',
    script: 'maestro-claude-hook.sh',
    foreign: '.orca',
    foreignScript: 'claude-hook.sh'
  }
])('compiled hooks preserve the other application’s state (brand=$brand)', async (fixture) => {
  const root = await mkdtemp(join(tmpdir(), 'orca-brand-build-'))
  try {
    vi.stubEnv('ORCA_BRAND', fixture.brand)
    delete require.cache[configPath]
    const { brandingDefines } = require(configPath)
    const foreignDir = join(root, fixture.foreign, 'agent-hooks')
    await mkdir(foreignDir, { recursive: true })
    await writeFile(join(foreignDir, fixture.foreignScript), 'official installation')
    const entry = join(root, 'hooks.cjs')
    await build({
      stdin: {
        contents: `
          import { getSharedManagedScriptPath, writeManagedScript, createManagedCommandMatcher } from './src/main/agent-hooks/installer-utils';
          const target = getSharedManagedScriptPath('claude-hook.sh');
          writeManagedScript(target, 'new hook');
          console.log(JSON.stringify({
            owned: createManagedCommandMatcher('claude-hook.sh')(target),
            foreign: createManagedCommandMatcher('claude-hook.sh')(process.argv[2])
          }));`,
        resolveDir: resolve('.'),
        loader: 'ts'
      },
      define: brandingDefines,
      bundle: true,
      platform: 'node',
      format: 'cjs',
      outfile: entry,
      external: ['electron']
    })
    const result = await runProcess({
      program: process.env.ORCA_TEST_NODE_EXECUTABLE ?? process.execPath,
      args: [entry, join(foreignDir, fixture.foreignScript)],
      env: {
        ...process.env,
        HOME: root,
        USERPROFILE: root,
        ORCA_BRAND: fixture.brand ? 'orca' : 'maestro'
      }
    })
    expect(result.code, result.stderr).toBe(0)
    expect(JSON.parse(result.stdout)).toEqual({ owned: true, foreign: false })
    expect(await readFile(join(root, fixture.home, 'agent-hooks', fixture.script), 'utf8')).toBe(
      'new hook'
    )
    expect(await readFile(join(foreignDir, fixture.foreignScript), 'utf8')).toBe(
      'official installation'
    )
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

it.each([
  { brand: undefined, profile: 'orca' },
  { brand: 'maestro', profile: 'Maestro' }
])('remote bundled CLI reads its own profile (brand=$brand)', async (fixture) => {
  const root = await mkdtemp(join(tmpdir(), 'orca-brand-cli-'))
  try {
    const entry = join(root, 'cli.cjs')
    const node = process.env.ORCA_TEST_NODE_EXECUTABLE ?? process.execPath
    const builder = new URL(
      '../orcad-distribution/server-bundle/orcad-entry-build.mjs',
      import.meta.url
    ).href
    const compiled = await runProcess({
      program: node,
      args: [
        '--input-type=module',
        '-e',
        `import { buildOrcadCli } from ${JSON.stringify(builder)}; await buildOrcadCli(${JSON.stringify(entry)})`
      ],
      env: { ...process.env, ORCA_BRAND: fixture.brand }
    })
    expect(compiled.code, compiled.stderr).toBe(0)
    const result = await runProcess({
      program: node,
      args: [entry, 'repo', 'list', '--json'],
      env: {
        ...process.env,
        HOME: root,
        USERPROFILE: root,
        APPDATA: root,
        XDG_CONFIG_HOME: root,
        ORCA_USER_DATA_PATH: undefined,
        ORCA_ENVIRONMENT: undefined,
        ORCA_PAIRING_CODE: undefined,
        ORCA_BRAND: fixture.brand ? 'orca' : 'maestro'
      }
    })
    expect(result.code).not.toBe(0)
    const profile =
      process.platform === 'darwin'
        ? join(root, 'Library', 'Application Support', fixture.profile)
        : join(root, fixture.profile)
    expect(result.stdout + result.stderr).toContain(profile)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
