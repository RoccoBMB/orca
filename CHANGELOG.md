# Changelog

## 2026-11-07 — Maestro core isolation fixes

- Separated upstream verification from publishing credentials and added the root-entry guard to sync verification. Archived core notes and QA now live in `docs/maestro/`.
- Isolated AppImage caches, service launchers/units, remote lifecycle state, agent hooks/trust and WSL holder coordination using `src/shared/branding.json`.
- Exposed only Maestro PATH commands, including Windows/native and orchestration resume flows; branded the macOS notification helper's embedded identity.
- Revert the `fix(sync)`, `fix(branding)`, `fix(remote)`, and `fix(macos)` commits from this branch to restore prior behavior. Preserve Maestro data before reverting; do not migrate it into official Orca directories. See `NOTES-fixes.md` and `docs/maestro/FIXES-VERIFICATION.md` for evidence and platform limits.

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
  compatibility. Verification and screenshots live in `docs/maestro/qa/REPORT.md`.
- Revert: revert the Maestro feature commits on `rocco/core`; the General setting
  disables Conductor sections independently. Keep a backup of the Maestro profile
  before downgrading.
