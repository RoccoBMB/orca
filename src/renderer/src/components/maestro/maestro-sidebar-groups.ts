import { MAESTRO_STATUSES, type MaestroSettings } from '../../../../shared/maestro-settings'
import type { Worktree, WorkspaceStatus } from '../../../../shared/worktree/types'
import { getWorktreeHostIdentity } from '../../../../shared/worktree/host-qualified-identity'
import type { MaestroSidebarGroup } from './MaestroSidebarSection'

export function buildMaestroSidebarGroups(
  rows: readonly Worktree[],
  settings: MaestroSettings | undefined,
  statusFor: (worktree: Worktree) => WorkspaceStatus
): MaestroSidebarGroup[] {
  const statuses: MaestroSidebarGroup[] = MAESTRO_STATUSES.map((status) => ({
    key: status.id,
    label: status.label,
    items: [],
    collapsed: settings?.collapsedSections?.includes(status.id) ?? false
  }))
  const custom: MaestroSidebarGroup[] = (settings?.sections ?? []).map((section) => ({
    key: section.id,
    label: section.name,
    items: [],
    collapsed: section.collapsed,
    custom: section
  }))
  const seen = new Set<string>()
  for (const row of rows) {
    const identity = getWorktreeHostIdentity(row)
    if (seen.has(identity)) {
      continue
    }
    seen.add(identity)
    const assignment = settings?.workspaceSections?.[identity]
    const assigned = custom.find((group) => group.key === assignment)
    const status = assigned ? undefined : statusFor(row)
    const group =
      assigned ??
      statuses.find((group) => group.key === status) ??
      statuses.find((group) => group.key === 'todo')
    group?.items.push(row)
  }
  return [...statuses.filter((group) => group.items.length > 0), ...custom]
}
