# 2026-09-10 agent operating model

**Status:** Proposed capacity and role model

**Scope:** AXI Command Center, future AXES Directory, and broader AXES service
operations.

## Current verified capacity

The private `axiom-engine` currently seeds three agent records and does not
impose a numeric registry limit in `registerAgent`. This is not a claim of
unlimited operational capacity: it persists records in one private JSON file,
executes due tasks sequentially in one process, and supports only
`memory.record` and `automation.noop` actions.

The scheduler handles from 1 through 20 due tasks per cycle, with a default of
5. Any OpenAI-backed chat use is constrained by the actual account and model
rate limits, which must be reviewed in the provider project before usage grows.
The current official reference is the OpenAI
[rate-limit guide](https://platform.openai.com/docs/guides/rate-limits),
reviewed on 2026-09-10.

## Decision

`AXES_AGENT_OPERATING_MODEL.md` establishes a catalog of 15 bounded role
profiles. The initial operational target is five roles; the current
single-process engine should not enable more than 12 until a separate
architecture, privacy, security, rate-limit, and operational review supports
additional capacity.

Each profile is proposal- or record-oriented and has a human owner, explicit
scope, prohibited outputs, activation evidence, and stop condition. The
founder principle, **1 for 1, All for All**, informs accountable collaboration
without overriding consent, privacy, safety, legal, professional, or
human-approval requirements.

## Supporting records

- `apps/axiom-engine/automation-service.js`
- `docs/AXI_AUTOMATION_SERVICE.md`
- `docs/AXES_AGENT_OPERATING_MODEL.md`
