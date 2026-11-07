# Orca / Maestro test parity — 2026-11-07

Branch: `rocco/core`; task starting commit: `2cf49e2276`.
Source inputs: `Orca-briefs/test-regressions.md`, `common.md`,
`base-existing.txt`, `base-tests.json`, and `core-rerun.json`.

## Results

The same 148 files contain 1,411 assertions. Both final parity runs preserve
**all 1,212 baseline-pass assertions**, with **zero Maestro-only regressions**.
Duplicate parameterized names are matched by file, full test name and occurrence,
so no assertion disappears from the comparison.

| Run                 | Passed | Failed | Skipped | Baseline-pass regressions |
| ------------------- | -----: | -----: | ------: | ------------------------: |
| Supplied plain Orca |  1,212 |    110 |      89 |                         — |
| Supplied Maestro    |    788 |    577 |      46 |                       452 |
| Final parity run 2  |  1,321 |     44 |      46 |                         0 |
| Final parity run 3  |  1,321 |     44 |      46 |                         0 |

The final 44 failures comprise 31 baseline failures and 13 baseline-skipped
assertions. Another 79 baseline failures and 30 baseline-skipped assertions now
pass. This is parity with the supplied passing baseline, not a claim that every
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
  sidebar default. Orca accepts legacy unmarked activation records; Maestro
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
  branding checks: 35 passed.
- Basic changed-file lint passed. Mandatory independent Codex review completed;
  remote CLI propagation, exact Orca defaults, stale development output,
  native-cache identity and comparator findings were fixed and re-reviewed.
- A default invocation of the fork fixtures passed 331 assertions, with one
  loaded-run activation-fence wait failure and 16 skips. The failing file passed
  all three assertions in each of three isolated reruns (`fence-1/2/3.json`). Its
  existing `vi.waitFor` waits one second for a real shell to create a marker.
  No assertion, timeout or production code was weakened to hide this observation.

Packaged build, hidden-launch/CDP evidence and final changed-check gate are in
progress; this report will be updated before pushing.

## Reproduction

Use Node 24 and place `Orca-briefs/.pnpmwrap` first on PATH. For a disposable HOME,
invoke the cached absolute `pnpm.mjs` entrypoint or provide its cache through a
read-only symlink: the supplied wrapper resolves the cache relative to HOME.

```sh
ORCA_BACKGROUND_LAUNCH=1 pnpm test $(cat /path/to/Orca-briefs/base-existing.txt) \
  --maxWorkers=2 --reporter=json --outputFile=/tmp/parity.json
node scripts/compare-test-parity.mjs /path/to/base-tests.json /tmp/parity.json
pnpm tc
pnpm build:maestro
```

`pnpm dev:maestro` rebuilds the branded CLI before development launch. Direct
platform packaging uses `node scripts/maestro.mjs build:win` / `build:linux`.
Ordinary `pnpm test` retains Orca source defaults; a whole intentional fork run
can opt in with `ORCA_BRAND=maestro`. Real prebuilt-process integration tests also
require a Maestro-built artifact; a Vitest module mock cannot brand a child.

All tests/builds use disposable homes/directories and background launch. No
installed app, real SSH/Git/account configuration, official Orca state,
`~/.maestro-smoke`, control-plane LaunchAgent, other checkout, PR or deployment
was changed. Temporary full logs/results are in ignored `.local/test-parity/`;
compact durable evidence is under `docs/maestro/qa/test-parity-*`.
