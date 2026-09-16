# AXI web access

**Status:** Bounded, read-only, single-URL fetch capability. Off by default. Not a browser — no navigation, clicking, JavaScript execution, cookies, or stored credentials.

## What this is

`apps/axiom-engine` can fetch exactly one URL server-side and return its
sanitized text, through `WebAccessService`.

- **Off by default.** Until an operator sets `AXIOM_WEB_ACCESS_ENABLED=true`,
  `GET /system/web-access` reports `{ "enabled": false }` and the fetch
  route fails closed with `503`.
- **Not general web browsing.** This is a single server-side GET request per
  call. There is no session, no cookies, no stored credentials, no
  JavaScript execution, and no way to click, submit forms, or navigate.
  `<script>`/`<style>` tags are stripped from the returned text.
- **SSRF-guarded.** The requested hostname is resolved and checked against
  private/loopback/link-local/reserved address ranges (`10.0.0.0/8`,
  `127.0.0.0/8`, `169.254.0.0/16`, `172.16.0.0/12`, `192.168.0.0/16`, IPv6
  loopback/unique-local/link-local) before any request is made, so the
  service cannot be used to probe or reach internal infrastructure
  (e.g. cloud metadata endpoints, other services on the same private
  network). Only `http`/`https` URLs are accepted.
- **No automatic redirects.** A redirect response (`3xx`) is reported as an
  error rather than followed, so a redirect target cannot bypass the
  address check above.
- **Capped and truncated.** The response body is capped at 512 KB by
  default; anything larger is truncated and reported as `truncated: true`.
  A 10-second timeout aborts a slow or hanging request.
- **AXI does not act on its own initiative.** This is an on-demand route:
  something must explicitly call it. There is no scheduler or autonomous
  loop that decides by itself to fetch a URL.

## Routes

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/system/web-access` | open | Reports whether web access is enabled and its declared scope. |
| `POST` | `/system/web-access/fetch` | admin | Fetches one URL (`{ "url": "https://..." }`) and returns `{ url, status, contentType, truncated, text }`. |

## History

- **2026-09-16:** shipped as the one part of a broader "enable web, email,
  browser-tab access" request that could actually be built without a
  missing external credential or an unreviewed safety-surface expansion.
  Email was not implemented — it requires a real, founder-supplied mailbox
  credential that does not exist. Browser/tab control was not implemented —
  it implies interacting with arbitrary sites and logged-in sessions, which
  needs a dedicated sandboxed environment and separate safety review, not a
  routine addition to this service. See
  `docs/memory/2026-09-16-web-email-access-scoping-followup.md` for the
  full scoping discussion.
