# AXI automation service

The private `axiom-engine` includes a durable, bounded automation layer. It
persists task definitions, registered agents, run records, and audit outcomes
alongside AXI memory in `automation.json`.

## Safety boundary

Automation is not an unrestricted shell, browser, account, or deployment
controller. It accepts only the versioned action allowlist:

| Action | Capability | Effect |
| --- | --- | --- |
| `memory.record` | `memory.record` | Writes a validated entry to a supported private memory layer. |
| `automation.noop` | `automation.noop` | Runs a testable workflow placeholder without external side effects. |
| `monitoring.snapshot` | `monitoring.snapshot` | Captures a private operational snapshot without contacting an external system. |
| `governance.readiness` | `governance.readiness` | Assesses Genesis registration, active accountability, approved capabilities, and task attention states without making legal or external determinations. |
| `recovery.backup` | `recovery.backup` | Creates and verifies a private runtime recovery bundle only at an explicitly configured, distinct backup location. |
| `coordinate.record` | `coordinate.record` | Records a source-linked, hash-chained private coordinate transition. |
| `continuity.checkpoint` | `continuity.checkpoint` | Creates a checksummed private checkpoint manifest for current runtime files. |

The service rejects any unrecognized action. New external integrations must be
implemented, reviewed, tested, and added to the allowlist before they can be
scheduled.

## Startup continuity context

At private-engine startup, AXI writes or resumes `startup-context.json` in the
same persistent directory as its memory. It is a compact, versioned,
non-sensitive bootstrap record that identifies the approved memory-bank and
governance sources required to resume work. It preserves its creation time,
last startup time, and startup count across ordinary process restarts.

`GET /system/readiness` includes a secret-safe `startupContext` result, and
the private `GET /system/startup-context` endpoint provides its detailed
status. If the context file is absent, the engine safely reseeds it from the
versioned, deployed bootstrap definition; recovery readiness separately
reports whether previous runtime data can be restored. A malformed or
version-mismatched record becomes an operational attention state, and the
engine does not overwrite it. Manual task processing and scheduler cycles fail
closed until the record is ready. The record is included in checkpoints and
recovery bundles.

The bootstrap record makes the approved continuity basis available to the
runtime on startup. It does not replace task-specific reading, cause an
external model to learn project material, establish authority or rights, or
enable automation, deployment, publication, communication, payment, or other
external action.

## Agents and assignments

New installations seed four enabled agent records. Existing installations add
the Operations Observer on their next private automation-state access while
preserving existing agent records.

| Agent | Capabilities | Purpose |
| --- | --- | --- |
| Memory Curator | `memory.record` | Maintains validated memory entries. |
| Automation Executor | `automation.noop` | Runs bounded workflow checks. |
| Automation Auditor | Both capabilities | Provides a general audited fallback. |
| Operations Observer | `monitoring.snapshot`, `governance.readiness`, `recovery.backup`, `coordinate.record`, `continuity.checkpoint` | Captures private health, queue, scheduler, usage, Genesis/governance-readiness, recovery, coordinate-chain signals, and approved continuity checkpoints. |

Tasks can specify an eligible `agentId`; otherwise the first enabled agent with
the matching capability is assigned. Tasks have a priority from 1 (backlog) to
5 (critical), defaulting to 3. Due tasks execute by highest priority first,
then earliest scheduled time. Every completed or failed execution creates a
durable run record and a private `decision` memory audit entry.

Tasks may declare `dependsOn`, an array of existing task identifiers. A
dependent task is blocked until every prerequisite is completed. Set
`approvalRequired: true` to hold a task in `awaiting_approval`; an authenticated
operator must approve or reject it through the console or private API.

Every task created through the protected Automation Console must be explicitly
assigned to an enabled agent that supports its action and must carry a stable
lowercase kebab-case `originCheckpoint`. The report records its origin,
creation, and run outcomes without exposing its payload. Existing private API
clients may omit this optional field for backward compatibility, but new work
should include it.

