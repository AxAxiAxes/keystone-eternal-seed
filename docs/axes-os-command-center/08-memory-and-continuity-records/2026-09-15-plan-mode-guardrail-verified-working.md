# 2026-09-15 Plan-mode guardrail verified working (PR #70)

**Status:** Attention — mitigation empirically confirmed; the 17 legacy
stale PRs and the underlying cached project setting remain open founder
decisions
**Scope:** Repository-only continuity check per standing protocol. No
Railway/DNS/billing/vendor-account/repo-visibility change; no external
service call beyond the routine public `axescontracting.com`/`xiiom.com`
live re-check; no PR merged, closed, or retargeted; no automation
paused/edited/deleted.

## Startup protocol followed

Read `README.md`, `PROJECT_TIMELINE.md`, and `docs/memory/README.md` (latest
entry: the same-day `2026-09-15-automation-governance-plan-mode-fix.md`)
before any other action.

## 1. Branch sync

Local branch was 3 commits behind `origin/axaxiaxes-axiom-monorepo`
(`edaa2f3` → `112e946`), picking up the founder-authorized automation disable
(2026-09-14), the "still targets main" follow-up check, and the plan-mode
mitigation — all already covered by their own memory entries. Fast-forwarded
cleanly and pushed; working tree confirmed clean throughout.

## 2. The plan-mode + prompt guardrail fix is now empirically verified

The remaining automation (`1487d7de-...`) ran again this morning
(`lastRunAt: 2026-09-15T15:15:52Z`) and produced **PR #70**
("perf: avoid full-log parse before slicing in `MemoryStore.list()`"). Unlike
every one of the prior 17 PRs, #70:

- **Targets `axaxiaxes-axiom-monorepo` as its base branch** — the first
  automation-generated PR since 2026-09-13 to do so.
- **Triggered the full CI suite and passed all of it** (fixture validation,
  AXI.Core tests, both Docker image builds, both Node test suites), since a
  PR against the real branch matches the workflow's `pull_request` trigger.
- **Reports `mergeStateStatus: CLEAN` / `mergeable: MERGEABLE`.**
- **Explicitly documents in its own PR body** that it confirmed the correct
  base branch and checked for an existing duplicate PR before opening,
  matching the new prompt's required steps verbatim.

This is the first direct, empirical proof that the 2026-09-15 plan-mode/
prompt-guardrail mitigation works in practice, not just in configuration.

## 3. The underlying cached project setting is still unresolved — and turned out not to be required for this fix

`list_projects` was re-checked this session: the `keystone-eternal-seed`
project record still reports `default_branch: "main"`, unchanged from the
prior finding. This confirms the deeper defect (a stale app-level project
setting, distinct from GitHub's correctly-configured repository default
branch) has **not** been corrected, and still requires a founder action in
the app's own project settings UI — no tool available in this session can
edit it.

Notably, PR #70's correct targeting shows the **prompt-level guardrail
alone was sufficient** to route around the stale cached default, without
needing that deeper setting fixed first. This narrows, but does not close,
the founder's outstanding action: the cached setting could still cause
problems for *other* automations or sessions on this project that do not
carry the same explicit `--base` instruction.

## 4. Current PR/issue/CI state

- **18 pull requests open** (17 legacy, all still targeting stale `main`,
  zero CI, unchanged from the prior check; plus the new, correctly-targeted,
  CI-green #70).
- **0 open issues.**
- **0 CI failures** on `axaxiaxes-axiom-monorepo` — the 8 most recent runs
  are all `completed`/`success`.
- Decision register P0/P1 rows otherwise unchanged in substance; the
  candidate revenue offers (`AXES-DMC-001`, `KEYSTONE-COS-001`) were
  reconfirmed as not activation-ready by the prior same-day check and were
  not re-derived here.
- `axescontracting.com`: HTTPS still fails with the same expired
  certificate (`SEC_E_CERT_EXPIRED`); plain HTTP still returns the legacy
  `200` page. `xiiom.com/health` still returns
  `{"status":"ok","service":"AXIOM","version":"2.0.0"}`. Both unchanged.
- The unrelated daily `axi` automation (`c9270edb-...`) also ran today
  (`16:01:52Z`); no PR title in the open-PR list matches its generic prompt,
  so there is still no evidence tying it to the stale-branch pattern —
  consistent with the 2026-09-14 finding's decision not to investigate it
  further absent such evidence.

## What this check did and did not do

PR #70 was **not** merged by this check, consistent with this task's
observe-and-report scope and this project's established practice of not
merging PRs it did not itself author (see the 2026-09-13/2026-09-14 handling
of PR #37/#38). It is left open and available for the founder or another
session to merge when ready.

## Recommended founder decisions (updated, not new)

1. Correct the `keystone-eternal-seed` project's cached default branch from
   `main` to `axaxiaxes-axiom-monorepo` in the app's project settings — still
   outstanding, though now lower-urgency given the prompt guardrail is
   independently working.
2. Decide the fate of the 17 legacy stale PRs (recommendation unchanged:
   close without merging; redo any wanted content against the correct base).
3. Decide whether to merge PR #70 — it is clean, CI-green, and
   correctly-targeted, and appears safe to merge on its own technical
   merits whenever convenient.

## Related records

- [`2026-09-15-automation-governance-plan-mode-fix.md`](2026-09-15-automation-governance-plan-mode-fix.md) — the fix this check verifies.
- [`2026-09-15-continuity-check-and-remaining-automation-still-targets-main.md`](2026-09-15-continuity-check-and-remaining-automation-still-targets-main.md) — the finding that motivated the fix.
- [`2026-09-14-duplicate-automation-and-stale-branch-prs.md`](2026-09-14-duplicate-automation-and-stale-branch-prs.md) — original finding.
- `docs/AXES_TIER_1_DECISION_REGISTER.md` — matching P0 row updated with this verification.
