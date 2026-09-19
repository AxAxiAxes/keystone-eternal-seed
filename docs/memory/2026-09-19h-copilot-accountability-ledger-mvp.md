# 2026-09-19 (h): Copilot accountability ledger MVP added to AXIOM/AXES private web + engine

## What changed

- Added `apps/axiom-engine/accountability-ledger-service.js`, an append-only
  directive-vs-delivery event ledger for:
  - exact founder directives
  - amendments
  - agent interpretations
  - delivery claims and evidence
  - requirement assessments and deviations
  - outcome states
  - founder/assistant ratings
  - confirmed vs. estimated loss/resource entries
- Added private engine routes under `/system/accountability*` for status,
  event history, directive projections, summary metrics, missing-evidence /
  missing-direction reporting, and Markdown/JSON report export.
- Added an admin-gated web page at `/accountability` plus matching proxy routes
  under `/api/accountability*`.
- Added documentation and a clearly reconstructed sample import/report:
  `docs/COPILOT_ACCOUNTABILITY_TRACKER.md`,
  `docs/COPILOT_ACCOUNTABILITY_RECONSTRUCTED_SAMPLE.json`, and
  `docs/COPILOT_ACCOUNTABILITY_RECONSTRUCTED_SAMPLE.md`.

## Verified locally

- `apps/axiom-engine`: `node --test` → **126/126 passing**
- `apps/axiom-freedom`: `node --test` → **14/14 passing**

## Why it matters

This creates a repository-controlled place to preserve the founder's exact
direction and compare it against what was actually delivered without allowing a
commit, PR, plan, or documentation change to masquerade as verified success.
It also keeps founder-confirmed hours/cost separate from assistant/session
elapsed time and preserves negative ratings such as `-10`.

## Limits

- Historical examples remain reconstructed/incomplete unless their exact
  directives and evidence are actually available.
- The ledger can export reports from what is recorded locally; it does not see
  external invoices, cloud billing, or complete third-party account history.
