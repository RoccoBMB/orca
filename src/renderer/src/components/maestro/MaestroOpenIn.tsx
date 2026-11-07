import { useUiLanguageRevision } from '@/i18n/use-ui-language-revision'
import { toast } from 'sonner'
import { OPEN_IN_APPLICATIONS_MAX } from '../../../../shared/open-in-applications'
import { useEffect, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { ChevronDown, FolderOpen, Terminal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useAppStore } from '@/store'
import { getLocalFileManagerLabel } from '@/lib/local-file-manager-label'
import { OpenInApplicationIcon } from '@/lib/open-in-app-catalog'
import { getWorkspaceEditorSshHost } from '@/lib/workspace-editor-ssh-target'
import {
  getOpenInEntryAvailability,
  getWorktreeOpenInEntries,
  openOpenInAppsSettings,
  openWorktreePath
} from '../sidebar/workspace-actions/open/WorktreeOpenInMenu'
import { useMaestroSettings } from './use-maestro-settings'
import type { OpenInApplication } from '../../../../shared/ui-chrome-types'
import type { Worktree } from '../../../../shared/worktree/types'
import type { Repo } from '../../../../shared/repo-types'
import { resolveWorktreeRowOpenInRuntimeOwner } from '@/lib/worktree-row-open-in-owner'
import { translate } from '@/i18n/i18n'

export function MaestroOpenIn({ worktree, repo }: { worktree: Worktree; repo: Repo | null }) {
  useUiLanguageRevision()
  const applications = useAppStore((s) => s.settings?.openInApplications)
  const updateSettings = useAppStore((s) => s.updateSettingsOrThrow)
  const owner = useAppStore(useShallow((s) => resolveWorktreeRowOpenInRuntimeOwner(s, worktree)))
  const { runtimeEnvironmentId, ownerUnresolved } = owner
  const connectionId = owner.connectionId ?? repo?.connectionId
  const sshHost = useAppStore(
    useShallow((s) =>
      getWorkspaceEditorSshHost(s, { workspaceId: worktree.id, hostId: worktree.hostId })
    )
  )
  const { maestro, updateMaestro } = useMaestroSettings()
  const [installed, setInstalled] = useState<OpenInApplication[]>([])
  useEffect(() => {
    let live = true
    void window.api.shell
      .listInstalledOpenInApplications?.()
      .then((apps) => {
        if (live) {
          setInstalled(apps)
        }
      })
      .catch(() => {})
    return () => {
      live = false
    }
  }, [])
  const apps = [
    ...(applications ?? []),
    ...installed.filter((entry) => !applications?.some((app) => app.id === entry.id))
  ]
  const entries = getWorktreeOpenInEntries(apps, getLocalFileManagerLabel())
  const availability = (entry: (typeof entries)[number]) =>
    getOpenInEntryAvailability(entry, connectionId, runtimeEnvironmentId, ownerUnresolved, sshHost)
  const last =
    entries.find(
      (entry) => entry.id === maestro?.lastOpenInAppId && !availability(entry).disabled
    ) ??
    entries.find((entry) => entry.id === 'file-manager' && !availability(entry).disabled) ??
    entries.find((entry) => !availability(entry).disabled)
  const open = async (entry: (typeof entries)[number]): Promise<void> => {
    try {
      const app = apps.find((app) => app.id === entry.id)
      if (app && !applications?.some((saved) => saved.id === app.id)) {
        if ((applications?.length ?? 0) >= OPEN_IN_APPLICATIONS_MAX) {
          toast.error(
            translate('auto.components.maestro.MaestroOpenIn.99c2e5de50', 'Open in apps is full'),
            {
              description: translate(
                'auto.components.maestro.MaestroOpenIn.00b4f8b29a',
                'Remove an app in Customize apps before adding another.'
              )
            }
          )
          return
        }
        await updateSettings({ openInApplications: [...(applications ?? []), app] })
      }
      const opened = await openWorktreePath({
        target: entry.target,
        worktreePath: worktree.path,
        connectionId,
        ownerUnresolved,
        runtimeEnvironmentId,
        workspace: { workspaceId: worktree.id, hostId: worktree.hostId },
        openInApplicationId: app?.id,
        command: app?.command
      })
      if (opened) {
        await updateMaestro({ lastOpenInAppId: entry.id })
      }
    } catch (error) {
      toast.error(
        translate('auto.components.maestro.MaestroOpenIn.9196ccab4a', 'Could not open application'),
        {
          description: error instanceof Error ? error.message : String(error)
        }
      )
    }
  }
  const icon = (entry: (typeof entries)[number]) =>
    entry.id === 'terminal' ? (
      <Terminal className="size-4" />
    ) : entry.target === 'file-manager' ? (
      <FolderOpen className="size-4" />
    ) : (
      <OpenInApplicationIcon application={{ command: entry.command ?? '' }} />
    )
  return (
    <ButtonGroup className="shrink-0">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon-sm"
            disabled={!last}
            aria-label={
              last
                ? translate(
                    'auto.components.maestro.MaestroOpenIn.f34fdaae80',
                    'Open in {{value0}}',
                    { value0: last.label }
                  )
                : translate(
                    'auto.components.maestro.MaestroOpenIn.7d4dd6e652',
                    'Open in unavailable'
                  )
            }
            onClick={() => {
              if (last) {
                void open(last)
              }
            }}
          >
            {last ? icon(last) : <FolderOpen className="size-4" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {last
            ? translate('auto.components.maestro.MaestroOpenIn.f34fdaae80', 'Open in {{value0}}', {
                value0: last.label
              })
            : translate(
                'auto.components.maestro.MaestroOpenIn.48f8170806',
                'No supported local application'
              )}
        </TooltipContent>
      </Tooltip>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label={translate(
              'auto.components.maestro.MaestroOpenIn.577d2f1a52',
              'Choose Open in application'
            )}
          >
            <ChevronDown className="size-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {entries.map((entry) => (
            <DropdownMenuItem
              key={entry.id}
              disabled={availability(entry).disabled}
              onSelect={() => void open(entry)}
            >
              {icon(entry)}
              {entry.label}
              {availability(entry).metadata && (
                <span className="ml-auto text-xs text-muted-foreground">
                  {availability(entry).metadata}
                </span>
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={openOpenInAppsSettings}>
            {translate('auto.components.maestro.MaestroOpenIn.e09ba92aba', 'Customize apps…')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>
  )
}
