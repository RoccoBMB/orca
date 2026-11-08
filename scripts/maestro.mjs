import { runProcess } from '@orca/process-host'
import { resolvePnpmCliInvocation } from '../config/scripts/tool-invocation/pnpm-cli-invocation.mjs'

const [script, ...args] = process.argv.slice(2)
if (!script) {
  throw new Error('Expected a pnpm script')
}
const invocation = resolvePnpmCliInvocation()

async function git(args) {
  const result = await runProcess({ program: 'git', args, cwd: process.cwd(), stdio: 'pipe' })
  return result.code === 0 ? String(result.stdout ?? '').trim() : null
}

// package.json stays at an old version upstream; releases stamp theirs from tags cut off
// main. Plugins check `engines.orca` against this version, so local Maestro builds take
// the newest upstream release whose fork point from upstream main is already in HEAD.
async function upstreamReleaseVersion() {
  const tags = (await git(['tag', '--list', 'v[0-9]*.[0-9]*.[0-9]*', '--sort=-v:refname'])) ?? ''
  const mainRef = (await git(['rev-parse', '--verify', '--quiet', 'upstream/main']))
    ? 'upstream/main'
    : 'origin/main'
  for (const tag of tags.split('\n').filter((t) => /^v\d+\.\d+\.\d+$/.test(t))) {
    const forkPoint = await git(['merge-base', tag, mainRef])
    if (forkPoint && (await git(['merge-base', '--is-ancestor', forkPoint, 'HEAD'])) !== null) {
      return tag.slice(1)
    }
  }
  return undefined
}

const buildVersion = process.env.ORCA_LOCAL_BUILD_VERSION ?? (await upstreamReleaseVersion())
async function run(script, args = []) {
  return await runProcess({
    program: invocation.command,
    args: [...invocation.prefixArgs, 'run', script, ...args],
    cwd: process.cwd(),
    env: {
      ...process.env,
      ORCA_BRAND: 'maestro',
      ...(buildVersion ? { ORCA_LOCAL_BUILD_VERSION: buildVersion } : {})
    },
    stdio: 'inherit',
    timeoutMs: null
  })
}

const cli = script === 'dev' ? await run('build:cli') : null
const result = cli && cli.code !== 0 ? cli : await run(script, args)
process.exitCode = result.code ?? 1
