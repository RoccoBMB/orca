# Sidebar review fixes — 2026-11-07

Branch: `rocco/sidebar-compact`; starting HEAD: `0d2d2ba6dd`.
Requested work: findings 11–13 and the workspace hover card from `sidebar-fixes.md`.

## Regression and code checks

- New shortcut and collapsed-section reveal tests failed on the original compact
  sidebar before implementation (three failures), then passed after the changes.
- The virtualizer regression reproduced scrolling back to the active workspace
  when consuming a different row's reveal, then passed with separate scroll effects.
- Six focused files, 38 tests pass: Maestro sidebar/grouping/status, shared sidebar
  host-copy selection, virtualizer, and cross-platform window shortcut policy.
- The requested performance case projects 500 workspaces across 100 collapsed
  custom sections. It measured 0.35ms locally; no fragile elapsed-time assertion.
  A separate 500-row regression verifies projection identity survives unrelated
  review-cache and active-workspace updates.
- Full `pnpm tc` passes. Renderer build passes, with existing chunk-size/dynamic
  import and CSS `::highlight` warnings.
- Changed-code quality against `0d2d2ba6dd` passes with zero new findings.
- Required Codex review: fixed O(workspaces) work inside a store selector and
  reveal-consumption scroll-back. Follow-up review found no remaining concerns.

## Rendered checks

Fresh built renderer; hidden Electron launched with `ORCA_BACKGROUND_LAUNCH=1`,
checkout-local disposable HOME, and `/tmp/maestro-sidebar-data` userData.
`sidebar-fixes-launch.json` confirms the window is invisible and unfocused.
Playwright CDP viewport: 1280×800. Native-focus tests were not run.

Passed:

- Numbered shortcuts 1–9 match Maestro order. Simulated key events go through the
  real Electron main shortcut handler and IPC bridge; no window activation.
- Collapsing status/custom sections removes their rows from shortcut targets.
- The normal reveal-current-workspace event expands the owning status section.
- An offscreen folder in collapsed Waiting expands, mounts, and scrolls into view;
  manually scrolling away and requesting another reveal works.
- Revealing a non-active row retains its position after the pending request clears.
- No renderer page errors during the interaction run.

Evidence: `sidebar-fixes-interactions.json`. Unit tests independently verify
same-ID copies on local and SSH hosts; no real SSH host was used.

## Hover card and screenshots

The normal-effects settled card originally used `rgba(255, 255, 255, 0.82)` with
opacity 1 and no remaining animations. It now uses the opaque popover token:
`rgb(255, 255, 255)` in light mode and `rgb(23, 23, 23)` in dark mode.
The old reduced-effects surface was already opaque once animation finished, so
mid-animation capture also contributed to the original ghost text.

All of these 1280×800 screenshots were opened and visually inspected:

- `sidebar-fixes.png`: restored normal compact sidebar, no hover overlay.
- `sidebar-fixes-hover-light.png` and `sidebar-fixes-hover-dark.png`: full opacity,
  readable branch/project information, no ghost age/diff text.
- `sidebar-fixes-status-reveal.png`: owning status expanded and target fully visible.
- `sidebar-fixes-folder-reveal.png`: offscreen folder target mounted and visible.
- `sidebar-fixes-hover-effects-before.png`: pre-fix settled normal-effects surface.

Surface values: `sidebar-fixes-surfaces.json` and `sidebar-fixes-hover-effects-before.json`.

## Gate scope and remaining limits

The required branch-base `pnpm check:changed` selects a broad related suite.
Command: `pnpm check:changed --base=ef2a88e6ae --maxWorkers=2 --timeout=2`.
The related unit suite timed out after two minutes; no assertion failures were
emitted before the timeout. Typecheck, formatting, lint, and changed-code quality
passed. Overall, 24 of 25 checks passed; only the related unit selection timed
out. Complete output is in `sidebar-fixes-branch-gate.txt`. The inherited failures and
prior broad-selection resource limits are documented in `NOTES-sidebar.md` and
`sidebar-compact-baseline.json`; full-suite success is not claimed.
The QA-only gate against `0192fe61d9` passed formatting and code quality, but
also initiated a broad dependency scan for evidence `.json`/`.txt` files. That
scan emitted no test results and was stopped after 195 seconds; see
`sidebar-fixes-artifact-gate.txt`. Final clean-state checks against HEAD are
incremental evidence only and do not replace the branch-base run.
The passing focused suite, full typecheck, code-quality gate, and rendered checks
are the scoped evidence for these changes. Native-focus tests, real SSH, and
Windows/Linux rendering need their own environment.

No PR, merge, installation, real user profile, SSH/git configuration, credential
store, other builder checkout, smoke profile, or control-plane LaunchAgent changed.
