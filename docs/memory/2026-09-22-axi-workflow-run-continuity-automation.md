# 2026-09-22 AXI workflow-run continuity automation

## Summary

Implemented a real, fail-closed continuity path for successful Copilot
workflow runs. `AXI continuity validation` now checks out the successful
upstream commit, reads an explicit repository-relative continuity contract from
`.github/axi/origin-coordinate.json` (or a workflow_dispatch-supplied alternate
path), hashes the referenced repository file, and forwards the request through
`axiom-freedom` to a new private-engine continuity endpoint.

## What changed

- Added `POST /automation/workflow-run-continuity` in `apps/axiom-engine`,
  which validates the upstream workflow context and explicit coordinate
  contract, requires startup/governance/coordinate readiness, creates or reuses
  a deterministic-idempotent `coordinate.record` task, and processes only that
  task.
- Added proxy support at
  `POST /api/automation/workflow-run-continuity` in `apps/axiom-freedom` so
  GitHub Actions can reach the private engine without exposing the engine
  publicly.
- Extended task/coordinate handling with deterministic idempotency and made
  coordinate creation fail closed if the retained coordinate chain is already
  invalid.
- Updated the workflow and runbook to document the explicit contract shape,
  manual workflow_dispatch replay inputs, and the required repository secrets
  (`AXI_CONTINUITY_PROXY_URL`, `AXI_CONTINUITY_ADMIN_PASSWORD`).

## Verification

- `apps/axiom-engine` full suite: **126/126 passing**
- `apps/axiom-freedom` full suite: **14/14 passing**

## Evidence

- `.github/workflows/axi-continuity-validation.yml`
- `.github/scripts/record-workflow-run-continuity.js`
- `apps/axiom-engine/index.js`
- `apps/axiom-engine/automation-service.js`
- `apps/axiom-engine/coordinate-service.js`
- `apps/axiom-engine/test/engine.test.js`
- `apps/axiom-engine/test/automation-service.test.js`
- `apps/axiom-engine/test/coordinate-service.test.js`
- `apps/axiom-freedom/server.js`
- `apps/axiom-freedom/test/axiom-proxy.test.js`
- `docs/AXI_AUTOMATION_SERVICE.md`
- `docs/AXI_ORIGIN_COORDINATE_SYSTEM.md`
- `docs/CI_CONTINUITY_RUNBOOK.md`
