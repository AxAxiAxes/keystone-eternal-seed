# KEYSTONE creator-origin setup — intake and provenance-index template (draft)

**Status:** Internal draft template only; not published, not distributed to
any client, and not usable for paid delivery until `KEYSTONE-COS-001` is
founder approved per `KEYSTONE_CREATOR_ORIGIN_SETUP_READINESS.md`
**Recorded:** 2026-09-13
**Purpose:** Provide the structured record shapes referenced by that
readiness sheet's candidate deliverables 1–4 (asset/source inventory,
provenance index, version/contribution timeline, evidence-packet index), so
activation is not blocked on drafting these from scratch once the founder
approves the offer.

## Scope and boundary

This template only organizes information a client voluntarily supplies about
materials they already control. It:

- collects no payment, banking, government-ID, or insurance information;
- makes no ownership, inventorship, authorship, priority, or legal-right
  determination — every field records what the client *asserts* or what a
  record *shows*, never a conclusion;
- is not itself a legal opinion, filing, registry submission, or contract;
  and
- is not usable for any real client's materials until the founder approves
  both the `KEYSTONE-COS-001` offer and a specific delivery/collection
  channel and private-storage location for it.

Every completed copy must carry the same exclusions already defined in
`KEYSTONE_CREATOR_ORIGIN_SETUP_READINESS.md` and apply
`AXES_CREATOR_ORIGIN_CONSTITUTION.md`'s standard for distinguishing an
assertion from a verified record.

## Template A — client-provided asset and source inventory

Mirrors readiness-sheet deliverable 1. One row per client-supplied item.

| Field | Definition |
| --- | --- |
| Internal identifier | Stable ID assigned within the packet, e.g. `KCOS-<client-code>-001` |
| Supplied date | Date the client provided or pointed to this item |
| Description | Client's own description of the item (file, document, communication, prototype, etc.) |
| Version reference | Client-stated version/revision, if any |
| Private storage reference | Pointer to the approved private system where the item is kept (never this repository) |
| Client note | Any context the client chooses to add |

## Template B — provenance index

Mirrors readiness-sheet deliverable 2. Classify each inventory item using
only these labels, exactly as the readiness sheet defines them — do not
invent new categories or upgrade a label without a stated basis:

- founder-provided
- contributor-confirmed
- licensed/permission-based
- collaborative
- technical-assessment
- unverified
- contested

| Field | Definition |
| --- | --- |
| Internal identifier | Matches the Template A row it classifies |
| Classification | One label from the list above |
| Basis for classification | What the client stated or what record supports this label |
| Conflicting claim (if any) | Any other party's differing account, recorded neutrally |

## Template C — version and contribution timeline

Mirrors readiness-sheet deliverable 3. Built only from materials the client
supplies or specifically authorizes for review.

| Field | Definition |
| --- | --- |
| Date/period | As stated by the client or shown in the supplied record |
| Event | Factual description (e.g., "client states version 2 was shared with contributor X") |
| Source item | Internal identifier(s) from Template A supporting this entry |
| Confidence | Verified (independent check performed) or client-reported/unverified |

## Template D — evidence-packet index

Mirrors readiness-sheet deliverable 4. Summarizes what exists and what does
not, without concluding a legal outcome.

| Field | Definition |
| --- | --- |
| Provided records | Reference to Templates A–C entries the packet covers |
| Known gaps | What the client has not provided or could not locate |
| Preservation notes | Factual notes on record condition/integrity, not a legal conclusion |
| Questions for the client's chosen qualified advisor | Open questions the packet surfaces for the client to take to their own counsel |

## Activation dependency

These templates do not authorize collection, storage, or use of any client
information. Before any real client's materials are indexed, the founder
must still complete every open item in
`KEYSTONE_CREATOR_ORIGIN_SETUP_READINESS.md`'s activation record (scope,
owner, price basis, terms, capacity, confidentiality/consent language,
private storage and retention controls, and Tier 1 evidence-ledger
assumptions). Completed client packets must be stored outside this
repository in an approved private system, per that readiness sheet's
evidence practice.

## Related records

- `KEYSTONE_CREATOR_ORIGIN_SETUP_READINESS.md`
- `AXES_CREATOR_ORIGIN_CONSTITUTION.md`
- `AXES_TIER_1_EVIDENCE_LEDGER.md`
- `KEYSTONE_TIER_1_AUTOMATION_AND_INCOME_PLAN.md`
- `FOUNDER_REVENUE_PRIORITY_OVERLAY.md`
