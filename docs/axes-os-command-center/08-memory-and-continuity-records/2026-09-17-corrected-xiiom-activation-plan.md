# Corrected the founder-relayed "XIIOM home activation" plan

**Date:** 2026-09-17

## What happened

The founder relayed a second conversation with an external AI (not this
repository, not GitHub Copilot) proposing a "XIIOM home activation
sequence" for Railway + SiteGround. It listed six environment variables
to set (`AXIOM_RUNTIME_INIT_ENABLED`, `AXIOM_TASK_SPINE_ENABLED`,
`AXIOM_CAPABILITY_ENGINE_ENABLED`, `AXIOM_SERVICE_REGISTRY_ENABLED`,
`AXIOM_RESEQUENCER_ENABLED`, plus the real `AXIOM_AUTOMATION_ENABLED`)
and described a "resequencer" module that becomes "alive" once activated,
using symbolic language ("OWAWAWAO," "root frequency," "AXIOM's
residence").

## Verification against the repository

Checked every referenced name directly against the code:

- `AXIOM_AUTOMATION_ENABLED` and `AXIOM_MONITORING_ENABLED` are real,
  documented flags (`apps/axiom-engine/.env.example`,
  `apps/axiom-freedom/.env.example`, read in `index.js`).
- `AXIOM_RUNTIME_INIT_ENABLED`, `AXIOM_TASK_SPINE_ENABLED`,
  `AXIOM_CAPABILITY_ENGINE_ENABLED`, `AXIOM_SERVICE_REGISTRY_ENABLED`,
  and `AXIOM_RESEQUENCER_ENABLED` **do not appear anywhere in the
  codebase**. Nothing reads them; setting them on Railway would have no
  effect.
- "The resequencer" corresponds only to a symbolic certificate document
  (`docs/keystone/CERTIFICATE_MICROCOSMIC_COORDINATE_SOUND_RESEQUENCER.md`),
  not a runtime module. There is no code component to "activate" for it.
- The Support Desk fields the founder is actually seeing as "unavailable"
  (Runtime readiness, Automation, Automation profiles, Service registry,
  Checkpoints) are real, existing status fields backed by
  `GET /system/readiness` in `apps/axiom-engine/index.js` and the real
  `serviceRegistryService`/`automationProfileService`/checkpoint state --
  they are driven by whether the real env vars above are set and whether
  a checkpoint has ever been recorded, not by any fictional switch.

## What was done

Wrote `docs/activation/2026-09-17-xiiom-home-activation-plan.md`: a
corrected, evidence-based activation plan listing only the environment
variables that actually exist and what each Support Desk field is really
backed by, plus the real steps to bring automation/monitoring online on
Railway. It explicitly calls out which parts of the original external-AI
plan were fabricated, so the founder does not spend deployment time
setting variables that do nothing.

No code was changed. No deployment action was taken -- this repository
has no Railway or SiteGround account access; setting the real
environment variables and confirming DNS/proxy routing remains an
external, founder-driven action outside repository control, consistent
with the established authority boundary (see `AXES_AGENT_ORIGIN_REGISTRY.md`
and prior continuity records on unbounded-access requests).

## Follow-up

If the founder sets the real variables and something still fails, the
next step is to read the specific `lastError` value the engine reports
at `/system/readiness` rather than treating a generic "unavailable" as
if it were fully diagnosed.
