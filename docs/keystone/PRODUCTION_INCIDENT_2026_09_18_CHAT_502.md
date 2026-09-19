# Production incident — public AXIOM chat returning HTTP 502 (2026-09-18)

**Status:** Open production incident, still failing as of the most recent
independent check (2026-09-19, **~2:58 AM PDT — HTTP 502 on `POST
/api/axiom`, `action:"chat"`, reproduced again from this repository**,
same `{"error":"AXIOM chat is temporarily unavailable"}` body as every
earlier attempt). `GET /axiom` (the portal page) still returns 200 —
only the OpenAI-backed chat call is down. This has now been failing
continuously for roughly 17+ hours since it was first observed. Founder
upgraded Railway to the Pro plan
(screenshot, ~10:35 AM PDT) — **billing upgrade alone did not resolve it**:
retested repeatedly since (2.5 minutes, ~10 minutes, and ~90 minutes after
the upgrade) and the chat endpoint still returns the same HTTP 502 every
time. This points away from account/credit exhaustion as the sole cause
and toward `OPENAI_API_KEY` validity/quota or a service restart being
required. A screenshot of the founder's existing Railway Agent task also
surfaced a "healthy" report — but that report is dated **2026-09-14**
(before this incident began) and only checks the portal page/DNS, not the
chat reply; it is not evidence of resolution (see the recurring-task fix
below). The Railway Agent's Task quota is also currently exhausted for this
billing period ("come back on October 1st").
**Observed:** 2026-09-18, ~10:06 AM PDT onward (founder screenshot) through
~10:20 AM PDT (verified independently, six consecutive attempts), again
after the Pro upgrade at ~10:38 AM PDT, and again at ~11:38 AM PDT — still
failing every time.

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

## Founder-only next step (urgent, added as item 0 in `docs/keystone/FOUNDER_ACTION_QUEUE.md`)

**Update (~10:38 AM PDT):** the Railway Pro upgrade is confirmed active
(dashboard screenshot), but the chat endpoint still returns HTTP 502
after the upgrade. This makes a stuck/un-restarted `axiom-engine`
deployment or an `OPENAI_API_KEY`/OpenAI-side issue more likely than pure
account-credit exhaustion. Recommended next steps, in order:

1. In the Railway dashboard, manually **redeploy/restart the
   `axiom-engine` service** now that the Pro plan is active — some plan
   changes require a redeploy to take effect on already-running services.
2. If still failing after a redeploy, use **Railway Agent** (see the new
   section in `docs/RAILWAY_DEPLOYMENT.md`) to ask it directly why the
   chat call is failing — it can read the actual deploy/runtime logs this
   repository cannot see.
3. Confirm `OPENAI_API_KEY` is present, current, and not rate-limited /
   over quota on the OpenAI account dashboard directly (separate from
   Railway billing).
4. Once resolved, re-test `POST /api/axiom` with `{"action":"chat", ...}`
   and confirm both (a) a 200 response and (b) the response reflects the
   real current date and AXIOM identity, not a stale June 2024 answer.

## A no-terminal-needed way to check the endpoint yourself

`scripts/axiom-chat-health-check.vbs` is a double-click Windows Script Host
tool that repeats the same three checks used above (portal page, engine
reachability, chat reply) against the live `xiiom.com` endpoint and shows a
pass/fail summary, without needing PowerShell or curl. It only performs
read/diagnostic requests — it cannot redeploy, restart, or fix anything; it
is a checker, not a repair tool. Run it any time after taking one of the
steps above to confirm whether the chat reply check has turned green.

For automated, recurring checking (rather than manually running the script
or asking Railway Agent one-off questions), see the new "Automating AXIOM
chat health checks with a recurring Railway Agent task" section in
`docs/RAILWAY_DEPLOYMENT.md` — it gives an exact, ready-to-paste task
specification for a scheduled Railway Agent task that checks the actual
chat-reply path (the one that has been failing), not just the portal/DNS.

## Cross-references

- `docs/RAILWAY_DEPLOYMENT.md` (existing low-credit warning, deployment
  process, troubleshooting checklist, and the "Diagnosing production
  failures with Railway Agent" section — the fastest path to real Railway
  logs/account state, which this repository cannot see)
- `docs/keystone/FOUNDER_ACTION_QUEUE.md` (item 0)
- `apps/axiom-engine/chat-service.js`, `apps/axiom-engine/system-prompt.js`
- `scripts/axiom-chat-health-check.vbs` (double-click health-check tool)
- PR #95 (identity/date fix, code confirmed correct and unaffected)
