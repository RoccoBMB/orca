# Changelog

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
  `qa-rocco/REPORT.md`.
- Revert: revert the Maestro feature commits on `rocco/core`; the General setting
  disables Conductor sections independently. Keep a backup of the Maestro profile
  before downgrading.
