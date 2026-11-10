import { useState } from 'react'
import { Check, List } from 'lucide-react'
import { useAppStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import { translate } from '@/i18n/i18n'
import { conductorAppearanceEnabled } from '../../../../shared/maestro-settings'
import { useStructuredChatTabConversationName } from '@/runtime/structured-conversation-name'
import { getTabDragLabel, type TabBarItem } from '../tab-bar/tab-bar-item-model'
import type { TabBarItemActions } from '../tab-bar/use-tab-bar-item-actions'
import type { ClientHostedBrowserRow } from '../../../../shared/client-hosted-browser-rows'
import { getClientHostedBrowserRowLabel } from '../tab-bar/client-hosted-browser-row-label'

function OverflowItem({
  item,
  active,
  generatedTitles,
  onSelect
}: {
  item: TabBarItem
  active: boolean
  generatedTitles: boolean
  onSelect: () => void
}) {
  const name = useStructuredChatTabConversationName(
    item.type === 'agent-session' ? item.data : undefined
  )
  const label = getTabDragLabel(item, generatedTitles, name)
  return (
    <CommandItem selection="palette" value={item.id} keywords={[label]} onSelect={onSelect}>
      <Check className={active ? 'size-4 shrink-0' : 'size-4 shrink-0 invisible'} />
      <span className="truncate">{label}</span>
    </CommandItem>
  )
}

export function MaestroTabOverflow({
  items,
  activeId,
  generatedTitles,
  actions,
  clientHostedRows,
  onSelectClientHostedRow
}: {
  items: TabBarItem[]
  activeId: string | null
  generatedTitles: boolean
  actions: TabBarItemActions
  clientHostedRows: readonly ClientHostedBrowserRow[]
  onSelectClientHostedRow: (browserPageId: string) => void
}) {
  const enabled = useAppStore((s) => conductorAppearanceEnabled(s.settings))
  const [open, setOpen] = useState(false)
  if (!enabled) {
    return null
  }
  const label = translate('maestro.tabs.showAll', 'Show all tabs')
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="my-auto shrink-0"
              aria-label={label}
              style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            >
              <List className="size-4" />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={4}>
          {label}
        </TooltipContent>
      </Tooltip>
      <PopoverContent align="end" className="w-72">
        <Command>
          <CommandInput
            placeholder={translate('maestro.tabs.search', 'Find a tab…')}
            aria-label={label}
          />
          <CommandList>
            <CommandEmpty>{translate('maestro.tabs.noMatches', 'No matching tabs.')}</CommandEmpty>
            {items.map((item) => (
              <OverflowItem
                key={item.id}
                item={item}
                active={item.id === activeId}
                generatedTitles={generatedTitles}
                onSelect={() => {
                  setOpen(false)
                  if (item.type === 'terminal') {
                    actions.activateTerminal(item.id)
                  } else if (item.type === 'agent-session') {
                    actions.activateAgentSession(item.id)
                  } else if (item.type === 'browser') {
                    actions.activateBrowserTab(item.id)
                  } else {
                    actions.activateFile(item.id)
                  }
                }}
              />
            ))}
            {clientHostedRows.map((row) => {
              const rowLabel = getClientHostedBrowserRowLabel(row)
              return (
                <CommandItem
                  key={row.browserPageId}
                  selection="palette"
                  value={row.browserPageId}
                  keywords={[rowLabel]}
                  onSelect={() => {
                    setOpen(false)
                    onSelectClientHostedRow(row.browserPageId)
                  }}
                >
                  <Check
                    className={activeId === row.browserPageId ? 'size-4' : 'size-4 invisible'}
                  />
                  <span className="truncate">{rowLabel}</span>
                </CommandItem>
              )
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
