# Public AXIOM chat: continuous history, day-timeline, and gated uploads

**Date:** 2026-09-15
**Type:** Implementation record

## Founder request

> "please update interface, with send button, continuous chat history on a
> timeline with Titled Summary for the day and timestamps any other user
> friendly options, so we send docs images and if any other user friendly
> options can be made."

## What shipped

`apps/axiom-freedom/axiom_web_interface.html` (the public AXIOM chat page,
no page-level auth) and its proxy `apps/axiom-freedom/server.js`:

1. **Continuous chat history.** On load, the page now fetches
   `GET /api/axiom/history` (new, public route) instead of always starting
   from a static greeting. The proxy calls the engine's existing
   `GET /memory/episodic` (already public — this is the same trust boundary
   the engine already exposed, not a new opening) and filters to entries
   with `metadata.source === "chat"` and no `metadata.agentId`, which
   excludes the separate admin-only `/automation/chat` agent conversations
   that share the same memory kind.
2. **Day-grouped timeline with a titled summary per day.** Entries are
   sorted chronologically (the engine returns newest-first) and grouped by
   calendar day. Each day gets a divider showing the weekday/date and a
   lightweight "titled summary": the first user message of that day
   (truncated) plus a message count — e.g. "Friday, September 15, 2026 —
   Hello AXIOM · 4 messages". This is a deterministic, repository-computed
   label, not an AI-generated abstractive summary (that would need a new
   chat-service call per day and is a larger feature; flagged as a possible
   future enhancement if the founder wants richer summaries).
3. **Per-message timestamps.** Every bubble shows a local `HH:MM` time under
   its content.
4. **Document/image sending — deliberately kept admin-gated.** Added
   `POST /api/axiom/uploads` on the proxy, forwarding to the engine's
   existing admin-gated `POST /system/source-catalog/uploads` (shipped in
   PR #80). The public chat page is otherwise anonymous, so the upload
   button is wired to trigger the browser's native Basic-Auth prompt (the
   same mechanism `command-center.html`/`automation.html` already rely on)
   rather than becoming reachable by anonymous visitors. This preserves the
   safety boundary from PR #80: raw file bytes are never accepted from an
   unauthenticated caller, even though the surrounding chat page is public.
   Defense in depth: the proxy's own `requireAdmin()` check runs first, and
   the engine enforces its own `requireAdmin` again independently.
5. **Other UX polish implemented:** a loading state while history loads,
   graceful fallback to the original greeting if history is empty/engine
   unreachable, clear inline error bubbles for upload failures (oversized
   file, empty file, engine unavailable), and the upload confirmation
   message shows filename/size/sha256 plus a reminder that cataloging still
   needs separate operator approval (consistent with PR #80's boundary).

## Why the upload route is public-page-reachable but not public-usable

The `/api/axiom/uploads` route is registered on the same public server as
the chat page (there is only one server process for `axiom-freedom`), but it
is not equivalent to opening `/system/source-catalog/uploads` to anonymous
traffic:

- It requires this proxy's own `ADMIN_PASSWORD` via Basic Auth
  (`requireAdmin()`), which an anonymous browser visitor does not have and
  cannot obtain from the page.
- It forwards to the engine using the engine's own separate
  `AXIOM_ENGINE_ADMIN_PASSWORD`, held server-side only.
- A 5 MB cap (`AXIOM_MAX_UPLOAD_BODY_BYTES`, mirroring the engine's own
  cap) applies at the proxy layer before the request is even forwarded.

## Testing

- Added 5 new tests to `apps/axiom-freedom/test/axiom-proxy.test.js`
  covering: history filtering (excludes `agentId`-tagged entries and other
  memory kinds), history's engine-unreachable 502 path, upload 401 without
  admin credentials, upload 400 on an empty body, upload 201 success with
  `sourceReference`/`sha256`/`size` verification, upload 413 oversize, and
  upload 502 passthrough when the engine is unreachable.
- Full suite: `apps/axiom-freedom` 13/13 passing, `apps/axiom-engine`
  103/103 passing (no regressions).

## Not done / explicitly out of scope this round

- No AI-generated abstractive per-day summaries (see above).
- No image *understanding* — AXI still cannot see/analyze uploaded images;
  this only lets the founder store image bytes via the same upload path
  used for documents (see
  [`2026-09-15-github-read-only-access-and-image-capability.md`](2026-09-15-github-read-only-access-and-image-capability.md)
  for the "can AXI read images" answer, unchanged: no).
- No pagination/"load older messages" affordance beyond the existing
  100-entry cap; flagged as a possible future enhancement if conversation
  volume grows.
