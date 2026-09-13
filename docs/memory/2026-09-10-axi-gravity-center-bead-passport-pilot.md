# 2026-09-10 AXI gravity-center bead-passport pilot

**Status:** Private technical pilot completed

## Source and implementation relevance

A founder-provided working memo was reviewed on 2026-09-10. Its supplied file
fingerprint was SHA-256
`2349316FCCCBEE3670DB5C24EC6941E73DF9694EBF6D04A40EBBBC4711A5B366`.
It proposed a gravity-center reference, bead/passport nodes, and spatial,
harmonic, temporal, and identity layers. Any cited external research or
historical claims in that memo remain founder-provided material; they were not
used as verified external evidence.

## Implemented control

The repository now has a private `axi-bead-passport-v1` node ledger. It uses
the existing Genesis-linked `axi-origin-coordinate-v1` ledger as the gravity
center and creates one new hash-chained coordinate transition for every
authorized AXI agent node. Each record stores an internal agent identifier,
fixed Genesis reference, sequential private node ID, bounded abstract spatial
vector, symbolic operator-selected `H1`-`H7` band, timestamp, and origin
checkpoint.

Registration rejects an unknown, inactive, disabled, or duplicate agent and
validation detects altered node records or broken coordinate links without
repairing them. Standard checkpoints and recovery bundles include
`bead-passports.jsonl`. The authenticated Automation Console exposes this
private operator flow only.

## Boundaries

This pilot does not create a public coordinate map, human passport, legal
identity, identity assessment, biometric or personal-data collection,
authentication credential, precise location record, property reference,
external registry, or third-party integration. It does not validate any
historical, legal, patent, ownership, licensing, or value assertion.

## Supporting evidence

- `apps/axiom-engine/bead-passport-service.js`
- `apps/axiom-engine/test/bead-passport-service.test.js`
- `apps/axiom-engine/test/engine.test.js`
- `apps/axiom-freedom/automation.html`
- `apps/axiom-freedom/test/axiom-proxy.test.js`
- `docs/AXI_ORIGIN_COORDINATE_SYSTEM.md`
