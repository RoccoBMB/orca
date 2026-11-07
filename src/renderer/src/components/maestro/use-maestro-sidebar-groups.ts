import { useMemo } from 'react'
import { useReusedArrayIdentity } from '../sidebar/worktree-list/listing/use-reused-array-identity'
import { useAppStore } from '@/store'
import { getHostedReviewCacheKey } from '@/store/slices/hosted-review/hosted-review-cache-identity'
import { getGitHubPRCacheKey } from '../../../../shared/github/github-cache-key'
import type { MaestroSettings } from '../../../../shared/maestro-settings'
import type { Worktree } from '../../../../shared/worktree/types'
import type { Repo } from '../../../../shared/repo-types'
import { maestroWorkspaceStatus } from './maestro-workspace-status'
import { buildMaestroSidebarGroups } from './maestro-sidebar-groups'

export function useMaestroSidebarGroups(
  rows: readonly Worktree[],
  repoByHost: ReadonlyMap<string, Repo>,
  maestro: MaestroSettings | undefined
) {
  const settings = useAppStore((state) => state.settings)
  const reviewCache = useAppStore((state) => state.hostedReviewCache)
  const prCache = useAppStore((state) => state.prCache)
  const statuses = useReusedArrayIdentity(
    useMemo(
      () =>
        rows.map((row) => {
          const repo = repoByHost.get(`${row.hostId ?? 'local'}|${row.repoId}`)
          const branch = row.branch.replace(/^refs\/heads\//, '')
          const host = row.hostId ?? repo?.executionHostId
          const review = repo
            ? reviewCache[
                getHostedReviewCacheKey(
                  repo.path,
                  branch,
                  settings,
                  repo.id,
                  repo.connectionId,
                  host,
                  true
                )
              ]?.data
            : null
          const pr = repo
            ? prCache[
                getGitHubPRCacheKey(
                  repo.path,
                  repo.id,
                  branch,
                  settings,
                  repo.connectionId,
                  host,
                  true
                )
              ]?.data
            : null
          return maestroWorkspaceStatus(row, review ?? pr, maestro?.statusOverrides)
        }),
      [rows, repoByHost, settings, reviewCache, prCache, maestro?.statusOverrides]
    )
  )
  return useMemo(() => {
    const statusByRow = new Map(rows.map((row, index) => [row, statuses[index]]))
    return buildMaestroSidebarGroups(rows, maestro, (row) => statusByRow.get(row) ?? 'todo')
  }, [rows, maestro, statuses])
}
