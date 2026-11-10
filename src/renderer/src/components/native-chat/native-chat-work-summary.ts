import { translate } from '@/i18n/i18n'

export function nativeChatWorkSummary(tools: number, messages: number): string | null {
  const parts: string[] = []
  if (tools > 0) {
    parts.push(
      translate('components.native-chat.tool.callCount', '{{count}} tool calls', {
        count: tools,
        defaultValue_one: '{{count}} tool call'
      })
    )
  }
  if (messages > 0) {
    parts.push(
      translate('components.maestro.chat.messageCount', '{{count}} messages', {
        count: messages,
        defaultValue_one: '{{count}} message'
      })
    )
  }
  return parts.length ? parts.join(', ') : null
}
