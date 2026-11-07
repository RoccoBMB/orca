import { useUiLanguageRevision } from '@/i18n/use-ui-language-revision'
import { createNonSecureContextUuid as createBrowserUuid } from '../../../../shared/non-secure-context-uuid'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useMaestroSettings } from './use-maestro-settings'
import type { MaestroSection } from '../../../../shared/maestro-settings'
import { translate } from '@/i18n/i18n'

export function MaestroSectionDialog({
  section,
  onClose
}: {
  section: MaestroSection | null
  onClose: () => void
}) {
  useUiLanguageRevision()
  const { updateMaestro } = useMaestroSettings()
  const [name, setName] = useState(section?.name ?? '')
  const [emoji, setEmoji] = useState(section?.emoji ?? '')
  const save = async (): Promise<void> => {
    if (!name.trim()) {
      return
    }
    const next = {
      id: section?.id ?? createBrowserUuid(),
      name: name.trim(),
      emoji,
      collapsed: section?.collapsed ?? false
    }
    const saved = await updateMaestro((current) => ({
      sections: section
        ? (current.sections ?? []).map((item) => (item.id === section.id ? next : item))
        : [...(current.sections ?? []), next]
    }))
    if (saved) {
      onClose()
    }
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
    >
      <DialogContent>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            void save()
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {section
                ? translate(
                    'auto.components.maestro.MaestroSectionDialog.72202dc21b',
                    'Edit section'
                  )
                : translate(
                    'auto.components.maestro.MaestroSectionDialog.bdd531a12d',
                    'New section'
                  )}
            </DialogTitle>
            <DialogDescription>
              {translate(
                'auto.components.maestro.MaestroSectionDialog.57b06f7316',
                'Organize workspaces across projects and hosts.'
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div className="space-y-1">
              <Label htmlFor="maestro-section-name">
                {translate('auto.components.maestro.MaestroSectionDialog.97511ef268', 'Name')}
              </Label>
              <Input
                id="maestro-section-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={80}
                autoFocus
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="maestro-section-emoji">
                {translate('auto.components.maestro.MaestroSectionDialog.baa589c98e', 'Emoji')}
              </Label>
              <Input
                id="maestro-section-emoji"
                value={emoji}
                onChange={(event) => setEmoji(event.target.value)}
                maxLength={16}
                placeholder={translate(
                  'auto.components.maestro.MaestroSectionDialog.346b523112',
                  'Optional'
                )}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              {translate('auto.components.maestro.MaestroSectionDialog.7caa7bbadc', 'Cancel')}
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              {translate('auto.components.maestro.MaestroSectionDialog.8340502c6a', 'Save section')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
