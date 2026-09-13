# AXI persistent memory service

The AXIOM engine implements the durable memory foundation described by the KEYSTONE records. The service is private to the Docker Compose network; `axiom-freedom` does not proxy these endpoints to the public portal.

## Memory layers

| Layer | Storage | Purpose |
| --- | --- | --- |
| Identity | `identity.json` | Current AXIOM name and concise identity summary. |
| Startup context | `startup-context.json` | Versioned, non-sensitive AXES memory-bank source basis, startup timestamps, and startup count. |
| Continuous record | `continuity-record.jsonl` | Hash-linked, append-only private operational continuity events. |
| Source catalog | `source-catalog.jsonl` | Hash-linked, append-only metadata and SHA-256 evidence index for approved repository sources. |
| Episodic | `episodic.jsonl` | Timestamped event records. |
| Semantic | `semantic.jsonl` | Timestamped knowledge records. |
| Decision | `decision.jsonl` | Timestamped decision records. |
| Procedure | `procedure.jsonl` | Timestamped operational procedure records. |

The JSONL layers are append-only through the service API. Identity is intentionally replaceable because it represents the current declared state.

## Storage visibility and growth

`GET /system/storage` returns the private AXI data directory's current used
bytes and file count. Where the host permits it, it also returns filesystem
total and available bytes. The host filesystem figures are operational signals,
not a guarantee of a configured volume quota, durable storage, or recovery.

Set the optional positive-integer `AXIOM_MEMORY_WARNING_BYTES` only to surface
an early `memory-storage-warning` in private monitoring. It is a warning, not
a memory cap: AXI does not delete, compact, or forget records when the warning
is reached. A malformed value prevents startup rather than silently disabling
the warning.

The private automation service records its durable task, agent, and execution
state in `automation.json` in the same directory. See
[`AXI_AUTOMATION_SERVICE.md`](AXI_AUTOMATION_SERVICE.md) for its action
allowlist, APIs, and opt-in scheduler.

The startup context is reseeded only when it is absent. A retained malformed or
version-mismatched startup context is preserved for review and blocks
automation until its private readiness status is restored.

The continuous record adds initialization, restart, material monitoring-change,
and explicitly operator-confirmed records to one hash-linked sequence. Its
status is checked before automation runs. A malformed or tampered retained
record is preserved for review, surfaced as an attention state, and blocks
manual and scheduled automation. The Project Memory Manager may record an
operator-confirmed entry only through the bounded `continuity.record` task
action. The record stores a short source reference and summary only; it must
not contain credentials, personal data, private source material, provider
prompts, or legal/ownership conclusions.

The source catalog records only approved, non-sensitive metadata: a stable
source ID, title, source type, classification, repository-relative reference,
and supplied SHA-256 content hash. It does not copy, parse, summarize, upload,
or expose raw source content. A malformed catalog is preserved as an attention
state and blocks manual and scheduled automation until reviewed. The complete
contract is in `AXI_SOURCE_CATALOG.md`.

## Private API

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/memory/identity` | Read the current identity record. |
| `PUT` | `/memory/identity` | Create or replace identity using `name` and `summary`. |
| `GET` | `/memory/:kind?limit=50` | Read the latest records for a supported layer. |
| `POST` | `/memory/:kind` | Append an entry using `content` and optional object `metadata`. |
| `GET` | `/system/continuity-record` | Read secret-safe continuous-record readiness and latest event metadata. |
| `GET` | `/system/continuity-record/events?limit=20` | Read recent private continuous-record events. |
| `POST` | `/system/continuity-record/events` | Append an operator-confirmed private continuity event. |
| `GET` | `/system/source-catalog` | Read secret-safe source-catalog readiness and summary. |
| `GET` | `/system/source-catalog/entries?limit=20` | Read recent approved source metadata entries. |

Supported kinds are `episodic`, `semantic`, `decision`, and `procedure`. `limit` is an integer from 1 to 100.

## Persistence

In Docker Compose, `/app/data` is backed by `apps/axiom-freedom/axiom_memory`. The directory is ignored by Git and must be backed up separately for durable operational use. Set `AXIOM_MEMORY_DIRECTORY` to use a different location outside Docker.

## Initialization example

Run this only from the private Docker network or a trusted administrative environment:

```json
PUT /memory/identity
{
  "name": "AXIOM",
  "summary": "AXIOM command service identity"
}
```
