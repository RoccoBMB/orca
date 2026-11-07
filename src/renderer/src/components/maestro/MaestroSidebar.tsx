import { useUiLanguageRevision } from '@/i18n/use-ui-language-revision'
import { useCallback, useMemo, useRef, useState, type DragEvent } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store'
import { MaestroSectionDialog } from './MaestroSectionDialog'
import { useMaestroSettings } from './use-maestro-settings'
import { maestroWorkspaceStatus } from './maestro-workspace-status'
import { MaestroWorkspaceRow } from './MaestroWorkspaceRow'
import { VirtualizedList } from '@/components/virtualized-list'
import {
  MaestroSidebarSection,
  MAESTRO_SECTION_DRAG,
  MAESTRO_WORKSPACE_DRAG,
  type MaestroSidebarGroup
} from './MaestroSidebarSection'
import {
  MAESTRO_STATUSES,
  conductorSidebarEnabled,
  type MaestroSection
} from '../../../../shared/maestro-settings'
import { getWorktreeHostIdentity } from '../../../../shared/worktree/host-qualified-identity'
import { folderWorkspaceToWorktree } from '../../../../shared/folder-workspaces/folder-workspace-worktree'
import { getHostedReviewCacheKey } from '@/store/slices/hosted-review/hosted-review-cache-identity'
import { getGitHubPRCacheKey } from '../../../../shared/github/github-cache-key'
import { getRepoExecutionHostId } from '../../../../shared/execution-host'
import { useWorktreeListKeyboardNavigation } from '../sidebar/worktree-list/navigation/use-keyboard'
import type { HostSectionRow } from '../../../../shared/sidebar-list/host-section-rows'
import { getPinnedWorktreeDisplayPolicy } from '../../../../shared/sidebar-list/row-types'
import { getWorktreeOptionId } from '../sidebar/worktree-list/rows/option-dom'
import { buildMaestroSidebarGroups } from './maestro-sidebar-groups'
import type { Worktree } from '../../../../shared/worktree/types'
import type { Repo } from '../../../../shared/repo-types'
import type { FolderWorkspace } from '../../../../shared/folder-workspaces/folder-workspace-types'
import type { GlobalSettings } from '../../../../shared/global-settings-types'
import type { SidebarListModel } from '../sidebar/worktree-list/listing/sidebar-list-model'
import { translate } from '@/i18n/i18n'

type VirtualRow = { key: string; group: MaestroSidebarGroup; worktree?: Worktree }

type Props = {
  worktrees: readonly Worktree[]
  folders: readonly FolderWorkspace[]
  repos: readonly Repo[]
  onWorktreeCardClick?: () => void
}

