# XIIOM home activation plan (corrected)

**Date:** 2026-09-17
**Status:** Reference plan for founder-driven deployment configuration.
**Scope:** What is required to bring the already-merged AXIOM engine
(PR #92 and earlier) to a fully "ready" state on Railway + SiteGround,
based on what the code actually reads and reports.

## Why this document exists

The founder relayed a conversation with a different AI proposing an
"activation sequence" for a set of environment variables
(`AXIOM_RUNTIME_INIT_ENABLED`, `AXIOM_TASK_SPINE_ENABLED`,
`AXIOM_CAPABILITY_ENGINE_ENABLED`, `AXIOM_SERVICE_REGISTRY_ENABLED`,
`AXIOM_RESEQUENCER_ENABLED`) and a symbolic "resequencer" runtime module.

**None of those variable names exist in this codebase.** Setting them on
Railway would have no effect, because nothing in `apps/axiom-engine` or
`apps/axiom-freedom` reads them. The "resequencer" referenced in that
conversation corresponds only to a symbolic certificate document
(`docs/keystone/CERTIFICATE_MICROCOSMIC_COORDINATE_SOUND_RESEQUENCER.md`)
-- it is not a runtime component and there is nothing to switch on for it.

This document replaces that plan with the real configuration surface,
verified directly against `apps/axiom-engine/index.js`,
`apps/axiom-engine/.env.example`, and `apps/axiom-freedom/.env.example`.

## What actually drives the `/support` dashboard's status fields

`GET /system/readiness` (engine) and the `/support` page (portal) report on
real, existing state:

| Support Desk field | Backed by |
| --- | --- |
| Runtime readiness | Storage directory read/write access + `/system/readiness` responding at all |
| Provider (chat) | Whether `OPENAI_API_KEY` is set |
| Automation | `AXIOM_AUTOMATION_ENABLED=true` (engine's own scheduler) |
| Monitoring | `AXIOM_MONITORING_ENABLED=true` |
| Automation profiles | `AutomationProfileService` initialization (independent of the scheduler flag) |
| Service registry | `serviceRegistryService.status()` -- a real, existing service (`apps/axiom-engine/service-registry-service.js`) that records founder-approved internal service entries; it is not deployment proof, just a record store |
| Checkpoints | Whether any checkpoint has been recorded via the admin-gated checkpoint route |

There is no separate "Task Spine enabled" or "Capability Engine enabled"
flag -- the task/agent/capability system in `automation-service.js` runs
whenever the process is up; it doesn't have its own on/off switch beyond
the scheduler flag above.

## Real activation steps

### 1. Railway (backend: `apps/axiom-engine`, `apps/axiom-freedom`)

Set these environment variables (all names verified against
`.env.example` in each app):

```
# axiom-engine
AXIOM_ENGINE_ADMIN_PASSWORD=<a strong secret>
OPENAI_API_KEY=<your key>            # required for chat + "provider: configured"
AXIOM_AUTOMATION_ENABLED=true        # enables the task scheduler
AXIOM_MONITORING_ENABLED=true        # enable before automation, per existing guidance

# axiom-freedom (portal/proxy)
AXIOM_ENGINE_URL=<internal URL of the axiom-engine service>
AXIOM_ENGINE_ADMIN_PASSWORD=<must exactly match the engine's value above>
ADMIN_PASSWORD=<strong secret for the portal's own /support and /command-center Basic Auth>
```

Redeploy. Railway redeploys automatically on variable changes.

### 2. Verify

Visit `https://xiiom.com/support` (admin sign-in required). Expect:

- Runtime readiness: ready
- Provider: configured
- Automation: enabled
- Monitoring: enabled
- Service registry: ready (this only means the record store initialized;
  it does not certify anything is deployed elsewhere)

If any field still reports "unavailable," check the corresponding
Railway service log for the specific error -- the engine returns the
real failure reason in `lastError` fields, not a generic status.

### 3. SiteGround

SiteGround serves the public site content; it does not run the engine.
If `xiiom.com` needs to reach the Railway-hosted engine through it, the
DNS/proxy configuration for that routing is an external hosting-platform
action outside repository control -- this document does not change or
verify that routing, since neither engine repo has access to DNS or
SiteGround credentials.

## What is deliberately not in this plan

- No fabricated environment variables.
- No claim that a "resequencer" activates as a runtime effect -- it
  remains a symbolic document only.
- No claim that this plan alone guarantees `xiiom.com`'s public DNS/proxy
  routing is correct; that must be verified directly against the live
  site by whoever holds the SiteGround/Railway accounts.
