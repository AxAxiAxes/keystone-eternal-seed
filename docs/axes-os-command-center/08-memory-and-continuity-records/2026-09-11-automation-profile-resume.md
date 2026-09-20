# 2026-09-11 Automation profile resume

**Status:** Completed repository-controlled lifecycle enhancement

## Finding

Paused private Automation Profiles retained their task associations but could
not return to active status without a new profile definition.

## Implementation

The protected profile lifecycle now supports a separate, explicit
`confirmed: true` resume transition. Resume requires the same startup,
catalog, metrics, service-registry, governance, active-role, capability, and
immutable task-association checks as activation. It reuses the exact retained
task identifiers, creates no replacement task, preserves the hash-linked
audit history, and returns profile-managed task processing eligibility only
after validation.

## Boundary

Resume does not enable the scheduler, run any task, add a role or capability,
modify a task definition, deploy, contact an external service, collect data,
access an account, send a message, publish, spend, accept payment, or make a
financial or legal decision.
