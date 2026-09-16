# 2026-09-15 AXI automation scheduler: readiness check ("can AXI be automated?")

## What was asked

Founder asked "can axi be automated?" after the CI-gated auto-merge pipeline
(PR #75) went live.

## Answer

There are two distinct things named "automation" in this project, and they
should not be conflated:

1. **AXI's built-in scheduler** (`apps/axiom-engine`, controlled by the
   `AXIOM_AUTOMATION_ENABLED` environment variable). This is real, already
   implemented functionality — not a proposal. Five agent roles (Memory
   Curator, Project Memory Manager, Automation Executor, Automation Auditor,
   Operations Observer) process a fixed, versioned action allowlist
   (`memory.record`, `automation.noop`, `monitoring.snapshot`,
   `governance.readiness`, `recovery.backup`, `coordinate.record`,
   `continuity.checkpoint`, `continuity.record`, `source.catalog`,
   `business.metric`, `service.registry`). It cannot deploy, spend, publish,
   message, or contact an external system. See `docs/AXI_AUTOMATION_SERVICE.md`.
2. **The scheduled CLI workflow literally named "axi"** (workflow id
   `c9270edb-93a1-424f-9d56-993f415bb6fa`, prompt "run ai axi", daily). This
   one is already enabled and already running on its own schedule — it is a
   Copilot CLI automation, unrelated to the `axiom-engine` scheduler above.

## Readiness verification performed (repository-controlled)

To answer "can it be automated" with evidence rather than assumption, ran the
full AXI automation/recovery/monitoring test suite from this checkout:

```
node --test test/recovery-backup-service.test.js test/automation-service.test.js test/monitoring-service.test.js
```

Result: **26/26 passing**, covering:

- Task assignment, priority/schedule ordering, dependency blocking, retry
  limits, and allowlist enforcement (rejects any action outside the
  versioned list).
- Recovery backup create/verify/restore, including fail-closed behavior on
  unsafe or corrupted storage.
- Monitoring snapshot recording, attention-state transitions, and confirming
  `status()`/`history()` are read-only (do not rewrite `monitoring.json`;
  only `record()` does — the same read/write-separation pattern already
  fixed for `coordinate-service.js` in PR #72).
- Genesis/governance readiness reporting without making an ownership
  determination.
- Continuity checkpoint creation through the Operations Observer.

This confirms the scheduler's code path is functionally sound and safe to
enable *when a founder decides to*. It does not change the current
production or repository-template state.

## What was not done, and why

- Did **not** flip `AXIOM_AUTOMATION_ENABLED` (or `AXIOM_MONITORING_ENABLED`)
  to `true` anywhere, including `apps/axiom-engine/.env.example`. Both
  variables remain `false` in the repo template, matching the last verified
  production state (`2026-09-12-automation-ui-and-domain-status-reverification.md`:
  `xiiom.com/automation` returned `401`, confirming the admin gate is active
  and the scheduler is off).
- Enabling the scheduler in production is a Railway-side service-variable
  change per the AXI restart boundary in this repo's standing governance:
  monitoring must be enabled and reviewed via a protected-console snapshot
  first, and a verified recovery bundle must exist, before an authorized
  founder/operator accepts the scheduler's allowlist, task limits, and
  rollback path. Repository access alone does not authorize this.

## Founder quick answer

**"Can AXI be automated?"** → Yes, the capability already exists and its
code is verified working (26/26 tests, this record). It is currently off by
design in both the repo template and production. Turning it on requires a
Railway environment-variable change plus the staged monitoring → recovery
→ scheduler activation sequence in `docs/AXI_AUTOMATION_SERVICE.md`, which is
a founder/operator decision outside repository access.
