# 2026-10-03 — Reconciliation roadmap, ETAs, origin IDs, and review automation

## Task

Founder review comment on PR #221: "eta, and timeline missing, directive order
and story synopsis missing, order missing. automation missing, include review
automation, report is much bigger, eta origin id, report and business plan on a
timeline."

## Exact source basis reviewed

- `docs/reconciliation/` (all reports and `sources/`), PR #221 and its comment
- `docs/memory/2026-10-02-repository-reconciliation-automation.md`
- `PROJECT_TIMELINE.md`, `docs/AXES_BUSINESS_PLAN.md`,
  `docs/keystone/FOUNDER_ACTION_QUEUE.md`, `docs/AXI_GENESIS_OWNERSHIP_CHECKPOINT.md`

## Delivered

- Config sections `originalDirectives` (D01–D09, exact wording and order),
  `storySynopsis`, and `roadmap` (R01–R24) in
  `docs/reconciliation/sources/reconciliation-config.v1.json`.
- Generator: validation (unscheduled directive, unknown dependency/owner/ref,
  dependency cycle), dependency-based ETA scheduling, deterministic internal
  origin IDs, and the new report `docs/reconciliation/DIRECTIVES_ROADMAP_AND_ETA.md`.
- `scripts/reconciliation/refresh-pr-snapshot.js` (read-only PR listing) and
  `.github/workflows/reconciliation-refresh.yml` (weekly + manual; opens a
  review PR, never merges).
- Tests extended in `scripts/reconciliation/test/generate-reconciliation-report.test.js`.

## Status and boundaries

- ETAs (origin-ID registration 2026-10-17, completion 2026-11-25) are proposed
  estimates that assume founder actions happen on schedule; they are not
  commitments.
- Origin IDs are internal content hashes, not legal or registry filings.
- Blocked on founder: approve CI runs on PR #221, merge it, and enable
  "Allow GitHub Actions to create and approve pull requests" for the refresh
  workflow.
