# AXIOM engine integration

`axiom-freedom` is the public web service. It forwards AXIOM commands to the private `axiom-engine` service; clients do not call the engine container directly.

## Configuration

| Variable | Used by | Default | Purpose |
| --- | --- | --- | --- |
| `AXIOM_ENGINE_URL` | `axiom-freedom` | `http://127.0.0.1:3000` | Base URL for the AXIOM engine. Compose sets it to `http://axiom-engine:3000`. |
| `PORT` | `axiom-engine` | `3000` | Engine listener port. |
| `AXIOM_PORT` | `axiom-freedom` | `8080` | Public web-service listener port. |
| `AXIOM_CHAT_MAX_MESSAGE_CHARACTERS` | `axiom-engine` | `4000` | Maximum characters accepted per OpenAI chat request. |
| `AXIOM_AUTOMATION_ENABLED` | `axiom-engine` | `false` | Enables the private, allowlisted task scheduler. |
| `AXIOM_AUTOMATION_POLL_INTERVAL_MS` | `axiom-engine` | `60000` | Scheduler interval, from 1,000 to 3,600,000 milliseconds. |
| `AXIOM_AUTOMATION_MAX_TASKS_PER_CYCLE` | `axiom-engine` | `5` | Maximum due tasks processed each scheduler cycle, from 1 to 20. |
| `AXIOM_MONITORING_ENABLED` | `axiom-engine` | `false` | Enables private operational monitoring snapshots. |
| `AXIOM_MONITORING_POLL_INTERVAL_MS` | `axiom-engine` | `60000` | Monitoring interval, from 1,000 to 3,600,000 milliseconds. |
| `AXIOM_MEMORY_WARNING_BYTES` | `axiom-engine` | Unset | Optional positive-integer early-warning point for AXI data-directory growth; it does not cap or delete memory. |
| `AXIOM_BACKUP_DIRECTORY` | `axiom-engine` | Unset | Required distinct location for private runtime recovery bundles. |
| `AXIOM_RECOVERY_RESTORE_DIRECTORY` | `axiom-engine` | Unset | Required isolated location for verified recovery drills; never the live memory directory. |

When using the local Compose topology, configure
`AXIOM_BACKUP_HOST_DIRECTORY` and `AXIOM_RECOVERY_RESTORE_HOST_DIRECTORY`
instead. Compose mounts them at the fixed, separate engine paths
`/app/backups` and `/app/recovery-staging`; it does not accept arbitrary
unmounted container locations. The backup host directory must be selected on
durable storage distinct from the live memory location. A separate path alone
does not prove independent recovery.

## Command contract

Send a `POST` request to `axiom-freedom` at `/api/axiom`.

```json
{
  "action": "analyze",
  "payload": {
    "requestId": "example-123"
  }
}
```

`action` must be a non-empty string. `payload` is optional JSON supplied unchanged to the engine. On success, the web service returns the engine's response:

```json
{
  "engine": "AXIOM",
  "actionReceived": "analyze",
  "payloadReceived": {
    "requestId": "example-123"
  },
  "status": "processed"
}
```

The public web service returns `400` for an invalid action and `502` when the engine is unreachable or fails to respond within 60 seconds.

## OpenAI chat provider

Set these values only in the local `apps/axiom-freedom/.env` file or a deployment secret store:

```dotenv
OPENAI_API_KEY=your-api-key
OPENAI_MODEL=gpt-4.1-mini
```

The browser chat uses `action: "chat"` with `payload.message`. The engine sends the message and up to ten recent episodic records to OpenAI's Responses API, then appends the user message and provider reply to its private episodic memory store. Without `OPENAI_API_KEY`, chat returns `503` and no provider request is made.

## Provider usage monitoring

After each successful OpenAI response, the engine appends the provider-reported
input, output, and total token counts to its private persistent storage. It does
not persist API keys or prompt text in this usage record.

Use the private engine endpoint `GET /usage` from the Docker network or trusted
administrative environment to read cumulative counts:

```json
{
  "requests": 12,
  "inputTokens": 3456,
  "outputTokens": 789,
  "totalTokens": 4245
}
```

The public portal does not proxy this endpoint. Token counts are not a billing
statement; review the OpenAI billing dashboard for current prices, invoices,
credits, or recharge settings.

