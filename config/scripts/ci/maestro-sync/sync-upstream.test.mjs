import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import {
  chmodSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { test } from 'vitest'
import { parse } from 'yaml'

const root = resolve(import.meta.dirname, '../../../..')
const workflow = parse(readFileSync(join(root, '.github/workflows/sync-upstream.yml'), 'utf8'))

function fixture() {
  const temp = mkdtempSync(join(tmpdir(), 'maestro-sync-isolation-'))
  const env = {
    ...process.env,
    HOME: temp,
    GIT_CONFIG_GLOBAL: '/dev/null',
    GIT_CONFIG_NOSYSTEM: '1'
  }
  const git = (cwd, ...args) =>
    execFileSync('git', args, {
      cwd,
      env,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe']
    }).trim()
  const seed = join(temp, 'seed')
  mkdirSync(seed)
  git(seed, 'init', '-b', 'rocco/main')
  git(seed, 'config', 'user.name', 'Fixture')
  git(seed, 'config', 'user.email', 'fixture@example.invalid')
  mkdirSync(join(seed, '.github', 'scripts'), { recursive: true })
  mkdirSync(join(seed, 'scripts'))
  mkdirSync(join(seed, 'docs'))
  copyFileSync(
    join(root, '.github/scripts/check-root-directory-entries.mjs'),
    join(seed, '.github/scripts/check-root-directory-entries.mjs')
  )
  copyFileSync(join(root, 'scripts/sync-upstream.sh'), join(seed, 'scripts/sync-upstream.sh'))
  writeFileSync(join(seed, 'docs', 'base'), 'base')
  git(seed, 'add', '.')
  git(seed, 'commit', '-m', 'chore: seed')
  const base = git(seed, 'rev-parse', 'HEAD')
  const upstream = join(temp, 'upstream.git')
  git(temp, 'clone', '--bare', seed, upstream)
  git(seed, 'remote', 'add', 'upstream', upstream)
  const bin = join(temp, 'bin')
  mkdirSync(bin)
  writeFileSync(join(bin, 'pnpm'), '#!/bin/sh\nif [ "$1" = --version ]; then echo 12.14.0; fi\n')
  chmodSync(join(bin, 'pnpm'), 0o755)
  env.PATH = `${bin}:${process.env.PATH}`
  return { temp, seed, upstream, bin, env, git, base }
}

test('merged verification has no write permissions or persisted checkout credential', () => {
  assert.deepEqual(workflow.permissions, {})
  assert.deepEqual(workflow.jobs.verify.permissions, { contents: 'read' })
  const checkout = workflow.jobs.verify.steps.find((step) =>
    step.uses?.startsWith('actions/checkout@')
  )
  assert.equal(checkout.with['persist-credentials'], false)
  assert.ok(!JSON.stringify(workflow.jobs.verify).includes('github.token'))
  assert.ok(!workflow.jobs.publish.steps.some((step) => step.uses?.startsWith('actions/checkout@')))
})

test('sync checks root entries; publishing transfers verified objects without checking out upstream files', () => {
  const f = fixture()
  try {
    writeFileSync(join(f.seed, 'scripts', 'upstream-payload.sh'), 'exit 99\n')
    f.git(f.seed, 'add', '.')
    f.git(f.seed, 'commit', '-m', 'chore: upstream')
    f.git(f.seed, 'push', 'upstream', 'HEAD:main')
    f.git(f.seed, 'reset', '--hard', f.base)
    const env = {
      ...f.env,
      SYNC_BASE: 'rocco/main',
      SYNC_BRANCH: 'sync/upstream-2026-11-07-123',
      SYNC_REPORT: join(f.temp, 'report')
    }
    execFileSync('bash', ['scripts/sync-upstream.sh'], { cwd: f.seed, env, stdio: 'pipe' })
    assert.equal(f.git(f.seed, 'rev-parse', 'rocco/main'), f.base)
    const result = join(f.temp, 'sync-result')
    mkdirSync(result)
    f.git(
      f.seed,
      'bundle',
      'create',
      join(result, 'verified.bundle'),
      env.SYNC_BRANCH,
      '^rocco/main'
    )
    writeFileSync(join(f.bin, 'gh'), '#!/bin/sh\nexit 0\n')
    chmodSync(join(f.bin, 'gh'), 0o755)
    const publish = workflow.jobs.publish.steps
      .find((step) => step.run)
      .run.replace('https://github.com/$GITHUB_REPOSITORY.git', '$TEST_ORIGIN')
    execFileSync('bash', ['-e', '-o', 'pipefail', '-c', publish], {
      cwd: f.temp,
      env: {
        ...f.env,
        RUNNER_TEMP: f.temp,
        VERIFY_RESULT: 'success',
        VERIFY_OUTCOME: 'success',
        SYNC_CHANGED: 'true',
        GITHUB_REPOSITORY: 'RoccoBMB/orca',
        GITHUB_RUN_ID: '123',
        TEST_ORIGIN: f.upstream
      },
      stdio: 'pipe'
    })
    assert.equal(
      f.git(f.upstream, 'rev-parse', env.SYNC_BRANCH),
      f.git(f.seed, 'rev-parse', env.SYNC_BRANCH)
    )
    assert.equal(existsSync(join(f.temp, 'publish', 'scripts', 'upstream-payload.sh')), false)
    f.git(f.seed, 'reset', '--hard', 'upstream/main')
    writeFileSync(join(f.seed, 'unreviewed-root'), 'unreviewed')
    f.git(f.seed, 'add', '.')
    f.git(f.seed, 'commit', '-m', 'chore: unreviewed root')
    f.git(f.seed, 'push', 'upstream', 'HEAD:main')
    f.git(f.seed, 'reset', '--hard', f.base)
    assert.throws(
      () =>
        execFileSync('bash', ['scripts/sync-upstream.sh'], {
          cwd: f.seed,
          env: { ...env, SYNC_BRANCH: 'sync/root-rejected' },
          stdio: 'pipe'
        }),
      /Command failed/
    )
  } finally {
    rmSync(f.temp, { recursive: true, force: true })
  }
})
