# AXES private service registry

**Status:** Repository-controlled AXES OS / Control Center foundation
**Recorded:** 2026-09-11

## Scope and authority

`service-registry.jsonl` is a private, append-only, SHA-256 hash-linked
journal of founder-approved AXES service planning and operating metadata. It
does not publish services or establish their availability, legal status,
professional qualification, business registration, customer service,
financial offering, or deployment state.

Only the founder controls AXI-role work assignment/removal, task approval, and
accountability actions. The Project Memory Manager may execute only an
explicitly assigned, explicitly approved `service.registry` task. It cannot
assign, approve, remove, suspend, or reactivate itself or another role. This
foundation adds no agents, does not enable a future Service Registry Steward,
and does not change scheduler configuration.

## Stored record

Each immutable record has a UUID, sequential number, timestamp, predecessor
hash, current hash, schema version, stable service ID, revision, `register`
or `update` operation, service name, constrained stage, classification,
`founder` owner role, purpose, dependency summary, and fixed
`operator-approved` review state.

Only `internal`, `private`, and `restricted` classifications are accepted.
The registry rejects unsupported keys and unsafe identifiers or text,
including URLs and terms for public claims, customer/vendor/person/account,
credential, payment, legal, licensing, verification, or launch data. It has
no external ingestion or direct write endpoint.

## Stage transitions

| Current stage | Permitted next stage |
| --- | --- |
| `planned` | `internal`, `paused`, `retired` |
| `internal` | `pilot`, `paused`, `retired` |
| `pilot` | `active`, `paused`, `retired` |
| `active` | `paused`, `retired` |
| `paused` | `planned`, `internal`, `pilot`, `active`, `retired` |
| `retired` | None |

An update requires an existing service and creates its next revision; a second
registration with the same service ID is rejected. `active` remains an
internal stage label only and is never evidence of public operation or launch.

## Safe access and failure handling

The private engine offers read-only `GET /system/service-registry`,
`/entries`, and `/projection` endpoints. The authenticated portal proxies
only those read routes. The Automation Console submits an approval-required
manager task rather than directly writing the journal.

Startup readiness, monitoring, checkpoints, and recovery include the registry.
Malformed retained history becomes `service-registry-invalid`, surfaces
attention, and blocks manual processing and scheduler cycles until a human
reviews the retained state. A checkpoint or recovery bundle is an integrity
artifact, not deployment proof or a public-service claim.

## Related records

- `AXI_AUTOMATION_SERVICE.md`
- `ENGINE_INTEGRATION.md`
- `AXES_OS_PORTABILITY.md`
- `AXES_AGENT_ORIGIN_REGISTRY.md`
