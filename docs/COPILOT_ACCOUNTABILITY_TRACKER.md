# Copilot accountability tracker

This repository now includes a private **directive-versus-delivery
accountability ledger** for founder-directed Copilot work.

## What it records

- The founder's **exact original directive verbatim**
- Project, repository, branch, session/task identifier, requested deliverable,
  constraints, deadline, dependencies, budget/time cap, and definition of done
- Detailed subrequirements
- Amendments and superseded instructions
- Agent interpretation
- Delivery claims, separated into repository artifacts vs. working outcomes
- Evidence items with type, locator, verification state, verifier, and timestamp
- Requirement-by-requirement comparison states
- Deviations
- Outcome state
- Founder ratings and assistant self-assessment
- Loss/resource entries that keep founder-confirmed hours separate from
  assistant/session elapsed time
- Append-only event history
- Markdown/JSON report exports
- Missing-direction / missing-evidence reporting

## What it can prove

- What was recorded in the append-only local ledger
- Whether a claimed `verified_success` has explicit evidence references and
  explicit human confirmation
- Whether a directive currently has missing evidence or missing exact direction
- Proven totals from **confirmed inputs only**
- Estimated exposure ranges when estimates are entered explicitly

## What it cannot prove

- External invoices, billing dashboards, registrar/domain charges, cloud bills,
  or bank/account totals that are not separately supplied by a human
- That a repository artifact alone equals a successful founder outcome
- That all historical founder directions have been captured
- Exact founder labor time when only assistant/session elapsed time is known
- Production deployment state, external account state, or third-party actions
  outside the evidence actually attached to the record
- Complete historical Copilot session access when those sessions are not present
  in repository-controlled records

## Local UI and API

Private web UI:

- `/accountability`

Private web proxy endpoints:

- `GET /api/accountability`
- `GET /api/accountability/events`
- `GET /api/accountability/directives`
- `GET /api/accountability/summary`
- `GET /api/accountability/missing`
- `GET /api/accountability/directives/:directiveId`
- `GET /api/accountability/directives/:directiveId/report?format=json|markdown`
- `POST /api/accountability/events`

Private engine endpoints:

- `GET /system/accountability`
- `GET /system/accountability/events`
- `GET /system/accountability/directives`
- `GET /system/accountability/summary`
- `GET /system/accountability/missing`
- `GET /system/accountability/directives/:directiveId`
- `GET /system/accountability/directives/:directiveId/report?format=json|markdown`
- `POST /system/accountability/events`

The directive, summary, and missing-report queries accept `ratingMin` as a
decimal integer from `-10` through `10`, including URL query strings. Unrated
directives do not match a minimum-rating filter; invalid values are rejected.

## Durability and readiness

The private `accountability-ledger.jsonl` file is included in continuity
checkpoint checksums and runtime recovery bundles. Restore remains limited
to the separately configured, isolated recovery directory; a local bundle
does not prove independent storage durability or authorize a live restore.

An invalid retained ledger blocks automation processing and produces
`accountability-ledger-unavailable` in private monitoring attention. Monitoring
reports the condition without rewriting ledger history or enabling the scheduler.

## Manual reconstructed sample

`docs/COPILOT_ACCOUNTABILITY_RECONSTRUCTED_SAMPLE.json` contains a manually
reconstructed example bundle based on current repository records. It is
explicitly labeled reconstructed/incomplete and is **not** an audited financial
claim. Import each event manually through `POST /api/accountability/events` or
`POST /system/accountability/events`.

`docs/COPILOT_ACCOUNTABILITY_RECONSTRUCTED_SAMPLE.md` shows the same example as
a human-readable reconciliation report.
