# Founder pace view and advisory review check

**Status:** Implemented on branch in PR #220. Not on the base branch until the
founder reviews and merges it.

## What this is for

The founder asked for help keeping up with many open pull requests and ideas at
a humane pace. This view puts **one next step** first and keeps everything else
one click away:

| Lens | What it shows | Default |
| --- | --- | --- |
| Fundamentals | The single next step, why it matters, how to do it, and up to three plain reminders | Always visible |
| In review | Each open pull request with state, CI observation, dependencies, a review checklist, and founder confirmation state | Collapsed |
| Needs founder decision | Questions only the founder can answer, the options, and what happens if no decision is made yet | Collapsed |
| Later | Possibilities kept visible but parked | Collapsed |

It lives in the existing protected Command Center at `/command-center`
(section "Founder pace view"). It loads independently of the private engine, so
it still shows when the engine is unavailable.

## Labels

Every item carries one state label and a plain "where this comes from" note.

| State | Meaning |
| --- | --- |
| Proposed | An idea or recommendation. Nothing is built for it. |
| Implemented on branch | Code or docs exist on a pull request branch. Not on the base branch, and not in production. |
| Verified on base | On `axaxiaxes-axiom-monorepo` at a recorded commit. The validator requires a `baseCommit` and never allows it for an open pull request or a parked idea. |
| Externally reported · unverified | Reported by GitHub, a person, or another system, but not confirmed from repository evidence. |

Other distinctions the view keeps separate:

- **CI pass is not founder acceptance.** Automated checklist steps and founder
  steps are separate. A founder step cannot be marked done by a check.
- **A pull request is not production.** Merging and deployment are later,
  separate, human-controlled steps.
- **Founder claims stay founder claims.** Origin Science, OORR-P, patent, legal,
  and valuation wording from other pull requests stays labeled as proposals.
  Nothing here turns them into verified scientific, legal, or financial facts.

## Data source and freshness

The view reads `docs/founder-review/founder-review-board.v1.json`. It is a
**hand-maintained snapshot**, not a live GitHub sync: the app has no GitHub
token and does not call GitHub. The endpoint adds a freshness label from
`recordedAt` ("recent" up to 7 days, then "stale — refresh before relying on it").

To refresh it:

1. Open each linked pull request and its latest CI run on GitHub.
2. Edit the JSON in a pull request: states, `observedAt`, `ciObservation`,
   `ciEvidence`, checklist statuses, and `recordedAt`.
3. Record your own confirmation only after you have reviewed on GitHub: set
   `founderConfirmation` to `{ "state": "confirmed" | "declined",
   "recordedBy": "founder", "evidence": "<link to your GitHub review>" }`.
4. Run `node apps/axiom-freedom/founder-review-board.js` to validate locally.

## Automated checks (advisory)

| Check | Where | What it does |
| --- | --- | --- |
| Validator + unit/UI tests | `apps/axiom-freedom/test/founder-review-board.test.js`, run by the existing `Node tests (apps/axiom-freedom)` job | Validates the board file and the rules below; checks the endpoint is admin-only and the UI escapes all text |
| `Founder review board (advisory summary)` | `.github/workflows/axi-continuity-validation.yml` | Validates the board and writes a read-only markdown table to the run's step summary |

The validator fails closed if the data:

- sets any of `automation.mayApprove`, `mayMerge`, `mayPostReviewComments`, or
  `mayRecordFounderConfirmation` to anything but `false`;
- marks a founder checklist step `done_by_check`, or an automated step
  `founder_confirmed`;
- records founder confirmation without `recordedBy: "founder"` and a GitHub
  evidence link;
- labels an open pull request or parked idea `verified_on_base`, or any item
  `verified_on_base` without a `baseCommit`;
- has a pull request with no founder review step, a link outside this
  repository, or a missing CI evidence link for a recorded CI result.

The workflow keeps `permissions: contents: read`. It does **not** approve,
merge, request changes, post comments, label pull requests, or act as the
founder. It does not touch Railway, DNS, email, payments, patents, or any
external account.

## Pull requests mapped as of 2026-09-30

These are open dependency context, not merged facts. Nothing from them is on
the base branch (`axaxiaxes-axiom-monorepo` @ `7b9a6b4`), and this pull
request does not change their branches.

| PR | Adds (proposed) | Overlap |
| --- | --- | --- |
| #216 (draft) | `.github/scripts/validate-pr-body.js` + tests, a required `PR accountability validation` job, ledger evaluation fields, `/accountability` UI updates | Same ledger file and PR template as #217; same workflow spot as #219 |
| #217 | Origin Science checkpoint, `docs/fixtures/origin-science` validator, ledger evaluation fields | Same ledger file and PR template as #216 |
| #219 (draft) | OORR-P v1 registry, validator, and CI job | Same workflow spot as #216 |

When those merge, their validators run through their own CI jobs. This board
does not duplicate them; update the board's states to `verified_on_base` with
the merge commit once they land.

## Transition path for PR-body rules

This pull request adds **no** new required PR-body sections. If #216's required
Task-ID/accountability check merges, older open pull requests would start
failing it. The board lists this as a founder decision with three options:
apply only to pull requests opened after it merges (older ones use #216's
historical exception path), run it advisory for a transition period, or
require it immediately. Until the founder decides, no new rule applies.

## Manual settings (cannot be set from code)

Repository settings and branch protection are not controlled by files in this
repository. Nothing here enables them, and this document does not claim they
are enabled. GitHub currently reports the open pull requests as "blocked", and
`PROJECT_TIMELINE.md` records CI-gated auto-merge as live; the exact rules are
unverified from the repository.

If the founder chooses to require checks and founder review before merge, an
account owner would:

1. Open **Settings → Rules → Rulesets** (or **Settings → Branches → Branch
   protection rules**) for `AxAxiAxes/keystone-eternal-seed`.
2. Target branch `axaxiaxes-axiom-monorepo`.
3. Turn on **Require a pull request before merging** with **Required
   approvals: 1**, and **Dismiss stale pull request approvals when new commits
   are pushed**.
4. Turn on **Require status checks to pass**, and add the checks that must be
   green, for example `Node tests (apps/axiom-engine)`,
   `Node tests (apps/axiom-freedom)`, `AXI.Core tests`,
   `AXES Directory fixture validation`, `AXIOM engine image`,
   `AXIOM portal image`, and `Founder review board (advisory summary)`.
   Add jobs from #216 or #219 only after they are on the base branch.
5. Decide whether **Allow auto-merge** (Settings → General) stays enabled.
   With required approval on, auto-merge waits for the founder's review.
6. Review **Settings → Actions → General** approval policy for Copilot
   runs (see [CI_CONTINUITY_RUNBOOK.md](CI_CONTINUITY_RUNBOOK.md)). The current
   `action_required` state on #216, #217, and #219 is why their tests have not
   run on the current commits.

Required permission: repository admin. Confirm the result on GitHub; do not
record it as enabled in this repository until it has been checked there.

## Remaining review gates

- Founder GitHub review of each pull request (including this one).
- Founder decisions listed in the board (merge order, PR-body transition,
  branch protection).
- Deployment of the portal is a separate, authorized Railway action; until
  then this view exists only on the branch.
