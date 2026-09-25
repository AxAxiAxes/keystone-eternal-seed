# AXI chat attachments, diagnostics, and continuity-capacity plan

**Date:** 2026-09-23  
**Type:** Implementation record

## What changed

- The public AXIOM chat UI now keeps uploaded files in bounded client state as
  pending attachment cards showing filename, MIME type, size, status, detail,
  and a remove action.
- Successful uploads retain `sourceReference`, `sha256`, size, original
  filename, and browser MIME type for the next chat turn instead of discarding
  that metadata after a temporary storage confirmation.
- `sendMessage()` now forwards attachment metadata with the next `chat` payload,
  prevents duplicate submission while a send is in flight, and clearly
  distinguishes `uploaded`, `attached to this message`, `processed`, and
  `failed`.
- The engine now validates attachment metadata server-side, accepts only
  `uploads/<uuid>[.<ext>]` references created by its own upload route, resolves
  them only within the configured upload directory, re-verifies SHA-256 and
  size, and performs bounded extraction only for `.txt`, `.md`, `.csv`, and
  `.json`.
- Unsupported document/image formats are returned honestly as stored but not
  interpreted; no tested PDF/DOC/DOCX or vision path was added in this change.
- Temporary chat attachment use remains separate from durable `source.catalog`
  or protected memory promotion.
- The upload proxy now exposes a safe `GET /api/axiom/upload-readiness`
  diagnostic and uses the same logic to turn the previously generic engine 404
  into non-sensitive actionable messages for wrong `AXIOM_ENGINE_URL`, missing
  upload route/stale deployment, shared admin-password mismatch, and private
  engine reachability failures.

## Documentation and planning

- Added `docs/AXI_CONTINUITY_MEMORY_AND_CAPABILITY_PLAN_2026-09-23.md` as the
  dated architecture/operations plan for continuity memory capacity,
  attachment/source integrity, retrieval budgeting, Railway durability limits,
  backups/migration, privacy/isolation, and bounded capability growth.
- Updated `docs/ENGINE_INTEGRATION.md`, `docs/AXI_SOURCE_CATALOG.md`,
  `docs/RAILWAY_DEPLOYMENT.md`, and both app `.env.example` files to reflect
  the new attachment contract and deployment/readiness expectations.

## Verification

- `apps/axiom-engine`: `node --test test/chat-service.test.js test/source-catalog-service.test.js test/engine.test.js`
- `apps/axiom-freedom`: `node --test test/axiom-proxy.test.js`

Both targeted suites passed after fixing a proxy helper-placement regression
introduced during implementation.
