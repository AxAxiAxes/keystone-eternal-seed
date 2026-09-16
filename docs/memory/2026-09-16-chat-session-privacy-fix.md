# Fixed a real privacy bug: public AXI chat sessions were shared across all visitors

**Date:** 2026-09-16

## Founder request

> can you make each session private please, so new chats start fresh and
> private under guest login, admin for me?

## What was found

Investigating this surfaced a genuine, already-live privacy bug, not just a
feature gap:

- `apps/axiom-engine/memory-store.js`'s `list()`/`record()` had no concept
  of a visitor/session at all -- every chat turn from every visitor was
  appended to one shared `episodic.jsonl` log, and every chat's "recent
  context" was built from that same shared log.
- `apps/axiom-freedom/server.js`'s `GET /api/axiom/history` was fully
  public (unauthenticated) and returned that entire shared log (filtered
  only to exclude internal agent-to-agent turns) to any visitor.

In practice: any visitor to the public site could read every other
visitor's chat history, and one visitor's messages could leak into
another's model context.

## What was shipped

- Anonymous, opaque per-browser `axiom_session` cookie (httpOnly,
  `SameSite=Lax`, no identity attached -- **not** a password/account
  system) minted by the portal on first chat/history request.
- `MemoryStore.list()` gained an optional `metadataFilter` (with a bounded
  backward scan, not a full-file scan) so reads can be scoped to one
  session's own entries without changing the unfiltered-read performance
  characteristics.
- `ChatService.reply()` now accepts a `sessionId` and scopes both the
  context sent to the model and the turns it records to it.
- The engine's `/axiom` chat route and `GET /memory/:kind?sessionId=`
  route wire this through; a caller supplying no sessionId gets a fresh,
  isolated one minted server-side, so "no session" always means "empty
  history," never "see everyone's."
- `GET /api/axiom/history` is now scoped to the calling browser's own
  session only.
- Documented in `docs/AXI_CHAT_PRIVACY.md`.

## What this deliberately does not do

- No real user accounts, usernames, or passwords for visitors -- "guest"
  here means anonymous-and-private, not registered. Building an actual
  account/login system (email+password, OAuth, etc.) is a materially
  larger, credential-dependent feature and was not requested with that
  level of specificity; flagging it as a distinct possible follow-up if
  the founder wants real visitor accounts later.
- Founder/admin access is untouched -- it already uses a separate HTTP
  Basic Auth credential (`ADMIN_PASSWORD` / `AXIOM_ENGINE_ADMIN_PASSWORD`)
  gating `requireAdmin` routes, unrelated to the new visitor-session
  cookie.

## Testing

- `apps/axiom-engine/test/memory-store.test.js`: new metadata-filter +
  scan-limit tests.
- `apps/axiom-engine/test/chat-service.test.js`: new session-scoping test.
- `apps/axiom-freedom/test/axiom-proxy.test.js`: rewrote the public-history
  test to assert per-session isolation (a fresh visitor sees nothing; a
  returning visitor with the right cookie sees only their own turns).
- Full suites: `apps/axiom-engine` 118/118 passing, `apps/axiom-freedom`
  14/14 passing.

## Follow-up worth flagging

- If the founder later wants real, named visitor accounts (not just
  anonymous private sessions), that's a distinct, larger feature requiring
  a credential/identity model -- worth a dedicated request when needed.
