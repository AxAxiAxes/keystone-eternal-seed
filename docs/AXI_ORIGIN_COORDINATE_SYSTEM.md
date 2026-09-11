# AXI origin coordinate system

**Status:** Implemented private technical foundation

**Recorded:** 2026-09-10

## Purpose

`axi-origin-coordinate-v1` is AXI's private, append-only coordinate ledger.
It creates a technical continuity coordinate for an AXI state transition. Its
four fields reflect the founder-provided coordinate direction:

| Coordinate axis | Implemented field | Function |
| --- | --- | --- |
| Temporal | `occurredAt` and `sequence` | Records when a transition occurred and its order in the ledger. |
| Source | `sourceRecord` | Links the transition to its named source record. |
| Governance | `originCheckpoint` | Links the transition to its accountable AXI checkpoint. |
| Integrity | `parentCoordinateHash` and `coordinateHash` | Creates a deterministic SHA-256 chain from the prior coordinate. |

The ledger begins with a **founder-recorded** Genesis reference to
`KEYSTONE-ORIGIN-000001` and `axi-genesis-creator-ownership`. Subsequent
coordinates chain to its hash. This initial technical implementation does not
store precise geographic location, account identifiers, personal data,
external patents, monetary value, or legal conclusions.

## Private API and automation

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/system/coordinates?limit=100` | Read current private coordinate records. |
| `POST` | `/system/coordinates` | Create an explicit coordinate transition. |
| `GET` | `/system/coordinates/verify` | Verify the full coordinate chain. |

The Operations Observer may execute an explicitly scheduled
`coordinate.record` task. Its title becomes the coordinate label and its task
origin checkpoint becomes the coordinate's governance relation. This action
does not determine origin, ownership, identity, rights, value, or an external
patent scope; it records a source-linked internal transition for review.

## Reset and recovery

`coordinates.jsonl` is included in both standard checkpoint manifests and
runtime recovery bundles. A reset recovery must restore the verified bundle
into staging, then run coordinate verification before treating the recovered
runtime timeline as ready. An invalid or altered coordinate chain creates the
private `coordinate-chain-invalid` monitoring attention state.

## Source relationship

This is an implementation interpretation of the multi-dimensional
coordinate-value direction in
`docs/keystone/CRYPTOGRAPHIC_ORIGIN_ANCHOR.md`. That source contains
founder-provided historical and conceptual material, including illustrative
values. The active ledger uses only the versioned source-record and checkpoint
references required for a testable technical chain.
