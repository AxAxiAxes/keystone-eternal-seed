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

The service rejects any unrecognized action. New external integrations must be
implemented, reviewed, tested, and added to the allowlist before they can be
scheduled.

## Agents and assignments

New installations seed three enabled agent records:

| Agent | Capabilities | Purpose |
| --- | --- | --- |
| Memory Curator | `memory.record` | Maintains validated memory entries. |
| Automation Executor | `automation.noop` | Runs bounded workflow checks. |
| Automation Auditor | Both capabilities | Provides a general audited fallback. |

Tasks can specify an eligible `agentId`; otherwise the first enabled agent with
the matching capability is assigned. Every completed or failed execution
creates a durable run record and a private `decision` memory audit entry.

## Private API

These endpoints remain private to the AXIOM engine network and are not proxied
by the public portal.

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/automation/status` | Counts agents, task states, and recorded runs. |
| `GET` | `/automation/agents` | Lists registered agents. |
| `POST` | `/automation/agents` | Registers an agent with a name and capability list. |
| `GET` | `/automation/tasks` | Lists tasks; optionally filter with `?status=pending`. |
| `POST` | `/automation/tasks` | Creates a pending, scheduled task. |
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
`completed`.

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

## Protected browser console

The public portal supplies an authenticated operator interface at `/automation`.
It can read automation status and agents, queue allowlisted tasks, and process
due tasks. It never exposes a direct engine URL or general engine proxy.

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
