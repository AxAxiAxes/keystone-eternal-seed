# 2026-09-18au — Unified AXES OS platform breakdown (engine, movies, home services, currency)

## Trigger

Founder: "ok break it down with one os that will essentially be able to
carry out the entire engine, movies, avatars, homeservices, currency etc.."

## What was produced

`docs/AXES_OS_UNIFIED_PLATFORM_BREAKDOWN.md` — a synthesis document (no new
code, no new spend, no gate bypassed) mapping four production lines onto the
existing six-layer AXES OS architecture from
`docs/AXES_OS_VISION_AND_ARCHITECTURE.md`:

1. **Engine (AXIOM/AXI)** — substantially built and live, currently blocked
   by the ongoing production outage (queue #0).
2. **Movies/avatars** — concept only; the curated `urartuhi.com` precursor
   works, but public-upload + AI-generation is blocked by the new readiness
   gate (queue #13, added in record `at`).
3. **Home services (AXES Contracting)** — partially built, not yet
   activated; already the founder's own designated first-revenue track
   ("V2" in `FOUNDER_REVENUE_PRIORITY_OVERLAY.md`), blocked by queue
   #2/#3/#12.
4. **Currency (URNUR)** — not started at all, most heavily gated of the
   four; blocked on legal/counsel review (queue #6/#8/#9) before any
   engineering can begin.

Included a recommended build order (fix outage → activate home services →
resolve currency scope in parallel, since it's zero-engineering-cost until
counsel is engaged → movies/avatars last, needs its own moderation/budget
approval) — explicitly framed as a synthesis of priorities the founder
already set via `FOUNDER_REVENUE_PRIORITY_OVERLAY.md` and
`FOUNDER_ACTION_QUEUE.md`, not a new decision.

## Why this approach

The founder's request implied building one new unified system. Investigation
showed the six-layer AXES OS architecture already exists on paper and mostly
in practice (the engine layer is live); what was actually needed was a single
cross-reference showing which of the four described capabilities are real,
partial, or blocked, and why — rather than starting new engineering work that
would duplicate or bypass gates already recorded (outage #0, avatar
moderation #13, home-services activation #2/#3/#12, currency legal review
#6/#8/#9).

## What was NOT done

No code was written for any of the four production lines. No queue item was
resolved or bypassed. This is purely an organizing/cross-reference document.

## Related

- `docs/AXES_OS_UNIFIED_PLATFORM_BREAKDOWN.md` (new)
- `docs/AXES_OS_VISION_AND_ARCHITECTURE.md`
- `docs/keystone/FOUNDER_ACTION_QUEUE.md`
- `docs/FOUNDER_REVENUE_PRIORITY_OVERLAY.md`
- Builds on record `at` (avatar production readiness gate, item #13).
