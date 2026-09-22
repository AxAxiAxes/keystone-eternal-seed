# 2026-09-14 Duplicate scheduled automation targeting the stale `main` branch

**Status:** Attention — founder decision needed
**Scope:** Repository-only continuity check per standing protocol. No
Railway/DNS/billing/OpenAI/vendor-account/repo-visibility change made; no
external service call; no PR merged, closed, or retargeted; no scheduled
automation paused, edited, or deleted. Findings only.

## Startup protocol followed

Read `README.md`, `PROJECT_TIMELINE.md`, and `docs/memory/README.md` (Latest
handoff + Founder quick answers) before any other action.

## 1. Branch sync

This branch was 9 commits behind `origin/axaxiaxes-axiom-monorepo`. Confirmed
a true fast-forward relationship, fast-forwarded (`git merge --ff-only`, not
a rebase/merge commit) from `59913d6` to `8238575`, and pushed. The 9 incoming
commits were already-merged, already-documented work (PR #37 merge, two new
intake-question templates for `AXES-DMC-001`/`KEYSTONE-COS-001`, and two
Docker Compose environment-variable completeness fixes) — not duplicated
here.

## 2. Open PRs — the significant finding

**16 pull requests are open** (up from 1 at the 2026-09-13 check), all
created between 2026-09-13 22:21 UTC and 2026-09-14 15:42 UTC — roughly one
every hour. All 16 share two properties:

- **Every one targets `main` as its base branch**, not
  `axaxiaxes-axiom-monorepo`. Confirmed the repository's `default_branch`
  API field is still correctly set to `axaxiaxes-axiom-monorepo` (the
  2026-09-12 fix holds), so this is not a recurrence of the earlier
  default-branch misconfiguration — these PRs were opened with an explicit,
  wrong `--base main` (or equivalent) despite the correct default.
