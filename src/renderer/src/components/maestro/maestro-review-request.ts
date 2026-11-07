import { create } from 'zustand'

export type MaestroReviewRequest = { workspaceKey: string; action: 'create' | 'draft' | 'push' }

export const useMaestroReviewRequest = create<{
  request: MaestroReviewRequest | null
  setRequest: (request: MaestroReviewRequest | null) => void
}>((set) => ({ request: null, setRequest: (request) => set({ request }) }))
