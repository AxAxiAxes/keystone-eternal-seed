# Production incident — public AXIOM chat returning HTTP 502 (2026-09-18)

**Status:** Open production incident. Root cause not confirmed — requires
Railway/OpenAI account access this repository cannot provide.
**Observed:** 2026-09-18, ~10:06 AM PDT onward (founder screenshot) through
~10:20 AM PDT (verified independently, six consecutive attempts).

## What was observed

1. The founder shared a screenshot of the live `xiiom.com/axiom` chat still
   answering "Today's date is June 14, 2024" — the exact stale-date bug the
   identity/date fix (PR #95, merged 2026-09-18T09:23:59Z) was meant to
   resolve.
2. Independently testing the live production endpoint (`POST
   https://xiiom.com/api/axiom` with `{"action":"chat", ...}`) just now
   returns **HTTP 502 `{"error":"AXIOM chat is temporarily unavailable"}`
   on every attempt** (6 consecutive tries over ~10 minutes), not a stale
   date — the chat is currently fully non-functional for new requests, a
   worse condition than the founder's screenshot shows.
3. `GET https://xiiom.com/api/axiom/history` (also forwarded to the private
   `axiom-engine` service) returns **200 successfully**, and `GET
   https://xiiom.com/axiom` (the portal page) returns **200**. This narrows
   the failure specifically to the chat action's call from `axiom-engine`
   to the OpenAI API — the engine service itself is reachable and running.

## What was ruled out

- **Not a code regression.** `apps/axiom-engine/chat-service.js` and
  `system-prompt.js` on `origin/axaxiaxes-axiom-monorepo` are correct: they
  inject a dynamic `new Date().toISOString()` value and the AXIOM identity
  prompt on every request, exactly as designed. The full `axiom-engine`
  test suite (122/122) passes.
- **Not a portal/routing outage.** The public portal and the engine's
  memory endpoint both respond normally; only the OpenAI-backed chat call
  fails.

## What this narrows the cause to (not yet confirmed)

Server code returns this specific 502 message only when the outbound
`fetch` to `https://api.openai.com/v1/responses` itself fails, OpenAI
returns a non-2xx response, or the response lacks usable output text (see
`ChatService.reply()` in `chat-service.js`). Given the engine process
itself is up and responding to other requests, the most likely causes are
external to this repository's code:

- An invalid, rotated, or rate-limited `OPENAI_API_KEY` in Railway's
  `axiom-engine` service variables.
- An OpenAI-side billing/quota/model-availability issue for the configured
  `OPENAI_MODEL` (`gpt-4.1-mini` by default).
- Railway account capacity/billing constraints already flagged in
  `docs/RAILWAY_DEPLOYMENT.md` (a Trial-plan credit balance was observed
  low on 2026-09-12 with an "Upgrade to keep your services online"
  warning) — if that balance has since been exhausted, degraded or paused
  compute could produce exactly this symptom.

None of these can be confirmed or fixed from this repository: they require
direct Railway dashboard access (service logs, environment variables,
account billing status) and/or the OpenAI account dashboard, both of which
are founder-only.

## Founder-only next step (urgent, added as item 10 in
`docs/keystone/FOUNDER_ACTION_QUEUE.md`)

1. Open the Railway dashboard for the `axiom-engine` service and check its
   deploy logs for the exact outbound error at the time of a failed chat
   request.
2. Confirm `OPENAI_API_KEY` is present, current, and not rate-limited /
   over quota on the OpenAI account dashboard.
3. Confirm the Railway account balance/plan has not lapsed since the
   2026-09-12 low-credit warning.
4. Once resolved, re-test `POST /api/axiom` with `{"action":"chat", ...}`
   and confirm both (a) a 200 response and (b) the response reflects the
   real current date and AXIOM identity, not a stale June 2024 answer.

## Cross-references

- `docs/RAILWAY_DEPLOYMENT.md` (existing low-credit warning, deployment
  process, troubleshooting checklist)
- `docs/keystone/FOUNDER_ACTION_QUEUE.md` (item 10)
- `apps/axiom-engine/chat-service.js`, `apps/axiom-engine/system-prompt.js`
- PR #95 (identity/date fix, code confirmed correct and unaffected)
