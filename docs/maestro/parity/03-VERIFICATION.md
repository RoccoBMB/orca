# Parity iteration 03 verification

Base: `5d9f44df27`, branch `rocco/parity`, requested `Orca-look` worktree.
The interrupted iteration's changes were reviewed before continuing. Scores and
remaining gaps: [SCOREBOARD.md](SCOREBOARD.md). Every committed capture uses invented fixtures.

## Changes and review

- Tab overflow uses the existing Command/Popover primitives and label/activation paths.
  It includes paired-client browser placeholders without assigning them persisted tab
  ownership. Widths and close/rename affordances are scoped to Conductor appearance.
- Setup uses the existing project hook inspection, command-source policy resolver and
  setup preview. Background inspection does not wake stopped WSL distributions. Local-only
  and folder configurations avoid the shared-file probe. Refresh/retry exposes changed
  configuration and failures; output buttons activate retained terminals. There is no
  new executor, trust bypass or inferred setup-completion status.
- General mounts the existing desktop notification sound selector and volume controls.
  Sound scope, custom-file picker and playback behavior remain those of Notifications.
  The master preference disables dependents; appearance opt-out and web guards apply.

Mandatory read-only Codex review found and corrected repo-authority routing, explicit
terminal activation safeguards and omitted paired-client rows. A refresh action was
also added. Re-review found no remaining actionable source findings. Review did not
independently certify real SSH/WSL or cross-platform execution.

## Gates

- Node 24 first on PATH, pnpm 12, disposable HOME and background-only launches.
- Full `pnpm tc` passed. Existing focused tests passed: eight assertions in five files
  covering dock retention, tab actions/growth, notification saves and setup source policy.
- Exact supplied baseline: **148 files, 1,411 assertions; 1,366 passed, 30 failed,
  15 skipped**. All **1,212 baseline-pass assertions pass; zero Maestro-only failures**.
  Every remaining assertion failure also failed in the supplied baseline. Test files
  were not changed. [Comparison](03-test-parity.json). The final active-tab CSS minimum
  and obsolete English-key cleanup followed this run; final packaging and changed-file
  checks cover those presentation-only edits.
- The source-default CLI was built before the baseline run. Matching Chromium/WebKit
  and `/usr/local/bin/node` (Node 22) served the old-runtime launcher probe, with Node 24
  with the Node 24 wrapper and the repository's pinned Bun/Vitest runner. Source and input fingerprints: [03-tested-source.json](03-tested-source.json).
- Final `pnpm build:maestro` passed, including build-time typechecks, native/web/mobile
  packaging and the packaged daemon PTY probe. Archive parsing, inventory exclusions
  and deep strict codesign verification passed after the builder exited.
  [Final archive metadata](03-packaged-artifact.json).
- All six final rendered interaction groups passed, including sticky active-tab
  visibility after scrolling to the end at 1280px. Hidden/unfocused windows and zero
  renderer page errors were checked at both launch boundaries:
  [before](03-window-isolation-before.json), [after](03-window-isolation-after.json).
- Full changed-file gate: **24/24 passed**. Versioned output and scope:
  [03-check-changed.txt](03-check-changed.txt).
  The earlier source run passed 23/24 checks; only generated evidence formatting
  failed and was corrected before the final gate.

## Rendered checks

The packaged hidden renderer is exercised through Playwright CDP, without OS activation.
[Interaction results](03-interaction-checks.json) cover six groups:

1. Crowded-strip search, keyboard selection, no-match state, slot geometry and retention.
2. Shared/local setup policy, changed-file refresh, real YAML parse failure/retry,
   local-only configuration and a folder-project guard fixture.
3. A paired-client browser row delivered over the real IPC event path, searchable
   selection, and retained output activation returning to an actual fixture PTY.
   The buffer contains the expected fixture output and fake `dev@maestro` prompt.
4. Sound choice and keyboard volume changes acknowledged by host settings, disabled
   notification dependents and volume search. Selection preview used zero volume;
   audible playback and the native custom-file picker were not certified.
5. Appearance opt-out for General/tabs and a desktop-renderer web-client guard probe.
6. Light/dark layouts at 1440×900 and 1280×800, plus a 375×812 desktop-renderer capture.

Generic before/after shots in [shots/](shots/) were visually compared with the external
Conductor references. The wider active label initially disabled sticky docking at
1280px; its minimum was reduced before the final package. No selected-area visual
change required a revert. The narrow capture is not mobile-client certification.

Initial driver probes were corrected: unrelated retained options required Command-scoped
locators, the shared slider's label belongs to its container, and retained inactive
xterms require a visible-terminal selector. Corrected interaction groups were rerun.

## Reproduction and boundaries

Use `~/.local/maestro-tools/bin` first on PATH, a disposable HOME/userData, isolated Git
configuration, fake terminal identity and `ORCA_BACKGROUND_LAUNCH=1`. Build with
`pnpm build:maestro`; wait for packaging before changing `out/`. Check archive parsing,
inventory exclusions and deep strict codesign, launch hidden and inspect through CDP.
Temporary drivers/logs remain ignored in `.local/parity/03/`.

Run the exact test paths in `Orca-briefs/base-existing.txt` with `--maxWorkers=2` and
JSON output, then use `scripts/compare-test-parity.mjs` against `Orca-briefs/base-tests.json`.
Use the PR/iteration base for `pnpm check:changed`; dirty-only checks are incremental evidence.

No reference screenshots, work content, code, assets, fonts or icons were copied into
the public repository. Installed apps, real profiles/accounts/SSH/Git settings, smoke
data and the control-plane LaunchAgent were not changed. No PR, installation or deployment.
Real providers/SSH/WSL, native-focus behavior, Windows/Linux packaging and the actual
mobile/web clients remain unverified. `dist/` is removed after validation.

Disable Conductor appearance to restore the prior presentation. Revert the iteration's
feature commit to remove its code; no profile/schema migration. The stop condition is
not met, so no `DONE` marker is created.
