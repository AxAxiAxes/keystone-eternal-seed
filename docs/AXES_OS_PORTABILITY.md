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
| `usage` | Private provider token-usage accounting | `openai-usage.jsonl` |
| `automation` | Allowlisted tasks, agent registry, runs, and schedules | `automation.json` |
| `chat` | Private provider request orchestration and contextual retrieval | Uses memory and usage modules; does not own a separate data file |
| `monitoring` | Private operational snapshots and attention history | `monitoring.json` |
| `checkpoint` | Portable state inventory and integrity hashes | `checkpoints/*.json` |
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

## Migration procedure

This procedure corresponds to the phased migration track in
[`PROJECT_TIMELINE.md`](../PROJECT_TIMELINE.md). A checkpoint is an integrity
record; successful migration also requires backups, restoration testing,
observability, security review, and an approved rollback path.

1. Pause nonessential task processing and record the current operational state.
2. Create a checkpoint manifest and copy the listed data files through an
   encrypted, access-controlled transfer path.
3. Verify every transferred file against the manifest SHA-256 values.
4. Restore files to the AXES OS private data directory with restrictive access
   permissions.
5. Start the private engine, run health and application checks, then create a
   second checkpoint on the destination.
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
