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

Each current AXI agent is a non-sentient software role, not a living being,
legal person, independent owner, or decision-maker. It has no independent
claim to the AXES project, project sessions, source material, continuity
records, or the outputs of its bounded work.

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
The founder alone controls task assignment/removal, approval, suspension, and
reactivation through the authenticated protected operational process. AXI roles
cannot perform or initiate any of those controls for themselves or other
roles. A founder-controlled review must provide a reason to suspend or
reactivate an agent. A suspended agent cannot be assigned to a new task, selected for an
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
| `project-memory-manager` | `axi-project-memory-management` | Axel Urartu (AX) · Axes Contracting | Maintain approved, non-sensitive AXI project memory, the private continuous record, source-catalog metadata, submitted business metrics, and internal service-registry metadata. | Prepare operator-confirmed continuity entries; catalog approved source metadata and hashes without copying raw content; record approval-gated non-sensitive business metrics and service-registry revisions; maintain supported memory-layer references; surface record attention states. |
| `automation-executor` | `axi-bounded-automation-foundation` | Axel Urartu (AX) · Axes Contracting | Run safe workflow checks within the explicit action allowlist. | Execute approved no-op checks; record bounded task outcomes. |
| `automation-auditor` | `axi-bounded-automation-foundation` | Axel Urartu (AX) · Axes Contracting | Provide an auditable fallback for approved bounded tasks. | Review task outcomes; record approved audit continuity. |
| `operations-observer` | `axi-operations-observer` | Axel Urartu (AX) · Axes Contracting | Capture private operational, Genesis/governance-readiness, recovery, coordinate-chain, and continuity-checkpoint evidence. | Run approved monitoring snapshots; assess private readiness; create verified recovery bundles; record approved coordinate transitions and continuity checkpoints; surface operational attention signals. |

The origin checkpoint identifies the implementation milestone that established
the role. It must not be used to imply that an agent owns that milestone or
can decide its future direction.

## Creation evidence and internal observation

Every current agent record retains an immutable `createdAt` value alongside
its legacy `registeredAt` timestamp. Existing retained creation evidence is
never replaced. A legacy record missing `createdAt` is backfilled from its
valid registration timestamp; when that is unavailable, the current dated
migration record is used rather than asserting an earlier creation date.
Invalid retained values remain visible as attention conditions rather than
being silently rewritten.

Protected agent reports, agent lists, readiness, and monitoring snapshots
include factual per-agent observations: provenance timestamps, canonical
creator authority and claim, origin checkpoint, enabled/accountability state,
compatible capabilities, assigned-task state counts, recent run outcome, and
attention reasons. Observations do not describe cognition, feelings, memory
completeness, legal personality, ownership, rights, or external state.
They preserve AXES project-governance attribution only and do not create legal
ownership or rights conclusions.

## Attributable task templates

| Agent ID | Task template | Action | Task origin checkpoint | Required human control |
| --- | --- | --- | --- | --- |
| `memory-curator` | Record an approved continuity checkpoint | `memory.record` | `axi-continuity-update` | Human confirms the factual content and retained data. |
| `project-memory-manager` | Record an approved continuous-memory event | `continuity.record` | `axi-project-memory-management` | Human confirms the bounded source reference and summary; no personal data, secrets, source replacement, legal conclusion, or external action. |
| `project-memory-manager` | Catalog an approved repository source | `source.catalog` | `axi-project-memory-management` | Human confirms non-sensitive metadata, repository-relative reference, and SHA-256 evidence; no raw-content ingestion, source replacement, legal conclusion, or external action. |
| `project-memory-manager` | Record a founder-approved submitted business metric | `business.metric` | `axi-business-metrics-foundation` | Founder supplies, assigns, and approves only non-sensitive category, period, kind, positive-cent amount, and source record; the role executes only that bounded task and has no assignment, approval, removal, suspension, or reactivation authority; no client/vendor, account, invoice, payment, tax, credential, personal data, financial integration, accounting, legal, or financial determination. |
| `project-memory-manager` | Record a founder-approved private service-registry entry or revision | `service.registry` | `axi-project-memory-management` | Founder supplies, assigns, and approves tightly constrained internal planning/operating metadata; no public availability, launch, customer/vendor/person/account/payment/credential/legal data, external ingestion, or authority to assign, approve, remove, suspend, or reactivate roles. |
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
