import type { ExecutionHostId } from '../../../../shared/execution-host'
import { create } from 'zustand'
import type { ActivityTerminalPortalTarget } from '../activity/activity-terminal-portal'

export const useMaestroTerminalDock = create<{
  target: (ActivityTerminalPortalTarget & { hostId: ExecutionHostId }) | null
  setTarget: (target: (ActivityTerminalPortalTarget & { hostId: ExecutionHostId }) | null) => void
}>((set) => ({ target: null, setTarget: (target) => set({ target }) }))
