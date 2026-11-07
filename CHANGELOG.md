# Changelog

## 2026-11-07 — Compact Conductor sidebar

- Made Conductor workspace rows single-line (32px), with activity, truncated title,
  non-zero diff counts and age. Kept project/branch details in the existing hover
  card and retained activation, inline rename and context menus.
- Removed duplicate project groups in status mode, hid empty status sections, and
  made section labels quiet with emoji and a right-side collapsed chevron.
- Added 36px navigation rows and a Search row opening Orca's existing palette;
  reused Orca's keyboard navigation and virtualization for the section order.
- Implementation: `src/renderer/src/components/maestro/`, the optional workspace
  card template, and the sidebar Button variant. QA: `qa-rocco/sidebar-compact*`;
  implementation and verification notes: `NOTES-sidebar.md`.
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
  compatibility. Verification and screenshots live in `qa-rocco/REPORT.md`.
- Revert: revert the Maestro feature commits on `rocco/core`; the General setting
  disables Conductor sections independently. Keep a backup of the Maestro profile
  before downgrading.
