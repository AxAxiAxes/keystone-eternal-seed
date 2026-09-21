# Copilot accountability tracker

This repository's **single source of truth** for founder-directed task records
is the private append-only accountability ledger exposed through
`/system/accountability*` and `/api/accountability*`, with the founder-facing
UI at `/accountability`.

It extends the earlier draft PR #173 implementation instead of creating a
parallel ledger.

## Task-ID and lifecycle

- **Task-ID format:** `TASK-YYYYMMDD-0001`
- A `directive.created` event may supply `taskId`, but if it is omitted the
  ledger generates one automatically.
- **Lifecycle states:** `planned`, `accepted`, `in_progress`, `blocked`,
  `delivered`, `verified_success`, `verified_partial`, `failed`,
  `superseded`, `archived`
- `verified_success` is blocked unless the ledger already has:
  - explicit evidence references
  - evidence in the `verified` state
  - explicit human confirmation

Task-ID should also be copied into PR bodies, commits where feasible,
continuity/memory records, and exported reports.

## What a task record stores

Each directive record can store:

- exact founder directive text
- Task-ID, project, repository, branch, and session identifier
- planned deliverables, subrequirements, assumptions, dependencies, risks,
  acceptance criteria, deadline, and definition of done
- authorship and accountability fields:
  - directive author
  - task owner
  - implementer(s)
  - reviewer(s)
  - merger / acceptor
  - human confirmation
  - AI / tool attribution
- retention / continuity fields:
  - `createdAt`
  - `latestUpdatedAt`
  - `lastVerifiedAt`
  - `reviewDueAt`
  - `expiresAt`
  - `archivalState`
  - source references
  - continuity links
- delivery claims separated into:
  - repository artifacts
  - working outcomes
  - external actions
  - unverified claims
- evidence items with verification state
- requirement assessments and deviations
- lifecycle / outcome updates
- founder ratings and assistant self-assessments
- financial/resource entries

## Financial separation rules

The ledger keeps these categories separate:

- **confirmed / measured cost**
- **estimated exposure**
- **claimed loss**
- **validated loss**
- **founder-confirmed hours**
- **assistant/session elapsed hours**
- **external spend**
- **rework cost**
- **opportunity-cost estimate**

Founder-reported claims or modeled numbers stay in estimated/claimed fields
until separately validated by a human. They are **not** promoted into confirmed
cost or validated loss automatically.

## Reports and status views

The ledger derives status reports for:

- task lifecycle
- PR evidence presence
- CI/test evidence presence
- deployment/outcome evidence presence
- verification state
- founder-confirmation state
- repository-artifact completion vs. real-world outcome status
- overdue review state
- authorship gaps

Exports:

- `GET /system/accountability/directives/:directiveId/report?format=json`
- `GET /system/accountability/directives/:directiveId/report?format=markdown`

Profile-level summaries include counts/totals for:

- open tasks
- overdue reviews
- missing evidence
- missing direction
- verified successes
- verified partial outcomes
- failed tasks
- claimed losses
- confirmed costs
- authorship gaps

## PR template and CI enforcement

`.github/PULL_REQUEST_TEMPLATE.md` now requires Task-ID and accountability
fields while preserving the existing scope-match, estimate, founder-time,
suggested-improvement, self-rating, and verification sections.

`.github/workflows/axi-continuity-validation.yml` runs
`.github/scripts/validate-pr-body.js` on pull requests. It fails when the PR
body is missing required accountability sections or still uses placeholders.

### Exception path

Historical or administrative PRs may omit a Task-ID only when the PR body
explicitly declares:

- `Exception path: historical` or `administrative`
- a specific non-placeholder exception reason

This avoids inventing historical Task-IDs for older work.

## Worked example

1. Open `/accountability`.
2. Create a directive record with the founder's exact instruction.
3. Leave `Task ID` blank if you want the ledger to generate one.
4. Fill in planning fields: planned deliverables, assumptions, risks,
   acceptance criteria, owner, and review date.
5. Record `accepted` or `in_progress` as work begins.
6. Add delivery claims and evidence as implementation and testing happen.
7. Record financial entries:
   - confirmed costs only when a human has actually confirmed them
   - claimed/estimated values separately when they are not yet validated
8. Record `verified_success` only after verified evidence and human
   confirmation exist.
9. Copy the Task-ID into the PR body, continuity record, and any follow-up
   report.

## Backfill / migration guidance

- Use `reconstructed: true` and `incomplete: true` for older work that can only
  be partially rebuilt from repository evidence.
- Do not invent missing Task-IDs, founder confirmations, durations, or
  financial amounts.
- Prefer phrases like "reconstructed", "reported", "estimated", or
  "pending confirmation" when certainty is incomplete.
- `docs/COPILOT_ACCOUNTABILITY_RECONSTRUCTED_SAMPLE.json` and
  `docs/COPILOT_ACCOUNTABILITY_RECONSTRUCTED_SAMPLE.md` show the expected
  backfill style.

## Boundaries

This system is:

- an accountability and project-management record
- a repository-controlled evidence tracker
- a founder-facing continuity aid

This system is **not**:

- a legal ownership adjudicator
- audited accounting
- proof of production deployment by itself
- proof of all historical completeness
- proof of business/IP ownership outside the evidence actually attached
