import { useUiLanguageRevision } from '@/i18n/use-ui-language-revision'
import { FolderInput, ListChecks } from 'lucide-react'
import {
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger
} from '@/components/ui/dropdown-menu'
import { useMaestroSettings } from './use-maestro-settings'
import { conductorSidebarEnabled, MAESTRO_STATUSES } from '../../../../shared/maestro-settings'
import { useAppStore } from '@/store'
import { getWorktreeHostIdentity } from '../../../../shared/worktree/host-qualified-identity'
import type { Worktree } from '../../../../shared/worktree/types'
import { translate } from '@/i18n/i18n'

export function MaestroWorkspaceMenu({ worktrees }: { worktrees: readonly Worktree[] }) {
  useUiLanguageRevision()
  const enabled = useAppStore((s) => conductorSidebarEnabled(s.settings))
  const { maestro, updateMaestro } = useMaestroSettings()
  if (!enabled) {
    return null
  }
  const assign = (sectionId: string): void => {
    void updateMaestro((current) => {
      const workspaceSections = { ...current.workspaceSections }
      for (const worktree of worktrees) {
        const key = getWorktreeHostIdentity(worktree)
        if (sectionId) {
          workspaceSections[key] = sectionId
        } else {
          delete workspaceSections[key]
        }
      }
      return { workspaceSections }
    })
  }
  const status = (id?: (typeof MAESTRO_STATUSES)[number]['id']): void => {
    void updateMaestro((current) => {
      const statusOverrides = { ...current.statusOverrides }
      for (const worktree of worktrees) {
        const key = getWorktreeHostIdentity(worktree)
        if (id) {
          statusOverrides[key] = id
        } else {
          delete statusOverrides[key]
        }
      }
      return { statusOverrides }
    })
  }
  return (
    <>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          <FolderInput className="size-3.5" />
          {translate('auto.components.maestro.MaestroWorkspaceMenu.56c360d3b6', 'Move to section')}
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuItem onSelect={() => assign('')}>
            {translate(
              'auto.components.maestro.MaestroWorkspaceMenu.d795f4768c',
              'Project / automatic status'
            )}
          </DropdownMenuItem>
          {maestro?.sections?.map((section) => (
            <DropdownMenuItem key={section.id} onSelect={() => assign(section.id)}>
              {section.emoji} {section.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuSub>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          <ListChecks className="size-3.5" />
          {translate('auto.components.maestro.MaestroWorkspaceMenu.41627ff176', 'Status override')}
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuItem onSelect={() => status()}>
            {translate('auto.components.maestro.MaestroWorkspaceMenu.f42c375ec7', 'Automatic')}
          </DropdownMenuItem>
          {MAESTRO_STATUSES.map((item) => (
            <DropdownMenuItem key={item.id} onSelect={() => status(item.id)}>
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    </>
  )
}
