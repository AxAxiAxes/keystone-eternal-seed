# 2026-09-10 AXI runtime-timeline recovery

**Status:** Recovery mechanism implemented; independently durable destination pending

## Source and finding

On 2026-09-10, reset-recovery requirements were reviewed against the active
engine. The existing checkpoint service created integrity manifests but did
not copy runtime data. The existing Railway volume preserves ordinary
redeployments only while that volume remains available, so it cannot by itself
recover a deleted or reset storage location.

## Implemented control

The engine now creates hash-verified recovery bundles containing its private
runtime timeline: memory, identity, agent registry/accountability, task and
run history, monitoring, usage, and checkpoint manifests. The engine refuses
unsafe same-directory backup paths and restores only to an explicitly
configured isolated staging location. Monitoring reports recovery readiness
and raises `recovery-not-ready` attention until a verified bundle exists.

The Operations Observer can create and verify a bundle through the bounded
`recovery.backup` action when an authenticated operator schedules it.

## Remaining authorized action

An authorized operator must configure independently durable private backup
storage and an isolated restore location, create a verified bundle, complete a
restore drill, and record the result. No production storage, Railway
configuration, secret, external account, or data was changed in this work.

## Supporting evidence

- `apps/axiom-engine/recovery-backup-service.js`
- `apps/axiom-engine/test/recovery-backup-service.test.js`
- `docs/AXI_RUNTIME_TIMELINE_RECOVERY.md`
- `docs/RAILWAY_DEPLOYMENT.md`
