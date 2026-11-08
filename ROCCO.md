# Maestro — built on Orca

Maestro is the personal build of the MIT-licensed Orca fork. The upstream license
and copyright remain in `LICENSE` and About. Configure identity and build defaults
in `src/shared/branding.json`. `config/branding.cjs` selects it only for
`ORCA_BRAND=maestro` builds; source execution and ordinary tests retain Orca
defaults from `src/shared/branding-default.json`. Bundles embed the selected
identity, and the emitted CLI receives its own selected JSON, so runtime shell
variables cannot switch a packaged Maestro into Orca state.

| Identity             | Maestro                                                  |
| -------------------- | -------------------------------------------------------- |
| Product              | Maestro                                                  |
| Bundle / app ID      | `dev.rocco.maestro`                                      |
| URL handler          | `maestro://` (skills and plugin installation)            |
| Packaged profile     | Electron appData / `Maestro`                             |
| Development profile  | appData / `Maestro-dev-wt/<worktree hash>`               |
| CLI command          | `maestro` (development: `maestro-dev`)                   |
| Headless credentials | `~/.maestro`                                             |
| Telemetry            | Off for a new profile; Settings can explicitly enable it |
| Desktop updates      | Disabled, including manual download / install actions    |

Remote installation and lifecycle state use `~/.maestro-remote`; shared-home
machines get their own installation slots and shallow `.maestro-<machine-key>`
data roots. Activation records carry the Maestro app ID. Unmarked or foreign
records are refused rather than adopted. Agent hook scripts and locks use
`~/.maestro`, with `maestro-` script names and separate provider metadata.
Linux AppImage state uses `$XDG_CACHE_HOME/maestro/appimage` (or
`~/.cache/maestro/appimage`), and systemd uses `maestro-serve.service` with a
profile suffix when needed. Packaged and managed-child PATH directories expose
Maestro commands only; official Orca commands remain available through their own
PATH entries.

The official Orca installation and profile are separate. Retained internal `orca`
file names and APIs are upstream compatibility details. Do not seed a development
profile from official Orca. Never point `ORCA_DEV_USER_DATA_PATH` at real Orca data.

## Local build and installation

Use Node 24 and **pnpm 12** (the exact version is pinned in `package.json`). If pnpm
is unavailable, prefix commands with `corepack pnpm`; no Homebrew installation is
needed. If an older Corepack cannot locate pnpm 12's native entrypoint, use the
pinned pnpm package's `bin/pnpm.mjs` entrypoint or a current Corepack.

```sh
pnpm install --frozen-lockfile
pnpm -C mobile install --frozen-lockfile
pnpm tc
pnpm build:maestro
```

macOS builds use an ad hoc signature (`-`), avoiding automatic Keychain identity selection.

`build:maestro` uses Orca's full unpacked desktop build, native-module rebuilds,
and electron-builder validation. On Apple Silicon the result is
`dist/mac-arm64/Maestro.app`; Intel Macs use `dist/mac/Maestro.app`.

```sh
pnpm install:maestro
```

The installer validates the bundle ID, copies into `~/Applications/Maestro.app`,
and leaves launching to you. Quit an older Maestro before replacing it. It never
writes `/Applications/Orca.app`. For a macOS DMG/zip use `pnpm build:maestro:mac`.
For Maestro on Windows/Linux, use `node scripts/maestro.mjs build:win` /
`node scripts/maestro.mjs build:linux` so native and JavaScript builds select the
same identity. Platform builds require their existing native toolchains. Local packages may omit the optional cross-platform orcad template; release builds assemble it on the platform matrix.

For development use `pnpm dev:maestro -- --worktree-profile`. This first rebuilds
the CLI with Maestro identity and uses separate `maestro-bin` wrapper directories. Automated launches must use
`ORCA_BACKGROUND_LAUNCH=1`, disposable HOME and userData, and CDP. Native focus
checks belong on CI or an isolated display.

## Sidebar and top bar

