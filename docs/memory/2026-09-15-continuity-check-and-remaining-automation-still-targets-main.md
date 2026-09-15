# 2026-09-15 Continuity check: remaining automation still targets stale `main`

**Status:** Attention — founder decision still needed (P0 row already open)
**Scope:** Repository-only continuity check per standing protocol, in
response to a founder request to continue AXES project management under
`FOUNDER_REVENUE_PRIORITY_OVERLAY.md` and
`KEYSTONE_TIER_1_AUTOMATION_AND_INCOME_PLAN.md`. No Railway/DNS/billing/
vendor-account/repo-visibility change made; no external service call beyond
public USPTO fee-schedule verification (unrelated, performed earlier in this
session); no PR merged, closed, or retargeted; no scheduled automation
paused, edited, or deleted. Findings only.

## Startup protocol followed

Read `README.md`, `PROJECT_TIMELINE.md`,
`FOUNDER_REVENUE_PRIORITY_OVERLAY.md`, and
`KEYSTONE_TIER_1_AUTOMATION_AND_INCOME_PLAN.md`; reviewed
`AXES_TIER_1_DECISION_REGISTER.md`, `AXES_TIER_1_EVIDENCE_LEDGER.md`,
`AXES_DESIGN_MATERIALS_CONSULTATION_READINESS.md`, and
`KEYSTONE_CREATOR_ORIGIN_SETUP_READINESS.md` before any other action.
Working tree confirmed clean, current with `origin/axaxiaxes-axiom-monorepo`
(`2e3e774`, no new commits since the 2026-09-14 automation-disable check).

## 1. Test suites re-verified

`node --test` in both `apps/axiom-engine` and `apps/axiom-freedom`: **98/98
passing**, 0 failures, in each. CI (`AXI continuity validation`) shows all
recent runs `completed`/`success` through 2026-09-14T23:58Z.

## 2. Candidate revenue offers — still not activation-ready (expected)

`AXES-DMC-001` and `KEYSTONE-COS-001` activation records are unchanged since
2026-09-13: every required field (scope confirmation, owner, price basis,
capacity, terms, rights/privacy review, low/base/high forecast) still reads
"Not yet approved" or "Not yet measured" in both readiness sheets and in
`AXES_TIER_1_EVIDENCE_LEDGER.md`. These require founder business decisions
(pricing, named owner, terms) that are outside repository-controlled scope
and were correctly left untouched.

## 3. Open PRs — the P0 automation finding has grown, not resolved

**17 pull requests are now open** (up from 16 at the 2026-09-14 check),
including three new ones opened since that check: #67 (09:07 UTC), #68
(10:09 UTC), and #69 (11:11 UTC) — all today, 2026-09-15. All 17 still:

- **Target `main` as base branch**, not `axaxiaxes-axiom-monorepo`. The
  repository's actual `default_branch` is confirmed still correctly set to
  `axaxiaxes-axiom-monorepo` — this remains a session/automation
  base-branch-selection behavior, not a repository setting.
- **Report zero CI checks** (`gh pr checks 69` → "no checks reported"),
  since the `AXI continuity validation` workflow's `pull_request` trigger
  only watches `axaxiaxes-axiom-monorepo`.
- **Report `mergeStateStatus: CLEAN` / `mergeable: MERGEABLE`** against the
  same stale, abandoned `main` snapshot documented 2026-09-12/13/14.

## 4. Root cause update: the surviving automation is confirmed still active and still misconfigured

`list_workflows` shows:

- Ownerless duplicate `5f74833e-...`: **`enabled: false`**, unchanged since
  the founder-authorized 2026-09-14 disable. No further runs since
  `2026-09-14T23:53Z`. This part of the fix holds.
- Project-scoped `1487d7de-...`: **still `enabled: true`**, and its
  `lastRunAt` is `2026-09-15T11:07:58Z` — it ran again this morning and
  produced PR #69 four minutes later, timestamp-consistent with the
  automation's own hourly schedule. Its base-branch behavior was **not**
  corrected between the 2026-09-14 check and now, so it continues producing
  new stale-branch PRs on schedule, exactly as flagged as an open risk in
  that check's recommended next step.

This confirms the 2026-09-14 finding's prediction: disabling only the
ownerless duplicate stopped double-production but did not stop the
underlying stale-branch-targeting behavior, because that was never the part
addressed. The founder decision to correct (or pause) the remaining
automation, and to close/redo the accumulating PRs, is still outstanding and
has grown by one more day's worth of PRs.

## What this check did and did not do

Consistent with the standing observe-and-report scope: **no PR was merged,
closed, or retargeted, and the remaining automation was not paused, edited,
or disabled.** This finding updates the existing P0 decision-register row
rather than adding a new one, since it is the same unresolved issue, not a
new failure mode.

## Recommended founder decision (unchanged, now overdue)

1. Confirm what determines the remaining automation's session base branch
   and correct it to `axaxiaxes-axiom-monorepo`, or disable the automation
   until that is corrected — it will keep producing a new stale PR roughly
   hourly otherwise.
2. Decide the fate of the (now 17) open PRs. Recommended default unchanged:
   close all without merging; any wanted content from the five
   distinct-content PRs would need to be redone against
   `axaxiaxes-axiom-monorepo` by a fresh session.

## Related records

- [`2026-09-14-duplicate-automation-and-stale-branch-prs.md`](2026-09-14-duplicate-automation-and-stale-branch-prs.md) — prior check; this entry is a same-issue follow-up, not a new finding.
- `docs/AXES_TIER_1_DECISION_REGISTER.md` — matching P0 row updated with this check's date and evidence.
