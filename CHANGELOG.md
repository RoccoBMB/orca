# Changelog

## 2026-11-09 — Maestro parity iteration 01

- Combined Conductor appearance and Maestro product naming on `rocco/parity`.
- Made expanded tool work easier to scan with visible command verbs, command/file chips
  and row spacing. Enlarged Changes rows/labels/counts with matching virtual estimates.
  Reordered attachment/mic controls and squared Send/Stop. These use the existing
  appearance setting; staging groups, diff actions and responsive overflow remain.
- Fixed inherited sidebar reveal compiler bailouts without changing memoized targeting
  or retry counts. Excluded local caches and changing QA logs from desktop archives.
- Replaced earlier look captures with generic fixtures. Scores, validation and captures:
  `docs/maestro/parity/`; external iteration report: `Orca-briefs/parity/iterations/01.md`.
- Revert the iteration's `feat(maestro)` commit to remove the UI/package changes;
  keep the separate fixture/evidence commit so old screenshot data is not restored.
  No profile/schema migration or installed-app replacement is involved.

## 2026-11-09 — Maestro naming follow-up and QA

- Covered remaining authored text in browser/Web Store prompts, terminal recovery,
  remote previews, CLI formatters and mobile relay/diagnostics surfaces.
- Pruned four obsolete translation keys and regenerated the required runtime catalog.
- Moved naming notes under `docs/maestro/` and removed the root guard exception.
  Disposable profiles and generic fixtures keep user workspace names out of QA.
- Verification and screenshots: `docs/maestro/NOTES-names.md`, `docs/maestro/qa/names-*`.
- Revert this follow-up to restore the previous copy; revert `8954eadd91` as well
  to remove the original naming implementation. No profile/schema migration is involved.

## 2026-11-08 — Maestro product names and original identity assets

- Maestro builds interpolate product/command names in desktop and mobile translations,
  CLI help, native menus/helpers, window/tray/crash names and plugin documentation/approval copy.
- Added an original M-and-baton SVG, desktop icon set and mobile mark. Upstream Orca
  defaults, compatibility identifiers, user values and MIT attribution remain intact.
- Authored-copy build adapters cover desktop/CLI/WSL/remote/mobile bundles without
  rewriting upstream catalogs or interpolated paths. Regression checks exercise the
  packaged hidden app and CLI; verification lives in `docs/maestro/NOTES-names.md`.
- Revert the `feat(branding)` implementation commit for this entry to restore the
  previous presentation. No profile/schema migration is involved.

## 2026-11-08 — Conductor appearance for Maestro

- Added a Maestro-only warm theme, larger chat defaults, status sidebar avatars/diffs,
  underline session tabs, transcript summaries/metadata and the reordered composer.
- Moved PR actions above the right panel; added native Open-in icons, labeled file
  tabs, a retained terminal dock, collapsed home files and reversible navigation/
  status-bar settings. Ordinary Orca defaults and the 148-file parity set remain intact.
- Implementation and QA/reproduction: `docs/maestro/NOTES-look.md` and
  `docs/maestro/qa/look-*`. No installed app was replaced.
- Revert this task's commits beginning at `a6a1d821ab`, newest first. Appearance and
  sidebar sections can also be disabled independently in General → Maestro.

## 2026-11-07 — Orca unit-test parity with explicit Maestro builds

- Restored Orca defaults for source execution and ordinary unit tests through
  `src/shared/branding.ts`; Maestro builds explicitly select `config/branding.cjs`.
- Embedded Maestro identity in desktop, remote CLI/server and WSL bundles, stamped
  the emitted CLI, isolated development wrapper directories, and prevented native
  launcher cache reuse across identities. Maestro update policy stays disabled.
- Kept fork fixture assertions and made their Maestro opt-in explicit; added
  compiled hook/CLI isolation and disabled-updater coverage. The same 148 files
  now preserve all 1,212 baseline-pass assertions (zero regressions).
