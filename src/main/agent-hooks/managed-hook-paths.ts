import { branding } from '../../shared/branding'

export function managedHookFileName(fileName: string): string {
  const prefix = branding.hookFilePrefix
  return fileName.startsWith(prefix) ? fileName : `${prefix}${fileName}`
}

export function managedHookRelativePath(fileName: string, separator = '/'): string {
  return [branding.homeDirectoryName, 'agent-hooks', managedHookFileName(fileName)].join(separator)
}

export function remoteManagedHookPath(home: string, fileName: string): string {
  return `${home.replace(/\/+$/, '')}/${managedHookRelativePath(fileName)}`
}
