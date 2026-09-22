# AXES OS vision and architecture

**Status:** Founder-shared long-term vision and reference architecture, not a
committed build phase
**Recorded:** 2026-09-12
**Source and provenance:** Founder-originated framing, shared in conversation
and preserved here for continuity. GitHub Copilot provides technical
implementation assistance and repository-evidence cross-referencing only, and
has no competing origin, ownership, or governance claim.

## Purpose

This document preserves the founder's "AXES platform evolution timeline" and
"AXES OS" architecture sketch, and reconciles each part against what the
repository and live deployment actually show today. It is a **reference and
planning input**, not an approved roadmap. Building the described "AXES OS" as
a standalone sovereign runtime is a large, multi-phase undertaking; nothing in
this document commits engineering time to it beyond what
[`AXES_BUILD_PROGRAM.md`](AXES_BUILD_PROGRAM.md) already schedules.

**Framing note:** "Sovereign" and "jurisdiction" below are used in the
technical/architectural sense used throughout this vision — control over your
own runtime, data, UI, and processes rather than dependence on a single
vendor's platform. Nothing in this document establishes, claims, or implies
legal sovereignty, legal jurisdiction, statehood, currency, or exemption from
applicable law. Any product language that could be read that way remains
subject to the same review requirement already stated in
[`AXES_PLATFORM_PLAN.md`](AXES_PLATFORM_PLAN.md)'s "Decisions requiring
explicit review."

## The AXES platform evolution timeline

As articulated by the founder, with a repository-evidence status column added:

| Phase | Name | Stack described | Status against repository/production evidence |
| --- | --- | --- | --- |
| 1 | WordPress Era (Training Wheels) | GoDaddy WordPress, Elementor Pro, Crocoblock/JetPlugins, JetFormBuilder | **Historical.** Matches the legacy stack recorded in [`VENDOR_AND_SUBSCRIPTION_AUDIT.md`](VENDOR_AND_SUBSCRIPTION_AUDIT.md); superseded, not part of the current deployment. |
| 2 | Hosting Independence (SiteGround) | SiteGround hosting, founder-owned domains | **Historical/transitional.** [`RAILWAY_DEPLOYMENT.md`](RAILWAY_DEPLOYMENT.md) documents the DNS handoff from the legacy host to Railway; SiteGround is referenced only as the prior DNS holder during cutover. |
| 3 | AXIOM Birth (Constitutional Intelligence) | AXIOM backend, GitHub (`axiom-freedom`), Docker, Nginx, Railway/Azure | **Substantially implemented and live.** `apps/axiom-engine`, `apps/axiom-freedom`, this monorepo, Docker images built in CI, and the Railway deployment at `xiiom.com` (health-checked this session) all exist today. |
| 4 | AXIOM Automation Console (Operational Sovereignty) | Automation console, agents, queues, memory curator, health/scheduler | **Substantially implemented.** Matches [`AXI_AUTOMATION_SERVICE.md`](AXI_AUTOMATION_SERVICE.md) and the module table in [`AXES_OS_PORTABILITY.md`](AXES_OS_PORTABILITY.md) (`automation`, `monitoring`, `checkpoint`, `recovery`). Founder review of the allowlist and accountability status is still required before enabling processing per [`AXI_GENESIS_OWNERSHIP_CHECKPOINT.md`](AXI_GENESIS_OWNERSHIP_CHECKPOINT.md). |
| 5 | AXAXAU / AXES Cosmology (Sovereign Narrative) | Brand-world, constitutional documents, hostility index, sovereignty charters | **Partially represented.** Constitutional and origin documents already exist ([`AXES_CONSTITUTIONAL_FRAMEWORK.md`](AXES_CONSTITUTIONAL_FRAMEWORK.md), [`AXES_CREATOR_ORIGIN_CONSTITUTION.md`](AXES_CREATOR_ORIGIN_CONSTITUTION.md), `docs/keystone/`). A named "hostility index" or standalone "sovereignty charter" document was not found under this exact name; treat that as a gap to fill if the founder wants it formalized, not as already delivered. |
| 6 | AXES OS (Target State) | A sovereign runtime treating UI, data, sessions, and agents as founder-controlled territory | **Not started.** This is the forward-looking target described in the architecture sketch below. No implementation work has begun on a unified "AXES OS" runtime distinct from the existing AXIOM engine/portal. |

