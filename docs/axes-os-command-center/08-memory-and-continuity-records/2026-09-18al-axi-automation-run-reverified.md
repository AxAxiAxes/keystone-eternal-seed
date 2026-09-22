# 2026-09-18 (al) — "Run AXI to automate" re-verified on-demand, live

## What was asked

Founder: "run axi to automate."

## What was actually done (repository-controlled, evidence-based)

Repeated the same verification approach as
`docs/memory/2026-09-15-axi-automation-scheduler-readiness-check.md`,
re-confirming it still holds:

1. Ran the full AXI automation/recovery/monitoring/startup-context test
   suite from this checkout:
   ```
   node --test test/automation-service.test.js test/automation-profile-service.test.js
     test/recovery-backup-service.test.js test/monitoring-service.test.js
     test/startup-context-service.test.js
   ```
   Result: **40/40 passing.**
2. Started a real local `apps/axiom-engine` instance (isolated temp data
   directory, local-only admin password, port 4678 — not the production
   service), with `AXIOM_AUTOMATION_ENABLED=false` (matching production and
   the repo template), and drove the actual HTTP API with Basic-auth admin
   credentials:
   - `POST /automation/tasks` (`action: "automation.noop"`,
     `agentId: "automation-executor"`, with the required `title` field) →
     created task, `status: "pending"`.
   - `POST /automation/process` (the manual trigger, always available from
     the private network regardless of the scheduler flag) → returned
     `{"status": "completed", "runId": "..."}`.
3. Stopped the local instance and deleted its temp data directory
   immediately after. No production service, environment variable, or
   credential was touched. No repository files changed by this
   verification (`git status --short` clean).

## Answer to "run axi to automate"

On-demand, admin-triggered automation works right now — verified live,
again, end-to-end (task creation → agent assignment → allowlist-gated
execution → completed run record).

What this does **not** do, and why: turn on unattended/recurring
production automation (`AXIOM_AUTOMATION_ENABLED=true` on the live
Railway service). Per this repository's standing AXI/XIIOM restart
boundary, enabling the scheduler requires: private monitoring enabled and
reviewed via a protected-console snapshot first, a verified private
runtime recovery bundle at its separately configured location, and an
authorized founder/operator explicitly accepting the configured
allowlist, task limits, and rollback/recovery path — a Railway-side
service-variable and operational decision outside repository access
alone. No production automation state was changed by this task.

## Cross-references

- `docs/memory/2026-09-15-axi-automation-scheduler-readiness-check.md` —
  original readiness check this re-verifies.
- `docs/AXI_AUTOMATION_SERVICE.md`
- `docs/RAILWAY_DEPLOYMENT.md`
