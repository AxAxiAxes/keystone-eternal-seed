# AXES OS portability and checkpoints

**Status:** Foundation implemented  
**Recorded:** 2026-09-09

## Objective

AXES OS is a future deployment target, not a dependency on one provider or one
machine. The current system is being organized so each module can be moved,
replaced, or scaled while preserving verified records and clear operational
boundaries.

## Current modules

| Module | Responsibility | Persistent state |
| --- | --- | --- |
| `memory` | Identity and append-only episodic, semantic, decision, and procedure records | `identity.json`, `*.jsonl` |
| `startup context` | Versioned non-sensitive AXES memory-bank basis available to AXI at startup | `startup-context.json` |
| `usage` | Private provider token-usage accounting | `openai-usage.jsonl` |
| `automation` | Allowlisted tasks, agent registry, runs, and schedules | `automation.json` |
| `chat` | Private provider request orchestration and contextual retrieval | Uses memory and usage modules; does not own a separate data file |
| `monitoring` | Private operational snapshots and attention history | `monitoring.json` |
| `checkpoint` | Portable state inventory and integrity hashes | `checkpoints/*.json` |
| `recovery` | Private runtime-timeline backup, hash verification, and isolated restore drill | `*.axi-recovery.json` at the configured distinct backup location |
| `portal` | Public pages and authenticated operator proxy | No durable data; configuration comes from environment variables |

## Checkpoint manifest

The private engine exposes these internal-only endpoints:

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/system/checkpoints` | Create a portable checkpoint manifest |
| `GET` | `/system/checkpoints?limit=20` | List recent manifests |

A checkpoint is a JSON manifest that records:

- Schema version, identifier, and timestamp.
- Declared module identifiers and versions.
- The filename, byte size, and SHA-256 hash of each present durable data file.

It does **not** copy data, export credentials, include environment variables,
make a backup by itself, or expose an endpoint through the public portal.

## Runtime-timeline recovery

The private recovery service preserves the engine's runtime timeline:
identity; episodic, semantic, decision, and procedure memory; agent registry;
task queue; run history; monitoring history; private usage totals; and existing
checkpoint manifests. It also preserves the versioned startup context used to
make the approved memory-bank basis available at process startup. It writes a
hashed bundle only when
`AXIOM_BACKUP_DIRECTORY` names a location distinct from both live memory and
the isolated restore directory.

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/system/backups?limit=20` | List private recovery bundles. |
| `POST` | `/system/backups` | Create one recovery bundle. |
| `POST` | `/system/backups/:backupId/verify` | Verify every bundled file hash. |
| `POST` | `/system/backups/:backupId/restore` | Restore only into the configured isolated staging location. |

The service rejects a backup directory equal to or nested within live memory,
and it rejects a restore directory that overlaps either live memory or the
backup location. It does not automatically restore, overwrite current state,
or claim that the configured location is independently durable. An authorized
operator must confirm the storage and recovery decision.

The repository timeline, including `PROJECT_TIMELINE.md`, continuity records,
and source history, is separately preserved by committed Git history and the
pushed remote branch. Recovering both layers requires the Git source timeline
and a verified runtime recovery bundle.

## Migration procedure

This procedure corresponds to the phased migration track in
[`PROJECT_TIMELINE.md`](../PROJECT_TIMELINE.md). A checkpoint is an integrity
record; successful migration also requires backups, restoration testing,
observability, security review, and an approved rollback path.

1. Pause nonessential task processing and record the current operational state.
2. Create and verify a private recovery bundle at a configured distinct,
   access-controlled destination.
3. Restore the verified bundle only into an isolated staging directory.
4. Compare every restored file with the bundle before using it as a candidate
   engine state.
5. Start a private staging engine, run health and application checks, then
   create a second checkpoint and recovery bundle on the destination.
6. Compare the source and destination state, test recovery from the destination
   backup, and only then redirect production traffic.
7. Keep the prior environment available until the migration observation period
   completes.

## Required future modules

- Private operational monitoring and attention-state history.
- PostgreSQL-backed structured memory, attribution, consent, retention, and
  access-control records.
- Object-storage adapter for large documents and media.
- Search and retrieval adapter with structured source references.
- Database and object-store backup/restore verification.
- Infrastructure configuration for AXES-owned hardware, including encrypted
  off-site backups and replacement procedures.

Each addition must define its state files or database schema, checkpoint
coverage, backup method, restore test, owner, and public exposure boundary.
