import { runProcess } from '@orca/process-host'
import { resolvePnpmCliInvocation } from '../config/scripts/tool-invocation/pnpm-cli-invocation.mjs'

const [script, ...args] = process.argv.slice(2)
if (!script) {
  throw new Error('Expected a pnpm script')
}
const invocation = resolvePnpmCliInvocation()
async function run(script, args = []) {
  return await runProcess({
    program: invocation.command,
    args: [...invocation.prefixArgs, 'run', script, ...args],
    cwd: process.cwd(),
    env: { ...process.env, ORCA_BRAND: 'maestro' },
    stdio: 'inherit',
    timeoutMs: null
  })
}

const cli = script === 'dev' ? await run('build:cli') : null
const result = cli && cli.code !== 0 ? cli : await run(script, args)
process.exitCode = result.code ?? 1
