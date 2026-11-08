import { Pencil } from 'lucide-react'
import { translate } from '@/i18n/i18n'

export function MaestroTabRenameButton({ onRename }: { onRename: () => void }) {
  return (
    <button
      type="button"
      className="maestro-tab-pencil"
      aria-label={translate(
        'auto.components.maestro.MaestroTabRenameButton.ab7dda92d1',
        'Rename tab'
      )}
      onClick={(event) => {
        event.stopPropagation()
        onRename()
      }}
    >
      <Pencil className="size-3.5" />
    </button>
  )
}
