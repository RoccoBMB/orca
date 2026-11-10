import { getWorktreeHostIdentity } from '../../../../shared/worktree/host-qualified-identity'
import { useEffect, useState } from 'react'
import { ChevronDown, Plus } from 'lucide-react'
import { useAppStore } from '@/store'
import { useActiveWorktree } from '@/store/workspaces/selection/use-selected-worktree'
import { MaestroSetupPanel } from './MaestroSetupPanel'
import { Button } from '@/components/ui/button'
import { TabBarQuickCommandsButton } from '../tab-bar/TabBarQuickCommandsButton'
import { useMaestroTerminalDock } from './maestro-terminal-dock'
import { translate } from '@/i18n/i18n'

export function MaestroTerminalDock() {
  const worktree = useActiveWorktree()
  const [tab, setTab] = useState<'setup' | 'run' | 'terminal'>('terminal')
  const [selected, setSelected] = useState<Record<string, string>>({})
  const [target, setTarget] = useState<HTMLDivElement | null>(null)
  const [collapsed, setCollapsed] = useState(false)
  const worktreeId = worktree?.id ?? ''
  const workspaceKey = worktree ? getWorktreeHostIdentity(worktree) : ''
  const tabId = selected[workspaceKey]
  const [focusedWorkspace, setFocusedWorkspace] = useState<string | null>(null)
  const inWorkspace = useAppStore((s) =>
    Boolean(tabId && s.groupsByWorktree[worktreeId]?.some((group) => group.activeTabId === tabId))
  )
  const exists = useAppStore(
    (s) => s.tabsByWorktree[worktreeId]?.some((entry) => entry.id === tabId) ?? false
  )
  const leaf = useAppStore((s) => (tabId ? s.terminalLayoutsByTabId[tabId]?.activeLeafId : null))
  const groupId = useAppStore((s) => s.activeGroupIdByWorktree[worktreeId])
  const setPortal = useMaestroTerminalDock((s) => s.setTarget)
  useEffect(() => {
    setPortal(
      target && tabId && leaf && exists && !inWorkspace && !collapsed && tab === 'terminal'
        ? {
            hostId: worktree?.hostId ?? 'local',
            slotId: 'maestro-terminal-dock',
            requestToken: `${worktreeId}:${tabId}`,
            target,
            worktreeId,
            tabId,
            paneKey: `${tabId}:${leaf}`,
            active: focusedWorkspace === workspaceKey
          }
        : null
    )
    return () => setPortal(null)
  }, [
    target,
    tabId,
    leaf,
    exists,
    collapsed,
    tab,
    worktreeId,
    inWorkspace,
    focusedWorkspace,
    workspaceKey,
    worktree?.hostId,
    setPortal
  ])
  if (!worktree) {
    return null
  }
  const openTerminal = () => {
    const state = useAppStore.getState()
    const shell = state.createTab(worktreeId, undefined, undefined, { activate: false })
    setSelected((current) => ({ ...current, [workspaceKey]: shell.id }))
    setCollapsed(false)
    setTab('terminal')
  }
  return (
    <div
      className="maestro-terminal-dock flex shrink-0 flex-col border-t border-border"
      data-collapsed={collapsed}
      onFocusCapture={() => setFocusedWorkspace(workspaceKey)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setFocusedWorkspace(null)
        }
      }}
    >
      <div className="flex h-9 shrink-0 items-center gap-1 border-b border-border px-2">
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label={
            collapsed
              ? translate(
                  'auto.components.maestro.MaestroTerminalDock.1245c75489',
                  'Expand terminal panel'
                )
              : translate(
                  'auto.components.maestro.MaestroTerminalDock.19f8d1bbfb',
                  'Collapse terminal panel'
                )
          }
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronDown className="size-3.5" />
        </Button>
        {(['setup', 'run', 'terminal'] as const).map((id) => (
          <span
            key={id}
            className={tab === id ? 'maestro-dock-tab-active' : 'text-muted-foreground'}
          >
            <Button
              size="sm"
              variant="ghost"
              aria-pressed={tab === id}
              onClick={() => {
                setTab(id)
                setCollapsed(false)
              }}
            >
              {id === 'setup'
                ? translate('auto.components.maestro.MaestroTerminalDock.ec91b24737', 'Setup')
                : id === 'run'
                  ? translate('auto.components.maestro.MaestroTerminalDock.8e1855145e', 'Run')
                  : translate('auto.components.maestro.MaestroTerminalDock.6fb93576c5', 'Terminal')}
            </Button>
          </span>
        ))}
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label={translate(
            'auto.components.maestro.MaestroTerminalDock.ca8f1e43d6',
            'Open workspace terminal'
          )}
          onClick={openTerminal}
        >
          <Plus className="size-3.5" />
        </Button>
      </div>
      {!collapsed && (
        <div className="relative min-h-0 flex-1 overflow-hidden">
          <div
            ref={setTarget}
            className={tab === 'terminal' && exists && !inWorkspace ? 'absolute inset-0' : 'hidden'}
          />
          {tab === 'terminal' && (!exists || inWorkspace) && (
            <div className="p-3">
              <Button variant="outline" size="sm" onClick={openTerminal}>
                {inWorkspace
                  ? translate(
                      'auto.components.maestro.MaestroTerminalDock.17c55827b2',
                      'Open another terminal'
                    )
                  : translate(
                      'auto.components.maestro.MaestroTerminalDock.c29ab57329',
                      'Open terminal'
                    )}
              </Button>
            </div>
          )}
          {tab === 'run' && (
            <div className="h-full min-h-0">
              {groupId && (
                <TabBarQuickCommandsButton
                  worktreeId={worktreeId}
                  groupId={groupId}
                  isFocused={false}
                  presentation="panel"
                />
              )}
            </div>
          )}
          {tab === 'setup' && <MaestroSetupPanel />}
        </div>
      )}
    </div>
  )
}
