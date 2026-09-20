# 2026-09-12 AXIOM chat backend failure diagnosed (frontend up, engine unreachable)

**Status:** Root cause narrowed to a portal-to-engine connectivity/deployment
issue; confirmed reproducible; not fixable from this session (no Railway
access)

**Update (2026-09-12, later same day) — exact root cause confirmed, and it is
narrower than "unreachable":** A direct live test (`POST
https://xiiom.com/api/axiom` with `{"action":"chat","message":"hello"}`)
returned HTTP 503 with body `{"error":"AXIOM chat is not configured"}`.
Source inspection of `apps/axiom-engine/chat-service.js` (`ChatService.reply`)
shows this exact status/message is thrown **only** when the engine's own
`apiKey` field — wired from `process.env.OPENAI_API_KEY` in
`apps/axiom-engine/index.js` — is falsy. The portal's own failure-category
split (added by the now-merged `axaxiaxes-axiom-chat-diagnostics` work, see
below) means this response could only reach `error.statusCode === 503` via
the `NON_SUCCESS` category, never the separate `UNREACHABLE` category (which
carries no `statusCode` at all). In plain terms: **the `axiom-engine`
Railway service is up and responding correctly; it is specifically missing
(or has an empty) `OPENAI_API_KEY` environment variable.** This supersedes

**Update (2026-09-12, still later same day) — variable present in Railway,
chat still failing identically:** the founder shared a screenshot of the
`axiom-engine` service's Railway "Variables" tab showing `OPENAI_API_KEY`
already listed (value masked, as Railway masks every row identically
regardless of content). A live re-test immediately after, and a second
re-test roughly 45 seconds later, both still returned the exact same HTTP
503 `"AXIOM chat is not configured"`. Two explanations remain, and only an
operator with Railway access can distinguish them: (1) the variable's actual
value is blank, whitespace, or a placeholder rather than a real key, or (2)
the value is real but the running `axiom-engine` process has not been
redeployed/restarted since it was set — `process.env.OPENAI_API_KEY` is read
once at process startup (`apps/axiom-engine/index.js`), so a saved variable
never takes effect on its own. The founder's screenshot also showed an
unrelated `AXIOM_AUTOMATION_ENABLED` variable; confirmed by source
inspection (`apps/axiom-engine/index.js`) that this only toggles the
background agent/task automation scheduler and has no bearing on chat.
this record's original "engine unreachable, service maybe not running"
hypothesis below — that was a reasonable reading of a 100%-failure-rate
symptom at the time, but a real HTTP 503 with a JSON body is conclusive
proof the service is reachable. See the updated `AXES_TIER_1_DECISION_REGISTER.md`
P0 row for the current, precise recommended action (set a real
`OPENAI_API_KEY` value on the `axiom-engine` service in Railway).

## What was reported

The founder repeated several times across this session that "AXI"/AXIOM is
"still down" or "offline," while earlier checks in this same session only
confirmed that `xiiom.com`'s routes load (root, `/axiom`, `/library/`) and
that `/support` correctly requires authentication. Those checks were
insufficient: they confirmed the page loads, not that chat actually works.

## What was actually checked this time

Using the already-open "axiom-public-chat" browser panel (`xiiom.com/axiom`),
`read_page` showed the live page already contained two failed attempts
("hello", "axi?"), each answered with a hardcoded fallback: "AXIOM is
currently unavailable. Please try again shortly." A further live test
message ("status check") sent through the same panel reproduced the
identical failure a third time — a 100% failure rate on real chat messages,
even though the page itself loads normally and shows a "● LIVE" badge.

## Root cause (by source inspection)

The exact fallback string does not exist anywhere in the current feature
branch, but was found in the documented production branch
(`axaxiaxes-axiom-monorepo`) at
`apps/axiom-freedom/axiom_web_interface.html`: the page's `sendMessage()`
posts to `POST /api/axiom`, and any non-OK response or fetch failure falls
through to that generic message — it does not distinguish "the engine
service is unreachable" from "the engine responded with an error."

The portal (`apps/axiom-freedom/server.js`) proxies that request to a
separate private `axiom-engine` service via `AXIOM_ENGINE_URL` (defaulting to
`http://127.0.0.1:3000` if unset). A **uniform, 100%** failure rate across
every message is the expected signature of the portal being unable to reach
the engine at all — for example, the `axiom-engine` service not running, or
`AXIOM_ENGINE_URL` not correctly pointing at it in the live Railway
environment — rather than an intermittent or content-specific failure.

## Relevant existing work found

A separate branch, `origin/axaxiaxes-axiom-chat-diagnostics`, already exists
with exactly one commit not present in `axaxiaxes-axiom-monorepo`:
`45085a5 Improve AXIOM diagnostic transparency`, authored by the founder
(`Axel <info@axescontracting.com>`). It reworks `apps/axiom-freedom/server.js`
to categorize engine failures as `unreachable-private-engine` vs.
`engine-non-success-response` and surfaces the last failure on the
`/support` status page — exactly the visibility needed to confirm which
failure mode is occurring. It has no open pull request and, like this
branch's own work, has not been merged or deployed.

**Update (2026-09-12, later same day):** this diagnostics work was in fact
merged the same day, as PR #2 (`9b68843`), as part of resolving the
long-outstanding PR #1/#2/#3 branch — see
`docs/memory/2026-09-12-architectural-design-desk-and-decision-register.md`.
It is exactly what made the precise live reproduction below possible: the
portal's `/api/axiom` response for a `chat` action with `error.statusCode
=== 503` is now returned as the specific message `"AXIOM chat is not
configured"`, distinct from the generic `"AXIOM chat is temporarily
unavailable"` used for every other engine failure. That distinction, plus
direct source inspection of `apps/axiom-engine/chat-service.js`, is what
confirmed the exact root cause below.

## What this session cannot do

This session has no Railway dashboard/API access and cannot inspect or
change the live `axiom-engine` service's running status or its environment
variables. Per the standing authority boundary, that remains the founder's
action. This session also cannot generate, retrieve, or know the founder's
OpenAI API key.

## Recommended next step (founder-controlled)

1. In the Railway dashboard, open the `axiom-engine` service's `Variables`
   tab, click into the existing `OPENAI_API_KEY` row, and check whether it
   actually holds a real key. If it is blank, whitespace, or a placeholder,
   paste in a real, active OpenAI API key (the engine already reads
   `process.env.OPENAI_API_KEY` — no code change is needed).
2. Whether or not the value needed changing, explicitly **redeploy/restart**
   the `axiom-engine` service. Railway does not restart a running container
   just because a variable was viewed or edited; the process only reads
   `process.env.OPENAI_API_KEY` once, at startup.
3. After the redeploy finishes, confirm the fix live: `POST
   https://xiiom.com/api/axiom` with body `{"action":"chat","message":"hello"}`
   should return HTTP 200 with a real reply instead of HTTP 503 with `"AXIOM
   chat is not configured"`.
4. If the key is confirmed real and the service has been redeployed, but the
   failure persists, re-run the same live test; a `"AXIOM chat is temporarily
   unavailable"` message (rather than "is not configured") would indicate a
   different, new failure (for example, an invalid key or an OpenAI-side
   error) worth a fresh diagnosis rather than assuming this same root cause.

## Related records

- `docs/AXI_ETERNAL_ORIGIN_VALUE_AND_CRISIS_REGISTER.md`
- `docs/AXES_OBJECTIVES_CHECKPOINT.md`
- `docs/RAILWAY_DEPLOYMENT.md`
- `docs/memory/2026-09-11-xiiom-public-interaction-check.md`
