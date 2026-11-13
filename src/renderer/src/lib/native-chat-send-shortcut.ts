import {
  getScreenSubmitModifierLabel,
  getScreenSubmitShortcutLabel
} from './screen-submit-shortcut'

export function nativeChatAlternateSendShortcut(modifiedSend: boolean): string {
  return modifiedSend
    ? `${getScreenSubmitModifierLabel() === '⌘' ? '⌥ ' : 'Alt+'}${getScreenSubmitShortcutLabel()}`
    : getScreenSubmitShortcutLabel()
}
