# 2026-09-10 Memory-bank startup context

**Status:** Private runtime continuity control added

## Finding

The approved AXES memory bank needs to be active at AXI startup, not merely
available as an archive after a context reset. The engine previously persisted
runtime memory and automation state but had no runtime record of the
approved, non-sensitive continuity-source basis.

## Implemented control

`startup-context-service.js` now writes or resumes the private
`axes-memory-bank-startup-v1` record in the engine's persistent memory
directory. It records the deployed source-set references, creation time, last
startup time, and startup count. The record is included in checksum manifests
and runtime recovery bundles.

An absent record is safely reseeded from the deployed versioned definition so
the approved context basis is available at the next startup. A retained
malformed or version-mismatched record is preserved, surfaced through private
runtime readiness and monitoring, and blocks manual or scheduled automation
until corrected. This control does not alter external services, publish
information, enable the scheduler, or replace recovery of prior runtime data.

## Supporting evidence

- `apps/axiom-engine/startup-context-service.js`
- `apps/axiom-engine/index.js`
- `apps/axiom-engine/checkpoint-service.js`
- `apps/axiom-engine/recovery-backup-service.js`
- `apps/axiom-engine/test/startup-context-service.test.js`
- `apps/axiom-engine/test/engine.test.js`
