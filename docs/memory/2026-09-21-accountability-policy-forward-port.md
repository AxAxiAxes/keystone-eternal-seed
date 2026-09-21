# 2026-09-21 — Accountability policy forward-ported from draft PR #173 and extended

## What changed

Forward-ported the existing draft PR #173 accountability ledger into the
current branch, then extended it into a general task-record policy instead of
creating a second parallel system.

### Engine / data model

- Added the append-only accountability ledger service and private
  `/system/accountability*` endpoints.
- Added stable Task-ID support (`TASK-YYYYMMDD-0001`) with auto-generation when
  omitted on `directive.created`.
- Expanded directive records to include planning, authorship, review/retention,
  and continuity fields.
- Expanded resource entries to separate confirmed cost, estimated exposure,
  claimed loss, and validated loss.
- Added lifecycle states for planned → accepted → in_progress → delivered →
  verified states, plus blocked/failed/superseded/archived.

### Portal / founder workflow

- Added the admin-gated `/accountability` UI and linked it through the existing
  AXES command-center surfaces.
- Updated the UI to surface Task-ID, planning fields, review status, financial
  separation, and authorship gaps.

### PR enforcement

- Extended `.github/PULL_REQUEST_TEMPLATE.md` with Task-ID and accountability
  fields while preserving the previously added scope-match, estimate,
  suggestion, self-rating, and verification sections.
- Added CI validation of PR bodies through
  `.github/scripts/validate-pr-body.js`.
- Added an explicit historical/administrative exception path so older work can
  be backfilled without inventing facts.

## Validation

- `node --test .github/scripts/validate-pr-body.test.js`
- `cd apps/axiom-engine && node --test test/accountability-ledger-service.test.js test/engine.test.js`
- `cd apps/axiom-freedom && node --test test/axiom-proxy.test.js`

## Boundaries preserved

- Verified success still requires verified evidence and human confirmation.
- Repository artifact completion remains distinct from real-world or production
  outcome completion.
- Claimed or estimated losses remain separate from confirmed cost and validated
  loss.
