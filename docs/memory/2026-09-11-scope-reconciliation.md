# 2026-09-11 Scope reconciliation

**Status:** Active continuity and scope checkpoint

## Reason for this record

Resets and resumed work can cause incremental implementation to appear to
replace the initial project intent. This record preserves the current
repository evidence without treating implementation sequence as founder
direction.

## Current system definition

AXES currently consists of:

- A preparatory AXES Directory pilot data model and governance slice. It is
  business-only, opt-in, human-reviewed, and not a live directory.
- A private AXI operations foundation for durable non-sensitive memory,
  accountable agents and tasks, monitoring, checkpoint/recovery evidence,
  source-linked coordinates, and a continuous operational record.
- Protected operator views for the AXI operations foundation. They are not
  public data-collection, publication, deployment, account-control, or
  third-party automation tools.

The Project Memory Manager is a fifth seeded AXI role. It can create only an
explicitly approved `continuity.record` event assigned to that role. The event
is stored in the private `axi-continuity-record-v1` hash-linked record and
cannot alter earlier entries.

## Limits retained

The repository does not establish full automation, eighteen active agents,
connected app-store services, current production deployment of this branch,
or a valid AXES Contracting browser endpoint. Current evidence supports five
seeded roles and nine allowlisted actions only.

No current code may autonomously deploy, change DNS or TLS, access external
accounts, handle payments, send messages, publish, scrape, collect personal
data, or make legal, financial, credential, quality, property-value, identity,
or ownership decisions.

## Evidence

- `docs/AXES_DIRECTORY_DATA_MODEL.md`
- `docs/AXES_DIRECTORY_READINESS.md`
- `docs/AXI_AUTOMATION_SERVICE.md`
- `docs/AXI_MEMORY_SERVICE.md`
- `docs/AXES_AGENT_OPERATING_MODEL.md`
- `docs/AXI_PROJECT_CONTEXT_CHECKPOINT.md`
- `apps/axiom-engine/continuity-record-service.js`
- `apps/axiom-freedom/automation.html`
