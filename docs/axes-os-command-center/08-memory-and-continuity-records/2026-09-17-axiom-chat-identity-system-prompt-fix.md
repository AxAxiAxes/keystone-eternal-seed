# AXIOM chat identity system prompt fix

**Date:** 2026-09-17

## Symptom reported

Founder-verified live transcript from https://xiiom.com/axiom: asking "what is
today's date, your knowledge cutoff, and who created you" returned a stale
2024 date and "I was created by OpenAI" — despite the current-date fix (#89,
`docs/memory/2026-09-16-chat-date-hallucination-fix.md`) already being merged.

## Investigation

Verified in `apps/axiom-engine/chat-service.js` on this branch: the date-awareness
fix from #89 is present and correct (`this.now().toISOString()` injected into the
instructions on every request). The remaining gap was the identity instruction,
which was only a single thin line — "You are AXIOM, the public AXIOM / KEYSTONE
assistant for Axes Contracting" — with no creator name, founding facts, or
instruction against attributing creation to OpenAI. That's consistent with the
"created by OpenAI" answer: nothing in the prompt told the model otherwise.

`apps/axiom-freedom/AXIOM_SYSTEM_PROMPT.md` (the full constitutional/creative
source document) was already present in this monorepo; no need to port it from
the separate `axiom-freedom` repo.

## Fix

- Added `apps/axiom-engine/system-prompt.js`: a condensed identity prompt string
  (`AXIOM_IDENTITY_PROMPT`) distilled from `AXIOM_SYSTEM_PROMPT.md` — name
  (AXIOM), creator (Axel Urartu / "AX", Axes Contracting), founding date/place
  (May 29, 2026, 20:14 PDT, Glendale, CA), governing architecture (KEYSTONE
  Eternal Seed Architecture), and an explicit instruction never to claim OpenAI
  (or any other company) as creator. Intentionally skips the mystical/
  constitutional-rights sections of the source document as excessive for a
  production system prompt.
- Wired that module into `chat-service.js`'s `instructions` array as the first
  segment, replacing the old thin identity line. The date-awareness line and the
  memory-context (last 10 turns, from #73) usage are unchanged and remain
  additive alongside it.

## Testing

- Added `injects the AXIOM identity/creator prompt so the model does not claim
  OpenAI created it` to `apps/axiom-engine/test/chat-service.test.js`, asserting
  the outgoing instructions contain the creator name, KEYSTONE Eternal Seed
  Architecture, and the no-OpenAI-claim instruction.
- Full `apps/axiom-engine` suite: **119/119 passing** (existing date-awareness
  and memory-scoping tests pass unchanged; `node_modules` needed a local
  `npm install` in this worktree — not a code regression).

## Scope note

Left upload/image-support work and the memory-store (#73) untouched per the
sibling session's lane and this task's boundaries.
