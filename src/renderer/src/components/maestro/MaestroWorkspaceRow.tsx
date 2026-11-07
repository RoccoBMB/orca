import { useUiLanguageRevision } from '@/i18n/use-ui-language-revision'
import { useShallow } from 'zustand/react/shallow'
import { useAppStore } from '@/store'
import { useNow } from '@/hooks/use-now'
import { formatShortTimeAgo } from '@/lib/short-time-ago'
import { getResolvedExecutionHostIdForWorktree } from '@/lib/resolved-worktree-execution-host'
import { isActiveSidebarWorkspace } from '../../../../shared/sidebar-list/active-workspace'
import type { Worktree } from '../../../../shared/worktree/types'
import type { Repo } from '../../../../shared/repo-types'
import WorktreeCard from '../sidebar/workspace-card/surface/WorktreeCard'
import { LoadingSpinner } from '../LoadingSpinner'
import { MAESTRO_WORKSPACE_DRAG } from './MaestroSidebarSection'
import { getWorktreeHostIdentity } from '../../../../shared/worktree/host-qualified-identity'
import { translate } from '@/i18n/i18n'

export function MaestroWorkspaceRow({
  worktree,
  repo,
  onActivate
}: {
  worktree: Worktree
  repo?: Repo
  onActivate?: () => void
}) {
  useUiLanguageRevision()
  const now = useNow(60_000)
  const active = useAppStore((s) =>
    isActiveSidebarWorkspace(worktree, {
      worktreeId: s.activeWorktreeId,
      hostId: s.activeWorkspaceExecutionHostId
    })
  )
  const stats = useAppStore(
    useShallow((s) => {
      if (
        worktree.id.startsWith('folder:') ||
        !worktree.head ||
        s.gitStatusHeadByWorktree[worktree.id] !== worktree.head ||
        s.gitStatusReadErrorByWorktree[worktree.id] ||
        getResolvedExecutionHostIdForWorktree(s, worktree.id) !== worktree.hostId
      ) {
        return null
      }
      const total = s.gitBranchLineTotalByWorktree[worktree.id]
      const summary = s.gitBranchCompareSummaryByWorktree[worktree.id]
      if (total && total.mergeBase === summary?.mergeBase) {
        return { added: total.added, removed: total.removed }
      }
      const entries = s.gitStatusByWorktree[worktree.id]
      if (
        !entries ||
        entries.some((entry) => entry.added === undefined || entry.removed === undefined)
      ) {
        return null
      }
      return entries.reduce(
        (sum, entry) => ({
          added: sum.added + (entry.added ?? 0),
          removed: sum.removed + (entry.removed ?? 0)
        }),
        { added: 0, removed: 0 }
      )
    })
  )
  const timestamp = worktree.createdAt ?? worktree.lastActivityAt
  return (
    <div
      data-maestro-workspace={getWorktreeHostIdentity(worktree)}
      draggable
      onDragStart={(event) => {
        event.stopPropagation()
        event.dataTransfer.setData(MAESTRO_WORKSPACE_DRAG, getWorktreeHostIdentity(worktree))
        event.dataTransfer.effectAllowed = 'move'
      }}
    >
      <WorktreeCard
        worktree={worktree}
        repo={repo}
        isActive={active}
        nativeDragEnabled={false}
        onWorktreeCardClick={onActivate}
      />
      <div className="flex items-center gap-2 px-4 pb-1 text-2xs text-muted-foreground">
        {worktree.smartTier === 'working' && (
          <span
            aria-label={translate(
              'auto.components.maestro.MaestroWorkspaceRow.73290a059e',
              'Agent working'
            )}
          >
            <LoadingSpinner className="size-3" />
          </span>
        )}
        {stats ? (
          <span
            className="flex gap-1.5 tabular-nums"
            aria-label={translate(
              'auto.components.maestro.MaestroWorkspaceRow.ef5798569a',
              '{{value0}} lines added, {{value1}} lines removed',
              { value0: stats.added, value1: stats.removed }
            )}
          >
            <span className="text-[color:var(--git-decoration-added)]">+{stats.added}</span>
            <span className="text-[color:var(--git-decoration-deleted)]">−{stats.removed}</span>
          </span>
        ) : (
          <span
            aria-label={translate(
              'auto.components.maestro.MaestroWorkspaceRow.311fdd70ab',
              'Diff statistics unavailable'
            )}
          >
            —
          </span>
        )}
        <time
          className="ml-auto tabular-nums"
          dateTime={new Date(timestamp).toISOString()}
          aria-label={
            worktree.createdAt
              ? translate('auto.components.maestro.MaestroWorkspaceRow.c1aa534eeb', 'Workspace age')
              : translate('auto.components.maestro.MaestroWorkspaceRow.c463faa545', 'Last activity')
          }
        >
          {formatShortTimeAgo(timestamp, now)}
        </time>
      </div>
    </div>
  )
}
