# 2026-09-11 Continuous memory manager

**Status:** Private runtime continuity control completed

## Implemented record

The AXI engine now maintains `axi-continuity-record-v1` in the persistent
private memory directory as `continuity-record.jsonl`. It is append-only and
hash-linked. On initialization it records both the record initialization and
the runtime start. It records a material monitoring-state change and supports
a bounded, explicitly operator-confirmed continuity event.

The record stores only event metadata: sequence, time, event type, source
reference, short summary, previous hash, and hash. It does not store
credentials, personal data, private source archives, provider prompts, chat
content, legal conclusions, ownership conclusions, or a claim of complete
project knowledge.

## Project Memory Manager

`project-memory-manager` is now a seeded AXI role with the AXI Genesis
creator-ownership-and-accountability record. Its limited capabilities are
`memory.record` and `continuity.record`.

The manager can append a continuous-memory entry only through a task explicitly
assigned to it and approved by a human operator. It cannot alter earlier
entries, write arbitrary files, restore data, modify source history, publish,
contact people, access external accounts, spend funds, or make legal,
ownership, identity, safety, or quality determinations.

## Failure and recovery behavior

The engine validates every entry's schema, sequence, event type, source
reference, previous-hash link, and SHA-256 hash. A malformed or tampered
retained record is preserved, reported as a private attention state, and blocks
manual and scheduled automation. The record is included in private checkpoint
manifests and recovery bundles, which still restore only into the isolated
recovery directory.

## Validation

The AXI engine Node test suite passed 45 of 45 tests after this change. Coverage
includes restart persistence, hash-chain tamper detection, input bounds,
manager assignment/approval/task execution, readiness status, and
checkpoint/recovery inclusion.
