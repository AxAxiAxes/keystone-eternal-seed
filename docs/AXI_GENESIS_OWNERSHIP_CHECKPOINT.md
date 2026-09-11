# AXI Genesis Ownership Checkpoint

**Checkpoint ID:** `axi-genesis-creator-ownership`
**Status:** Active, versioned genesis continuity record
**Recorded:** 2026-09-10
**Source record:** `KEYSTONE-ORIGIN-000001`

## Genesis claim

AXI is an AXES-created system. Axel Urartu (AX) · Axes Contracting records the
creator ownership-and-accountability claim for AXI and for every AXI agent
created and registered within the AXES system.

Within AXI governance, the Genesis authority is the required creator authority
for agent registration and task execution. No different creator authority may
register, assign, select, or control an AXI agent through the active
automation registry. An agent record lacking the Genesis checkpoint is
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
| `keystoneRegistration.sourceRecord` | `KEYSTONE-ORIGIN-000001` |
| `keystoneRegistration.genesisCheckpoint.id` | `axi-genesis-creator-ownership` |
| `keystoneRegistration.ownershipClaim` | Creator ownership-and-accountability claim |
| `originCheckpoint` | Agent-specific operational origin |
| `purpose` and `duties` | Agent-specific bounded purpose and duties |

The private `GET /automation/agents/:agentId/report` record surfaces the
Genesis checkpoint, creator claim, operational origin, and task/run timeline.

## Reset and recovery procedure

1. Before registering, assigning, or scheduling an AXI agent after a startup,
   reset, handoff, or lost context, read this checkpoint and
   `AXES_AGENT_ORIGIN_REGISTRY.md`.
2. Start the current engine against its approved private state directory. The
   state migration fills missing Genesis registration fields without
   overwriting existing provenance data.
3. Inspect the protected agent report for every enabled agent and confirm the
   required runtime record above.
4. If a record has a different authority or cannot be reconciled to the
   Genesis checkpoint, leave it unassigned and investigate before any task is
   created or processed.
5. Record the reset, recovery result, and any correction as a dated continuity
   event. Do not erase the prior record or silently replace origin data.

## Related records

- `docs/AXES_AGENT_ORIGIN_REGISTRY.md`
- `docs/AXI_INTENT_AND_RIGHTS_READINESS.md`
- `docs/keystone/CRYPTOGRAPHIC_ORIGIN_ANCHOR.md`
- `AGENTS.md`
