# AXI continuous validation

**Status:** Repository-controlled automation

## Purpose

`.github/workflows/axi-continuity-validation.yml` validates the current AXI
source before and during promotion to the documented production-source branch.
It runs automatically for pushes to `axaxiaxes-axes-directory-data-model` and
`axaxiaxes-axiom-monorepo`, for pull requests targeting
`axaxiaxes-axiom-monorepo`, and when manually dispatched from GitHub Actions.

## Automated checks

| Job | Check | Scope |
| --- | --- | --- |
| Node tests | `npm ci` and `npm test`; the engine job also runs `node --test ../../.github/scripts/test/record-workflow-run-continuity.test.js` | Both apps and synthetic workflow-continuity regressions |
| AXI.Core tests | `dotnet test AXIOM.sln --configuration Release` | AXI.Core library and tests |
| Directory fixture validation | `node --test` in `docs/fixtures/axes-directory` | Public-safe synthetic Directory fixtures |
| Engine image | Build and start `apps/axiom-engine/Dockerfile`; query private `/health` | Production engine image and imported runtime modules |
| Portal image | Build and start `apps/axiom-freedom/Dockerfile`; query `/health` and `/origin-continuity` | Production portal image, including required public and protected-view assets |

These validation jobs have `contents: read` permission only and never receive
continuity/deployment credentials or call a live private engine. Workflow
regressions mock GitHub and runtime requests and use disposable local Git
fixtures/state. Validation does not enable a scheduler, create live tasks,
publish, deploy, spend, or change an account.

The separate `Copilot workflow continuity automation` job is not a validation
job or a required check. It is off by default, runs only for eligible
`workflow_run` events or canonical-branch manual replay, and adds read-only
Actions permission to verify an actual upstream run/attempt. After explicit
owner configuration it can submit one bounded coordinate record to the
private runtime through its authenticated portal. Push/PR validation cannot
select that job. Its authority and opt-in are in `CI_CONTINUITY_RUNBOOK.md`;
merging code alone is not runtime activation.

## Promotion boundary

A passing validation run is implementation evidence only. It does not merge a
branch, deploy Railway services, configure a recovery destination, verify a
production backup, or authorize a scheduler. Those actions remain separately
human-authorized and must use the established recovery and deployment gates.
