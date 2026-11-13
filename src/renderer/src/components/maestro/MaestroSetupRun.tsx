import { useRef, useState } from 'react'
import { useAppStore } from '@/store'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { SetupCommandPreview } from '../new-workspace/SetupCommandPreview'
import { getSetupConfig, type SetupConfig } from '../../../../shared/orca-hook-setup-config'
import type { Repo } from '../../../../shared/repo-types'
import { getRepoExecutionHostId } from '../../../../shared/execution-host'
import type { Worktree } from '../../../../shared/worktree/types'
import { hashOrcaHookScript } from '@/lib/orca-hook-trust'
import { runApprovedWorktreeSetup } from '@/store/slices/worktrees/create/created-worktree-setup-trust'
import { resolveWorktreeOperationRouteForHost } from '@/lib/worktree-operation-route'
import { runtimeTargetForOwnerEnvironment } from '@/runtime/rpc/targets/runtime-client-target'
import { translate } from '@/i18n/i18n'

export function MaestroSetupRun({
  worktree,
  repo,
  config,
  trustContent
}: {
  worktree: Worktree
  repo: Repo
  config: SetupConfig
  trustContent: string
}) {
  const [review, setReview] = useState<{
    config: SetupConfig
    trustContent: string
    settingsKey: string | undefined
  } | null>(null)
  const [pending, setPending] = useState(false)
  const busy = useRef(false)
  const [message, setMessage] = useState<string | null>(null)
  const run = async () => {
    if (!review || busy.current) {
      return
    }
    busy.current = true
    setPending(true)
    setMessage(null)
    try {
      const route = resolveWorktreeOperationRouteForHost(
        useAppStore.getState(),
        worktree.id,
        worktree.hostId ?? 'local'
      )
      if (!route || route.executionHostId?.startsWith('ssh:')) {
        throw new Error(
          translate('maestro.setup.unsupportedRoute', 'Run setup from the workspace host.')
        )
      }
      const approvedSetupHash = await hashOrcaHookScript(review.trustContent)
      const currentRepo = useAppStore
        .getState()
        .repos.find(
          (candidate) =>
            candidate.id === repo.id &&
            getRepoExecutionHostId(candidate) === getRepoExecutionHostId(repo)
        )
      if (!currentRepo || JSON.stringify(currentRepo.hookSettings) !== review.settingsKey) {
        setReview(null)
        throw new Error(
          translate(
            'maestro.setup.settingsChanged',
            'Setup settings changed. Review the current commands before running again.'
          )
        )
      }
      const outcome = await runApprovedWorktreeSetup(
        runtimeTargetForOwnerEnvironment(route.runtimeEnvironmentId),
        {
          worktreeId: worktree.id,
          approvedSetupHash
        }
      )
      if (outcome.status === 'mismatch') {
        const local = getSetupConfig(currentRepo, null)
        setReview({
          settingsKey: review.settingsKey,
          trustContent: outcome.setupTrustMismatch.scriptContent,
          config: {
            source: local ? 'both' : 'yaml',
            kind: review.config.kind,
            command: [outcome.setupTrustMismatch.scriptContent, local?.command]
              .filter(Boolean)
              .join('\n\n')
          }
        })
        setMessage(
          translate(
            'maestro.setup.changed',
            'Workspace commands changed. Review the current commands below before running.'
          )
        )
        return
      }
      setReview(null)
      setMessage(
        outcome.status === 'started'
          ? translate(
              'maestro.setup.started',
              'Setup requested. Open terminal output for progress and results.'
            )
          : outcome.status === 'unsupported'
            ? translate(
                'maestro.setup.unsupported',
                'Update Maestro on the workspace host to run setup here.'
              )
            : translate('maestro.setup.notConfigured', 'The host has no setup commands to run.')
      )
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : translate('maestro.setup.failed', 'Could not request setup. Try again.')
      )
    } finally {
      busy.current = false
      setPending(false)
    }
  }
  return (
    <>
      <Button
        size="sm"
        onClick={() => {
          setMessage(null)
          setReview({ config, trustContent, settingsKey: JSON.stringify(repo.hookSettings) })
        }}
      >
        {translate('maestro.setup.reviewRun', 'Review and run')}
      </Button>
      {message && (
        <p role="status" className="text-xs text-muted-foreground">
          {message}
        </p>
      )}
      <Dialog
        open={review !== null}
        onOpenChange={(open) => {
          if (!open && !busy.current) {
            setReview(null)
          }
        }}
      >
        <DialogContent surface="security" scrollable>
          <DialogHeader>
            <DialogTitle>
              {translate('maestro.setup.reviewTitle', 'Run workspace setup?')}
            </DialogTitle>
            <DialogDescription>
              {translate(
                'maestro.setup.reviewDescription',
                'These commands run in {{workspace}}. Running setup again can change workspace files and restart configured commands.',
                { workspace: worktree.displayName }
              )}
            </DialogDescription>
          </DialogHeader>
          {review && <SetupCommandPreview setupConfig={review.config} />}
          {message && (
            <p role="alert" className="text-sm">
              {message}
            </p>
          )}
          <DialogFooter>
            <Button variant="ghost" disabled={pending} onClick={() => setReview(null)}>
              {translate('maestro.setup.cancel', 'Cancel')}
            </Button>
            <Button disabled={pending} onClick={() => void run()}>
              {pending
                ? translate('maestro.setup.requesting', 'Requesting setup…')
                : translate('maestro.setup.runCommands', 'Run commands')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
