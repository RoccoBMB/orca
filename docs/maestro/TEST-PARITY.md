# Orca / Maestro test parity — 2026-11-07

Branch: `rocco/core`; task starting commit: `2cf49e2276`.
Source inputs: `Orca-briefs/test-regressions.md`, `common.md`,
`base-existing.txt`, `base-tests.json`, and `core-rerun.json`.

## Results

The same 148 files contain 1,411 assertions. All verified final parity runs preserve
**all 1,212 baseline-pass assertions**, with **zero Maestro-only regressions**.
Duplicate parameterized names are matched by file, full test name and occurrence,
so no assertion disappears from the comparison.

| Run                 | Passed | Failed | Skipped | Baseline-pass regressions |
| ------------------- | -----: | -----: | ------: | ------------------------: |
| Supplied plain Orca |  1,212 |    110 |      89 |                         — |
| Supplied Maestro    |    788 |    577 |      46 |                       452 |
| Final parity run 2  |  1,321 |     44 |      46 |                         0 |
| Final parity run 3  |  1,321 |     44 |      46 |                         0 |

The latest 44 failures comprise 31 baseline failures and 13 baseline-skipped
assertions. Another 79 baseline failures and 30 baseline-skipped assertions now
pass. Run 4 followed Maestro packaging, which intentionally left a Maestro-built
`out/cli` beside Orca-default source tests. Two additional baseline-skipped
subprocess assertions then rejected the `maestro` command identity; this was an
artifact mismatch, not a load flake. Rebuilding the default CLI restored both in
run 5. Packaged Maestro retains its own independent branded copy.

This is parity with the supplied passing baseline, not a claim that every
platform/environment test passes on this macOS host. The initial difference of
467 failures includes baseline-skipped cases; the verified baseline-pass
regression count is 452.

## Root causes and fixes

- **Unconditional branding:** source imports selected Maestro everywhere. That
  changed updater policy, credentials, telemetry, profiles, sidebar selection,
  hooks, remote paths and orchestration commands in untouched Orca tests.
  `branding.ts` now uses verified Orca defaults unless a build embeds identity.
  `config/branding.cjs` selects Maestro only with `ORCA_BRAND=maestro`.
- **Build propagation:** desktop/main/preload/renderer, web, WSL and remote
  server/children/launcher/CLI bundles receive the same compile-time identity.
  The TypeScript-emitted CLI receives selected JSON in its output only. Runtime
  environment variables cannot change a packaged app's embedded identity.
- **Compatibility details:** Orca retains lowercase `orca` profiles, `cli/bin`,
  unprefixed hook scripts, Linux `orca-ide`, visible dotfiles and the original
  sidebar default. Linux generation leasing, stable-launcher discovery, package
  filenames and remote `orca`/`orca-ide` aliases use their original executable
  names; Electron keeps its original `orca` WM_CLASS. Orca accepts legacy unmarked activation records; Maestro
  continues refusing unmarked and foreign records. Hook ownership keeps Orca's
  original matcher and Maestro's strict namespace.
- **Tooling boundaries:** the standalone installed Orca development CLI no longer
  requires branding source files. Packaging checks resource existence before
  writing; Orca packaging preserves original launchers. Maestro development
  first rebuilds its CLI and uses separate wrapper directories. Windows native
  cache identity includes the selected build environment.
- **Tests:** the 148 upstream regression files are unchanged. Existing fixtures
  that intentionally assert Maestro behavior explicitly select that identity;
  their assertions remain intact. Compiled hook tests preserve the other app's
  state even with a contrary runtime environment, and compiled remote CLI tests
  resolve the correct profile. A neighboring updater test retains Maestro's
  disabled automatic/manual update policy.

## Validation

- Full `pnpm tc`: passed after implementation and fixture changes.
- Explicit Maestro isolation: 569 passed, 38 skipped across managed-server,
  CLI/PATH, services, hook/trust, credentials and packaging coverage.
- Sidebar, build-boundary, activation-isolation and update-policy checks passed.
- Default profile, development runner/standalone CLI, native-build and compiled
  branding checks: 35 passed. Linux AppImage/remote-alias follow-up: 14 passed.
- Basic changed-file lint passed. Mandatory independent Codex review completed;
  remote CLI propagation, exact Orca defaults, stale development output,
  native-cache identity and comparator findings were fixed and re-reviewed.
- A default invocation of the fork fixtures passed 331 assertions, with one
  loaded-run activation-fence wait failure and 16 skips. The failing file passed
  all three assertions in each of three isolated reruns (`fence-1/2/3.json`). Its
  existing `vi.waitFor` waits one second for a real shell to create a marker.
  No assertion, timeout or production code was weakened to hide this observation.

