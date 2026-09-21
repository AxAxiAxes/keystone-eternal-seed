<!--
Structural enforcement for docs/keystone/AGENT_SERVICE_DELIVERY_PROTOCOL.md.
Added 2026-09-20 because relying on memory/discipline alone let protocol
steps (suggestions, cost/time estimate, scope-match check, self-rating) get
skipped inconsistently. This template makes each step a visible, fillable
field on every PR, not an easy-to-forget mental checklist. Fill in every
section below before requesting merge; do not delete sections.
-->

## Task accountability

- Task-ID: <!-- Required format: TASK-YYYYMMDD-0001 unless using the exception path below -->
- Exception path: <!-- none | historical | administrative -->
- Exception reason: <!-- Required for historical/administrative exceptions; otherwise write "none" -->
- Directive author: <!-- Human who originated the direction -->
- Task owner: <!-- Human owner/accountable reviewer -->
- Implementer(s): <!-- Human and/or AI implementers -->
- Reviewer: <!-- Human reviewer or "pending founder review" -->
- Merger / acceptor: <!-- "pending merge" until known -->
- AI / tool attribution: <!-- e.g. Copilot App, local edits, manual review -->
- Continuity / memory record: <!-- docs/memory/... path or "pending in follow-up" -->
- Next review date: <!-- ISO date, "not scheduled", or archived rationale -->
- Repository artifact status: <!-- planned | in_progress | delivered | verified_partial | verified_success | blocked | failed | superseded | archived -->
- Real-world / production outcome status: <!-- not started | reported | verified_partial | verified_success | blocked | failed | not applicable -->
- Founder confirmation state: <!-- pending | confirmed | not required -->

## What founder instruction does this PR deliver?

<!-- Quote the originating instruction verbatim, or reference the exact
     conversation turn/timestamp it came from. -->

## Scope-match check (protocol step 5a)

<!-- Re-read the original wording. List exactly what was delivered.
     State explicitly whether it matches line-for-line, or name the
     interpretation taken if any ambiguity existed. -->

## Cost / time estimate vs. actual (protocol steps 5, 5b)

- Estimated: <!-- money + time, before execution -->
- Actual (agent-side): <!-- PR/CI timestamps -->
- Actual (founder-side time spent on this task/conversation, if determinable): <!-- span -->

## At least one suggested improvement beyond the literal ask (protocol step 4)

<!-- Required non-empty. If none exists, state why explicitly rather than
     leaving this blank. -->

## Self-rating (protocol step 7)

- Quality rating (1-10): <!-- with one-line justification -->
- Founder rating requested: yes (ask directly in the PR/chat, every time)

## Verification performed

<!-- Tests run, CI checks expected, manual verification steps taken. -->
