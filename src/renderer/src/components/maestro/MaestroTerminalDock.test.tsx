// @vitest-environment happy-dom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { useAppStore } from '@/store'
import type { AppState } from '@/store/types'
import { MaestroTerminalDock } from './MaestroTerminalDock'
import { useMaestroTerminalDock } from './maestro-terminal-dock'

vi.mock('@/store', async () => {
  const { create } = await import('zustand')
  // oxlint-disable-next-line typescript/consistent-type-assertions -- SAFETY: each test seeds all fields this dock reads.
  return { useAppStore: create<AppState>(() => ({}) as AppState) }
})
vi.mock('@/store/workspaces/selection/use-selected-worktree', () => ({
  useActiveWorktree: () => ({
    id: 'repo:feature',
    repoId: 'repo',
    hostId: 'local',
    path: '/fixture'
  })
}))
vi.mock('@/store/repos/use-repository-catalog', () => ({ useRepoById: () => null }))
vi.mock('../tab-bar/TabBarQuickCommandsButton', () => ({ TabBarQuickCommandsButton: () => null }))

const createTab = vi.fn(() => {
  useAppStore.setState({
    tabsByWorktree: {
      'repo:feature': [
        {
          id: 'dock',
          worktreeId: 'repo:feature',
          title: 'Terminal',
          ptyId: null,
          customTitle: null,
          color: null,
          sortOrder: 0,
          createdAt: 1
        }
      ]
    },
    terminalLayoutsByTabId: {
      dock: {
        root: { type: 'leaf', leafId: 'dock-leaf' },
        activeLeafId: 'dock-leaf',
        expandedLeafId: null
      }
    }
  })
  return {
    id: 'dock',
    worktreeId: 'repo:feature',
    title: 'Terminal',
    ptyId: null,
    customTitle: null,
    color: null,
    sortOrder: 0,
    createdAt: 1
  }
})
beforeEach(() => {
  createTab.mockClear()
  useAppStore.setState({
    tabsByWorktree: {},
    terminalLayoutsByTabId: {},
    groupsByWorktree: {
      'repo:feature': [
        {
          id: 'main',
          worktreeId: 'repo:feature',
          activeTabId: 'chat',
          tabOrder: ['chat'],
          recentTabIds: ['chat']
        }
      ]
    },
    activeGroupIdByWorktree: { 'repo:feature': 'main' }
  })
  useAppStore.setState({ createTab })
})
afterEach(() => {
  cleanup()
  useMaestroTerminalDock.getState().setTarget(null)
})

it('creates a separate background terminal, releases its portal when selected in the workspace, and restores it after returning to chat', async () => {
  render(<MaestroTerminalDock />)
  fireEvent.click(screen.getByRole('button', { name: 'Open terminal' }))
  expect(createTab).toHaveBeenCalledWith('repo:feature', undefined, undefined, { activate: false })
  await waitFor(() => expect(useMaestroTerminalDock.getState().target?.tabId).toBe('dock'))
  expect(useMaestroTerminalDock.getState().target?.active).toBe(false)
  act(() =>
    useAppStore.setState({
      groupsByWorktree: {
        'repo:feature': [
          {
            id: 'main',
            worktreeId: 'repo:feature',
            activeTabId: 'dock',
            tabOrder: ['chat', 'dock'],
            recentTabIds: ['chat', 'dock']
          }
        ]
      }
    })
  )
  await waitFor(() => expect(useMaestroTerminalDock.getState().target).toBeNull())
  act(() =>
    useAppStore.setState({
      groupsByWorktree: {
        'repo:feature': [
          {
            id: 'main',
            worktreeId: 'repo:feature',
            activeTabId: 'chat',
            tabOrder: ['chat', 'dock'],
            recentTabIds: ['dock', 'chat']
          }
        ]
      }
    })
  )
  await waitFor(() => expect(useMaestroTerminalDock.getState().target?.tabId).toBe('dock'))
  fireEvent.click(screen.getByRole('button', { name: 'Collapse terminal panel' }))
  expect(useMaestroTerminalDock.getState().target).toBeNull()
})
