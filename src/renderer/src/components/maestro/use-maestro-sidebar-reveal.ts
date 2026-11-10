import { useEffect, useMemo, type RefObject } from 'react'
import { useAppStore } from '@/store'
import type {
  PendingSidebarWorktreeReveal,
  PendingSidebarRowReveal
} from '@/store/slices/ui/ui-slice-contract-core'
import type { ExecutionHostId } from '../../../../shared/execution-host'
import { getWorktreeHostIdentity } from '../../../../shared/worktree/host-qualified-identity'
import { useMaestroSettings } from './use-maestro-settings'
import type { MaestroSidebarGroup } from './MaestroSidebarSection'
import { useSidebarRevealHighlight } from '../sidebar/worktree-list/navigation/use-reveal-highlight'
import { revealMountedSidebarRowElement } from '../sidebar/worktree-list/navigation/mounted-row-reveal'

function findRevealTarget(
  groups: readonly MaestroSidebarGroup[],
  request: PendingSidebarWorktreeReveal | null,
  rowRequest: PendingSidebarRowReveal | null,
  activeHost: ExecutionHostId | null
) {
  if (!request && !rowRequest) {
    return undefined
  }
  for (const group of groups) {
    for (const worktree of group.items) {
      const rowKey = `${group.key}:${getWorktreeHostIdentity(worktree)}`
      if (
        request
          ? worktree.id === request.worktreeId &&
            (worktree.hostId ?? 'local') === (request.executionHostId ?? activeHost ?? 'local')
          : rowRequest?.rowKey === rowKey
      ) {
        return { group, worktree, rowKey }
      }
    }
  }
  return undefined
}

export function useMaestroSidebarReveal(
  groups: readonly MaestroSidebarGroup[],
  scrollRef: RefObject<HTMLDivElement | null>
) {
  const request = useAppStore((state) => state.pendingRevealWorktree)
  const rowRequest = useAppStore((state) => state.pendingRevealSidebarRow)
  const activeHost = useAppStore((state) => state.activeWorkspaceExecutionHostId)
  const { updateMaestro } = useMaestroSettings()
  const {
    highlightedRevealRowKey,
    flashRevealedRow,
    clearRevealHighlightFrame,
    clearRevealHighlightTimeout
  } = useSidebarRevealHighlight()
  useEffect(
    () => () => {
      clearRevealHighlightFrame()
      clearRevealHighlightTimeout()
    },
    [clearRevealHighlightFrame, clearRevealHighlightTimeout]
  )
  const target = useMemo(
    () => findRevealTarget(groups, request, rowRequest, activeHost),
    [groups, request, rowRequest, activeHost]
  )
  const reveal = useMemo(
    () => (target && !target.group.collapsed ? { rowKey: target.rowKey } : undefined),
    [target]
  )

  useEffect(() => {
    if (!target?.group.collapsed) {
      return
    }
    const group = target.group
    void updateMaestro((current) =>
      group.custom
        ? {
            sections: current.sections?.map((section) =>
              section.id === group.key ? { ...section, collapsed: false } : section
            )
          }
        : { collapsedSections: current.collapsedSections?.filter((key) => key !== group.key) }
    )
  }, [target, updateMaestro])

  useEffect(() => {
    if (!reveal || !target) {
      return
    }
    let frame = 0
    let attempts = 0
    const finish = () => {
      const state = useAppStore.getState()
      if (
        request
          ? state.pendingRevealWorktree !== request
          : state.pendingRevealSidebarRow !== rowRequest
      ) {
        return
      }
      const container = scrollRef.current
      const element =
        container &&
        revealMountedSidebarRowElement(
          container,
          reveal.rowKey,
          (request ?? rowRequest)?.behavior ?? 'auto'
        )
      if (!element) {
        attempts += 1
        if (attempts < 12) {
          frame = requestAnimationFrame(finish)
        }
        return
      }
      if (request?.beginRename) {
        state.setRenamingWorktreeId({ worktreeId: target.worktree.id, rowKey: reveal.rowKey })
      }
      if ((request ?? rowRequest)?.highlight) {
        flashRevealedRow(reveal.rowKey)
      }
      if (request) {
        state.clearPendingRevealWorktreeId(request)
      } else if (rowRequest) {
        state.clearPendingRevealSidebarRow(rowRequest)
      }
    }
    frame = requestAnimationFrame(finish)
    return () => cancelAnimationFrame(frame)
  }, [reveal, target, request, rowRequest, scrollRef, flashRevealedRow])
  return { revealRow: reveal, highlightedRevealRowKey }
}
