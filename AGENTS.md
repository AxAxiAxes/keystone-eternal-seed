# AXES project startup and reset protocol

Every agent or operator resuming work after startup, reset, handoff, or lost
context must complete this protocol before changing code, configuration, or
deployment state.

## Required readiness check

1. For AXI work, read `docs/AXI_GENESIS_OWNERSHIP_CHECKPOINT.md` and
   `docs/AXES_AGENT_ORIGIN_REGISTRY.md`. Before registering, assigning, or
   scheduling an agent, confirm its protected report has the required Genesis
   checkpoint, creator ownership-and-accountability claim, operational origin,
   and active accountability status. Do not use an unreconciled or suspended
   agent record.
2. Read `README.md`, `PROJECT_TIMELINE.md`, and `docs/memory/README.md`, then
   read the latest relevant continuity record in `docs/memory/`.
3. Read the plan, governance, and deployment records that apply to the
   requested work. For AXI/XIIOM operations, include
   `docs/AXES_BUILD_PROGRAM.md`, `docs/AXES_PLATFORM_PLAN.md`,
   `docs/AXI_AUTOMATION_SERVICE.md`, `docs/ENGINE_INTEGRATION.md`, and
   `docs/RAILWAY_DEPLOYMENT.md`.
4. Inspect the active branch, working-tree changes, recent commits, and the
   current timeline checkpoints. Preserve unrelated work and do not overwrite
   it.
5. State the concrete task, acceptance evidence, applicable boundaries, and
   whether the task can be completed from repository access alone.
6. Confirm authority before any external or consequential action. Repository
   access does not authorize domain, DNS, Railway, email, cloud, payment,
   vendor, legal, or account changes.

## Task-relevant intelligence loop

After completing the readiness check, begin a bounded intelligence review for
the active task. Use repository evidence first, then current primary sources
or official documentation only when the task depends on information that may
have changed. Record the source, date checked, finding, and implementation
relevance in a continuity record when it materially affects project direction.

During active work, continuously compare findings against the requested
outcome, current checks, and established boundaries. Implement a discovered
improvement only when it is directly relevant, repository-controlled,
reversible where practical, within the current authority, and can be
validated. Otherwise, preserve it as a clearly labeled proposal or blocker for
an authorized human decision.

Do not send repository code, secrets, personal data, private records, or
credentials to external research systems. A research result does not authorize
an external integration, account action, procurement, publication, outreach,
professional claim, or change outside the approved task scope.

## Qualification and authority boundary

An agent can assist with repository analysis, implementation, testing,
documentation, and bounded operational proposals only within demonstrated
technical context. It must not claim professional qualification or make legal,
financial, licensing, insurance, identity, safety, construction, property,
privacy, security, or personnel determinations.

Actions outside repository control require an authorized human owner and,
where applicable, qualified professional review. Do not invent credentials,
assume deployment access, expose secrets, or treat a passing local test as
evidence that a production domain, secret, DNS record, mailbox, or service is
configured.

## AXI and XIIOM restart boundary

On every service startup or configuration reset, treat automation as disabled
until its private configuration is reviewed. Enable private monitoring first,
inspect a protected-console snapshot, and then enable the scheduler only when
an authorized operator accepts the configured allowlist, task limits, and
rollback and recovery path. Before enabling the scheduler, verify the latest
private runtime recovery bundle and confirm it is stored in the separately
configured recovery location. If a reset lost runtime state, restore the
verified bundle only into the isolated recovery directory, compare it, and
obtain an authorized decision before using it as engine state. The scheduler
must remain limited to the versioned actions in
`docs/AXI_AUTOMATION_SERVICE.md`; it cannot deploy, access accounts, spend,
message, publish, control third-party services, or overwrite live memory.

## Continuity record

When a meaningful milestone, deployment verification, or unresolved blocker is
confirmed, add a concise, factual entry under `docs/memory/` that links to the
supporting code, document, commit, or external evidence. Never include
credentials, personal information, private transcripts, or secret
configuration in the record.
