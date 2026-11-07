# Compact sidebar QA — 2026-11-07

Branch: `rocco/sidebar-compact`. Comparison base: `ef2a88e6ae`.

## Delivered

32px single-line workspace rows with the existing status glyph, truncated title,
non-zero diff totals and age inside the selected pill. Branch and project details
are in the existing rich hover card. Status mode shows each host-qualified
workspace once, hides empty status sections, and keeps user emoji sections.
Navigation uses five 36px rows; Search opens the existing palette. Turning off
Conductor sections restores Orca's original project grouping.

## Checks

| Check                                     | Result                                                                                                                                                                                                                                                       |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Full `pnpm tc`                            | Passed                                                                                                                                                                                                                                                       |
| Focused unit tests                        | 5 files / 18 tests passed                                                                                                                                                                                                                                    |
| Changed-code quality against `ef2a88e6ae` | Passed, zero new findings                                                                                                                                                                                                                                    |
| Delegated Codex review                    | Rename subtree and sleeping-title sizing defects fixed; follow-up clean                                                                                                                                                                                      |
| Broad `check:changed`                     | Three failures reproduced on untouched `ef2a88e6ae`; final related-test selection limited after excessive fan-out and memory pressure. Initial design/localization findings and generated-JSON formatting were corrected; QA-only changes checked separately |
| Hidden app isolation                      | Main-process verification: invisible, unfocused window; disposable HOME/userData                                                                                                                                                                             |
| CDP at 1280×800                           | 12 complete workspace rows; each 32px; five navigation rows each 36px                                                                                                                                                                                        |
| Navigation/interaction                    | Palette, collapse, keyboard order, rename, context menu and section drop passed                                                                                                                                                                              |
| Rich metadata                             | Actual +3 −1 Git changes; project/branch hover; zero totals hidden                                                                                                                                                                                           |
| Theme / sleeping row                      | Light/dark; long sleeping title truncates with age retained                                                                                                                                                                                                  |
| Original mode                             | Project grouping remains available through the setting                                                                                                                                                                                                       |
| Larger catalog / folder                   | 37 git + 1 folder workspace; 25 rows mounted when scrolled; folder activates without PR actions                                                                                                                                                              |
| Persistence                               | Sections, assignments, collapse and rename survived app restart                                                                                                                                                                                              |

The first 14-workspace fixture shows 12 across In review, In progress and
Orchestrators; two remain under collapsed Waiting. Optional Tasks, Automations,
Mobile and onboarding entries were hidden through the normal controls/settings to
match the requested primary navigation. Added workspaces and a folder were then
assigned to Waiting for the scrolling check. These are disposable fixtures, not
user project data.

## Rendered evidence

All screenshots are 1280×800 CDP captures of hidden renderers and were visually
inspected. Metadata and assertions are in the adjacent `sidebar-compact-*.json`.

- `sidebar-compact.png`: final compact layout, selected row and twelve complete rows.
- `sidebar-compact-hover.png`: full title, branch and project in the hover card.
- `sidebar-compact-collapsed.png`: right-side chevrons and emoji sections.
- `sidebar-compact-context.png`, `sidebar-compact-search.png`: existing interaction surfaces.
- `sidebar-compact-dark.png`: new-card sleeping state, long title and retained age.
- `sidebar-compact-projects.png`: original setting remains functional.
- `sidebar-compact-folder.png`: scrolled catalog and folder activation.

## Limits

`sidebar-compact-baseline.json` records the exact inherited failures: two lineage
expansion tests have a partial store mock that enables default Conductor mode, and
one creation-handoff test omits the Maestro editor-discovery preload API. Each
fails on the pinned base without the compact changes. Full-gate success is not
claimed. The final broad related-test selection was stopped after more than 16
minutes of memory pressure; the passing focused suite and rendered assertions are
the scoped behavioral evidence. The QA-only commit is checked separately against
the feature commit, so artifact formatting does not require repeating UI tests. Native-focus tests remain excluded on the user's desktop. Real SSH and
Windows/Linux rendering require their environments.

No PR, merge, installation, real profile, SSH config, git config, credential store,
other builder worktree, control-plane LaunchAgent or `~/.maestro-smoke` was changed.
Implementation and reproduction details: [NOTES-sidebar.md](../NOTES-sidebar.md).
