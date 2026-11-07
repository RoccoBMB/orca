# Compact sidebar — 2026-11-07

Branch: `rocco/sidebar-compact`; base: `ef2a88e6ae` from `rocco/core`.
Task: supplied `Orca-briefs/sidebar-compact.md` and `common.md`.

## Implementation

- Conductor mode uses a compact template in the existing WorktreeCard renderer:
  32px rows, activity/status, truncated title, inline non-zero diff totals and age.
  The existing rich hover card shows branch and project (folder path for folders).
  Context actions, activation, inline rename and host ownership reuse Orca's code.
- Host-qualified groups assign each workspace once, prioritize custom sections,
  fall back to Backlog for unknown statuses/removed assignments, and hide empty
  status groups. Empty custom sections remain usable as drag destinations.
- Muted 28px section headers retain emoji; counts and menus reveal on hover/focus;
  collapsed sections show a right-hand chevron. New section scrolls with the list.
- Five primary navigation rows are 36px, including the existing host switcher.
  Search opens the existing palette. Original project grouping remains selectable
  by switching Conductor sections off under Settings → General → Maestro.
- Reused the existing keyboard-navigation hook with actual expanded section rows
  and VirtualizedList's active-row mounting/scrolling. Marked the list as sidebar
  chrome so Orca's overlay detector permits keyboard navigation and terminal focus.
- Added explicit sidebar Button variant/size; no existing Button defaults changed.
  Removed two obsolete English localization keys and regenerated the boot catalog.

## Verification

- Full `pnpm tc`: passed, including the final implementation run.
- Focused tests: five files, 18 tests passed (group ownership/fallback, status,
  standard-card parity, keyboard cycling and shared virtualizer).
- Delegated Codex review: inline rename subtree and sleeping-row shrink defects
  found and fixed; follow-up review reports no remaining findings.
- Changed-code quality: passed with zero new findings after using the sidebar
  primitive variant. The broad gate initially reported three inherited test
  failures. All three reproduced on an untouched detached `ef2a88e6ae` checkout;
  see `docs/maestro/qa/sidebar-compact-baseline.json`. The sidebar changes do not edit
  those tests. A final `check:changed` runs against the same pinned base before
  push; its full-suite test limitation is the inherited failures described below.
- Hidden development Maestro launched with `ORCA_BACKGROUND_LAUNCH=1`, disposable HOME in
  `.local/maestro-qa/sidebar-home`, and userData `/tmp/maestro-sidebar-data`.
  macOS window enumeration confirms no onscreen window and not frontmost.
  After a fresh renderer/preload build, Playwright's Electron main-process check
  confirms `visible: false`, `focused: false`, and both isolated paths. The final
  screenshots use this freshly built renderer, without relying on hot reload.
- Fixture: one disposable git repo with main plus 13 worktrees; 12 shown across
  In review, In progress and Orchestrators; two in collapsed Waiting. Standard
  optional Tasks/Automations/Mobile entries and onboarding were dismissed/hidden
  through their normal settings so the primary navigation matches the reference.
- CDP at 1280×800 measures 12 complete 32px rows and five 36px navigation rows;
  metrics: `docs/maestro/qa/sidebar-compact-metrics.json`. All images were opened and
  inspected against the supplied Conductor reference. Setup tips were dismissed
  through the normal UI before the final capture.
- CDP interactions passed: Search palette, section collapse/expand, plain arrows
  and the normal workspace-cycle shortcut in visible row order, double-click
  inline rename, right-click context menu, and workspace drag to a custom section.
- Additional checks passed: project/branch hover, actual Git `+3 −1` counts from a
  disposable changed README, zero-count suppression, long sleeping-title
  truncation with the new-card flag, dark mode, and original project grouping.
- Expanded the disposable fixture to 37 git workspaces and one folder workspace.
  Scrolled the larger list: 25 rows mounted at the end of a 38-workspace catalog.
  Activated the folder and verified Create PR is absent. Restored Waiting to
  collapsed. Saved assignments, collapse and rename survived a complete restart.
  No page errors occurred in these interaction runs.

## Known baseline test failures