## High-level architecture for AXES OS (as proposed)

A layered target architecture, preserved as described:

1. **Sovereign Core (AXIOM Kernel)** — the AXIOM constitutional engine
   (prompts, rules, charters) plus an identity and origin module. Role:
   defines what is allowed, hostile, or sovereign.
2. **Process & Agent Layer** — the AXIOM Automation Console (agents, queues,
   schedulers) plus task orchestration. Role: runs agents the way an OS runs
   programs.
3. **Data & Memory Layer** — a local-first, exportable user data vault plus a
   memory curator for sessions, logs, and state. Role: AXES OS owns the record
   of what happened, not the host platform.
4. **UI & Interaction Layer** — an AXES UI shell (web, desktop, or hybrid) with
   pluggable panels (console, chat, dashboards, timelines). Role: a founder-
   controlled interface rather than a host platform's own UI.
5. **Integration & Host Layer** — connectors/adapters to Windows, macOS,
   browsers, cloud APIs, GitHub, hosting, email, and calendars. Role: rides on
   top of existing systems, treating them as resources rather than masters.
6. **Governance & Compliance Layer** — the hostility index, responsibility
   framework, and user-rights charter referenced above, plus logging, audit,
   consent, and configuration policy. Role: ensures every action respects the
   project's own stated rules.

### How today's repository maps onto this architecture

| Proposed layer | Closest existing implementation |
| --- | --- |
| Sovereign Core | `apps/axiom-engine` chat/constitutional prompt handling; `docs/AXI_GENESIS_OWNERSHIP_CHECKPOINT.md`, `docs/AXES_AGENT_ORIGIN_REGISTRY.md` |
| Process & Agent Layer | `apps/axiom-engine/automation-service.js`; `docs/AXI_AUTOMATION_SERVICE.md` |
| Data & Memory Layer | The `memory`, `checkpoint`, and `recovery` modules in `docs/AXES_OS_PORTABILITY.md` |
| UI & Interaction Layer | `apps/axiom-freedom` portal pages and the authenticated command-center proxy |
| Integration & Host Layer | `docs/RAILWAY_DEPLOYMENT.md`, GitHub Actions CI, Docker images |
| Governance & Compliance Layer | `docs/AXES_GOVERNANCE_AND_SAFEGUARDING.md`, `docs/AXES_CONSTITUTIONAL_FRAMEWORK.md`, this repository's decision registers |

No new layer needs to be invented from scratch; the founder's six-layer model
is a useful way to organize and name work that is, in evidence-backed part,
already under way inside the existing AXIOM engine/portal rather than a
wholly separate system.

## Roadmap notes (not a commitment)

The founder's shared next step was: *"sketch AXES OS v0.1 as a concrete
feature list you can actually build."* That scoping decision is preserved here
as an open backlog item, not started, pending founder prioritization against
the phases already scheduled in
[`AXES_BUILD_PROGRAM.md`](AXES_BUILD_PROGRAM.md). Before any "AXES OS v0.1"
work begins, it should get its own entry in
[`AXES_TIER_1_DECISION_REGISTER.md`](AXES_TIER_1_DECISION_REGISTER.md) so it is
sequenced deliberately rather than started in parallel with existing
committed work.

## Related records

- [`AXES_PLATFORM_PLAN.md`](AXES_PLATFORM_PLAN.md)
- [`AXES_BUILD_PROGRAM.md`](AXES_BUILD_PROGRAM.md)
- [`AXES_OS_PORTABILITY.md`](AXES_OS_PORTABILITY.md)
- [`AXI_AUTOMATION_SERVICE.md`](AXI_AUTOMATION_SERVICE.md)
- [`VENDOR_AND_SUBSCRIPTION_AUDIT.md`](VENDOR_AND_SUBSCRIPTION_AUDIT.md)
