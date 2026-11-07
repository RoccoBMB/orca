import { expect, it } from 'vitest'
import { maestroWorkspaceStatus } from './maestro-workspace-status'

const workspace = { id: 'same', hostId: 'local' as const, head: 'new-head', isArchived: false }

it('keeps a manual status override on its owning host copy', () => {
  const overrides = { 'ssh:build|same': 'canceled' as const }
  expect(maestroWorkspaceStatus({ ...workspace, hostId: 'ssh:build' }, null, overrides)).toBe(
    'canceled'
  )
  expect(maestroWorkspaceStatus(workspace, null, overrides)).toBe('todo')
})

it('does not complete a workspace from a merged review of an earlier head', () => {
  expect(maestroWorkspaceStatus(workspace, { state: 'merged', headSha: 'old-head' }, {})).toBe(
    'todo'
  )
  expect(maestroWorkspaceStatus(workspace, { state: 'merged', headSha: 'new-head' }, {})).toBe(
    'completed'
  )
})

it('keeps a working agent in progress even while its review is open', () => {
  expect(
    maestroWorkspaceStatus({ ...workspace, smartTier: 'working' }, { state: 'open' }, {})
  ).toBe('in-progress')
  expect(maestroWorkspaceStatus({ ...workspace, smartTier: 'needs-you' }, null, {})).toBe(
    'in-review'
  )
})
