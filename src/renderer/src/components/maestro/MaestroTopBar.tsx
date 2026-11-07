import { useUiLanguageRevision } from '@/i18n/use-ui-language-revision'
import { useEffect } from 'react'
import { ChevronDown, ChevronRight, GitBranch, GitPullRequest, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useAppStore } from '@/store'
import { useActiveWorktree } from '@/store/workspaces/selection/use-selected-worktree'
import { useRepoById } from '@/store/repos/use-repository-catalog'
import { conductorSidebarEnabled } from '../../../../shared/maestro-settings'
import { getWorktreeHostIdentity } from '../../../../shared/worktree/host-qualified-identity'
import { isGitRepoKind } from '../../../../shared/repo-kind'
import { getWorktreeGitIdentityDisplay } from '../../../../shared/worktree/git-identity-display'
import { MaestroOpenIn } from './MaestroOpenIn'
import { useMaestroReviewRequest } from './maestro-review-request'
import WorktreeContextMenu from '../sidebar/workspace-actions/context-menu/WorktreeContextMenu'
import { translate } from '@/i18n/i18n'

const toolbarStyle: React.CSSProperties & { WebkitAppRegion: string } = {
  WebkitAppRegion: 'no-drag'
}

export function MaestroTopBar() {
  useUiLanguageRevision()
  const enabled = useAppStore((s) => conductorSidebarEnabled(s.settings))
  const view = useAppStore((s) => s.activeView)
  const worktree = useActiveWorktree()
  const repo = useRepoById(worktree?.repoId ?? null)
  const setRightSidebarOpen = useAppStore((s) => s.setRightSidebarOpen)
  const setRightSidebarTab = useAppStore((s) => s.setRightSidebarTab)
  const workspaceKey = worktree ? getWorktreeHostIdentity(worktree) : null
  useEffect(() => {
    const request = useMaestroReviewRequest.getState().request
    if (request && request.workspaceKey !== workspaceKey) {
      useMaestroReviewRequest.getState().setRequest(null)
    }
  }, [workspaceKey])
  if (!enabled || view !== 'terminal' || !worktree) {
    return null
  }
  const git = repo && isGitRepoKind(repo) && !worktree.id.startsWith('folder:')
  const identity = getWorktreeGitIdentityDisplay(worktree)
  const branch = identity?.kind === 'branch' ? identity.branchName : 'Detached HEAD'
  const request = (action: 'create' | 'draft' | 'push'): void => {
    useMaestroReviewRequest
      .getState()
      .setRequest({ workspaceKey: getWorktreeHostIdentity(worktree), action })
    setRightSidebarTab('source-control')
    setRightSidebarOpen(true)
  }
  return (
    <div
      className="flex min-w-0 shrink-0 items-center gap-2 border-b border-border bg-background px-3 py-2"
      data-maestro-topbar=""
      style={toolbarStyle}
    >
      <div className="flex min-w-0 flex-1 items-center gap-1.5 text-xs text-muted-foreground">
        <span className="truncate">{repo?.displayName ?? worktree.displayName}</span>
        {git && (
          <>
            <ChevronRight className="size-3 shrink-0" />
            <GitBranch className="size-3 shrink-0" />
            <span className="truncate font-mono">{branch}</span>
          </>
        )}
        <WorktreeContextMenu worktree={worktree}>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={translate(
              'auto.components.maestro.MaestroTopBar.ecf59f211c',
              'Workspace actions'
            )}
            onClick={(event) =>
              event.currentTarget.dispatchEvent(
                new MouseEvent('contextmenu', {
                  bubbles: true,
                  clientX: event.clientX,
                  clientY: event.clientY
                })
              )
            }
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </WorktreeContextMenu>
      </div>
      <MaestroOpenIn worktree={worktree} repo={repo} />
      {git && (
        <div className="flex shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="rounded-r-none"
            onClick={() => request('create')}
          >
            <GitPullRequest className="size-4" />
            {translate('auto.components.maestro.MaestroTopBar.b62de08085', 'Create PR')}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon-sm"
                className="rounded-l-none border-l-0"
                aria-label={translate(
                  'auto.components.maestro.MaestroTopBar.aa0be0be48',
                  'Pull request actions'
                )}
              >
                <ChevronDown className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => request('create')}>
                {translate('auto.components.maestro.MaestroTopBar.b62de08085', 'Create PR')}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => request('draft')}>
                {translate('auto.components.maestro.MaestroTopBar.389c865f13', 'Create draft PR')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  setRightSidebarTab('checks')
                  setRightSidebarOpen(true)
                }}
              >
                {translate('auto.components.maestro.MaestroTopBar.bce02cffcf', 'Review')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => request('push')}>
                {translate('auto.components.maestro.MaestroTopBar.6e80f7322e', 'Push')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  )
}