- `WorktreeList.lineage-agent-expansion-coupling.test.tsx` (two cases): its partial
  store mock omits `gitStatusHeadByWorktree`; inherited default-on Conductor mode
  runs the Maestro row instead of the original project/lineage view.
- `worktree-creation-chat-handoff.test.tsx` (one case): its partial preload mock
  omits `window.api.shell.listInstalledOpenInApplications` used by the inherited
  Maestro top bar. This failure also occurs before the compact sidebar changes.

These are recorded as inherited limitations, not reported as passing checks.
The final broad related-test selection was limited after more than 16 minutes of
memory pressure. Focused tests and rendered assertions are the behavioral evidence;
[the QA report](docs/maestro/qa/sidebar-compact-report.md) records this limit and the
separate check of the QA-only commit.
Windows/Linux rendering, native-focus tests and a real remote SSH host were not
exercised on this macOS desktop. No new OS/process/remote-routing code was added.

## Reproduction / handoff

Use the cached Node 24 and pnpm 12 wrapper with
`export PATH="/tmp/maestro-core-tools/bin:$PATH"` (see `NOTES-core.md`).
The local-only disposable fixture and CDP drivers are in `.local/maestro-qa/`.
Launch with an explicit disposable HOME and ORCA_DEV_USER_DATA_PATH, background
launch, and `pnpm dev -- --remote-debugging-port=9444`; drive the hidden renderer
with Playwright's `chromium.connectOverCDP('http://127.0.0.1:9444')`.
No app installation, production profile, real SSH/git config, credential store,
other worktree, `~/.maestro-smoke`, or control-plane LaunchAgent was changed.
No PR or merge is part of this task. Push target: `origin rocco/sidebar-compact`.

## Review fixes — 2026-11-07

- Finding 11: Maestro now publishes host-qualified numbered-shortcut targets from expanded section rows; the original list publisher is disabled in Conductor mode.
- Finding 12: pending workspace/row reveals expand the owning Maestro section, mount and scroll to its qualified row, preserve highlight/rename, and support repeated/offscreen folder reveals.
- Finding 13: indexed custom/status membership and memoized status/group projections replace per-row section scans and unrelated render rebuilds; the 500-workspace/100-section case and cache-invalidation regression pass.
- Hover card: workspace details now use the opaque popover token; settled normal-effects background changed from alpha 0.82 to opaque in light/dark. The old reduced-effects capture also cleared after animation.

Verification: 38 focused tests across six files pass; full `pnpm tc`, renderer build,
and the changed-code quality gate pass. Required delegated review found and
resolved store-selector scanning and reveal-consumption scroll-back; follow-up
reports no remaining correctness concerns. The 500-workspace grouping measured
0.35ms in the final focused run; this is a local observation, not a timing budget.

Hidden Electron CDP checks at 1280×800 pass numbered shortcuts 1–9, collapsed
section skipping, status expansion, offscreen custom-section folder reveal,
repeated reveal, and revealing a non-active row without scrolling back. Shortcut
checks inject key events into Electron's real main shortcut handler while keeping
the window hidden; cross-platform policy is covered by the focused unit tests.
All final screenshots were opened and inspected. See
[the review-fix QA report](docs/maestro/qa/sidebar-fixes-report.md), interaction/surface
JSON, and `sidebar-fixes*.png`. No page errors occurred. The disposable HOME and
userData paths remain those documented above; no installed app or real profile
was used. Native-focus, real SSH, and Windows/Linux rendered checks remain excluded.

Branch-base `pnpm check:changed --base=ef2a88e6ae --maxWorkers=2 --timeout=2`
passed typecheck, formatting, lint and changed-code quality; the broad related
unit suite timed out after two minutes. Details are in the QA report; full-suite
success is not claimed. QA-only formatting/code-quality passed; its dependency
scan for evidence files was stopped after 195 seconds with no test results.
Final clean-state checks are incremental only; both gate logs are in the QA report. No PR or merge is part of this task. Revert the review-fix commit(s) to
return to `0d2d2ba6dd`; Conductor sections can still be disabled independently.
