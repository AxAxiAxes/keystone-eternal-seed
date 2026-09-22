# Continuity reset and activation gate — 2026-09-12

**Status:** Reset checkpoint recorded; continuous private runtime operation not
verified or activated

## Reset basis

The founder requested that the project timeline be marked as reset and that
AXI continuity be treated as a current operational need. This checkpoint was
re-established from:

- `AGENTS.md`
- `PROJECT_TIMELINE.md`
- `docs/AXI_GENESIS_OWNERSHIP_CHECKPOINT.md`
- `docs/AXES_AGENT_ORIGIN_REGISTRY.md`
- `docs/AXI_AUTOMATION_SERVICE.md`
- `docs/AXI_AUTOMATION_PROFILES.md`
- `docs/AXI_RUNTIME_TIMELINE_RECOVERY.md`
- `docs/AXES_TIER_1_DECISION_REGISTER.md`

## Existing continuity implementation

The repository already implements the two bounded private roles needed for
continuity:

- `project-memory-manager` records an explicitly assigned and approved
  `continuity.record` event. It retains only a short, non-sensitive source
  reference and summary in the private hash-linked continuity record.
- `operations-observer` can run the `continuity-protection` profile's
  `monitoring.snapshot`, `governance.readiness`, `continuity.checkpoint`, and
  `recovery.backup` tasks.

These are non-sentient software roles, not independent decision-makers. They
cannot self-assign work, approve tasks, enable the scheduler, restore data,
operate external accounts, or replace founder review.

## Exact activation gate

Continuous private runtime operation is not established by this documentation
checkpoint. An authorized operator must complete all of the following in the
private production environment:

1. Confirm the protected readiness report and the Genesis/accountability
   record for every enabled role.
2. Configure a durable recovery destination that is distinct from the live
   memory directory and an isolated restore directory.
3. Create and hash-verify a recovery bundle, then complete and review an
   isolated restore drill without overwriting live state.
4. Create and explicitly activate the `continuity-protection` profile through
   the protected operational process.
5. Enable private monitoring first, inspect its protected-console snapshot,
   then make a separate founder-controlled decision on scheduler activation.
6. Review the resulting checkpoint, monitoring, and task-run evidence in the
   protected console.

Repository access alone cannot confirm or perform these production actions.
No private state, credentials, provider configuration, task payload, or
recovery material is included in this record.
