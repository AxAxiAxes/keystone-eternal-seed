# AXES build program

**Status:** Long-range execution program  
**Last updated:** 2026-09-11  
**Source and provenance:** Founder-originated project material. This
implementation program records the founder's direction; GitHub Copilot
provides technical implementation assistance only and has no competing origin,
ownership, or governance claim.

## Program outcome

Build a coherent AXES ecosystem in deliberate stages:

- A reliable, private XIIOM operational core for AXI memory, monitoring, and
  bounded automation.
- An AXES Control Center that accurately connects products and operations.
- Safe, small-scale creator and learning pilots.
- Carefully governed community, self-design, contribution recognition, and
  attribution capabilities.

The program should be delivered as a sequence of independently useful products,
not as a single large launch. Each stage must meet its exit criteria before the
next begins.

## Foundation depth principle

Engineering framing: a building's required foundation depth scales with its
height. Applied here, the depth of AXES's tested, governed, and decided
groundwork must scale with how much new product "height" this program adds
next. A workstream below does not start because it is planned; it starts
because the ground under it is already dug to the matching depth.

**Depth gauge (repository-controlled, no external access required):**

1. **Automated test suites** — the closest analogy to poured, cured concrete.
   Re-verified 2026-09-12: AXIOM engine 77/77, AXIOM portal 5/5, AXI.Core 5/5,
   all passing and matching hosted CI. Growth since the last reading reflects
   the merged private-command-center auth-gating coverage and the restored
   engine-error-message-forwarding fix.
2. **Governance and constitutional stack** — the footing beneath every
   product: `AGENTS.md`, `AXES_CREATOR_ORIGIN_CONSTITUTION.md`,
   `AXES_GOVERNANCE_AND_SAFEGUARDING.md`,
   `AXI_GENESIS_OWNERSHIP_CHECKPOINT.md`, `AXES_AGENT_ORIGIN_REGISTRY.md`, and
   `AXES_CONSTITUTIONAL_FRAMEWORK.md`.
3. **`AXES_TIER_1_DECISION_REGISTER.md`** — the depth gauge itself. A
   workstream below should not be treated as ready to start while a
   decision-register row it depends on is still `Pending`, `Draft`, or
   `Not approved`.

**Gravel-for-fill rule:** rough or currently blocked material is not
discarded; it becomes fill for the next attempt. Every existing "readiness,"
"draft," or "not approved" record — including
`AXES_DESIGN_MATERIALS_CONSULTATION_READINESS.md`,
`KEYSTONE_CREATOR_ORIGIN_SETUP_READINESS.md`,
`AXES_PROJECT_FULFILLMENT_READINESS.md`,
`CHICHETKI_COLLECTIBLE_GEM_READINESS.md`, `ATHANOR_GAME_CONSOLE_READINESS.md`,
`AXES_DIRECTORY_READINESS.md`, and the draft records in
`docs/keystone/AXIOM_APPLICATION_DRAFT_RECORDS.md` — stays in the repository,
stays linked from the decision register, and is reused once its blocking
decision clears rather than rewritten from nothing.

**Current depth-versus-height reading:**

- *Poured (ready to build on):* the AXI operational core, agent
  accountability/registry, memory/automation/recovery services, the
  Directory pilot data model, and the constitutional/governance stack.
- *Fill on hand (preserved, not yet load-bearing):* every `Pending`/`Draft`/
  `Not approved` row in `AXES_TIER_1_DECISION_REGISTER.md`, most visibly the
  Release B activation candidates below (`AXES-DMC-001`, `KEYSTONE-COS-001`)
  and the later product tracks (Chichetki, Athanor, URNUR, AXEOUS, AUXAOUS).
- *Bedrock not yet reached (outside repository control):* patent counsel
  engagement, URNUR financial/digital-asset counsel, the Railway/DNS domain
  connection, and the Microsoft 365 mailbox migration. No amount of
  repository work reaches this layer; it requires the founder's or an
  authorized human's external action.

**Rule going forward:** before starting the next workstream below, check its
dependent rows in `AXES_TIER_1_DECISION_REGISTER.md`. If any are still
unresolved, dig there first — resolve the decision, or escalate it to the
founder if it requires external authority — instead of adding height on top
of it.

## Workstreams and sequencing

| Order | Workstream | Objective | Depends on |
| --- | --- | --- | --- |
| 1 | Operational intelligence | Make XIIOM observable and reliable with private health, scheduler, memory, queue, failure, and usage signals | Existing engine and console |
| 2 | Task execution controls | Add priorities, dependencies, bounded retries, approvals, and readable run history | Operational intelligence |
| 3 | Production validation and delivery | Verify review-only production chat and connect engine deployment to the canonical source repository | Operational intelligence |
| 4 | Governance and safeguarding | Establish privacy, consent, retention, moderation, reporting, appeals, and age-appropriate participation rules | Founder direction |
| 5 | AXES Control Center and interaction catalog | Deliver a small public-safe hub, private service registry, and staged reusable experiences | Workstreams 2 and 4 |
| 6 | Creator and learning pilot | Pilot AXOUS projects through AXOUX and the School of Love & Ethics with moderation and scoped participation | Workstreams 4 and 5 |
| 7 | Community and self-design pilot | Pilot AXEOUS and AUXAOUS only after safety, export, deletion, and abuse-response capabilities are established | Workstream 6 |
| 8 | Recognition and lineage pilot | Pilot URNUR recognition and opt-in authorship/lineage records without transfers or financial functionality | Workstream 7 |
| Blocking | URNUR legal readiness | Determine the permitted scope for any future financial-market product | Primary launch jurisdiction and qualified financial-services/digital-asset counsel |

