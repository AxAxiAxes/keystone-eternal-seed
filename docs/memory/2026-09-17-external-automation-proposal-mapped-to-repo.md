# External automation proposal mapped against repository reality

**Date:** 2026-09-17

## What was relayed

The founder shared a 560-line conversation with an external AI (not this
repository, not GitHub Copilot) discussing xiiom.com's architecture and
proposing a plan to "automate AXIOM" with six components:

1. **Task Spine** — task definitions, execution rules, memory anchors,
   permission boundaries, fallback logic, error recovery.
2. **Skill Library** — modular capabilities (write, analyze, design, refine,
   plan, interpret, build).
3. **Task Router** — parse request → identify skill → check doctrine →
   execute → validate → store → offer refinement.
4. **Site Builder Protocol** — content blocks, page templates, component
   library, style rules, so AXI can help build xiiom.com itself.
5. **Memory Engine** — identity, doctrine, symbolic, task, user, and site
   memory.
6. **Safety Constitution** — allowed/forbidden actions, priority rules,
   conflict resolution, uncertainty handling.

It also proposed two concrete starter items: a `calibrate_time` skill (the
external AI was told AXI thought it was 2024 — the same stale-date bug this
repository already fixed in PR #89/#91) and an `initialize_axiom_runtime`
startup sequence.

## What this analysis found

Most of the proposed architecture **already exists** in this repository
under different names, built independently over the preceding weeks of
work. Mapping proposal → repository:

| Proposed piece | Repository reality |
| --- | --- |
| Task Spine | `apps/axiom-engine/automation-service.js` — agents, capability-matched tasks, approvals, retries, `processDueTasks()` execution loop. **Already built.** |
| Task Router | Same file — `createTask()`/`reviewTaskApproval()`/`processDueTasks()` already do parse → match capability → approve → execute → record. **Already built.** |
| Safety Constitution | `docs/AXI_GENESIS_OWNERSHIP_CHECKPOINT.md`, `docs/AXES_AGENT_ORIGIN_REGISTRY.md`, the fixed `TASK_ACTIONS` allowlist, and `requireAdmin` gating on every mutating route. **Already built.** |
| log_task_event / task memory | Automation task history plus `docs/memory/` continuity records. **Already built.** |
| Memory Engine | `memory-store.js`'s episodic/semantic/decision/procedure kinds plus identity. **Mostly built** — missing a distinct "site memory" kind, which is moot until Site Builder Protocol exists. |
| Skill Library | The capability allowlist exists but has no site-content-generation skill. **Partially built**, blocked on the item below. |
| Site Builder Protocol | **Not built.** AXI generating or editing xiiom.com's own content directly is a materially larger capability than the existing metadata-only source cataloging (which never touches the live site). This needs an explicit founder scoping decision before any implementation — specifically: what AXI may generate autonomously vs. what always requires human review before publishing, and whether generated content is staged for review or can go live directly. |
| Growth Loop | **Not built, not recommended as a routine change.** "AXIOM updates its own internal model after every task" describes self-modifying behavior. This needs a dedicated safety/governance review before it is even scoped as a task, not a bounded engineering change. |
| calibrate_time skill | **Already built and shipped** (PR #89: live date injected into every chat request's instructions; PR #91: visible ticking clock in the chat UI). |
| initialize_axiom_runtime | **Not built as a single named sequence**, though its pieces (readiness checks, identity load) already exist individually. Small, low-risk candidate for a future bounded PR. |
| Friendly status report | **Not built.** The underlying data exists; no endpoint renders it in first-person phrasing. Small, low-risk candidate for a future bounded PR. |

## What was done with this

- Added all ten items as checkboxes under a new "AXIOM automation
  architecture roadmap" subsection in `PROJECT_TIMELINE.md`'s existing
  "Current checkpoints" list — verified via `getCommandCenterCheckpoints()`
  that they parse correctly and will show up live on the admin Command
  Center dashboard for founder monitoring.
- Logged the same ten items as session-tracked todos for this working
  session (four `done`, two `in_progress`, two `blocked` pending an
  explicit founder decision, two `pending` as small buildable candidates).
- Did **not** implement any new capability in this change — this was
  explicitly an analysis/organization request, not a build request. The
  two flagged "blocked" items (Site Builder Protocol, Growth Loop) follow
  the established governance pattern: expansions of AXI's autonomous
  capability get a founder decision point before implementation, not a
  unilateral build.

## Next step, if the founder wants to proceed

Pick one of the four open items to build next:
- The two small, low-risk candidates (`initialize_axiom_runtime` sequence,
  friendly status report) can be built as a routine bounded change with no
  further approval needed.
- The two larger items (Site Builder Protocol, Growth Loop) need an
  explicit scoping answer first: for the Site Builder Protocol, whether
  AXI-generated site content is staged for review or can publish directly,
  and what parts of the site (if any) it may touch autonomously.
