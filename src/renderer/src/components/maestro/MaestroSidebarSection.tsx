import { useUiLanguageRevision } from '@/i18n/use-ui-language-revision'
import { ArrowDown, ArrowUp, ChevronRight, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import type { MaestroSection } from '../../../../shared/maestro-settings'
import type { Worktree } from '../../../../shared/worktree/types'
import { translate } from '@/i18n/i18n'

export type MaestroSidebarGroup = {
  key: string
  label: string
  items: Worktree[]
  collapsed: boolean
  custom?: MaestroSection
}
export const MAESTRO_WORKSPACE_DRAG = 'application/x-maestro-workspace'
export const MAESTRO_SECTION_DRAG = 'application/x-maestro-section'

export function MaestroSidebarSection({
  group,
  onToggle,
  onEdit,
  onMove,
  onRemove
}: {
  group: MaestroSidebarGroup
  onToggle: () => void
  onEdit: (section: MaestroSection) => void
  onMove: (id: string, delta: number) => void
  onRemove: (id: string) => void
}) {
  useUiLanguageRevision()
  const custom = group.custom
  return (
    <div
      className="group/section flex h-7 items-center gap-1 px-2 text-muted-foreground"
      draggable={!!custom}
      onDragStart={
        custom
          ? (event) => {
              event.dataTransfer.setData(MAESTRO_SECTION_DRAG, custom.id)
              event.dataTransfer.effectAllowed = 'move'
            }
          : undefined
      }
    >
      <Button
        variant="sidebar"
        size="menu"
        className="h-7 min-w-0 flex-1 justify-start"
        aria-expanded={!group.collapsed}
        onClick={onToggle}
      >
        {custom?.emoji && <span className="shrink-0">{custom.emoji}</span>}
        <span className="truncate">{group.label}</span>
        <span className="ml-auto text-2xs tabular-nums opacity-0 group-hover/section:opacity-100 group-focus-within/section:opacity-100">
          {group.items.length}
        </span>
        {group.collapsed && <ChevronRight className="size-3.5 shrink-0" />}
      </Button>
      {custom && (
        <DropdownMenu>
          <span className="opacity-0 group-hover/section:opacity-100 group-focus-within/section:opacity-100 has-[[data-state=open]]:opacity-100">
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label={translate(
                  'auto.components.maestro.MaestroSidebarSection.e97c19d261',
                  'Actions for {{value0}}',
                  { value0: custom.name }
                )}
              >
                <MoreHorizontal className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
          </span>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => onEdit(custom)}>
              <Pencil className="size-3.5" />
              {translate(
                'auto.components.maestro.MaestroSidebarSection.5bec085348',
                'Rename / emoji'
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onMove(custom.id, -1)}>
              <ArrowUp className="size-3.5" />
              {translate('auto.components.maestro.MaestroSidebarSection.ed17c8edbb', 'Move up')}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onMove(custom.id, 1)}>
              <ArrowDown className="size-3.5" />
              {translate('auto.components.maestro.MaestroSidebarSection.feee610456', 'Move down')}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onRemove(custom.id)}>
              <Trash2 className="size-3.5" />
              {translate(
                'auto.components.maestro.MaestroSidebarSection.16ac6f96ad',
                'Remove section'
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}
