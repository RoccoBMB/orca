# Core isolation verification — 2026-11-07

Scope: review findings 1–10 on `rocco/core-fixes`, starting at `ef2a88e6ae`.
Findings 11–13 and both sidebar files were excluded. The finding-by-finding status
is in [NOTES-fixes.md](../../NOTES-fixes.md).

## Reproduction and fixes

Before editing, read-only source probes confirmed each producing path/name or
credential boundary. The root guard against `rocco/main` failed and listed
`CHANGELOG.md`, `NOTES-core.md`, `ROCCO.md`, `qa-rocco`, and `scripts`.

| Finding | Regression evidence                                                                                                                                                                                                                                                             |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1       | Sync fixture checks read-only permissions and disabled checkout credential persistence, performs a disposable upstream merge, transfers its Git bundle through the actual publishing shell, and proves upstream files are never checked out in the publishing directory.        |
| 2       | AppImage extraction/registration uses Maestro's cache and leaves an official endpoint unchanged; stable-launcher and pruning tests run alongside it.                                                                                                                            |
| 3–4     | Service installation rejects an alias pointing to official Orca, selects Maestro despite official commands on PATH, and installs/queries/removes its systemd unit while preserving the official unit.                                                                           |
| 5       | Real-shell machine-home, runtime-store GC, activation/recovery/decommission and relay discovery tests; explicit foreign/unmarked activation refusal and official claim/profile-owner preservation.                                                                              |
| 6       | Disposable Windows/macOS/Linux packaging directories expose branded CLI launchers; Windows shim targets `maestro.exe`. CLI/PATH, orchestration resume and remote launcher tests exercise their callers. Rust formatting passed; no Windows native build was attempted on macOS. |
| 7       | Provider installers, Codex trust/reconciliation/cleanup and managed-hook locking tests; install and disable preserve official hook entries and their approvals.                                                                                                                 |
| 8       | Sync fixture rejects an unreviewed upstream root addition; repository guard passes against `rocco/main`. Core notes and QA are archived under `docs/maestro/`.                                                                                                                  |
| 9       | Actual POSIX holder shell consumes Maestro's release request and preserves official release/blocked files.                                                                                                                                                                      |
| 10      | Built the arm64 notification helper with temporary HOME/module caches and `--single-arch --output <temp>`, then parsed its embedded Mach-O Info.plist: `CFBundleIdentifier = dev.rocco.maestro`. The helper was not launched.                                                   |

## Results

- Combined focused run: **98 files passed, 6 files skipped; 528 tests passed,
  33 tests skipped**. Includes all managed-server tests; Codex installation,
  reconciliation and trust; provider hook services; the service, CLI, packaging,
  sync and WSL regressions. Log: `/tmp/maestro-fixes-expanded-final.log`.
- Complete `src/main/cli` run: **32 files passed, 2 skipped; 104 tests passed,
  10 skipped**. Log: `/tmp/maestro-fixes-cli-all2.log`.
- `pnpm tc`: passed after the final implementation changes. Log:
  `/tmp/maestro-fixes-tc-final.log`.
- Basic lint/format and commit hooks passed on the changed files. The checked-in
  test-runner collection guard and RPC parameter catalog check also passed. Rust formatting
  and shell syntax checks passed. Independent Codex review and follow-up found
  no remaining source blockers after its CLI/discovery/smoke findings were fixed.
- `pnpm check:changed --base=rocco/main --maxWorkers=2 --timeout=10` selected
  42 checks across the inherited core feature range. Typecheck and completed
  structural/localization gates passed. The unit and changed-code-quality jobs
  reached the time limit. That early run also caught lint/format errors that were
  subsequently fixed. It was **not** a passing aggregate gate. Log:
  `/tmp/maestro-fixes-changed.log`.
- Scoped `pnpm check:code-quality:changed ef2a88e6ae` reported zero new findings
  in its basic, JS-plugin, casting and focused-plugin scans. Its type-aware scan
  exceeded ten minutes and was stopped. Log:
  `/tmp/maestro-fixes-code-quality.log`. Final pre-push changed-check output is
  retained at `/tmp/maestro-fixes-prepush.log`; broad gate coverage remains a
  limitation unless that final run completes successfully.

Tests used `ORCA_BACKGROUND_LAUNCH=1` and disposable homes/directories, with real
Git configuration disabled for the expanded runs. No installed app, real account
configuration, `.maestro-smoke`, or control-plane LaunchAgent was changed.
The obsolete decommission test that duplicated an official-Orca record algorithm
was removed under the repository's test policy; behavioral recovery tests remain.

No new UI screenshots apply to these runtime/build fixes. Earlier core screenshots
are preserved in [qa/REPORT.md](qa/REPORT.md). Native Windows/Linux packaging,
real host integrations and the scheduled GitHub workflow still require their
platform/CI environments. No PR, issue or deployment was created.
