# Automation activation profiles

**Recorded:** 2026-09-11
**Status:** Completed repository-controlled foundation

`apps/axiom-engine/automation-profile-service.js` adds the private,
hash-linked `axi-automation-profile-v1` record. The
`operations-observation` starter can create two recurring Operations Observer
tasks after explicit founder confirmation. The founder-configured path also
exposes every active registered role's existing allowlisted capabilities with
compatible role/action selection, recurrence, existing-task dependencies,
approval requirements, and action-specific structured input. Profiles are
visible only through private engine and authenticated portal routes, become
runtime attention on tampering, and are included in checkpoints and recovery
bundles.

This does not enable a scheduler, change any real role assignment, access an
external service, or establish production readiness. See
`docs/AXI_AUTOMATION_PROFILES.md`.