Settings → General → Maestro toggles Conductor sections (on by default). Turn it
off to retain Orca's standard per-project sidebar and grouping options.

- The top navigation reuses Orca's host scopes, activity/dashboard, workspace view,
  creation composer, and search palette.
- Status sections use workspace state, host-scoped PR/MR caches and agent state.
  Explicit workspace statuses take precedence. Matching merged review heads are
  Done, closed reviews Canceled, active agents In progress, open reviews and
  finished/attention agent turns In review. Unknown work starts in Backlog.
- Right-click a row → Status override selects a manual status; Automatic restores
  derivation. These overrides also work for folder workspaces.
- New section creates an optional emoji and name. Its menu renames, changes emoji,
  moves up/down, or removes it. Drag section headers to reorder. Click a header to
  collapse it. Drag rows to sections or statuses, or use Move to section.
- Removing a section returns its workspaces to automatic grouping. Status mode
  shows each workspace once; project grouping remains available by turning
  Conductor sections off in Settings → General → Maestro.
- Section settings and host-qualified assignments persist through Orca's settings
  store. Maestro appearance uses 38px rows (32px when disabled), with activity,
  inline non-zero diff stats, age, keyboard navigation, rename and context menus. Project and branch details live in the
  title hover card; empty status sections are hidden.
- The top bar reuses the workspace context menu. Open in remembers the last app,
  discovers supported installed editors, supports configured custom commands,
  and uses Orca's ownership checks for remote/SSH editor launches.
- Create PR / Create draft PR open Orca's existing Source Control composer; draft
  selection seeds its draft field. Push uses its existing guarded action. Review
  opens the existing review/checks panel. Git actions disappear for folders.
- Files hide dotfiles initially. Files menu → Show Dotfiles persists per workspace.
  Home-directory projects and large non-git folders offer Pick a repository instead.

## Conductor appearance

General → Maestro controls the optional warm appearance, status grouping and hidden
navigation/status-bar entries. Chat UI settings share Maestro's 16px/full defaults
with rendering and reset controls; explicit smaller/comfortable choices persist.
Open-in remembers the last target and shows its native icon where available. The
right panel keeps Git actions/Commit and sync in expandable controls and provides a
resizable Setup/Run/Terminal split. Home-directory files require an explicit reveal.

Implementation, rendered evidence and revert guidance: [NOTES-look.md](docs/maestro/NOTES-look.md).

## Upstream updates

```sh
bash scripts/sync-upstream.sh
```

The script fetches `upstream/main`, creates `sync/upstream-<UTC date>` from
`rocco/main` in a disposable worktree, merges, installs the lockfile, and runs
the root-entry guard, `tc`, affected tests, and `check:changed`. It leaves `rocco/main` unchanged until
review. Conflicts are printed and written to `docs/maestro/qa/upstream-conflicts.txt`.
Override `SYNC_BASE`, `SYNC_BRANCH`, and `SYNC_REPORT` when needed. A failed sync
keeps its branch for inspection and removes the disposable checkout.

The workflow verifies merged code in a read-only job without persisted checkout
credentials, then transfers Git objects to a publishing job that never checks out
or runs merged files. The weekly/on-demand workflow opens PRs **only in RoccoBMB/orca**, targeting
`rocco/main`. Merge or verification failures open an issue with the report and run
link. GitHub schedules execute workflows on the default branch; install this
workflow there to enable the weekly schedule.

## Revert / handoff

`docs/maestro/NOTES-core.md` records build and validation evidence. Revert the relevant Maestro
commits to remove the integration; turn off Conductor sections for the upstream
layout without reverting code. Back up the Maestro profile before any downgrade.

Core isolation fixes and verification: [NOTES-fixes.md](NOTES-fixes.md) and
[verification report](docs/maestro/FIXES-VERIFICATION.md).

Unit-test parity and reproduction: [TEST-PARITY.md](docs/maestro/TEST-PARITY.md).
