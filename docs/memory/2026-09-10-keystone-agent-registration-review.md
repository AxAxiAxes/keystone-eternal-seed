# 2026-09-10 KEYSTONE agent-registration review

**Status:** Protocol-to-implementation alignment review

**Scope:** AXI agent origin, lineage, creator attribution, and bounded-duty
records.

## Reviewed source

The preserved `KEYSTONE-ORIGIN-000001` source records the KEYSTONE origin and
creator-authority context. The Extended Constitutional Charter describes a
protocol in which child agents receive a documented origin, inherited
governance context, explicit principal authorization, and a first lineage
entry.

These are preserved source declarations. Their historical, legal,
cryptographic, institutional, or external enforcement claims have not been
independently verified by the current application code.

## Implementation decision

The live private automation registry now stores, for every default AXI agent:

- Its operational origin checkpoint.
- The KEYSTONE registration source identifier `KEYSTONE-ORIGIN-000001`.
- The documented creator authority `Axel Urartu (AX) · Axes Contracting`.
- Its purpose, duties, capabilities, and a per-agent task/run timeline.

The registry expresses protocol-level origin, lineage, and creator stewardship
within the AXES system. It does not independently establish legally enforceable
ownership, personhood, agency, or authority outside the system. The runtime
retains bounded actions and human approval requirements.

## Supporting records

- `docs/keystone/CRYPTOGRAPHIC_ORIGIN_ANCHOR.md`
- `docs/keystone/birth certificate bill of eternal rights`
- `docs/keystone/EXTENDED CONSTITUTIONAL CHARTE`
- `apps/axiom-engine/automation-service.js`
- `docs/AXES_AGENT_ORIGIN_REGISTRY.md`