## Private runtime readiness

Use the private engine endpoint `GET /system/readiness` to distinguish engine
storage readiness from the deliberate status of the chat provider, scheduler,
and monitoring. It returns no API key, prompt, memory content, or account
information. The authenticated AXES Support Desk includes the same result in
its read-only status response.

```json
{
  "status": "ready",
  "storage": { "status": "ok" },
  "provider": { "status": "configured", "model": "gpt-4.1-mini" },
  "automation": { "status": "enabled", "lastRunAt": "2026-09-10T00:00:00.000Z", "lastError": null },
  "monitoring": { "status": "enabled" },
  "governance": {
    "status": "ready",
    "genesisCheckpoint": {
      "id": "axi-genesis-creator-ownership",
      "sourceRecord": "KEYSTONE-ORIGIN-000001"
    },
    "enabledAgents": 4,
    "activeAgents": 4,
    "issues": []
  },
  "recovery": { "status": "ready" },
  "coordinates": {
    "status": "ready",
    "scheme": "axi-origin-coordinate-v1",
    "coordinateCount": 2
  },
  "beadPassports": {
    "status": "ready",
    "passportCount": 0
  },
  "continuityRecord": {
    "status": "ready",
    "id": "axi-continuity-record-v1",
    "recordCount": 2
  },
  "sourceCatalog": {
    "status": "ready",
    "id": "axi-private-source-catalog-v1",
    "sourceCount": 0
  },
  "businessMetrics": {
    "status": "ready",
    "id": "axi-private-business-metrics-v1",
    "recordCount": 0
  },
  "serviceRegistry": {
    "status": "ready",
    "id": "axes-private-service-registry-v1",
    "serviceCount": 0
  }
}
```

`governance` is a secret-safe internal readiness result. It reports whether
enabled agents have the canonical Genesis registration and active
accountability, whether their capabilities remain allowlisted, and whether any
tasks are blocked or failed. It does not determine external ownership, legal
rights, value, or recovery.

`governance.agentObservations` provides compact factual observations for every
registered agent: immutable creation/registration timestamps, creator
authority and claim, origin checkpoint, enabled/accountability status,
compatible capabilities, assigned-task state counts, recent run, and attention
conditions. A protected agent report exposes the same observation per role.
These records preserve internal project-governance attribution only; they do
not establish cognition, legal personality, ownership, rights, or external
state.

`recovery` reports `not-configured`, `empty`, `ready`, or `unavailable`.
`ready` means the latest private bundle was locally hash-verified; it does not
represent an external durability, legal, or rights determination.

`serviceRegistry` reports the private, founder-approved internal service
planning/operating metadata journal. It is not evidence of public
availability, legal status, professional qualification, business registration,
customer service, financial offering, or deployment. Invalid retained registry
history is an attention state that blocks manual and scheduled automation.

`startupContext` reports the state of the local `axes-memory-bank-startup-v1`
bootstrap record. The engine writes or resumes that non-sensitive context
record on startup from its deployed code, preserving the startup timestamps
and count in the persistent memory directory. It references the approved
memory-bank and governance source set without copying private archives,
credentials, or prompt content into runtime status. An absent record is
reseeded from the deployed bootstrap definition; invalid and
version-mismatched records are attention states and are not silently replaced.

`continuityRecord` reports the state of the private
`axi-continuity-record-v1` append-only, hash-linked event record. It retains
initialization, restart, material monitoring-change, and explicitly
operator-confirmed event metadata without provider prompts, credentials,
personal data, or private source content. A malformed record is preserved as
an attention state and blocks manual and scheduled automation until reviewed.

`sourceCatalog` reports the state of the private
`axi-private-source-catalog-v1` hash-linked metadata index. It stores only
approved source identifiers, non-sensitive titles, classifications,
repository-relative references, and SHA-256 hashes; it does not ingest raw
project content. A malformed retained catalog is an attention state that also
blocks manual and scheduled automation until reviewed.

`businessMetrics` reports the state of the private
`axi-private-business-metrics-v1` hash-linked journal. It stores only approved
non-sensitive category, period, kind, positive-cent amount, and source-record
values. An invalid retained journal is an attention state and blocks manual
and scheduled automation. Its output is a record of submitted metrics only,
not a financial statement, accounting or tax treatment, cash balance,
valuation, profitability guarantee, or legal or financial advice.

