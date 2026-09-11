# AXES agent origin registry

**Status:** Active creator ownership and accountability record

**Recorded:** 2026-09-10

## Purpose

This registry links the currently implemented AXI agent records to their
project origin checkpoints, creator purpose, duties, and attributable task
templates. It supports a running, private timeline for each agent.

These records implement the KEYSTONE protocol's registration of agent origin,
lineage, creator ownership claim, accountability, purpose, and bounded duties.
The creator's claim is that each AXI agent created and registered in AXES is
owned and accountable to its named creator. An agent without this registration
is unauthorized within AXES governance and cannot be assigned or selected for
an AXI task.

**KEYSTONE registration authority:** `KEYSTONE-ORIGIN-000001` records Axel
Urartu (AX) · Axes Contracting as the creator authority for the KEYSTONE
framework. Every current AXI agent inherits that creator ownership-and-
accountability claim and identifies its own operational origin checkpoint
below. The required AXI Genesis checkpoint and reset-recovery procedure are
defined in `AXI_GENESIS_OWNERSHIP_CHECKPOINT.md`. Filing, recognition, or
enforcement outside AXES follows the separate rights-readiness process.

## Accountability control

Each registered AXI agent has a private accountability record with an `active`
or `suspended` status, a dated reason, and an append-only review history.
An authenticated AXES operator must provide a reason to suspend or reactivate
an agent. A suspended agent cannot be assigned to a new task, selected for an
unassigned task, used for protected agent chat, or execute a queued task. A
queued task assigned to a suspended agent moves to `blocked` and retains the
accountability-hold reason until the agent is reactivated and the task is
eligible again.

Accountability reviews are project operating records. They identify AXI's
registered agent, registered authority, task scope, and operator decision;
they do not make the agent a legal person or shift human accountability for
system operation and decisions away from AXES.

## Implemented agent origins

| Agent ID | Origin checkpoint | Creator attribution | Purpose | Core duties |
| --- | --- | --- | --- | --- |
| `memory-curator` | `axi-durable-memory-foundation` | Axel Urartu (AX) · Axes Contracting | Maintain factual, non-sensitive AXI continuity records. | Prepare approved memory entries; preserve concise operational continuity. |
| `automation-executor` | `axi-bounded-automation-foundation` | Axel Urartu (AX) · Axes Contracting | Run safe workflow checks within the explicit action allowlist. | Execute approved no-op checks; record bounded task outcomes. |
| `automation-auditor` | `axi-bounded-automation-foundation` | Axel Urartu (AX) · Axes Contracting | Provide an auditable fallback for approved bounded tasks. | Review task outcomes; record approved audit continuity. |
| `operations-observer` | `axi-operations-observer` | Axel Urartu (AX) · Axes Contracting | Capture private operational, Genesis/governance-readiness, recovery, coordinate-chain, and continuity-checkpoint evidence. | Run approved monitoring snapshots; assess private readiness; create verified recovery bundles; record approved coordinate transitions and continuity checkpoints; surface operational attention signals. |

The origin checkpoint identifies the implementation milestone that established
the role. It must not be used to imply that an agent owns that milestone or
can decide its future direction.

## Attributable task templates

| Agent ID | Task template | Action | Task origin checkpoint | Required human control |
| --- | --- | --- | --- | --- |
| `memory-curator` | Record an approved continuity checkpoint | `memory.record` | `axi-continuity-update` | Human confirms the factual content and retained data. |
| `automation-executor` | Run an approved safe workflow check | `automation.noop` | `axi-automation-validation` | Human defines the check and reviews the recorded result. |
| `automation-auditor` | Record an approved automation audit | `memory.record` | `axi-automation-audit` | Human reviews the evidence and approves the record. |
| `operations-observer` | Capture a recurring private monitoring snapshot | `monitoring.snapshot` | `axi-operations-observer` | Human creates the recurring task, chooses its interval, and investigates attention states. |
| `operations-observer` | Assess Genesis and governance readiness | `governance.readiness` | `axi-governance-readiness` | Human reviews agent reports before scheduling and investigates every attention state. |
| `operations-observer` | Create and verify a private runtime recovery bundle | `recovery.backup` | `axi-reset-recovery` | Human configures a distinct backup location, reviews the result, and authorizes any isolated restore drill. |
| `operations-observer` | Record an approved coordinate transition | `coordinate.record` | `axi-coordinate-foundation` | Human reviews the source and checkpoint relation; no origin, rights, or value conclusion is made by the task. |
| `operations-observer` | Create an approved private continuity checkpoint | `continuity.checkpoint` | `axi-continuity-checkpoint` | Human schedules and reviews the checksum manifest; it does not create a backup, recover erased state, or establish an external right. |

Templates are not queued tasks. A task is created only by an authenticated
operator through the protected Automation Console or private API.

## Per-agent running timeline

The private engine exposes `GET /automation/agents/:agentId/report`. The
protected portal exposes the same information at
`GET /api/automation/agents/:agentId/report` and renders it in the Automation
Console.

Each report contains:

1. The agent's origin checkpoint, creator attribution, ownership-and-
   accountability claim, purpose, duties, capabilities, registration notice,
   and current accountability status.
2. An `origin` event at registration.
3. An `accountability-review` event for each registration, suspension, or
   reactivation.
4. A `task-created` event for every explicitly assigned task, including its
   origin checkpoint and current status.
5. A `task-run` event for each completed, retrying, or failed execution.

Task origin checkpoints should use a stable lowercase kebab-case identifier
that describes the milestone or workstream. No report includes task payloads,
provider prompts, secrets, or personal information.

## Governance

The active role catalog, staged enabled-agent ceiling, and activation gates are
in `AXES_AGENT_OPERATING_MODEL.md`. Directory role profiles remain
preparatory; they cannot collect data, publish a listing, contact a business,
or resolve corrections/removals without the named human reviewer and all
directory readiness gates.
