import { branding } from '../../../shared/branding'
import { RuntimeClientError } from '../../runtime-client'

export function resolveCompatibilityCliCommand(): string {
  const configured = process.env.ORCA_CLI_COMMAND
  if (configured === branding.cliCommand || configured === `${branding.cliCommand}-dev`) {
    return configured
  }
  return branding.cliCommand
}

export function resolvePackagedWindowsCompatibilityCommand(): string | undefined {
  if (process.env.ORCA_WINDOWS_PACKAGED_CLI_LAUNCHER !== '1') {
    return undefined
  }
  const command = process.env.ORCA_CLI_COMMAND
  if (command === branding.cliCommand) {
    return command
  }
  throw new RuntimeClientError(
    'invalid_argument',
    `The packaged ${branding.productName} launcher did not provide a valid resume command. No question was created.`
  )
}

export async function flushOrchestrationStdout(): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    process.stdout.write('', (error) => {
      if (error) {
        reject(error)
      } else {
        resolve()
      }
    })
  })
}

export function isDevCliInvocation(): boolean {
  return (
    process.env.ORCA_DEV_CLI_INVOCATION === '1' ||
    (process.env.ORCA_USER_DATA_PATH?.includes(`${branding.userDataName}-dev`) ?? false)
  )
}
