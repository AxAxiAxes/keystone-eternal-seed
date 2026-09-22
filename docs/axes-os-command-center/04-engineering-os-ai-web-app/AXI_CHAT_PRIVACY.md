# AXI public chat: per-visitor privacy

**Status:** shipped (2026-09-16)

## What changed

Before this change, every visitor's chat with the public AXIOM widget was
recorded into one shared, unscoped memory log, and `GET
/api/axiom/history` returned that shared log to **any** visitor with no
authentication at all. In practice, one visitor could read another
visitor's entire chat history.

Now every chat session is private to the browser that started it:

- The public portal (`apps/axiom-freedom/server.js`) issues an opaque,
  anonymous `axiom_session` cookie (httpOnly, `SameSite=Lax`, 30-day
  expiry) the first time a browser hits the chat endpoints. This is **not**
  an account or a password-based "guest login" -- there is no identity,
  email, or credential attached to it. It exists only to separate one
  visitor's chat turns from another's.
- Every chat request (`POST /api/axiom` with `action: "chat"`) carries that
  session id to the engine. The engine (`apps/axiom-engine`) scopes both
  the conversation context it sends to the model and the turns it records
  to that session id (`chat-service.js`, `memory-store.js`).
- `GET /api/axiom/history` now returns only the calling browser's own
  session's turns, never anyone else's.
- A new browser (or a cleared cookie) always starts with zero prior
  context -- "new chats start fresh," by construction, since a new session
  id has no recorded entries yet.

## What this is not

- **Not a login system.** There is no username/password/account for
  visitors; the "guest" experience is simply an anonymous, private session
  scoped by an opaque cookie, not a registered identity.
- **Not a change to admin access.** The founder's/admin's access is
  unrelated to this cookie and continues to use the existing HTTP Basic
  Auth credential (`ADMIN_PASSWORD` in the portal, `AXIOM_ENGINE_ADMIN_PASSWORD`
  for engine calls) gating `requireAdmin`-protected routes. Nothing here
  grants, revokes, or changes admin rights.
- **Not multi-tenant user accounts.** AXI's own long-term continuity
  memory (identity, decisions, procedures) is unaffected -- this only
  scopes the public chat's own "episodic" turns and the context built from
  them.

## Design notes

- `MemoryStore.list(kind, limit, { metadataFilter, scanLimit })`: an
  optional metadata-equality filter, applied by scanning backward from the
  tail of the append-only log up to a bounded `scanLimit` (default 500
  lines) until `limit` matches are found. Omitting the filter preserves the
  exact prior unscoped behavior and performance characteristics.
- `ChatService.reply(message, { sessionId })`: when a sessionId is
  supplied, both the context built for the model and the turns recorded
  afterward are scoped to it. Internal/agent calls that pass no sessionId
  keep the previous unscoped behavior (they are not public-facing).
- The engine's own `/axiom` route mints a session id server-side
  (`crypto.randomUUID()`) if the caller supplies none, so "no session
  supplied" always means "start fresh," never "see everything."

## Testing

- `apps/axiom-engine/test/memory-store.test.js`: metadata-filtered reads,
  scan-limit bounding, and unfiltered-behavior parity.
- `apps/axiom-engine/test/chat-service.test.js`: context/recording scoped
  to a given sessionId.
- `apps/axiom-freedom/test/axiom-proxy.test.js`: cookie-scoped history
  isolation between visitors and a brand-new visitor seeing nothing.
- Full suites: `apps/axiom-engine` 118/118 passing, `apps/axiom-freedom`
  14/14 passing.
