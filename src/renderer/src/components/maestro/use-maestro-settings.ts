import { toast } from 'sonner'
import { useAppStore } from '@/store'
import type { MaestroSettings } from '../../../../shared/maestro-settings'
import { translate } from '@/i18n/i18n'

type Change = Partial<MaestroSettings> | ((current: MaestroSettings) => Partial<MaestroSettings>)
let writes: Promise<void> = Promise.resolve()

export async function updateMaestroSettings(change: Change): Promise<boolean> {
  const write = writes.then(async () => {
    const state = useAppStore.getState()
    const current = state.settings?.maestro ?? {}
    const updates = typeof change === 'function' ? change(current) : change
    await state.updateSettingsOrThrow({ maestro: { ...current, ...updates } })
  })
  writes = write.catch(() => {})
  try {
    await write
    return true
  } catch (error) {
    toast.error(
      translate(
        'auto.components.maestro.use.maestro.settings.c304e6ce1e',
        'Could not save Maestro settings'
      ),
      {
        description: error instanceof Error ? error.message : String(error)
      }
    )
    return false
  }
}

export function useMaestroSettings() {
  const maestro = useAppStore((s) => s.settings?.maestro)
  return { maestro, updateMaestro: updateMaestroSettings }
}
