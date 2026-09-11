# AXI persistent memory service

The AXIOM engine implements the durable memory foundation described by the KEYSTONE records. The service is private to the Docker Compose network; `axiom-freedom` does not proxy these endpoints to the public portal.

## Memory layers

| Layer | Storage | Purpose |
| --- | --- | --- |
| Identity | `identity.json` | Current AXIOM name and concise identity summary. |
| Startup context | `startup-context.json` | Versioned, non-sensitive AXES memory-bank source basis, startup timestamps, and startup count. |
| Episodic | `episodic.jsonl` | Timestamped event records. |
| Semantic | `semantic.jsonl` | Timestamped knowledge records. |
| Decision | `decision.jsonl` | Timestamped decision records. |
| Procedure | `procedure.jsonl` | Timestamped operational procedure records. |

The JSONL layers are append-only through the service API. Identity is intentionally replaceable because it represents the current declared state.

The private automation service records its durable task, agent, and execution
state in `automation.json` in the same directory. See
[`AXI_AUTOMATION_SERVICE.md`](AXI_AUTOMATION_SERVICE.md) for its action
allowlist, APIs, and opt-in scheduler.

The startup context is reseeded only when it is absent. A retained malformed or
version-mismatched startup context is preserved for review and blocks
automation until its private readiness status is restored.

## Private API

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/memory/identity` | Read the current identity record. |
| `PUT` | `/memory/identity` | Create or replace identity using `name` and `summary`. |
| `GET` | `/memory/:kind?limit=50` | Read the latest records for a supported layer. |
| `POST` | `/memory/:kind` | Append an entry using `content` and optional object `metadata`. |

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
