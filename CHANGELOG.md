# Changelog

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
