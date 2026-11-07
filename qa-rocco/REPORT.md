# Maestro core QA — 2026-11-07

Branch: `rocco/core`. Comparison base: `rocco/main` (`97f0dd7a04`).
The interrupted feature work was retained; this session completed the remaining
CLI fixtures, installation/sync tooling, package signing, verification and handoff.

## Checks

| Check                                                                                             | Result                                                                                                                                                              |
| ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm tc`                                                                                         | Passed, including a fresh run after the sidebar change.                                                                                                             |
| Focused CLI, credentials, profile/startup, status, host ownership, dotfile and virtual-list tests | 42 files passed; 158 tests passed; 2 files / 10 tests skipped by platform guards.                                                                                   |
| `pnpm check:react-compiler-compat-ratchet`                                                        | Passed; no new compiler baseline exception.                                                                                                                         |
| `pnpm check:changed --base=rocco/main --maxWorkers=2`                                             | Final run in progress; result to be recorded before handoff.                                                                                                        |
| Sync shell syntax and installer JavaScript syntax                                                 | Passed.                                                                                                                                                             |
| Disposable Git sync fixture                                                                       | Passed merge, unchanged baseline, cleanup, no-op detection and conflict report/exit checks. pnpm validation commands were stubbed; see `upstream-sync-fixture.txt`. |
| Disposable-HOME installer fixture                                                                 | Passed installation/replacement, relative framework symlinks, operation after deleting the source, and staging/backup cleanup.                                      |
| Packaged macOS arm64 app                                                                          | Passed electron-builder packaging and `codesign --verify --deep --strict`; bundle ID `dev.rocco.maestro`, ad hoc signature.                                         |
| Hidden packaged Electron / CDP                                                                    | Passed isolated HOME/userData and invisible, unfocused window checks; saved sections survived app restart.                                                          |

Commands used the previous session's cached Node 24.22.2 and pnpm 12.14.0.
Focused tests used a disposable HOME with global/system Git config disabled.
Native-focus tests remain excluded on the user's desktop.

The package reused completed desktop/native assets, rebuilt the modified main and
renderer targets, projected the web client, checked the Electron native runtime,
and finished `electron-builder --config config/electron-builder.config.cjs --dir`.
The finished app is `dist/mac-arm64/Maestro.app`; no app was installed or launched
in a visible window. Bundled daemon, plugin, web/serve payload and terminal-host
verification passed during packaging. The optional orcad template was omitted.

## Rendered evidence

All listed screenshots were opened and inspected. The sidebar navigation, status
and emoji sections, selected-row treatment and split controls were compared with
`workspace-cloud-tia.png` and `topbar-openin-createpr.png` from the supplied
Conductor references. Maestro retains Orca's tokens and primitives.

| Evidence                              | What was checked                                                                                                                                  |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sidebar-sections.png`                | Original status/custom/project grouping evidence.                                                                                                 |
| `sidebar-final.png`                   | Finished package at 1440×1200 CSS viewport: all five status groups, persisted custom sections and project path.                                   |
| `sidebar-final-1280.png`              | Finished package at 1280×800 CSS viewport: visible rows and top bar after dismissing onboarding tips.                                             |
| `topbar-openin.png`, `topbar-pr.png`  | Existing editor chooser and PR/draft/review/push entries.                                                                                         |
| `files-hidden.png`, `files-shown.png` | Dotfile default and explicit toggle. Final reused profile intentionally retains the shown state.                                                  |
| `folder-guard.png`                    | Large non-git folder suggestion; git-only top-bar controls absent.                                                                                |
| `about.png`, `about-content.txt`      | Maestro name, built-on-Orca attribution and full MIT notice.                                                                                      |
| `final-launch-isolation.json`         | Finished package's invisible/unfocused window and disposable profile paths.                                                                       |
| `restart-persistence.json`            | Saved name/emoji/assignment survived app restart; expand/collapse and reorder worked through the UI and survived reload; no page errors observed. |

The sidebar's direct virtualizer call was replaced with Orca's existing
`VirtualizedList`; row-dependent height estimates preserve header/card sizing.
Rendered rows remained present after the refactor. An onboarding-tip transition
obscured the first small-viewport capture; the tip was dismissed through the UI
and the screenshot was replaced and inspected.

## Review and remaining platform coverage

The required earlier Codex feature reviews were retained. A final delegated review
covered the CLI coexistence guards, installer, sync script/workflow and list reuse.
Its installer symlink and empty-sync PR findings were fixed. Local helper builds
also now avoid automatic certificate discovery. No outstanding review findings.

Windows/Linux installers, native-focus behavior, real SSH/editor launches and the
release matrix need their platform environments. The scheduled workflow must be
present on the fork's default branch before GitHub will schedule it. No real
upstream merge, PR, issue, app installation or change to official Orca data,
credentials, `~/.maestro-smoke` or the control-plane LaunchAgent was performed.
