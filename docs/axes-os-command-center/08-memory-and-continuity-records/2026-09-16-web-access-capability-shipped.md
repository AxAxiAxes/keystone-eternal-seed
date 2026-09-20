# AXI web-access capability shipped (bounded, read-only); email and browser-tab control remain out of scope

**Date:** 2026-09-16

## Request

"please enable these features and fully automate the process" — a
follow-up to the prior "how can we further enable his access to web email,
tab, etc.." scoping discussion
([`2026-09-16-web-email-access-scoping-followup.md`](2026-09-16-web-email-access-scoping-followup.md)).

## What shipped

A new, bounded, admin-gated, off-by-default capability:
`WebAccessService` (`apps/axiom-engine/web-access-service.js`), exposed via
two routes documented in `docs/AXI_WEB_ACCESS.md`:

- `GET /system/web-access` (open) — reports whether the capability is
  enabled; never performs a fetch.
- `POST /system/web-access/fetch` (admin) — fetches exactly one URL
  server-side and returns sanitized text.

Safety design (all enforced in code, verified by tests):

- **Off by default**: requires `AXIOM_WEB_ACCESS_ENABLED=true` set
  out-of-band by an operator; unset/false means every fetch call returns
  `503`.
- **Not a browser**: single GET request per call, no cookies, no stored
  credentials, no JavaScript execution, no navigation/clicking/forms.
  `<script>`/`<style>` tags are stripped from returned text.
- **SSRF guard**: resolves the hostname and rejects private/loopback/
  link-local/reserved IPv4 and IPv6 ranges before making any request, so it
  cannot be used to reach internal infrastructure (e.g. cloud metadata
  endpoints or other services on the same private network). Only
  `http`/`https` accepted.
- **No automatic redirects**: a `3xx` response is reported as an error
  rather than followed, so a redirect target cannot bypass the address
  check.
- **Capped and truncated**: 512 KB response cap, 10-second timeout.

## What was deliberately not built

- **Email**: still not implemented. It needs a real, founder-supplied
  mailbox credential (IMAP or a provider API token) that does not exist —
  this is a hard blocker, not a policy choice, regardless of "fully
  automate the process."
- **Browser/tab control**: still not implemented. It implies AXI
  interacting with arbitrary sites and logged-in sessions, a much larger
  risk surface than a single sanitized-text fetch. That needs a dedicated
  sandboxed environment and separate safety review — explicitly out of
  scope for a routine implementation step, per
  `docs/AXI_AUTOMATION_SERVICE.md`'s "cannot deploy, access accounts, ...
  control third-party services" boundary.

"Fully automate the process" (referring to the PR pipeline) was followed
as already established: commit → rebase onto
`origin/axaxiaxes-axiom-monorepo` → push → open PR with explicit
`--base axaxiaxes-axiom-monorepo` → enable squash auto-merge → verify all
CI checks pass. No change was made to that pipeline itself.

## Verification performed

- `node -c index.js`, `node -c web-access-service.js` — syntax OK.
- New unit tests (`test/web-access-service.test.js`, 10 tests): disabled
  status/refusal, protocol rejection, malformed URL rejection, SSRF address
  blocking (10.x, 127.x, 169.254.x, 172.16-31.x, 192.168.x, and a resolved
  hostname), successful fetch with script/style stripping, redirect
  rejection, response truncation, unresolvable-hostname rejection, network
  failure wrapping.
- New route-level test in `test/engine.test.js`: `/system/web-access`
  reports disabled by default; the fetch route requires admin auth and
  returns `503` while disabled.
- Added `webAccess` to the `/system/readiness` aggregation, matching the
  existing `github` field's pattern.
- `apps/axiom-engine` full suite: **114/114 passing** (103 pre-existing +
  11 new).

## Scope boundary respected

This does not change AXI's own decision-making — the new route is
on-demand only; nothing in the automation scheduler or chat pipeline calls
it automatically. Enabling it in a live deployment (setting
`AXIOM_WEB_ACCESS_ENABLED=true` on Railway) remains a separate operator
action, same as every other environment-variable-gated capability in this
project.
