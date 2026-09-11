# PR #1 merge conflict and staging correction

**Date:** 2026-09-11
**Context:** While checking whether the live XIIOM `/origin-continuity` 404
was still present, PR #1 (`axaxiaxes-axes-directory-data-model` into
`axaxiaxes-axiom-monorepo`) was found to have flipped from CLEAN/MERGEABLE to
DIRTY/CONFLICTING because new commits had landed on the base branch.

## What the base branch added

New commits on `axaxiaxes-axiom-monorepo` (tip `275fc4e`) added
`docs/AXES_ASSET_USE_READINESS.md`, `docs/AXES_TIER_1_DECISION_REGISTER.md`,
`docs/KEYSTONE_APPLICATION_ORIGIN_REGISTRY.md`,
`docs/KEYSTONE_TIER_1_AUTOMATION_AND_INCOME_PLAN.md`, and
`docs/keystone/AXIOM_APPLICATION_DRAFT_RECORDS.md`, plus updates to
`PROJECT_TIMELINE.md` and `apps/axiom-freedom/test/axiom-proxy.test.js`. Only
those last two files overlapped with this branch's own changes.

## The real conflict

`git merge origin/axaxiaxes-axiom-monorepo --no-commit --no-ff` showed a
single true conflict: `PROJECT_TIMELINE.md`'s "Current phase" header line,
which both branches had reworded independently. `axiom-proxy.test.js`
auto-merged cleanly since each branch's insertions were in non-overlapping
regions. All timeline table rows auto-merged cleanly (insertions were at
different points in a prepend-newest-first table).

## A pre-existing bug the conflict exposed

Resolving the header by combining both branches' wording produced a
two-line "Current phase" field. Running the portal test suite against that
merge failed: `apps/axiom-freedom/server.js`'s checkpoint parser captures
`currentPhase` with a regex that does not span newlines, so a wrapped field
is silently truncated to its first line. This was a **latent bug already on
this branch before the merge** — the previous single-branch wording
happened to keep the test's expected substring within line 1, masking it.
Fixed by keeping "Current phase" as one unwrapped line (matching the base
branch's own convention) rather than changing the parser, and updating the
one assertion that named the old wording.

## A staging mistake in resolving it (self-reported)

The first attempt to commit this fix (`0a9de82`) was wrong: `git merge`
auto-stages the files it can merge cleanly, so `axiom-proxy.test.js` was
already staged with its **pre-fix** content the moment the merge started.
The follow-up edits to fix the phase text and the test assertion were made
on the working tree only, without re-running `git add`. The merge commit
was created from the stale index, not the working tree, so it silently
carried the *old*, still-broken content even though local `npm test` runs
(against the working tree) showed green. Hosted CI, which checks out the
actual committed tree, caught this immediately (`0a9de82`'s push-triggered
run failed on the exact old assertion).

The correction was a normal follow-up commit (`9943a57`): re-`git add` both
files, re-run all three suites against the now-correctly-staged state, then
commit and push. CI on `9943a57` passed cleanly (10/10 checks), and PR #1
returned to `CLEAN`/`MERGEABLE`.

**Lesson recorded for future merges:** after any edit made following a
`git merge --no-commit`, re-stage the touched files explicitly before
committing — do not assume a passing local test run against the working
tree means the index (what will actually be committed) matches it.

## Verified end state

- `apps/axiom-engine` — 76/76 passing
- `apps/axiom-freedom` — 1/1 passing
- `AXIOM.sln` (AXI.Core) — 5/5 passing
- Hosted CI on `9943a57` — 10/10 checks `SUCCESS`
- `gh pr view 1` — `state: OPEN`, `mergeable: MERGEABLE`,
  `mergeStateStatus: CLEAN`

## Still open

- Whether the live `axiom-web` Railway service is watching
  `axaxiaxes-axiom-monorepo` or a stale build remains an operator
  confirmation item (see
  `docs/memory/2026-09-11-portal-route-and-legacy-dockerfile-review.md`);
  none of this branch's fixes reach production until PR #1 merges and a
  deploy runs.
- PR #1 merging itself is a founder decision, not one this session takes
  unilaterally.
