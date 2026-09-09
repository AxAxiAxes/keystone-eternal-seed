# AXI project memory — monorepo foundation

**Recorded:** 2026-09-09  
**Scope:** Repository consolidation, service baseline, deployment verification, and patent preservation.

## Durable decisions

- `AxAxiAxes/keystone-eternal-seed` is the canonical AXIOM / KEYSTONE monorepo.
- Applications are separated by responsibility:
  - `apps/axiom-engine` is the Express command-processing service.
  - `apps/axiom-freedom` is the public web and deployment service.
  - `packages/axi-core` is the .NET 8 transport-neutral command-contract library.
  - `docs/keystone` is the preserved KEYSTONE documentation corpus.
- The public service accepts commands at `POST /api/axiom` and forwards them to the private engine endpoint `POST /axiom`.
- `AXIOM_ENGINE_URL` is the web service's engine-base-URL configuration value. Docker Compose configures it as `http://axiom-engine:3000`.

## Completed milestones

- Consolidated the histories and source materials from `keystone-eternal-seed`, `axiom-engine`, `axiom-freedom`, and `Class-Library-.NET-8-`.
- Created and tested AXI.Core command, result, status, and handler contracts.
- Added Node test suites for engine health/command processing and web-to-engine proxy behavior.
- Verified a Docker Compose deployment: `axiom-engine` and `axiom-web` both became healthy, and a proxied command returned `status: "processed"`.
- Preserved the supplied AXI Patent 777 source at `docs/patents/AXI_PATENT_777.docx`; its SHA-256 is recorded in `docs/patents/README.md`.

## Current capabilities and limitations

- The engine accepts an action and JSON payload and returns a deterministic processed response.
- The browser chat UI still produces simulated responses; it does not call the live command API.
- No AI-model provider, durable application memory store, scheduling system, or external integration is implemented yet.

## Next implementation priority

Connect the browser chat interface to `POST /api/axiom`, then replace the engine's baseline echo behavior with a real command handler.

## Supporting references

- `PROJECT_TIMELINE.md`
- `docs/ENGINE_INTEGRATION.md`
- `packages/axi-core/README.md`
- Commits: `ed68204`, `e25305c`, `e0dddde`, `b4324f8`
