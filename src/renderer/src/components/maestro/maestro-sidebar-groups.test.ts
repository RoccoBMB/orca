import { expect, it } from 'vitest'
import { referenceWorkspace } from '../sidebar/workspace-card/review/workspace-reference-fixtures.test-support'
import { buildMaestroSidebarGroups } from './maestro-sidebar-groups'

it('places each host copy once, with custom assignment taking precedence over status', () => {
  const local = { ...referenceWorkspace, id: 'same', hostId: 'local' as const }
  const remote = { ...local, hostId: 'ssh:build' as const }
  const groups = buildMaestroSidebarGroups(
    [local, local, remote],
    {
      sections: [{ id: 'crew', name: 'Crew', emoji: '🎻', collapsed: false }],
      workspaceSections: { 'local|same': 'crew' }
    },
    () => 'in-progress'
  )
  expect(groups.map((group) => [group.key, group.items.map((row) => row.hostId)])).toEqual([
    ['in-progress', ['ssh:build']],
    ['crew', ['local']]
  ])
})

it('retains workspaces with removed assignments or unknown statuses in Backlog', () => {
  const groups = buildMaestroSidebarGroups(
    [{ ...referenceWorkspace, id: 'orphan' }],
    {
      workspaceSections: { 'local|orphan': 'deleted-section' },
      sections: [{ id: 'empty', name: 'Empty', emoji: '', collapsed: true }]
    },
    () => 'upstream-custom-status'
  )
  expect(groups.map((group) => [group.key, group.items.map((row) => row.id)])).toEqual([
    ['todo', ['orphan']],
    ['empty', []]
  ])
})

it('projects 500 workspaces across 100 collapsed custom sections', () => {
  const sections = Array.from({ length: 100 }, (_, index) => ({
    id: `section-${index}`,
    name: `Section ${index}`,
    emoji: '',
    collapsed: true
  }))
  const rows = Array.from({ length: 500 }, (_, index) => ({
    ...referenceWorkspace,
    hostId: 'local' as const,
    id: `workspace-${index}`
  }))
  const workspaceSections = Object.fromEntries(
    rows.map((row, index) => [`local|${row.id}`, `section-${index % 100}`])
  )
  const started = performance.now()
  const groups = buildMaestroSidebarGroups(rows, { sections, workspaceSections }, () => 'todo')
  console.info(`500-workspace grouping: ${(performance.now() - started).toFixed(2)}ms`)
  expect(groups).toHaveLength(100)
  expect(groups[99].items.map((row) => row.id)).toEqual([
    'workspace-99',
    'workspace-199',
    'workspace-299',
    'workspace-399',
    'workspace-499'
  ])
})
