# 2026-09-15 Automation governance fix: plan-mode gate and base-branch guardrails

**Status:** Attention — fix applied and in-progress verification; the 17
stale PRs from prior runs are still an open founder decision
**Scope:** App-level automation-configuration change only (Copilot workflow
scheduler settings for this project), performed with the founder's explicit
in-session direction after reviewing the 2026-09-14/2026-09-15 continuity
findings. No GitHub repository setting, Railway/DNS/billing/vendor-account
change, external publication, or client-facing action was made.

## Context

The founder confirmed the remaining "Performance improvements" automation
(`1487d7de-...`) is intentionally configured for automatic (unattended)
runs, and asked to correct the underlying base-branch bug, then set up
approvals/review for its future runs.

## Root cause identified

The actual defect is not a GitHub repository setting (`gh api
repos/.../keystone-eternal-seed` confirms `default_branch` is correctly
`axaxiaxes-axiom-monorepo`). It is this Copilot app's own **cached project
configuration**: `list_projects` shows the `keystone-eternal-seed` project
record still has `default_branch: "main"`, set when the project was first
added on 2026-09-09 (before the repository consolidated onto
`axaxiaxes-axiom-monorepo`) and never resynced. New automation sessions
branch from this cached project setting, not GitHub's actual default
branch. Re-adding the project via `create_project` did not refresh this
field, and no tool available in this session can edit a project's cached
`default_branch` directly; `save_workflow`'s `remote_branch` override
explicitly only applies to non-local/cloud workflows, and this automation
runs `hostId: "local"`. **This means the underlying stale project setting
still requires a founder action in the app's own project settings UI to
fully close** — it was not (and could not be) corrected from this session.

## Mitigation applied within this session's reach

Since the project-level setting itself could not be changed, the automation
was reconfigured directly, with the founder's explicit go-ahead:

1. **Mode changed from `autopilot` to `plan`** (`1487d7de-...`). Future
   scheduled runs must now pause and present their proposed change for
   founder approval before writing code or opening a pull request, instead
   of executing unattended.
2. **Prompt updated** to require, before any action: confirming the
   worktree is actually on `axaxiaxes-axiom-monorepo` (stopping and
   reporting a blocker if not), explicitly passing `--base
   axaxiaxes-axiom-monorepo` to any PR creation rather than relying on a
   default, and checking for an existing open PR covering the same
   improvement before proposing a new one (to stop the 9-way duplicate
   pattern from 2026-09-14).

## Verification so far

Immediately after the change, `list_workflows` showed the automation's next
scheduled run start at `2026-09-15T13:10:52Z` in the new `plan` mode. As of
this record, that run is still in progress (`status: "running"`); `gh pr
list` at the same time shows **still 17 open PRs, no new PR since #69**
(the last one opened under the old `autopilot` configuration) — consistent
with, but not yet full proof of, the new plan-mode gate holding. This
record will be updated once that run completes and its outcome (paused for
approval, or a blocker report per the new guardrails) is confirmed.

## What remains open

1. **Founder action still needed**: correct the `keystone-eternal-seed`
   project's cached default branch from `main` to
   `axaxiaxes-axiom-monorepo` in the app's project settings, since no tool
   in this session can do it.
2. **17 stale PRs (#41-#69)** from before this fix remain open, all
   zero-CI, all based on the abandoned `main` snapshot — a founder decision
   on closing/redoing them is still pending, unchanged from the prior
   check.

## Related records

- [`2026-09-15-continuity-check-and-remaining-automation-still-targets-main.md`](2026-09-15-continuity-check-and-remaining-automation-still-targets-main.md) — the finding this fix responds to.
- [`2026-09-14-duplicate-automation-and-stale-branch-prs.md`](2026-09-14-duplicate-automation-and-stale-branch-prs.md) — original finding.
- `docs/AXES_TIER_1_DECISION_REGISTER.md` — matching P0 row updated.
