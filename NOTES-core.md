# Maestro core build

Branch: `rocco/core` (existing isolated worktree).

## Implemented

- Shared branding config; independent app/dev/CLI profiles, URL scheme, disabled
  desktop updater and telemetry opt-out default. Orca's MIT attribution retained.
- Conductor navigation and optional virtualized status/custom sidebar, host-qualified
  manual assignments, emoji/rename/order/collapse, context and drag moves.
- Breadcrumb and Open in split control using existing owner guards; installed editor
  discovery; source-control composer, draft, review and push entry points.
- Existing dotfile toggle defaults hidden; home/large-folder repository suggestion.
- Local package/install scripts, ROCCO.md, weekly/manual upstream sync and reports.

## Review and checks

- Required Codex review completed; addressed the dotfile write bug, CLI defaults,
  explicit profile override preservation, SSH folder ownership, serialized functional
  settings writes, virtualization, row age and available diff stats.
- Focused tests: 3 files / 8 tests passed (status inference, deep links, dotfile filtering).
- Full `check:changed` attempted; initial pass found formatting/localization issues
  and tracked-path checks for newly untracked files. Fixing before final run.
- Initial full package attempt passed typecheck and CLI/WSL builds, then caught an
  incorrect raw-license import. Corrected and rebuilding.

## Next

- Finish typecheck/build, changed checks and remaining focused tests.
- Launch packaged Maestro hidden with disposable HOME/userData, take and inspect
  CDP screenshots in qa-rocco, test section persistence/dotfiles/draft/folder guards.
- Commit working increments and push only after the final changed gate.

## Decisions / boundaries

- Top-bar Create PR/draft opens the existing editable composer; it does not publish
  automatically. Push uses Orca's existing availability guards.
- Diff stats show a dash when no current host/head-scoped data exists; never fake zero.
- Projects are a second navigation path to the same visible workspaces as sections.
- Sync branches start at rocco/main and leave that branch unchanged pending review.
- No official Orca install/data, real SSH/git credentials, ~/.maestro-smoke, or control-plane
  LaunchAgent has been modified. UI checks must remain hidden and isolated.
