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
