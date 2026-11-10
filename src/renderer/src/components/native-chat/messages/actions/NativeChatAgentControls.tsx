import { useAppStore } from '@/store'
import { conductorAppearanceEnabled } from '../../../../../../shared/maestro-settings'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { ArrowUp, MoreHorizontal } from 'lucide-react'
import { cn } from '../../../../lib/utils'
import { NativeChatCopyButton } from '../../NativeChatCopyButton'
import { NativeChatMessageTimestamp } from '../../NativeChatMessageTimestamp'
import { withoutNativeChatVisualDirectiveLines } from '../../../../../../shared/native-chat/native-chat-visual-directive'
import { translate } from '@/i18n/i18n'

export function NativeChatAgentControls({
  duration,
  markdown,
  timestamp,
  onScrollToTop,
  action,
  className
}: {
  duration?: string
  markdown: string
  timestamp: number | null
  onScrollToTop: () => void
  /** A row action of its own, drawn beside Copy (Fork). */
  action?: React.ReactNode
  className?: string
}): React.JSX.Element {
  const conductor = useAppStore((s) => conductorAppearanceEnabled(s.settings))
  if (conductor) {
    return (
      <div
        data-native-chat-find-skip
        data-maestro-turn-meta
        className="mt-3 flex items-center gap-2 text-xs text-chat-foreground-faint"
      >
        {duration && (
          <span className="tabular-nums">
            {duration}
            {timestamp !== null && Number.isFinite(timestamp) ? ' ·' : ''}
          </span>
        )}
        <NativeChatMessageTimestamp timestamp={timestamp} />
        {markdown && (
          <NativeChatCopyButton text={withoutNativeChatVisualDirectiveLines(markdown)} />
        )}
        {action}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label={translate(
                'auto.components.native.chat.messages.actions.NativeChatAgentControls.5ebbb244d7',
                'Message actions'
              )}
            >
              <MoreHorizontal className="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={onScrollToTop}>
              {translate(
                'auto.components.native.chat.messages.actions.NativeChatAgentControls.6bf7eca4bc',
                'Scroll to message'
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }
  return (
    // Hover-only row chrome: find skips it rather than counting what the mouse happens to show.
    <div data-native-chat-find-skip className={cn('flex items-center gap-1', className)}>
      {/* A visual line means nothing pasted outside Orca, so the copy leaves it out. An image-only
          response has nothing to copy, so it has no Copy. */}
      {markdown.length > 0 ? (
        <NativeChatCopyButton text={withoutNativeChatVisualDirectiveLines(markdown)} />
      ) : null}
      {action}
      <button
        type="button"
        onClick={onScrollToTop}
        aria-label={translate(
          'components.native-chat.scrollMessageToTop',
          'Scroll this message to top'
        )}
        title={translate('components.native-chat.scrollMessageToTop', 'Scroll this message to top')}
        className="flex size-6 shrink-0 items-center justify-center rounded-md text-chat-foreground-faint transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowUp className="size-3.5" />
      </button>
      <NativeChatMessageTimestamp timestamp={timestamp} />
    </div>
  )
}