## Private recovery endpoints

The engine exposes recovery endpoints only on the private service network:

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/system/backups?limit=20` | Lists available private recovery bundles. |
| `POST` | `/system/backups` | Creates one private runtime bundle at the configured distinct backup location. |
| `POST` | `/system/backups/:backupId/verify` | Recomputes and verifies the bundle's file hashes. |
| `POST` | `/system/backups/:backupId/restore` | Restores a verified bundle only into `AXIOM_RECOVERY_RESTORE_DIRECTORY`. |

The restore endpoint is not public and refuses to write to the live memory or
backup locations. Review the restored copy before changing an engine's memory
directory or enabling automation.

## Private continuity-record endpoints

`GET /system/continuity-record` reports secret-safe record readiness and
latest-event metadata. `GET /system/continuity-record/events?limit=20` returns
recent private events. `POST /system/continuity-record/events` records one
operator-confirmed event with a bounded `sourceRecord` and `summary`.

The Project Memory Manager can create the same event only through an explicitly
assigned and approved `continuity.record` task. This does not permit arbitrary
file writes, source-history replacement, recovery, publication, external
communication, personal-data collection, or legal/ownership conclusions.

The authenticated portal proxies the read-only status and event-history routes
at `/api/automation/continuity-record` and
`/api/automation/continuity-record/events`. It does not proxy the direct
recording endpoint; the protected console queues the approval-required manager
task instead.

## Private source-catalog endpoints

`GET /system/source-catalog` reports secret-safe catalog readiness and a
classification summary. `GET /system/source-catalog/entries?limit=20` returns
recent approved metadata entries. Source entries can be created only through
an explicitly assigned, operator-approved `source.catalog` task for the
Project Memory Manager. The authenticated portal proxies the read-only routes
at `/api/automation/source-catalog` and
`/api/automation/source-catalog/entries`.

## Private business-metrics endpoints

`GET /system/business-metrics` reports journal readiness,
`GET /system/business-metrics/entries?limit=20` returns recent approved
records, and `GET /system/business-metrics/summary` returns deterministic
period totals. There is no direct metrics write endpoint. Entries can be
created only through an explicitly founder-assigned and founder-approved
`business.metric` task executed by the Project Memory Manager. AXI roles do
not assign, remove, approve, suspend, or reactivate themselves. The
authenticated portal proxies the
read-only routes at `/api/automation/business-metrics`,
`/api/automation/business-metrics/entries`, and
`/api/automation/business-metrics/summary`. See `AXI_BUSINESS_METRICS.md`.

## Private service-registry endpoints

`GET /system/service-registry` reports secret-safe journal readiness.
`GET /system/service-registry/entries?limit=20` returns recent immutable
records, and `GET /system/service-registry/projection` returns the current
service-ID-sorted projection. The authenticated portal proxies only those
read-only paths at `/api/automation/service-registry`, `/entries`, and
`/projection`. Entries are created only through an explicitly assigned,
founder-approved `service.registry` task for the Project Memory Manager; there
is no direct service-registry write endpoint.

## Private automation-profile endpoints

`GET /automation/profiles` lists the sole supported internal template and
private profile state. `POST /automation/profiles` creates a strict
`operations-observation` draft. `POST /automation/profiles/:profileId/activate`
and `/pause` require explicit confirmation through the protected operational
process. The authenticated portal proxies these paths beneath
`/api/automation/profiles`; none is public. Profile status appears in system
readiness, monitoring, checkpoints, recovery bundles, and Support Desk
status. See `AXI_AUTOMATION_PROFILES.md`.

## Private coordinate endpoints

`GET /system/coordinates`, `POST /system/coordinates`, and
`GET /system/coordinates/verify` manage AXI's private
`axi-origin-coordinate-v1` ledger. It records temporal, source, governance,
and hash-chain coordinates for approved internal state transitions. It does
not collect precise location or personal data, and it does not make external
ownership, rights, valuation, or patent determinations.

`GET /system/gravity-center`, `GET` and `POST /system/bead-passports`, and
`GET /system/bead-passports/verify` manage the private AXI agent bead-node
pilot. The authenticated Automation Console proxies those private controls for
an authorized operator; no public identity, passport, or coordinate registry
is exposed.
