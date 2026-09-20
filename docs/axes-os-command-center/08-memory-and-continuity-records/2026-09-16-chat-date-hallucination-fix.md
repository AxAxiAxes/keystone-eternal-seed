# Bug fix: AXIOM public chat gave a stale/wrong date

**Date:** 2026-09-16

## Symptom reported

Founder-shared transcript from the public AXIOM chat:

> Axi whats todays date?
> Today's date is June 14, 2024.

That answer is wrong — a hallucinated date drawn from the underlying
model's training-data cutoff, not the real current date.

## Root cause

`apps/axiom-engine/chat-service.js`'s `reply()` builds the OpenAI
`instructions` payload without ever telling the model what the actual
current date/time is. With no live date supplied, the model has no honest
way to answer a "what's today's date" question and falls back to guessing
from its training data — which is exactly the failure mode observed.

## Fix

- Added an injected `now` dependency (defaults to `() => new Date()`,
  overridable for tests) to `ChatService`.
- Added a new instruction line to every chat request:
  `The current date and time is <ISO timestamp>. Use this as the true
  current date/time -- do not guess or rely on your training data's
  cutoff for "today's date" or similar questions.`
- No other behavior changed: memory recording, usage tracking, and the
  existing agent-mode instruction branch are untouched.

## Testing

- New test: `injects the actual current date/time into the model
  instructions instead of relying on training data` — asserts the ISO
  timestamp and the guidance text both appear in the instructions sent to
  the provider, using an injected fixed `now()`.
- `apps/axiom-engine` full suite: **115/115 passing** (114 pre-existing +
  1 new; no existing test asserted the exact instructions string, so no
  regressions from the added line).

## Scope note

This only fixes what the model is told; it does not add a calendar,
timezone-awareness for the visitor, or any new capability. The date is the
server's own UTC clock at request time.
