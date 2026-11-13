import { translate } from '@/i18n/i18n'

export function getMaestroSendKeySearchEntry() {
  return {
    title: translate('maestro.sendKey.title', 'Send messages with'),
    description: translate(
      'maestro.sendKey.description',
      'Choose the send key for Maestro chat. Shift+Enter always adds a new line.'
    ),
    keywords: [
      translate('maestro.sendKey.keywordSend', 'send'),
      translate('maestro.sendKey.keywordEnter', 'enter'),
      translate('maestro.sendKey.keywordKeyboard', 'keyboard'),
      translate('maestro.sendKey.keywordNewline', 'newline')
    ]
  }
}