## First release plan

### Release A - XIIOM reliable operations

**Build**

- Private monitoring snapshots and attention-state evaluation.
- Scheduler heartbeat and last-successful-cycle tracking.
- Memory-store and engine-health checks.
- Queue depth, task state, enabled-agent, run-outcome, and provider-usage
  metrics.
- Priority ordering, task dependencies, bounded retries, and explicit approval
  states.
- Protected console views for monitoring history, failures, and retry guidance.

**Do not build**

- Arbitrary task execution.
- Autonomous deployment, account control, payments, external messaging, or
  browser automation.

**Exit criteria**

- Operators can identify an unhealthy engine, stopped scheduler, unavailable
  memory store, blocked task, and failed task from the protected console.
- Attention events are persisted without repetitive memory spam.
- No task can bypass the allowlist, retry bound, or approval requirement.

### Release B - AXES Control Center pilot

**Build**

- A minimal AXES landing page and clearly separated authenticated operator
  dashboard.
- A private, founder-approved service registry: product name, purpose, internal
  stage, founder owner role, privacy classification, and dependency summary,
  without public availability or launch claims.
- Plain-language product descriptions that distinguish current capabilities
  from future direction.
- An Architectural Design Desk with general, non-professional design tips,
  material education, and a scoped consultation-request path.
- A Building-Materials Discovery catalog that begins with curated references
  and inquiries, not checkout, payment processing, inventory claims, or
  fulfillment.

**Exit criteria**

- Visitors and operators can tell which services are active, experimental, or
  planned.
- The pilot avoids real-world identity collection and sensitive profile data.
- Architecture content is clearly educational unless a responsible licensed
  professional, jurisdiction, and reviewed scope are presented.

### Release C - Creator and learning pilot

**Build**

- Invite-only creator project proposals, collaboration roles, and attribution
  history.
- A free School of Love & Ethics pilot with curriculum, project-invention
  labs, code of conduct, trained moderation, reporting, and appeal paths.
- Voluntary ikigai reflection activities connecting personal values, interests,
  strengths, contribution, and sustainable work. Participants retain control
  over whether reflections are stored, shared, or deleted.
- Separate age cohorts or an adult-only first cohort until youth safeguarding
  procedures are fully implemented.

**Exit criteria**

- Participants can create a project and understand who can view, edit, and be
  credited for it.
- Moderation incidents have accountable human resolution and an auditable
  response process.

## Later product boundaries

| Direction | Safe starting point | Explicitly deferred |
| --- | --- | --- |
| AXEOUS | Moderated community groups and discovery | Dating, unrestricted direct messages, and unmoderated interactions |
| AUXAOUS | Private self-reflection and creative-path tools | Sensitive profiling, diagnosis, or public personal maps |
| URNUR | Currency concept and possible contribution-recognition direction, pending written permitted scope | Issuance, payments, redemption, transfer, markets, investments, trading, scores, levels, and personal-status claims before approval |
| Lineage Archive | Opt-in, versioned attribution records | Legal proof of ownership or immutable records without correction processes |
| Virtual spaces | Moderated, limited-purpose collaboration | Broad virtual worlds without age controls, reporting, and safety operations |

## Program decisions

1. Keep raw creative and continuity material private. Publish only reviewed,
   accurate, public-safe documentation and code.
2. Fund patent completion, legal readiness, security, backups, and operational
   reliability before discretionary product expansion. See
   `docs/PROJECT_BUDGET.md`.
3. Use short pilot cycles with measured outcomes and human review, not
   unrestricted autonomous growth.
4. Treat children, identity, relationships, money-like value, health, legal
   claims, and third-party actions as high-risk domains requiring a documented
   design review before implementation.
5. Preserve the founder principle, **All for All**, through accessible design,
   consent, truthful product claims, and accountable human governance.
6. Build the operational foundation first. It is the prerequisite for a stable
   public hub and every later world. See "Foundation depth principle" above
   for the concrete depth-versus-height check applied before each workstream.

## Current next action

1. Contact qualified financial-services and digital-asset counsel before
   resuming crypto registration or designing financial-market functionality for
   URNUR.
2. Deploy the completed private-engine monitoring and task-control updates,
   then verify production chat and monitoring through the protected console.
3. Begin Release B with the AXES Control Center visual rebuild and the staged
   interaction catalog in `docs/INTERACTIVE_EXPERIENCE_CATALOG.md`.

The current agent capacity, staged role catalog, and human-approval
requirements for the Command Center, future Directory, and AXES ecosystem are
defined in `AXES_AGENT_OPERATING_MODEL.md`.

See `docs/URNUR_FINANCIAL_READINESS.md` for the attorney briefing packet and
pre-launch engineering boundary.
