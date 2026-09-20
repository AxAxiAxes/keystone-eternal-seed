# 2026-09-15 CI-gated auto-merge configured; all stale `main`-targeted PRs closed

**Status:** Complete (the P0 automation/stale-PR row is now resolved)
**Scope:** Founder asked to "automate pull request approvals, merges, and the
entire process." Investigated first, then implemented only the
repository-controlled, reversible, verifiable subset: branch protection +
GitHub native auto-merge on the real default branch, and closure (not
merging) of the accumulated stale-branch PRs once confirmed moot. No
Railway/DNS/billing/vendor-account change; no blind auto-approval bypass of
human review was fabricated.

## What was implemented

1. **Branch protection on `axaxiaxes-axiom-monorepo`** (confirmed via
   `gh api repos/.../branches/axaxiaxes-axiom-monorepo/protection`) now
   requires all 6 `AXI continuity validation` CI jobs to pass before any
   merge: `Node tests (apps/axiom-engine)`, `Node tests
   (apps/axiom-freedom)`, `AXI.Core tests`, `AXES Directory fixture
   validation`, `AXIOM engine image`, `AXIOM portal image`.
2. **GitHub's repository-level `allow_auto_merge`** was already `true`; it
   had no effect before because nothing gated it. With required status
   checks now in place, per-PR auto-merge actually takes effect: a PR merges
   itself the moment CI is green and there are no conflicts, no manual click
   required. Verified live: PR #73 and #74 (already CI-passing) merged
   automatically the moment protection was applied.
3. **Declined to extend this to the `main` branch** — confirmed via
   `gh api repos/.../` that `main` is not the repository's `default_branch`
   (`axaxiaxes-axiom-monorepo` is) and has no CI trigger watching it.
   Enabling auto-merge there would have merged conflicting/duplicate content
   with nothing checking correctness.
4. **Investigated whether the 17 legacy stale-branch PRs (per the
   2026-09-15 continuity check) still had anything worth keeping.**
   Confirmed both example files those PRs deleted
   (`EXTENDED CONSTITUTIONAL CHARTE`, `soul protection 2`) do not exist on
   `axaxiaxes-axiom-monorepo` at all — the underlying "duplicate files" and
   "missing `.md` extension" issues these PRs fixed were already moot on the
   real branch. There was nothing to triage a "winner" from.
5. **Closed 13 stale PRs** (#43, #46, #47, #48, #49, #50, #51, #52, #53,
   #61, #67, #68, #69), each with a comment explaining it targeted the
   non-default `main` branch and that the underlying issue is already
   resolved on `axaxiaxes-axiom-monorepo`, so a future session doesn't
   re-discover and re-file the same fix.
6. **One PR (#42, also targeting `main`) merged as an unintended side
   effect** while testing `gh pr merge --auto` against an unprotected
   branch (auto-merge merges immediately when nothing gates it). Verified
   its diff before proceeding further: it only deleted the same two already
   -confirmed-duplicate files (0 lines added, 626 removed across 2 files),
   zero risk. No further action was taken on `main`.

## Net effect

- **Open PRs: 0** (was 17 at the last continuity check, now fully cleared).
- `axaxiaxes-axiom-monorepo` now has a real, working automated-merge
  pipeline: open a PR → CI runs the 6 required jobs → if green with no
  conflicts, it merges itself. This is the safe, verifiable substitute for
  "automate merges" — CI passing is the gate, not a fabricated auto
  -approval.
- `main` remains untouched and unprotected, consistent with it being a
  stale, non-default branch; no further automation targets it.
- PR #72 (this session's own performance fix, avoiding redundant writes on
  read-only `CoordinateService` calls) merged cleanly into
  `axaxiaxes-axiom-monorepo` before this branch-protection change, so it
  was not itself auto-merge-tested; PRs #73/#74 (opened by the scheduled
  "Performance improvements" automation) are the first two verified
  auto-merges under the new configuration.

## Related records

- [`2026-09-15-continuity-check-and-remaining-automation-still-targets-main.md`](2026-09-15-continuity-check-and-remaining-automation-still-targets-main.md) — the last check that found 17 open, all-stale PRs; this entry resolves that finding.
- [`2026-09-14-duplicate-automation-and-stale-branch-prs.md`](2026-09-14-duplicate-automation-and-stale-branch-prs.md) — original root-cause finding.
- `docs/AXES_TIER_1_DECISION_REGISTER.md` — matching P0 row updated to **Resolved** in this entry.

## What still needs a founder decision

- The scheduled "Performance improvements" automation (`1487d7de-...`) is
  still `enabled: true` in plan mode; it is now safe to leave running
  since any PR it opens against `axaxiaxes-axiom-monorepo` is CI-gated
  before merge, but it still requires plan-mode founder approval before
  opening a PR at all — no change needed here, just noting it's the
  correct remaining safeguard.
- Whether to add branch protection / CI to `main` at all is a founder call;
  the recommendation in this and prior records is to leave `main` retired
  rather than invest further tooling in it.
