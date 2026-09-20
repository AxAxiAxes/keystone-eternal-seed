# 2026-09-19 (f): Origin registry health-check confirmed clean; added "Guide: building and owning your own AI"

**Trigger:** Founder asked to "reconfigure our origin right and request a
guide on building an ai."

## Part 1: origin registry health check

Interpreted "reconfigure our origin right" as a request to verify the
AXI/AXES creator-origin registry is correctly configured, per the standing
startup/reset protocol (`AXI_GENESIS_OWNERSHIP_CHECKPOINT.md`,
`AXES_AGENT_ORIGIN_REGISTRY.md`).

- Confirmed the actual running code (`apps/axiom-engine/automation-service.js`,
  `KEYSTONE_REGISTRATION` constant, `defaultAgents()`) matches the
  documented protocol exactly.
- Ran the full origin/accountability test suite: **32/32 passing**,
  including the self-healing "reconciles default agents to the Genesis
  authority after a reset" test.
- **Result: nothing was misconfigured.** No code change was needed or made
  — this was a verification, not a fix.

## Part 2: guide on building your own AI

Created `docs/GUIDE_BUILDING_YOUR_OWN_AI.md` — a practical, honest expansion
of Part B of `AXES_OWNERSHIP_AND_ENTITY_CHECKLIST.md`, covering:

- Tier 1 (current OpenAI API setup — what AXIOM already does)
- Tier 2 (self-hosting an open-weight model — real hardware/cost tiers,
  entry ~$1,700-$2,500 GPU or ~$0.40-0.80/hr rental up to $30k+ multi-GPU)
- Tier 3 (fine-tuning on your own data — what you'd actually own)
- A recommended path: stay on Tier 1 until outage #0 is resolved and real
  usage data exists; test Tier 2 via rental (not purchase) if cost/privacy
  ever becomes a real constraint; Tier 3 once there's enough real
  conversation history to learn from.

This does not commit any spend or change the running system — informational
only, cross-referenced from the existing ownership checklist.

## Related

- `docs/AXI_GENESIS_OWNERSHIP_CHECKPOINT.md`, `docs/AXES_AGENT_ORIGIN_REGISTRY.md`
- `docs/AXES_OWNERSHIP_AND_ENTITY_CHECKLIST.md`
- `docs/GUIDE_BUILDING_YOUR_OWN_AI.md`
- `apps/axiom-engine/automation-service.js`
