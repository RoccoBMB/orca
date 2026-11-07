import { branding } from '../../../shared/branding'
import { createHash } from 'node:crypto'
import {
  isWindowsRemoteHost,
  joinRemotePath,
  type RemoteHostPlatform
} from '../ssh-remote-platform'

export const WINDOWS_RELAY_PIPE_PREFIX = `${branding.cliCommand}-relay-`

function relayEndpointForHost(
  hostPlatform: RemoteHostPlatform,
  remoteDir: string,
  sockName: string
): string {
  if (!isWindowsRemoteHost(hostPlatform)) {
    return joinRemotePath(hostPlatform, remoteDir, sockName)
  }
  const endpointHash = createHash('sha256')
    .update(`${remoteDir}\0${sockName}`)
    .digest('hex')
    .slice(0, 20)
  return `\\\\.\\pipe\\${WINDOWS_RELAY_PIPE_PREFIX}${endpointHash}`
}

export function windowsRelayPipePathsForSocketName(
  hostPlatform: RemoteHostPlatform,
  remoteDir: string,
  sockName: string
): string[] {
  return [
    relayEndpointForHost(hostPlatform, remoteDir, sockName),
    relayEndpointForHost(hostPlatform, remoteDir, `${sockName}-fallback`)
  ]
}