## Packaged validation

- Final `pnpm build:maestro` passed using a disposable HOME. The first attempt
  exposed node-gyp/make's unquoted HOME/header paths when HOME contained spaces;
  rerunning with a short system-temporary HOME passed without a source workaround.
  Both temporary build homes and their compiler/header caches were removed.
- The final arm64 bundle is `dist/mac-arm64/Maestro.app`; bundle ID is
  `dev.rocco.maestro`. Strict recursive codesign verification passed with the
  local ad hoc signature. The build also verified its packaged daemon and PTY.
- Playwright CDP launched the packaged app with `ORCA_BACKGROUND_LAUNCH=1`, mock
  Keychain/password storage and disposable HOME/userData. All windows remained
  hidden and unfocused before and after interaction. The disposable profile was
  seeded only to dismiss onboarding; it did not explicitly enable Maestro layout.
- With runtime `ORCA_BRAND=orca`, the app still identified as Maestro, selected
  Conductor navigation by default, showed its Maestro About/Orca MIT attribution,
  and its packaged CLI resolved Maestro's profile. Build identity is immutable.
- Automatic update state remained `idle`; manual check/download left it unchanged;
  listing release builds returned an empty list. No updater request or renderer
  page error was observed during the check. Both screenshots were opened and
  visually inspected at 1280×800.
- Local ad hoc startup logged its existing macOS terminal-host preparation fallback
  and a ready-to-show listener warning; startup and the hidden UI checks passed.
  Signed release/native-focus, Windows/Linux packaging and real remote hosts were
  not exercised on this desktop.

Evidence: [summary](qa/test-parity-summary.json),
[packaged assertions](qa/test-parity-packaged.json),
[main screenshot](qa/test-parity-maestro-1280.png),
[About screenshot](qa/test-parity-maestro-about.png),
[exact 148-file selection](qa/test-parity-files.txt).

## Changed-check limits

`pnpm check:changed --base=rocco/main --maxWorkers=2 --timeout=5` examined 322
changed files across the inherited fork range. **39 of 42 checks passed**,
including typecheck, formatting, lint, localization and completed structural gates.
The unit selection and changed-code-quality step reached their five-minute limits;
four completed non-type-aware quality scans reported zero new findings. The
remaining failure was two React Compiler bailouts in
`src/renderer/src/components/maestro/use-maestro-sidebar-reveal.ts`. Independent
review verified that file is unchanged since task start `2cf49e2276` (both blobs
`bad3ae498d5d6b94e0675ac381a312091381640b`). No aggregate success is claimed.
The [full gate log](qa/test-parity-check-changed.txt) retains exact diagnostics.

The final pre-push scoped gate uses
`pnpm check:changed --base=8321cb725c --maxWorkers=2 --timeout=5`. It covers the
Linux/default-path follow-up and verification documentation after the first
implementation commit; it does not replace the broad gate above. Its final
output is retained in `.local/test-parity/check-changed-final.log`.

## Reproduction

Use Node 24 and place `Orca-briefs/.pnpmwrap` first on PATH. For a disposable HOME,
invoke the cached absolute `pnpm.mjs` entrypoint or provide its existing cache through a
symlink: the supplied wrapper resolves the cache relative to HOME.

```sh
ORCA_BACKGROUND_LAUNCH=1 node config/scripts/cli-build/build-cli.mjs
ORCA_BACKGROUND_LAUNCH=1 pnpm test $(cat docs/maestro/qa/test-parity-files.txt) \
  --maxWorkers=2 --reporter=json --outputFile=/tmp/parity.json
node scripts/compare-test-parity.mjs /path/to/base-tests.json /tmp/parity.json
pnpm tc
pnpm build:maestro
```

`pnpm dev:maestro` rebuilds the branded CLI before development launch. Direct
platform packaging uses `node scripts/maestro.mjs build:win` / `build:linux`.
The direct CLI build above avoids installing a global development symlink.
Ordinary `pnpm test` retains Orca source defaults; a whole intentional fork run
can opt in with `ORCA_BRAND=maestro`. Real prebuilt-process integration tests also
require a Maestro-built artifact; a Vitest module mock cannot brand a child.

All tests/builds use disposable homes/directories and background launch. No
installed app, real SSH/Git/account configuration, official Orca state,
`~/.maestro-smoke`, control-plane LaunchAgent, other checkout, PR or deployment
was changed. Temporary full logs/results are in ignored `.local/test-parity/`;
compact durable evidence is under `docs/maestro/qa/test-parity-*`.
