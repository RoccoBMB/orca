import { managedHookFileName, managedHookRelativePath } from './managed-hook-paths'
import {
  getWindowsNativeHookAgent,
  WINDOWS_NATIVE_HOOK_EXECUTABLE_NAME
} from './windows-native-hook-executable'

// Match script names so reinstalls sweep entries from old and parallel installations.
export function createManagedCommandMatcher(
  scriptFileName: string
): (command: string | undefined) => boolean {
  const ownedScriptFileName = managedHookFileName(scriptFileName)
  const scriptStem = ownedScriptFileName.replace(/\.(?:cmd|ps1|sh)$/, '')
  // Sweep every platform suffix after a platform switch.
  const needles = [
    managedHookRelativePath(ownedScriptFileName),
    managedHookRelativePath(`${scriptStem}.cmd`),
    managedHookRelativePath(`${scriptStem}.ps1`),
    managedHookRelativePath(`${scriptStem}.sh`)
  ]
  // The native executable selects its provider through argv[1].
  const nativeHook = `${managedHookRelativePath(WINDOWS_NATIVE_HOOK_EXECUTABLE_NAME)} ${getWindowsNativeHookAgent(scriptFileName)} `
  return (command) => {
    if (!command) {
      return false
    }
    const decodedCommand = decodePowerShellEncodedCommand(command)
    const searchText = decodedCommand ? `${command}\n${decodedCommand}` : command
    const normalizedCommand = searchText.replaceAll('\\', '/')
    return (
      needles.some((needle) => normalizedCommand.includes(needle)) ||
      normalizedCommand.split('\n').some((line) => `${line} `.includes(nativeHook))
    )
  }
}

function decodePowerShellEncodedCommand(command: string): string | null {
  const match = command.match(/\s-EncodedCommand\s+(\S+)/i)
  if (!match) {
    return null
  }
  try {
    return Buffer.from(match[1], 'base64').toString('utf16le')
  } catch {
    return null
  }
}
