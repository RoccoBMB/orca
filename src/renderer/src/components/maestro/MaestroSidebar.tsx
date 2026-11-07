import { useUiLanguageRevision } from '@/i18n/use-ui-language-revision'
import { useMemo, useState, type DragEvent } from 'react'
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
import type { Worktree } from '../../../../shared/worktree/types'
import type { Repo } from '../../../../shared/repo-types'
import type { FolderWorkspace } from '../../../../shared/folder-workspaces/folder-workspace-types'
import type { ProjectGroup } from '../../../../shared/project-group-types'
import type { GlobalSettings } from '../../../../shared/global-settings-types'
import type { SidebarListModel } from '../sidebar/worktree-list/listing/sidebar-list-model'
import { translate } from '@/i18n/i18n'

type VirtualRow = { key: string; group: MaestroSidebarGroup; worktree?: Worktree }

type Props = {
  worktrees: readonly Worktree[]
  folders: readonly FolderWorkspace[]
  repos: readonly Repo[]
  projectGroups: readonly ProjectGroup[]
  onWorktreeCardClick?: () => void
}

export function MaestroSidebar({
  worktrees,
  folders,
  repos,
  projectGroups,
  onWorktreeCardClick
}: Props) {
  useUiLanguageRevision()
  const { maestro, updateMaestro } = useMaestroSettings()
  const settings = useAppStore((s) => s.settings)
  const prCache = useAppStore((s) => s.prCache)
  const reviewCache = useAppStore((s) => s.hostedReviewCache)
  const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(null)
  const [dialog, setDialog] = useState<MaestroSection | 'new' | null>(null)
  const rows = useMemo(
    () => [...worktrees, ...folders.map(folderWorkspaceToWorktree)],
    [worktrees, folders]
  )
  const sections = maestro?.sections ?? []
  const repoByHost = useMemo(
    () => new Map(repos.map((repo) => [`${getRepoExecutionHostId(repo)}|${repo.id}`, repo])),
    [repos]
  )
  const repoFor = (worktree: Worktree): Repo | undefined =>
    repoByHost.get(`${worktree.hostId ?? 'local'}|${worktree.repoId}`)
  const groups: MaestroSidebarGroup[] = MAESTRO_STATUSES.map((status) => ({
    key: status.id,
    label: status.label,
    items: [],
    collapsed: maestro?.collapsedSections?.includes(status.id) ?? false
  }))
  const customGroups: MaestroSidebarGroup[] = sections.map((section) => ({
    key: section.id,
    label: section.name,
    items: [],
    collapsed: section.collapsed,
    custom: section
  }))
  const groupsByKey = new Map([...groups, ...customGroups].map((group) => [group.key, group]))
  for (const row of rows) {
    const section = maestro?.workspaceSections?.[getWorktreeHostIdentity(row)]
    let group = section ? customGroups.find((group) => group.key === section) : undefined
    if (!group) {
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
      const status = maestroWorkspaceStatus(row, review ?? pr, maestro?.statusOverrides)
      const statusGroup = groupsByKey.get(status) ?? groupsByKey.get('todo')
      if (statusGroup) {
        statusGroup.items.push(row)
      }
    } else {
      group.items.push(row)
    }
  }
  const projectGroupsForRows: MaestroSidebarGroup[] = projectGroups.map((group) => ({
    key: `group:${group.id}`,
    label: group.name,
    items: rows.filter(
      (row) =>
        repoFor(row)?.projectGroupId === group.id ||
        folders.some(
          (folder) => `folder:${folder.id}` === row.id && folder.projectGroupId === group.id
        )
    ),
    collapsed: maestro?.collapsedSections?.includes(`group:${group.id}`) ?? false
  }))
  const repoGroups: MaestroSidebarGroup[] = repos
    .filter((repo) => !repo.projectGroupId)
    .map((repo) => ({
      key: `repo:${getRepoExecutionHostId(repo)}|${repo.id}`,
      label: repo.displayName,
      items: rows.filter((row) => repoFor(row) === repo),
      collapsed:
        maestro?.collapsedSections?.includes(`repo:${getRepoExecutionHostId(repo)}|${repo.id}`) ??
        false
    }))
  const allGroups = [
    ...groups.map((group) => groupsByKey.get(group.key) ?? group),
    ...customGroups,
    ...projectGroupsForRows,
    ...repoGroups
  ]
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
        ref={setScrollElement}
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
          estimateRowHeightPx={(row) => (row.worktree ? 76 : 36)}
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
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="mx-2 shrink-0 justify-start text-muted-foreground"
        onClick={() => setDialog('new')}
      >
        <Plus className="size-3.5" />
        {translate('auto.components.maestro.MaestroSidebar.a901fe5d72', 'New section')}
      </Button>
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
      projectGroups={scope.visibleProjectGroupsForRows}
      onWorktreeCardClick={onWorktreeCardClick}
    />
  ) : null
}
