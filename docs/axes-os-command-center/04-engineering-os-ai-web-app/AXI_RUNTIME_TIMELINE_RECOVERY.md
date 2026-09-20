# AXI runtime-timeline recovery

**Status:** Implemented recovery mechanism; deployment destination pending

**Recorded:** 2026-09-10

## Recovery objective

AXI must preserve and recover its complete private runtime timeline through a
reset: identity and memory records, agent origin/accountability records, task
and run history, monitoring history, usage records, coordinate-chain records,
and previous checkpoint manifests. The source project timeline is separately retained through
`PROJECT_TIMELINE.md`, `docs/memory/`, and committed Git history.

## Implemented mechanism

`RecoveryBackupService` creates private, file-level recovery bundles from the
runtime state and calculates a SHA-256 for every file. The service:

1. Refuses to create a bundle without `AXIOM_BACKUP_DIRECTORY`.
2. Refuses a backup path that overlaps live `AXIOM_MEMORY_DIRECTORY`.
3. Refuses an empty bundle, so a bundle cannot report as recoverable without
   at least one persisted runtime file.
4. Verifies each bundle before reporting recovery status as `ready`.
5. Restores only into the separate
   `AXIOM_RECOVERY_RESTORE_DIRECTORY/<backup-id>` staging path.
6. Refuses to overwrite a prior restored bundle, live memory, or the backup
   location.

The Operations Observer can run the allowlisted `recovery.backup` task only
when an authorized operator schedules it. The task creates and immediately
verifies a bundle. Monitoring records `recovery-not-ready` when recovery is
unconfigured, empty, unavailable, or invalid.

## Reset recovery procedure

1. Keep scheduler processing disabled after a reset.
2. Review the private system readiness result and the Genesis/governance
   report.
3. Confirm the latest recovery bundle is present and verify it by its ID.
4. Restore that verified bundle into the isolated recovery directory.
5. Compare the recovered files with the verified bundle and start a private
   staging engine against the recovered directory.
6. Confirm memory, agent reports, task/run history, monitoring history, and
   checkpoint manifests are present and consistent.
7. Record the authorized recovery decision. Only then may an operator select a
   recovered state for an engine restart and review scheduler activation.

## Boundary

A recovery bundle is not a legal, ownership, invention, valuation, or
historical-truth determination. A configured path is not proven to be an
independent backup merely because it is different from the live directory.
An authorized operator must choose and verify the actual durable storage,
access control, retention, and recovery process. No repository change can
restore data that was never backed up or preserve an unpushed source timeline.

## Supporting implementation

- `apps/axiom-engine/recovery-backup-service.js`
- `apps/axiom-engine/checkpoint-service.js`
- `apps/axiom-engine/automation-service.js`
- `apps/axiom-engine/monitoring-service.js`
- `apps/axiom-engine/index.js`
- `docs/AXES_OS_PORTABILITY.md`
- `docs/RAILWAY_DEPLOYMENT.md`