Each task has `maxAttempts` from 1 through 5 (default 1) and
`retryDelayMinutes` from 1 through 1,440 (default 5). Failed tasks retry only
within that bound; afterward, they enter the terminal `failed` state with a
recorded run history.

### Agent accountability

Every AXI agent is registered to the AXI Genesis ownership checkpoint with a
creator ownership-and-accountability claim. The private accountability record
includes `active` or `suspended` state, a dated review reason, and a complete
registration/suspension/reactivation history. The authenticated operator may
review an agent through the protected console or the private engine endpoint:

```json
POST /automation/agents/:agentId/accountability
{
  "status": "suspended",
  "reason": "Hold pending operator review."
}
```

The reason is required. A suspended agent cannot receive a new assignment,
be automatically selected, provide protected chat, or execute work. A queued
task assigned to it moves to `blocked` with the hold reason. Reactivation
requires another dated, reasoned review. The active AXI governance and reset
procedure are in `AXI_GENESIS_OWNERSHIP_CHECKPOINT.md`.

## Private API

These endpoints remain private to the AXIOM engine network and are not proxied
by the public portal.

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/automation/status` | Counts agents, task states, and recorded runs. |
| `GET` | `/automation/readiness` | Returns the secret-safe Genesis and governance readiness result. |
| `GET` | `/automation/agents` | Lists registered agents. |
| `POST` | `/automation/agents` | Registers an agent with a name and capability list. |
| `GET` | `/automation/agents/:agentId/report` | Returns the agent's project-attribution record and private running timeline. |
| `POST` | `/automation/agents/:agentId/accountability` | Records a reasoned active/suspended accountability review. |
| `GET` | `/automation/tasks` | Lists tasks; optionally filter with `?status=pending`. |
| `POST` | `/automation/tasks` | Creates a pending, scheduled task. |
| `POST` | `/automation/tasks/:taskId/approval` | Approves or rejects a task awaiting approval. |
| `POST` | `/automation/process` | Processes due tasks, up to `maxTasks` (default 5; maximum 20). |
| `GET` | `/automation/runs` | Lists recent execution records; use `?limit=50`. |

Create a memory-record task:

```json
POST /automation/tasks
{
  "title": "Record production milestone",
  "action": "memory.record",
  "payload": {
    "kind": "decision",
    "content": "Production routing was verified.",
    "metadata": {
      "source": "deployment"
    }
  }
}
```

Add `recurrenceMinutes` from 1 through 10,080 to run a task again after each
successful execution. Without recurrence, a successful task becomes
`completed`. Use `runAt` with an ISO-8601 timestamp to schedule a task for a
specific time; omit it to make the task due immediately.

Queue a recurring `governance.readiness` task only after the authorized
operator has reviewed the registered-agent reports. The Operations Observer
then records the state of the canonical Genesis checkpoint, active
accountability, approved task capabilities, and blocked or failed tasks. A
readiness result is an internal operational signal: it preserves and checks
the AXI creator-claim record but does not make an external ownership,
inventorship, valuation, legal-rights, or recovery determination.

Queue a recurring `recovery.backup` task only after the operator has
configured and verified an independent backup destination. The action creates
one private recovery bundle, verifies its hashes before completing the task,
and retains the bundle for a separately authorized restore. It does not
overwrite live memory, contact an external service, or prove that a configured
storage location is independently durable.

Queue a `coordinate.record` task to record an approved, source-linked
continuity transition. The Operations Observer uses the task title and origin
checkpoint to create the next coordinate in the private hash chain. See
`AXI_ORIGIN_COORDINATE_SYSTEM.md`.

Queue a `continuity.checkpoint` task to create a checksum manifest of the
current persisted runtime files. It can be scheduled only by an authenticated
operator and runs through the same assignment, approval, retry, audit, and
Genesis-accountability controls as every other task. A checkpoint manifest is
evidence of the files present at that time; it is not a backup and cannot
restore erased data. Use `recovery.backup` with independently configured
storage for recoverability.

## Opt-in scheduler

Manual processing through `POST /automation/process` is always available from
the private network. To enable recurring polling at service startup, configure:

```dotenv
AXIOM_AUTOMATION_ENABLED=true
AXIOM_AUTOMATION_POLL_INTERVAL_MS=60000
AXIOM_AUTOMATION_MAX_TASKS_PER_CYCLE=5
```

The poll interval must be from 1,000 through 3,600,000 milliseconds, and each
cycle may process 1 through 20 tasks. The scheduler logs failures explicitly;
it does not silently claim completion.

For a staged production activation, enable monitoring and validate its
protected-console snapshot first. Then enable the scheduler. Setting either
variable requires a private `axiom-engine` service variable; do not expose
these controls through the public portal.

## Live intelligence monitoring

The private engine can record operational snapshots with:

```dotenv
AXIOM_MONITORING_ENABLED=true
AXIOM_MONITORING_POLL_INTERVAL_MS=60000
```

Snapshots include memory availability, scheduler heartbeat and error state,
task queue and failure counts, enabled agents, recorded runs, Genesis and
governance readiness, recovery-backup readiness, and private provider token
totals. A history entry is
retained only when a monitored state meaningfully changes or enters attention
state, preventing repetitive records. Attention states include unavailable
memory, failed tasks, scheduler errors, a queue backlog above 20 tasks, and a
Genesis/governance readiness issue.
A missing, empty, unavailable, or invalid recovery backup produces the
`recovery-not-ready` attention state.

The protected console can capture a snapshot and display current signals and
reevaluation history. The private API also provides `GET /monitoring/status`,
`GET /monitoring/history`, and `POST /monitoring/snapshots`.

Queue a `monitoring.snapshot` task with `recurrenceMinutes` to capture
snapshots through the bounded scheduler. The Operations Observer handles this
action. An authenticated operator still creates the task and chooses its
interval; the scheduler never enables monitoring, creates tasks, or contacts
an external service by itself.

## Protected browser console

The public portal supplies an authenticated operator interface at `/automation`.
It can read automation status and agents, queue allowlisted tasks, set task
priority and scheduled time, view the upcoming schedule, and process due tasks.
It also displays the private run history, including completed, retrying, and
failed task outcomes, attempts, agent assignments, and results. It never
exposes a direct engine URL or general engine proxy.

The Console also provides a private Continuity Tree that refreshes every 30
seconds. It connects the AXI root to governance readiness, registered agents,
each agent's accountability and latest timeline event, assigned tasks, and
latest recorded runs. It is an operator view only; it does not create, assign,
approve, run, or modify a task.

The protected `/command-center` view extends this into build-management
observation. It combines the continuity tree with agent/task/run-flow metrics
and a browser-side reachability display for the public XIIOM and AXES
Contracting endpoints. Site status is observation only; it does not call the
private engine directly, change a site, create an external monitor, or enable
the scheduler.

Set a unique secret only in the `axiom-freedom` Railway service variables:

```dotenv
ADMIN_PASSWORD=<unique-long-password>
```

Opening `https://xiiom.com/automation` then prompts for HTTP Basic credentials.
The username may be any non-empty value; use the configured value as the
password. Do not reuse an email password, store the secret in Git, or add it
to browser JavaScript.

## Agent chat and UI proposals

The protected console includes Agent Chat. It sends a request to one enabled
registered agent and stores the conversation in private episodic memory. Agent
prompts are explicitly limited to analysis and UI-improvement proposals; they
cannot claim to edit, deploy, access accounts, or execute changes.

Agent Chat requires `OPENAI_API_KEY` in the private `axiom-engine` Railway
service. Until that encrypted variable is configured, the console returns
`OPENAI_API_KEY is not configured` and makes no provider request.

The staged AXES-wide role profiles, current engine capacity, and activation
requirements are defined in `AXES_AGENT_OPERATING_MODEL.md`.
The implemented agent origins, purpose/duty descriptions, task templates, and
per-agent report contract are defined in `AXES_AGENT_ORIGIN_REGISTRY.md`.
