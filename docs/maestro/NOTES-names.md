# Maestro names — implementation checkpoint

Branch: `rocco/maestro-names`; existing isolated worktree; base `14635e6ed5`.

Implemented shared product interpolation for desktop/main/mobile translations, branded CLI help,
original M-and-baton SVG/icons, desktop/mobile logos, native helper identity/permission copy,
window/crash/tray names, and safe authored-copy adapters for desktop, CLI, WSL and remote bundles.
Only static authored copy changes; dynamic paths, URLs, plugin names and compatibility identifiers
remain opaque. Default source builds keep Orca. About retains upstream MIT attribution.

Independent Codex reviews found and resolved dynamic-data conversion, plugin API docs, executable
variants, emitted CLI namespace handling, and a product-specific error classifier. Final independent remote/mobile review found additional authored-copy bypasses in remote
preview, terminal notices/link hints, browser prompts/permissions and CLI compatibility/recovery
guidance. Narrow owning-boundary adapters fix these; re-review reports no outstanding findings.

Verification so far: Node 24 `pnpm tc` passed; focused groups passed (latest 38 tests).
148-file parity retained all 1,212 baseline passes, zero regressions; 33 failures/82 skips are outside
that baseline passing set. One focused terminal-host fixture failure also exists in the supplied
baseline. First `pnpm build:maestro` passed. Hidden packaged UI captures cover empty state, sidebar,
settings, About and plugin approval; window/menu identity is Maestro and all windows stayed hidden.

Resume verification and final results are recorded below. Generic test data includes
`My Orca Project` specifically to prove that user-provided names survive product interpolation.
Mobile About now labels upstream links as attribution, keeping original link destinations
and the ordinary Orca build unchanged. The root notes file has moved here; the root guard
no longer exempts it. Successful rendered verification removes stale failure screenshots.

No installed app, real profile, SSH/Git configuration, Keychain, other checkout, smoke profile or
control-plane LaunchAgent was changed. No extra worktree was created.
