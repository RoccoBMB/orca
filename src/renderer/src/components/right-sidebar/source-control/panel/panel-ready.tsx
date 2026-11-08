import { useAppStore } from '@/store'
import { conductorAppearanceEnabled } from '../../../../../../shared/maestro-settings'
import { DiffLineCounts } from '../listing/diff-line-counts'
import { BulkActionBar } from '../commit/bulk-action-bar'
import { SourceControlHeaderToolbar } from './header-toolbar'
import { SourceControlNotesShelf } from '../notes/notes-shelf'
import { SourceControlPanelContent } from './panel-content'
import { SourceControlPanelDialogs } from './panel-dialogs'
import type { SourceControlPanelReadyProps } from './panel-props'
import { translate } from '@/i18n/i18n'

export function SourceControlPanelReady(props: SourceControlPanelReadyProps) {
  const { model, worktreePath } = props
  const {
    activeGroupId,
    activeWorktreeId,
    branchLineTotal,
    branchSummary,
    bulkStagePaths,
    bulkUnstagePaths,
    clearSelection,
    compareBaseRef,
    deleteDiffComment,
    diffCommentCount,
    diffCommentsCopied,
    diffCommentsExpanded,
    diffCommentsForActive,
    filterExpanded,
    filterQuery,
    gitIdentityDisplay,
    handleBulkStage,
    handleBulkUnstage,
    handleCopyDiffComments,
    handleCreatePrHeaderClick,
    handleOpenComment,
    handleRelinkSuppressedGitHubPR,
    handleSourceControlKeyDown,
    handleToggleSourceControlViewMode,
    hostedReview,
    isCreatePrIntentInFlight,
    isCreatingPr,
    isExecutingBulk,
    manualReviewUrl,
    openHostedReviewInChecks,
    prGenerating,
    refreshBranchCompare,
    selectedKeys,
    setBaseRefDialogOpen,
    setDiffCommentsExpanded,
    setFileListScrollElement,
    setFilterExpanded,
    setFilterQuery,
    setPendingDiffCommentsClear,
    setSourceControlRoot,
    settings,
    sourceControlViewMode,
    suppressedGitHubPRState,
    visibleCreatePrHeaderAction
  } = model

  const conductor = useAppStore((s) => conductorAppearanceEnabled(s.settings))
  const summaryEntries = model.entries.length ? model.entries : model.branchEntries
  const changedPaths = new Set(summaryEntries.map((entry) => entry.path))
  const totals = summaryEntries.reduce(
    (sum, entry) => ({
      added: sum.added + (entry.added ?? 0),
      removed: sum.removed + (entry.removed ?? 0)
    }),
    { added: 0, removed: 0 }
  )
  const headerToolbar = (
    <SourceControlHeaderToolbar
      filterQuery={filterQuery}
      filterExpanded={filterExpanded}
      onFilterQueryChange={setFilterQuery}
      onFilterExpandedChange={setFilterExpanded}
      visibleCreatePrHeaderAction={visibleCreatePrHeaderAction}
      hostedReview={hostedReview}
      isCreatePrIntentInFlight={isCreatePrIntentInFlight}
      isCreatingPr={isCreatingPr || prGenerating}
      onCreatePrHeaderClick={handleCreatePrHeaderClick}
      onOpenHostedReviewInChecks={openHostedReviewInChecks}
      suppressedGitHubPRNumber={
        suppressedGitHubPRState?.status === 'matched' ? suppressedGitHubPRState.number : null
      }
      onRelinkSuppressedGitHubPR={handleRelinkSuppressedGitHubPR}
      sourceControlViewMode={sourceControlViewMode}
      viewModeToggleDisabled={settings === null}
      onToggleViewMode={handleToggleSourceControlViewMode}
      onChangeBaseRef={() => setBaseRefDialogOpen(true)}
      onRefreshBranchCompare={() => void refreshBranchCompare()}
      branchCompareRefreshDisabled={!branchSummary || branchSummary.status === 'loading'}
      diffCommentCount={diffCommentCount}
      onExpandNotes={() => setDiffCommentsExpanded(true)}
      branchSummary={branchSummary}
      branchLineTotal={branchLineTotal}
      compareBaseRef={compareBaseRef}
      headDisplay={gitIdentityDisplay}
      manualReviewUrl={manualReviewUrl}
    />
  )
  return (
    <>
      <div
        ref={setSourceControlRoot}
        className={
          model.scope
            ? 'relative flex flex-col overflow-hidden'
            : 'relative flex h-full flex-col overflow-hidden'
        }
        onKeyDown={handleSourceControlKeyDown}
      >
        {conductor && (
          <div className="flex items-center justify-between border-b border-border px-4 py-3 text-sm text-muted-foreground">
            <span>
              {changedPaths.size}{' '}
              {model.entries.length
                ? translate(
                    'auto.components.right.sidebar.source.control.panel.panel.ready.ef65708faf',
                    'uncommitted files'
                  )
                : translate(
                    'auto.components.right.sidebar.source.control.panel.panel.ready.62f394a6de',
                    'files changed'
                  )}
            </span>
            <DiffLineCounts added={totals.added} removed={totals.removed} size="sm" />
          </div>
        )}
        {conductor ? (
          <details>
            <summary className="px-4 py-2 text-xs text-muted-foreground">
              {translate(
                'auto.components.right.sidebar.source.control.panel.panel.ready.58f2a1fefc',
                'Git actions'
              )}
            </summary>
            {headerToolbar}
          </details>
        ) : (
          headerToolbar
        )}

        {activeWorktreeId && worktreePath && diffCommentCount > 0 && (
          <SourceControlNotesShelf
            activeWorktreeId={activeWorktreeId}
            activeGroupId={activeGroupId}
            diffCommentsForActive={diffCommentsForActive}
            diffCommentCount={diffCommentCount}
            diffCommentsExpanded={diffCommentsExpanded}
            setDiffCommentsExpanded={setDiffCommentsExpanded}
            diffCommentsCopied={diffCommentsCopied}
            handleCopyDiffComments={handleCopyDiffComments}
            setPendingDiffCommentsClear={setPendingDiffCommentsClear}
            deleteDiffComment={deleteDiffComment}
            handleOpenComment={handleOpenComment}
          />
        )}

        <div
          ref={setFileListScrollElement}
          className="relative flex flex-1 flex-col overflow-auto scrollbar-sleek pt-1"
          style={{ paddingBottom: selectedKeys.size > 0 ? 50 : undefined }}
        >
          <SourceControlPanelContent {...props} />
        </div>

        {selectedKeys.size > 0 && (
          <BulkActionBar
            selectedCount={selectedKeys.size}
            stageableCount={bulkStagePaths.length}
            unstageableCount={bulkUnstagePaths.length}
            onStage={handleBulkStage}
            onUnstage={handleBulkUnstage}
            onClear={clearSelection}
            isExecuting={isExecutingBulk}
          />
        )}
      </div>

      <SourceControlPanelDialogs {...props} />
    </>
  )
}
