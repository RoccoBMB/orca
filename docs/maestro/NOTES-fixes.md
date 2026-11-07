# Maestro core fixes

Branch: `rocco/core-fixes`, starting at `ef2a88e6ae`. Findings: `Orca-briefs/core-review.md`.

1. **Fixed** — upstream verification has read-only permissions and no persisted checkout token; a separate publishing job handles only Git objects, without checking out merged code.
2. **Fixed** — the complete AppImage cache, endpoints, locks and pruning live under Maestro's branded cache root; official endpoint preservation is tested.
3. **Fixed** — services select the branded CLI and require its launcher identity marker; official executables and misleading symlinks are rejected.
4. **Fixed** — systemd install/status/uninstall use `maestro-serve[-profile].service`; macOS logs use the branded product directory.
5. **Fixed** — remote slots, claims, runtimes, lifecycle state, machine homes, data roots, legacy sockets and pipes are namespaced; foreign/unmarked activation records and foreign pinned runtimes are refused.
6. **Fixed** — packaged and child PATH directories expose branded commands; Windows shims, native launcher command identity, orchestration resume/recovery, remote launchers and package smoke checks agree.
7. **Fixed** — shared/remote/WSL hook scripts, locks, provider metadata and trust bookkeeping use branded identities; install/disable/legacy cleanup preserve official Orca entries.
8. **Fixed** — intentional fork root entries are allowed; core notes and QA moved under `docs/maestro/`; sync runs the root guard before dependency installation.
9. **Fixed** — WSL holder coordination uses the server's branded home and holder marker; its shell consumes Maestro release requests while preserving official coordination files.
10. **Fixed** — the macOS notification helper defaults to `branding.appId`; an actual built Mach-O embeds `dev.rocco.maestro`.

Findings 11–13 / sidebar files were excluded as requested. All new probes used disposable state; no app was installed or visibly launched. No new screenshots were needed for these runtime/build changes; archived core screenshots now live in `docs/maestro/qa/`.

Combined focused verification passed: 98 files / 528 tests, with 6 files / 33 tests skipped. `pnpm tc` passed. The broad changed-file gate hit its unit/type-aware time limits; full results and remaining coverage limits are recorded in `docs/maestro/FIXES-VERIFICATION.md`. Independent Codex review and follow-up completed; its command/discovery/smoke findings were addressed before committing implementation.
