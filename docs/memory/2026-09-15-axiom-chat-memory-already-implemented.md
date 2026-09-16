# 2026-09-15 AXIOM chat persistent memory: confirmed already implemented (PR #73)

**Status:** Informational — closes a duplicate-work risk; no production
behavior changed.
**Scope:** Repository-only. No Railway/DNS/billing/vendor-account change; no
external service call beyond the routine repository review; test-only code
change.

## Task received

A cross-session request (from the "Chat cleanup" chat session) asked to
implement persistent conversation memory for the public AXIOM chat at
`https://xiiom.com/axiom`, assuming `AXIOM_MEMORY_DIRECTORY` "isn't yet used
by chat."

## Finding

Reading `apps/axiom-engine/chat-service.js`, `memory-store.js`, and
`index.js` showed the feature already exists and predates this request:

- `index.js` wires `MemoryStore(process.env.AXIOM_MEMORY_DIRECTORY)` into
  `ChatService`.
- `ChatService.reply()` loads the last 10 `episodic` memory entries as
  bounded OpenAI context, then records both the user message and the
  assistant reply as timestamped episodic entries.
- `MemoryStore` durably appends JSONL to the mounted directory, so history
  survives restarts, backed by the Railway Volume at `/app/data` already
  confirmed live in `docs/RAILWAY_DEPLOYMENT.md`.
- `git log` on both files traces this to the original
  `Add OpenAI-backed AXI chat handler` commit — well before PR #70 (a
  perf-only tweak to `MemoryStore.list()`, not a feature add).
- The separate `source-axiom-engine`/`source-axiom-freedom` remotes are
  stale legacy stubs; Railway deploys from this monorepo as documented, with
  no discrepancy found.

The only real gap versus the requested test coverage was that
`memory-store.js` had no dedicated unit test file (only exercised indirectly
via a mock in `chat-service.test.js`).

## What was done

PR #73 adds `apps/axiom-engine/test/memory-store.test.js` (persistence
across a simulated restart, `list()` ordering/limit validation, `record()`
validation, identity round trip). No production code changed. Full engine
suite: 85/85 passing locally after `npm install`.

The requesting "Chat cleanup" session was messaged with this finding to
prevent a duplicate re-implementation.

## Related records

- PR #73 — `test: add MemoryStore persistence coverage for AXIOM chat memory`
- `docs/RAILWAY_DEPLOYMENT.md` — confirms the persistent `axiom-engine` volume.
