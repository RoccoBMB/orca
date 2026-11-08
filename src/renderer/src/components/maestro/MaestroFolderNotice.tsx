import { useUiLanguageRevision } from '@/i18n/use-ui-language-revision'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store'
import { parseExecutionHostId, type ExecutionHostId } from '../../../../shared/execution-host'
import { translate } from '@/i18n/i18n'

export function MaestroFolderNotice({
  path,
  owner,
  supportsGit,
  entryCount,
  onHomeDirectory
}: {
  onHomeDirectory?: (path: string | null) => void
  path: string | null
  owner: ExecutionHostId | 'unresolved'
  supportsGit: boolean
  entryCount: number
}) {
  useUiLanguageRevision()
  const [homePath, setHomePath] = useState<string | null>(null)
  const openModal = useAppStore((s) => s.openModal)
  useEffect(() => {
    let live = true
    if (path && owner === 'local') {
      void window.api.shell
        .isHomeDirectory?.(path, owner)
        .then((isHome) => {
          if (live) {
            setHomePath(isHome ? path : null)
            onHomeDirectory?.(isHome ? path : null)
          }
        })
        .catch(() => {})
    }
    return () => {
      live = false
    }
  }, [owner, path, onHomeDirectory])
  if (!path || (homePath !== path && (supportsGit || entryCount <= 200))) {
    return null
  }
  const host = parseExecutionHostId(owner)
  return (
    <div className="space-y-2 border-b border-border p-3 text-xs" role="status">
      <p className="text-muted-foreground">
        {homePath === path
          ? translate(
              'auto.components.maestro.MaestroFolderNotice.8d9361c7c3',
              'This project is your home directory.'
            )
          : translate(
              'auto.components.maestro.MaestroFolderNotice.f6c616c2ac',
              'This folder has more than 200 entries.'
            )}{' '}
        {translate(
          'auto.components.maestro.MaestroFolderNotice.690bc08a78',
          'A repository gives files and changes a focused scope.'
        )}
      </p>
      <Button
        size="xs"
        variant="outline"
        onClick={() =>
          openModal(
            'add-repo',
            host?.kind === 'runtime' ? { runtimeEnvironmentId: host.environmentId } : undefined
          )
        }
      >
        {translate(
          'auto.components.maestro.MaestroFolderNotice.6b253ec274',
          'Pick a repository instead'
        )}
      </Button>
    </div>
  )
}
