# Resource basis and competitive position added to the business plan

**Date:** 2026-09-11
**Context:** The founder made a business-philosophy point immediately after
the value-acceleration proposal was declined: real businesses are built from
a real resource, revenue should follow only where a service reciprocates
real value, and since AXES cannot out-scale large incumbent platforms, its
competitive strategy should be to compete on ethics, quality, and a more
human, more caring service instead of scale.

## What was checked first

Confirmed the founder's "account for resources and clear financial
perspective" point is already substantially met: `docs/PROJECT_BUDGET.md`
carries real, ranged first-year budget planning ($17,720-$57,080), spending
gates by priority, and a monthly review checklist — genuine resource
accounting, unlike the fabricated figures declined in the prior turn. What
was missing was an explicit statement of competitive strategy: nothing in
`AXES_BUSINESS_PLAN.md` or `AXES_DIRECTORY_READINESS.md` said how AXES
intends to compete against larger, better-funded incumbent directory and
marketplace platforms.

## What was added

A new "Resource basis and competitive position" subsection in
`docs/AXES_BUSINESS_PLAN.md` (under "Value proposition"). It states plainly
that every offer is built from a real founder-controlled resource (skill,
existing client relationships, or the recorded operating budget), not a
speculative valuation, and that revenue is expected to follow only where a
service reciprocates real value — matching the staged revenue model already
in the plan.

It then states the AXES Directory's competitive position directly: AXES does
not attempt to out-scale large incumbent platforms and makes no claim about
how any specific competitor operates (consistent with the "Public claim
gate" in `AXES_CREATOR_ORIGIN_CONSTITUTION.md`, which restricts unverified
competitor claims). Instead, its differentiation is quality and trust —
opt-in, human-reviewed listings rather than scraped data, a recorded source/
approval/renewal date rather than an indefinite entry, and a working
correction/removal path. These are pointed at already-committed data-model
requirements in `AXES_DIRECTORY_DATA_MODEL.md`, verified accurate before
writing the claim (opt-in scope, `human_reviewer_role`, `listing_source`
restricted to business submission or representative confirmation, the
correction/removal request record, and renewal-date gating are all already
specified there) — so the "more human, more heart" framing is a description
of committed design, not aspirational marketing copy.

## What this does not do

It does not add any competitor name, market-share estimate, or revenue
projection. It does not change the budget figures in `PROJECT_BUDGET.md` or
any spending gate. It does not authorize outreach, publication, or launch —
the directory remains gated on the founder-approval sequence already in
`AXES_BUSINESS_PLAN.md` and `AXES_DIRECTORY_READINESS.md`.

## Verification

Documentation-only change. Confirmed with `git diff --check` (no whitespace
errors) and a manual cross-check of every factual claim (budget figures,
data-model field names) against the actual files before writing them.

## Related records

- `docs/AXES_BUSINESS_PLAN.md`
- `docs/PROJECT_BUDGET.md`
- `docs/AXES_DIRECTORY_DATA_MODEL.md`
- `docs/AXES_DIRECTORY_READINESS.md`
- `docs/AXES_CREATOR_ORIGIN_CONSTITUTION.md`
