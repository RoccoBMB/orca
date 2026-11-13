import { useEffect, useState } from 'react'
import { useAppStore } from '@/store'
import { useActiveWorktree } from '@/store/workspaces/selection/use-selected-worktree'
import { useRepoById } from '@/store/repos/use-repository-catalog'
import { Button } from '@/components/ui/button'
import { checkRuntimeHooks, type HookCheckResult } from '@/runtime/repo-hooks/runtime-hooks-client'
import { getSetupConfig, getSetupTrustContent } from '../../../../shared/orca-hook-setup-config'
import { MaestroSetupRun } from './MaestroSetupRun'
import { resolveHookCommandSourcePolicy } from '../../../../shared/hook-command-source-policy'
import { SetupCommandPreview } from '../new-workspace/SetupCommandPreview'
import { translate } from '@/i18n/i18n'
import { resolveTerminalTabTitle } from '../../../../shared/tab-title-resolution'
import { getRepoExecutionHostId } from '../../../../shared/execution-host'
import { clearClientHostedBrowserRowSelection } from '@/lib/pane-manager/client-hosted-browser-row-state'
import { noteUserWorkspaceSwitch } from '@/lib/workspace-switch-user-act'

export function MaestroSetupPanel() {
  const worktree = useActiveWorktree()
  const repo = useRepoById(worktree?.repoId ?? null)
  const [attempt, setAttempt] = useState(0)
  const hostId = repo ? getRepoExecutionHostId(repo) : 'local'
  const repoId = repo?.id
  const sourcePolicy = resolveHookCommandSourcePolicy(repo?.hookSettings?.commandSourcePolicy, {
    hasLocalScript: Boolean(repo?.hookSettings?.scripts.setup?.trim())
  })
  const inspectShared = Boolean(repoId && repo?.kind !== 'folder' && sourcePolicy !== 'local-only')
  const key = JSON.stringify([repoId, hostId, inspectShared, attempt])
  const [inspection, setInspection] = useState<{
    key: string
    result: HookCheckResult | null
  } | null>(null)
  const tabs = useAppStore((s) => (worktree ? s.tabsByWorktree[worktree.id] : undefined))
  const generatedTitles = useAppStore((s) => s.settings?.tabAutoGenerateTitle === true)
  useEffect(() => {
    if (!inspectShared || !repoId) {
      return
    }
    let cancelled = false
    void checkRuntimeHooks(hostId, repoId, { background: true }).then(
      (result) => {
        if (!cancelled) {
          setInspection({ key, result })
        }
      },
      () => {
        if (!cancelled) {
          setInspection({ key, result: null })
        }
      }
    )
    return () => {
      cancelled = true
    }
  }, [hostId, inspectShared, key, repoId])
  const pending = inspectShared && inspection?.key !== key
  const result = inspection?.key === key ? inspection.result : null
  const failed =
    inspectShared &&
    !pending &&
    (!result ||
      result.status === 'error' ||
      result.unavailable ||
      (result.hasHooks && !result.hooks))
  const config =
    pending || failed
      ? null
      : getSetupConfig(repo ?? undefined, inspectShared ? (result?.hooks ?? null) : null)
  const terminals = tabs?.filter((tab) => tab.viewMode !== 'chat') ?? []
  return (
    <div className="h-full space-y-3 overflow-y-auto scrollbar-sleek p-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="font-medium">{translate('maestro.setup.project', 'Project setup')}</span>
        {config && (
          <span className="text-muted-foreground">
            {config.source === 'local'
              ? translate('maestro.setup.local', 'Local')
              : config.source === 'both'
                ? translate('maestro.setup.both', 'Shared + local')
                : translate('maestro.setup.shared', 'Shared')}
          </span>
        )}
      </div>
      {pending ? (
        <p role="status" className="text-xs text-muted-foreground">
          {translate('maestro.setup.checking', 'Checking setup…')}
        </p>
      ) : failed ? (
        <div className="space-y-2">
          <p role="status" className="text-xs text-muted-foreground">
            {translate('maestro.setup.unavailable', 'Could not check project setup. Try again.')}
          </p>
          <Button size="sm" variant="outline" onClick={() => setAttempt((value) => value + 1)}>
            {translate('components.newWorkspace.directSetup.retry', 'Retry')}
          </Button>
        </div>
      ) : config ? (
        <SetupCommandPreview setupConfig={config} />
      ) : (
        <p className="text-xs text-muted-foreground">
          {translate(
            'auto.components.maestro.MaestroTerminalDock.350af2f832',
            'No setup command configured.'
          )}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {config && worktree && repo && repo.kind !== 'folder' && (
          <MaestroSetupRun
            key={`${worktree.hostId}:${worktree.id}`}
            worktree={worktree}
            repo={repo}
            config={config}
            trustContent={getSetupTrustContent(inspectShared ? (result?.hooks ?? null) : null)}
          />
        )}
        <Button
          size="sm"
          variant="outline"
          disabled={!repo}
          onClick={() => {
            const state = useAppStore.getState()
            state.openSettingsTarget({ pane: 'repo', repoId: repoId ?? null, hostId })
            state.openSettingsPage()
          }}
        >
          {translate('auto.components.maestro.MaestroTerminalDock.6c02bea157', 'Configure setup')}
        </Button>
        {inspectShared && !failed && (
          <Button
            size="sm"
            variant="ghost"
            disabled={pending}
            onClick={() => setAttempt((value) => value + 1)}
          >
            {translate('maestro.setup.refresh', 'Refresh setup')}
          </Button>
        )}
      </div>
      {terminals.length > 0 && (
        <div className="space-y-1 border-t border-border pt-2">
          <p className="text-xs text-muted-foreground">
            {translate('maestro.setup.output', 'Terminal output')}
          </p>
          {terminals.map((tab) => (
            <Button
              key={tab.id}
              size="sm"
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {
                if (worktree) {
                  clearClientHostedBrowserRowSelection()
                  noteUserWorkspaceSwitch(worktree.id)
                  useAppStore.getState().activateTab(tab.id, { worktreeId: worktree.id })
                }
              }}
            >
              <span className="truncate">
                {resolveTerminalTabTitle(tab, generatedTitles, tab.title)}
              </span>
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