- Evidence and reproduction: `docs/maestro/TEST-PARITY.md` and
  `scripts/compare-test-parity.mjs`. Revert this task's branding and verification
  commits to restore the previous unconditional Maestro source identity. Back up
  Maestro profiles first; never copy them into official Orca state.

## 2026-11-07 — Maestro core isolation fixes

- Separated upstream verification from publishing credentials and added the root-entry guard to sync verification. Archived core notes and QA now live in `docs/maestro/`.
- Isolated AppImage caches, service launchers/units, remote lifecycle state, agent hooks/trust and WSL holder coordination using `src/shared/branding.json`.
- Exposed only Maestro PATH commands, including Windows/native and orchestration resume flows; branded the macOS notification helper's embedded identity.
- Revert the `fix(sync)`, `fix(branding)`, `fix(remote)`, and `fix(macos)` commits from this branch to restore prior behavior. Preserve Maestro data before reverting; do not migrate it into official Orca directories. See `docs/maestro/NOTES-fixes.md` and `docs/maestro/FIXES-VERIFICATION.md` for evidence and platform limits.

## 2026-11-07 — Sidebar review fixes

- Aligned numbered workspace shortcuts with visible Maestro section order,
  skipping collapsed sections and preserving host-qualified workspace targets.
- Connected reveal requests to Maestro section expansion and virtualized scrolling,
  including repeated folder reveals and explicit reveals of non-active rows.
- Indexed and memoized sidebar group membership; added the requested
  500-workspace performance coverage and regression tests.
- Made workspace hover-card backgrounds opaque in light and dark mode.
- Implementation: `src/renderer/src/components/maestro/`, shared sidebar selection,
  `virtualized-list.tsx`, and the workspace-details hover-card variant.
  Evidence: `docs/maestro/qa/sidebar-fixes*`; details: `docs/maestro/NOTES-sidebar.md`.
- Revert: revert the sidebar review-fix commit(s) on `rocco/sidebar-compact`
  to return to `0d2d2ba6dd`.

## 2026-11-07 — Compact Conductor sidebar

- Made Conductor workspace rows single-line (32px), with activity, truncated title,
  non-zero diff counts and age. Kept project/branch details in the existing hover
  card and retained activation, inline rename and context menus.
- Removed duplicate project groups in status mode, hid empty status sections, and
  made section labels quiet with emoji and a right-side collapsed chevron.
- Added 36px navigation rows and a Search row opening Orca's existing palette;
  reused Orca's keyboard navigation and virtualization for the section order.
- Implementation: `src/renderer/src/components/maestro/`, the optional workspace
  card template, and the sidebar Button variant. QA: `docs/maestro/qa/sidebar-compact*`;
  implementation and verification notes: `docs/maestro/NOTES-sidebar.md`.
- Revert: revert the compact sidebar commit(s) on `rocco/sidebar-compact`, or turn
  Conductor sections off in Settings → General → Maestro to use project grouping.

## 2026-11-07 — Maestro core

- Added a separate Maestro app identity, profile and URL scheme in
  `src/shared/branding.json`, with desktop updates disabled and telemetry off for
  fresh profiles. Kept Orca's MIT license and attribution in About.
- Added optional Conductor navigation, virtualized status/custom sidebar sections,
  workspace moves, and a breadcrumb/Open in/review top bar under
  `src/renderer/src/components/maestro/`.
- Hid dotfiles by default with the existing per-workspace toggle; added a focused
  repository suggestion for home/large folder projects.
- Added local build/install commands, `ROCCO.md`, and weekly upstream sync tooling.
- Preserved Orca CLI coexistence and framework symlinks during Maestro installation;
  made local helper signing ad hoc and reused the shared virtual list for compiler
  compatibility. Split controls and host/section buttons use existing design-system
  APIs. Verification, screenshots and aggregate gate limits live in
  `docs/maestro/qa/REPORT.md`.
- Revert: revert the Maestro feature commits on `rocco/core`; the General setting
  disables Conductor sections independently. Keep a backup of the Maestro profile
  before downgrading.
