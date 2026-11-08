import { useUiLanguageRevision } from '@/i18n/use-ui-language-revision'
import { useCallback, useMemo, useRef, useState, type DragEvent } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store'
import { MaestroSectionDialog } from './MaestroSectionDialog'
import { useMaestroSettings } from './use-maestro-settings'
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
  conductorAppearanceEnabled,
  type MaestroSection
} from '../../../../shared/maestro-settings'
import { getWorktreeHostIdentity } from '../../../../shared/worktree/host-qualified-identity'
import { folderWorkspaceToWorktree } from '../../../../shared/folder-workspaces/folder-workspace-worktree'
import { getRepoExecutionHostId } from '../../../../shared/execution-host'
import { useWorktreeListKeyboardNavigation } from '../sidebar/worktree-list/navigation/use-keyboard'
import type { HostSectionRow } from '../../../../shared/sidebar-list/host-section-rows'
import { getPinnedWorktreeDisplayPolicy } from '../../../../shared/sidebar-list/row-types'
import { getWorktreeOptionId } from '../sidebar/worktree-list/rows/option-dom'
import type { Worktree } from '../../../../shared/worktree/types'
import type { Repo } from '../../../../shared/repo-types'
import type { FolderWorkspace } from '../../../../shared/folder-workspaces/folder-workspace-types'
import type { GlobalSettings } from '../../../../shared/global-settings-types'
import type { SidebarListModel } from '../sidebar/worktree-list/listing/sidebar-list-model'
import { useMaestroSidebarGroups } from './use-maestro-sidebar-groups'
import { useMaestroSidebarReveal } from './use-maestro-sidebar-reveal'
import { useSidebarWorktreeSelection } from '../sidebar/worktree-list/navigation/use-selection'
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
  const appearance = conductorAppearanceEnabled(settings)
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
  const allGroups = useMaestroSidebarGroups(rows, repoByHost, maestro)
  const virtualRows: VirtualRow[] = useMemo(
    () =>
      allGroups.flatMap((group) => [
        { key: group.key, group },
        ...(group.collapsed
          ? []
          : group.items.map((worktree) => ({
              key: `${group.key}:${getWorktreeHostIdentity(worktree)}`,
              group,
              worktree
            })))
      ]),
    [allGroups]
  )
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
  useSidebarWorktreeSelection({
    sectionRows: navigationRows,
    pinnedDisplayPolicy: 'single-location'
  })
  const { revealRow, highlightedRevealRowKey } = useMaestroSidebarReveal(allGroups, scrollRef)
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
          estimateRowHeightPx={(row) => (appearance ? 38 : row.worktree ? 32 : 28)}
          activeRowKey={activeRowKey}
          revealRow={revealRow}
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
                  revealHighlight={row.key === highlightedRevealRowKey}
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
