# AXES agent origin registry

**Status:** Active internal attribution and stewardship record

**Recorded:** 2026-09-10

## Purpose

This registry links the currently implemented AXI agent records to their
project origin checkpoints, creator purpose, duties, and attributable task
templates. It supports a running, private timeline for each agent.

These records establish project attribution and stewardship only. They do not
create legal ownership, personhood, employment, agency, independent authority,
or rights over people, data, assets, accounts, or decisions. The AXES project
founder direction remains subject to applicable law, consent, and accountable
human approval.

## Implemented agent origins

| Agent ID | Origin checkpoint | Creator attribution | Purpose | Core duties |
| --- | --- | --- | --- | --- |
| `memory-curator` | `axi-durable-memory-foundation` | AXES project founder direction | Maintain factual, non-sensitive AXI continuity records. | Prepare approved memory entries; preserve concise operational continuity. |
| `automation-executor` | `axi-bounded-automation-foundation` | AXES project founder direction | Run safe workflow checks within the explicit action allowlist. | Execute approved no-op checks; record bounded task outcomes. |
| `automation-auditor` | `axi-bounded-automation-foundation` | AXES project founder direction | Provide an auditable fallback for approved bounded tasks. | Review task outcomes; record approved audit continuity. |
| `operations-observer` | `axi-operations-observer` | AXES project founder direction | Capture private operational monitoring evidence. | Run approved monitoring snapshots; surface operational attention signals. |

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

Templates are not queued tasks. A task is created only by an authenticated
operator through the protected Automation Console or private API.

## Per-agent running timeline

The private engine exposes `GET /automation/agents/:agentId/report`. The
protected portal exposes the same information at
`GET /api/automation/agents/:agentId/report` and renders it in the Automation
Console.

Each report contains:

1. The agent's origin checkpoint, creator attribution, purpose, duties,
   capabilities, and attribution-scope notice.
2. An `origin` event at registration.
3. A `task-created` event for every explicitly assigned task, including its
   origin checkpoint and current status.
4. A `task-run` event for each completed, retrying, or failed execution.

Task origin checkpoints should use a stable lowercase kebab-case identifier
that describes the milestone or workstream. No report includes task payloads,
provider prompts, secrets, or personal information.

## Governance

The active role catalog, staged enabled-agent ceiling, and activation gates are
in `AXES_AGENT_OPERATING_MODEL.md`. Directory role profiles remain
preparatory; they cannot collect data, publish a listing, contact a business,
or resolve corrections/removals without the named human reviewer and all
directory readiness gates.
