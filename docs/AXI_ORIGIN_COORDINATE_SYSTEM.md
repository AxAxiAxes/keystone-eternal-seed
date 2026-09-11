# AXI origin coordinate system

**Status:** Implemented private technical foundation with bead-node pilot

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

## Gravity center and bead-passport nodes

The private `axi-bead-passport-v1` pilot adds a versioned node model above the
existing ledger. Its gravity center is the fixed, non-geographic technical
reference `axi-genesis-gravity-center`, with the symbolic zero vector
`{ x: 0, y: 0, z: 0 }`. It links only to the existing Genesis coordinate,
source record, and checkpoint.

An authorized operator may assign one bead-passport node to each already
registered, enabled, accountable AXI agent. A node stores only:

| Field | Function |
| --- | --- |
| `passportId` | Sequential private bead-node reference such as `BPN-0001`. |
| `agentId` | Existing registered AXI system agent identifier. |
| `gravityCenterId` | Link to the fixed technical Genesis reference. |
| `coordinateId` and `coordinateHash` | Link to a new hash-chained coordinate transition. |
| `harmonicBand` | Operator-selected symbolic band from `H1` through `H7`; no scan or measurement is asserted. |
| `spatialVector` | Bounded abstract numeric vector; it is not GPS, a real-world location, or a property reference. |
| `originCheckpoint` and `issuedAt` | Governance and temporal context for review. |

Despite the conceptual source name, a bead-passport node is **not** a human
passport, legal identity, authentication credential, eligibility decision, or
external registry. The pilot cannot register people, collect personal or
sensitive data, infer identity or characteristics, validate credentials, make
endorsements, or provide a public profile or mapping surface.

## Private API and automation

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/system/coordinates?limit=100` | Read current private coordinate records. |
| `POST` | `/system/coordinates` | Create an explicit coordinate transition. |
| `GET` | `/system/coordinates/verify` | Verify the full coordinate chain. |
| `GET` | `/system/gravity-center` | Read the fixed private technical Genesis reference. |
| `GET` | `/system/bead-passports?limit=100` | Read private AXI bead-passport nodes. |
| `POST` | `/system/bead-passports` | Register one permitted AXI-agent bead node. |
| `GET` | `/system/bead-passports/verify` | Verify node uniqueness and coordinate links. |

The Operations Observer may execute an explicitly scheduled
`coordinate.record` task. Its title becomes the coordinate label and its task
origin checkpoint becomes the coordinate's governance relation. This action
does not determine origin, ownership, identity, rights, value, or an external
patent scope; it records a source-linked internal transition for review.

## Reset and recovery

`coordinates.jsonl` is included in both standard checkpoint manifests and
runtime recovery bundles, along with `bead-passports.jsonl`. A reset recovery
must restore the verified bundle
into staging, then run coordinate verification before treating the recovered
runtime timeline as ready. An invalid or altered coordinate chain creates the
private `coordinate-chain-invalid` monitoring attention state.
An invalid bead-node record or coordinate link creates the private
`bead-passport-invalid` monitoring attention state.

## Source relationship

This is an implementation interpretation of the multi-dimensional
coordinate-value direction in `docs/keystone/CRYPTOGRAPHIC_ORIGIN_ANCHOR.md`
and a separately supplied founder-provided gravity-center/bead-node working
memo. Those sources contain conceptual material, including illustrative
values. The current pilot uses only bounded internal agent references and
versioned source/checkpoint relations required for a testable technical chain.
