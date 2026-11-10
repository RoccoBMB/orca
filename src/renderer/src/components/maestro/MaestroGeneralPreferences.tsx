import { isWebClientLocation } from '@/lib/web-client-location'
import { useAppStore } from '@/store'
import { translate } from '@/i18n/i18n'
import { conductorAppearanceEnabled } from '../../../../shared/maestro-settings'
import { nativeChatQueueFollowUps } from '../../../../shared/native-chat/input/native-chat-follow-up-behavior'
import { nativeChatScrollsToLatestOnSend } from '../../../../shared/native-chat/native-chat-appearance-settings'
import { useStructuredAgentSessionHostQueuesMessages } from '@/runtime/structured-agent-session-host-capability'
import { Button } from '@/components/ui/button'
import { getChatBehaviorEntriesByKey } from '../settings/chat/chat-behavior-search'
import { getNotificationsPaneSearchEntries } from '../settings/notifications/notifications-search'
import { SettingsSwitchRow } from '../settings/form-controls/SettingsFormControls'
import { SearchableSetting } from '../settings/section-layout/SearchableSetting'
import { matchesSettingsSearch } from '../settings/search/settings-search'

const LOCAL_CHAT_HOST = { kind: 'local' } as const
const NOTIFICATION_KEYS = ['enabled', 'agentTaskComplete', 'agentNeedsInput'] as const

export function MaestroGeneralPreferences(): React.JSX.Element | null {
  const settings = useAppStore((state) => state.settings)
  const query = useAppStore((state) => state.settingsSearchQuery)
  const hostQueuesMessages = useStructuredAgentSessionHostQueuesMessages(LOCAL_CHAT_HOST)
  if (!settings || !conductorAppearanceEnabled(settings)) {
    return null
  }
  const chat = getChatBehaviorEntriesByKey()
  const desktopNotifications = !isWebClientLocation()
  const notifications = desktopNotifications ? getNotificationsPaneSearchEntries().slice(0, 3) : []
  const openPane = (pane: 'chat' | 'notifications') => {
    const state = useAppStore.getState()
    state.openSettingsTarget({ pane, repoId: null })
    state.openSettingsPage()
  }
  return (
    <section className="divide-y divide-border">
      {hostQueuesMessages && (
        <SearchableSetting {...chat.queueFollowUps} className="max-w-none">
          <SettingsSwitchRow
            label={chat.queueFollowUps.title}
            description={chat.queueFollowUps.description}
            checked={nativeChatQueueFollowUps(settings)}
            onChange={() =>
              void useAppStore.getState().updateSettings({
                nativeChatQueueFollowUps: !nativeChatQueueFollowUps(useAppStore.getState().settings)
              })
            }
          />
        </SearchableSetting>
      )}
      <SearchableSetting {...chat.scrollToLatestOnSend} className="max-w-none">
        <SettingsSwitchRow
          label={chat.scrollToLatestOnSend.title}
          description={chat.scrollToLatestOnSend.description}
          checked={nativeChatScrollsToLatestOnSend(settings)}
          onChange={() =>
            void useAppStore.getState().updateSettings({
              nativeChatScrollToLatestOnSend: !nativeChatScrollsToLatestOnSend(
                useAppStore.getState().settings
              )
            })
          }
        />
      </SearchableSetting>
      {notifications.map((entry, index) => {
        const key = NOTIFICATION_KEYS[index]!
        return (
          <SearchableSetting key={key} {...entry} className="max-w-none">
            <SettingsSwitchRow
              label={entry.title}
              description={entry.description}
              checked={settings.notifications[key]}
              disabled={key !== 'enabled' && !settings.notifications.enabled}
              onChange={() => {
                const state = useAppStore.getState()
                if (!state.settings) {
                  return
                }
                if (key === 'enabled' && !state.settings.notifications.enabled) {
                  state.recordFeatureInteraction('notifications')
                }
                void state.updateSettings({
                  notifications: {
                    ...state.settings.notifications,
                    [key]: !state.settings.notifications[key]
                  }
                })
              }}
            />
          </SearchableSetting>
        )
      })}
      {!query.trim() ||
      matchesSettingsSearch(query, [
        ...notifications,
        chat.queueFollowUps,
        chat.scrollToLatestOnSend
      ]) ? (
        <div className="flex flex-wrap gap-2 py-3">
          <Button variant="outline" size="sm" onClick={() => openPane('chat')}>
            {translate('settings.appearance.chat.title', 'Chat UI')}
          </Button>
          {desktopNotifications && (
            <Button variant="outline" size="sm" onClick={() => openPane('notifications')}>
              {translate('auto.components.settings.Settings.9907545fa3', 'Notifications')}
            </Button>
          )}
        </div>
      ) : null}
    </section>
  )
}
