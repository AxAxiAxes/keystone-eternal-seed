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
| Node tests | `npm ci` and `npm test` | `apps/axiom-engine` and `apps/axiom-freedom` |
| AXI.Core tests | `dotnet test AXIOM.sln --configuration Release` | AXI.Core library and tests |

The workflow has `contents: read` permission only. It does not receive
deployment credentials, access production data, contact third parties, enable
the scheduler, create tasks, publish, deploy, spend, or change any account.

## Promotion boundary

A passing validation run is implementation evidence only. It does not merge a
branch, deploy Railway services, configure a recovery destination, verify a
production backup, or authorize a scheduler. Those actions remain separately
human-authorized and must use the established recovery and deployment gates.
