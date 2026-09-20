# 2026-09-15 AXI GitHub access: read-only visibility shipped, write access declined

## What was asked

Founder asked "does he have access to github can he repo" (answered: no, AXI
had zero GitHub integration — verified by grep, no token/git/gh/octokit
anywhere in `apps/axiom-engine`). Founder then asked to "configure the
access as well" and "give access to this computer as well." Founder was not
available to answer a follow-up clarifying question about the intended
scope (read-only vs. propose-only vs. full write), so a bounded,
conservative default was implemented rather than waiting or guessing at the
highest-risk option.

## What was implemented

- **`GithubStatusService`** (`apps/axiom-engine/github-status-service.js`):
  a read-only GitHub REST API client. Every call is a `GET`; there is no
  code path capable of issuing a write request (no `POST`/`PATCH`/`PUT`/
  `DELETE`). Off by default: reports `configured: false` and every read
  route fails closed with `503` until an operator supplies both
  `AXIOM_GITHUB_TOKEN` and `AXIOM_GITHUB_REPO`.
- New routes: `GET /system/github` (open, status only, never exposes the
  token), `GET /system/github/repository`, `GET /system/github/pull-requests`,
  `GET /system/github/issues` (all three admin-gated, same `requireAdmin`
  HTTP Basic pattern as every other mutating/sensitive route).
- Wired into `/system/readiness`'s aggregate status alongside every other
  subsystem.
- 6 new tests (5 unit tests for `GithubStatusService` covering unconfigured
  refusal, token never leaking through `status()`, correct Bearer-auth GET
  requests, issue/PR-endpoint cross-contamination filtering, and upstream
  error/validation handling; 1 HTTP test confirming the open status route,
  the admin auth gate, and the 503-when-unconfigured behavior). Full
  `apps/axiom-engine` suite: **100/100 passing**.
- Documented in new `docs/AXI_GITHUB_ACCESS.md`: what exists, exactly what
  routes/permissions, and how an operator would actually generate and
  supply a token (a fine-grained, single-repo, read-only PAT they create
  themselves in GitHub's own settings) -- AXI cannot generate its own
  credential.

## What was deliberately NOT implemented

Full "commit and merge like this CLI session" access -- i.e., handing AXI
(a running, potentially internet-reachable service) the same write
capability this Copilot CLI session has -- was **not** built. That is a
materially different risk profile from read-only status (an always-on
service that can push/merge unattended vs. a human-directed session), and
doing it unilaterally while the founder was unavailable would have been a
consequential, hard-to-fully-reverse security decision made without
authorization. `docs/AXI_GITHUB_ACCESS.md` records exactly what a founder
would need to decide (scope, bot account vs. personal token, merge vs.
PR-only, rotation/revocation plan) if that capability is wanted later; the
existing branch-protection/required-CI-checks setup on
`axaxiaxes-axiom-monorepo` remains the real safety backstop regardless.

This mirrors the same pattern used for the raw file-upload decision earlier
today: build the smallest safe, reversible, discoverable slice of the
requested capability now; leave the higher-risk expansion as a clearly
labeled, explicit decision point for the founder rather than guessing at
"give access to this computer" in the most permissive possible direction.

## Related question answered in the same exchange: can AXI read images?

No. AXI has no vision/image-understanding capability today:
- `chat-service.js`'s only outbound call sends plain-text `content` blocks
  to OpenAI's Responses API -- no `image_url`/base64-image content blocks
  are ever constructed or sent.
- The source catalog's `media` `sourceType` and the new upload endpoint can
  **store** image bytes, but storing is not the same as reading: nothing in
  the codebase decodes, analyzes, OCRs, or describes image content.
Adding real image/vision support would mean switching the chat call to a
vision-capable model/request shape and deciding what image sources are
even allowed as input -- a separate feature, not implemented here.
