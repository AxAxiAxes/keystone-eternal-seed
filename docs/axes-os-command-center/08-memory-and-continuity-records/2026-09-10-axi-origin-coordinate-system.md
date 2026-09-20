# 2026-09-10 AXI origin coordinate system

**Status:** Private technical coordinate foundation completed

## Source and implementation relevance

The founder-provided `CRYPTOGRAPHIC_ORIGIN_ANCHOR.md` describes a
multi-dimensional coordinate direction linking time, source relation,
governance, and integrity. The active implementation converts that direction
into a testable private coordinate ledger without copying precise location,
account, or illustrative cryptographic claims from the source.

## Implemented control

`axi-origin-coordinate-v1` creates a Genesis-linked, append-only coordinate
chain. Every coordinate stores a temporal position, source record, governance
checkpoint, prior coordinate hash, and deterministic SHA-256 coordinate hash.
The private engine validates the entire chain, includes it in standard
checkpoints and recovery bundles, and raises
`coordinate-chain-invalid` monitoring attention on a mismatch.

The Operations Observer can create an explicit `coordinate.record` transition
through the established bounded automation process. The coordinate service
records internal continuity only; it does not determine external origin,
identity, ownership, rights, patent scope, or value.

## Supporting evidence

- `apps/axiom-engine/coordinate-service.js`
- `apps/axiom-engine/test/coordinate-service.test.js`
- `docs/AXI_ORIGIN_COORDINATE_SYSTEM.md`
- `docs/AXI_RUNTIME_TIMELINE_RECOVERY.md`
