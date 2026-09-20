# 2026-09-18 (u) — founder action queue created (profitability-ordered summary)

## What was requested

The founder asked whether merges/reviews could be automated further, and
asked for a separate, prioritized list of the tasks that require the founder
personally, ordered by the current plan and profitability.

## What was done

- Confirmed and continued the existing automation pattern already in place:
  focused PR → CI (6 required checks) → `gh pr merge --auto --squash` →
  verify green → merge. This already auto-merges repository-scoped changes
  once CI passes; it cannot and does not touch billing, DNS, legal, or
  account-level actions, which is a deliberate safety boundary (see
  `docs/AXI_AUTOMATION_SERVICE.md` and the repo's own restart-boundary
  custom instructions).
- Created `docs/keystone/FOUNDER_ACTION_QUEUE.md`: a short, six-item,
  profitability-ordered list of exactly the actions that require the founder
  (Railway billing/trial, approving the first paid service, domain/DNS,
  repo visibility, a second paid offering, URNUR scope). It intentionally
  does not duplicate the full evidence trail already in
  `docs/AXES_TIER_1_DECISION_REGISTER.md` — it is a short navigational
  summary, ordered strictly by revenue impact, meant to be re-read quickly
  rather than re-derived from the much longer register each time.
- Cross-linked from `docs/keystone/README.md`.

## Honest framing

This list reflects the same priorities already recorded in
`FOUNDER_REVENUE_PRIORITY_OVERLAY.md` and the Tier-1 decision register; it is
a reorganization for readability, not new research or a new decision. No
external account, billing, DNS, or legal action was taken or authorized by
creating this file.
