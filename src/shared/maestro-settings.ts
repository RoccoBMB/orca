import { z } from 'zod'
import { branding } from './branding'

export const MAESTRO_STATUSES = [
  { id: 'completed', label: 'Done' },
  { id: 'in-review', label: 'In review' },
  { id: 'in-progress', label: 'In progress' },
  { id: 'todo', label: 'Backlog' },
  { id: 'canceled', label: 'Canceled' }
] as const

export const MaestroSettingsSchema = z.object({
  conductorAppearance: z.boolean().optional(),
  showOnboarding: z.boolean().optional(),
  showTasks: z.boolean().optional(),
  showAutomations: z.boolean().optional(),
  showMobile: z.boolean().optional(),
  showStatusBar: z.boolean().optional(),
  conductorSidebar: z.boolean().optional(),
  sections: z
    .array(
      z.object({
        id: z.string().min(1).max(128),
        name: z.string().trim().min(1).max(80),
        emoji: z.string().max(16),
        collapsed: z.boolean()
      })
    )
    .max(100)
    .optional(),
  workspaceSections: z.record(z.string(), z.string()).optional(),
  statusOverrides: z
    .record(z.string(), z.enum(['completed', 'in-review', 'in-progress', 'todo', 'canceled']))
    .optional(),
  collapsedSections: z.array(z.string()).optional(),
  lastOpenInAppId: z.string().optional()
})

export type MaestroSettings = z.infer<typeof MaestroSettingsSchema>
export type MaestroSection = NonNullable<MaestroSettings['sections']>[number]

export function conductorSidebarEnabled(
  settings: { maestro?: MaestroSettings } | null | undefined
): boolean {
  return settings?.maestro?.conductorSidebar ?? branding.conductorLayoutDefault
}

export function conductorAppearanceEnabled(
  settings: { maestro?: MaestroSettings } | null | undefined
): boolean {
  return settings?.maestro?.conductorAppearance ?? branding.conductorLayoutDefault
}

export function maestroFeatureVisible(
  settings: { maestro?: MaestroSettings } | null | undefined,
  feature: 'showOnboarding' | 'showTasks' | 'showAutomations' | 'showMobile' | 'showStatusBar'
): boolean {
  return !conductorAppearanceEnabled(settings) || settings?.maestro?.[feature] === true
}
