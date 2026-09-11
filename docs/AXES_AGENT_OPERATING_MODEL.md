# AXES agent operating model

**Status:** Proposed operating model; no new agents or capabilities are
enabled by this record

**Recorded:** 2026-09-10

## Purpose

This record defines a staged, accountable role model for AXI, the AXES Command
Center, the future AXES Directory, and related AXES services. A role profile is
not a grant of autonomy, an employee, an authority, or a public claim. It is a
bounded work category with a named human owner, permitted outputs, review
requirement, and stop condition.

The founder principle, **1 for 1, All for All**, guides reciprocal,
accessible, and accountable collaboration. It does not override consent,
privacy, safety, legal, professional, or human-approval requirements.

The model is governed by `AGENTS.md`,
`AXES_GOVERNANCE_AND_SAFEGUARDING.md`, `AXI_AUTOMATION_SERVICE.md`, and
`AXES_DIRECTORY_DATA_MODEL.md`. The stricter boundary applies.

## Current implementation capacity

The current private `axiom-engine` seeds four agent records: Memory Curator,
Automation Executor, Automation Auditor, and Operations Observer. Its
`registerAgent` operation has no numeric registry cap, so the repository does
not impose a maximum number of stored agent records.

That is not an operational capacity commitment. The current engine:

- Persists the registry in one private JSON state file.
- Supports only `memory.record`, `automation.noop`, and
  `monitoring.snapshot` task actions.
- Processes due tasks sequentially in one service process, from 1 to 20 per
  cycle, with a default of 5.
- Requires an authenticated operator to approve a task when the task is marked
  `approvalRequired`.
- Cannot deploy, change accounts, send messages, publish, spend funds, scrape,
  collect personal data, or make consequential decisions.

When OpenAI chat is enabled, request throughput is additionally limited by the
actual model and account rate limits configured in the OpenAI project. Those
limits are not available from this repository and must be checked in the
provider's project limits view before increasing usage. See the official
[rate-limit guide](https://platform.openai.com/docs/guides/rate-limits).

## Staged agent count

| Stage | Role profiles | Enabled agents | Purpose and release condition |
| --- | ---: | ---: | --- |
| Current foundation | 4 | 4 | Existing private memory, safe no-op, audit, and monitoring-observer roles only. |
| Command Center pilot | 5 | At most 5 | Add observation and change-readiness analysis after protected-console monitoring is working. |
| Directory preparation | 10 | At most 8 | Define directory-support roles only after every directory readiness gate is met; no data collection or listings. |
| Governed AXES ecosystem | 15 | At most 12 | Activate further roles one at a time after an owner, data map, review procedure, tests, and rollback path are approved. |

The **ultimate catalog is 15 role profiles**, but the practical ceiling for the
current single-process engine is **12 enabled roles**. Do not enable the
remaining profiles merely because they are defined. Any need for higher volume,
parallel work, or new actions requires a separate architecture, provider-limit,
security, privacy, and operational review.

## Role catalog

| # | Area | Role profile | Bounded responsibility | Human authority and prohibited outcome |
| ---: | --- | --- | --- | --- |
| 1 | Command Center | Operations Observer | Summarize private health, queue, memory, scheduler, and usage signals. | A human investigates and acts on alerts; no autonomous recovery, deployment, or account action. |
| 2 | Command Center | Incident Runbook Coordinator | Draft incident status, evidence checklist, rollback options, and next safe diagnostic. | A human declares incidents, changes production, and closes recovery. |
| 3 | Command Center | Automation Planner | Propose allowlisted task order, dependencies, priority, and approval requirements. | A human creates, approves, or rejects tasks; no new action type or schedule without review. |
| 4 | Command Center | Memory and Continuity Curator | Draft and, when explicitly scheduled, record validated non-sensitive memory entries. | A human confirms accuracy and retention; no secrets, personal data, or unreviewed claims. |
| 5 | Command Center | Change Readiness Auditor | Check a proposed change against tests, release evidence, rollback, and documented boundaries. | A human approves releases; no approval, deployment, or policy decision. |
| 6 | Directory | Listing Intake Steward | Identify missing non-sensitive fields in a business-submitted draft. | A human handles intake; no scraping, outreach, personal-data collection, or publication. |
| 7 | Directory | Representative Confirmation Reviewer | Compare proposed public fields with recorded owner/authorized-representative confirmation. | A designated human confirms authority and approves the listing; no identity verification claim. |
| 8 | Directory | Category and Scope Reviewer | Suggest an allowed factual category and general service-area wording. | A human decides category; no ranking, recommendation, eligibility, licensing, or quality judgment. |
| 9 | Directory | Renewal and Accuracy Steward | Surface due renewal dates, incomplete fields, and stale-record candidates. | A human requests or evaluates renewal; no automated outreach, renewal, or removal. |
| 10 | Directory | Correction and Removal Coordinator | Track a request's controlled status and draft the required review checklist. | A human resolves every correction, pause, decline, and removal request. |
| 11 | AXES ecosystem | Service Registry Steward | Maintain draft status, owner, privacy classification, and dependency summaries for AXES services. | A human validates status and decides launches, pauses, or retirement. |
| 12 | AXES ecosystem | Asset Provenance and Accessibility Coordinator | Check required source, rights, credit, and accessibility fields for proposed public assets. | A human clears assets for publication; no rights conclusion or autonomous publishing. |
| 13 | AXES ecosystem | Pilot Readiness Coordinator | Assemble missing governance, data-map, moderation, accessibility, and rollback evidence. | A human approves a pilot; no legal, safety, or eligibility decision. |
| 14 | AXES ecosystem | Contribution and Attribution Steward | Draft opt-in attribution records and flag incomplete consent or correction data. | A human confirms consent and attribution; no ownership, authorship, or legal-right determination. |
| 15 | AXES ecosystem | Cost and Capacity Reporter | Summarize recorded provider usage, task volume, and approved operating limits. | A human approves spending and capacity changes; no purchase, billing, budget, or vendor action. |

## Activation requirements

Before enabling any role profile beyond the current four, record:

1. A named human owner and the role's exact purpose.
2. The inputs, outputs, data classification, storage location, retention, and
   deletion path.
3. Allowed action types and explicit prohibited actions.
4. The required human review or approval point.
5. Test evidence, monitoring signals, failure handling, and rollback steps.
6. The current provider rate-limit and budget evidence, when the role can use
   OpenAI chat.

Directory roles remain preparation-only until the launch gates in
`AXES_DIRECTORY_READINESS.md` are complete. They must never change a listing
state, publish a listing, contact a business, or resolve a correction/removal
request without the accountable human reviewer.

## Next safe implementation sequence

1. Keep the existing four private roles active only after the Railway
   monitoring-first activation path is completed.
2. Add Operations Observer and Change Readiness Auditor as proposal-only roles
   after the protected console has current monitoring data.
3. Complete directory jurisdiction, privacy, correction/removal, terms, and
   service-area gates before registering any directory-support role.
4. Add remaining roles individually, with a tested capability, named owner,
   and explicit human approval path.

Do not implement a general agent executor, autonomous research loop, external
integration, browser control, messaging, publishing, payment, or data
collection capability as part of this model.
