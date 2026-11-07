import { useEffect } from 'react'
import { toast } from 'sonner'
import type { SourceControlPanelModel } from '../right-sidebar/source-control/panel/use-panel-model'
import { getWorktreeHostIdentity } from '../../../../shared/worktree/host-qualified-identity'
import { useMaestroReviewRequest } from './maestro-review-request'
import { translate } from '@/i18n/i18n'

export function useMaestroReviewAction(model: SourceControlPanelModel): void {
  const request = useMaestroReviewRequest((s) => s.request)
  useEffect(() => {
    if (
      !request ||
      model.scope ||
      !model.activeWorktree ||
      getWorktreeHostIdentity(model.activeWorktree) !== request.workspaceKey
    ) {
      return
    }
    if (request.action === 'push') {
      if (!model.remoteStatus) {
        return
      }
      useMaestroReviewRequest.getState().setRequest(null)
      const push = model.dropdownItems.find(
        (item) => item.kind === 'push' || item.kind === 'publish'
      )
      if (!push || push.kind === 'separator' || push.disabled) {
        toast.error(
          translate(
            'auto.components.maestro.use.maestro.review.request.ed30d37cf2',
            'Push is unavailable'
          ),
          {
            description:
              push && push.kind !== 'separator'
                ? push.title
                : translate(
                    'auto.components.maestro.use.maestro.review.request.20583e473d',
                    'Check the branch status in Source Control.'
                  )
          }
        )
        return
      }
      model.handleActionInvoke(push.kind)
      return
    }
    if (!model.pullRequestFieldsInitialized) {
      return
    }
    model.setPrDraft(request.action === 'draft')
    useMaestroReviewRequest.getState().setRequest(null)
  }, [request, model])
}
