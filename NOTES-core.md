# Maestro core build

Branch: `rocco/core` in the existing isolated Orca-core worktree.

## Implemented

- Shared Maestro branding: separate app/bundle/protocol/profile, CLI commands,
  credentials and service coordination; desktop updates disabled and new-profile
  telemetry off. Orca's MIT license and attribution remain in About.
- Default-on optional Conductor navigation, status inference/manual overrides,
  custom sections, emoji/rename/order/collapse and context/drag assignments.
  Host-qualified settings and workspace ownership are preserved.
- Breadcrumb, remembered Open in target, existing PR/draft/review/push actions,
  hidden dotfiles with persisted toggle, home/large-folder repository suggestion.
- Build/install aliases and ROCCO.md; weekly/manual fork-only upstream sync with
  conflict reports and an already-up-to-date no-op. CHANGELOG.md records reversion.

## Interrupted-session completion

- Retained the completed feature commits and original screenshots.
- Updated remaining CLI/AppImage/credential fixtures for Maestro. Guarded both
  legacy Linux command cleanup paths so Maestro preserves Orca's CLI/dispatcher.
- Fixed installation to preserve relative framework symlinks. Verified install
  and replacement in a disposable HOME, including after deleting the source.
- Local app/helper builds use ad hoc signing without automatic certificate
  discovery. Finished the interrupted arm64 package and strict signature check.
- Reused Orca's existing VirtualizedList to resolve the sidebar compiler bailout,
  preserving mixed header/card estimates; no new baseline exception was added.
- Required delegated reviews completed and actionable findings addressed.

## Verification

- Full `pnpm tc` passed after final code changes.
- Focused checks: 42 files / 158 tests passed; 2 files / 10 tests platform-skipped.
  Covers CLI, credentials, startup/profile isolation, status, host registry,
  dotfiles and shared virtual-list behavior.
- React Compiler ratchet passed. Sync success/no-op/conflict fixture passed with
  real disposable Git worktrees and pnpm validation commands stubbed.
- Packaged Maestro launched only hidden with disposable HOME/userData. Saved
  section settings survived restart; collapse, reorder and reload checks passed.
  Final screenshots were inspected at 1440×1200 and 1280×800 CSS viewports.
- The final `check:changed` result and coverage limits belong in
  [qa-rocco/REPORT.md](qa-rocco/REPORT.md). Do not infer broad gate success from
  focused checks. Branding-related test selection fans out widely.

## Tooling / next-session reference

No global software installation is needed. The working cached tooling is:

```sh
export PATH="/tmp/maestro-core-tools/bin:$PATH"
# bin/node points to cached Node 24.22.2; bin/pnpm invokes:
node /Users/roccobombardieri/.cache/node/corepack/v1/pnpm/12.14.0/bin/pnpm.mjs --version
```

Both the current PATH pnpm launcher and the older Corepack wrapper fail to locate
pnpm 12's native entrypoint. ROCCO.md documents the normal Corepack/cached-entry
fallback. Temporary tooling paths may disappear after reboot.

## Boundaries / handoff

PR/draft opens the existing composer; publishing requires its normal user action.
Unavailable host/head diff stats show a dash. Projects remain another navigation
path to the same workspace set. Sync leaves rocco/main unchanged until review.
The local package omits the optional cross-platform orcad template; release-matrix
and non-macOS installers require their own environments. No local app was installed.
Official Orca data, real SSH/git credentials, ~/.maestro-smoke and the control-plane
LaunchAgent were not modified. See ROCCO.md and qa-rocco/REPORT.md for evidence and
remaining platform coverage. Push target: `git push origin rocco/core`.
