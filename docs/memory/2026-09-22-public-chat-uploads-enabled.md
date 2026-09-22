# Public AXIOM chat uploads: removed the proxy-level admin gate

**Date:** 2026-09-22

## Problem

A visitor to the public chat at xiiom.com/axiom tried to upload `1.webp`
using the widget's existing attach button and got a confusing failure. The
widget (`apps/axiom-freedom/axiom_web_interface.html`) already called the
real, existing route (`POST /api/axiom/uploads`), which itself already
forwards to the engine's persistent, tested upload storage
(`/system/source-catalog/uploads`, under the same `AXIOM_MEMORY_DIRECTORY`
volume used for chat memory). The route was not missing -- it was gated
behind this proxy's own `requireAdmin()` Basic-Auth check (a deliberate
choice recorded in
[`2026-09-15-public-chat-timeline-and-uploads.md`](2026-09-15-public-chat-timeline-and-uploads.md)
and reaffirmed in
[`2026-09-16-upload-clarity-and-live-clock.md`](2026-09-16-upload-clarity-and-live-clock.md)).
A plain visitor's browser has no admin credentials, so every real attempt
from the public page returned 401.

## What changed

Per an explicit founder instruction to make uploads work for regular public
chat users (not just admins), reversing the prior admin-gate decision:

- **Removed** the proxy-level `requireAdmin()` check on
  `POST /api/axiom/uploads` in `apps/axiom-freedom/server.js`. The route is
  now reachable by any visitor to the public chat page, matching what the
  widget's attach button already assumed.
- The engine-level admin gate on `/system/source-catalog/uploads` is
  **unchanged** -- the proxy still authenticates to the engine using its own
  server-held `AXIOM_ENGINE_ADMIN_PASSWORD` secret on every forwarded call,
  the same pattern the public text-chat route (`/api/axiom` → engine
  `/axiom`) already uses. No admin credential is exposed to or required from
  the browser.
- **Added a server-side file-type allow-list** (previously missing --
  only the widget's HTML `accept` attribute restricted types, which is
  client-side only and trivially bypassed). Mirrors the widget's existing
  list exactly: `.pdf .doc .docx .txt .md .csv .json .png .jpg .jpeg .gif
  .webp`. Anything else is rejected with `400 {"error": "unsupported file
  type for upload"}`.
- Kept the existing size cap (`AXIOM_MAX_UPLOAD_BODY_BYTES`, default 5 MB)
  and empty-body validation unchanged.
- Updated stale comments in `server.js` and the widget's 401-handling branch
  that described the old admin-gating rationale.

## What this does not change

- No change to `apps/axiom-engine`'s `/system/source-catalog/uploads` route,
  its own `requireAdmin` middleware, or its tests -- that route remains
  admin-gated exactly as before; this proxy is simply the one caller that
  authenticates to it on the visitor's behalf.
- No change to any other admin-gated route in either service (automation
  status, GitHub/web-access routes, memory writes, etc.).
- No vision/OpenAI wiring for uploaded images -- files are stored, not
  analyzed. AXI still cannot see/understand uploaded images; this only
  fixes storage access for anonymous visitors.
- No cataloging: a stored upload still requires a separate
  operator-approved `source.catalog` automation task before it becomes an
  AXI-usable memory source, same as before.

## Testing

- `apps/axiom-engine`: 118/118 passing (unchanged; no engine-side edits).
- `apps/axiom-freedom`: 14/14 passing, including rewritten/extended upload
  tests covering: public success without any credentials, disallowed file
  type rejected with 400, allowed image type (`.webp`) succeeds, oversized
  file rejected with 413, and engine-unreachable failures passed through as
  502.

## Follow-up considerations (not done here, flagged for an authorized human)

- Uploaded file bytes from anonymous visitors are now stored on the
  persistent volume without any rate limiting beyond the per-request size
  cap. If abuse becomes a problem (disk exhaustion from many anonymous
  uploads), a per-IP/per-session rate limit would be a reasonable follow-up.
