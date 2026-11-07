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
  see `qa-rocco/sidebar-compact-baseline.json`. The sidebar changes do not edit
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
  metrics: `qa-rocco/sidebar-compact-metrics.json`. All images were opened and
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
