import { useUiLanguageRevision } from '@/i18n/use-ui-language-revision'
import { useState } from 'react'
import { useAppStore } from '@/store'
import {
  SettingsSwitchRow,
  SettingsSubsectionHeader
} from '../settings/form-controls/SettingsFormControls'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { conductorSidebarEnabled } from '../../../../shared/maestro-settings'
import { branding } from '../../../../shared/branding'
import license from '../../../../../LICENSE?raw'
import { useMaestroSettings } from './use-maestro-settings'
import { translate } from '@/i18n/i18n'

export function MaestroSettingsSection() {
  useUiLanguageRevision()
  const enabled = useAppStore((s) => conductorSidebarEnabled(s.settings))
  const { updateMaestro } = useMaestroSettings()
  const [aboutOpen, setAboutOpen] = useState(false)
  const upstreamName = translate('auto.App.5096cbbc86', 'Orca')
  return (
    <section className="space-y-3">
      <SettingsSubsectionHeader
        title={translate('auto.components.maestro.MaestroSettingsSection.7898f12dee', 'Maestro')}
      />
      <SettingsSwitchRow
        label={translate(
          'auto.components.maestro.MaestroSettingsSection.0dd0342921',
          'Conductor sidebar sections'
        )}
        description={translate(
          'auto.components.maestro.MaestroSettingsSection.a0ee737c8e',
          'Group by status and your own sections. Turn off to use Orca’s project grouping.'
        )}
        checked={enabled}
        onChange={() => updateMaestro({ conductorSidebar: !enabled })}
      />
      <p className="text-xs text-muted-foreground">
        {translate(
          'auto.components.maestro.MaestroSettingsSection.d038b03b29',
          'Automatic updates are disabled. Build a new version locally to update Maestro.'
        )}
      </p>
      <Button variant="outline" size="sm" onClick={() => setAboutOpen(true)}>
        {translate('auto.components.maestro.MaestroSettingsSection.9569a2b8d0', 'About Maestro')}
      </Button>
      <Dialog open={aboutOpen} onOpenChange={setAboutOpen}>
        <DialogContent scrollable>
          <DialogHeader>
            <DialogTitle>{branding.productName}</DialogTitle>
            <DialogDescription>
              {translate(
                'auto.components.maestro.MaestroSettingsSection.3bc8846b9f',
                'Built on {{name}} · MIT License',
                { name: upstreamName }
              )}
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm">{branding.attribution}</p>
          <Button variant="link" onClick={() => void window.api.shell.openUrl(branding.sourceUrl)}>
            {translate(
              'auto.components.maestro.MaestroSettingsSection.948dc382d3',
              'Orca source and attribution'
            )}
          </Button>
          <pre className="whitespace-pre-wrap text-xs text-muted-foreground">{license}</pre>
        </DialogContent>
      </Dialog>
    </section>
  )
}
