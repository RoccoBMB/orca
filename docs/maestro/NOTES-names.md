# Maestro names — implementation and verification

Branch: `rocco/maestro-names`; existing isolated worktree; task base `14635e6ed5`.
Implementation: `8954eadd91`; copy follow-up: `93a50982d3`; catalog cleanup: `bba0a155dc`.

## Delivered

- Shared product/command interpolation across desktop/main/mobile translations,
  authored display copy, CLI help, plugin documentation and approval prompts.
- Original M-and-baton SVG, app icon set, mobile mark, native helper permission copy,
  window/tray/crash identity and native menus.
- Follow-up coverage for browser/Web Store prompts, terminal recovery/link hints,
  remote previews, CLI account/server/file/plugin formatters, worktree timeout
  guidance, plugin panel errors and mobile relay/host/diagnostic copy.
- Web Store wording receives the product name through serialized main-world args.
  Terminal shortcut templates use Unicode escapes to preserve the renderer boot
  chunks' one-byte string memory contract.
- Default Orca builds, upstream compatibility identifiers, paths/URLs, user values
  and MIT attribution remain intact. Mobile About explicitly labels upstream links.
- Removed four obsolete translation keys and regenerated the required runtime catalog.
  Moved this file under `docs/maestro/` and removed the root guard exception.

## Final verification — 2026-11-09

Node 24.22.2 and pnpm 12.14.0 were used. Full `pnpm tc`, mobile typecheck,
`pnpm build:maestro`, archive package/main/preload validation and deep strict
codesign verification passed. The packaged daemon also served a PTY successfully.
Independent Codex review findings were fixed and re-reviewed with no remaining findings.

Focused groups passed: desktop/CLI/i18n 113; Web Store/plugin follow-up 14;
mobile fallback 6; mobile diagnostics/host follow-up 50. The delivery fixture's
separate recheck passed all 5 tests after restoring the default CLI artifact.
Desktop/mobile localization catalogs and coverage, English extraction and the
regenerated runtime catalog all passed.

### Exact baseline parity

The supplied `Orca-briefs/base-existing.txt` selection contains 148 files and 1,411
assertions. Final results preserve **all 1,212 baseline passes**, with **zero
regressions**: 1,297 passed, 30 failed and 84 skipped. Every remaining failed
assertion also failed in the supplied baseline.

The initial full run skipped 13 baseline-pass assertions: an older-runtime probe
was run with Node 24, a disposable HOME hid Chromium, and the source-ownership
suite's setup did not complete under concurrent load. Re-running those three
files separately with `/usr/local/bin/node` (22.20.0) solely for the old-runtime
probe and the existing `PLAYWRIGHT_BROWSERS_PATH` restored their coverage. The
primary test runner remained Node 24, with disposable HOME. The comparator uses
the full-run suites plus these three replacement suite results, preserving all
148 files, 1,411 assertions, names and occurrence indices. No test/assertion/timeout
was changed. Raw results are retained in ignored `.local/names/finish-parity*.json`;
compact durable evidence is [names-parity-summary.json](qa/names-parity-summary.json).

### Packaged visual and CLI checks

`pnpm test:maestro:names` passed against the final packaged app, with runtime
`ORCA_BRAND=orca` to verify that embedded Maestro identity cannot be switched.
The disposable profile used generic data only, including `My Orca Project` to
prove that dynamic user-provided names/paths survive product interpolation.

The five 1280×800 desktop captures (empty state, sidebar, settings, About and
plugin approval) and the 375×812 mobile About capture were opened and visually
reviewed. All requested product surfaces say Maestro. About retains the permitted
Orca/MIT attribution; technical filenames/API namespaces retain their real names.
Five packaged CLI help variants, CLI errors, native menus and window titles passed.
All windows stayed hidden and unfocused; no renderer page errors were recorded.
The stale failure screenshot was removed by the successful runner.

Evidence: [rendered report](qa/names-rendered.json),
[mobile report](qa/names-mobile-about.json), [verification summary](qa/names-verification.json),
and `qa/names-{empty-state,sidebar,settings,about,plugin-approval,mobile-about}.png`.

A verification attempt rebuilt `out/cli` before electron-builder had fully exited,
corrupting archive offsets. That artifact was discarded. The final full build ran
alone against stable inputs; its archive parsing, signature and hidden UI/CLI checks
then passed. Run default-CLI parity **before** packaging, and never write `out/`
until the whole packaging process has exited. The final archive hash is recorded
in `names-verification.json`; `dist/` was deleted after verification as requested.
The disposable build and diagnostic homes were also removed.

### Changed-check limits

The broad `pnpm check:changed --base=14635e6ed5 --maxWorkers=2 --timeout=8`
passed 38/42 checks. Localization extraction found the four obsolete keys above;
cleanup fixed it, and subsequent extraction passed. Type-aware quality reached
its eight-minute limit; the four completed scans reported zero new findings.
The related unit selection also reached eight minutes; its observed delivery
fixture failure passed the separate recheck described above.

The cleanup scope `--base=93a50982d3 --maxWorkers=2 --timeout=5` passed 20/22
checks, including localization extraction/catalogs/coverage and changed-code quality.
Its remaining failures were the same inherited React Compiler bailouts and the
related unit selection's five-minute limit.

Both gates report two bailouts in
`src/renderer/src/components/maestro/use-maestro-sidebar-reveal.ts`, at lines 30/94.
That file is unchanged from the task base (blob
`bad3ae498d5d6b94e0675ac381a312091381640b`). No aggregate broad-gate success is claimed.
Full outputs: [broad gate](qa/names-check-changed.txt),
[cleanup gate](qa/names-cleanup-check.txt).

The root-entry guard passed against both the task base and `origin/main`.
The final pre-push gate uses `--base=bba0a155dc` for documentation/evidence only;
its output is `.local/names/finish-pre-push.log` and does not replace the broader
results above. Windows/Linux packaging, real remote hosts and native-focus flows
were not exercised on this macOS desktop.

## Reproduction and revert

Put `/Users/roccobombardieri/.local/maestro-tools/bin` first on PATH. Run the exact
148-file baseline with disposable HOME and the available browser/old-Node inputs,
then build Maestro alone. Run `pnpm test:maestro:names` and
`ORCA_BRAND=maestro node tests/tools/maestro-names/mobile-about.mjs`, inspect the
captures, and remove `dist/` when done. Both runners create disposable profiles.

Revert the naming follow-up/catalog cleanup and `8954eadd91` to restore the previous
presentation. No profile/schema migration is involved. No installed app, real
profile, SSH/Git configuration, Keychain, other checkout, smoke profile or
control-plane LaunchAgent was changed. No extra worktree was created.
