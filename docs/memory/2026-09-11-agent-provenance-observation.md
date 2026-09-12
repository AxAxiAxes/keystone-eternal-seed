# AXI agent provenance and observation

**Recorded:** 2026-09-11
**Status:** Completed repository-controlled enhancement

## Finding

The five existing AXI software roles required clearer retained
creation/registration evidence and factual private visibility without granting
new authority or describing the roles as people.

## Implementation

`apps/axiom-engine/automation-service.js` now preserves immutable `createdAt`
evidence alongside legacy `registeredAt` values, backfilling only absent
creation evidence from a valid registration timestamp or the current migration
record. Protected agent reports, agent lists, governance readiness, and
Operations Observer monitoring snapshots include factual per-agent
observations of provenance, registration, compatible capabilities, assigned
task states, recent run, and attention conditions.

## Boundary

No agent, capability, assignment, scheduler setting, external service, or
consequential control changed. The records preserve internal project-governance
attribution only; they do not claim cognition, feelings, memory completeness,
legal personality, ownership, rights, or external state.
