import { useUiLanguageRevision } from '@/i18n/use-ui-language-revision'
import { Home, LayoutDashboard, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HostCombobox } from '@/components/host-picker/HostCombobox'
import { useMemo } from 'react'
import { expandEquivalentExecutionHostIds } from '../../../../shared/managed-orcad-execution-host'
import { getHostDisplayLabelOverrides } from '../../../../shared/host-setting-overrides'
import { buildKnownExecutionHostRegistry } from '../../../../shared/execution-host-registry'
import { buildSidebarHostScopeOptions } from '../sidebar/worktree-list/controls/sidebar-host-options'
import { useAppStore } from '@/store'
import { openWorkspaceCreationComposerWithTourHandoff } from '../contextual-tours/workspace-creation-tour-handoff'
import { translate } from '@/i18n/i18n'

export function MaestroNavigation() {
  useUiLanguageRevision()
  const repos = useAppStore((s) => s.repos)
  const sshTargetLabels = useAppStore((s) => s.sshTargetLabels)
  const sshConnectionStates = useAppStore((s) => s.sshConnectionStates)
  const runtimeEnvironments = useAppStore((s) => s.runtimeEnvironments)
  const runtimeStatusByEnvironmentId = useAppStore((s) => s.runtimeStatusByEnvironmentId)
  const settings = useAppStore((s) => s.settings)
  const hostLabelOverrides = useMemo(() => getHostDisplayLabelOverrides(settings), [settings])
  const registry = useMemo(
    () =>
      buildKnownExecutionHostRegistry({
        repos,
        sshTargetLabels,
        sshConnectionStates,
        runtimeEnvironments,
        runtimeStatusByEnvironmentId,
        hostLabelOverrides
      }),
    [
      repos,
      sshTargetLabels,
      sshConnectionStates,
      runtimeEnvironments,
      runtimeStatusByEnvironmentId,
      hostLabelOverrides
    ]
  )
  const hostScopeOptions = useMemo(() => buildSidebarHostScopeOptions(registry), [registry])
  const scope = useAppStore((s) => s.workspaceHostScope)
  const setScope = useAppStore((s) => s.setWorkspaceHostScope)
  const setVisibleHosts = useAppStore((s) => s.setVisibleWorkspaceHostIds)
  const setView = useAppStore((s) => s.setActiveView)
  const setSidebarBody = useAppStore((s) => s.setSidebarBody)
  return (
    <>
      <HostCombobox
        value={scope}
        options={hostScopeOptions}
        size="sm"
        className="border-0 bg-transparent shadow-none text-worktree-sidebar-foreground"
        placeholder={translate('auto.components.maestro.MaestroNavigation.0fd2c6b21f', 'All hosts')}
        onChange={(id) => {
          const option = hostScopeOptions.find((host) => host.id === id)
          if (option) {
            setScope(option.id)
            if (option.id !== 'all') {
              setVisibleHosts(expandEquivalentExecutionHostIds(registry, [option.id]))
            }
          }
        }}
      />
      <Button
        variant="ghost"
        className="justify-start"
        size="sm"
        onClick={() => {
          setView('activity')
          setSidebarBody('agents')
        }}
      >
        <LayoutDashboard className="size-4" />
        {translate('auto.components.maestro.MaestroNavigation.5dcc8763a4', 'Dashboard')}
      </Button>
      <Button
        variant="ghost"
        className="justify-start"
        size="sm"
        onClick={() => {
          setView('terminal')
          setSidebarBody('workspaces')
        }}
      >
        <Home className="size-4" />
        {translate('auto.components.maestro.MaestroNavigation.c04ad93ca2', 'Home')}
      </Button>
      <Button
        variant="ghost"
        className="justify-start"
        size="sm"
        onClick={() => openWorkspaceCreationComposerWithTourHandoff()}
      >
        <Plus className="size-4" />
        {translate('auto.components.maestro.MaestroNavigation.c6513675f2', 'Create')}
      </Button>
    </>
  )
}
