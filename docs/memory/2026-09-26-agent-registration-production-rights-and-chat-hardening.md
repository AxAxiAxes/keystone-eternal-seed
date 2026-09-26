# AXI agent production-rights registration + public chat/upload hardening

**Date:** 2026-09-26  
**Type:** Implementation + continuity record

## Verified in repository/compose

- Completed startup/readiness protocol source review (`AGENTS.md`, governance/plan/deployment docs, latest continuity record) before edits.
- Reproduced the public chat/upload flows in local compose (`apps/axiom-freedom/docker-compose.yml` + `docker-compose.dev.yml`):
  - Plain chat request worked at the proxy level and returned the expected bounded configuration error when `OPENAI_API_KEY` was absent.
  - `.txt` and image upload routes both succeeded once shared engine admin auth was configured, confirming route + metadata contract behavior.
  - Upload-readiness diagnostics were exercised and mapped to user-facing upload failures.
- Investigated CI status via GitHub Actions MCP (`list_workflow_runs`, `get_job_logs`): current run state was `action_required` without failed jobs/logs.

## Implemented changes

1. **Automated creator + production-rights registration in `apps/axiom-engine/automation-service.js`**
   - Added a versioned `productionRights` registration block to seeded and newly registered agents.
   - Block includes canonical creator attribution/ownership claim from the Genesis checkpoint, immutable `createdAt` + origin provenance, bounded internal output scope, and explicit human-owner accountability notice.
   - Surfaced on protected agent report payloads and governance observations used by agent list/readiness/monitoring surfaces.

2. **Fail-closed governance behavior**
   - Agent registration validity now requires a valid `productionRights` block.
   - Missing/invalid production-rights registration is reported as governance attention and makes the agent unassignable/unregistered (same fail-closed pattern as Genesis mismatch).

3. **Backfill behavior**
   - Migration now backfills only **missing nested values** inside an existing retained `productionRights` block.
   - Retained non-missing provenance values are not overwritten.
   - Invalid retained values remain visible as attention signals.

4. **Public chat/upload crash hardening + capability clarity**
   - Added request-stream `error`/`aborted` handling for public proxy body readers so aborted uploads/body reads return bounded behavior rather than risking uncaught request-stream exceptions.
   - Strengthened chat model instructions to explicitly state that public chat cannot execute admin/automation tasks and to be explicit when images are stored but not interpreted.
   - Updated chat UI hint text to clearly state the same task-execution and image-understanding boundary.

## Tests and evidence

- `apps/axiom-engine`:  
  `node --test test/automation-service.test.js test/chat-service.test.js`  
  `node --test test/engine.test.js`
- `apps/axiom-freedom`:  
  `node --test test/axiom-proxy.test.js`
- Added/updated regression coverage for:
  - production-rights auto-stamp + fail-closed assignability,
  - backfill without overwrite and invalid retained-value attention,
  - public chat capability instruction clarity,
  - aborted upload request non-crash behavior.

## Founder-blocked / outside-repository control

- Live `xiiom.com` chat task execution still depends on production secrets/account state not stored in this repository (for example `OPENAI_API_KEY` presence/validity and provider billing/plan status in Railway/OpenAI).
- Repository changes now provide clearer user-facing behavior and diagnostics, but production secret/account verification remains a founder-authorized operational step.
