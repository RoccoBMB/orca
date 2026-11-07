// @vitest-environment happy-dom
import React from 'react'
import { act, cleanup, render, renderHook, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { useAppStore } from '@/store'
import type { AppState } from '@/store/types'
import { createGlobalSettingsFixture } from '../../../../shared/global-settings-test-fixture'
import { referenceWorkspace } from '../sidebar/workspace-card/review/workspace-reference-fixtures.test-support'
import { getPublishedVisibleWorktreeShortcutTargets } from '../sidebar/worktree-list/listing/visible-worktrees'
import { useMaestroSidebarGroups } from './use-maestro-sidebar-groups'
import { MaestroSidebar } from './MaestroSidebar'
import type * as MaestroSidebarSectionModule from './MaestroSidebarSection'
import { getWorktreeOptionId } from '../sidebar/worktree-list/rows/option-dom'
import type { Worktree } from '../../../../shared/worktree/types'

vi.mock('@/store', async () => {
  const { create } = await import('zustand')
  // oxlint-disable-next-line typescript/consistent-type-assertions -- SAFETY: beforeEach supplies every store field consumed by this isolated sidebar.
  return { useAppStore: create<AppState>(() => ({}) as AppState) }
})
vi.mock('@/i18n/use-ui-language-revision', () => ({ useUiLanguageRevision: () => {} }))
vi.mock('./MaestroSectionDialog', () => ({ MaestroSectionDialog: () => null }))
vi.mock('../sidebar/worktree-list/navigation/use-keyboard', () => ({
  useWorktreeListKeyboardNavigation: () => ({
    handleContainerKeyDown: () => {},
    keyboardPreview: null
  })
}))
vi.mock('@/components/virtualized-list', () => ({
  VirtualizedList: ({
    rows,
    renderRow,
    getRowKey
  }: {
    rows: unknown[]
    renderRow: (row: unknown) => React.ReactNode
    getRowKey: (row: unknown) => string
  }) => (
    <>
      {rows.map((row) => (
        <React.Fragment key={getRowKey(row)}>{renderRow(row)}</React.Fragment>
      ))}
    </>
  )
}))
vi.mock('./MaestroSidebarSection', async (original) => ({
  ...(await original<typeof MaestroSidebarSectionModule>()),
  MaestroSidebarSection: () => null
}))
vi.mock('./MaestroWorkspaceRow', () => ({
  MaestroWorkspaceRow: ({ worktree, rowKey }: { worktree: Worktree; rowKey: string }) => (
    <div id={getWorktreeOptionId(rowKey)} role="option" data-worktree-id={worktree.id}>
      <div data-worktree-card-surface="">{worktree.displayName}</div>
    </div>
  )
}))

const local = {
  ...referenceWorkspace,
  id: 'same',
  displayName: 'Local',
  hostId: 'local' as const,
  workspaceStatus: 'todo'
}
const remote = {
  ...local,
  displayName: 'Remote',
  hostId: 'ssh:build' as const,
  workspaceStatus: 'in-progress'
}
const review = { ...local, id: 'review', displayName: 'Review', workspaceStatus: 'in-review' }
const worktrees = [local, remote, review]
const empty: [] = []

beforeEach(() => {
  useAppStore.setState({
    settings: {
      ...createGlobalSettingsFixture(),
      maestro: {
        conductorSidebar: true,
        collapsedSections: ['todo'],
        sections: [{ id: 'crew', name: 'Crew', emoji: '', collapsed: true }],
        workspaceSections: { 'ssh:build|same': 'crew' }
      }
    },
    prCache: {},
    hostedReviewCache: {},
    activeWorktreeId: 'same',
    activeWorkspaceExecutionHostId: 'ssh:build',
    activeModal: 'none',
    pendingRevealWorktree: null,
    pendingRevealSidebarRow: null,
    updateSettingsOrThrow: async (settings) => {
      useAppStore.setState({
        settings: createGlobalSettingsFixture({ ...useAppStore.getState().settings, ...settings })
      })
    },
    clearPendingRevealWorktreeId: (expected) => {
      if (useAppStore.getState().pendingRevealWorktree === expected) {
        useAppStore.setState({ pendingRevealWorktree: null })
      }
    },
    clearPendingRevealSidebarRow: (expected) => {
      if (useAppStore.getState().pendingRevealSidebarRow === expected) {
        useAppStore.setState({ pendingRevealSidebarRow: null })
      }
    },
    setRenamingWorktreeId: vi.fn()
  })
  HTMLElement.prototype.scrollTo = vi.fn()
})
afterEach(cleanup)

it('publishes Maestro section order, omitting collapsed status and custom sections', async () => {
  render(<MaestroSidebar worktrees={worktrees} repos={empty} folders={empty} />)
  expect(getPublishedVisibleWorktreeShortcutTargets()).toEqual([
    { id: 'review', executionHostId: 'local' }
  ])
  await act(async () => {
    await useAppStore.getState().updateSettingsOrThrow({
      maestro: {
        ...useAppStore.getState().settings?.maestro,
        collapsedSections: [],
        sections: [{ id: 'crew', name: 'Crew', emoji: '', collapsed: false }]
      }
    })
  })
  expect(getPublishedVisibleWorktreeShortcutTargets()).toEqual([
    { id: 'review', executionHostId: 'local' },
    { id: 'same', executionHostId: 'local' },
    { id: 'same', executionHostId: 'ssh:build' }
  ])
})

it('reveals the requested host copy by expanding its custom section and consuming the request', async () => {
  render(<MaestroSidebar worktrees={worktrees} repos={empty} folders={empty} />)
  act(() =>
    useAppStore.setState({
      pendingRevealWorktree: {
        worktreeId: 'same',
        executionHostId: 'ssh:build',
        behavior: 'auto',
        beginRename: true
      }
    })
  )
  await waitFor(() =>
    expect(
      screen.queryByRole('option', { name: 'Remote' }) ?? screen.queryByText('Remote')
    ).not.toBeNull()
  )
  await waitFor(() => expect(useAppStore.getState().pendingRevealWorktree).toBeNull())
  expect(screen.queryByText('Local')).toBeNull()
  expect(useAppStore.getState().setRenamingWorktreeId).toHaveBeenCalledWith({
    worktreeId: 'same',
    rowKey: 'crew:ssh:build|same'
  })
})

it('reveals a collapsed status section for a repeated request to the current row', async () => {
  render(<MaestroSidebar worktrees={worktrees} repos={empty} folders={empty} />)
  for (let attempt = 0; attempt < 2; attempt++) {
    act(() =>
      useAppStore.setState({
        pendingRevealWorktree: { worktreeId: 'same', executionHostId: 'local', behavior: 'auto' }
      })
    )
    await waitFor(() => expect(screen.queryByText('Local')).not.toBeNull())
    await waitFor(() => expect(useAppStore.getState().pendingRevealWorktree).toBeNull())
  }
})

it('retains the 500-workspace projection through unrelated review-cache and active-row updates', () => {
  const rows = Array.from({ length: 500 }, (_, index) => ({ ...local, id: `workspace-${index}` }))
  const repos = new Map()
  const maestro = useAppStore.getState().settings?.maestro
  const { result, rerender } = renderHook(() => useMaestroSidebarGroups(rows, repos, maestro))
  const groups = result.current
  act(() =>
    useAppStore.setState({
      prCache: { unrelated: { data: null, fetchedAt: 1 } },
      activeWorktreeId: 'workspace-499'
    })
  )
  rerender()
  expect(result.current).toBe(groups)
  expect(result.current[0].items).toHaveLength(500)
})
