import { useUiLanguageRevision } from '@/i18n/use-ui-language-revision'
import { ChevronDown, Home, LayoutDashboard, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useAppStore } from '@/store'
import { useSidebarHostScopeOptions } from '../sidebar/worktree-list/controls/use-sidebar-host-scope-options'
import { openWorkspaceCreationComposerWithTourHandoff } from '../contextual-tours/workspace-creation-tour-handoff'
import { translate } from '@/i18n/i18n'

export function MaestroNavigation() {
  useUiLanguageRevision()
  const { hostScopeOptions } = useSidebarHostScopeOptions()
  const scope = useAppStore((s) => s.workspaceHostScope)
  const setScope = useAppStore((s) => s.setWorkspaceHostScope)
  const setVisibleHosts = useAppStore((s) => s.setVisibleWorkspaceHostIds)
  const setView = useAppStore((s) => s.setActiveView)
  const setSidebarBody = useAppStore((s) => s.setSidebarBody)
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between text-worktree-sidebar-foreground"
            size="sm"
          >
            {hostScopeOptions.find((host) => host.id === scope)?.label ??
              translate('auto.components.maestro.MaestroNavigation.0fd2c6b21f', 'All hosts')}
            <ChevronDown className="size-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {hostScopeOptions.map((host) => (
            <DropdownMenuItem
              key={host.id}
              onSelect={() => {
                setVisibleHosts(null)
                setScope(host.id)
              }}
            >
              {host.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
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
