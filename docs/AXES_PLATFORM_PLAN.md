# AXES platform plan

**Status:** Directional product plan  
**Last updated:** 2026-09-09  
**Founder principle:** All for All
**Source and provenance:** Founder-authored material developed collaboratively
with GitHub Copilot. The raw source remains private; this is its reviewed,
public-safe implementation interpretation.

## Purpose

AXESContracting.com is intended to become the central administrative hub for a
constellation of related products. The system should help people create,
collaborate, learn ethical practices, and preserve authorship records while
maintaining privacy, safety, and human oversight.

The names and concepts below describe product intent. They do not establish
legal citizenship, legal identity, currency, professional advice, ownership,
or any other legal right.

## Product constellation

| Product | Role | Initial, bounded product direction |
| --- | --- | --- |
| AXES Contracting | Central hub and operator control center | Navigation, authenticated operator dashboard, service status, and approved product links |
| XIIOM | Home of AXI and automation operations | Private memory, bounded automation, audited agent proposals, and service monitoring |
| AXEOUS | Community and participation space | Safe community profiles, moderated groups, and collaboration discovery |
| URNUR | Recognition of constructive contribution | Non-transferable recognition points and contribution history; not money, a payment system, or a tradable asset |
| AXOUS / AXOUX | AXOUS creator initiative through the AXOUX site | Project proposals, collaboration workspaces, authorship attribution, and an opt-in lineage archive |
| AUXAOUS | Self-design and reflection tools | Private, user-controlled self-mapping and creative-path tools |
| School of Love & Ethics | Free learning and project-invention program | Age-appropriate curriculum, moderated project labs, consent-aware participation, and accessible learning resources |

## Operating principles

1. **Human authority:** Automation proposes, records, and performs only
   explicitly allowlisted actions. It cannot independently deploy, access
   accounts, spend funds, make legal decisions, or contact people.
2. **Privacy by default:** Collect the least data needed. Do not put sensitive
   identity, health, financial, or private relationship information in agent
   prompts, public profiles, or append-only records.
3. **Consent and control:** People can understand, review, export, and request
   deletion of their data according to the applicable policy and technical
   limits. Authorship and lineage entries need clear opt-in terms.
4. **Safety for all ages:** Any feature available to minors requires a distinct
   safeguarding design before release: age-appropriate experience, moderation,
   reporting, parental or guardian workflows where required, and no adult-minor
   social or dating interaction.
5. **Honest claims:** Product language must not imply citizenship, currency,
   guaranteed emotional outcomes, legal protection, or ownership rights unless
   those claims have been implemented and reviewed by qualified counsel.
6. **Accessible participation:** The free school and collaboration spaces
   should support different ages, abilities, cultures, and technical access
   levels.

## Delivery sequence

### Phase 0 - Stabilize the existing foundation

- Verify live chat uses the private engine secret and records usage privately.
- Add private intelligence monitoring: service health, scheduler heartbeat,
  memory availability, queue depth, failed tasks, enabled agents, run outcomes,
  and token totals.
- Add task priority, dependency, retry, approval, and run-history controls
  while retaining the allowlist.
- Configure the private engine's Railway source deployment from this monorepo.

**Exit condition:** The authenticated console exposes a trustworthy operational
view, records changes and failures, and no task can bypass the action allowlist
or approval boundary.

### Phase 1 - Establish the AXES control center

- Create a public-safe AXES landing and a separately authenticated operator
  control center.
- Add a service registry that lists each product's purpose, status, owner, and
  privacy classification.
- Establish identity, authorship, moderation, retention, incident-response,
  and terms-of-use policies before collecting community data.
- Use a simple project registry instead of an "origin passport" until the
  underlying identity, consent, and legal requirements are fully defined.

**Exit condition:** AXES provides accurate navigation and operations visibility
without collecting unnecessary personal information or making unverified
claims.

### Phase 2 - Creator projects and learning

- Launch AXOUS through AXOUX as an invite-only project proposal and
  collaboration pilot.
- Launch the School of Love & Ethics as content and moderated project-invention
  labs, beginning with adult-only or clearly separated age cohorts.
- Include voluntary ikigai reflection activities that help participants explore
  what they value, enjoy, do well, can contribute, and may wish to sustain.
  These activities are educational prompts, not assessments, diagnoses, or
  prescriptions.
- Implement opt-in authorship attribution and version history for submitted
  projects.
- Add trained human moderation, community rules, reporting, and appeals before
  opening participation broadly.

**Exit condition:** A small pilot can create projects, participate safely, and
receive clear ownership and moderation outcomes.

### Phase 3 - Community and self-design

- Pilot AXEOUS community groups with verified moderation workflows.
- Pilot AUXAOUS private self-reflection tools with minimal data collection and
  clear deletion/export behavior.
- Do not launch dating, unrestricted messaging, or virtual-world interactions
  until safety controls, age separation, abuse prevention, and moderation
  capacity are proven.

**Exit condition:** Community and self-design features demonstrate safe,
consented participation in a limited pilot.

### Phase 4 - Recognition and archival systems

- Pilot URNUR as non-transferable recognition for contributions.
- Build the Lineage Archive as an opt-in, versioned attribution record.
- Evaluate any future exchange, payment, auction, or token concept separately
  with financial, consumer-protection, tax, and jurisdictional review before
  design or implementation.

**Exit condition:** Recognition and archival records are transparent,
non-financial, consented, and auditable.

## Near-term implementation priorities

1. Complete operational monitoring and task-execution safeguards in XIIOM.
2. Validate production chat and source-based deployment for the private engine.
3. Define governance, data handling, moderation, and safeguarding requirements
   for the public-facing AXES pilot.
4. Build the AXES service registry and authenticated control-center shell.
5. Pilot creator projects and a safely scoped learning program before broader
   community features.

The detailed execution sequence is maintained in
[AXES_BUILD_PROGRAM.md](AXES_BUILD_PROGRAM.md).

## Decisions requiring explicit review

The following require a separate, documented decision before implementation:

- Collection or verification of real-world identity information.
- Features involving minors, dating, direct messages, or virtual interaction.
- Currency, payments, trading, auctions, property, investments, or rewards
  that can be transferred or redeemed.
- Legal, medical, mental-health, financial, or professional guidance.
- External integrations that create, modify, deploy, purchase, publish, or
  contact third-party accounts.
