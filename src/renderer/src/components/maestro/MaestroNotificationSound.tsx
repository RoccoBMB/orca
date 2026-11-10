import { useState } from 'react'
import { useAppStore } from '@/store'
import { NotificationSoundSection } from '../settings/notifications/NotificationSoundSection'
import {
  createNotificationVolumeDraftState,
  resolveNotificationVolumeDraftState
} from '../settings/notifications/notification-settings-copy'
import { SearchableSetting } from '../settings/section-layout/SearchableSetting'
import { getNotificationsPaneSearchEntries } from '../settings/notifications/notifications-search'

export function MaestroNotificationSound() {
  const settings = useAppStore((s) => s.settings)
  const volume = settings?.notifications.customSoundVolume ?? 100
  const [draft, setDraft] = useState(() => createNotificationVolumeDraftState(volume))
  const resolved = resolveNotificationVolumeDraftState(draft, volume)
  if (resolved !== draft) {
    setDraft(resolved)
  }
  if (!settings) {
    return null
  }
  const entries = getNotificationsPaneSearchEntries()
  const soundEntry = entries[6]!
  const volumeEntry = entries[7]!
  return (
    <SearchableSetting
      title={soundEntry.title}
      description={soundEntry.description}
      keywords={[
        ...(soundEntry.keywords ?? []),
        volumeEntry.title,
        ...(volumeEntry.keywords ?? [])
      ]}
      className="max-w-none py-2"
    >
      <NotificationSoundSection
        notificationSettings={settings.notifications}
        notificationsEnabled={settings.notifications.enabled}
        volumeDraft={resolved.draft}
        onVolumeDraftChange={(value) => setDraft({ sourceVolume: volume, draft: value })}
        onVolumeCommit={(value) => {
          const s = useAppStore.getState()
          if (s.settings && s.settings.notifications.customSoundVolume !== value) {
            void s.updateSettings({
              notifications: { ...s.settings.notifications, customSoundVolume: value }
            })
          }
        }}
        onUpdateNotificationSettings={async (updates) => {
          const s = useAppStore.getState()
          if (s.settings) {
            await s.updateSettings({ notifications: { ...s.settings.notifications, ...updates } })
          }
        }}
      />
    </SearchableSetting>
  )
}
