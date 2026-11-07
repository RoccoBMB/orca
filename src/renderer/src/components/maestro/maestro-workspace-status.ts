import { isCachedMergedBranchPRCurrentForWorktree } from '../sidebar/workspace-card/review/worktree-card-pr-display'
import type { Worktree } from '../../../../shared/worktree/types'
import type { MaestroSettings } from '../../../../shared/maestro-settings'
import { getWorktreeHostIdentity } from '../../../../shared/worktree/host-qualified-identity'
import type { HostedReviewInfo } from '../../../../shared/source-control/hosted-review/hosted-review-contracts'

export function maestroWorkspaceStatus(
  worktree: Pick<
    Worktree,
    'id' | 'hostId' | 'head' | 'isArchived' | 'workspaceStatus' | 'smartTier'
  >,
  review:
    | Pick<HostedReviewInfo, 'state' | 'headSha' | 'confirmedContainedHeadOid'>
    | null
    | undefined,
  overrides: MaestroSettings['statusOverrides']
): string {
  const override = overrides?.[getWorktreeHostIdentity(worktree)]
  if (override) {
    return override
  }
  if (worktree.isArchived) {
    return 'completed'
  }
  if (worktree.workspaceStatus && worktree.workspaceStatus !== 'in-progress') {
    return worktree.workspaceStatus
  }
  if (review?.state === 'merged' && isCachedMergedBranchPRCurrentForWorktree(review, worktree)) {
    return 'completed'
  }
  if (review?.state === 'closed') {
    return 'canceled'
  }
  if (worktree.smartTier === 'working') {
    return 'in-progress'
  }
  if (review?.state === 'open') {
    return 'in-review'
  }
  if (worktree.smartTier === 'done' || worktree.smartTier === 'needs-you') {
    return 'in-review'
  }
  return worktree.workspaceStatus ?? 'todo'
}