- **`main` itself is the same stale branch identified on 2026-09-12**: HEAD
  is still `ecc779e` (2026-09-01, "Certificate of Microcosmic Coordinate and
  Sound Resequencer"), with only **18 tree entries**, versus **291** on
  `axaxiaxes-axiom-monorepo`. None of these PRs' branches contain any commit
  from the real monorepo history beyond that shared ancestor.
- **None of the 16 PRs triggered any CI check.** `AXI continuity validation`'s
  `pull_request` trigger only watches `branches: [axaxiaxes-axiom-monorepo]`
  (`.github/workflows/axi-continuity-validation.yml`); a PR based on `main`
  never matches it. `gh pr checks` on three sampled PRs (#41, #45, #56) each
  returned "no checks reported."

Breakdown by content (verified via `gh pr view --json additions,deletions,changedFiles`):

| Pattern | PRs | Diff shape |
| --- | --- | --- |
| Near-identical "remove duplicate files" | #42, #43, #47, #48, #50, #51, #52, #54, #55 (9 PRs) | Each `+0/-626`, 2 files changed — functionally identical fixes for the same duplication, independently discovered 9 times |
| Related duplicate-removal, slightly different | #46 (`+6/-626`, 3 files), #56 (`-194`, 1 file, "soul protection 2") | Same class of fix, different file set |
| Distinct feature/infra work | #41 (email migration readiness milestone, +171/-1, 3 files), #44 (AXES public web/SEO foundation, +337, 4 files), #45 (AXES website provenance/design brief, +73, 1 file), #49 (`.gitattributes`/`.gitignore` git-performance tuning, +29, 2 files), #53 (add `.md` extensions to 12 extensionless documents) | Not duplicated across PRs, but still based on the stale, abandoned `main` snapshot |

All 16 report `mergeStateStatus: CLEAN` / `mergeable: MERGEABLE` against
`main` — they would merge cleanly into the abandoned branch, but doing so
would not affect the canonical `axaxiaxes-axiom-monorepo` codebase this
entire project runs on, would carry zero CI verification, and (for the 9
duplicate-removal PRs) would apply the same fix 9 times over if merged in
sequence, or conflict with each other after the first merge.

## Root cause: two duplicate, misconfigured scheduled automations

`list_workflows` shows two separately-created, currently `enabled: true`
**hourly** automations, both named "Performance improvements," with the
identical prompt `"Identify 10 performance improvements, then open a PR for
the highest-impact, lowest-effort one."`:

- Automation `5f74833e-40c6-4d51-b4fa-c724ec10016e` — `hostId: "local"`, no
  `projectId` recorded.
- Automation `1487d7de-5dd6-4f14-8bcd-49ec41543ff8` — `hostId: "local"`,
  explicit `projectId` for this project (`keystone-eternal-seed`).

Both were created within a minute of each other on 2026-09-13 22:13–22:14
UTC and have continued running roughly hourly since (most recent runs
2026-09-14 15:40–15:42 UTC, matching PR #55/#56's timestamps almost exactly).
Each scheduled run spins up a fresh autopilot worktree session with no
memory of prior runs' output, so: (a) neither automation checks whether an
equivalent PR is already open before starting, producing the 9-way duplicate
above; (b) whatever resolves each session's base branch is landing on `main`
rather than the project's actual default branch, even though the repository
setting itself is correct.

A third, unrelated scheduled automation, `"axi"` (daily, prompt `"run ai
axi"`), also exists and last ran 2026-09-14 16:01 UTC; no PR or file evidence
ties it to this pattern, and its actual behavior was not investigated further
here — out of scope for this check.

## What this check did and did not do

Consistent with this check's repository-only, observe-and-report scope and
this project's standing practice of not unilaterally acting on
founder-configured operational/automation state (see the "AXI and XIIOM
restart boundary" standing protocol): **no PR was merged, closed, or
retargeted, and neither automation was paused, edited, or deleted.** The
finding is documented here and flagged in the decision register for an
explicit founder decision.

## Recommended founder decisions (not performed here)

1. Decide whether to keep one, both, or neither "Performance improvements"
   automation; if kept, only one should remain enabled to stop duplicate
   work.
2. Before any automation runs again, confirm what determines its session's
   base branch, and correct it to `axaxiaxes-axiom-monorepo` — the repository
   setting is already correct, so this is a session/automation-creation
   behavior, not a repository fix.
3. Decide the fate of the 16 open PRs. None should be merged as-is (wrong
   base, zero CI). Recommended default: close all 16 without merging. If any
   of the five distinct-content PRs (#41, #44, #45, #49, #53) contain work
   the founder actually wants, that content would need to be **redone against
   `axaxiaxes-axiom-monorepo`** by a fresh session — it cannot be safely
   re-based automatically given how far the two trees have diverged (18 vs.
   291 files).

## Live re-check (unchanged)

`https://axescontracting.com/` — connection fails (`000`), consistent with
the existing expired-certificate finding. `http://axescontracting.com/`
(plain) — `200`, legacy content. `https://xiiom.com/health` (control) —
`200`, `{"status":"ok","service":"AXIOM","version":"2.0.0"}`. No change from
2026-09-13.

## Decision register skim

P0/P1 rows otherwise unchanged in substance since 2026-09-13 (two new P1
intake-template cross-references already reviewed as part of this check's
fast-forward). A new P0 row is added for this finding; see
`docs/AXES_TIER_1_DECISION_REGISTER.md`.

## Related records

- [`2026-09-13-repository-continuity-check.md`](2026-09-13-repository-continuity-check.md) — prior check.
- [`2026-09-12-default-branch-correction-and-truth-audit.md`](2026-09-12-default-branch-correction-and-truth-audit.md) — the earlier, related but distinct default-branch-setting fix this finding builds on (that fix holds; this is a new, different failure mode).
- `docs/AXES_TIER_1_DECISION_REGISTER.md` — new P0 row.
