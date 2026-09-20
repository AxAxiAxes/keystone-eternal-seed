# 2026-09-18 — PRs #95–#99 merged; AXIOM engine Docker image fix

## What happened
Founder requested "push everything through." Reviewed live CI/merge status for
all five open PRs on `axaxiaxes-axiom-monorepo` (#95–#99) using
`gh pr list --json autoMergeRequest,mergeStateStatus,statusCheckRollup`.

- PR #96, #97, #98, #99 were `mergeStateStatus: CLEAN` with all 6 required
  checks green, but had no auto-merge request enabled on the individual PR
  (repo-level `allow_auto_merge` being true does not itself enable auto-merge
  per PR — that still needs `gh pr merge --auto` or the equivalent UI action).
- PR #95 (AXIOM chat identity/date-awareness fix) was `mergeStateStatus:
  BLOCKED` — the **AXIOM engine image** required check was failing.

## Root cause (PR #95)
`apps/axiom-engine/Dockerfile` copies each source file into the image
explicitly (no wildcard `COPY`). The identity-fix PR added
`apps/axiom-engine/system-prompt.js` and required it from `chat-service.js`,
but did not add a matching `COPY system-prompt.js ./` line. The built image's
`chat-service.js` crashed at container start with
`Error: Cannot find module './system-prompt'`, which the "AXIOM engine image"
CI job (which builds and smoke-runs the image) correctly caught.

## Fix
Added `COPY system-prompt.js ./` to `apps/axiom-engine/Dockerfile` on the same
PR #95 branch. Verified via `gh api .../check-runs` on the fix commit that all
6 required checks (Node tests × 2, AXI.Core tests, AXES Directory fixture
validation, AXIOM engine image, AXIOM portal image) passed before merge.

## Actions taken
- Enabled GitHub native auto-merge (squash) on PRs #95, #96, #97, #98.
- PR #99 was already in clean/mergeable state; merged directly.
- Result: all five PRs merged into `axaxiaxes-axiom-monorepo`:
  - #95 Fix AXIOM chat missing identity system prompt (+ Dockerfile fix)
  - #96 Draft Axaxar.com launch plan and architecture for founder review
  - #97 Record Main Deck statement and expanded SiteGround domain list
  - #98 Preserve founder KEYSTONE V4 venture analysis document
  - #99 Confirm cryptographic origin anchor and registration system already on GitHub
- Deleted the four now-merged, now-stale remote branches (session hygiene):
  `axaxiaxes-axaxar-launch-plan`, `axaxiaxes-domain-portfolio-update`,
  `axaxiaxes-keystone-v4-venture-analysis`, `axaxiaxes-origin-anchor-presence-check`.
  The session's own tracked branch (`axaxiaxes-axiom-identity-date-prompt`)
  was left in place since this worktree still depends on it.
- Confirmed zero open PRs remain on the repo after this pass.

## Relevance
Confirms the founder's "everything is set for automatic approval and reviews"
statement refers to the existing CI-gated auto-merge configuration (branch
protection + `allow_auto_merge`, established 2026-09-15) — real, working, but
still gated by genuinely passing required checks, not a bypass. One real
regression (the Docker image break) was caught by that gate rather than
merged silently, which is the system working as intended.
