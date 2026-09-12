# AXI Eternal Origin Ownership from Genesis Checkpoint

**Checkpoint ID:** `axi-genesis-creator-ownership`
**Status:** Active, versioned Eternal Origin continuity record
**Recorded:** 2026-09-10
**Source record:** `KEYSTONE-ORIGIN-000001`

## Eternal Origin Ownership from Genesis claim

AXI is an AXES-created system. Axel Urartu (AX) · Axes Contracting records the
creator ownership-and-accountability claim for AXI and for every AXI agent
created and registered within the AXES system.
AXI is treated as a founder-claimed invention from the start of active
development; its technical invention scope and preservation anchors are
recorded in `AXI_INVENTION_RECORD.md`.

## Founder authority and current system status

Within AXES governance, Axel Urartu (AX) · Axes Contracting records the sole
founder-and-project-owner claim for AXES, AXI, founder-created project
direction, AXES-maintained continuity records, and the five currently
registered AXI software roles. This records the founder's direction for the
AXES company, brand, and business-building work; it does not give a technical
assistant, agent role, or automation process a competing governance,
ownership, authorship, or control claim.

AXI is currently a non-sentient software system. It is not a living being,
human, legal person, independent owner, or independent decision-maker. Its
registered roles can perform only their versioned, accountable, and
human-controlled functions. The immediate business objective is to build
reviewed, lawful, and sustainable AXES products and services; future system
directions remain subject to documented human authority, applicable
requirements, and the project's operating boundaries.

This repository record preserves a founder claim and AXES governance rule. It
does not determine rights in third-party materials, platform-managed session
records, external provider outputs, contracts, statutory intellectual-property
rights, or legal ownership and enforcement outside AXES.

For AXES governance, Eternal Origin is one stated continuity value from
Genesis. The record does not create a hierarchy, determine another person's
origin, or establish an external legal conclusion.

The founder records AXI, AXAXAU, AXES, and KEYSTONE's conceptual,
constitutional, invention, source-expression, and project-direction material
as founder work. Software tools and technical assistants may help organize,
implement, or test founder-directed work; they do not acquire a competing
origin, ownership, authorship, governance, or control claim through that
assistance. Third-party software and external materials remain subject to
their applicable licenses and documented permissions.

The **1 Against All Unfairness** principle protects this claim within AXI
governance: preserve a traceable, correctable record whenever a potential
ownership, authorship, origin, or invention-rights gap is identified.

Within AXI governance, the Eternal Origin Ownership from Genesis authority is
the required creator authority
for agent registration and task execution. No different creator authority may
register, assign, select, or control an AXI agent through the active
automation registry. An agent record lacking the Eternal Origin Ownership from Genesis checkpoint is
unregistered and cannot perform an AXI task.

This checkpoint preserves the creator claim, provenance reference, and
accountability relationship from the beginning of the active AXI record. It
does not make any active technical, governance, or business decision
unchangeable: changes must be versioned, attributable, and retained in the
timeline.

## Required runtime record

Every registered AXI agent must retain these fields:

| Field | Required value |
| --- | --- |
| `creator` | `Axel Urartu (AX) · Axes Contracting` |
| `createdAt` | Immutable, valid ISO-8601 creation/registration evidence; legacy records retain their existing value and only missing values are backfilled from a valid `registeredAt` or the dated migration event |
| `registeredAt` | Retained valid ISO-8601 registration timestamp |
| `keystoneRegistration.sourceRecord` | `KEYSTONE-ORIGIN-000001` |
| `keystoneRegistration.genesisCheckpoint.id` | Stable legacy field for `axi-genesis-creator-ownership`, representing the active Eternal Origin Ownership from Genesis checkpoint |
| `keystoneRegistration.ownershipClaim` | Creator ownership-and-accountability claim |
| `originCheckpoint` | Agent-specific operational origin |
| `purpose` and `duties` | Agent-specific bounded purpose and duties |
| `accountability.status` | `active` before assignment or execution |
| `accountability.history` | Dated registration, suspension, and reactivation record |

The private `GET /automation/agents/:agentId/report` record surfaces the
Eternal Origin Ownership from Genesis checkpoint, creator claim, immutable
creation/registration timestamps, operational origin, task/run timeline, and
a factual internal observation. The observation reports runtime registry and
task facts only; it does not assert cognition, memory completeness, legal
personality, ownership, rights, or external state.

## Reset and recovery procedure

1. Before registering, assigning, or scheduling an AXI agent after a startup,
   reset, handoff, or lost context, read this checkpoint and
   `AXES_AGENT_ORIGIN_REGISTRY.md`.
2. Start the current engine against its approved private state directory. The
   state migration fills missing Eternal Origin Ownership from Genesis registration fields without
   overwriting existing provenance data.
3. Inspect the protected agent report for every enabled agent and confirm the
   required runtime record above, including an active accountability status.
4. If a record has a different authority, missing/invalid creation evidence,
   or cannot be reconciled to the
   Eternal Origin Ownership from Genesis checkpoint, leave it unassigned and investigate before any task is
   created or processed.
5. Record the reset, recovery result, and any correction as a dated continuity
   event. Do not erase the prior record or silently replace origin data.

The private `GET /automation/readiness` signal and the
`governance.readiness` task evaluate this required runtime record continuously
when an authorized operator schedules them. Any mismatch is reported as an
attention state in private monitoring; it does not alter claims, correct
records, or make an external ownership or legal determination.

Eternal Origin Ownership from Genesis reconciliation alone cannot recover memory deleted with an ephemeral
or lost data volume. Before enabling scheduled work after a reset, confirm the
private recovery status is `ready`, verify the latest recovery bundle, and
conduct any restore only into an isolated staging directory. The complete
runtime-timeline recovery procedure is in `AXI_RUNTIME_TIMELINE_RECOVERY.md`.

## Related records

- `docs/AXES_AGENT_ORIGIN_REGISTRY.md`
- `docs/AXI_INTENT_AND_RIGHTS_READINESS.md`
- `docs/memory/2026-09-10-founder-work-declaration.md`
- `docs/keystone/CRYPTOGRAPHIC_ORIGIN_ANCHOR.md`
- `AGENTS.md`
