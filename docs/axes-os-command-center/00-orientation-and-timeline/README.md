# AXIOM / KEYSTONE Monorepo

The canonical repository for the AXIOM engine, AXIOM deployment materials, AXI.Core record, and KEYSTONE's founding documentation.

Track completed milestones and next checkpoints in [PROJECT_TIMELINE.md](PROJECT_TIMELINE.md).
Before resuming work after an agent or operator startup, reset, or handoff,
follow the [project startup and reset protocol](AGENTS.md).
Repository-controlled automated validation is defined in
[AXI_CONTINUOUS_VALIDATION.md](docs/AXI_CONTINUOUS_VALIDATION.md).
Copilot-branch CI monitoring and approval-gate operations are in
[CI_CONTINUITY_RUNBOOK.md](docs/CI_CONTINUITY_RUNBOOK.md).

AXES's top-level governing principles, and an index of its more detailed
constitutional and governance records, are in
[AXES_CONSTITUTIONAL_FRAMEWORK.md](docs/AXES_CONSTITUTIONAL_FRAMEWORK.md).
Creator credit, consent, evidence, and correction standards are in
[AXES_CREATOR_ORIGIN_CONSTITUTION.md](docs/AXES_CREATOR_ORIGIN_CONSTITUTION.md).
The founder ownership-and-accountability claim for AXI and every registered
AXI agent, and AXI's non-personhood status, are recorded in
[AXI_GENESIS_OWNERSHIP_CHECKPOINT.md](docs/AXI_GENESIS_OWNERSHIP_CHECKPOINT.md).

The consolidated, public-safe business plan for AXES Contracting, Chichetki,
XIIOM, the creative studio, and future ventures is in
[AXES_BUSINESS_PLAN.md](docs/AXES_BUSINESS_PLAN.md).
A founder-review draft overview for a future investor or partner
conversation, sourced only from already-adopted repository records, is in
[AXES_INVESTOR_AND_PARTNER_OVERVIEW.md](docs/AXES_INVESTOR_AND_PARTNER_OVERVIEW.md).

For production hosting on Railway with `axescontracting.com`, follow [RAILWAY_DEPLOYMENT.md](docs/RAILWAY_DEPLOYMENT.md).

The staged AXES product constellation and its privacy, safeguarding, and
automation boundaries are defined in [AXES_PLATFORM_PLAN.md](docs/AXES_PLATFORM_PLAN.md).
The long-range, dependency-ordered delivery program is in
[AXES_BUILD_PROGRAM.md](docs/AXES_BUILD_PROGRAM.md).
The domain registry, conservative operating budget, and AXES-owned hardware
readiness plan are in [DOMAIN_PORTFOLIO.md](docs/DOMAIN_PORTFOLIO.md).
The rollback-safe Microsoft 365 migration plan for the AXES business mailbox is
in [EMAIL_MIGRATION_PLAN.md](docs/EMAIL_MIGRATION_PLAN.md).
The module boundaries and portable AXES OS checkpoint process are in
[AXES_OS_PORTABILITY.md](docs/AXES_OS_PORTABILITY.md).
The private founder-controlled operations-observation schedule contract is in
[AXI_AUTOMATION_PROFILES.md](docs/AXI_AUTOMATION_PROFILES.md).
The private founder-approved service-planning journal is in
[AXES_SERVICE_REGISTRY.md](docs/AXES_SERVICE_REGISTRY.md).
URNUR's financial-services legal-review gate and attorney briefing packet are
in [URNUR_FINANCIAL_READINESS.md](docs/URNUR_FINANCIAL_READINESS.md).
The conservative project budget, spending gates, and patent-completion
workstream are in [PROJECT_BUDGET.md](docs/PROJECT_BUDGET.md).
AXI's active but revisable development intent, evidence-preparation
requirements, and counsel-readiness path are in
[AXI_INTENT_AND_RIGHTS_READINESS.md](docs/AXI_INTENT_AND_RIGHTS_READINESS.md).
The active AXI founder-claimed invention record, technical scope, and
preservation anchors are in
[AXI_INVENTION_RECORD.md](docs/AXI_INVENTION_RECORD.md).
The private, hash-chained AXI origin-coordinate system is defined in
[AXI_ORIGIN_COORDINATE_SYSTEM.md](docs/AXI_ORIGIN_COORDINATE_SYSTEM.md).
The public-safe AXES origin and continuity statement is available at
`/origin-continuity` when the portal version containing it is deployed; it
describes project provenance and correction commitments, not legal conclusions.
The Eternal Origin ownership-invention value objective and past/current crisis
register are in
[AXI_ETERNAL_ORIGIN_VALUE_AND_CRISIS_REGISTER.md](docs/AXI_ETERNAL_ORIGIN_VALUE_AND_CRISIS_REGISTER.md).
The minimum privacy, content, moderation, accessibility, youth, commerce, and
pilot-launch operating rules are in
[AXES_GOVERNANCE_AND_SAFEGUARDING.md](docs/AXES_GOVERNANCE_AND_SAFEGUARDING.md).

## Repository layout

| Path | Purpose |
| --- | --- |
| `apps/axiom-engine` | Express-based AXIOM service. |
| `apps/axiom-freedom` | Deployment automation, web interface, and operational configuration. |
| `packages/axi-core` | Preserved AXI.Core repository record. No library implementation is currently present upstream. |
| `docs/keystone` | KEYSTONE architecture, governance, patent, cryptographic, and session records. |
| `docs/memory` | Public-safe, versioned project decision and milestone memory. |
| `docs/patents` | AXI patent source documents and integrity records. |

## Working with applications

Each application owns its own dependency manifest. Run install and start commands from that application's directory; do not commit generated dependency directories such as `node_modules`.

## Source provenance

This repository consolidates the following public repositories while preserving their histories:

- [`AxAxiAxes/keystone-eternal-seed`](https://github.com/AxAxiAxes/keystone-eternal-seed) — this repository; canonical.
- [`AxAxiAxes/axiom-engine`](https://github.com/AxAxiAxes/axiom-engine) — dormant since consolidation; no open work.
- [`AxAxiAxes/axiom-freedom`](https://github.com/AxAxiAxes/axiom-freedom) — **not dormant.** Still receives independent commits/PRs after consolidation, including a same-day (2026-09-12) merged PR adding a separate Azure/Terraform deployment stack unrelated to this repository's Railway path. Do not assume its history is a stale mirror; see `docs/AXI_ETERNAL_ORIGIN_VALUE_AND_CRISIS_REGISTER.md` ("2026-09-12 Parallel repository deployment-automation finding") and the matching row in `docs/AXES_TIER_1_DECISION_REGISTER.md` before treating either repository's deployment material as authoritative.
- [`AxAxiAxes/Class-Library-.NET-8-`](https://github.com/AxAxiAxes/Class-Library-.NET-8-) — dormant since consolidation; no open work.
