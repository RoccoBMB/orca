import { useAppStore } from '@/store'
import { maestroUsesModifiedSend } from '../../../../shared/maestro-settings'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { ShortcutKeyCombo } from '../ShortcutKeyCombo'
import { getScreenSubmitModifierLabel } from '@/lib/screen-submit-shortcut'
import { SettingsRow } from '../settings/form-controls/SettingsFormControls'
import { SearchableSetting } from '../settings/section-layout/SearchableSetting'
import { getMaestroSendKeySearchEntry } from './maestro-send-key-search'
import { updateMaestroSettings } from './use-maestro-settings'

export function MaestroSendKeyPreference() {
  const modified = useAppStore((state) => maestroUsesModifiedSend(state.settings))
  const entry = getMaestroSendKeySearchEntry()
  return (
    <SearchableSetting {...entry} className="max-w-none">
      <SettingsRow
        label={entry.title}
        description={entry.description}
        className="flex-wrap"
        control={
          <Select
            value={modified ? 'mod-enter' : 'enter'}
            onValueChange={(sendKey: 'enter' | 'mod-enter') =>
              void updateMaestroSettings({ sendKey })
            }
          >
            <SelectTrigger aria-label={entry.title} className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="enter">
                <ShortcutKeyCombo keys={['Enter']} />
              </SelectItem>
              <SelectItem value="mod-enter">
                <ShortcutKeyCombo keys={[getScreenSubmitModifierLabel(), 'Enter']} />
              </SelectItem>
            </SelectContent>
          </Select>
        }
      />
    </SearchableSetting>
  )
}
