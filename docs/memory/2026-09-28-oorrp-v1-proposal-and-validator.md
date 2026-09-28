# OORR-P v1 in-repository proposal and validator

**Date:** 2026-09-28  
**Type:** Implementation proposal (PR review artifact)

## What changed

- Added `docs/keystone/OORR_P_V1_NAVIGATION_SPEC.md` as a canonical navigation/spec layer for the already-authorized in-repository Origin Ownership and Responsibility Rights Protocol (OORR-P v1).
- Added append-only derivative operational files under `docs/keystone/oorrp-v1/`:
  - structured, versioned records for foundational Origin and separate founder origin/ownership declaration claim;
  - deterministic canonical-JSON SHA-256 hash-chain manifest;
  - offline validator + focused tests.
- Explicitly separated lanes for cosmological/symbolic statements, founder declaration, observable technical facts, and external legal status.
- Encoded first-value semantics as reference-based, additive, and nonfinancial; blocked people-ranking and automatic legal-rights assignment.
- Preserved legal/truthfulness boundary:
  - attribution to Origin as sacred is stored as founder-attributed declaration;
  - no external legal transfer/adjudication is represented as completed.

## Coordination boundaries

- Recorded that PRs #217, #216, #206, and #218 are open/unmerged as of 2026-09-28 and are treated as coordination inputs, not merged base facts.
- Added a dedicated CI job to validate only the OORR-P registry path (`docs/keystone/oorrp-v1`) without changing legacy preserved KEYSTONE source files.

## Evidence

- `docs/keystone/OORR_P_V1_NAVIGATION_SPEC.md`
- `docs/keystone/oorrp-v1/registry/records/OORRP-FOUNDATIONAL-ORIGIN-000001.json`
- `docs/keystone/oorrp-v1/registry/records/OORRP-FOUNDER-ORIGIN-OWNERSHIP-000001.json`
- `docs/keystone/oorrp-v1/registry/oorrp-hash-chain.v1.json`
- `docs/keystone/oorrp-v1/validator.js`
- `docs/keystone/oorrp-v1/validator.test.js`
- `.github/workflows/axi-continuity-validation.yml`
