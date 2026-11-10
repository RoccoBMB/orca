# Parity iteration 02 verification

Base: `c862b9f66e`, branch `rocco/parity`, requested `Orca-look` worktree.
Scores and trend: [SCOREBOARD.md](SCOREBOARD.md). All captures use generic fixtures.

## Changes

- General surfaces existing queue/scroll and desktop notification settings first.
  Maestro appearance/navigation options remain reachable in a disclosure. Detailed
  Chat UI/Notifications panes and canonical search destinations remain authoritative.
- Transcript summaries omit empty categories and count intermediate prose separately
  from the final answer. Existing timing evidence, failed/interrupted status and
  original tool/output disclosures remain; missing timestamps add no separator.
- Run exposes saved command bodies/actions using existing host filtering, project
  scope matching, command editor and retained-terminal execution. Empty Run leads
  directly to the editor. Setup remains configuration-oriented.

The existing appearance setting gates these presentations. No profile migration,
new command executor, shell syntax, filesystem behavior or provider implementation.

## Gates

- Node 24, disposable HOME, `ORCA_BACKGROUND_LAUNCH=1` throughout.
- Full `pnpm tc` and `pnpm build:maestro` passed. Full packaging includes native
  helpers, web/mobile verification and the packaged daemon PTY check. Archive
  inventory/entry parsing and deep strict codesign verification passed.
- Focused existing UI tests: 18 assertions across seven files passed.
- Exact supplied baseline: 148 files, 1,411 assertions; **1,366 passed, 30 failed,
  15 skipped**. All **1,212 baseline-pass assertions pass; zero regressions**.
  Remaining failures also fail in the baseline. No baseline test files were edited.
  [Comparison](02-test-parity.json), [input/source fingerprints](02-tested-source.json).
- Read-only delegated Codex review covered bugs, edge cases, errors, performance,
  maintainability, remote/folder/platform gates. It found three settings-navigation
  issues; all were fixed and re-reviewed with no actionable findings remaining.
- The initial changed-file gate found a duplicate import and evidence formatting.
  Both were corrected. The full iteration gate then passed **24/24** checks, including
  related unit tests, typechecking, code quality, localization, compiler compatibility
  and import boundaries. [Gate output](02-check-changed.txt).

## Rendered evidence

All six [interaction groups](02-interaction-checks.json) passed through Playwright CDP
on the packaged hidden renderer: tool disclosures, host-acknowledged preferences,
notification dependent controls and canonical navigation, appearance opt-out,
web-client notification guard probe, actual Run output/retained chat and terminal,
empty Run/editor, and light/dark/narrow captures.

Known turn timestamps in the invented transcript/host fixture produce 22s and 38s
metadata. The untimed latest-turn capture omits duration. Settled fold summaries
exclude the final answer and retain the original intermediate prose/tools on expansion.
Fake terminal identity `dev@maestro` was verified in the actual PTY buffer.

Before/after shots in [shots/](shots/) were viewed alongside the external references.
Settings and Run show clearer daily controls; folded transcript metadata is quieter.
No selected-area visual regression required a revert. Repeated command launches
also exposed tab-strip crowding; it is recorded as a next gap, with the tab score
unchanged. Clean comparison captures use a fresh fixture profile.

Captures cover 1440×900, 1280×800 and a 375×812 desktop-renderer view, in light/dark.
The narrow capture and simulated web-client guard are not mobile-client certification.
[Before](02-window-isolation-before.json) and [after](02-window-isolation-after.json)
launch reports verify hidden, unfocused windows and zero renderer page errors.

Initial QA probes were corrected: persisted settings are read through the host API
(the legacy JSON is not authoritative for SQLite profiles); shortcut selectors are
scoped to General; chat restoration activates the unified tab; capture settling uses
fonts and rendered frames instead of awaiting paused retained-view animations.

## Reproduction and boundaries

Use Node 24 first on PATH (`~/.local/maestro-tools/bin`), pnpm 12, a disposable HOME
and userData, isolated Git config, and fake shell prompts. Build alone with
`pnpm build:maestro`; do not write `out/` until packaging exits. Verify archive and
signature, launch hidden and capture generic states through CDP. Temporary drivers
and raw logs remain ignored under `.local/parity/02/`.

For the supplied baseline, build the source-default CLI with
`ORCA_BRAND=orca node config/scripts/cli-build/build-cli.mjs`; run the exact paths
from `Orca-briefs/base-existing.txt` with `--maxWorkers=2` and JSON output, then compare
using `scripts/compare-test-parity.mjs` against `Orca-briefs/base-tests.json`.
Use matching Chromium/WebKit and Node 22 for `ORCA_TEST_LAUNCHER_NODE_EXECUTABLE`.

No reference images, work content, code, assets, icons or fonts were copied into this
public repository. Installed apps, real profiles/accounts/SSH/Git config, smoke data
and the control-plane LaunchAgent were not changed. No PR, install or deployment.
Real SSH/provider runs, native focus behavior and Windows/Linux packaging remain
unverified. `dist/` is removed after verification.

Disable Conductor appearance to restore the earlier presentation. Revert this
iteration's feature commit to remove its code; no settings/schema migration is involved.
The stop condition is not met; no `DONE` marker is created.