export function MaestroSidebar({ worktrees, folders, repos, onWorktreeCardClick }: Props) {
  useUiLanguageRevision()
  const { maestro, updateMaestro } = useMaestroSettings()
  const settings = useAppStore((s) => s.settings)
  const prCache = useAppStore((s) => s.prCache)
  const reviewCache = useAppStore((s) => s.hostedReviewCache)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(null)
  const attachScroller = useCallback((element: HTMLDivElement | null) => {
    scrollRef.current = element
    setScrollElement(element)
  }, [])
  const [dialog, setDialog] = useState<MaestroSection | 'new' | null>(null)
  const rows = useMemo(
    () => [...worktrees, ...folders.map(folderWorkspaceToWorktree)],
    [worktrees, folders]
  )
  const repoByHost = useMemo(
    () => new Map(repos.map((repo) => [`${getRepoExecutionHostId(repo)}|${repo.id}`, repo])),
    [repos]
  )
  const repoFor = (worktree: Worktree): Repo | undefined =>
    repoByHost.get(`${worktree.hostId ?? 'local'}|${worktree.repoId}`)
  const allGroups = buildMaestroSidebarGroups(rows, maestro, (row) => {
    const repo = repoFor(row)
    const branch = row.branch.replace(/^refs\/heads\//, '')
    const review = repo
      ? reviewCache[
          getHostedReviewCacheKey(
            repo.path,
            branch,
            settings,
            repo.id,
            repo.connectionId,
            row.hostId ?? repo.executionHostId,
            true
          )
        ]?.data
      : null
    const pr = repo
      ? prCache[
          getGitHubPRCacheKey(
            repo.path,
            repo.id,
            branch,
            settings,
            repo.connectionId,
            row.hostId ?? repo.executionHostId,
            true
          )
        ]?.data
      : null
    return maestroWorkspaceStatus(row, review ?? pr, maestro?.statusOverrides)
  })
  const virtualRows: VirtualRow[] = allGroups.flatMap((group) => [
    { key: group.key, group },
    ...(group.collapsed
      ? []
      : group.items.map((worktree) => ({
          key: `${group.key}:${getWorktreeHostIdentity(worktree)}`,
          group,
          worktree
        })))
  ])
  const activeWorktreeId = useAppStore((s) => s.activeWorktreeId)
  const activeHostId = useAppStore((s) => s.activeWorkspaceExecutionHostId)
  const activeModal = useAppStore((s) => s.activeModal)
  const navigationRows: HostSectionRow[] = virtualRows.flatMap((row) =>
    row.worktree
      ? [
          {
            type: 'item' as const,
            rowKey: row.key,
            sectionKey: row.group.key,
            worktree: row.worktree,
            repo: repoFor(row.worktree),
            depth: 0,
            groupDepth: 0,
            isLastLineageChild: false,
            lineageChildCount: 0
          }
        ]
      : []
  )
  const { handleContainerKeyDown, keyboardPreview } = useWorktreeListKeyboardNavigation({
    rows: navigationRows,
    activeWorktreeId,
    activeWorkspaceExecutionHostId: activeHostId,
    pinnedDisplayPolicy: getPinnedWorktreeDisplayPolicy(settings),
    scrollRef,
    activeModal,
    markDirectScrollInput: () => {}
  })
  const currentWorkspaceId = keyboardPreview?.worktreeId ?? activeWorktreeId
  const currentHostId = keyboardPreview?.executionHostId ?? activeHostId
  const activeRowKey = virtualRows.find(
    (row) =>
      row.worktree?.id === currentWorkspaceId &&
      (row.worktree.hostId ?? 'local') === (currentHostId ?? 'local')
  )?.key
  const toggle = (group: MaestroSidebarGroup): void => {
    void updateMaestro((current) => {
      if (group.custom) {
        return {
          sections: current.sections?.map((section) =>
            section.id === group.custom?.id
              ? { ...section, collapsed: !section.collapsed }
              : section
          )
        }
      }
      const collapsed = new Set(current.collapsedSections ?? [])
      if (collapsed.has(group.key)) {
        collapsed.delete(group.key)
      } else {
        collapsed.add(group.key)
      }
      return { collapsedSections: [...collapsed] }
    })
  }
  const move = (id: string, delta: number, target?: string): void => {
    void updateMaestro((current) => {
      const next = [...(current.sections ?? [])]
      const from = next.findIndex((section) => section.id === id)
      const to = target ? next.findIndex((section) => section.id === target) : from + delta
      if (from === -1 || to < 0 || to >= next.length) {
        return {}
      }
      const [item] = next.splice(from, 1)
      next.splice(to, 0, item)
      return { sections: next }
    })
  }
  const remove = (id: string): void => {
    void updateMaestro((current) => ({
      sections: current.sections?.filter((section) => section.id !== id),
      workspaceSections: Object.fromEntries(
        Object.entries(current.workspaceSections ?? {}).filter(([, section]) => section !== id)
      )
    }))
  }
  const drop = (event: DragEvent, group: MaestroSidebarGroup): void => {
    const workspaceKey = event.dataTransfer.getData(MAESTRO_WORKSPACE_DRAG)
    const sectionId = event.dataTransfer.getData(MAESTRO_SECTION_DRAG)
    if (group.custom && sectionId) {
      event.preventDefault()
      event.stopPropagation()
      move(sectionId, 0, group.custom.id)
      return
    }
    if (!rows.some((row) => getWorktreeHostIdentity(row) === workspaceKey)) {
      return
    }
    const status = MAESTRO_STATUSES.find((status) => status.id === group.key)
    if (!group.custom && !status) {
      return
    }
    event.preventDefault()
    event.stopPropagation()
    void updateMaestro((current) => {
      const workspaceSections = { ...current.workspaceSections }
      if (group.custom) {
        workspaceSections[workspaceKey] = group.custom.id
        return { workspaceSections }
      }
      delete workspaceSections[workspaceKey]
      return {
        workspaceSections,
        statusOverrides: { ...current.statusOverrides, [workspaceKey]: status!.id }
      }
    })
  }
  return (
    <>
      <div
        ref={attachScroller}
        role="listbox"
        data-worktree-sidebar=""
        tabIndex={0}
        aria-activedescendant={activeRowKey ? getWorktreeOptionId(activeRowKey) : undefined}
        onKeyDown={handleContainerKeyDown}
        className="min-h-0 flex-1 overflow-y-auto worktree-sidebar-scrollbar"
        aria-label={translate(
          'auto.components.maestro.MaestroSidebar.14cd54c3bc',
          'Workspace sections'
        )}
      >
        <VirtualizedList
          rows={virtualRows}
          getRowKey={(row) => row.key}
          scrollElement={scrollElement}
          estimateRowHeightPx={(row) => (row.worktree ? 32 : 28)}
          activeRowKey={activeRowKey}
          minimumRows={0}
          renderRow={(row) => (
            <div
              data-maestro-section={row.group.key}
              onDragOver={(event) => {
                if (
                  event.dataTransfer.types.includes(MAESTRO_WORKSPACE_DRAG) ||
                  event.dataTransfer.types.includes(MAESTRO_SECTION_DRAG)
                ) {
                  event.preventDefault()
                }
              }}
              onDrop={(event) => drop(event, row.group)}
            >
              {row.worktree ? (
                <MaestroWorkspaceRow
                  worktree={row.worktree}
                  rowKey={row.key}
                  isPreviewActive={keyboardPreview ? row.key === activeRowKey : undefined}
                  repo={repoFor(row.worktree)}
                  onActivate={onWorktreeCardClick}
                />
              ) : (
                <MaestroSidebarSection
                  group={row.group}
                  onToggle={() => toggle(row.group)}
                  onEdit={setDialog}
                  onMove={move}
                  onRemove={remove}
                />
              )}
            </div>
          )}
        />
        <Button
          variant="ghost"
          size="sm"
          className="mx-2 shrink-0 justify-start"
          onClick={() => setDialog('new')}
        >
          <Plus className="size-3.5" />
          {translate('auto.components.maestro.MaestroSidebar.a901fe5d72', 'New section')}
        </Button>
      </div>
      {dialog && (
        <MaestroSectionDialog
          section={dialog === 'new' ? null : dialog}
          onClose={() => setDialog(null)}
        />
      )}
    </>
  )
}

export function renderMaestroSidebar(
  settings: GlobalSettings | null,
  worktrees: readonly Worktree[],
  scope: SidebarListModel['visibleScope'],
  onWorktreeCardClick?: () => void
) {
  return conductorSidebarEnabled(settings) ? (
    <MaestroSidebar
      worktrees={worktrees}
      folders={scope.visibleFolderWorkspacesForRows}
      repos={scope.visibleReposForRows}
      onWorktreeCardClick={onWorktreeCardClick}
    />
  ) : null
}
