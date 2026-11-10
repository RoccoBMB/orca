# Maestro / Conductor parity

Scores are reviewer judgments (0–10) of visible UX parity, not measured product statistics. Source screenshots remain outside this public repository. All committed captures use invented generic fixtures.

Iteration 01 baseline: `4599c68b18`, combining appearance and Maestro naming. Reference review: newest live work-area screenshots, chat, settings and top-bar references. Baseline captures: [`shots/`](shots/).

| Area                   | 01 before | 01 after | Evidence / gap                                                                           |
| ---------------------- | --------: | -------: | ---------------------------------------------------------------------------------------- |
| Look / theme           |         8 |        8 | Warm surfaces and own Geist typography; remaining chrome density differences.            |
| Sidebar                |         8 |        8 | Status sections, counts, workspace names and real diff totals.                           |
| Top bar                |         8 |        8 | Breadcrumb, branch, native Open-in and right-panel PR controls.                          |
| Tabs                   |         7 |        7 | Underline active tab; terminal actions remain noisier.                                   |
| Transcript             |         7 |        7 | Tables, lists and user bubbles; metadata/turn spacing still differ.                      |
| Tool calls             |         6 |        8 | Visible command verbs and command/file chips; existing output/diff disclosures retained. |
| Composer               |         7 |        8 | Model left; attachment before mic and a square primary control; narrow layout fits.      |
| Right panel            |         6 |        8 | 38px file rows, 14px labels and 12px mono counts; 60-file scrolling verified.            |
| Terminal / setup / run |         6 |        6 | Dedicated dock exists; setup/run remain configuration-oriented.                          |
| Settings               |         5 |        5 | General settings inspected; dense categorization differs from the reference.             |
| New workspace*         |         6 |        6 | Creation dialog inspected; project/host/agent options are feature-rich but busy.         |
| Command palette*       |         7 |        7 | Palette inspected; keyboard navigation, search and workspace context remain useful.      |
| Empty states*          |         7 |        7 | Initial empty project view offers add/create actions.                                    |
| Keyboard shortcuts*    |         6 |        6 | Platform-aware bindings; exact Conductor mapping is not verified.                        |
| Onboarding*            |         6 |        6 | Intro prompt/checklist available; hidden navigation is reversible.                       |

*Provisional compatibility judgments: supplied references do not establish the corresponding Conductor flow. They are not claims of measured behavioral equivalence. Native focus, real providers, real SSH and Windows/Linux packaging are outside this macOS fixture run.

## Highest-value gaps selected for 01

1. Tool-call scanability: retain existing disclosures/diffs while adding visible verbs, command/file chips and clearer row spacing.
2. Changes scanability: larger file labels/counts and comfortable rows, with matching virtual-list estimates. Preserve staging/conflict/branch distinctions.
3. Composer actions: a square primary control and attachment-before-mic ordering, keeping responsive overflow and actual send/stop behavior.

All three use the existing Conductor appearance setting. The before/after shots were viewed with the external Conductor references; no regression required a revert. Own primitives, fonts and assets are retained.

## Trend

Iteration 01: tool calls **6 → 8**, composer **7 → 8**, right panel **6 → 8**. Other scores remain unchanged. [Before main](shots/01-before-main.png), [after main](shots/01-after-main.png), [before tools](shots/01-before-tools.png), [after tools](shots/01-after-tools.png). Light, dark, mixed-theme, 1280×800, 2000×1300 and a 375×812 desktop-renderer view are in `shots/`.

## Next three gaps

1. General settings: make common chat/notification preferences easier to reach; the Maestro section currently dominates the first screen.
2. Transcript metadata: tighten turn folding and settlement metadata around final answers. Omit duration when evidence is unavailable.
3. Setup / Run: expose configured commands and their actual results more directly, preserving Orca's retained terminals and configuration options.

The stop condition is not met: several areas remain below 9, and flow scores still need direct Conductor references. No `DONE` marker was created.

## Verification

Full typechecking, 74 focused assertions, the 148-file baseline comparison and all nine rendered checks passed. All 1,212 baseline-pass assertions remain passing; the 31 remaining failures already failed in the supplied baseline. The broad changed-file gate passed 23/24 checks; type-aware quality reached its five-minute limit after four completed scans reported zero new findings. This is not an aggregate broad-gate pass. See [verification](VERIFICATION.md) for scope, reproduction and limits.
