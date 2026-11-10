# Conductor presentation — 2026-11-08

Current `qa/look-*.png` captures were regenerated with generic fixtures in parity iteration 01. Current scores and verification are in [parity/SCOREBOARD.md](parity/SCOREBOARD.md); the original validation notes below are historical.

Branch `rocco/conductor-look`, based on `14635e6ed5` (`rocco/core`).
Brief: `Orca-briefs/conductor-look.md` and `common.md`; visual references were the
supplied Conductor chat, workspace, top-bar and settings screenshots.

## Delivered

- Optional Maestro appearance layer in `assets/main.css`: warm semantic surfaces,
  cream user messages, solid send control, larger workspace rows and chat spacing.
  Ordinary Orca builds retain their original appearance and 14px/comfortable chat
  defaults. Maestro's shared default is 16px/full; explicit 14px/comfortable choices
  persist, and settings/reset controls use the same defaults as rendering.
- Host navigation, quiet My workspaces label, status glyphs/counts, repo avatars,
  branch marks and monospace diff totals. Rows with changes suppress the age;
  folder/home titles use the folder basename instead of `~`.
- General → Maestro restores onboarding, Tasks, Automations, Mobile and the bottom
  status bar. Accounts and usage opens the existing settings page. The floating
  workspace entry remains reachable with the bar hidden.
- Breadcrumb, branch chip, remembered native Open-in icon and panel toggle; the
  existing PR/draft/push actions sit above the right panel. Underline session tabs
  retain the context menu and middle-click close, with an active rename pencil.
- Existing transcript folding, tool groups, Markdown tables/lists, copy actions,
  timestamps and turn rail are restyled. Recorded turn durations appear beside
  time; unavailable timing is omitted. Failed/interrupted outcomes remain visible.
  The existing latest-message navigation supplies the Next unread presentation.
- Model controls move left; attachment/dictation/send controls sit right. The
  permission control is quieter and the host/folder footer is hidden in Maestro.
- All files / Changes / Review navigation, actual diff summaries and native file
  rows. Git/commit controls remain available in collapsed details. The PR composer
  stays open when invoked. Setup / Run / Terminal reuse existing configuration,
  quick-command and retained-terminal paths. A dedicated dock terminal never
  removes another terminal from its main tab; selecting it there releases docking.
- Home files start collapsed behind an explicit reveal action; the warning stays.
  Maestro resolves home path aliases before comparison; Orca keeps its original
  comparison. Remote ownership and folder capability checks remain in place.

## Validation and evidence

- Node `24.22.2` from `/tmp/maestro-core-tools/bin`, pnpm `12.14.0`.
- Full `pnpm tc` passed. Focused checks passed 39 assertions across 14 files, including
  the disposable home-alias regression. New behavioral checks cover disclosure
  expansion and dedicated dock creation/release/collapse.
- Changed-code quality passed all scans, including type-aware analysis, React
  Doctor, design-system and ast-grep gates. Independent Codex review and follow-ups
  found and resolved dock/focus, window chrome, verdict, summary scope, floating
  entry, mixed-theme contrast, reset/default and onboarding-dismissal issues. The
  screenshot pass also caught missing untracked-file totals and collapsed-dock
  space; both were fixed, independently reviewed and checked in the renderer.
- Full 148-file parity: **all 1,212 baseline-pass assertions preserved; zero
  regressions**. Current result: 1,365 passed, 31 failed, 15 skipped. The 31 failures
  are baseline failures, not new successes or an aggregate pass. The exact
  comparator result and input hashes are in `qa/look-test-parity.json`.
- `pnpm build:maestro` passed; local ad hoc signature and packaged daemon/PTY
  verification passed. No installation or deployment was performed.
- The app was launched hidden with disposable HOME/userData and temporary Git
  repositories. The transcript fixture contains tables, tools and several turns.
  Playwright CDP checked the actual packaged renderer at 1440×900 and 2000×1300.
  Screenshots were opened and compared against the references. Interaction and
  window-isolation evidence is in `qa/look-*.json`; final captures are
  `qa/look-main-1440.png`, `qa/look-main-2000.png`, `qa/look-settings.png`,
  `qa/look-open-in.png`, `qa/look-terminal-dock.png`, `qa/look-home-folder.png`,
  `qa/look-dark.png` and `qa/look-mixed-theme.png`.
- Full branch `pnpm check:changed --base=14635e6ed5 --maxWorkers=2 --timeout=5`
  ran 31 checks. The broad related-unit selection exceeded five minutes. The
  React compiler ratchet reports two bailouts in `use-maestro-sidebar-reveal.ts`,
  which is byte-identical to the base commit. Formatting and unused-class errors
  from that run were corrected and checked separately. Evidence and follow-ups
  are in `qa/look-check-changed.txt`; the gate is not an aggregate pass. The final
  pre-push run is retained in ignored `.local/look/check-changed-before-push.log`.

## Reproduction and boundaries

Use Node 24 first on PATH, a disposable HOME and `ORCA_BACKGROUND_LAUNCH=1`.
Build with `pnpm build:maestro`. For the parity selection, build the ordinary Orca
CLI separately before running `pnpm test $(cat /path/to/base-existing.txt)
--maxWorkers=2 --reporter=json --outputFile=/tmp/parity.json`, then run
`scripts/compare-test-parity.mjs` against the supplied `base-tests.json`. This keeps
source-default tests separate from the embedded Maestro CLI in the packaged app.
The optional Chromium/WebKit coverage needs the matching Playwright browser cache.
The parity summary identifies the final tested source commit and report hashes.
Local fixture drivers and full temporary logs are in ignored `.local/look/`.

Native focus/visible-window tests, Windows/Linux packages, real SSH hosts and real
provider logins were not exercised. Captures use fixture data; permission/model
choices remain those reported by Orca rather than fabricated provider availability.
The installed Maestro/Orca apps, real profiles, SSH/Git/Keychain/account configuration,
`~/.maestro-smoke` and the control-plane LaunchAgent were not changed. No PR or merge
was created. Generated `dist/` and disposable build caches are removed after QA.

## Revert

Turn Conductor appearance and sections off under General → Maestro; chat size and
width remain independently configurable. To remove the implementation, revert this
branch's feature/fix commits beginning with `a6a1d821ab` in reverse order. Preserve
Maestro profile backups before downgrading; do not copy them into Orca profiles.

| Area              | Before                                             | After                                                                 |
| ----------------- | -------------------------------------------------- | --------------------------------------------------------------------- |
| Surfaces and type | Cool chrome, dense chat/sidebar                    | Warm theme, larger shared defaults and spacious rows                  |
| Sidebar           | Extra navigation, generic status rows, `~`         | Optional extras, status glyphs, avatars, diffs and folder names       |
| Header and tabs   | PR in main header, boxed session tabs              | Right-panel PR action, native Open-in icon, underline tabs            |
| Transcript        | Worked-for bars and quiet hover metadata           | Collapsible counts, bordered tables, visible turn metadata and rail   |
| Composer          | Model on right, prominent permission/footer        | Model left, quiet permissions, icons/send right                       |
| Right panel       | Icon navigation, exposed commit form and home tree | Labeled tabs, compact changes, collapsible actions and terminal split |
| Status bar        | Always shown                                       | Hidden by default, restorable with usage settings access              |
