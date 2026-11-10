# Parity iteration 01 verification

Branch: `rocco/parity`, in the requested `Orca-look` worktree. Source change: `9f4d82ec3b`.
The [scoreboard](SCOREBOARD.md) records all 15 areas and the next three gaps.

## Bootstrap sequence

Created the branch from `origin/rocco/conductor-look`, merged `origin/rocco/maestro-names`
with both intents retained (`4178d68db3`), then fixed inherited sidebar compiler bailouts
(`4599c68b18`). Changelog entries and active appearance/usage translations were retained;
obsolete About/title keys stayed removed. Independent review caught one stale title key.

Before starting iteration changes, full typechecking, 49 focused assertions and the
148-file baseline comparison passed their stated gates. The stabilization gate passed
24/24 checks ([log](bootstrap-check-changed.txt)); `rocco/parity` was then pushed.
The broader merge diagnostic had inherited compiler failures and five-minute fan-out
limits; the compiler failure was fixed before that push, rather than grandfathered.

## Final source and package checks

- Full `pnpm tc` passed. The final clean `pnpm build:maestro` also completed its
  typechecks, desktop/web/mobile builds, native packaging and daemon PTY verification.
- 56 UI/virtualization assertions across 18 files passed; 18 packaging/branding
  assertions across two files passed. No new unit tests or baseline assertion edits.
- Exact final 148-file run: **1,365 passed, 31 failed, 15 skipped**, covering all
  1,411 baseline assertions. **All 1,212 baseline-pass assertions remain passing;
  zero Maestro-only failures.** Every remaining failure also failed in the baseline.
  [Comparator and input/result hashes](test-parity.json).
- [Final broad changed-file gate](iteration-check-changed.txt): **23/24 checks passed**,
  including related unit tests, typechecking, formatting, compiler compatibility,
  localization, design-system checks and import boundaries. Type-aware quality reached
  its five-minute limit. Four completed quality scans reported zero new findings.
  The UI-only quality run had completed before the packaging-only exclusion change.
  **No aggregate broad-gate pass is claimed.** The documentation/evidence gate passed 2/2 checks
  ([log](documentation-check-changed.txt)) and does not replace this result.
- Independent Codex review found no actionable issues in the UI changes. A separate
  packaging review exercised electron-builder's actual matcher and confirmed that
  generated installer metadata still arrives through curated extraResources/hooks.
- The clean archive's package JSON, main facade and preload parse; its inventory
  excludes root `.local/` and `.cache/`. Deep strict codesign verification passed.
  [Artifact hash and metadata](packaged-artifact.json). The intermediate archive that
  included growing logs/browser caches had invalid offsets; it was discarded.

The [tested source fingerprints](tested-source.json) match the committed production
files. Raw results and local fixture drivers remain in ignored `.local/parity/`.

## Rendered checks

All nine [interaction groups](interaction-checks.json) passed on the actual packaged
renderer through Playwright CDP, with disposable HOME/userData and invented fixtures.
Both [before](window-isolation-before.json) and [after](window-isolation-after.json)
launches kept windows hidden and unfocused and recorded zero renderer page errors.

Checked expanded tool output, nested file-link disclosure isolation, actual Git
stage/unstage using keyboard focus and Enter, composer ordering, appearance off/on,
60 fixture files with virtual scrolling to the final row and no overlap, retained
terminal/chat behavior, settings, palette, creation dialog and the temporary-home
folder guard. The dock capture was retaken after the real fake prompt had rendered;
its PTY snapshot contains `dev@maestro`.

Captures cover 1280×800, 1440×900, 2000×1300 and 375×812, plus light, dark and mixed
app/chat schemes. The narrow capture is the desktop renderer, not a mobile-client
certification. Settled captures avoid transition frames and transient project toasts.
The before/after images were viewed with the external Conductor references; the
three changes improved scanability and no visual regression required a revert.

Two initial QA probes were corrected and rerun: hidden-window hover controls were
exercised through their keyboard path, and the virtual-list selector was scoped to
the right panel instead of matching the sidebar's separate virtual list.

## Fixtures and privacy

[Workspace fixture definitions](fixtures/workspaces.json) and the
[saved transcript fixture](fixtures/login-transcript.jsonl) are invented generic data.
No Conductor screenshots, code, assets, icons, fonts, names or work text were copied
into the repository. All eight current `docs/maestro/qa/look-*.png` files were replaced
with captures from this build; [replacement hashes](replacement-captures.json) identify
their new sources. `look-interactions.json` now records this iteration's real checks.
Other historical `look-*.json` reports retain their original provenance. This updates
the current tree; it does not rewrite existing Git history.

## Reproduction and boundaries

Use Node 24 first on PATH and pnpm 12. This machine's pnpm wrapper resolves its CLI
under HOME, so a disposable HOME needs a read-only link to the existing pinned pnpm
cache, or an explicit invocation of that CLI with Node 24. Never use real app profiles.
Set `ORCA_BACKGROUND_LAUNCH=1`, a fake terminal prompt and isolated Git configuration.

For source-default tests, build the ordinary CLI with
`ORCA_BRAND=orca node config/scripts/cli-build/build-cli.mjs`, then run
`pnpm test $(cat /path/to/Orca-briefs/base-existing.txt) --maxWorkers=2 --reporter=json --outputFile=/tmp/parity.json`.
Use installed matching Chromium/WebKit via `PLAYWRIGHT_BROWSERS_PATH`; set
`ORCA_TEST_LAUNCHER_NODE_EXECUTABLE` to Node 22 for the old-runtime probe. Compare
with `scripts/compare-test-parity.mjs` and the supplied `base-tests.json`.

Run `pnpm build:maestro` alone with a disposable HOME. Do not write `out/` until the
entire build/packaging process exits. Verify the archive inventory/entry points and
signature before launching it hidden with separate HOME and userData. Seed the
versioned generic fixtures and capture through CDP. The installed Maestro/Orca apps,
real profiles, SSH/Git/Keychain/account configuration, smoke profile and control-plane
LaunchAgent were not changed. No PR, installation or deployment was performed.

Windows/Linux packaging, real SSH, live provider execution and native-focus/hover
behavior remain unverified. Generated `dist/` is removed after verification.

Disable Conductor appearance to back out the three presentation changes. Revert
`9f4d82ec3b` to remove the iteration's UI/package changes; keep the separate fixture
and evidence commit so old screenshot data is not restored. No profile migration.
